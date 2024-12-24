import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { saveData } from "../../subComponents/authDetails";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const LoginScreen = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!phoneNumber.trim() || !password.trim()) {
      Alert.alert("Please enter both phone number and password");
      return;
    }
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("phoneNumber", phoneNumber);
        sessionStorage.setItem("password", password);
      }
      console.log(phoneNumber, password);
      await saveData("phoneNumber", phoneNumber);
      await saveData("password", password);
      navigation.replace("Home");
    } catch (error) {
      console.log("Error saving data", error);
      Alert.alert("Error saving data");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar animated={true} />
      <View style={styles.innerContainer}>

      
      <View style={styles.title}>
        <Text style={styles.touchText}>Touch</Text>
        <Text style={styles.blackText}>Black</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#888"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  innerContainer:{
    width: '100%',
    maxWidth: 400,
    padding: 20,
   borderWidth:2,
    borderColor:"#fff",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    boxShadow: Platform.OS === 'web' ? '0px 5px 15px rgba(0, 0, 0, 0.2)' : undefined,
    alignItems: 'center',
  },
  title: {
    justifyContent: "center",
    marginBottom: 80,
  },
  touchText: {
    fontSize: 32.5,
    fontWeight: "bold",
    color: "#fff",
  },
  blackText: {
    fontSize: 32.5,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
    marginTop: -17,
  },
  input: {
    width: isWeb ? width * 0.22 : width * 0.8,
    height: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  button: {
    width: isWeb ? width * 0.22 : width * 0.8,
    height: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 20,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;
