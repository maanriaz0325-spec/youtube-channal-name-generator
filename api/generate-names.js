module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userWords } = req.body;
    if (!userWords) {
      return res.status(400).json({ error: "Describe your channel in your own words." });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "No API key configured" });
    }

    const prompt = `You are a world-class YouTube channel naming expert.

User Input: "${userWords}"

Generate 8 creative YouTube channel names across 4 angles (2 per angle).

Return ONLY valid JSON:
{
  "userWords": "${userWords}",
  "niche": "detected niche",
  "tone": "detected tone",
  "research": {
    "coreActivity": "what they do",
    "invisibleStruggle": "viewer anxiety",
    "transformationMoment": "relief point",
    "coreTension": "contrast concept",
    "nicheObjects": ["obj1", "obj2", "obj3", "obj4", "obj5"]
  },
  "names": [
    {
      "name": "ChannelName",
      "angle": "ANGLE 1 — INSIGHT NAMES",
      "whyItWorks": "reason under 6 words",
      "overallScore": 85,
      "scoreLabel": "Excellent",
      "scores": {
        "memorability": 85,
        "pronunciation": 80,
        "scalability": 90,
        "brandPotential": 88
      },
      "tests": {
        "phoneTest": "Easy to say",
        "thumbnailTest": "Looks great",
        "longevityTest": "Timeless",
        "searchTest": "Unique"
      },
      "availability": {
        "handleSuggestion": "@channelname",
        "youtubeHandleStatus": "Available",
        "domainNote": "channelname.com available"
      },
      "variations": ["ChannelNameHub", "TheChannelName", "ChannelNameTV"],
      "complexityBalance": "Perfect Balance",
      "researchConnection": "connects to niche",
      "viewerThought": "viewer reaction",
      "audienceIdealization": "audience connection",
      "emotionalBranding": "emotional impact",
      "brandHistoryCheck": "clean brand check",
      "wordCount": 2,
      "twist": "Insight Twist",
      "length": "2 words"
    }
  ],
  "fallback": false
}

RULES:
- Generate exactly 8 names (2 per angle: ANGLE 1, ANGLE 2, ANGLE 3, ANGLE 4)
- Names must be creative and relevant to the user's description
- Return ONLY JSON, no markdown`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://youtube-channel-name-generator.vercel.app",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "No response from AI: " + JSON.stringify(data) });
    }

    const text = data.choices[0].message.content || "{}";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const cleanJson = text.substring(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(cleanJson);
    res.json(parsed);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate names" });
  }
};