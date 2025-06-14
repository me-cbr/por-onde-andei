import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import * as LocalAuthentication from "expo-local-authentication"
import { Alert } from "react-native"

class PermissionService {
  async requestAllPermissions() {
    const results = {
      camera: false,
      mediaLibrary: false,
      location: false,
      biometric: false,
    }

    try {
      const cameraResult = await ImagePicker.requestCameraPermissionsAsync()
      results.camera = cameraResult.status === "granted"

      const mediaResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      results.mediaLibrary = mediaResult.status === "granted"

      const locationResult = await Location.requestForegroundPermissionsAsync()
      results.location = locationResult.status === "granted"

      const biometricAvailable = await LocalAuthentication.hasHardwareAsync()
      const biometricEnrolled = await LocalAuthentication.isEnrolledAsync()
      results.biometric = biometricAvailable && biometricEnrolled

      return results
    } catch (error) {
      console.error("Error requesting permissions:", error)
      return results
    }
  }

  async showPermissionAlert(permissions) {
    const deniedPermissions = []

    if (!permissions.camera) deniedPermissions.push("Câmera")
    if (!permissions.mediaLibrary) deniedPermissions.push("Galeria")
    if (!permissions.location) deniedPermissions.push("Localização")

    if (deniedPermissions.length > 0) {
      Alert.alert(
        "Permissões Necessárias",
        `Para o melhor funcionamento do app, permita o acesso a: ${deniedPermissions.join(", ")}`,
        [{ text: "OK" }],
      )
    }
  }
}

const permissionService = new PermissionService()
export default permissionService
