import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/upload/'; // Replace with your local network IP address

export default function UploadCard() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

      console.log('Upload success:', response.data);
      Alert.alert('Success', 'Images uploaded successfully!');
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
});

