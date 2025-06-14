import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

function PlaceCard({ place, onPress, onFavoritePress, onEditPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: place.photo }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {place.title}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEditPress(place)} style={styles.actionButton}>
              <Ionicons name="pencil" size={18} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onFavoritePress(place)} style={styles.actionButton}>
              <Ionicons
                name={place.isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={place.isFavorite ? "#ff4444" : "#4CAF50"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.date}>{new Date(place.date).toLocaleDateString("pt-BR")}</Text>

        {place.photoDate && (
          <Text style={styles.photoDate}>Foto: {new Date(place.photoDate).toLocaleDateString("pt-BR")}</Text>
        )}

        {place.address && (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={14} color="#4CAF50" />
            <Text style={styles.address} numberOfLines={2}>
              {place.address}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 120,
    height: 120,
  },
  info: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#4CAF50",
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  date: {
    color: "#4CAF50",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  photoDate: {
    color: "#2E7D32",
    fontSize: 12,
    marginTop: 2,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  address: {
    color: "#4CAF50",
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
    fontWeight: "400",
  },
})

export default PlaceCard
