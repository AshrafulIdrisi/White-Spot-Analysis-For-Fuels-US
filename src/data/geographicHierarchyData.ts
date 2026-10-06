import { 
  GeoState, 
  GeoCounty, 
  GeoCity, 
  GeoZipCode, 
  GeoStreet, 
  GeoLocationPoint, 
  StreetScoringWeights 
} from '../types.ts';
import { ALL_US_STATES } from './usStatesData.ts';

// Default scoring weights as requested in framework:
// 25% Demand + 20% Population + 15% Income + 15% Accessibility + 15% Competition Gap + 10% Commercial Opportunity
export const DEFAULT_STREET_SCORING_WEIGHTS: StreetScoringWeights = {
  demandWeight: 25,
  populationWeight: 20,
  incomeWeight: 15,
  accessibilityWeight: 15,
  competitionGapWeight: 15,
  commercialWeight: 10
};

// --------------------------------------------------------------------------
// 1. ALL 50 US STATES + DC MASTER
// --------------------------------------------------------------------------
export const GEO_STATES_MASTER: GeoState[] = ALL_US_STATES.map(s => ({
  stateCode: s.code,
  stateName: s.name,
  capital: s.capital,
  region: s.region,
  lat: s.lat,
  lng: s.lng,
  zoom: s.zoom,
  population: s.code === 'CA' ? 39029342 : s.code === 'TX' ? 30029572 : s.code === 'FL' ? 22244823 : s.code === 'NY' ? 19677151 : 5800000,
  countiesCount: s.code === 'TX' ? 254 : s.code === 'GA' ? 159 : s.code === 'VA' ? 133 : s.code === 'CA' ? 58 : 67,
  citiesCount: s.code === 'TX' ? 1224 : s.code === 'CA' ? 482 : s.code === 'FL' ? 412 : 350,
  zipCodesCount: s.code === 'TX' ? 1935 : s.code === 'CA' ? 1763 : s.code === 'NY' ? 1794 : 850,
  marketDescription: s.marketDescription,
  fuelDemandIndex: s.fuelDemandIndex,
  evAdoptionRank: s.evAdoptionRank
}));

// --------------------------------------------------------------------------
// 2. AUTHORITATIVE COUNTY MASTER DATASET
// --------------------------------------------------------------------------
export const GEO_COUNTIES_MASTER: GeoCounty[] = [
  // TEXAS
  {
    countyId: 'tx-harris',
    countyName: 'Harris County',
    stateCode: 'TX',
    fipsCode: '48201',
    countySeat: 'Houston',
    lat: 29.8584,
    lng: -95.3932,
    population: 4780913,
    households: 1684200,
    medianHouseholdIncome: 74200,
    povertyRatePct: 15.8,
    citiesCount: 34,
    zipCodesCount: 142
  },
  {
    countyId: 'tx-collin',
    countyName: 'Collin County',
    stateCode: 'TX',
    fipsCode: '48085',
    countySeat: 'McKinney',
    lat: 33.1872,
    lng: -96.5714,
    population: 1154000,
    households: 412000,
    medianHouseholdIncome: 116500,
    povertyRatePct: 6.2,
    citiesCount: 22,
    zipCodesCount: 38
  },
  {
    countyId: 'tx-travis',
    countyName: 'Travis County',
    stateCode: 'TX',
    fipsCode: '48453',
    countySeat: 'Austin',
    lat: 30.3344,
    lng: -97.7766,
    population: 1326437,
    households: 542100,
    medianHouseholdIncome: 92800,
    povertyRatePct: 11.4,
    citiesCount: 21,
    zipCodesCount: 52
  },
  {
    countyId: 'tx-bexar',
    countyName: 'Bexar County',
    stateCode: 'TX',
    fipsCode: '48029',
    countySeat: 'San Antonio',
    lat: 29.4489,
    lng: -98.5200,
    population: 2059530,
    households: 718000,
    medianHouseholdIncome: 68500,
    povertyRatePct: 16.2,
    citiesCount: 26,
    zipCodesCount: 78
  },
  {
    countyId: 'tx-dallas',
    countyName: 'Dallas County',
    stateCode: 'TX',
    fipsCode: '48113',
    countySeat: 'Dallas',
    lat: 32.7668,
    lng: -96.7799,
    population: 2613539,
    households: 986000,
    medianHouseholdIncome: 72400,
    povertyRatePct: 14.8,
    citiesCount: 26,
    zipCodesCount: 96
  },
  {
    countyId: 'tx-hays',
    countyName: 'Hays County',
    stateCode: 'TX',
    fipsCode: '48209',
    countySeat: 'San Marcos',
    lat: 30.0544,
    lng: -98.0345,
    population: 268000,
    households: 98000,
    medianHouseholdIncome: 86400,
    povertyRatePct: 9.8,
    citiesCount: 11,
    zipCodesCount: 16
  },

  // FLORIDA
  {
    countyId: 'fl-orange',
    countyName: 'Orange County',
    stateCode: 'FL',
    fipsCode: '12095',
    countySeat: 'Orlando',
    lat: 28.5126,
    lng: -81.3324,
    population: 1452740,
    households: 524000,
    medianHouseholdIncome: 75200,
    povertyRatePct: 13.2,
    citiesCount: 13,
    zipCodesCount: 58
  },
  {
    countyId: 'fl-pasco',
    countyName: 'Pasco County',
    stateCode: 'FL',
    fipsCode: '12101',
    countySeat: 'Dade City',
    lat: 28.2989,
    lng: -82.4344,
    population: 608000,
    households: 236000,
    medianHouseholdIncome: 71800,
    povertyRatePct: 11.8,
    citiesCount: 8,
    zipCodesCount: 28
  },
  {
    countyId: 'fl-palm-beach',
    countyName: 'Palm Beach County',
    stateCode: 'FL',
    fipsCode: '12099',
    countySeat: 'West Palm Beach',
    lat: 26.6465,
    lng: -80.4736,
    population: 1518152,
    households: 598000,
    medianHouseholdIncome: 82500,
    povertyRatePct: 11.2,
    citiesCount: 39,
    zipCodesCount: 64
  },
  {
    countyId: 'fl-miami-dade',
    countyName: 'Miami-Dade County',
    stateCode: 'FL',
    fipsCode: '12086',
    countySeat: 'Miami',
    lat: 25.6111,
    lng: -80.5555,
    population: 2701767,
    households: 942000,
    medianHouseholdIncome: 62800,
    povertyRatePct: 16.5,
    citiesCount: 34,
    zipCodesCount: 92
  },

  // CALIFORNIA
  {
    countyId: 'ca-san-bernardino',
    countyName: 'San Bernardino County',
    stateCode: 'CA',
    fipsCode: '06071',
    countySeat: 'San Bernardino',
    lat: 34.8253,
    lng: -116.0833,
    population: 2194710,
    households: 684000,
    medianHouseholdIncome: 79200,
    povertyRatePct: 14.2,
    citiesCount: 24,
    zipCodesCount: 76
  },
  {
    countyId: 'ca-orange',
    countyName: 'Orange County',
    stateCode: 'CA',
    fipsCode: '06059',
    countySeat: 'Santa Ana',
    lat: 33.7175,
    lng: -117.8311,
    population: 3167809,
    households: 1068000,
    medianHouseholdIncome: 106200,
    povertyRatePct: 10.1,
    citiesCount: 34,
    zipCodesCount: 88
  },
  {
    countyId: 'ca-los-angeles',
    countyName: 'Los Angeles County',
    stateCode: 'CA',
    fipsCode: '06037',
    countySeat: 'Los Angeles',
    lat: 34.0522,
    lng: -118.2437,
    population: 9829544,
    households: 3348000,
    medianHouseholdIncome: 83400,
    povertyRatePct: 14.6,
    citiesCount: 88,
    zipCodesCount: 290
  },

  // GEORGIA
  {
    countyId: 'ga-forsyth',
    countyName: 'Forsyth County',
    stateCode: 'GA',
    fipsCode: '13117',
    countySeat: 'Cumming',
    lat: 34.2289,
    lng: -84.1245,
    population: 267000,
    households: 89000,
    medianHouseholdIncome: 128400,
    povertyRatePct: 5.4,
    citiesCount: 4,
    zipCodesCount: 8
  },
  {
    countyId: 'ga-fulton',
    countyName: 'Fulton County',
    stateCode: 'GA',
    fipsCode: '13121',
    countySeat: 'Atlanta',
    lat: 33.7903,
    lng: -84.4684,
    population: 1074630,
    households: 448000,
    medianHouseholdIncome: 86200,
    povertyRatePct: 13.6,
    citiesCount: 15,
    zipCodesCount: 48
  },

  // NORTH CAROLINA
  {
    countyId: 'nc-wake',
    countyName: 'Wake County',
    stateCode: 'NC',
    fipsCode: '37183',
    countySeat: 'Raleigh',
    lat: 35.7928,
    lng: -78.6508,
    population: 1175000,
    households: 458000,
    medianHouseholdIncome: 96800,
    povertyRatePct: 8.2,
    citiesCount: 12,
    zipCodesCount: 42
  },

  // ARIZONA
  {
    countyId: 'az-maricopa',
    countyName: 'Maricopa County',
    stateCode: 'AZ',
    fipsCode: '04013',
    countySeat: 'Phoenix',
    lat: 33.4484,
    lng: -112.0740,
    population: 4585871,
    households: 1680000,
    medianHouseholdIncome: 82600,
    povertyRatePct: 12.1,
    citiesCount: 25,
    zipCodesCount: 118
  },

  // OHIO
  {
    countyId: 'oh-franklin',
    countyName: 'Franklin County',
    stateCode: 'OH',
    fipsCode: '39049',
    countySeat: 'Columbus',
    lat: 39.9699,
    lng: -83.0111,
    population: 1326000,
    households: 546000,
    medianHouseholdIncome: 74800,
    povertyRatePct: 14.5,
    citiesCount: 16,
    zipCodesCount: 54
  },

  // VIRGINIA
  {
    countyId: 'va-loudoun',
    countyName: 'Loudoun County',
    stateCode: 'VA',
    fipsCode: '51107',
    countySeat: 'Leesburg',
    lat: 39.0837,
    lng: -77.6497,
    population: 432000,
    households: 146000,
    medianHouseholdIncome: 168200,
    povertyRatePct: 3.8,
    citiesCount: 7,
    zipCodesCount: 18
  }
];

