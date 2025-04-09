import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
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

      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 30,
    elevation: 4,
    zIndex: 999,
  },
});
