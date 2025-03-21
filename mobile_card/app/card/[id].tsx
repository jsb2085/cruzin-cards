import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://127.0.0.1:8000/api/cards"; // Replace with your API

export default function CardDetails() {
  const { id } = useLocalSearchParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(null);

  const fetchCardDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get(`${API_URL}/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCard(response.data);
    } catch (error) {
      console.error("Error fetching card details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrice = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get(`http://127.0.0.1:8000/api/card_price/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPrice(response.data.price);
    } catch (error) {
    }
  };

  useEffect(() => {
    setPrice(0)
    fetchCardDetails();
    fetchPrice();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />;
  }

  if (!card) {
    return <Text style={styles.errorText}>Card not found.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: card.card_image.card_front_image }} style={styles.image} />
        <Image source={{ uri: card.card_image.card_back_image }} style={styles.image} />
      </View>

      <Text style={styles.title}>{card.name}</Text>
      <Text style={styles.text}>Company: {card.card_company}</Text>
      <Text style={styles.text}>Set: {card.set}</Text>
      <Text style={styles.text}>Number: {card.number}</Text>


      <View style={styles.priceContainer}>
        <Text style={styles.priceTitle}>Estimated Market Price</Text>
        {price ? (
          <Text style={styles.priceText}>${price.toFixed(2)}</Text>
        ) : (
          <Text style={styles.priceLoading}>Fetching price...</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "flex-start",
    backgroundColor: "#fff",
  },
  imageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 160,
    height: 250,
    resizeMode: "contain",
    marginHorizontal: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: "left",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 20,
    color: "red",
    textAlign: "center",
  },
  priceContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    alignSelf: "center"
  },
  priceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  priceText: {
    fontSize: 22,
    color: "green",
    fontWeight: "bold",
  },
  priceLoading: {
    fontSize: 18,
    color: "#555",
  },
});