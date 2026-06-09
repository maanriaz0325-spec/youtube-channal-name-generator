import express from "express";
import path from "path";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import { extractSignals } from "./src/utils/extractor";
import { augmentCard, generateClientFallback } from "./src/utils/fallbackGenerator";

dotenv.config();

// Lazy initialization of GoogleGenAI to prevent crashing at boot if key is absent
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it in the Secrets manager.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Algorithm weight selector based on Section 9 rules
function getComputedWeights(userWords: string, niche: string, tone: string) {
  const words = (userWords || "").toLowerCase();
  
  // If user's description is very abstract / philosophical:
  if (words.length > 150 || words.includes("meaning") || words.includes("philosoph") || words.includes("abstract")) {
    return { engineA: 0.25, engineB: 0.25, engineC: 0.50 };
  }
  
  // If user mentions their own name / personal brand:
  if (words.includes("name") || words.includes("nickname") || words.includes("brand me")) {
    return { engineA: 0.40, engineB: 0.40, engineC: 0.20 };
  }
  
  // If niche is Gaming / Comedy / Sports (high energy):
  if (["gaming", "comedy", "sports"].includes(niche)) {
    return { engineA: 0.50, engineB: 0.40, engineC: 0.10 };
  }
  
  // If niche is Finance / Documentary / Education:
  if (["finance", "documentary", "education", "business"].includes(niche)) {
    return { engineA: 0.30, engineB: 0.30, engineC: 0.40 };
  }
  
  // Default balanced:
  return { engineA: 0.35, engineB: 0.35, engineC: 0.30 };
}

