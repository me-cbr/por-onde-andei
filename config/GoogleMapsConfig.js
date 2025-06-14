export const GOOGLE_MAPS_CONFIG = {
  API_KEY: "YOUR_GOOGLE_API_KEY_HERE",

  DEFAULT_REGION: "BR",
  DEFAULT_LANGUAGE: "pt-BR",

  PLACE_TYPES: {
    RESTAURANT: "restaurant",
    GAS_STATION: "gas_station",
    HOSPITAL: "hospital",
    SCHOOL: "school",
    BANK: "bank",
    PHARMACY: "pharmacy",
    SUPERMARKET: "supermarket",
    TOURIST_ATTRACTION: "tourist_attraction",
    PARK: "park",
    MUSEUM: "museum",
  },

  CACHE_DURATION: 1000 * 60 * 30,
  MAX_CACHE_SIZE: 100,

  DEFAULT_RADIUS: 1000,
  MAX_RESULTS: 20,

  REQUEST_TIMEOUT: 10000,
}

export const isGoogleMapsConfigured = () => {
  return GOOGLE_MAPS_CONFIG.API_KEY && GOOGLE_MAPS_CONFIG.API_KEY !== "YOUR_GOOGLE_API_KEY_HERE"
}

export const setGoogleMapsApiKey = (apiKey) => {
  GOOGLE_MAPS_CONFIG.API_KEY = apiKey
}
