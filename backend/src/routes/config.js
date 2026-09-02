import { Router } from 'express';

const router = Router();

// Single source of truth for client-visible config. The frontend fetches this
// at runtime instead of baking values in at build time.
router.get('/', (_req, res) => {
  res.json({
    restaurantName: process.env.RESTAURANT_NAME || 'Saffron & Sage',
    currencyCode: process.env.CURRENCY_CODE || 'USD',
    currencySymbol: process.env.CURRENCY_SYMBOL || '$',
    deliveryFeeCents: Number(process.env.DELIVERY_FEE_CENTS || 299),
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  });
});

export default router;
