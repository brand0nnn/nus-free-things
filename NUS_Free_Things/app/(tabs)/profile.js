import { Button, View, Image, Platform, StyleSheet, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { collection, getDocs, onSnapshot } from "firebase/firestore"; 
import { auth, db } from "../../firebaseConfig.js";
import { ScrollView } from 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';

const Profiles = () => {

    const getCurrentUserEmail = () => {
        const currentUser = auth.currentUser;
      
        if (currentUser) {
          return currentUser.email;
        } else {
          return null;
        }
    };

    const email = getCurrentUserEmail();
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'listings'), (querySnapshot) => {
          const listingsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setListings(listingsData);
        }, (error) => {
          console.error('Error fetching listings:', error);
          Alert.alert('Error', 'Failed to fetch listings');
        });
    
        // Cleanup subscription on unmount
        return () => unsubscribe();
      }, []);
    
    return (
        <ScrollView>
            <View style={{paddingLeft: 10, flexWrap: "wrap", flexDirection: "row", justifyContent: "center"}}>
                {          
                    listings.filter(
                        listing => listing.email === email
                    ).map(listings => (
                    <View key={listings.id}>
                        <Card
                        key={listings.id}
                        name={listings.name}
                        expiry={listings.expiry}
                        pickup={listings.pickup}
                        url={listings.imageUrl}
                        />
                    </View>
                    ))
                }
            </View>
        </ScrollView>
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
    <Text style={styles.pickup}>Pick up at {props.pickup}</Text>
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
  
  const Listing = () => {
    return (  
      <View style={{flex: 1}}>
        <Heading />
        <Body />
      </View>
    );
  };