export interface LocationSuggestion {
  id: string;
  name: string;
  type: "city" | "area" | "state" | "locality" | "landmark" | "market" | "station" | "delivery_zone" | "cycling_route";
  parent?: string;
  aliases?: string[];
  popularity?: number;
  lat?: number;
  lon?: number;
}

export const locations: LocationSuggestion[] = [
  // Major Indian Cities & Areas
  { id: "delhi", name: "New Delhi", type: "city", parent: "Delhi, India", aliases: ["delhi", "dilli"], popularity: 100 },
  
  // Delhi Localities & Neighborhoods
  { id: "connaught", name: "Connaught Place", type: "area", parent: "New Delhi, India", aliases: ["cp", "connaught place"], popularity: 85 },
  { id: "chandni", name: "Chandni Chowk", type: "market", parent: "New Delhi, India", aliases: ["chandni chowk"], popularity: 75 },
  { id: "karol-bagh", name: "Karol Bagh", type: "area", parent: "New Delhi, India", aliases: ["karol bagh"], popularity: 70 },
  { id: "saket", name: "Saket", type: "locality", parent: "New Delhi, India", popularity: 65 },
  { id: "dwarka", name: "Dwarka", type: "area", parent: "New Delhi, India", aliases: ["dwarka sector 21"], popularity: 70 },
  { id: "rohini", name: "Rohini", type: "locality", parent: "New Delhi, India", popularity: 60 },
  { id: "vasant-kunj", name: "Vasant Kunj", type: "locality", parent: "New Delhi, India", popularity: 55 },
  { id: "greater-kailash", name: "Greater Kailash", type: "area", parent: "New Delhi, India", aliases: ["gk"], popularity: 65 },
  { id: "lajpat-nagar", name: "Lajpat Nagar", type: "market", parent: "New Delhi, India", popularity: 60 },
  { id: "defence-colony", name: "Defence Colony", type: "locality", parent: "New Delhi, India", popularity: 55 },
  { id: "hauz-khas", name: "Hauz Khas", type: "area", parent: "New Delhi, India", popularity: 70 },
  { id: "green-park", name: "Green Park", type: "locality", parent: "New Delhi, India", popularity: 50 },
  { id: "malviya-nagar", name: "Malviya Nagar", type: "locality", parent: "New Delhi, India", popularity: 55 },
  { id: "janak-puri", name: "Janak Puri", type: "locality", parent: "New Delhi, India", popularity: 60 },
  { id: "uttam-nagar", name: "Uttam Nagar", type: "locality", parent: "New Delhi, India", popularity: 55 },
  { id: "kamla-nagar", name: "Kamla Nagar", type: "market", parent: "New Delhi, India", popularity: 60 },
  { id: "sarojini-nagar", name: "Sarojini Nagar", type: "market", parent: "New Delhi, India", popularity: 65 },
  { id: "india-gate", name: "India Gate", type: "landmark", parent: "New Delhi, India", popularity: 80 },
  { id: "red-fort", name: "Red Fort", type: "landmark", parent: "New Delhi, India", popularity: 75 },
  { id: "qutub-minar", name: "Qutub Minar", type: "landmark", parent: "New Delhi, India", popularity: 70 },
  
  // Delhi Stations & Transport Hubs
  { id: "new-delhi-station", name: "New Delhi Railway Station", type: "station", parent: "New Delhi, India", popularity: 75 },
  { id: "old-delhi-station", name: "Old Delhi Railway Station", type: "station", parent: "New Delhi, India", popularity: 70 },
  { id: "anand-vihar", name: "Anand Vihar ISBT", type: "station", parent: "New Delhi, India", popularity: 65 },
  
  // Delhi Delivery Zones & Cycling Routes
  { id: "cp-delivery-zone", name: "Connaught Place Delivery Zone", type: "delivery_zone", parent: "New Delhi, India", popularity: 70 },
  { id: "lodhi-garden-cycling", name: "Lodhi Garden Cycling Route", type: "cycling_route", parent: "New Delhi, India", popularity: 55 },
  
  // Mumbai Localities & Neighborhoods
  { id: "mumbai", name: "Mumbai", type: "city", parent: "Maharashtra, India", aliases: ["bombay"], popularity: 100 },
  { id: "bandra", name: "Bandra", type: "area", parent: "Mumbai, India", popularity: 80 },
  { id: "andheri", name: "Andheri", type: "area", parent: "Mumbai, India", aliases: ["andheri east", "andheri west"], popularity: 85 },
  { id: "dadar", name: "Dadar", type: "area", parent: "Mumbai, India", popularity: 75 },
  { id: "churchgate", name: "Churchgate", type: "area", parent: "Mumbai, India", popularity: 70 },
  { id: "colaba", name: "Colaba", type: "locality", parent: "Mumbai, India", popularity: 75 },
  { id: "juhu", name: "Juhu", type: "locality", parent: "Mumbai, India", popularity: 70 },
  { id: "powai", name: "Powai", type: "locality", parent: "Mumbai, India", popularity: 65 },
  { id: "bandra-kurla", name: "Bandra Kurla Complex", type: "area", parent: "Mumbai, India", aliases: ["bkc"], popularity: 80 },
  { id: "crawford-market", name: "Crawford Market", type: "market", parent: "Mumbai, India", popularity: 70 },
  { id: "gateway-of-india", name: "Gateway of India", type: "landmark", parent: "Mumbai, India", popularity: 80 },
  { id: "cst-station", name: "Chhatrapati Shivaji Terminus", type: "station", parent: "Mumbai, India", popularity: 75 },
  { id: "marine-lines-cycling", name: "Marine Drive Cycling Route", type: "cycling_route", parent: "Mumbai, India", popularity: 60 },
  
  // Bangalore Localities
  { id: "bangalore", name: "Bengaluru", type: "city", parent: "Karnataka, India", aliases: ["bangalore", "bengaluru"], popularity: 100 },
  { id: "koramangala", name: "Koramangala", type: "area", parent: "Bengaluru, India", popularity: 80 },
  { id: "whitefield", name: "Whitefield", type: "area", parent: "Bengaluru, India", popularity: 85 },
  { id: "indiranagar", name: "Indiranagar", type: "area", parent: "Bengaluru, India", popularity: 75 },
  { id: "jayanagar", name: "Jayanagar", type: "area", parent: "Bengaluru, India", popularity: 70 },
  { id: "marathahalli", name: "Marathahalli", type: "locality", parent: "Bengaluru, India", popularity: 65 },
  { id: "electronic-city", name: "Electronic City", type: "area", parent: "Bengaluru, India", popularity: 75 },
  { id: "commercial-street", name: "Commercial Street", type: "market", parent: "Bengaluru, India", popularity: 70 },
  { id: "cubbon-park", name: "Cubbon Park", type: "landmark", parent: "Bengaluru, India", popularity: 65 },
  { id: "cubbon-park-cycling", name: "Cubbon Park Cycling Track", type: "cycling_route", parent: "Bengaluru, India", popularity: 60 },
  
  // Other Major Cities with Local Areas
  { id: "pune", name: "Pune", type: "city", parent: "Maharashtra, India", aliases: ["poona"], popularity: 90 },
  { id: "koregaon-park", name: "Koregaon Park", type: "area", parent: "Pune, India", popularity: 70 },
  { id: "hinjewadi", name: "Hinjewadi", type: "area", parent: "Pune, India", popularity: 75 },
  { id: "fc-road", name: "Fergusson College Road", type: "market", parent: "Pune, India", popularity: 65 },
  
  { id: "chennai", name: "Chennai", type: "city", parent: "Tamil Nadu, India", aliases: ["madras"], popularity: 95 },
  { id: "t-nagar", name: "T. Nagar", type: "market", parent: "Chennai, India", popularity: 75 },
  { id: "anna-nagar", name: "Anna Nagar", type: "area", parent: "Chennai, India", popularity: 70 },
  { id: "velachery", name: "Velachery", type: "area", parent: "Chennai, India", popularity: 65 },
  
  { id: "hyderabad", name: "Hyderabad", type: "city", parent: "Telangana, India", popularity: 95 },
  { id: "banjara-hills", name: "Banjara Hills", type: "area", parent: "Hyderabad, India", popularity: 80 },
  { id: "jubilee-hills", name: "Jubilee Hills", type: "area", parent: "Hyderabad, India", popularity: 75 },
  { id: "gachibowli", name: "Gachibowli", type: "area", parent: "Hyderabad, India", popularity: 70 },
  { id: "hitech-city", name: "Hitech City", type: "area", parent: "Hyderabad, India", popularity: 75 },
  
  { id: "kolkata", name: "Kolkata", type: "city", parent: "West Bengal, India", aliases: ["calcutta"], popularity: 95 },
  { id: "park-street", name: "Park Street", type: "area", parent: "Kolkata, India", popularity: 75 },
  { id: "salt-lake", name: "Salt Lake", type: "area", parent: "Kolkata, India", popularity: 70 },
  
  // Major Cities (simplified)
  { id: "jaipur", name: "Jaipur", type: "city", parent: "Rajasthan, India", popularity: 85 },
  { id: "lucknow", name: "Lucknow", type: "city", parent: "Uttar Pradesh, India", popularity: 85 },
  { id: "ahmedabad", name: "Ahmedabad", type: "city", parent: "Gujarat, India", popularity: 85 },
  { id: "surat", name: "Surat", type: "city", parent: "Gujarat, India", popularity: 75 },
  { id: "kanpur", name: "Kanpur", type: "city", parent: "Uttar Pradesh, India", popularity: 70 },
  { id: "nagpur", name: "Nagpur", type: "city", parent: "Maharashtra, India", popularity: 70 },
  { id: "indore", name: "Indore", type: "city", parent: "Madhya Pradesh, India", popularity: 70 },
  { id: "thane", name: "Thane", type: "city", parent: "Maharashtra, India", popularity: 75 },
  { id: "bhopal", name: "Bhopal", type: "city", parent: "Madhya Pradesh, India", popularity: 70 },
  { id: "coimbatore", name: "Coimbatore", type: "city", parent: "Tamil Nadu, India", popularity: 70 },
  { id: "kochi", name: "Kochi", type: "city", parent: "Kerala, India", aliases: ["cochin"], popularity: 70 },
  { id: "guwahati", name: "Guwahati", type: "city", parent: "Assam, India", popularity: 70 },
  
  // States
  { id: "maharashtra", name: "Maharashtra", type: "state", parent: "India", popularity: 100 },
  { id: "karnataka", name: "Karnataka", type: "state", parent: "India", popularity: 90 },
  { id: "tamilnadu", name: "Tamil Nadu", type: "state", parent: "India", popularity: 90 },
  { id: "rajasthan", name: "Rajasthan", type: "state", parent: "India", popularity: 80 },
  { id: "up", name: "Uttar Pradesh", type: "state", parent: "India", popularity: 100 },
  { id: "bihar", name: "Bihar", type: "state", parent: "India", popularity: 80 },
  { id: "west-bengal", name: "West Bengal", type: "state", parent: "India", popularity: 85 },
  { id: "madhya-pradesh", name: "Madhya Pradesh", type: "state", parent: "India", popularity: 80 },
  { id: "gujarat", name: "Gujarat", type: "state", parent: "India", popularity: 90 },
  { id: "andhra-pradesh", name: "Andhra Pradesh", type: "state", parent: "India", popularity: 75 },
  { id: "telangana", name: "Telangana", type: "state", parent: "India", popularity: 75 },
  { id: "kerala", name: "Kerala", type: "state", parent: "India", popularity: 85 },
  { id: "punjab", name: "Punjab", type: "state", parent: "India", popularity: 75 },
  { id: "haryana", name: "Haryana", type: "state", parent: "India", popularity: 75 },
  { id: "delhi-state", name: "Delhi", type: "state", parent: "India", popularity: 95 },
  
  // International Cities
  { id: "london", name: "London", type: "city", parent: "United Kingdom", popularity: 95 },
  { id: "paris", name: "Paris", type: "city", parent: "France", popularity: 95 },
  { id: "tokyo", name: "Tokyo", type: "city", parent: "Japan", popularity: 95 },
  { id: "newyork", name: "New York", type: "city", parent: "USA", aliases: ["nyc"], popularity: 100 },
  { id: "beijing", name: "Beijing", type: "city", parent: "China", popularity: 90 },
  { id: "sydney", name: "Sydney", type: "city", parent: "Australia", popularity: 85 },
  { id: "dubai", name: "Dubai", type: "city", parent: "UAE", popularity: 90 },
  { id: "singapore", name: "Singapore", type: "city", parent: "Singapore", popularity: 85 },
];

