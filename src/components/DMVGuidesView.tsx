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
      <div className="pb-8 border-b border-[#DCD5C7]">
        <p className="text-sm font-medium text-[#524E49] mb-2">
          Official Homebuyer Programs · Virginia, Maryland, DC &amp; Federal HUD
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1E242B]">
          Plain-English DMV Homebuying Guide
        </h1>
        <p className="mt-3 text-base text-[#524E49] max-w-2xl leading-relaxed">
          Every affordability estimate and assistance match in Potomac Folio is grounded in official guidance from Virginia Housing, the Maryland Mortgage Program, and the U.S. Department of Housing and Urban Development (HUD).
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {OFFICIAL_RESOURCES.map((res) => (
          <article
            key={res.id}
            className="bg-[#FCFBF8] border border-[#DCD5C7] rounded-2xl p-6 md:p-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-serif text-2xl font-semibold text-[#1E242B]">{res.title}</h2>
              <span className="text-sm font-medium text-[#524E49]">{res.jurisdiction}</span>
            </div>
            <p className="mt-3 text-base text-[#1E242B] leading-relaxed">{res.summary}</p>
            <ul className="mt-4 space-y-2 text-base text-[#524E49]">
              {res.keyFacts.map((fact) => (
                <li key={fact}>• {fact}</li>
              ))}
            </ul>
            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 text-base font-semibold text-[#9E3B26] underline underline-offset-4 hover:text-[#822E1C]"
            >
              Visit official website
              <ExternalLink className="w-4 h-4" />
            </a>
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={onReturnToFlow}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#9E3B26] text-white text-base font-semibold hover:bg-[#822E1C] transition-colors whitespace-nowrap"
        >
          {hasCompletedSurvey ? 'Return to Exploring Homes' : 'Back to the 10-Question Survey'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
