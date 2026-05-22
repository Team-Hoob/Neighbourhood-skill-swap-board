import { useState, useEffect } from 'react';
import './MyMatchesPage.css';

// Mock data — swap with useApi('/matches/me') when Shreyas's backend is ready
// const { data: matches, loading } = useApi('/matches/me');
const MOCK_MATCHES = [
  {
    id: 1,
    score: 94,
    them: { name: 'Priya Sharma', neighbourhood: 'Bandra West', avatar: null, initials: 'PS' },
    yourOffer: 'Web development & React tutoring',
    theirOffer: 'Carnatic music lessons',
    yourNeed: 'Music lessons for my daughter',
    theirNeed: 'Help building a portfolio website',
    category: 'tech',
    matched: '2 hours ago',
  },
  {
    id: 2,
    score: 87,
    them: { name: 'Arjun Mehta', neighbourhood: 'Powai', avatar: null, initials: 'AM' },
    yourOffer: 'Excel & data analysis help',
    theirOffer: 'Weekend yoga sessions',
    yourNeed: 'Fitness coaching',
    theirNeed: 'Office productivity tools',
    category: 'fitness',
    matched: '5 hours ago',
  },
  {
    id: 3,
    score: 79,
    them: { name: 'Meera Iyer', neighbourhood: 'Koramangala', avatar: null, initials: 'MI' },
    yourOffer: 'Python programming basics',
    theirOffer: 'South Indian cooking classes',
    yourNeed: 'Learn to cook traditional recipes',
    theirNeed: 'Learn Python for data science',
    category: 'cooking',
    matched: '1 day ago',
  },
  {
    id: 4,
    score: 71,
    them: { name: 'Ravi Kulkarni', neighbourhood: 'Andheri East', avatar: null, initials: 'RK' },
    yourOffer: 'Photography & editing',
    theirOffer: 'Hindi language tutoring',
    yourNeed: 'Improve conversational Hindi',
    theirNeed: 'Product photography for shop',
    category: 'language',
    matched: '2 days ago',
  },
  {
    id: 5,
    score: 65,
    them: { name: 'Sunita Patel', neighbourhood: 'Vile Parle', avatar: null, initials: 'SP' },
    yourOffer: 'Graphic design & Canva',
    theirOffer: 'Gardening & plant care',
    yourNeed: 'Balcony garden setup',
    theirNeed: 'Social media design help',
    category: 'crafts',
    matched: '3 days ago',
  },
];

const SCORE_COLORS = {
  high:   { stroke: '#5A7A5C', label: 'Excellent Match',  bg: 'rgba(90,122,92,0.08)'  },
  medium: { stroke: '#E8A23A', label: 'Good Match',       bg: 'rgba(232,162,58,0.08)' },
  low:    { stroke: '#D4622A', label: 'Possible Match',   bg: 'rgba(212,98,42,0.08)'  },
};

function getScoreTier(score) {
  if (score >= 80) return 'high';
  if (score >= 65) return 'medium';
  return 'low';
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
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#EDE7D9" strokeWidth={7}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={stroke}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: 'var(--font-body)', fontSize: size * 0.22, fontWeight: 700, fill: stroke }}>
        {score}%
      </text>
    </svg>
  );
}

