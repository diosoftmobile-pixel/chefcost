import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import { fmt, calcMenuFinalPrice, calcCostPerPortion } from '../lib/calc.js';
import Modal from '../components/Modal.jsx';

const blank = () => ({ name:'', description:'', guest_count:50, markup:30, vat:19, recipes:[] });

export default function Menus() {
  const { menus, setMenus, recipes, ingredients, isPaid } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [modal, setModal] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(blank()); setModal('add'); };
  const openEdit = m => { setForm({ ...m, recipes: (m.recipes || []).map(r => ({ ...r })) }); setModal(m.id); };
  const close = () => setModal(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addRec = () => setForm(f => ({ ...f, recipes: [...f.recipes, { recipe_id:'', portions:10 }] }));
  const setRec = (idx, k, v) => setForm(f => ({ ...f, recipes: f.recipes.map((r, n) => n === idx ? { ...r, [k]: v } : r) }));
  const removeRec = idx => setForm(f => ({ ...f, recipes: f.recipes.filter((_, n) => n !== idx) }));

  const totalCost = form.recipes.reduce((s, mr) => {
    const r = recipes.find(x => x.id === mr.recipe_id);
    return s + (r ? calcCostPerPortion(r, ingredients) * +mr.portions : 0);
  }, 0);
  const selling = totalCost * (1 + (+form.markup) / 100);
  const vatAmt = selling * ((+form.vat) / 100);
  const final = selling + vatAmt;

  const save = async () => {
    if (!form.name) return alert(t('common.nameRequired'));
    setSaving(true);
    const payload = { ...form, recipes: form.recipes.filter(r => r.recipe_id) };
    try {
      if (modal === 'add') { const m = await api.createMenu(payload); setMenus(p => [...p, m]); }
      else { const m = await api.updateMenu(modal, payload); setMenus(p => p.map(x => x.id === modal ? m : x)); }
      close();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm(t('menus.confirmDelete'))) return;
    await api.deleteMenu(id);
    setMenus(p => p.filter(m => m.id !== id));
  };

  const viewing = viewId ? menus.find(m => m.id === viewId) : null;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('menus.title')}</div>
        {isPaid
          ? <button className="btn btn-primary" onClick={openAdd}><i className="ti ti-plus"></i> {t('menus.newMenu')}</button>
          : <button className="btn btn-ghost" onClick={() => navigate('/billing')}><i className="ti ti-lock"></i> {t('menus.upgradeBtn')}</button>
        }
      </div>

      {!isPaid && (
        <div style={{ margin: '0 0 16px', padding: '12px 20px', background: 'var(--amber-soft, #fef9ec)', border: '1px solid var(--amber, #f59e0b)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="ti ti-lock" style={{ color: 'var(--amber, #f59e0b)', fontSize: 18 }}></i>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{t('menus.lockedTitle')}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{t('menus.lockedDesc')}</div>
          </div>
          <button className="btn btn-primary" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }} onClick={() => navigate('/billing')}>
            {t('menus.upgradeBtn')}
          </button>
        </div>
      )}

      <div className="page-content">
        <div className="card">
          <table>
            <thead><tr><th>{t('menus.colMenu')}</th><th>{t('menus.colGuests')}</th><th>{t('menus.colFoodCost')}</th><th>{t('menus.colMarkup')}</th><th>{t('menus.colVat')}</th><th>{t('menus.colFinalPrice')}</th><th>{t('menus.colCostPerGuest')}</th><th></th></tr></thead>
            <tbody>
              {menus.length === 0 && <tr><td colSpan={8}><div className="empty-state"><i className="ti ti-list"></i><p>{t('menus.none')}</p></div></td></tr>}
              {menus.map(m => {
                const p = calcMenuFinalPrice(m, recipes, ingredients);
                return <tr key={m.id}>
                  <td>{m.name}<div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.description}</div></td>
                  <td>{m.guest_count}</td>
                  <td className="mono">{fmt(p.cost)}</td>
                  <td><span className="badge badge-amber">{m.markup}%</span></td>
                  <td><span className="badge badge-gray">{m.vat}%</span></td>
                  <td className="mono accent" style={{ fontWeight: 500 }}>{fmt(p.final)}</td>
                  <td className="mono green">{fmt(p.costPerGuest)}</td>
                  <td><div className="action-btns">
                    <button className="icon-btn" onClick={() => setViewId(m.id)}><i className="ti ti-eye"></i></button>
                    {isPaid && <button className="icon-btn" onClick={() => openEdit(m)}><i className="ti ti-edit"></i></button>}
                    {isPaid && <button className="icon-btn danger" onClick={() => del(m.id)}><i className="ti ti-trash"></i></button>}
                    {!isPaid && <i className="ti ti-lock" style={{ color: 'var(--text3)', fontSize: 14, padding: '0 8px' }}></i>}
                  </div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isPaid && modal && (
        <Modal title={modal === 'add' ? t('menus.newModal') : t('menus.editModal')} onClose={close}
          footer={<><button className="btn" onClick={close}>{t('common.cancel')}</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? t('common.saving') : modal === 'add' ? t('menus.createMenu') : t('menus.saveEdit')}</button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('menus.menuName')}</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('menus.guestCount')}</label><input className="form-control" type="number" min="1" value={form.guest_count} onChange={e => set('guest_count', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">{t('menus.descriptionLabel')}</label><input className="form-control" value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('menus.markupPct')}</label><input className="form-control" type="number" min="0" step="0.5" value={form.markup} onChange={e => set('markup', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('menus.vatPct')}</label><input className="form-control" type="number" min="0" step="0.5" value={form.vat} onChange={e => set('vat', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 8px' }}>
            <label className="form-label" style={{ margin: 0 }}>{t('menus.recipesLabel')}</label>
            <button className="btn btn-ghost" onClick={addRec} style={{ fontSize: 12, padding: '4px 10px' }}><i className="ti ti-plus"></i> {t('menus.addRecipeBtn')}</button>
          </div>
          {form.recipes.map((mr, idx) => {
            const rec = recipes.find(r => r.id === mr.recipe_id);
            const cost = rec ? calcCostPerPortion(rec, ingredients) * +mr.portions : 0;
            return <div className="ing-row" key={idx}>
              <select className="form-control" style={{ fontSize: 12 }} value={mr.recipe_id} onChange={e => setRec(idx, 'recipe_id', e.target.value)}>
                <option value="">{t('menus.selectRecipe')}</option>
                {recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <div>
                <label style={{ fontSize: 10, color: 'var(--text3)' }}>{t('menus.portionsLabel')}</label>
                <input className="form-control" type="number" min="1" value={mr.portions} style={{ fontSize: 12 }} onChange={e => setRec(idx, 'portions', e.target.value)} />
              </div>
              <span className="mono accent" style={{ fontSize: 12 }}>{rec ? fmt(cost) : '—'}</span>
              <button className="icon-btn danger" onClick={() => removeRec(idx)}><i className="ti ti-x"></i></button>
            </div>;
          })}
          <div className="summary-box">
            <div className="summary-row"><span>{t('menus.foodCostLabel')}</span><span>{fmt(totalCost)}</span></div>
            <div className="summary-row"><span>{t('menus.costPerGuestLabel')}</span><span>{fmt(+form.guest_count > 0 ? totalCost / +form.guest_count : 0)}</span></div>
            <div className="summary-row"><span>{t('menus.colMarkup')} ({form.markup}%)</span><span>+{fmt(selling - totalCost)}</span></div>
            <div className="summary-row"><span>{t('menus.colVat')} ({form.vat}%)</span><span>+{fmt(vatAmt)}</span></div>
            <div className="summary-row total"><span>{t('menus.finalPriceVat')}</span><span>{fmt(final)}</span></div>
          </div>
        </Modal>
      )}

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewId(null)}
          footer={<button className="btn btn-primary" onClick={() => setViewId(null)}>{t('common.close')}</button>}>
          {(() => { const p = calcMenuFinalPrice(viewing, recipes, ingredients); return <>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>{viewing.description}</p>
            <table style={{ width: '100%', fontSize: 13, marginBottom: 16 }}>
              <thead><tr><th>{t('menus.colRecipe')}</th><th>{t('menus.colPortions')}</th><th>{t('menus.colCost')}</th></tr></thead>
              <tbody>{(viewing.recipes || []).map(mr => { const r = recipes.find(x => x.id === mr.recipe_id); return r ? <tr key={mr.id}><td>{r.name}</td><td>{mr.portions}</td><td className="mono accent">{fmt(calcCostPerPortion(r, ingredients) * mr.portions)}</td></tr> : null; })}</tbody>
            </table>
            <div className="summary-box">
              <div className="summary-row"><span>{t('menus.colFoodCost')}</span><span>{fmt(p.cost)}</span></div>
              <div className="summary-row"><span>{t('menus.costPerGuestView')}</span><span>{fmt(p.costPerGuest)}</span></div>
              <div className="summary-row"><span>{t('menus.colMarkup')} ({viewing.markup}%)</span><span>+{fmt(p.selling - p.cost)}</span></div>
              <div className="summary-row"><span>{t('menus.colVat')} ({viewing.vat}%)</span><span>+{fmt(p.vat)}</span></div>
              <div className="summary-row total"><span>{t('menus.finalPriceView')}</span><span>{fmt(p.final)}</span></div>
            </div>
          </>; })()}
        </Modal>
      )}
    </>
  );
}
