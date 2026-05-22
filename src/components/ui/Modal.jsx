import { useEffect, useRef } from 'react';
import './Modal.css';

/**
 * Modal
 *
 * Props:
 *  open      — bool
 *  onClose   — fn()
 *  title     — string
 *  size      — 'sm' | 'md' | 'lg'  (default: 'md')
 *  children  — content
 *  footer    — ReactNode (buttons etc.)
 */
export default function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
}) {
  const dialogRef = useRef(null);

  // Lock scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Focus trap: focus first focusable element
      const el = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      el?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ss-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={dialogRef}
        className={['ss-modal', `ss-modal--${size}`].join(' ')}
      >
        {/* Header */}
        {title && (
          <div className="ss-modal__header">
            <h2 className="ss-modal__title">{title}</h2>
            <button
              className="ss-modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="ss-modal__body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="ss-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
