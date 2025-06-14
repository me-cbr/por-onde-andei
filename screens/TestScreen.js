import { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import databaseService from "../services/DatabaseService"

const TestScreen = ({ onDataCleared }) => {
  const navigation = useNavigation()
  const [testResults, setTestResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testPassword, setTestPassword] = useState("123456")
  const [testName, setTestName] = useState("Usuário Teste")
  const resultIdCounter = useRef(0)

  const addResult = (test, status, message, details = null) => {
    resultIdCounter.current += 1
    const result = {
      id: `result_${resultIdCounter.current}_${Date.now()}`,
      test,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString(),
    }
    setTestResults((prev) => [...prev, result])
  }

  const clearResults = () => {
    setTestResults([])
    resultIdCounter.current = 0
  }

  const testDatabaseInit = async () => {
    try {
      addResult("Inicialização", "info", "Testando inicialização do database...")
      await databaseService.init()
      addResult("Inicialização", "success", "Database inicializado com sucesso")
      return true
    } catch (error) {
      addResult("Inicialização", "error", "Erro na inicialização", error.message)
      return false
    }
  }

  const testTables = async () => {
    try {
      addResult("Tabelas", "info", "Verificando se as tabelas existem...")

      const currentUser = await databaseService.getCurrentUser()
      addResult("Tabelas", "success", "Tabela 'users' acessível")

      const isLoggedIn = await databaseService.isUserLoggedIn()
      addResult("Tabelas", "success", "Tabela 'user_session' acessível")

      if (currentUser) {
        const places = await databaseService.getPlacesByUser(currentUser.id)
        addResult("Tabelas", "success", `Tabela 'places' acessível (${places.length} registros)`)
      } else {
        addResult("Tabelas", "info", "Tabela 'places' não testada (sem usuário logado)")
      }

      return true
    } catch (error) {
      addResult("Tabelas", "error", "Erro ao verificar tabelas", error.message)
      return false
    }
  }

  const testUserCRUD = async () => {
    try {
      addResult("CRUD Usuários", "info", "Testando operações de usuário...")

      const existingUser = await databaseService.getUserByEmail(testEmail)
      if (existingUser) {
        addResult("CRUD Usuários", "info", "Usuário de teste já existe, usando existente")
      } else {
        const userId = await databaseService.createUser(testEmail, testName, testPassword)
        addResult("CRUD Usuários", "success", `Usuário criado com ID: ${userId}`)
      }

      const user = await databaseService.getUserByEmail(testEmail)
      if (user && user.email === testEmail) {
        addResult("CRUD Usuários", "success", "Usuário encontrado com sucesso")
        addResult("CRUD Usuários", "info", `Nome: ${user.name}, ID: ${user.id}`)

        const newName = `${testName} - Atualizado ${Date.now()}`
        await databaseService.updateUserProfile(user.id, newName)
        addResult("CRUD Usuários", "success", "Perfil atualizado com sucesso")

        const updatedUser = await databaseService.getUserByEmail(testEmail)
        if (updatedUser.name === newName) {
          addResult("CRUD Usuários", "success", "Atualização verificada com sucesso")
        } else {
          addResult("CRUD Usuários", "error", "Atualização não foi salva corretamente")
        }
      } else {
        addResult("CRUD Usuários", "error", "Usuário não encontrado")
        return false
      }

      return true
    } catch (error) {
      addResult("CRUD Usuários", "error", "Erro nas operações de usuário", error.message)
      return false
    }
  }

  const testPlaceCRUD = async () => {
    try {
      addResult("CRUD Lugares", "info", "Testando operações de lugares...")

      let testUser = await databaseService.getCurrentUser()
      if (!testUser) {
        testUser = await databaseService.getUserByEmail(testEmail)
        if (!testUser) {
          addResult("CRUD Lugares", "error", "Nenhum usuário disponível para teste")
          return false
        }
      }

      const testPlace = {
        title: `Lugar Teste ${Date.now()}`,
        photo: "https://via.placeholder.com/300x200",
        address: "Rua Teste, 123 - São Paulo, SP",
        latitude: -23.5505,
        longitude: -46.6333,
        photoDate: new Date().toISOString(),
      }

      const placeId = await databaseService.createPlace(
        testPlace.title,
        testPlace.photo,
        testPlace.address,
        testPlace.latitude,
        testPlace.longitude,
        testPlace.photoDate,
        testUser.id,
      )
      addResult("CRUD Lugares", "success", `Lugar criado com ID: ${placeId}`)

      const places = await databaseService.getPlacesByUser(testUser.id)
      const foundPlace = places.find((p) => p.id === placeId)

      if (foundPlace) {
        addResult("CRUD Lugares", "success", "Lugar encontrado com sucesso")
        addResult("CRUD Lugares", "info", `Título: ${foundPlace.title}`)
        addResult("CRUD Lugares", "info", `Endereço: ${foundPlace.address}`)

        const isFavorite = await databaseService.toggleFavorite(placeId, testUser.id)
        addResult("CRUD Lugares", "success", `Lugar ${isFavorite ? "favoritado" : "desfavoritado"}`)

        await databaseService.updatePlace(placeId, "Lugar Atualizado", "Endereço Atualizado", testUser.id)
        addResult("CRUD Lugares", "success", "Lugar atualizado com sucesso")

        await databaseService.deletePlace(placeId, testUser.id)
        addResult("CRUD Lugares", "success", "Lugar excluído com sucesso")
      } else {
        addResult("CRUD Lugares", "error", "Lugar não encontrado")
        return false
      }

      return true
    } catch (error) {
      addResult("CRUD Lugares", "error", "Erro nas operações de lugar", error.message)
      return false
    }
  }

  const testSessionManagement = async () => {
    try {
      addResult("Sessões", "info", "Testando gerenciamento de sessões...")

      const isLoggedIn = await databaseService.isUserLoggedIn()
      addResult("Sessões", "info", `Status atual: ${isLoggedIn ? "Logado" : "Não logado"}`)

      const testUser = await databaseService.getUserByEmail(testEmail)
      if (testUser) {
        await databaseService.createSession(testUser.id)
        addResult("Sessões", "success", "Sessão criada com sucesso")

        const currentUser = await databaseService.getCurrentUser()
        if (currentUser && currentUser.id === testUser.id) {
          addResult("Sessões", "success", "Usuário atual obtido com sucesso")
        } else {
          addResult("Sessões", "error", "Erro ao obter usuário atual")
        }

        await databaseService.enableBiometric(testUser.id)
        const biometricEnabled = await databaseService.isBiometricEnabled(testUser.id)
        addResult("Sessões", "success", `Biometria: ${biometricEnabled ? "Habilitada" : "Desabilitada"}`)
      }

      return true
    } catch (error) {
      addResult("Sessões", "error", "Erro no gerenciamento de sessões", error.message)
      return false
    }
  }

  const testEmailValidation = async () => {
    try {
      addResult("Validação Email", "info", "Testando verificação de email existente...")

      const nonExistentEmail = `naoexiste${Date.now()}@test.com`
      const nonExistentUser = await databaseService.getUserByEmail(nonExistentEmail)

      if (!nonExistentUser) {
        addResult("Validação Email", "success", "Email inexistente retornou null corretamente")
      } else {
        addResult("Validação Email", "error", "Email inexistente deveria retornar null")
        return false
      }

      const existingUser = await databaseService.getUserByEmail(testEmail)
      if (existingUser) {
        addResult("Validação Email", "success", `Email existente encontrado: ${existingUser.email}`)
        addResult("Validação Email", "info", `ID do usuário: ${existingUser.id}, Nome: ${existingUser.name}`)

        if (existingUser.email === testEmail) {
          addResult("Validação Email", "success", "Dados do usuário corretos")
        } else {
          addResult("Validação Email", "error", "Dados do usuário incorretos")
          return false
        }
      } else {
        addResult("Validação Email", "info", "Usuário de teste não existe ainda")
      }

      const invalidEmails = ["", "invalid", "test@", "@test.com", "test..test@test.com"]
      for (const invalidEmail of invalidEmails) {
        try {
          const result = await databaseService.getUserByEmail(invalidEmail)
          if (!result) {
            addResult("Validação Email", "success", `Email inválido "${invalidEmail}" tratado corretamente`)
          } else {
            addResult("Validação Email", "warning", `Email inválido "${invalidEmail}" retornou resultado inesperado`)
          }
        } catch (error) {
          addResult("Validação Email", "info", `Email inválido "${invalidEmail}" gerou erro (esperado)`)
        }
      }

      return true
    } catch (error) {
      addResult("Validação Email", "error", "Erro na validação de email", error.message)
      return false
    }
  }

  const testPerformance = async () => {
    try {
      addResult("Performance", "info", "Testando performance do database...")

      const testUser = await databaseService.getUserByEmail(testEmail)
      if (!testUser) {
        addResult("Performance", "error", "Usuário de teste não encontrado")
        return false
      }

      const startTime = Date.now()

      const placeIds = []
      for (let i = 0; i < 10; i++) {
        const placeId = await databaseService.createPlace(
          `Performance Test ${i}`,
          "https://via.placeholder.com/300x200",
          `Endereço Performance ${i}`,
          -23.5505 + i * 0.001,
          -46.6333 + i * 0.001,
          new Date().toISOString(),
          testUser.id,
        )
        placeIds.push(placeId)
      }

      const insertTime = Date.now() - startTime

      const searchStart = Date.now()
      const places = await databaseService.getPlacesByUser(testUser.id)
      const searchTime = Date.now() - searchStart

      addResult("Performance", "success", `10 inserções: ${insertTime}ms`)
      addResult("Performance", "success", `Busca ${places.length} registros: ${searchTime}ms`)

      for (const placeId of placeIds) {
        await databaseService.deletePlace(placeId, testUser.id)
      }
      addResult("Performance", "info", "Dados de teste removidos")

      if (insertTime < 3000 && searchTime < 1000) {
        addResult("Performance", "success", "Performance adequada")
        return true
      } else {
        addResult(
          "Performance",
          "warning",
          `Performance pode ser melhorada (Insert: ${insertTime}ms, Search: ${searchTime}ms)`,
        )
        return true
      }
    } catch (error) {
      addResult("Performance", "error", "Erro no teste de performance", error.message)
      return false
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    clearResults()

    addResult("Início", "info", "🚀 Iniciando testes do database...")

    const tests = [
      { name: "Inicialização", fn: testDatabaseInit },
      { name: "Tabelas", fn: testTables },
      { name: "CRUD Usuários", fn: testUserCRUD },
      { name: "CRUD Lugares", fn: testPlaceCRUD },
      { name: "Sessões", fn: testSessionManagement },
      { name: "Validação Email", fn: testEmailValidation },
      { name: "Performance", fn: testPerformance },
    ]

    let passedTests = 0
    const totalTests = tests.length

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      try {
        addResult("Progresso", "info", `Executando teste ${i + 1}/${totalTests}: ${test.name}`)
        const result = await test.fn()
        if (result) {
          passedTests++
        }

        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (error) {
        addResult(test.name, "error", "Teste falhou", error.message)
      }
    }

    if (passedTests === totalTests) {
      addResult("Resultado Final", "success", `✅ Todos os ${totalTests} testes passaram!`)
      addResult("Resultado Final", "success", "🎉 Database está funcionando perfeitamente!")
      Alert.alert("Sucesso! 🎉", "Database está funcionando perfeitamente!")
    } else {
      addResult("Resultado Final", "warning", `⚠️ ${passedTests}/${totalTests} testes passaram`)
      addResult("Resultado Final", "info", "Verifique os resultados acima para mais detalhes")
      Alert.alert("Atenção ⚠️", `${passedTests} de ${totalTests} testes passaram. Verifique os resultados.`)
    }

    setIsRunning(false)
  }

  const clearTestData = async () => {
    try {
      addResult("Limpeza", "info", "Removendo dados de teste...")
      await databaseService.clearAllData()
      addResult("Limpeza", "success", "Todos os dados removidos com sucesso")
      Alert.alert("Sucesso", "Dados de teste removidos", [
        {
          text: "OK",
          onPress: () => {
            if (onDataCleared) {
              onDataCleared()
            }
          },
        },
      ])
    } catch (error) {
      addResult("Limpeza", "error", "Erro ao limpar dados", error.message)
      Alert.alert("Erro", "Erro ao limpar dados de teste")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#4CAF50"
      case "error":
        return "#f44336"
      case "warning":
        return "#FF9800"
      case "info":
        return "#2196F3"
      default:
        return "#666"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return "checkmark-circle"
      case "error":
        return "close-circle"
      case "warning":
        return "warning"
      case "info":
        return "information-circle"
      default:
        return "help-circle"
    }
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Testes</Text>
        <View style={styles.placeholder} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>Configuração do Teste</Text>
            <TextInput
              style={styles.input}
              placeholder="Email de teste"
              value={testEmail}
              onChangeText={setTestEmail}
              placeholderTextColor="#999"
              editable={!isRunning}
            />
            <TextInput
              style={styles.input}
              placeholder="Nome de teste"
              value={testName}
              onChangeText={setTestName}
              placeholderTextColor="#999"
              editable={!isRunning}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha de teste"
              value={testPassword}
              onChangeText={setTestPassword}
              placeholderTextColor="#999"
              secureTextEntry
              editable={!isRunning}
            />
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={runAllTests} disabled={isRunning}>
              {isRunning ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.buttonText}>Executando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="play" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Executar Todos os Testes</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={clearResults}
                disabled={isRunning}
              >
                <Ionicons name="refresh" size={16} color="#4CAF50" />
                <Text style={styles.secondaryButtonText}>Limpar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={clearTestData}
                disabled={isRunning}
              >
                <Ionicons name="trash" size={16} color="#4CAF50" />
                <Text style={styles.secondaryButtonText}>Limpar Dados</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>
              Resultados dos Testes {testResults.length > 0 && `(${testResults.length})`}
            </Text>
            {testResults.length === 0 ? (
              <Text style={styles.noResults}>Nenhum teste executado ainda</Text>
            ) : (
              testResults.map((result) => (
                <View key={result.id} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Ionicons name={getStatusIcon(result.status)} size={20} color={getStatusColor(result.status)} />
                    <Text style={styles.resultTest}>{result.test}</Text>
                    <Text style={styles.resultTime}>{result.timestamp}</Text>
                  </View>
                  <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>{result.message}</Text>
                  {result.details && <Text style={styles.resultDetails}>{result.details}</Text>}
                </View>
              ))
            )}
          </View>
        </ScrollView>
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
  header: {
    height: 60,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  configSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f8f9fa",
    color: "#333",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buttonSection: {
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: "#4CAF50",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4CAF50",
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: "row",
  },
  resultsSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    marginBottom: 20,
  },
  noResults: {
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  resultItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  resultTest: {
    color: "#333",
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  resultTime: {
    color: "#999",
    fontSize: 12,
  },
  resultMessage: {
    fontSize: 14,
    marginLeft: 28,
    fontWeight: "500",
  },
  resultDetails: {
    color: "#666",
    fontSize: 12,
    marginLeft: 28,
    marginTop: 4,
    fontStyle: "italic",
  },
})

export default TestScreen
