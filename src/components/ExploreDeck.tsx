import React, { useEffect, useState } from 'react';
import { ArrowRight, Heart, RotateCcw, X } from 'lucide-react';
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
        <p className="text-sm font-semibold text-[#196F65] mb-2">
          Deck Complete · {likedCount} of {ratings.length} homes liked
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[#3A2B6D]">
          Your custom homebuyer profile is ready.
        </h1>
        <p className="mt-3 text-base text-[#3E3757] max-w-xl mx-auto">
          We have turned your survey answers, priority rankings, and liked homes into a personalized homebuyer profile plus custom Zillow and Redfin search links.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={onFinishToSearchKit}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#CE4C6D] text-white text-base font-bold hover:bg-[#B03656] transition-colors whitespace-nowrap"
          >
            See My Profile &amp; Search Kit
            <ArrowRight className="w-4 h-4" />
          </button>
          {ratings.length > 0 && (
            <button
              type="button"
              onClick={onUndoLastRating}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#3A2B6D]/35 bg-[#FFFFFF] text-base font-semibold text-[#3A2B6D] hover:border-[#3A2B6D] transition-colors whitespace-nowrap"
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

  const bathsLabel =
    currentHome.property_details.bathrooms_half > 0
      ? `${currentHome.property_details.bathrooms_full}.${currentHome.property_details.bathrooms_half}`
      : `${currentHome.property_details.bathrooms_full}`;

  return (
    <section className="max-w-6xl mx-auto px-6 py-8 md:py-10">
      {/* Clean Top Status Line */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#CFC9DB]">
        <div>
          <p className="text-sm font-semibold text-[#196F65]">
            Home {ratings.length + 1} of {homes.length} · {currentEntry.matchReason}
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D] mt-1">
            Like or pass homes in your DMV range
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {ratings.length > 0 && (
            <button
              type="button"
              onClick={onUndoLastRating}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#3A2B6D]/35 bg-[#FFFFFF] text-sm font-semibold text-[#3A2B6D] hover:border-[#3A2B6D] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={onEditSurvey}
            className="px-4 py-2.5 rounded-xl border border-[#3A2B6D]/35 bg-[#FFFFFF] text-sm font-semibold text-[#3A2B6D] hover:border-[#3A2B6D] transition-colors whitespace-nowrap"
          >
            Edit Budget
          </button>
          {ratings.length >= 3 && (
            <button
              type="button"
              onClick={onFinishToSearchKit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3A2B6D] text-white text-sm font-bold hover:bg-[#2A1E52] transition-colors whitespace-nowrap"
            >
              See My Profile &amp; Kit ({likedCount} liked)
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Stage — Open Canvas Left + One Focused Summary Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Open editorial showcase directly on canvas */}
        <div className="lg:col-span-7">
          <ArchitecturalPlate
            plateId={currentHome.plateId}
            title={`${currentHome.address.neighborhood} ${currentHome.property_details.architectural_style}`}
            subtitle={currentHome.figureCaption}
          />

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
                {currentHome.property_details.architectural_style}
              </h2>
              <p className="text-base font-medium text-[#3E3757] mt-1">
                {currentHome.address.neighborhood} · {currentHome.address.city}, {currentHome.address.state}{' '}
                {currentHome.address.zip_code}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="font-mono text-2xl md:text-3xl font-semibold text-[#1B1633] tabular-nums">
                {formatCurrency(currentHome.list_price)}
              </div>
              <div className="text-sm font-medium text-[#3E3757] tabular-nums">
                {currentHome.property_details.property_type} · Built {currentHome.property_details.year_built}
              </div>
            </div>
          </div>

          {/* Clean Unboxed Specs Strip */}
          <div className="mt-5 pt-5 border-t border-[#CFC9DB] grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-[#3E3757] font-medium">Size</div>
              <div className="font-bold text-[#1B1633] mt-0.5 tabular-nums">
                {currentHome.property_details.bedrooms} Bd · {bathsLabel} Ba
              </div>
            </div>
            <div>
              <div className="text-[#3E3757] font-medium">Interior Area</div>
              <div className="font-bold text-[#1B1633] mt-0.5 font-mono tabular-nums">
                {currentHome.property_details.living_area_sqft.toLocaleString()} sq ft
              </div>
            </div>
            <div>
              <div className="text-[#3E3757] font-medium">Nearest Metro</div>
              <div className="font-bold text-[#1B1633] mt-0.5 tabular-nums">
                {currentHome.location_and_transit.distance_to_metro_miles} mi away
              </div>
            </div>
            <div>
              <div className="text-[#3E3757] font-medium">Parking</div>
              <div className="font-bold text-[#1B1633] mt-0.5">
                {currentHome.exterior_and_parking.garage_spaces > 0
                  ? `${currentHome.exterior_and_parking.garage_spaces}-Car Garage`
                  : currentHome.exterior_and_parking.parking_type.split('(')[0].trim()}
              </div>
            </div>
          </div>

          <p className="mt-5 text-base text-[#1B1633] leading-relaxed">
            {currentHome.description}
          </p>

          <ul className="mt-4 space-y-1.5 text-sm font-medium text-[#3E3757]">
            {currentHome.interior_features.highlights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
            <li>
              • Transit: {currentHome.location_and_transit.nearest_metro_station} (Walk Score{' '}
              {currentHome.location_and_transit.walk_score})
            </li>
          </ul>

          {/* Primary Decision Buttons */}
          <div className="mt-8 pt-6 border-t border-[#CFC9DB]">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onRateHome(currentHome.listing_id, 'pass')}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl border-2 border-[#3A2B6D] bg-[#FFFFFF] text-base font-bold text-[#3A2B6D] hover:bg-[#3A2B6D]/[0.06] transition-colors min-h-[56px]"
              >
                <X className="w-5 h-5" />
                Pass
              </button>
              <button
                type="button"
                onClick={() => onRateHome(currentHome.listing_id, 'like')}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#CE4C6D] text-base font-bold text-white hover:bg-[#B03656] transition-colors min-h-[56px]"
              >
                <Heart className="w-5 h-5" />
                Like This Home
              </button>
            </div>
            <p className="mt-3 text-center text-sm font-medium text-[#3E3757]">
              Tip: You can also press your left or right arrow keys to Pass or Like.
            </p>
          </div>
        </div>

        {/* Right Column: Single purposeful Monthly Cost card + open editorial sections below */}
        <div className="lg:col-span-5">
          <div className="bg-[#FFFFFF] border border-[#CFC9DB] rounded-2xl p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-[#3A2B6D]">
                Estimated Monthly Cost
              </h3>
              <span className="text-sm font-mono font-medium text-[#3E3757] tabular-nums">
                {payment.interestRate.toFixed(2)}% est. rate
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-mono text-3xl font-bold text-[#1B1633] tabular-nums">
                {formatCurrency(payment.totalMonthly)}
                <span className="text-base font-sans font-medium text-[#3E3757]"> / mo</span>
              </div>
              <span
                className={`text-sm font-bold ${
                  isWithinBudget ? 'text-[#196F65]' : 'text-[#B03656]'
                }`}
              >
                {isWithinBudget
                  ? `Fits your ${formatCurrency(answers.monthlyBudget)} target`
                  : `${formatCurrency(budgetDiff)} above target`}
              </span>
            </div>

            {/* Clean Down Payment Segmented Buttons */}
            <div className="mt-5">
              <div className="text-sm font-semibold text-[#3E3757] mb-2">
                Down payment ({payment.downPaymentPercent}% · {formatCurrency(payment.downPaymentDollars)})
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'fha_3_5' as DownPaymentMode, label: '3.5% FHA' },
                  { id: 'conv_5' as DownPaymentMode, label: '5% Down' },
                  { id: 'my_savings' as DownPaymentMode, label: 'My Savings' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDownMode(opt.id)}
                    className={`py-2 px-2 rounded-lg border text-sm font-semibold transition-colors whitespace-nowrap ${
                      downMode === opt.id
                        ? 'bg-[#3A2B6D] text-white border-[#3A2B6D]'
                        : 'bg-[#FBF8F4] text-[#1B1633] border-[#CFC9DB] hover:border-[#3A2B6D]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabular Breakdown */}
            <dl className="mt-5 pt-4 border-t border-[#E0DAE8] space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#3E3757] font-medium">Loan payment (principal &amp; interest)</dt>
                <dd className="font-mono font-semibold text-[#1B1633] tabular-nums">
                  {formatCurrency(payment.principalAndInterest)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#3E3757] font-medium">
                  {payment.taxBundledInFee ? 'Property tax (included in co-op fee)' : 'Estimated property tax'}
                </dt>
                <dd className="font-mono font-semibold text-[#1B1633] tabular-nums">
                  {payment.taxBundledInFee ? '$0' : formatCurrency(payment.propertyTax)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#3E3757] font-medium">Homeowners insurance</dt>
                <dd className="font-mono font-semibold text-[#1B1633] tabular-nums">
                  {formatCurrency(payment.homeInsurance)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#3E3757] font-medium">
                  {currentHome.financials_and_hoa.fee_type || 'HOA / Condo fee'}
                </dt>
                <dd className="font-mono font-semibold text-[#1B1633] tabular-nums">
                  {formatCurrency(payment.hoaOrCoopFee)}
                </dd>
              </div>
              {payment.mortgageInsurance > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#3E3757] font-medium">Mortgage insurance (PMI / MIP)</dt>
                  <dd className="font-mono font-semibold text-[#1B1633] tabular-nums">
                    {formatCurrency(payment.mortgageInsurance)}
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-4 pt-4 border-t border-[#E0DAE8] text-sm text-[#3E3757]">
              <strong className="text-[#3A2B6D]">Local buyer note:</strong>{' '}
              {currentHome.financials_and_hoa.first_time_buyer_notes}
            </p>
          </div>

          {/* Open Editorial Section: What We're Learning */}
          <div className="mt-8 pt-6 border-t border-[#CFC9DB]">
            <div className="text-sm font-bold text-[#3A2B6D]">
              What we are learning ({likedCount} liked so far)
            </div>
            {likedCount === 0 ? (
              <p className="text-sm text-[#3E3757] mt-1">
                Like homes that catch your eye—we will adapt the next homes shown and prepare your Zillow &amp; Redfin keywords.
              </p>
            ) : (
              <p className="text-sm text-[#3E3757] mt-1">
                Leaning toward <strong className="text-[#1B1633]">{preferenceSummary.preferredStructureLabel}</strong> ·{' '}
                {preferenceSummary.topTraits.join(' · ')}.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
