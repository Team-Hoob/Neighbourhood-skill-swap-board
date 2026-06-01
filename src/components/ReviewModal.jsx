import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/AuthContext';

export default function ReviewModal({ user, onClose }) {
  const { user: authUser } = useAuth();
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState(null);

  async function handleSubmit() {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('reviews')
      .insert([{
        reviewer_id: authUser.id,
        reviewed_id: user.id,
        rating,
        comment: comment.trim()
      }]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setDone(true);
  }

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}
        style={{ maxWidth: '420px' }}>

        {done ? (
          <div className="modal-sent" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem' }}>⭐</div>
            <h3>Review submitted!</h3>
            <p>Thanks for rating {firstName}.</p>
            <button className="btn-close-modal" onClick={onClose}
              style={{ marginTop: '1rem' }}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-avatar">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h3>Rate {user?.name}</h3>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>
                  {user?.neighbourhood}
                </p>
              </div>
              <button className="modal-close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="modal-body">
              {/* Star rating */}
              <label className="modal-label">Your Rating</label>
              <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0 1rem' }}>
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    style={{
                      fontSize: '2rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: star <= (hover || rating) ? '#E8A23A' : '#ddd',
                      transition: 'color 0.1s'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label className="modal-label">Comment (optional)</label>
              <textarea
                className="modal-textarea"
                placeholder={`How was your experience with ${firstName}?`}
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                maxLength={200}
              />

              {error && (
                <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  {error}
                </p>
              )}

              {/* Safety reminder */}
              <div className="safety-tip" style={{ marginTop: '1rem' }}>
                🛡️ Reviews help build trust in the community. Be honest and respectful.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-send" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Review ⭐'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}