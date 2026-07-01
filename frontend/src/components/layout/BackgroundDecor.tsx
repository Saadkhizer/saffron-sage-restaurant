// Site-wide decorative background: a faint dot pattern plus soft gradient blobs.
// Fixed and behind all content (-z-10); pages with transparent backgrounds let it
// show through, while cards/sections (bg-white etc.) sit on top.
export function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-cream-50 dark:bg-stone-950" />
      {/* dotted texture */}
      <div
        className="absolute inset-0 opacity-50 dark:opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(#f6cabb 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* soft color blobs */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/20" />
      <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl dark:bg-stone-800/30" />
      <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-brand-100/50 blur-3xl dark:bg-brand-900/10" />
    </div>
  );
}
