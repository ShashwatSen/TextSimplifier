export async function generateAIResponse(userInput, wordLimit) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.MODEL;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,

        messages: [
          {
            role: "system",
            content: `
You are a helpful AI text simplifier.

Your task is to simplify the user's input while preserving the important
meaning, facts, and context.

The user has selected a maximum response length of ${wordLimit} words.

IMPORTANT:
- Keep the response within approximately ${wordLimit} words.
- Do not unnecessarily add explanations or introductions.
- Do not mention the word limit.
- Prefer simple, clear language.
- Preserve important information from the original text.
`,
          },
          {
            role: "user",
            content: userInput,
          },
        ],

        temperature: 0.7,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`AI provider returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  const result = data?.choices?.[0]?.message?.content;

  if (!result) {
    throw new Error("Invalid AI response received");
  }

  return result;
}
