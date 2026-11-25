import {
  DMVAreaId,
  HomeCandidate,
  PlateStyleId,
  PriorityTag,
  RawDMVListing,
  SurveyAnswers,
} from '../types/homebuying';

export const DMV_DATASET_URL = '/assets/aistudio/gemini-code-1795620913127_3dd297a2.json';

export const DEFAULT_SURVEY_ANSWERS: SurveyAnswers = {
  areas: [],
  isFirstTimeBuyer: null,
  monthlyBudget: 3200,
  incomeBand: null,
  savingsBand: null,
  creditBand: null,
  minBedrooms: null,
  commuteStyle: null,
  structurePreference: null,
  priorities: [],
};

export interface AreaOption {
  id: DMVAreaId;
  label: string;
  state: 'DC' | 'MD' | 'VA';
  examples: string;
  zillowSlug: string;
  redfinPath: string;
}

export const DMV_AREA_OPTIONS: AreaOption[] = [
  {
    id: 'dc',
    label: 'Washington, DC',
    state: 'DC',
    examples: 'Dupont Circle, Petworth, Capitol Hill, Navy Yard',
    zillowSlug: 'washington-dc',
    redfinPath: 'city/12839/DC/Washington',
  },
  {
    id: 'montgomery_md',
    label: 'Montgomery County, MD',
    state: 'MD',
    examples: 'Silver Spring, Takoma Park, Rockville, Bethesda',
    zillowSlug: 'silver-spring-md',
    redfinPath: 'city/18040/MD/Silver-Spring',
  },
  {
    id: 'pg_md',
    label: "Prince George's County, MD",
    state: 'MD',
    examples: 'Hyattsville, Bowie, College Park, Greenbelt',
    zillowSlug: 'hyattsville-md',
    redfinPath: 'city/8916/MD/Hyattsville',
  },
  {
    id: 'arlington_alexandria_va',
    label: 'Arlington & Alexandria, VA',
    state: 'VA',
    examples: 'Ballston, Del Ray, Old Town, Groveton',
    zillowSlug: 'alexandria-va',
    redfinPath: 'city/250/VA/Alexandria',
  },
  {
    id: 'fairfax_reston_va',
    label: 'Fairfax County & Reston, VA',
    state: 'VA',
    examples: 'Reston, Vienna, Falls Church, Springfield',
    zillowSlug: 'reston-va',
    redfinPath: 'city/15871/VA/Reston',
  },
];