// --------------------------------------------------------------------------
// 3. AUTHORITATIVE CITIES MASTER DATASET
// --------------------------------------------------------------------------
export const GEO_CITIES_MASTER: GeoCity[] = [
  // TEXAS - Harris County
  {
    cityId: 'city-cypress',
    cityName: 'Cypress',
    countyId: 'tx-harris',
    countyName: 'Harris County',
    stateCode: 'TX',
    lat: 29.9691,
    lng: -95.6972,
    population: 182400,
    households: 59200,
    medianHouseholdIncome: 118500,
    zipCodes: ['77433', '77429'],
    majorCorridors: ['TX-99 Grand Parkway', 'US-290 Northwest Freeway', 'FM 529', 'Fry Road']
  },
  {
    cityId: 'city-houston',
    cityName: 'Houston',
    countyId: 'tx-harris',
    countyName: 'Harris County',
    stateCode: 'TX',
    lat: 29.7604,
    lng: -95.3698,
    population: 2304580,
    households: 884000,
    medianHouseholdIncome: 60400,
    zipCodes: ['77002', '77006', '77024', '77056', '77077'],
    majorCorridors: ['I-10 Katy Fwy', 'I-45 Gulf/North Fwy', 'I-610 Loop', 'US-59/I-69']
  },

  // TEXAS - Collin County
  {
    cityId: 'city-prosper',
    cityName: 'Prosper',
    countyId: 'tx-collin',
    countyName: 'Collin County',
    stateCode: 'TX',
    lat: 33.2362,
    lng: -96.8011,
    population: 42800,
    households: 12400,
    medianHouseholdIncome: 154000,
    zipCodes: ['75078'],
    majorCorridors: ['Dallas North Tollway (DNT)', 'US-380 University Dr', 'Frontier Pkwy', 'Preston Rd (SH-289)']
  },
  {
    cityId: 'city-frisco',
    cityName: 'Frisco',
    countyId: 'tx-collin',
    countyName: 'Collin County',
    stateCode: 'TX',
    lat: 33.1507,
    lng: -96.8236,
    population: 218000,
    households: 74200,
    medianHouseholdIncome: 142000,
    zipCodes: ['75034', '75035'],
    majorCorridors: ['Dallas North Tollway', 'Sam Rayburn Tollway (SH-121)', 'Preston Rd']
  },

  // TEXAS - Hays County
  {
    cityId: 'city-kyle',
    cityName: 'Kyle',
    countyId: 'tx-hays',
    countyName: 'Hays County',
    stateCode: 'TX',
    lat: 29.9891,
    lng: -97.8772,
    population: 57400,
    households: 18200,
    medianHouseholdIncome: 94000,
    zipCodes: ['78640'],
    majorCorridors: ['I-35 Corridor', 'SH-130 Tollway Connector', 'FM 1626', 'Yarrington Rd']
  },

  // FLORIDA - Orange County
  {
    cityId: 'city-winter-garden',
    cityName: 'Winter Garden (Horizon West)',
    countyId: 'fl-orange',
    countyName: 'Orange County',
    stateCode: 'FL',
    lat: 28.5653,
    lng: -81.5862,
    population: 51200,
    households: 17800,
    medianHouseholdIncome: 112000,
    zipCodes: ['34787'],
    majorCorridors: ['SR-429 Daniel Webster Western Beltway', 'SR-50 Colonial Dr', 'Western Way (Disney Expansion)', 'Avalon Rd']
  },

  // FLORIDA - Pasco County
  {
    cityId: 'city-wesley-chapel',
    cityName: 'Wesley Chapel',
    countyId: 'fl-pasco',
    countyName: 'Pasco County',
    stateCode: 'FL',
    lat: 28.2412,
    lng: -82.3421,
    population: 64800,
    households: 22400,
    medianHouseholdIncome: 98000,
    zipCodes: ['33544', '33543'],
    majorCorridors: ['I-75 North Interchange', 'Overpass Rd Interchange', 'SR-56', 'Bruce B Downs Blvd']
  },

  // CALIFORNIA - San Bernardino County
  {
    cityId: 'city-ontario',
    cityName: 'Ontario',
    countyId: 'ca-san-bernardino',
    countyName: 'San Bernardino County',
    stateCode: 'CA',
    lat: 34.0633,
    lng: -117.6509,
    population: 182000,
    households: 52000,
    medianHouseholdIncome: 92000,
    zipCodes: ['91761', '91762', '91764'],
    majorCorridors: ['I-15 Interstate Expressway', 'I-10 San Bernardino Fwy', 'SR-60 Pomona Fwy', 'Haven Ave Freight Corridor']
  },

  // CALIFORNIA - Orange County
  {
    cityId: 'city-irvine',
    cityName: 'Irvine',
    countyId: 'ca-orange',
    countyName: 'Orange County',
    stateCode: 'CA',
    lat: 33.6846,
    lng: -117.8265,
    population: 309000,
    households: 108000,
    medianHouseholdIncome: 148000,
    zipCodes: ['92618', '92604', '92612'],
    majorCorridors: ['I-5 Santa Ana Fwy', 'I-405 San Diego Fwy', 'SR-133 Toll Rd', 'Irvine Center Dr']
  },

  // CALIFORNIA - Los Angeles County
  {
    cityId: 'city-los-angeles',
    cityName: 'Los Angeles',
    countyId: 'ca-los-angeles',
    countyName: 'Los Angeles County',
    stateCode: 'CA',
    lat: 34.0522,
    lng: -118.2437,
    population: 3822000,
    households: 1380000,
    medianHouseholdIncome: 76000,
    zipCodes: ['90001', '90012', '90028', '90210'],
    majorCorridors: ['I-10 Santa Monica Fwy', 'I-110 Harbor Fwy', 'I-5 Golden State Fwy', 'US-101 Hollywood Fwy', 'Alameda St']
  },

  // NORTH CAROLINA - Wake County
  {
    cityId: 'city-apex',
    cityName: 'Apex (Research Triangle)',
    countyId: 'nc-wake',
    countyName: 'Wake County',
    stateCode: 'NC',
    lat: 35.7327,
    lng: -78.8503,
    population: 71000,
    households: 24600,
    medianHouseholdIncome: 126000,
    zipCodes: ['27502', '27523'],
    majorCorridors: ['NC-540 Western Wake Expressway', 'US-1 Highway', 'Apex Peakway', 'Kelly Rd']
  },

  // ARIZONA - Maricopa County
  {
    cityId: 'city-queen-creek',
    cityName: 'Queen Creek (East Valley)',
    countyId: 'az-maricopa',
    countyName: 'Maricopa County',
    stateCode: 'AZ',
    lat: 33.2487,
    lng: -111.6343,
    population: 72000,
    households: 21800,
    medianHouseholdIncome: 114000,
    zipCodes: ['85142'],
    majorCorridors: ['State Route 24 (SR-24 Extension)', 'Ellsworth Rd Semiconductor Spine', 'Rittenhouse Rd', 'Hunt Hwy']
  },

  // OHIO - Franklin County
  {
    cityId: 'city-new-albany',
    cityName: 'New Albany (Silicon Heartland)',
    countyId: 'oh-franklin',
    countyName: 'Franklin County',
    stateCode: 'OH',
    lat: 40.0812,
    lng: -82.8088,
    population: 11600,
    households: 3900,
    medianHouseholdIncome: 162000,
    zipCodes: ['43054'],
    majorCorridors: ['OH-161 Expressway', 'Beech Rd (Intel Mega-Fab Spine)', 'Central College Rd', 'Johnstown Rd']
  },

  // VIRGINIA - Loudoun County
  {
    cityId: 'city-ashburn',
    cityName: 'Ashburn (Data Center Alley)',
    countyId: 'va-loudoun',
    countyName: 'Loudoun County',
    stateCode: 'VA',
    lat: 39.0437,
    lng: -77.4875,
    population: 46200,
    households: 15400,
    medianHouseholdIncome: 168000,
    zipCodes: ['20147', '20148'],
    majorCorridors: ['SR-267 Dulles Greenway', 'Route 28 Sully Rd', 'Waxpool Rd Data Center Spine', 'Claiborne Pkwy']
  }
];

