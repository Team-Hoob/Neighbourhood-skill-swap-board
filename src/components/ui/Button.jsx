import './Button.css';

/**
 * Button
 * 
 * Props:
 *  variant  — 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'  (default: 'primary')
 *  size     — 'sm' | 'md' | 'lg'  (default: 'md')
 *  loading  — bool
 *  fullWidth — bool
 *  icon     — ReactNode (left icon)
 *  iconRight — ReactNode (right icon)
 *  disabled — bool
 *  onClick, type, etc. — passed through
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconRight,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={[
        'ss-btn',
        `ss-btn--${variant}`,
        `ss-btn--${size}`,
        fullWidth ? 'ss-btn--full' : '',
        loading  ? 'ss-btn--loading' : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="ss-btn__spinner" aria-hidden="true" />}
      {!loading && icon && <span className="ss-btn__icon ss-btn__icon--left">{icon}</span>}
      <span className="ss-btn__label">{children}</span>
      {!loading && iconRight && <span className="ss-btn__icon ss-btn__icon--right">{iconRight}</span>}
    </button>
  );
}
