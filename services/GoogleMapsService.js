class GoogleMapsService {
  constructor() {
    this.API_KEY = "YOUR_GOOGLE_API_KEY_HERE"
    this.baseUrl = "https://maps.googleapis.com/maps/api"
  }

  setApiKey(apiKey) {
    this.API_KEY = apiKey
  }

  async geocodeAddress(address) {
    try {
      if (!this.API_KEY || this.API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
        throw new Error("Google API key not configured")
      }

      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.API_KEY}&language=pt-BR&region=BR`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0]
        return {
          address: result.formatted_address,
          location: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          },
          placeId: result.place_id,
          types: result.types,
        }
      }

      throw new Error(`Geocoding failed: ${data.status}`)
    } catch (error) {
      console.error("Error geocoding address:", error)
      throw error
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      if (!this.API_KEY || this.API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
        throw new Error("Google API key not configured")
      }

      const url = `${this.baseUrl}/geocode/json?latlng=${latitude},${longitude}&key=${this.API_KEY}&language=pt-BR&region=BR`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        return data.results.map((result) => ({
          address: result.formatted_address,
          placeId: result.place_id,
          types: result.types,
          components: result.address_components,
        }))
      }

      throw new Error(`Reverse geocoding failed: ${data.status}`)
    } catch (error) {
      console.error("Error reverse geocoding:", error)
      throw error
    }
  }

  async searchNearbyPlaces(latitude, longitude, radius = 1000, type = null) {
    try {
      if (!this.API_KEY || this.API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
        throw new Error("Google API key not configured")
      }

      let url = `${this.baseUrl}/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${this.API_KEY}&language=pt-BR`

      if (type) {
        url += `&type=${type}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK") {
        return data.results.map((place) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          rating: place.rating,
          types: place.types,
          priceLevel: place.price_level,
          isOpen: place.opening_hours?.open_now,
          photos: place.photos?.map(
            (photo) =>
              `${this.baseUrl}/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.API_KEY}`,
          ),
        }))
      }

      return []
    } catch (error) {
      console.error("Error searching nearby places:", error)
      return []
    }
  }

  async autocompleteAddress(input, sessionToken = null) {
    try {
      if (!this.API_KEY || this.API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
        throw new Error("Google API key not configured")
      }

      let url = `${this.baseUrl}/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${this.API_KEY}&language=pt-BR&components=country:BR`

      if (sessionToken) {
        url += `&sessiontoken=${sessionToken}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK") {
        return data.predictions.map((prediction) => ({
          id: prediction.place_id,
          description: prediction.description,
          mainText: prediction.structured_formatting.main_text,
          secondaryText: prediction.structured_formatting.secondary_text,
          types: prediction.types,
        }))
      }

      return []
    } catch (error) {
      console.error("Error autocompleting address:", error)
      return []
    }
  }

  async calculateDistance(origin, destination, mode = "driving") {
    try {
      if (!this.API_KEY || this.API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
        throw new Error("Google API key not configured")
      }

      const originStr = `${origin.latitude},${origin.longitude}`
      const destinationStr = `${destination.latitude},${destination.longitude}`

      const url = `${this.baseUrl}/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&mode=${mode}&key=${this.API_KEY}&language=pt-BR&units=metric`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        const element = data.rows[0].elements[0]
        return {
          distance: element.distance,
          duration: element.duration,
          status: element.status,
        }
      }

      throw new Error("Distance calculation failed")
    } catch (error) {
      console.error("Error calculating distance:", error)
      throw error
    }
  }
}

const googleMapsService = new GoogleMapsService()
export default googleMapsService
