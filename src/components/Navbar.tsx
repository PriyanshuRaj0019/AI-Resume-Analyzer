import { FileSearch, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-zinc-150 bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
            <FileSearch className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-zinc-900 flex items-center gap-1.5">
              AI Resume Analyzer <span className="bg-indigo-50 text-indigo-700 text-[10px] uppercase font-bold py-0.5 px-2 rounded-full tracking-wider border border-indigo-100">Pro</span>
            </h1>
            <p className="text-xs text-zinc-500 font-mono">Powered by Gemini 3.5 Flash</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-mono bg-zinc-50 border border-zinc-200 py-1.5 px-3 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>ATS Compliance Optimization Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
}
