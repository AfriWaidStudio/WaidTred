import type { InventoryItem, SokoOrder } from "./services/sokoplace-service";

export const mockInventory: InventoryItem[] = [
  // Smaionyix Tokens
  { id: "inv-1", asset_type: "token", asset_name: "Sika", description: "Smai Sika — the core unit of value in the WaidTred ecosystem", image_url: null, value: 1, price_in_sika: 1, quantity: 999999, status: "available", metadata: {}, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "inv-2", asset_type: "token", asset_name: "Maiki", description: "Maiki — loyalty & rewards token, 10 Maiki = 1 Sika", image_url: null, value: 0.1, price_in_sika: 0.1, quantity: 500000, status: "available", metadata: {}, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "inv-3", asset_type: "token", asset_name: "Onyixki", description: "Onyixki — premium governance token", image_url: null, value: 50, price_in_sika: 50, quantity: 10000, status: "available", metadata: {}, created_at: "2026-04-01", updated_at: "2026-04-01" },
  // Crypto (future-ready)
  { id: "inv-4", asset_type: "crypto", asset_name: "BTC", description: "Bitcoin — world's leading cryptocurrency", image_url: null, value: 65000, price_in_sika: 325000, quantity: 5, status: "available", metadata: {}, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "inv-5", asset_type: "crypto", asset_name: "USDT", description: "Tether — USD stablecoin", image_url: null, value: 1, price_in_sika: 5, quantity: 100000, status: "available", metadata: {}, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "inv-6", asset_type: "crypto", asset_name: "ETH", description: "Ethereum — smart contract platform", image_url: null, value: 3400, price_in_sika: 17000, quantity: 20, status: "available", metadata: {}, created_at: "2026-04-01", updated_at: "2026-04-01" },
  // Gift Cards
  { id: "inv-7", asset_type: "giftcard", asset_name: "Apple Gift Card", description: "$25 Apple Gift Card", image_url: null, value: 25, price_in_sika: 135, quantity: 50, status: "available", metadata: { denomination: "$25" }, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "inv-8", asset_type: "giftcard", asset_name: "Amazon Gift Card", description: "$50 Amazon Gift Card", image_url: null, value: 50, price_in_sika: 260, quantity: 30, status: "available", metadata: { denomination: "$50" }, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "inv-9", asset_type: "giftcard", asset_name: "Steam Gift Card", description: "$20 Steam Gift Card", image_url: null, value: 20, price_in_sika: 110, quantity: 40, status: "low", metadata: { denomination: "$20" }, created_at: "2026-04-01", updated_at: "2026-04-01" },
  // SmaiPin
  { id: "inv-10", asset_type: "smaipin", asset_name: "SmaiPin ꠄ500", description: "SmaiPin worth ꠄ500 Sika", image_url: null, value: 500, price_in_sika: 500, quantity: 100, status: "available", metadata: {}, created_at: "2026-04-01", updated_at: "2026-04-01" },
  { id: "inv-11", asset_type: "smaipin", asset_name: "SmaiPin ꠄ1000", description: "SmaiPin worth ꠄ1,000 Sika", image_url: null, value: 1000, price_in_sika: 1000, quantity: 50, status: "available", metadata: {}, created_at: "2026-04-01", updated_at: "2026-04-01" },
];

export const mockOrders: SokoOrder[] = [
  { id: "ord-1", user_id: "u1", asset_type: "giftcard", asset_name: "Apple Gift Card", quantity: 1, unit_price: 135, total_price: 135, order_type: "buy", status: "completed", delivery_status: "delivered", delivery_data: { code: "APPL-XXXX-XXXX" }, proof_url: null, admin_notes: null, created_at: "2026-04-05T10:00:00Z", updated_at: "2026-04-05T10:05:00Z" },
  { id: "ord-2", user_id: "u1", asset_type: "token", asset_name: "Onyixki", quantity: 2, unit_price: 50, total_price: 100, order_type: "buy", status: "completed", delivery_status: "delivered", delivery_data: {}, proof_url: null, admin_notes: null, created_at: "2026-04-04T14:00:00Z", updated_at: "2026-04-04T14:01:00Z" },
  { id: "ord-3", user_id: "u1", asset_type: "giftcard", asset_name: "Steam Gift Card", quantity: 1, unit_price: 110, total_price: 110, order_type: "sell", status: "pending", delivery_status: "pending", delivery_data: {}, proof_url: "https://example.com/proof.jpg", admin_notes: null, created_at: "2026-04-06T08:00:00Z", updated_at: "2026-04-06T08:00:00Z" },
];

export const assetCategoryLabels: Record<string, string> = {
  token: "Smaionyix Tokens",
  crypto: "Crypto",
  giftcard: "Gift Cards",
  smaipin: "SmaiPin",
};

export const assetCategoryIcons: Record<string, string> = {
  token: "ꠄ",
  crypto: "₿",
  giftcard: "🎁",
  smaipin: "🎟️",
};

export const orderStatusColors: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  processing: "bg-primary/10 text-primary",
  completed: "bg-primary/10 text-primary",
  failed: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
};

export const deliveryStatusColors: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  delivered: "bg-primary/10 text-primary",
  failed: "bg-destructive/10 text-destructive",
};

export const inventoryStatusColors: Record<string, string> = {
  available: "bg-primary/10 text-primary",
  low: "bg-accent/10 text-accent",
  out_of_stock: "bg-destructive/10 text-destructive",
  disabled: "bg-muted text-muted-foreground",
};
