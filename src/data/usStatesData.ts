import type { WhiteSpotCandidate } from '../types.ts';

export interface UsStateInfo {
  code: string;
  name: string;
  region: 'South' | 'West' | 'Midwest' | 'Northeast';
  capital: string;
  lat: number;
  lng: number;
  zoom: number;
  marketDescription: string;
  fuelDemandIndex: number;
  evAdoptionRank: number;
}

export const ALL_US_STATES: UsStateInfo[] = [
  { code: 'AL', name: 'Alabama', region: 'South', capital: 'Montgomery', lat: 32.806671, lng: -86.791130, zoom: 7, marketDescription: 'I-65 & I-85 heavy logistics and automotive manufacturing corridor', fuelDemandIndex: 112, evAdoptionRank: 42 },
  { code: 'AK', name: 'Alaska', region: 'West', capital: 'Juneau', lat: 61.370716, lng: -152.404419, zoom: 4, marketDescription: 'Anchorage Parks Hwy & Kenai Peninsula freight connection', fuelDemandIndex: 94, evAdoptionRank: 48 },
  { code: 'AZ', name: 'Arizona', region: 'West', capital: 'Phoenix', lat: 33.729759, lng: -111.431221, zoom: 7, marketDescription: 'Phoenix East Valley & I-10 Sun Corridor semiconductor growth belt', fuelDemandIndex: 128, evAdoptionRank: 9 },
  { code: 'AR', name: 'Arkansas', region: 'South', capital: 'Little Rock', lat: 34.969704, lng: -92.373123, zoom: 7, marketDescription: 'NW Arkansas I-49 retail logistics hub & Little Rock I-40 interchange', fuelDemandIndex: 108, evAdoptionRank: 45 },
  { code: 'CA', name: 'California', region: 'West', capital: 'Sacramento', lat: 36.116203, lng: -119.681564, zoom: 6, marketDescription: 'Inland Empire logistics, Central Valley I-5 freight & high EV fast-charge adoption', fuelDemandIndex: 145, evAdoptionRank: 1 },
  { code: 'CO', name: 'Colorado', region: 'West', capital: 'Denver', lat: 39.059811, lng: -105.311104, zoom: 7, marketDescription: 'Front Range I-25 commuter belt and Denver E-470 expressway growth', fuelDemandIndex: 122, evAdoptionRank: 5 },
  { code: 'CT', name: 'Connecticut', region: 'Northeast', capital: 'Hartford', lat: 41.597782, lng: -72.755371, zoom: 8, marketDescription: 'I-95 Gold Coast commuter artery & I-91 New Haven corridor', fuelDemandIndex: 116, evAdoptionRank: 11 },
  { code: 'DE', name: 'Delaware', region: 'Northeast', capital: 'Dover', lat: 39.318523, lng: -75.507141, zoom: 8, marketDescription: 'US-13 & DE-1 coastal tourism route and Mid-Atlantic logistics', fuelDemandIndex: 106, evAdoptionRank: 19 },
  { code: 'DC', name: 'District of Columbia', region: 'Northeast', capital: 'Washington', lat: 38.897438, lng: -77.026817, zoom: 11, marketDescription: 'High-density commuter radials, beltway connectors, and urban retail', fuelDemandIndex: 118, evAdoptionRank: 4 },
  { code: 'FL', name: 'Florida', region: 'South', capital: 'Tallahassee', lat: 27.766279, lng: -81.686783, zoom: 7, marketDescription: 'I-4 Central Florida corridor, I-75 Gulf growth arc & turnpike plazas', fuelDemandIndex: 148, evAdoptionRank: 3 },
  { code: 'GA', name: 'Georgia', region: 'South', capital: 'Atlanta', lat: 33.040619, lng: -83.643074, zoom: 7, marketDescription: 'Metro Atlanta I-85 & I-75 freight crossroads with explosive master-planned sprawl', fuelDemandIndex: 142, evAdoptionRank: 14 },
  { code: 'HI', name: 'Hawaii', region: 'West', capital: 'Honolulu', lat: 21.094318, lng: -157.498337, zoom: 7, marketDescription: 'Oahu H-1 freeway & Kapolei residential expansion corridor', fuelDemandIndex: 98, evAdoptionRank: 8 },
  { code: 'ID', name: 'Idaho', region: 'West', capital: 'Boise', lat: 44.240459, lng: -114.478828, zoom: 6, marketDescription: 'Boise Treasure Valley I-84 rapid residential and commercial influx', fuelDemandIndex: 124, evAdoptionRank: 24 },
  { code: 'IL', name: 'Illinois', region: 'Midwest', capital: 'Springfield', lat: 40.349457, lng: -88.986137, zoom: 7, marketDescription: 'Chicagoland I-80/I-55 logistics triangle & high-volume tollways', fuelDemandIndex: 135, evAdoptionRank: 12 },
  { code: 'IN', name: 'Indiana', region: 'Midwest', capital: 'Indianapolis', lat: 39.849426, lng: -86.258278, zoom: 7, marketDescription: 'Crossroads of America - Heavy freight intersection at I-65, I-69 & I-70', fuelDemandIndex: 130, evAdoptionRank: 34 },
  { code: 'IA', name: 'Iowa', region: 'Midwest', capital: 'Des Moines', lat: 42.011539, lng: -93.210526, zoom: 7, marketDescription: 'Des Moines I-35/I-80 cross-country freight interchange and biofuel belt', fuelDemandIndex: 110, evAdoptionRank: 38 },
  { code: 'KS', name: 'Kansas', region: 'Midwest', capital: 'Topeka', lat: 38.526600, lng: -96.726486, zoom: 7, marketDescription: 'Kansas City metro southern bypass (US-69 / I-35 Johnson County)', fuelDemandIndex: 114, evAdoptionRank: 32 },
  { code: 'KY', name: 'Kentucky', region: 'South', capital: 'Frankfort', lat: 37.668140, lng: -84.670067, zoom: 7, marketDescription: 'I-75 & I-71 Cincinnati-Louisville automotive corridor and air freight hub', fuelDemandIndex: 118, evAdoptionRank: 39 },
  { code: 'LA', name: 'Louisiana', region: 'South', capital: 'Baton Rouge', lat: 31.169546, lng: -91.867805, zoom: 7, marketDescription: 'I-10 Gulf petrochemical corridor and New Orleans-Baton Rouge commuter stream', fuelDemandIndex: 126, evAdoptionRank: 44 },
  { code: 'ME', name: 'Maine', region: 'Northeast', capital: 'Augusta', lat: 44.693947, lng: -69.381927, zoom: 7, marketDescription: 'I-95 Maine Turnpike coastal commuter and seasonal recreation flow', fuelDemandIndex: 96, evAdoptionRank: 23 },
  { code: 'MD', name: 'Maryland', region: 'Northeast', capital: 'Annapolis', lat: 39.063946, lng: -76.802101, zoom: 8, marketDescription: 'I-270 Tech Corridor & I-95 Baltimore-Washington high-income artery', fuelDemandIndex: 134, evAdoptionRank: 7 },
  { code: 'MA', name: 'Massachusetts', region: 'Northeast', capital: 'Boston', lat: 42.230171, lng: -71.530106, zoom: 8, marketDescription: 'I-495 Boston outer circumferential ring & Mass Pike (I-90) high-margin c-store hubs', fuelDemandIndex: 128, evAdoptionRank: 6 },
  { code: 'MI', name: 'Michigan', region: 'Midwest', capital: 'Lansing', lat: 43.326618, lng: -84.536095, zoom: 7, marketDescription: 'I-94 & I-75 Detroit manufacturing corridor and Grand Rapids growth arc', fuelDemandIndex: 125, evAdoptionRank: 26 },
  { code: 'MN', name: 'Minnesota', region: 'Midwest', capital: 'St. Paul', lat: 45.694454, lng: -93.900192, zoom: 6, marketDescription: 'Twin Cities I-494/I-694 beltway and I-94 commerce connector', fuelDemandIndex: 120, evAdoptionRank: 18 },
  { code: 'MS', name: 'Mississippi', region: 'South', capital: 'Jackson', lat: 32.741646, lng: -89.678696, zoom: 7, marketDescription: 'I-55 & I-20 logistics crossroads and DeSoto County Memphis overflow', fuelDemandIndex: 104, evAdoptionRank: 49 },
  { code: 'MO', name: 'Missouri', region: 'Midwest', capital: 'Jefferson City', lat: 38.456085, lng: -92.288368, zoom: 7, marketDescription: 'I-70 St. Louis to Kansas City freight artery and I-44 gateway', fuelDemandIndex: 122, evAdoptionRank: 31 },
  { code: 'MT', name: 'Montana', region: 'West', capital: 'Helena', lat: 46.921925, lng: -110.454353, zoom: 6, marketDescription: 'Bozeman & Missoula I-90 mountain recreation and long-distance travel plaza void', fuelDemandIndex: 102, evAdoptionRank: 36 },
  { code: 'NE', name: 'Nebraska', region: 'Midwest', capital: 'Lincoln', lat: 41.125370, lng: -98.268082, zoom: 7, marketDescription: 'I-80 Omaha-Lincoln growth corridor - premier transcontinental freight artery', fuelDemandIndex: 114, evAdoptionRank: 37 },
  { code: 'NV', name: 'Nevada', region: 'West', capital: 'Carson City', lat: 38.313515, lng: -117.055374, zoom: 6, marketDescription: 'Las Vegas I-15 & 215 Beltway boom and Reno Tahoe-Reno Industrial Center', fuelDemandIndex: 138, evAdoptionRank: 10 },
  { code: 'NH', name: 'New Hampshire', region: 'Northeast', capital: 'Concord', lat: 43.452492, lng: -71.563896, zoom: 7, marketDescription: 'I-93 Southern NH commuter corridor and tax-free retail border nodes', fuelDemandIndex: 108, evAdoptionRank: 22 },
  { code: 'NJ', name: 'New Jersey', region: 'Northeast', capital: 'Trenton', lat: 40.298904, lng: -74.521011, zoom: 8, marketDescription: 'NJ Turnpike & Garden State Parkway - Highest vehicle throughput per square mile in US', fuelDemandIndex: 152, evAdoptionRank: 5 },
  { code: 'NM', name: 'New Mexico', region: 'West', capital: 'Santa Fe', lat: 34.840515, lng: -106.248482, zoom: 6, marketDescription: 'Albuquerque I-40/I-25 crossroads and Permian Basin industrial freight feeder', fuelDemandIndex: 110, evAdoptionRank: 28 },
  { code: 'NY', name: 'New York', region: 'Northeast', capital: 'Albany', lat: 42.165726, lng: -74.948051, zoom: 7, marketDescription: 'NY Thruway (I-87 / I-90), Long Island LIE expressway & Hudson Valley commuter belt', fuelDemandIndex: 140, evAdoptionRank: 8 },
  { code: 'NC', name: 'North Carolina', region: 'South', capital: 'Raleigh', lat: 35.630066, lng: -79.806419, zoom: 7, marketDescription: 'Raleigh-Durham Research Triangle I-540 & Charlotte I-77/I-85 high growth', fuelDemandIndex: 144, evAdoptionRank: 16 },
  { code: 'ND', name: 'North Dakota', region: 'Midwest', capital: 'Bismarck', lat: 47.528912, lng: -99.784012, zoom: 6, marketDescription: 'Bakken energy corridor (US-2 / US-85) and Fargo I-94 regional retail hub', fuelDemandIndex: 104, evAdoptionRank: 47 },
  { code: 'OH', name: 'Ohio', region: 'Midwest', capital: 'Columbus', lat: 40.388783, lng: -82.764915, zoom: 7, marketDescription: 'Columbus I-270 & Intel Silicon Heartland tech hub; Cincinnati I-71/I-75', fuelDemandIndex: 136, evAdoptionRank: 27 },
  { code: 'OK', name: 'Oklahoma', region: 'South', capital: 'Oklahoma City', lat: 35.565342, lng: -96.928917, zoom: 7, marketDescription: 'OKC Kilpatrick Turnpike extension & I-35 corridor through Norman/Edmond', fuelDemandIndex: 118, evAdoptionRank: 40 },
  { code: 'OR', name: 'Oregon', region: 'West', capital: 'Salem', lat: 44.572021, lng: -122.070938, zoom: 7, marketDescription: 'I-5 Willamette Valley corridor & Portland metro high-efficiency travel centers', fuelDemandIndex: 118, evAdoptionRank: 7 },
  { code: 'PA', name: 'Pennsylvania', region: 'Northeast', capital: 'Harrisburg', lat: 40.590752, lng: -77.209755, zoom: 7, marketDescription: 'PA Turnpike (I-76) & I-81 Lehigh Valley - Top East Coast mega-distribution spine', fuelDemandIndex: 138, evAdoptionRank: 20 },
  { code: 'RI', name: 'Rhode Island', region: 'Northeast', capital: 'Providence', lat: 41.680893, lng: -71.511780, zoom: 9, marketDescription: 'I-95 Providence corridor & Route 146 commuter artery', fuelDemandIndex: 105, evAdoptionRank: 17 },
  { code: 'SC', name: 'South Carolina', region: 'South', capital: 'Columbia', lat: 33.856892, lng: -80.945007, zoom: 7, marketDescription: 'Charleston I-26 port logistics & Greenville-Spartanburg I-85 manufacturing arc', fuelDemandIndex: 132, evAdoptionRank: 33 },
  { code: 'SD', name: 'South Dakota', region: 'Midwest', capital: 'Pierre', lat: 44.299782, lng: -99.438828, zoom: 6, marketDescription: 'Sioux Falls I-29/I-90 cross-country retail hub with zero state income tax', fuelDemandIndex: 106, evAdoptionRank: 46 },
  { code: 'TN', name: 'Tennessee', region: 'South', capital: 'Nashville', lat: 35.747845, lng: -86.692345, zoom: 7, marketDescription: 'Greater Nashville I-840 outer loop & Memphis I-40 world logistics center', fuelDemandIndex: 140, evAdoptionRank: 29 },
  { code: 'TX', name: 'Texas', region: 'South', capital: 'Austin', lat: 31.054487, lng: -97.563461, zoom: 6, marketDescription: 'Texas Triangle (Houston-DFW-Austin-San Antonio) - Largest fuel & c-store market in US', fuelDemandIndex: 160, evAdoptionRank: 13 },
  { code: 'UT', name: 'Utah', region: 'West', capital: 'Salt Lake City', lat: 40.150032, lng: -111.862434, zoom: 7, marketDescription: 'Wasatch Front I-15 Silicon Slopes & St. George southern gateway growth', fuelDemandIndex: 130, evAdoptionRank: 15 },
  { code: 'VT', name: 'Vermont', region: 'Northeast', capital: 'Montpelier', lat: 44.045876, lng: -72.710686, zoom: 7, marketDescription: 'I-89 Burlington commuter artery & Route 7 Green Mountain tourism spine', fuelDemandIndex: 92, evAdoptionRank: 21 },
  { code: 'VA', name: 'Virginia', region: 'South', capital: 'Richmond', lat: 37.769337, lng: -78.169968, zoom: 7, marketDescription: 'NoVA Dulles Greenway & I-95 Richmond-Petersburg heavy commuter corridor', fuelDemandIndex: 136, evAdoptionRank: 12 },
  { code: 'WA', name: 'Washington', region: 'West', capital: 'Olympia', lat: 47.400902, lng: -121.490494, zoom: 7, marketDescription: 'Puget Sound I-5 tech spine, I-90 mountain pass & Tri-Cities growth node', fuelDemandIndex: 132, evAdoptionRank: 2 },
  { code: 'WV', name: 'West Virginia', region: 'South', capital: 'Charleston', lat: 38.491226, lng: -80.954453, zoom: 7, marketDescription: 'I-77/I-64 Turnpike mountain passes and Eastern Panhandle DC overflow', fuelDemandIndex: 104, evAdoptionRank: 50 },
  { code: 'WI', name: 'Wisconsin', region: 'Midwest', capital: 'Madison', lat: 44.268543, lng: -89.616508, zoom: 7, marketDescription: 'I-94 Milwaukee-Chicago mega-corridor and Madison tech belt', fuelDemandIndex: 126, evAdoptionRank: 25 },
  { code: 'WY', name: 'Wyoming', region: 'West', capital: 'Cheyenne', lat: 42.755966, lng: -107.302490, zoom: 6, marketDescription: 'I-80 & I-25 Cheyenne continental freight crossway', fuelDemandIndex: 100, evAdoptionRank: 43 }
];

