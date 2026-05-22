import Avatar from './Avatar';
import SkillTag from './ui/SkillTag';
import './MatchCard.css';

/**
 * MatchCard
 *
 * Props:
 *  match  — { user_a, user_b, score, offer_match, need_match }
 *           score is 0–1 float from Sarvagya's NLP engine
 *  currentUserId — to determine which side is "you" vs "them"
 *  onClick — fn(match)
 */
export default function MatchCard({ match, currentUserId, onClick }) {
  if (!match) return null;

  const { user_a, user_b, score, offer_match, need_match } = match;

  // Figure out which user is "them"
  const isA   = user_a?.id === currentUserId;
  const them  = isA ? user_b : user_a;
  const myOffer = isA ? offer_match : need_match;   // what I offer them
  const myNeed  = isA ? need_match  : offer_match;  // what they offer me

  // score is 0-1 from NLP; convert to percentage
  const pct = Math.round((score ?? 0) * 100);

  // Score color
  const scoreColor =
    pct >= 80 ? 'var(--sage)' :
    pct >= 60 ? 'var(--amber)' :
    'var(--muted)';

  return (
    <article
      className={['match-card', onClick ? 'match-card--clickable' : ''].filter(Boolean).join(' ')}
      onClick={() => onClick?.(match)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(match) : undefined}
    >
      {/* Score badge */}
      <div className="match-card__score-wrap">
        <svg className="match-card__ring" viewBox="0 0 40 40" aria-hidden="true">
          <circle className="match-card__ring-bg" cx="20" cy="20" r="16" />
          <circle
            className="match-card__ring-fill"
            cx="20" cy="20" r="16"
            style={{
              strokeDasharray: `${2 * Math.PI * 16}`,
              strokeDashoffset: `${2 * Math.PI * 16 * (1 - pct / 100)}`,
              stroke: scoreColor,
            }}
          />
        </svg>
        <span className="match-card__score-text" style={{ color: scoreColor }}>
          {pct}<span className="match-card__score-pct">%</span>
        </span>
      </div>

      {/* Main content */}
      <div className="match-card__body">
        {/* User */}
        <div className="match-card__user">
          <Avatar user={them} size="sm" />
          <div>
            <p className="match-card__name">{them?.name ?? 'Unknown'}</p>
            {them?.neighbourhood && (
              <p className="match-card__neighbourhood">📍 {them.neighbourhood}</p>
            )}
          </div>
        </div>

        {/* Exchange details */}
        <div className="match-card__exchange">
          <div className="match-card__row">
            <span className="match-card__row-label match-card__row-label--offer">You offer</span>
            <p className="match-card__row-text">{myOffer ?? '—'}</p>
          </div>
          <div className="match-card__divider" aria-hidden="true">⇄</div>
          <div className="match-card__row">
            <span className="match-card__row-label match-card__row-label--need">They offer</span>
            <p className="match-card__row-text">{myNeed ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Connect button area */}
      <div className="match-card__actions">
        <span className="match-card__connect">
          Connect <span aria-hidden="true">→</span>
        </span>
      </div>
    </article>
  );
}
