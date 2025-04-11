import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AddScreen from './screens/AddScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const isLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      setIsAuthenticated(isLoggedIn === 'true');
      setIsLoading(false);
    };
    checkLogin();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Home">
              {props => <HomeScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
            <Stack.Screen name="Add" component={AddScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Profile">
              {props => <ProfileScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
