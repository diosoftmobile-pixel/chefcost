import { useState } from 'react';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import { fmt, calcEventTotal, calcMenuFinalPrice, buildShoppingList } from '../lib/calc.js';
import { exportEventPDF } from '../lib/pdf.js';
import Modal from '../components/Modal.jsx';

const STATUSES = ['Draft','Sent Offer','Approved','Cancelled','Completed'];
const STATUS_BADGE = { 'Draft':'badge-gray','Sent Offer':'badge-blue','Approved':'badge-green','Cancelled':'badge-red','Completed':'badge-amber' };
const blank = () => ({ name:'', client_name:'', client_email:'', client_phone:'', event_date:'', guest_count:50, notes:'', status:'Draft', menus:[] });

export default function Events() {
  const { events, setEvents, menus, recipes, ingredients } = useApp();
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
    if (!form.name) return alert('Event name required');
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
    if (!confirm('Delete this event?')) return;
    await api.deleteEvent(id);
    setEvents(p => p.filter(e => e.id !== id));
  };

  const viewing = viewId ? events.find(e => e.id === viewId) : null;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Events</div>
        <button className="btn btn-primary" onClick={openAdd}><i className="ti ti-plus"></i> New event</button>
      </div>
      <div className="page-content">
        <div className="card">
          <table>
            <thead><tr><th>Event</th><th>Client</th><th>Date</th><th>Guests</th><th>Total value</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {events.length === 0 && <tr><td colSpan={7}><div className="empty-state"><i className="ti ti-calendar-event"></i><p>No events yet</p></div></td></tr>}
              {events.map(e => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.client_name}<div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.client_email}</div></td>
                  <td>{e.event_date}</td>
                  <td>{e.guest_count}</td>
                  <td className="mono accent">{fmt(calcEventTotal(e, menus, recipes, ingredients))}</td>
                  <td><span className={`badge ${STATUS_BADGE[e.status] || 'badge-gray'}`}>{e.status}</span></td>
                  <td><div className="action-btns">
                    <button className="icon-btn" title="View details" onClick={() => setViewId(e.id)}><i className="ti ti-eye"></i></button>
                    <button className="icon-btn pdf-btn" title="Export PDF quote" onClick={() => exportEventPDF(e, menus, recipes, ingredients)}><i className="ti ti-file-text"></i></button>
                    <button className="icon-btn" onClick={() => openEdit(e)}><i className="ti ti-edit"></i></button>
                    <button className="icon-btn danger" onClick={() => del(e.id)}><i className="ti ti-trash"></i></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'New event' : 'Edit event'} onClose={close}
          footer={<><button className="btn" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? 'Create event' : 'Save changes'}</button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Event name *</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Client name</label><input className="form-control" value={form.client_name} onChange={e => set('client_name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Client email</label><input className="form-control" type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Event date</label><input className="form-control" type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Guest count</label><input className="form-control" type="number" min="1" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 8px' }}>
            <label className="form-label" style={{ margin: 0 }}>Menus</label>
            <button className="btn btn-ghost" onClick={addMenu} style={{ fontSize: 12, padding: '4px 10px' }}><i className="ti ti-plus"></i> Add menu</button>
          </div>
          {form.menus.map((em, idx) => {
            const menu = menus.find(m => m.id === em.menu_id);
            return <div className="ing-row" key={idx}>
              <select className="form-control" style={{ fontSize: 12 }} value={em.menu_id} onChange={e => setMen(idx, 'menu_id', e.target.value)}>
                <option value="">— Select menu —</option>
                {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{menu ? `${menu.guest_count} guests` : ''}</div>
              <span className="mono accent" style={{ fontSize: 12 }}>{menu ? fmt(calcMenuFinalPrice(menu, recipes, ingredients).final) : '—'}</span>
              <button className="icon-btn danger" onClick={() => removeMen(idx)}><i className="ti ti-x"></i></button>
            </div>;
          })}
          <div className="summary-box">
            <div className="summary-row"><span>Total event value</span><span>{fmt(totalCost)}</span></div>
            <div className="summary-row total"><span>Cost per guest</span><span>{fmt(+form.guest_count > 0 ? totalCost / +form.guest_count : 0)}</span></div>
          </div>
        </Modal>
      )}

      {viewing && (() => {
        const total = calcEventTotal(viewing, menus, recipes, ingredients);
        const shopping = buildShoppingList(viewing, menus, recipes, ingredients);
        return <Modal title={viewing.name} onClose={() => setViewId(null)}
          footer={<>
            <button className="btn btn-pdf" onClick={() => { exportEventPDF(viewing, menus, recipes, ingredients); setViewId(null); }}><i className="ti ti-file-text"></i> Export PDF quote</button>
            <button className="btn btn-primary" onClick={() => setViewId(null)}>Close</button>
          </>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 13 }}><span className="text3">Client: </span>{viewing.client_name}</div>
            <div style={{ fontSize: 13 }}><span className="text3">Date: </span>{viewing.event_date}</div>
            <div style={{ fontSize: 13 }}><span className="text3">Guests: </span>{viewing.guest_count}</div>
            <div style={{ fontSize: 13 }}><span className="text3">Status: </span><span className={`badge ${STATUS_BADGE[viewing.status] || 'badge-gray'}`}>{viewing.status}</span></div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '16px 0 8px' }}>Shopping list</div>
          {Object.entries(shopping).map(([name, data]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13 }}>{name}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{Math.round(data.qty * 100) / 100} {data.unit} — <span className="accent">{fmt(data.cost)}</span></span>
            </div>
          ))}
          <div className="summary-box" style={{ marginTop: 16 }}>
            <div className="summary-row total"><span>Total event value</span><span>{fmt(total)}</span></div>
          </div>
        </Modal>;
      })()}
    </>
  );
}
