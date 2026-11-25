import { DMV_AREA_OPTIONS } from '../data/dmvData';
import {
  AssistanceProgram,
  CreditBand,
  DMVAreaId,
  DownPaymentMode,
  HomeCandidate,
  HomeRating,
  IncomeBand,
  MonthlyBreakdown,
  PreferenceSummary,
  PriorityTag,
  SavingsBand,
  SurveyAnswers,
} from '../types/homebuying';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function getSavingsMidpoint(band: SavingsBand | null): number {
  switch (band) {
    case 'under_15k':
      return 10000;
    case '15k_35k':
      return 25000;
    case '35k_70k':
      return 50000;
    case '70k_120k':
      return 92000;
    case 'over_120k':
      return 145000;
    default:
      return 30000;
  }
}

export function getAssumedInterestRate(creditBand: CreditBand | null, isFha: boolean): number {
  if (isFha) {
    switch (creditBand) {
      case '580_639':
        return 6.65;
      case '640_679':
        return 6.35;
      case '680_739':
        return 6.1;
      case '740_plus':
        return 5.95;
      default:
        return 6.25;
    }
  }
  switch (creditBand) {
    case '580_639':
      return 7.15;
    case '640_679':
      return 6.8;
    case '680_739':
      return 6.45;
    case '740_plus':
      return 6.2;
    default:
      return 6.5;
  }
}

export function estimatePriceRangeFromSurvey(answers: SurveyAnswers): {
  minPrice: number;
  maxPrice: number;
  targetPrice: number;
} {
  const monthlyBudget = answers.monthlyBudget || 3200;
  const savings = getSavingsMidpoint(answers.savingsBand);
  const rate = getAssumedInterestRate(answers.creditBand, answers.creditBand === '580_639') / 100 / 12;
  const n = 360;
  const factor = (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);

  // Reserve ~24% of monthly payment for DMV taxes, insurance, and typical HOA/PMI
  const principalInterestBudget = Math.max(1100, monthlyBudget * 0.76);
  const estLoan = principalInterestBudget / factor;
  // Cap usable down payment portion at 80% of savings (keep closing costs buffer)
  const usableDown = Math.min(savings * 0.75, estLoan * 0.25);
  const rawTarget = Math.round((estLoan + usableDown) / 5000) * 5000;

  const targetPrice = Math.max(280000, Math.min(850000, rawTarget));
  const minPrice = Math.max(250000, Math.round((targetPrice * 0.72) / 5000) * 5000);
  const maxPrice = Math.min(900000, Math.round((targetPrice * 1.15) / 5000) * 5000);

  return { minPrice, maxPrice, targetPrice };
}

