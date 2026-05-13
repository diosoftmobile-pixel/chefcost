import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import { fmt, calcEventProfitBreakdown, calcEventTotal } from '../lib/calc.js';
import { exportEventPDF } from '../lib/pdf.js';

const STATUS_BADGE = {
  'Draft': 'badge-gray', 'Sent Offer': 'badge-blue',
  'Approved': 'badge-green', 'Cancelled': 'badge-red', 'Completed': 'badge-amber',
};

export default function Quotes() {
  const { events, setEvents, menus, recipes, ingredients } = useApp();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [marking, setMarking] = useState(null);
  const [duplicating, setDuplicating] = useState(null);

  const STATUSES = ['Draft', 'Sent Offer', 'Approved', 'Cancelled', 'Completed'];

  const filtered = events.filter(e =>
    (e.name.toLowerCase().includes(search.toLowerCase()) ||
     (e.client_name || '').toLowerCase().includes(search.toLowerCase()) ||
     (e.quote_number || '').toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || e.status === filterStatus)
  ).sort((a, b) => {
    // Sort by date descending
    if (!a.event_date) return 1;
    if (!b.event_date) return -1;
    return b.event_date.localeCompare(a.event_date);
  });

  const markSent = async (id) => {
    setMarking(id);
    try {
      await api.markEventSent(id);
      setEvents(p => p.map(x => x.id === id ? { ...x, status: 'Sent Offer' } : x));
    } catch (e) { alert(e.message); }
    finally { setMarking(null); }
  };

  const duplicate = async (id) => {
    setDuplicating(id);
    try {
      const copy = await api.duplicateEvent(id);
      setEvents(p => [...p, copy]);
    } catch (e) { alert(e.message); }
    finally { setDuplicating(null); }
  };

  // Stats
  const totalQuotes = events.length;
  const sentQuotes = events.filter(e => e.status === 'Sent Offer').length;
  const approvedQuotes = events.filter(e => e.status === 'Approved').length;
  const approvedRevenue = events
    .filter(e => e.status === 'Approved')
    .reduce((s, e) => s + calcEventTotal(e, menus, recipes, ingredients), 0);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('quotes.title')}</div>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>
          <i className="ti ti-info-circle" style={{ marginRight: 6 }}></i>
          {t('quotes.createInEvents')}
        </div>
      </div>

      <div className="page-content">
        {/* KPIs */}
        <div className="grid-4">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('quotes.totalQuotes')}</div>
                <div className="stat-value">{totalQuotes}</div>
              </div>
              <div className="stat-icon stat-icon-blue"><i className="ti ti-file-invoice"></i></div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('quotes.sent')}</div>
                <div className="stat-value">{sentQuotes}</div>
                <div className="stat-meta">{t('quotes.awaitingReply')}</div>
              </div>
              <div className="stat-icon stat-icon-amber"><i className="ti ti-send"></i></div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('quotes.approved')}</div>
                <div className="stat-value">{approvedQuotes}</div>
                <div className="stat-meta">{t('quotes.confirmed')}</div>
              </div>
              <div className="stat-icon stat-icon-green"><i className="ti ti-circle-check"></i></div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('quotes.approvedRevenue')}</div>
                <div className="stat-value accent">{fmt(approvedRevenue)}</div>
              </div>
              <div className="stat-icon stat-icon-gold"><i className="ti ti-currency-euro"></i></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <i className="ti ti-search"></i>
            <input
              className="form-control"
              placeholder={t('quotes.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 34 }}
            />
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
                <th>{t('quotes.colQuote')}</th>
                <th>{t('events.colClient')}</th>
                <th>{t('events.colDate')}</th>
                <th>{t('events.colGuests')}</th>
                <th>{t('events.colTotalValue')}</th>
                <th>{t('events.colProfit')}</th>
                <th>{t('events.colStatus')}</th>
                <th>{t('quotes.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <i className="ti ti-file-invoice"></i>
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
                      {e.quote_number
                        ? <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', marginTop: 2 }}>{e.quote_number}</div>
                        : <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>—</div>
                      }
                    </td>
                    <td>
                      <div>{e.client_name || <span className="text3">—</span>}</div>
                      {e.client_email && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.client_email}</div>}
                    </td>
                    <td>{e.event_date || <span className="text3">—</span>}</td>
                    <td>{e.guest_count}</td>
                    <td className="mono accent">{fmt(breakdown.foodRevenue)}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: breakdown.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                        {breakdown.profit >= 0 ? '+' : ''}{fmt(breakdown.profit)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[e.status] || 'badge-gray'}`}>
                        {t(`events.statuses.${e.status}`, e.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {/* Export PDF */}
                        <button
                          className="icon-btn pdf-btn"
                          title={t('events.exportPdf')}
                          onClick={() => exportEventPDF(e, menus, recipes, ingredients)}
                        >
                          <i className="ti ti-file-text"></i>
                        </button>

                        {/* Mark as Sent (only if Draft) */}
                        {e.status === 'Draft' && (
                          <button
                            className="icon-btn"
                            title={t('events.markSent')}
                            disabled={marking === e.id}
                            onClick={() => markSent(e.id)}
                          >
                            <i className={`ti ${marking === e.id ? 'ti-loader-2' : 'ti-send'}`}></i>
                          </button>
                        )}

                        {/* Duplicate */}
                        <button
                          className="icon-btn"
                          title={t('events.duplicate')}
                          disabled={duplicating === e.id}
                          onClick={() => duplicate(e.id)}
                        >
                          <i className={`ti ${duplicating === e.id ? 'ti-loader-2' : 'ti-copy'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tip card */}
        <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--bg3)', borderRadius: 12, border: '1px solid var(--bg4)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <i className="ti ti-bulb" style={{ fontSize: 18, color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}></i>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t('quotes.tipTitle')}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>{t('quotes.tipDesc')}</div>
          </div>
        </div>
      </div>
    </>
  );
}
