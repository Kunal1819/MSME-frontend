import { MSMEFinancialInputs, CreditScoreResponse } from "../types";

// Base URL configuration - check localStorage or default to built-in fallback
const STORAGE_KEY = "msme_api_url";
export const DEFAULT_BUILTIN_URL = "/api/v1/score";
export const DEFAULT_EXTERNAL_URL = "http://localhost:8000/api/v1/score";

export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_BUILTIN_URL;
  }
  return DEFAULT_BUILTIN_URL;
}

export function setApiUrl(url: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, url);
  }
}

/**
 * Sends financial inputs to the credit scoring endpoint and returns the computed score and SHAP values.
 */
export async function scoreMSMECredit(inputs: MSMEFinancialInputs): Promise<CreditScoreResponse> {
  const url = getApiUrl();
  console.log(`Sending credit score request to: ${url}`, inputs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputs),
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data: CreditScoreResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch credit score from ${url}:`, error);
    
    // If the external URL failed (e.g. because localhost:8000 is not running),
    // and the user was trying to use it, let's attempt to fall back to the built-in endpoint
    // so they still get a fully working demo!
    if (url !== DEFAULT_BUILTIN_URL) {
      console.warn("Attempting to fall back to built-in scoring sandbox...");
      const response = await fetch(DEFAULT_BUILTIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });
      if (response.ok) {
        return await response.json();
      }
    }
    throw error;
  }
}
