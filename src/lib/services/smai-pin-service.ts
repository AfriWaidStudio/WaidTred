import { supabase } from "@/integrations/supabase/client";

export type SmaiPin = {
  id: string;
  pin_code: string;
  value: number;
  currency: string;
  status: "active" | "redeemed" | "revoked" | "expired";
  created_by: string | null;
  redeemed_by: string | null;
  redeemed_at: string | null;
  expires_at: string | null;
  created_at: string | null;
};

function generatePinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3 || i === 7) code += "-";
  }
  return code;
}

export const SmaiPinService = {
  generatePinCode,

  async createPin(value: number, createdBy: string | null, expiresInDays = 90) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const { data, error } = await (supabase as any)
      .from("smai_pins")
      .insert({
        pin_code: generatePinCode(),
        value,
        currency: "SMK",
        status: "active",
        created_by: createdBy,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
    return { data: data as SmaiPin | null, error };
  },

  async redeemPin(pinCode: string, userId: string) {
    const { data: pin, error: findError } = await (supabase as any)
      .from("smai_pins")
      .select("*")
      .eq("pin_code", pinCode.toUpperCase().trim())
      .maybeSingle();

    if (findError) return { error: findError.message, data: null };
    if (!pin) return { error: "Invalid pin code", data: null };
    if (pin.status !== "active") return { error: `Pin is ${pin.status}`, data: null };
    if (pin.expires_at && new Date(pin.expires_at) < new Date()) return { error: "Pin has expired", data: null };

    const { error: updateError } = await (supabase as any)
      .from("smai_pins")
      .update({
        status: "redeemed",
        redeemed_by: userId,
        redeemed_at: new Date().toISOString(),
      })
      .eq("id", pin.id);

    if (updateError) return { error: updateError.message, data: null };

    return { data: pin as SmaiPin, error: null };
  },

  async getAllPins() {
    const { data, error } = await (supabase as any)
      .from("smai_pins")
      .select("*")
      .order("created_at", { ascending: false });
    return { data: (data || []) as SmaiPin[], error };
  },

  async revokePin(pinId: string) {
    const { error } = await (supabase as any)
      .from("smai_pins")
      .update({ status: "revoked" })
      .eq("id", pinId);
    return { error };
  },
};
