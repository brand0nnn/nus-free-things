import { View, Text, Button, TextInput, Alert, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from 'expo-router';

import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig.js";

function InputWithLabel({ label, placeholder, value, onChangeText, secureTextEntry, onSubmitEditing }) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ padding: 8, fontSize: 18 }}>{label}</Text>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onSubmitEditing={onSubmitEditing}
          style={{ padding: 8, fontSize: 18 }}
        />
      </View>
    );
}
  
const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        //navigation.navigate("(tabs)");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert("Sign In Error", errorMessage);
      });
  }

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, backgroundColor: "#2AAAF9", justifyContent: "center", alignItems: "center", paddingTop: 25}}>
        <Text style={{color: "white", fontSize: 35}}>Sign In</Text>
      </View>
      <View style={{ padding: 20, justifyContent: "center", alignItems: "center", flex: 8 }}>
        <Text style={{ fontSize: 30 }}>NUS Free Things</Text>
        <InputWithLabel label="Email" placeholder="Type your email here" value={email} onChangeText={setEmail} />
        <InputWithLabel label="Password" placeholder="Type your password here" value={password} onChangeText={setPassword} secureTextEntry={true} />
        <View style={{width: 220}}>
          <Button title="Login" onPress={handleSignIn}/>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")} style={{paddingTop: 10}}>
          <Text>Don't have an account?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignInScreen;