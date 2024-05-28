import { Image, StyleSheet, Platform, View, Text, Button, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, {useState, useEffect} from 'react';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createStackNavigator } from "@react-navigation/stack";
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from 'expo-router';

import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, onSnapshot } from "firebase/firestore"; 
import { auth, db } from "../../firebaseConfig.js";

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
    <View style={{flexDirection: "row", paddingTop: 25, paddingHorizontal: 10}}>
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
          listings.map(listings => (
            <Card
              key={listings.id}
              name={listings.name}
              expiry={listings.expiry}
              pickup={listings.pickup}
              url={listings.imageUrl}
            />
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

const PreviewImage = (props) => (
  <Image
    style={styles.preview}
    source={{ uri: props.url }}
  />
)

const Name = (props) => (
  <Text style={styles.name}>{props.name}</Text>
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
    <Name name={props.name} />
    <Expiry expiry={props.expiry} />
    <Pickup pickup={props.pickup} />
  </View>
);

const styles = StyleSheet.create({
  preview: {
    height: 160,
    width: 148,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});

const cardStyles = StyleSheet.create({
  card: {
    width: 176,
    height: 256,
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
      </Stack.Navigator>
  );
}


// Fake data for testing

const data = {
  cards: [
    {
      id: 'card-1',
      name: 'Cheese',
      expiry: '3 Days',
      pickup: 'Utown',
      url: 'https://www.noracooks.com/wp-content/uploads/2020/05/square.jpg',
    },
    {
      id: 'card-2',
      name: 'Bread',
      expiry: '2 Days',
      pickup: 'Raffles Hall',
      url: 'https://assets.bonappetit.com/photos/5c62e4a3e81bbf522a9579ce/16:9/w_4000,h_2250,c_limit/milk-bread.jpg',
    },
    {
      id: 'card-3',
      name: 'Corn',
      expiry: '1 Days',
      pickup: 'Tembusu',
      url: 'https://www.allrecipes.com/thmb/TkTP3fQnTpMhNtC_n4HMmCsIwsE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/222352-jamies-sweet-and-easy-corn-on-the-cob-rae-3x2-1-de041c9cd6ab4b40808368dc5cd96757.jpg',
    },
    {
      id: 'card-4',
      name: 'Apple',
      expiry: '5 Days',
      pickup: 'RC4',
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO8cqwcVTXLr1ClylUyrurV8kYdPaEztkbhrbpdQxgMQ&s',
    },
    {
      id: 'card-5',
      name: 'Apple',
      expiry: '5 Days',
      pickup: 'RC4',
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO8cqwcVTXLr1ClylUyrurV8kYdPaEztkbhrbpdQxgMQ&s',
    },
    {
      id: 'card-6',
      name: 'Apple',
      expiry: '5 Days',
      pickup: 'RC4',
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO8cqwcVTXLr1ClylUyrurV8kYdPaEztkbhrbpdQxgMQ&s',
    },
    {
      id: 'card-7',
      name: 'Apple',
      expiry: '5 Days',
      pickup: 'RC4',
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO8cqwcVTXLr1ClylUyrurV8kYdPaEztkbhrbpdQxgMQ&s',
    },
    {
      id: 'card-8',
      name: 'Apple',
      expiry: '5 Days',
      pickup: 'RC4',
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO8cqwcVTXLr1ClylUyrurV8kYdPaEztkbhrbpdQxgMQ&s',
    },
    {
      id: 'card-9',
      name: 'Apple',
      expiry: '5 Days',
      pickup: 'RC4',
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO8cqwcVTXLr1ClylUyrurV8kYdPaEztkbhrbpdQxgMQ&s',
    },
    {
      id: 'card-10',
      name: 'Apple',
      expiry: '5 Days',
      pickup: 'RC4',
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO8cqwcVTXLr1ClylUyrurV8kYdPaEztkbhrbpdQxgMQ&s',
    },
  ],
};

