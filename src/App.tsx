import { useEffect, useState } from 'react';
import { Check, Home } from 'lucide-react';
import { DMVGuidesView } from './components/DMVGuidesView';
import { ExploreDeck } from './components/ExploreDeck';
import { SearchKitView } from './components/SearchKitView';
import { SurveyFlow } from './components/SurveyFlow';
import { WelcomeView } from './components/WelcomeView';
import { DEFAULT_SURVEY_ANSWERS, loadDMVHomeBank } from './data/dmvData';
import { AppView, HomeCandidate, HomeRating, SurveyAnswers } from './types/homebuying';

const STORAGE_KEY = 'potomac_folio_state_v2';

interface PathStepMeta {
  id: AppView;
  stepNum: number;
  label: string;
  activeBg: string;
  activeBorder: string;
  completedBg: string;
  completedBorder: string;
  completedText: string;
  badgeFill: string;
  dotFill: string;
}

const PATH_STEPS: PathStepMeta[] = [
  {
    id: 'survey',
    stepNum: 1,
    label: 'First Step',
    activeBg: 'bg-[#CE4C6D]',
    activeBorder: 'border-[#CE4C6D]',
    completedBg: 'bg-[#CE4C6D]/14',
    completedBorder: 'border-[#CE4C6D]/55',
    completedText: 'text-[#9F2D4B]',
    badgeFill: 'bg-[#CE4C6D]',
    dotFill: 'bg-[#CE4C6D]',
  },
  {
    id: 'explore',
    stepNum: 2,
    label: 'Explore Options',
    activeBg: 'bg-[#217D8E]',
    activeBorder: 'border-[#217D8E]',
    completedBg: 'bg-[#31A0B3]/16',
    completedBorder: 'border-[#31A0B3]/60',
    completedText: 'text-[#186473]',
    badgeFill: 'bg-[#31A0B3]',
    dotFill: 'bg-[#31A0B3]',
  },
  {
    id: 'search-kit',
    stepNum: 3,
    label: 'Start Searching',
    activeBg: 'bg-[#196F65]',
    activeBorder: 'border-[#196F65]',
    completedBg: 'bg-[#269789]/15',
    completedBorder: 'border-[#269789]/55',
    completedText: 'text-[#155E56]',
    badgeFill: 'bg-[#269789]',
    dotFill: 'bg-[#269789]',
  },
  {
    id: 'guides',
    stepNum: 4,
    label: 'Guides & Tips',
    activeBg: 'bg-[#3A2B6D]',
    activeBorder: 'border-[#3A2B6D]',
    completedBg: 'bg-[#3A2B6D]/12',
    completedBorder: 'border-[#3A2B6D]/45',
    completedText: 'text-[#3A2B6D]',
    badgeFill: 'bg-[#3A2B6D]',
    dotFill: 'bg-[#3A2B6D]',
  },
];

interface SavedState {
  answers: SurveyAnswers;
  step: number;
  hasCompletedSurvey: boolean;
  hasVisitedSearchKit?: boolean;
  hasVisitedGuides?: boolean;
  ratings: HomeRating[];
  view: AppView;
}

function loadSavedState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedState;
  } catch {
    return null;
  }
}