// --------------------------------------------------------------------------
// 4. AUTHORITATIVE ZIP / ZCTA MASTER WITH SPATIAL BOUNDS & ATTRIBUTES
// --------------------------------------------------------------------------
export const GEO_ZIPCODES_MASTER: GeoZipCode[] = [
  {
    zipCode: '77433',
    cityId: 'city-cypress',
    cityName: 'Cypress',
    countyId: 'tx-harris',
    countyName: 'Harris County',
    stateCode: 'TX',
    stateName: 'Texas',
    lat: 29.8785,
    lng: -95.7892,
    population: 68400,
    households: 21800,
    housingUnits: 23100,
    medianHouseholdIncome: 118500,
    perCapitaIncome: 46200,
    povertyRate: 4.8,
    zone: 'GREEN',
    opportunityScore: 94.2,
    corridorAadt: 62000,
    streetsCount: 8,
    boundingBox: [29.8200, -95.8400, 29.9400, -95.7200]
  },
  {
    zipCode: '75078',
    cityId: 'city-prosper',
    cityName: 'Prosper',
    countyId: 'tx-collin',
    countyName: 'Collin County',
    stateCode: 'TX',
    stateName: 'Texas',
    lat: 33.2512,
    lng: -96.8124,
    population: 52000,
    households: 15200,
    housingUnits: 16400,
    medianHouseholdIncome: 142000,
    perCapitaIncome: 58900,
    povertyRate: 3.2,
    zone: 'GREEN',
    opportunityScore: 92.8,
    corridorAadt: 48000,
    streetsCount: 6,
    boundingBox: [33.1900, -96.8600, 33.3100, -96.7600]
  },
  {
    zipCode: '78640',
    cityId: 'city-kyle',
    cityName: 'Kyle',
    countyId: 'tx-hays',
    countyName: 'Hays County',
    stateCode: 'TX',
    stateName: 'Texas',
    lat: 29.9654,
    lng: -97.9021,
    population: 41000,
    households: 13400,
    housingUnits: 14200,
    medianHouseholdIncome: 94000,
    perCapitaIncome: 38200,
    povertyRate: 6.8,
    zone: 'GREEN',
    opportunityScore: 93.5,
    corridorAadt: 89000,
    streetsCount: 5,
    boundingBox: [29.9100, -97.9600, 30.0200, -97.8400]
  },
  {
    zipCode: '77002',
    cityId: 'city-houston',
    cityName: 'Houston (Downtown)',
    countyId: 'tx-harris',
    countyName: 'Harris County',
    stateCode: 'TX',
    stateName: 'Texas',
    lat: 29.7589,
    lng: -95.3677,
    population: 22000,
    households: 11400,
    housingUnits: 13200,
    medianHouseholdIncome: 74000,
    perCapitaIncome: 48500,
    povertyRate: 16.4,
    zone: 'RED',
    opportunityScore: 48.2,
    corridorAadt: 24000,
    streetsCount: 6,
    boundingBox: [29.7400, -95.3850, 29.7750, -95.3500]
  },
  {
    zipCode: '34787',
    cityId: 'city-winter-garden',
    cityName: 'Winter Garden',
    countyId: 'fl-orange',
    countyName: 'Orange County',
    stateCode: 'FL',
    stateName: 'Florida',
    lat: 28.3842,
    lng: -81.6124,
    population: 62000,
    households: 20400,
    housingUnits: 22100,
    medianHouseholdIncome: 112000,
    perCapitaIncome: 45800,
    povertyRate: 5.1,
    zone: 'GREEN',
    opportunityScore: 93.8,
    corridorAadt: 56000,
    streetsCount: 6,
    boundingBox: [28.3200, -81.6600, 28.4500, -81.5600]
  },
  {
    zipCode: '33544',
    cityId: 'city-wesley-chapel',
    cityName: 'Wesley Chapel',
    countyId: 'fl-pasco',
    countyName: 'Pasco County',
    stateCode: 'FL',
    stateName: 'Florida',
    lat: 28.2412,
    lng: -82.3421,
    population: 49000,
    households: 16800,
    housingUnits: 18100,
    medianHouseholdIncome: 98000,
    perCapitaIncome: 41200,
    povertyRate: 6.4,
    zone: 'GREEN',
    opportunityScore: 92.1,
    corridorAadt: 84000,
    streetsCount: 5,
    boundingBox: [28.1800, -82.3900, 28.3000, -82.2900]
  },
  {
    zipCode: '91761',
    cityId: 'city-ontario',
    cityName: 'Ontario',
    countyId: 'ca-san-bernardino',
    countyName: 'San Bernardino County',
    stateCode: 'CA',
    stateName: 'California',
    lat: 34.0412,
    lng: -117.5621,
    population: 94000,
    households: 26400,
    housingUnits: 27900,
    medianHouseholdIncome: 92000,
    perCapitaIncome: 34800,
    povertyRate: 11.8,
    zone: 'GREEN',
    opportunityScore: 95.4,
    corridorAadt: 142000,
    streetsCount: 7,
    boundingBox: [33.9800, -117.6200, 34.1000, -117.5000]
  },
  {
    zipCode: '92618',
    cityId: 'city-irvine',
    cityName: 'Irvine',
    countyId: 'ca-orange',
    countyName: 'Orange County',
    stateCode: 'CA',
    stateName: 'California',
    lat: 33.6612,
    lng: -117.7612,
    population: 112000,
    households: 39400,
    housingUnits: 41800,
    medianHouseholdIncome: 148000,
    perCapitaIncome: 64200,
    povertyRate: 7.2,
    zone: 'GREEN',
    opportunityScore: 93.2,
    corridorAadt: 78000,
    streetsCount: 6,
    boundingBox: [33.6000, -117.8200, 33.7200, -117.7000]
  },
  {
    zipCode: '90001',
    cityId: 'city-los-angeles',
    cityName: 'Los Angeles (South LA)',
    countyId: 'ca-los-angeles',
    countyName: 'Los Angeles County',
    stateCode: 'CA',
    stateName: 'California',
    lat: 33.9731,
    lng: -118.2479,
    population: 59800,
    households: 14200,
    housingUnits: 14900,
    medianHouseholdIncome: 48200,
    perCapitaIncome: 18400,
    povertyRate: 26.4,
    zone: 'ORANGE',
    opportunityScore: 71.4,
    corridorAadt: 38000,
    streetsCount: 5,
    boundingBox: [33.9500, -118.2700, 34.0000, -118.2200]
  },
  {
    zipCode: '27502',
    cityId: 'city-apex',
    cityName: 'Apex',
    countyId: 'nc-wake',
    countyName: 'Wake County',
    stateCode: 'NC',
    stateName: 'North Carolina',
    lat: 35.7412,
    lng: -78.8612,
    population: 66000,
    households: 23100,
    housingUnits: 24200,
    medianHouseholdIncome: 126000,
    perCapitaIncome: 51200,
    povertyRate: 4.2,
    zone: 'GREEN',
    opportunityScore: 92.4,
    corridorAadt: 58000,
    streetsCount: 5,
    boundingBox: [35.6800, -78.9200, 35.8000, -78.8000]
  },
  {
    zipCode: '85142',
    cityId: 'city-queen-creek',
    cityName: 'Queen Creek',
    countyId: 'az-maricopa',
    countyName: 'Maricopa County',
    stateCode: 'AZ',
    stateName: 'Arizona',
    lat: 33.2841,
    lng: -111.6421,
    population: 64000,
    households: 19800,
    housingUnits: 21200,
    medianHouseholdIncome: 114000,
    perCapitaIncome: 42800,
    povertyRate: 5.6,
    zone: 'GREEN',
    opportunityScore: 93.1,
    corridorAadt: 54000,
    streetsCount: 5,
    boundingBox: [33.2200, -111.7000, 33.3400, -111.5800]
  },
  {
    zipCode: '43054',
    cityId: 'city-new-albany',
    cityName: 'New Albany',
    countyId: 'oh-franklin',
    countyName: 'Franklin County',
    stateCode: 'OH',
    stateName: 'Ohio',
    lat: 40.0912,
    lng: -82.7412,
    population: 38000,
    households: 13200,
    housingUnits: 14100,
    medianHouseholdIncome: 136000,
    perCapitaIncome: 56400,
    povertyRate: 4.0,
    zone: 'GREEN',
    opportunityScore: 94.5,
    corridorAadt: 46000,
    streetsCount: 5,
    boundingBox: [40.0400, -82.8000, 40.1500, -82.6800]
  },
  {
    zipCode: '20147',
    cityId: 'city-ashburn',
    cityName: 'Ashburn',
    countyId: 'va-loudoun',
    countyName: 'Loudoun County',
    stateCode: 'VA',
    stateName: 'Virginia',
    lat: 39.0212,
    lng: -77.4812,
    population: 84000,
    households: 27800,
    housingUnits: 29200,
    medianHouseholdIncome: 168000,
    perCapitaIncome: 69400,
    povertyRate: 2.8,
    zone: 'GREEN',
    opportunityScore: 93.7,
    corridorAadt: 64000,
    streetsCount: 6,
    boundingBox: [38.9600, -77.5400, 39.0800, -77.4200]
  }
];

