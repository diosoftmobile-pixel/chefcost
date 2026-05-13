import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import { fmt, unitPrice, usableCost, techLossPct } from '../lib/calc.js';
import { ALLERGENS, parseAllergens } from '../lib/allergens.js';
import Modal from '../components/Modal.jsx';

const CATS = ['Meat','Fish & Seafood','Vegetables','Fruits','Dairy','Grains','Oils & Fats','Spices','Beverages','Other'];
const CAT_KEYS = ['catMeat','catFish','catVegetables','catFruits','catDairy','catGrains','catOils','catSpices','catBeverages','catOther'];
const UNITS = ['kg','gram','liter','ml','piece','pack'];

const blank = () => ({
  name:'', category:'Vegetables', unit:'kg', purchase_qty:1, purchase_price:0,
  supplier:'', notes:'', allergens:[],
  yield_pct:100, cal_per_100g:0, protein_per_100g:0, carbs_per_100g:0, fat_per_100g:0,
});

export default function Ingredients() {
  const { ingredients, setIngredients, isPaid } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'nutrition'

  const tCat = cat => { const idx = CATS.indexOf(cat); return idx >= 0 ? t(`ingredients.${CAT_KEYS[idx]}`) : cat; };
  const filtered = ingredients.filter(i =>
    (i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || i.category === filterCat)
  );

  const openAdd = () => { setForm(blank()); setActiveTab('basic'); setModal('add'); };
  const openEdit = (i) => { setForm({ ...i, allergens: parseAllergens(i.allergens) }); setActiveTab('basic'); setModal(i.id); };
  const close = () => setModal(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleAllergen = key => setForm(f => ({
    ...f,
    allergens: f.allergens.includes(key) ? f.allergens.filter(a => a !== key) : [...f.allergens, key],
  }));

  const save = async () => {
    if (!form.name) return alert(t('common.nameRequired'));
    setSaving(true);
    try {
      if (modal === 'add') {
        const created = await api.createIngredient(form);
        setIngredients(prev => [...prev, created]);
      } else {
        const updated = await api.updateIngredient(modal, form);
        setIngredients(prev => prev.map(i => i.id === modal ? updated : i));
      }
      close();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm(t('ingredients.confirmDelete'))) return;
    await api.deleteIngredient(id);
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const baseUnit = u => u === 'kg' ? 'g' : u === 'liter' ? 'ml' : u;

  const calcDisplay = () => {
    const raw = unitPrice({ purchase_price: +form.purchase_price, purchase_qty: +form.purchase_qty });
    const yld = parseFloat(form.yield_pct) || 100;
    const usable = raw / (yld / 100);
    const base = (form.unit === 'kg' || form.unit === 'liter') ? raw / 1000 : raw;
    const usableBase = (form.unit === 'kg' || form.unit === 'liter') ? usable / 1000 : usable;
    return { raw, usable, base, usableBase };
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('ingredients.title')}</div>
        {isPaid
          ? <button className="btn btn-primary" onClick={openAdd}><i className="ti ti-plus"></i> {t('ingredients.addIngredient')}</button>
          : <button className="btn btn-ghost" onClick={() => navigate('/billing')}><i className="ti ti-lock"></i> {t('ingredients.upgradeBtn')}</button>
        }
      </div>

      {!isPaid && (
        <div style={{ margin: '0 0 16px', padding: '12px 20px', background: '#fef9ec', border: '1px solid #f59e0b', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="ti ti-lock" style={{ color: '#f59e0b', fontSize: 18 }}></i>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{t('ingredients.lockedTitle')}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{t('ingredients.lockedDesc')}</div>
          </div>
          <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => navigate('/billing')}>
            {t('ingredients.upgradeBtn')}
          </button>
        </div>
      )}

      <div className="page-content">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <i className="ti ti-search"></i>
            <input className="form-control" placeholder={t('ingredients.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
          </div>
          <select className="form-control" style={{ width: 180 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">{t('ingredients.allCategories')}</option>
            {CATS.map((c, i) => <option key={c} value={c}>{t(`ingredients.${CAT_KEYS[i]}`)}</option>)}
          </select>
        </div>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>{t('ingredients.colName')}</th>
                <th>{t('ingredients.colCategory')}</th>
                <th>{t('ingredients.colUnit')}</th>
                <th>{t('ingredients.colPurchasePrice')}</th>
                <th>{t('ingredients.colPricePerUnit')}</th>
                <th>{t('ingredients.colYield')}</th>
                <th>{t('ingredients.colSupplier')}</th>
                <th>{t('ingredients.colAllergens')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <i className="ti ti-basket"></i>
                    <p>{search || filterCat ? t('ingredients.noResults') : t('ingredients.none')}</p>
                  </div>
                </td></tr>
              )}
              {filtered.map(i => {
                const ings = parseAllergens(i.allergens);
                const loss = techLossPct(i);
                return (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 500 }}>{i.name}</td>
                    <td><span className="badge badge-gray">{tCat(i.category)}</span></td>
                    <td>{i.purchase_qty} {i.unit}</td>
                    <td>{fmt(i.purchase_price)}</td>
                    <td>
                      <div className="mono accent" style={{ fontSize: 12 }}>{fmt(unitPrice(i))}/{i.unit}</div>
                      {loss > 0 && (
                        <div style={{ fontSize: 10, color: 'var(--red)' }}>
                          {fmt(usableCost(i))}/{i.unit} {t('ingredients.usable')}
                        </div>
                      )}
                    </td>
                    <td>
                      {loss > 0
                        ? <span className="badge badge-amber">{parseFloat(i.yield_pct)}% ({loss.toFixed(0)}% {t('ingredients.loss')})</span>
                        : <span style={{ color: 'var(--text3)', fontSize: 12 }}>100%</span>
                      }
                    </td>
                    <td>{i.supplier || '—'}</td>
                    <td>
                      {ings.length > 0
                        ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {ings.map(key => {
                              const a = ALLERGENS.find(x => x.key === key);
                              return a ? <span key={key} className="allergen-badge">{a.num}. {a.label}</span> : null;
                            })}
                          </div>
                        : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      <div className="action-btns">
                        {isPaid && <button className="icon-btn" onClick={() => openEdit(i)}><i className="ti ti-edit"></i></button>}
                        {isPaid && <button className="icon-btn danger" onClick={() => del(i.id)}><i className="ti ti-trash"></i></button>}
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
        <Modal
          title={modal === 'add' ? t('ingredients.addModal') : t('ingredients.editModal')}
          onClose={close}
          footer={
            <>
              <button className="btn" onClick={close}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? t('common.saving') : modal === 'add' ? t('ingredients.saveAdd') : t('ingredients.saveEdit')}
              </button>
            </>
          }
        >
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button className={`tab${activeTab === 'basic' ? ' active' : ''}`} onClick={() => setActiveTab('basic')}>
              <i className="ti ti-info-circle"></i> {t('ingredients.tabBasic')}
            </button>
            <button className={`tab${activeTab === 'nutrition' ? ' active' : ''}`} onClick={() => setActiveTab('nutrition')}>
              <i className="ti ti-heart-rate-monitor"></i> {t('ingredients.tabNutrition')}
            </button>
            <button className={`tab${activeTab === 'allergens' ? ' active' : ''}`} onClick={() => setActiveTab('allergens')}>
              <i className="ti ti-shield-check"></i> {t('ingredients.tabAllergens')}
            </button>
          </div>

          {activeTab === 'basic' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('ingredients.productName')}</label>
                  <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('ingredients.categoryLabel')}</label>
                  <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATS.map((c, i) => <option key={c} value={c}>{t(`ingredients.${CAT_KEYS[i]}`)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('ingredients.purchaseQty')}</label>
                  <input className="form-control" type="number" min="0.001" step="0.001" value={form.purchase_qty} onChange={e => set('purchase_qty', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('ingredients.unitLabel')}</label>
                  <select className="form-control" value={form.unit} onChange={e => set('unit', e.target.value)}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('ingredients.purchasePriceLabel')}</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {t('ingredients.yieldPct')}
                    <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 11, marginLeft: 6 }}>
                      {t('ingredients.yieldHint')}
                    </span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-control" type="number" min="1" max="100" step="1" value={form.yield_pct} onChange={e => set('yield_pct', e.target.value)} style={{ paddingRight: 28 }} />
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 13 }}>%</span>
                  </div>
                  {parseFloat(form.yield_pct) < 100 && (
                    <div style={{ fontSize: 11, marginTop: 4, color: 'var(--amber)' }}>
                      {t('ingredients.techLoss')}: {(100 - parseFloat(form.yield_pct)).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('ingredients.supplierLabel')}</label>
                  <input className="form-control" value={form.supplier} onChange={e => set('supplier', e.target.value)} placeholder={t('common.optional')} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('ingredients.notesLabel')}</label>
                  <input className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} />
                </div>
              </div>

              {/* Calculation preview */}
              {+form.purchase_qty > 0 && (() => {
                const { raw, usable, base, usableBase } = calcDisplay();
                const hasLoss = parseFloat(form.yield_pct) < 100 && parseFloat(form.yield_pct) > 0;
                return (
                  <div className="summary-box">
                    <div className="summary-row">
                      <span>{t('ingredients.pricePerBaseUnit')}</span>
                      <span>{fmt(raw)}/{form.unit} · {fmt(base)}/{baseUnit(form.unit)}</span>
                    </div>
                    {hasLoss && (
                      <div className="summary-row" style={{ color: 'var(--amber)' }}>
                        <span>{t('ingredients.usableCost')}</span>
                        <span>{fmt(usable)}/{form.unit} · {fmt(usableBase)}/{baseUnit(form.unit)}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {activeTab === 'nutrition' && (
            <>
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, fontSize: 12, color: 'var(--text3)' }}>
                <i className="ti ti-info-circle" style={{ marginRight: 6 }}></i>
                {t('ingredients.nutritionHint')}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('ingredients.calories')} <span style={{ fontWeight: 400, color: 'var(--text3)' }}>/ 100g</span></label>
                  <input className="form-control" type="number" min="0" step="1" value={form.cal_per_100g} onChange={e => set('cal_per_100g', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('ingredients.protein')} <span style={{ fontWeight: 400, color: 'var(--text3)' }}>/ 100g</span></label>
                  <input className="form-control" type="number" min="0" step="0.1" value={form.protein_per_100g} onChange={e => set('protein_per_100g', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('ingredients.carbs')} <span style={{ fontWeight: 400, color: 'var(--text3)' }}>/ 100g</span></label>
                  <input className="form-control" type="number" min="0" step="0.1" value={form.carbs_per_100g} onChange={e => set('carbs_per_100g', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('ingredients.fat')} <span style={{ fontWeight: 400, color: 'var(--text3)' }}>/ 100g</span></label>
                  <input className="form-control" type="number" min="0" step="0.1" value={form.fat_per_100g} onChange={e => set('fat_per_100g', e.target.value)} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'allergens' && (
            <div className="form-group">
              <label className="form-label">
                {t('ingredients.allergensLabel')}
                <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 11, marginLeft: 6 }}>EU 14</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px 12px', marginTop: 4 }}>
                {ALLERGENS.map(a => (
                  <label key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={form.allergens.includes(a.key)}
                      onChange={() => toggleAllergen(a.key)}
                      style={{ accentColor: 'var(--accent)', width: 14, height: 14, cursor: 'pointer' }}
                    />
                    <span style={{ color: form.allergens.includes(a.key) ? 'var(--accent)' : 'var(--text2)' }}>
                      {a.num}. {a.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
