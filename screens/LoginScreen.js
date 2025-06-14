import { useState, useEffect } from "react"
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
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as LocalAuthentication from "expo-local-authentication"
import databaseService from "../services/DatabaseService"

function LoginScreen({ setIsAuthenticated, navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkBiometricSupport = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      setIsBiometricAvailable(compatible && enrolled)
    }

    checkBiometricSupport()
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos")
      return
    }

    setIsLoading(true)
    try {
      const user = await databaseService.getUserByEmail(email)

      if (user && user.password === password) {
        await databaseService.createSession(user.id)

        if (isBiometricAvailable && !user.biometric_enabled) {
          Alert.alert("Autenticação Biométrica", "Deseja habilitar a autenticação biométrica para próximos logins?", [
            { text: "Não", style: "cancel" },
            {
              text: "Sim",
              onPress: async () => {
                await databaseService.enableBiometric(user.id)
                Alert.alert("Sucesso", "Biometria habilitada!")
              },
            },
          ])
        }

        setIsAuthenticated(true)
      } else {
        Alert.alert("Erro", "Credenciais inválidas")
      }
    } catch (error) {
      Alert.alert("Erro", "Falha no login")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autentique-se para continuar",
        fallbackLabel: "Usar senha",
      })

      if (result.success) {
        const isLoggedIn = await databaseService.isUserLoggedIn()
        if (isLoggedIn) {
          setIsAuthenticated(true)
        } else {
          Alert.alert("Erro", "Nenhuma sessão anterior encontrada. Faça login primeiro.")
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na autenticação biométrica")
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.appTitle}>Por Onde Andei</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="gray"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>

          {isBiometricAvailable && (
            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
              <Ionicons name="finger-print" size={24} color="#4CAF50" />
              <Text style={styles.biometricText}>Entrar com Biometria</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.createAccountButton} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.createAccountText}>
              Não tem uma conta? <Text style={{ fontWeight: "bold" }}>Criar agora</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 15,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    elevation: 2,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    height: 50,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  biometricText: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  createAccountButton: {
    marginTop: 15,
    alignItems: "center",
  },
  createAccountText: {
    color: "#4CAF50",
    fontSize: 14,
  },
})

export default LoginScreen