export const OFFICIAL_RESOURCES = [
  {
    id: 'va-housing',
    title: 'Virginia Housing',
    jurisdiction: 'Virginia',
    url: 'https://www.virginiahousing.com/homebuyers',
    summary:
      'Offers the Down Payment Assistance (DPA) Grant (2%–2.5% gift with no repayment) for eligible first-time buyers, and the Plus Second Mortgage (up to 5% plus 1.5% for closing costs at 680+ credit) for both first-time and repeat buyers.',
    keyFacts: [
      'DPA Grant and Plus Second Mortgage cannot be combined—choose the track that fits your income and credit.',
      'Free Virginia Housing-approved homebuyer education class is required before closing.',
      'Must work with a Virginia Housing-approved lender to verify county income limits.',
    ],
  },
  {
    id: 'md-mmp',
    title: 'Maryland Mortgage Program (MMP)',
    jurisdiction: 'Maryland',
    url: 'https://www.marylandhomeownership.com/',
    summary:
      'Operated by Maryland DHCD, offering 30-year fixed mortgages through 1st Time Advantage and Flex loans paired with 0% interest deferred down payment assistance ($6,000 flat or 3%–5% of the loan).',
    keyFacts: [
      'Deferred second liens require zero monthly payments—repaid only when you sell, refinance, or pay off the loan.',
      'Typically requires a 640+ middle credit score, owner occupancy, and a homebuyer education course.',
      'Maryland first-time homebuyers also qualify for a state transfer tax exemption at closing.',
    ],
  },
  {
    id: 'hud-fha',
    title: 'HUD — Buying a Home & FHA Loans',
    jurisdiction: 'Federal (DC, MD & VA)',
    url: 'https://www.hud.gov/helping-americans/buying-a-home',
    summary:
      'Federal homebuying roadmap covering FHA-insured loans (as low as 3.5% down with a 580+ credit score), free HUD-approved housing counseling agencies, and FHA Minimum Property Standards.',
    keyFacts: [
      'HUD-approved housing counselors provide unbiased budget reviews and required education certificates.',
      'FHA appraisals check basic health and safety (roof life, working heat/plumbing, no peeling pre-1978 paint).',
      'Always pair an FHA appraisal with your own independent home inspection before closing.',
    ],
  },
  {
    id: 'dc-programs',
    title: 'DC Homebuyer Programs (HPAP & DC Open Doors)',
    jurisdiction: 'Washington, DC',
    url: 'https://www.hud.gov/helping-americans/buying-a-home',
    summary:
      'DC residents can pair federal FHA or conventional mortgages with HPAP (tiered gap financing plus closing help for income-qualified first-time buyers) or DC Open Doors (0% deferred 3.5% down payment loan, 640+ credit).',
    keyFacts: [
      'DC Homestead Deduction reduces annual property taxes once you live in the home as your primary residence.',
      'DC Open Doors checks borrower income rather than full household income and accepts repeat buyers.',
      'Co-ops have special underwriting rules—confirm building eligibility with a local lender early.',
    ],
  },
];