// --------------------------------------------------------------------------
// 5. AUTHORITATIVE STREET / ROAD NETWORK DATASET
// --------------------------------------------------------------------------
export const GEO_STREETS_MASTER: GeoStreet[] = [
  // TEXAS - ZIP 77433 (Cypress, TX)
  {
    streetId: 'str-tx-77433-01',
    streetName: 'Grand Parkway (TX-99)',
    streetType: 'Highway / Parkway',
    cityName: 'Cypress',
    countyName: 'Harris County',
    stateCode: 'TX',
    zipCode: '77433',
    latitude: 29.8785,
    longitude: -95.7892,
    roadType: 'Primary Arterial Expressway',
    roadClass: 'Class 1 State Highway',
    speedLimitMph: 65,
    lanes: 6,
    oneWay: false,
    bridge: true,
    tunnel: false,
    access: 'Controlled Access Feeder Intersections',
    corridorAadt: 62000,
    connectingRoadsCount: 14,
    intersectionDensityPerSqMile: 8.4,
    nearestHighwayName: 'TX-99 Grand Pkwy (Direct)',
    nearestHighwayDistanceMiles: 0.0,
    pop05Mile: 8400,
    pop1Mile: 24200,
    pop3Mile: 68400,
    households1Mile: 7800,
    medianHouseholdIncome: 118500,
    consumerDensityIndex: 94,
    commercialDensityIndex: 82,
    competitorCount05Mile: 0,
    competitorCount1Mile: 1,
    competitorCount3Mile: 2,
    competitorDensityRatio: 0.000041,
    nearestStationDistanceMiles: 1.8,
    nearestCompetitorDistanceMiles: 3.2,
    nearestCompetitorBrand: 'Shell (Dated 6-Pump Station)',
    whiteSpotScore: 94.2,
    opportunityTier: 'Excellent White Spot',
    scoreBreakdown: {
      demand: 96,
      population: 94,
      income: 92,
      accessibility: 98,
      competitionGap: 95,
      commercialOpportunity: 88
    },
    unmetFuelDemandGallonsYear: 3950000,
    unmetCStoreDemandUsdYear: 3450000,
    recommendedFormat: '16-MPD Mega Forecourt + Gourmet Kitchen + 8 EV Fast Chargers',
    recommendedPumps: 16,
    evChargingDeficitPorts: 8,
    dataSource: 'TxDOT HPMS 2026 Traffic Counts & US Census TIGER/Line',
    sourceDate: '2026-08-15',
    lastUpdated: '2026-10-01',
    dataQualityRating: 'Authoritative Verified'
  },
  {
    streetId: 'str-tx-77433-02',
    streetName: 'FM 529 (Freeman Rd)',
    streetType: 'Road',
    cityName: 'Cypress',
    countyName: 'Harris County',
    stateCode: 'TX',
    zipCode: '77433',
    latitude: 29.8842,
    longitude: -95.7712,
    roadType: 'Secondary Arterial',
    roadClass: 'Class 2 Farm-to-Market',
    speedLimitMph: 50,
    lanes: 4,
    oneWay: false,
    bridge: false,
    tunnel: false,
    access: 'Commercial Access with Dual Ingress',
    corridorAadt: 44000,
    connectingRoadsCount: 9,
    intersectionDensityPerSqMile: 6.2,
    nearestHighwayName: 'TX-99 Grand Pkwy',
    nearestHighwayDistanceMiles: 0.8,
    pop05Mile: 6200,
    pop1Mile: 19400,
    pop3Mile: 58000,
    households1Mile: 6100,
    medianHouseholdIncome: 114000,
    consumerDensityIndex: 88,
    commercialDensityIndex: 78,
    competitorCount05Mile: 1,
    competitorCount1Mile: 2,
    competitorCount3Mile: 3,
    competitorDensityRatio: 0.000103,
    nearestStationDistanceMiles: 0.5,
    nearestCompetitorDistanceMiles: 1.2,
    nearestCompetitorBrand: 'Chevron',
    whiteSpotScore: 89.6,
    opportunityTier: 'Excellent White Spot',
    scoreBreakdown: {
      demand: 90,
      population: 88,
      income: 90,
      accessibility: 92,
      competitionGap: 88,
      commercialOpportunity: 86
    },
    unmetFuelDemandGallonsYear: 2850000,
    unmetCStoreDemandUsdYear: 2600000,
    recommendedFormat: '12-MPD Forecourt + Fresh Kitchen + 4 EV Ports',
    recommendedPumps: 12,
    evChargingDeficitPorts: 4,
    dataSource: 'TxDOT HPMS & OpenStreetMap Spatial Index',
    sourceDate: '2026-08-15',
    lastUpdated: '2026-10-01',
    dataQualityRating: 'Authoritative Verified'
  },
  {
    streetId: 'str-tx-77433-03',
    streetName: 'Fry Road',
    streetType: 'Road',
    cityName: 'Cypress',
    countyName: 'Harris County',
    stateCode: 'TX',
    zipCode: '77433',
    latitude: 29.8950,
    longitude: -95.7180,
    roadType: 'Major Boulevard Commercial Arterial',
    roadClass: 'Class 2 Major Arterial',
    speedLimitMph: 45,
    lanes: 6,
    oneWay: false,
    bridge: false,
    tunnel: false,
    access: 'Public Unrestricted Dual Median Cuts',
    corridorAadt: 48000,
    connectingRoadsCount: 16,
    intersectionDensityPerSqMile: 9.8,
    nearestHighwayName: 'US-290 Northwest Fwy',
    nearestHighwayDistanceMiles: 2.1,
    pop05Mile: 9100,
    pop1Mile: 26800,
    pop3Mile: 72000,
    households1Mile: 8400,
    medianHouseholdIncome: 122000,
    consumerDensityIndex: 92,
    commercialDensityIndex: 89,
    competitorCount05Mile: 2,
    competitorCount1Mile: 4,
    competitorCount3Mile: 6,
    competitorDensityRatio: 0.000149,
    nearestStationDistanceMiles: 0.3,
    nearestCompetitorDistanceMiles: 0.7,
    nearestCompetitorBrand: 'Kroger Fuel & Circle K',
    whiteSpotScore: 81.4,
    opportunityTier: 'High',
    scoreBreakdown: {
      demand: 86,
      population: 92,
      income: 94,
      accessibility: 88,
      competitionGap: 68,
      commercialOpportunity: 85
    },
    unmetFuelDemandGallonsYear: 1950000,
    unmetCStoreDemandUsdYear: 2400000,
    recommendedFormat: '10-MPD Modern Infill + Premium Synergy C-Store',
    recommendedPumps: 10,
    evChargingDeficitPorts: 6,
    dataSource: 'TxDOT & Harris County Engineering',
    sourceDate: '2026-08-15',
    lastUpdated: '2026-10-01',
    dataQualityRating: 'Authoritative Verified'
  },

  // TEXAS - ZIP 75078 (Prosper, TX)
  {
    streetId: 'str-tx-75078-01',
    streetName: 'Dallas North Tollway (DNT)',
    streetType: 'Tollway / Highway',
    cityName: 'Prosper',
    countyName: 'Collin County',
    stateCode: 'TX',
    zipCode: '75078',
    latitude: 33.2512,
    longitude: -96.8124,
    roadType: 'Controlled Access Mega Tollway',
    roadClass: 'Class 1 Regional Tollway',
    speedLimitMph: 70,
    lanes: 6,
    oneWay: false,
    bridge: true,
    tunnel: false,
    access: 'Controlled Access Interchanges',
    corridorAadt: 48000,
    connectingRoadsCount: 11,
    intersectionDensityPerSqMile: 5.8,
    nearestHighwayName: 'DNT (Direct Frontage)',
    nearestHighwayDistanceMiles: 0.0,
    pop05Mile: 6800,
    pop1Mile: 18400,
    pop3Mile: 52000,
    households1Mile: 5600,
    medianHouseholdIncome: 142000,
    consumerDensityIndex: 96,
    commercialDensityIndex: 84,
    competitorCount05Mile: 0,
    competitorCount1Mile: 1,
    competitorCount3Mile: 2,
    competitorDensityRatio: 0.000054,
    nearestStationDistanceMiles: 1.4,
    nearestCompetitorDistanceMiles: 3.4,
    nearestCompetitorBrand: 'RaceTrac (3.4 mi South)',
    whiteSpotScore: 92.8,
    opportunityTier: 'Excellent White Spot',
    scoreBreakdown: {
      demand: 94,
      population: 90,
      income: 98,
      accessibility: 96,
      competitionGap: 94,
      commercialOpportunity: 88
    },
    unmetFuelDemandGallonsYear: 3200000,
    unmetCStoreDemandUsdYear: 3900000,
    recommendedFormat: '12-MPD Forecourt + High-Margin Synergy Supreme 93 + DC Fast Charging',
    recommendedPumps: 12,
    evChargingDeficitPorts: 6,
    dataSource: 'NTTA North Texas Tollway Authority & TxDOT',
    sourceDate: '2026-08-20',
    lastUpdated: '2026-10-01',
    dataQualityRating: 'Authoritative Verified'
  },
  {
    streetId: 'str-tx-75078-02',
    streetName: 'US-380 (University Drive)',
    streetType: 'Highway',
    cityName: 'Prosper',
    countyName: 'Collin County',
    stateCode: 'TX',
    zipCode: '75078',
    latitude: 33.2280,
    longitude: -96.7990,
    roadType: 'Primary Arterial East-West Spine',
    roadClass: 'Class 1 US Highway',
    speedLimitMph: 55,
    lanes: 6,
    oneWay: false,
    bridge: false,
    tunnel: false,
    access: 'Public Commercial Access',
    corridorAadt: 56000,
    connectingRoadsCount: 14,
    intersectionDensityPerSqMile: 7.2,
    nearestHighwayName: 'US-380 & DNT Interchange',
    nearestHighwayDistanceMiles: 0.4,
    pop05Mile: 7400,
    pop1Mile: 21000,
    pop3Mile: 58000,
    households1Mile: 6800,
    medianHouseholdIncome: 138000,
    consumerDensityIndex: 91,
    commercialDensityIndex: 90,
    competitorCount05Mile: 1,
    competitorCount1Mile: 3,
    competitorCount3Mile: 5,
    competitorDensityRatio: 0.000143,
    nearestStationDistanceMiles: 0.4,
    nearestCompetitorDistanceMiles: 0.9,
    nearestCompetitorBrand: 'QuikTrip & 7-Eleven',
    whiteSpotScore: 84.5,
    opportunityTier: 'High',
    scoreBreakdown: {
      demand: 88,
      population: 89,
      income: 96,
      accessibility: 90,
      competitionGap: 72,
      commercialOpportunity: 86
    },
    unmetFuelDemandGallonsYear: 2400000,
    unmetCStoreDemandUsdYear: 2900000,
    recommendedFormat: '10-MPD Infill Forecourt + Upscale Coffee Bar',
    recommendedPumps: 10,
    evChargingDeficitPorts: 4,
    dataSource: 'TxDOT HPMS & Collin County GIS',
    sourceDate: '2026-08-20',
    lastUpdated: '2026-10-01',
    dataQualityRating: 'Authoritative Verified'
  },

  // TEXAS - ZIP 78640 (Kyle, TX)
  {
    streetId: 'str-tx-78640-01',
    streetName: 'Interstate 35 (I-35 Frontage)',
    streetType: 'Interstate / Highway',
    cityName: 'Kyle',
    countyName: 'Hays County',
    stateCode: 'TX',
    zipCode: '78640',
    latitude: 29.9654,
    longitude: -97.9021,
    roadType: 'Interstate Freight Corridor',
    roadClass: 'Class 1 Federal Interstate',
    speedLimitMph: 70,
    lanes: 8,
    oneWay: false,
    bridge: true,
    tunnel: false,
    access: 'Direct Interstate Exit 215 Ramp Feed',
    corridorAadt: 89000,
    connectingRoadsCount: 18,
    intersectionDensityPerSqMile: 6.4,
    nearestHighwayName: 'I-35 & SH-130 Connection',
    nearestHighwayDistanceMiles: 0.0,
    pop05Mile: 5200,
    pop1Mile: 15400,
    pop3Mile: 41000,
    households1Mile: 5100,
    medianHouseholdIncome: 94000,
    consumerDensityIndex: 86,
    commercialDensityIndex: 88,
    competitorCount05Mile: 0,
    competitorCount1Mile: 1,
    competitorCount3Mile: 3,
    competitorDensityRatio: 0.000065,
    nearestStationDistanceMiles: 1.1,
    nearestCompetitorDistanceMiles: 2.8,
    nearestCompetitorBrand: 'Valero (2.8 mi North)',
    whiteSpotScore: 93.5,
    opportunityTier: 'Excellent White Spot',
    scoreBreakdown: {
      demand: 98,
      population: 86,
      income: 88,
      accessibility: 98,
      competitionGap: 96,
      commercialOpportunity: 92
    },
    unmetFuelDemandGallonsYear: 4800000,
    unmetCStoreDemandUsdYear: 3100000,
    recommendedFormat: '16-MPD Travel Plaza + High-Speed Commercial Diesel Master + 8 EV Ports',
    recommendedPumps: 16,
    evChargingDeficitPorts: 8,
    dataSource: 'TxDOT Freight Movement Division & FHWA',
    sourceDate: '2026-08-10',
    lastUpdated: '2026-10-01',
    dataQualityRating: 'Authoritative Verified'
  },

  // FLORIDA - ZIP 34787 (Winter Garden, FL)
  {
    streetId: 'str-fl-34787-01',
    streetName: 'SR-429 (Western Way Interchange)',
    streetType: 'Expressway',
    cityName: 'Winter Garden',
    countyName: 'Orange County',
    stateCode: 'FL',
    zipCode: '34787',
    latitude: 28.3842,
    longitude: -81.6124,
    roadType: 'State Toll Expressway',
    roadClass: 'Class 1 State Tollway',
    speedLimitMph: 65,
    lanes: 6,
    oneWay: false,
    bridge: true,
    tunnel: false,
    access: 'Controlled Access Toll Interchange',
    corridorAadt: 56000,
    connectingRoadsCount: 12,
    intersectionDensityPerSqMile: 6.9,
    nearestHighwayName: 'SR-429 Western Beltway',
    nearestHighwayDistanceMiles: 0.0,
    pop05Mile: 7800,
    pop1Mile: 22400,
    pop3Mile: 62000,
    households1Mile: 7400,
    medianHouseholdIncome: 112000,
    consumerDensityIndex: 95,
    commercialDensityIndex: 85,
    competitorCount05Mile: 0,
    competitorCount1Mile: 1,
    competitorCount3Mile: 2,
    competitorDensityRatio: 0.000045,
    nearestStationDistanceMiles: 1.6,
    nearestCompetitorDistanceMiles: 3.1,
    nearestCompetitorBrand: 'Wawa (3.1 mi East)',
    whiteSpotScore: 93.8,
    opportunityTier: 'Excellent White Spot',
    scoreBreakdown: {
      demand: 96,
      population: 93,
      income: 92,
      accessibility: 96,
      competitionGap: 95,
      commercialOpportunity: 90
    },
    unmetFuelDemandGallonsYear: 3700000,
    unmetCStoreDemandUsdYear: 3600000,
    recommendedFormat: '12-MPD Forecourt + Gourmet Fresh Food Kitchen + 8 EV Ports',
    recommendedPumps: 12,
    evChargingDeficitPorts: 8,
    dataSource: 'Florida DOT District 5 & Orange County GIS',
    sourceDate: '2026-08-18',
    lastUpdated: '2026-10-01',
    dataQualityRating: 'Authoritative Verified'
  },

  // CALIFORNIA - ZIP 91761 (Ontario, CA)
  {
    streetId: 'str-ca-91761-01',
    streetName: 'Haven Avenue & I-15 Interchange',
    streetType: 'Avenue / Interstate',
    cityName: 'Ontario',
    countyName: 'San Bernardino County',
    stateCode: 'CA',
    zipCode: '91761',
    latitude: 34.0412,
    longitude: -117.5621,
    roadType: 'Heavy Commercial Logistics Expressway',
    roadClass: 'Class 1 Major Freight Spine',
    speedLimitMph: 45,
    lanes: 8,
    oneWay: false,
    bridge: true,
    tunnel: false,
    access: 'Commercial Multi-Curb Heavy Rig Permitted',
    corridorAadt: 142000,
    connectingRoadsCount: 22,
    intersectionDensityPerSqMile: 7.8,
    nearestHighwayName: 'I-15 & I-10 Crossroads',
    nearestHighwayDistanceMiles: 0.1,
    pop05Mile: 11200,
    pop1Mile: 34000,
    pop3Mile: 94000,
    households1Mile: 9600,
    medianHouseholdIncome: 92000,
    consumerDensityIndex: 98,
    commercialDensityIndex: 96,
    competitorCount05Mile: 1,
    competitorCount1Mile: 2,
    competitorCount3Mile: 4,
    competitorDensityRatio: 0.000059,
    nearestStationDistanceMiles: 0.8,
    nearestCompetitorDistanceMiles: 2.4,
    nearestCompetitorBrand: 'Pilot Flying J & Chevron',
    whiteSpotScore: 95.4,
    opportunityTier: 'Excellent White Spot',
    scoreBreakdown: {
      demand: 99,
      population: 96,
      income: 90,
      accessibility: 99,
      competitionGap: 94,
      commercialOpportunity: 97
    },
    unmetFuelDemandGallonsYear: 5600000,
    unmetCStoreDemandUsdYear: 4200000,
    recommendedFormat: 'Mega Logistics Travel Center + 16-MPD + 12 350kW High-Power EV Chargers',
    recommendedPumps: 16,
    evChargingDeficitPorts: 12,
    dataSource: 'Caltrans District 8 & SCAG Regional Travel Model',
    sourceDate: '2026-08-25',
    lastUpdated: '2026-10-01',
    dataQualityRating: 'Authoritative Verified'
  },

  // CALIFORNIA - ZIP 90001 (Los Angeles, CA - South LA)
  {
    streetId: 'str-ca-90001-01',
    streetName: 'Alameda Street & Firestone Blvd',
    streetType: 'Street',
    cityName: 'Los Angeles',
    countyName: 'Los Angeles County',
    stateCode: 'CA',
    zipCode: '90001',
    latitude: 33.9731,
    longitude: -118.2479,
    roadType: 'Primary Industrial Commercial Arterial',
    roadClass: 'Class 2 Major Arterial',
    speedLimitMph: 40,
    lanes: 6,
    oneWay: false,
    bridge: false,
    tunnel: false,
    access: 'Public Commercial Access',
    corridorAadt: 38000,
    connectingRoadsCount: 15,
    intersectionDensityPerSqMile: 12.4,
    nearestHighwayName: 'I-110 Harbor Fwy',
    nearestHighwayDistanceMiles: 1.8,
    pop05Mile: 14200,
    pop1Mile: 41800,
    pop3Mile: 59800,
    households1Mile: 9800,
    medianHouseholdIncome: 48200,
    consumerDensityIndex: 78,
    commercialDensityIndex: 75,
    competitorCount05Mile: 2,
    competitorCount1Mile: 5,
    competitorCount3Mile: 9,
    competitorDensityRatio: 0.000120,
    nearestStationDistanceMiles: 0.3,
    nearestCompetitorDistanceMiles: 0.6,
    nearestCompetitorBrand: 'Arco & 76',
    whiteSpotScore: 71.4,
    opportunityTier: 'High',
    scoreBreakdown: {
      demand: 76,
      population: 88,
      income: 58,
      accessibility: 78,
      competitionGap: 62,
      commercialOpportunity: 72
    },
    unmetFuelDemandGallonsYear: 1200000,
    unmetCStoreDemandUsdYear: 1400000,
    recommendedFormat: '8-MPD High-Speed Turnkey Infill + Value Grocery C-Store',
    recommendedPumps: 8,
    evChargingDeficitPorts: 4,
    dataSource: 'Caltrans District 7 & LA County DPW',
    sourceDate: '2026-08-25',
    lastUpdated: '2026-10-01',
    dataQualityRating: 'Authoritative Verified'
  },

  // VIRGINIA - ZIP 20147 (Ashburn, VA)
  {
    streetId: 'str-va-20147-01',
    streetName: 'Waxpool Road (Data Center Parkway)',
    streetType: 'Road / Parkway',
    cityName: 'Ashburn',
    countyName: 'Loudoun County',
    stateCode: 'VA',
    zipCode: '20147',
    latitude: 39.0212,
    longitude: -77.4812,
    roadType: 'High-Income Tech Arterial',
    roadClass: 'Class 1 Primary Parkway',
    speedLimitMph: 50,
    lanes: 6,
    oneWay: false,
    bridge: false,
    tunnel: false,
    access: 'Public Dual Median Cuts',
    corridorAadt: 64000,
    connectingRoadsCount: 16,
    intersectionDensityPerSqMile: 7.2,
    nearestHighwayName: 'SR-267 Dulles Greenway',
    nearestHighwayDistanceMiles: 0.4,
    pop05Mile: 9600,
    pop1Mile: 28400,
    pop3Mile: 84000,
    households1Mile: 9400,
    medianHouseholdIncome: 168000,
    consumerDensityIndex: 96,
    commercialDensityIndex: 92,
    competitorCount05Mile: 0,
    competitorCount1Mile: 1,
    competitorCount3Mile: 2,
    competitorDensityRatio: 0.000035,
    nearestStationDistanceMiles: 1.8,
    nearestCompetitorDistanceMiles: 3.5,
    nearestCompetitorBrand: 'Sunoco (3.5 mi North)',
    whiteSpotScore: 93.7,
    opportunityTier: 'Excellent White Spot',
    scoreBreakdown: {
      demand: 96,
      population: 94,
      income: 100,
      accessibility: 96,
      competitionGap: 96,
      commercialOpportunity: 91
    },
    unmetFuelDemandGallonsYear: 3300000,
    unmetCStoreDemandUsdYear: 4400000,
    recommendedFormat: 'Premier Food-Forward C-Store + Synergy Supreme 93 + 12 Fast Charging Ports',
    recommendedPumps: 12,
    evChargingDeficitPorts: 12,
    dataSource: 'VDOT Traffic Engineering & Loudoun County Office of Mapping',
    sourceDate: '2026-08-28',
    lastUpdated: '2026-10-01',
    dataQualityRating: 'Authoritative Verified'
  }
];

