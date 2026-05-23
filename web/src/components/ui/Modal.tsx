import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  maxWidth?: number;
  preventClose?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 520,
  preventClose = false,
  className = '',
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('ui-modal-open');

    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    window.setTimeout(() => {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      focusable?.[0]?.focus();
    }, 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
      if (focusable.length === 0) {
        e.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('ui-modal-open');
    };
  }, [isOpen, onClose, preventClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ui-modal__overlay"
      onClick={() => !preventClose && onClose()}
    >
      <div
        ref={panelRef}
        className={`ui-modal__panel ${className}`}
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !preventClose) && (
          <div className="ui-modal__header">
            <div>
              {title && <h2 id={titleId} className="ui-modal__title">{title}</h2>}
              {description && <p id={descId} className="ui-modal__description">{description}</p>}
            </div>
            {!preventClose && (
              <button className="ui-modal__close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  );
}