function calculateRelevanceScore(location: LocationSuggestion, query: string, searchContext?: string): number {
  const q = query.toLowerCase();
  const name = location.name.toLowerCase();
  const parent = location.parent?.toLowerCase() || '';
  const aliases = location.aliases || [];
  
  let score = 0;
  
  // Exact name match gets highest score
  if (name === q) score += 100;
  else if (name.startsWith(q)) score += 80;
  else if (name.includes(q)) score += 60;
  
  // Check aliases with high priority
  for (const alias of aliases) {
    const aliasLower = alias.toLowerCase();
    if (aliasLower === q) score += 95;
    else if (aliasLower.startsWith(q)) score += 75;
    else if (aliasLower.includes(q)) score += 55;
  }
  
  // Parent location matches
  if (parent.includes(q)) score += 30;
  
  // Context-aware scoring based on search intent
  if (searchContext) {
    const context = searchContext.toLowerCase();
    
    // Boost delivery zones for delivery context
    if (context.includes('delivery') && location.type === 'delivery_zone') {
      score += 40;
    }
    
    // Boost cycling routes for cycling context
    if (context.includes('cycling') && location.type === 'cycling_route') {
      score += 40;
    }
    
    // Boost local areas for local searches
    if (context.includes('local') || context.includes('nearby') || context.includes('area')) {
      if (location.type === 'locality' || location.type === 'market') {
        score += 30;
      }
    }
  }
  
  // Type-specific scoring for general searches
  if (q.length > 3) {
    switch (location.type) {
      case 'locality': score += 15; break;
      case 'market': score += 12; break;
      case 'landmark': score += 10; break;
      case 'station': score += 8; break;
      case 'delivery_zone': score += 6; break;
      case 'cycling_route': score += 6; break;
      case 'area': score += 5; break;
      case 'city': score += 3; break;
      case 'state': score += 1; break;
    }
  } else {
    // For short queries, prefer major locations
    switch (location.type) {
      case 'city': score += 10; break;
      case 'area': score += 8; break;
      case 'state': score += 5; break;
      case 'locality': score += 3; break;
      case 'market': score += 2; break;
      case 'landmark': score += 2; break;
      case 'station': score += 2; break;
      case 'delivery_zone': score += 1; break;
      case 'cycling_route': score += 1; break;
    }
  }
  
  // Add popularity bonus (scaled by query length)
  const popularityMultiplier = Math.max(0.1, 1 - (q.length * 0.05));
  score += (location.popularity || 50) * popularityMultiplier / 10;
  
  return score;
}

export function searchLocations(query: string, searchContext?: string, maxResults: number = 8): LocationSuggestion[] {
  if (!query || query.length < 2) return [];
  
  const results = locations
    .map(location => ({
      location,
      score: calculateRelevanceScore(location, query, searchContext)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.location);
  
  return results;
}

// Specialized search functions for different contexts
export function searchDeliveryLocations(query: string): LocationSuggestion[] {
  return searchLocations(query, 'delivery', 10);
}

export function searchCyclingLocations(query: string): LocationSuggestion[] {
  return searchLocations(query, 'cycling', 10);
}

export function searchLocalAreas(query: string): LocationSuggestion[] {
  return searchLocations(query, 'local areas', 10);
}
