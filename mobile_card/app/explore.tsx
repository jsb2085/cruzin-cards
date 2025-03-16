import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  RefreshControl,
  TextInput,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://cameras-adolescent-framed-lamps.trycloudflare.com/api"; // Replace with your backend URL

export default function ViewCards() {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [refreshing, setRefreshing] = useState(false);

  const [sortOpen, setSortOpen] = useState(false);

  const [sortItems, setSortItems] = useState([
    { label: "Name", value: "name" },
    { label: "Set", value: "set" },
    { label: "Company", value: "company" },
  ]);

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    filterAndSortCards();
  }, [searchQuery, cards, sortOption]);

  const fetchCards = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get(`${API_URL}/cards/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCards(response.data);
      setFilteredCards(response.data);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  const filterAndSortCards = () => {
    const queryKeywords = searchQuery.toLowerCase().split(" ").filter(Boolean);

    const filtered = cards.filter((card) => {
      const fields = [
        card.name.toLowerCase(),
        card.card_company.toLowerCase(),
        card.set.toLowerCase(),
        card.number.toLowerCase(),
      ];

      return queryKeywords.every((keyword) =>
        fields.some((field) => field.includes(keyword))
      );
    });

    filtered.sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "set") {
        return a.set.localeCompare(b.set);
      } else if (sortOption === "company") {
        return a.card_company.localeCompare(b.card_company);
      } else {
        return 0;
      }
    });

    setFilteredCards(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCards();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.card_image.card_front_image }}
        style={styles.image}
      />
      <Text style={styles.text}>{item.name}</Text>
      <Text>{item.card_company}</Text>
      <Text>Set: {item.set}</Text>
      <Text>Number: {item.number}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a card"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <DropDownPicker
        open={sortOpen}
        value={sortOption}
        items={sortItems}
        setOpen={setSortOpen}
        setValue={setSortOption}
        setItems={setSortItems}
        placeholder="Sort By"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 60,
    backgroundColor: "#fff",
  },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 10,
  },
  dropdown: {
    margin: 10,
    borderColor: "#ccc",
  },
  dropdownContainer: {
    borderColor: "#ccc",
  },
  list: {
    padding: 10,
  },
  card: {
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },
  image: {
    width: 200,
    height: 300,
    resizeMode: "cover",
    borderRadius: 8,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
});
