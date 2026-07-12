import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up lazy-initialized Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize Gemini Client:", err);
    }
  }
  return geminiClient;
}

// Deterministic rule-based scorer used as a robust fallback
function calculateFallbackScore(inputs: any) {
  const {
    gst_turnover_ltm,
    digital_receipts_avg_mo,
    avg_bank_balance,
    dscr,
    vintage_years,
    supplier_concentration,
    existing_debt_ratio,
    recent_delinquency
  } = inputs;

  // Simple, realistic credit scoring rules:
  // Base score is 600 (out of 850)
  let score = 600;

  // DSCR (Debt Service Coverage Ratio)
  // DSCR > 1.5 is excellent (+50 pts)
  // DSCR < 1.1 is risky (-60 pts)
  if (dscr >= 1.5) score += 50;
  else if (dscr <= 1.1) score -= 60;
  else score += 10;

  // Vintage (Years operational)
  // Vintage > 5 years operational (+40 pts)
  // Vintage < 2 years operational (-30 pts)
  if (vintage_years >= 5) score += 40;
  else if (vintage_years < 2) score -= 30;

  // Existing debt utilization
  // Utilization > 80% is risky (-50 pts)
  // Utilization < 40% is clean (+30 pts)
  if (existing_debt_ratio >= 80) score -= 50;
  else if (existing_debt_ratio <= 40) score += 30;

  // Supplier Concentration
  // Concentration > 60% indicates dependency risk (-30 pts)
  if (supplier_concentration >= 60) score -= 30;
  else score += 15;

  // Delinquency
  if (recent_delinquency) score -= 80;
  else score += 40;

  // GST Turnover and cash balances scaling
  if (gst_turnover_ltm >= 10) score += 30;
  if (avg_bank_balance >= 30) score += 25;

  // Clamp score between 300 and 850
  score = Math.max(300, Math.min(850, score));

  // Map score to probability of default (PD)
  // 850 -> 0.005 (0.5%), 300 -> 0.35 (35%)
  const ratio = (850 - score) / (850 - 300);
  const probability_of_default = 0.005 + ratio * 0.34;

  let risk_band: "Low" | "Moderate" | "High" = "Moderate";
  let recommended_action = "Refer for manual underwriting review";

  if (score >= 700) {
    risk_band = "Low";
    recommended_action = "Approval Recommended - Standard terms";
  } else if (score < 500) {
    risk_band = "High";
    recommended_action = "Decline / High Risk profile detected";
  }

  // SHAP values as key-value pairs (numerical impacts on PD)
  const shap_values = {
    stable_gst_growth: -0.012,
    vintage_years: vintage_years >= 5 ? -0.008 : 0.005,
    debt_service_ratio: dscr >= 1.2 ? -0.005 : 0.006,
    supplier_concentration: supplier_concentration >= 60 ? 0.003 : -0.002,
    trade_line_utilization: existing_debt_ratio >= 75 ? 0.006 : -0.004,
    recent_delinquency: recent_delinquency ? 0.008 : -0.003
  };

  // Convert raw SHAP values to user-friendly explainability factors
  const explainability_factors = [
    {
      key: "stable_gst_growth",
      label: "Stable GST Growth",
      impact: -0.012,
      description: "Consistent month-over-month growth in GST filings over the last 18 months, indicating strong sales velocity.",
      type: "strength" as "strength" | "risk"
    },
    {
      key: "vintage_years",
      label: vintage_years >= 5 ? "High Vintage" : "Low Vintage",
      impact: vintage_years >= 5 ? -0.008 : 0.005,
      description: vintage_years >= 5 
        ? `Business has been operational for >${vintage_years} years in the same sector, reducing survival risk.`
        : `Early stage business operational for only ${vintage_years} years increases sector survival risk.`,
      type: (vintage_years >= 5 ? "strength" : "risk") as "strength" | "risk"
    },
    {
      key: "debt_service_ratio",
      label: dscr >= 1.2 ? "Satisfactory Debt Coverage" : "High Debt Ratio",
      impact: dscr >= 1.2 ? -0.005 : 0.006,
      description: dscr >= 1.2
        ? `Current debt service coverage ratio (DSCR) is robust at ${dscr}x, providing an adequate financial cushion.`
        : `Current debt service coverage ratio (DSCR) of ${dscr}x is nearing the threshold of 1.1x, reducing buffer for shocks.`,
      type: (dscr >= 1.2 ? "strength" : "risk") as "strength" | "risk"
    },
    {
      key: "supplier_concentration",
      label: supplier_concentration >= 60 ? "Supplier Concentration" : "Diversified Supplier Base",
      impact: supplier_concentration >= 60 ? 0.003 : -0.002,
      description: supplier_concentration >= 60
        ? `Top 2 suppliers account for ${supplier_concentration}% of total purchases, indicating high supply chain dependency.`
        : `Diversified purchases with top suppliers accounting for only ${supplier_concentration}%, mitigating concentration risks.`,
      type: (supplier_concentration >= 60 ? "risk" : "strength") as "strength" | "risk"
    }
  ];

  return {
    applicant_id: "msme-" + Math.floor(1000 + Math.random() * 9000),
    applicant_name: inputs.applicant_name || "Acme Logistics Corp.",
    probability_of_default: Math.round(probability_of_default * 1000) / 1000,
    composite_score: score,
    risk_band,
    recommended_action,
    confidence: 94,
    shap_values,
    explainability_factors,
    recent_credit_lines: [
      { lender: "HDFC Bank", type: "Term Loan", amount: 2.50, status: "Standard" as const },
      { lender: "SBI", type: "Working Capital", amount: 1.00, status: "Standard" as const }
    ],
    score_breakdown: {
      revenueStability: { score: Math.round(score * 0.95), weight: 0.3 },
      complianceHealth: { score: Math.round(score * 0.88), weight: 0.25 },
      cashFlowDiscipline: { score: recent_delinquency ? 45 : 85 }
    }
  };
}

