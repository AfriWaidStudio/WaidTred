export interface Transaction {
  id: string;
  type: "transfer" | "airtime" | "data" | "bill" | "received" | "qr-pay";
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  date: string;
  senderCountry?: string;
  receiverCountry?: string;
  recipient?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  countryCode: string;
  avatar: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  phonePrefix: string;
}

export const wallet = {
  totalBalance: 24580.0,
  availableBalance: 22100.0,
  lockedBalance: 2480.0,
  currency: "SMK",
  usdEquivalent: 2458.0,
  growth: 12.4,
};

export const countries: Country[] = [
  { code: "GH", name: "Ghana", currency: "GHS", currencySymbol: "₵", flag: "🇬🇭", phonePrefix: "+233" },
  { code: "NG", name: "Nigeria", currency: "NGN", currencySymbol: "₦", flag: "🇳🇬", phonePrefix: "+234" },
  { code: "KE", name: "Kenya", currency: "KES", currencySymbol: "KSh", flag: "🇰🇪", phonePrefix: "+254" },
  { code: "ZA", name: "South Africa", currency: "ZAR", currencySymbol: "R", flag: "🇿🇦", phonePrefix: "+27" },
  { code: "US", name: "United States", currency: "USD", currencySymbol: "$", flag: "🇺🇸", phonePrefix: "+1" },
  { code: "GB", name: "United Kingdom", currency: "GBP", currencySymbol: "£", flag: "🇬🇧", phonePrefix: "+44" },
  { code: "DE", name: "Germany", currency: "EUR", currencySymbol: "€", flag: "🇩🇪", phonePrefix: "+49" },
  { code: "IN", name: "India", currency: "INR", currencySymbol: "₹", flag: "🇮🇳", phonePrefix: "+91" },
];

export const exchangeRates: Record<string, number> = {
  SMK: 1,
  USD: 0.1,
  GHS: 1.2,
  NGN: 75,
  KES: 14.5,
  ZAR: 1.8,
  GBP: 0.08,
  EUR: 0.09,
  INR: 8.3,
};

export const recentContacts: Contact[] = [
  { id: "1", name: "Kwame Asante", phone: "+233 24 123 4567", country: "GH", countryCode: "GH", avatar: "KA" },
  { id: "2", name: "Amina Bello", phone: "+234 80 123 4567", country: "NG", countryCode: "NG", avatar: "AB" },
  { id: "3", name: "John Kamau", phone: "+254 70 123 4567", country: "KE", countryCode: "KE", avatar: "JK" },
  { id: "4", name: "Sarah Mills", phone: "+44 7700 900123", country: "GB", countryCode: "GB", avatar: "SM" },
  { id: "5", name: "Priya Sharma", phone: "+91 98765 43210", country: "IN", countryCode: "IN", avatar: "PS" },
];

export const transactions: Transaction[] = [
  { id: "tx1", type: "transfer", title: "Sent to Kwame Asante", description: "Ghana • GHS", amount: -500, currency: "SMK", status: "completed", date: "2026-04-03T10:30:00Z", receiverCountry: "GH", recipient: "Kwame Asante" },
  { id: "tx2", type: "received", title: "From Amina Bello", description: "Nigeria • NGN", amount: 1200, currency: "SMK", status: "completed", date: "2026-04-03T08:15:00Z", senderCountry: "NG" },
  { id: "tx3", type: "airtime", title: "Airtime Recharge", description: "MTN Ghana • +233 24 XXX", amount: -50, currency: "SMK", status: "completed", date: "2026-04-02T14:00:00Z" },
  { id: "tx4", type: "bill", title: "ECG Bill Payment", description: "Electricity • Ghana", amount: -320, currency: "SMK", status: "completed", date: "2026-04-02T09:45:00Z" },
  { id: "tx5", type: "transfer", title: "Sent to John Kamau", description: "Kenya • KES", amount: -800, currency: "SMK", status: "pending", date: "2026-04-01T16:20:00Z", receiverCountry: "KE", recipient: "John Kamau" },
  { id: "tx6", type: "data", title: "Data Bundle", description: "Airtel Nigeria • 5GB", amount: -100, currency: "SMK", status: "completed", date: "2026-04-01T11:00:00Z" },
  { id: "tx7", type: "received", title: "From Sarah Mills", description: "UK • GBP", amount: 3500, currency: "SMK", status: "completed", date: "2026-03-31T20:00:00Z", senderCountry: "GB" },
  { id: "tx8", type: "qr-pay", title: "Merchant Payment", description: "Shoprite • South Africa", amount: -250, currency: "SMK", status: "completed", date: "2026-03-31T13:30:00Z" },
  { id: "tx9", type: "transfer", title: "Sent to Priya Sharma", description: "India • INR", amount: -1500, currency: "SMK", status: "failed", date: "2026-03-30T07:00:00Z", receiverCountry: "IN", recipient: "Priya Sharma" },
  { id: "tx10", type: "airtime", title: "Airtime Recharge", description: "Vodafone UK • +44 77XX", amount: -30, currency: "SMK", status: "completed", date: "2026-03-29T15:45:00Z" },
];

export const dataPlans = [
  { id: "d1", name: "1GB Daily", price: 20, validity: "24 hours" },
  { id: "d2", name: "3GB Weekly", price: 50, validity: "7 days" },
  { id: "d3", name: "5GB Monthly", price: 100, validity: "30 days" },
  { id: "d4", name: "10GB Monthly", price: 180, validity: "30 days" },
  { id: "d5", name: "Unlimited Monthly", price: 350, validity: "30 days" },
];

export const providers: Record<string, string[]> = {
  GH: ["MTN", "Vodafone", "AirtelTigo"],
  NG: ["MTN", "Airtel", "Glo", "9mobile"],
  KE: ["Safaricom", "Airtel", "Telkom"],
  ZA: ["Vodacom", "MTN", "Cell C", "Telkom"],
  US: ["AT&T", "T-Mobile", "Verizon"],
  GB: ["Vodafone", "EE", "Three", "O2"],
  DE: ["Telekom", "Vodafone", "O2"],
  IN: ["Jio", "Airtel", "Vi", "BSNL"],
};

export const convertCurrency = (amount: number, from: string, to: string): number => {
  const fromRate = exchangeRates[from] || 1;
  const toRate = exchangeRates[to] || 1;
  return (amount / fromRate) * toRate;
};