export default function App() {
  const initial = loadSavedState();

  const [homes, setHomes] = useState<HomeCandidate[]>([]);
  const [loadingHomes, setLoadingHomes] = useState(true);
  const [answers, setAnswers] = useState<SurveyAnswers>({
    ...DEFAULT_SURVEY_ANSWERS,
    ...(initial?.answers || {}),
  });
  const [surveyStep, setSurveyStep] = useState<number>(initial?.step || 1);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean>(
    initial?.hasCompletedSurvey || false
  );
  const [hasVisitedSearchKit, setHasVisitedSearchKit] = useState<boolean>(
    initial?.hasVisitedSearchKit || false
  );
  const [hasVisitedGuides, setHasVisitedGuides] = useState<boolean>(
    initial?.hasVisitedGuides || false
  );
  const [ratings, setRatings] = useState<HomeRating[]>(initial?.ratings || []);
  const [view, setView] = useState<AppView>(initial?.view || 'welcome');

  useEffect(() => {
    let active = true;
    loadDMVHomeBank()
      .then((loaded) => {
        if (active) {
          setHomes(loaded);
          setLoadingHomes(false);
        }
      })
      .catch(() => {
        if (active) setLoadingHomes(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      const payload: SavedState = {
        answers,
        step: surveyStep,
        hasCompletedSurvey,
        hasVisitedSearchKit,
        hasVisitedGuides,
        ratings,
        view,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [answers, surveyStep, hasCompletedSurvey, hasVisitedSearchKit, hasVisitedGuides, ratings, view]);

  const handleUpdateAnswers = (patch: Partial<SurveyAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
  };

  const handleCompleteSurvey = () => {
    setHasCompletedSurvey(true);
    setView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFillSample = () => {
    setAnswers({
      areas: ['dc', 'montgomery_md', 'arlington_alexandria_va'],
      isFirstTimeBuyer: true,
      monthlyBudget: 3500,
      incomeBand: '135k_185k',
      savingsBand: '35k_70k',
      creditBand: '680_739',
      minBedrooms: 3,
      commuteStyle: 'hybrid_metro_parking',
      structurePreference: 'open_exploring',
      priorities: ['historic_brick', 'low_no_hoa', 'private_yard'],
      priorityRanking: [
        'historic_brick',
        'walkable_metro',
        'low_no_hoa',
        'private_yard',
        'basement_garage',
        'modern_movein',
      ],
    });
    setSurveyStep(10);
    setHasCompletedSurvey(true);
    setView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRateHome = (listingId: string, decision: 'like' | 'pass') => {
    setRatings((prev) => {
      const filtered = prev.filter((r) => r.listingId !== listingId);
      return [...filtered, { listingId, decision, timestamp: Date.now() }];
    });
  };

  const handleUndoLastRating = () => {
    setRatings((prev) => prev.slice(0, -1));
  };

  const handleResetAll = () => {
    setAnswers(DEFAULT_SURVEY_ANSWERS);
    setSurveyStep(1);
    setHasCompletedSurvey(false);
    setHasVisitedSearchKit(false);
    setHasVisitedGuides(false);
    setRatings([]);
    setView('welcome');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (nextView: AppView) => {
    if (nextView === 'search-kit') setHasVisitedSearchKit(true);
    if (nextView === 'guides') setHasVisitedGuides(true);
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStepCompleted = (stepId: AppView): boolean => {
    if (stepId === 'survey') return hasCompletedSurvey;
    if (stepId === 'explore') {
      return ratings.length >= 3 || (ratings.length >= 1 && (view === 'search-kit' || view === 'guides' || hasVisitedSearchKit));
    }
    if (stepId === 'search-kit') return hasVisitedSearchKit && view !== 'search-kit';
    if (stepId === 'guides') return hasVisitedGuides && view !== 'guides';
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F4] text-[#1B1633]">
      {/* Header with Brand + Cute Bubbly Completion Path */}
      <header className="border-b border-[#CFC9DB] bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Title */}
          <button
            type="button"
            onClick={() => navigateTo('welcome')}
            className="inline-flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0"
          >
            <span className="w-9 h-9 rounded-full bg-[#CE4C6D]/14 border border-[#CE4C6D]/35 text-[#CE4C6D] flex items-center justify-center group-hover:bg-[#CE4C6D] group-hover:text-white transition-colors">
              <Home className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#3A2B6D] group-hover:text-[#CE4C6D] transition-colors">
              Your Home Buying Adventure
            </span>
          </button>

          {/* Start Over Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2 rounded-full border border-[#3A2B6D]/30 bg-[#FBF8F4] text-sm font-semibold text-[#3A2B6D] hover:bg-[#EEBC8E]/30 hover:border-[#3A2B6D] transition-colors whitespace-nowrap shrink-0"
            >
              Start Over
            </button>
          </div>
        </div>

        {/* Cute Bubbly Journey Path that colors in with completion */}
        <nav
          aria-label="Homebuying adventure path"
          className="border-t border-[#EAE4F2] bg-[#FBF8F4]/80 px-6 py-3 overflow-x-auto"
        >
          <ol className="max-w-5xl mx-auto flex items-center justify-start md:justify-center gap-2 sm:gap-3 min-w-max">
            {PATH_STEPS.map((step, idx) => {
              const isActive = view === step.id;
              const completed = isStepCompleted(step.id);
              const nextStep = PATH_STEPS[idx + 1];
              const nextReached =
                nextStep && (view === nextStep.id || isStepCompleted(nextStep.id));
              const trailColored = completed || (isActive && idx === 0 && surveyStep > 1);
              const dot1Filled = trailColored || isActive;
              const dot2Filled = completed;
              const dot3Filled = completed && Boolean(nextReached);

              return (
                <li key={step.id} className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => navigateTo(step.id)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`group inline-flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full border-2 text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isActive
                        ? `${step.activeBg} ${step.activeBorder} text-white ring-4 ring-[#EEBC8E]/70 shadow-sm`
                        : completed
                          ? `${step.completedBg} ${step.completedBorder} ${step.completedText} hover:scale-[1.02]`
                          : 'bg-[#FFFFFF] border-[#D8D1E6] text-[#3E3757] hover:border-[#3A2B6D] hover:text-[#3A2B6D]'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors shrink-0 ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : completed
                            ? `${step.badgeFill} text-white`
                            : 'bg-[#F3EFF8] text-[#3A2B6D] group-hover:bg-[#EEBC8E]/40'
                      }`}
                    >
                      {completed ? (
                        <Check className="w-4 h-4 stroke-[2.75]" aria-hidden="true" />
                      ) : (
                        step.stepNum
                      )}
                    </span>
                    <span>{step.label}</span>
                  </button>

                  {/* Bubbly stepping-stone dots connecting each bubble */}
                  {idx < PATH_STEPS.length - 1 && (
                    <span
                      className="flex items-center gap-1.5 px-0.5"
                      aria-hidden="true"
                    >
                      <span
                        className={`w-2 h-2 rounded-full transition-colors duration-300 translate-y-0.5 ${
                          dot1Filled ? step.dotFill : 'bg-[#D8D1E6]'
                        }`}
                      />
                      <span
                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 -translate-y-0.5 ${
                          dot2Filled ? step.dotFill : dot1Filled ? 'bg-[#EEBC8E]' : 'bg-[#D8D1E6]'
                        }`}
                      />
                      <span
                        className={`w-2 h-2 rounded-full transition-colors duration-300 translate-y-0.5 ${
                          dot3Filled
                            ? nextStep.dotFill
                            : dot2Filled
                              ? step.dotFill
                              : 'bg-[#D8D1E6]'
                        }`}
                      />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {loadingHomes && view !== 'welcome' && view !== 'survey' && view !== 'guides' ? (
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <p className="text-base font-medium text-[#3E3757]">Loading DMV home examples...</p>
          </div>
        ) : (
          <>
            {view === 'welcome' && (
              <WelcomeView onBegin={() => navigateTo('survey')} />
            )}

            {view === 'survey' && (
              <SurveyFlow
                answers={answers}
                step={surveyStep}
                onChangeStep={(next) => {
                  setSurveyStep(next);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onUpdateAnswers={handleUpdateAnswers}
                onCompleteSurvey={handleCompleteSurvey}
                onFillSample={handleFillSample}
              />
            )}

            {view === 'explore' && (
              <ExploreDeck
                homes={homes}
                answers={answers}
                ratings={ratings}
                onRateHome={handleRateHome}
                onUndoLastRating={handleUndoLastRating}
                onFinishToSearchKit={() => navigateTo('search-kit')}
                onEditSurvey={() => {
                  setSurveyStep(3);
                  navigateTo('survey');
                }}
              />
            )}

            {view === 'search-kit' && (
              <SearchKitView
                homes={homes}
                answers={answers}
                ratings={ratings}
                onBackToDeck={() => navigateTo('explore')}
                onEditSurvey={() => {
                  setSurveyStep(1);
                  navigateTo('survey');
                }}
              />
            )}

            {view === 'guides' && (
              <DMVGuidesView
                hasCompletedSurvey={hasCompletedSurvey}
                onReturnToFlow={() => navigateTo(hasCompletedSurvey ? 'explore' : 'survey')}
              />
            )}
          </>
        )}
      </main>

      {/* Quiet Editorial Footer with Official Sources */}
      <footer className="border-t border-[#CFC9DB] bg-[#FFFFFF] mt-14">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-sm text-[#3E3757]">
          <span>Your Home Buying Adventure · Estimates for educational planning only</span>
          <div className="flex flex-wrap items-center gap-5 font-semibold">
            <a
              href="https://www.virginiahousing.com/homebuyers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3A2B6D] hover:text-[#CE4C6D] underline underline-offset-4"
            >
              Virginia Housing
            </a>
            <a
              href="https://www.marylandhomeownership.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3A2B6D] hover:text-[#CE4C6D] underline underline-offset-4"
            >
              Maryland Homeownership
            </a>
            <a
              href="https://www.hud.gov/helping-americans/buying-a-home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3A2B6D] hover:text-[#CE4C6D] underline underline-offset-4"
            >
              HUD Buying a Home
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
