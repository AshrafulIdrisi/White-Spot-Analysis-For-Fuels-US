export interface UsCorridor {
  id: string;
  name: string;
  state: string;
  region: 'South' | 'West' | 'Midwest' | 'Northeast';
  city: string;
  lat: number;
  lng: number;
  desc: string;
  aadtEstimate: number;
  growthTag: string;
}

export const US_GROWTH_CORRIDORS: UsCorridor[] = [
  // SOUTH / SUNBELT
  {
    id: 'tx-hou-99',
    name: 'Greater Houston TX-99 Grand Parkway Corridor',
    state: 'TX',
    region: 'South',
    city: 'Houston / Cypress',
    lat: 29.988,
    lng: -95.748,
    desc: 'High vehicle volume outer ring with massive master-planned communities and arterial fuel deficits',
    aadtEstimate: 42000,
    growthTag: 'Fastest Suburban Growth'
  },
  {
    id: 'tx-aus-130',
    name: 'Austin SH-130 & Kyle-Buda Tech Feeder',
    state: 'TX',
    region: 'South',
    city: 'Austin / Kyle',
    lat: 30.012,
    lng: -97.865,
    desc: 'High-speed tollway feeder connecting Tesla Giga Texas, Austin airport, and San Antonio tech corridor',
    aadtEstimate: 36000,
    growthTag: 'Tech Manufacturing Belt'
  },
  {
    id: 'tx-dfw-toll',
    name: 'DFW Prosper & Celina Dallas North Tollway',
    state: 'TX',
    region: 'South',
    city: 'Dallas / Prosper',
    lat: 33.236,
    lng: -96.804,
    desc: 'Top-income luxury residential corridor extending northward with severe premium fuel gaps',
    aadtEstimate: 38000,
    growthTag: 'Affluent Commuter Belt'
  },
  {
    id: 'tx-sa-1604',
    name: 'San Antonio Loop 1604 West Growth Arc',
    state: 'TX',
    region: 'South',
    city: 'San Antonio / Alamo Ranch',
    lat: 29.498,
    lng: -98.718,
    desc: 'Rapidly expanding residential and healthcare submarket on San Antonio outer loop',
    aadtEstimate: 34000,
    growthTag: 'Master-Planned Density'
  },
  {
    id: 'fl-orl-429',
    name: 'Orlando Horizon West & SR-429 Beltway',
    state: 'FL',
    region: 'South',
    city: 'Orlando / Winter Garden',
    lat: 28.455,
    lng: -81.621,
    desc: 'High tourist and affluent commuter corridor near Disney with high-volume convenience void',
    aadtEstimate: 48000,
    growthTag: 'High Tourist & Commuter'
  },
  {
    id: 'fl-tpa-75',
    name: 'Tampa Wesley Chapel & I-75 North Corridor',
    state: 'FL',
    region: 'South',
    city: 'Tampa / Wesley Chapel',
    lat: 28.192,
    lng: -82.355,
    desc: 'Booming Pasco County growth hub with high travel center and commercial void index',
    aadtEstimate: 52000,
    growthTag: 'Interstate Commerce'
  },
  {
    id: 'ga-atl-85',
    name: 'Atlanta I-85 North Commerce & Jackson Logistics',
    state: 'GA',
    region: 'South',
    city: 'Atlanta / Commerce',
    lat: 34.135,
    lng: -83.621,
    desc: 'Key freight artery connecting Atlanta and Charlotte; massive heavy truck and EV gap',
    aadtEstimate: 58000,
    growthTag: 'Freight & EV Corridor'
  },
  {
    id: 'nc-clt-485',
    name: 'Charlotte I-485 North & Huntersville Lake Gateway',
    state: 'NC',
    region: 'South',
    city: 'Charlotte / Huntersville',
    lat: 35.394,
    lng: -80.849,
    desc: 'High-income lake commuter artery with high demand for premium fuels and fresh QSR retail',
    aadtEstimate: 44000,
    growthTag: 'Premium Commuter'
  },
  {
    id: 'tn-bna-840',
    name: 'Nashville I-840 Outer Ring & Spring Hill',
    state: 'TN',
    region: 'South',
    city: 'Nashville / Spring Hill',
    lat: 35.751,
    lng: -86.932,
    desc: 'Automotive and advanced manufacturing node with rapid single-family housing expansion',
    aadtEstimate: 32000,
    growthTag: 'Auto & Tech Hub'
  },

  // WEST / SOUTHWEST / MOUNTAIN
  {
    id: 'az-phx-303',
    name: 'Phoenix Loop 303 & Surprise West Corridor',
    state: 'AZ',
    region: 'West',
    city: 'Phoenix / Surprise',
    lat: 33.628,
    lng: -112.415,
    desc: 'Major western industrial mega-park and master-planned residential boom with retail void',
    aadtEstimate: 46000,
    growthTag: 'Industrial & Suburb Arc'
  },
  {
    id: 'az-phx-202',
    name: 'Phoenix East Valley Loop 202 & Gilbert South',
    state: 'AZ',
    region: 'West',
    city: 'Phoenix / Gilbert',
    lat: 33.284,
    lng: -111.758,
    desc: 'Affluent tech corridor with top-tier EV adoption and high daily commuter flows',
    aadtEstimate: 39000,
    growthTag: 'EV & High Income'
  },
  {
    id: 'nv-las-15',
    name: 'Las Vegas St. Rose Pkwy & Henderson South',
    state: 'NV',
    region: 'West',
    city: 'Las Vegas / Henderson',
    lat: 35.986,
    lng: -115.174,
    desc: 'Inspirada master-planned community gateway with heavy tourist and resident cross-traffic',
    aadtEstimate: 41000,
    growthTag: 'Resort & Suburb Corridor'
  },
  {
    id: 'co-den-470',
    name: 'Denver Aerotropolis & E-470 Airport Feeder',
    state: 'CO',
    region: 'West',
    city: 'Denver / Aurora',
    lat: 39.782,
    lng: -104.685,
    desc: 'Denver International Airport growth boundary with massive industrial logistics expansion',
    aadtEstimate: 49000,
    growthTag: 'Airport & Freight Hub'
  },
  {
    id: 'ut-slc-mvw',
    name: 'Salt Lake City Mountain View Corridor & Herriman',
    state: 'UT',
    region: 'West',
    city: 'Salt Lake City / Herriman',
    lat: 40.518,
    lng: -112.032,
    desc: 'Silicon Slopes residential overflow with youngest demographic index in the nation',
    aadtEstimate: 35000,
    growthTag: 'Silicon Slopes Boom'
  },
  {
    id: 'id-boi-84',
    name: 'Boise I-84 & Meridian-Kuna Tech Growth Arc',
    state: 'ID',
    region: 'West',
    city: 'Boise / Meridian',
    lat: 43.568,
    lng: -116.398,
    desc: 'One of the fastest growing Pacific NW metros with huge arterial supply deficit',
    aadtEstimate: 38000,
    growthTag: 'Treasure Valley Growth'
  },
  {
    id: 'ca-ie-15',
    name: 'Inland Empire I-15 & Ontario Ranch Logistics',
    state: 'CA',
    region: 'West',
    city: 'Ontario / Eastvale',
    lat: 34.015,
    lng: -117.575,
    desc: 'Nation’s premier e-commerce logistics hub with intense commercial throughput',
    aadtEstimate: 62000,
    growthTag: 'Top E-Commerce Artery'
  },
  {
    id: 'ca-nor-99',
    name: 'Central Valley CA-99 & Tracy-Manteca Triangle',
    state: 'CA',
    region: 'West',
    city: 'Tracy / Manteca',
    lat: 37.798,
    lng: -121.285,
    desc: 'Bay Area commuter bedroom community with multi-hour daily super-commute volumes',
    aadtEstimate: 56000,
    growthTag: 'Super-Commuter Feeder'
  },
  {
    id: 'wa-sea-5',
    name: 'Seattle I-5 South & Tacoma-Puyallup Port Corridor',
    state: 'WA',
    region: 'West',
    city: 'Tacoma / Puyallup',
    lat: 47.192,
    lng: -122.312,
    desc: 'High density Puget Sound logistics and trade center with significant EV & retail gaps',
    aadtEstimate: 51000,
    growthTag: 'Port & Tech Commuter'
  },

  // MIDWEST / GREAT LAKES
  {
    id: 'oh-col-23',
    name: 'Columbus US-23 North & Polaris Innovation Belt',
    state: 'OH',
    region: 'Midwest',
    city: 'Columbus / Delaware',
    lat: 40.235,
    lng: -83.065,
    desc: 'Intel Silicon Heartland mega-factory supplier corridor with exploding traffic',
    aadtEstimate: 37000,
    growthTag: 'Intel Mega-Fab Corridor'
  },
  {
    id: 'in-ind-65',
    name: 'Indianapolis I-65 Whitestown & LEAP Innovation District',
    state: 'IN',
    region: 'Midwest',
    city: 'Indianapolis / Whitestown',
    lat: 39.998,
    lng: -86.348,
    desc: 'Fastest growing municipality in Indiana with top freight distribution infrastructure',
    aadtEstimate: 43000,
    growthTag: 'High-Velocity Logistics'
  },
  {
    id: 'il-chi-55',
    name: 'Chicago I-55 South & Joliet Intermodal Logistics Hub',
    state: 'IL',
    region: 'Midwest',
    city: 'Chicago / Joliet',
    lat: 41.528,
    lng: -88.135,
    desc: 'Largest inland logistics port in North America with continuous heavy vehicle volume',
    aadtEstimate: 64000,
    growthTag: 'North American Rail Port'
  },
  {
    id: 'ks-kc-35',
    name: 'Kansas City I-35 South & Olathe Logistics Gateway',
    state: 'KS',
    region: 'Midwest',
    city: 'Kansas City / Olathe',
    lat: 38.852,
    lng: -94.815,
    desc: 'Key midwest logistics corridor and affluent Johnson County residential gateway',
    aadtEstimate: 38000,
    growthTag: 'Interstate Commerce'
  },
  {
    id: 'mn-msp-94',
    name: 'Minneapolis I-94 NW & Maple Grove Corridor',
    state: 'MN',
    region: 'Midwest',
    city: 'Minneapolis / Maple Grove',
    lat: 45.105,
    lng: -93.475,
    desc: 'Twin Cities northwest commuter gateway with high median family income and retail demand',
    aadtEstimate: 41000,
    growthTag: 'Metro Commuter Arc'
  },

  // NORTHEAST / MID-ATLANTIC
  {
    id: 'va-dca-15',
    name: 'Northern Virginia US-15 & Prince William Data Alley',
    state: 'VA',
    region: 'Northeast',
    city: 'Washington DC / Manassas',
    lat: 38.752,
    lng: -77.568,
    desc: 'World’s highest data center density corridor with high-income tech commuters',
    aadtEstimate: 47000,
    growthTag: 'Data Center Alley'
  },
  {
    id: 'pa-phl-81',
    name: 'Central Pennsylvania I-81 Logistics Corridor',
    state: 'PA',
    region: 'Northeast',
    city: 'Harrisburg / Carlisle',
    lat: 40.201,
    lng: -77.189,
    desc: 'Premier East Coast freight spine supplying NYC and DC with major travel center demand',
    aadtEstimate: 59000,
    growthTag: 'East Coast Freight Spine'
  }
];
