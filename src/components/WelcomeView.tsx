import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ArchitecturalPlate } from './ArchitecturalPlate';

interface WelcomeViewProps {
  onBegin: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onBegin }) => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left: Very short intro + single "Let's Begin" button */}
        <div className="lg:col-span-5">
          <p className="text-sm font-semibold text-[#196F65] mb-3">
            DC, Maryland &amp; Virginia Homebuying Guide
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#3A2B6D] leading-tight">
            Find the DMV home that fits your budget and style.
          </h1>
          <p className="mt-5 text-base md:text-lg text-[#3E3757] leading-relaxed">
            Take a quick 10-question survey, explore homes in your price range, and get ready-to-use Zillow and Redfin searches with local assistance matches.
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={onBegin}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#CE4C6D] text-white text-base font-bold hover:bg-[#B03656] transition-colors min-h-[56px] whitespace-nowrap"
            >
              Let&apos;s Begin
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Welcoming picture of a DMV house */}
        <div className="lg:col-span-7">
          <div className="p-3 rounded-2xl bg-[#EEBC8E]/30">
            <ArchitecturalPlate
              plateId="petworth_rowhouse"
              title="Classic DMV Porch-Front Brick Rowhouse"
              subtitle="Classic porch-front brick rowhouse — Washington, DC · Maryland · Virginia"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
