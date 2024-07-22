import { View, Text, Button, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig.js";
  
const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful
        // onAuthStateChanged will handle navigation
      })
      .catch((error) => {
        // An error happened during sign-out
        Alert.alert('Sign Out Error', error.message);
      });
  };

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.emailVerified) {
          navigation.navigate("(tabs)");
        } else {
          handleSignOut();
          Alert.alert(
            "Email Not Verified",
            "Please verify your email address before signing in."
          );
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert("Sign In Error", errorMessage);
      });
  }

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
          <Text style={{fontSize: 24, marginBottom: 20, fontWeight: 'bold'}}>Sign in</Text>
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
          marginBottom: 20, 
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

        <View style={{flexDirection:'row', justifyContent:'center', paddingBottom: 25}}>
          <TouchableOpacity onPress={() => navigation.navigate("reset")}>
            <Text style={{color:'#8C52FF', fontWeight:'700'}}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleSignIn}
          style={{
            backgroundColor: '#8C52FF', 
            padding: 20, 
            borderRadius: 10, 
            marginBottom: 20, 
            width: 300,
          }}>
            <Text style={{textAlign:'center', fontWeight:'700', fontSize: 16, color: '#FFFFFF'}}>Login</Text>
        </TouchableOpacity>

        <View style={{flexDirection:'row', justifyContent:'center'}}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={{color:'#8C52FF', fontWeight:'700'}}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SignInScreen;