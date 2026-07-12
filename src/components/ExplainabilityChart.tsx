import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from "recharts";
import { SHAPFactor } from "../types";
import { HelpCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface ExplainabilityChartProps {
  shapValues: Record<string, number>;
  explainabilityFactors: SHAPFactor[];
  loading?: boolean;
}

export default function ExplainabilityChart({ 
  shapValues, 
  explainabilityFactors, 
  loading = false 
}: ExplainabilityChartProps) {

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="h-4 bg-slate-100 w-48 rounded"></div>
          <div className="h-4 bg-slate-100 w-4 rounded-full"></div>
        </div>
        <div className="h-[200px] bg-slate-100 rounded"></div>
        <div className="space-y-3">
          <div className="h-20 bg-slate-100 rounded"></div>
          <div className="h-20 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Convert raw SHAP values key-value pairs into Recharts-compatible data
  // Convert decimals to percentages for clarity, e.g., -0.012 -> -1.2% PD
  const chartData = Object.entries(shapValues).map(([key, val]) => {
    // Make names human-readable
    const label = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    
    return {
      rawKey: key,
      name: label,
      impact: parseFloat((val * 100).toFixed(2)), // e.g., -1.2
    };
  }).sort((a, b) => a.impact - b.impact); // Sort from highest strength to highest risk

  // Group explainability factors for high-precision display cards
  const strengths = explainabilityFactors.filter(f => f.type === "strength");
  const risks = explainabilityFactors.filter(f => f.type === "risk");

  // Custom Tooltip renderer for the Recharts bar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isNegative = data.impact < 0;
      return (
        <div className="bg-[#0F172A] text-white p-3 rounded-lg shadow-xl text-xs max-w-xs border border-slate-750">
          <p className="font-bold border-b border-slate-800 pb-1 mb-1.5">{data.name}</p>
          <p className="font-medium">
            Impact: <span className={isNegative ? "text-emerald-400" : "text-rose-400"}>
              {isNegative ? "" : "+"}{data.impact}% PD
            </span>
          </p>
          <p className="text-slate-400 mt-1 leading-relaxed text-[10px]">
            {isNegative 
              ? "Reduces predicted 12-month probability of default." 
              : "Increases predicted 12-month probability of default."
            }
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col h-full shadow-sm">
      {/* Section Header */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-5">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Explainability (SHAP Values)</h3>
          <p className="text-[10px] text-slate-450">Dynamic Attribution of Credit Score Inputs</p>
        </div>
        <HelpCircle className="w-5 h-5 text-slate-400 cursor-help" title="SHAP values show the directional impact of each risk factor on the probability of default." />
      </div>

      {/* SHAP Recharts Data Visualization */}
      <div className="w-full h-52 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
            <XAxis 
              type="number" 
              tickFormatter={(v) => `${v}%`}
              fontSize={10}
              stroke="#94A3B8"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              fontSize={10} 
              stroke="#94A3B8"
              width={110}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#475569" strokeWidth={1} />
            <Bar dataKey="impact" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => {
                // Color green for negative values (strengths), red for positive values (risks)
                const isNegative = entry.impact < 0;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={isNegative ? "#10B981" : "#EF4444"} 
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* High-Precision Strengths and Risks Lists */}
      <div className="flex-1 space-y-6 overflow-y-auto max-h-[350px] pr-1">
        {/* Key Strengths (Green border list) */}
        {strengths.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Key Strengths</span>
            </h4>
            <div className="space-y-3">
              {strengths.map((factor) => (
                <div 
                  key={factor.key} 
                  className="bg-emerald-50/20 border-l-4 border-emerald-500 border border-y-slate-100 border-r-slate-100 rounded-r-lg p-3 hover:bg-emerald-50/40 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-xs font-bold text-slate-800">{factor.label}</span>
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                      {(factor.impact * 100).toFixed(1)}% PD
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                    {factor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors (Red border list) */}
        {risks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Attributed Risk Factors</span>
            </h4>
            <div className="space-y-3">
              {risks.map((factor) => (
                <div 
                  key={factor.key} 
                  className="bg-rose-50/20 border-l-4 border-rose-500 border border-y-slate-100 border-r-slate-100 rounded-r-lg p-3 hover:bg-rose-50/40 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-xs font-bold text-slate-800">{factor.label}</span>
                    <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">
                      +{(factor.impact * 100).toFixed(1)}% PD
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                    {factor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
