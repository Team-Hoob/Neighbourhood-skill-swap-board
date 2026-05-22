import './Avatar.css';

/**
 * Avatar
 *
 * Props:
 *  user  — { name, avatar_url }
 *  size  — 'xs' | 'sm' | 'md' | 'lg'  (default: 'md')
 */
export default function Avatar({ user, size = 'md', className = '' }) {
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div className={['ss-avatar', `ss-avatar--${size}`, className].filter(Boolean).join(' ')}>
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name ?? 'User avatar'}
          className="ss-avatar__img"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <span className="ss-avatar__initial" aria-label={user?.name ?? 'User'}>
          {initial}
        </span>
      )}
    </div>
  );
}
