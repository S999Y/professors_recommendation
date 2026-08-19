import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  Code2
} from 'lucide-react';
import { parseRawInput } from '../utils/normalizeData';
import { RawProfessorRecord } from '../types';

interface DatasetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDataset: (records: RawProfessorRecord[]) => void;
  onResetDefault: () => void;
  currentCount: number;
}

export const DatasetUploadModal: React.FC<DatasetUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyDataset,
  onResetDefault,
  currentCount
}) => {
  const [pasteText, setPasteText] = useState('');
  const [previewRecords, setPreviewRecords] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleProcessText = (rawContent: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const trimmed = rawContent.trim();
    if (!trimmed) {
      setPreviewRecords([]);
      return;
    }

    try {
      const parsed = parseRawInput(trimmed);
      if (parsed.length === 0) {
        setErrorMsg('Could not detect any valid records. Please check JSON or CSV format.');
        setPreviewRecords([]);
      } else {
        setPreviewRecords(parsed);
        setSuccessMsg(`Successfully parsed ${parsed.length} professor records! Ready to load into directory.`);
      }
    } catch (err: any) {
      setErrorMsg('Error parsing data input: ' + (err?.message || 'Parse error'));
      setPreviewRecords([]);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setPasteText(content);
      handleProcessText(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (previewRecords.length > 0) {
      onApplyDataset(previewRecords);
      onClose();
    }
  };

  const downloadSampleJSON = () => {
    const sample = [
      {
        "University": "Stanford University",
        "R": "R1",
        "Ranking": 2,
        "Professor name": "Dr. Christopher Manning",
        "Email": "manning@cs.stanford.edu",
        "Mail": "manning@cs.stanford.edu",
        "Lab link": "https://nlp.stanford.edu/~manning/",
        "Research area": "Natural Language Processing",
        "h_index": 154,
        "total_citations": 215000,
        "i10_index": 380,
        "total_publications": 480,
        "citations_per_year": { "2021": 31000, "2022": 37000, "2023": 41000, "2024": 46000, "2025": 49000 },
        "university_api": "stanford.edu/cs",
        "position": "Full Professor",
        "research_topics": ["Large Language Models", "Syntactic Parsing", "Deep NLP"],
        "orcid": "0000-0001-7654-3210",
        "scholar_url": "https://scholar.google.com/citations?user=chrismanning",
        "dblp_pid": "m/ChristopherDManning",
        "openalex_id": "A5009876543",
        "semantic_id": "1745567",
        "sources": "Google Scholar, DBLP",
        "is_complete": true,
        "api_match_ok": true,
        "has_target_paper": true,
        "matched_conferences": ["ACL", "EMNLP", "NeurIPS"],
        "n_target_pubs": 38,
        "pickable_p": true
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_professors_template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#0D1117] text-slate-900 dark:text-[#E6EDF3] rounded-xl shadow-2xl border border-slate-200 dark:border-[#30363D] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 dark:bg-[#010409] border-b border-slate-200 dark:border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#E6EDF3]">
                Import Faculty Dataset (JSON / CSV)
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#7D8590]">
                Load custom academic crawler data or export schema templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-slate-100 dark:bg-[#1C2128] border border-slate-200 dark:border-[#30363D] text-slate-500 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          
          {/* Action Row: Template Download & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-slate-800 dark:text-[#E6EDF3] font-medium">
                Compatible with all CSV headers & JSON object structures
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadSampleJSON}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white dark:bg-[#1C2128] hover:bg-slate-100 dark:hover:bg-[#252c36] text-indigo-600 dark:text-indigo-400 font-medium border border-slate-200 dark:border-[#30363D] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample .JSON</span>
              </button>
              <button
                onClick={() => {
                  onResetDefault();
                  onClose();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white dark:bg-[#1C2128] hover:bg-slate-100 dark:hover:bg-[#252c36] text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3] border border-slate-200 dark:border-[#30363D] transition-colors"
                title="Restore default verified faculty dataset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border border-dashed rounded-xl p-6 text-center transition-colors ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
                : 'border-slate-300 dark:border-[#30363D] bg-slate-50 dark:bg-[#010409] hover:border-slate-400 dark:hover:border-[#8B949E]'
            }`}
          >
            <Upload className="w-7 h-7 text-slate-400 dark:text-[#7D8590] mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-900 dark:text-[#E6EDF3]">
              Drag and drop your <span className="text-indigo-600 dark:text-indigo-400 font-mono">.json</span> or <span className="text-indigo-600 dark:text-indigo-400 font-mono">.csv</span> file here
            </p>
            <p className="text-[11px] text-slate-500 dark:text-[#7D8590] mt-1">or browse from your local drive</p>
            <label className="inline-block mt-3 px-3.5 py-1.5 rounded-md bg-white dark:bg-[#1C2128] hover:bg-slate-100 dark:hover:bg-[#252c36] text-xs font-medium text-slate-900 dark:text-[#E6EDF3] border border-slate-300 dark:border-[#30363D] cursor-pointer transition-colors shadow-xs">
              Choose File
              <input
                type="file"
                accept=".json,.csv,text/csv,application/json"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {/* Paste Raw JSON/CSV Textarea */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#7D8590] flex items-center justify-between">
              <span>Or Paste JSON / CSV Content Directly</span>
              <span className="text-[10px] lowercase text-slate-400 dark:text-[#484F58]">auto-validated</span>
            </label>
            <textarea
              rows={5}
              value={pasteText}
              onChange={e => {
                setPasteText(e.target.value);
                handleProcessText(e.target.value);
              }}
              placeholder='[ { "University": "MIT", "R": "R1", "Ranking": 1, "Professor name": "Dr. Regina Barzilay", "h_index": 98, "total_citations": 58400, "matched_conferences": ["NeurIPS", "ACL"] } ]'
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#010409] font-mono text-xs text-slate-900 dark:text-[#E6EDF3] border border-slate-300 dark:border-[#30363D] focus:border-indigo-500 focus:bg-white dark:focus:bg-[#010409] outline-none resize-none"
            />
          </div>

          {/* Status Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Schema Type Reference Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-[#30363D] text-[11px] text-slate-500 dark:text-[#7D8590] space-y-1 font-mono">
            <div className="font-bold text-slate-900 dark:text-[#E6EDF3] uppercase font-sans text-xs flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Supported Columns & Keys</span>
            </div>
            <p className="text-slate-600 dark:text-[#8B949E]">
              <code>University</code>, <code>R</code> (R1/R2), <code>Ranking</code>, <code>Professor name</code>, <code>Email</code>, <code>Lab link</code>, <code>Research area</code>, <code>h_index</code>, <code>total_citations</code>, <code>total_publications</code>, <code>citations_per_year</code>, <code>position</code>, <code>research_topics</code>, <code>matched_conferences</code>, <code>pickable_p</code>
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 dark:bg-[#010409] border-t border-slate-200 dark:border-[#30363D] flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-[#7D8590]">
            Current active dataset: <strong className="text-slate-900 dark:text-[#E6EDF3]">{currentCount} records</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-[#1C2128] border border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-[#7D8590] hover:text-slate-900 dark:hover:text-[#E6EDF3]"
            >
              Cancel
            </button>

            <button
              onClick={handleApply}
              disabled={previewRecords.length === 0}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white transition-colors disabled:opacity-40"
            >
              Load Dataset ({previewRecords.length} Records)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
