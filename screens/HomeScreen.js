"use client"

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
import NavBar from "../components/NavBar"
import databaseService from "../services/DatabaseService"

export default function HomeScreen({ navigation, setIsAuthenticated }) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)

  const loadPlaces = async () => {
    console.log("=== LOADING PLACES ===")
    try {
      setLoading(true)

      const currentUser = await databaseService.getCurrentUser()
      console.log("Current user in HomeScreen:", currentUser)

      if (currentUser) {
        console.log("Loading places for user ID:", currentUser.id)
        const userPlaces = await databaseService.getPlacesByUser(currentUser.id)
        console.log("Places loaded in HomeScreen:", userPlaces.length, "places")

        if (userPlaces.length > 0) {
          console.log("First place:", userPlaces[0])
        }

        setPlaces(userPlaces)
      } else {
        console.log("No current user found")
        setPlaces([])
      }
    } catch (error) {
      console.error("Error loading places in HomeScreen:", error)
      Alert.alert("Erro", "Não foi possível carregar os lugares")
    } finally {
      setLoading(false)
      console.log("=== LOADING PLACES COMPLETE ===")
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("HomeScreen focused, loading places...")
      loadPlaces()
    })
    return unsubscribe
  }, [navigation])

  useEffect(() => {
    loadPlaces()
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
              const updatedPlaces = places.filter((place) => place.id !== id)
              setPlaces(updatedPlaces)
            }
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o local")
            console.error("Error deleting place:", error)
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

        const updatedPlaces = places.map((p) => (p.id === place.id ? { ...p, isFavorite: newFavoriteStatus } : p))
        setPlaces(updatedPlaces)
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar favorito")
      console.error("Error toggling favorite:", error)
    }
  }

  const handleEditPress = (place) => {
    navigation.navigate("EditPlace", { place })
  }

  const handlePlacePress = (place) => {
    navigation.navigate("PhotoView", { place })
  }

  const handleLogout = async () => {
    try {
      await databaseService.logout()
      setIsAuthenticated(false)
    } catch (error) {
      Alert.alert("Erro", "Não foi possível fazer logout")
      console.error("Logout error:", error)
    }
  }

  const handleDebugDatabase = async () => {
    try {
      const debug = await databaseService.debugDatabaseContents()
      Alert.alert(
        "Debug Database",
        `Users: ${debug.users.length}\nPlaces: ${debug.places.length}\nSessions: ${debug.sessions.length}`,
        [{ text: "Reload Places", onPress: loadPlaces }, { text: "OK" }],
      )
    } catch (error) {
      Alert.alert("Erro", "Erro no debug")
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando lugares...</Text>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.fullContainer}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      <NavBar title="Meus Lugares" onLogout={handleLogout} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <FlatList
            data={places}
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
                <Ionicons name="camera-outline" size={60} color="#4CAF50" />
                <Text style={styles.emptyText}>Nenhum local cadastrado ainda</Text>
                <Text style={styles.emptySubtext}>Toque no botão + para adicionar seu primeiro local</Text>
              </View>
            }
          />

          {/* Botões Flutuantes */}
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("Add")}>
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>

          {/* Botão de Teste (sempre visível) */}
          <TouchableOpacity style={styles.testFloatingButton} onPress={() => navigation.navigate("Test")}>
            <Ionicons name="flask" size={24} color="white" />
          </TouchableOpacity>

          {/* Botão de Refresh */}
          <TouchableOpacity style={styles.refreshButton} onPress={loadPlaces}>
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
    color: "#4CAF50",
    fontSize: 16,
  },
  listContent: {
    padding: 16,
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
    backgroundColor: "#4CAF50",
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
  testFloatingButton: {
    position: "absolute",
    right: 24,
    bottom: 90,
    backgroundColor: "#2196F3",
    width: 48,
    height: 48,
    borderRadius: 24,
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
    bottom: 150,
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
    marginTop: 16,
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    color: "#2E7D32",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  debugButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF9800",
    marginBottom: 10,
  },
  debugButtonText: {
    color: "#FF9800",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 12,
  },
  testButton: {
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
  testButtonText: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginLeft: 8,
  },
})
