import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoggedInBefore, setHasLoggedInBefore] = useState(false);

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricAvailable(compatible);
    };

    const checkPreviousLogin = async () => {
      const value = await AsyncStorage.getItem('userLoggedIn');
      if (value === 'true') {
        setHasLoggedInBefore(true);
      }
    };

    checkBiometricSupport();
    checkPreviousLogin();
  }, []);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userPassword', password);
      await AsyncStorage.setItem('userLoggedIn', 'true');
      setHasLoggedInBefore(true);
      Alert.alert('Cadastro salvo', 'Use sua biometria da próxima vez.');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar os dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const storedEmail = await AsyncStorage.getItem('userEmail');
    const storedPassword = await AsyncStorage.getItem('userPassword');

    if (email === storedEmail && password === storedPassword) {
      setIsAuthenticated(true);
    } else {
      Alert.alert('Erro', 'Credenciais inválidas');
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para continuar',
        fallbackLabel: 'Usar senha',
      });

      if (result.success) {
        setIsAuthenticated(true);
      } else {
        Alert.alert('Autenticação falhou', 'Tente novamente');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na autenticação biométrica');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.appTitle}>Por Onde Andei</Text>
        </View>

        <View style={styles.formContainer}>
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={hasLoggedInBefore ? handleLogin : handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {hasLoggedInBefore ? 'Entrar' : 'Salvar e Ativar Biometria'}
                </Text>
              )}
            </TouchableOpacity>
          </>

          {isBiometricAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
            >
              <Ionicons name="finger-print" size={24} color="#4CAF50" />
              <Text style={styles.biometricText}>Entrar com Biometria</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 15,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    height: 50,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  biometricText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});
