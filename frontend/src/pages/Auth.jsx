import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, FileText, Check, AlertTriangle, Briefcase, User, Shield } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('tenant'); // 'tenant', 'landlord', 'manager'
  const [pwVisible, setPwVisible] = useState(false);

  const isLogin = mode === 'login';

  const handleAuth = (e) => {
    e.preventDefault();
    // In a real app, this would perform auth. For the demo, redirect to the chosen role dashboard.
    if (role === 'tenant') navigate('/dashboard');
    else if (role === 'landlord') navigate('/landlord');
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen w-full flex items-stretch font-sans bg-paper">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[46%] relative flex-col justify-between py-12 px-14 overflow-hidden bg-gradient-to-b from-ink-dark to-[#101a2e]">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[15%] w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(201,162,75,0.10),transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.045] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 27px, var(--color-gold) 28px)' }}></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="w-11 h-11 rounded border border-gold flex items-center justify-center bg-gold/5 shadow-[0_0_0_4px_rgba(201,162,75,0.05)]">
            <span className="font-serif font-bold text-gold text-lg">S</span>
          </Link>
          <span className="font-sans text-[15px] tracking-[0.18em] uppercase text-[#EDEBE3] font-semibold">
            SmartLease <span className="text-gold">AI</span>
          </span>
        </div>

        <div className="relative z-10 mt-9">
          <p className="text-[12.5px] uppercase tracking-[0.16em] text-text-muted mb-4 font-medium">What we read, so you don't have to</p>
          
          <div className="bg-paper-card rounded-lg p-6 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.4)] animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-[0.1em] text-[#8A7658] font-mono font-medium">§ 4.2 — Security Deposit</span>
              <FileText className="w-4 h-4 text-[#8A7658]" />
            </div>
            <p className="text-[15px] leading-[1.68] text-[#2A2620] font-serif mb-0">
              "The Tenant forfeits the full deposit for any early termination, regardless of cause, and Landlord may withhold additional sums at sole discretion."
            </p>
            <div className="mt-5 flex items-start gap-2.5 rounded px-3.5 py-3 bg-risk-red-bg border-l-[2.5px] border-[#C1443C]">
              <AlertTriangle className="w-4 h-4 text-[#C1443C] mt-0.5 shrink-0" />
              <div>
                <p className="text-[12.5px] font-semibold text-[#C1443C] mb-1">High-risk clause flagged</p>
                <p className="text-xs leading-relaxed text-[#6B4F49] mb-0">"Sole discretion" removes your right to dispute withholding. Ask for a defined deduction list.</p>
              </div>
            </div>
          </div>
          
          <p className="text-[12.5px] leading-[1.65] text-text-faint max-w-[380px] mt-5">
            Every agreement you upload is read clause by clause — summarized in plain language, checked for risk, and ready to answer your questions.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-9 pt-8 border-t border-border/20 mt-10">
          <div>
            <p className="text-[21px] text-[#EDEBE3] font-serif font-medium m-0">12,400+</p>
            <p className="text-[11.5px] tracking-[0.02em] text-text-muted mt-1">agreements analyzed</p>
          </div>
          <div>
            <p className="text-[21px] text-[#EDEBE3] font-serif font-medium m-0">3 roles</p>
            <p className="text-[11.5px] tracking-[0.02em] text-text-muted mt-1">tenant · landlord · manager</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-12 bg-paper bg-[radial-gradient(ellipse_700px_400px_at_85%_0%,rgba(201,162,75,0.05),transparent_60%)]">
        <div className="w-full max-w-[400px] animate-in slide-in-from-bottom-4 duration-500 fade-in">
          
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <Link to="/" className="w-9 h-9 rounded bg-gold/10 flex items-center justify-center">
              <span className="font-serif font-bold text-gold text-lg">S</span>
            </Link>
            <span className="text-sm tracking-[0.16em] uppercase text-ink font-semibold">
              SmartLease <b className="text-gold-deep font-semibold">AI</b>
            </span>
          </div>

          <div className="flex items-center gap-6 mb-8 border-b border-border">
            <button 
              className={`pb-3 text-[14.5px] font-sans transition-colors relative ${isLogin ? 'text-ink font-semibold' : 'text-text-faint font-medium hover:text-ink'}`}
              onClick={() => setMode('login')}
            >
              Log in
              {isLogin && <span className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-gold rounded-sm"></span>}
            </button>
            <button 
              className={`pb-3 text-[14.5px] font-sans transition-colors relative ${!isLogin ? 'text-ink font-semibold' : 'text-text-faint font-medium hover:text-ink'}`}
              onClick={() => setMode('register')}
            >
              Create account
              {!isLogin && <span className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-gold rounded-sm"></span>}
            </button>
          </div>

          <div className="mb-8 transition-opacity duration-200">
            <h1 className="text-[27px] leading-[1.25] text-ink font-serif font-medium mb-1.5">
              {isLogin ? 'Welcome back' : 'Set up your account'}
            </h1>
            <p className="text-[14px] text-text-muted m-0">
              {isLogin ? 'Sign in to review your agreements.' : "A few details, and you're reading clearly in minutes."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-[19px]">
            {!isLogin && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">Full name</label>
                <input type="text" className="w-full px-3.5 py-2.5 text-[14.5px] text-ink bg-white border border-border rounded-[3px] outline-none transition-all focus:border-gold focus:ring-[3px] focus:ring-gold/20 placeholder:text-text-faint" placeholder="Priya Sharma" required={!isLogin} />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">Email address</label>
              <input type="email" className="w-full px-3.5 py-2.5 text-[14.5px] text-ink bg-white border border-border rounded-[3px] outline-none transition-all focus:border-gold focus:ring-[3px] focus:ring-gold/20 placeholder:text-text-faint" placeholder="you@example.com" required />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">Password</label>
              <div className="relative">
                <input type={pwVisible ? 'text' : 'password'} className="w-full px-3.5 py-2.5 pr-10 text-[14.5px] text-ink bg-white border border-border rounded-[3px] outline-none transition-all focus:border-gold focus:ring-[3px] focus:ring-gold/20 placeholder:text-text-faint" placeholder="At least 8 characters" required />
                <button type="button" onClick={() => setPwVisible(!pwVisible)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-ink p-1 rounded transition-colors">
                  {pwVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">Confirm password</label>
                <input type="password" className="w-full px-3.5 py-2.5 text-[14.5px] text-ink bg-white border border-border rounded-[3px] outline-none transition-all focus:border-gold focus:ring-[3px] focus:ring-gold/20 placeholder:text-text-faint" placeholder="Re-enter password" required={!isLogin} />
              </div>
            )}

            {!isLogin && (
              <div className="animate-in fade-in duration-300">
                <span className="block text-xs uppercase tracking-[0.08em] text-text-muted mb-1.5 font-semibold">I am a</span>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setRole('tenant')} className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-[3px] border bg-white transition-colors ${role === 'tenant' ? 'border-gold bg-gold/10' : 'border-border hover:border-gold-soft'}`}>
                    <User className={`w-4 h-4 ${role === 'tenant' ? 'text-gold-deep' : 'text-text-faint'}`} />
                    <span className={`text-xs ${role === 'tenant' ? 'text-ink font-semibold' : 'text-text-faint font-medium'}`}>Tenant</span>
                  </button>
                  <button type="button" onClick={() => setRole('landlord')} className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-[3px] border bg-white transition-colors ${role === 'landlord' ? 'border-gold bg-gold/10' : 'border-border hover:border-gold-soft'}`}>
                    <Briefcase className={`w-4 h-4 ${role === 'landlord' ? 'text-gold-deep' : 'text-text-faint'}`} />
                    <span className={`text-xs ${role === 'landlord' ? 'text-ink font-semibold' : 'text-text-faint font-medium'}`}>Landlord</span>
                  </button>
                  <button type="button" onClick={() => setRole('manager')} className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-[3px] border bg-white transition-colors ${role === 'manager' ? 'border-gold bg-gold/10' : 'border-border hover:border-gold-soft'}`}>
                    <Shield className={`w-4 h-4 ${role === 'manager' ? 'text-gold-deep' : 'text-text-faint'}`} />
                    <span className={`text-xs ${role === 'manager' ? 'text-ink font-semibold' : 'text-text-faint font-medium'}`}>Admin</span>
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end -mt-2">
                <button type="button" className="text-[12.5px] text-[#8A7658] hover:text-gold-deep transition-colors bg-transparent border-none p-0">Forgot password?</button>
              </div>
            )}

            <button type="submit" className="w-full flex items-center justify-center gap-2 p-[13px] bg-ink hover:bg-ink-dark text-paper-card text-[14.5px] font-semibold rounded-[3px] mt-1 transition-all active:scale-[0.99] group">
              {isLogin ? 'Log in' : 'Create account'}
              <Check className="w-4 h-4 text-paper-card group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <p className="text-center text-[13px] text-text-faint mt-7">
            {isLogin ? 'New to SmartLease AI? ' : 'Already have an account? '}
            <button onClick={() => setMode(isLogin ? 'register' : 'login')} className="text-gold-deep font-semibold hover:text-ink transition-colors bg-transparent border-none p-0">
              {isLogin ? 'Create an account' : 'Log in'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Auth;
