import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform, Modal, TextInput, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/upload/'; // Replace with your local network IP address

export default function UploadCard() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [manualInputVisible, setManualInputVisible] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualNumber, setManualNumber] = useState('');
  const [manualCardImage, setManualCardImage] = useState(null);
  const [manualCardCompany, setManualCardCompany] = useState('');

  // Normalize URI for iOS (remove file:// if necessary)
  const normalizeUri = (uri: string) => (Platform.OS === 'ios' ? uri.replace('file://', '') : uri);

  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>, fromLibrary = false) => {
    let permissionResult = fromLibrary
      ? await ImagePicker.requestMediaLibraryPermissionsAsync()
      : await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.status !== 'granted') {
      alert('Permission to access media is required!');
      return;
    }

    let result = fromLibrary
      ? await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1,
        })
      : await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 1,
        });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualName || !manualNumber) {
      Alert.alert('Error', 'Both name and number must be provided.');
      return;
    }
  
    const formData = new FormData();
    formData.append('name', manualName);
    formData.append('number', manualNumber);
    formData.append('image_id', manualCardImage);
    formData.append('card_company', manualCardCompany);
  
    try {
      const response = await axios.post(`${API_URL}manual/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.data === 'manual') {
        Alert.alert('Error', 'Invalid input. Please try again.');
      } else {
        Alert.alert('Success', 'Card created successfully!');
        setManualInputVisible(false);
      }
    } catch (error) {
      console.error('Manual input error:', error.response?.data || error.message);
      Alert.alert('Error', `Manual input failed: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  };

  const uploadImages = async () => {
    if (!frontImage || !backImage) {
      Alert.alert('Error', 'Both images must be selected before uploading.');
      return;
    }
  
    const formData = new FormData();
  
    formData.append('card_front_image', {
      uri: normalizeUri(frontImage),
      name: 'front.jpg',
      type: 'image/jpeg',
    });
  
    formData.append('card_back_image', {
      uri: normalizeUri(backImage),
      name: 'back.jpg',
      type: 'image/jpeg',
    });
  
    setUploading(true);
    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.status === 'manual') {
        setManualName(response.data.extracted_name);
        setManualNumber(response.data.extracted_number);
        setManualCardImage(response.data.image_id);
        setManualCardCompany(response.data.card_company);
        setManualInputVisible(true);
      } else {
        Alert.alert('Success', 'Images uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      Alert.alert('Error', `Upload failed: ${JSON.stringify(error.response?.data || error.message)}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Button title="Take Front Image" onPress={() => pickImage(setFrontImage)} />
        <Button title="Select Front Image from Gallery" onPress={() => pickImage(setFrontImage, true)} />
        {frontImage && <Image source={{ uri: frontImage }} style={styles.image} />}

        <Button title="Take Back Image" onPress={() => pickImage(setBackImage)} />
        <Button title="Select Back Image from Gallery" onPress={() => pickImage(setBackImage, true)} />
        {backImage && <Image source={{ uri: backImage }} style={styles.image} />}

        {frontImage && backImage && (
          <Button title="Upload to Backend" onPress={uploadImages} disabled={uploading} />
        )}

        {uploading && <ActivityIndicator size="large" color="#0000ff" />}

        <Modal visible={manualInputVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Unrecognized {manualCardCompany} card:</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={manualName}
                onChangeText={setManualName}
              />
              <TextInput
                style={styles.input}
                placeholder="Number"
                value={manualNumber}
                onChangeText={setManualNumber}
              />
              <Button title="Submit" onPress={handleManualSubmit} />
              <Button title="Cancel" onPress={() => setManualInputVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 80,
  },
  image: {
    width: 300,
    height: 400,
    marginVertical: 20,
    borderRadius: 8,
    borderWidth: 0, // Remove borders
    shadowColor: 'transparent', // Remove iOS shadows
    elevation: 0, // Remove Android shadows
    resizeMode: 'cover', // Ensures the image fills the frame
    overflow: 'hidden', // Ensures content doesn't spill over
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
});

