"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import databaseService from "../services/DatabaseService"
import locationService from "../services/LocationService"

export default function EditPlaceScreen({ route, navigation }) {
  const { place } = route.params
  const [title, setTitle] = useState(place.title)
  const [address, setAddress] = useState(place.address || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Erro", "O título é obrigatório")
      return
    }

    setIsLoading(true)
    try {
      const currentUser = await databaseService.getCurrentUser()
      if (currentUser) {
        await databaseService.updatePlace(place.id, title.trim(), address.trim(), currentUser.id)
        Alert.alert("Sucesso", "Local atualizado com sucesso!", [{ text: "OK", onPress: () => navigation.goBack() }])
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o local")
      console.error("Error updating place:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetCurrentLocation = async () => {
    setIsLoading(true)
    try {
      const location = await locationService.getCurrentLocation()
      const newAddress = await locationService.getAddressFromCoordinates(location.latitude, location.longitude)
      setAddress(newAddress)
    } catch (error) {
      Alert.alert("Erro", "Não foi possível obter a localização atual")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Local</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Digite o título do local"
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Endereço</Text>
            <TouchableOpacity onPress={handleGetCurrentLocation} style={styles.locationButton}>
              <Ionicons name="location" size={16} color="#4CAF50" />
              <Text style={styles.locationButtonText}>Usar localização atual</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, styles.addressInput]}
            value={address}
            onChangeText={setAddress}
            placeholder="Digite o endereço"
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  locationButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})