// Helper to generate candidate records for all 50 US States + DC
export function generateNationwide50StateCandidates(): WhiteSpotCandidate[] {
  const candidates: WhiteSpotCandidate[] = [];

  const STATE_SITE_SPECS: {
    state: string;
    city: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    aadt: number;
    pop3Mile: number;
    income: number;
    thesis: 'suburban-infill' | 'highway-defense' | 'premium-turnaround' | 'ev-fleet-corridor' | 'urban-infill' | 'master-planned-belt';
    score: number;
    capEx: number;
    payback: number;
    gallons: number;
    cStoreRev: number;
  }[] = [
    // TEXAS (Multiple high-conviction points)
    { state: 'TX', city: 'Cypress', name: 'Grand Parkway TX-99 & FM 529 Expansion', address: 'Intersection TX-99 & FM 529', lat: 29.8785, lng: -95.7892, aadt: 62000, pop3Mile: 68400, income: 118500, thesis: 'suburban-infill', score: 94.2, capEx: 5850000, payback: 3.4, gallons: 3950000, cStoreRev: 3450000 },
    { state: 'TX', city: 'Prosper', name: 'Dallas North Tollway & Frontier Pkwy Hub', address: 'DNT & Frontier Parkway', lat: 33.2512, lng: -96.8124, aadt: 48000, pop3Mile: 52000, income: 142000, thesis: 'premium-turnaround', score: 92.8, capEx: 6200000, payback: 3.2, gallons: 3200000, cStoreRev: 3900000 },
    { state: 'TX', city: 'Kyle', name: 'I-35 & SH-130 Austin-San Antonio Tech Feeder', address: 'I-35 Exit 215 at Yarrington Rd', lat: 29.9654, lng: -97.9021, aadt: 89000, pop3Mile: 41000, income: 94000, thesis: 'highway-defense', score: 93.5, capEx: 7800000, payback: 3.9, gallons: 4800000, cStoreRev: 3100000 },
    { state: 'TX', city: 'Alamo Ranch', name: 'Loop 1604 & Culebra Growth Arc', address: 'Loop 1604 & Culebra Rd', lat: 29.5012, lng: -98.7154, aadt: 54000, pop3Mile: 78000, income: 96000, thesis: 'master-planned-belt', score: 90.4, capEx: 5600000, payback: 3.6, gallons: 3400000, cStoreRev: 2950000 },

    // FLORIDA
    { state: 'FL', city: 'Winter Garden', name: 'Horizon West & SR-429 Beltway Oasis', address: 'SR-429 & Western Way Interchange', lat: 28.3842, lng: -81.6124, aadt: 56000, pop3Mile: 62000, income: 112000, thesis: 'suburban-infill', score: 93.8, capEx: 6100000, payback: 3.3, gallons: 3700000, cStoreRev: 3600000 },
    { state: 'FL', city: 'Wesley Chapel', name: 'I-75 & Overpass Rd Mega-Travel Center', address: 'I-75 & Overpass Rd Interchange', lat: 28.2412, lng: -82.3421, aadt: 84000, pop3Mile: 49000, income: 98000, thesis: 'highway-defense', score: 92.1, capEx: 7500000, payback: 3.8, gallons: 4600000, cStoreRev: 3200000 },
    { state: 'FL', city: 'Boca Raton', name: 'Yamato Rd & I-95 Premium EV Oasis', address: 'Yamato Rd & Military Trail', lat: 26.3912, lng: -80.1245, aadt: 68000, pop3Mile: 88000, income: 138000, thesis: 'premium-turnaround', score: 91.5, capEx: 6400000, payback: 3.1, gallons: 2900000, cStoreRev: 4100000 },

    // GEORGIA
    { state: 'GA', city: 'Cumming', name: 'GA-400 & Settingdown Creek Tech Corridor', address: 'GA-400 at Settingdown Rd', lat: 34.2845, lng: -84.1124, aadt: 52000, pop3Mile: 54000, income: 124000, thesis: 'suburban-infill', score: 91.8, capEx: 5700000, payback: 3.5, gallons: 3300000, cStoreRev: 3300000 },
    { state: 'GA', city: 'Commerce', name: 'I-85 & US-441 Northeast Freight Gateway', address: 'I-85 Exit 149 Interchange', lat: 34.2124, lng: -83.4712, aadt: 92000, pop3Mile: 28000, income: 78000, thesis: 'highway-defense', score: 92.6, capEx: 8200000, payback: 3.7, gallons: 5200000, cStoreRev: 3050000 },

    // CALIFORNIA
    { state: 'CA', city: 'Ontario', name: 'I-15 & Jurupa Freight & Ultra-Fast EV Hub', address: 'I-15 & Jurupa St Logistics Node', lat: 34.0412, lng: -117.5621, aadt: 142000, pop3Mile: 94000, income: 92000, thesis: 'ev-fleet-corridor', score: 95.4, capEx: 8900000, payback: 3.6, gallons: 5600000, cStoreRev: 4200000 },
    { state: 'CA', city: 'Irvine', name: 'I-5 & Alton Parkway Affluent Infill', address: 'Alton Pkwy & Irvine Center Dr', lat: 33.6612, lng: -117.7612, aadt: 78000, pop3Mile: 112000, income: 148000, thesis: 'premium-turnaround', score: 93.2, capEx: 7200000, payback: 3.2, gallons: 3100000, cStoreRev: 4500000 },
    { state: 'CA', city: 'Roseville', name: 'Hwy 65 & Blue Oaks Blvd Outer Arc', address: 'Hwy 65 & Blue Oaks Blvd', lat: 38.7912, lng: -121.3214, aadt: 64000, pop3Mile: 72000, income: 116000, thesis: 'suburban-infill', score: 90.8, capEx: 5900000, payback: 3.7, gallons: 3250000, cStoreRev: 3150000 },

    // NORTH CAROLINA
    { state: 'NC', city: 'Apex', name: 'Triangle Expressway NC-540 & US-64 Node', address: 'NC-540 & US-64 Interchange', lat: 35.7412, lng: -78.8612, aadt: 58000, pop3Mile: 66000, income: 126000, thesis: 'suburban-infill', score: 92.4, capEx: 5800000, payback: 3.4, gallons: 3450000, cStoreRev: 3500000 },
    { state: 'NC', city: 'Concord', name: 'I-85 & Poplar Tent Charlotte Speed Corridor', address: 'I-85 Exit 52 at Poplar Tent Rd', lat: 35.4012, lng: -80.6812, aadt: 88000, pop3Mile: 58000, income: 94000, thesis: 'highway-defense', score: 91.2, capEx: 7400000, payback: 3.9, gallons: 4400000, cStoreRev: 2900000 },

    // ARIZONA
    { state: 'AZ', city: 'Queen Creek', name: 'Loop 24 & Ellsworth Semiconductor Corridor', address: 'State Route 24 & Ellsworth Rd', lat: 33.2841, lng: -111.6421, aadt: 54000, pop3Mile: 64000, income: 114000, thesis: 'master-planned-belt', score: 93.1, capEx: 5750000, payback: 3.4, gallons: 3600000, cStoreRev: 3400000 },
    { state: 'AZ', city: 'Buckeye', name: 'I-10 West & Verrado Way Freight Gateway', address: 'I-10 & Verrado Way Exit 120', lat: 33.4512, lng: -112.5612, aadt: 96000, pop3Mile: 42000, income: 89000, thesis: 'highway-defense', score: 92.7, capEx: 7900000, payback: 3.8, gallons: 4900000, cStoreRev: 3100000 },

    // COLORADO
    { state: 'CO', city: 'Castle Rock', name: 'I-25 & Crystal Valley Commuter Oasis', address: 'I-25 & Crystal Valley Pkwy', lat: 39.3412, lng: -104.8512, aadt: 82000, pop3Mile: 51000, income: 132000, thesis: 'suburban-infill', score: 91.9, capEx: 6200000, payback: 3.5, gallons: 3500000, cStoreRev: 3650000 },

    // ILLINOIS
    { state: 'IL', city: 'Bolingbrook', name: 'I-55 & I-355 Logistics Crossroads', address: 'I-55 & Weber Rd Interchange', lat: 41.6812, lng: -88.1124, aadt: 110000, pop3Mile: 79000, income: 98000, thesis: 'ev-fleet-corridor', score: 93.9, capEx: 8400000, payback: 3.7, gallons: 5100000, cStoreRev: 3800000 },
    { state: 'IL', city: 'Naperville', name: 'Route 59 & 95th St High-Income Arterial', address: 'IL-59 & 95th Street', lat: 41.7212, lng: -88.2012, aadt: 52000, pop3Mile: 92000, income: 144000, thesis: 'premium-turnaround', score: 92.3, capEx: 6300000, payback: 3.3, gallons: 2950000, cStoreRev: 4200000 },

    // OHIO
    { state: 'OH', city: 'New Albany', name: 'OH-161 & Beech Rd Silicon Heartland', address: 'OH-161 & Beech Rd (Intel Mega-Fab)', lat: 40.0912, lng: -82.7412, aadt: 46000, pop3Mile: 38000, income: 136000, thesis: 'suburban-infill', score: 94.5, capEx: 6100000, payback: 3.3, gallons: 3800000, cStoreRev: 3700000 },
    { state: 'OH', city: 'Dayton', name: 'I-70 & I-75 America Crossroads Mega-Hub', address: 'I-70 & I-75 Interchange Node', lat: 39.8412, lng: -84.1912, aadt: 104000, pop3Mile: 46000, income: 76000, thesis: 'highway-defense', score: 92.8, capEx: 8100000, payback: 3.8, gallons: 5300000, cStoreRev: 3100000 },

    // NEW YORK
    { state: 'NY', city: 'Fishkill', name: 'I-84 & Route 9 Hudson Valley Gateway', address: 'I-84 & Route 9 Interchange', lat: 41.5312, lng: -73.8912, aadt: 72000, pop3Mile: 48000, income: 106000, thesis: 'suburban-infill', score: 90.7, capEx: 6400000, payback: 3.6, gallons: 3200000, cStoreRev: 3400000 },
    { state: 'NY', city: 'White Plains', name: 'I-287 & Westchester Ave High-Volume Infill', address: 'Westchester Ave & Bloomingdale Rd', lat: 41.0312, lng: -73.7512, aadt: 86000, pop3Mile: 124000, income: 145000, thesis: 'urban-infill', score: 93.4, capEx: 7600000, payback: 3.2, gallons: 3300000, cStoreRev: 4600000 },

    // PENNSYLVANIA
    { state: 'PA', city: 'Allentown', name: 'I-78 & Route 100 Lehigh Freight Core', address: 'I-78 Exit 49 at Route 100', lat: 40.5812, lng: -75.6012, aadt: 94000, pop3Mile: 62000, income: 94000, thesis: 'ev-fleet-corridor', score: 93.6, capEx: 8300000, payback: 3.7, gallons: 5400000, cStoreRev: 3400000 },
    { state: 'PA', city: 'King of Prussia', name: 'PA Turnpike & US-202 Retail Hub', address: 'US-202 & Gulph Rd Interchange', lat: 40.0812, lng: -75.3812, aadt: 76000, pop3Mile: 98000, income: 122000, thesis: 'urban-infill', score: 91.8, capEx: 6800000, payback: 3.4, gallons: 3100000, cStoreRev: 3900000 },

    // TENNESSEE
    { state: 'TN', city: 'Murfreesboro', name: 'I-840 & I-24 Nashville Southern Beltway', address: 'I-840 & I-24 Interchange', lat: 35.8412, lng: -86.4412, aadt: 78000, pop3Mile: 58000, income: 96000, thesis: 'suburban-infill', score: 92.3, capEx: 5900000, payback: 3.5, gallons: 3600000, cStoreRev: 3250000 },
    { state: 'TN', city: 'Lebanon', name: 'I-40 East & Hwy 109 Logistics Corridor', address: 'I-40 Exit 232 at Hwy 109', lat: 36.1912, lng: -86.3812, aadt: 86000, pop3Mile: 39000, income: 84000, thesis: 'highway-defense', score: 91.7, capEx: 7700000, payback: 3.8, gallons: 4700000, cStoreRev: 2950000 },

    // WASHINGTON
    { state: 'WA', city: 'Renton', name: 'I-405 & SR-167 Puget Sound Logistics Arc', address: 'I-405 & Talbot Rd S', lat: 47.4612, lng: -122.2112, aadt: 122000, pop3Mile: 96000, income: 118000, thesis: 'ev-fleet-corridor', score: 94.1, capEx: 8600000, payback: 3.5, gallons: 4800000, cStoreRev: 4100000 },

    // NEW JERSEY
    { state: 'NJ', city: 'Edison', name: 'NJ Turnpike Exit 10 & Route 440 Hub', address: 'I-95 Exit 10 & Woodbridge Ave', lat: 40.5112, lng: -74.3412, aadt: 135000, pop3Mile: 116000, income: 128000, thesis: 'urban-infill', score: 94.8, capEx: 8800000, payback: 3.1, gallons: 4900000, cStoreRev: 4800000 },

    // VIRGINIA
    { state: 'VA', city: 'Ashburn', name: 'Dulles Greenway & Loudoun County Pkwy', address: 'Dulles Greenway (VA-267) Exit 7', lat: 39.0212, lng: -77.4812, aadt: 64000, pop3Mile: 84000, income: 168000, thesis: 'premium-turnaround', score: 93.7, capEx: 6800000, payback: 3.1, gallons: 3300000, cStoreRev: 4400000 },

    // MASSACHUSETTS
    { state: 'MA', city: 'Hopkinton', name: 'I-495 & Mass Pike I-90 High-Throughput Node', address: 'I-495 Exit 58 at I-90 Interchange', lat: 42.2312, lng: -71.5312, aadt: 98000, pop3Mile: 36000, income: 154000, thesis: 'premium-turnaround', score: 92.5, capEx: 7400000, payback: 3.3, gallons: 3600000, cStoreRev: 4200000 },

    // MICHIGAN
    { state: 'MI', city: 'Canton', name: 'I-275 & Michigan Ave (US-12) Growth Corridor', address: 'I-275 & Michigan Ave Interchange', lat: 42.2912, lng: -83.4712, aadt: 84000, pop3Mile: 78000, income: 104000, thesis: 'suburban-infill', score: 90.9, capEx: 5900000, payback: 3.6, gallons: 3400000, cStoreRev: 3300000 },

    // INDIANA
    { state: 'IN', city: 'Whitestown', name: 'I-65 & Whitestown Pkwy Logistics Arc', address: 'I-65 Exit 130 at Whitestown Pkwy', lat: 39.9512, lng: -86.3412, aadt: 76000, pop3Mile: 42000, income: 112000, thesis: 'highway-defense', score: 91.6, capEx: 7200000, payback: 3.7, gallons: 4300000, cStoreRev: 3100000 },

    // NEVADA
    { state: 'NV', city: 'Henderson', name: 'I-15 & St. Rose Parkway Southern Gateway', address: 'I-15 & St. Rose Pkwy', lat: 35.9812, lng: -115.1912, aadt: 92000, pop3Mile: 74000, income: 108000, thesis: 'master-planned-belt', score: 93.0, capEx: 6900000, payback: 3.4, gallons: 4100000, cStoreRev: 3800000 },

    // UTAH
    { state: 'UT', city: 'Lehi', name: 'I-15 & Pioneer Crossing Silicon Slopes', address: 'I-15 Exit 279 at Pioneer Crossing', lat: 40.3812, lng: -111.8512, aadt: 88000, pop3Mile: 68000, income: 116000, thesis: 'master-planned-belt', score: 92.4, capEx: 6400000, payback: 3.4, gallons: 3800000, cStoreRev: 3600000 },

    // SOUTH CAROLINA
    { state: 'SC', city: 'Summerville', name: 'I-26 & Nexton Parkway Charleston Growth', address: 'I-26 Exit 197 at Nexton Pkwy', lat: 33.0512, lng: -80.1412, aadt: 68000, pop3Mile: 54000, income: 98000, thesis: 'master-planned-belt', score: 91.5, capEx: 5700000, payback: 3.5, gallons: 3350000, cStoreRev: 3200000 },

    // ALABAMA
    { state: 'AL', city: 'Huntsville', name: 'I-565 & Research Park Blvd Defense Spine', address: 'I-565 & Research Park Blvd', lat: 34.7212, lng: -86.6612, aadt: 62000, pop3Mile: 48000, income: 108000, thesis: 'suburban-infill', score: 90.6, capEx: 5600000, payback: 3.6, gallons: 3100000, cStoreRev: 3100000 },

    // LOUISIANA
    { state: 'LA', city: 'Prairieville', name: 'I-10 & Airline Hwy Baton Rouge Inflow', address: 'I-10 & LA-73 Interchange', lat: 30.2912, lng: -90.9612, aadt: 74000, pop3Mile: 52000, income: 94000, thesis: 'suburban-infill', score: 89.8, capEx: 5500000, payback: 3.7, gallons: 3200000, cStoreRev: 2950000 },

    // MISSOURI
    { state: 'MO', city: 'Wentzville', name: 'I-70 & I-64 GM Logistics & Commuter Hub', address: 'I-70 & Parkway Dr Interchange', lat: 38.8112, lng: -90.8612, aadt: 82000, pop3Mile: 46000, income: 96000, thesis: 'highway-defense', score: 90.5, capEx: 7100000, payback: 3.8, gallons: 4200000, cStoreRev: 2850000 },

    // WISCONSIN
    { state: 'WI', city: 'Pleasant Prairie', name: 'I-94 & Hwy 165 Chicago-Milwaukee Core', address: 'I-94 Exit 347 at Hwy 165', lat: 42.5312, lng: -87.9412, aadt: 96000, pop3Mile: 38000, income: 98000, thesis: 'ev-fleet-corridor', score: 92.0, capEx: 7800000, payback: 3.7, gallons: 4700000, cStoreRev: 3300000 },

    // MINNESOTA
    { state: 'MN', city: 'Lakeville', name: 'I-35 & 185th St Twin Cities South Belt', address: 'I-35 & 185th St W', lat: 44.6612, lng: -93.2812, aadt: 72000, pop3Mile: 62000, income: 122000, thesis: 'suburban-infill', score: 91.2, capEx: 6000000, payback: 3.5, gallons: 3300000, cStoreRev: 3400000 },

    // MARYLAND
    { state: 'MD', city: 'Clarksburg', name: 'I-270 Tech Corridor & MD-121 Node', address: 'I-270 Exit 18 at Clarksburg Rd', lat: 39.2312, lng: -77.2812, aadt: 84000, pop3Mile: 56000, income: 156000, thesis: 'premium-turnaround', score: 93.3, capEx: 6700000, payback: 3.2, gallons: 3200000, cStoreRev: 4300000 },

    // OREGON
    { state: 'OR', city: 'Wilsonville', name: 'I-5 & Elligsen Rd Portland South Corridor', address: 'I-5 Exit 286 at Elligsen Rd', lat: 45.3212, lng: -122.7612, aadt: 98000, pop3Mile: 48000, income: 112000, thesis: 'ev-fleet-corridor', score: 91.8, capEx: 7600000, payback: 3.6, gallons: 4400000, cStoreRev: 3700000 },

    // OKLAHOMA
    { state: 'OK', city: 'Edmond', name: 'Kilpatrick Turnpike & I-35 North Gateway', address: 'I-35 & E 2nd St (Route 66)', lat: 35.6512, lng: -97.4412, aadt: 68000, pop3Mile: 64000, income: 104000, thesis: 'suburban-infill', score: 90.4, capEx: 5600000, payback: 3.6, gallons: 3250000, cStoreRev: 3100000 },

    // KENTUCKY
    { state: 'KY', city: 'Florence', name: 'I-71/I-75 & Turfway Rd CVG Air Cargo Corridor', address: 'I-75 Exit 182 at Turfway Rd', lat: 39.0112, lng: -84.6212, aadt: 118000, pop3Mile: 68000, income: 84000, thesis: 'highway-defense', score: 92.2, capEx: 8000000, payback: 3.7, gallons: 5000000, cStoreRev: 3150000 },

    // CONNECTICUT
    { state: 'CT', city: 'Milford', name: 'I-95 & Route 1 Coastal Commuter Corridor', address: 'I-95 Exit 39 at Boston Post Rd', lat: 41.2312, lng: -73.0612, aadt: 128000, pop3Mile: 76000, income: 114000, thesis: 'urban-infill', score: 92.1, capEx: 7500000, payback: 3.3, gallons: 4100000, cStoreRev: 4100000 },

    // IOWA
    { state: 'IA', city: 'Ankeny', name: 'I-35 & Oralabor Rd Des Moines Growth Core', address: 'I-35 Exit 89 at Oralabor Rd', lat: 41.7012, lng: -93.5812, aadt: 64000, pop3Mile: 52000, income: 102000, thesis: 'suburban-infill', score: 90.1, capEx: 5400000, payback: 3.6, gallons: 3100000, cStoreRev: 2900000 },

    // KANSAS
    { state: 'KS', city: 'Olathe', name: 'K-10 & Ridgeview Rd Johnson County Corridor', address: 'K-10 & Ridgeview Rd Interchange', lat: 38.9312, lng: -94.8112, aadt: 58000, pop3Mile: 62000, income: 122000, thesis: 'suburban-infill', score: 91.4, capEx: 5800000, payback: 3.4, gallons: 3300000, cStoreRev: 3400000 },

    // ARKANSAS
    { state: 'AR', city: 'Bentonville', name: 'I-49 & Walton Blvd Retail Logistics Spine', address: 'I-49 Exit 88 at Walton Blvd', lat: 36.3412, lng: -94.1812, aadt: 72000, pop3Mile: 54000, income: 116000, thesis: 'suburban-infill', score: 92.6, capEx: 6100000, payback: 3.4, gallons: 3500000, cStoreRev: 3600000 },

    // IDAHO
    { state: 'ID', city: 'Meridian', name: 'I-84 & Ten Mile Rd Treasure Valley Arc', address: 'I-84 Exit 42 at Ten Mile Rd', lat: 43.5912, lng: -116.4312, aadt: 78000, pop3Mile: 66000, income: 106000, thesis: 'master-planned-belt', score: 92.8, capEx: 5900000, payback: 3.4, gallons: 3650000, cStoreRev: 3450000 },

    // NEBRASKA
    { state: 'NE', city: 'Gretna', name: 'I-80 & Hwy 6 Omaha-Lincoln Crossroads', address: 'I-80 Exit 432 at Hwy 6/31', lat: 41.1312, lng: -96.2212, aadt: 74000, pop3Mile: 36000, income: 114000, thesis: 'highway-defense', score: 91.0, capEx: 6800000, payback: 3.7, gallons: 4100000, cStoreRev: 3000000 },

    // NEW MEXICO
    { state: 'NM', city: 'Rio Rancho', name: 'NM-528 & US-550 Northern Arc', address: 'NM-528 & US-550 Interchange', lat: 35.3212, lng: -106.5812, aadt: 52000, pop3Mile: 58000, income: 88000, thesis: 'master-planned-belt', score: 89.6, capEx: 5300000, payback: 3.8, gallons: 3000000, cStoreRev: 2750000 },

    // MISSISSIPPI
    { state: 'MS', city: 'Southaven', name: 'I-55 & Goodman Rd Memphis Gateway', address: 'I-55 Exit 289 at Goodman Rd', lat: 34.9812, lng: -89.9912, aadt: 82000, pop3Mile: 64000, income: 82000, thesis: 'highway-defense', score: 90.2, capEx: 6700000, payback: 3.8, gallons: 4100000, cStoreRev: 2900000 },

    // DISTRICT OF COLUMBIA
    { state: 'DC', city: 'Washington', name: 'New York Ave NE (US-50) Capital Inflow', address: 'New York Ave NE & Bladensburg Rd', lat: 38.9182, lng: -76.9712, aadt: 84000, pop3Mile: 148000, income: 132000, thesis: 'urban-infill', score: 93.8, capEx: 8200000, payback: 3.0, gallons: 3800000, cStoreRev: 4900000 },

    // DELAWARE
    { state: 'DE', city: 'Middletown', name: 'DE-1 & US-301 Mid-Atlantic Artery', address: 'DE-1 Exit 136 at Rothwell Village', lat: 39.4412, lng: -75.6812, aadt: 56000, pop3Mile: 44000, income: 112000, thesis: 'suburban-infill', score: 90.3, capEx: 5600000, payback: 3.5, gallons: 3150000, cStoreRev: 3200000 },

    // RHODE ISLAND
    { state: 'RI', city: 'Warwick', name: 'I-95 & Route 2 Retail Spine', address: 'I-95 Exit 8 at Quaker Lane (Route 2)', lat: 41.6912, lng: -71.4912, aadt: 92000, pop3Mile: 72000, income: 98000, thesis: 'urban-infill', score: 90.8, capEx: 6500000, payback: 3.4, gallons: 3300000, cStoreRev: 3600000 },

    // NEW HAMPSHIRE
    { state: 'NH', city: 'Salem', name: 'I-93 Exit 1 Tuscan Village Growth Hub', address: 'I-93 Exit 1 at Rockingham Park Blvd', lat: 42.7712, lng: -71.2112, aadt: 96000, pop3Mile: 58000, income: 118000, thesis: 'premium-turnaround', score: 92.4, capEx: 6900000, payback: 3.2, gallons: 3500000, cStoreRev: 4100000 },

    // MAINE
    { state: 'ME', city: 'Scarborough', name: 'I-95 Maine Turnpike Exit 42 & Route 1', address: 'I-95 Exit 42 at Haigis Pkwy', lat: 43.5812, lng: -70.3612, aadt: 68000, pop3Mile: 38000, income: 104000, thesis: 'highway-defense', score: 89.9, capEx: 5800000, payback: 3.7, gallons: 3200000, cStoreRev: 3100000 },

    // MONTANA
    { state: 'MT', city: 'Bozeman', name: 'I-90 & 19th Ave Mountain Commerce Corridor', address: 'I-90 Exit 305 at N 19th Ave', lat: 45.7012, lng: -111.0612, aadt: 48000, pop3Mile: 42000, income: 96000, thesis: 'highway-defense', score: 90.7, capEx: 6200000, payback: 3.6, gallons: 3400000, cStoreRev: 3300000 },

    // SOUTH DAKOTA
    { state: 'SD', city: 'Sioux Falls', name: 'I-29 & I-90 Great Plains Freight Interchange', address: 'I-29 Exit 83 at 60th St N', lat: 43.5912, lng: -96.7612, aadt: 66000, pop3Mile: 44000, income: 92000, thesis: 'highway-defense', score: 90.0, capEx: 5900000, payback: 3.7, gallons: 3600000, cStoreRev: 2800000 },

    // NORTH DAKOTA
    { state: 'ND', city: 'Fargo', name: 'I-94 & 45th St S Red River Growth Hub', address: 'I-94 Exit 349 at 45th St S', lat: 46.8512, lng: -96.8612, aadt: 62000, pop3Mile: 56000, income: 88000, thesis: 'suburban-infill', score: 89.4, capEx: 5500000, payback: 3.7, gallons: 3100000, cStoreRev: 2750000 },

    // WEST VIRGINIA
    { state: 'WV', city: 'Martinsburg', name: 'I-81 & Route 9 Shenandoah Valley Corridor', address: 'I-81 Exit 12 at Apple Harvest Dr', lat: 39.4412, lng: -77.9812, aadt: 68000, pop3Mile: 42000, income: 84000, thesis: 'highway-defense', score: 89.5, capEx: 5800000, payback: 3.8, gallons: 3500000, cStoreRev: 2650000 },

    // HAWAII
    { state: 'HI', city: 'Kapolei', name: 'H-1 Freeway & Kalaeloa Blvd Oahu West Arc', address: 'H-1 Exit 1 at Kalaeloa Blvd', lat: 21.3312, lng: -158.0912, aadt: 72000, pop3Mile: 62000, income: 114000, thesis: 'master-planned-belt', score: 91.1, capEx: 7200000, payback: 3.4, gallons: 3300000, cStoreRev: 4200000 },

    // ALASKA
    { state: 'AK', city: 'Wasilla', name: 'Parks Highway & Palmer-Wasilla Hwy', address: 'Parks Hwy (AK-3) & Crusey St', lat: 61.5812, lng: -149.4412, aadt: 44000, pop3Mile: 36000, income: 96000, thesis: 'highway-defense', score: 89.2, capEx: 5900000, payback: 3.8, gallons: 3200000, cStoreRev: 2900000 },

    // VERMONT
    { state: 'VT', city: 'Williston', name: 'I-89 & US-2 Taft Corners Commerce Center', address: 'I-89 Exit 12 at US-2 / Williston Rd', lat: 44.4412, lng: -73.1112, aadt: 46000, pop3Mile: 32000, income: 108000, thesis: 'premium-turnaround', score: 89.7, capEx: 5700000, payback: 3.6, gallons: 2900000, cStoreRev: 3400000 },

    // WYOMING
    { state: 'WY', city: 'Cheyenne', name: 'I-80 & I-25 High Plains Transcontinental Hub', address: 'I-80 Exit 362 at Central Ave / I-25 Node', lat: 41.1312, lng: -104.8212, aadt: 54000, pop3Mile: 34000, income: 86000, thesis: 'highway-defense', score: 89.3, capEx: 6100000, payback: 3.8, gallons: 3700000, cStoreRev: 2600000 }
  ];

  STATE_SITE_SPECS.forEach((spec, idx) => {
    const totalRev = Math.round(spec.gallons * 3.45 + spec.cStoreRev);
    const ebitda = Math.round(spec.gallons * 0.28 + spec.cStoreRev * 0.38 - 520000);
    const irr = Math.round((ebitda / spec.capEx) * 100 * 1.35 * 10) / 10;
    const npv = Math.round(ebitda * 4.8 - spec.capEx);

    candidates.push({
      id: `ws-${spec.state.toLowerCase()}-${100 + idx}`,
      candidateName: spec.name,
      address: spec.address,
      city: spec.city,
      state: spec.state,
      county: `${spec.city} County`,
      zipCode: `${spec.state === 'TX' ? '77433' : '90210'}`,
      lat: spec.lat,
      lng: spec.lng,
      opportunityScore: spec.score,
      demandScore: Math.min(99, Math.round(spec.score * 1.02 * 10) / 10),
      supplyGapScore: Math.min(98, Math.round(spec.score * 0.98 * 10) / 10),
      trafficScore: Math.min(99, Math.round(spec.score * 1.01 * 10) / 10),
      competitionScore: Math.max(70, Math.round(spec.score * 0.92 * 10) / 10),
      commercialScore: Math.round(spec.score * 0.95 * 10) / 10,
      financialScore: Math.min(98, Math.round(spec.score * 1.03 * 10) / 10),
      growthScore: Math.min(99, Math.round(spec.score * 1.04 * 10) / 10),
      confidenceLevel: spec.score >= 92 ? 'High' : 'Medium',
      riskLevel: spec.score >= 93 ? 'Low' : spec.score >= 90 ? 'Low' : 'Moderate',
      modelVersion: 'WS-Nationwide-2026.4',
      primaryRationale: [
        `High corridor volume with ${spec.aadt.toLocaleString()} AADT along primary arterial.`,
        `Underserved trade area with $${spec.income.toLocaleString()} median household income.`,
        `Projected net annual volume of ${(spec.gallons / 1000000).toFixed(2)}M fuel gallons & $${(spec.cStoreRev / 1000000).toFixed(2)}M c-store turnover.`,
        `Attractive capital recovery with estimated payback of ${spec.payback} years and ${irr}% unlevered IRR.`
      ],
      dataGaps: ['DOT corridor highway permit and utility easement clearance.'],
      projectedAnnualFuelGallons: spec.gallons,
      projectedAnnualCStoreRevenue: spec.cStoreRev,
      projectedAnnualTotalRevenue: totalRev,
      projectedAnnualEbitda: ebitda,
      projectedDailyFootfall: Math.round(spec.aadt * 0.052),
      projectedMarketSharePct: 32.5,
      estimatedCapEx: spec.capEx,
      estimatedPaybackYears: spec.payback,
      estimatedIrrPct: irr,
      estimatedNpv: npv,
      pop1Mile: Math.round(spec.pop3Mile * 0.18),
      pop3Mile: spec.pop3Mile,
      pop5Mile: Math.round(spec.pop3Mile * 2.6),
      medianIncome3Mile: spec.income,
      medianHouseholdIncome: spec.income,
      aadt: spec.aadt,
      nearestStationMiles: 2.8,
      competitorCount3Miles: 2,
      proposedStoreType: spec.aadt > 80000 ? 'High-Throughput Travel Center + EV Fast Charge' : 'Modern Fuel Forecourt + Gourmet C-Store',
      recommendedPumps: spec.aadt > 80000 ? 16 : 8,
      recommendedCStoreSqFt: spec.cStoreRev > 3500000 ? 5500 : 4200,
      sourceDate: '2026-09-01',
      forecourtPumps: {
        mpdCount: spec.aadt > 80000 ? 8 : 4,
        fuelingPositions: spec.aadt > 80000 ? 16 : 8,
        dieselHdvLanes: spec.aadt > 80000 ? 4 : 1,
        hasDefAtPump: true,
        hasE85: true,
        evDcFastPorts: spec.income > 110000 ? 8 : 4,
        evPowerKw: 350,
        canopySqFt: spec.aadt > 80000 ? 6800 : 4200,
        undergroundStorageTanksGallons: 75000,
        avgPumpsUtilizationPct: 72
      }
    });
  });

  return candidates;
}
