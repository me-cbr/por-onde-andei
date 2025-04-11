import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function NavBar({ title }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')}
        style={styles.userButton}
      >
        <AntDesign name="user" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  userButton: {
    padding: 5,
    marginTop: 5,
  },
});