// --------------------------------------------------------------------------
// 6. AUTHORITATIVE LOCATION / POINT MASTER DATASET
// --------------------------------------------------------------------------
export const GEO_LOCATIONS_MASTER: GeoLocationPoint[] = [
  // TEXAS - Cypress (Grand Pkwy)
  {
    locationId: 'loc-tx-77433-01',
    houseNumber: '18400',
    streetName: 'Grand Parkway (TX-99)',
    cityName: 'Cypress',
    countyName: 'Harris County',
    stateCode: 'TX',
    zipCode: '77433',
    fullAddress: '18400 Grand Parkway at FM 529, Cypress, TX 77433',
    latitude: 29.8785,
    longitude: -95.7892,
    propertyType: 'Hard Corner Infill',
    lotSizeSqFt: 142000,
    lotAcres: 3.26,
    frontageFeet: 340,
    curbCutsPermitted: 3,
    zoningClass: 'C-3 Highway Commercial',
    trafficFlowDir: 'Two-Way High-Visibility',
    whiteSpotScore: 94.2,
    opportunityTier: 'Excellent White Spot',
    estimatedLandCostUsd: 2850000,
    optimalStoreFormat: '16-MPD Mega Travel Forecourt + Gourmet Kitchen + 8 EV Chargers',
    recommendedPumps: 16,
    accuracyLevel: 'Exact Parcel GIS Geometry',
    dataSource: 'Harris County Appraisal District (HCAD) GIS Parcel Feed',
    lastUpdated: '2026-10-01'
  },
  {
    locationId: 'loc-tx-77433-02',
    houseNumber: '20150',
    streetName: 'FM 529 (Freeman Rd)',
    cityName: 'Cypress',
    countyName: 'Harris County',
    stateCode: 'TX',
    zipCode: '77433',
    fullAddress: '20150 FM 529, Cypress, TX 77433',
    latitude: 29.8842,
    longitude: -95.7712,
    propertyType: 'Corner Parcel',
    lotSizeSqFt: 98000,
    lotAcres: 2.25,
    frontageFeet: 280,
    curbCutsPermitted: 2,
    zoningClass: 'C-2 Commercial',
    trafficFlowDir: 'Right-Turn Commuter Inbound',
    whiteSpotScore: 89.6,
    opportunityTier: 'Excellent White Spot',
    estimatedLandCostUsd: 1950000,
    optimalStoreFormat: '12-MPD Forecourt + Fresh Kitchen + 4 EV Ports',
    recommendedPumps: 12,
    accuracyLevel: 'Exact Parcel GIS Geometry',
    dataSource: 'HCAD & TxDOT Access Permits',
    lastUpdated: '2026-10-01'
  },

  // TEXAS - Prosper (DNT)
  {
    locationId: 'loc-tx-75078-01',
    houseNumber: '4200',
    streetName: 'Dallas North Tollway',
    cityName: 'Prosper',
    countyName: 'Collin County',
    stateCode: 'TX',
    zipCode: '75078',
    fullAddress: '4200 Dallas North Tollway at Frontier Pkwy, Prosper, TX 75078',
    latitude: 33.2512,
    longitude: -96.8124,
    propertyType: 'Hard Corner Infill',
    lotSizeSqFt: 128000,
    lotAcres: 2.94,
    frontageFeet: 310,
    curbCutsPermitted: 2,
    zoningClass: 'C-3 Highway Commercial',
    trafficFlowDir: 'Right-Turn Commuter Inbound',
    whiteSpotScore: 92.8,
    opportunityTier: 'Excellent White Spot',
    estimatedLandCostUsd: 3400000,
    optimalStoreFormat: '12-MPD Luxury Forecourt + Synergy Supreme 93 + High-Speed EV',
    recommendedPumps: 12,
    accuracyLevel: 'Exact Parcel GIS Geometry',
    dataSource: 'Collin County Central Appraisal District',
    lastUpdated: '2026-10-01'
  },

  // TEXAS - Kyle (I-35)
  {
    locationId: 'loc-tx-78640-01',
    houseNumber: '1980',
    streetName: 'Interstate 35',
    cityName: 'Kyle',
    countyName: 'Hays County',
    stateCode: 'TX',
    zipCode: '78640',
    fullAddress: '1980 I-35 Exit 215 at Yarrington Rd, Kyle, TX 78640',
    latitude: 29.9654,
    longitude: -97.9021,
    propertyType: 'Vacant Commercial Land',
    lotSizeSqFt: 215000,
    lotAcres: 4.93,
    frontageFeet: 420,
    curbCutsPermitted: 4,
    zoningClass: 'C-3 Highway Commercial',
    trafficFlowDir: 'Interchange Ramp Feed',
    whiteSpotScore: 93.5,
    opportunityTier: 'Excellent White Spot',
    estimatedLandCostUsd: 3800000,
    optimalStoreFormat: '16-MPD Travel Plaza + Commercial Fleet Fueling + 8 EV Chargers',
    recommendedPumps: 16,
    accuracyLevel: 'Exact Parcel GIS Geometry',
    dataSource: 'Hays CAD & TxDOT Right of Way',
    lastUpdated: '2026-10-01'
  },

  // FLORIDA - Winter Garden (SR-429)
  {
    locationId: 'loc-fl-34787-01',
    houseNumber: '9200',
    streetName: 'Western Way',
    cityName: 'Winter Garden',
    countyName: 'Orange County',
    stateCode: 'FL',
    zipCode: '34787',
    fullAddress: '9200 Western Way & SR-429 Interchange, Winter Garden, FL 34787',
    latitude: 28.3842,
    longitude: -81.6124,
    propertyType: 'Hard Corner Infill',
    lotSizeSqFt: 135000,
    lotAcres: 3.10,
    frontageFeet: 320,
    curbCutsPermitted: 3,
    zoningClass: 'C-2 Commercial',
    trafficFlowDir: 'Two-Way High-Visibility',
    whiteSpotScore: 93.8,
    opportunityTier: 'Excellent White Spot',
    estimatedLandCostUsd: 3100000,
    optimalStoreFormat: '12-MPD Forecourt + Gourmet Fresh Food Market + 8 EV Ports',
    recommendedPumps: 12,
    accuracyLevel: 'Exact Parcel GIS Geometry',
    dataSource: 'Orange County Property Appraiser (OCPA)',
    lastUpdated: '2026-10-01'
  },

  // CALIFORNIA - Ontario (Haven Ave)
  {
    locationId: 'loc-ca-91761-01',
    houseNumber: '2800',
    streetName: 'Haven Avenue',
    cityName: 'Ontario',
    countyName: 'San Bernardino County',
    stateCode: 'CA',
    zipCode: '91761',
    fullAddress: '2800 Haven Avenue at I-15 Fwy, Ontario, CA 91761',
    latitude: 34.0412,
    longitude: -117.5621,
    propertyType: 'Vacant Commercial Land',
    lotSizeSqFt: 195000,
    lotAcres: 4.47,
    frontageFeet: 400,
    curbCutsPermitted: 4,
    zoningClass: 'C-3 Highway Commercial',
    trafficFlowDir: 'Interchange Ramp Feed',
    whiteSpotScore: 95.4,
    opportunityTier: 'Excellent White Spot',
    estimatedLandCostUsd: 4900000,
    optimalStoreFormat: 'Mega Logistics Travel Center + 16-MPD + 12 350kW Ultra-Fast EV Ports',
    recommendedPumps: 16,
    accuracyLevel: 'Exact Parcel GIS Geometry',
    dataSource: 'San Bernardino County Assessor & Caltrans',
    lastUpdated: '2026-10-01'
  },

  // VIRGINIA - Ashburn (Waxpool Rd)
  {
    locationId: 'loc-va-20147-01',
    houseNumber: '21850',
    streetName: 'Waxpool Road',
    cityName: 'Ashburn',
    countyName: 'Loudoun County',
    stateCode: 'VA',
    zipCode: '20147',
    fullAddress: '21850 Waxpool Road at Dulles Greenway, Ashburn, VA 20147',
    latitude: 39.0212,
    longitude: -77.4812,
    propertyType: 'Hard Corner Infill',
    lotSizeSqFt: 125000,
    lotAcres: 2.87,
    frontageFeet: 300,
    curbCutsPermitted: 2,
    zoningClass: 'B-2 Business',
    trafficFlowDir: 'Two-Way High-Visibility',
    whiteSpotScore: 93.7,
    opportunityTier: 'Excellent White Spot',
    estimatedLandCostUsd: 3650000,
    optimalStoreFormat: 'Premier Food-Forward C-Store + Synergy Supreme 93 + 12 EV Chargers',
    recommendedPumps: 12,
    accuracyLevel: 'Exact Parcel GIS Geometry',
    dataSource: 'Loudoun County GIS & Assessment',
    lastUpdated: '2026-10-01'
  }
];

