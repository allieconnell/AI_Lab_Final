import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { OFFICIAL_RESOURCES } from '../data/dmvData';

interface DMVGuidesViewProps {
  onReturnToFlow: () => void;
  hasCompletedSurvey: boolean;
}

export const DMVGuidesView: React.FC<DMVGuidesViewProps> = ({
  onReturnToFlow,
  hasCompletedSurvey,
}) => {
  return (
    <section className="max-w-4xl mx-auto px-6 py-10 md:py-14">
      <div className="pb-8 border-b border-[#CFC9DB]">
        <p className="text-sm font-semibold text-[#196F65] mb-2">
          Official Homebuyer Programs · Virginia, Maryland, DC &amp; Federal HUD
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[#3A2B6D]">
          Plain-English DMV Homebuying Guide
        </h1>
        <p className="mt-3 text-base text-[#3E3757] max-w-2xl leading-relaxed">
          Every affordability estimate and assistance match in Your Home Buying Adventure is grounded in official guidance from Virginia Housing, the Maryland Mortgage Program, and the U.S. Department of Housing and Urban Development (HUD).
        </p>
      </div>

      {/* Clean Editorial List Separated by Hairline Dividers */}
      <div className="divide-y divide-[#CFC9DB]">
        {OFFICIAL_RESOURCES.map((res) => (
          <article key={res.id} className="py-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-[#3A2B6D]">{res.title}</h2>
              <span className="text-sm font-bold text-[#196F65]">{res.jurisdiction}</span>
            </div>
            <p className="mt-3 text-base text-[#1B1633] leading-relaxed">{res.summary}</p>
            <ul className="mt-4 space-y-2 text-base text-[#3E3757]">
              {res.keyFacts.map((fact) => (
                <li key={fact}>• {fact}</li>
              ))}
            </ul>
            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-base font-bold text-[#217D8E] underline underline-offset-4 hover:text-[#3A2B6D]"
            >
              Visit official website
              <ExternalLink className="w-4 h-4" />
            </a>
          </article>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-[#CFC9DB] flex justify-center">
        <button
          type="button"
          onClick={onReturnToFlow}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#CE4C6D] text-white text-base font-bold hover:bg-[#B03656] transition-colors whitespace-nowrap"
        >
          {hasCompletedSurvey ? 'Return to Exploring Homes' : 'Back to the 10-Question Survey'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
