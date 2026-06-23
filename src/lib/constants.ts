import {
  Send, ArrowDownLeft, Smartphone, CreditCard, QrCode, Receipt,
  Ticket, ShoppingBag
} from "lucide-react";

// Shared transaction type → icon mapping (used in Dashboard, History, etc.)
export const txTypeIcons: Record<string, React.ElementType> = {
  transfer: Send,
  received: ArrowDownLeft,
  airtime: Smartphone,
  data: Smartphone,
  bill: CreditCard,
  "qr-pay": QrCode,
  payment: Receipt,
};

// Status badge color classes (semantic tokens only)
export const txStatusColors: Record<string, string> = {
  completed: "bg-primary/10 text-primary",
  pending: "bg-accent/10 text-accent",
  failed: "bg-destructive/10 text-destructive",
  flagged: "bg-destructive/10 text-destructive",
  reversed: "bg-muted text-muted-foreground",
};

export const kycStatusColors: Record<string, string> = {
  verified: "text-primary bg-primary/10",
  pending: "text-accent bg-accent/10",
  rejected: "text-destructive bg-destructive/10",
  expired: "text-muted-foreground bg-muted",
};

export const accountStatusColors: Record<string, string> = {
  active: "text-primary bg-primary/10",
  frozen: "text-accent bg-accent/10",
  suspended: "text-destructive bg-destructive/10",
  closed: "text-muted-foreground bg-muted",
};

export const integrationStatusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  inactive: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-destructive",
  testing: "bg-accent/10 text-accent",
};

export const smaiPinStatusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  redeemed: "bg-accent/10 text-accent",
  revoked: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
};
