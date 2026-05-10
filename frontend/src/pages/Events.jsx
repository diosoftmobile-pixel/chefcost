import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import { fmt, calcEventTotal, calcMenuFinalPrice, buildShoppingList } from '../lib/calc.js';
import { exportEventPDF } from '../lib/pdf.js';
import Modal from '../components/Modal.jsx';

const STATUSES = ['Draft','Sent Offer','Approved','Cancelled','Completed'];
const STATUS_BADGE = { 'Draft':'badge-gray','Sent Offer':'badge-blue','Approved':'badge-green','Cancelled':'badge-red','Completed':'badge-amber' };
const blank = () => ({ name:'', client_name:'', client_email:'', client_phone:'', event_date:'', guest_count:50, notes:'', status:'Draft', menus:[] });

export default function Events() {
  const { events, setEvents, menus, recipes, ingredients, isPaid } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [modal, setModal] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(blank()); setModal('add'); };
  const openEdit = e => { setForm({ ...e, menus: (e.menus || []).map(m => ({ ...m })) }); setModal(e.id); };
  const close = () => setModal(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addMenu = () => setForm(f => ({ ...f, menus: [...f.menus, { menu_id:'', quantity:1 }] }));
  const setMen = (idx, k, v) => setForm(f => ({ ...f, menus: f.menus.map((m, n) => n === idx ? { ...m, [k]: v } : m) }));
  const removeMen = idx => setForm(f => ({ ...f, menus: f.menus.filter((_, n) => n !== idx) }));

  const totalCost = form.menus.reduce((s, em) => {
    const m = menus.find(x => x.id === em.menu_id);
    return s + (m ? calcMenuFinalPrice(m, recipes, ingredients).final : 0);
  }, 0);

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

  const viewing = viewId ? events.find(e => e.id === viewId) : null;

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
        <div style={{ margin: '0 0 16px', padding: '12px 20px', background: 'var(--amber-soft, #fef9ec)', border: '1px solid var(--amber, #f59e0b)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="ti ti-lock" style={{ color: 'var(--amber, #f59e0b)', fontSize: 18 }}></i>
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
        <div className="card">
          <table>
            <thead><tr><th>{t('events.colEvent')}</th><th>{t('events.colClient')}</th><th>{t('events.colDate')}</th><th>{t('events.colGuests')}</th><th>{t('events.colTotalValue')}</th><th>{t('events.colStatus')}</th><th></th></tr></thead>
            <tbody>
              {events.length === 0 && <tr><td colSpan={7}><div className="empty-state"><i className="ti ti-calendar-event"></i><p>{t('events.none')}</p></div></td></tr>}
              {events.map(e => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.client_name}<div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.client_email}</div></td>
                  <td>{e.event_date}</td>
                  <td>{e.guest_count}</td>
                  <td className="mono accent">{fmt(calcEventTotal(e, menus, recipes, ingredients))}</td>
                  <td><span className={`badge ${STATUS_BADGE[e.status] || 'badge-gray'}`}>{t(`events.statuses.${e.status}`, e.status)}</span></td>
                  <td><div className="action-btns">
                    <button className="icon-btn" title={t('events.viewDetails')} onClick={() => setViewId(e.id)}><i className="ti ti-eye"></i></button>
                    <button className="icon-btn pdf-btn" title={t('events.exportPdf')} onClick={() => exportEventPDF(e, menus, recipes, ingredients)}><i className="ti ti-file-text"></i></button>
                    {isPaid && <button className="icon-btn" onClick={() => openEdit(e)}><i className="ti ti-edit"></i></button>}
                    {isPaid && <button className="icon-btn danger" onClick={() => del(e.id)}><i className="ti ti-trash"></i></button>}
                    {!isPaid && <i className="ti ti-lock" style={{ color: 'var(--text3)', fontSize: 14, padding: '0 8px' }}></i>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isPaid && modal && (
        <Modal title={modal === 'add' ? t('events.newModal') : t('events.editModal')} onClose={close}
          footer={<><button className="btn" onClick={close}>{t('common.cancel')}</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? t('common.saving') : modal === 'add' ? t('events.createEvent') : t('events.saveEdit')}</button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('events.eventName')}</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('events.statusLabel')}</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{t(`events.statuses.${s}`, s)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('events.clientName')}</label><input className="form-control" value={form.client_name} onChange={e => set('client_name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('events.clientEmail')}</label><input className="form-control" type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('events.phone')}</label><input className="form-control" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('events.eventDate')}</label><input className="form-control" type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('events.guestCount')}</label><input className="form-control" type="number" min="1" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('events.notesLabel')}</label><input className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 8px' }}>
            <label className="form-label" style={{ margin: 0 }}>{t('events.menusLabel')}</label>
            <button className="btn btn-ghost" onClick={addMenu} style={{ fontSize: 12, padding: '4px 10px' }}><i className="ti ti-plus"></i> {t('events.addMenuBtn')}</button>
          </div>
          {form.menus.map((em, idx) => {
            const menu = menus.find(m => m.id === em.menu_id);
            return <div className="ing-row" key={idx}>
              <select className="form-control" style={{ fontSize: 12 }} value={em.menu_id} onChange={e => setMen(idx, 'menu_id', e.target.value)}>
                <option value="">{t('events.selectMenu')}</option>
                {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{menu ? `${menu.guest_count} ${t('common.guests')}` : ''}</div>
              <span className="mono accent" style={{ fontSize: 12 }}>{menu ? fmt(calcMenuFinalPrice(menu, recipes, ingredients).final) : '—'}</span>
              <button className="icon-btn danger" onClick={() => removeMen(idx)}><i className="ti ti-x"></i></button>
            </div>;
          })}
          <div className="summary-box">
            <div className="summary-row"><span>{t('events.totalEventValue')}</span><span>{fmt(totalCost)}</span></div>
            <div className="summary-row total"><span>{t('events.costPerGuest')}</span><span>{fmt(+form.guest_count > 0 ? totalCost / +form.guest_count : 0)}</span></div>
          </div>
        </Modal>
      )}

      {viewing && (() => {
        const total = calcEventTotal(viewing, menus, recipes, ingredients);
        const shopping = buildShoppingList(viewing, menus, recipes, ingredients);
        return <Modal title={viewing.name} onClose={() => setViewId(null)}
          footer={<>
            <button className="btn btn-pdf" onClick={() => { exportEventPDF(viewing, menus, recipes, ingredients); setViewId(null); }}><i className="ti ti-file-text"></i> {t('events.exportPdf')}</button>
            <button className="btn btn-primary" onClick={() => setViewId(null)}>{t('common.close')}</button>
          </>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 13 }}><span className="text3">{t('events.clientLabel')} </span>{viewing.client_name}</div>
            <div style={{ fontSize: 13 }}><span className="text3">{t('events.dateLabel')} </span>{viewing.event_date}</div>
            <div style={{ fontSize: 13 }}><span className="text3">{t('events.guestsLabel')} </span>{viewing.guest_count}</div>
            <div style={{ fontSize: 13 }}><span className="text3">{t('events.statusViewLabel')} </span><span className={`badge ${STATUS_BADGE[viewing.status] || 'badge-gray'}`}>{t(`events.statuses.${viewing.status}`, viewing.status)}</span></div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '16px 0 8px' }}>{t('events.shoppingList')}</div>
          {Object.entries(shopping).map(([name, data]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13 }}>{name}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{Math.round(data.qty * 100) / 100} {data.unit} — <span className="accent">{fmt(data.cost)}</span></span>
            </div>
          ))}
          <div className="summary-box" style={{ marginTop: 16 }}>
            <div className="summary-row total"><span>{t('events.totalEventValue')}</span><span>{fmt(total)}</span></div>
          </div>
        </Modal>;
      })()}
    </>
  );
}
