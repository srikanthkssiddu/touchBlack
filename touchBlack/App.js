import React, { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "./components/mobile/HomeScreen";
import LoginScreen from "./components/mobile/LoginScreen";


const Stack = createStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
       
        if (typeof window !== "undefined" && window.sessionStorage) {
          const phoneNumber = sessionStorage.getItem("phoneNumber");
          const password = sessionStorage.getItem("password");

          if (phoneNumber && password) {
            setInitialRoute("Home");
          } else {
            setInitialRoute("Login");
          }
        } else {
          const phoneNumber = await AsyncStorage.getItem("phoneNumber");
          const password = await AsyncStorage.getItem("password");

          if (phoneNumber && password) {
            setInitialRoute("Home");
          } else {
            setInitialRoute("Login");
          }
        }
      } catch (error) {
        console.error("Error occurred:", error);
        setInitialRoute("Login");
      }
    };

    checkLoginStatus();
  }, []);

  
  if (!initialRoute) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  
  const MobileNavigation = () => (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}  screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

 
  const WebNavigation = () => {
    return (
      <NavigationContainer
        linking={
          {
          prefixes: ["http://localhost:8081"], 
          config: {
            screens: {
              Login: "/",
              Home: "/home",
             
            },
          },
        }
      }
      >
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };

  
  return Platform.OS === "web" ? <WebNavigation /> : <MobileNavigation />;
};

export default App;
