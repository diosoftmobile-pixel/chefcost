import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../hooks/useApp.jsx';
import { ALLERGENS, parseAllergens, getRecipeAllergens, getMenuAllergens } from '../lib/allergens.js';

export default function Allergens() {
  const { ingredients, recipes, menus } = useApp();
  const { t } = useTranslation();
  const [view, setView] = useState('overview'); // 'overview' | 'ingredients' | 'recipes' | 'menus'
  const [search, setSearch] = useState('');

  // Build allergen stats
  const stats = ALLERGENS.map(a => {
    const ingCount = ingredients.filter(i => parseAllergens(i.allergens).includes(a.key)).length;
    const recCount = recipes.filter(r => getRecipeAllergens(r, ingredients).includes(a.key)).length;
    const menuCount = menus.filter(m => getMenuAllergens(m, recipes, ingredients).includes(a.key)).length;
    return { ...a, ingCount, recCount, menuCount };
  });

  const activeAllergens = stats.filter(a => a.ingCount > 0);

  const exportCSV = () => {
    const rows = [['Allergen', 'Ingredients', 'Recipes', 'Menus']];
    stats.forEach(a => rows.push([a.label, a.ingCount, a.recCount, a.menuCount]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'allergen-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{t('allergens.title')}</div>
        <button className="btn btn-ghost" onClick={exportCSV}>
          <i className="ti ti-download"></i> {t('common.exportCsv')}
        </button>
      </div>

      <div className="page-content">
        {/* Summary KPIs */}
        <div className="grid-4">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('allergens.activeAllergens')}</div>
                <div className="stat-value">{activeAllergens.length}</div>
                <div className="stat-meta">{t('allergens.of14')}</div>
              </div>
              <div className="stat-icon stat-icon-amber"><i className="ti ti-shield-check"></i></div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('allergens.ingredientsAffected')}</div>
                <div className="stat-value">{ingredients.filter(i => parseAllergens(i.allergens).length > 0).length}</div>
                <div className="stat-meta">{t('allergens.ofTotal', { total: ingredients.length })}</div>
              </div>
              <div className="stat-icon stat-icon-blue"><i className="ti ti-basket"></i></div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('allergens.recipesAffected')}</div>
                <div className="stat-value">{recipes.filter(r => getRecipeAllergens(r, ingredients).length > 0).length}</div>
                <div className="stat-meta">{t('allergens.ofTotal', { total: recipes.length })}</div>
              </div>
              <div className="stat-icon stat-icon-gold"><i className="ti ti-notebook"></i></div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{t('allergens.menusAffected')}</div>
                <div className="stat-value">{menus.filter(m => getMenuAllergens(m, recipes, ingredients).length > 0).length}</div>
                <div className="stat-meta">{t('allergens.ofTotal', { total: menus.length })}</div>
              </div>
              <div className="stat-icon stat-icon-green"><i className="ti ti-list"></i></div>
            </div>
          </div>
        </div>

        {/* View tabs */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          <button className={`tab${view === 'overview' ? ' active' : ''}`} onClick={() => setView('overview')}>
            <i className="ti ti-layout-grid"></i> {t('allergens.viewOverview')}
          </button>
          <button className={`tab${view === 'ingredients' ? ' active' : ''}`} onClick={() => setView('ingredients')}>
            <i className="ti ti-basket"></i> {t('allergens.viewIngredients')}
          </button>
          <button className={`tab${view === 'recipes' ? ' active' : ''}`} onClick={() => setView('recipes')}>
            <i className="ti ti-notebook"></i> {t('allergens.viewRecipes')}
          </button>
          <button className={`tab${view === 'menus' ? ' active' : ''}`} onClick={() => setView('menus')}>
            <i className="ti ti-list"></i> {t('allergens.viewMenus')}
          </button>
        </div>

        {/* Search */}
        <div className="search-wrap" style={{ marginBottom: 20, maxWidth: 360 }}>
          <i className="ti ti-search"></i>
          <input className="form-control" placeholder={t('common.search')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>

        {/* Overview: allergen cards grid */}
        {view === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {stats
              .filter(a => !search || a.label.toLowerCase().includes(search.toLowerCase()))
              .map(a => (
                <div key={a.key} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>#{a.num}</div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{a.label}</div>
                    </div>
                    {a.ingCount > 0
                      ? <span className="badge badge-red">{t('allergens.present')}</span>
                      : <span className="badge badge-green">{t('allergens.clear')}</span>
                    }
                  </div>
                  {a.ingCount > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 11, background: 'var(--bg3)', borderRadius: 6, padding: '3px 8px' }}>
                        <i className="ti ti-basket" style={{ marginRight: 3, fontSize: 10 }}></i>
                        {a.ingCount}
                      </div>
                      <div style={{ fontSize: 11, background: 'var(--bg3)', borderRadius: 6, padding: '3px 8px' }}>
                        <i className="ti ti-notebook" style={{ marginRight: 3, fontSize: 10 }}></i>
                        {a.recCount}
                      </div>
                      <div style={{ fontSize: 11, background: 'var(--bg3)', borderRadius: 6, padding: '3px 8px' }}>
                        <i className="ti ti-list" style={{ marginRight: 3, fontSize: 10 }}></i>
                        {a.menuCount}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* By Ingredient */}
        {view === 'ingredients' && (
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>{t('ingredients.colName')}</th>
                  <th>{t('ingredients.colCategory')}</th>
                  <th>{t('allergens.presentAllergens')}</th>
                </tr>
              </thead>
              <tbody>
                {ingredients
                  .filter(i => {
                    const ings = parseAllergens(i.allergens);
                    if (search) return i.name.toLowerCase().includes(search.toLowerCase()) && ings.length > 0;
                    return ings.length > 0;
                  })
                  .map(i => {
                    const ings = parseAllergens(i.allergens);
                    return (
                      <tr key={i.id}>
                        <td style={{ fontWeight: 500 }}>{i.name}</td>
                        <td><span className="badge badge-gray">{i.category}</span></td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {ings.map(key => {
                              const a = ALLERGENS.find(x => x.key === key);
                              return a ? <span key={key} className="allergen-badge">{a.num}. {a.label}</span> : null;
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {ingredients.filter(i => parseAllergens(i.allergens).length > 0).length === 0 && (
                  <tr><td colSpan={3}>
                    <div className="empty-state">
                      <i className="ti ti-shield-check"></i>
                      <p>{t('allergens.noAllergenIngredients')}</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* By Recipe */}
        {view === 'recipes' && (
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>{t('recipes.colRecipe')}</th>
                  <th>{t('recipes.colCategory')}</th>
                  <th>{t('allergens.presentAllergens')}</th>
                </tr>
              </thead>
              <tbody>
                {recipes
                  .filter(r => {
                    const ings = getRecipeAllergens(r, ingredients);
                    if (search) return r.name.toLowerCase().includes(search.toLowerCase()) && ings.length > 0;
                    return ings.length > 0;
                  })
                  .map(r => {
                    const allergenKeys = getRecipeAllergens(r, ingredients);
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 500 }}>{r.name}</td>
                        <td><span className="badge badge-gray">{r.category}</span></td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {allergenKeys.map(key => {
                              const a = ALLERGENS.find(x => x.key === key);
                              return a ? <span key={key} className="allergen-badge">{a.num}. {a.label}</span> : null;
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {recipes.filter(r => getRecipeAllergens(r, ingredients).length > 0).length === 0 && (
                  <tr><td colSpan={3}>
                    <div className="empty-state">
                      <i className="ti ti-shield-check"></i>
                      <p>{t('allergens.noAllergenRecipes')}</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* By Menu */}
        {view === 'menus' && (
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>{t('menus.colMenu')}</th>
                  <th>{t('allergens.presentAllergens')}</th>
                  <th>{t('allergens.allergenCount')}</th>
                </tr>
              </thead>
              <tbody>
                {menus
                  .filter(m => {
                    const ings = getMenuAllergens(m, recipes, ingredients);
                    if (search) return m.name.toLowerCase().includes(search.toLowerCase()) && ings.length > 0;
                    return ings.length > 0;
                  })
                  .map(m => {
                    const allergenKeys = getMenuAllergens(m, recipes, ingredients);
                    return (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 500 }}>{m.name}</td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {allergenKeys.map(key => {
                              const a = ALLERGENS.find(x => x.key === key);
                              return a ? <span key={key} className="allergen-badge">{a.num}. {a.label}</span> : null;
                            })}
                          </div>
                        </td>
                        <td><span className="badge badge-amber">{allergenKeys.length} {t('allergens.allergens')}</span></td>
                      </tr>
                    );
                  })}
                {menus.filter(m => getMenuAllergens(m, recipes, ingredients).length > 0).length === 0 && (
                  <tr><td colSpan={3}>
                    <div className="empty-state">
                      <i className="ti ti-shield-check"></i>
                      <p>{t('allergens.noAllergenMenus')}</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
