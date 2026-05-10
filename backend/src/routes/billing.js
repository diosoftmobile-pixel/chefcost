import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

const PLANS = {
  trial:   { id: 'trial',   label: '14-Day Trial', price: 6.99,  period: 'one-time', durationDays: 14 },
  monthly: { id: 'monthly', label: 'Monthly',       price: 49.99, period: 'month' },
  yearly:  { id: 'yearly',  label: 'Yearly',        price: 499,   period: 'year', savingsPct: 17 },
};

router.get('/plans', (req, res) => {
  res.json(PLANS);
});

router.get('/status', (req, res) => {
  const user = db.prepare('SELECT subscription_status, trial_end FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const isTrialActive = user.subscription_status === 'trial' && user.trial_end && new Date(user.trial_end) > new Date();
  res.json({
    status: user.subscription_status,
    trial_end: user.trial_end,
    is_active: user.subscription_status === 'active' || isTrialActive,
  });
});

// Activate trial without Stripe (manual, for testing — replace with Stripe in production)
router.post('/start-trial', (req, res) => {
  const user = db.prepare('SELECT subscription_status FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (user.subscription_status !== 'free') {
    return res.status(400).json({ error: 'Trial or subscription already used' });
  }
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);
  db.prepare("UPDATE users SET subscription_status='trial', trial_end=? WHERE id=?")
    .run(trialEnd.toISOString(), req.user.id);
  res.json({ ok: true, trial_end: trialEnd.toISOString() });
});

// Stripe checkout — requires STRIPE_SECRET_KEY env var
router.post('/checkout', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'stripe_not_configured' });
  }
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!userRow) return res.status(404).json({ error: 'User not found' });

    let customer = userRow.stripe_customer_id;
    if (!customer) {
      const cust = await stripe.customers.create({ email: userRow.email, name: userRow.name });
      customer = cust.id;
      db.prepare('UPDATE users SET stripe_customer_id=? WHERE id=?').run(customer, req.user.id);
    }

    const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
    const p = PLANS[plan];

    const session = await stripe.checkout.sessions.create({
      customer,
      payment_method_types: ['card'],
      mode: plan === 'trial' ? 'payment' : 'subscription',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `ChefCost ${p.label}` },
          unit_amount: Math.round(p.price * 100),
          ...(plan !== 'trial' && { recurring: { interval: plan === 'yearly' ? 'year' : 'month' } }),
        },
        quantity: 1,
      }],
      metadata: { user_id: req.user.id, plan },
      success_url: `${origin}/billing?success=1`,
      cancel_url: `${origin}/billing`,
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error('Stripe error:', e.message);
    res.status(500).json({ error: 'Payment setup failed' });
  }
});

// Stripe webhook — register raw body parser in index.js before JSON middleware
router.post('/webhook', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'stripe_not_configured' });
  }
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { user_id, plan } = session.metadata;
      if (plan === 'trial') {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        db.prepare("UPDATE users SET subscription_status='trial', trial_end=? WHERE id=?")
          .run(trialEnd.toISOString(), user_id);
      } else {
        db.prepare("UPDATE users SET subscription_status='active', stripe_subscription_id=? WHERE id=?")
          .run(session.subscription || null, user_id);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      db.prepare("UPDATE users SET subscription_status='free', stripe_subscription_id=NULL WHERE stripe_subscription_id=?")
        .run(sub.id);
    }

    res.json({ received: true });
  } catch (e) {
    console.error('Webhook error:', e.message);
    res.status(400).send(`Webhook Error: ${e.message}`);
  }
});

// Customer portal for managing billing
router.post('/portal', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'stripe_not_configured' });
  }
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const userRow = db.prepare('SELECT stripe_customer_id FROM users WHERE id = ?').get(req.user.id);
    if (!userRow?.stripe_customer_id) return res.status(400).json({ error: 'No billing account found' });
    const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
    const session = await stripe.billingPortal.sessions.create({
      customer: userRow.stripe_customer_id,
      return_url: `${origin}/billing`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: 'Portal unavailable' });
  }
});

export default router;
