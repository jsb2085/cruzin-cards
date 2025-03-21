import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Button,
  FlatList,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL =
  "https://specifically-eugene-factor-trades.trycloudflare.com/api/user/"; // Replace with your backend URL
const SHOPS_API_URL =
  "https://specifically-eugene-factor-trades.trycloudflare.com/api/cardshops/"; // Replace with your backend URL

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndShops = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          console.error("No access token found.");
          setLoading(false);
          return;
        }

        const [userResponse, shopsResponse] = await Promise.all([
          axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(SHOPS_API_URL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userResponse.data);
        setShops(shopsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndShops();
  }, []);

  if (!user && !loading) {
    return (
      <Text style={styles.errorText}>
        Failed to load profile. Please check your connection.
      </Text>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
      ) : (
        <>
          <Text style={styles.name}>{user?.username}</Text>
          <Text style={styles.info}>Username: {user?.username}</Text>
          <Text style={styles.info}>
            First Name: {user?.firstname || "Not provided"}
          </Text>
          <Text style={styles.info}>
            Last Name: {user?.lastname || "Not provided"}
          </Text>
          <Text style={styles.info}>
            Email: {user?.email || "Not provided"}
          </Text>

          <Button title="Edit Profile" onPress={() => router.push("/")} />
          <Button
            title="Add Card Shop"
            onPress={() => router.push("/add_cardshop")}
          />

          <Text style={styles.sectionTitle}>Your Card Shops</Text>
          {shops.length === 0 ? (
            <Text style={styles.info}>No card shops added yet.</Text>
          ) : (
            <FlatList
              data={shops}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.shopContainer}>
                  <Text style={styles.shopName}>{item.name}</Text>
                  <Text>
                    {item.address}, {item.city}, {item.state},{" "}
                    {item.postal_code}, {item.country}
                  </Text>
                </View>
              )}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  shopContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});
