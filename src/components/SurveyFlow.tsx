import React, { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, GripVertical } from 'lucide-react';
import { DEFAULT_PRIORITY_RANKING, DMV_AREA_OPTIONS, RANKING_ITEMS } from '../data/dmvData';
import {
  CommuteStyle,
  CreditBand,
  DMVAreaId,
  IncomeBand,
  PriorityTag,
  RankItemId,
  SavingsBand,
  StructurePreference,
  SurveyAnswers,
} from '../types/homebuying';
import { estimatePriceRangeFromSurvey, formatCurrency } from '../utils/homebuyingEngine';

interface SurveyFlowProps {
  answers: SurveyAnswers;
  step: number;
  onChangeStep: (nextStep: number) => void;
  onUpdateAnswers: (patch: Partial<SurveyAnswers>) => void;
  onCompleteSurvey: () => void;
  onFillSample: () => void;
}

const TOTAL_QUESTIONS = 10;

const INCOME_OPTIONS: { value: IncomeBand; label: string; hint: string }[] = [
  { value: 'under_95k', label: 'Under $95,000', hint: 'Often qualifies for top grant tiers (VA DPA Grant, MD MMP, DC HPAP).' },
  { value: '95k_135k', label: '$95,000 – $135,000', hint: 'Within most Northern VA, Maryland MMP, and DC assistance ranges.' },
  { value: '135k_185k', label: '$135,000 – $185,000', hint: 'Often eligible for VA Plus Second Mortgage, MD MMP, and DC Open Doors.' },
  { value: '185k_250k', label: '$185,000 – $250,000', hint: 'Eligible for DC Open Doors and select Maryland/Virginia county limits.' },
  { value: 'over_250k', label: 'Over $250,000', hint: 'Typically uses standard conventional loans without income-capped grants.' },
];

const SAVINGS_OPTIONS: { value: SavingsBand; label: string; hint: string }[] = [
  { value: 'under_15k', label: 'Under $15,000', hint: 'Down payment assistance programs can be a major help here.' },
  { value: '15k_35k', label: '$15,000 – $35,000', hint: 'Often covers a 3.5% FHA or 3%–5% first-time buyer down payment.' },
  { value: '35k_70k', label: '$35,000 – $70,000', hint: 'Comfortable for 5%–10% down plus closing costs on many DMV homes.' },
  { value: '70k_120k', label: '$70,000 – $120,000', hint: 'Strong down payment flexibility including DC co-ops (10%–20% down).' },
  { value: 'over_120k', label: 'Over $120,000', hint: 'Can reach 20% down on many homes to eliminate monthly mortgage insurance.' },
];

const CREDIT_OPTIONS: { value: CreditBand; label: string; hint: string }[] = [
  { value: '580_639', label: '580 – 639', hint: 'Meets HUD/FHA minimum for 3.5% down; housing counseling can boost options.' },
  { value: '640_679', label: '640 – 679', hint: 'Meets typical minimums for Maryland MMP, DC Open Doors, and Virginia Housing.' },
  { value: '680_739', label: '680 – 739', hint: 'Unlocks Virginia Housing Plus extra 1.5% closing cost assistance and better rates.' },
  { value: '740_plus', label: '740 or higher', hint: 'Qualifies for the lowest conventional interest rates and reduced PMI.' },
];

const COMMUTE_OPTIONS: { value: CommuteStyle; label: string; hint: string }[] = [
  { value: 'metro_walkable', label: 'Walk to Metro & daily errands', hint: 'Prioritize neighborhoods within ~0.5 miles of a Metro station.' },
  { value: 'hybrid_metro_parking', label: 'Mix of Metro access and parking', hint: 'Close enough to transit with an off-street space or garage when needed.' },
  { value: 'suburban_driveway', label: 'Driveway, yard & highway access', hint: 'More living space and private parking near I-495, I-66, or Route 50.' },
];

const STRUCTURE_OPTIONS: { value: StructurePreference; label: string; hint: string }[] = [
  { value: 'condo_coop', label: 'Condo or Co-op', hint: 'Lower upkeep and walkable locations, with a monthly building fee.' },
  { value: 'townhouse_rowhouse', label: 'Townhouse or Rowhouse', hint: 'Multi-level living, neighborhood streets, and lower or zero HOA fees.' },
  { value: 'detached_single', label: 'Single-Family Detached House', hint: 'No shared walls, private yard, and driveway or garage parking.' },
  { value: 'open_exploring', label: 'Open to seeing all types', hint: 'Show me a mix across DC, Maryland, and Virginia to see what clicks.' },
];

