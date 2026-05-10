import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';
import { fmt, calcRecipeCost, calcCostPerPortion, calcEventTotal, calcMenuFinalPrice } from '../lib/calc.js';

const STATUS_BADGE = { 'Draft':'badge-gray','Sent Offer':'badge-blue','Approved':'badge-green','Cancelled':'badge-red','Completed':'badge-amber' };

export default function Dashboard() {
  const { ingredients, recipes, menus, events } = useApp();
  const { t } = useTranslation();
  const totalRevenue = events.reduce((s, e) => s + calcEventTotal(e, menus, recipes, ingredients), 0);
  const upcoming = events.filter(e => e.status !== 'Cancelled' && e.status !== 'Completed').length;
  const approved = events.filter(e => e.status === 'Approved').length;
  const sortedRecipes = [...recipes].sort((a, b) => calcRecipeCost(b, ingredients) - calcRecipeCost(a, ingredients)).slice(0, 5);
  const maxCost = sortedRecipes.length ? calcRecipeCost(sortedRecipes[0], ingredients) : 1;
  const recentEvents = [...events].sort((a, b) => new Date(b.event_date) - new Date(a.event_date)).slice(0, 5);

  return (
    <>
      <div className="topbar"><div className="topbar-title">{t('dashboard.title')}</div></div>
      <div className="page-content">
        <div className="grid-4">
          <div className="stat-card"><div className="stat-label">{t('dashboard.totalEvents')}</div><div className="stat-value">{events.length}</div><div className="stat-meta">{upcoming} {t('dashboard.upcoming')}</div></div>
          <div className="stat-card"><div className="stat-label">{t('dashboard.pipelineValue')}</div><div className="stat-value accent">{fmt(totalRevenue)}</div><div className="stat-meta">{t('dashboard.allActiveEvents')}</div></div>
          <div className="stat-card"><div className="stat-label">{t('dashboard.recipes')}</div><div className="stat-value">{recipes.length}</div><div className="stat-meta">{ingredients.length} {t('dashboard.ingredients')}</div></div>
          <div className="stat-card"><div className="stat-label">{t('dashboard.approved')}</div><div className="stat-value green">{approved}</div><div className="stat-meta">{t('dashboard.confirmedBookings')}</div></div>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><i className="ti ti-notebook accent"></i><span className="card-title">{t('dashboard.recipeCostRanking')}</span></div>
            <div className="card-body">
              {sortedRecipes.length === 0 && <div className="empty-state"><i className="ti ti-notebook"></i><p>{t('dashboard.noRecipes')}</p></div>}
              {sortedRecipes.map(r => {
                const cost = calcRecipeCost(r, ingredients);
                const pct = Math.round((cost / maxCost) * 100);
                return <div key={r.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{r.name}</span>
                    <span className="mono accent" style={{ fontSize: 12 }}>{fmt(cost)}</span>
                  </div>
                  <div className="cost-bar"><div className="cost-bar-fill" style={{ width: pct + '%' }}></div></div>
                  <div className="text3" style={{ fontSize: 11, marginTop: 3 }}>{fmt(calcCostPerPortion(r, ingredients))}{t('dashboard.perPortion')} · {r.portions} {t('common.portions')}</div>
                </div>;
              })}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><i className="ti ti-calendar-event accent"></i><span className="card-title">{t('dashboard.upcomingEvents')}</span></div>
            <div className="card-body">
              {recentEvents.length === 0 && <div className="empty-state"><i className="ti ti-calendar-event"></i><p>{t('dashboard.noEvents')}</p></div>}
              {recentEvents.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{e.name}</div>
                    <div className="text3" style={{ fontSize: 11 }}>{e.event_date} · {e.guest_count} {t('common.guests')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono accent" style={{ fontSize: 13, marginBottom: 4 }}>{fmt(calcEventTotal(e, menus, recipes, ingredients))}</div>
                    <span className={`badge ${STATUS_BADGE[e.status] || 'badge-gray'}`}>{t(`events.statuses.${e.status}`, e.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
