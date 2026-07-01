import { useState } from 'react';
import clsx from 'clsx';

// Renders the dish photo, falling back to a branded gradient + emoji if the
// remote image fails to load (so the grid never shows broken-image icons).
export function FoodImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-300 dark:from-stone-800 dark:to-stone-700',
          className
        )}
        aria-label={alt}
        role="img"
      >
        <span className="text-4xl opacity-80" aria-hidden>
          🍽️
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={clsx('object-cover', className)}
    />
  );
}
