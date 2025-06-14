"use client"

import { useState, useEffect } from "react"
import { View, ActivityIndicator, StyleSheet, Text } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

import LoginScreen from "./screens/LoginScreen"
import RegisterScreen from "./screens/RegisterScreen"
import HomeScreen from "./screens/HomeScreen"
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
        console.log("Initializing app...")
        await databaseService.init()
        console.log("Database initialized")

        const permissions = await permissionService.requestAllPermissions()
        await permissionService.showPermissionAlert(permissions)
        console.log("Permissions requested")

        const isLoggedIn = await databaseService.isUserLoggedIn()
        console.log("User logged in:", isLoggedIn)
        setIsAuthenticated(isLoggedIn)
      } catch (error) {
        console.error("Error initializing app:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

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
            <Stack.Screen name="Add" component={AddScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Profile">
              {(props) => <ProfileScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
            <Stack.Screen name="Test" component={TestScreen} />
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
