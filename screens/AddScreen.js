import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddScreen({ navigation }) {
  const [photo, setPhoto] = useState(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua câmera');
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
        await getCurrentLocation();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Localização desativada', 'O local não será marcado no mapa');
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Erro na localização:', error);
    }
  };

  const handleSavePlace = async () => {
    if (!photo) {
      Alert.alert('Atenção', 'Tire uma foto primeiro');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, preencha o título antes de salvar');
      return;
    }

    const newPlace = {
      id: Date.now().toString(),
      title: title.trim(),
      photo,
      location,
      date: new Date().toISOString(),
    };

    try {
      const savedPlaces = await AsyncStorage.getItem('places');
      const places = savedPlaces ? JSON.parse(savedPlaces) : [];
      const updatedPlaces = [newPlace, ...places];
      await AsyncStorage.setItem('places', JSON.stringify(updatedPlaces));
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={handleTakePhoto}
        disabled={isLoading}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
              <>
                <Ionicons name="camera" size={50} color="#ccc" />
                <Text style={styles.placeholderText}>Tirar foto</Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Título (obrigatório)"
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity
        style={[styles.saveButton, !photo && styles.disabledButton]}
        onPress={handleSavePlace}
        disabled={!photo}
      >
        <Text style={styles.saveButtonText}>Salvar Local</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#999',
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});