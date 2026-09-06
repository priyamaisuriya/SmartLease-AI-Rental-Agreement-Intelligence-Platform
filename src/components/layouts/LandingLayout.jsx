import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const LandingLayout = () => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="active">
      <header id="marketing-nav" className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-lease-600 text-white font-display font-bold">S</span>
            <span className="font-display text-lg font-semibold text-ink">SmartLease <span className="text-lease-600">AI</span></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={() => scrollToSection('popular-properties')} className="text-sm text-ink-soft hover:text-ink">Properties</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-ink-soft hover:text-ink">How it works</button>
            <button onClick={() => scrollToSection('ai-intelligence')} className="text-sm text-ink-soft hover:text-ink">AI Analysis</button>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:block">Log in</Link>
            <Link to="/dashboard" className="rounded-lg bg-lease-600 px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-lease-700">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-ink py-10">
        <div className="mx-auto max-w-7xl px-5 text-center text-xs text-white/50 sm:px-8">© 2026 SmartLease AI. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default LandingLayout;
