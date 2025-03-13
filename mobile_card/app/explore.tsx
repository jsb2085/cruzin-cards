import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://127.0.0.1:8000/api'; // Replace with your backend URL

export default function ViewCards() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/cards/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCards(response.data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.card_image.card_front_image }} style={styles.image} />
      <Text style={styles.text}>{item.name}</Text>
      <Text>{item.card_company}</Text>
      <Text>Set: {item.set}</Text>
      <Text>Number: {item.number}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 60,
    backgroundColor: '#fff',
  },
  list: {
    padding: 10,
  },
  card: {
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  image: {
    width: 200,
    height: 300,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
