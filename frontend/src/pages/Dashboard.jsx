import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp.jsx';
import {
  fmt, calcRecipeCost, calcCostPerPortion, calcEventTotal,
  calcMenuFinalPrice, calcEventProfitBreakdown, foodCostPct,
} from '../lib/calc.js';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const STATUS_BADGE = {
  'Draft': 'badge-gray', 'Sent Offer': 'badge-blue', 'Approved': 'badge-green',
  'Cancelled': 'badge-red', 'Completed': 'badge-amber',
};

function StatCard({ icon, iconClass, label, value, meta, trend }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className={`stat-value ${iconClass || ''}`}>{value}</div>
          {meta && <div className="stat-meta">{meta}</div>}
        </div>
        <div className={`stat-icon stat-icon-${iconClass || 'gold'}`}>
          <i className={`ti ${icon}`}></i>
        </div>
      </div>
      {trend !== undefined && (
        <div className="stat-trend" style={{ color: trend >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 8 }}>
          <i className={`ti ti-trending-${trend >= 0 ? 'up' : 'down'}`}></i>
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--bg4)', borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.fill || 'var(--accent)' }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { ingredients, recipes, menus, events, user } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // KPIs
  const totalRevenue = events.reduce((s, e) => s + calcEventTotal(e, menus, recipes, ingredients), 0);
  const approvedRevenue = events.filter(e => e.status === 'Approved').reduce((s, e) => s + calcEventTotal(e, menus, recipes, ingredients), 0);
  const upcoming = events.filter(e => e.status !== 'Cancelled' && e.status !== 'Completed').length;
  const approved = events.filter(e => e.status === 'Approved').length;

  // Avg food cost %
  const menuCosts = menus.map(m => {
    const p = calcMenuFinalPrice(m, recipes, ingredients);
    return p.selling > 0 ? foodCostPct(p.cost, p.selling) : null;
  }).filter(x => x !== null);
  const avgFoodCostPct = menuCosts.length ? menuCosts.reduce((a, b) => a + b, 0) / menuCosts.length : 0;

  // Gross margin
  const grossMarginRevenue = events.reduce((s, e) => {
    const b = calcEventProfitBreakdown(e, menus, recipes, ingredients);
    return s + b.profit;
  }, 0);
  const grossMarginPct = totalRevenue > 0 ? (grossMarginRevenue / totalRevenue) * 100 : 0;

  // Monthly revenue chart
  const monthlyMap = {};
  events.forEach(e => {
    if (!e.event_date) return;
    const month = e.event_date.slice(0, 7);
    const val = calcEventTotal(e, menus, recipes, ingredients);
    monthlyMap[month] = (monthlyMap[month] || 0) + val;
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, revenue]) => ({
      month: month.slice(0, 7),
      revenue,
    }));

  // Top recipes by cost
  const sortedRecipes = [...recipes]
    .sort((a, b) => calcRecipeCost(b, ingredients) - calcRecipeCost(a, ingredients))
    .slice(0, 5);
  const maxCost = sortedRecipes.length ? calcRecipeCost(sortedRecipes[0], ingredients) : 1;

  // Recent events
  const recentEvents = [...events]
    .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
    .slice(0, 5);

  // Low margin alerts: menus where food cost % > food_cost_target
  const foodTarget = parseFloat(user?.food_cost_target) || 32;
  const lowMarginMenus = menus.filter(m => {
    const p = calcMenuFinalPrice(m, recipes, ingredients);
    return p.selling > 0 && foodCostPct(p.cost, p.selling) > foodTarget;
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard.goodMorning');
    if (h < 18) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">{greeting()}, {user?.name?.split(' ')[0]}!</div>
          <div className="topbar-sub">{t('dashboard.subtitle')}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/reports')}>
            <i className="ti ti-chart-bar"></i> {t('nav.reports')}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/events')}>
            <i className="ti ti-plus"></i> {t('dashboard.newEvent')}
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* KPI Row */}
        <div className="grid-4">
          <StatCard
            icon="ti-calendar-event"
            iconClass="blue"
            label={t('dashboard.totalEvents')}
            value={events.length}
            meta={`${upcoming} ${t('dashboard.upcoming')}`}
          />
          <StatCard
            icon="ti-currency-euro"
            iconClass="gold"
            label={t('dashboard.pipelineValue')}
            value={fmt(totalRevenue)}
            meta={`${fmt(approvedRevenue)} ${t('dashboard.approved')}`}
          />
          <StatCard
            icon="ti-percentage"
            iconClass={avgFoodCostPct > foodTarget ? 'red' : 'green'}
            label={t('dashboard.avgFoodCost')}
            value={`${avgFoodCostPct.toFixed(1)}%`}
            meta={`${t('dashboard.target')} ${foodTarget}%`}
          />
          <StatCard
            icon="ti-trending-up"
            iconClass={grossMarginPct >= 30 ? 'green' : 'amber'}
            label={t('dashboard.grossMargin')}
            value={`${grossMarginPct.toFixed(1)}%`}
            meta={`${fmt(grossMarginRevenue)} ${t('dashboard.profit')}`}
          />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="qa-card" onClick={() => navigate('/ingredients')}>
            <i className="ti ti-basket qa-icon"></i>
            <span>{t('dashboard.qaIngredients')}</span>
          </div>
          <div className="qa-card" onClick={() => navigate('/recipes')}>
            <i className="ti ti-notebook qa-icon"></i>
            <span>{t('dashboard.qaRecipes')}</span>
          </div>
          <div className="qa-card" onClick={() => navigate('/menus')}>
            <i className="ti ti-list qa-icon"></i>
            <span>{t('dashboard.qaMenus')}</span>
          </div>
          <div className="qa-card" onClick={() => navigate('/events')}>
            <i className="ti ti-calendar-event qa-icon"></i>
            <span>{t('dashboard.qaEvents')}</span>
          </div>
          <div className="qa-card" onClick={() => navigate('/quotes')}>
            <i className="ti ti-file-invoice qa-icon"></i>
            <span>{t('dashboard.qaQuotes')}</span>
          </div>
          <div className="qa-card" onClick={() => navigate('/allergens')}>
            <i className="ti ti-shield-check qa-icon"></i>
            <span>{t('dashboard.qaAllergens')}</span>
          </div>
        </div>

        <div className="grid-2">
          {/* Monthly Revenue Chart */}
          <div className="card">
            <div className="card-header">
              <i className="ti ti-chart-bar" style={{ color: 'var(--accent)' }}></i>
              <span className="card-title">{t('dashboard.monthlyRevenue')}</span>
            </div>
            <div className="card-body">
              {monthlyData.length === 0 ? (
                <div className="empty-state">
                  <i className="ti ti-chart-bar"></i>
                  <p>{t('dashboard.noChartData')}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name={t('dashboard.revenue')} radius={[6, 6, 0, 0]}>
                      {monthlyData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === monthlyData.length - 1 ? 'var(--accent)' : 'var(--bg4)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recipe Cost Ranking */}
          <div className="card">
            <div className="card-header">
              <i className="ti ti-notebook" style={{ color: 'var(--accent)' }}></i>
              <span className="card-title">{t('dashboard.recipeCostRanking')}</span>
            </div>
            <div className="card-body">
              {sortedRecipes.length === 0 && (
                <div className="empty-state">
                  <i className="ti ti-notebook"></i>
                  <p>{t('dashboard.noRecipes')}</p>
                </div>
              )}
              {sortedRecipes.map(r => {
                const cost = calcRecipeCost(r, ingredients);
                const pct = Math.round((cost / maxCost) * 100);
                return (
                  <div key={r.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{r.name}</span>
                      <span className="mono accent" style={{ fontSize: 12 }}>{fmt(cost)}</span>
                    </div>
                    <div className="cost-bar">
                      <div className="cost-bar-fill" style={{ width: pct + '%' }}></div>
                    </div>
                    <div className="text3" style={{ fontSize: 11, marginTop: 3 }}>
                      {fmt(calcCostPerPortion(r, ingredients))}{t('dashboard.perPortion')} · {r.portions} {t('common.portions')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Recent Events */}
          <div className="card">
            <div className="card-header">
              <i className="ti ti-calendar-event" style={{ color: 'var(--accent)' }}></i>
              <span className="card-title">{t('dashboard.upcomingEvents')}</span>
              <button className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 12 }} onClick={() => navigate('/events')}>
                {t('common.viewAll')}
              </button>
            </div>
            <div className="card-body">
              {recentEvents.length === 0 && (
                <div className="empty-state">
                  <i className="ti ti-calendar-event"></i>
                  <p>{t('dashboard.noEvents')}</p>
                </div>
              )}
              {recentEvents.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--bg4)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{e.name}</div>
                    <div className="text3" style={{ fontSize: 11 }}>{e.event_date} · {e.guest_count} {t('common.guests')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono accent" style={{ fontSize: 13, marginBottom: 4 }}>
                      {fmt(calcEventTotal(e, menus, recipes, ingredients))}
                    </div>
                    <span className={`badge ${STATUS_BADGE[e.status] || 'badge-gray'}`}>
                      {t(`events.statuses.${e.status}`, e.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Margin Alerts */}
          <div className="card">
            <div className="card-header">
              <i className="ti ti-alert-triangle" style={{ color: 'var(--red)' }}></i>
              <span className="card-title">{t('dashboard.lowMarginAlerts')}</span>
              {lowMarginMenus.length > 0 && (
                <span className="badge badge-red" style={{ marginLeft: 'auto' }}>{lowMarginMenus.length}</span>
              )}
            </div>
            <div className="card-body">
              {lowMarginMenus.length === 0 ? (
                <div className="empty-state" style={{ color: 'var(--green)' }}>
                  <i className="ti ti-circle-check"></i>
                  <p>{t('dashboard.allMarginsOk')}</p>
                </div>
              ) : (
                lowMarginMenus.map(m => {
                  const p = calcMenuFinalPrice(m, recipes, ingredients);
                  const fc = foodCostPct(p.cost, p.selling);
                  return (
                    <div key={m.id} className="alert-card alert-card-red" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                        <span className="badge badge-red">{fc.toFixed(1)}% {t('dashboard.foodCost')}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                        {t('dashboard.targetIs')} {foodTarget}% · {t('dashboard.overBy')} {(fc - foodTarget).toFixed(1)}%
                      </div>
                    </div>
                  );
                })
              )}
              {lowMarginMenus.length > 0 && (
                <button className="btn btn-ghost" style={{ width: '100%', marginTop: 8, fontSize: 12 }} onClick={() => navigate('/menus')}>
                  {t('dashboard.reviewMenus')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