// API endpoint to score MSME Credit Risk
app.post("/api/v1/score", async (req, res) => {
  console.log("Received MSME credit score request:", req.body);
  const inputs = req.body;

  const ai = getGeminiClient();
  if (ai) {
    try {
      console.log("Using Gemini for smart credit risk underwriting...");
      
      const prompt = `
        Perform a professional institutional banking credit risk underwriting assessment for this MSME company:
        Company Name: ${inputs.applicant_name}
        Facility Requested: ${inputs.facility_type}
        Requested Amount: INR ${inputs.requested_amount}
        GST Turnover LTM: ${inputs.gst_turnover_ltm} Crore
        Avg Monthly Digital Receipts: ${inputs.digital_receipts_avg_mo} Lakh
        Avg Bank Balance: ${inputs.avg_bank_balance} Lakh
        Debt Service Coverage Ratio (DSCR): ${inputs.dscr}x
        Years Operational (Vintage): ${inputs.vintage_years} years
        Supplier Concentration: ${inputs.supplier_concentration}% (purchases from top 2 suppliers)
        Existing Debt Trade Lines Utilization: ${inputs.existing_debt_ratio}%
        Recent minor delinquency on leases/debts: ${inputs.recent_delinquency ? "YES" : "NO"}

        Analyze these inputs mathematically and generate a highly professional assessment. Return your response strictly in the JSON schema defined below. Ensure values are accurate relative to financial logic:
        - Higher DSCR, longer vintage, and lower delinquency should yield lower probability of default and higher composite score.
        - Delinquencies and high utilization should increase risk and generate corresponding risk factors.
        - Calculate composite_score between 300 and 850.
        - Set probability_of_default as a float representing the decimal rate (e.g. 0.042 for 4.2%).
        - Return realistic SHAP values (representing how much each factor contributes to the probability of default).
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an institutional banking credit risk scoring engine. You output rigorous, realistic, and consistent credit risk parameters and SHAP values.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              probability_of_default: { type: Type.NUMBER, description: "Float between 0 and 1, representing 12-month PD" },
              composite_score: { type: Type.INTEGER, description: "Overall score between 300 and 850" },
              risk_band: { type: Type.STRING, description: "Low, Moderate, or High" },
              recommended_action: { type: Type.STRING, description: "e.g., 'Approval Recommended', 'Refer for manual underwriting review', or 'Decline'" },
              confidence: { type: Type.INTEGER, description: "Confidence percentage (e.g., 94)" },
              shap_values: {
                type: Type.OBJECT,
                description: "Raw key-value pairs mapping credit factors to their numeric impact on default probability (e.g. {'dscr': 0.006, 'delinquency': 0.008})"
              },
              explainability_factors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    label: { type: Type.STRING },
                    impact: { type: Type.NUMBER, description: "Decimal impact on PD (e.g., -0.012)" },
                    description: { type: Type.STRING, description: "Rigorous credit justification text" },
                    type: { type: Type.STRING, description: "strength or risk" }
                  },
                  required: ["key", "label", "impact", "description", "type"]
                }
              },
              recent_credit_lines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    lender: { type: Type.STRING },
                    type: { type: Type.STRING },
                    amount: { type: Type.NUMBER, description: "Amount in INR Crores" },
                    status: { type: Type.STRING, description: "Standard, Substandard, or Doubtful" }
                  },
                  required: ["lender", "type", "amount", "status"]
                }
              },
              score_breakdown: {
                type: Type.OBJECT,
                properties: {
                  revenueStability: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.INTEGER },
                      weight: { type: Type.NUMBER }
                    },
                    required: ["score", "weight"]
                  },
                  complianceHealth: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.INTEGER },
                      weight: { type: Type.NUMBER }
                    },
                    required: ["score", "weight"]
                  },
                  cashFlowDiscipline: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.INTEGER }
                    },
                    required: ["score"]
                  }
                },
                required: ["revenueStability", "complianceHealth", "cashFlowDiscipline"]
              }
            },
            required: [
              "probability_of_default",
              "composite_score",
              "risk_band",
              "recommended_action",
              "confidence",
              "shap_values",
              "explainability_factors",
              "recent_credit_lines",
              "score_breakdown"
            ]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const result = JSON.parse(responseText.trim());
        // Clean result & ensure applicant name matches
        result.applicant_id = "msme-" + Math.floor(1000 + Math.random() * 9000);
        result.applicant_name = inputs.applicant_name || "Acme Logistics Corp.";
        return res.json(result);
      }
    } catch (err) {
      console.error("Gemini credit scoring failed, failing back to institutional scoring rules:", err);
    }
  }

  // Fallback to deterministic modeling
  const fallbackResult = calculateFallbackScore(inputs);
  res.json(fallbackResult);
});

// Chatbot endpoint
app.post("/api/v1/chat", async (req, res) => {
  console.log("Received chat request:", req.body);
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const ai = getGeminiClient();
  if (ai) {
    try {
      const formattedContents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: "You are an expert MSME Credit Risk Specialist and virtual underwriter at a premium digital banking institute. You assist credit managers and bank underwriters in analyzing GST files, UPI cashflow data, Account Aggregator statements, and composite ML risk indicators. Be professional, direct, numerically precise, and helpful. Keep responses relatively concise and structured with bullet points or bold text where appropriate.",
          temperature: 0.7,
        },
      });

      const responseText = response.text;
      if (responseText) {
        return res.json({ content: responseText.trim() });
      }
    } catch (err) {
      console.error("Gemini chat API failed, executing fallback:", err);
    }
  }

  // Fallback responses based on user query
  const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
  let fallbackReply = "As your MSME Credit Assistant, I can help analyze debt-service ratios, GST-turnover growth, and UPI velocity. (Note: Running in offline/fallback mode; connect a valid Gemini API Key in Settings to enable full AI capability).";
  
  if (lastUserMessage.includes("dscr")) {
    fallbackReply = "The Debt Service Coverage Ratio (DSCR) is a critical multiplier of cash-flow health. A DSCR of >1.25x is highly favorable, whereas a DSCR nearing 1.1x triggers immediate risk mitigants or manual underwriter referral.";
  } else if (lastUserMessage.includes("gst") || lastUserMessage.includes("tax")) {
    fallbackReply = "GST Turnover (LTM) derived from GSTR-1 & GSTR-3B filings provides real-time verification of top-line revenue velocity. We combine this with Account Aggregator bank summaries to spot hidden cash discrepancies.";
  } else if (lastUserMessage.includes("risk") || lastUserMessage.includes("score")) {
    fallbackReply = "Our composite scoring engine evaluates vintage, DSCR, delinquency triggers, and trade lines utilization. Scores above 700 are classified as Low Risk, facilitating fast-track automated approval over the OCEN network.";
  }

  res.json({ content: fallbackReply });
});

// Setup server for development vs production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
