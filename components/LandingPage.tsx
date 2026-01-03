import React, { useState } from "react";
import { User } from "../types";

interface LandingPageProps {
  onStart: () => void;
  user: User | null;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  user,
  onLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text-main)] flex flex-col relative overflow-x-hidden">
      {/* Background Grid/Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-[1]" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 w-full px-4 py-4 md:px-10 md:py-6 flex justify-between items-center z-50 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div
          className="flex items-center gap-2 md:gap-3 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="w-7 h-7 md:w-8 md:h-8 border-2 border-[var(--accent)] flex items-center justify-center rounded-sm">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-[var(--accent)] animate-pulse" />
          </div>
          <span className="text-[14px] md:text-[16px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em]">
            HeroBuilder3D
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 bg-[var(--panel)]/50 px-8 py-3 rounded-full border border-[var(--border)]">
          {["about", "pricing", "contact"].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              {section}
            </button>
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-3 z-30 bg-[var(--panel)] border border-[var(--border)] rounded-lg backdrop-blur-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-[var(--text-main)] transition-all duration-300 ${
              mobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[var(--text-main)] transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[var(--text-main)] transition-all duration-300 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>

        {/* Desktop User Section */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-bold uppercase tracking-widest opacity-70">
                Welcome, {user.name}
              </span>
              {user.picture && (
                <img
                  src={user.picture}
                  className="w-8 h-8 rounded-full ring-2 ring-[var(--accent)]/50"
                  alt="User"
                />
              )}
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="text-[12px] font-black uppercase tracking-widest hover:text-[var(--accent)] transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[var(--bg)] z-40 md:hidden flex flex-col items-center justify-center gap-8 animate-in fade-in duration-200 pt-20">
          {["about", "pricing", "contact"].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className="text-[18px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              {section}
            </button>
          ))}
          <div className="border-t border-[var(--border)] w-32 my-4" />
          {user ? (
            <div className="flex items-center gap-3">
              {user.picture && (
                <img
                  src={user.picture}
                  className="w-10 h-10 rounded-full ring-2 ring-[var(--accent)]/50"
                  alt="User"
                />
              )}
              <span className="text-[14px] font-bold uppercase tracking-widest opacity-70">
                {user.name}
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                onLogin();
                setMobileMenuOpen(false);
              }}
              className="text-[16px] font-black uppercase tracking-widest text-[var(--accent)]"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Main Content - Single Page Scroll */}
      <main className="flex-1 flex flex-col items-center w-full relative z-10 pt-24">
        {/* HERO SECTION */}
        <section
          id="home"
          className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 max-w-7xl mx-auto">
            <div className="mb-8 relative">
              <div className="absolute -inset-10 bg-[var(--accent)]/20 blur-3xl rounded-full opacity-20 animate-pulse" />
              <span className="relative py-2 px-4 border border-[var(--accent)]/30 rounded-full text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.3em] bg-[var(--accent)]/5">
                v1.2.5-C Stable
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-light tracking-tighter uppercase mb-8 max-w-5xl mx-auto leading-[0.9]">
              Ship{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-white">
                Immersive
              </span>{" "}
              Web Experiences
            </h1>

            <p className="text-[var(--text-muted)] text-[14px] md:text-[16px] uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed mb-16">
              The production-grade 3D pipeline for frontend engineers. Generate
              React Three Fiber components, optimize geometry, and deploy
              cinematic hero sections without the WebGL boilerplate.
            </p>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
              <button
                onClick={onStart}
                className="group relative px-12 py-6 bg-[var(--text-main)] text-[var(--bg)] text-[14px] font-black uppercase tracking-[0.3em] hover:bg-[var(--accent)] transition-all rounded-xl overflow-hidden"
              >
                <span className="relative z-10">Initialize Studio</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>

              {!user && (
                <button
                  onClick={onLogin}
                  className="px-12 py-6 border border-[var(--border)] text-[var(--text-main)] text-[14px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all rounded-xl"
                >
                  Access Account
                </button>
              )}
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full text-left">
              {[
                {
                  title: "Zero Boilerplate",
                  desc: "Skip the R3F setup. Get a fully configured canvas with lights, cameras, and controls instantly.",
                },
                {
                  title: "Production Ready",
                  desc: "Export optimized React components or vanilla JS. Compatible with WordPress, Webflow, and Framer.",
                },
                {
                  title: "Declarative 3D",
                  desc: "Manipulate geometry, materials, and physics using a visual editor built for component-based thinking.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-8 border border-[var(--border)] bg-[var(--panel)]/50 backdrop-blur-sm rounded-2xl hover:border-[var(--accent)]/50 transition-colors group"
                >
                  <div className="w-10 h-10 mb-6 border border-[var(--border)] rounded-lg flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-[var(--bg)] transition-colors">
                    <span className="font-mono font-bold">0{i + 1}</span>
                  </div>
                  <h3 className="text-[14px] font-black uppercase tracking-widest mb-3">
                    {f.title}
                  </h3>
                  <p className="text-[var(--text-muted)] text-[12px] leading-relaxed uppercase tracking-wide">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section
          id="about"
          className="w-full py-32 px-4 border-t border-[var(--border)] bg-[var(--panel)]/20"
        >
          <div className="max-w-4xl mx-auto w-full text-left">
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase mb-12">
              About The <span className="text-[var(--accent)]">Protocol</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6 text-[var(--text-muted)] text-[14px] leading-relaxed uppercase tracking-wide">
                <p>
                  HeroBuilder3D is a specialized devtool for frontend engineers
                  who need to ship high-fidelity 3D interfaces without the
                  overhead of building a custom WebGL pipeline from scratch.
                </p>
                <p>
                  We abstract the complexity of Three.js and React Three Fiber
                  into a visual interface, allowing you to prototype, optimize,
                  and export component-based 3D assets directly into your
                  production codebase.
                </p>
              </div>
              <div className="p-8 border border-[var(--border)] rounded-2xl bg-[var(--panel)]/50">
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-6 text-[var(--text-main)]">
                  System Specs
                </h3>
                <ul className="space-y-4">
                  {[
                    "React 19 Core",
                    "Three.js R160+",
                    "Gemini 1.5 Flash",
                    "TypeScript Strict",
                  ].map((spec, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-[12px] font-mono text-[var(--accent)]"
                    >
                      <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section
          id="pricing"
          className="w-full py-32 px-4 border-t border-[var(--border)]"
        >
          <div className="max-w-5xl mx-auto w-full">
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase mb-16 text-center">
              Access <span className="text-[var(--accent)]">Tiers</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Tier */}
              <div className="p-10 border border-[var(--border)] rounded-3xl bg-[var(--panel)]/30 flex flex-col gap-8 hover:border-[var(--border)]/50 transition-colors">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    Basic Access
                  </span>
                  <h3 className="text-4xl font-light mt-4">Free</h3>
                </div>
                <ul className="flex-1 space-y-4">
                  {[
                    "Standard Geometry",
                    "Basic Materials",
                    "3 Exports / Day",
                    "Community Support",
                  ].map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-[12px] uppercase tracking-wider text-[var(--text-muted)]"
                    >
                      <svg
                        className="w-4 h-4 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onStart}
                  className="w-full py-5 border border-[var(--border)] text-[var(--text-main)] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all rounded-xl"
                >
                  Initialize Free
                </button>
              </div>

              {/* Pro Tier */}
              <div className="p-10 border border-[var(--accent)] rounded-3xl bg-[var(--accent)]/5 flex flex-col gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[var(--accent)] text-[var(--bg)] text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-bl-xl">
                  Recommended
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">
                    Pro Studio
                  </span>
                  <h3 className="text-4xl font-light mt-4">
                    $5{" "}
                    <span className="text-[14px] text-[var(--text-muted)]">
                      / mo
                    </span>
                  </h3>
                  <p className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider mt-2">
                    or $30 / year
                  </p>
                </div>
                <ul className="flex-1 space-y-4">
                  {[
                    "Premium DNA Library",
                    "Pro Entrance Animations",
                    "Physics & Glass Materials",
                    "Unlimited Exports",
                    "Priority Rendering",
                  ].map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-[12px] uppercase tracking-wider text-[var(--text-main)]"
                    >
                      <svg
                        className="w-4 h-4 text-[var(--accent)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onStart}
                  className="w-full py-5 bg-[var(--accent)] text-[var(--bg)] font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-all rounded-xl shadow-[0_0_30px_-10px_var(--accent)]"
                >
                  Unlock Pro Features
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section
          id="contact"
          className="w-full py-32 px-4 border-t border-[var(--border)] bg-[var(--panel)]/20"
        >
          <div className="max-w-2xl mx-auto w-full text-center">
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase mb-8">
              Establish <span className="text-[var(--accent)]">Uplink</span>
            </h2>
            <p className="text-[var(--text-muted)] text-[14px] uppercase tracking-[0.2em] mb-12">
              For enterprise inquiries, bug reports, or feature requests.
            </p>
            <form
              className="flex flex-col gap-6 text-left"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Identity
                  </label>
                  <input
                    type="text"
                    className="bg-[var(--input-bg)] border border-[var(--border)] p-4 rounded-lg text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
                    placeholder="NAME"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Frequency
                  </label>
                  <input
                    type="email"
                    className="bg-[var(--input-bg)] border border-[var(--border)] p-4 rounded-lg text-[14px] outline-none focus:border-[var(--accent)] transition-colors"
                    placeholder="EMAIL"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Transmission
                </label>
                <textarea
                  rows={5}
                  className="bg-[var(--input-bg)] border border-[var(--border)] p-4 rounded-lg text-[14px] outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  placeholder="MESSAGE CONTENT..."
                />
              </div>
              <button className="w-full py-5 bg-[var(--text-main)] text-[var(--bg)] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-[var(--accent)] transition-all rounded-lg mt-4">
                Send Transmission
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border)] z-10 bg-[var(--panel)]/30 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            <div className="col-span-1 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border border-[var(--accent)] flex items-center justify-center rounded-sm">
                  <div className="w-2 h-2 bg-[var(--accent)]" />
                </div>
                <span className="text-[12px] font-black uppercase tracking-[0.15em]">
                  HeroBuilder3D
                </span>
              </div>
              <p className="text-[var(--text-muted)] text-[11px] leading-relaxed uppercase tracking-wide max-w-xs">
                The production-grade 3D pipeline for modern web experiences.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] mb-6">
                Product
              </h4>
              <ul className="space-y-3">
                {["Features", "Pricing", "Changelog", "Documentation"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-wider transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] mb-6">
                Legal
              </h4>
              <ul className="space-y-3">
                {[
                  "Terms of Service",
                  "Privacy Policy",
                  "License",
                  "Cookies",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-wider transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] mb-6">
                Connect
              </h4>
              <ul className="space-y-3">
                {["Twitter / X", "GitHub", "Discord", "Email"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-wider transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
              © {new Date().getFullYear()} SyntaxDrive Inc. All rights reserved.
            </span>
            <div className="flex gap-6">
              <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                SYSTEM_OPERATIONAL
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
