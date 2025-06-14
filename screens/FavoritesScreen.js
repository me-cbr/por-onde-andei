import { useState, useEffect } from "react"
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Text,
  TouchableOpacity,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

import PlaceCard from "../components/PlaceCard"
import databaseService from "../services/DatabaseService"

export default function FavoritesScreen({ navigation, setIsAuthenticated }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const loadFavorites = async () => {
    try {
      setLoading(true)

      const currentUser = await databaseService.getCurrentUser()

      if (currentUser) {
        const userFavorites = await databaseService.getFavoritesByUser(currentUser.id)
        setFavorites(userFavorites)
      } else {
        setFavorites([])
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os favoritos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadFavorites()
    })
    return unsubscribe
  }, [navigation])

  useEffect(() => {
    loadFavorites()
  }, [])

  const handleDeletePlace = async (id) => {
    Alert.alert("Confirmar Exclusão", "Deseja realmente excluir este local?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            const currentUser = await databaseService.getCurrentUser()
            if (currentUser) {
              await databaseService.deletePlace(id, currentUser.id)
              const updatedFavorites = favorites.filter((place) => place.id !== id)
              setFavorites(updatedFavorites)
            }
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o local")
          }
        },
      },
    ])
  }

  const handleFavoritePress = async (place) => {
    try {
      const currentUser = await databaseService.getCurrentUser()
      if (currentUser) {
        const newFavoriteStatus = await databaseService.toggleFavorite(place.id, currentUser.id)

        if (newFavoriteStatus) {
          const updatedFavorites = favorites.map((p) => (p.id === place.id ? { ...p, isFavorite: true } : p))
          setFavorites(updatedFavorites)
        } else {
          const updatedFavorites = favorites.filter((p) => p.id !== place.id)
          setFavorites(updatedFavorites)
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar favorito")
    }
  }

  const handleEditPress = (place) => {
    navigation.navigate("EditPlace", { place })
  }

  const handlePlacePress = (place) => {
    navigation.navigate("PhotoView", { place })
  }

  const handleViewAllOnMap = () => {
    if (favorites.length > 0) {
      navigation.navigate("Map", { places: favorites })
    } else {
      Alert.alert("Aviso", "Nenhum favorito para exibir no mapa")
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4444" />
        <Text style={styles.loadingText}>Carregando favoritos...</Text>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.fullContainer}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Favoritos</Text>
        <View style={styles.placeholder} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {favorites.length > 0 && (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.mapAllButton} onPress={handleViewAllOnMap}>
                <Ionicons name="map" size={20} color="#ff4444" />
                <Text style={styles.mapAllButtonText}>Ver Todos no Mapa ({favorites.length})</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={favorites}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <PlaceCard
                  place={item}
                  onPress={() => handlePlacePress(item)}
                  onFavoritePress={handleFavoritePress}
                  onEditPress={handleEditPress}
                />
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePlace(item.id)}>
                  <Ionicons name="trash-outline" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={80} color="#ff4444" />
                <Text style={styles.emptyText}>Nenhum favorito ainda</Text>
                <Text style={styles.emptySubtext}>Marque seus locais favoritos tocando no ❤️ para vê-los aqui</Text>

                <TouchableOpacity style={styles.goToHomeButton} onPress={() => navigation.navigate("Home")}>
                  <Ionicons name="home" size={20} color="#4CAF50" />
                  <Text style={styles.goToHomeButtonText}>Ver Todos os Locais</Text>
                </TouchableOpacity>
              </View>
            }
          />

          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("Add")}>
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.refreshButton} onPress={loadFavorites}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>
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
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 34,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    color: "#ff4444",
    fontSize: 16,
  },
  headerActions: {
    padding: 16,
    paddingBottom: 8,
  },
  mapAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#ff4444",
    alignSelf: "center",
    elevation: 3,
  },
  mapAllButtonText: {
    color: "#ff4444",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deleteButton: {
    padding: 16,
    marginLeft: 8,
  },
  addButton: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: "#ff4444",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  refreshButton: {
    position: "absolute",
    right: 24,
    bottom: 90,
    backgroundColor: "#FF9800",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 20,
    color: "#ff4444",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  goToHomeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#4CAF50",
    marginTop: 10,
  },
  goToHomeButtonText: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginLeft: 8,
  },
})
