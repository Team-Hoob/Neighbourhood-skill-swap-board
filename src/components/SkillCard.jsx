import SkillTag from './ui/SkillTag';
import Avatar from './Avatar';
import './SkillCard.css';

/**
 * SkillCard
 *
 * Props:
 *  skill  — { id, user_id, description, category, type: 'offer'|'need', created_at }
 *  user   — { id, name, neighbourhood, avatar_url }  (optional, shown if provided)
 *  onDelete — fn(skillId) — if provided, shows a delete button (own posts)
 *  onClick  — fn(skill)   — if provided, whole card is clickable
 *  compact  — bool, smaller version for dense lists
 */
export default function SkillCard({
  skill,
  user,
  onDelete,
  onClick,
  compact = false,
}) {
  if (!skill) return null;

  const isOffer = skill.type === 'offer';

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(skill.id);
  };

  return (
    <article
      className={[
        'skill-card',
        `skill-card--${skill.type}`,
        compact ? 'skill-card--compact' : '',
        onClick ? 'skill-card--clickable' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => onClick?.(skill)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(skill) : undefined}
    >
      {/* Top row: type badge + category tag */}
      <div className="skill-card__top">
        <span className={`skill-card__type skill-card__type--${skill.type}`}>
          <span className="skill-card__type-dot" aria-hidden="true" />
          {isOffer ? 'Offering' : 'Needs'}
        </span>

        {skill.category && (
          <SkillTag category={skill.category} size="sm" />
        )}
      </div>

      {/* Description */}
      <p className="skill-card__desc">{skill.description}</p>

      {/* Footer: user info + actions */}
      <div className="skill-card__footer">
        {user && (
          <div className="skill-card__user">
            <Avatar user={user} size="xs" />
            <div className="skill-card__user-info">
              <span className="skill-card__user-name">{user.name}</span>
              {user.neighbourhood && (
                <span className="skill-card__neighbourhood">
                  📍 {user.neighbourhood}
                </span>
              )}
            </div>
          </div>
        )}

        {onDelete && (
          <button
            className="skill-card__delete"
            onClick={handleDelete}
            aria-label="Delete skill"
            title="Delete"
          >
            ✕
          </button>
        )}
      </div>

      {/* Hover arrow indicator */}
      {onClick && (
        <span className="skill-card__arrow" aria-hidden="true">→</span>
      )}
    </article>
  );
}