function MatchCard({ match, onConnect }) {
  const [expanded, setExpanded] = useState(false);
  const tier = getScoreTier(match.score);
  const { label, bg } = SCORE_COLORS[tier];

  return (
    <div className={`match-card tier-${tier}`} style={{ background: bg }}>
      {/* Top bar */}
      <div className="match-card-header">
        <div className="match-user-info">
          <div className="match-avatar">{match.them.initials}</div>
          <div>
            <p className="match-name">{match.them.name}</p>
            <p className="match-location">📍 {match.them.neighbourhood}</p>
          </div>
        </div>
        <div className="match-score-area">
          <ScoreRing score={match.score} size={64} />
          <span className={`match-score-label tier-${tier}`}>{label}</span>
        </div>
      </div>

      {/* Exchange summary */}
      <div className="match-exchange">
        <div className="exchange-row">
          <span className="exchange-direction you">You offer</span>
          <span className="exchange-text">{match.yourOffer}</span>
        </div>
        <div className="exchange-arrow">⇄</div>
        <div className="exchange-row">
          <span className="exchange-direction them">They offer</span>
          <span className="exchange-text">{match.theirOffer}</span>
        </div>
      </div>

      {/* Expanded needs section */}
      {expanded && (
        <div className="match-needs">
          <div className="need-row">
            <span className="need-label">Your need:</span>
            <span>{match.yourNeed}</span>
          </div>
          <div className="need-row">
            <span className="need-label">Their need:</span>
            <span>{match.theirNeed}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="match-card-footer">
        <span className="match-time">Matched {match.matched}</span>
        <div className="match-actions">
          <button className="btn-expand" onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Show less ↑' : 'Details ↓'}
          </button>
          <button className="btn-connect" onClick={() => onConnect(match)}>
            Connect →
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectModal({ match, onClose }) {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState(
    `Hi ${match?.them.name?.split(' ')[0]}! I noticed we have a great skill match. I can help with ${match?.yourOffer.toLowerCase()}, and I'd love to learn ${match?.theirOffer.toLowerCase()} from you. Would you be open to a skill exchange?`
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
            <h3>Message sent to {match.them.name.split(' ')[0]}!</h3>
            <p>You'll get a notification when they respond.</p>
            <button className="btn-close-modal" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-avatar">{match.them.initials}</div>
              <div>
                <h3>Connect with {match.them.name}</h3>
                <p>{match.them.neighbourhood} · {match.score}% match</p>
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
  const [filter, setFilter] = useState('all');
  const [connectingMatch, setConnectingMatch] = useState(null);
  const loading = false; // replace with real loading state

  const filtered = MOCK_MATCHES.filter(m => {
    if (filter === 'high')   return m.score >= 80;
    if (filter === 'medium') return m.score >= 65 && m.score < 80;
    return true;
  });

  return (
    <div className="matches-page">
      {connectingMatch && (
        <ConnectModal match={connectingMatch} onClose={() => setConnectingMatch(null)} />
      )}

      <div className="matches-container">
        {/* Header */}
        <div className="matches-header">
          <span className="matches-eyebrow">Powered by AI</span>
          <h1 className="matches-title">Your Matches</h1>
          <p className="matches-subtitle">
            Our NLP engine found these mutual skill exchanges based on what you can offer and what you need.
          </p>

          {/* Stats strip */}
          <div className="matches-stats">
            <div className="stat-chip">
              <strong>{MOCK_MATCHES.length}</strong> matches found
            </div>
            <div className="stat-chip high">
              <strong>{MOCK_MATCHES.filter(m => m.score >= 80).length}</strong> excellent
            </div>
            <div className="stat-chip medium">
              <strong>{MOCK_MATCHES.filter(m => m.score >= 65 && m.score < 80).length}</strong> good
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="matches-filters">
          {[
            { key: 'all',    label: 'All Matches' },
            { key: 'high',   label: '⭐ Excellent (80%+)' },
            { key: 'medium', label: '👍 Good (65–79%)' },
          ].map(f => (
            <button
              key={f.key}
              className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Match list */}
        {loading ? (
          <div className="matches-loading">
            {[1, 2, 3].map(i => <div key={i} className="match-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="matches-empty">
            <p className="empty-icon">🔍</p>
            <h3>No matches in this range yet</h3>
            <p>Try posting more skills to improve your matches.</p>
          </div>
        ) : (
          <div className="matches-list">
            {filtered.map((match, i) => (
              <div
                key={match.id}
                style={{ animationDelay: `${i * 0.08}s` }}
                className="match-item-wrapper"
              >
                <MatchCard match={match} onConnect={setConnectingMatch} />
              </div>
            ))}
          </div>
        )}

        {/* How scoring works */}
        <div className="scoring-explainer">
          <h3>How matching works</h3>
          <p>
            Our AI reads your skill descriptions and finds neighbours where
            <strong> you can help them AND they can help you</strong>. The score reflects
            how well the exchange works both ways — higher means a tighter mutual fit.
          </p>
          <div className="score-legend">
            <span className="legend-dot high" /> 80–100% Excellent
            <span className="legend-dot medium" /> 65–79% Good
            <span className="legend-dot low" /> Below 65% Possible
          </div>
        </div>
      </div>
    </div>
  );
}
