import { useState } from "react";
import { 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe, 
  Award, 
  ShieldCheck, 
  Search, 
  TrendingUp,
  FileText,
  User,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { ResumeAnalysisResult } from "../types";

interface ResumeResultsProps {
  result: ResumeAnalysisResult;
  filename: string;
  onReset: () => void;
}

export default function ResumeResults({ result, filename, onReset }: ResumeResultsProps) {
  const [activeTab, setActiveTab] = useState<"strengths" | "missing" | "recommendations" | "experience">("strengths");

  const scoreColorClass = (score: number) => {
    if (score >= 80) return { text: "text-emerald-700 bg-emerald-50 border-emerald-200", ring: "stroke-emerald-500", label: "Strong Fit" };
    if (score >= 60) return { text: "text-amber-700 bg-amber-50 border-amber-200", ring: "stroke-amber-500", label: "Moderate Alignment" };
    return { text: "text-rose-700 bg-rose-50 border-rose-200", ring: "stroke-rose-500", label: "Requires Work" };
  };

  const badgeColorClass = (importance: string) => {
    const clean = importance.toLowerCase();
    if (clean.includes("critical")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (clean.includes("preferred")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-zinc-50 text-zinc-600 border-zinc-200";
  };

  const status = scoreColorClass(result.matchScore);

  // SVG parameters for circular score meter
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.matchScore / 100) * circumference;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            <FileText className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs font-mono font-medium text-zinc-400">Analysis complete for:</span>
            <h2 className="text-lg font-bold text-zinc-900 truncate max-w-sm sm:max-w-md">{filename}</h2>
          </div>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-250 hover:bg-zinc-50 px-4 py-2 rounded-xl transition-all shadow-xs"
        >
          Analyze Another Resume
        </button>
      </div>

      {/* Main Stats Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Metric and summary Profile (Left Column) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          {/* Main Card with Candidate Profile & Score */}
          <div className="bg-white rounded-2xl border border-zinc-150 p-6 flex-1 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50/70 to-transparent -mr-4 -mt-4 rounded-bl-full"></div>
            
            <div className="space-y-5">
              {/* Header profile info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-zinc-400">
                  <User className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] uppercase tracking-wider font-bold font-mono">Candidate Profile</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">{result.candidateName}</h3>
                <p className="text-sm font-medium text-indigo-600">{result.candidateTitle}</p>
              </div>

              {/* Match Score Display */}
              <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      className="stroke-zinc-200 fill-none"
                      strokeWidth="6.5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      className={`fill-none transition-all duration-1000 ease-out ${status.ring}`}
                      strokeWidth="6.5"
                      strokeDasharray={2 * Math.PI * 26}
                      strokeDashoffset={2 * Math.PI * 26 - (result.matchScore / 100) * 2 * Math.PI * 26}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold font-mono text-zinc-800">{result.matchScore}%</span>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase font-bold tracking-wider font-mono text-zinc-400">Compliance Score</h4>
                  <p className="text-sm font-bold text-zinc-800 mt-0.5">{status.label}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Calculated against benchmark rules.</p>
                </div>
              </div>

              {/* Biography elevator summary */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] uppercase tracking-wider font-bold font-mono text-zinc-400">Summary Context</h4>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">{result.summary}</p>
              </div>

              {/* Verified Contact Details list */}
              <div className="space-y-2 border-t border-zinc-150 pt-4">
                <h4 className="text-[10px] uppercase tracking-wider font-bold font-mono text-zinc-400 mb-2.5">Extracted Contacts</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  {result.contactInfo.email && (
                    <div className="flex items-center gap-2 text-xs text-zinc-600 truncate">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{result.contactInfo.email}</span>
                    </div>
                  )}
                  {result.contactInfo.phone && (
                    <div className="flex items-center gap-2 text-xs text-zinc-600 truncate">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{result.contactInfo.phone}</span>
                    </div>
                  )}
                  {result.contactInfo.location && (
                    <div className="flex items-center gap-2 text-xs text-zinc-600 truncate">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{result.contactInfo.location}</span>
                    </div>
                  )}
                  
                  {/* Digital portfolios if any */}
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-zinc-100">
                    {result.contactInfo.linkedin && (
                      <a href={result.contactInfo.linkedin.startsWith("http") ? result.contactInfo.linkedin : `https://${result.contactInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 px-2 py-1 rounded border border-indigo-100 transition-colors">
                        <Linkedin className="w-3 h-3" />
                        <span>Linkedin</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {result.contactInfo.github && (
                      <a href={result.contactInfo.github.startsWith("http") ? result.contactInfo.github : `https://${result.contactInfo.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100/60 px-2 py-1 rounded border border-zinc-200 transition-colors">
                        <Github className="w-3 h-3" />
                        <span>Github</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {result.contactInfo.website && (
                      <a href={result.contactInfo.website.startsWith("http") ? result.contactInfo.website : `https://${result.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100/60 px-2 py-1 rounded border border-zinc-200 transition-colors">
                        <Globe className="w-3 h-3" />
                        <span>Website</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Insights Panels (Right Column) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
          <div className="bg-white rounded-2xl border border-zinc-150 overflow-hidden shadow-sm flex flex-col flex-grow">
            
            {/* Elegant Tab Headers */}
            <div className="flex bg-zinc-50 border-b border-zinc-150 p-2 gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("strengths")}
                className={`py-2 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "strengths"
                    ? "bg-white text-indigo-700 shadow-sm border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Award className="w-4 h-4 text-indigo-500" />
                <span>Extracted Strengths ({result.strengths.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("missing")}
                className={`py-2 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "missing"
                    ? "bg-white text-indigo-700 shadow-sm border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Missing Skills ({result.missingSkills.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("recommendations")}
                className={`py-2 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "recommendations"
                    ? "bg-white text-indigo-700 shadow-sm border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Sparkles className="w-4 h-4 text-teal-500" />
                <span>Fix Guidelines ({result.gapsAndRecommendations.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("experience")}
                className={`py-2 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "experience"
                    ? "bg-white text-indigo-700 shadow-sm border border-zinc-200"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>Extracted Experience</span>
              </button>
            </div>

            {/* Panel Contents */}
            <div className="p-6 flex-grow max-h-[600px] overflow-y-auto">
              
              {/* Strengths Tab */}
              {activeTab === "strengths" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold border-b border-zinc-100 pb-2 mb-3">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                    <span>The system identified the following professional strengths:</span>
                  </div>

                  {result.strengths.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-xs font-mono">
                      No explicit strength areas extracted. Try adding detailed metrics to your experience.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.strengths.map((item, idx) => (
                        <div key={idx} className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl space-y-2 hover:border-indigo-200 transition-colors">
                          <h4 className="font-semibold text-zinc-900 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {item.area}
                          </h4>
                          <p className="text-zinc-650 text-xs leading-relaxed">{item.explanation}</p>
                          {item.example && (
                            <div className="text-[10px] font-mono text-indigo-700 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 mt-1">
                              <span className="font-semibold">Evidence:</span> "{item.example}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Missing Skills Tab */}
              {activeTab === "missing" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold border-b border-zinc-100 pb-2 mb-3">
                    <Search className="w-4.5 h-4.5 text-amber-500" />
                    <span>Missing Skills recommended to match target job alignment:</span>
                  </div>

                  {result.missingSkills.length === 0 ? (
                    <div className="py-12 text-center text-emerald-600 font-semibold text-xs border border-dashed border-emerald-200 bg-emerald-50/20 p-6 rounded-2xl">
                      🎉 Outstanding! No critical skill gaps detected. Your profile matches the target benchmark perfectly.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.missingSkills.map((item, idx) => (
                        <div key={idx} className="border border-zinc-150 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white hover:border-amber-200 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-zinc-800 text-sm">{item.skill}</span>
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${badgeColorClass(item.importance)}`}>
                                {item.importance}
                              </span>
                            </div>
                            <p className="text-zinc-500 text-xs">{item.context}</p>
                          </div>
                          
                          <div className="shrink-0 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 font-mono">
                            Add to profile
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fix Recommendations Tab */}
              {activeTab === "recommendations" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold border-b border-zinc-100 pb-2 mb-3">
                    <Sparkles className="w-4.5 h-4.5 text-teal-500" />
                    <span>Constructive actionable tips to beat ATS matching algorithms:</span>
                  </div>

                  {result.gapsAndRecommendations.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-xs font-mono">
                      No critical formatting recommendations needed.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {result.gapsAndRecommendations.map((item, idx) => (
                        <div key={idx} className="border border-zinc-150 rounded-xl overflow-hidden bg-white">
                          <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-150 flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-700 font-mono uppercase tracking-wider">{item.section}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-200/60 text-zinc-600 font-mono">Recommendation #{idx + 1}</span>
                          </div>
                          <div className="p-4 space-y-2.5 text-xs">
                            <div className="text-zinc-650 bg-amber-50/40 p-2.5 border-l-4 border-l-amber-400 rounded-r-lg">
                              <span className="font-semibold text-zinc-800">Observation: </span> {item.observation}
                            </div>
                            <div className="text-zinc-800 bg-indigo-50/30 p-2.5 border-l-4 border-l-indigo-500 rounded-r-lg font-sans">
                              <span className="font-semibold text-indigo-900 block mb-0.5">Actionable Feedback:</span>
                              {item.actionableFeedback}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Experience Timeline Tab */}
              {activeTab === "experience" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold border-b border-zinc-100 pb-2 mb-3">
                    <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
                    <span>Extracted Timeline details found in the system scan:</span>
                  </div>

                  {result.experience.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-xs font-mono">
                      No explicit professional experience timelines extracted.
                    </div>
                  ) : (
                    <div className="relative border-l border-zinc-150 pl-5 ml-2.5 space-y-6">
                      {result.experience.map((item, idx) => (
                        <div key={idx} className="relative group/timeline-item">
                          {/* Radial indicator bullet */}
                          <span className="absolute -left-[25.5px] top-1.5 w-3 h-3 rounded-full bg-white border border-indigo-500 group-hover/timeline-item:bg-indigo-600 group-hover/timeline-item:scale-110 transition-all shadow-xs ring-4 ring-white" />
                          
                          <div className="space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h4 className="font-bold text-zinc-800 text-sm group-hover/timeline-item:text-indigo-600 transition-colors">{item.role}</h4>
                              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">{item.duration || "N/A"}</span>
                            </div>
                            <p className="text-xs font-medium text-zinc-600">{item.company}</p>

                            {item.highlights && item.highlights.length > 0 && (
                              <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-500 pt-1.5">
                                {item.highlights.map((hl, hlIdx) => (
                                  <li key={hlIdx} className="leading-relaxed font-sans">{hl}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Extracted Core Skills visual breakdown cards */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-150 shadow-sm space-y-5">
        <h3 className="font-bold text-zinc-900 text-base flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-indigo-600" />
          Extracted Core Skills Portfolio
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tech skills */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Technical & Professional Skills ({result.skills.technical.length})
            </h4>
            
            <div className="flex flex-wrap gap-1.5 align-middle">
              {result.skills.technical.map((sk, idx) => (
                <span 
                  key={idx}
                  className="text-xs font-medium text-indigo-700 bg-indigo-50/55 hover:bg-indigo-50 hover:text-indigo-800 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors"
                >
                  {sk}
                </span>
              ))}
              {result.skills.technical.length === 0 && (
                <span className="text-xs text-zinc-400 italic">No technical skills detected.</span>
              )}
            </div>
          </div>

          {/* Soft / Process skills */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              Soft & Operational Traits ({result.skills.soft.length})
            </h4>
            
            <div className="flex flex-wrap gap-1.5 align-middle">
              {result.skills.soft.map((sk, idx) => (
                <span 
                  key={idx}
                  className="text-xs font-medium text-teal-700 bg-teal-50/55 hover:bg-teal-50 hover:text-teal-800 px-3 py-1.5 rounded-xl border border-teal-100 transition-colors"
                >
                  {sk}
                </span>
              ))}
              {result.skills.soft.length === 0 && (
                <span className="text-xs text-zinc-400 italic">No soft skills detected.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