// --------------------------------------------------------------------------
// HELPER QUERY FUNCTIONS FOR DRILL-DOWN UX & SEARCH
// --------------------------------------------------------------------------

export function getCountiesByState(stateCode: string): GeoCounty[] {
  return GEO_COUNTIES_MASTER.filter(c => c.stateCode.toUpperCase() === stateCode.toUpperCase());
}

export function getCitiesByCounty(countyId: string): GeoCity[] {
  return GEO_CITIES_MASTER.filter(c => c.countyId.toLowerCase() === countyId.toLowerCase());
}

export function getZipCodesByCity(cityName: string, stateCode?: string): GeoZipCode[] {
  return GEO_ZIPCODES_MASTER.filter(z => {
    const matchCity = z.cityName.toLowerCase().includes(cityName.toLowerCase());
    const matchState = stateCode ? z.stateCode.toUpperCase() === stateCode.toUpperCase() : true;
    return matchCity && matchState;
  });
}

export function getStreetsByZipCode(zipCode: string): GeoStreet[] {
  return GEO_STREETS_MASTER.filter(s => s.zipCode === zipCode);
}

export function getLocationsByStreet(streetId: string): GeoLocationPoint[] {
  const street = GEO_STREETS_MASTER.find(s => s.streetId === streetId);
  if (!street) return [];
  return GEO_LOCATIONS_MASTER.filter(l => l.streetName.toLowerCase() === street.streetName.toLowerCase() && l.zipCode === street.zipCode);
}

