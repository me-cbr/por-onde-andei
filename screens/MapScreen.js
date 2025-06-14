import { View, StyleSheet, Text, TouchableOpacity, Image, Alert } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { Ionicons } from "@expo/vector-icons"

export default function MapScreen({ route, navigation }) {
  const { places } = route.params || { places: [] }

  if (!places || places.length === 0) {
    return (
      <View style={styles.fullContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mapa</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={60} color="#4CAF50" />
          <Text style={styles.emptyText}>Nenhum local para exibir no mapa</Text>
          <Text style={styles.emptySubtext}>Verifique se o local possui coordenadas de localização</Text>
        </View>
      </View>
    )
  }

  const placesWithLocation = places.filter(
    (place) => place.location && place.location.latitude && place.location.longitude,
  )

  if (placesWithLocation.length === 0) {
    return (
      <View style={styles.fullContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mapa</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={60} color="#FF9800" />
          <Text style={styles.emptyText}>Locais sem coordenadas</Text>
          <Text style={styles.emptySubtext}>Os locais selecionados não possuem informações de localização GPS</Text>
        </View>
      </View>
    )
  }

  const calculateInitialRegion = () => {
    if (placesWithLocation.length === 1) {
      return {
        latitude: placesWithLocation[0].location.latitude,
        longitude: placesWithLocation[0].location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    }

    let minLat = placesWithLocation[0].location.latitude
    let maxLat = placesWithLocation[0].location.latitude
    let minLng = placesWithLocation[0].location.longitude
    let maxLng = placesWithLocation[0].location.longitude

    placesWithLocation.forEach((place) => {
      minLat = Math.min(minLat, place.location.latitude)
      maxLat = Math.max(maxLat, place.location.latitude)
      minLng = Math.min(minLng, place.location.longitude)
      maxLng = Math.max(maxLng, place.location.longitude)
    })

    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2
    const deltaLat = (maxLat - minLat) * 1.5
    const deltaLng = (maxLng - minLng) * 1.5

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    }
  }

  const initialRegion = calculateInitialRegion()

  const handleMarkerPress = (place) => {
    Alert.alert(place.title, place.address || "Localização sem endereço", [
      { text: "Fechar", style: "cancel" },
      { text: "Ver Detalhes", onPress: () => navigation.navigate("PhotoView", { place }) },
    ])
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Mapa {placesWithLocation.length > 1 ? `(${placesWithLocation.length} locais)` : ""}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {placesWithLocation.length > 0 && placesWithLocation[0].photo && (
        <View style={styles.photoPreview}>
          <Text style={styles.photoTitle}>📍 {placesWithLocation[0].title}</Text>
          <Image source={{ uri: placesWithLocation[0].photo }} style={styles.previewImage} />
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          {placesWithLocation.map((place, index) => (
            <Marker
              key={place.id || index}
              coordinate={{
                latitude: place.location.latitude,
                longitude: place.location.longitude,
              }}
              title={place.title}
              description={place.address || "Sem endereço"}
              onPress={() => handleMarkerPress(place)}
            >
              <View style={styles.customMarker}>
                <Ionicons name="location" size={30} color="#4CAF50" />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.infoText}>
          {placesWithLocation.length === 1
            ? "Toque no marcador para mais opções"
            : `Mostrando ${placesWithLocation.length} locais no mapa`}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingTop: 40,
  },
  header: {
    height: 60,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 34,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f5f5f5",
  },
  emptyText: {
    marginTop: 16,
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  photoPreview: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  photoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  infoPanel: {
    backgroundColor: "white",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  infoText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
})
