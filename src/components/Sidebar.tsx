import { 
  LayoutDashboard, 
  FileCheck, 
  Database, 
  FileText, 
  Settings, 
  HelpCircle, 
  PlusCircle,
  Network
} from "lucide-react";
import { ViewScreen } from "../types";

interface SidebarProps {
  currentScreen: ViewScreen;
  onScreenChange: (screen: ViewScreen) => void;
  onOpenNewAssessment: () => void;
}

export default function Sidebar({ currentScreen, onScreenChange, onOpenNewAssessment }: SidebarProps) {
  const menuItems = [
    { id: "dashboard" as ViewScreen, label: "Dashboard", icon: LayoutDashboard },
    { id: "assessments" as ViewScreen, label: "Assessments", icon: FileCheck },
    { id: "alt-data" as ViewScreen, label: "Alt-Data", icon: Database },
    { id: "credit-memo" as ViewScreen, label: "Credit Memo", icon: FileText },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0F172A] flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Header Profile Area */}
      <div className="p-6 border-b border-slate-800/60 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
          <img 
            alt="Bank Officer Profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDr-8UpAWC4wK9ubVmztbMcCMMHMqPGO3SmV4wsKXBtvyT2ymAjihUt_z3MkPuygGDCOLcEfEFXjKa_KUuhZ8MvScnJ7hrCrWigkpWOa4DAs6S0QJv-3sbxvQ94ffU5OZQSuYP37gRaWKGGOGTWJBTgJMEGiVimMLu5iNJaVV_7djT6JY7dBPYAK2WPnPxz_r5vyEXMbZYxgkqZnRtl8_fQ5CHxq8i3Dj7zw2GsMNXRFJVHgRaWE__oIR4vNx8f49st39VwpR1Ogpw"
          />
        </div>
        <div>
          <h1 className="font-sans font-bold text-white text-base leading-tight">RiskIntel MSME</h1>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Institutional Banking</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-all text-left font-sans text-sm font-medium ${
                isActive
                  ? "text-white font-bold border-r-2 border-[#0284C7] bg-slate-800"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <IconComponent className={`w-[18px] h-[18px] ${isActive ? "text-[#0284C7]" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* OCEN Network (Display Link) */}
        <div className="pt-2">
          <button
            onClick={() => onScreenChange("alt-data")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-all text-left font-sans text-sm font-medium ${
              currentScreen === "alt-data"
                ? "text-white font-bold border-r-2 border-[#0284C7] bg-slate-800"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <Network className={`w-[18px] h-[18px] ${currentScreen === "alt-data" ? "text-[#0284C7]" : "text-slate-400"}`} />
            <span>OCEN Network</span>
          </button>
        </div>
      </nav>

      {/* Primary Action Trigger */}
      <div className="px-4 py-2">
        <button
          onClick={onOpenNewAssessment}
          className="w-full bg-[#0284C7] text-white hover:bg-[#0284C7]/90 transition-colors py-2.5 px-4 rounded font-sans text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Footer Settings & Support */}
      <div className="p-4 border-t border-slate-800 space-y-1 bg-slate-900/60">
        <button
          onClick={() => onScreenChange("new-assessment")} // Settings can just open inputs as well
          className="w-full flex items-center space-x-3 px-3 py-2 rounded text-left text-xs font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white"
        >
          <Settings className="w-[16px] h-[16px] text-slate-400" />
          <span>Configure API Settings</span>
        </button>
        <div className="flex items-center space-x-3 px-3 py-2 rounded text-left text-xs font-medium text-slate-400">
          <HelpCircle className="w-[16px] h-[16px] text-slate-400" />
          <span>Support: Online</span>
        </div>
      </div>
    </aside>
  );
}
