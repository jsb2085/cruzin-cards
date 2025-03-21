import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BackHandler, View, StyleSheet } from "react-native";

function TabsLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  const refreshAuthToken = async () => {
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    try {
      const response = await fetch(
        "https://specifically-eugene-factor-trades.trycloudflare.com/api/token/refresh/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      if (response.ok) {
        const { access } = await response.json();
        await AsyncStorage.setItem("authToken", access);
        console.log("Token refreshed successfully!");
        return access;
      } else {
        console.error("Failed to refresh token.");
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  const useTokenRefresh = () => {
    useEffect(() => {
      const interval = setInterval(async () => {
        console.log("Refreshing token...");
        await refreshAuthToken();
      }, 15 * 60 * 1000); // Refresh every 14 minutes (adjust as needed)

      return () => clearInterval(interval); // Cleanup on unmount
    }, []);
  };

  // Check if the user is logged in by looking for the auth token
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setIsLoggedIn(!!token); // Set to true if token exists
    };

    checkAuthStatus();
  }, []);

  useTokenRefresh();

  const backButton = (
    <Ionicons
      name="arrow-back"
      size={24}
      color="white"
      onPress={() => router.back()}
      style={{ marginLeft: 16 }}
    />
  );

  return (
    <Tabs
      backBehavior="history"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "explore") {
            iconName = focused ? "folder" : "folder-outline";
          } else if (route.name === "scan") {
            iconName = focused ? "camera" : "camera-outline";
          } else if (route.name === "profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "login") {
            iconName = focused ? "log-in" : "log-in-outline";
          } else {
            iconName = "help-circle";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "grey",
        tabBarStyle: {
          backgroundColor: "",
        },
        headerStyle: {
          backgroundColor: "brown",
        },
        sceneStyle: {
          backgroundColor: "white",
        },
      })}
    >
      <Tabs.Screen name="login" options={{ title: "Login" }} />
      <Tabs.Screen name="explore" options={{ title: "My Cards" }} />
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="scan" options={{ title: "Scan Card" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen
        name="register"
        options={{
          href: null,
          title: "Register",
          headerLeft: () => backButton,
        }}
      />
      <Tabs.Screen
        name="card/[id]"
        options={{
          href: null,
          title: "View Card",
          headerLeft: () => backButton,
        }}
      />
      <Tabs.Screen
        name="add_cardshop"
        options={{
          href: null,
          title: "Add Cardshop",
          headerLeft: () => backButton,
        }}
      />
    </Tabs>
  );
}

export default function Layout() {
  return <TabsLayout />;
}
