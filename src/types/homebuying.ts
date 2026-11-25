export type DMVAreaId =
  | 'dc'
  | 'montgomery_md'
  | 'pg_md'
  | 'arlington_alexandria_va'
  | 'fairfax_reston_va';

export type IncomeBand =
  | 'under_95k'
  | '95k_135k'
  | '135k_185k'
  | '185k_250k'
  | 'over_250k';

export type SavingsBand =
  | 'under_15k'
  | '15k_35k'
  | '35k_70k'
  | '70k_120k'
  | 'over_120k';

export type CreditBand =
  | '580_639'
  | '640_679'
  | '680_739'
  | '740_plus';

export type CommuteStyle =
  | 'metro_walkable'
  | 'hybrid_metro_parking'
  | 'suburban_driveway';

export type StructurePreference =
  | 'condo_coop'
  | 'townhouse_rowhouse'
  | 'detached_single'
  | 'open_exploring';

export type PriorityTag =
  | 'historic_brick'
  | 'private_yard'
  | 'basement_income'
  | 'modern_movein'
  | 'low_no_hoa'
  | 'garage_parking';

export type PlateStyleId =
  | 'dupont_coop'
  | 'petworth_rowhouse'
  | 'silver_spring_rambler'
  | 'hyattsville_townhome'
  | 'ballston_condo'
  | 'alexandria_endunit'
  | 'reston_garden'
  | 'bowie_capecod'
  | 'takoma_craftsman'
  | 'arlington_colonial'
  | 'navy_yard_loft'
  | 'del_ray_townhome';

export interface SurveyAnswers {
  areas: DMVAreaId[];
  isFirstTimeBuyer: boolean | null;
  monthlyBudget: number;
  incomeBand: IncomeBand | null;
  savingsBand: SavingsBand | null;
  creditBand: CreditBand | null;
  minBedrooms: number | null;
  commuteStyle: CommuteStyle | null;
  structurePreference: StructurePreference | null;
  priorities: PriorityTag[];
}

export interface RawDMVListing {
  listing_id: string;
  mls_status: string;
  days_on_market: number;
  list_price: number;
  price_per_sqft: number;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: 'DC' | 'MD' | 'VA';
    zip_code: string;
    jurisdiction: string;
  };
  property_details: {
    property_type: string;
    architectural_style: string;
    year_built: number;
    bedrooms: number;
    bathrooms_full: number;
    bathrooms_half: number;
    living_area_sqft: number;
    lot_size_sqft: number | null;
    stories: number;
    basement: string;
  };
  financials_and_hoa: {
    has_hoa: boolean;
    fee_type: string | null;
    monthly_fee: number;
    fee_includes: string[];
    estimated_annual_property_tax: number;
    first_time_buyer_notes: string;
  };
  interior_features: {
    flooring: string[];
    appliances: string[];
    laundry: string;
    heating_cooling: string[];
    highlights: string[];
  };
  exterior_and_parking: {
    parking_type: string;
    garage_spaces: number;
    outdoor_space: string;
    construction_materials: string[];
  };
  location_and_transit: {
    nearest_metro_station: string;
    distance_to_metro_miles: number;
    walk_score: number;
    transit_score: number;
    school_district: string;
  };
  description: string;
}

export interface HomeCandidate extends RawDMVListing {
  plateId: PlateStyleId;
  areaId: DMVAreaId;
  isDatasetBenchmark: boolean;
  styleCategory: 'historic' | 'midcentury' | 'modern' | 'traditional';
  structureBucket: 'condo_coop' | 'townhouse_rowhouse' | 'detached_single';
  tags: PriorityTag[];
  figureCaption: string;
  searchKeywords: string[];
}

export type RatingDecision = 'like' | 'pass';

export interface HomeRating {
  listingId: string;
  decision: RatingDecision;
  timestamp: number;
}

export type DownPaymentMode = 'fha_3_5' | 'conv_5' | 'my_savings';

export interface MonthlyBreakdown {
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  hoaOrCoopFee: number;
  mortgageInsurance: number;
  totalMonthly: number;
  downPaymentDollars: number;
  downPaymentPercent: number;
  interestRate: number;
  taxBundledInFee: boolean;
}

export interface AssistanceProgram {
  id: string;
  name: string;
  agency: string;
  jurisdiction: 'VA' | 'MD' | 'DC' | 'Federal';
  eligibilityStatus: 'Likely Eligible' | 'Check Limits' | 'Reference Option';
  benefitHeadline: string;
  plainSummary: string;
  requirements: string[];
  officialUrl: string;
  officialLabel: string;
}

export interface PreferenceSummary {
  topTraits: string[];
  preferredStructureLabel: string;
  preferredEraLabel: string;
  maxRecommendedHoa: number | null;
  walkabilityPreference: 'High (near Metro)' | 'Balanced' | 'Flexible (driveway/yard)';
  suggestedKeywords: string[];
}

export type AppView = 'welcome' | 'survey' | 'explore' | 'search-kit' | 'guides';