export const SurveyFlow: React.FC<SurveyFlowProps> = ({
  answers,
  step,
  onChangeStep,
  onUpdateAnswers,
  onCompleteSurvey,
  onFillSample,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const estimatedRange = estimatePriceRangeFromSurvey(answers);

  const currentRanking: RankItemId[] =
    answers.priorityRanking && answers.priorityRanking.length === RANKING_ITEMS.length
      ? answers.priorityRanking
      : DEFAULT_PRIORITY_RANKING;

  const syncRanking = (nextRanking: RankItemId[]) => {
    const derivedPriorities: PriorityTag[] = [];
    nextRanking.slice(0, 3).forEach((id) => {
      if (id === 'historic_brick') derivedPriorities.push('historic_brick');
      if (id === 'private_yard') derivedPriorities.push('private_yard');
      if (id === 'modern_movein') derivedPriorities.push('modern_movein');
      if (id === 'low_no_hoa') derivedPriorities.push('low_no_hoa');
      if (id === 'basement_garage') derivedPriorities.push('basement_income');
    });
    onUpdateAnswers({
      priorityRanking: nextRanking,
      priorities: derivedPriorities.length > 0 ? derivedPriorities : ['historic_brick'],
    });
  };

  const moveRankItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= currentRanking.length || fromIndex === toIndex) return;
    const next = [...currentRanking];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    syncRanking(next);
  };

  const toggleArea = (areaId: DMVAreaId) => {
    const exists = answers.areas.includes(areaId);
    const nextAreas = exists
      ? answers.areas.filter((a) => a !== areaId)
      : [...answers.areas, areaId];
    onUpdateAnswers({ areas: nextAreas });
  };

  const isStepComplete = (): boolean => {
    switch (step) {
      case 1:
        return answers.areas.length > 0;
      case 2:
        return answers.isFirstTimeBuyer !== null;
      case 3:
        return answers.monthlyBudget >= 1800;
      case 4:
        return answers.incomeBand !== null;
      case 5:
        return answers.savingsBand !== null;
      case 6:
        return answers.creditBand !== null;
      case 7:
        return answers.minBedrooms !== null;
      case 8:
        return answers.commuteStyle !== null;
      case 9:
        return answers.structurePreference !== null;
      case 10:
        return currentRanking.length === RANKING_ITEMS.length;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!isStepComplete()) return;
    if (step < TOTAL_QUESTIONS) {
      onChangeStep(step + 1);
    } else {
      onCompleteSurvey();
    }
  };

  const progressPercent = Math.round((step / TOTAL_QUESTIONS) * 100);

  return (
    <section className="max-w-3xl mx-auto px-6 py-10 md:py-14">
      {/* Clean Progress Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[#3E3757] mb-2.5">
          <span className="font-bold text-[#3A2B6D] tabular-nums">
            Question {step} of {TOTAL_QUESTIONS}
          </span>
          <span className="tabular-nums font-medium">
            Estimated home range:{' '}
            <strong className="font-mono font-semibold text-[#196F65]">
              {formatCurrency(estimatedRange.minPrice)} – {formatCurrency(estimatedRange.maxPrice)}
            </strong>
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#EEBC8E]/40 overflow-hidden">
          <div
            className="h-full bg-[#CE4C6D] transition-all duration-200 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Open Canvas Question Stage */}
      <div>
        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
              1. Which DMV areas are you considering?
            </h2>
            <p className="mt-2 text-base text-[#3E3757]">
              Select one or more areas. We use this to match local property taxes, assistance programs, and neighborhood options.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {DMV_AREA_OPTIONS.map((area) => {
                const selected = answers.areas.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => toggleArea(area.id)}
                    aria-pressed={selected}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-colors min-h-[64px] flex items-center justify-between gap-4 ${
                      selected
                        ? 'border-2 border-[#CE4C6D] bg-[#FFFFFF] text-[#1B1633]'
                        : 'border-[#CFC9DB] bg-[#FFFFFF] hover:border-[#3A2B6D]'
                    }`}
                  >
                    <div>
                      <div className="text-base font-bold text-[#1B1633]">{area.label}</div>
                      <div className="text-sm text-[#3E3757] mt-0.5">{area.examples}</div>
                    </div>
                    <span
                      className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                        selected
                          ? 'bg-[#CE4C6D] border-[#CE4C6D] text-white'
                          : 'border-[#8D85A3] bg-white'
                      }`}
                    >
                      {selected && <Check className="w-4 h-4" strokeWidth={2.5} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
              2. Are you a first-time homebuyer?
            </h2>
            <p className="mt-2 text-base text-[#3E3757]">
              HUD, Virginia Housing, and Maryland generally count you as a first-time buyer if you have not owned a primary home in the past 3 years.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3.5">
              {[
                {
                  val: true,
                  title: 'Yes, this is my first home (or first in 3+ years)',
                  desc: 'Opens access to Virginia Housing DPA Grants, Maryland 1st Time Advantage, Maryland transfer tax exemption, and DC HPAP.',
                },
                {
                  val: false,
                  title: 'No, I currently own or owned within the last 3 years',
                  desc: 'You may still qualify for Virginia Housing Plus Second Mortgage, Maryland Flex Loans, or DC Open Doors.',
                },
              ].map((opt) => {
                const selected = answers.isFirstTimeBuyer === opt.val;
                return (
                  <button
                    key={String(opt.val)}
                    type="button"
                    onClick={() => onUpdateAnswers({ isFirstTimeBuyer: opt.val })}
                    className={`w-full text-left px-5 py-5 rounded-xl border transition-colors min-h-[76px] ${
                      selected
                        ? 'border-2 border-[#CE4C6D] bg-[#FFFFFF]'
                        : 'border-[#CFC9DB] bg-[#FFFFFF] hover:border-[#3A2B6D]'
                    }`}
                  >
                    <div className="text-base font-bold text-[#1B1633]">{opt.title}</div>
                    <div className="text-sm text-[#3E3757] mt-1">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
              3. What monthly housing payment feels comfortable?
            </h2>
            <p className="mt-2 text-base text-[#3E3757]">
              Include mortgage, property taxes, homeowners insurance, and any HOA or condo fee.
            </p>

            <div className="mt-6 p-6 md:p-8 rounded-2xl bg-[#FFFFFF] border border-[#CFC9DB]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-base font-semibold text-[#3E3757]">Target total monthly payment</span>
                <span className="font-mono text-3xl md:text-4xl font-semibold text-[#3A2B6D] tabular-nums">
                  {formatCurrency(answers.monthlyBudget)}
                  <span className="text-base font-sans font-medium text-[#3E3757]"> / month</span>
                </span>
              </div>

              <div className="mt-6">
                <input
                  type="range"
                  min={2000}
                  max={5600}
                  step={100}
                  value={answers.monthlyBudget}
                  onChange={(e) => onUpdateAnswers({ monthlyBudget: Number(e.target.value) })}
                  aria-label="Target monthly housing payment"
                  className="w-full folio-slider"
                />
                <div className="flex justify-between text-sm font-mono font-medium text-[#3E3757] mt-2 tabular-nums">
                  <span>$2,000</span>
                  <span>$3,800</span>
                  <span>$5,600</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {[2400, 3000, 3600, 4400].map((preset) => {
                  const active = answers.monthlyBudget === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onUpdateAnswers({ monthlyBudget: preset })}
                      className={`px-4 py-2.5 rounded-lg border text-sm font-mono font-semibold transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-[#3A2B6D] text-white border-[#3A2B6D]'
                          : 'bg-[#FBF8F4] text-[#1B1633] border-[#CFC9DB] hover:border-[#3A2B6D]'
                      }`}
                    >
                      {formatCurrency(preset)}/mo
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-4 text-sm text-[#3E3757]">
              At {formatCurrency(answers.monthlyBudget)}/month, buyers in the DMV typically look at homes around{' '}
              <strong className="font-mono text-[#196F65]">
                {formatCurrency(estimatedRange.minPrice)} – {formatCurrency(estimatedRange.maxPrice)}
              </strong>{' '}
              depending on county taxes and HOA or co-op fees.
            </p>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
              4. What is your approximate annual household income?
            </h2>
            <p className="mt-2 text-base text-[#3E3757]">
              Combined gross income before taxes. State and DC down payment assistance programs use income caps to check eligibility.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              {INCOME_OPTIONS.map((opt) => {
                const selected = answers.incomeBand === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateAnswers({ incomeBand: opt.value })}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-colors min-h-[64px] ${
                      selected
                        ? 'border-2 border-[#CE4C6D] bg-[#FFFFFF]'
                        : 'border-[#CFC9DB] bg-[#FFFFFF] hover:border-[#3A2B6D]'
                    }`}
                  >
                    <div className="text-base font-bold text-[#1B1633]">{opt.label}</div>
                    <div className="text-sm text-[#3E3757] mt-0.5">{opt.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
              5. How much do you have saved for upfront costs?
            </h2>
            <p className="mt-2 text-base text-[#3E3757]">
              Include cash for your down payment and closing costs (typically 2%–4% of the home price in the DMV).
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              {SAVINGS_OPTIONS.map((opt) => {
                const selected = answers.savingsBand === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateAnswers({ savingsBand: opt.value })}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-colors min-h-[64px] ${
                      selected
                        ? 'border-2 border-[#CE4C6D] bg-[#FFFFFF]'
                        : 'border-[#CFC9DB] bg-[#FFFFFF] hover:border-[#3A2B6D]'
                    }`}
                  >
                    <div className="text-base font-bold text-[#1B1633]">{opt.label}</div>
                    <div className="text-sm text-[#3E3757] mt-0.5">{opt.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
              6. Which credit score range fits you best?
            </h2>
            <p className="mt-2 text-base text-[#3E3757]">
              A rough estimate is completely fine—it helps estimate your interest rate and match state assistance rules.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              {CREDIT_OPTIONS.map((opt) => {
                const selected = answers.creditBand === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateAnswers({ creditBand: opt.value })}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-colors min-h-[64px] ${
                      selected
                        ? 'border-2 border-[#CE4C6D] bg-[#FFFFFF]'
                        : 'border-[#CFC9DB] bg-[#FFFFFF] hover:border-[#3A2B6D]'
                    }`}
                  >
                    <div className="text-base font-bold text-[#1B1633] font-mono">{opt.label}</div>
                    <div className="text-sm text-[#3E3757] mt-0.5">{opt.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
              7. How many bedrooms do you need?
            </h2>
            <p className="mt-2 text-base text-[#3E3757]">
              Think about home office space, roommates, or family plans over the next 3–5 years.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3.5">
              {[
                { beds: 1, label: '1 Bedroom', note: 'Urban condo or co-op' },
                { beds: 2, label: '2 Bedrooms', note: 'Roommate or office space' },
                { beds: 3, label: '3 Bedrooms', note: 'Townhome or rambler' },
                { beds: 4, label: '4+ Bedrooms', note: 'Larger detached home' },
              ].map((opt) => {
                const selected = answers.minBedrooms === opt.beds;
                return (
                  <button
                    key={opt.beds}
                    type="button"
                    onClick={() => onUpdateAnswers({ minBedrooms: opt.beds })}
                    className={`text-left px-5 py-5 rounded-xl border transition-colors min-h-[84px] ${
                      selected
                        ? 'border-2 border-[#CE4C6D] bg-[#FFFFFF]'
                        : 'border-[#CFC9DB] bg-[#FFFFFF] hover:border-[#3A2B6D]'
                    }`}
                  >
                    <div className="text-lg font-bold text-[#1B1633]">{opt.label}</div>
                    <div className="text-sm text-[#3E3757] mt-1">{opt.note}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 8 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
              8. How do you prefer to get around the DMV?
            </h2>
            <p className="mt-2 text-base text-[#3E3757]">
              Metro proximity is one of the biggest price trade-offs in DC, Maryland, and Northern Virginia.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              {COMMUTE_OPTIONS.map((opt) => {
                const selected = answers.commuteStyle === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateAnswers({ commuteStyle: opt.value })}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-colors min-h-[68px] ${
                      selected
                        ? 'border-2 border-[#CE4C6D] bg-[#FFFFFF]'
                        : 'border-[#CFC9DB] bg-[#FFFFFF] hover:border-[#3A2B6D]'
                    }`}
                  >
                    <div className="text-base font-bold text-[#1B1633]">{opt.label}</div>
                    <div className="text-sm text-[#3E3757] mt-0.5">{opt.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 9 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
              9. Which home type feels closest to your lifestyle?
            </h2>
            <p className="mt-2 text-base text-[#3E3757]">
              You will still get to compare visuals and rate different styles in the next step.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              {STRUCTURE_OPTIONS.map((opt) => {
                const selected = answers.structurePreference === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateAnswers({ structurePreference: opt.value })}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-colors min-h-[68px] ${
                      selected
                        ? 'border-2 border-[#CE4C6D] bg-[#FFFFFF]'
                        : 'border-[#CFC9DB] bg-[#FFFFFF] hover:border-[#3A2B6D]'
                    }`}
                  >
                    <div className="text-base font-bold text-[#1B1633]">{opt.label}</div>
                    <div className="text-sm text-[#3E3757] mt-0.5">{opt.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 10 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#3A2B6D]">
              10. Rank what matters most to you in a home.
            </h2>
            <p className="mt-2 text-base text-[#3E3757]">
              Order these location, home characteristic, and feature priorities from #1 (most important) to #6 (least important). Drag rows or use the arrows.
            </p>

            <div className="mt-5 flex items-center justify-between text-sm font-bold text-[#196F65]">
              <span>Most important (#1)</span>
              <span className="text-[#3E3757] font-medium">Drag or tap arrows to reorder</span>
            </div>

            <ol className="mt-3 space-y-2.5">
              {currentRanking.map((rankId, index) => {
                const item = RANKING_ITEMS.find((r) => r.id === rankId);
                if (!item) return null;
                const isTop = index === 0;
                const isDragging = draggedIndex === index;

                return (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggedIndex(index)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedIndex !== null && draggedIndex !== index) {
                        moveRankItem(draggedIndex, index);
                        setDraggedIndex(index);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDraggedIndex(null);
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl border bg-[#FFFFFF] transition-colors cursor-grab active:cursor-grabbing ${
                      isDragging
                        ? 'border-2 border-[#CE4C6D] opacity-85'
                        : isTop
                          ? 'border-2 border-[#CE4C6D]'
                          : 'border-[#CFC9DB] hover:border-[#3A2B6D]'
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-[#6F678A] shrink-0" aria-hidden="true" />

                    <span
                      className={`w-9 h-9 rounded-lg font-mono text-sm font-bold flex items-center justify-center shrink-0 tabular-nums ${
                        isTop
                          ? 'bg-[#CE4C6D] text-white'
                          : index < 3
                            ? 'bg-[#3A2B6D] text-white'
                            : 'bg-[#F4EDE4] text-[#3A2B6D]'
                      }`}
                    >
                      #{index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#196F65]">{item.category}</div>
                      <div className="text-base font-bold text-[#1B1633] leading-snug">
                        {item.label}
                      </div>
                      <div className="text-sm text-[#3E3757] mt-0.5">{item.description}</div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveRankItem(index, index - 1)}
                        aria-label={`Move ${item.label} up`}
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                          index === 0
                            ? 'border-[#E6E0EE] text-[#B5AEC7] cursor-not-allowed'
                            : 'border-[#CFC9DB] text-[#3A2B6D] hover:border-[#3A2B6D] hover:bg-[#FBF8F4]'
                        }`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === currentRanking.length - 1}
                        onClick={() => moveRankItem(index, index + 1)}
                        aria-label={`Move ${item.label} down`}
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                          index === currentRanking.length - 1
                            ? 'border-[#E6E0EE] text-[#B5AEC7] cursor-not-allowed'
                            : 'border-[#CFC9DB] text-[#3A2B6D] hover:border-[#3A2B6D] hover:bg-[#FBF8F4]'
                        }`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-2.5 text-sm font-semibold text-[#3E3757]">
              Least important (#{currentRanking.length})
            </div>
          </div>
        )}

        {/* Clear Bottom Navigation Row */}
        <div className="mt-10 pt-6 border-t border-[#CFC9DB] flex flex-wrap items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => onChangeStep(step - 1)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#3A2B6D]/35 bg-[#FFFFFF] text-base font-semibold text-[#3A2B6D] hover:border-[#3A2B6D] transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onFillSample}
              className="text-sm font-semibold text-[#217D8E] underline underline-offset-4 hover:text-[#3A2B6D] transition-colors py-2"
            >
              Try with sample DMV buyer profile
            </button>
          )}

          <button
            type="button"
            disabled={!isStepComplete()}
            onClick={handleNext}
            className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold transition-colors whitespace-nowrap ${
              isStepComplete()
                ? 'bg-[#CE4C6D] text-white hover:bg-[#B03656]'
                : 'bg-[#DCD6E6] text-[#3E3757] cursor-not-allowed'
            }`}
          >
            {step < TOTAL_QUESTIONS ? 'Next Question' : 'Explore Homes in My Range'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
