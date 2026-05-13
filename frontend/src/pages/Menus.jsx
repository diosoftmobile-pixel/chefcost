import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import { fmt, calcMenuFinalPrice, calcCostPerPortion } from '../lib/calc.js';
import Modal from '../components/Modal.jsx';

const blank = () => ({ name:'', description:'', markup:30, vat:19, recipes:[] });

// Render markdown-like bold sections from AI output
function AiText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text2)' }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
        // **Section Title** → bold heading
        const boldMatch = line.match(/^\*\*(.+?)\*\*\s*(—\s*)?(.*)$/);
        if (boldMatch) return (
          <div key={i} style={{ marginTop: i === 0 ? 0 : 10 }}>
            <span style={{ fontWeight: 700, color: 'var(--text1)' }}>{boldMatch[1]}</span>
            {boldMatch[3] && <span> — {boldMatch[3]}</span>}
          </div>
        );
        return <div key={i}>{line}</div>;
      })}
    </div>
  );
}

export default function Menus() {
  const { menus, setMenus, recipes, ingredients, isPaid } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [modal, setModal] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);
  const [aiAdvisor, setAiAdvisor] = useState(false);  // checkbox state
  const [analyzing, setAnalyzing] = useState(false);  // AI loading state
  const [aiModal, setAiModal] = useState(null);       // { menuId, analysis, analyzed_at }

  const openAdd = () => { setForm(blank()); setAiAdvisor(false); setModal('add'); };
  const openEdit = m => { setForm({ ...m, recipes: (m.recipes || []).map(r => ({ ...r })) }); setAiAdvisor(false); setModal(m.id); };
  const close = () => setModal(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addRec = () => setForm(f => ({ ...f, recipes: [...f.recipes, { recipe_id:'', portions:1 }] }));
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
      let saved;
      if (modal === 'add') { saved = await api.createMenu(payload); setMenus(p => [...p, saved]); }
      else { saved = await api.updateMenu(modal, payload); setMenus(p => p.map(x => x.id === modal ? saved : x)); }
      close();

      // Run AI analysis if checkbox was checked
      if (aiAdvisor && saved?.id) {
        setAnalyzing(true);
        try {
          const result = await api.analyzeMenu(saved.id);
          const updatedMenu = { ...saved, ai_analysis: result.analysis, ai_analyzed_at: result.analyzed_at };
          setMenus(p => p.map(x => x.id === saved.id ? updatedMenu : x));
          setAiModal({ menuId: saved.id, analysis: result.analysis, analyzed_at: result.analyzed_at, name: saved.name });
        } catch (e) {
          alert('AI Advisor: ' + e.message);
        } finally {
          setAnalyzing(false);
        }
      }
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const runAnalysis = async (menu) => {
    setAnalyzing(true);
    try {
      const result = await api.analyzeMenu(menu.id);
      const updatedMenu = { ...menu, ai_analysis: result.analysis, ai_analyzed_at: result.analyzed_at };
      setMenus(p => p.map(x => x.id === menu.id ? updatedMenu : x));
      setAiModal({ menuId: menu.id, analysis: result.analysis, analyzed_at: result.analyzed_at, name: menu.name });
    } catch (e) {
      alert('AI Advisor: ' + e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const del = async id => {
    if (!confirm(t('menus.confirmDelete'))) return;
    await api.deleteMenu(id);
    setMenus(p => p.filter(m => m.id !== id));
  };

  const viewing = viewId ? menus.find(m => m.id === viewId) : null;

  return (
    <>
      {/* AI Advisor analyzing overlay */}
      {analyzing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: '32px 40px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--text1)' }}>{t('menus.aiAnalyzing')}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{t('menus.aiAnalyzingDesc')}</div>
            <div style={{ marginTop: 16, display: 'flex', gap: 6, justifyContent: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', animation: `pulse 1.2s ${i * 0.4}s infinite` }} />
              ))}
            </div>
          </div>
        </div>
      )}

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
            <thead><tr><th>{t('menus.colMenu')}</th><th>{t('menus.colFoodCost')}</th><th>{t('menus.colMarkup')}</th><th>{t('menus.colVat')}</th><th>{t('menus.colPricePerPerson')}</th><th></th></tr></thead>
            <tbody>
              {menus.length === 0 && <tr><td colSpan={6}><div className="empty-state"><i className="ti ti-list"></i><p>{t('menus.none')}</p></div></td></tr>}
              {menus.map(m => {
                const p = calcMenuFinalPrice(m, recipes, ingredients);
                const hasAi = !!m.ai_analysis;
                return <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {m.name}
                      {hasAi && (
                        <span
                          title={t('menus.aiAdvisorBadgeTip')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'linear-gradient(135deg,#2d2416,#3d3018)', border: '1px solid var(--gold)', borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700, color: 'var(--gold)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          onClick={() => setAiModal({ menuId: m.id, analysis: m.ai_analysis, analyzed_at: m.ai_analyzed_at, name: m.name })}
                        >
                          🤖 AI
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.description}</div>
                  </td>
                  <td className="mono">{fmt(p.cost)}</td>
                  <td><span className="badge badge-amber">{m.markup}%</span></td>
                  <td><span className="badge badge-gray">{m.vat}%</span></td>
                  <td className="mono accent" style={{ fontWeight: 500 }}>{fmt(p.final)}</td>
                  <td><div className="action-btns">
                    <button className="icon-btn" title={t('menus.aiAdvisorBtn')} onClick={() => runAnalysis(m)} style={{ color: 'var(--gold)' }}><i className="ti ti-robot"></i></button>
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

      {/* Create / Edit modal */}
      {isPaid && modal && (
        <Modal title={modal === 'add' ? t('menus.newModal') : t('menus.editModal')} onClose={close}
          footer={<><button className="btn" onClick={close}>{t('common.cancel')}</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? t('common.saving') : modal === 'add' ? t('menus.createMenu') : t('menus.saveEdit')}</button></>}>
          <div className="form-group"><label className="form-label">{t('menus.menuName')}</label><input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} /></div>
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
            <div className="summary-row"><span>{t('menus.colMarkup')} ({form.markup}%)</span><span>+{fmt(selling - totalCost)}</span></div>
            <div className="summary-row"><span>{t('menus.colVat')} ({form.vat}%)</span><span>+{fmt(vatAmt)}</span></div>
            <div className="summary-row total"><span>{t('menus.pricePerPerson')}</span><span>{fmt(final)}</span></div>
          </div>

          {/* Chef's AI Advisor checkbox */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16, cursor: 'pointer', padding: '12px 14px', background: aiAdvisor ? 'linear-gradient(135deg,#2a2215,#332a18)' : 'var(--bg3)', border: `1px solid ${aiAdvisor ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 10, transition: 'all 0.2s' }}>
            <input
              type="checkbox"
              checked={aiAdvisor}
              onChange={e => setAiAdvisor(e.target.checked)}
              style={{ accentColor: 'var(--gold)', width: 16, height: 16, marginTop: 1, cursor: 'pointer', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: aiAdvisor ? 'var(--gold)' : 'var(--text1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                🤖 {t('menus.aiAdvisorCheckbox')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{t('menus.aiAdvisorDesc')}</div>
            </div>
          </label>
        </Modal>
      )}

      {/* View modal */}
      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewId(null)}
          footer={
            <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-ghost" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }} onClick={() => runAnalysis(viewing)} disabled={analyzing}>
                <i className="ti ti-robot"></i> {t('menus.aiAdvisorBtn')}
              </button>
              <button className="btn btn-primary" onClick={() => setViewId(null)}>{t('common.close')}</button>
            </div>
          }>
          {(() => { const p = calcMenuFinalPrice(viewing, recipes, ingredients); return <>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>{viewing.description}</p>
            <table style={{ width: '100%', fontSize: 13, marginBottom: 16 }}>
              <thead><tr><th>{t('menus.colRecipe')}</th><th>{t('menus.colPortions')}</th><th>{t('menus.colCost')}</th></tr></thead>
              <tbody>{(viewing.recipes || []).map(mr => { const r = recipes.find(x => x.id === mr.recipe_id); return r ? <tr key={mr.id}><td>{r.name}</td><td>{mr.portions}</td><td className="mono accent">{fmt(calcCostPerPortion(r, ingredients) * mr.portions)}</td></tr> : null; })}</tbody>
            </table>
            <div className="summary-box">
              <div className="summary-row"><span>{t('menus.colFoodCost')}</span><span>{fmt(p.cost)}</span></div>
              <div className="summary-row"><span>{t('menus.colMarkup')} ({viewing.markup}%)</span><span>+{fmt(p.selling - p.cost)}</span></div>
              <div className="summary-row"><span>{t('menus.colVat')} ({viewing.vat}%)</span><span>+{fmt(p.vat)}</span></div>
              <div className="summary-row total"><span>{t('menus.pricePerPerson')}</span><span>{fmt(p.final)}</span></div>
            </div>

            {viewing.ai_analysis && (
              <div style={{ marginTop: 16, padding: '14px 16px', background: 'linear-gradient(135deg,#1e1a0f,#2a2414)', border: '1px solid var(--gold)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 18 }}>🤖</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold)' }}>{t('menus.aiAdvisorTitle')}</span>
                  </div>
                  {viewing.ai_analyzed_at && (
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{new Date(viewing.ai_analyzed_at).toLocaleDateString()}</span>
                  )}
                </div>
                <AiText text={viewing.ai_analysis} />
              </div>
            )}
          </>; })()}
        </Modal>
      )}

      {/* AI Advisor result modal (shown right after analysis) */}
      {aiModal && (
        <Modal title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>🤖</span> {t('menus.aiAdvisorTitle')}</span>} onClose={() => setAiModal(null)}
          footer={<button className="btn btn-primary" onClick={() => setAiModal(null)}>{t('common.close')}</button>}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{t('menus.aiAdvisorFor')} </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{aiModal.name}</span>
          </div>
          <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg,#1e1a0f,#2a2414)', border: '1px solid var(--gold)', borderRadius: 12 }}>
            <AiText text={aiModal.analysis} />
          </div>
          {aiModal.analyzed_at && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10, textAlign: 'right' }}>
              {t('menus.aiGeneratedAt')} {new Date(aiModal.analyzed_at).toLocaleString()}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
