import React, { useState, useEffect } from "react";
import { ActiveTab } from "../types";
import {
  GraduationCap,
  Flame,
  Clock,
  LayoutDashboard,
  CalendarDays,
  Timer,
  Bot,
  BrainCircuit,
  BarChart3,
  FileText,
  Menu,
  X,
  Sparkles,
  Settings,
  SlidersHorizontal,
  User,
  Sun,
  Moon,
} from "lucide-react";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  examDate: string;
  streak: number;
  themeMode?: "dark" | "light";
  setThemeMode?: (mode: "dark" | "light") => void;
  onOpenDossier?: () => void;
  onOpenSettings: () => void;
  onOpenWizard: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  examDate,
  streak,
  themeMode = "dark",
  setThemeMode,
  onOpenDossier,
  onOpenSettings,
  onOpenWizard,
  onOpenProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    const target = new Date(examDate).getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      setDaysRemaining(days);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [examDate]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "schedule", label: "AI Planner", icon: CalendarDays },
    { id: "specs", label: "Study Specs", icon: FileText },
    { id: "focus", label: "Focus Room", icon: Timer },
    { id: "tutor", label: "AI Tutor", icon: Bot },
    { id: "quiz", label: "Practice Vault", icon: BrainCircuit },
    { id: "diagnostics", label: "Diagnostics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#f4f3ff]/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-b border-indigo-100 dark:border-white/10 px-4 lg:px-8 py-3 transition-colors shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 ring-1 ring-white/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg lg:text-xl text-slate-900 dark:text-white tracking-tight">
                OBSIDIAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-emerald-400">APEX</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
                Matric AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
              All-Year Academic & Board Exam Planner
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 p-1 rounded-xl border border-indigo-100 dark:border-white/10 shadow-sm dark:shadow-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Top Indicators & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Counter */}
          <button
            id="btn-open-streak-calendar"
            onClick={onOpenProfile || onOpenWizard}
            title="View Daily Study Streak & Monthly Activity Calendar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900/90 hover:bg-amber-50 dark:hover:bg-slate-800 border border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm cursor-pointer transition active:scale-95"
          >
            <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
            <span>{streak}d</span>
          </button>

          {/* Student Profile Button */}
          <button
            id="btn-open-wizard"
            onClick={onOpenProfile || onOpenWizard}
            title="View Student Profile, Internet Sync & Activity Calendar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100/80 hover:bg-indigo-200/80 text-indigo-700 dark:bg-violet-600/20 dark:hover:bg-violet-600/40 dark:text-violet-300 border border-indigo-200 dark:border-violet-500/30 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <User className="w-4 h-4 text-indigo-600 dark:text-violet-400" />
            <span className="hidden sm:inline">Student Profile</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          {setThemeMode && (
            <button
              onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
              title={`Switch to ${themeMode === "dark" ? "Light (Neo-Lavender)" : "Dark"} Mode`}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/10 text-indigo-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-white hover:border-indigo-300 dark:hover:border-violet-500/50 shadow-sm dark:shadow-none transition-all active:scale-95"
            >
              {themeMode === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          )}

          {/* Settings Button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            title="Open Application & Profile Settings"
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-300 dark:hover:border-violet-500/50 shadow-sm dark:shadow-none transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-indigo-100 dark:border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-indigo-100 dark:border-white/10 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium border ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md"
                    : "bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-indigo-100 dark:border-white/5 hover:bg-indigo-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-600 dark:text-violet-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