// Calculate White Spot Score dynamically based on weights
export function calculateDynamicStreetWhiteSpotScore(
  street: GeoStreet, 
  weights: StreetScoringWeights = DEFAULT_STREET_SCORING_WEIGHTS
): { score: number; tier: GeoStreet['opportunityTier'] } {
  const totalW = weights.demandWeight + weights.populationWeight + weights.incomeWeight + 
                 weights.accessibilityWeight + weights.competitionGapWeight + weights.commercialWeight || 100;
  
  const rawScore = (
    (street.scoreBreakdown.demand * weights.demandWeight) +
    (street.scoreBreakdown.population * weights.populationWeight) +
    (street.scoreBreakdown.income * weights.incomeWeight) +
    (street.scoreBreakdown.accessibility * weights.accessibilityWeight) +
    (street.scoreBreakdown.competitionGap * weights.competitionGapWeight) +
    (street.scoreBreakdown.commercialOpportunity * weights.commercialWeight)
  ) / totalW;

  const score = Math.round(rawScore * 10) / 10;
  
  let tier: GeoStreet['opportunityTier'] = 'Low Opportunity';
  if (score >= 86) tier = 'Excellent White Spot';
  else if (score >= 71) tier = 'High';
  else if (score >= 51) tier = 'Good';
  else if (score >= 31) tier = 'Moderate';
  else tier = 'Low Opportunity';

  return { score, tier };
}

