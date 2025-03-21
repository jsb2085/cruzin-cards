import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";

export default function HomeScreen() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Fetch cards for the authenticated user
  const fetchCards = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get(
        "https://specifically-eugene-factor-trades.trycloudflare.com/api/cards/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCards(response.data);
    } catch (error) {
      console.error("Failed to fetch cards:", error);
      Alert.alert("Error", "Failed to load cards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch username from stored token
  const fetchUsername = async () => {
    const username = await AsyncStorage.getItem("username");
    console.log(username);
    setUsername(username || "User");
  };

  useEffect(() => {
    fetchCards();
    fetchUsername();
  }, []);

  const onRefresh = async () => {
    fetchUsername();
    setRefreshing(true);
    await fetchCards();
    setRefreshing(false);
  };

  // Logout the user
  const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("username");
    router.replace("/login"); // Navigate to the login page
  };

  const renderCardItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => router.replace("/")} //{ cardId: item.id }
    >
      <Text style={styles.cardName}>{item.name}</Text>
      <Text>Set: {item.set}</Text>
      <Text>Number: {item.number}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {username}!</Text>

      <Button
        title="Upload a New Card"
        onPress={() => router.replace("/scan")}
      />
      {username !== "User" ? (
        <View style={styles.logoutButton}>
          <Button title="Logout" color="red" onPress={logout} />
        </View>
      ) : (
        <View style={styles.logoutButton}>
          <Button
            title="Login"
            color="blue"
            onPress={() => {
              router.replace("/login");
            }}
          />
        </View>
      )}

      <Text style={styles.subHeader}>Your Cards:</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCardItem}
          ListEmptyComponent={<Text>No cards found.</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    marginVertical: 10,
  },
  cardItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 20,
  },
});
