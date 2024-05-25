import { View, Text, Button, TextInput, ScrollView} from 'react-native';
import React, {useState} from 'react';
import { useNavigation } from 'expo-router';

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
  
  function confirmPasswordsMatch() {
    if (password !== confirmationPassword){    
        alert("Passwords do not match");
    }
    else {
        navigation.navigate("(tabs)");
    }
  };

  return (
    <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: "#2AAAF9", justifyContent: "center", alignItems: "center"}}>
            <Text style={{color: "white", fontSize: 35}}>Sign Up</Text>
        </View>
        <View style={{flex: 9, justifyContent: "center", alignItems: "center"}}>
            <View style={{fontSize: 30}}>
                <InputWithLabel
                    label="Email"
                    placeholder="Type your email here"
                    value={email}
                    onChangeText={setEmail}
                />
                <InputWithLabel
                label="Password"
                placeholder="Type your password here"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                />
                <InputWithLabel
                label="Confirm password"
                placeholder="Confirm your password here"
                value={confirmationPassword}
                onChangeText={setConfirmationPassword}
                secureTextEntry={true}
                onSubmitEditing={confirmPasswordsMatch}
                />              
                <Button title="Sign Up" 
                    onPress={confirmPasswordsMatch}
                />
            </View>
        </View>
    </View>
  );
};

