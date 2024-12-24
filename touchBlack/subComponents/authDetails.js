import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = Platform.OS === "web" ? localStorage : AsyncStorage;

export const saveData = async (key, value) => {
  try {
    await storage.setItem(key, value);
  } catch (error) {
    console.error("Error saving data", error);
  }
};

export const getData = async (key) => {
  try {
    return await storage.getItem(key);
  } catch (error) {
    console.error("Error retrieving data", error);
  }
};