export function calculateMonthlyPayment(
  home: HomeCandidate,
  answers: SurveyAnswers,
  downMode: DownPaymentMode
): MonthlyBreakdown {
  const price = home.list_price;
  const isCoop = home.property_details.property_type.toLowerCase().includes('co-op');
  const savings = getSavingsMidpoint(answers.savingsBand);

  let downPaymentPercent = 5;
  let isFha = false;

  if (isCoop) {
    // Co-ops typically require at least 10% down in DC
    const fromSavingsPct = Math.min(25, Math.max(10, Math.round(((savings * 0.78) / price) * 100)));
    downPaymentPercent = downMode === 'my_savings' ? fromSavingsPct : 10;
  } else if (downMode === 'fha_3_5') {
    downPaymentPercent = 3.5;
    isFha = true;
  } else if (downMode === 'conv_5') {
    downPaymentPercent = 5;
  } else {
    // Use ~78% of stated savings for down payment (reserving remainder for closing costs)
    const pct = ((savings * 0.78) / price) * 100;
    downPaymentPercent = Math.min(25, Math.max(3.5, Math.round(pct * 10) / 10));
    isFha = downPaymentPercent < 5 && answers.creditBand === '580_639';
  }

  const downPaymentDollars = Math.round((price * downPaymentPercent) / 100);
  const loanAmount = Math.max(0, price - downPaymentDollars);
  const annualRate = getAssumedInterestRate(answers.creditBand, isFha);
  const monthlyRate = annualRate / 100 / 12;
  const termMonths = 360;

  const principalAndInterest =
    loanAmount > 0
      ? Math.round(
          (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
            (Math.pow(1 + monthlyRate, termMonths) - 1)
        )
      : 0;

  const taxBundledInFee =
    home.financials_and_hoa.estimated_annual_property_tax === 0 &&
    home.financials_and_hoa.fee_includes.some((f) => f.toLowerCase().includes('tax'));

  const propertyTax = Math.round(home.financials_and_hoa.estimated_annual_property_tax / 12);

  // Condos/co-ops carry lower HO-6 interior insurance than detached/townhome HO-3
  const insuranceRate = home.structureBucket === 'condo_coop' ? 0.0014 : 0.0026;
  const homeInsurance = Math.round((price * insuranceRate) / 12);

  const hoaOrCoopFee = home.financials_and_hoa.monthly_fee;

  // FHA MIP (~0.55%/yr) or Conventional PMI (~0.62%/yr if under 20% down)
  let mortgageInsurance = 0;
  if (downPaymentPercent < 20) {
    const pmiAnnualRate = isFha ? 0.0055 : answers.creditBand === '740_plus' ? 0.0045 : 0.0068;
    mortgageInsurance = Math.round((loanAmount * pmiAnnualRate) / 12);
  }

  const totalMonthly =
    principalAndInterest + propertyTax + homeInsurance + hoaOrCoopFee + mortgageInsurance;

  return {
    principalAndInterest,
    propertyTax,
    homeInsurance,
    hoaOrCoopFee,
    mortgageInsurance,
    totalMonthly,
    downPaymentDollars,
    downPaymentPercent,
    interestRate: annualRate,
    taxBundledInFee,
  };
}

function isLowToModIncome(band: IncomeBand | null): boolean {
  return band === 'under_95k' || band === '95k_135k';
}

function isUnderMidHighCap(band: IncomeBand | null): boolean {
  return band === 'under_95k' || band === '95k_135k' || band === '135k_185k';
}

function meetsCredit640(band: CreditBand | null): boolean {
  return band === '640_679' || band === '680_739' || band === '740_plus';
}

function meetsCredit680(band: CreditBand | null): boolean {
  return band === '680_739' || band === '740_plus';
}

export function getMatchedPrograms(
  answers: SurveyAnswers,
  focusStates?: ('DC' | 'MD' | 'VA')[]
): AssistanceProgram[] {
  const selectedStates = new Set<'DC' | 'MD' | 'VA'>();

  if (focusStates && focusStates.length > 0) {
    focusStates.forEach((s) => selectedStates.add(s));
  } else {
    answers.areas.forEach((areaId) => {
      const found = DMV_AREA_OPTIONS.find((a) => a.id === areaId);
      if (found) selectedStates.add(found.state);
    });
    if (selectedStates.size === 0) {
      selectedStates.add('DC');
      selectedStates.add('MD');
      selectedStates.add('VA');
    }
  }

  const programs: AssistanceProgram[] = [];
  const firstTime = answers.isFirstTimeBuyer !== false;

  if (selectedStates.has('VA')) {
    if (firstTime && isLowToModIncome(answers.incomeBand)) {
      programs.push({
        id: 'va-dpa-grant',
        name: 'Virginia Housing DPA Grant',
        agency: 'Virginia Housing',
        jurisdiction: 'VA',
        eligibilityStatus: 'Likely Eligible',
        benefitHeadline: '2%–2.5% down payment gift (never repaid)',
        plainSummary:
          'Covers 2% with a Conventional Bond loan or 2.5% with an FHA Bond loan. Cannot be combined with the Plus Second Mortgage.',
        requirements: [
          'First-time buyer (no home owned in past 3 years)',
          'Meets Northern Virginia regional income limits',
          'Complete free Virginia Housing homebuyer class',
        ],
        officialUrl: 'https://www.virginiahousing.com/homebuyers',
        officialLabel: 'virginiahousing.com/homebuyers',
      });
    }

    programs.push({
      id: 'va-plus-second',
      name: 'Virginia Housing Plus Second Mortgage',
      agency: 'Virginia Housing',
      jurisdiction: 'VA',
      eligibilityStatus: meetsCredit640(answers.creditBand) && isUnderMidHighCap(answers.incomeBand)
        ? 'Likely Eligible'
        : 'Check Limits',
      benefitHeadline: meetsCredit680(answers.creditBand)
        ? 'Up to 5% down payment + extra 1.5% for closing costs'
        : 'Up to 5% down payment assistance (30-year second loan)',
      plainSummary:
        'Open to both first-time and repeat buyers with higher income caps than the grant. Repaid as a small fixed monthly second loan.',
      requirements: [
        meetsCredit680(answers.creditBand)
          ? 'Your 680+ credit unlocks the extra 1.5% closing cost option'
          : 'Credit score 680+ unlocks an extra 1.5% toward closing costs',
        'Paired with a Virginia Housing FHA or Conventional first mortgage',
        'Complete Virginia Housing homebuyer education class',
      ],
      officialUrl: 'https://www.virginiahousing.com/homebuyers',
      officialLabel: 'virginiahousing.com/homebuyers',
    });
  }

  if (selectedStates.has('MD')) {
    programs.push({
      id: 'md-mmp',
      name: firstTime ? 'Maryland 1st Time Advantage (MMP)' : 'Maryland Flex Loan (MMP)',
      agency: 'Maryland Homeownership (DHCD)',
      jurisdiction: 'MD',
      eligibilityStatus:
        meetsCredit640(answers.creditBand) && isUnderMidHighCap(answers.incomeBand)
          ? 'Likely Eligible'
          : 'Check Limits',
      benefitHeadline: '$6,000 or 3%–5% at 0% interest (no monthly payment)',
      plainSummary:
        'Deferred second loan with zero monthly payments—only repaid when you sell, refinance, or pay off the home. First-time MD buyers also save on state transfer tax.',
      requirements: [
        'Minimum middle credit score typically 640 or higher',
        'Primary residence within county income and price limits',
        'Complete approved Maryland homebuyer education course',
      ],
      officialUrl: 'https://www.marylandhomeownership.com/',
      officialLabel: 'marylandhomeownership.com',
    });
  }

  if (selectedStates.has('DC')) {
    if (firstTime && isLowToModIncome(answers.incomeBand)) {
      programs.push({
        id: 'dc-hpap',
        name: 'DC HPAP + Homestead Deduction',
        agency: 'DC DHCD',
        jurisdiction: 'DC',
        eligibilityStatus: 'Likely Eligible',
        benefitHeadline: 'Tiered interest-free gap financing + up to $4,000 closing help',
        plainSummary:
          'Provides substantial deferred or low-payment gap assistance for DC first-time buyers, plus the DC Homestead Deduction lowers annual property taxes.',
        requirements: [
          'First-time homebuyer purchasing inside Washington, DC',
          'HUD-approved homebuyer education required',
          'Income verified against DC Area Median Income tiers',
        ],
        officialUrl: 'https://www.hud.gov/helping-americans/buying-a-home',
        officialLabel: 'HUD & DC Homebuying Guide',
      });
    } else {
      programs.push({
        id: 'dc-open-doors',
        name: 'DC Open Doors + Homestead Deduction',
        agency: 'DC Housing Finance Agency',
        jurisdiction: 'DC',
        eligibilityStatus: meetsCredit640(answers.creditBand) ? 'Likely Eligible' : 'Check Limits',
        benefitHeadline: '0% deferred loan covering your 3.5% down payment',
        plainSummary:
          'Open to first-time and repeat buyers in DC with generous borrower income limits. Pair with the DC Homestead Deduction after closing.',
        requirements: [
          'Minimum credit score 640+ for DC Open Doors',
          'Home must be located in Washington, DC (check co-op eligibility)',
          'Complete HUD-approved homebuyer education course',
        ],
        officialUrl: 'https://www.hud.gov/helping-americans/buying-a-home',
        officialLabel: 'HUD Buying a Home Guide',
      });
    }
  }

  // Always include HUD/FHA federal guidance
  programs.push({
    id: 'hud-fha',
    name: 'HUD / FHA Insured Mortgage & Counseling',
    agency: 'U.S. Dept. of Housing & Urban Development',
    jurisdiction: 'Federal',
    eligibilityStatus:
      answers.creditBand === '580_639' || answers.savingsBand === 'under_15k' || answers.savingsBand === '15k_35k'
        ? 'Likely Eligible'
        : 'Reference Option',
    benefitHeadline: '3.5% minimum down payment (580+ credit)',
    plainSummary:
      'Works across DC, Maryland, and Virginia and stacks with Virginia Housing, Maryland MMP, and DC programs. Includes free HUD-approved counseling and safety appraisal checks.',
    requirements: [
      'Minimum 580 credit score for 3.5% down payment',
      'Home must meet FHA health and safety standards (roof, heat, no peeling pre-1978 paint)',
      'Pair with an independent home inspection before closing',
    ],
    officialUrl: 'https://www.hud.gov/helping-americans/buying-a-home',
    officialLabel: 'hud.gov/helping-americans/buying-a-home',
  });

  return programs;
}

export function scoreHomeForBuyer(
  home: HomeCandidate,
  answers: SurveyAnswers,
  ratings: HomeRating[],
  allHomes: HomeCandidate[]
): { score: number; matchReason: string } {
  let score = 50;
  const reasons: string[] = [];

  // 1. Area match
  if (answers.areas.length === 0 || answers.areas.includes(home.areaId)) {
    score += 24;
    reasons.push(`In ${home.address.city}, ${home.address.state}`);
  } else {
    score -= 10;
  }

  // 2. True monthly affordability match
  const payment = calculateMonthlyPayment(home, answers, 'my_savings');
  const budgetDiff = payment.totalMonthly - answers.monthlyBudget;
  if (budgetDiff <= 150 && budgetDiff >= -900) {
    score += 22;
    reasons.push('Fits your monthly budget');
  } else if (budgetDiff <= 450) {
    score += 8;
  } else if (budgetDiff > 700) {
    score -= 18;
  }

  // 3. Bedrooms match
  if (answers.minBedrooms && home.property_details.bedrooms >= answers.minBedrooms) {
    score += 12;
  } else if (answers.minBedrooms && home.property_details.bedrooms < answers.minBedrooms) {
    score -= 8;
  }

  // 4. Structure preference
  if (answers.structurePreference && answers.structurePreference !== 'open_exploring') {
    if (home.structureBucket === answers.structurePreference) {
      score += 16;
    }
  }

  // 5. Commute style
  if (answers.commuteStyle === 'metro_walkable' && home.location_and_transit.distance_to_metro_miles <= 0.6) {
    score += 12;
    reasons.push('Walkable to Metro');
  } else if (
    answers.commuteStyle === 'suburban_driveway' &&
    (home.exterior_and_parking.parking_type.toLowerCase().includes('driveway') ||
      home.exterior_and_parking.garage_spaces > 0)
  ) {
    score += 10;
    reasons.push('Private parking');
  }

  // 6. Priorities overlap
  const matchingPriorities = home.tags.filter((t) => answers.priorities.includes(t));
  score += matchingPriorities.length * 7;

  // 7. Adaptive Taste Learning from Like/Pass history
  if (ratings.length > 0) {
    const likedHomes = ratings
      .filter((r) => r.decision === 'like')
      .map((r) => allHomes.find((h) => h.listing_id === r.listingId))
      .filter((h): h is HomeCandidate => Boolean(h));

    const passedHomes = ratings
      .filter((r) => r.decision === 'pass')
      .map((r) => allHomes.find((h) => h.listing_id === r.listingId))
      .filter((h): h is HomeCandidate => Boolean(h));

    likedHomes.forEach((liked) => {
      if (liked.styleCategory === home.styleCategory) {
        score += 11;
      }
      if (liked.structureBucket === home.structureBucket) {
        score += 10;
      }
      const sharedTags = home.tags.filter((t) => liked.tags.includes(t));
      score += sharedTags.length * 6;
      if (liked.financials_and_hoa.monthly_fee === 0 && home.financials_and_hoa.monthly_fee === 0) {
        score += 6;
      }
    });

    passedHomes.forEach((passed) => {
      if (passed.styleCategory === home.styleCategory) {
        score -= 7;
      }
      if (passed.structureBucket === home.structureBucket) {
        score -= 6;
      }
    });

    if (likedHomes.length > 0) {
      const similarStyle = likedHomes.some((l) => l.styleCategory === home.styleCategory);
      const similarStructure = likedHomes.some((l) => l.structureBucket === home.structureBucket);
      if (similarStyle) {
        reasons.unshift('Similar style to homes you liked');
      } else if (similarStructure) {
        reasons.unshift('Matches the home layout you liked');
      }
    }
  }

  return {
    score,
    matchReason: reasons[0] || 'DMV option near your range',
  };
}

export function buildPreferenceSummary(
  answers: SurveyAnswers,
  ratings: HomeRating[],
  allHomes: HomeCandidate[]
): PreferenceSummary {
  const likedHomes = ratings
    .filter((r) => r.decision === 'like')
    .map((r) => allHomes.find((h) => h.listing_id === r.listingId))
    .filter((h): h is HomeCandidate => Boolean(h));

  const pool = likedHomes.length > 0 ? likedHomes : allHomes.slice(0, 3);

  // Count structures
  const structureCounts = { condo_coop: 0, townhouse_rowhouse: 0, detached_single: 0 };
  const eraCounts = { historic: 0, midcentury: 0, modern: 0, traditional: 0 };
  const tagCounts: Record<string, number> = {};
  let walkScoreSum = 0;
  let noHoaLikes = 0;

  pool.forEach((home) => {
    structureCounts[home.structureBucket] += 1;
    eraCounts[home.styleCategory] += 1;
    walkScoreSum += home.location_and_transit.walk_score;
    if (!home.financials_and_hoa.has_hoa) noHoaLikes += 1;
    home.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  const topStructureEntry = Object.entries(structureCounts).sort((a, b) => b[1] - a[1])[0];
  const preferredStructureLabel =
    topStructureEntry[0] === 'detached_single'
      ? 'Single-Family Detached Homes'
      : topStructureEntry[0] === 'townhouse_rowhouse'
        ? 'Townhouses & Rowhouses'
        : 'Condos & Co-ops';

  const topEraEntry = Object.entries(eraCounts).sort((a, b) => b[1] - a[1])[0];
  const preferredEraLabel =
    topEraEntry[0] === 'historic'
      ? 'Historic Brick & Character'
      : topEraEntry[0] === 'midcentury'
        ? 'Mid-Century & Suburban Classic'
        : topEraEntry[0] === 'modern'
          ? 'Modern Move-In Ready'
          : 'Traditional Colonial';

  const avgWalk = Math.round(walkScoreSum / pool.length);
  const walkabilityPreference: PreferenceSummary['walkabilityPreference'] =
    avgWalk >= 80 || answers.commuteStyle === 'metro_walkable'
      ? 'High (near Metro)'
      : avgWalk >= 60
        ? 'Balanced'
        : 'Flexible (driveway/yard)';

  const maxRecommendedHoa =
    noHoaLikes >= Math.ceil(pool.length * 0.6) || answers.priorities.includes('low_no_hoa')
      ? 150
      : topStructureEntry[0] === 'condo_coop'
        ? 550
        : 250;

  const traitLabelMap: Record<PriorityTag, string> = {
    historic_brick: 'Classic brick architecture',
    private_yard: 'Private yard or outdoor space',
    basement_income: 'Finished basement flexibility',
    modern_movein: 'Move-in ready modern finishes',
    low_no_hoa: 'Low or zero HOA dues',
    garage_parking: 'Dedicated garage parking',
  };

  const sortedTags = (Object.entries(tagCounts) as [PriorityTag, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => traitLabelMap[tag]);

  const topTraits = Array.from(
    new Set([
      ...sortedTags.slice(0, 3),
      ...(walkabilityPreference === 'High (near Metro)' ? ['Walkable to Metro'] : []),
    ])
  ).slice(0, 4);

  // Gather curated, clean Zillow/Redfin search keywords
  const keywordCandidates = new Set<string>();
  likedHomes.forEach((h) => {
    h.searchKeywords.forEach((kw) => keywordCandidates.add(kw));
  });

  if (answers.priorities.includes('low_no_hoa')) keywordCandidates.add('no HOA');
  if (answers.priorities.includes('private_yard')) keywordCandidates.add('fenced yard');
  if (answers.priorities.includes('historic_brick')) keywordCandidates.add('brick');
  if (answers.priorities.includes('basement_income')) keywordCandidates.add('finished basement');
  if (answers.priorities.includes('garage_parking')) keywordCandidates.add('garage');
  if (answers.priorities.includes('modern_movein')) keywordCandidates.add('updated kitchen');
  if (answers.commuteStyle === 'metro_walkable') keywordCandidates.add('walk to metro');

  const suggestedKeywords = Array.from(keywordCandidates).slice(0, 8);

  return {
    topTraits: topTraits.length > 0 ? topTraits : ['Balanced DMV value', 'Natural light'],
    preferredStructureLabel,
    preferredEraLabel,
    maxRecommendedHoa,
    walkabilityPreference,
    suggestedKeywords:
      suggestedKeywords.length > 0
        ? suggestedKeywords
        : ['brick', 'hardwood', 'walk to metro', 'fenced yard'],
  };
}

export interface PortalSearchLinks {
  areaLabel: string;
  zillowUrl: string;
  redfinUrl: string;
  keywordQuery: string;
  filterChecklistText: string;
}

export function buildPortalSearchLinks(params: {
  areaId: DMVAreaId;
  maxPrice: number;
  minBeds: number;
  maxHoa: number | null;
  includeDetached: boolean;
  includeTownhouse: boolean;
  includeCondo: boolean;
  activeKeywords: string[];
}): PortalSearchLinks {
  const area = DMV_AREA_OPTIONS.find((a) => a.id === params.areaId) || DMV_AREA_OPTIONS[0];
  const minPrice = Math.max(200000, Math.round((params.maxPrice * 0.55) / 10000) * 10000);

  // Build Zillow searchQueryState JSON for accurate pre-filtered Zillow searches
  const filterState: Record<string, unknown> = {
    sort: { value: 'globalrelevanceex' },
    price: { min: minPrice, max: params.maxPrice },
    beds: { min: params.minBeds },
    sf: { value: params.includeDetached },
    tow: { value: params.includeTownhouse },
    con: { value: params.includeCondo },
    apa: { value: params.includeCondo },
    land: { value: false },
    manu: { value: false },
  };

  if (params.maxHoa !== null) {
    filterState.hoa = { max: params.maxHoa };
  }

  if (params.activeKeywords.length > 0) {
    filterState.att = { value: params.activeKeywords.slice(0, 4).join(', ') };
  }

  const searchQueryState = {
    isMapVisible: true,
    filterState,
    isListVisible: true,
  };

  const zillowUrl = `https://www.zillow.com/${area.zillowSlug}/?searchQueryState=${encodeURIComponent(
    JSON.stringify(searchQueryState)
  )}`;

  // Build clean Redfin filter URL (e.g. /filter/property-type=house+townhouse,max-price=600k,min-beds=3,hoa=200)
  const redfinParts: string[] = [];
  const rfTypes: string[] = [];
  if (params.includeDetached) rfTypes.push('house');
  if (params.includeTownhouse) rfTypes.push('townhouse');
  if (params.includeCondo) rfTypes.push('condo');
  if (rfTypes.length > 0 && rfTypes.length < 3) {
    redfinParts.push(`property-type=${rfTypes.join('+')}`);
  }
  redfinParts.push(`min-price=${Math.round(minPrice / 1000)}k`);
  redfinParts.push(`max-price=${Math.round(params.maxPrice / 1000)}k`);
  redfinParts.push(`min-beds=${params.minBeds}`);
  if (params.maxHoa !== null) {
    redfinParts.push(`hoa=${params.maxHoa}`);
  }
  if (params.activeKeywords.length > 0) {
    redfinParts.push(`remarks=${encodeURIComponent(params.activeKeywords.slice(0, 3).join(' '))}`);
  }

  const redfinUrl = `https://www.redfin.com/${area.redfinPath}/filter/${redfinParts.join(',')}`;

  const keywordQuery = params.activeKeywords.join(', ');

  const homeTypesSummary = [
    params.includeDetached ? 'Single-Family House' : null,
    params.includeTownhouse ? 'Townhouse / Rowhouse' : null,
    params.includeCondo ? 'Condo / Co-op' : null,
  ]
    .filter(Boolean)
    .join(', ');

  const filterChecklistText = [
    `Potomac Folio — Saved DMV Home Search`,
    `Area: ${area.label} (${area.examples})`,
    `Price Range: ${formatCurrency(minPrice)} – ${formatCurrency(params.maxPrice)}`,
    `Bedrooms: ${params.minBeds}+ Bedrooms`,
    `Home Types: ${homeTypesSummary || 'Any'}`,
    `Max Monthly HOA/Condo Fee: ${params.maxHoa !== null ? `${formatCurrency(params.maxHoa)}/mo` : 'Any'}`,
    `Keywords to paste into Zillow / Redfin: ${keywordQuery || 'None selected'}`,
  ].join('\n');

  return {
    areaLabel: area.label,
    zillowUrl,
    redfinUrl,
    keywordQuery,
    filterChecklistText,
  };
}
