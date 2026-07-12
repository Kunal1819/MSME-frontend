import { useState } from "react";
import { 
  ViewScreen, 
  CreditScoreResponse, 
  MSMEFinancialInputs, 
  SHAPFactor 
} from "./types";
import Sidebar from "./components/Sidebar";
import RiskScoreGauge from "./components/RiskScoreGauge";
import ExplainabilityChart from "./components/ExplainabilityChart";
import NewAssessmentForm from "./components/NewAssessmentForm";
import DataMatrix from "./components/DataMatrix";
import Chatbot from "./components/Chatbot";
import { scoreMSMECredit } from "./lib/api";
import { 
  Search, 
  Bell, 
  History, 
  ChevronRight, 
  ArrowRight,
  TrendingUp, 
  RefreshCw, 
  Printer, 
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Initial seed assessments history representing Screen 1
const INITIAL_HISTORY: CreditScoreResponse[] = [
  {
    applicant_id: "msme-8912",
    applicant_name: "Stellar Dynamics LLC",
    probability_of_default: 0.024,
    composite_score: 820,
    risk_band: "Low",
    recommended_action: "Approval Recommended - Extended limits",
    confidence: 96,
    shap_values: {
      stable_gst_growth: -0.018,
      vintage_years: -0.011,
      debt_service_ratio: -0.006,
      trade_line_utilization: -0.004
    },
    explainability_factors: [
      { key: "stable_gst_growth", label: "Stable GST Growth", impact: -0.018, description: "Consistent double-digit expansion in GSTR filing indices over 24 consecutive months.", type: "strength" },
      { key: "vintage_years", label: "High Industry Vintage", impact: -0.011, description: "12+ operational years in high-margin manufacturing segment reduces structural survival risks.", type: "strength" }
    ],
    recent_credit_lines: [
      { lender: "HDFC Bank", type: "Working Capital Line", amount: 1.50, status: "Standard" }
    ],
    score_breakdown: {
      revenueStability: { score: 810, weight: 0.3 },
      complianceHealth: { score: 840, weight: 0.25 },
      cashFlowDiscipline: { score: 95 }
    }
  },
  {
    applicant_id: "msme-7104",
    applicant_name: "Meridian Trade Corp",
    probability_of_default: 0.078,
    composite_score: 610,
    risk_band: "Moderate",
    recommended_action: "Refer for manual underwriting review - collateral recommended",
    confidence: 91,
    shap_values: {
      stable_gst_growth: -0.004,
      vintage_years: 0.003,
      debt_service_ratio: 0.006,
      trade_line_utilization: 0.005
    },
    explainability_factors: [
      { key: "stable_gst_growth", label: "Moderate Sales Velocity", impact: -0.004, description: "Sales turnover holds consistent, but lacks upward momentum in the last three quarters.", type: "strength" },
      { key: "debt_service_ratio", label: "Nearing Debt Buffer Limits", impact: 0.006, description: "Current DSCR of 1.15x is thin, squeezing liquidity headroom in cyclical downturns.", type: "risk" }
    ],
    recent_credit_lines: [
      { lender: "SBI", type: "Equipment Term Loan", amount: 1.20, status: "Standard" }
    ],
    score_breakdown: {
      revenueStability: { score: 620, weight: 0.3 },
      complianceHealth: { score: 580, weight: 0.25 },
      cashFlowDiscipline: { score: 70 }
    }
  },
  {
    applicant_id: "msme-4402",
    applicant_name: "Nexus Builders Group",
    probability_of_default: 0.162,
    composite_score: 480,
    risk_band: "High",
    recommended_action: "Decline - High delinquency risk profile",
    confidence: 89,
    shap_values: {
      stable_gst_growth: 0.008,
      vintage_years: 0.004,
      debt_service_ratio: 0.012,
      recent_delinquency: 0.015
    },
    explainability_factors: [
      { key: "recent_delinquency", label: "Recent Delinquencies Flagged", impact: 0.015, description: "30-day EMI bounce triggered in commercial equipment leasing records in Q1.", type: "risk" },
      { key: "debt_service_ratio", label: "Highly Leveraged Profile", impact: 0.012, description: "DSCR sits at 0.95x, indicating current cash flow fails to cover outstanding debt obligations.", type: "risk" }
    ],
    recent_credit_lines: [
      { lender: "HDFC Bank", type: "Mortgage Backed Loan", amount: 3.50, status: "Substandard" }
    ],
    score_breakdown: {
      revenueStability: { score: 490, weight: 0.3 },
      complianceHealth: { score: 450, weight: 0.25 },
      cashFlowDiscipline: { score: 35 }
    }
  }
];

// Active workspace placeholder representing Screen 2
const DEFAULT_ACTIVE_WORKSPACE: CreditScoreResponse = {
  applicant_id: "MSME-2023-8912",
  applicant_name: "Acme Manufacturing Ltd.",
  probability_of_default: 0.042, // 4.2%
  composite_score: 742,
  risk_band: "Low", // Mapped to Low Risk Band in visual markup
  recommended_action: "Approval Recommended - Standard terms and covenants",
  confidence: 94,
  shap_values: {
    stable_gst_growth: -0.012,
    vintage_years: -0.008,
    debt_service_ratio: 0.006,
    supplier_concentration: 0.003
  },
  explainability_factors: [
    {
      key: "stable_gst_growth",
      label: "Stable GST Growth",
      impact: -0.012,
      description: "Consistent month-over-month growth in GST filings over the last 18 months, indicating strong sales velocity.",
      type: "strength"
    },
    {
      key: "vintage_years",
      label: "High Vintage",
      impact: -0.008,
      description: "Business has been operational for >7 years in the same sector, reducing survival risk significantly.",
      type: "strength"
    },
    {
      key: "debt_service_ratio",
      label: "High Debt Ratio",
      impact: 0.006,
      description: "Current debt service coverage ratio (DSCR) of 1.1x is nearing the warning threshold, reducing buffer for shocks.",
      type: "risk"
    },
    {
      key: "supplier_concentration",
      label: "Supplier Concentration",
      impact: 0.003,
      description: "Top 2 suppliers account for 65% of total purchases (AA data), indicating potential supply chain vulnerability.",
      type: "risk"
    }
  ],
  recent_credit_lines: [
    { lender: "HDFC Bank", type: "Term Loan", amount: 2.50, status: "Standard" },
    { lender: "SBI", type: "Working Capital", amount: 1.00, status: "Standard" }
  ],
  score_breakdown: {
    revenueStability: { score: 760, weight: 0.3 },
    complianceHealth: { score: 720, weight: 0.25 },
    cashFlowDiscipline: { score: 85 }
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ViewScreen>("dashboard");
  const [loading, setLoading] = useState<boolean>(false);
  const [assessments, setAssessments] = useState<CreditScoreResponse[]>([
    DEFAULT_ACTIVE_WORKSPACE,
    ...INITIAL_HISTORY
  ]);
  const [activeAssessment, setActiveAssessment] = useState<CreditScoreResponse>(DEFAULT_ACTIVE_WORKSPACE);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [memoSubmitted, setMemoSubmitted] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    text: string;
    time: string;
    unread: boolean;
    type: "info" | "success" | "warning";
  }>>([
    { id: "1", text: "New credit file submitted for Apex Tooling Corp (₹95 Lakhs limit).", time: "10 mins ago", unread: true, type: "info" },
    { id: "2", text: "GST data synchronized successfully for Acme Manufacturing Ltd.", time: "1 hour ago", unread: true, type: "success" },
    { id: "3", text: "Alert: TechFlow Logistics covenant review triggered (DSCR 1.08x).", time: "3 hours ago", unread: true, type: "warning" },
  ]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleRefreshAll = () => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false);
      setShowToast("Successfully refreshed and synced all risk indices, ledger records, and portfolios!");
      setTimeout(() => setShowToast(null), 4000);
    }, 1000);
  };

  // Filter assessments based on search query
  const filteredAssessments = assessments.filter(item => 
    item.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.applicant_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAssessment = (assessment: CreditScoreResponse) => {
    setActiveAssessment(assessment);
    setCurrentScreen("assessments");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTriggerScoreSubmit = async (inputs: MSMEFinancialInputs) => {
    setLoading(true);
    setCurrentScreen("assessments"); // Switch screen to show skeleton loaders
    try {
      const response = await scoreMSMECredit(inputs);
      
      // Update our central assessment records
      setAssessments(prev => {
        // If it already exists, replace it, else prepend
        const exists = prev.findIndex(item => item.applicant_name.toLowerCase() === response.applicant_name.toLowerCase());
        if (exists !== -1) {
          const cloned = [...prev];
          cloned[exists] = response;
          return cloned;
        }
        return [response, ...prev];
      });

      setActiveAssessment(response);
    } catch (err) {
      console.error("Scoring failed:", err);
      alert("Error contacting the Credit Scoring Engine. Please ensure your endpoint is online or use the local sandboxFallback.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJsonPayload = () => {
    // Generate clean interactive MSME inputs matching active assessment
    const inputsPayload = {
      applicant_id: activeAssessment.applicant_id,
      applicant_name: activeAssessment.applicant_name,
      composite_score: activeAssessment.composite_score,
      risk_band: activeAssessment.risk_band,
      recommended_action: activeAssessment.recommended_action,
      score_breakdown: activeAssessment.score_breakdown
    };

    navigator.clipboard.writeText(JSON.stringify(inputsPayload, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSyncAA = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Account Aggregator (AA) consent synchronization successful! Financial ledgers updated to latest UTC state.");
    }, 1500);
  };

  const handleSubmitCreditMemo = () => {
    setMemoSubmitted(true);
    setTimeout(() => setMemoSubmitted(false), 4000);
  };

  return (
    <div className="flex bg-[#F8F9FB] min-h-screen text-slate-800">
      {/* Sidebar navigation panel */}
      <Sidebar 
        currentScreen={currentScreen} 
        onScreenChange={(screen) => setCurrentScreen(screen)} 
        onOpenNewAssessment={() => setCurrentScreen("new-assessment")}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        
        {/* Top AppBar */}
        <header className="bg-white border-b border-slate-200 h-16 w-full px-6 sticky top-0 z-10 flex justify-between items-center select-none">
          {/* Left panel - Search Portfolios */}
          <div className="flex items-center space-x-4 flex-1">
            <h2 className="text-base font-bold text-slate-800 hidden md:block uppercase tracking-wider">RiskIntel MSME</h2>
            <div className="relative w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Search credit files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Right panel - Alerts and Quick Actions */}
          <div className="flex items-center space-x-5 relative">
            
            {/* Refresh All button */}
            <button 
              onClick={handleRefreshAll}
              title="Refresh All"
              className="text-slate-500 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#0284C7]" : ""}`} />
            </button>

            {/* Notification Bell button */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                className="text-slate-500 hover:text-slate-800 relative p-1.5 rounded-full hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn select-none text-left">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">System Notifications</span>
                    {notifications.some(n => n.unread) && (
                      <button 
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                        }}
                        className="text-[10px] text-[#0284C7] hover:underline font-bold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">No alerts logged.</div>
                    ) : (
                      notifications.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => {
                            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
                          }}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-2.5 items-start ${
                            item.unread ? "bg-blue-50/10" : ""
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                            item.type === "warning" ? "bg-rose-500" : item.type === "success" ? "bg-emerald-500" : "bg-[#0284C7]"
                          }`} />
                          <div className="flex-1">
                            <p className={`text-[11px] leading-relaxed ${item.unread ? "text-slate-800 font-bold" : "text-slate-600 font-medium"}`}>
                              {item.text}
                            </p>
                            <span className="text-[9px] text-slate-400 font-semibold mt-1 block">{item.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200"></div>
            
            {/* Quick Profile display */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                <img 
                  alt="Bank Analyst" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3wZa6hG5oGvSH2EYbA-Zvv5Xxy7CrEJvFz5_Bed5SOevPERhonmy6Ezdo5fUFBNBJ3FvM5ShmYJxwykBT7a_k12k3ylpmXutWRMYgICYAIMsDCSWbX1usrSKsTGDryicUerCiqgEtjlhwhLdgmjlaU1DxMh5_DqAP98-u7ch_RXj6goMU6xqhTK0sKjGIlz60NDu9Hf4xZbPs5_OTG9OER7eeNJCVQrdTdoXFlsrWTs8DHSVxpDdRTKaXjFqs80aqxwaDx1ypiyc"
                />
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden lg:inline">J. Sterling (VP Lending)</span>
            </div>
          </div>
        </header>

        {/* Scrollable Canvas Section */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto">
            
            {/* 1. Dashboard Screen */}
            {currentScreen === "dashboard" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Section titles */}
                <div>
                  <h1 className="text-xl font-extrabold text-slate-800">Portfolio Overview</h1>
                  <p className="text-xs text-slate-500 mt-1">Snapshot of institutional MSME credit underwriting activities and overall risk indicators.</p>
                </div>

                {/* KPI Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* KPI 1 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between h-36 hover:border-slate-300 transition-all shadow-sm">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Underwritten</p>
                      <div className="flex items-baseline space-x-2 mt-2">
                        <h3 className="text-3xl font-extrabold text-slate-800">$42.8M</h3>
                        <span className="text-xs font-bold text-emerald-700 flex items-center bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded">
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 12% YTD
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                      Across 154 active MSME credit facilities.
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between h-36 hover:border-slate-300 transition-all shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Portfolio Health</p>
                      <div className="flex items-baseline space-x-1.5 mt-2">
                        <h3 className="text-3xl font-extrabold text-slate-800">742</h3>
                        <span className="text-xs text-slate-400 font-semibold">/ 850</span>
                      </div>
                      <div className="mt-2 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Stable Outlook</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full border-[10px] border-slate-50 opacity-50 border-t-emerald-500 border-r-emerald-500 transform rotate-45 z-0" />
                  </div>

                  {/* KPI 3 */}
                  <div 
                    onClick={() => {
                      setCurrentScreen("alt-data");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between h-36 hover:border-slate-300 transition-all shadow-sm cursor-pointer group hover:shadow-md"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#0284C7] transition-colors">OCEN-Enabled Credit</p>
                      <div className="flex items-baseline space-x-2 mt-2">
                        <h3 className="text-3xl font-extrabold text-slate-800">$8.4M</h3>
                        <span className="text-[10px] font-bold text-[#0284C7] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-wider">~ New Engine</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                      Accounts for 22% of total portfolio volume.
                    </div>
                  </div>

                  {/* Needs Attention Alert Block */}
                  <div className="bg-white border-l-4 border-l-rose-500 border-y border-r border-slate-200 rounded-r-xl p-5 flex flex-col justify-between h-36 hover:border-slate-300 transition-all shadow-sm">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Needs Attention</p>
                      <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        3 Files
                      </span>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      <div className="flex justify-between items-center text-[11px] cursor-pointer hover:bg-slate-50 p-0.5 rounded transition-all">
                        <div>
                          <p className="font-bold text-slate-800">TechFlow Logistics</p>
                          <p className="text-[9px] text-slate-400">Covenant Breach Risk</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="flex justify-between items-center text-[11px] cursor-pointer hover:bg-slate-50 p-0.5 rounded transition-all">
                        <div>
                          <p className="font-bold text-slate-800">Astra Manufacturing</p>
                          <p className="text-[9px] text-slate-400">Missing Q3 Financials</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Assessments Card Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Recent Assessments</h3>
                    <div className="text-xs text-slate-500 font-medium">
                      Showing {filteredAssessments.length} files
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-5 py-3">Entity Name</th>
                          <th className="px-5 py-3">Facility Type</th>
                          <th className="px-5 py-3">Requested Limit</th>
                          <th className="px-5 py-3">Credit Score</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                        {filteredAssessments.map((item) => {
                          const isLow = item.composite_score >= 700;
                          const isHigh = item.composite_score < 500;
                          
                          return (
                            <tr 
                              key={item.applicant_id}
                              onClick={() => handleOpenAssessment(item)}
                              className="hover:bg-slate-50/60 transition-all cursor-pointer group"
                            >
                              <td className="px-5 py-4 font-bold text-slate-850">
                                {item.applicant_name}
                                <span className="text-[9px] font-normal text-slate-400 block mt-0.5">ID: {item.applicant_id}</span>
                              </td>
                              <td className="px-5 py-4 text-slate-500">{item.recent_credit_lines[0]?.type || "Working Capital Line"}</td>
                              <td className="px-5 py-4 font-mono font-bold text-slate-800">
                                ₹{(item.recent_credit_lines[0]?.amount ? (item.recent_credit_lines[0].amount * 100).toFixed(0) : "85")} L
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center space-x-2">
                                  <span className={`font-bold font-mono ${isLow ? "text-emerald-600" : isHigh ? "text-rose-600" : "text-amber-650"}`}>
                                    {item.composite_score}
                                  </span>
                                  <span className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden inline-block">
                                    <div 
                                      className={`h-full rounded-full ${isLow ? "bg-emerald-500" : isHigh ? "bg-rose-500" : "bg-amber-500"}`} 
                                      style={{ width: `${((item.composite_score - 300) / 550) * 100}%` }}
                                    />
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  isLow 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                                    : isHigh 
                                      ? "bg-rose-50 text-rose-750 border-rose-150" 
                                      : "bg-amber-50 text-amber-700 border-amber-150"
                                }`}>
                                  {item.risk_band} Risk
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button className="text-xs text-[#0284C7] hover:text-[#0284C7]/80 font-bold hover:underline inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                  <span>Review File</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Detailed Assessments Workspace Screen */}
            {currentScreen === "assessments" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Assessment Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                      <span>{activeAssessment.applicant_name}</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-semibold">
                      <span>ID: {activeAssessment.applicant_id.toUpperCase()}</span>
                      <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                      <span>Last Underwritten: 2 Hours Ago (System Sync)</span>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap gap-2.5">
                    <button 
                      onClick={handleSyncAA}
                      className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-750 py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Sync AA Consent</span>
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-750 py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Generate PDF Report</span>
                    </button>
                    <button 
                      onClick={() => {
                        // Switch to Credit Memo screen
                        setCurrentScreen("credit-memo");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="bg-[#0284C7] hover:bg-[#0284C7]/90 text-white py-2 px-5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-white" />
                      <span>Generate Credit Memo</span>
                    </button>
                  </div>
                </div>

                {/* 12-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left panel Workspace (8 cols) */}
                  <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Top Row: ML Score & Financial Tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Risk Gauge */}
                      <RiskScoreGauge 
                        probabilityOfDefault={activeAssessment.probability_of_default}
                        riskBand={activeAssessment.risk_band}
                        confidence={activeAssessment.confidence}
                        loading={loading}
                      />

                      {/* Financial Tiers list */}
                      <div className="space-y-3">
                        {/* GST Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 shadow-sm transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-[#0284C7]">
                              <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">GST Turnover (LTM)</p>
                              <p className="text-base font-extrabold text-slate-850 mt-0.5">₹14.2 Cr</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end">
                              <TrendingUp className="w-3.5 h-3.5" /> +12%
                            </span>
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">vs. Prev Year</p>
                          </div>
                        </div>

                        {/* UPI Digital receipts card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 shadow-sm transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-[#0284C7]">
                              <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Digital Receipts (Avg/Mo)</p>
                              <p className="text-base font-extrabold text-slate-850 mt-0.5">₹85 L</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end">
                              <TrendingUp className="w-3.5 h-3.5" /> +8%
                            </span>
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">Sales Velocity</p>
                          </div>
                        </div>

                        {/* Bank Balance Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 shadow-sm transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-[#0284C7]">
                              <ClipboardCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Average Bank Balance</p>
                              <p className="text-base font-extrabold text-slate-850 mt-0.5">₹42 L</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-rose-600 flex items-center justify-end">
                              -3%
                            </span>
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">Volatility: Low</p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bureau credit lines data table */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 border-b border-slate-150 bg-slate-50/20">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Credit Lines (Bureau Registry)</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-150 text-[9px] font-bold text-slate-450 uppercase tracking-wider">
                              <th className="py-2.5 px-5">Lender Institution</th>
                              <th className="py-2.5 px-5">Facility Type</th>
                              <th className="py-2.5 px-5">Outstanding (Cr)</th>
                              <th className="py-2.5 px-5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-semibold text-slate-750 divide-y divide-slate-100">
                            {activeAssessment.recent_credit_lines.map((line, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3 px-5 text-slate-855 font-bold">{line.lender}</td>
                                <td className="py-3 px-5 text-slate-500">{line.type}</td>
                                <td className="py-3 px-5 font-mono text-slate-800">₹{line.amount.toFixed(2)} Cr</td>
                                <td className="py-3 px-5">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                    line.status === "Standard" 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-250" 
                                      : "bg-rose-50 text-rose-700 border-rose-250"
                                  }`}>
                                    {line.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* OCEN Payload block */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-5 py-3.5 border-b border-slate-150 flex justify-between items-center bg-slate-50/30">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">OCEN API Payload Schema</h3>
                        <button 
                          onClick={handleCopyJsonPayload}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-250 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-all shadow-sm"
                        >
                          {copySuccess ? "Copied!" : "Copy Payload"}
                        </button>
                      </div>
                      <div className="p-5">
                        <div className="bg-[#11181D] text-[#E1E3E4] rounded-lg p-5 overflow-x-auto relative max-h-72">
                          <pre className="font-mono text-xs leading-relaxed">
                            <code>
{`{
  "applicant_id": "${activeAssessment.applicant_id}",
  "applicant_name": "${activeAssessment.applicant_name}",
  "composite_score": ${activeAssessment.composite_score},
  "risk_band": "${activeAssessment.risk_band}",
  "recommended_action": "${activeAssessment.recommended_action}",
  "score_breakdown": {
    "revenueStability": {
      "score": ${activeAssessment.score_breakdown.revenueStability.score},
      "weight": ${activeAssessment.score_breakdown.revenueStability.weight}
    },
    "complianceHealth": {
      "score": ${activeAssessment.score_breakdown.complianceHealth.score},
      "weight": ${activeAssessment.score_breakdown.complianceHealth.weight}
    },
    "cashFlowDiscipline": {
      "score": ${activeAssessment.score_breakdown.cashFlowDiscipline.score}
    }
  }
}`}
                            </code>
                          </pre>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right panel (4 cols) */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col">
                    <ExplainabilityChart 
                      shapValues={activeAssessment.shap_values}
                      explainabilityFactors={activeAssessment.explainability_factors}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Alt-Data Insights Screen */}
            {currentScreen === "alt-data" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-800">Alt-Data Health Overview</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Comprehensive, high-precision analysis of non-traditional data streams for MSME credit underwriting.
                  </p>
                </div>
                <DataMatrix loading={loading} />
              </div>
            )}

            {/* 4. Credit Memorandum Screen */}
            {currentScreen === "credit-memo" && (
              <div className="space-y-6 animate-fadeIn pb-12 select-none">
                
                {/* Submit Confirmation banner */}
                {memoSubmitted && (
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-850 p-4 rounded-xl flex items-center space-x-3 shadow-sm animate-pulse">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div className="text-xs font-bold">
                      Credit Memo CR-992-B4 successfully locked and submitted to the Institutional Credit Committee! Audit trail updated in UTC system logs.
                    </div>
                  </div>
                )}

                {/* Print and Submit Header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Credit Memorandum Workspace</h2>
                    <p className="text-[10px] text-slate-450 font-semibold">Ready for submission to Committee Review</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.print()}
                      className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 py-2 px-4 rounded-lg text-xs font-semibold flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Document</span>
                    </button>
                    <button 
                      onClick={handleSubmitCreditMemo}
                      className="bg-[#0284C7] hover:bg-[#0284C7]/90 text-white py-2 px-5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Submit to Credit Committee</span>
                    </button>
                  </div>
                </div>

                {/* Credit Memo Document Page */}
                <div className="max-w-[800px] mx-auto bg-white border border-slate-200 rounded-xl p-10 md:p-12 shadow-md relative text-slate-800 leading-relaxed">
                  
                  {/* Watermark/stamp */}
                  <div className="absolute top-10 right-10 border border-[#0284C7] text-[#0284C7] text-[9px] font-bold px-3 py-1.5 uppercase tracking-wider rounded-md select-none rotate-2">
                    Internal Classification: Confidential
                  </div>

                  {/* Header Title */}
                  <div className="border-b-4 border-[#0284C7] pb-4 mb-6 flex justify-between items-end">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight uppercase">CREDIT MEMORANDUM</h1>
                      <div className="flex flex-col gap-1 mt-4 text-xs font-semibold">
                        <div className="flex"><span className="w-24 text-slate-400 uppercase text-[10px] tracking-wider">Entity:</span> <span className="text-slate-800">{activeAssessment.applicant_name}</span></div>
                        <div className="flex"><span className="w-24 text-slate-400 uppercase text-[10px] tracking-wider">Request:</span> <span className="text-slate-800">₹{(activeAssessment.recent_credit_lines[0]?.amount ? (activeAssessment.recent_credit_lines[0].amount * 100).toFixed(0) : "85")} Lakhs limit under {activeAssessment.recent_credit_lines[0]?.type || "Working Capital Line"}</span></div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] font-bold text-slate-500 space-y-1 font-mono">
                      <div>DATE: Oct 24, 2026</div>
                      <div>CASE ID: CR-992-B4</div>
                      <div>OFFICER: J. Sterling</div>
                    </div>
                  </div>

                  {/* Executive Summary section */}
                  <section className="space-y-3 mb-6">
                    <h3 className="text-xs font-bold text-[#0284C7] uppercase tracking-wider border-b border-slate-100 pb-1">1. Executive Credit Summary</h3>
                    <p className="text-xs text-slate-550 text-justify">
                      {activeAssessment.applicant_name} requests a credit facility of ₹{(activeAssessment.recent_credit_lines[0]?.amount ? (activeAssessment.recent_credit_lines[0].amount * 100).toFixed(0) : "85")} Lakhs to support operational and working capital fluctuations. The entity has demonstrated a stable turnover indices over the past 36 months. Digital UPI ledger receipts reflect an average monthly incoming volume of ₹85 Lakhs. While leverage remains adequate, recent industry changes warrant close monitoring of debt service coverage metrics.
                    </p>
                  </section>

                  {/* ML Risk assessment section */}
                  <section className="space-y-4 mb-6">
                    <h3 className="text-xs font-bold text-[#0284C7] uppercase tracking-wider border-b border-slate-100 pb-1">2. Machine Learning Risk Assessment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      {/* Risk Box */}
                      <div className="md:col-span-4 bg-slate-50/50 border border-slate-200 p-4 text-center rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Composite Score</p>
                        <p className="text-3xl font-extrabold text-slate-800 font-mono">{activeAssessment.composite_score}</p>
                        <span className="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200 px-2 py-0.5 rounded-full mt-3 uppercase tracking-wider">
                          {activeAssessment.risk_band} RISK PROFILE
                        </span>
                      </div>

                      {/* Identified risk factors list */}
                      <div className="md:col-span-8 border-l-4 border-l-rose-500 bg-rose-50/10 border border-slate-200 p-4 rounded-r-xl">
                        <h4 className="text-xs font-bold text-slate-850 mb-2 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          <span>Attributed Risk Factors</span>
                        </h4>
                        <ul className="list-disc list-inside text-[11px] text-slate-550 space-y-1">
                          {activeAssessment.explainability_factors.filter(f => f.type === "risk").map((factor, idx) => (
                            <li key={idx} className="text-justify"><span className="font-bold text-slate-850">{factor.label}:</span> {factor.description}</li>
                          ))}
                          {activeAssessment.explainability_factors.filter(f => f.type === "risk").length === 0 && (
                            <li className="text-slate-400">No high severity risk factor triggers logged.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Officer Recommendation Section */}
                  <section className="space-y-3 mb-6">
                    <h3 className="text-xs font-bold text-[#0284C7] uppercase tracking-wider border-b border-slate-100 pb-1">3. Credit Officer Recommendation</h3>
                    <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-emerald-700 text-base">Approval Recommended - Standard Terms</p>
                      <p className="text-xs text-slate-550 text-justify">
                        Despite specific trade line utilization fluctuations and supplier concentrations logged in compliance checks, the fundamental cash flow discipline is highly solid. Outstanding liabilities are adequately backed by current inventory levels and accounts receivable registers, providing solid downside cushions. Underwriter recommends approval of standard credit lines with quarterly review covenants.
                      </p>

                      {/* Signature line */}
                      <div className="pt-4 border-t border-slate-150 flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-3">
                          <div className="w-32 border-b border-slate-300 border-dashed"></div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Officer Signature</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-850">James Sterling</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">VP Commercial Lending</p>
                        </div>
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            )}

            {/* 5. Interactive Assessment Inputs/Form Screen */}
            {currentScreen === "new-assessment" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-800">Credit Risk Model Generator</h1>
                  <p className="text-xs text-slate-550 mt-1">Configure financial data parameters and call model endpoints dynamically.</p>
                </div>
                <div className="max-w-[720px] mx-auto">
                  <NewAssessmentForm onSubmit={handleTriggerScoreSubmit} loading={loading} />
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Real-time Toast message alert */}
        {showToast && (
          <div className="fixed bottom-6 left-6 z-50 max-w-sm bg-slate-900 border border-slate-700 text-white rounded-xl p-4 shadow-2xl flex items-start gap-3 animate-fadeIn select-none">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-extrabold text-white">System Synchronized</p>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">{showToast}</p>
            </div>
            <button onClick={() => setShowToast(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold leading-none p-1">
              ×
            </button>
          </div>
        )}

        {/* AI Credit Specialist Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
}
