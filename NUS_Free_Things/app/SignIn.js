import { View, Text, Button, TextInput, Alert, Image } from 'react-native';
import React, {useState} from 'react';
import { useNavigation } from 'expo-router';

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from "../firebaseConfig.js";

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
  const auth = getAuth(app);  
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        //TODO: Change the line of code below to navigate to home page
        () => navigation.navigate('(tabs)');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert("Sign Up Error", errorMessage);
        // ..
      });
  };

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, backgroundColor: "#2AAAF9", justifyContent: "center", alignItems: "center"}}>
        <Text style={{color: "white", fontSize: 35}}>Sign In</Text>
      </View>
      <View style={{ padding: 20, justifyContent: "center", alignItems: "center", flex: 8 }}>
        <Text style={{ fontSize: 30 }}>NUS Free Things</Text>
        <InputWithLabel label="Email" placeholder="Type your email here" value={email} onChangeText={setEmail} />
        <InputWithLabel label="Password" placeholder="Type your password here" value={password} onChangeText={setPassword} secureTextEntry={true} />
        <View style={{width: 220}}>
          <Button title="Login" onPress={handleSignUp}/>
        </View>
      </View>
    </View>
  );
};

export default SignInScreen