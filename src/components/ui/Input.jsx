import './Input.css';

/**
 * Input
 *
 * Props:
 *  label       — string
 *  error       — string (shows below input in red)
 *  hint        — string (shows below input in muted)
 *  icon        — ReactNode (left icon inside input)
 *  iconRight   — ReactNode (right icon inside input)
 *  fullWidth   — bool (default true)
 *  as          — 'input' | 'textarea'  (default: 'input')
 *  rows        — number (only for textarea)
 *  id, name, value, onChange, placeholder, type, etc — passed through
 */
export default function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
  fullWidth = true,
  as: Tag = 'input',
  rows = 4,
  className = '',
  id,
  ...props
}) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={['ss-field', fullWidth ? 'ss-field--full' : '', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="ss-field__label" htmlFor={inputId}>
          {label}
          {props.required && <span className="ss-field__required" aria-hidden="true">*</span>}
        </label>
      )}

      <div className={['ss-field__wrap', error ? 'ss-field__wrap--error' : '', icon ? 'ss-field__wrap--icon-left' : '', iconRight ? 'ss-field__wrap--icon-right' : ''].filter(Boolean).join(' ')}>
        {icon && <span className="ss-field__icon ss-field__icon--left" aria-hidden="true">{icon}</span>}

        <Tag
          id={inputId}
          className="ss-field__input"
          rows={Tag === 'textarea' ? rows : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />

        {iconRight && <span className="ss-field__icon ss-field__icon--right" aria-hidden="true">{iconRight}</span>}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="ss-field__error" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="ss-field__hint">
          {hint}
        </p>
      )}
    </div>
  );
}
