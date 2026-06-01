import { useState, useMemo, useEffect } from 'react';
import SkillCard from '../components/SkillCard';
import SkillTag from '../components/ui/SkillTag';
import Input from '../components/ui/Input';
import { SKILL_CATEGORIES } from '../utils/constants';
import { supabase } from '../supabaseClient';
import './SkillBoardPage.css';

const TYPE_FILTERS = [
  { id: 'all',   label: 'All skills' },
  { id: 'offer', label: 'Offers' },
  { id: 'need',  label: 'Needs' },
];

export default function SkillBoardPage() {
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter]   = useState('all');
  const [skills, setSkills]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    setLoading(true);
    try {
      const offers = await supabase
        .from('skill_offers')
        .select('*, users(id, name, neighbourhood, avatar_url)')
        .order('created_at', { ascending: false });

      const needs = await supabase
        .from('skill_needs')
        .select('*, users(id, name, neighbourhood, avatar_url)')
        .order('created_at', { ascending: false });

      const allSkills = [
        ...(offers.data || []).map(s => ({ ...s, type: 'offer' })),
        ...(needs.data  || []).map(s => ({ ...s, type: 'need'  })),
      ];

      // Sort by newest first
      allSkills.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setSkills(allSkills);

    } catch (e) {
      setError('Failed to load skills');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return skills.filter(skill => {
      const matchType   = typeFilter === 'all' || skill.type === typeFilter;
      const matchCat    = catFilter  === 'all' || skill.category === catFilter;
      const matchSearch = !search.trim() ||
        skill.description.toLowerCase().includes(search.toLowerCase());
      return matchType && matchCat && matchSearch;
    });
  }, [skills, typeFilter, catFilter, search]);

  const toggleCat = (id) => setCatFilter(prev => prev === id ? 'all' : id);

  return (
    <div className="board-page page">

      {/* Header */}
      <div className="board-page__header">
        <div className="container board-page__header-inner">
          <div className="board-page__title-group">
            <p className="section-eyebrow">Community board</p>
            <h1 className="board-page__title">Skills in your neighbourhood</h1>
            <p className="board-page__subtitle">
              Browse what your neighbours are offering and looking for.
            </p>
          </div>
          <div className="board-page__search">
            <Input
              placeholder="Search skills… e.g. guitar, Python, cooking"
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<span>🔍</span>}
              iconRight={search
                ? <button className="board-page__clear" onClick={() => setSearch('')}>✕</button>
                : null}
            />
          </div>
        </div>
      </div>

      <div className="container board-page__body">

        {/* Filters */}
        <div className="board-page__filters">
          <div className="board-page__type-toggle" role="group">
            {TYPE_FILTERS.map(({ id, label }) => (
              <button
                key={id}
                className={['type-toggle__btn', typeFilter === id ? 'type-toggle__btn--active' : ''].join(' ')}
                onClick={() => setTypeFilter(id)}
              >
                {id === 'offer' && <span className="type-toggle__dot type-toggle__dot--offer" />}
                {id === 'need'  && <span className="type-toggle__dot type-toggle__dot--need"  />}
                {label}
              </button>
            ))}
          </div>

          <div className="board-page__cats" role="group">
            <SkillTag
              label="All"
              color="#8A8070"
              size="md"
              onClick={() => setCatFilter('all')}
              active={catFilter === 'all'}
            />
            {SKILL_CATEGORIES.map(cat => (
              <SkillTag
                key={cat.id}
                category={cat.id}
                size="md"
                onClick={() => toggleCat(cat.id)}
                active={catFilter === cat.id}
              />
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="board-page__meta">
          {search || typeFilter !== 'all' || catFilter !== 'all' ? (
            <p className="board-page__count">
              <strong>{filtered.length}</strong> skill{filtered.length !== 1 ? 's' : ''} found
              {search && <> for "<em>{search}</em>"</>}
              <button className="board-page__reset"
                onClick={() => { setSearch(''); setTypeFilter('all'); setCatFilter('all'); }}>
                Clear filters
              </button>
            </p>
          ) : (
            <p className="board-page__count">
              Showing <strong>{filtered.length}</strong> skills
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            {error} — <button onClick={fetchSkills}>Retry</button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="board-page__grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skill-card-skeleton skeleton" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="board-page__grid">
            {filtered.map((skill, i) => (
              <div
                key={skill.id}
                className="board-page__card-wrap animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              >
                <SkillCard
                  skill={skill}
                  user={skill.users}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="board-page__empty">
            <div className="board-page__empty-icon">🔍</div>
            <h3 className="board-page__empty-title">No skills found</h3>
            <p className="board-page__empty-sub">
              Try a different search or clear your filters.
            </p>
            <button
              className="board-page__reset board-page__reset--btn"
              onClick={() => { setSearch(''); setTypeFilter('all'); setCatFilter('all'); }}
            >
              Clear all filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}