// Supplemental DMV archetypes so buyers across all price ranges ($315k–$790k) and styles have 12 complete cards
const SUPPLEMENTAL_DMV_CONCEPTS: RawDMVListing[] = [
  {
    listing_id: 'DMV-009',
    mls_status: 'Market Archetype',
    days_on_market: 12,
    list_price: 685000,
    price_per_sqft: 389,
    address: {
      street: '7104 Maple Ave',
      neighborhood: 'Old Town Takoma',
      city: 'Takoma Park',
      state: 'MD',
      zip_code: '20912',
      jurisdiction: 'Montgomery County',
    },
    property_details: {
      property_type: 'Single-Family Detached',
      architectural_style: 'Historic Craftsman Bungalow',
      year_built: 1923,
      bedrooms: 3,
      bathrooms_full: 2,
      bathrooms_half: 0,
      living_area_sqft: 1760,
      lot_size_sqft: 5900,
      stories: 2,
      basement: 'Full Partially Finished Walk-Out',
    },
    financials_and_hoa: {
      has_hoa: false,
      fee_type: null,
      monthly_fee: 0,
      fee_includes: [],
      estimated_annual_property_tax: 7150,
      first_time_buyer_notes:
        'Zero HOA fees and walkable to Takoma Metro. Eligible for Maryland first-time buyer transfer tax exemption.',
    },
    interior_features: {
      flooring: ['Heart Pine Hardwood', 'Ceramic Tile'],
      appliances: ['Gas Range', 'Dishwasher', 'Refrigerator', 'Washer/Dryer'],
      laundry: 'Basement Utility Area',
      heating_cooling: ['Radiator Heat', 'Central AC'],
      highlights: ['Deep shaded front porch', 'Built-in craftsman bookshelves', 'Sunny fenced garden yard'],
    },
    exterior_and_parking: {
      parking_type: 'Private Driveway (2 Cars)',
      garage_spaces: 0,
      outdoor_space: 'Wide Covered Front Porch & Lush Backyard',
      construction_materials: ['Cedar Shingle', 'Fieldstone Foundation'],
    },
    location_and_transit: {
      nearest_metro_station: 'Takoma (Red Line)',
      distance_to_metro_miles: 0.6,
      walk_score: 84,
      transit_score: 68,
      school_district: 'Montgomery County Public Schools (MCPS)',
    },
    description:
      'Character-rich Craftsman bungalow with tapered stone porch columns, mature shade trees, no HOA dues, and a leafy walk to the Red Line and farmers market.',
  },
  {
    listing_id: 'DMV-010',
    mls_status: 'Market Archetype',
    days_on_market: 16,
    list_price: 785000,
    price_per_sqft: 396,
    address: {
      street: '1422 N Highland Ter',
      neighborhood: 'Westover / Falls Church Border',
      city: 'Arlington',
      state: 'VA',
      zip_code: '22205',
      jurisdiction: 'Arlington County',
    },
    property_details: {
      property_type: 'Single-Family Detached',
      architectural_style: 'Center-Hall Brick Colonial',
      year_built: 1948,
      bedrooms: 4,
      bathrooms_full: 2,
      bathrooms_half: 1,
      living_area_sqft: 1980,
      lot_size_sqft: 6200,
      stories: 2,
      basement: 'Finished Recreation Room',
    },
    financials_and_hoa: {
      has_hoa: false,
      fee_type: null,
      monthly_fee: 0,
      fee_includes: [],
      estimated_annual_property_tax: 8010,
      first_time_buyer_notes:
        'Classic Northern Virginia brick Colonial with no HOA fees and strong resale appeal near East Falls Church Metro.',
    },
    interior_features: {
      flooring: ['Oak Hardwood', 'Slate Entry'],
      appliances: ['Stainless Gas Range', 'Dishwasher', 'Microwave', 'Washer/Dryer'],
      laundry: 'Lower Level',
      heating_cooling: ['Gas Furnace', 'Central AC'],
      highlights: ['Brick hearth fireplace', 'Separate dining room', 'Finished basement office'],
    },
    exterior_and_parking: {
      parking_type: 'Detached 1-Car Garage + Driveway',
      garage_spaces: 1,
      outdoor_space: 'Flagstone Patio & Fenced Lawn',
      construction_materials: ['Red Brick', 'Slate Roof'],
    },
    location_and_transit: {
      nearest_metro_station: 'East Falls Church (Orange/Silver Lines)',
      distance_to_metro_miles: 0.9,
      walk_score: 73,
      transit_score: 61,
      school_district: 'Arlington Public Schools (APS)',
    },
    description:
      'Timeless brick Colonial offering four bedrooms, a detached garage, finished basement space, and easy access to the W&OD trail and Orange/Silver Lines.',
  },
  {
    listing_id: 'DMV-011',
    mls_status: 'Market Archetype',
    days_on_market: 19,
    list_price: 515000,
    price_per_sqft: 536,
    address: {
      street: '905 L St SE, Unit 308',
      neighborhood: 'Capitol Riverfront / Navy Yard',
      city: 'Washington',
      state: 'DC',
      zip_code: '20003',
      jurisdiction: 'District of Columbia',
    },
    property_details: {
      property_type: 'Condo',
      architectural_style: 'Modern Industrial Brick Loft',
      year_built: 2016,
      bedrooms: 2,
      bathrooms_full: 2,
      bathrooms_half: 0,
      living_area_sqft: 960,
      lot_size_sqft: null,
      stories: 1,
      basement: 'None',
    },
    financials_and_hoa: {
      has_hoa: true,
      fee_type: 'Condo Association',
      monthly_fee: 485,
      fee_includes: ['Water', 'Trash', 'Roof Lounge', 'Bike Storage', 'Building Insurance'],
      estimated_annual_property_tax: 3720,
      first_time_buyer_notes:
        'Modern construction keeps near-term repair surprises low. Ask lender to check condo warrantability for FHA or DC Open Doors.',
    },
    interior_features: {
      flooring: ['Wide-Plank Oak', 'Porcelain Tile'],
      appliances: ['Stainless Range', 'Quartz Island', 'Dishwasher', 'In-Unit Washer/Dryer'],
      laundry: 'In-Unit Closet',
      heating_cooling: ['Heat Pump', 'Central AC'],
      highlights: ['Oversized factory-style windows', 'Split 2-bed / 2-bath layout', 'Move-in ready quartz kitchen'],
    },
    exterior_and_parking: {
      parking_type: 'Deeded Underground Garage Space',
      garage_spaces: 1,
      outdoor_space: 'Landscaped Courtyard & Roof Terrace',
      construction_materials: ['Brick', 'Black Steel', 'Glass'],
    },
    location_and_transit: {
      nearest_metro_station: 'Navy Yard-Ballpark (Green Line)',
      distance_to_metro_miles: 0.3,
      walk_score: 92,
      transit_score: 84,
      school_district: 'DC Public Schools (DCPS)',
    },
    description:
      'Sunlit two-bedroom brick-and-steel loft condo steps from the Green Line, featuring low-maintenance modern systems and deeded garage parking.',
  },
  {
    listing_id: 'DMV-012',
    mls_status: 'Market Archetype',
    days_on_market: 8,
    list_price: 615000,
    price_per_sqft: 446,
    address: {
      street: '312 E Custis Ave',
      neighborhood: 'Del Ray',
      city: 'Alexandria',
      state: 'VA',
      zip_code: '22301',
      jurisdiction: 'City of Alexandria',
    },
    property_details: {
      property_type: 'Townhouse / Rowhouse',
      architectural_style: '1940s Painted-Brick Townhome',
      year_built: 1941,
      bedrooms: 3,
      bathrooms_full: 2,
      bathrooms_half: 0,
      living_area_sqft: 1380,
      lot_size_sqft: 2450,
      stories: 2,
      basement: 'Finished Lower Level with Side Entry',
    },
    financials_and_hoa: {
      has_hoa: false,
      fee_type: null,
      monthly_fee: 0,
      fee_includes: [],
      estimated_annual_property_tax: 6780,
      first_time_buyer_notes:
        'Fee-simple townhome with zero HOA fee and walkable main-street charm; eligible for Virginia Housing Plus Second Mortgage if income fits.',
    },
    interior_features: {
      flooring: ['Refinished Oak Hardwood', 'Tile'],
      appliances: ['Gas Range', 'Dishwasher', 'Refrigerator', 'Washer/Dryer'],
      laundry: 'Lower Level',
      heating_cooling: ['Forced Air Gas', 'Central AC'],
      highlights: ['Welcoming covered front porch', 'Fenced backyard & patio', 'Walkable to Mount Vernon Ave cafes'],
    },
    exterior_and_parking: {
      parking_type: 'Private Off-Street Pad + Street',
      garage_spaces: 0,
      outdoor_space: 'Front Porch, Fenced Garden Yard',
      construction_materials: ['Painted Brick'],
    },
    location_and_transit: {
      nearest_metro_station: 'Potomac Yard / Braddock Rd (Blue/Yellow Lines)',
      distance_to_metro_miles: 0.7,
      walk_score: 88,
      transit_score: 71,
      school_district: 'Alexandria City Public Schools (ACPS)',
    },
    description:
      'Inviting 1940s Del Ray brick townhome with zero HOA fees, a wide front porch, fenced garden yard, and an easy stroll to neighborhood shops and Metro.',
  },
];

