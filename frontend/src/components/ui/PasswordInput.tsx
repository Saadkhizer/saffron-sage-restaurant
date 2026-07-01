import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import clsx from 'clsx';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  dark?: boolean; // use light-on-dark styling (owner console)
}

// Password field with a show/hide toggle, so users can confirm what they typed
// before submitting instead of only finding out after a failed login.
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, dark, id, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="relative">
        <Lock
          size={16}
          className={clsx(
            'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2',
            dark ? 'text-stone-500' : 'text-stone-400'
          )}
        />
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={clsx(className, 'pl-10 pr-11')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className={clsx(
            'absolute right-3 top-1/2 -translate-y-1/2 transition',
            dark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'
          )}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    );
  }
);
