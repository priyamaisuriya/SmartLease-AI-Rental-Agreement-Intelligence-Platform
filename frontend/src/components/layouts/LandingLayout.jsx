import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const LandingLayout = () => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="active">
      <header id="marketing-nav" className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold text-ink-dark font-serif font-bold">S</span>
            <span className="font-serif text-lg font-semibold text-ink">SmartLease <span className="text-gold">AI</span></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={() => scrollToSection('popular-properties')} className="text-sm text-text-muted hover:text-ink">Properties</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-text-muted hover:text-ink">How it works</button>
            <button onClick={() => scrollToSection('ai-intelligence')} className="text-sm text-text-muted hover:text-ink">AI Analysis</button>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-medium text-text-muted hover:text-ink sm:block">Log in</Link>
            <Link to="/login" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper-card shadow-soft hover:bg-ink-dark transition-colors">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-ink-dark border-t border-ink-line py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold text-ink-dark font-serif font-bold text-sm">S</span>
              <span className="font-serif text-lg font-semibold text-paper">SmartLease <span className="text-gold">AI</span></span>
            </Link>
            <p className="text-sm text-ink-muted leading-relaxed">
              AI-powered rental intelligence. Understand your agreements, detect risks, and manage properties with ease.
            </p>
          </div>
          <div>
            <h4 className="font-serif font-medium text-paper mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-ink-muted">
              <li><Link to="/properties" className="hover:text-gold transition-colors">Find Properties</Link></li>
              <li><Link to="/upload" className="hover:text-gold transition-colors">AI Analysis</Link></li>
              <li><Link to="/dashboard" className="hover:text-gold transition-colors">Tenant Dashboard</Link></li>
              <li><Link to="/landlord" className="hover:text-gold transition-colors">Landlord Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-medium text-paper mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-ink-muted">
              <li><a href="#" className="hover:text-gold transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Renter's Guide</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Legal Templates</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-medium text-paper mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-ink-muted">
              <li><a href="#" className="hover:text-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 mt-12 pt-8 border-t border-ink-line text-center text-xs text-ink-muted flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 SmartLease AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gold transition-colors">Twitter</a>
            <a href="#" className="hover:text-gold transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-gold transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
