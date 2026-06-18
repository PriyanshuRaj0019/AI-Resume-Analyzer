import React, { useState, useRef } from "react";
import { Upload, FileText, ChevronRight, Briefcase, FileCode, CheckCircle, AlertCircle } from "lucide-react";
import { ROLE_PRESETS } from "../data/rolePresets";
import { RolePreset } from "../types";

interface ResumeUploaderProps {
  onAnalyze: (payload: {
    resumeBase64: string;
    mimeType: string;
    filename: string;
    jobDescription: string;
    targetRole: string;
  }) => void;
  isAnalyzing: boolean;
  errorMsg: string | null;
}

export default function ResumeUploader({ onAnalyze, isAnalyzing, errorMsg }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("fullstack");
  const [useCustomJD, setUseCustomJD] = useState<boolean>(false);
  const [customJD, setCustomJD] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePreset = ROLE_PRESETS.find((r) => r.id === selectedRole) || ROLE_PRESETS[0];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    if (uploadedFile.type !== "application/pdf") {
      alert("Please upload a PDF file. Other formats are not currently supported.");
      return;
    }
    // Limit file size to 10MB to avoid oversized base64
    if (uploadedFile.size > 10 * 1024 * 1024) {
      alert("The PDF is too large. Please upload a file smaller than 10MB.");
      return;
    }
    setFile(uploadedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleFileBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSelectPreset = (id: string) => {
    setSelectedRole(id);
    setUseCustomJD(false);
  };

  const handleSubmit = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const base64Data = (reader.result as string).split(",")[1];
        if (!base64Data) {
          throw new Error("Failed to read base64 file data");
        }

        const jobDescription = useCustomJD ? customJD : activePreset.suggestedJobDescription;

        onAnalyze({
          resumeBase64: base64Data,
          mimeType: "application/pdf",
          filename: file.name,
          jobDescription,
          targetRole: useCustomJD ? "Custom Role" : activePreset.name,
        });
      } catch (e: any) {
        alert("Error prepping file: " + e.message);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Visual Welcome Board */}
      <div className="text-center space-y-3.5">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
          Get Instant, Deep Insights on Your Resume
        </h2>
        <p className="text-zinc-600 max-w-xl mx-auto text-sm sm:text-base">
          Our specialized AI model meticulously analyzes your resume, highlighting hidden skills, detecting critical missing keywords, and generating line-by-line recommendation cards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Step 1: Upload Resume (Left) */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-150 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center border border-indigo-100">1</span>
              <h3 className="font-semibold text-zinc-900 text-base">Upload PDF Resume</h3>
            </div>

            {/* Draggable upload canvas */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={file ? undefined : handleFileBrowseClick}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50/50"
                  : file
                  ? "border-zinc-200 bg-zinc-50"
                  : "border-zinc-200 hover:border-indigo-400 hover:bg-zinc-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              {file ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-800 text-sm max-w-xs truncate mx-auto">
                      {file.name}
                    </h4>
                    <p className="text-xs text-zinc-500 font-mono mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors"
                  >
                    Remove File
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-800 text-sm">
                      Drag & Drop your resume here
                    </p>
                    <p className="text-zinc-500 text-xs">
                      or <span className="text-indigo-600 font-semibold underline">click to browse</span> from your files
                    </p>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono">PDF formats up to 10MB</p>
                </>
              )}
            </div>
          </div>

          {/* Guidelines info card */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 border-l-4 border-l-amber-500 text-xs text-zinc-600 space-y-1.5">
            <h4 className="font-semibold text-zinc-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Pro Tips for Best Analysis:
            </h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Ensure the PDF is not password protected.</li>
              <li>Text-based (readable) PDFs provide faster and more accurate skill scanning compared to scanned image-only PDFs.</li>
            </ul>
          </div>
        </div>

        {/* Step 2: Target Criteria (Right) */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-150 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center border border-indigo-100">2</span>
              <h3 className="font-semibold text-zinc-900 text-base">Select Target Benchmark</h3>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-500 font-mono block uppercase tracking-wider">
                Select Goal Role Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-2.5 ${
                      selectedRole === preset.id && !useCustomJD
                        ? "border-indigo-600 bg-indigo-50/20 text-zinc-900 ring-2 ring-indigo-50"
                        : "border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50/50"
                    }`}
                  >
                    <Briefcase className={`w-4 h-4 mt-0.5 shrink-0 ${selectedRole === preset.id && !useCustomJD ? "text-indigo-600" : "text-zinc-400"}`} />
                    <div>
                      <span className="font-semibold block">{preset.name}</span>
                      <span className="text-[10px] text-zinc-500 line-clamp-1">{preset.description}</span>
                    </div>
                  </button>
                ))}

                {/* Custom JD Choice */}
                <button
                  type="button"
                  onClick={() => setUseCustomJD(true)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-2.5 sm:col-span-2 ${
                    useCustomJD
                      ? "border-indigo-600 bg-indigo-50/20 text-zinc-900 ring-2 ring-indigo-50"
                      : "border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50/50"
                  }`}
                >
                  <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${useCustomJD ? "text-indigo-600" : "text-zinc-400"}`} />
                  <div>
                    <span className="font-semibold block">Custom Role / Target Job Description</span>
                    <span className="text-[10px] text-zinc-500 line-clamp-1">
                      Paste a specific job posting or custom responsibilities for an ultra-targeted alignment.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom JD Input block */}
            {useCustomJD ? (
              <div className="mt-4 space-y-2 animate-fade-in">
                <label className="text-xs font-medium text-zinc-600 block">
                  Paste Custom Job Description Requirements
                </label>
                <textarea
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 focus:outline-inner focus:outline-indigo-500 focus:border-indigo-500 bg-zinc-50 font-sans leading-relaxed text-zinc-800 placeholder:text-zinc-400 resize-none"
                  placeholder="e.g. We are looking for a Senior Developer with 5+ years of experience in React, Kubernetes, and Golang..."
                  value={customJD}
                  onChange={(e) => setCustomJD(e.target.value)}
                />
              </div>
            ) : (
              <div className="mt-4 bg-zinc-50 border border-zinc-150 p-3.5 rounded-xl text-xs space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-1.5 text-zinc-700 font-semibold uppercase font-mono text-[10px] tracking-wider text-indigo-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Benchmark Profile Target Active:
                </div>
                <p className="text-zinc-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                  {activePreset.suggestedJobDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* error state banner */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-750 p-4 rounded-xl text-xs flex gap-3 items-start animate-fade-in">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Analysis Failed</p>
            <p className="font-mono text-[11px] leading-relaxed opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Call to action */}
      <div className="text-center pt-2">
        <button
          onClick={handleSubmit}
          disabled={!file || isAnalyzing}
          className={`w-full sm:w-auto min-w-[220px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-55 disabled:cursor-not-allowed`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing Resume...
            </>
          ) : (
            <>
              Analyze My Resume Now
              <ChevronRight className="w-4.5 h-4.5" />
            </>
          )}
        </button>
        {!file && (
          <p className="text-zinc-400 text-xs mt-2.5 font-mono">
            * Please upload a PDF resume file above to start.
          </p>
        )}
      </div>
    </div>
  );
}
