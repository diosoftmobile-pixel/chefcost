import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import { fmt, unitPrice } from '../lib/calc.js';
import Modal from '../components/Modal.jsx';

const CATS = ['Meat','Fish & Seafood','Vegetables','Fruits','Dairy','Grains','Oils & Fats','Spices','Beverages','Other'];
const UNITS = ['kg','gram','liter','ml','piece','pack'];
const blank = () => ({ name:'', category:'Vegetables', unit:'kg', purchase_qty:1, purchase_price:0, supplier:'', notes:'' });

export default function Ingredients() {
  const { ingredients, setIngredients } = useApp();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);

  const filtered = ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm(blank()); setModal('add'); };
  const openEdit = (i) => { setForm({ ...i }); setModal(i.id); };
  const close = () => setModal(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
    const pp = unitPrice({ purchase_price: +form.purchase_price, purchase_qty: +form.purchase_qty });
    const base = (form.unit === 'kg' || form.unit === 'liter') ? pp / 1000 : pp;
    return `${fmt(pp)}/${form.unit} · ${fmt(base)}/${baseUnit(form.unit)}`;
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('ingredients.title')}</div>
        <button className="btn btn-primary" onClick={openAdd}><i className="ti ti-plus"></i> {t('ingredients.addIngredient')}</button>
      </div>
      <div className="page-content">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div className="search-wrap" style={{ flex: 1 }}>
            <i className="ti ti-search"></i>
            <input className="form-control" placeholder={t('ingredients.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
          </div>
        </div>
        <div className="card">
          <table>
            <thead><tr><th>{t('ingredients.colName')}</th><th>{t('ingredients.colCategory')}</th><th>{t('ingredients.colUnit')}</th><th>{t('ingredients.colPurchasePrice')}</th><th>{t('ingredients.colPricePerUnit')}</th><th>{t('ingredients.colSupplier')}</th><th></th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7}><div className="empty-state"><i className="ti ti-basket"></i><p>{search ? t('ingredients.noResults') : t('ingredients.none')}</p></div></td></tr>}
              {filtered.map(i => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td><span className="badge badge-gray">{i.category}</span></td>
                  <td>{i.purchase_qty} {i.unit}</td>
                  <td>{fmt(i.purchase_price)}</td>
                  <td className="mono accent">{fmt(unitPrice(i))}/{i.unit} · {fmt((i.unit==='kg'||i.unit==='liter') ? unitPrice(i)/1000 : unitPrice(i))}/{baseUnit(i.unit)}</td>
                  <td>{i.supplier || '—'}</td>
                  <td><div className="action-btns">
                    <button className="icon-btn" onClick={() => openEdit(i)}><i className="ti ti-edit"></i></button>
                    <button className="icon-btn danger" onClick={() => del(i.id)}><i className="ti ti-trash"></i></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? t('ingredients.addModal') : t('ingredients.editModal')} onClose={close}
          footer={<><button className="btn" onClick={close}>{t('common.cancel')}</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? t('common.saving') : modal === 'add' ? t('ingredients.saveAdd') : t('ingredients.saveEdit')}</button></>}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('ingredients.productName')}</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('ingredients.categoryLabel')}</label>
              <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('ingredients.purchaseQty')}</label><input className="form-control" type="number" min="0.001" step="0.001" value={form.purchase_qty} onChange={e => set('purchase_qty', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('ingredients.unitLabel')}</label>
              <select className="form-control" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('ingredients.purchasePriceLabel')}</label><input className="form-control" type="number" min="0" step="0.01" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('ingredients.supplierLabel')}</label><input className="form-control" value={form.supplier} onChange={e => set('supplier', e.target.value)} placeholder={t('common.optional')} /></div>
          </div>
          <div className="form-group"><label className="form-label">{t('ingredients.notesLabel')}</label><input className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
          <div className="summary-box"><div className="summary-row"><span>{t('ingredients.pricePerBaseUnit')}</span><span>{+form.purchase_qty > 0 ? calcDisplay() : '—'}</span></div></div>
        </Modal>
      )}
    </>
  );
}
