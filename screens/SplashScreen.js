import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      const destination = userLoggedIn === 'true' ? 'Home' : 'Login';

      setTimeout(() => {
        navigation.replace(destination);
      }, 2000);
    };

    checkAuth();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});
