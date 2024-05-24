import { View, Text, Button, TextInput, Image } from 'react-native';
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
}
  
const SignInScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigation = useNavigation();

    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: "#2AAAF9", justifyContent: "center", alignItems: "center"}}>
          <Text style={{color: "white", fontSize: 35}}>Sign In</Text>
        </View>
        <View style={{ padding: 20, justifyContent: "center", alignItems: "center", flex: 8 }}>
          <Text style={{ fontSize: 30 }}>Nus Free Things</Text>
          <InputWithLabel label="Email" placeholder="Type your email here" value={email} onChangeText={setEmail} />
          <InputWithLabel label="Password" placeholder="Type your password here" value={password} onChangeText={setPassword} secureTextEntry={true} />
          <View style={{width: 220}}>
            <Button title="Login" onPress={() => navigation.navigate("(tabs)")}/>
          </View>
        </View>
      </View>
    );
};

export default SignInScreen