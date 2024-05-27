import React, { useEffect, useState } from 'react';
import { Button, View, Image, Platform, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Pressable } from 'react-native';
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig.js";
import { createStackNavigator } from "@react-navigation/stack";
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
          style={{ padding: 8, fontSize: 18, backgroundColor: "#DBD8D7" }}
        />
      </View>
    );
};

const UploadListings = () => {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [PickUp, setPickUp] = useState("");
  // Stores the selected image URI 
  const [file, setFile] = useState(""); 
  
  // Stores any error message 
  const [error, setError] = useState(""); 

  // Function to pick an image from  
  //the device's media library 
  const navigation = useNavigation();

  const pickImage = async () => { 
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); 
    if (status !== "granted") { 
    // If permission is denied, show an alert 
        Alert.alert( 
            "Permission Denied", 
            `Sorry, we need camera  
            roll permission to upload images.` 
            ); 
    } else { 
        // Launch the image library and get 
        // the selected image 
        const result = await ImagePicker.launchImageLibraryAsync(); 

        if (!result.canceled) { 

            // If an image is selected (not cancelled),  
            // update the file state variable 
            setFile(result.assets[0].uri); 

            // Clear any previous errors 
            setError(null); 
        }
    } 
  }; 
  const handleSubmit = async () => {
    try {
        const docRef = await addDoc(collection(db, "listings"), {
        name: name,
        expiry: expiry,
        pickup: PickUp,
        imageUri: file,
        });
        
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
        setError("Error adding document");
    }
    navigation.navigate("SuccessfulPage");
  };

  return ( 
    <View style={styles.container}> 
        <InputWithLabel label="Name" placeholder="Name of item" value={name} onChangeText={setName} />
        <InputWithLabel label="Expiry" placeholder="Expiry date" value={expiry} onChangeText={setExpiry} />
        <InputWithLabel label="Location" placeholder="Pick up location" value={PickUp} onChangeText={setPickUp} />
        <TouchableOpacity onPress={pickImage}> 
            <Text style={styles.header}>Add Image</Text> 
        </TouchableOpacity> 

        {/* Conditionally render the image  
        or error message */} 
        {file ? ( 
            // Display the selected image 
            <View> 
                <Image source={{ uri: file }} 
                    style={styles.image} /> 
            </View> 
        ) : ( 
            // Display an error message if there's  
            // an error or no image selected 
            <Text style={styles.errorText}>{error}</Text> 
        )} 
        
        <TouchableOpacity style={styles.button} 
            onPress={handleSubmit}> 
            <Text style={styles.buttonText}> 
                Upload Listing
            </Text> 
        </TouchableOpacity> 
    </View> 
  ); 
} 

const SuccessfulPage = () => {
    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Text style={{fontSize: 30}}>Listing uploaded successfully!</Text>
        </View>
    )
}

const Main = () => {
    const Stack = createStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen name="UploadListings" component={UploadListings} options={{ headerShown: false }} />
            <Stack.Screen name="SuccessfulPage" component={SuccessfulPage} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};
export default Main;

const styles = StyleSheet.create({ 
  container: { 
      flex: 1, 
      justifyContent: "center", 
      alignItems: "center", 
      padding: 16, 
  }, 
  header: { 
      fontSize: 20, 
      marginBottom: 16, 
      color: "blue"
  }, 
  button: { 
      backgroundColor: "#007AFF", 
      padding: 10, 
      borderRadius: 8, 
      marginBottom: 16, 
      shadowColor: "#000000", 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.4, 
      shadowRadius: 4, 
      elevation: 5, 
  }, 
  buttonText: { 
      color: "#FFFFFF", 
      fontSize: 16, 
      fontWeight: "bold", 
  }, 
  imageContainer: { 
      borderRadius: 8, 
      marginBottom: 16, 
      shadowColor: "#000000", 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.4, 
      shadowRadius: 4, 
      elevation: 5,
  }, 
  image: { 
      width: 240, 
      height: 240, 
      borderRadius: 8,
  }, 
  errorText: { 
      color: "red", 
      marginTop: 16, 
  }, 
});