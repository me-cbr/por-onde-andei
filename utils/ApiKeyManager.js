import AsyncStorage from "@react-native-async-storage/async-storage"
import locationService from "../services/LocationService"
import googleMapsService from "../services/GoogleMapsService"

class ApiKeyManager {
  constructor() {
    this.STORAGE_KEY = "google_maps_api_key"
  }

  async loadApiKey() {
    try {
      const apiKey = await AsyncStorage.getItem(this.STORAGE_KEY)
      if (apiKey) {
        locationService.setApiKey(apiKey)
        googleMapsService.setApiKey(apiKey)
        return apiKey
      }
      return null
    } catch (error) {
      console.error("Error loading API key:", error)
      return null
    }
  }

  async saveApiKey(apiKey) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, apiKey)
      locationService.setApiKey(apiKey)
      googleMapsService.setApiKey(apiKey)
      return true
    } catch (error) {
      console.error("Error saving API key:", error)
      return false
    }
  }

  async removeApiKey() {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY)
      return true
    } catch (error) {
      console.error("Error removing API key:", error)
      return false
    }
  }

  async testApiKey(apiKey) {
    try {
      const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=São Paulo, Brasil&key=${apiKey}`
      const response = await fetch(testUrl)
      const data = await response.json()

      return data.status === "OK"
    } catch (error) {
      console.error("Error testing API key:", error)
      return false
    }
  }
}

const apiKeyManager = new ApiKeyManager()
export default apiKeyManager
