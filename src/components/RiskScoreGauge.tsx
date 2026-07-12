import { motion } from "motion/react";
import { Gauge } from "lucide-react";

interface RiskScoreGaugeProps {
  probabilityOfDefault: number; // e.g., 0.042 (4.2%)
  riskBand: "Low" | "Moderate" | "High";
  confidence: number; // e.g. 94
  loading?: boolean;
}

export default function RiskScoreGauge({ 
  probabilityOfDefault, 
  riskBand, 
  confidence, 
  loading = false 
}: RiskScoreGaugeProps) {
  
  // Map Probability of Default (PD) to gauge rotation (from -90deg to +90deg)
  // Let's assume a range of 0% (0.0) to 20% (0.2) or 30% (0.3) default probability is the full span.
  const maxPD = 0.25; // 25% max
  const clampedPD = Math.max(0, Math.min(maxPD, probabilityOfDefault));
  const percentage = clampedPD / maxPD;
  const needleRotation = -90 + percentage * 180; // maps to -90 to 90 degrees

  // Band styling options using cohesive Sleek colors
  const bandStyles = {
    Low: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Low Risk Band" },
    Moderate: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Moderate Risk Band" },
    High: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "High Risk Band" }
  };

  const activeBand = bandStyles[riskBand] || bandStyles.Moderate;
  const segmentColor = riskBand === "Low" ? "#10B981" : riskBand === "Moderate" ? "#F59E0B" : "#EF4444";

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse flex flex-col justify-between h-[340px]">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="h-4 bg-slate-100 w-32 rounded"></div>
          <div className="h-5 w-5 bg-slate-100 rounded-full"></div>
        </div>
        <div className="my-auto flex flex-col items-center">
          <div className="h-28 w-40 bg-slate-100 rounded-t-full mb-4"></div>
          <div className="h-8 bg-slate-100 w-24 rounded mb-2"></div>
          <div className="h-3 bg-slate-100 w-48 rounded"></div>
        </div>
        <div className="h-8 bg-slate-100 w-full rounded mt-4"></div>
      </div>
    );
  }

  // Convert default decimal rate to formatted percentage (e.g. 0.042 -> "4.2%")
  const formattedPD = (probabilityOfDefault * 100).toFixed(1) + "%";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-full min-h-[340px] shadow-sm">
      {/* Card Header */}
      <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">ML Risk Score (PD)</h3>
          <p className="text-[10px] text-slate-400">12-Month Predictive Horizon</p>
        </div>
        <Gauge className="w-5 h-5 text-slate-400" />
      </div>

      {/* Speedometer Gauge Visual */}
      <div className="text-center flex-1 flex flex-col justify-center items-center">
        <div className="relative w-44 h-24 mx-auto flex items-center justify-center">
          <svg viewBox="0 0 200 110" className="w-44 h-24">
            {/* Grey background track */}
            <circle 
              cx="100" 
              cy="100" 
              r="80" 
              fill="none" 
              stroke="#F1F5F9" 
              strokeWidth="14" 
              strokeDasharray="251.3 502.6" 
              transform="rotate(180 100 100)" 
            />
            
            {/* Custom colored active arc segment */}
            <motion.circle 
              cx="100" 
              cy="100" 
              r="80" 
              fill="none" 
              stroke={segmentColor} 
              strokeWidth="14" 
              strokeDasharray="251.3 502.6" 
              initial={{ strokeDashoffset: 251.3 }}
              animate={{ strokeDashoffset: 251.3 * (1 - percentage) }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
              transform="rotate(180 100 100)" 
            />

            {/* Needle pivot dot background */}
            <circle cx="100" cy="100" r="7" fill="#1E293B" />

            {/* Animating Needle */}
            <motion.g
              initial={{ rotate: -90 }}
              animate={{ rotate: needleRotation }}
              style={{ transformOrigin: "100px 100px" }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            >
              <line 
                x1="100" 
                y1="100" 
                x2="100" 
                y2="34" 
                stroke="#1E293B" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
              <circle cx="100" cy="100" r="3" fill="#FFFFFF" />
            </motion.g>
          </svg>
        </div>

        {/* Large Score Value */}
        <div className="mt-4">
          <span className="text-[38px] font-extrabold text-slate-800 leading-none tracking-tight">
            {formattedPD}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">Probability of Default (PD)</p>
      </div>

      {/* Card Footer Status Indicators */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${activeBand.bg} ${activeBand.text} ${activeBand.border}`}>
          {activeBand.label}
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Confidence: {confidence}%
        </span>
      </div>
    </div>
  );
}
