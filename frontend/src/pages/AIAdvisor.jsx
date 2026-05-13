import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import { fmt, calcMenuFinalPrice, foodCostPct } from '../lib/calc.js';
import Modal from '../components/Modal.jsx';

function AiText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text2)' }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
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

function RiskBadge({ foodCostPct: fc }) {
  if (fc > 45) return <span className="badge badge-red">High Risk</span>;
  if (fc > 35) return <span className="badge badge-amber">Medium Risk</span>;
  return <span className="badge badge-green">Low Risk</span>;
}

export default function AIAdvisor() {
  const { menus, setMenus, recipes, ingredients } = useApp();
  const { t } = useTranslation();
  const [analyzing, setAnalyzing] = useState(null);
  const [viewModal, setViewModal] = useState(null); // { menu, analysis }
  const [analyzeAll, setAnalyzeAll] = useState(false);

  const menusWithAI = menus.filter(m => !!m.ai_analysis);
  const menusWithoutAI = menus.filter(m => !m.ai_analysis);

  const runAnalysis = async (menu) => {
    setAnalyzing(menu.id);
    try {
      const result = await api.analyzeMenu(menu.id);
      const updated = { ...menu, ai_analysis: result.analysis, ai_analyzed_at: result.analyzed_at };
      setMenus(p => p.map(x => x.id === menu.id ? updated : x));
      setViewModal({ menu: updated, analysis: result.analysis });
    } catch (e) {
      alert('AI Advisor: ' + e.message);
    } finally {
      setAnalyzing(null);
    }
  };

  const runAll = async () => {
    setAnalyzeAll(true);
    for (const menu of menusWithoutAI) {
      setAnalyzing(menu.id);
      try {
        const result = await api.analyzeMenu(menu.id);
        const updated = { ...menu, ai_analysis: result.analysis, ai_analyzed_at: result.analyzed_at };
        setMenus(p => p.map(x => x.id === menu.id ? updated : x));
      } catch (e) {
        console.warn('AI analysis failed for', menu.name, e.message);
      }
    }
    setAnalyzing(null);
    setAnalyzeAll(false);
  };

  const getScore = (fc) => {
    if (fc <= 25) return { score: '9/10', color: 'var(--green)' };
    if (fc <= 32) return { score: '7/10', color: 'var(--green)' };
    if (fc <= 40) return { score: '5/10', color: 'var(--accent)' };
    return { score: '3/10', color: 'var(--red)' };
  };

  return (
    <>
      {/* Full-screen analyzing overlay */}
      {analyzing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: '32px 40px', textAlign: 'center', border: '1px solid var(--bg4)', maxWidth: 360 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{t('menus.aiAnalyzing')}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>{t('menus.aiAnalyzingDesc')}</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1.2s ${i * 0.4}s infinite` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="topbar">
        <div className="topbar-title">{t('aiAdvisor.title')}</div>
        {menusWithoutAI.length > 0 && (
          <button className="btn btn-primary" onClick={runAll} disabled={!!analyzing || analyzeAll}>
            <i className="ti ti-robot"></i> {t('aiAdvisor.analyzeAll')} ({menusWithoutAI.length})
          </button>
        )}
      </div>

      <div className="page-content">
        {/* Stats bar */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('aiAdvisor.analyzed')}</div>
                <div className="stat-value">{menusWithAI.length}</div>
                <div className="stat-meta">{t('aiAdvisor.of', { total: menus.length })}</div>
              </div>
              <div className="stat-icon stat-icon-gold"><i className="ti ti-robot"></i></div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('aiAdvisor.pending')}</div>
                <div className="stat-value">{menusWithoutAI.length}</div>
                <div className="stat-meta">{t('aiAdvisor.notYetAnalyzed')}</div>
              </div>
              <div className="stat-icon stat-icon-amber"><i className="ti ti-clock"></i></div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('aiAdvisor.highRisk')}</div>
                <div className="stat-value" style={{ color: 'var(--red)' }}>
                  {menus.filter(m => {
                    const p = calcMenuFinalPrice(m, recipes, ingredients);
                    return p.selling > 0 && foodCostPct(p.cost, p.selling) > 40;
                  }).length}
                </div>
                <div className="stat-meta">{t('aiAdvisor.menusAbove40')}</div>
              </div>
              <div className="stat-icon stat-icon-red"><i className="ti ti-alert-triangle"></i></div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('aiAdvisor.lowRisk')}</div>
                <div className="stat-value" style={{ color: 'var(--green)' }}>
                  {menus.filter(m => {
                    const p = calcMenuFinalPrice(m, recipes, ingredients);
                    return p.selling > 0 && foodCostPct(p.cost, p.selling) <= 30;
                  }).length}
                </div>
                <div className="stat-meta">{t('aiAdvisor.menusBelow30')}</div>
              </div>
              <div className="stat-icon stat-icon-green"><i className="ti ti-trending-up"></i></div>
            </div>
          </div>
        </div>

        {/* All menus list */}
        {menus.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <i className="ti ti-robot"></i>
              <p>{t('aiAdvisor.noMenus')}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Analyzed menus */}
            {menusWithAI.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <i className="ti ti-circle-check" style={{ color: 'var(--green)', marginRight: 6 }}></i>
                  {t('aiAdvisor.analyzedMenus')} ({menusWithAI.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                  {menusWithAI.map(m => {
                    const p = calcMenuFinalPrice(m, recipes, ingredients);
                    const fc = p.selling > 0 ? foodCostPct(p.cost, p.selling) : 0;
                    const { score, color } = getScore(fc);
                    return (
                      <div key={m.id} className="card" style={{ padding: 18, background: 'linear-gradient(135deg, var(--bg2), var(--bg3))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                            {m.ai_analyzed_at && (
                              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                                <i className="ti ti-clock" style={{ marginRight: 3 }}></i>
                                {new Date(m.ai_analyzed_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color }}>{score}</div>
                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>AI score</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, background: 'var(--bg4)', borderRadius: 6, padding: '3px 8px' }}>
                            {fc.toFixed(1)}% {t('dashboard.foodCost')}
                          </span>
                          <RiskBadge foodCostPct={fc} />
                          <span style={{ fontSize: 11, background: 'var(--bg4)', borderRadius: 6, padding: '3px 8px' }}>
                            {fmt(p.final)} {t('common.perPerson')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12 }}
                            onClick={() => setViewModal({ menu: m, analysis: m.ai_analysis })}>
                            <i className="ti ti-eye"></i> {t('aiAdvisor.viewAnalysis')}
                          </button>
                          <button className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--accent)', borderColor: 'var(--accent)' }}
                            onClick={() => runAnalysis(m)} disabled={analyzing === m.id}>
                            <i className={`ti ${analyzing === m.id ? 'ti-loader-2' : 'ti-refresh'}`}></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pending menus */}
            {menusWithoutAI.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <i className="ti ti-clock" style={{ color: 'var(--text3)', marginRight: 6 }}></i>
                  {t('aiAdvisor.pendingAnalysis')} ({menusWithoutAI.length})
                </div>
                <div className="card">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('menus.colMenu')}</th>
                        <th>{t('menus.colFoodCost')}</th>
                        <th>{t('reports.foodCostPct')}</th>
                        <th>{t('reports.risk')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {menusWithoutAI.map(m => {
                        const p = calcMenuFinalPrice(m, recipes, ingredients);
                        const fc = p.selling > 0 ? foodCostPct(p.cost, p.selling) : 0;
                        return (
                          <tr key={m.id}>
                            <td style={{ fontWeight: 500 }}>{m.name}</td>
                            <td className="mono">{fmt(p.cost)}</td>
                            <td><span className={`badge ${fc > 40 ? 'badge-red' : fc > 30 ? 'badge-amber' : 'badge-green'}`}>{fc.toFixed(1)}%</span></td>
                            <td><RiskBadge foodCostPct={fc} /></td>
                            <td>
                              <button className="btn btn-ghost" style={{ fontSize: 12 }}
                                onClick={() => runAnalysis(m)} disabled={analyzing === m.id}>
                                <i className={`ti ${analyzing === m.id ? 'ti-loader-2' : 'ti-robot'}`}></i> {t('menus.aiAdvisorBtn')}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Analysis view modal */}
      {viewModal && (
        <Modal
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              🤖 {t('menus.aiAdvisorTitle')} — {viewModal.menu.name}
            </span>
          }
          onClose={() => setViewModal(null)}
          footer={
            <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                onClick={() => { runAnalysis(viewModal.menu); setViewModal(null); }}>
                <i className="ti ti-refresh"></i> {t('aiAdvisor.reAnalyze')}
              </button>
              <button className="btn btn-primary" onClick={() => setViewModal(null)}>{t('common.close')}</button>
            </div>
          }
        >
          {viewModal.menu.ai_analyzed_at && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16 }}>
              <i className="ti ti-clock" style={{ marginRight: 4 }}></i>
              {t('menus.aiGeneratedAt')} {new Date(viewModal.menu.ai_analyzed_at).toLocaleString()}
            </div>
          )}
          <div style={{ padding: '16px', background: 'var(--bg3)', borderRadius: 12, border: '1px solid var(--bg4)' }}>
            <AiText text={viewModal.analysis} />
          </div>
        </Modal>
      )}
    </>
  );
}
