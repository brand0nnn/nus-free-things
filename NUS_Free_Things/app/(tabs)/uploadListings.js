import React, { useEffect, useState } from 'react';
import { Button, View, Image, Platform, StyleSheet, Text, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Pressable } from 'react-native';
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from "../../firebaseConfig.js";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from 'expo-router';
import { auth } from "../../firebaseConfig.js";
import { ScrollView } from 'react-native-gesture-handler';
import OneMapXYZMap from './OneMap.js';
import { MaterialIcons } from '@expo/vector-icons';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

function InputWithLabel({ label, placeholder, value, onChangeText }) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ padding: 8, fontSize: 18 }}>{label}</Text>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={{ padding: 8, fontSize: 18, backgroundColor: "#DBD8D7", width: 200 }}
        />
      </View>
    );
};

function TextBox({ label, placeholder, value, onChangeText, multiline, numberOfLines }) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ padding: 8, fontSize: 18 }}>{label}</Text>
        <TextInput
          multiline={multiline}
          numberOfLines={numberOfLines}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={{ padding: 8, fontSize: 18, height: 100, width: 220, backgroundColor: "#DBD8D7" }}
        />
      </View>
    );
};

const UploadListings = () => {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [PickUp, setPickUp] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({}); 
  const [isFormValid, setIsFormValid] = useState(false); 
  // Stores the selected image URI 
  const [file, setFile] = useState(""); 
  
  // Stores any error message 
  const [error, setError] = useState(""); 

  // Function to pick an image from  
  //the device's media library 
  const navigation = useNavigation();

  const currentUser = auth.currentUser;
  
  const getCurrentUserEmail = () => {
    const currentUser = auth.currentUser;
  
    if (currentUser) {
      return currentUser.email;
    } else {
      return null;
    }
  };

  const email = getCurrentUserEmail();

  useEffect(() => {
    validateForm();
  }, [name, expiry, PickUp, description]);

  const validateForm = () => {
    let errors = {};

    if (!name){
        errors.name = '*Name is required';
    }

    if (!expiry){
        errors.expiry = '*Expiry date is required';
    }

    if (!PickUp){
        errors.PickUp = '*Pick up location is required';
    }

    if (!description){
        errors.description = '*Description is required';
    }

    /*if (!file){
        errors.file = '*Image is required';
    }*/
    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

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

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `images/${Date.now()}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image: ", error);
      setError("Error uploading image");
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
        let imageUrl = "";
        if (file) {
            imageUrl = await uploadImage(file);
        }
        const docRef = await addDoc(collection(db, "listings"), {
            key: name + email,
            name: name,
            expiry: expiry,
            pickup: PickUp,
            imageUrl: imageUrl,
            description: description,
            email: email,
            ownerId: currentUser.uid,
        });

        await updateDoc(doc(db, "listings", docRef.id), {
          id: docRef.id,
        });

        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
        setError("Error adding document");
    }
    navigation.navigate("SuccessfulPage");
  };

  return ( 
    <ScrollView>
      <View style={{flexDirection: "row", paddingTop: 21, paddingHorizontal: 10, backgroundColor: '#8C52FF'}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={{flex: 1, paddingTop: 35, paddingBottom: 10, paddingLeft: 10}}>
            <TabBarIcon size={35} name={"arrow-back-outline"}/>
          </View>
        </TouchableOpacity>
        <View style={{paddingLeft: 103, paddingTop: 40}}>
          <Text style={{textAlign:'center', fontWeight:'700', fontSize: 22, color: '#FFFFFF'}}>Upload</Text>
        </View>
      </View>
      <View style={styles.container}> 
        <View style={{ padding: 20, justifyContent: "center", alignItems: "center", flex: 8 }}>  

          {/* Image Placeholder */}
          <View style={styles.imagePlaceholder}>
            {file ? ( 
              // Display the selected image 
              <Image source={{ uri: file }} style={styles.image} /> 
            ) : ( 
              // Display a default placeholder
              <Text style={styles.placeholderText}>No Image Selected</Text>
            )} 
          </View>

          <TouchableOpacity onPress={pickImage} style={{padding: 5, borderRadius: 10, marginBottom: 10, width: 130, backgroundColor: '#8C52FF'}}> 
            <Text style={{textAlign:'center', fontWeight:'700', fontSize: 16, color: '#FFFFFF'}}>Edit Image</Text> 
          </TouchableOpacity> 

          <View style={{
              flexDirection:'row', 
              borderBottomColor:'#ccc', 
              borderBottomWidth: 1, 
              paddingBottom: 8, 
              paddingTop: 20,
              marginBottom: 25, 
            }}>
              <MaterialIcons name='drive-file-rename-outline' size={20} color="#666" style={{marginRight:5}} />
              <TextInput 
                placeholder='Enter name of item'
                style={{flex: 1, paddingVertical: 0}}
                value={name}
                onChangeText={setName}
              />
          </View>
          <View style={{
              flexDirection:'row', 
              borderBottomColor:'#ccc', 
              borderBottomWidth: 1, 
              paddingBottom: 8, 
              marginBottom: 25, 
            }}>
              <MaterialIcons name='calendar-month' size={20} color="#666" style={{marginRight:5}} />
              <TextInput 
                placeholder='Enter expiry date (if any)'
                style={{flex: 1, paddingVertical: 0}}
                value={expiry}
                onChangeText={setExpiry}
              />
          </View>
          <View style={{
              flexDirection:'row', 
              borderBottomColor:'#ccc', 
              borderBottomWidth: 1, 
              paddingBottom: 8, 
              marginBottom: 25, 
            }}>
              <MaterialIcons name='location-pin' size={20} color="#666" style={{marginRight:5}} />
              <TextInput 
                placeholder='Enter pick up location'
                style={{flex: 1, paddingVertical: 0}}
                value={PickUp}
                onChangeText={setPickUp}
              />
          </View>
          <View style={{
              flexDirection:'row', 
              borderBottomColor:'#ccc', 
              borderBottomWidth: 1, 
              paddingBottom: 8, 
              marginBottom: 25, 
            }}>
              <MaterialIcons name='description' size={20} color="#666" style={{marginRight:5}} />
              <TextInput 
                placeholder='Enter description'
                style={{flex: 1, paddingVertical: 0}}
                value={description}
                onChangeText={setDescription}
              />
          </View>
        </View>

        <TouchableOpacity 
          disabled={!isFormValid}
          onPress={handleSubmit}
          style={[
            {
              padding: 20, 
              borderRadius: 10, 
              marginBottom: 30, 
              width: 300,
            },
            isFormValid ? { backgroundColor: '#8C52FF' } : { backgroundColor: '#ccc' }
          ]}>
            <Text style={{textAlign:'center', fontWeight:'700', fontSize: 16, color: '#FFFFFF'}}>Upload Listing</Text>
        </TouchableOpacity>

        {Object.values(errors).map((error, index) => ( 
                <Text key={index} style={styles.errorText}> 
                    {error} 
                </Text>
        ))}
      </View> 
    </ScrollView>
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
      fontSize: 15, 
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
      width: 150, 
      height: 150, 
      borderRadius: 8,
  }, 
  errorText: { 
      color: "red", 
  }, 
  imagePlaceholder: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
});