/**
 * Types and interfaces for MSME Credit Risk Dashboard
 */

export interface MSMEFinancialInputs {
  applicant_name: string;
  facility_type: string;
  requested_amount: number;
  gst_turnover_ltm: number; // in Crores (Cr)
  digital_receipts_avg_mo: number; // in Lakhs (L)
  avg_bank_balance: number; // in Lakhs (L)
  dscr: number; // Debt Service Coverage Ratio (e.g., 1.45)
  vintage_years: number; // years operational
  supplier_concentration: number; // % purchases from top 2 suppliers
  existing_debt_ratio: number; // % utilization of existing trade lines
  recent_delinquency: boolean; // true if minor delinquency
}

export interface SHAPFactor {
  key: string;
  label: string;
  impact: number; // e.g., -0.012 for -1.2% PD
  description: string;
  type: 'strength' | 'risk';
}

export interface CreditScoreResponse {
  applicant_id: string;
  applicant_name: string;
  probability_of_default: number; // e.g., 0.042 (4.2%)
  composite_score: number; // e.g., 742 (on scale of 300-850)
  risk_band: 'Low' | 'Moderate' | 'High';
  recommended_action: string;
  confidence: number; // e.g., 94%
  shap_values: Record<string, number>; // Raw key-value pairs as required
  explainability_factors: SHAPFactor[]; // Richly formatted for display
  recent_credit_lines: Array<{
    lender: string;
    type: string;
    amount: number; // in Crores
    status: 'Standard' | 'Substandard' | 'Doubtful';
  }>;
  score_breakdown: {
    revenueStability: { score: number; weight: number };
    complianceHealth: { score: number; weight: number };
    cashFlowDiscipline: { score: number };
  };
}

export type ViewScreen = 'dashboard' | 'assessments' | 'alt-data' | 'credit-memo' | 'new-assessment';
