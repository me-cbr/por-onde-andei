import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Text,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import PlaceCard from '../components/PlaceCard';
import NavBar from '../components/NavBar';

export default function HomeScreen({ navigation, setIsAuthenticated }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const savedPlaces = await AsyncStorage.getItem('places');
        if (savedPlaces) {
          setPlaces(JSON.parse(savedPlaces));
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os lugares');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadPlaces);
    return unsubscribe;
  }, [navigation]);

  const handleDeletePlace = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este local?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              const updatedPlaces = places.filter(place => place.id !== id);
              await AsyncStorage.setItem('places', JSON.stringify(updatedPlaces));
              setPlaces(updatedPlaces);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o local');
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userLoggedIn');
      setIsAuthenticated(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível fazer logout');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      <NavBar title="Meus Lugares" onLogout={handleLogout} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <FlatList
            data={places}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <PlaceCard
                  place={item}
                  onPress={() => navigation.navigate('Map', { places: [item] })}
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePlace(item.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="sad-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum local cadastrado ainda</Text>
              </View>
            }
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('Add')}
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingTop: 40,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  deleteButton: {
    padding: 16,
    marginLeft: 'auto',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});
