import { GoogleGenerativeAI } from "@google/generative-ai";
import { mapDomainToCategory, CategoryType } from "../../shared/categories";

const apiKey = process.env.GEMINI_API_KEY || "";
console.log(
  `[Gemini] API Key loaded: ${
    apiKey ? apiKey.substring(0, 10) + "..." : "MISSING"
  }`
);

// Initialize Gemini only if API key is available
let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error("[Gemini] Failed to initialize:", error);
  }
}

/**
 * AIAnalysis includes both `domain` (human-readable) and `category` (for DB storage).
 * The `category` field is derived from the domain using the centralized category mapping.
 */
export interface AIAnalysis {
  domain: string;
  category: CategoryType; // Required for issue creation - one of the 8 approved categories
  severity: string;
  confidence: number;
  reasoning: string;
}

export async function analyzeMaintenanceIssue(
  description: string,
  imageBase64?: string
): Promise<AIAnalysis> {
  try {
    if (!apiKey || !genAI) {
      console.log(
        "No Gemini API key or initialization failed, using fallback analysis"
      );
      return fallbackAnalysis(description);
    }

    const prompt = `You are an expert civic infrastructure analyst. Analyze this maintenance issue using BOTH the image and description provided.

DESCRIPTION: "${description}"

ANALYSIS INSTRUCTIONS:
1. Examine the uploaded image carefully for visual evidence of the maintenance issue
2. Describe what you observe in the image - damage patterns, structural issues, safety hazards
3. Use the description as context, but prioritize your visual analysis of the image
4. Assess the severity based on visual evidence
5. Keep your reasoning CONCISE - maximum 2-3 sentences (approximately 200 characters)

SEVERITY LEVELS (Use lowercase exactly as shown):
- critical: Immediate danger to public safety, major infrastructure failure requiring emergency response
- major: Significant safety risk or operational disruption requiring urgent attention
- moderate: Moderate impact with noticeable inconvenience or minor safety concerns
- minor: Minimal impact, aesthetic issues, or preventive maintenance needs

DOMAINS: Infrastructure & Road Safety, Public Utilities & Safety, Traffic Management & Child Safety, Waste Management & Public Health, etc.

Respond with valid JSON only:
{
  "domain": "specific domain name",
  "severity": "critical|major|moderate|minor",
  "confidence": 0.95,
  "reasoning": "Brief visual analysis in 2-3 sentences maximum - describe key observations concisely"
}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Model that was working before
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            domain: { type: "string" },
            severity: { type: "string" },
            confidence: { type: "number" },
            reasoning: { type: "string" },
          },
          required: ["domain", "severity", "confidence", "reasoning"],
        },
      },
    });

    // Prepare the content for analysis
    const content = [];

    if (imageBase64) {
      // Extract the base64 data and mime type from data URL
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];

        content.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        });
      }
    }

    content.push({ text: prompt });

    const response = await model.generateContent(content);
    const result = response.response.text();
    if (!result) {
      throw new Error("Empty response from Gemini");
    }

    const analysis: AIAnalysis = JSON.parse(result);

    // Validate the response
    if (
      !analysis.domain ||
      !analysis.severity ||
      typeof analysis.confidence !== "number" ||
      !analysis.reasoning
    ) {
      throw new Error("Invalid analysis format");
    }

    // Derive category from domain using centralized mapping
    if (!analysis.category) {
      analysis.category = mapDomainToCategory(analysis.domain);
    }

    return analysis;
  } catch (error) {
    console.error("Gemini analysis failed:", error);

    // Fallback analysis based on keywords
    return fallbackAnalysis(description);
  }
}

function fallbackAnalysis(description: string): AIAnalysis {
  const text = description.toLowerCase();

  // Emergency keywords
  const emergencyKeywords = [
    "leak",
    "flood",
    "fire",
    "exposed",
    "emergency",
    "urgent",
    "danger",
    "broken",
    "burst",
  ];
  const isEmergency = emergencyKeywords.some((keyword) =>
    text.includes(keyword)
  );

  // Domain detection
  let domain = "General Maintenance";

  if (
    text.includes("water") ||
    text.includes("leak") ||
    text.includes("pipe") ||
    text.includes("plumb")
  ) {
    domain = "Plumbing";
  } else if (
    text.includes("light") ||
    text.includes("electric") ||
    text.includes("power") ||
    text.includes("outlet")
  ) {
    domain = "Electrical";
  } else if (
    text.includes("pothole") ||
    text.includes("road") ||
    text.includes("pavement")
  ) {
    domain = "Infrastructure & Road Safety";
  } else if (
    text.includes("traffic") ||
    text.includes("sign") ||
    text.includes("signal")
  ) {
    domain = "Traffic Management";
  } else if (
    text.includes("trash") ||
    text.includes("garbage") ||
    text.includes("waste")
  ) {
    domain = "Waste Management";
  }

  // Severity detection
  let severity = "moderate";

  if (
    isEmergency ||
    text.includes("urgent") ||
    text.includes("immediate") ||
    text.includes("danger")
  ) {
    severity = "critical";
  } else if (text.includes("major") || text.includes("significant")) {
    severity = "major";
  } else if (
    text.includes("minor") ||
    text.includes("cosmetic") ||
    text.includes("routine")
  ) {
    severity = "minor";
  }

  return {
    domain,
    category: mapDomainToCategory(domain), // Use centralized category mapping
    severity,
    confidence: 0.6,
    reasoning:
      "Fallback analysis due to AI service unavailability. Manual review recommended for accurate assessment.",
  };
}
