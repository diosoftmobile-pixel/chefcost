import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import { fmt, calcRecipeCost, calcCostPerPortion, unitPrice } from '../lib/calc.js';
import Modal from '../components/Modal.jsx';

const CATS = ['Starter','Main Course','Dessert','Side Dish','Soup','Salad','Other'];
const CAT_KEYS = ['catStarter','catMain','catDessert','catSide','catSoup','catSalad','catOther'];
const UNITS = ['kg','gram','liter','ml','piece'];
const blank = () => ({ name:'', category:'Main Course', portions:4, notes:'', ingredients:[] });

export default function Recipes() {
  const { recipes, setRecipes, ingredients, isPaid } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm(blank()); setModal('add'); };
  const openEdit = r => { setForm({ ...r, ingredients: r.ingredients.map(i => ({ ...i })) }); setModal(r.id); };
  const close = () => setModal(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addIng = () => setForm(f => ({ ...f, ingredients: [...f.ingredients, { ingredient_id:'', qty:0, unit:'kg' }] }));
  const setIng = (idx, k, v) => setForm(f => ({ ...f, ingredients: f.ingredients.map((i, n) => n === idx ? { ...i, [k]: v } : i) }));
  const removeIng = idx => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, n) => n !== idx) }));

  const totalCost = form.ingredients.reduce((s, ri) => {
    const ing = ingredients.find(i => i.id === ri.ingredient_id);
    return s + (ing ? unitPrice(ing) * +ri.qty : 0);
  }, 0);

  const save = async () => {
    if (!form.name) return alert(t('common.nameRequired'));
    setSaving(true);
    const payload = { ...form, ingredients: form.ingredients.filter(i => i.ingredient_id) };
    try {
      if (modal === 'add') { const r = await api.createRecipe(payload); setRecipes(p => [...p, r]); }
      else { const r = await api.updateRecipe(modal, payload); setRecipes(p => p.map(x => x.id === modal ? r : x)); }
      close();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm(t('recipes.confirmDelete'))) return;
    await api.deleteRecipe(id);
    setRecipes(p => p.filter(r => r.id !== id));
  };

  const tCat = cat => { const idx = CATS.indexOf(cat); return idx >= 0 ? t(`recipes.${CAT_KEYS[idx]}`) : cat; };
  const viewing = viewId ? recipes.find(r => r.id === viewId) : null;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('recipes.title')}</div>
        {isPaid
          ? <button className="btn btn-primary" onClick={openAdd}><i className="ti ti-plus"></i> {t('recipes.newRecipe')}</button>
          : <button className="btn btn-ghost" onClick={() => navigate('/billing')}><i className="ti ti-lock"></i> {t('recipes.upgradeBtn')}</button>
        }
      </div>

      {!isPaid && (
        <div style={{ margin: '0 0 16px', padding: '12px 20px', background: 'var(--amber-soft, #fef9ec)', border: '1px solid var(--amber, #f59e0b)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="ti ti-lock" style={{ color: 'var(--amber, #f59e0b)', fontSize: 18 }}></i>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{t('recipes.lockedTitle')}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{t('recipes.lockedDesc')}</div>
          </div>
          <button className="btn btn-primary" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }} onClick={() => navigate('/billing')}>
            {t('recipes.upgradeBtn')}
          </button>
        </div>
      )}

      <div className="page-content">
        <div className="card">
          <table>
            <thead><tr><th>{t('recipes.colRecipe')}</th><th>{t('recipes.colCategory')}</th><th>{t('recipes.colPortions')}</th><th>{t('recipes.colTotalCost')}</th><th>{t('recipes.colCostPerPortion')}</th><th>{t('recipes.colIngredients')}</th><th></th></tr></thead>
            <tbody>
              {recipes.length === 0 && <tr><td colSpan={7}><div className="empty-state"><i className="ti ti-notebook"></i><p>{t('recipes.none')}</p></div></td></tr>}
              {recipes.map(r => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td><span className="badge badge-gray">{tCat(r.category)}</span></td>
                  <td>{r.portions}</td>
                  <td className="mono">{fmt(calcRecipeCost(r, ingredients))}</td>
                  <td className="mono accent">{fmt(calcCostPerPortion(r, ingredients))}</td>
                  <td><span className="badge badge-blue">{r.ingredients?.length || 0} {t('common.items')}</span></td>
                  <td><div className="action-btns">
                    <button className="icon-btn" onClick={() => setViewId(r.id)}><i className="ti ti-eye"></i></button>
                    {isPaid && <button className="icon-btn" onClick={() => openEdit(r)}><i className="ti ti-edit"></i></button>}
                    {isPaid && <button className="icon-btn danger" onClick={() => del(r.id)}><i className="ti ti-trash"></i></button>}
                    {!isPaid && <i className="ti ti-lock" style={{ color: 'var(--text3)', fontSize: 14, padding: '0 8px' }}></i>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isPaid && modal && (
        <Modal title={modal === 'add' ? t('recipes.newModal') : t('recipes.editModal')} onClose={close}
          footer={<><button className="btn" onClick={close}>{t('common.cancel')}</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? t('common.saving') : modal === 'add' ? t('recipes.createRecipe') : t('recipes.saveEdit')}</button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('recipes.recipeName')}</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('recipes.categoryLabel')}</label>
              <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>{CATS.map((c, i) => <option key={c} value={c}>{t(`recipes.${CAT_KEYS[i]}`)}</option>)}</select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('recipes.portionsLabel')}</label><input className="form-control" type="number" min="1" value={form.portions} onChange={e => set('portions', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('recipes.notesLabel')}</label><input className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 8px' }}>
            <label className="form-label" style={{ margin: 0 }}>{t('recipes.ingredientsLabel')}</label>
            <button className="btn btn-ghost" onClick={addIng} style={{ fontSize: 12, padding: '4px 10px' }}><i className="ti ti-plus"></i> {t('recipes.addIngBtn')}</button>
          </div>
          {form.ingredients.map((ri, idx) => {
            const ing = ingredients.find(i => i.id === ri.ingredient_id);
            const cost = ing ? unitPrice(ing) * +ri.qty : 0;
            return <div key={idx}>
              <div className="ing-row">
                <select className="form-control" style={{ fontSize: 12 }} value={ri.ingredient_id} onChange={e => setIng(idx, 'ingredient_id', e.target.value)}>
                  <option value="">{t('recipes.selectIngredient')}</option>
                  {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <input className="form-control" type="number" step="0.001" min="0" value={ri.qty} style={{ fontSize: 12 }} onChange={e => setIng(idx, 'qty', e.target.value)} />
                <select className="form-control" style={{ fontSize: 12 }} value={ri.unit} onChange={e => setIng(idx, 'unit', e.target.value)}>{UNITS.map(u => <option key={u}>{u}</option>)}</select>
                <button className="icon-btn danger" onClick={() => removeIng(idx)}><i className="ti ti-x"></i></button>
              </div>
              {ing && <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text3)', padding: '2px 0 6px', fontFamily: 'var(--mono)' }}>{fmt(cost)}</div>}
            </div>;
          })}
          <div className="summary-box">
            <div className="summary-row"><span>{t('recipes.totalRecipeCost')}</span><span>{fmt(totalCost)}</span></div>
            <div className="summary-row total"><span>{t('recipes.costPerPortionLabel')}</span><span>{fmt(+form.portions > 0 ? totalCost / +form.portions : 0)}</span></div>
          </div>
        </Modal>
      )}

      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewId(null)}
          footer={<button className="btn btn-primary" onClick={() => setViewId(null)}>{t('common.close')}</button>}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <span className="badge badge-gray">{tCat(viewing.category)}</span>
            <span className="badge badge-blue">{viewing.portions} {t('common.portions')}</span>
          </div>
          <table style={{ width: '100%', fontSize: 13, marginBottom: 16 }}>
            <thead><tr><th>{t('recipes.colIngredient')}</th><th>{t('recipes.colQty')}</th><th>{t('recipes.colUnitPrice')}</th><th>{t('recipes.colCost')}</th></tr></thead>
            <tbody>
              {(viewing.ingredients || []).map(ri => {
                const ing = ingredients.find(i => i.id === ri.ingredient_id);
                if (!ing) return null;
                return <tr key={ri.id || ri.ingredient_id}>
                  <td>{ing.name}</td><td>{ri.qty} {ri.unit}</td>
                  <td>{fmt(unitPrice(ing))}/{ing.unit}</td>
                  <td className="mono accent">{fmt(unitPrice(ing) * ri.qty)}</td>
                </tr>;
              })}
            </tbody>
          </table>
          <div className="summary-box">
            <div className="summary-row"><span>{t('recipes.total')}</span><span>{fmt(calcRecipeCost(viewing, ingredients))}</span></div>
            <div className="summary-row total"><span>{t('recipes.perPortion')}</span><span>{fmt(calcCostPerPortion(viewing, ingredients))}</span></div>
          </div>
        </Modal>
      )}
    </>
  );
}
