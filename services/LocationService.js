import * as Location from "expo-location"

class LocationService {
  constructor() {
    this.GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY_HERE"
    this.cache = new Map()
  }

  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      return status === "granted"
    } catch (error) {
      console.error("Error requesting location permissions:", error)
      return false
    }
  }

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        throw new Error("Location permission denied")
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 10000,
      })

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    } catch (error) {
      console.error("Error getting current location:", error)
      throw error
    }
  }

  async getAddressFromCoordinates(latitude, longitude) {
    try {
      const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      let address = await this.getAddressFromGoogle(latitude, longitude)

      if (!address || address === "Endereço não encontrado") {
        address = await this.getAddressFromExpo(latitude, longitude)
      }

      if (address && address !== "Endereço não encontrado") {
        this.cache.set(cacheKey, address)
      }

      return address
    } catch (error) {
      console.error("Error getting address:", error)
      return "Erro ao obter endereço"
    }
  }

  async getAddressFromGoogle(latitude, longitude) {
    try {
      if (!this.GOOGLE_API_KEY || this.GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
        return await this.getAddressFromExpo(latitude, longitude)
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.GOOGLE_API_KEY}&language=pt-BR&region=BR`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0]

        let formattedAddress = result.formatted_address

        const addressComponents = result.address_components
        const customAddress = this.formatCustomAddress(addressComponents)

        if (customAddress) {
          formattedAddress = customAddress
        }

        return formattedAddress
      } else {
        return null
      }
    } catch (error) {
      console.error("Error calling Google Geocoding API:", error)
      return null
    }
  }

  formatCustomAddress(components) {
    try {
      const addressParts = {
        streetNumber: "",
        route: "",
        neighborhood: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
      }

      components.forEach((component) => {
        const types = component.types

        if (types.includes("street_number")) {
          addressParts.streetNumber = component.long_name
        } else if (types.includes("route")) {
          addressParts.route = component.long_name
        } else if (types.includes("sublocality") || types.includes("neighborhood")) {
          addressParts.neighborhood = component.long_name
        } else if (types.includes("administrative_area_level_2") || types.includes("locality")) {
          addressParts.city = component.long_name
        } else if (types.includes("administrative_area_level_1")) {
          addressParts.state = component.short_name
        } else if (types.includes("country")) {
          addressParts.country = component.long_name
        } else if (types.includes("postal_code")) {
          addressParts.postalCode = component.long_name
        }
      })

      const parts = []

      if (addressParts.route) {
        let street = addressParts.route
        if (addressParts.streetNumber) {
          street += `, ${addressParts.streetNumber}`
        }
        parts.push(street)
      }

      if (addressParts.neighborhood) {
        parts.push(addressParts.neighborhood)
      }

      if (addressParts.city) {
        let cityPart = addressParts.city
        if (addressParts.state) {
          cityPart += ` - ${addressParts.state}`
        }
        parts.push(cityPart)
      }

      if (addressParts.postalCode) {
        parts.push(`CEP: ${addressParts.postalCode}`)
      }

      return parts.length > 0 ? parts.join(", ") : null
    } catch (error) {
      console.error("Error formatting custom address:", error)
      return null
    }
  }

  async getAddressFromExpo(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })

      if (addresses && addresses.length > 0) {
        const address = addresses[0]
        const formattedAddress = [
          address.street,
          address.streetNumber,
          address.district,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(", ")

        return formattedAddress || "Endereço não encontrado"
      }

      return "Endereço não encontrado"
    } catch (error) {
      console.error("Error with Expo Location:", error)
      return "Erro ao obter endereço"
    }
  }

  async searchPlaces(query) {
    try {
      if (!this.GOOGLE_API_KEY || this.GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
        return []
      }

      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.GOOGLE_API_KEY}&language=pt-BR&region=BR`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results) {
        return data.results.map((place) => ({
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          rating: place.rating,
          types: place.types,
      }))
      }

      return []
    } catch (error) {
      console.error("Error searching places:", error)
      return []
    }
  }

  async getPlaceDetails(placeId) {
    try {
      if (!this.GOOGLE_API_KEY || this.GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
        return null
      }

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.GOOGLE_API_KEY}&language=pt-BR&fields=name,formatted_address,geometry,rating,photos,opening_hours,formatted_phone_number,website`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.result) {
        const place = data.result
        return {
          id: placeId,
          name: place.name,
          address: place.formatted_address,
          location: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          rating: place.rating,
          phone: place.formatted_phone_number,
          website: place.website,
          openingHours: place.opening_hours?.weekday_text,
          photos: place.photos?.map(
            (photo) =>
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.GOOGLE_API_KEY}`,
          ),
        }
      }

      return null
    } catch (error) {
      console.error("Error getting place details:", error)
      return null
    }
  }

  clearCache() {
    this.cache.clear()
  }

  setApiKey(apiKey) {
    this.GOOGLE_API_KEY = apiKey
  }
}

const locationService = new LocationService()
export default locationService
