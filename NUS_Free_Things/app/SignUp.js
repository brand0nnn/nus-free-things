import { View, Text, Button, TextInput, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import React, {useState} from 'react';
import { useNavigation } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { createUserWithEmailAndPassword } from "firebase/auth";
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
};

export default SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const navigation = useNavigation();
  
  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        //navigation.navigate("(tabs)");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert("Sign Up Error", errorMessage);
        // ..
      });    
  };

  function confirmPasswordsMatch() {
    if (password !== confirmationPassword){    
        alert("Passwords do not match");
    }
    else {
        handleSignUp();
    }
  };

  return (
    <View style={{flex: 1}}>
      <View style={{ padding: 20, justifyContent: "center", alignItems: "center", flex: 8 }}>
        <View style={{paddingBottom: 20}}>
          <Image 
            source={require('../assets/images/NUS_Free_Things Logo.png')}
            style={{ width: 300, height: 110, marginBottom: 20}} 
          />
        </View>

        <View style={{paddingBottom: 10, alignSelf: 'flex-start'}}>
          <Text style={{fontSize: 24, marginBottom: 20, fontWeight: 'bold'}}>Sign Up</Text>
        </View>

        <View style={{
          flexDirection:'row', 
          borderBottomColor:'#ccc', 
          borderBottomWidth: 1, 
          paddingBottom: 8, 
          marginBottom: 25, 
        }}>
          <MaterialIcons name='email' size={20} color="#666" style={{marginRight:5}} />
          <TextInput 
            placeholder='Email Address'
            style={{flex: 1, paddingVertical: 0}}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={{
          flexDirection:'row', 
          borderBottomColor:'#ccc', 
          borderBottomWidth: 1, 
          paddingBottom: 8, 
          marginBottom: 25, 
        }}>
          <MaterialIcons name='lock' size={20} color="#666" style={{marginRight:5}} />
          <TextInput 
            placeholder='Password'
            style={{flex: 1, paddingVertical: 0}}
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={{
          flexDirection:'row', 
          borderBottomColor:'#ccc', 
          borderBottomWidth: 1, 
          paddingBottom: 8, 
          marginBottom: 25, 
        }}>
          <MaterialIcons name='lock' size={20} color="#666" style={{marginRight:5}} />
          <TextInput 
            placeholder='Confirm Password'
            style={{flex: 1, paddingVertical: 0}}
            secureTextEntry={true}
            value={confirmationPassword}
            onChangeText={setConfirmationPassword}
          />
        </View>

        <TouchableOpacity 
          onPress={confirmPasswordsMatch}
          style={{
            backgroundColor: '#8C52FF', 
            padding: 20, 
            borderRadius: 10, 
            marginBottom: 30, 
            width: 300,
          }}>
            <Text style={{textAlign:'center', fontWeight:'700', fontSize: 16, color: '#FFFFFF'}}>Register</Text>
        </TouchableOpacity>

        <View style={{flexDirection:'row', justifyContent:'center', marginBotton: 30}}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={{color:'#8C52FF', fontWeight:'700'}}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

