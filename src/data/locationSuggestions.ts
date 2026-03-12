export interface LocationSuggestion {
  id: string;
  name: string;
  type: "city" | "area" | "state";
  parent?: string;
}

export const locations: LocationSuggestion[] = [
  // Indian Cities & Areas
  { id: "delhi", name: "New Delhi", type: "city", parent: "Delhi, India" },
  { id: "connaught", name: "Connaught Place", type: "area", parent: "New Delhi, India" },
  { id: "chandni", name: "Chandni Chowk", type: "area", parent: "New Delhi, India" },
  { id: "karol-bagh", name: "Karol Bagh", type: "area", parent: "New Delhi, India" },
  { id: "saket", name: "Saket", type: "area", parent: "New Delhi, India" },
  { id: "dwarka", name: "Dwarka", type: "area", parent: "New Delhi, India" },
  { id: "noida", name: "Noida", type: "city", parent: "Uttar Pradesh, India" },
  { id: "gurgaon", name: "Gurugram", type: "city", parent: "Haryana, India" },
  { id: "mumbai", name: "Mumbai", type: "city", parent: "Maharashtra, India" },
  { id: "bandra", name: "Bandra", type: "area", parent: "Mumbai, India" },
  { id: "andheri", name: "Andheri", type: "area", parent: "Mumbai, India" },
  { id: "pune", name: "Pune", type: "city", parent: "Maharashtra, India" },
  { id: "bangalore", name: "Bengaluru", type: "city", parent: "Karnataka, India" },
  { id: "koramangala", name: "Koramangala", type: "area", parent: "Bengaluru, India" },
  { id: "whitefield", name: "Whitefield", type: "area", parent: "Bengaluru, India" },
  { id: "chennai", name: "Chennai", type: "city", parent: "Tamil Nadu, India" },
  { id: "hyderabad", name: "Hyderabad", type: "city", parent: "Telangana, India" },
  { id: "kolkata", name: "Kolkata", type: "city", parent: "West Bengal, India" },
  { id: "jaipur", name: "Jaipur", type: "city", parent: "Rajasthan, India" },
  { id: "lucknow", name: "Lucknow", type: "city", parent: "Uttar Pradesh, India" },
  // States
  { id: "maharashtra", name: "Maharashtra", type: "state", parent: "India" },
  { id: "karnataka", name: "Karnataka", type: "state", parent: "India" },
  { id: "tamilnadu", name: "Tamil Nadu", type: "state", parent: "India" },
  { id: "rajasthan", name: "Rajasthan", type: "state", parent: "India" },
  { id: "up", name: "Uttar Pradesh", type: "state", parent: "India" },
  // International
  { id: "london", name: "London", type: "city", parent: "United Kingdom" },
  { id: "paris", name: "Paris", type: "city", parent: "France" },
  { id: "tokyo", name: "Tokyo", type: "city", parent: "Japan" },
  { id: "newyork", name: "New York", type: "city", parent: "USA" },
  { id: "beijing", name: "Beijing", type: "city", parent: "China" },
  { id: "sydney", name: "Sydney", type: "city", parent: "Australia" },
  { id: "dubai", name: "Dubai", type: "city", parent: "UAE" },
  { id: "singapore", name: "Singapore", type: "city", parent: "Singapore" },
];

export function searchLocations(query: string): LocationSuggestion[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return locations
    .filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.parent && l.parent.toLowerCase().includes(q))
    )
    .slice(0, 6);
}