// Metadata mapping each listing_id to its visual plate, area bucket, and keyword metadata
const LISTING_META: Record<
  string,
  {
    plateId: PlateStyleId;
    areaId: DMVAreaId;
    styleCategory: HomeCandidate['styleCategory'];
    structureBucket: HomeCandidate['structureBucket'];
    tags: PriorityTag[];
    figureCaption: string;
    searchKeywords: string[];
  }
> = {
  'DMV-001': {
    plateId: 'dupont_coop',
    areaId: 'dc',
    styleCategory: 'historic',
    structureBucket: 'condo_coop',
    tags: ['historic_brick'],
    figureCaption: 'Plate I — 1928 Beaux-Arts Brick & Limestone Co-op, Dupont Circle DC',
    searchKeywords: ['pre-war', 'co-op', 'hardwood', 'walk to metro'],
  },
  'DMV-002': {
    plateId: 'petworth_rowhouse',
    areaId: 'dc',
    styleCategory: 'historic',
    structureBucket: 'townhouse_rowhouse',
    tags: ['historic_brick', 'basement_income', 'low_no_hoa'],
    figureCaption: 'Plate II — 1924 Wardman Porch-Front Brick Rowhouse, Petworth DC',
    searchKeywords: ['brick rowhouse', 'front porch', 'english basement', 'no HOA'],
  },
  'DMV-003': {
    plateId: 'silver_spring_rambler',
    areaId: 'montgomery_md',
    styleCategory: 'midcentury',
    structureBucket: 'detached_single',
    tags: ['private_yard', 'basement_income', 'low_no_hoa'],
    figureCaption: 'Plate III — 1956 Brick Mid-Century Rambler, Silver Spring MD',
    searchKeywords: ['rambler', 'fenced yard', 'walk-out basement', 'no HOA'],
  },
  'DMV-004': {
    plateId: 'hyattsville_townhome',
    areaId: 'pg_md',
    styleCategory: 'traditional',
    structureBucket: 'townhouse_rowhouse',
    tags: ['modern_movein', 'low_no_hoa', 'garage_parking'],
    figureCaption: 'Plate IV — 2008 Colonial Brick Townhome, Hyattsville Arts District MD',
    searchKeywords: ['brick townhome', 'attached garage', 'low HOA', 'deck'],
  },
  'DMV-005': {
    plateId: 'ballston_condo',
    areaId: 'arlington_alexandria_va',
    styleCategory: 'modern',
    structureBucket: 'condo_coop',
    tags: ['modern_movein', 'garage_parking'],
    figureCaption: 'Plate V — Contemporary Glass & Brick Metro Condo, Ballston VA',
    searchKeywords: ['condo', 'garage parking', 'walk to metro', 'in-unit laundry'],
  },
  'DMV-006': {
    plateId: 'alexandria_endunit',
    areaId: 'arlington_alexandria_va',
    styleCategory: 'traditional',
    structureBucket: 'townhouse_rowhouse',
    tags: ['historic_brick', 'private_yard', 'basement_income'],
    figureCaption: 'Plate VI — 1986 Brick End-Unit Colonial Townhouse, Alexandria VA',
    searchKeywords: ['end unit townhouse', 'brick front', 'fenced yard', 'finished basement'],
  },
  'DMV-007': {
    plateId: 'reston_garden',
    areaId: 'fairfax_reston_va',
    styleCategory: 'midcentury',
    structureBucket: 'condo_coop',
    tags: ['private_yard'],
    figureCaption: 'Plate VII — 1979 Wooded Brick & Cedar Garden Condo, Lake Anne Reston VA',
    searchKeywords: ['garden condo', 'balcony', 'fireplace', 'trails'],
  },
  'DMV-008': {
    plateId: 'bowie_capecod',
    areaId: 'pg_md',
    styleCategory: 'midcentury',
    structureBucket: 'detached_single',
    tags: ['private_yard', 'low_no_hoa'],
    figureCaption: 'Plate VIII — 1964 Expanded Cape Cod Single-Family, Bowie MD',
    searchKeywords: ['cape cod', 'fenced backyard', 'no HOA', 'driveway'],
  },
  'DMV-009': {
    plateId: 'takoma_craftsman',
    areaId: 'montgomery_md',
    styleCategory: 'historic',
    structureBucket: 'detached_single',
    tags: ['historic_brick', 'private_yard', 'low_no_hoa'],
    figureCaption: 'Plate IX — 1923 Craftsman Bungalow, Takoma Park MD',
    searchKeywords: ['craftsman', 'front porch', 'fenced yard', 'no HOA'],
  },
  'DMV-010': {
    plateId: 'arlington_colonial',
    areaId: 'arlington_alexandria_va',
    styleCategory: 'historic',
    structureBucket: 'detached_single',
    tags: ['historic_brick', 'private_yard', 'garage_parking', 'low_no_hoa'],
    figureCaption: 'Plate X — 1948 Center-Hall Brick Colonial, Arlington VA',
    searchKeywords: ['brick colonial', 'garage', 'fenced yard', 'no HOA'],
  },
  'DMV-011': {
    plateId: 'navy_yard_loft',
    areaId: 'dc',
    styleCategory: 'modern',
    structureBucket: 'condo_coop',
    tags: ['modern_movein', 'garage_parking'],
    figureCaption: 'Plate XI — 2016 Brick & Steel Modern Loft Condo, Navy Yard DC',
    searchKeywords: ['modern loft', 'garage parking', 'walk to metro', 'quartz kitchen'],
  },
  'DMV-012': {
    plateId: 'del_ray_townhome',
    areaId: 'arlington_alexandria_va',
    styleCategory: 'historic',
    structureBucket: 'townhouse_rowhouse',
    tags: ['historic_brick', 'private_yard', 'low_no_hoa'],
    figureCaption: 'Plate XII — 1941 Painted-Brick Porch Townhome, Del Ray Alexandria VA',
    searchKeywords: ['front porch', 'fenced yard', 'no HOA', 'walkable'],
  },
};

