import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const API_URL =
  "https://specifically-eugene-factor-trades.trycloudflare.com/api/cardshops/"; // Replace with your backend URL
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY; // Replace with your API Key

export default function AddCardShop() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddShop = async () => {
    if (!shopName || !address || !city || !state || !postalCode || !country) {
      Alert.alert("Error", "Please enter all required fields.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.post(
        API_URL,
        {
          name: shopName,
          description,
          address,
          city,
          state,
          postal_code: postalCode,
          country,
          phone,
          website,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Success", "Your card shop has been added!");
      router.push("/"); // Redirect to dashboard or shop listing page
    } catch (error) {
      console.error("Error adding shop:", error);
      Alert.alert("Error", "Failed to add shop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { placeholder: "Shop Name", value: shopName, onChangeText: setShopName },
    {
      placeholder: "Description",
      value: description,
      onChangeText: setDescription,
      multiline: true,
    },
    { placeholder: "City", value: city, onChangeText: setCity },
    { placeholder: "State", value: state, onChangeText: setState },
    {
      placeholder: "Postal Code",
      value: postalCode,
      onChangeText: setPostalCode,
    },
    { placeholder: "Country", value: country, onChangeText: setCountry },
    { placeholder: "Phone (Optional)", value: phone, onChangeText: setPhone },
    {
      placeholder: "Website (Optional)",
      value: website,
      onChangeText: setWebsite,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Add Your Card Shop</Text>

      {/* Google Places Autocomplete for Address */}
      <View style={styles.autocompleteWrapper}>
        <GooglePlacesAutocomplete
          placeholder="Search Address"
          fetchDetails
          query={{ key: GOOGLE_API_KEY, language: "en" }}
          onPress={(data, details = null) => {
            const addressComponents = details?.address_components || [];
            setAddress(data.description);

            // Extract address parts
            addressComponents.forEach((component) => {
              if (component.types.includes("locality")) {
                setCity(component.long_name);
              }
              if (component.types.includes("administrative_area_level_1")) {
                setState(component.long_name);
              }
              if (component.types.includes("postal_code")) {
                setPostalCode(component.long_name);
              }
              if (component.types.includes("country")) {
                setCountry(component.long_name);
              }
            });
          }}
          styles={{
            container: styles.autocompleteContainer,
            textInput: styles.input,
            listView: styles.dropdownList,
          }}
        />
      </View>

      {/* Use FlatList to avoid nesting issues */}
      <FlatList
        data={formFields}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TextInput
            style={item.multiline ? styles.textArea : styles.input}
            placeholder={item.placeholder}
            value={item.value}
            onChangeText={item.onChangeText}
            multiline={item.multiline || false}
          />
        )}
        ListFooterComponent={
          <Button
            title={loading ? "Adding..." : "Add Shop"}
            onPress={handleAddShop}
            disabled={loading}
          />
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 50,
    textAlignVertical: "top",
  },
  autocompleteWrapper: {
    zIndex: 100,
    position: "relative",
  },
  autocompleteContainer: {
    position: "absolute",
    width: "100%",
    zIndex: 200,
    marginTop: 50,
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    elevation: 5,
    zIndex: 300,
  },
});
