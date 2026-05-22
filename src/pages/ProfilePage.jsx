import { useState } from 'react';
import './ProfilePage.css';

// Mock user — swap with useAuth() from Harshit Singh's module
// const { user } = useAuth();
const MOCK_USER = {
  id: 'u1',
  name: 'Dharya Thakkar',
  email: 'dharyathakkar71@gmail.com',
  neighbourhood: 'Vadodara',
  bio: 'Frontend developer & design enthusiast. Love building things that look great and work even better.',
  avatar: null,
  initials: 'DK',
  joined: 'January 2025',
  matchCount: 12,
  skillCount: 4,
};

// Mock skills — swap with useApi('/skills/me')
const MOCK_MY_SKILLS = [
  { id: 's1', type: 'offer', title: 'React & Frontend Development', category: 'tech',      description: 'Can help with React, CSS, Vite, component design and responsive layouts.' },
  { id: 's2', type: 'offer', title: 'Graphic Design & Canva',       category: 'crafts',    description: 'Social media graphics, logos, posters — anything visual.' },
  { id: 's3', type: 'need',  title: 'Guitar Lessons',               category: 'music',     description: 'Complete beginner, want to learn acoustic guitar basics.' },
  { id: 's4', type: 'need',  title: 'Yoga & Meditation Classes',    category: 'fitness',   description: 'Looking for a patient instructor for morning sessions.' },
];

const CATEGORY_COLORS = {
  tech:      '#4A90D9',
  education: '#7B68EE',
  cooking:   '#E8A23A',
  music:     '#E84393',
  fitness:   '#5A7A5C',
  crafts:    '#D4622A',
  language:  '#20B2AA',
  home:      '#8B7355',
  business:  '#2C2C2C',
};

