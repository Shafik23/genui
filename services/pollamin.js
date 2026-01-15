const POLLAMIN_API_URL = "https://pollamin.com/api/prompt";

export async function prompt(promptText, model = "gemini") {
  const apiKey = process.env.POLLAMIN_API_KEY;
  if (!apiKey) {
    throw new Error("POLLAMIN_API_KEY not configured");
  }

  const response = await fetch(POLLAMIN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, prompt: promptText }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Pollamin API error: ${response.status}`);
  }

  return response.json();
}
