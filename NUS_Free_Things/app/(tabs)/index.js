import { Image, StyleSheet, Platform, View, Text, Button, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, {useState, useEffect} from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { createStackNavigator } from "@react-navigation/stack";
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from 'expo-router';

import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, onSnapshot } from "firebase/firestore"; 
import { auth, db } from "../../firebaseConfig.js";

const Stack = createStackNavigator();

const getCurrentUserEmail = () => {
  const currentUser = auth.currentUser;

  if (currentUser) {
    return currentUser.email;
  } else {
    return null;
  }
};

const email = getCurrentUserEmail();

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
    <View style={{flexDirection: "row", paddingTop: 25, paddingHorizontal: 10}}>
      <View style={{flex: 1}}>
        <InputWithLabel placeholder="Search" value={search} onChangeText={setSearch}/>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Chats")}>
        <IonIcon name="chatbubble-outline" style={{fontSize: 30, paddingTop: 20}}></IonIcon>
      </TouchableOpacity>
    </View>
  );
};

const Body = () => {
  const navigation = useNavigation();
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
    <ScrollView>
      <View style={{paddingLeft: 10, flexWrap: "wrap", flexDirection: "row", justifyContent: "center"}}>
        {
          listings.filter(
            listing => listing.email !== email
          ).map(listings => (
            <TouchableOpacity key={listings.id}
                onPress={() => navigation.navigate("CardZoomIn",
                {
                  listings,
                }
              )}>
              <Card
                key={listings.id}
                name={listings.name}
                expiry={listings.expiry}
                pickup={listings.pickup}
                url={listings.imageUrl}
              />
            </TouchableOpacity>
          ))
        }
      </View>
      <View style={{paddingTop: 20}}>
        <Button title="LogOut" onPress={handleSignOut}/>
      </View>
    </ScrollView>
  );
};
// card for viewing listings

const CardZoomIn = (props) => {
  const navigation = useNavigation();
  const { listings } = props.route.params;
  return (
    <ScrollView>
      <TouchableOpacity onPress={() => navigation.navigate("Listing")}>
        <View style={{flex: 1, paddingTop: 35, paddingBottom: 10, paddingLeft: 16}}>
          <TabBarIcon size={35} name={"arrow-back-outline"}/>
        </View>
      </TouchableOpacity>
      <View style={{flex: 8}}>
        <View style={{alignItems: "center", paddingTop: 5, flex: 4}}>
          <Image
            style={{width: 420, height: 450, borderRadius: 8}}
            source={{ uri: listings.imageUrl }}
          />
        </View>
        <View style={{paddingLeft: 16, flex: 3, paddingBottom: 20, paddingTop: 20}}>
          <Text style={{fontSize: 30, fontWeight: "bold"}}>{listings.name}</Text>
          <Text style={{paddingTop: 30, fontSize: 25, fontWeight: "bold"}}>Details</Text>
          <Text style={{paddingTop: 5, fontSize: 15, color: "#7D8283"}}>Expires in</Text>
          <Text style={{fontSize: 20}}>{listings.expiry}</Text>
          <Text style={{paddingTop: 5, fontSize: 15, color: "#7D8283"}}>Pick up location</Text>
          <Text style={{fontSize: 20}}>{listings.pickup}</Text>
          <Text style={{paddingTop: 30, fontSize: 25, fontWeight: "bold"}}>Description</Text>
          <Text style={{paddingTop: 5, fontSize: 20}}>{listings.description}</Text>
        </View>
      </View>
      <Button title="Chat" onPress={() => navigation.navigate("Chats")}/>
    </ScrollView>
  );
};

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
        <Stack.Screen name="CardZoomIn" component={CardZoomIn} options={{ headerShown: false }}/>
      </Stack.Navigator>
  );
}
