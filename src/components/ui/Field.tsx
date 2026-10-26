import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const control =
  'w-full rounded-xl border border-white/10 bg-midnight-950/60 px-4 py-3 text-[15px] text-white placeholder:text-slate-500 transition focus:border-electric-400/60 focus:outline-none focus:ring-2 focus:ring-electric-400/30 aria-[invalid=true]:border-rose-400/70';

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
  className?: string;
}

function FieldShell({ label, hint, error, children, className = '' }: FieldShellProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-200">
        {label}
      </label>
      {children(id, hint || error ? msgId : undefined)}
      {(error || hint) && (
        <p id={msgId} className={`mt-1.5 text-xs ${error ? 'text-rose-300' : 'text-slate-400'}`} role={error ? 'alert' : undefined}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

type Common = { label: string; hint?: string; error?: string; wrapperClassName?: string };

export function TextField({ label, hint, error, wrapperClassName, className = '', ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={wrapperClassName}>
      {(id, describedBy) => (
        <input id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={`${control} ${className}`} {...rest} />
      )}
    </FieldShell>
  );
}

export function TextArea({ label, hint, error, wrapperClassName, className = '', ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={wrapperClassName}>
      {(id, describedBy) => (
        <textarea id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={`${control} min-h-[96px] resize-y ${className}`} {...rest} />
      )}
    </FieldShell>
  );
}

export function SelectField({ label, hint, error, wrapperClassName, className = '', children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={wrapperClassName}>
      {(id, describedBy) => (
        <select id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={`${control} appearance-none bg-[length:16px] ${className}`} {...rest}>
          {children}
        </select>
      )}
    </FieldShell>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-slate-100">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-400">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-brand-primary' : 'bg-white/15'}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'start-6' : 'start-1'}`} />
      </button>
    </label>
  );
}
