import { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api.js';

const LANG_FLAG = { en: '🇬🇧', fr: '🇫🇷', ro: '🇷🇴', hu: '🇭🇺' };

export default function AdminResearch() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [filterLang, setFilterLang] = useState('');
  const [filterReviewed, setFilterReviewed] = useState('all'); // all / unreviewed / reviewed
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getResearchResponses().then(setRows).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (filterLang && r.language !== filterLang) return false;
      if (filterReviewed === 'unreviewed' && r.reviewed) return false;
      if (filterReviewed === 'reviewed' && !r.reviewed) return false;
      if (search) {
        const s = search.toLowerCase();
        const hay = [r.name, r.email, r.country, r.city, r.business_type, r.role, r.biggest_frustration, r.magic_wand]
          .filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [rows, filterLang, filterReviewed, search]);

  const stats = useMemo(() => {
    const byLang = {};
    const byBusiness = {};
    const byBudget = {};
    let totalConfidence = 0;
    let confidenceCount = 0;
    let redeemed = 0;
    let unreviewed = 0;

    rows.forEach(r => {
      byLang[r.language] = (byLang[r.language] || 0) + 1;
      if (r.business_type) byBusiness[r.business_type] = (byBusiness[r.business_type] || 0) + 1;
      if (r.monthly_budget) byBudget[r.monthly_budget] = (byBudget[r.monthly_budget] || 0) + 1;
      if (r.pricing_confidence != null) {
        totalConfidence += r.pricing_confidence;
        confidenceCount++;
      }
      if (r.redeemed_at) redeemed++;
      if (!r.reviewed) unreviewed++;
    });

    return {
      total: rows.length,
      redeemed,
      unreviewed,
      avgConfidence: confidenceCount ? (totalConfidence / confidenceCount).toFixed(1) : '—',
      byLang,
      byBusiness,
      byBudget,
    };
  }, [rows]);

  const toggleReviewed = async (id, current) => {
    await api.markResearchReviewed(id, !current);
    setRows(prev => prev.map(r => r.id === id ? { ...r, reviewed: !current ? 1 : 0 } : r));
  };

  const remove = async (id) => {
    if (!confirm('Delete this response permanently?')) return;
    await api.deleteResearchResponse(id);
    setRows(prev => prev.filter(r => r.id !== id));
    if (openId === id) setOpenId(null);
  };

  const openRow = rows.find(r => r.id === openId);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Customer Research</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a className="btn btn-primary" href="/api/admin/research/export/csv">
            <i className="ti ti-download"></i> Export CSV
          </a>
        </div>
      </div>

      <div className="page-content">
        {/* KPI cards */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Total responses</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unreviewed</div>
            <div className="stat-value accent">{stats.unreviewed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Codes redeemed</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.redeemed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg pricing confidence</div>
            <div className="stat-value">{stats.avgConfidence}<span style={{ fontSize: 14, color: 'var(--muted)' }}> / 10</span></div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 16, padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search name, email, country, frustration…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}
            />
            <select value={filterLang} onChange={e => setFilterLang(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}>
              <option value="">All languages</option>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="ro">🇷🇴 Română</option>
              <option value="hu">🇭🇺 Magyar</option>
            </select>
            <select value={filterReviewed} onChange={e => setFilterReviewed(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}>
              <option value="all">All responses</option>
              <option value="unreviewed">Unreviewed only</option>
              <option value="reviewed">Reviewed only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name / Email</th>
                <th>Country</th>
                <th>Business</th>
                <th>Budget</th>
                <th>Code</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8}><div className="empty-state"><p>Loading…</p></div></td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={8}><div className="empty-state">
                <i className="ti ti-message-question"></i>
                <p>No responses yet. Share <a href="/research" target="_blank" rel="noreferrer">app4chef.com/research</a> with chefs.</p>
              </div></td></tr>}
              {filtered.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer', background: !r.reviewed ? 'rgba(212,168,83,0.04)' : 'transparent' }}>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {LANG_FLAG[r.language] || ''} {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td onClick={() => setOpenId(r.id)}>
                    <div style={{ fontWeight: 600 }}>{r.name || <em style={{ color: 'var(--text3)' }}>—</em>}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{r.email}</div>
                  </td>
                  <td onClick={() => setOpenId(r.id)} style={{ fontSize: 13 }}>
                    {[r.city, r.country].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td onClick={() => setOpenId(r.id)} style={{ fontSize: 13 }}>{r.business_type || '—'}</td>
                  <td onClick={() => setOpenId(r.id)} style={{ fontSize: 13 }}>{r.monthly_budget || '—'}</td>
                  <td onClick={() => setOpenId(r.id)} style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {r.trial_code}
                    {r.redeemed_at && <span className="badge badge-green" style={{ marginLeft: 4, fontSize: 9 }}>USED</span>}
                  </td>
                  <td>
                    {r.reviewed
                      ? <span className="badge badge-gray">reviewed</span>
                      : <span className="badge badge-amber">new</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => setOpenId(r.id)}>
                        <i className="ti ti-eye"></i> View
                      </button>
                      <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => toggleReviewed(r.id, r.reviewed)}>
                        {r.reviewed ? 'Unmark' : 'Mark reviewed'}
                      </button>
                      <button className="icon-btn danger" onClick={() => remove(r.id)}>
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      {openRow && (
        <div
          onClick={() => setOpenId(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(26,25,22,0.45)', zIndex: 100,
            display: 'flex', justifyContent: 'flex-end', overflow: 'auto',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 720, background: '#fff', minHeight: '100vh',
              padding: 32, boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                  {LANG_FLAG[openRow.language]} {new Date(openRow.created_at).toLocaleString()}
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                  {openRow.name || openRow.email}
                </h2>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                  {openRow.email} · {[openRow.city, openRow.country].filter(Boolean).join(', ')}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setOpenId(null)} style={{ fontSize: 12 }}>
                <i className="ti ti-x"></i> Close
              </button>
            </div>

            <DetailSection title="About them" rows={[
              ['Role', openRow.role],
              ['Business type', openRow.business_type],
              ['Team size', openRow.team_size],
              ['Events / covers per week', openRow.events_per_week],
              ['Average ticket', openRow.avg_ticket],
              ['Years of experience', openRow.years_experience],
            ]} />

            <DetailSection title="How they work today" rows={[
              ['Recipe costing method', openRow.recipe_costing_method, true],
              ['Quote building method', openRow.quote_building_method, true],
              ['Tools used', openRow.tools_used],
              ['Hours per week on costing', openRow.hours_per_week],
              ['Pricing confidence (1–10)', openRow.pricing_confidence],
            ]} />

            <DetailSection title="⭐ The real pain (highest signal)" highlight rows={[
              ['Biggest frustration', openRow.biggest_frustration, true],
              ['Last mistake', openRow.last_mistake, true],
              ['Magic wand', openRow.magic_wand, true],
              ['What\'s stopping them', openRow.whats_stopping, true],
            ]} />

            <DetailSection title="Buying intent" rows={[
              ['Tried software', openRow.tried_software],
              ['Stopped because', openRow.stopped_reason],
              ['Must-have feature for €50/mo', openRow.must_have_feature, true],
              ['Monthly budget', openRow.monthly_budget],
              ['Decision maker', openRow.decision_maker],
            ]} />

            <DetailSection title="Follow-up" rows={[
              ['Allow follow-up?', openRow.allow_followup ? '✓ Yes' : '✗ No'],
              ['Beta tester interest', openRow.beta_tester],
              ['Trial code', openRow.trial_code],
              ['Redeemed at', openRow.redeemed_at ? new Date(openRow.redeemed_at).toLocaleString() : 'Not yet'],
            ]} />

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={() => toggleReviewed(openRow.id, openRow.reviewed)}>
                {openRow.reviewed ? 'Unmark as reviewed' : '✓ Mark as reviewed'}
              </button>
              {openRow.allow_followup ? (
                <a className="btn btn-ghost" href={`mailto:${openRow.email}?subject=Following%20up%20on%20your%20App4Chef%20feedback`}>
                  <i className="ti ti-mail"></i> Email follow-up
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailSection({ title, rows, highlight }) {
  return (
    <div style={{
      marginTop: 20, padding: 18, borderRadius: 8,
      background: highlight ? 'rgba(212,168,83,0.06)' : '#fafaf7',
      border: highlight ? '1px solid rgba(212,168,83,0.3)' : '1px solid var(--border)',
    }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(([label, value, openText]) => (
          <div key={label}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
              {label}
            </div>
            <div style={{
              fontSize: openText ? 14 : 13.5,
              color: value ? 'var(--text)' : 'var(--text3)',
              fontStyle: value ? 'normal' : 'italic',
              whiteSpace: openText ? 'pre-wrap' : 'normal',
              lineHeight: 1.5,
            }}>
              {value || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
