import { useState, useEffect } from "react"
import { View, ActivityIndicator, StyleSheet, Text, Alert } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import * as LocalAuthentication from "expo-local-authentication"

import LoginScreen from "./screens/LoginScreen"
import RegisterScreen from "./screens/RegisterScreen"
import HomeScreen from "./screens/HomeScreen"
import FavoritesScreen from "./screens/FavoritesScreen"
import AddScreen from "./screens/AddScreen"
import MapScreen from "./screens/MapScreen"
import ProfileScreen from "./screens/ProfileScreen"
import TestScreen from "./screens/TestScreen"
import EditPlaceScreen from "./screens/EditPlaceScreen"
import PhotoViewScreen from "./screens/PhotoViewScreen"
import AddressSearchScreen from "./screens/AddressSearchScreen"
import databaseService from "./services/DatabaseService"
import permissionService from "./services/PermissionService"

const Stack = createStackNavigator()

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await databaseService.init()

        const permissions = await permissionService.requestAllPermissions()
        await permissionService.showPermissionAlert(permissions)

        const isLoggedIn = await databaseService.isUserLoggedIn()

        if (isLoggedIn) {
          const currentUser = await databaseService.getCurrentUser()
          if (currentUser) {
            const biometricEnabled = await databaseService.isBiometricEnabled(currentUser.id)

            if (biometricEnabled) {
              const biometricAvailable = await LocalAuthentication.hasHardwareAsync()
              const biometricEnrolled = await LocalAuthentication.isEnrolledAsync()

              if (biometricAvailable && biometricEnrolled) {
                try {
                  const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: "Confirme sua identidade para continuar",
                    fallbackLabel: "Usar senha",
                    cancelLabel: "Cancelar",
                  })

                  if (result.success) {
                    setIsAuthenticated(true)
                  } else {
                    await databaseService.logout()
                    setIsAuthenticated(false)
                    Alert.alert("Autenticação", "Autenticação biométrica necessária para continuar")
                  }
                } catch (error) {
                  await databaseService.logout()
                  setIsAuthenticated(false)
                  Alert.alert("Erro", "Erro na autenticação biométrica")
                }
              } else {
                setIsAuthenticated(true)
              }
            } else {
              setIsAuthenticated(true)
            }
          } else {
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const handleDataCleared = () => {
    setIsAuthenticated(false)
    Alert.alert("Dados Limpos", "Todos os dados foram removidos. Você foi deslogado do sistema.")
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando...</Text>
        <Text style={styles.loadingSubtext}>Por Onde Andei</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
            <Stack.Screen name="Favorites">
              {(props) => <FavoritesScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
            <Stack.Screen name="Add" component={AddScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Profile">
              {(props) => <ProfileScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
            <Stack.Screen name="Test">
              {(props) => <TestScreen {...props} onDataCleared={handleDataCleared} />}
            </Stack.Screen>
            <Stack.Screen name="EditPlace" component={EditPlaceScreen} />
            <Stack.Screen name="PhotoView" component={PhotoViewScreen} />
            <Stack.Screen name="AddressSearch" component={AddressSearchScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "500",
  },
})

export default App
