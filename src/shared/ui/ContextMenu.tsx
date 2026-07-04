import { useEffect, useRef } from 'react';

interface ContextMenuItem {
  label?: string;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 min-w-[160px] py-1 rounded-xl bg-[var(--color-surface-overlay)] backdrop-blur-xl border border-[var(--color-border)] shadow-2xl"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="mx-2 my-1 h-px bg-[var(--color-border)]" />
        ) : (
          <button
            key={i}
            onClick={() => {
              if (!item.disabled) {
                item.action?.();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`
              w-full px-3 py-2 text-left text-xs
              transition-colors duration-100
              ${item.disabled
                ? 'text-[var(--color-text-secondary)]/40 cursor-not-allowed'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
              }
            `}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
