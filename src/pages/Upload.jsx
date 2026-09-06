import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agreementsData } from '../data/mockData';
import { Upload as UploadIcon, Check, File as FileIcon } from 'lucide-react';

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
    <div className="fade-in">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Understand your rental agreement with AI</h1>
        <p className="mt-2 text-sm text-ink-soft">Upload any lease — linked to a SmartLease rental or not — and get a full breakdown in minutes.</p>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        {step === 'idle' && (
          <div>
            <label htmlFor="file-input" className="flex cursor-pointer flex-col items-center rounded-xl2 border-2 border-dashed border-line bg-surface px-6 py-14 text-center transition hover:border-lease-300 hover:bg-lease-50/30">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-lease-50 text-lease-600">
                <UploadIcon size={26} />
              </span>
              <p className="mt-4 font-display text-base font-semibold text-ink">Upload your rental agreement</p>
              <p className="mt-1.5 text-sm text-ink-faint">Drag and drop, or click to browse</p>
              <p className="mt-4 text-xs text-ink-faint">Supported formats: PDF, DOCX, JPG, PNG</p>
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
              className="mt-4 w-full text-center text-xs font-medium text-lease-600 hover:text-lease-700"
            >
              Try it with a sample agreement →
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="rounded-xl2 border border-line bg-surface p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-lease-50 text-lease-600 font-display text-xs font-bold">
                FILE
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{filename}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-canvas">
                  <div className="h-1.5 rounded-full bg-lease-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-ink-faint">{progress}%</span>
            </div>

            <div className="mt-8 space-y-4">
              {steps.map((label, idx) => {
                const isActive = idx <= currentProcStep;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] ${isActive ? 'bg-lease-600 text-white border-0' : 'border border-line text-ink-faint'}`}>
                      {isActive ? <Check size={12} strokeWidth={3} /> : (idx + 1)}
                    </span>
                    <span className={`text-sm ${isActive ? 'font-medium text-ink' : 'text-ink-faint'}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="rounded-xl2 border border-line bg-surface p-10 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-good-50 text-good-600">
              <Check size={26} />
            </span>
            <p className="mt-4 font-display text-base font-semibold text-ink">Your agreement has been analyzed successfully.</p>
            <p className="mt-1.5 text-sm text-ink-faint">We've extracted the key terms, dates, and flagged potential risks.</p>
            <button 
              onClick={() => navigate('/analysis')} 
              className="mt-6 rounded-lg bg-lease-600 px-5 py-3 text-sm font-medium text-white shadow-soft hover:bg-lease-700"
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
