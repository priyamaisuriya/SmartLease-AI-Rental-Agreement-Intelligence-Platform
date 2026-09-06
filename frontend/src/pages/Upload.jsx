import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agreementsData } from '../data/mockData';
import { Upload as UploadIcon, Check, File as FileIcon, ArrowUp } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('idle'); // idle, processing, done
  const [filename, setFilename] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentProcStep, setCurrentProcStep] = useState(0);

  const startUploadFlow = (file) => {
    if (!file) return;
    setFilename(file.name || 'Sample-Lease-Agreement.pdf');
    setStep('processing');
    setProgress(0);
    setCurrentProcStep(0);

    let pct = 0;
    const uploadTimer = setInterval(() => {
      pct += 10;
      setProgress(Math.min(pct, 100));
      if (pct >= 100) {
        clearInterval(uploadTimer);
        runProcessingSteps();
      }
    }, 120);
  };

  const runProcessingSteps = () => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < 5) {
        setCurrentProcStep(i);
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setStep('done');
          // Add to mock data for demonstration
          agreementsData.unshift({ 
            id:'a'+Date.now(), 
            name: filename, 
            property:'Independent upload (no linked property)', 
            linked:false, 
            uploadDate:'Today', 
            status:'Active', 
            analysisStatus:'Completed', 
            riskLevel:'Medium' 
          });
        }, 400);
      }
    }, 550);
  };

  const steps = [
    'Uploading',
    'Extracting text',
    'Analyzing agreement',
    'Identifying risks',
    'Generating insights'
  ];

  return (
    <div className="fade-in max-w-[1000px] mx-auto w-full">
      <div className="mb-[40px]">
        <p className="text-[12px] uppercase tracking-[0.12em] text-text-muted font-semibold mb-1">Workspace</p>
        <h1 className="font-serif text-[32px] text-ink m-0 font-medium">Upload Agreement</h1>
      </div>

      <div className="flex items-center gap-4 mb-[40px] w-full max-w-[800px]">
        {/* Step 1 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold text-ink-dark font-bold text-[14px] flex items-center justify-center shadow-[0_2px_8px_rgba(201,162,75,0.25)]">1</div>
          <span className="font-mono text-[13px] font-bold text-ink">Upload file</span>
        </div>
        <div className="flex-1 h-[1px] bg-border mx-2"></div>
        {/* Step 2 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-border text-text-muted font-bold text-[14px] flex items-center justify-center">2</div>
          <span className="font-mono text-[13px] text-text-muted">Agreement details</span>
        </div>
        <div className="flex-1 h-[1px] bg-border mx-2"></div>
        {/* Step 3 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-border text-text-muted font-bold text-[14px] flex items-center justify-center">3</div>
          <span className="font-mono text-[13px] text-text-muted">AI review</span>
        </div>
      </div>

      <div className="w-full">
        {step === 'idle' && (
          <div>
            <label 
              htmlFor="file-input" 
              className="relative flex cursor-pointer flex-col items-center bg-white rounded-lg border-2 border-dashed border-gold p-[60px] text-center overflow-hidden hover:border-gold-deep transition-colors group"
            >
              {/* Striped Background */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity group-hover:opacity-[0.06]" 
                style={{ 
                  backgroundImage: 'repeating-linear-gradient(45deg, #C9A24B 0, #C9A24B 10px, transparent 10px, transparent 24px)', 
                  opacity: '0.04' 
                }}
              ></div>

              {/* Corner Ribbon */}
              <div className="absolute -top-10 -right-10 w-[140px] h-[140px] overflow-hidden pointer-events-none">
                <div className="absolute top-[32px] right-[-24px] bg-[#4C7A5E] text-white font-mono text-[10.5px] font-bold py-1.5 px-12 transform rotate-45 shadow-sm uppercase tracking-wider">
                  AI-Ready
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="w-[72px] h-[72px] rounded-full bg-gold/20 flex items-center justify-center mb-[24px]">
                  <div className="w-[52px] h-[52px] rounded-full bg-gold flex items-center justify-center shadow-[0_4px_12px_rgba(201,162,75,0.3)]">
                    <ArrowUp className="w-[22px] h-[22px] text-ink-dark" strokeWidth={2} />
                  </div>
                </div>
                
                <h3 className="font-serif text-[26px] font-medium text-ink mb-[12px]">Drop your agreement here</h3>
                <p className="text-[14.5px] text-text-muted mb-[28px]">Scanned copies are read automatically with OCR — no need to retype anything.</p>

                <div className="flex flex-wrap justify-center items-center gap-3 mb-[32px]">
                  <span className="font-mono text-[11px] font-medium tracking-[0.05em] bg-paper border border-border px-3.5 py-1.5 rounded-full text-text-muted">.PDF</span>
                  <span className="font-mono text-[11px] font-medium tracking-[0.05em] bg-paper border border-border px-3.5 py-1.5 rounded-full text-text-muted">.DOCX</span>
                  <span className="font-mono text-[11px] font-medium tracking-[0.05em] bg-paper border border-border px-3.5 py-1.5 rounded-full text-text-muted">.JPG / .PNG scan</span>
                  <span className="font-mono text-[11px] font-medium tracking-[0.05em] bg-paper border border-border px-3.5 py-1.5 rounded-full text-text-muted">Max 10MB</span>
                </div>

                <div className="bg-ink text-paper group-hover:bg-ink-dark transition-colors px-[22px] py-[10px] rounded-[6px] font-semibold text-[14px]">
                  Choose a file
                </div>
              </div>

              <input 
                id="file-input" 
                type="file" 
                className="hidden" 
                onChange={(e) => startUploadFlow(e.target.files[0])} 
                accept=".pdf,.docx,.jpg,.jpeg,.png" 
              />
            </label>
            
            <button 
              onClick={() => startUploadFlow({ name: 'Sample-Lease-Agreement.pdf' })} 
              className="mt-6 w-full text-center text-[13px] font-semibold text-gold-deep hover:text-gold transition-colors"
            >
              Or try it with a sample agreement →
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="rounded-lg border border-border bg-white p-8 max-w-[800px]">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[6px] bg-gold/10 text-gold-deep font-mono text-[11px] font-bold border border-gold/20">
                FILE
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{filename}</p>
                <div className="mt-[10px] h-[6px] w-full rounded-full bg-paper border border-border overflow-hidden">
                  <div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <span className="shrink-0 text-[13px] font-mono font-bold text-text-muted">{progress}%</span>
            </div>

            <div className="mt-[32px] space-y-[14px]">
              {steps.map((label, idx) => {
                const isActive = idx <= currentProcStep;
                const isCurrent = idx === currentProcStep && progress === 100;
                return (
                  <div key={idx} className="flex items-center gap-[14px]">
                    <span className={`grid h-[22px] w-[22px] place-items-center rounded-full text-[11px] font-bold ${isActive ? 'bg-gold text-ink-dark shadow-sm' : 'border border-border text-text-faint bg-paper'}`}>
                      {isActive ? <Check size={12} strokeWidth={3} /> : (idx + 1)}
                    </span>
                    <span className={`text-[14px] ${isActive ? 'font-semibold text-ink' : 'text-text-faint'} ${isCurrent ? 'animate-pulse' : ''}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="rounded-lg border border-border bg-white p-12 text-center max-w-[800px]">
            <span className="mx-auto grid h-[64px] w-[64px] place-items-center rounded-full bg-[#4C7A5E]/10 text-[#4C7A5E] mb-[20px]">
              <Check size={28} strokeWidth={2.5} />
            </span>
            <p className="font-serif text-[24px] font-medium text-ink mb-[8px]">Agreement analyzed successfully</p>
            <p className="text-[14.5px] text-text-muted mb-[32px] max-w-md mx-auto leading-relaxed">
              We've extracted the key terms, dates, and flagged potential risks using our AI engine.
            </p>
            <button 
              onClick={() => navigate('/analysis')} 
              className="rounded-[6px] bg-ink px-[24px] py-[12px] text-[14px] font-semibold text-paper shadow-sm hover:bg-ink-dark transition-colors"
            >
              View AI Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
