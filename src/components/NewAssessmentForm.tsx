import React, { useState, useEffect } from "react";
import { MSMEFinancialInputs } from "../types";
import { getApiUrl, setApiUrl, DEFAULT_BUILTIN_URL, DEFAULT_EXTERNAL_URL } from "../lib/api";
import { Sliders, ToggleLeft, ToggleRight, Settings, Info, Play, CheckCircle } from "lucide-react";

interface NewAssessmentFormProps {
  onSubmit: (inputs: MSMEFinancialInputs) => void;
  loading: boolean;
}

export default function NewAssessmentForm({ onSubmit, loading }: NewAssessmentFormProps) {
  // Central interactive state object
  const [inputs, setInputs] = useState<MSMEFinancialInputs>({
    applicant_name: "Acme Manufacturing Ltd.",
    facility_type: "Working Capital Line",
    requested_amount: 850000,
    gst_turnover_ltm: 14.2,
    digital_receipts_avg_mo: 85,
    avg_bank_balance: 42,
    dscr: 1.45,
    vintage_years: 7,
    supplier_concentration: 65,
    existing_debt_ratio: 82,
    recent_delinquency: true,
  });

  // API endpoint configuration state
  const [apiUrl, setApiUrlState] = useState<string>("");
  const [showEndpointConfig, setShowEndpointConfig] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    setApiUrlState(getApiUrl());
  }, []);

  const handleSaveEndpoint = () => {
    setApiUrl(apiUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setInputs(prev => ({
      ...prev,
      [name]: type === "checkbox" 
        ? (e.target as HTMLInputElement).checked 
        : type === "number" || e.target.tagName === "INPUT" && e.target.getAttribute("type") === "range"
          ? parseFloat(value)
          : value
    }));
  };

  const handleToggleDelinquency = () => {
    setInputs(prev => ({
      ...prev,
      recent_delinquency: !prev.recent_delinquency
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputs);
  };

  return (
    <form onSubmit={handleSubmitForm} className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 h-full shadow-sm">
      {/* Form Header */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0284C7]" />
            <span>Interactive Risk Underwriter</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Tweak MSME financials and simulate credit models in real-time</p>
        </div>
        
        {/* API Endpoint Config button */}
        <button
          type="button"
          onClick={() => setShowEndpointConfig(!showEndpointConfig)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-slate-500 border border-slate-200 rounded hover:bg-slate-50 transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>API Gateway Settings</span>
        </button>
      </div>

      {/* Expandable API Gateway Settings */}
      {showEndpointConfig && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3 animate-fadeIn">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-650">
              <p className="font-bold text-slate-800">API Gateway Configuration</p>
              <p>Direct your POST request to either the built-in full-stack node backend (default) or your local endpoint (e.g. <code>http://localhost:8000/api/v1/score</code>).</p>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Endpoint URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrlState(e.target.value)}
                placeholder="http://localhost:8000/api/v1/score"
                className="flex-1 bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
              />
              <button
                type="button"
                onClick={handleSaveEndpoint}
                className="bg-[#0284C7] text-white hover:bg-[#0284C7]/90 px-4 py-1.5 rounded text-xs font-semibold transition-all shrink-0"
              >
                Save
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-200">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setApiUrlState(DEFAULT_BUILTIN_URL); setApiUrl(DEFAULT_BUILTIN_URL); }}
                className="text-emerald-600 hover:underline"
              >
                Reset to Built-In Sandbox
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => { setApiUrlState(DEFAULT_EXTERNAL_URL); setApiUrl(DEFAULT_EXTERNAL_URL); }}
                className="text-[#0284C7] hover:underline"
              >
                Set to Localhost:8000
              </button>
            </div>
            {savedSuccess && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1 animate-pulse">
                <CheckCircle className="w-3 h-3" /> Saved!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Interactive Form Controls */}
      <div className="space-y-5">
        {/* Basic Client Identifiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Entity/Applicant Name</label>
            <input
              type="text"
              name="applicant_name"
              value={inputs.applicant_name}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Facility Type</label>
            <select
              name="facility_type"
              value={inputs.facility_type}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7]"
            >
              <option value="Working Capital Line">Working Capital Line</option>
              <option value="Equipment Term Loan">Equipment Term Loan</option>
              <option value="Commercial Mortgage">Commercial Mortgage</option>
            </select>
          </div>
        </div>

        {/* Requested Facility Amount */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Requested Limit (INR)</label>
            <span className="text-xs font-bold text-slate-800">₹{(inputs.requested_amount / 100000).toFixed(1)} Lakhs</span>
          </div>
          <input
            type="number"
            name="requested_amount"
            value={inputs.requested_amount}
            onChange={handleChange}
            min={10000}
            step={10000}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0284C7] focus:border-[#0284C7]"
          />
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
          
          {/* LTM GST Turnover */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">GST Turnover (LTM)</span>
              <span className="text-slate-800">₹{inputs.gst_turnover_ltm.toFixed(1)} Cr</span>
            </div>
            <input
              type="range"
              name="gst_turnover_ltm"
              min="0.5"
              max="100"
              step="0.5"
              value={inputs.gst_turnover_ltm}
              onChange={handleChange}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>0.5 Cr</span>
              <span>100.0 Cr</span>
            </div>
          </div>

          {/* Average Digital Receipts per Month */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Digital Receipts (Avg/Mo)</span>
              <span className="text-slate-800">₹{inputs.digital_receipts_avg_mo} L</span>
            </div>
            <input
              type="range"
              name="digital_receipts_avg_mo"
              min="2"
              max="500"
              step="2"
              value={inputs.digital_receipts_avg_mo}
              onChange={handleChange}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>2 L</span>
              <span>500 L</span>
            </div>
          </div>

          {/* Average Bank Balance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Bank Balance</span>
              <span className="text-slate-800">₹{inputs.avg_bank_balance} L</span>
            </div>
            <input
              type="range"
              name="avg_bank_balance"
              min="0.5"
              max="150"
              step="0.5"
              value={inputs.avg_bank_balance}
              onChange={handleChange}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>0.5 L</span>
              <span>150 L</span>
            </div>
          </div>

          {/* Debt Service Coverage Ratio (DSCR) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Debt Service Ratio (DSCR)</span>
              <span className={inputs.dscr < 1.1 ? "text-rose-600" : "text-slate-800"}>
                {inputs.dscr.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              name="dscr"
              min="0.5"
              max="3"
              step="0.05"
              value={inputs.dscr}
              onChange={handleChange}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>0.5x (Risky)</span>
              <span>3.0x (Optimal)</span>
            </div>
          </div>

          {/* Industry Vintage operational years */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Years Operational (Vintage)</span>
              <span className="text-slate-800">{inputs.vintage_years} Years</span>
            </div>
            <input
              type="range"
              name="vintage_years"
              min="1"
              max="25"
              step="1"
              value={inputs.vintage_years}
              onChange={handleChange}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>1 Year</span>
              <span>25 Years</span>
            </div>
          </div>

          {/* Supplier Concentration (top 2 suppliers) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Supplier Concentration</span>
              <span className={inputs.supplier_concentration > 60 ? "text-rose-600" : "text-slate-800"}>
                {inputs.supplier_concentration}%
              </span>
            </div>
            <input
              type="range"
              name="supplier_concentration"
              min="10"
              max="100"
              step="5"
              value={inputs.supplier_concentration}
              onChange={handleChange}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>10% (Low risk)</span>
              <span>100% (High risk)</span>
            </div>
          </div>

          {/* Trade Line Utilization Ratio */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Trade Line Utilization</span>
              <span className={inputs.existing_debt_ratio > 80 ? "text-rose-600" : "text-slate-800"}>
                {inputs.existing_debt_ratio}%
              </span>
            </div>
            <input
              type="range"
              name="existing_debt_ratio"
              min="10"
              max="100"
              step="1"
              value={inputs.existing_debt_ratio}
              onChange={handleChange}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0284C7]"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>10% Limit</span>
              <span>100% (Maxed Out)</span>
            </div>
          </div>

          {/* Recent Delinquency Toggle */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Minor Delinquency Risk</span>
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200 px-4 py-2 rounded h-9">
              <span className="text-[11px] text-slate-650 font-medium">Recent 30-Day Delinquency</span>
              <button
                type="button"
                onClick={handleToggleDelinquency}
                className="focus:outline-none transition-all cursor-pointer"
              >
                {inputs.recent_delinquency ? (
                  <ToggleRight className="w-8 h-8 text-rose-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Submission CTA */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0284C7] text-white hover:bg-[#0284C7]/90 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all py-3 px-6 rounded-lg font-sans text-sm font-bold flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              <span>Computing Credit Score...</span>
            </div>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Compute ML Credit Score</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
