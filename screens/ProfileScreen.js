import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen({ setIsAuthenticated }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [image, setImage] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const loadUserData = async () => {
            const storedName = await AsyncStorage.getItem('userName');
            const storedImage = await AsyncStorage.getItem('userImage');
            const storedEmail = await AsyncStorage.getItem('userEmail');

            if (storedName) setName(storedName);
            if (storedImage) setImage(storedImage);
            if (storedEmail) setEmail(storedEmail);
        };

        loadUserData();
    }, []);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permissão negada', 'Você precisa permitir acesso à galeria.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        try {
            await AsyncStorage.setItem('userName', name);
            if (image) {
                await AsyncStorage.setItem('userImage', image);
            }
            Alert.alert('Sucesso', 'Perfil salvo com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar os dados');
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userLoggedIn');
            setIsAuthenticated(false);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível fazer logout');
        }
    };

    return (
        <View style={styles.fullContainer}>
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={30} color="white" />
                </TouchableOpacity>
                <View style={{ width: 24 }} />
            </View>
            <View style={styles.container}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="camera" size={30} color="#666" />
                            <Text style={{ color: '#666', marginTop: 5 }}>Selecionar Foto</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder="Digite seu nome"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.emailLabel}>
                    {email ? `Email: ${email}` : 'Email não disponível'}
                </Text>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <AntDesign name="logout" size={20} color="white" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    navbar: {
        height: 100,
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    imagePicker: {
        marginBottom: 20,
    },
    placeholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    input: {
        width: '100%',
        height: 48,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    emailLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 24,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f44336',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    logoutText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
    },
});
