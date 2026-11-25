import React, { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink, Heart, RotateCcw, X } from 'lucide-react';
import {
  DownPaymentMode,
  HomeCandidate,
  HomeRating,
  SurveyAnswers,
} from '../types/homebuying';
import {
  buildPreferenceSummary,
  calculateMonthlyPayment,
  formatCurrency,
  getMatchedPrograms,
  scoreHomeForBuyer,
} from '../utils/homebuyingEngine';
import { ArchitecturalPlate } from './ArchitecturalPlate';

interface ExploreDeckProps {
  homes: HomeCandidate[];
  answers: SurveyAnswers;
  ratings: HomeRating[];
  onRateHome: (listingId: string, decision: 'like' | 'pass') => void;
  onUndoLastRating: () => void;
  onFinishToSearchKit: () => void;
  onEditSurvey: () => void;
}

export const ExploreDeck: React.FC<ExploreDeckProps> = ({
  homes,
  answers,
  ratings,
  onRateHome,
  onUndoLastRating,
  onFinishToSearchKit,
  onEditSurvey,
}) => {
  const [downMode, setDownMode] = useState<DownPaymentMode>('my_savings');

  const ratedIds = new Set(ratings.map((r) => r.listingId));
  const likedCount = ratings.filter((r) => r.decision === 'like').length;

  // Dynamically rank remaining unseen homes using survey + learned Like/Pass preferences
  const unseenScored = homes
    .filter((h) => !ratedIds.has(h.listing_id))
    .map((home) => ({
      home,
      ...scoreHomeForBuyer(home, answers, ratings, homes),
    }))
    .sort((a, b) => b.score - a.score);

  const currentEntry = unseenScored[0];
  const currentHome = currentEntry?.home;

  const preferenceSummary = buildPreferenceSummary(answers, ratings, homes);

  // Support simple keyboard Like/Pass shortcuts
  useEffect(() => {
    if (!currentHome) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onRateHome(currentHome.listing_id, 'pass');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onRateHome(currentHome.listing_id, 'like');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentHome, onRateHome]);

  if (!currentHome) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-sm font-medium text-[#524E49] mb-2">
          Deck Complete · {likedCount} of {ratings.length} homes liked
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1E242B]">
          Your DMV home preferences are ready.
        </h1>
        <p className="mt-3 text-base text-[#524E49] max-w-xl mx-auto">
          We have translated your survey answers and liked architectural styles into custom Zillow and Redfin search links, keywords, and assistance matches.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={onFinishToSearchKit}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#9E3B26] text-white text-base font-semibold hover:bg-[#822E1C] transition-colors whitespace-nowrap"
          >
            Open My Zillow &amp; Redfin Search Kit
            <ArrowRight className="w-4 h-4" />
          </button>
          {ratings.length > 0 && (
            <button
              type="button"
              onClick={onUndoLastRating}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#DCD5C7] bg-[#FCFBF8] text-base font-medium text-[#1E242B] hover:bg-[#EFECE4] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Review Previous Home
            </button>
          )}
        </div>
      </section>
    );
  }

  const payment = calculateMonthlyPayment(currentHome, answers, downMode);
  const budgetDiff = payment.totalMonthly - answers.monthlyBudget;
  const isWithinBudget = budgetDiff <= 150;

  const statePrograms = getMatchedPrograms(answers, [currentHome.address.state]).slice(0, 2);

  const bathsLabel =
    currentHome.property_details.bathrooms_half > 0
      ? `${currentHome.property_details.bathrooms_full}.${currentHome.property_details.bathrooms_half}`
      : `${currentHome.property_details.bathrooms_full}`;

  return (
    <section className="max-w-6xl mx-auto px-6 py-8 md:py-10">
      {/* Clean Top Status Line */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#DCD5C7]">
        <div>
          <p className="text-sm font-medium text-[#524E49]">
            Home {ratings.length + 1} of {homes.length} · {currentEntry.matchReason}
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#1E242B] mt-1">
            Like or pass homes in your DMV range
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {ratings.length > 0 && (
            <button
              type="button"
              onClick={onUndoLastRating}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCD5C7] bg-[#FCFBF8] text-sm font-medium text-[#1E242B] hover:bg-[#EFECE4] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={onEditSurvey}
            className="px-4 py-2.5 rounded-xl border border-[#DCD5C7] bg-[#FCFBF8] text-sm font-medium text-[#1E242B] hover:bg-[#EFECE4] transition-colors whitespace-nowrap"
          >
            Edit Budget
          </button>
          {ratings.length >= 3 && (
            <button
              type="button"
              onClick={onFinishToSearchKit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E242B] text-white text-sm font-semibold hover:bg-[#334155] transition-colors whitespace-nowrap"
            >
              Build My Search Kit ({likedCount} liked)
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Architectural Plate + Key Facts + Big Pass / Like Buttons */}
        <div className="lg:col-span-7 bg-[#FCFBF8] border border-[#DCD5C7] rounded-2xl p-6 md:p-8">
          <ArchitecturalPlate
            plateId={currentHome.plateId}
            title={`${currentHome.address.neighborhood} ${currentHome.property_details.architectural_style}`}
            subtitle={currentHome.figureCaption}
          />

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1E242B]">
                {currentHome.property_details.architectural_style}
              </h2>
              <p className="text-base text-[#524E49] mt-1">
                {currentHome.address.neighborhood} · {currentHome.address.city}, {currentHome.address.state}{' '}
                {currentHome.address.zip_code}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="font-mono text-2xl md:text-3xl font-semibold text-[#1E242B] tabular-nums">
                {formatCurrency(currentHome.list_price)}
              </div>
              <div className="text-sm text-[#524E49] tabular-nums">
                {currentHome.property_details.property_type} · Built {currentHome.property_details.year_built}
              </div>
            </div>
          </div>

          {/* Clean Unboxed Specs Strip */}
          <div className="mt-5 pt-5 border-t border-[#DCD5C7] grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-[#524E49]">Size</div>
              <div className="font-semibold text-[#1E242B] mt-0.5 tabular-nums">
                {currentHome.property_details.bedrooms} Bd · {bathsLabel} Ba
              </div>
            </div>
            <div>
              <div className="text-[#524E49]">Interior Area</div>
              <div className="font-semibold text-[#1E242B] mt-0.5 font-mono tabular-nums">
                {currentHome.property_details.living_area_sqft.toLocaleString()} sq ft
              </div>
            </div>
            <div>
              <div className="text-[#524E49]">Nearest Metro</div>
              <div className="font-semibold text-[#1E242B] mt-0.5 tabular-nums">
                {currentHome.location_and_transit.distance_to_metro_miles} mi away
              </div>
            </div>
            <div>
              <div className="text-[#524E49]">Parking</div>
              <div className="font-semibold text-[#1E242B] mt-0.5">
                {currentHome.exterior_and_parking.garage_spaces > 0
                  ? `${currentHome.exterior_and_parking.garage_spaces}-Car Garage`
                  : currentHome.exterior_and_parking.parking_type.split('(')[0].trim()}
              </div>
            </div>
          </div>

          <p className="mt-5 text-base text-[#1E242B] leading-relaxed">
            {currentHome.description}
          </p>

          <ul className="mt-4 space-y-1.5 text-sm text-[#524E49]">
            {currentHome.interior_features.highlights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
            <li>
              • Transit: {currentHome.location_and_transit.nearest_metro_station} (Walk Score{' '}
              {currentHome.location_and_transit.walk_score})
            </li>
          </ul>

          {/* Primary Decision Buttons */}
          <div className="mt-8 pt-6 border-t border-[#DCD5C7]">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onRateHome(currentHome.listing_id, 'pass')}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl border-2 border-[#DCD5C7] bg-[#FCFBF8] text-base font-semibold text-[#1E242B] hover:border-[#1E242B] hover:bg-[#EFECE4] transition-colors min-h-[56px]"
              >
                <X className="w-5 h-5" />
                Pass
              </button>
              <button
                type="button"
                onClick={() => onRateHome(currentHome.listing_id, 'like')}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#9E3B26] text-base font-semibold text-white hover:bg-[#822E1C] transition-colors min-h-[56px]"
              >
                <Heart className="w-5 h-5" />
                Like This Home
              </button>
            </div>
            <p className="mt-3 text-center text-sm text-[#524E49]">
              Tip: You can also press your left or right arrow keys to Pass or Like.
            </p>
          </div>
        </div>

        {/* Right Column: Simple Monthly Payment Breakdown + Eligible Assistance */}
        <div className="lg:col-span-5 space-y-6">
          {/* Monthly Payment Card */}
          <div className="bg-[#FCFBF8] border border-[#DCD5C7] rounded-2xl p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-serif text-xl font-semibold text-[#1E242B]">
                Estimated Monthly Cost
              </h3>
              <span className="text-sm font-mono text-[#524E49] tabular-nums">
                {payment.interestRate.toFixed(2)}% est. rate
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-mono text-3xl font-semibold text-[#1E242B] tabular-nums">
                {formatCurrency(payment.totalMonthly)}
                <span className="text-base font-sans font-normal text-[#524E49]"> / mo</span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  isWithinBudget ? 'text-[#1E4D3B]' : 'text-[#9E3B26]'
                }`}
              >
                {isWithinBudget
                  ? `Fits your ${formatCurrency(answers.monthlyBudget)} target`
                  : `${formatCurrency(budgetDiff)} above target`}
              </span>
            </div>

            {/* Simple Down Payment Selector */}
            <div className="mt-5">
              <div className="text-sm font-medium text-[#524E49] mb-2">
                Down payment option ({payment.downPaymentPercent}% · {formatCurrency(payment.downPaymentDollars)})
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#EFECE4] rounded-xl">
                {[
                  { id: 'fha_3_5' as DownPaymentMode, label: '3.5% FHA' },
                  { id: 'conv_5' as DownPaymentMode, label: '5% Down' },
                  { id: 'my_savings' as DownPaymentMode, label: 'My Savings' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDownMode(opt.id)}
                    className={`py-2 px-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      downMode === opt.id
                        ? 'bg-[#FCFBF8] text-[#1E242B] shadow-xs'
                        : 'text-[#524E49] hover:text-[#1E242B]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Tabular Breakdown */}
            <dl className="mt-5 pt-4 border-t border-[#DCD5C7] space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#524E49]">Loan payment (principal &amp; interest)</dt>
                <dd className="font-mono font-medium text-[#1E242B] tabular-nums">
                  {formatCurrency(payment.principalAndInterest)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#524E49]">
                  {payment.taxBundledInFee ? 'Property tax (included in co-op fee)' : 'Estimated property tax'}
                </dt>
                <dd className="font-mono font-medium text-[#1E242B] tabular-nums">
                  {payment.taxBundledInFee ? '$0' : formatCurrency(payment.propertyTax)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#524E49]">Homeowners insurance</dt>
                <dd className="font-mono font-medium text-[#1E242B] tabular-nums">
                  {formatCurrency(payment.homeInsurance)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#524E49]">
                  {currentHome.financials_and_hoa.fee_type || 'HOA / Condo fee'}
                </dt>
                <dd className="font-mono font-medium text-[#1E242B] tabular-nums">
                  {formatCurrency(payment.hoaOrCoopFee)}
                </dd>
              </div>
              {payment.mortgageInsurance > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#524E49]">Mortgage insurance (PMI / MIP)</dt>
                  <dd className="font-mono font-medium text-[#1E242B] tabular-nums">
                    {formatCurrency(payment.mortgageInsurance)}
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-4 pt-4 border-t border-[#DCD5C7] text-sm text-[#524E49]">
              <strong className="text-[#1E242B]">Local buyer note:</strong>{' '}
              {currentHome.financials_and_hoa.first_time_buyer_notes}
            </p>
          </div>

          {/* Matched Assistance Programs for this State */}
          <div className="bg-[#FCFBF8] border border-[#DCD5C7] rounded-2xl p-6">
            <h3 className="font-serif text-xl font-semibold text-[#1E242B]">
              {currentHome.address.state} &amp; HUD Assistance Matches
            </h3>
            <div className="mt-4 space-y-4">
              {statePrograms.map((prog) => (
                <div key={prog.id} className="pt-3 first:pt-0 border-t first:border-t-0 border-[#EFECE4]">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-base font-semibold text-[#1E242B]">{prog.name}</span>
                    <span className="text-sm font-medium text-[#1E4D3B]">{prog.eligibilityStatus}</span>
                  </div>
                  <p className="text-sm font-medium text-[#9E3B26] mt-1">{prog.benefitHeadline}</p>
                  <p className="text-sm text-[#524E49] mt-1">{prog.plainSummary}</p>
                  <a
                    href={prog.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-[#334155] underline underline-offset-4 hover:text-[#9E3B26]"
                  >
                    Official program details
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Learned Taste Signal */}
          <div className="bg-[#EFECE4]/70 border border-[#DCD5C7] rounded-2xl p-5">
            <div className="text-sm font-semibold text-[#1E242B]">
              What we are learning ({likedCount} liked so far)
            </div>
            {likedCount === 0 ? (
              <p className="text-sm text-[#524E49] mt-1">
                Like homes that catch your eye—we will adapt the next homes shown and prepare your Zillow &amp; Redfin keywords.
              </p>
            ) : (
              <p className="text-sm text-[#524E49] mt-1">
                Leaning toward <strong className="text-[#1E242B]">{preferenceSummary.preferredStructureLabel}</strong> ·{' '}
                {preferenceSummary.topTraits.join(' · ')}.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
