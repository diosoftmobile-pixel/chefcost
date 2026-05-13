import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';
import { api } from '../lib/api.js';
import {
  fmt, calcMenuFinalPrice, calcCostPerPortion, calcEventProfitBreakdown, foodCostPct,
} from '../lib/calc.js';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--bg4)', borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.stroke || p.fill || 'var(--accent)' }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? fmt(p.value) : `${p.value?.toFixed?.(1) ?? p.value}%`}
        </div>
      ))}
    </div>
  );
}

function exportCSV(headers, rows, filename) {
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { menus, recipes, ingredients, events } = useApp();
  const { t } = useTranslation();
  const [tab, setTab] = useState('menus');
  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [menuRep, eventRep, ingRep, monthly] = await Promise.all([
          api.getMenuReport(),
          api.getEventReport(),
          api.getIngredientReport(),
          api.getMonthlyReport(),
        ]);
        setServerData({ menuRep, eventRep, ingRep, monthly });
      } catch (e) {
        console.warn('Reports API:', e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Menu Profitability (client-side) ───
  const menuData = menus.map(m => {
    const p = calcMenuFinalPrice(m, recipes, ingredients);
    const fc = p.selling > 0 ? foodCostPct(p.cost, p.selling) : 0;
    const profitPerGuest = p.selling - p.cost;
    const risk = fc > 40 ? 'High' : fc > 30 ? 'Medium' : 'Low';
    return { name: m.name, cost: p.cost, selling: p.selling, final: p.final, foodCostPct: fc, profitPerGuest, risk };
  });

  // ─── Event Profitability (client-side) ───
  const eventData = events.map(e => {
    const b = calcEventProfitBreakdown(e, menus, recipes, ingredients);
    return { name: e.name, date: e.event_date, status: e.status, ...b };
  });

  // ─── Monthly Revenue ───
  const monthlyMap = {};
  events.forEach(e => {
    if (!e.event_date) return;
    const month = e.event_date.slice(0, 7);
    const b = calcEventProfitBreakdown(e, menus, recipes, ingredients);
    if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, profit: 0 };
    monthlyMap[month].revenue += b.foodRevenue;
    monthlyMap[month].profit += b.profit;
  });
  const monthlyData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  // ─── Ingredient Cost ───
  const ingData = ingredients.map(ing => {
    const usedIn = recipes.filter(r => r.ingredients?.some(ri => ri.ingredient_id === ing.id)).length;
    const unitCost = ing.purchase_price / ing.purchase_qty;
    const yld = parseFloat(ing.yield_pct) || 100;
    const usableCostVal = unitCost / (yld / 100);
    return { name: ing.name, category: ing.category, unitCost, usableCost: usableCostVal, yield_pct: yld, usedIn };
  }).sort((a, b) => b.usableCost - a.usableCost);

  const TABS = [
    { id: 'menus', label: t('reports.tabMenus'), icon: 'ti-list' },
    { id: 'events', label: t('reports.tabEvents'), icon: 'ti-calendar-event' },
    { id: 'ingredients', label: t('reports.tabIngredients'), icon: 'ti-basket' },
    { id: 'monthly', label: t('reports.tabMonthly'), icon: 'ti-chart-bar' },
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('reports.title')}</div>
        {loading && <span style={{ fontSize: 12, color: 'var(--text3)' }}><i className="ti ti-loader-2"></i> {t('common.loading')}</span>}
      </div>

      <div className="page-content">
        <div className="tabs" style={{ marginBottom: 24 }}>
          {TABS.map(tb => (
            <button key={tb.id} className={`tab${tab === tb.id ? ' active' : ''}`} onClick={() => setTab(tb.id)}>
              <i className={`ti ${tb.icon}`}></i> {tb.label}
            </button>
          ))}
        </div>

        {/* ─── Menu Profitability ─── */}
        {tab === 'menus' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-ghost" onClick={() => exportCSV(
                ['Menu', 'Food Cost', 'Selling Price', 'Final Price', 'Food Cost %', 'Profit/Guest', 'Risk'],
                menuData.map(m => [m.name, m.cost.toFixed(2), m.selling.toFixed(2), m.final.toFixed(2), m.foodCostPct.toFixed(1)+'%', m.profitPerGuest.toFixed(2), m.risk]),
                'menu-profitability.csv'
              )}>
                <i className="ti ti-download"></i> {t('common.exportCsv')}
              </button>
            </div>
            {menuData.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">{t('reports.foodCostByMenu')}</span></div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={menuData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="foodCostPct" name={t('reports.foodCostPct')} radius={[6, 6, 0, 0]}>
                        {menuData.map((m, i) => (
                          <Cell key={i} fill={m.foodCostPct > 40 ? 'var(--red)' : m.foodCostPct > 30 ? 'var(--accent)' : 'var(--green)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>{t('menus.colMenu')}</th>
                    <th>{t('reports.foodCost')}</th>
                    <th>{t('reports.sellingPrice')}</th>
                    <th>{t('reports.foodCostPct')}</th>
                    <th>{t('reports.profitPerGuest')}</th>
                    <th>{t('reports.risk')}</th>
                  </tr>
                </thead>
                <tbody>
                  {menuData.length === 0 && (
                    <tr><td colSpan={6}><div className="empty-state"><i className="ti ti-list"></i><p>{t('menus.none')}</p></div></td></tr>
                  )}
                  {menuData.map((m, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{m.name}</td>
                      <td className="mono">{fmt(m.cost)}</td>
                      <td className="mono">{fmt(m.final)}</td>
                      <td>
                        <span className={`badge ${m.foodCostPct > 40 ? 'badge-red' : m.foodCostPct > 30 ? 'badge-amber' : 'badge-green'}`}>
                          {m.foodCostPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="mono accent">{fmt(m.profitPerGuest)}</td>
                      <td>
                        <span className={`badge ${m.risk === 'High' ? 'badge-red' : m.risk === 'Medium' ? 'badge-amber' : 'badge-green'}`}>
                          {t(`reports.risk${m.risk}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ─── Event Profitability ─── */}
        {tab === 'events' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-ghost" onClick={() => exportCSV(
                ['Event', 'Date', 'Status', 'Food Revenue', 'Food Cost', 'Op Costs', 'Profit', 'Margin %'],
                eventData.map(e => [e.name, e.date, e.status, e.foodRevenue.toFixed(2), e.foodCost.toFixed(2), e.opCosts.toFixed(2), e.profit.toFixed(2), e.margin.toFixed(1)+'%']),
                'event-profitability.csv'
              )}>
                <i className="ti ti-download"></i> {t('common.exportCsv')}
              </button>
            </div>
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>{t('events.colEvent')}</th>
                    <th>{t('events.colDate')}</th>
                    <th>{t('events.colStatus')}</th>
                    <th>{t('reports.foodRevenue')}</th>
                    <th>{t('reports.opCosts')}</th>
                    <th>{t('reports.totalProfit')}</th>
                    <th>{t('reports.marginPct')}</th>
                  </tr>
                </thead>
                <tbody>
                  {eventData.length === 0 && (
                    <tr><td colSpan={7}><div className="empty-state"><i className="ti ti-calendar-event"></i><p>{t('events.none')}</p></div></td></tr>
                  )}
                  {eventData.map((e, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{e.name}</td>
                      <td>{e.date}</td>
                      <td><span className={`badge badge-gray`}>{e.status}</span></td>
                      <td className="mono">{fmt(e.foodRevenue)}</td>
                      <td className="mono">{e.opCosts > 0 ? fmt(e.opCosts) : <span className="text3">—</span>}</td>
                      <td className="mono" style={{ color: e.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                        {e.profit >= 0 ? '+' : ''}{fmt(e.profit)}
                      </td>
                      <td>
                        <span className={`badge ${e.margin >= 25 ? 'badge-green' : e.margin >= 10 ? 'badge-amber' : 'badge-red'}`}>
                          {e.margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ─── Ingredient Costs ─── */}
        {tab === 'ingredients' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-ghost" onClick={() => exportCSV(
                ['Ingredient', 'Category', 'Unit Cost', 'Yield %', 'Usable Cost', 'Used In Recipes'],
                ingData.map(i => [i.name, i.category, i.unitCost.toFixed(2), i.yield_pct+'%', i.usableCost.toFixed(2), i.usedIn]),
                'ingredient-costs.csv'
              )}>
                <i className="ti ti-download"></i> {t('common.exportCsv')}
              </button>
            </div>
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>{t('ingredients.colName')}</th>
                    <th>{t('ingredients.colCategory')}</th>
                    <th>{t('reports.unitCost')}</th>
                    <th>{t('ingredients.colYield')}</th>
                    <th>{t('reports.usableCost')}</th>
                    <th>{t('reports.usedInRecipes')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ingData.length === 0 && (
                    <tr><td colSpan={6}><div className="empty-state"><i className="ti ti-basket"></i><p>{t('ingredients.none')}</p></div></td></tr>
                  )}
                  {ingData.map((i, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{i.name}</td>
                      <td><span className="badge badge-gray">{i.category}</span></td>
                      <td className="mono">{fmt(i.unitCost)}</td>
                      <td>
                        {i.yield_pct < 100
                          ? <span className="badge badge-amber">{i.yield_pct}%</span>
                          : <span style={{ color: 'var(--text3)' }}>100%</span>
                        }
                      </td>
                      <td className="mono accent">{fmt(i.usableCost)}</td>
                      <td>{i.usedIn > 0 ? <span className="badge badge-blue">{i.usedIn}</span> : <span className="text3">0</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ─── Monthly Revenue ─── */}
        {tab === 'monthly' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button className="btn btn-ghost" onClick={() => exportCSV(
                ['Month', 'Revenue', 'Profit'],
                monthlyData.map(m => [m.month, m.revenue.toFixed(2), m.profit.toFixed(2)]),
                'monthly-revenue.csv'
              )}>
                <i className="ti ti-download"></i> {t('common.exportCsv')}
              </button>
            </div>
            {monthlyData.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <i className="ti ti-chart-bar"></i>
                  <p>{t('dashboard.noChartData')}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="card-header"><span className="card-title">{t('reports.monthlyRevenue')}</span></div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bg4)" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" name={t('reports.revenue')} fill="var(--accent)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" name={t('reports.profit')} fill="var(--green)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('reports.month')}</th>
                        <th>{t('reports.revenue')}</th>
                        <th>{t('reports.profit')}</th>
                        <th>{t('reports.marginPct')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...monthlyData].reverse().map((m, i) => {
                        const margin = m.revenue > 0 ? (m.profit / m.revenue) * 100 : 0;
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{m.month}</td>
                            <td className="mono accent">{fmt(m.revenue)}</td>
                            <td className="mono" style={{ color: m.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                              {m.profit >= 0 ? '+' : ''}{fmt(m.profit)}
                            </td>
                            <td>
                              <span className={`badge ${margin >= 25 ? 'badge-green' : margin >= 10 ? 'badge-amber' : 'badge-red'}`}>
                                {margin.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
