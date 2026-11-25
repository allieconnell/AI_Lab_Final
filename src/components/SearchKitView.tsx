import React, { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Plus, RotateCcw } from 'lucide-react';
import { DMV_AREA_OPTIONS } from '../data/dmvData';
import { DMVAreaId, HomeCandidate, HomeRating, SurveyAnswers } from '../types/homebuying';
import {
  buildPortalSearchLinks,
  buildPreferenceSummary,
  calculateMonthlyPayment,
  estimatePriceRangeFromSurvey,
  formatCurrency,
  getMatchedPrograms,
} from '../utils/homebuyingEngine';
import { ArchitecturalPlate } from './ArchitecturalPlate';

interface SearchKitViewProps {
  homes: HomeCandidate[];
  answers: SurveyAnswers;
  ratings: HomeRating[];
  onBackToDeck: () => void;
  onEditSurvey: () => void;
}

const EXTRA_KEYWORD_SUGGESTIONS = [
  'brick',
  'front porch',
  'fenced yard',
  'finished basement',
  'no HOA',
  'walk to metro',
  'garage',
  'updated kitchen',
  'hardwood floors',
  'balcony',
];

export const SearchKitView: React.FC<SearchKitViewProps> = ({
  homes,
  answers,
  ratings,
  onBackToDeck,
  onEditSurvey,
}) => {
  const preferenceSummary = useMemo(
    () => buildPreferenceSummary(answers, ratings, homes),
    [answers, ratings, homes]
  );

  const estimatedRange = useMemo(() => estimatePriceRangeFromSurvey(answers), [answers]);

  const likedHomes = useMemo(
    () =>
      ratings
        .filter((r) => r.decision === 'like')
        .map((r) => homes.find((h) => h.listing_id === r.listingId))
        .filter((h): h is HomeCandidate => Boolean(h)),
    [ratings, homes]
  );

  const initialAreas: DMVAreaId[] =
    answers.areas.length > 0 ? answers.areas : ['dc', 'montgomery_md', 'arlington_alexandria_va'];

  const [selectedArea, setSelectedArea] = useState<DMVAreaId>(initialAreas[0]);
  const [maxPrice, setMaxPrice] = useState<number>(estimatedRange.maxPrice);
  const [minBeds, setMinBeds] = useState<number>(answers.minBedrooms || 2);
  const [maxHoa, setMaxHoa] = useState<number | null>(preferenceSummary.maxRecommendedHoa);
  const [includeDetached, setIncludeDetached] = useState<boolean>(
    answers.structurePreference === 'detached_single' ||
      answers.structurePreference === 'open_exploring' ||
      likedHomes.some((h) => h.structureBucket === 'detached_single') ||
      likedHomes.length === 0
  );
  const [includeTownhouse, setIncludeTownhouse] = useState<boolean>(
    answers.structurePreference === 'townhouse_rowhouse' ||
      answers.structurePreference === 'open_exploring' ||
      likedHomes.some((h) => h.structureBucket === 'townhouse_rowhouse') ||
      likedHomes.length === 0
  );
  const [includeCondo, setIncludeCondo] = useState<boolean>(
    answers.structurePreference === 'condo_coop' ||
      answers.structurePreference === 'open_exploring' ||
      likedHomes.some((h) => h.structureBucket === 'condo_coop')
  );

  const allAvailableKeywords = useMemo(() => {
    const merged = new Set<string>([
      ...preferenceSummary.suggestedKeywords,
      ...EXTRA_KEYWORD_SUGGESTIONS,
    ]);
    return Array.from(merged);
  }, [preferenceSummary.suggestedKeywords]);

  const [activeKeywords, setActiveKeywords] = useState<string[]>(
    preferenceSummary.suggestedKeywords.slice(0, 5)
  );
  const [customKeywordInput, setCustomKeywordInput] = useState('');
  const [copiedBanner, setCopiedBanner] = useState<string | null>(null);

  const portalLinks = useMemo(
    () =>
      buildPortalSearchLinks({
        areaId: selectedArea,
        maxPrice,
        minBeds,
        maxHoa,
        includeDetached,
        includeTownhouse,
        includeCondo,
        activeKeywords,
      }),
    [
      selectedArea,
      maxPrice,
      minBeds,
      maxHoa,
      includeDetached,
      includeTownhouse,
      includeCondo,
      activeKeywords,
    ]
  );

  const matchedPrograms = useMemo(() => getMatchedPrograms(answers), [answers]);

  const toggleKeyword = (keyword: string) => {
    setActiveKeywords((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]
    );
  };

  const handleAddCustomKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customKeywordInput.trim();
    if (!cleaned) return;
    if (!activeKeywords.includes(cleaned)) {
      setActiveKeywords((prev) => [...prev, cleaned]);
    }
    setCustomKeywordInput('');
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBanner(label);
      setTimeout(() => setCopiedBanner(null), 2600);
    } catch {
      setCopiedBanner(`Could not copy automatically—select and copy the text below.`);
      setTimeout(() => setCopiedBanner(null), 3200);
    }
  };

  const showcaseHomes = likedHomes.length > 0 ? likedHomes : homes.slice(0, 3);

  return (
    <section className="max-w-5xl mx-auto px-6 py-10 md:py-12">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-8 border-b border-[#DCD5C7]">
        <div>
          <p className="text-sm font-medium text-[#524E49] mb-2">
            Your Personalized DMV Search Kit · {likedHomes.length} liked homes
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1E242B]">
            Ready-to-use Zillow &amp; Redfin searches
          </h1>
          <p className="mt-2 text-base text-[#524E49] max-w-2xl">
            Based on your survey and home ratings, you lean toward{' '}
            <strong className="text-[#1E242B]">{preferenceSummary.preferredStructureLabel}</strong> with{' '}
            <strong className="text-[#1E242B]">{preferenceSummary.preferredEraLabel}</strong> appeal. Launch a pre-filtered search below or copy your keywords.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBackToDeck}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCD5C7] bg-[#FCFBF8] text-sm font-medium text-[#1E242B] hover:bg-[#EFECE4] transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            Rate More Homes
          </button>
          <button
            type="button"
            onClick={onEditSurvey}
            className="px-4 py-2.5 rounded-xl border border-[#DCD5C7] bg-[#FCFBF8] text-sm font-medium text-[#1E242B] hover:bg-[#EFECE4] transition-colors whitespace-nowrap"
          >
            Update Survey
          </button>
        </div>
      </div>

      {/* Copy Toast */}
      {copiedBanner && (
        <div
          role="status"
          className="mt-6 px-5 py-3.5 rounded-xl bg-[#1E4D3B] text-white text-sm font-medium flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{copiedBanner}</span>
        </div>
      )}

      {/* Primary Action Card: Launch Zillow & Redfin + Copy Keywords */}
      <div className="mt-8 bg-[#FCFBF8] border border-[#DCD5C7] rounded-2xl p-6 md:p-8">
        <h2 className="font-serif text-2xl font-semibold text-[#1E242B]">
          1. Pick a DMV area &amp; open your pre-filtered search
        </h2>
        <p className="text-sm text-[#524E49] mt-1">
          Switch areas anytime—both links update automatically with your budget, bedrooms, home types, HOA limit, and keywords.
        </p>

        {/* Area Selector Buttons */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          {DMV_AREA_OPTIONS.map((area) => {
            const active = selectedArea === area.id;
            const inSurvey = answers.areas.includes(area.id);
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setSelectedArea(area.id)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#1E242B] text-white border-[#1E242B]'
                    : inSurvey
                      ? 'bg-[#F7F4EE] text-[#1E242B] border-[#9E3B26]/50 hover:border-[#1E242B]'
                      : 'bg-[#FCFBF8] text-[#524E49] border-[#DCD5C7] hover:text-[#1E242B]'
                }`}
              >
                {area.label}
              </button>
            );
          })}
        </div>

        {/* Big Clear Portal Buttons */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href={portalLinks.zillowUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#9E3B26] text-white text-base font-semibold hover:bg-[#822E1C] transition-colors min-h-[56px]"
          >
            Open Search on Zillow
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={portalLinks.redfinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#334155] text-white text-base font-semibold hover:bg-[#1E242B] transition-colors min-h-[56px]"
          >
            Open Search on Redfin
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Copyable Keywords & Filter Summary */}
        <div className="mt-6 pt-6 border-t border-[#DCD5C7] grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-[#1E242B]">
                Keywords to paste into Zillow or Redfin
              </span>
              <button
                type="button"
                onClick={() =>
                  copyText(portalLinks.keywordQuery || 'brick, hardwood', 'Keywords copied to clipboard!')
                }
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9E3B26] hover:text-[#822E1C] whitespace-nowrap"
              >
                <Copy className="w-4 h-4" />
                Copy Keywords
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[#F7F4EE] border border-[#DCD5C7] font-mono text-sm text-[#1E242B] break-words">
              {portalLinks.keywordQuery || 'No keywords selected — toggle options below'}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-[#1E242B]">
                Complete filter checklist
              </span>
              <button
                type="button"
                onClick={() =>
                  copyText(portalLinks.filterChecklistText, 'Full filter checklist copied to clipboard!')
                }
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9E3B26] hover:text-[#822E1C] whitespace-nowrap"
              >
                <Copy className="w-4 h-4" />
                Copy Checklist
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#F7F4EE] border border-[#DCD5C7] font-mono text-sm text-[#1E242B] whitespace-pre-wrap leading-relaxed">
              {portalLinks.filterChecklistText}
            </pre>
          </div>
        </div>
      </div>

      {/* Interactive Filter & Keyword Fine-Tuner */}
      <div className="mt-8 bg-[#FCFBF8] border border-[#DCD5C7] rounded-2xl p-6 md:p-8">
        <h2 className="font-serif text-2xl font-semibold text-[#1E242B]">
          2. Fine-tune your search filters &amp; keywords
        </h2>
        <p className="text-sm text-[#524E49] mt-1">
          Adjust any filter below—your Zillow and Redfin buttons above update right away.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Max Price */}
          <div>
            <label htmlFor="kit-max-price" className="block text-sm font-semibold text-[#1E242B]">
              Maximum price:{' '}
              <span className="font-mono tabular-nums">{formatCurrency(maxPrice)}</span>
            </label>
            <input
              id="kit-max-price"
              type="range"
              min={300000}
              max={950000}
              step={15000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full folio-slider"
            />
          </div>

          {/* Min Beds */}
          <div>
            <div className="text-sm font-semibold text-[#1E242B]">Minimum bedrooms</div>
            <div className="mt-2.5 flex gap-2">
              {[1, 2, 3, 4].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setMinBeds(b)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                    minBeds === b
                      ? 'bg-[#1E242B] text-white border-[#1E242B]'
                      : 'bg-[#FCFBF8] text-[#1E242B] border-[#DCD5C7] hover:border-[#1E242B]'
                  }`}
                >
                  {b}+
                </button>
              ))}
            </div>
          </div>

          {/* Max HOA */}
          <div>
            <div className="text-sm font-semibold text-[#1E242B]">Max monthly HOA / condo fee</div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {[
                { val: 0, label: '$0' },
                { val: 150, label: '$150' },
                { val: 350, label: '$350' },
                { val: 550, label: '$550' },
                { val: null, label: 'Any' },
              ].map((opt) => (
                <button
                  key={String(opt.val)}
                  type="button"
                  onClick={() => setMaxHoa(opt.val)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
                    maxHoa === opt.val
                      ? 'bg-[#1E242B] text-white border-[#1E242B]'
                      : 'bg-[#FCFBF8] text-[#1E242B] border-[#DCD5C7] hover:border-[#1E242B]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Home Types */}
        <div className="mt-6 pt-6 border-t border-[#EFECE4]">
          <div className="text-sm font-semibold text-[#1E242B] mb-3">Home types to include</div>
          <div className="flex flex-wrap gap-3">
            {[
              {
                label: 'Single-Family House',
                checked: includeDetached,
                toggle: () => setIncludeDetached((v) => !v),
              },
              {
                label: 'Townhouse / Rowhouse',
                checked: includeTownhouse,
                toggle: () => setIncludeTownhouse((v) => !v),
              },
              {
                label: 'Condo / Co-op',
                checked: includeCondo,
                toggle: () => setIncludeCondo((v) => !v),
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.toggle}
                aria-pressed={item.checked}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap ${
                  item.checked
                    ? 'border-[#9E3B26] bg-[#9E3B26]/[0.08] text-[#1E242B]'
                    : 'border-[#DCD5C7] bg-[#FCFBF8] text-[#524E49] hover:text-[#1E242B]'
                }`}
              >
                {item.checked ? 'Included: ' : 'Excluded: '}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggleable Keywords */}
        <div className="mt-6 pt-6 border-t border-[#EFECE4]">
          <div className="text-sm font-semibold text-[#1E242B] mb-3">
            Click keywords to turn them on or off
          </div>
          <div className="flex flex-wrap gap-2.5">
            {Array.from(new Set([...allAvailableKeywords, ...activeKeywords])).map((kw) => {
              const active = activeKeywords.includes(kw);
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => toggleKeyword(kw)}
                  aria-pressed={active}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#9E3B26] text-white border-[#9E3B26]'
                      : 'bg-[#FCFBF8] text-[#1E242B] border-[#DCD5C7] hover:border-[#9E3B26]'
                  }`}
                >
                  {kw}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddCustomKeyword} className="mt-4 flex flex-wrap gap-2.5 max-w-md">
            <input
              type="text"
              value={customKeywordInput}
              onChange={(e) => setCustomKeywordInput(e.target.value)}
              placeholder="Add your own keyword (e.g., fireplace)"
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-[#DCD5C7] bg-white text-base text-[#1E242B] placeholder:text-[#524E49]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1E242B] bg-[#1E242B] text-white text-sm font-semibold hover:bg-[#334155] transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Liked / Benchmark DMV Homes */}
      <div className="mt-10">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1E242B]">
          {likedHomes.length > 0 ? 'Homes you liked' : 'DMV market examples in your range'}
        </h2>
        <p className="text-base text-[#524E49] mt-1">
          Use these local DMV examples to compare monthly costs, HOA fees, and neighborhood trade-offs.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {showcaseHomes.slice(0, 4).map((home) => {
            const pay = calculateMonthlyPayment(home, answers, 'my_savings');
            return (
              <article
                key={home.listing_id}
                className="bg-[#FCFBF8] border border-[#DCD5C7] rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <ArchitecturalPlate
                    plateId={home.plateId}
                    title={home.property_details.architectural_style}
                    subtitle={home.figureCaption}
                  />
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <h3 className="font-serif text-xl font-semibold text-[#1E242B]">
                      {home.address.neighborhood}, {home.address.state}
                    </h3>
                    <span className="font-mono text-lg font-semibold text-[#1E242B] tabular-nums">
                      {formatCurrency(home.list_price)}
                    </span>
                  </div>
                  <p className="text-sm text-[#524E49] mt-1 tabular-nums">
                    {home.property_details.architectural_style} · {home.property_details.bedrooms} Bd ·{' '}
                    {home.property_details.living_area_sqft.toLocaleString()} sq ft · Est.{' '}
                    <strong className="font-mono text-[#1E242B]">{formatCurrency(pay.totalMonthly)}/mo</strong>
                  </p>
                </div>
                <p className="mt-4 pt-3 border-t border-[#EFECE4] text-sm text-[#524E49]">
                  {home.financials_and_hoa.first_time_buyer_notes}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      {/* Personalized DMV & HUD Assistance Roadmap */}
      <div className="mt-12 bg-[#FCFBF8] border border-[#DCD5C7] rounded-2xl p-6 md:p-8">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1E242B]">
          Your DMV &amp; HUD Homebuyer Assistance Plan
        </h2>
        <p className="text-base text-[#524E49] mt-1">
          Matched to your survey answers using guidance from Virginia Housing, Maryland Homeownership, and HUD.
        </p>

        <div className="mt-6 divide-y divide-[#DCD5C7]">
          {matchedPrograms.map((prog) => (
            <div key={prog.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-serif text-xl font-semibold text-[#1E242B]">{prog.name}</h3>
                <span className="text-sm font-semibold text-[#1E4D3B]">
                  {prog.jurisdiction} · {prog.eligibilityStatus}
                </span>
              </div>
              <p className="text-base font-semibold text-[#9E3B26] mt-1">{prog.benefitHeadline}</p>
              <p className="text-base text-[#524E49] mt-1.5">{prog.plainSummary}</p>
              <ul className="mt-3 space-y-1 text-sm text-[#1E242B]">
                {prog.requirements.map((req) => (
                  <li key={req}>• {req}</li>
                ))}
              </ul>
              <a
                href={prog.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#334155] underline underline-offset-4 hover:text-[#9E3B26]"
              >
                Visit {prog.officialLabel}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
