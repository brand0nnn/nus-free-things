import { Button, View, Image, Platform, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { collection, getDocs, onSnapshot } from "firebase/firestore"; 
import { auth, db } from "../../firebaseConfig.js";
import { ScrollView } from 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import { CommonActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { CardZoomIn } from './index.js';
import UploadListings from './uploadListings.js';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { onAuthStateChanged, signOut } from "firebase/auth";

const Stack = createStackNavigator();

const Body = () => {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch current user
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    // Fetch listings
    const unsubscribeListings = onSnapshot(
      collection(db, 'listings'),
      querySnapshot => {
        const listingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(listingsData);
      },
      error => {
        console.error('Error fetching listings:', error);
        Alert.alert('Error', 'Failed to fetch listings');
      }
    );

    // Clean up subscriptions on unmount
    return () => {
      unsubscribeAuth();
      unsubscribeListings();
    };
  }, []);

  if (!currentUser) {
    return null; // or loading indicator while waiting for authentication
  }

  const userSpecificListings = listings.filter(listing => listing.email === currentUser.email);

  return (
    <ScrollView>
      <View style={{marginLeft: '4%', flexWrap: "wrap", flexDirection: "row", justifyContent: "center"}}>
        {userSpecificListings.length === 0 ? (
          <Text style={{ fontSize: 16, color: 'grey' }}>You have not uploaded any listings...</Text>
        ) : (
          <View style={{ flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start' }}>
            {userSpecificListings.map(listing => (
              <TouchableOpacity
                key={listing.id}
                onPress={() =>
                  navigation.navigate('CardZoomIn', {
                    listings: listing,
                  })
                }
              >
                <View key={listing.id}>
                  <Card
                    key={listing.id}
                    name={listing.name}
                    expiry={listing.expiry}
                    pickup={listing.pickup}
                    url={listing.imageUrl}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Body;


const Heading = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null); // Handle case where user is not authenticated
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!currentUser) {
    return null; // or loading indicator while waiting for authentication
  }

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
    <View style={{flex: 1}}>
        <View style={{flex: 2, backgroundColor: '#9575CD', paddingTop: 27}}>
        </View>
        <View style={{position: "absolute", left: 20, top: 70, paddingTop: 7}}>
            <Image 
                source={require('../../assets/images/react-logo.png')}
                style={styles.avatar}
            />
            <View style={{paddingTop: 5}}>
              <Text style={{fontSize: 18, color: 'grey'}}>Email: {currentUser.email}</Text>
            </View>
        </View>
        <View style={{flex: 3, borderBottomColor: "#B2B8BB", borderBottomWidth: 1.5, justifyContent: "flex-end"}}>
            <View style={{paddingLeft: 20, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between"}}>  
                <Text style={{fontSize: 30, fontWeight: "440", paddingTop: 10}}>My Listings</Text>
                <View style={{flexDirection: "row", paddingTop: 10, paddingEnd: 10}}>
                  <TouchableOpacity onPress={() => navigation.navigate("UploadListingsScreen")}>
                      <IonIcon name="duplicate-outline" style={{fontSize: 35, paddingEnd: 10}}></IonIcon>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSignOut}>
                    <IonIcon name="log-out-outline" style={{fontSize: 35}}></IonIcon>
                  </TouchableOpacity>           
                </View>
            </View>   
        </View>           
    </View>
  )
}

const Main = () => {
  return (
    <View style={{flex: 1}}>
        <View style={{flex: 1}}>
            <Heading />
        </View>
        <View style={{flex: 2, paddingTop: 30}}>
            <ScrollView>
                <Body />
            </ScrollView>
        </View>
        
    </View>
  )
}

const Profiles = () => {

  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={Main} options={{ headerShown: false }}/>
      <Stack.Screen name="UploadListingsScreen" component={UploadListings} options={{ headerShown: false }}/>
      <Stack.Screen name="CardZoomIn" component={CardZoomIn} options={{ headerShown: false }}/>
    </Stack.Navigator>
  )
}
export { Profiles };

const PreviewImage = (props) => (
    <Image
      style={styles.preview}
      source={{ uri: props.url }}
    />
  )
  
  const Name = (props) => (
    <Text style={styles.name} numberOfLines={1}>{props.name}</Text>
  );
  
  const Expiry = (props) => (
    <Text style={styles.expiry}>Expires in {props.expiry}</Text>
  );
  
  const Pickup = (props) => (
    <Text style={styles.pickup} numberOfLines={1} ellipsizeMode='tail'>Pick up at {props.pickup}</Text>
  );
  
  const Card = (props) => (
    <View style={cardStyles.card}>
      <PreviewImage url={props.url} />
      <View style={{paddingTop: 5}}>
        <Name name={props.name} />
        <Pickup pickup={props.pickup} />
      </View>
    </View>
  );
  
  const styles = StyleSheet.create({
    preview: {
      height: 160,
      width: 148,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    expiry: {
      fontSize: 16,
    },
    pickup: {
      fontSize: 16,
      color: "#646667",
      fontStyle: "italic",
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 64,
        borderWidth: 1,
        backgroundColor: "white",
        borderColor: "white",
    }
  });
  
  const cardStyles = StyleSheet.create({
    card: {
      width: 176,
      height: 236,
      padding: 12,
      marginRight: 12,
      borderWidth: 1,
      borderColor: "#E7E3EB",
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
    },
  });
  