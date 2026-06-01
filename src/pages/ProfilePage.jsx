import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../supabaseClient';
import './ProfilePage.css';

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

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
]

function AvatarUpload({ initials }) {
  return (
    <div className="avatar-upload">
      <div className="avatar-circle">{initials}</div>
    </div>
  );
}

function RatingBadge({ userId }) {
  const [rating, setRating] = useState(null);
  const [count, setCount]   = useState(0);

  useEffect(() => {
    async function fetchRating() {
      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_id', userId);
      if (data && data.length > 0) {
        const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
        setRating(avg.toFixed(1));
        setCount(data.length);
      }
    }
    if (userId) fetchRating();
  }, [userId]);

  if (!rating) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
      <span style={{ color: '#aaa', fontSize: '0.8rem' }}>No reviews yet</span>
    </div>
  );

  const full  = Math.floor(rating);
  const empty = 5 - full;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
      <span style={{ color: '#E8A23A', fontSize: '1rem' }}>
        {'★'.repeat(full)}{'☆'.repeat(empty)}
      </span>
      <span style={{ color: '#E8A23A', fontSize: '0.9rem', fontWeight: 600 }}>{rating}</span>
      <span style={{ color: '#aaa', fontSize: '0.8rem' }}>({count} {count === 1 ? 'review' : 'reviews'})</span>
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
        <span className="pill-title">{skill.description}</span>
        <span className={`pill-type ${skill.type}`}>
          {skill.type === 'offer' ? 'Offering' : 'Looking for'}
        </span>
      </div>
      <button className="pill-delete" onClick={() => onDelete(skill.id, skill.type)}>✕</button>
    </div>
  );
}

