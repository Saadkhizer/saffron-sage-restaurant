import { create } from 'zustand';
import { api } from '../api/client';
import type { AppConfig } from '../types';

interface ConfigState {
  config: AppConfig | null;
  loading: boolean;
  load: () => Promise<void>;
}

// Runtime config is fetched from the server (single source of truth) rather than
// baked in at build time. This is how the Google client id reaches the client.
export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  loading: true,
  load: async () => {
    if (get().config) return;
    try {
      const config = await api<AppConfig>('/config');
      set({ config, loading: false });
      document.title = `${config.restaurantName} — Order Online`;
    } catch {
      // Fall back to safe defaults so the app still renders if config fails.
      set({
        config: {
          restaurantName: 'Crave It',
          currencyCode: 'USD',
          currencySymbol: '$',
          deliveryFeeCents: 299,
          googleClientId: '',
        },
        loading: false,
      });
    }
  },
}));
