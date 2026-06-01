import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../supabaseClient';
import { useToast } from '../auth/ToastContext';
import './PostSkillPage.css';

const CATEGORIES = [
  { value: 'tech',      label: '💻 Technology',    color: '#4A90D9' },
  { value: 'education', label: '📚 Education',      color: '#7B68EE' },
  { value: 'cooking',   label: '🍳 Cooking',        color: '#E8A23A' },
  { value: 'music',     label: '🎵 Music',          color: '#E84393' },
  { value: 'fitness',   label: '💪 Fitness',        color: '#5A7A5C' },
  { value: 'crafts',    label: '🎨 Crafts',         color: '#D4622A' },
  { value: 'language',  label: '🌍 Language',       color: '#20B2AA' },
  { value: 'home',      label: '🏠 Home & Repairs', color: '#8B7355' },
  { value: 'business',  label: '💼 Business',       color: '#2C2C2C' },
];

const SERVICE_TYPES = [
  { id: 'home',   label: '🏠 I visit their home', desc: 'You go to them (plumber, tutor, electrician)' },
  { id: 'meetup', label: '📍 Meet in public',     desc: 'Café, park, library — neutral place' },
  { id: 'online', label: '💻 Online only',        desc: 'Video call, chat, remote help' },
];

export default function PostSkillPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [type, setType]             = useState('offer');
  const [form, setForm]             = useState({
    title: '', description: '', category: '',
    pincode: '', neighbourhood: '', district: '', state: '',
    service_type: 'meetup'
  });
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile]       = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile(data);
        setForm(prev => ({
          ...prev,
          pincode:       data.pincode       || '',
          neighbourhood: data.neighbourhood || '',
          district:      data.district      || '',
          state:         data.state         || '',
        }));
      }
    }
    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Please log in to post a skill</h2>
        <a href="/login" style={{ color: '#C0692A', marginTop: '1rem', display: 'block' }}>
          Go to Login →
        </a>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Please enter a skill title';
    if (!form.description.trim() || form.description.length < 20)
      e.description = 'Description must be at least 20 characters';
    if (!form.category) e.category = 'Please select a category';
    if (!form.pincode.trim()) e.pincode = 'Please enter your pincode';
    else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode';
    return e;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const table = type === 'offer' ? 'skill_offers' : 'skill_needs';
      const { error: insertError } = await supabase
        .from(table)
        .insert([{
          user_id:      user.id,
          description:  `${form.title} — ${form.description}`,
          category:     form.category,
          service_type: form.service_type,
          pincode:      form.pincode.trim(),
        }]);

      if (insertError) throw insertError;

      // Update user's location if changed
      await supabase
        .from('users')
        .update({
          pincode:       form.pincode.trim(),
          neighbourhood: form.neighbourhood,
          district:      form.district,
          state:         form.state,
        })
        .eq('id', user.id);

      showToast({ message: type === 'offer' ? '✅ Skill offer posted!' : '✅ Skill request posted!' });
      navigate('/board');

    } catch (err) {
      setErrors({ submit: err.message || 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-page">
      <div className="post-container">

        <div className="post-header">
          <span className="post-eyebrow">Share with your community</span>
          <h1 className="post-title">Post a Skill</h1>
          <p className="post-subtitle">
            Tell your neighbours what you can offer or what you're looking for.
          </p>
        </div>

        {/* Type Toggle */}
        <div className="type-toggle">
          <button
            className={`toggle-btn ${type === 'offer' ? 'active offer' : ''}`}
            onClick={() => setType('offer')}
            type="button"
          >
            <span className="toggle-icon">🤝</span>
            <span className="toggle-label">I can offer</span>
            <span className="toggle-sub">Share a skill you have</span>
          </button>
          <button
            className={`toggle-btn ${type === 'need' ? 'active need' : ''}`}
            onClick={() => setType('need')}
            type="button"
          >
            <span className="toggle-icon">🙋</span>
            <span className="toggle-label">I'm looking for</span>
            <span className="toggle-sub">Request a skill you need</span>
          </button>
        </div>

        <form className="post-form" onSubmit={handleSubmit} noValidate>

          {/* Title */}
          <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
            <label className="form-label">Skill Title <span className="label-required">*</span></label>
            <input
              className="form-input"
              type="text"
              placeholder={type === 'offer' ? 'e.g. Guitar lessons for beginners' : 'e.g. Help with tax filing'}
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              maxLength={80}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Category */}
          <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
            <label className="form-label">Category <span className="label-required">*</span></label>
            <div className="category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-chip ${form.category === cat.value ? 'selected' : ''}`}
                  style={form.category === cat.value
                    ? { background: cat.color, borderColor: cat.color, color: '#fff' }
                    : {}}
                  onClick={() => handleChange('category', cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          {/* Description */}
          <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
            <label className="form-label">Description <span className="label-required">*</span></label>
            <textarea
              className="form-input form-textarea"
              placeholder={type === 'offer'
                ? "Describe what you can offer in detail. e.g. I've been playing guitar for 10 years and can teach beginners..."
                : "Describe what you need. e.g. I need a plumber to fix a leaky tap in my kitchen..."}
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              maxLength={500}
              rows={5}
            />
            <div className="char-count">
              <span className={form.description.length < 20 ? 'count-warn' : 'count-ok'}>
                {form.description.length}
              </span>/500
            </div>
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              Your Location <span className="label-required">*</span>
            </label>
            <span className="form-hint" style={{ marginBottom: '0.75rem', display: 'block' }}>
              ✅ Auto-filled from your profile — change if posting from a different location
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem', display: 'block' }}>
                  Area / Neighbourhood
                </label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Bandra West"
                  value={form.neighbourhood}
                  onChange={e => handleChange('neighbourhood', e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem', display: 'block' }}>
                  District
                </label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Mumbai Suburban"
                  value={form.district}
                  onChange={e => handleChange('district', e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem', display: 'block' }}>
                  State
                </label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={form.state}
                  onChange={e => handleChange('state', e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem', display: 'block' }}>
                  Pincode <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. 400050"
                  value={form.pincode}
                  onChange={e => handleChange('pincode', e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
            {errors.pincode && <span className="form-error">{errors.pincode}</span>}
          </div>

          {/* Service Type */}
          <div className="form-group">
            <label className="form-label">How will this skill be exchanged?</label>
            <div className="service-grid">
              {SERVICE_TYPES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`service-btn ${form.service_type === s.id ? 'active' : ''}`}
                  onClick={() => handleChange('service_type', s.id)}
                >
                  <span className="service-label">{s.label}</span>
                  <span className="service-desc">{s.desc}</span>
                </button>
              ))}
            </div>
            {form.service_type === 'home' && (
              <div className="safety-tip">
                🛡️ <strong>Safety tip:</strong> Always check the person's profile and reviews before
                allowing a home visit. Meet briefly in public first if possible.
              </div>
            )}
          </div>

          {errors.submit && <p className="form-error">{errors.submit}</p>}

          <button
            className={`submit-btn ${type} ${submitting ? 'loading' : ''}`}
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Posting…' : type === 'offer' ? '🤝 Post Offer' : '🙋 Post Request'}
          </button>

          <p className="form-note">
            By posting, you agree to be contacted by neighbours for this skill exchange.
          </p>

        </form>
      </div>
    </div>
  );
}