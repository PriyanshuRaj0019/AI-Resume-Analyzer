import React, { useState, useEffect } from "react";
import ResumeUploader from "./components/ResumeUploader";
import ResumeResults from "./components/ResumeResults";
import { ResumeAnalysisResult, RolePreset } from "./types";
import { SAMPLE_SCANS, HistoricScan } from "./data/sampleScans";
import { ROLE_PRESETS } from "./data/rolePresets";
import { 
  LayoutDashboard, 
  FileSearch, 
  Briefcase, 
  History, 
  Trash2, 
  TrendingUp, 
  PlusCircle, 
  Award, 
  Search, 
  Sliders, 
  Menu, 
  X, 
  Clock, 
  FileText, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function App() {
  // State for Navigation and Views
  const [activeTab, setActiveTab] = useState<"dashboard" | "scanner" | "presets" | "history">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Resume Analyzer States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<HistoricScan | null>(null);

  // Persistent Historical Scans State
  const [scans, setScans] = useState<HistoricScan[]>([]);

  // Search & Dynamic Filtering State Controls
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterScoreTier, setFilterScoreTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  // Load Initial Dataset
  useEffect(() => {
    const cachedScans = localStorage.getItem("AI_RESUME_ANALYZER_SCANS_V1");
    if (cachedScans) {
      try {
        setScans(JSON.parse(cachedScans));
      } catch (e) {
        setScans(SAMPLE_SCANS);
      }
    } else {
      // Seed initial samples for demonstration immediately
      setScans(SAMPLE_SCANS);
      localStorage.setItem("AI_RESUME_ANALYZER_SCANS_V1", JSON.stringify(SAMPLE_SCANS));
    }
  }, []);

  // Update Cache when items change
  const saveScans = (updatedScans: HistoricScan[]) => {
    setScans(updatedScans);
    localStorage.setItem("AI_RESUME_ANALYZER_SCANS_V1", JSON.stringify(updatedScans));
  };

  // Run Real PDF analysis
  const handleAnalyze = async (payload: {
    resumeBase64: string;
    mimeType: string;
    filename: string;
    jobDescription: string;
    targetRole: string;
  }) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setSelectedScan(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeBase64: payload.resumeBase64,
          mimeType: payload.mimeType,
          jobDescription: payload.jobDescription,
          targetRole: payload.targetRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || `Analysis API returned HTTP ${response.status}`);
      }

      const parsedResult: ResumeAnalysisResult = await response.json();
      
      const newScan: HistoricScan = {
        id: "scan_" + Date.now(),
        filename: payload.filename,
        timestamp: new Date().toISOString(),
        candidateName: parsedResult.candidateName || "Candidate Profile",
        candidateTitle: parsedResult.candidateTitle || payload.targetRole,
        matchScore: parsedResult.matchScore || 0,
        targetRole: payload.targetRole,
        result: parsedResult
      };

      const updated = [newScan, ...scans];
      saveScans(updated);
      setSelectedScan(newScan);
      
      // Auto transition to scan results tab view
      setActiveTab("scanner");
    } catch (err: any) {
      console.error("Analysis request error:", err);
      setErrorMsg(err?.message || "Something went wrong during the analysis request. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteScan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this scan history record?")) {
      const updated = scans.filter(s => s.id !== id);
      saveScans(updated);
      if (selectedScan?.id === id) {
        setSelectedScan(null);
      }
    }
  };

  const handleClearAllHistory = () => {
    if (confirm("This will clear all records and custom files. Restore default showcase dataset?")) {
      setScans(SAMPLE_SCANS);
      localStorage.setItem("AI_RESUME_ANALYZER_SCANS_V1", JSON.stringify(SAMPLE_SCANS));
      setSelectedScan(null);
      setActiveTab("dashboard");
    }
  };

  // Dashboard Stats Calculations
  const totalScans = scans.length;
  const averageScore = totalScans > 0 
    ? Math.round(scans.reduce((sum, s) => sum + s.matchScore, 0) / totalScans) 
    : 0;
  
  const highFitCount = scans.filter(s => s.matchScore >= 80).length;
  const passRatePercentage = totalScans > 0 
    ? Math.round((highFitCount / totalScans) * 100) 
    : 0;

  const totalRecommendationsCounts = scans.reduce((sum, s) => sum + (s.result?.gapsAndRecommendations?.length || 0), 0);

  // Dynamic benchmark aggregates mapping
  const benchmarkStats = ROLE_PRESETS.map((preset) => {
    const roleScans = scans.filter((s) => s.targetRole === preset.name);
    const count = roleScans.length;
    const avgScore = count > 0 
      ? Math.round(roleScans.reduce((sum, s) => sum + s.matchScore, 0) / count)
      : 0;
    return {
      ...preset,
      count,
      avgScore
    };
  });

  // Filter and sort core scans array
  const filteredScans = scans
    .filter((scan) => {
      // 1. Search Query filter (matches candidateName, candidateTitle, targetRole, or filename)
      const query = searchTerm.toLowerCase().trim();
      if (query) {
        const matchesName = scan.candidateName?.toLowerCase().includes(query);
        const matchesTitle = scan.candidateTitle?.toLowerCase().includes(query);
        const matchesRole = scan.targetRole?.toLowerCase().includes(query);
        const matchesFile = scan.filename?.toLowerCase().includes(query);
        if (!matchesName && !matchesTitle && !matchesRole && !matchesFile) {
          return false;
        }
      }

      // 2. Target Benchmark filter
      if (filterRole !== "all") {
        if (scan.targetRole !== filterRole) {
          return false;
        }
      }

      // 3. Compatibility Level tier filter
      if (filterScoreTier !== "all") {
        if (filterScoreTier === "elite") {
          return scan.matchScore >= 80;
        } else if (filterScoreTier === "good") {
          return scan.matchScore >= 60 && scan.matchScore < 80;
        } else if (filterScoreTier === "needs-work") {
          return scan.matchScore < 60;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // 4. Sorting logic
      if (sortBy === "score-desc") {
        return b.matchScore - a.matchScore;
      } else if (sortBy === "score-asc") {
        return a.matchScore - b.matchScore;
      } else if (sortBy === "date-asc") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else { // "date-desc"
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  // Reusable polished filter card toolbar
  const renderFilterToolbar = () => (
    <div className="bg-white border border-zinc-150 p-4.5 rounded-2xl shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-zinc-950 font-display uppercase tracking-tight">Active Audit Search & Filters</h4>
        </div>
        
        {(searchTerm || filterRole !== "all" || filterScoreTier !== "all" || sortBy !== "date-desc") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterRole("all");
              setFilterScoreTier("all");
              setSortBy("date-desc");
            }}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/60 px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Clear Active Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Search text input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search candidate name or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-inner focus:outline-indigo-500 focus:border-indigo-500 text-zinc-800 placeholder:text-zinc-400 leading-normal"
          />
        </div>

        {/* 2. Target role presets selector */}
        <div className="relative">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-inner focus:outline-indigo-500 focus:border-indigo-500 text-zinc-700 leading-normal appearance-none cursor-pointer"
          >
            <option value="all">🎯 All Benchmarks</option>
            {ROLE_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.name}>
                {preset.name}
              </option>
            ))}
            <option value="Custom Role">Custom Roles</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-[10px] font-mono">▼</span>
        </div>

        {/* 3. Core matching score range selector */}
        <div className="relative">
          <select
            value={filterScoreTier}
            onChange={(e) => setFilterScoreTier(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-inner focus:outline-indigo-500 focus:border-indigo-500 text-zinc-700 leading-normal appearance-none cursor-pointer"
          >
            <option value="all">⚡ All Match Levels</option>
            <option value="elite">🟢 Elite Fit (80-100%)</option>
            <option value="good">🟡 Good Fit (60-79%)</option>
            <option value="needs-work">🔴 Lacks Criteria (&lt;60%)</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-[10px] font-mono">▼</span>
        </div>

        {/* 4. Sort method selector */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-inner focus:outline-indigo-500 focus:border-indigo-500 text-zinc-700 leading-normal appearance-none cursor-pointer"
          >
            <option value="date-desc">📅 Newest Audits First</option>
            <option value="date-asc">📅 Oldest Audits First</option>
            <option value="score-desc">📈 Match Score: High to Low</option>
            <option value="score-asc">📉 Match Score: Low to High</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-[10px] font-mono">▼</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col antialiased text-zinc-800 font-sans">
      {/* Premium Navigation Top Bar (Responsive menu indicator for Mobile devices) */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-150 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-100 font-bold tracking-tight">
              RA
            </div>
            <div>
              <span className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-1.5">
                ResumeMetrics® <span className="bg-emerald-50 text-emerald-700 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border border-emerald-200">SaaS Suite</span>
              </span>
              <p className="text-[10px] text-zinc-400 font-mono">Precision ATS Compliance Engine</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-zinc-50 py-1.5 px-3 rounded-lg border border-zinc-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gemini LLM Analyzer Service Live</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Workspace Sidebar (Hidden on mobile unless toggled open) */}
        <aside className={`
          fixed inset-0 z-30 lg:static lg:block w-64 bg-zinc-900 text-zinc-300 border-r border-zinc-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          {/* Main List */}
          <div className="p-4 space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider block px-2">
                Main Workspace
              </label>
              
              <nav className="space-y-1">
                <button
                  onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left ${
                    activeTab === "dashboard"
                      ? "bg-indigo-600 text-white font-bold"
                      : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <LayoutDashboard className="w-4.5 h-4.5" />
                  <span>SaaS Dashboard</span>
                </button>

                <button
                  onClick={() => { setActiveTab("scanner"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left ${
                    activeTab === "scanner"
                      ? "bg-indigo-600 text-white font-bold"
                      : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <FileSearch className="w-4.5 h-4.5" />
                  <span className="flex-1">AI Resume Scanner</span>
                  <span className="bg-indigo-500/25 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-indigo-500/30">
                    Live
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab("presets"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left ${
                    activeTab === "presets"
                      ? "bg-indigo-600 text-white font-bold"
                      : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Briefcase className="w-4.5 h-4.5" />
                  <span>Target Benchmarks</span>
                </button>

                <button
                  onClick={() => { setActiveTab("history"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left ${
                    activeTab === "history"
                      ? "bg-indigo-600 text-white font-bold"
                      : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <History className="w-4.5 h-4.5" />
                  <span>Audited Database</span>
                  {scans.length > 0 && (
                    <span className="ml-auto bg-zinc-800 text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-zinc-700">
                      {scans.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Quick-links of recent parsed profiles */}
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <label className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider block px-2">
                Recent Scandocs
              </label>
              
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {scans.slice(0, 4).map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => {
                      setSelectedScan(scan);
                      setActiveTab("scanner");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between text-left px-2 py-2 rounded-lg text-[11px] text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-colors"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold block truncate text-zinc-300">{scan.candidateName}</span>
                      <span className="text-[9px] text-zinc-500 font-mono truncate">{scan.targetRole}</span>
                    </div>
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                      scan.matchScore >= 80 
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-900/40" 
                        : "bg-zinc-800 text-zinc-300"
                    }`}>
                      {scan.matchScore}
                    </span>
                  </button>
                ))}
                {scans.length === 0 && (
                  <p className="text-[10px] font-mono italic text-zinc-600 px-2 py-2">No documents parsed yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* User Settings info bar */}
          <div className="p-4 border-t border-zinc-800 space-y-3.5 bg-zinc-950/40">
            <div className="bg-zinc-800/40 border border-zinc-800/80 p-3 rounded-xl text-xs space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-400 block font-mono">Premium Account</span>
              <p className="text-zinc-300 font-semibold truncate">Enterprise Workspace</p>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-4/5"></div>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">Credits Used: Unlimited</p>
            </div>

            <button
              onClick={handleClearAllHistory}
              className="w-full flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-zinc-500 hover:text-red-400 transition-colors py-1 hover:bg-red-950/20 rounded"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Reset Premium Sandbox</span>
            </button>
          </div>
        </aside>

        {/* Overlay context background for side drawer on mobile browsers */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          />
        )}

        {/* Core Main View Engine */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 bg-zinc-50 relative">
          
          {/* TAB 1: DASHBOARD VIEW ROUTER */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 max-w-5xl mx-auto">
              
              {/* Header Title Greeting Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">
                    Welcome back To Corporate Analytics
                  </h2>
                  <p className="text-zinc-600 text-xs sm:text-sm">
                    Review and verify incoming candidates or benchmark performance matrices.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("scanner")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4, py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 px-5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Scan New Resume PDF</span>
                </button>
              </div>

              {/* STATS / KPI CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* KPI Item 1 */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-xs space-y-4">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Processed Resumes</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-zinc-950 font-display">{totalScans}</span>
                    <span className="text-[10px] block font-mono text-zinc-500 mt-1">Scan history count in cache</span>
                  </div>
                </div>

                {/* KPI Item 2 */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-xs space-y-4">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Avg Match Score</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-zinc-950 font-display">{averageScore}%</span>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-2">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${averageScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* KPI Item 3 */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-xs space-y-4">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Strong Fit Rate</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-zinc-950 font-display">{passRatePercentage}%</span>
                    <span className="text-[10px] block font-mono text-zinc-500 mt-1">Scores reaching {`>=`} 80% mark</span>
                  </div>
                </div>

                {/* KPI Item 4 */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-xs space-y-4">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono">System Advice Cards</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-zinc-950 font-display">{totalRecommendationsCounts}</span>
                    <span className="text-[10px] block font-mono text-zinc-500 mt-1">Actionable updates requested</span>
                  </div>
                </div>
              </div>

              {/* PROGRESS & TREND CHARTS PANELS (Responsive Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* SVG Score Trend Chart Card (Left Columns) */}
                <div className="lg:col-span-8 bg-white border border-zinc-150 p-6 rounded-2xl shadow-xs space-y-4">
                  <div>
                    <h3 className="font-bold text-zinc-950 text-sm font-display">Compliance Trend Mapping</h3>
                    <p className="text-zinc-500 text-xs">Evaluates overall score alignment across historic candidate databases.</p>
                  </div>

                  {/* SVG Line chart representing the files processed */}
                  <div className="relative pt-2 h-44 flex flex-col justify-between">
                    {totalScans > 0 ? (
                      <div className="h-full w-full flex flex-col justify-end">
                        <svg className="w-full h-28" viewBox="0 0 400 100" preserveAspectRatio="none">
                          {/* Grid horizontal lines */}
                          <line x1="0" y1="20" x2="400" y2="20" className="stroke-zinc-100" strokeWidth="1" strokeDasharray="3" />
                          <line x1="0" y1="50" x2="400" y2="50" className="stroke-zinc-100" strokeWidth="1" strokeDasharray="3" />
                          <line x1="0" y1="80" x2="400" y2="80" className="stroke-zinc-100" strokeWidth="1" strokeDasharray="3" />

                          {/* Generate polyline points coordinate dynamically from scans list */}
                          <polyline
                            className="stroke-indigo-600 fill-none"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={
                              (() => {
                                const revScans = [...scans].reverse();
                                return revScans.map((s, idx) => {
                                  const x = revScans.length > 1 ? (idx * (400 / (revScans.length - 1))) : 200;
                                  // Score max 100 -> maps 0 - 80 height (10 -> 80 height offset)
                                  const y = 90 - (s.matchScore * 0.7); 
                                  return `${x},${y}`;
                                }).join(" ");
                              })()
                            }
                          />

                          {/* Points visual marker highlights */}
                          {(() => {
                            const revScans = [...scans].reverse();
                            return revScans.map((s, idx) => {
                              const x = revScans.length > 1 ? (idx * (400 / (revScans.length - 1))) : 200;
                              const y = 90 - (s.matchScore * 0.7); 
                              return (
                                <g key={s.id} className="group/dot">
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    className="fill-indigo-600 stroke-white cursor-pointer"
                                    strokeWidth="1.5"
                                  />
                                  <title>{`${s.candidateName}: ${s.matchScore}%`}</title>
                                </g>
                              );
                            });
                          })()}
                        </svg>
                        
                        {/* Legend Axis bottom line */}
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-100 px-2">
                          <span>Oldest Check</span>
                          <span>Audit Trend Line</span>
                          <span>Latest Parse</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs font-mono text-zinc-400">
                        Insufficient audits to map score distribution curves.
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Distribution Profile (Right Column) */}
                <div className="lg:col-span-4 bg-white border border-zinc-150 p-6 rounded-2xl shadow-xs space-y-4">
                  <div>
                    <h3 className="font-bold text-zinc-950 text-sm font-display font-semibold">Verification Levels</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">Scored candidate tiers distribution list.</p>
                  </div>

                  <div className="space-y-3.5 pt-1 text-xs">
                    {/* Level 1: Strong Fit */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-650">
                        <span className="font-semibold text-emerald-700 flex items-center gap-1.5 font-mono">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Elite Fit (80-100)
                        </span>
                        <span className="font-mono text-zinc-500 font-semibold">
                          {scans.filter(s => s.matchScore >= 80).length} files
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${totalScans > 0 ? (scans.filter(s => s.matchScore >= 80).length / totalScans) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Level 2: Moderate Fit */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-650">
                        <span className="font-semibold text-amber-700 flex items-center gap-1.5 font-mono">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          Good Fit (60-79)
                        </span>
                        <span className="font-mono text-zinc-500 font-semibold">
                          {scans.filter(s => s.matchScore >= 60 && s.matchScore < 80).length} files
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full rounded-full" 
                          style={{ width: `${totalScans > 0 ? (scans.filter(s => s.matchScore >= 60 && s.matchScore < 80).length / totalScans) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Level 3: Needs adjustment */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-650">
                        <span className="font-semibold text-rose-700 flex items-center gap-1.5 font-mono">
                          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                          Lacks Criteria ({`<`} 60)
                        </span>
                        <span className="font-mono text-zinc-500 font-semibold">
                          {scans.filter(s => s.matchScore < 60).length} files
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-400 h-full rounded-full" 
                          style={{ width: `${totalScans > 0 ? (scans.filter(s => s.matchScore < 60).length / totalScans) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* COMPARATIVE ROLE BENCHMARKS GRID */}
              <div className="bg-white border border-zinc-150 p-6 rounded-2xl shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-zinc-950 text-sm font-display flex items-center gap-1.5">
                    <Briefcase className="w-4.5 h-4.5 text-indigo-500" />
                    <span>Comparative Benchmark Metrics</span>
                  </h3>
                  <p className="text-zinc-500 text-xs">Matching performance averages computed dynamically per job category target rules.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {benchmarkStats.map((stat) => (
                    <div key={stat.id} className="bg-zinc-50 p-4.5 rounded-xl border border-zinc-200/60 flex flex-col justify-between space-y-3.5 hover:border-indigo-200 hover:bg-indigo-50/5 transition-all">
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-900 text-xs tracking-tight line-clamp-1 block" title={stat.name}>{stat.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400 block">{stat.count} Audited Profile{stat.count === 1 ? "" : "s"}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-mono text-zinc-400 block font-semibold">Avg Match</span>
                          <span className={`${stat.count > 0 ? "text-indigo-600 font-bold" : "text-zinc-400 font-medium"} text-lg font-mono block`}>
                            {stat.count > 0 ? `${stat.avgScore}%` : "—"}
                          </span>
                        </div>
                        {stat.count > 0 && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${
                            stat.avgScore >= 80 ? "bg-emerald-100 text-emerald-800" : stat.avgScore >= 60 ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-600"
                          }`}>
                            {stat.avgScore >= 80 ? "STRONG" : stat.avgScore >= 60 ? "STABLE" : "LACKS"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DYNAMIC SEARCH FILTERS COUPLING */}
              {renderFilterToolbar()}

              {/* RECENT HISTORICAL DIRECTORY LOG TABLE */}
              <div className="bg-white border border-zinc-150 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-6 py-4.5 border-b border-zinc-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-bold text-zinc-950 text-sm font-display font-semibold">Compliance Audit Registry</h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      Reviewing {filteredScans.length} of {scans.length} candidate scan records in the workspace.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Real-time local storage database live</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-600 border-collapse">
                    <thead className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-150 font-mono">
                      <tr>
                        <th className="px-6 py-3.5">Candidate Name</th>
                        <th className="px-6 py-3.5">Target Benchmark</th>
                        <th className="px-6 py-3.5">Assessed Score</th>
                        <th className="px-6 py-3.5">Actionable Gaps Found</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 font-sans">
                      {filteredScans.map((scan) => (
                        <tr 
                          key={scan.id} 
                          onClick={() => { setSelectedScan(scan); setActiveTab("scanner"); }}
                          className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <span className="font-bold text-zinc-900 block group-hover:text-indigo-600 transition-colors">
                                {scan.candidateName}
                              </span>
                              <span className="text-[11px] text-zinc-500 max-w-xs block truncate mt-0.5">
                                {scan.candidateTitle}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-zinc-100 text-zinc-700 py-1 px-2.5 rounded-lg border border-zinc-200 text-[11px] font-medium">
                              {scan.targetRole}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                                scan.matchScore >= 80 
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                  : scan.matchScore >= 60 
                                  ? "bg-amber-50 text-amber-800 border border-amber-200" 
                                  : "bg-rose-50 text-rose-805 border border-rose-200"
                              }`}>
                                {scan.matchScore}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-zinc-500 font-semibold">
                            {scan.result?.missingSkills?.length || 0} gaps
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => { setSelectedScan(scan); setActiveTab("scanner"); }}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                              >
                                View Report
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteScan(scan.id, e)}
                                className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-zinc-100 transition-all"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredScans.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-zinc-500 text-xs font-mono px-6">
                            <AlertCircle className="w-5 h-5 text-zinc-400 mx-auto mb-2" />
                            <span>No candidate audits match the selected combination of filters.</span>
                            <button 
                              onClick={() => {
                                setSearchTerm("");
                                setFilterRole("all");
                                setFilterScoreTier("all");
                                setSortBy("date-desc");
                              }}
                              className="text-indigo-600 font-bold block mx-auto mt-1.5 underline cursor-pointer hover:text-indigo-800"
                            >
                              Reset Active Filters
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: RESUME SCANNER (Workspace) */}
          {activeTab === "scanner" && (
            <div className="max-w-5xl mx-auto space-y-8">
              
              {/* Back to workspace dashboard if a scan report is currently loaded inside results view */}
              {selectedScan ? (
                <div className="space-y-6">
                  {/* Results Display */}
                  <ResumeResults 
                    result={selectedScan.result} 
                    filename={selectedScan.filename} 
                    onReset={() => {
                      setSelectedScan(null);
                    }} 
                  />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* File Upload Canvas Workspace */}
                  <ResumeUploader 
                    onAnalyze={handleAnalyze} 
                    isAnalyzing={isAnalyzing} 
                    errorMsg={errorMsg} 
                  />
                  
                  {/* Features detailed workflow */}
                  <div className="bg-white p-6 rounded-2xl border border-zinc-150 shadow-xs space-y-4">
                    <h3 className="font-bold text-zinc-900 text-sm font-display flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                      ATS Match Scanner Heuristics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-650 leading-relaxed">
                      <div className="space-y-1.5">
                        <span className="font-bold text-zinc-800">1. Raw Content Extraction</span>
                        <p className="text-zinc-500">Gemini 3.5 extracts structured strings, verifying applicant name, title, contact metadata, and professional timeline.</p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="font-bold text-zinc-800">2. Profile Keyword Evaluation</span>
                        <p className="text-zinc-500">Computes deep cross-referencing between target framework requirements and candidate descriptions to highlight omissions.</p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="font-bold text-zinc-800">3. Human Recruiter Suggestions</span>
                        <p className="text-zinc-500">Generates friendly, constructive line-by-line feedback cards helping the applicant rewrite bullet points with tangible metrics.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: TARGET BENCHMARKS DIRECTORY */}
          {activeTab === "presets" && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">
                  Platform Target Benchmarks
                </h2>
                <p className="text-zinc-600 text-xs sm:text-sm">
                  Review parameters utilized by the AI scoring agent to rank candidates against specific industry standards.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {ROLE_PRESETS.map((preset) => (
                  <div key={preset.id} className="bg-white rounded-2xl border border-zinc-150 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-zinc-900 text-base flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-indigo-600" />
                          {preset.name} Profile Benchmark
                        </h4>
                        <p className="text-zinc-500 text-xs mt-0.5">{preset.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab("scanner");
                          setSelectedScan(null);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-xl border border-indigo-150 transition-colors tracking-tight"
                      >
                        Target this Job
                      </button>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider block">
                        Included Evaluation Rules
                      </span>
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                          {preset.suggestedJobDescription}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AUDITED DATABASE HISTORY */}
          {activeTab === "history" && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 font-display">
                    Audit Database Registry
                  </h2>
                  <p className="text-zinc-600 text-xs sm:text-sm">
                    Access, sort, and search previously analyzed PDF scanning reports stored in the Workspace Cache.
                  </p>
                </div>
                {scans.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100/60 border border-red-200 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Reset Showcase Database
                  </button>
                )}
              </div>

              {/* INTEGRATE CENTRAL FILTER SYSTEM COUPLING */}
              {renderFilterToolbar()}

              <div className="space-y-4">
                <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between px-1">
                  <span>SHOWING {filteredScans.length} OF {scans.length} ARCHIVED PROFILES</span>
                  {filteredScans.length !== scans.length && (
                    <span className="text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-bold uppercase text-[9px]">Filters Engaged</span>
                  )}
                </div>

                {filteredScans.map((scan) => (
                  <div 
                    key={scan.id} 
                    onClick={() => { setSelectedScan(scan); setActiveTab("scanner"); }}
                    className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-400 cursor-pointer transition-all hover:shadow-sm"
                  >
                    <div className="space-y-1 truncate max-w-md sm:max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-950 block truncate">{scan.candidateName}</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono px-2 py-0.5 rounded">
                          {scan.targetRole}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono truncate">{scan.candidateTitle} • Document: {scan.filename}</p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Parsed on: {new Date(scan.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-wider block">Compatibility</span>
                        <span className={`text-base font-bold font-mono ${
                          scan.matchScore >= 80 ? "text-emerald-650 font-bold" : scan.matchScore >= 60 ? "text-amber-600 font-bold" : "text-rose-600"
                        }`}>
                          {scan.matchScore}% Matching
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setSelectedScan(scan); setActiveTab("scanner"); }}
                          className="bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold py-2 px-3.5 rounded-xl border border-zinc-250 transition-all"
                        >
                          Details
                        </button>
                        <button
                          onClick={(e) => handleDeleteScan(scan.id, e)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-zinc-100 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredScans.length === 0 && scans.length > 0 && (
                  <div className="bg-white border border-dashed border-zinc-250 py-16 text-center text-zinc-400 text-xs font-mono p-8 rounded-3xl">
                    <AlertCircle className="w-6 h-6 text-zinc-450 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-800">Clear your active search or filters to preview candidates.</p>
                    <button 
                      onClick={() => {
                        setSearchTerm("");
                        setFilterRole("all");
                        setFilterScoreTier("all");
                        setSortBy("date-desc");
                      }}
                      className="mt-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-semibold border border-indigo-150 transition-all"
                    >
                      Clear active filters
                    </button>
                  </div>
                )}

                {scans.length === 0 && (
                  <div className="bg-white border border-dashed border-zinc-250 py-16 text-center text-zinc-400 text-xs font-mono p-8 rounded-3xl">
                    No scanning audits stored. Upload and evaluate a resume to load data.
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Corporate Premium Security Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 text-center py-4 text-[11px] text-zinc-500 font-mono z-10 shrink-0">
        <span>© 2026 ResumeMetrics® SaaS Suite • Encrypted JWT Transport • ISO 27001 Compliant</span>
      </footer>
    </div>
  );
}
