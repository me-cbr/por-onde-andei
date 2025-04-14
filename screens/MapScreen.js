import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen({ route, navigation }) {
  const { places } = route.params || { places: [] };

  if (!places || places.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Nenhum local para exibir</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: places[0].location?.latitude || 0,
    longitude: places[0].location?.longitude || 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <View style={styles.fieldContainerTop}>
        <Text style={styles.fieldTitle}>Imagem</Text>
        {places[0].photo ? (
          <Image source={{ uri: places[0].photo }} style={styles.photo} />
        ) : (
          <Text style={styles.noImageText}>Sem imagem disponível</Text>
        )}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldTitle}>Localização</Text>
        <MapView style={styles.map} initialRegion={initialRegion}>
          {places.map((place) => (
            place.location && (
              <Marker
                key={place.id}
                coordinate={{
                  latitude: place.location.latitude,
                  longitude: place.location.longitude,
                }}
                title={place.title}
              />
            )
          ))}
        </MapView>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  fieldContainerTop: {
    marginTop: 85,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  fieldContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  fieldTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  noImageText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 30,
    elevation: 4,
    zIndex: 999,
  },
});
