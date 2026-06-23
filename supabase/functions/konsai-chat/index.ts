// KonsAI streaming chat with tool calling.
// Tools let the AI act on the user's behalf: send money, schedule actions,
// look up balance, contacts, transactions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALL_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_balance",
      description: "Get the current user's wallet balance in Smai Sika.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_recent_transactions",
      description: "List the user's most recent transactions.",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", description: "How many to return (default 10)" } },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_contact",
      description: "Find a contact by name, phone, or email. Returns contact details + user_id if registered.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Name, phone, or email to search" } },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_money",
      description: "Send Smai Sika to another user. Requires you to first find_contact to get a user_id.",
      parameters: {
        type: "object",
        properties: {
          recipient_user_id: { type: "string" },
          amount: { type: "number" },
          description: { type: "string" },
        },
        required: ["recipient_user_id", "amount"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "schedule_action",
      description: "Schedule a future action: reminder for the user, notify a contact, send money, or request money. Use ISO datetime.",
      parameters: {
        type: "object",
        properties: {
          action_type: { type: "string", enum: ["reminder", "notify_contact", "send_money", "request_money"] },
          scheduled_for: { type: "string", description: "ISO 8601 datetime, e.g. 2026-05-08T18:00:00Z" },
          message: { type: "string" },
          target_contact: { type: "string", description: "Phone or email (optional)" },
          target_user_id: { type: "string" },
          amount: { type: "number" },
        },
        required: ["action_type", "scheduled_for"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_scheduled",
      description: "List the user's pending scheduled actions.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "get_spending_summary",
      description: "Summarize spending by category over the last N days.",
      parameters: {
        type: "object",
        properties: { days: { type: "number" } },
        additionalProperties: false,
      },
    },
  },
];

const READ_ONLY_TOOL_NAMES = new Set(["get_balance", "get_recent_transactions", "get_spending_summary"]);
const TOOLS = ALL_TOOLS.filter((tool) => READ_ONLY_TOOL_NAMES.has(tool.function.name));

async function runTool(name: string, args: any, supabase: any, userId: string) {
  try {
    if (!READ_ONLY_TOOL_NAMES.has(name)) return { error: "Financial actions are disabled for Waides KI" };
    switch (name) {
      case "get_balance": {
        const { data } = await supabase.from("wallets").select("available_balance, locked_balance, total_balance, currency_type").eq("user_id", userId).maybeSingle();
        return data ?? { error: "No wallet" };
      }
      case "get_recent_transactions": {
        const { data } = await supabase.from("transactions").select("type,title,amount,currency,recipient,status,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(args?.limit ?? 10);
        return data ?? [];
      }
      case "find_contact": {
        const q = String(args.query ?? "").trim();
        const { data: contacts } = await supabase.from("contacts").select("name,phone,email,contact_user_id").or(`name.ilike.%${q}%,phone.eq.${q},email.eq.${q}`).eq("user_id", userId).limit(5);
        const { data: profile } = await supabase.from("profiles").select("id,full_name,phone,email").or(`phone.eq.${q},email.eq.${q}`).maybeSingle();
        return { contacts: contacts ?? [], registered_user: profile };
      }
      case "send_money": {
        const { data, error } = await supabase.rpc("send_money", {
          _recipient_id: args.recipient_user_id,
          _amount: args.amount,
          _description: args.description ?? null,
        });
        if (error) return { error: error.message };
        return { success: true, transaction_id: data };
      }
      case "schedule_action": {
        const { data, error } = await supabase.rpc("create_scheduled_action", {
          _action_type: args.action_type,
          _scheduled_for: args.scheduled_for,
          _message: args.message ?? null,
          _target_contact: args.target_contact ?? null,
          _target_user_id: args.target_user_id ?? null,
          _amount: args.amount ?? null,
        });
        if (error) return { error: error.message };
        return { success: true, scheduled_action_id: data };
      }
      case "list_scheduled": {
        const { data } = await supabase.from("scheduled_actions").select("id,action_type,scheduled_for,message,amount,target_contact,status").eq("user_id", userId).eq("status", "pending").order("scheduled_for");
        return data ?? [];
      }
      case "get_spending_summary": {
        const days = args?.days ?? 30;
        const since = new Date(Date.now() - days * 86400000).toISOString();
        const { data } = await supabase.from("wallet_ledger").select("category,amount").eq("user_id", userId).eq("direction", "debit").gte("created_at", since);
        const totals: Record<string, number> = {};
        (data ?? []).forEach((r: any) => { totals[r.category] = (totals[r.category] ?? 0) + Number(r.amount); });
        return { since, totals };
      }
      default:
        return { error: "Unknown tool" };
    }
  } catch (e: any) {
    return { error: e?.message ?? String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { conversation_id, message } = await req.json();
    if (!message) return new Response(JSON.stringify({ error: "message required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Ensure conversation
    let convId = conversation_id as string | undefined;
    if (!convId) {
      const { data: conv } = await supabase.from("chat_conversations").insert({ user_id: user.id, title: message.slice(0, 60) }).select().single();
      convId = conv!.id;
    }

    // Persist user message
    await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content: message });

    // Load profile + history
    const { data: profile } = await supabase.from("profiles").select("full_name,email,phone,country").eq("id", user.id).maybeSingle();
    const { data: history } = await supabase.from("chat_messages").select("role,content,tool_calls,tool_name").eq("conversation_id", convId).order("created_at").limit(30);

    const sysPrompt = `You are KonsAI, the WaidTred financial assistant. The user is ${profile?.full_name ?? "a user"} (${profile?.email ?? ""}). Currency: Smai Sika (ꠄ, code SMK). Today is ${new Date().toISOString()}.
Provide read-only spending insights, monthly summaries, and practical savings suggestions. Never initiate, schedule, approve, or modify a transaction, account, contact, or wallet. Avoid regulated financial advice and be concise.`;

    const messages: any[] = [{ role: "system", content: sysPrompt }];
    for (const m of history ?? []) {
      if (m.role === "tool") messages.push({ role: "tool", content: m.content, tool_call_id: m.tool_name ?? "t" });
      else if (m.role === "assistant" && m.tool_calls) messages.push({ role: "assistant", content: m.content ?? "", tool_calls: m.tool_calls });
      else messages.push({ role: m.role, content: m.content });
    }

    // Tool-calling loop (non-streaming for simplicity & reliability with tools)
    let assistantText = "";
    for (let iter = 0; iter < 5; iter++) {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, tools: TOOLS }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits depleted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        console.error("AI error", resp.status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const json = await resp.json();
      const choice = json.choices?.[0]?.message;
      if (!choice) break;

      if (choice.tool_calls?.length) {
        messages.push({ role: "assistant", content: choice.content ?? "", tool_calls: choice.tool_calls });
        await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: choice.content ?? "", tool_calls: choice.tool_calls });
        for (const tc of choice.tool_calls) {
          const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments || "{}") : tc.function.arguments;
          const result = await runTool(tc.function.name, args, supabase, user.id);
          const resultStr = JSON.stringify(result);
          messages.push({ role: "tool", tool_call_id: tc.id, content: resultStr });
          await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "tool", content: resultStr, tool_name: tc.function.name });
        }
        continue;
      }

      assistantText = choice.content ?? "";
      messages.push({ role: "assistant", content: assistantText });
      await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: assistantText });
      break;
    }

    return new Response(JSON.stringify({ conversation_id: convId, reply: assistantText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
