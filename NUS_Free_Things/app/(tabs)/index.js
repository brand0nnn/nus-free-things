import { Image, StyleSheet, Platform, View, Text, Button, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import React, {useState, useEffect} from 'react';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStackNavigator } from "@react-navigation/stack";
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from 'expo-router';

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";

const Stack = createStackNavigator();


const Chatroom = () => {
  return (
      <View style={{justifyContent: "center", alignItems: "center"}}>
          <Text>Chatroom</Text>
      </View>
  );
}

function InputWithLabel({placeholder, value, onChangeText, onSubmitEditing }) {
  return (
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        style={{ padding: 8, fontSize: 18, backgroundColor: "#DBD8D7" }}
      />
    </View>
  );
}

const Heading = () => {
  const [search, setSearch] = useState("");
  const navigation = useNavigation();

  return (
    <View style={{flexDirection: "row", padding: 25}}>
      <View style={{flex: 1}}>
        <InputWithLabel placeholder="Search" value={search} onChangeText={setSearch}/>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Chats")}>
        <IonIcon name="chatbubble-outline" style={{fontSize: 30, paddingLeft: 10, paddingTop: 20}}></IonIcon>
      </TouchableOpacity>
    </View>
  );
};


const Body = () => {
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

  return (
    <View style={{alignItems: "center"}}>
      <Button title="LogOut" onPress={handleSignOut}/>
    </View>
  );
};

const Listing = () => {
  return (  
    <ScrollView>
      <View>
        <Heading />
        <Body/>
      </View>
    </ScrollView>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const uid = user.uid;
        // You can add navigation or other logic here if needed
        navigation.navigate("(tabs)");
      } else {
        // User is signed out
        navigation.navigate("SignIn");
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [auth]);
  
  return (
      <Stack.Navigator>
        <Stack.Screen name="Listing" component={Listing} options={{ headerShown: false }}/>
        <Stack.Screen name="Chats" component={Chatroom}/>
      </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