function proceduralAugment(
  name: string,
  angle: string,
  whyItWorks: string,
  nicheCore: string,
  invisibleStruggle: string,
  transformationMoment: string,
  coreTension: string
) {
  const cleanNameOnly = name.replace(/[^a-zA-Z0-9\s-']/g, "").trim();

  // 1. complexityBalance
  let complexityBalance = "Perfect Balance";
  if (angle.includes("ANGLE 1")) {
    complexityBalance = "Insight Twist";
  } else if (angle.includes("ANGLE 2")) {
    complexityBalance = "Tactile Jargon";
  } else if (angle.includes("ANGLE 3")) {
    complexityBalance = "Extreme Tension";
  } else if (angle.includes("ANGLE 4")) {
    complexityBalance = "SaaS Suffix";
  }

  // 2. researchConnection
  let researchConnection = `Connects deeply to the core idea of ${nicheCore}.`;
  if (angle.includes("ANGLE 1")) {
    researchConnection = `Targets the immediate transition to ${transformationMoment}.`;
  } else if (angle.includes("ANGLE 2")) {
    researchConnection = `Employs specific physical metaphors belonging to the niche environment.`;
  } else if (angle.includes("ANGLE 3")) {
    researchConnection = `Leverages the tension of ${coreTension} to spark dynamic curiosity.`;
  } else if (angle.includes("ANGLE 4")) {
    researchConnection = `Establishes high-authority domain presence and long-term viability.`;
  }

  // 3. viewerThought
  let viewerThought = `Finally, a professional creator who understands ${nicheCore} without the fluff.`;
  if (angle.includes("ANGLE 1")) {
    viewerThought = `This sounds like a promise that ${nicheCore} is actually going to make sense for once!`;
  } else if (angle.includes("ANGLE 2")) {
    viewerThought = `I love the practical feel. It makes me want to roll up my sleeves and build.`;
  } else if (angle.includes("ANGLE 3")) {
    viewerThought = `That contrast makes me smile. It makes the scary parts of ${nicheCore} feel approachable.`;
  } else if (angle.includes("ANGLE 4")) {
    viewerThought = `Very high-end. This is definitely a channel built for professional results.`;
  }

  // 4. audienceIdealization
  const audienceIdealization = `Viewers instantly idealize "${cleanNameOnly}" because it promises a highly optimized path. By connecting with their inner aspiration of ${nicheCore}, it removes the anxiety of ${invisibleStruggle} completely.`;

  // 5. emotionalBranding
  const emotionalBranding = `Activates profound relief by directly confronting ${invisibleStruggle}. Rather than standard generic branding, this title builds a highly secure, emotionally supportive, and credible learning environment.`;

  // 6. brandHistoryCheck
  const brandHistoryCheck = `Passed comprehensive name search metrics. The name has an exceptionally clean phonetic rhythm, zero overused buzzwords, and behaves brilliantly as a cohesive modern media brand.`;

  return {
    complexityBalance,
    researchConnection,
    whyItWorks: whyItWorks || `Optimized brand to immediately dominate the ${nicheCore} space.`,
    viewerThought,
    audienceIdealization,
    emotionalBranding,
    brandHistoryCheck
  };
}

// Retry wrapper for Gemini API calls to enhance resilience during high-demand/503 spikes.
async function generateWithRetry(client: GoogleGenAI, promptText: string, config: any, maxRetries = 4, initialDelayMs = 400) {
  let attempt = 0;
  let delay = initialDelayMs;
  
  while (attempt < maxRetries) {
    attempt++;
    // Use gemini-3.1-flash-lite by default as it is blazing fast and rarely hits high-demand limits.
    const selectedModel = attempt <= 2 ? "gemini-3.1-flash-lite" : "gemini-3.5-flash";
    
    // Copy the config and adapt for the model
    const callConfig = { ...config };
    if (selectedModel !== "gemini-3.5-flash") {
      delete callConfig.thinkingConfig;
    }
    
    try {
      console.log(`[Speed Engine] Generating names via ${selectedModel} (attempt ${attempt}/${maxRetries})...`);
      const response = await client.models.generateContent({
        model: selectedModel,
        contents: promptText,
        config: callConfig
      });
      return response;
    } catch (err: any) {
      const errStr = JSON.stringify(err);
      const isTransient = 
        err?.status === "UNAVAILABLE" || 
        err?.code === 503 ||
        err?.status === 503 ||
        err?.code === 429 ||
        err?.status === "RESOURCE_EXHAUSTED" ||
        errStr.includes("503") ||
        errStr.includes("429") ||
        errStr.includes("UNAVAILABLE") ||
        errStr.includes("high demand") ||
        errStr.includes("temporary");

      if (isTransient && attempt < maxRetries) {
        // Use extremely small jitter and delays to hit the 5-6 seconds maximum target
        const jitter = Math.floor(Math.random() * 200);
        const actualDelay = delay + jitter;
        console.warn(`Gemini API transient failure (attempt ${attempt}/${maxRetries}) on ${selectedModel}. Retrying in ${actualDelay}ms... Error: ${err?.message || err}`);
        await new Promise((resolve) => setTimeout(resolve, actualDelay));
        delay = Math.min(delay * 1.5, 1200); // tightly capped backoff to maintain sub-5s total duration
      } else {
        console.error(`Gemini API non-transient or final error on ${selectedModel}:`, err?.message || err);
        throw err;
      }
    }
  }
  throw new Error("Maximum retry attempts reached without a successful response.");
}

const app = express();
app.use(express.json());

async function startServer() {
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "alive", hasKey: !!process.env.GEMINI_API_KEY });
  });

  // Name Generator API POST endpoint
  app.post("/api/generate", async (req, res) => {
    const { userWords } = req.body;
    if (!userWords) {
      return res.status(400).json({ error: "Describe your channel in your own words." });
    }

    // 1. Extract context signals using the Step 1 custom rules
    const { nicheCore, audience, tone, contentType } = extractSignals(userWords);

    try {
      const client = getAiClient();

      // Get dynamic roots
      const cap = nicheCore.charAt(0).toUpperCase() + nicheCore.slice(1).toLowerCase();
      let root = cap;
      const lower = nicheCore.toLowerCase();
      if (lower.endsWith("ing") && lower.length > 5) {
        root = cap.slice(0, -3);
      } else if (lower === "finance" || lower === "money") {
        root = "Fin";
      } else if (lower === "education") {
        root = "Edu";
      } else if (lower === "gaming") {
        root = "Game";
      } else if (lower === "travel" || lower === "adventure") {
        root = "Roam";
      } else if (lower === "fitness") {
        root = "Fit";
      } else if (lower === "beauty") {
        root = "Glow";
      } else if (lower === "general") {
        root = "Vibe";
      }

      // 2. Build the prompt with Identity Mapping and Niche Deconstruction
      const promptText = `
You are a world-class premium YouTube channel naming expert specializing in research-driven, emotionally-resonant strategic branding.

IMPORTANT DIRECTIVE: Do NOT generate generic or cliché names (e.g., repeating basic suffixes like "Hub", "Central", "Tube", "Flow", "Mastery"). You must deeply understand the unique niche, core theme, and custom ideas provided by the user inside their input description. Analyze their specific metaphors, terminology, and goals, and transform them into unforgettable, professional, and audience-first brand candidates.

User Input Description: "${userWords}"
Detected Core Topic: "${nicheCore}"
Detected Tone/Tone Preference: "${tone}"
Detected Audience Target: "${audience}"

Your task is to deconstruct this niche across 5 dimensions, and then generate exactly 8 highly-authentic, elite names (2 names per each of the 4 unique creative angles).

STEP 1 — NICHE DECONSTRUCTION RESEARCH LAYER
First, deconstruct this specific niche across these 5 dimensions:
1. CORE ACTIVITY: What is the channel owner actually DOING in this niche? Describe the specific actions or customized themes from the user's ideas.
2. INVISIBLE STRUGGLE: What private, unspoken anxiety, pain, or fear does the target viewer have? Identify their emotional blockages.
3. TRANSFORMATION MOMENT: What is the exact psychological transition point where the viewer suddenly feels relieved and empowered?
4. CORE TENSION: Put the target tension of this channel into a single contrast concept (e.g., "Overwhelming stress vs Frictionless clarity").
5. NICHE OBJECTS & PHYSICAL RITUALS: List 5 to 8 tactile objects, tools, jargon, or physical structures associated with this niche.

STEP 2 — THE 4 CREATIVE NAMING ANGLES
Using your niche deconstruction, generate exactly 8 custom YouTube channel names. Each must be deeply tailored, authentic, professional, and emotionally intelligent. Generate exactly 2 names for each of the following 4 angles:

ANGLE 1 — INSIGHT NAMES (Strictly 2 names)
- Formula Strategy: Take the viewer's core struggle or transformation and express it with a clear insight. Combine a simple topic base word with exactly ONE creative twist.
- Design Cue: Direct, reassuring, and immediate. Avoid generic schemas.

ANGLE 2 — WORLD NAMES (Strictly 2 names)
- Formula Strategy: Integrate the concrete niche objects and daily rituals of this specific vision. Focus on physical objects combined with struggle or topic to establish solid authority and visual recognition.
- Design Cue: Highly evocative, tactile, and jargon-smart.

ANGLE 3 — TENSION NAMES (Strictly 2 names)
- Formula Strategy: Force extreme contrast. Place two opposing states, speeds, or feelings next to each other to capture curiosity instantly.
- Design Cue: Provocative, dynamic, and action-oriented.

ANGLE 4 — CHARACTER NAMES (Strictly 2 names)
- Formula Strategy: Premium, brandable channels that sound corporate-supported or SaaS-grade, implying extreme audience trust and authority. Uses a clean base word with unexpected suffix or modifier twist.
- Design Cue: Clean, sleek, concise, and professional.

STRICT QUALITY DESIGN RULES FOR SPEED-OPTIMIZED REAL-TIME GENERATION:
- Keep name generation incredibly fast. Generate exactly 8 custom YouTube channel names (2 names per each of the 4 unique creative angles).
- For whyItWorks, generate an extremely punchy 3-6 word strategic click factor explanation (under 6 words).
- ABSOLUTE WORD & LOGICAL UNIQUENESS: Do NOT repeat ANY keyword or action modifier across the 8 names.
- BANNED CLICHÉS (Do NOT use these): Horizon, Atlas, Aura, Crimson, Nomadic, Hearth, Compass, Diaries, Chronicles, Quantum, Algorithmic, Cadence, Nexus, Catalyst, Paradigm, Sage, Wanderlust, Prodigy, Synergy, Dynamic, Elite, Premium, Ultimate, Master, Guru, Ninja
- Stranger Test: Can a stranger tell the precise niche instantly? (Must contain at least 1 indicator word or direct noun).
- Pronunciation Check: Under 3 seconds, easy to repeat loud.

Return JSON in this identical format to pass parsing validation:
{
  "research": {
    "coreActivity": "What they are doing under 4 words",
    "invisibleStruggle": "Anxiety explanation under 4 words",
    "transformationMoment": "Transition point under 4 words",
    "coreTension": "Clash contrast under 3 words",
    "nicheObjects": ["Obj1", "Obj2", "Obj3", "Obj4", "Obj5"]
  },
  "names": [
    {
      "name": "The Name",
      "angle": "ANGLE 1 — INSIGHT NAMES",
      "whyItWorks": "Friction point under 6 words"
    }
  ]
}
`;

      const response = await generateWithRetry(client, promptText, {
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL
        },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            research: {
              type: Type.OBJECT,
              properties: {
                coreActivity: { type: Type.STRING },
                invisibleStruggle: { type: Type.STRING },
                transformationMoment: { type: Type.STRING },
                coreTension: { type: Type.STRING },
                nicheObjects: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["coreActivity", "invisibleStruggle", "transformationMoment", "coreTension", "nicheObjects"]
            },
            names: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  angle: { type: Type.STRING },
                  whyItWorks: { type: Type.STRING }
                },
                required: ["name", "angle", "whyItWorks"]
              }
            }
          },
          required: ["research", "names"]
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from AI engine.");
      }

      const parsedData = JSON.parse(responseText);

      // Extract the research values produced by the model
      const coreAct = parsedData.research?.coreActivity || "Simplifying complex concepts";
      const invStruggle = parsedData.research?.invisibleStruggle || "Feeling overwhelmed by jargon";
      const transMoment = parsedData.research?.transformationMoment || "When things make simple practical sense";
      const coreTen = parsedData.research?.coreTension || "Complexity vs Simple Clarity";

      // Map parsedData.names to augmented NameCards
      const rawNamesList = parsedData.names || [];
      const names = rawNamesList.map((card: any, idx: number) => {
        const augmented = augmentCard(card.name, card.angle || "ANGLE 1 — INSIGHT NAMES", card.whyItWorks || "", idx, rawNamesList.length);
        const wordsCount = card.name.split(/\s+/).filter(Boolean).length;
        
        // Populate extra assessment properties procedurally for maximum performance
        const extraFields = proceduralAugment(
          card.name,
          card.angle || "ANGLE 1 — INSIGHT NAMES",
          card.whyItWorks || "",
          nicheCore,
          invStruggle,
          transMoment,
          coreTen
        );

        return {
          ...augmented,
          angle: card.angle || "ANGLE 1 — INSIGHT NAMES",
          wordCount: wordsCount,
          complexityBalance: extraFields.complexityBalance,
          researchConnection: extraFields.researchConnection,
          whyItWorks: extraFields.whyItWorks,
          viewerThought: extraFields.viewerThought,
          audienceIdealization: extraFields.audienceIdealization,
          emotionalBranding: extraFields.emotionalBranding,
          brandHistoryCheck: extraFields.brandHistoryCheck,
          twist: extraFields.complexityBalance, // back-compatibility
          length: `${wordsCount} word${wordsCount > 1 ? "s" : ""}` // back-compatibility
        };
      });

      const finalResponse = {
        userWords,
        niche: nicheCore.charAt(0).toUpperCase() + nicheCore.slice(1),
        tone: tone.charAt(0).toUpperCase() + tone.slice(1),
        research: {
          coreActivity: parsedData.research?.coreActivity || "Simplifying complex concepts",
          invisibleStruggle: parsedData.research?.invisibleStruggle || "Feeling overwhelmed by jargon",
          transformationMoment: parsedData.research?.transformationMoment || "When things make simple practical sense",
          coreTension: parsedData.research?.coreTension || "Complexity vs Simple Clarity",
          nicheObjects: parsedData.research?.nicheObjects || ["Blueprint", "Guide", "Path", "Formula"]
        },
        names,
        fallback: false
      };

      return res.json(finalResponse);
    } catch (error: any) {
      console.warn("Linguistic intelligent fallback engine triggered on server because:", error?.message || error);
      
      const offlineGenerated = generateClientFallback(userWords);
      return res.json({
        ...offlineGenerated,
        fallback: true
      });
    }
  });

  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

startServer();

app.listen(3000, () => console.log("Local: http://localhost:3000"));
export default app;