function enrichListing(raw: RawDMVListing, isDatasetBenchmark: boolean): HomeCandidate {
  const meta = LISTING_META[raw.listing_id];
  if (meta) {
    return {
      ...raw,
      ...meta,
      isDatasetBenchmark,
    };
  }

  // Safe fallback for any additional records if dataset changes
  const areaId: DMVAreaId =
    raw.address.state === 'DC'
      ? 'dc'
      : raw.address.jurisdiction.toLowerCase().includes('montgomery')
        ? 'montgomery_md'
        : raw.address.state === 'MD'
          ? 'pg_md'
          : raw.address.jurisdiction.toLowerCase().includes('arlington')
            ? 'arlington_alexandria_va'
            : 'fairfax_reston_va';

  const typeLower = raw.property_details.property_type.toLowerCase();
  const structureBucket: HomeCandidate['structureBucket'] =
    typeLower.includes('condo') || typeLower.includes('co-op')
      ? 'condo_coop'
      : typeLower.includes('townhouse') || typeLower.includes('rowhouse')
        ? 'townhouse_rowhouse'
        : 'detached_single';

  return {
    ...raw,
    plateId: 'petworth_rowhouse',
    areaId,
    isDatasetBenchmark,
    styleCategory: 'traditional',
    structureBucket,
    tags: raw.financials_and_hoa.has_hoa ? [] : ['low_no_hoa'],
    figureCaption: `${raw.property_details.architectural_style}, ${raw.address.city} ${raw.address.state}`,
    searchKeywords: [raw.property_details.architectural_style.toLowerCase()],
  };
}

export async function loadDMVHomeBank(): Promise<HomeCandidate[]> {
  let benchmarkListings: RawDMVListing[] = [];
  try {
    const res = await fetch(DMV_DATASET_URL);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json)) {
        benchmarkListings = json as RawDMVListing[];
      }
    }
  } catch (err) {
    console.error('Could not load local DMV dataset:', err);
  }

  const enrichedBenchmarks = benchmarkListings.map((item) => enrichListing(item, true));
  const enrichedSupplemental = SUPPLEMENTAL_DMV_CONCEPTS.map((item) => enrichListing(item, false));
  return [...enrichedBenchmarks, ...enrichedSupplemental];
}
