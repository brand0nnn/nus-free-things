import { View, Text, Button, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebaseConfig.js";
import { getDocs, collection, query, where } from "firebase/firestore";
  
const ResetScreen = () => {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Enter Email", "Please enter your email address to reset your password.");
      return;
    }
  
    try {
      // Check if the email exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        // No matching document found
        Alert.alert("Error", "This email is not registered.");
        return;
      }
  
      // Email exists in Firestore, proceed to send password reset email
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Password Reset", "A password reset link has been sent to your email address.");
      navigation.navigate("SignIn");
    } catch (error) {
      Alert.alert("Error", error.message);
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
          <Text style={{fontSize: 24, marginBottom: 20, fontWeight: 'bold'}}>Reset your password</Text>
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
            placeholder=' Enter your Email Address'
            style={{flex: 1, paddingVertical: 0}}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity 
          onPress={handlePasswordReset}
          style={{
            backgroundColor: '#8C52FF', 
            padding: 20, 
            borderRadius: 10, 
            marginBottom: 20, 
            width: 300,
          }}>
            <Text style={{textAlign:'center', fontWeight:'700', fontSize: 16, color: '#FFFFFF'}}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ResetScreen;