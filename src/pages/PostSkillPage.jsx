import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostSkillPage.css';

const CATEGORIES = [
  { value: 'tech', label: '💻 Technology', color: '#4A90D9' },
  { value: 'education', label: '📚 Education', color: '#7B68EE' },
  { value: 'cooking', label: '🍳 Cooking', color: '#E8A23A' },
  { value: 'music', label: '🎵 Music', color: '#E84393' },
  { value: 'fitness', label: '💪 Fitness', color: '#5A7A5C' },
  { value: 'crafts', label: '🎨 Crafts', color: '#D4622A' },
  { value: 'language', label: '🌍 Language', color: '#20B2AA' },
  { value: 'home', label: '🏠 Home & Garden', color: '#8B7355' },
  { value: 'business', label: '💼 Business', color: '#2C2C2C' },
];

export default function PostSkillPage() {
  const navigate = useNavigate();
  const [type, setType] = useState('offer');
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Please enter a skill title';
    else if (form.title.length < 5) e.title = 'Title must be at least 5 characters';
    if (!form.description.trim()) e.description = 'Please describe your skill';
    else if (form.description.length < 20) e.description = 'Description must be at least 20 characters';
    if (!form.category) e.category = 'Please select a category';
    if (!form.location.trim()) e.location = 'Please enter your neighbourhood';
    return e;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'description') setCharCount(value.length);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    // TODO: Replace with real API call
    // await apiMutate('/skills', { method: 'POST', body: { ...form, type } });
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => navigate('/board'), 2000);
  };

  if (success) {
    return (
      <div className="post-page">
        <div className="post-success">
          <div className="success-icon">✓</div>
          <h2>Skill Posted!</h2>
          <p>Your {type} has been added to the board. Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-page">
      <div className="post-container">

        {/* Header */}
        <div className="post-header">
          <span className="post-eyebrow">Share with your community</span>
          <h1 className="post-title">Post a Skill</h1>
          <p className="post-subtitle">
            Tell your neighbours what you can offer or what you're looking for.
            Our AI will find the best mutual matches.
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

        {/* Form */}
        <form className="post-form" onSubmit={handleSubmit} noValidate>

          {/* Skill Title */}
          <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
            <label className="form-label">
              Skill Title
              <span className="label-required">*</span>
            </label>
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
            <label className="form-label">
              Category
              <span className="label-required">*</span>
            </label>
            <div className="category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-chip ${form.category === cat.value ? 'selected' : ''}`}
                  style={form.category === cat.value ? { background: cat.color, borderColor: cat.color, color: '#fff' } : {}}
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
            <label className="form-label">
              Description
              <span className="label-required">*</span>
            </label>
            <textarea
              className="form-input form-textarea"
              placeholder={
  type === 'offer'
    ? "Describe what you can offer. The more detail, the better our AI can match you!\ne.g. I've been playing acoustic guitar for 10 years..."
    : "Describe what you need. Be specific so we can find the best match!\ne.g. I need someone to help me understand self-assessment tax returns. I'm self-employed..."
}
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              maxLength={500}
              rows={5}
            />
            <div className="char-count">
              <span className={charCount < 20 ? 'count-warn' : 'count-ok'}>{charCount}</span>/500
            </div>
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Neighbourhood */}
          <div className={`form-group ${errors.location ? 'has-error' : ''}`}>
            <label className="form-label">
              Your Neighbourhood
              <span className="label-required">*</span>
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Bandra West, Koramangala, Powai…"
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
            />
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>

          {/* Preview Card */}
          {form.title && (
            <div className="preview-section">
              <p className="preview-label">Preview</p>
              <div className={`preview-card ${type}`}>
                <div className={`preview-type-strip ${type}`}>
                  {type === 'offer' ? '✦ OFFERING' : '✦ LOOKING FOR'}
                </div>
                <div className="preview-body">
                  <h3 className="preview-title">{form.title || 'Your skill title'}</h3>
                  {form.category && (
                    <span className="preview-category">
                      {CATEGORIES.find(c => c.value === form.category)?.label}
                    </span>
                  )}
                  {form.description && (
                    <p className="preview-desc">
                      {form.description.slice(0, 100)}{form.description.length > 100 ? '…' : ''}
                    </p>
                  )}
                </div>
                <div className="preview-footer">
                  <div className="preview-avatar">Y</div>
                  <div>
                    <span className="preview-name">You</span>
                    {form.location && <span className="preview-loc"> · {form.location}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            className={`submit-btn ${type} ${submitting ? 'loading' : ''}`}
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <><span className="btn-spinner" /> Posting…</>
            ) : (
              type === 'offer' ? '🤝 Post Offer' : '🙋 Post Request'
            )}
          </button>

          <p className="form-note">
            By posting, you agree to be contacted by neighbours for this skill exchange.
          </p>
        </form>
      </div>
    </div>
  );
}
