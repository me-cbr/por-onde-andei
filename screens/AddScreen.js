"use client"

import { useState } from "react"
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import databaseService from "../services/DatabaseService"
import locationService from "../services/LocationService"

export default function AddScreen({ navigation }) {
  const [photo, setPhoto] = useState(null)
  const [title, setTitle] = useState("")
  const [address, setAddress] = useState("")
  const [location, setLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [photoDate, setPhotoDate] = useState(null)

  const showImagePicker = () => {
    Alert.alert("Selecionar Foto", "Escolha uma opção:", [
      { text: "Cancelar", style: "cancel" },
      { text: "Câmera", onPress: handleTakePhoto },
      { text: "Galeria", onPress: handlePickFromGallery },
    ])
  }

  const handleTakePhoto = async () => {
    try {
      console.log("Starting camera process...")

      const cameraAvailable = await ImagePicker.getCameraPermissionsAsync()
      console.log("Camera permissions status:", cameraAvailable)

      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      console.log("Camera permission request result:", status)

      if (status !== "granted") {
        Alert.alert(
          "Permissão Necessária",
          "Para tirar fotos, você precisa permitir o acesso à câmera nas configurações do seu dispositivo.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "OK", onPress: () => console.log("User acknowledged") },
          ],
        )
        return
      }

      setIsLoading(true)

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      })

      console.log("Camera result:", result)

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri
        console.log("Image URI:", imageUri)

        setPhoto(imageUri)
        setPhotoDate(new Date().toISOString())

        await getCurrentLocation()

        Alert.alert("Sucesso", "Foto capturada com sucesso!")
      } else {
        console.log("Camera operation was canceled")
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Erro na Câmera", `Não foi possível tirar a foto. Erro: ${error.message || "Erro desconhecido"}`, [
        { text: "OK" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePickFromGallery = async () => {
    try {
      console.log("Starting gallery process...")

      const galleryPermission = await ImagePicker.getMediaLibraryPermissionsAsync()
      console.log("Gallery permissions status:", galleryPermission)

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      console.log("Gallery permission request result:", status)

      if (status !== "granted") {
        Alert.alert(
          "Permissão Necessária",
          "Para selecionar fotos, você precisa permitir o acesso à galeria nas configurações do seu dispositivo.",
        )
        return
      }

      setIsLoading(true)

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      })

      console.log("Gallery result:", result)

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri
        console.log("Image URI:", imageUri)

        setPhoto(imageUri)
        setPhotoDate(new Date().toISOString())

        await getCurrentLocation()

        Alert.alert("Sucesso", "Foto selecionada com sucesso!")
      } else {
        console.log("Gallery selection was canceled")
      }
    } catch (error) {
      console.error("Error picking from gallery:", error)
      Alert.alert(
        "Erro na Galeria",
        `Não foi possível selecionar a foto. Erro: ${error.message || "Erro desconhecido"}`,
        [{ text: "OK" }],
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = async () => {
    try {
      console.log("Getting current location...")
      const currentLocation = await locationService.getCurrentLocation()
      console.log("Location obtained:", currentLocation)

      setLocation(currentLocation)

      const addressText = await locationService.getAddressFromCoordinates(
        currentLocation.latitude,
        currentLocation.longitude,
      )
      console.log("Address obtained:", addressText)
      setAddress(addressText)
    } catch (error) {
      console.error("Erro na localização:", error)
      Alert.alert(
        "Localização",
        "Não foi possível obter a localização atual. Você pode inserir o endereço manualmente ou usar a busca.",
        [{ text: "OK" }, { text: "Buscar Endereço", onPress: handleSearchAddress }],
      )
    }
  }

  const handleSearchAddress = () => {
    navigation.navigate("AddressSearch", {
      onAddressSelect: (addressData) => {
        setAddress(addressData.address)
        setLocation(addressData.location)
      },
    })
  }

  const handleSavePlace = async () => {
    if (!photo) {
      Alert.alert("Atenção", "Selecione uma foto primeiro")
      return
    }

    if (!title.trim()) {
      Alert.alert("Campo obrigatório", "Por favor, preencha o título")
      return
    }

    setIsLoading(true)
    try {
      const currentUser = await databaseService.getCurrentUser()
      if (!currentUser) {
        Alert.alert("Erro", "Usuário não encontrado")
        return
      }

      await databaseService.createPlace(
        title.trim(),
        photo,
        address || "Endereço não disponível",
        location?.latitude || null,
        location?.longitude || null,
        photoDate || new Date().toISOString(),
        currentUser.id,
      )

      Alert.alert("Sucesso", "Local salvo com sucesso!", [{ text: "OK", onPress: () => navigation.navigate("Home") }])
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar")
      console.error("Error saving place:", error)
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
        <Text style={styles.headerTitle}>Adicionar Local</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.photoContainer} onPress={showImagePicker} disabled={isLoading}>
          {photo ? (
            <View style={styles.photoWrapper}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity style={styles.changePhotoButton} onPress={showImagePicker}>
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              {isLoading ? (
                <>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Processando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={60} color="#4CAF50" />
                  <Text style={styles.placeholderText}>Adicionar Foto</Text>
                  <Text style={styles.placeholderSubtext}>Toque para escolher da câmera ou galeria</Text>
                </>
              )}
            </View>
          )}
        </TouchableOpacity>

        {photoDate && (
          <View style={styles.photoInfo}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.photoDateText}>Foto tirada em: {new Date(photoDate).toLocaleString("pt-BR")}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Título do local (obrigatório)"
          value={title}
          onChangeText={setTitle}
          maxLength={50}
        />

        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>Endereço</Text>
            <TouchableOpacity onPress={handleSearchAddress} style={styles.searchAddressButton}>
              <Ionicons name="search" size={16} color="#4CAF50" />
              <Text style={styles.searchAddressText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={20} color="#4CAF50" />
            <TextInput
              style={styles.addressInput}
              placeholder="Endereço será preenchido automaticamente"
              placeholderTextColor="black"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, (!photo || !title.trim()) && styles.disabledButton]}
          onPress={handleSavePlace}
          disabled={!photo || !title.trim() || isLoading}
        >
          {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Salvar Local</Text>}
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
  photoContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    elevation: 3,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  photoWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
  },
  photoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    marginTop: 12,
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholderSubtext: {
    marginTop: 4,
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "500",
  },
  photoInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  photoDateText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  input: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  addressSection: {
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  searchAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  searchAddressText: {
    color: "#4CAF50",
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addressInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    minHeight: 40,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
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
