import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import { BackHandler, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";


function TabsLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();



  const refreshAuthToken = async () => {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/token/refresh/",
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
      }, 14 * 60 * 1000); // Refresh every 14 minutes (adjust as needed)

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
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen
        name="register"
        options={{
          href: null,
          title: "Register",
          headerLeft: () => backButton,
        }}
      />
    </Tabs>
  );
}

export default function Layout() {
  return (

      <TabsLayout />

  );
}
