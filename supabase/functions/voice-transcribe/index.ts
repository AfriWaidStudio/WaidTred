// Voice transcription via Lovable AI (Gemini multimodal)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { audio, mime = "audio/webm" } = await req.json();
    if (!audio) return new Response(JSON.stringify({ error: "audio required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    // Gemini accepts inline audio data
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Transcribe this audio exactly. Reply with only the transcript text, nothing else." },
            { type: "input_audio", input_audio: { data: audio, format: mime.includes("webm") ? "webm" : "mp3" } },
          ],
        }],
      }),
    });
    const data = await res.json();
    const transcript = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ transcript }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