function ReviewsSection({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*, reviewer:reviewer_id(name, neighbourhood)')
        .eq('reviewed_id', userId)
        .order('created_at', { ascending: false });
      setReviews(data || []);
      setLoading(false);
    }
    fetchReviews();
  }, [userId]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const full  = avgRating ? Math.floor(avgRating) : 0;
  const empty = 5 - full;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>
        ⭐ Reviews
        {avgRating && (
          <span style={{ marginLeft: '0.5rem' }}>
            <span style={{ color: '#E8A23A' }}>
              {'★'.repeat(full)}{'☆'.repeat(empty)}
            </span>
            <span style={{ color: '#E8A23A', marginLeft: '0.3rem' }}>{avgRating}/5</span>
          </span>
        )}
        <span style={{ color: '#888', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
          ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
        </span>
      </h3>

      {loading ? <p>Loading reviews...</p> : reviews.length === 0 ? (
        <p style={{ color: '#888' }}>No reviews yet. Complete a skill exchange to get your first review!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(review => (
            <div key={review.id} style={{
              background: '#f9f6f1',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              border: '1px solid #e8e0d5'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div>
                  <strong>{review.reviewer?.name || 'Anonymous'}</strong>
                  <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                    · {review.reviewer?.neighbourhood}
                  </span>
                </div>
                <div style={{ color: '#E8A23A' }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              {review.comment && (
                <p style={{ color: '#555', fontSize: '0.9rem', margin: 0 }}>
                  "{review.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile]         = useState(null);
  const [skills, setSkills]           = useState([]);
  const [editing, setEditing]         = useState(false);
  const [editForm, setEditForm]       = useState({});
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [activeTab, setActiveTab]     = useState('skills');
  const [loadingSkills, setLoadingSkills] = useState(true);

  useEffect(() => {
    if (authUser) {
      fetchProfile();
      fetchSkills();
    }
  }, [authUser]);

  async function fetchProfile() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (data) {
      setProfile(data);
      setEditForm({
        name:          data.name || '',
        country:       data.country || 'India',
        state:         data.state || '',
        district:      data.district || '',
        neighbourhood: data.neighbourhood || '',
        apartment:     data.apartment || '',
        pincode:       data.pincode || '',
      });
    }
  }

  async function fetchSkills() {
    setLoadingSkills(true);
    try {
      const offers = await supabase
        .from('skill_offers').select('*').eq('user_id', authUser.id);
      const needs = await supabase
        .from('skill_needs').select('*').eq('user_id', authUser.id);
      setSkills([
        ...(offers.data || []).map(s => ({ ...s, type: 'offer' })),
        ...(needs.data  || []).map(s => ({ ...s, type: 'need'  })),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSkills(false);
    }
  }

  const handleEditChange = (field, value) =>
    setEditForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('users').update({
      name:          editForm.name,
      country:       editForm.country,
      state:         editForm.state,
      district:      editForm.district,
      neighbourhood: editForm.neighbourhood,
      apartment:     editForm.apartment,
      pincode:       editForm.pincode,
    }).eq('id', authUser.id);
    await fetchProfile();
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteSkill = async (id, type) => {
    const table = type === 'offer' ? 'skill_offers' : 'skill_needs';
    await supabase.from(table).delete().eq('id', id);
    setSkills(prev => prev.filter(s => s.id !== id));
  };

  const offers = skills.filter(s => s.type === 'offer');
  const needs  = skills.filter(s => s.type === 'need');
  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const locationParts = [
    profile?.neighbourhood,
    profile?.district,
    profile?.state,
    profile?.country,
  ].filter(Boolean);
  const locationString = locationParts.join(', ');

  if (!authUser) return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Please log in to view your profile.
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Hero card */}
        <div className="profile-hero">
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
            <AvatarUpload initials={initials} />

            <div className="hero-info">
              {editing ? (
                <input
                  className="edit-name-input"
                  value={editForm.name}
                  onChange={e => handleEditChange('name', e.target.value)}
                  placeholder="Your name"
                />
              ) : (
                <h1 className="hero-name">{profile?.name || 'User'}</h1>
              )}

              {/* Rating stars in hero */}
              {!editing && <RatingBadge userId={authUser.id} />}

              {/* Location display */}
              {!editing && (
                <div className="hero-meta">
                  <span className="hero-location">📍 {locationString || 'Location not set'}</span>
                  {profile?.pincode && (
                    <span className="hero-pincode">📮 {profile.pincode}</span>
                  )}
                  {profile?.apartment && (
                    <span className="hero-apartment">🏢 {profile.apartment}</span>
                  )}
                </div>
              )}
            </div>

            <div className="hero-actions">
              {saved && <span className="saved-badge">✓ Saved</span>}
              {editing ? (
                <>
                  <button className="btn-cancel-edit" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn-save" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button className="btn-edit" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
              )}
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="edit-location-form">
              <p className="edit-section-label">📍 Location</p>
              <div className="edit-grid">
                <input className="edit-input" placeholder="Country"
                  value={editForm.country}
                  onChange={e => handleEditChange('country', e.target.value)} />
                <select className="edit-input edit-select"
  value={editForm.state}
  onChange={e => handleEditChange('state', e.target.value)}
  style={{ background: '#2c2c2c', color: 'white' }}>
                  <option value="">Select State</option>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input className="edit-input" placeholder="District"
                  value={editForm.district}
                  onChange={e => handleEditChange('district', e.target.value)} />
                <input className="edit-input" placeholder="Area / Neighbourhood"
                  value={editForm.neighbourhood}
                  onChange={e => handleEditChange('neighbourhood', e.target.value)} />
                <input className="edit-input" placeholder="Apartment / Building (optional)"
                  value={editForm.apartment}
                  onChange={e => handleEditChange('apartment', e.target.value)} />
                <input className="edit-input" placeholder="Pincode"
                  value={editForm.pincode} maxLength={6}
                  onChange={e => handleEditChange('pincode', e.target.value)} />
              </div>
            </div>
          )}

          {/* Stats */}
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
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button className={`profile-tab ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}>My Skills</button>
          <button className={`profile-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}>Activity & Reviews</button>
        </div>

        {/* Skills tab */}
        {activeTab === 'skills' && (
          <div className="skills-tab">
            <div className="skills-section">
              <div className="section-header">
                <h2 className="section-title"><span className="section-dot offer" />What I Offer</h2>
                <a href="/post" className="section-add-btn">+ Add Offer</a>
              </div>
              {loadingSkills ? <p>Loading...</p> : offers.length === 0 ? (
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

            <div className="skills-section">
              <div className="section-header">
                <h2 className="section-title"><span className="section-dot need" />What I Need</h2>
                <a href="/post" className="section-add-btn">+ Add Request</a>
              </div>
              {loadingSkills ? <p>Loading...</p> : needs.length === 0 ? (
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

        {/* Activity & Reviews tab */}
        {activeTab === 'stats' && (
          <div className="activity-tab">
            <div className="activity-grid">
              <div className="activity-card highlight">
                <div className="activity-icon">📋</div>
                <div className="activity-value">{skills.length}</div>
                <div className="activity-label">Skills Posted</div>
                <p className="activity-sub">{offers.length} offers · {needs.length} requests</p>
              </div>
            </div>
            <ReviewsSection userId={authUser.id} />
          </div>
        )}

      </div>
    </div>
  );
}