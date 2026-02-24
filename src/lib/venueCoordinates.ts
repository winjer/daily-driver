// Cricket ground coordinates for weather lookups
// Covers major international venues

const venues: Record<string, { lat: number; lon: number }> = {
  // England
  "Lord's": { lat: 51.5294, lon: -0.1726 },
  "The Oval": { lat: 51.4838, lon: -0.1147 },
  "Kennington Oval": { lat: 51.4838, lon: -0.1147 },
  Edgbaston: { lat: 52.4559, lon: -1.9025 },
  "Trent Bridge": { lat: 52.9369, lon: -1.1322 },
  Headingley: { lat: 53.8176, lon: -1.5822 },
  "Old Trafford": { lat: 53.4566, lon: -2.2873 },
  "Sophia Gardens": { lat: 51.4716, lon: -3.1817 },
  "The Rose Bowl": { lat: 50.9241, lon: -1.3225 },
  "Riverside Ground": { lat: 54.7709, lon: -1.5721 },
  Bristol: { lat: 51.4539, lon: -2.5831 },

  // Australia
  MCG: { lat: -37.82, lon: 144.9834 },
  SCG: { lat: -33.8917, lon: 151.2247 },
  "The Gabba": { lat: -27.4858, lon: 153.0381 },
  WACA: { lat: -31.9601, lon: 115.8793 },
  "Perth Stadium": { lat: -31.9512, lon: 115.8891 },
  "Adelaide Oval": { lat: -34.9156, lon: 138.5961 },
  Bellerive: { lat: -42.8738, lon: 147.3729 },
  Manuka: { lat: -35.3177, lon: 149.1325 },

  // India
  "Wankhede Stadium": { lat: 18.9389, lon: 72.8258 },
  "Eden Gardens": { lat: 22.5646, lon: 88.3433 },
  "M. Chinnaswamy Stadium": { lat: 12.9788, lon: 77.5996 },
  "Narendra Modi Stadium": { lat: 23.0919, lon: 72.5967 },
  "MA Chidambaram Stadium": { lat: 13.0627, lon: 80.2792 },
  "Rajiv Gandhi Intl Cricket Stadium": { lat: 17.4065, lon: 78.5503 },
  "Arun Jaitley Stadium": { lat: 28.6377, lon: 77.2433 },
  "HPCA Stadium": { lat: 32.1094, lon: 76.5381 },
  "Maharashtra Cricket Association Stadium": { lat: 18.6758, lon: 73.8715 },

  // South Africa
  Newlands: { lat: -33.9271, lon: 18.4374 },
  "The Wanderers": { lat: -26.1325, lon: 28.0574 },
  SuperSport: { lat: -25.7461, lon: 28.2228 },
  "St George's Park": { lat: -33.9572, lon: 25.6011 },
  Kingsmead: { lat: -29.8562, lon: 31.0306 },

  // West Indies
  "Kensington Oval": { lat: 13.1057, lon: -59.6178 },
  "Sabina Park": { lat: 17.9933, lon: -76.7478 },
  "Queen's Park Oval": { lat: 10.6618, lon: -61.5175 },

  // New Zealand
  "Basin Reserve": { lat: -41.3, lon: 174.778 },
  "Hagley Oval": { lat: -43.5309, lon: 172.6224 },
  "Seddon Park": { lat: -37.7861, lon: 175.2834 },
  "Bay Oval": { lat: -37.6863, lon: 176.2828 },

  // Pakistan
  "Rawalpindi Cricket Stadium": { lat: 33.6, lon: 73.05 },
  "Gaddafi Stadium": { lat: 31.5138, lon: 74.3391 },
  "National Stadium": { lat: 24.8924, lon: 67.0652 },

  // Sri Lanka
  "Galle International Stadium": { lat: 6.0328, lon: 80.215 },
  "R.Premadasa Stadium": { lat: 6.9178, lon: 79.8614 },
  "Pallekele International Cricket Stadium": { lat: 7.2714, lon: 80.6369 },

  // Bangladesh
  "Sher-e-Bangla National Cricket Stadium": { lat: 23.7339, lon: 90.3664 },

  // Zimbabwe
  "Harare Sports Club": { lat: -17.8, lon: 31.05 },
};

export function getVenueCoordinates(
  venueName: string
): { lat: number; lon: number } | null {
  // Try exact match first
  if (venues[venueName]) return venues[venueName];

  // Try partial match
  const lowerName = venueName.toLowerCase();
  for (const [key, coords] of Object.entries(venues)) {
    if (
      lowerName.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(lowerName)
    ) {
      return coords;
    }
  }

  return null;
}
