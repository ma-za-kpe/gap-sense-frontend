'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="bg-white text-slate-800">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 py-20 bg-gradient-to-b from-white to-slate-50">
        <h1 className="text-7xl font-bold text-whatsapp-500 mb-6 leading-tight max-md:text-5xl">
          Find Math Gaps in 8 Seconds
        </h1>
        <p className="text-3xl text-slate-700 mb-12 max-w-3xl max-md:text-2xl">
          AI-powered learning gap diagnostics for Ghana's teachers via WhatsApp
        </p>
        <button
          onClick={() => router.push('/demo')}
          className="inline-block bg-whatsapp-500 text-white text-2xl font-semibold px-12 py-5 rounded-full shadow-button transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-98 max-md:text-xl max-md:px-8 max-md:py-4"
        >
          Try Live Demo →
        </button>
      </section>

      {/* Problem Section */}
      <section className="py-32 text-center bg-white px-6 max-md:py-24">
        <div className="text-[128px] font-bold text-gold-500 mb-6 drop-shadow-lg max-md:text-8xl">
          84%
        </div>
        <h2 className="text-5xl text-slate-800 mb-4 font-semibold max-md:text-4xl">
          Ghana's Hidden Learning Crisis
        </h2>
        <p className="text-2xl text-slate-500 max-w-2xl mx-auto max-md:text-xl">
          Of children aged 7-14 lack foundational numeracy skills needed to succeed in school
        </p>
        <p className="text-base text-slate-400 mt-4 italic">UNICEF MICS 2023</p>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-slate-50 text-center px-6 max-md:py-24">
        <h2 className="text-5xl text-whatsapp-500 mb-20 font-semibold max-md:text-4xl">
          How It Works
        </h2>
        <div className="flex justify-center gap-16 max-w-6xl mx-auto flex-wrap max-md:gap-12">
          <div className="flex-1 min-w-[280px] max-w-[320px]">
            <div className="text-7xl mb-6">📸</div>
            <h3 className="text-3xl text-slate-800 mb-4 font-semibold">Upload</h3>
            <p className="text-lg text-slate-500 leading-relaxed">
              Teacher snaps a photo of student's exercise book via WhatsApp
            </p>
          </div>
          <div className="flex-1 min-w-[280px] max-w-[320px]">
            <div className="text-7xl mb-6">🤖</div>
            <h3 className="text-3xl text-slate-800 mb-4 font-semibold">Analyze</h3>
            <p className="text-lg text-slate-500 leading-relaxed">
              AI analyzes work in 8 seconds, pinpointing exact foundational gaps
            </p>
          </div>
          <div className="flex-1 min-w-[280px] max-w-[320px]">
            <div className="text-7xl mb-6">📊</div>
            <h3 className="text-3xl text-slate-800 mb-4 font-semibold">Report</h3>
            <p className="text-lg text-slate-500 leading-relaxed">
              Teacher receives comprehensive gap report with priority recommendations
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => router.push('/demo/curriculum')}
            className="inline-block bg-white text-whatsapp-500 border-2 border-whatsapp-500 text-2xl font-semibold px-12 py-5 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg max-md:text-xl max-md:px-8 max-md:py-4"
          >
            📚 Explore Ghana Curriculum →
          </button>
          <p className="mt-4 text-base text-slate-500">
            Browse 500+ official curriculum topics mapped by GapSense
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 bg-white text-center px-6 max-md:py-24">
        <h2 className="text-5xl text-slate-800 mb-20 font-semibold max-md:text-4xl">
          Production-Ready Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto">
          <div>
            <div className="text-6xl font-bold text-whatsapp-500 mb-2 max-md:text-5xl">
              7.97s
            </div>
            <div className="text-xl text-slate-500">Average Analysis Time</div>
          </div>
          <div>
            <div className="text-6xl font-bold text-whatsapp-500 mb-2 max-md:text-5xl">
              $0.006
            </div>
            <div className="text-xl text-slate-500">Cost Per Analysis</div>
          </div>
          <div>
            <div className="text-6xl font-bold text-whatsapp-500 mb-2 max-md:text-5xl">
              27
            </div>
            <div className="text-xl text-slate-500">Math Topics Covered</div>
          </div>
          <div>
            <div className="text-6xl font-bold text-whatsapp-500 mb-2 max-md:text-5xl">
              50M+
            </div>
            <div className="text-xl text-slate-500">Students We Can Reach</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-whatsapp text-center px-6 max-md:py-24">
        <h2 className="text-6xl text-white mb-8 font-semibold max-md:text-5xl">
          Ready to Close the Gap?
        </h2>
        <p className="text-2xl text-white/90 mb-12 max-md:text-xl">
          See GapSense in action with our live production demo
        </p>
        <button
          onClick={() => router.push('/demo')}
          className="inline-block bg-white text-whatsapp-500 text-2xl font-semibold px-12 py-5 rounded-full shadow-lg transition-all hover:bg-slate-50 hover:-translate-y-0.5 max-md:text-xl max-md:px-8 max-md:py-4"
        >
          Try Live Demo →
        </button>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-800 text-center text-slate-400 px-6">
        <p className="text-base mb-2">
          Built for <span className="text-gold-500 font-semibold">UNICEF StartUp Lab Cohort 6</span>
        </p>
        <p className="text-base mb-2">
          AI-Powered Tools for Diagnosing Learning Gaps in Ghana
        </p>
        <p className="mt-4 text-sm">
          © 2026 GapSense. Empowering teachers, transforming education.
        </p>
      </footer>
    </div>
  );
}
