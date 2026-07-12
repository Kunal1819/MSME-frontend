import { 
  BarChart as RechartsBarChart, 
  Bar as RechartsBar, 
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  AreaChart as RechartsAreaChart,
  Area as RechartsArea,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Wallet, 
  DollarSign, 
  Info,
  Download
} from "lucide-react";

interface DataMatrixProps {
  loading?: boolean;
}

export default function DataMatrix({ loading = false }: DataMatrixProps) {
  
  // High fidelity ALT-Data mock sets
  const gstTurnoverData = [
    { month: "M1", turnover: 40 },
    { month: "M2", turnover: 45 },
    { month: "M3", turnover: 32 },
    { month: "M4", turnover: 55 },
    { month: "M5", turnover: 50 },
    { month: "M6", turnover: 65 },
  ];

  const cashflowData = [
    { name: "Oct", velocity: 60 },
    { name: "Nov", velocity: 50 },
    { name: "Dec", velocity: 80 },
    { name: "Jan", velocity: 45 },
    { name: "Feb", velocity: 30 },
    { name: "Mar", velocity: 85 },
    { name: "Apr", velocity: 90 },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white h-80 rounded-xl border border-slate-200"></div>
          <div className="col-span-12 lg:col-span-4 bg-white h-80 rounded-xl border border-slate-200"></div>
        </div>
        <div className="bg-white h-72 rounded-xl border border-slate-200 w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section: GST Insights & Account Aggregator */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* GST Insights Panel */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              <Receipt className="w-4 h-4 text-[#0284C7]" />
              <span>GST Insights (GSTR-3B Filing Log)</span>
            </h2>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
              High Consistency
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {/* Left Column: Key GST metrics */}
            <div className="md:col-span-1 flex flex-col justify-between border-r border-slate-100 pr-4 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Monthly Turnover</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">₹42.5 L</p>
                <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12% YoY filing trend</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filing Delay (Average)</p>
                <p className="text-xl font-bold text-slate-800 mt-1">2.4 Days</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Threshold benchmark: &lt; 5.0 days</p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-3 bg-emerald-50/10 py-2 rounded-r">
                <p className="text-[10px] text-slate-500 leading-relaxed text-justify">
                  Consistent GSTR-3B filings observed over the last 12 months. No significant gaps or compliance warnings detected in system logs.
                </p>
              </div>
            </div>

            {/* Right Columns: Recharts Bar chart */}
            <div className="md:col-span-2 flex flex-col justify-between pl-2">
              <p className="text-[11px] font-semibold text-slate-500 mb-3">Monthly Turnover Trend (Last 6 Mos)</p>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={gstTurnoverData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" fontSize={10} stroke="#94A3B8" tickLine={false} />
                    <YAxis fontSize={10} stroke="#94A3B8" tickLine={false} unit="L" />
                    <Tooltip formatter={(value) => [`₹${value} Lakhs`, "Turnover"]} />
                    <RechartsBar dataKey="turnover" fill="#0284C7" radius={[2, 2, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Account Aggregator (AA) Analysis */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              <Wallet className="w-4 h-4 text-[#0284C7]" />
              <span>AA Consent Analysis</span>
            </h2>
          </div>

          <div className="flex flex-col gap-5 flex-1 justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Debt-to-Income Ratio</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800">0.42</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Optimal Target &lt; 0.50</span>
              </div>
            </div>

            {/* Custom Progress Bar Indicator */}
            <div className="w-full">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0284C7]" style={{ width: "42%" }}></div>
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-1.5 font-medium">
                <span>0.0 (Debt Free)</span>
                <span>0.5 (Warning limit)</span>
              </div>
            </div>

            {/* Financial Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-slate-50/50 p-3 rounded border border-slate-100">
                <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Avg Bank Balance</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1">₹8.5 L</p>
              </div>
              <div className="bg-slate-50/50 p-3 rounded border border-slate-100">
                <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Bounce Rate (LTM)</p>
                <p className="text-sm font-extrabold text-emerald-600 mt-1">0.0%</p>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 text-amber-700 rounded-lg p-2.5 text-[10px] flex items-start gap-1.5 leading-relaxed">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>Zero EMI bounce alerts detected across all primary current accounts over 365-day log review.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Cashflow Velocity Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
            <DollarSign className="w-4 h-4 text-[#0284C7]" />
            <span>UPI &amp; Current Account Cashflow Velocity</span>
          </h2>
          <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded border border-slate-200">
            <button className="px-2.5 py-0.5 text-[9px] font-bold text-slate-650 bg-white rounded shadow-sm uppercase tracking-wider">
              Velocity Value
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left stats info */}
          <div className="lg:col-span-3 space-y-4 pr-4 lg:border-r lg:border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Daily Transaction Vol (Avg)</p>
              <p className="text-xl font-bold text-slate-800 mt-1">142 Txns / Day</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peak Seasonal Quarter</p>
              <p className="text-sm font-bold text-slate-800 mt-1">Q3 (Oct - Dec Highs)</p>
            </div>

            <div className="border-l-4 border-rose-500 pl-3 bg-rose-50/10 py-2 rounded-r text-[10px] text-slate-550 leading-relaxed">
              <span className="font-bold text-rose-600 block mb-0.5">Observation:</span> Minor, typical sectoral cashflow dip observed in early Feb, correlation matches typical manufacturing restock windows.
            </div>
          </div>

          {/* Right Recharts Area chart */}
          <div className="lg:col-span-9">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" fontSize={10} stroke="#94A3B8" tickLine={false} />
                  <YAxis fontSize={10} stroke="#94A3B8" tickLine={false} />
                  <Tooltip formatter={(value) => [`${value}% capacity`, "Velocity"]} />
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <RechartsArea type="monotone" dataKey="velocity" stroke="#0284C7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVelocity)" />
                </RechartsAreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
