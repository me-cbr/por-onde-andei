import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function PlaceCard({ place, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: place.photo }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{place.title}</Text>
        <Text style={styles.date}>
          {new Date(place.date).toLocaleDateString()}
        </Text>
        {place.location && (
          <Text style={styles.location}>
            {place.location.latitude.toFixed(4)}, {place.location.longitude.toFixed(4)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    padding: 10,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  date: {
    color: '#666',
    fontSize: 14,
    marginBottom: 3,
  },
  location: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
});