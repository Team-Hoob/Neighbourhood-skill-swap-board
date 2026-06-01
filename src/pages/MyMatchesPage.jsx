import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../supabaseClient';
import './MyMatchesPage.css';
import ReviewModal from '../components/ReviewModal';

const SCORE_COLORS = {
  high:   { stroke: '#5A7A5C', label: 'Excellent Match', bg: 'rgba(90,122,92,0.08)'  },
  medium: { stroke: '#E8A23A', label: 'Good Match',      bg: 'rgba(232,162,58,0.08)' },
  low:    { stroke: '#D4622A', label: 'Possible Match',  bg: 'rgba(212,98,42,0.08)'  },
};

function getScoreTier(score) {
  if (score >= 80) return 'high';
  if (score >= 65) return 'medium';
  return 'low';
}

function MatchRating({ userId }) {
  const [rating, setRating] = useState(null);
  const [count, setCount]   = useState(0);

  useEffect(() => {
    if (!userId) return;
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
    fetchRating();
  }, [userId]);

  if (!rating) return <span style={{ color: '#aaa', fontSize: '0.8rem' }}>No reviews yet</span>;

  const full  = Math.floor(rating);
  const empty = 5 - full;

  return (
    <span style={{ fontSize: '0.85rem' }}>
      <span style={{ color: '#E8A23A' }}>{'★'.repeat(full)}{'☆'.repeat(empty)}</span>
      <span style={{ color: '#E8A23A', marginLeft: '0.3rem', fontWeight: 600 }}>{rating}</span>
      <span style={{ color: '#aaa', fontSize: '0.75rem' }}> ({count} reviews)</span>
    </span>
  );
}

function ScoreRing({ score, size = 72 }) {
  const tier = getScoreTier(score);
  const { stroke } = SCORE_COLORS[tier];
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const dashOffset = circumference - (animated / 100) * circumference;

  return (
    <svg width={size} height={size} className="score-ring-svg">
      <circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke="#EDE7D9" strokeWidth={7} />
      <circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={stroke} strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)',
          transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: 'var(--font-body)', fontSize: size*0.22,
          fontWeight: 700, fill: stroke }}>
        {score}%
      </text>
    </svg>
  );
}