// Universal Global Geographic Search (State, County, City, ZIP, Street, Address, Lat/Lng)
export function searchAuthoritativeGeographicHierarchy(query: string): {
  type: 'state' | 'county' | 'city' | 'zip' | 'street' | 'location' | 'coord';
  title: string;
  subtitle: string;
  data: any;
}[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: {
    type: 'state' | 'county' | 'city' | 'zip' | 'street' | 'location' | 'coord';
    title: string;
    subtitle: string;
    data: any;
  }[] = [];

  // Check if lat/lng coordinates (e.g. "29.8785, -95.7892")
  const coordMatch = q.match(/^([+-]?\d+(\.\d+)?),\s*([+-]?\d+(\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    results.push({
      type: 'coord',
      title: `GPS Coordinates [${lat.toFixed(4)}, ${lng.toFixed(4)}]`,
      subtitle: 'Custom Geographic Point Inspection',
      data: { lat, lng }
    });
  }

  // 1. Check ZIP codes
  GEO_ZIPCODES_MASTER.forEach(z => {
    if (z.zipCode.includes(q) || z.cityName.toLowerCase().includes(q)) {
      results.push({
        type: 'zip',
        title: `ZIP ${z.zipCode} - ${z.cityName}, ${z.stateCode}`,
        subtitle: `${z.countyName} • Score: ${z.opportunityScore}/100 (${z.zone} Zone)`,
        data: z
      });
    }
  });

  // 2. Check Streets
  GEO_STREETS_MASTER.forEach(s => {
    if (s.streetName.toLowerCase().includes(q) || s.cityName.toLowerCase().includes(q)) {
      results.push({
        type: 'street',
        title: `${s.streetName} (${s.cityName}, ${s.stateCode})`,
        subtitle: `ZIP ${s.zipCode} • ${s.corridorAadt.toLocaleString()} AADT • Score: ${s.whiteSpotScore}/100`,
        data: s
      });
    }
  });

  // 3. Check Locations / Addresses
  GEO_LOCATIONS_MASTER.forEach(l => {
    if (l.fullAddress.toLowerCase().includes(q) || l.streetName.toLowerCase().includes(q)) {
      results.push({
        type: 'location',
        title: l.fullAddress,
        subtitle: `${l.propertyType} • ${l.lotAcres} Acres • Score: ${l.whiteSpotScore}/100`,
        data: l
      });
    }
  });

  // 4. Check Cities
  GEO_CITIES_MASTER.forEach(c => {
    if (c.cityName.toLowerCase().includes(q)) {
      results.push({
        type: 'city',
        title: `${c.cityName}, ${c.stateCode}`,
        subtitle: `${c.countyName} • Pop: ${c.population.toLocaleString()}`,
        data: c
      });
    }
  });

  // 5. Check Counties
  GEO_COUNTIES_MASTER.forEach(co => {
    if (co.countyName.toLowerCase().includes(q)) {
      results.push({
        type: 'county',
        title: `${co.countyName}, ${co.stateCode}`,
        subtitle: `County Seat: ${co.countySeat} • Pop: ${co.population.toLocaleString()}`,
        data: co
      });
    }
  });

  // 6. Check States
  GEO_STATES_MASTER.forEach(st => {
    if (st.stateName.toLowerCase().includes(q) || st.stateCode.toLowerCase() === q) {
      results.push({
        type: 'state',
        title: `${st.stateName} (${st.stateCode})`,
        subtitle: `${st.region} Region • Capital: ${st.capital}`,
        data: st
      });
    }
  });

  return results.slice(0, 10);
}
