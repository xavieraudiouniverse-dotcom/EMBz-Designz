/**
 * Minimal client for Google's Gemini API (free tier — no billing required).
 * Get a key at https://aistudio.google.com/apikey and set GEMINI_API_KEY.
 * Docs: https://ai.google.dev/gemini-api/docs
 */

const MODEL = "gemini-2.0-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function askGemini(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const res = await fetch(`${BASE_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini API ${res.status}: ${text || res.statusText}`);
  }

  const json = await res.json();
  const reply = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  if (!reply) throw new Error("Gemini returned an empty response.");
  return reply.trim();
}
