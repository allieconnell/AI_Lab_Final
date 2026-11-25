import { useEffect, useState } from 'react';
import { DMVGuidesView } from './components/DMVGuidesView';
import { ExploreDeck } from './components/ExploreDeck';
import { SearchKitView } from './components/SearchKitView';
import { SurveyFlow } from './components/SurveyFlow';
import { DEFAULT_SURVEY_ANSWERS, loadDMVHomeBank } from './data/dmvData';
import { AppView, HomeCandidate, HomeRating, SurveyAnswers } from './types/homebuying';

const STORAGE_KEY = 'potomac_folio_state_v1';

interface SavedState {
  answers: SurveyAnswers;
  step: number;
  hasCompletedSurvey: boolean;
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
  const [answers, setAnswers] = useState<SurveyAnswers>(initial?.answers || DEFAULT_SURVEY_ANSWERS);
  const [surveyStep, setSurveyStep] = useState<number>(initial?.step || 1);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState<boolean>(
    initial?.hasCompletedSurvey || false
  );
  const [ratings, setRatings] = useState<HomeRating[]>(initial?.ratings || []);
  const [view, setView] = useState<AppView>(initial?.view || 'survey');

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
        ratings,
        view,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [answers, surveyStep, hasCompletedSurvey, ratings, view]);

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
    setRatings([]);
    setView('survey');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (nextView: AppView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EE] text-[#1E242B]">
      {/* Strict 3-Zone Top Bar */}
      <header className="border-b border-[#DCD5C7] bg-[#FCFBF8]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element brand wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('survey')}
            className="font-serif text-xl md:text-2xl font-semibold tracking-tight text-[#1E242B] whitespace-nowrap shrink-0"
          >
            Potomac Folio
          </button>

          {/* Zone 2: 4 concise single-line navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#524E49]"
          >
            <button
              type="button"
              onClick={() => navigateTo('survey')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                view === 'survey'
                  ? 'border-[#9E3B26] text-[#1E242B] font-semibold'
                  : 'border-transparent hover:text-[#1E242B]'
              }`}
            >
              Survey
            </button>
            <button
              type="button"
              onClick={() => navigateTo('explore')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                view === 'explore'
                  ? 'border-[#9E3B26] text-[#1E242B] font-semibold'
                  : 'border-transparent hover:text-[#1E242B]'
              }`}
            >
              Explore Homes
            </button>
            <button
              type="button"
              onClick={() => navigateTo('search-kit')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                view === 'search-kit'
                  ? 'border-[#9E3B26] text-[#1E242B] font-semibold'
                  : 'border-transparent hover:text-[#1E242B]'
              }`}
            >
              Search Kit
            </button>
            <button
              type="button"
              onClick={() => navigateTo('guides')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                view === 'guides'
                  ? 'border-[#9E3B26] text-[#1E242B] font-semibold'
                  : 'border-transparent hover:text-[#1E242B]'
              }`}
            >
              DMV Guides
            </button>
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2 rounded-lg border border-[#DCD5C7] bg-[#F7F4EE] text-sm font-semibold text-[#1E242B] hover:bg-[#EFECE4] transition-colors whitespace-nowrap shrink-0"
            >
              Start Over
            </button>
          </div>
        </div>

        {/* Simple mobile step links */}
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#EFECE4] px-6 py-2.5 flex items-center gap-5 overflow-x-auto text-sm font-medium text-[#524E49]"
        >
          {(
            [
              { id: 'survey', label: 'Survey' },
              { id: 'explore', label: 'Explore Homes' },
              { id: 'search-kit', label: 'Search Kit' },
              { id: 'guides', label: 'DMV Guides' },
            ] as { id: AppView; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 ${
                view === item.id
                  ? 'border-[#9E3B26] text-[#1E242B] font-semibold'
                  : 'border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {loadingHomes && view !== 'survey' && view !== 'guides' ? (
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <p className="text-base text-[#524E49]">Loading DMV home examples...</p>
          </div>
        ) : (
          <>
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
      <footer className="border-t border-[#DCD5C7] bg-[#FCFBF8] mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-sm text-[#524E49]">
          <span>Potomac Folio · Estimates for educational planning only</span>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://www.virginiahousing.com/homebuyers"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1E242B] underline underline-offset-4"
            >
              Virginia Housing
            </a>
            <a
              href="https://www.marylandhomeownership.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1E242B] underline underline-offset-4"
            >
              Maryland Homeownership
            </a>
            <a
              href="https://www.hud.gov/helping-americans/buying-a-home"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1E242B] underline underline-offset-4"
            >
              HUD Buying a Home
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
