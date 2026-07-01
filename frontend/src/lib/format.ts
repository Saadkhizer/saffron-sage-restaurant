import { useConfigStore } from '../store/configStore';

// Money is stored as integer cents on the server. Format with the configured
// currency symbol (falls back to "$").
export function formatPrice(cents: number): string {
  const symbol = useConfigStore.getState().config?.currencySymbol ?? '$';
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

export function formatDate(iso: string): string {
  // SQLite datetime('now') returns UTC without a timezone marker.
  const d = new Date(iso.includes('Z') ? iso : iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
