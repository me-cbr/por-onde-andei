import { useState } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")

export default function PhotoViewScreen({ route, navigation }) {
  const { place } = route.params
  const [showFullImage, setShowFullImage] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleOpenMap = () => {
    if (place.location) {
      navigation.navigate("Map", { places: [place] })
    } else {
      Alert.alert("Localização", "Este local não possui coordenadas de localização salvas.")
    }
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {place.title}
        </Text>
        <TouchableOpacity onPress={handleOpenMap} style={styles.mapButton}>
          <Ionicons name="map" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setShowFullImage(true)} style={styles.imageContainer} activeOpacity={0.8}>
            <Image source={{ uri: place.photo }} style={styles.image} />
            <View style={styles.expandIcon}>
              <Ionicons name="expand" size={24} color="white" />
            </View>
            <View style={styles.zoomHint}>
              <Text style={styles.zoomHintText}>Toque para ampliar</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{place.title}</Text>
              {place.isFavorite && <Ionicons name="heart" size={24} color="#ff4444" />}
            </View>

            <View style={styles.dateContainer}>
              <View style={styles.dateItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.dateLabel}>Adicionado em:</Text>
                <Text style={styles.dateText}>{formatDate(place.date)}</Text>
              </View>

              {place.photoDate && (
                <View style={styles.dateItem}>
                  <Ionicons name="camera-outline" size={16} color="#666" />
                  <Text style={styles.dateLabel}>Foto tirada em:</Text>
                  <Text style={styles.dateText}>{formatDate(place.photoDate)}</Text>
                </View>
              )}
            </View>

            {place.address && (
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={20} color="#4CAF50" />
                <View style={styles.addressTextContainer}>
                  <Text style={styles.addressLabel}>Localização:</Text>
                  <Text style={styles.addressText}>{place.address}</Text>
                </View>
              </View>
            )}

            {place.location && (
              <View style={styles.coordinatesContainer}>
                <Ionicons name="navigate-outline" size={16} color="#888" />
                <Text style={styles.coordinatesText}>
                  {place.location.latitude.toFixed(6)}, {place.location.longitude.toFixed(6)}
                </Text>
                <TouchableOpacity onPress={handleOpenMap} style={styles.viewMapButton}>
                  <Ionicons name="map-outline" size={16} color="#4CAF50" />
                  <Text style={styles.viewMapText}>Ver no Mapa</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <Modal
          visible={showFullImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFullImage(false)}
          statusBarTranslucent={true}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowFullImage(false)}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              bouncesZoom={true}
            >
              <TouchableOpacity activeOpacity={1} style={styles.imageWrapper}>
                <Image source={{ uri: place.photo }} style={styles.fullImage} resizeMode="contain" />
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.zoomInstructions}>
              <Text style={styles.zoomInstructionsText}>Pinça para dar zoom • Toque para fechar</Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
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
    marginHorizontal: 10,
  },
  mapButton: {
    padding: 5,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    backgroundColor: "white",
  },
  image: {
    width: width,
    height: width * 0.75,
  },
  expandIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  zoomHint: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  zoomHintText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  infoContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateLabel: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  dateText: {
    marginLeft: 8,
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  addressTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  addressLabel: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
  addressText: {
    color: "#333",
    fontSize: 16,
    lineHeight: 22,
  },
  coordinatesContainer: {
    marginTop: 8,
  },
  coordinatesText: {
    marginLeft: 8,
    color: "#888",
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 8,
  },
  viewMapButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#f0f8f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  viewMapText: {
    marginLeft: 6,
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
    padding: 10,
    zIndex: 1000,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: width,
    height: height,
  },
  zoomInstructions: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  zoomInstructionsText: {
    color: "white",
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
})
