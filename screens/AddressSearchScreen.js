import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import googleMapsService from "../services/GoogleMapsService"
import locationService from "../services/LocationService"

function AddressSearchScreen({ navigation, route }) {
  const [searchText, setSearchText] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionToken] = useState(() => Math.random().toString(36).substring(7))

  const { onAddressSelect } = route.params || {}

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText.length > 2) {
        searchAddresses()
      } else {
        setSuggestions([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchText])

  const searchAddresses = async () => {
    try {
      setIsLoading(true)
      const results = await googleMapsService.autocompleteAddress(searchText, sessionToken)
      setSuggestions(results)
    } catch (error) {
      console.error("Error searching addresses:", error)
      Alert.alert("Erro", "Não foi possível buscar endereços")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressSelect = async (suggestion) => {
    try {
      setIsLoading(true)

      const placeDetails = await locationService.getPlaceDetails(suggestion.id)

      if (placeDetails) {
        const addressData = {
          address: placeDetails.address,
          location: placeDetails.location,
          placeId: suggestion.id,
          name: placeDetails.name,
        }

        if (onAddressSelect) {
          onAddressSelect(addressData)
        }

        navigation.goBack()
      } else {
        Alert.alert("Erro", "Não foi possível obter detalhes do endereço")
      }
    } catch (error) {
      console.error("Error selecting address:", error)
      Alert.alert("Erro", "Erro ao selecionar endereço")
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true)
      const location = await locationService.getCurrentLocation()
      const address = await locationService.getAddressFromCoordinates(location.latitude, location.longitude)

      const addressData = {
        address,
        location,
        placeId: null,
        name: "Localização Atual",
      }

      if (onAddressSelect) {
        onAddressSelect(addressData)
      }

      navigation.goBack()
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter localização atual")
    } finally {
      setIsLoading(false)
    }
  }

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleAddressSelect(item)}>
      <Ionicons name="location-outline" size={20} color="#4CAF50" />
      <View style={styles.suggestionText}>
        <Text style={styles.mainText}>{item.mainText}</Text>
        <Text style={styles.secondaryText}>{item.secondaryText}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar Endereço</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Digite o endereço..."
            placeholderTextColor="black"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {isLoading && <ActivityIndicator size="small" color="#4CAF50" />}
        </View>

        <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation}>
          <Ionicons name="locate" size={20} color="#4CAF50" />
          <Text style={styles.currentLocationText}>Usar localização atual</Text>
        </TouchableOpacity>

        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
          keyExtractor={(item) => item.id}
          style={styles.suggestionsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 100,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  currentLocationText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
  },
  suggestionText: {
    flex: 1,
    marginLeft: 12,
  },
  mainText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  secondaryText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
})

export default AddressSearchScreen
