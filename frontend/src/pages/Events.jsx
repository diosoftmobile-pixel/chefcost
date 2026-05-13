import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import {
  fmt, calcEventTotal, calcMenuFinalPrice, calcEventProfitBreakdown,
  calcEventOpCosts, buildShoppingList,
} from '../lib/calc.js';
import { exportEventPDF } from '../lib/pdf.js';
import Modal from '../components/Modal.jsx';

const STATUSES = ['Draft','Sent Offer','Approved','Cancelled','Completed'];
const STATUS_BADGE = { 'Draft':'badge-gray','Sent Offer':'badge-blue','Approved':'badge-green','Cancelled':'badge-red','Completed':'badge-amber' };

const blank = () => ({
  name:'', client_name:'', client_email:'', client_phone:'', event_date:'', guest_count:50,
  notes:'', status:'Draft', location:'', menus:[],
  staff_cost:0, transport_cost:0, rental_cost:0, packaging_cost:0, other_costs:0,
});

export default function Events() {
  const { events, setEvents, menus, recipes, ingredients, isPaid } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [modal, setModal] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const openAdd = () => { setForm(blank()); setModal('add'); };
  const openEdit = e => {
    setForm({
      ...blank(),
      ...e,
      menus: (e.menus || []).map(m => ({ ...m })),
      staff_cost: e.staff_cost || 0,
      transport_cost: e.transport_cost || 0,
      rental_cost: e.rental_cost || 0,
      packaging_cost: e.packaging_cost || 0,
      other_costs: e.other_costs || 0,
      location: e.location || '',
    });
    setModal(e.id);
  };
  const close = () => setModal(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addMenu = () => setForm(f => ({ ...f, menus: [...f.menus, { menu_id:'', quantity:1 }] }));
  const setMen = (idx, k, v) => setForm(f => ({ ...f, menus: f.menus.map((m, n) => n === idx ? { ...m, [k]: v } : m) }));
  const removeMen = idx => setForm(f => ({ ...f, menus: f.menus.filter((_, n) => n !== idx) }));

  const guests = +form.guest_count || 1;
  const formBreakdown = {
    foodRevenue: form.menus.reduce((s, em) => {
      const m = menus.find(x => x.id === em.menu_id);
      return s + (m ? calcMenuFinalPrice(m, recipes, ingredients).final * guests : 0);
    }, 0),
    foodCost: form.menus.reduce((s, em) => {
      const m = menus.find(x => x.id === em.menu_id);
      return s + (m ? (calcMenuFinalPrice(m, recipes, ingredients).cost) * guests : 0);
    }, 0),
    opCosts: (parseFloat(form.staff_cost)||0) + (parseFloat(form.transport_cost)||0) +
             (parseFloat(form.rental_cost)||0) + (parseFloat(form.packaging_cost)||0) +
             (parseFloat(form.other_costs)||0),
  };
  formBreakdown.totalCost = formBreakdown.foodCost + formBreakdown.opCosts;
  formBreakdown.profit = formBreakdown.foodRevenue - formBreakdown.totalCost;
  formBreakdown.margin = formBreakdown.foodRevenue > 0 ? (formBreakdown.profit / formBreakdown.foodRevenue) * 100 : 0;

  const save = async () => {
    if (!form.name) return alert(t('events.nameRequired'));
    setSaving(true);
    const payload = { ...form, menus: form.menus.filter(m => m.menu_id) };
    try {
      if (modal === 'add') { const e = await api.createEvent(payload); setEvents(p => [...p, e]); }
      else { const e = await api.updateEvent(modal, payload); setEvents(p => p.map(x => x.id === modal ? e : x)); }
      close();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm(t('events.confirmDelete'))) return;
    await api.deleteEvent(id);
    setEvents(p => p.filter(e => e.id !== id));
  };

  const markSent = async (id) => {
    try {
      const updated = await api.markEventSent(id);
      setEvents(p => p.map(x => x.id === id ? { ...x, status: 'Sent Offer' } : x));
    } catch (e) { alert(e.message); }
  };

  const duplicate = async (id) => {
    try {
      const copy = await api.duplicateEvent(id);
      setEvents(p => [...p, copy]);
    } catch (e) { alert(e.message); }
  };

  const viewing = viewId ? events.find(e => e.id === viewId) : null;

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) &&
    (!filterStatus || e.status === filterStatus)
  );

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('events.title')}</div>
        {isPaid
          ? <button className="btn btn-primary" onClick={openAdd}><i className="ti ti-plus"></i> {t('events.newEvent')}</button>
          : <button className="btn btn-ghost" onClick={() => navigate('/billing')}><i className="ti ti-lock"></i> {t('events.upgradeBtn')}</button>
        }
      </div>

      {!isPaid && (
        <div style={{ margin: '0 0 16px', padding: '12px 20px', background: '#fef9ec', border: '1px solid #f59e0b', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="ti ti-lock" style={{ color: '#f59e0b', fontSize: 18 }}></i>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{t('events.lockedTitle')}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{t('events.lockedDesc')}</div>
          </div>
          <button className="btn btn-primary" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }} onClick={() => navigate('/billing')}>
            {t('events.upgradeBtn')}
          </button>
        </div>
      )}

      <div className="page-content">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <i className="ti ti-search"></i>
            <input className="form-control" placeholder={t('events.searchPlaceholder', 'Search events…')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
          </div>
          <select className="form-control" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">{t('events.allStatuses', 'All Statuses')}</option>
            {STATUSES.map(s => <option key={s} value={s}>{t(`events.statuses.${s}`, s)}</option>)}
          </select>
        </div>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>{t('events.colEvent')}</th>
                <th>{t('events.colClient')}</th>
                <th>{t('events.colDate')}</th>
                <th>{t('events.colGuests')}</th>
                <th>{t('events.colLocation')}</th>
                <th>{t('events.colTotalValue')}</th>
                <th>{t('events.colProfit')}</th>
                <th>{t('events.colStatus')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <i className="ti ti-calendar-event"></i>
                    <p>{search || filterStatus ? t('ingredients.noResults') : t('events.none')}</p>
                  </div>
                </td></tr>
              )}
              {filtered.map(e => {
                const breakdown = calcEventProfitBreakdown(e, menus, recipes, ingredients);
                return (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{e.name}</div>
                      {e.quote_number && <div style={{ fontSize: 10, color: 'var(--text3)' }}>{e.quote_number}</div>}
                    </td>
                    <td>
                      {e.client_name}
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.client_email}</div>
                    </td>
                    <td>{e.event_date}</td>
                    <td>{e.guest_count}</td>
                    <td>{e.location || <span className="text3">—</span>}</td>
                    <td className="mono accent">{fmt(breakdown.foodRevenue)}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: breakdown.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                        {breakdown.profit >= 0 ? '+' : ''}{fmt(breakdown.profit)}
                      </span>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{breakdown.margin.toFixed(1)}%</div>
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[e.status] || 'badge-gray'}`}>{t(`events.statuses.${e.status}`, e.status)}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" title={t('events.viewDetails')} onClick={() => setViewId(e.id)}><i className="ti ti-eye"></i></button>
                        <button className="icon-btn pdf-btn" title={t('events.exportPdf')} onClick={() => exportEventPDF(e, menus, recipes, ingredients)}><i className="ti ti-file-text"></i></button>
                        {isPaid && e.status === 'Draft' && (
                          <button className="icon-btn" title={t('events.markSent')} onClick={() => markSent(e.id)}><i className="ti ti-send"></i></button>
                        )}
                        {isPaid && <button className="icon-btn" title={t('events.duplicate')} onClick={() => duplicate(e.id)}><i className="ti ti-copy"></i></button>}
                        {isPaid && <button className="icon-btn" onClick={() => openEdit(e)}><i className="ti ti-edit"></i></button>}
                        {isPaid && <button className="icon-btn danger" onClick={() => del(e.id)}><i className="ti ti-trash"></i></button>}
                        {!isPaid && <i className="ti ti-lock" style={{ color: 'var(--text3)', fontSize: 14, padding: '0 8px' }}></i>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isPaid && modal && (
        <Modal title={modal === 'add' ? t('events.newModal') : t('events.editModal')} onClose={close}
          footer={<><button className="btn" onClick={close}>{t('common.cancel')}</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? t('common.saving') : modal === 'add' ? t('events.createEvent') : t('events.saveEdit')}</button></>}
        >
          {/* Two-column layout: left form, right summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('events.eventName')}</label>
                  <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('events.statusLabel')}</label>
                  <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{t(`events.statuses.${s}`, s)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('events.clientName')}</label>
                  <input className="form-control" value={form.client_name} onChange={e => set('client_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('events.clientEmail')}</label>
                  <input className="form-control" type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('events.phone')}</label>
                  <input className="form-control" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('events.eventDate')}</label>
                  <input className="form-control" type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('events.guestCount')}</label>
                  <input className="form-control" type="number" min="1" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('events.location')}</label>
                  <input className="form-control" value={form.location} onChange={e => set('location', e.target.value)} placeholder={t('common.optional')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('events.notesLabel')}</label>
                <input className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>

              {/* Menus */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 8px' }}>
                <label className="form-label" style={{ margin: 0 }}>{t('events.menusLabel')}</label>
                <button className="btn btn-ghost" onClick={addMenu} style={{ fontSize: 12, padding: '4px 10px' }}><i className="ti ti-plus"></i> {t('events.addMenuBtn')}</button>
              </div>
              {form.menus.map((em, idx) => {
                const menu = menus.find(m => m.id === em.menu_id);
                const pp = menu ? calcMenuFinalPrice(menu, recipes, ingredients).final : 0;
                return (
                  <div className="ing-row" key={idx}>
                    <select className="form-control" style={{ fontSize: 12 }} value={em.menu_id} onChange={e => setMen(idx, 'menu_id', e.target.value)}>
                      <option value="">{t('events.selectMenu')}</option>
                      {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {menu ? `${fmt(pp)} / ${t('common.person')}` : ''}
                    </div>
                    <span className="mono accent" style={{ fontSize: 12 }}>{menu ? fmt(pp * guests) : '—'}</span>
                    <button className="icon-btn danger" onClick={() => removeMen(idx)}><i className="ti ti-x"></i></button>
                  </div>
                );
              })}

              {/* Operational Costs */}
              <div style={{ margin: '20px 0 8px', fontWeight: 600, fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('events.operationalCosts')}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('events.staffCost')}</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={form.staff_cost} onChange={e => set('staff_cost', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('events.transportCost')}</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={form.transport_cost} onChange={e => set('transport_cost', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('events.rentalCost')}</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={form.rental_cost} onChange={e => set('rental_cost', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('events.packagingCost')}</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={form.packaging_cost} onChange={e => set('packaging_cost', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('events.otherCosts')}</label>
                <input className="form-control" type="number" min="0" step="0.01" value={form.other_costs} onChange={e => set('other_costs', e.target.value)} />
              </div>
            </div>

            {/* Right sticky summary panel */}
            <div style={{ position: 'sticky', top: 0 }}>
              <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 16, border: '1px solid var(--bg4)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: 'var(--text1)' }}>
                  <i className="ti ti-calculator" style={{ marginRight: 6 }}></i>
                  {t('events.profitSummary')}
                </div>
                <div className="summary-row" style={{ marginBottom: 6 }}><span style={{ fontSize: 12 }}>{t('events.foodRevenue')}</span><span className="mono" style={{ fontSize: 12 }}>{fmt(formBreakdown.foodRevenue)}</span></div>
                <div className="summary-row" style={{ marginBottom: 6 }}><span style={{ fontSize: 12 }}>{t('events.foodCost')}</span><span className="mono" style={{ fontSize: 12, color: 'var(--red)' }}>−{fmt(formBreakdown.foodCost)}</span></div>
                <div className="summary-row" style={{ marginBottom: 6 }}><span style={{ fontSize: 12 }}>{t('events.opCosts')}</span><span className="mono" style={{ fontSize: 12, color: 'var(--red)' }}>−{fmt(formBreakdown.opCosts)}</span></div>
                <div style={{ borderTop: '1px solid var(--bg4)', margin: '10px 0' }}></div>
                <div className="summary-row" style={{ marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600 }}>{t('events.totalProfit')}</span>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: formBreakdown.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {formBreakdown.profit >= 0 ? '+' : ''}{fmt(formBreakdown.profit)}
                  </span>
                </div>
                <div className="summary-row">
                  <span style={{ fontSize: 12 }}>{t('events.margin')}</span>
                  <span className="mono" style={{ fontSize: 12, color: formBreakdown.margin >= 20 ? 'var(--green)' : 'var(--amber)' }}>
                    {formBreakdown.margin.toFixed(1)}%
                  </span>
                </div>
                <div style={{ borderTop: '1px solid var(--bg4)', margin: '10px 0' }}></div>
                <div className="summary-row">
                  <span style={{ fontSize: 12 }}>{t('events.perGuest')}</span>
                  <span className="mono" style={{ fontSize: 12 }}>
                    {guests > 0 ? fmt(formBreakdown.profit / guests) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {viewing && (() => {
        const breakdown = calcEventProfitBreakdown(viewing, menus, recipes, ingredients);
        const shopping = buildShoppingList(viewing, menus, recipes, ingredients);
        return (
          <Modal title={viewing.name} onClose={() => setViewId(null)}
            footer={<>
              <button className="btn btn-pdf" onClick={() => { exportEventPDF(viewing, menus, recipes, ingredients); setViewId(null); }}>
                <i className="ti ti-file-text"></i> {t('events.exportPdf')}
              </button>
              <button className="btn btn-primary" onClick={() => setViewId(null)}>{t('common.close')}</button>
            </>}
          >
            {/* Event details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 13 }}><span className="text3">{t('events.clientLabel')} </span>{viewing.client_name}</div>
              <div style={{ fontSize: 13 }}><span className="text3">{t('events.dateLabel')} </span>{viewing.event_date}</div>
              <div style={{ fontSize: 13 }}><span className="text3">{t('events.guestsLabel')} </span>{viewing.guest_count}</div>
              <div style={{ fontSize: 13 }}><span className="text3">{t('events.statusViewLabel')} </span>
                <span className={`badge ${STATUS_BADGE[viewing.status] || 'badge-gray'}`}>{t(`events.statuses.${viewing.status}`, viewing.status)}</span>
              </div>
              {viewing.location && <div style={{ fontSize: 13 }}><span className="text3"><i className="ti ti-map-pin" style={{ marginRight: 4 }}></i></span>{viewing.location}</div>}
              {viewing.quote_number && <div style={{ fontSize: 13 }}><span className="text3">{t('events.quoteNumber')}: </span><span className="mono">{viewing.quote_number}</span></div>}
            </div>

            {/* Profit breakdown */}
            <div style={{ marginBottom: 16, background: 'var(--bg3)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>{t('events.profitBreakdown')}</div>
              <div className="summary-row"><span>{t('events.foodRevenue')}</span><span className="mono">{fmt(breakdown.foodRevenue)}</span></div>
              <div className="summary-row"><span>{t('events.foodCost')}</span><span className="mono" style={{ color: 'var(--red)' }}>−{fmt(breakdown.foodCost)}</span></div>
              {breakdown.opCosts > 0 && <div className="summary-row"><span>{t('events.opCosts')}</span><span className="mono" style={{ color: 'var(--red)' }}>−{fmt(breakdown.opCosts)}</span></div>}
              {calcEventOpCosts(viewing) > 0 && <>
                {viewing.staff_cost > 0 && <div className="summary-row" style={{ paddingLeft: 16, fontSize: 12 }}><span className="text3">{t('events.staffCost')}</span><span className="mono text3">{fmt(viewing.staff_cost)}</span></div>}
                {viewing.transport_cost > 0 && <div className="summary-row" style={{ paddingLeft: 16, fontSize: 12 }}><span className="text3">{t('events.transportCost')}</span><span className="mono text3">{fmt(viewing.transport_cost)}</span></div>}
                {viewing.rental_cost > 0 && <div className="summary-row" style={{ paddingLeft: 16, fontSize: 12 }}><span className="text3">{t('events.rentalCost')}</span><span className="mono text3">{fmt(viewing.rental_cost)}</span></div>}
                {viewing.packaging_cost > 0 && <div className="summary-row" style={{ paddingLeft: 16, fontSize: 12 }}><span className="text3">{t('events.packagingCost')}</span><span className="mono text3">{fmt(viewing.packaging_cost)}</span></div>}
                {viewing.other_costs > 0 && <div className="summary-row" style={{ paddingLeft: 16, fontSize: 12 }}><span className="text3">{t('events.otherCosts')}</span><span className="mono text3">{fmt(viewing.other_costs)}</span></div>}
              </>}
              <div style={{ borderTop: '1px solid var(--bg4)', margin: '10px 0' }}></div>
              <div className="summary-row total">
                <span>{t('events.totalProfit')}</span>
                <span className="mono" style={{ color: breakdown.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700, fontSize: 16 }}>
                  {breakdown.profit >= 0 ? '+' : ''}{fmt(breakdown.profit)}
                </span>
              </div>
              <div className="summary-row" style={{ marginTop: 4 }}>
                <span>{t('events.margin')}</span>
                <span className="mono" style={{ color: breakdown.margin >= 20 ? 'var(--green)' : 'var(--amber)' }}>{breakdown.margin.toFixed(1)}%</span>
              </div>
            </div>

            {/* Shopping list */}
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '16px 0 8px' }}>
              {t('events.shoppingList')}
            </div>
            {Object.entries(shopping).map(([name, data]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--bg4)' }}>
                <span style={{ fontSize: 13 }}>{name}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                  {Math.round(data.qty * 100) / 100} {data.unit} — <span className="accent">{fmt(data.cost)}</span>
                </span>
              </div>
            ))}
          </Modal>
        );
      })()}
    </>
  );
}
