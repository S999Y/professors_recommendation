import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  Sparkles,
  Mail
} from 'lucide-react';
import { Professor } from '../types';

interface ColdEmailModalProps {
  professor: Professor | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ColdEmailModal: React.FC<ColdEmailModalProps> = ({
  professor,
  isOpen,
  onClose
}) => {
  const [applicantName, setApplicantName] = useState('Alex Taylor');
  const [currentSchool, setCurrentSchool] = useState('University of California');
  const [degreeGoal, setDegreeGoal] = useState<'PhD' | 'MS' | 'Postdoc' | 'RA'>('PhD');
  const [term, setTerm] = useState('Fall 2026');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !professor) return null;

  const topTopics = professor.research_topics.slice(0, 2).join(' and ') || professor.research_area;
  const topConfs = professor.matched_conferences.slice(0, 2).join(' / ') || 'top-tier conferences';

  const subject = `Prospective ${degreeGoal} Applicant (${term}) - Inquiry regarding research in ${topTopics.split(',')[0] || professor.research_area}`;

  const emailBody = `Dear Professor ${professor.name.replace(/^Dr\.\s*/, '')},

I hope this email finds you well.

My name is ${applicantName || '[Your Name]'}, and I am a prospective ${degreeGoal === 'PhD' ? 'Ph.D.' : degreeGoal === 'MS' ? 'Master\'s thesis' : 'postdoctoral'} candidate planning to apply for ${term} at ${professor.university}. I recently read your lab's high-impact work published in ${topConfs}, specifically your focus on ${topTopics}.

Your research on ${professor.research_area} closely aligns with my academic interests and recent projects at ${currentSchool || '[Your Current Institution]'}. I am writing to inquire if you anticipate openings for new ${degreeGoal === 'PhD' ? 'doctoral students' : 'researchers'} in your laboratory for the upcoming cycle.

I have attached my CV and transcript for your review. If your schedule permits, I would be grateful for the opportunity to briefly speak with you or a member of your research group about your current ongoing initiatives.

Thank you very much for your time and consideration.

Sincerely,
${applicantName || '[Your Name]'}
${currentSchool ? `${currentSchool}` : ''}
LinkedIn / Personal Website: [Link]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenMailto = () => {
    const mailtoUrl = `mailto:${professor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#0D1117] text-slate-900 dark:text-[#E6EDF3] rounded-xl shadow-2xl border border-slate-200 dark:border-[#30363D] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-[#010409] border-b border-slate-200 dark:border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#E6EDF3]">
                Academic Cold Email Drafter
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#7D8590]">
                Tailored for {professor.name} ({professor.university})
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

        {/* Customization Controls */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-wider mb-1">
                Target Role
              </label>
              <select
                value={degreeGoal}
                onChange={e => setDegreeGoal(e.target.value as any)}
                className="w-full py-2 px-3 rounded-md border border-slate-300 dark:border-[#30363D] bg-slate-50 dark:bg-[#010409] text-slate-900 dark:text-[#E6EDF3] text-xs focus:border-indigo-500 outline-none"
              >
                <option value="PhD">Ph.D. Applicant</option>
                <option value="MS">Master's Thesis Applicant</option>
                <option value="Postdoc">Postdoctoral Fellow</option>
                <option value="RA">Research Assistant / Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-wider mb-1">
                Target Term
              </label>
              <select
                value={term}
                onChange={e => setTerm(e.target.value)}
                className="w-full py-2 px-3 rounded-md border border-slate-300 dark:border-[#30363D] bg-slate-50 dark:bg-[#010409] text-slate-900 dark:text-[#E6EDF3] text-xs focus:border-indigo-500 outline-none"
              >
                <option value="Fall 2026">Fall 2026</option>
                <option value="Spring 2027">Spring 2027</option>
                <option value="Fall 2027">Fall 2027</option>
                <option value="Summer 2026">Summer 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={e => setApplicantName(e.target.value)}
                placeholder="e.g. Alex Taylor"
                className="w-full py-2 px-3 rounded-md border border-slate-300 dark:border-[#30363D] bg-slate-50 dark:bg-[#010409] text-slate-900 dark:text-[#E6EDF3] text-xs focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-[#7D8590] uppercase tracking-wider mb-1">
                Your Current Institution
              </label>
              <input
                type="text"
                value={currentSchool}
                onChange={e => setCurrentSchool(e.target.value)}
                placeholder="e.g. UC Berkeley, IIT, Tsinghua, etc."
                className="w-full py-2 px-3 rounded-md border border-slate-300 dark:border-[#30363D] bg-slate-50 dark:bg-[#010409] text-slate-900 dark:text-[#E6EDF3] text-xs focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Generated Subject Line */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#7D8590]">
              Subject Line
            </label>
            <div className="p-2.5 rounded-md bg-slate-50 dark:bg-[#010409] text-xs font-mono text-slate-900 dark:text-[#E6EDF3] border border-slate-200 dark:border-[#30363D]">
              {subject}
            </div>
          </div>

          {/* Generated Email Body */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-[#7D8590]">
              Email Content Draft
            </label>
            <textarea
              readOnly
              rows={10}
              value={emailBody}
              className="w-full p-3 rounded-md bg-slate-50 dark:bg-[#010409] text-xs font-mono text-slate-900 dark:text-[#E6EDF3] border border-slate-200 dark:border-[#30363D] leading-relaxed resize-none focus:outline-none"
            />
          </div>

          {/* Action Buttons & Visible Recipient Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-500/30">
            <div className="flex items-center gap-1.5 text-xs text-indigo-950 dark:text-indigo-200 font-mono">
              <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>To:</span>
              <strong className="text-indigo-700 dark:text-indigo-300 font-bold">{professor.email || 'Email unavailable'}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-[#1C2128] hover:bg-slate-100 dark:hover:bg-[#252c36] text-slate-900 dark:text-[#E6EDF3] border border-slate-200 dark:border-[#30363D] transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Draft'}</span>
              </button>

              <button
                onClick={handleOpenMailto}
                disabled={!professor.email}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in Mail App</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