function MatchCard({ match, onConnect, onRate }) {
  const [expanded, setExpanded] = useState(false);
  const tier = getScoreTier(match.score);
  const { label, bg } = SCORE_COLORS[tier];
  const them = match.user;
  const initials = them?.name
    ? them.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <div className={`match-card tier-${tier}`} style={{ background: bg }}>
      <div className="match-card-header">
        <div className="match-user-info">
          <div className="match-avatar">{initials}</div>
          <div>
            <p className="match-name">{them?.name || 'Neighbour'}</p>
            <p className="match-location">
  📍 {them?.neighbourhood || 'Nearby'}
  {match.distance_km !== null && match.distance_km !== undefined && (
    <span style={{
      marginLeft: '0.5rem',
      fontSize: '0.8rem',
      background: match.distance_km <= 5 ? '#e8f5e9' : match.distance_km <= 25 ? '#fff3e0' : '#fce4ec',
      color: match.distance_km <= 5 ? '#2e7d32' : match.distance_km <= 25 ? '#e65100' : '#c62828',
      padding: '0.15rem 0.5rem',
      borderRadius: '20px',
      fontWeight: 600
    }}>
      {match.distance_km <= 1 ? 'Very nearby' : `${match.distance_km.toFixed(1)} km away`}
    </span>
  )}
</p>
            <MatchRating userId={them?.id} />
          </div>
        </div>
        <div className="match-score-area">
          <ScoreRing score={match.score} size={64} />
          <span className={`match-score-label tier-${tier}`}>{label}</span>
        </div>
      </div>

      <div className="match-exchange">
        {match.offer_match && (
          <>
            <div className="exchange-row">
              <span className="exchange-direction you">You offer</span>
              <span className="exchange-text">
                {match.offer_match.split('↔')[0]?.trim()}
              </span>
            </div>
            <div className="exchange-arrow">⇄</div>
            <div className="exchange-row">
              <span className="exchange-direction them">They need</span>
              <span className="exchange-text">
                {match.offer_match.split('↔')[1]?.trim()}
              </span>
            </div>
          </>
        )}
      </div>

      {expanded && match.need_match && (
        <div className="match-needs">
          <div className="need-row">
            <span className="need-label">Also matched:</span>
            <span>{match.need_match}</span>
          </div>
        </div>
      )}

      <div className="match-card-footer">
        <div className="match-actions">
          {match.need_match && (
            <button className="btn-expand" onClick={() => setExpanded(e => !e)}>
              {expanded ? 'Show less ↑' : 'Details ↓'}
            </button>
          )}
          <button className="btn-connect" onClick={() => onConnect(match)}>
            Connect →
          </button>
          <button className="btn-connect"
            style={{ background: '#E8A23A' }}
            onClick={() => onRate(match.user)}>
            ⭐ Rate
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectModal({ match, onClose }) {
  const [sent, setSent] = useState(false);
  const firstName = match?.user?.name?.split(' ')[0] || 'Neighbour';
  const [message, setMessage] = useState(
    `Hi ${firstName}! I noticed we have a great skill match. Would you be open to a skill exchange?`
  );

  const handleSend = async () => {
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
  };

  if (!match) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {sent ? (
          <div className="modal-sent">
            <div className="sent-icon">✉️</div>
            <h3>Message sent to {firstName}!</h3>
            <p>You'll get a notification when they respond.</p>
            <button className="btn-close-modal" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-avatar">
                {match.user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h3>Connect with {match.user?.name}</h3>
                <p>{match.user?.neighbourhood} · {match.score} score</p>
              </div>
              <button className="modal-close-btn" onClick={onClose}>✕</button>
            </div>
            <div className="modal-body">
              <label className="modal-label">Your message</label>
              <textarea
                className="modal-textarea"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
              />
              <div className="safety-tip" style={{ marginTop: '1rem' }}>
                🛡️ <strong>Safety tip:</strong> Always meet in a public place first.
                Never share personal address until you trust the person.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-send" onClick={handleSend}>Send Message →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MyMatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [filter, setFilter]                   = useState('all');
  const [connectingMatch, setConnectingMatch] = useState(null);
  const [reviewUser, setReviewUser]           = useState(null);

  useEffect(() => {
    if (user) fetchMatches();
  }, [user]);

  async function fetchMatches() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/matches/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch matches');
      const data = await res.json();
      setMatches(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h2>Please log in to see your matches</h2>
      <a href="/login" style={{ color: '#C0692A' }}>Go to Login</a>
    </div>
  );

  const filtered = matches.filter(m => {
    if (filter === 'high')   return m.score >= 5;
    if (filter === 'medium') return m.score >= 2 && m.score < 5;
    return true;
  });

  const highCount   = matches.filter(m => m.score >= 5).length;
  const mediumCount = matches.filter(m => m.score >= 2 && m.score < 5).length;

  return (
    <div className="matches-page">
      {connectingMatch && (
        <ConnectModal match={connectingMatch} onClose={() => setConnectingMatch(null)} />
      )}
      {reviewUser && (
        <ReviewModal user={reviewUser} onClose={() => setReviewUser(null)} />
      )}

      <div className="matches-container">
        <div className="matches-header">
          <span className="matches-eyebrow">Powered by AI</span>
          <h1 className="matches-title">Your Matches</h1>
          <p className="matches-subtitle">
            Neighbours where you can help each other based on your skills.
          </p>
          <div className="matches-stats">
            <div className="stat-chip"><strong>{matches.length}</strong> matches found</div>
            <div className="stat-chip high"><strong>{highCount}</strong> excellent</div>
            <div className="stat-chip medium"><strong>{mediumCount}</strong> good</div>
          </div>
        </div>

        <div className="matches-filters">
          {[
            { key: 'all',    label: 'All Matches' },
            { key: 'high',   label: '⭐ Excellent' },
            { key: 'medium', label: '👍 Good' },
          ].map(f => (
            <button key={f.key}
              className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="matches-loading">
            {[1,2,3].map(i => <div key={i} className="match-skeleton" />)}
          </div>
        ) : error ? (
          <div className="matches-empty">
            <p className="empty-icon">⚠️</p>
            <h3>Could not load matches</h3>
            <p>{error}</p>
            <button onClick={fetchMatches} style={{ marginTop: '1rem', color: '#C0692A' }}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="matches-empty">
            <p className="empty-icon">🔍</p>
            <h3>No matches yet</h3>
            <p>Post some skills first and we'll find your matches!</p>
            <a href="/post" style={{ color: '#C0692A', marginTop: '1rem', display: 'block' }}>
              Post a skill →
            </a>
          </div>
        ) : (
          <div className="matches-list">
            {filtered.map((match, i) => (
              <div key={i} style={{ animationDelay: `${i * 0.08}s` }}
                className="match-item-wrapper">
                <MatchCard match={match} onConnect={setConnectingMatch} onRate={setReviewUser} />
              </div>
            ))}
          </div>
        )}

        <div className="scoring-explainer">
          <h3>How matching works</h3>
          <p>Our engine finds neighbours where <strong>you can help them AND they can help you</strong>.</p>
          <div className="score-legend">
            <span className="legend-dot high" /> High = Excellent
            <span className="legend-dot medium" /> Medium = Good
            <span className="legend-dot low" /> Low = Possible
          </div>
        </div>
      </div>
    </div>
  );
}