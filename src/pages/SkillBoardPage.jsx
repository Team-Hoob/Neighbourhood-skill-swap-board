import { useState, useMemo } from 'react';
import SkillCard from '../components/SkillCard';
import SkillTag from '../components/ui/SkillTag';
import Input from '../components/ui/Input';
import { SKILL_CATEGORIES } from '../utils/constants';
import './SkillBoardPage.css';

/* ── Mock data (replace with useApi('/skills') once Shreyas's backend is live) ── */
const MOCK_SKILLS = [
  { id:1,  user_id:'u1', type:'offer', category:'tech',      description:'Python & data science tutoring — from basics to pandas/ML',    created_at:'2024-01-10' },
  { id:2,  user_id:'u2', type:'need',  category:'home',      description:'Need someone to fix a leaky kitchen tap and check plumbing',    created_at:'2024-01-11' },
  { id:3,  user_id:'u3', type:'offer', category:'music',     description:'Classical guitar lessons for beginners and intermediate players',created_at:'2024-01-12' },
  { id:4,  user_id:'u4', type:'need',  category:'creative',  description:'Help designing a resume and LinkedIn profile makeover',          created_at:'2024-01-13' },
  { id:5,  user_id:'u5', type:'offer', category:'language',  description:'Tamil and Hindi language exchange — native Tamil speaker',       created_at:'2024-01-14' },
  { id:6,  user_id:'u6', type:'need',  category:'health',    description:'Looking for yoga or meditation classes, preferably mornings',    created_at:'2024-01-15' },
  { id:7,  user_id:'u7', type:'offer', category:'food',      description:'South Indian cooking lessons — dosas, sambar, chutneys',        created_at:'2024-01-16' },
  { id:8,  user_id:'u8', type:'need',  category:'tech',      description:'Help setting up a small business website on Wix or WordPress',  created_at:'2024-01-17' },
  { id:9,  user_id:'u1', type:'offer', category:'education', description:'Maths tutoring for class 9–12, competitive exams too',          created_at:'2024-01-18' },
  { id:10, user_id:'u3', type:'need',  category:'language',  description:'Want to learn basic French for an upcoming Europe trip',        created_at:'2024-01-19' },
  { id:11, user_id:'u5', type:'offer', category:'creative',  description:'Portrait photography sessions and basic editing workshops',      created_at:'2024-01-20' },
  { id:12, user_id:'u6', type:'offer', category:'health',    description:'Certified Zumba instructor — fun group fitness sessions',       created_at:'2024-01-21' },
  { id:13, user_id:'u2', type:'offer', category:'home',      description:'Carpentry and furniture repair — 10 years experience',          created_at:'2024-01-22' },
  { id:14, user_id:'u4', type:'need',  category:'food',      description:'Looking for someone to teach me meal prep for the week',        created_at:'2024-01-23' },
  { id:15, user_id:'u7', type:'offer', category:'music',     description:'Tabla lessons — classical and semi-classical, all levels',      created_at:'2024-01-24' },
  { id:16, user_id:'u8', type:'need',  category:'education', description:'Need a patient tutor for my child — class 5 English and Maths', created_at:'2024-01-25' },
];

const MOCK_USERS = {
  u1: { id:'u1', name:'Ananya S.',  neighbourhood:'Bandra',  avatar_url:null },
  u2: { id:'u2', name:'Rohan M.',   neighbourhood:'Powai',   avatar_url:null },
  u3: { id:'u3', name:'Priya K.',   neighbourhood:'Juhu',    avatar_url:null },
  u4: { id:'u4', name:'Dev P.',     neighbourhood:'Andheri', avatar_url:null },
  u5: { id:'u5', name:'Meera T.',   neighbourhood:'Dadar',   avatar_url:null },
  u6: { id:'u6', name:'Arjun R.',   neighbourhood:'Worli',   avatar_url:null },
  u7: { id:'u7', name:'Sneha L.',   neighbourhood:'Bandra',  avatar_url:null },
  u8: { id:'u8', name:'Karthik V.', neighbourhood:'Powai',   avatar_url:null },
};

const TYPE_FILTERS = [
  { id: 'all',   label: 'All skills' },
  { id: 'offer', label: 'Offers' },
  { id: 'need',  label: 'Needs' },
];

export default function SkillBoardPage() {
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter]   = useState('all');

  // TODO: swap mock data for real API call once Shreyas's backend is live:
  // const { data: skills, loading, error } = useApi('/skills');
  const skills  = MOCK_SKILLS;
  const loading = false;

  /* Filter + search */
  const filtered = useMemo(() => {
    return skills.filter(skill => {
      const matchType = typeFilter === 'all' || skill.type === typeFilter;
      const matchCat  = catFilter  === 'all' || skill.category === catFilter;
      const matchSearch = !search.trim() ||
        skill.description.toLowerCase().includes(search.toLowerCase());
      return matchType && matchCat && matchSearch;
    });
  }, [skills, typeFilter, catFilter, search]);

  const toggleCat = (id) => setCatFilter(prev => prev === id ? 'all' : id);

  return (
    <div className="board-page page">

      {/* ── Header ── */}
      <div className="board-page__header">
        <div className="container board-page__header-inner">
          <div className="board-page__title-group">
            <p className="section-eyebrow">Community board</p>
            <h1 className="board-page__title">Skills in your neighbourhood</h1>
            <p className="board-page__subtitle">
              Browse what your neighbours are offering and looking for.
            </p>
          </div>

          {/* Search */}
          <div className="board-page__search">
            <Input
              placeholder="Search skills… e.g. guitar, Python, cooking"
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<span>🔍</span>}
              iconRight={search
                ? <button className="board-page__clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
                : null
              }
            />
          </div>
        </div>
      </div>

      <div className="container board-page__body">

        {/* ── Filters row ── */}
        <div className="board-page__filters">

          {/* Type toggle */}
          <div className="board-page__type-toggle" role="group" aria-label="Filter by type">
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

          {/* Category pills */}
          <div className="board-page__cats" role="group" aria-label="Filter by category">
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

        {/* ── Results count ── */}
        <div className="board-page__meta">
          {search || typeFilter !== 'all' || catFilter !== 'all' ? (
            <p className="board-page__count">
              <strong>{filtered.length}</strong> skill{filtered.length !== 1 ? 's' : ''} found
              {search && <> for "<em>{search}</em>"</>}
              <button className="board-page__reset" onClick={() => { setSearch(''); setTypeFilter('all'); setCatFilter('all'); }}>
                Clear filters
              </button>
            </p>
          ) : (
            <p className="board-page__count">
              Showing <strong>{filtered.length}</strong> skills
            </p>
          )}
        </div>

        {/* ── Grid ── */}
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
                  user={MOCK_USERS[skill.user_id]}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="board-page__empty">
            <div className="board-page__empty-icon">🔍</div>
            <h3 className="board-page__empty-title">No skills found</h3>
            <p className="board-page__empty-sub">
              Try a different search term or clear your filters.
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