function AvatarUpload({ initials, onUpload }) {
  const [hovering, setHovering] = useState(false);
  return (
    <div
      className={`avatar-upload ${hovering ? 'hover' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={onUpload}
      title="Change photo"
    >
      <div className="avatar-circle">{initials}</div>
      {hovering && (
        <div className="avatar-overlay">
          <span>📷</span>
          <span className="avatar-overlay-text">Change</span>
        </div>
      )}
    </div>
  );
}

function SkillPill({ skill, onDelete }) {
  return (
    <div className={`skill-pill ${skill.type}`}>
      <span
        className="pill-dot"
        style={{ background: CATEGORY_COLORS[skill.category] || '#8A8070' }}
      />
      <div className="pill-body">
        <span className="pill-title">{skill.title}</span>
        <span className={`pill-type ${skill.type}`}>
          {skill.type === 'offer' ? 'Offering' : 'Looking for'}
        </span>
      </div>
      <button className="pill-delete" onClick={() => onDelete(skill.id)} title="Remove skill">
        ✕
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser]           = useState(MOCK_USER);
  const [skills, setSkills]       = useState(MOCK_MY_SKILLS);
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({ name: user.name, neighbourhood: user.neighbourhood, bio: user.bio });
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'stats'

  const handleEditChange = (field, value) =>
    setEditForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    // TODO: await apiMutate('/users/me', { method: 'PATCH', body: editForm });
    await new Promise(r => setTimeout(r, 900));
    setUser(prev => ({ ...prev, ...editForm }));
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteSkill = (id) => {
    // TODO: await apiMutate(`/skills/${id}`, { method: 'DELETE' });
    setSkills(prev => prev.filter(s => s.id !== id));
  };

  const offers = skills.filter(s => s.type === 'offer');
  const needs  = skills.filter(s => s.type === 'need');

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* ── Hero card ── */}
        <div className="profile-hero">
          {/* Background pattern */}
          <div className="hero-pattern" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="pattern-dot" style={{
                left: `${(i % 6) * 18 + 4}%`,
                top: `${Math.floor(i / 6) * 40 + 10}%`,
                animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>

          <div className="hero-content">
            <AvatarUpload initials={user.initials} onUpload={() => {}} />

            <div className="hero-info">
              {editing ? (
                <input
                  className="edit-name-input"
                  value={editForm.name}
                  onChange={e => handleEditChange('name', e.target.value)}
                  placeholder="Your name"
                />
              ) : (
                <h1 className="hero-name">{user.name}</h1>
              )}

              <div className="hero-meta">
                <span className="hero-location">
                  📍
                  {editing ? (
                    <input
                      className="edit-inline-input"
                      value={editForm.neighbourhood}
                      onChange={e => handleEditChange('neighbourhood', e.target.value)}
                      placeholder="Neighbourhood"
                    />
                  ) : user.neighbourhood}
                </span>
                <span className="hero-sep">·</span>
                <span className="hero-joined">Joined {user.joined}</span>
              </div>
            </div>

            <div className="hero-actions">
              {saved && <span className="saved-badge">✓ Saved</span>}
              {editing ? (
                <>
                  <button className="btn-cancel-edit" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn-save" onClick={handleSave} disabled={saving}>
                    {saving ? <><span className="btn-spinner" /> Saving…</> : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button className="btn-edit" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="hero-bio-section">
            {editing ? (
              <textarea
                className="edit-bio-input"
                value={editForm.bio}
                onChange={e => handleEditChange('bio', e.target.value)}
                placeholder="Tell your neighbours about yourself…"
                rows={3}
                maxLength={200}
              />
            ) : (
              <p className="hero-bio">{user.bio || 'No bio yet — click Edit Profile to add one.'}</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{skills.length}</strong>
              <span>Skills Posted</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>{offers.length}</strong>
              <span>Offerings</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>{needs.length}</strong>
              <span>Requests</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>{user.matchCount}</strong>
              <span>Matches</span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            My Skills
          </button>
          <button
            className={`profile-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Activity
          </button>
        </div>

        {/* ── Skills tab ── */}
        {activeTab === 'skills' && (
          <div className="skills-tab">

            {/* Offers */}
            <div className="skills-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-dot offer" />
                  What I Offer
                </h2>
                <a href="/post" className="section-add-btn">+ Add Offer</a>
              </div>
              {offers.length === 0 ? (
                <div className="skills-empty">
                  <p>You haven't posted any offers yet.</p>
                  <a href="/post" className="empty-cta">Post your first skill →</a>
                </div>
              ) : (
                <div className="skills-list">
                  {offers.map(skill => (
                    <SkillPill key={skill.id} skill={skill} onDelete={handleDeleteSkill} />
                  ))}
                </div>
              )}
            </div>

            {/* Needs */}
            <div className="skills-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-dot need" />
                  What I Need
                </h2>
                <a href="/post" className="section-add-btn">+ Add Request</a>
              </div>
              {needs.length === 0 ? (
                <div className="skills-empty">
                  <p>You haven't posted any requests yet.</p>
                  <a href="/post" className="empty-cta">Post your first request →</a>
                </div>
              ) : (
                <div className="skills-list">
                  {needs.map(skill => (
                    <SkillPill key={skill.id} skill={skill} onDelete={handleDeleteSkill} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Activity tab ── */}
        {activeTab === 'stats' && (
          <div className="activity-tab">
            <div className="activity-grid">

              <div className="activity-card highlight">
                <div className="activity-icon">🤝</div>
                <div className="activity-value">{user.matchCount}</div>
                <div className="activity-label">Total Matches</div>
                <p className="activity-sub">Neighbours matched with your skills</p>
              </div>

              <div className="activity-card">
                <div className="activity-icon">📋</div>
                <div className="activity-value">{skills.length}</div>
                <div className="activity-label">Skills Posted</div>
                <p className="activity-sub">{offers.length} offers · {needs.length} requests</p>
              </div>

              <div className="activity-card">
                <div className="activity-icon">✉️</div>
                <div className="activity-value">3</div>
                <div className="activity-label">Messages Sent</div>
                <p className="activity-sub">Connection requests you've made</p>
              </div>

              <div className="activity-card">
                <div className="activity-icon">⭐</div>
                <div className="activity-value">94%</div>
                <div className="activity-label">Best Match Score</div>
                <p className="activity-sub">Highest mutual match found</p>
              </div>
            </div>

            <div className="activity-tip">
              <span className="tip-icon">💡</span>
              <p>
                <strong>Tip:</strong> Adding more detail to your skill descriptions improves your match scores.
                The AI matches based on meaning, not just keywords.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
