import { Image, StyleSheet, Platform, View, Text, Button, TextInput, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import React, {useState, useEffect} from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { createStackNavigator } from "@react-navigation/stack";
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from 'expo-router';

import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, onSnapshot, query, where, addDoc, doc, serverTimestamp, getDoc, orderBy, deleteDoc } from "firebase/firestore"; 
import { auth, db } from "../../firebaseConfig.js";
import { GiftedChat } from 'react-native-gifted-chat';
import { TouchableHighlight } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

const ChatHistory = () => {
  const [chatrooms, setChatrooms] = useState([]);
  const navigation = useNavigation();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchChatrooms = async () => {
      if (currentUser) {
        try {
          const chatroomsRef = collection(db, 'chatrooms');
          
          const ownerQuery = query(chatroomsRef, where('owner', '==', currentUser.uid));
          const buyerQuery = query(chatroomsRef, where('buyer', '==', currentUser.uid));
          
          const [ownerSnapshot, buyerSnapshot] = await Promise.all([getDocs(ownerQuery), getDocs(buyerQuery)]);
          
          const ownerChatrooms = ownerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const buyerChatrooms = buyerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          const allChatrooms = [...ownerChatrooms, ...buyerChatrooms];
          setChatrooms(allChatrooms);
          
        } catch (error) {
          console.error('Error fetching chatrooms:', error);
        }
      }
    };
    
    fetchChatrooms();
  }, [currentUser]);

  const handleChatPress = (chatroom) => {
    navigation.navigate('ListingChat', {
      chatroomId: chatroom.id,
      currentUserEmail: currentUser.email
    });
  };

  return (
    <View style={{flex: 1}}>
        <View style={{flex: 1, borderBottomColor: "#B2B8BB", borderBottomWidth: 0.5, justifyContent: "flex-end"}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={{paddingLeft: 16}}>
              <TabBarIcon size={35} name={"close-outline"} />
            </View>
          </TouchableOpacity>
          <View style={{alignContent: "center", justifyContent: "center"}}> 
            <Text style={{fontSize: 30, paddingLeft: 16, fontWeight: "bold"}}>All Chats</Text>
          </View>
        </View>
      <View style={{flex: 7}}>
        <FlatList
          nestedScrollEnabled
          data={chatrooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableHighlight activeOpacity={0.6} underlayColor="#DDDDDD" onPress={() => handleChatPress(item)}>
              <IndividualChat chatroom={item} />
            </TouchableHighlight>
          )}
        />
      </View>
    </View>
  );
};

const IndividualChat = ({chatroom}) => {

  return (
    <View style={{height: 72}}>
      <View style={{alignSelf: "center"}}>
        <Text style={{fontSize: 30}}>{chatroom.listingName}</Text>
      </View>
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
    <View style={{flexDirection: "row", paddingTop: 25, paddingHorizontal: 10, backgroundColor: '#8C52FF'}}>
      <View style={{flex: 1}}>
        <InputWithLabel placeholder="Search" value={search} onChangeText={setSearch}/>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("ChatHistory")}>
        <IonIcon name="chatbubble-outline" style={{fontSize: 30, paddingTop: 20}}></IonIcon>
      </TouchableOpacity>
    </View>
  );
};

const Body = () => {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        navigation.navigate("(tabs)");
        const unsubscribeListings = onSnapshot(
          collection(db, 'listings'), 
          (querySnapshot) => {
            const listingsData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setListings(listingsData);
          },
          (error) => {
            console.error('Error fetching listings:', error);
            Alert.alert('Error', 'Failed to fetch listings');
          }
        );

        // Cleanup Firestore subscription on unmount
        return () => unsubscribeListings();
      } else {
        // Clear listings if user logs out
        setListings([]);
        setCurrentUser(null);
        navigation.navigate("SignIn");
      }
    });

    // Cleanup authentication listener on unmount
    return () => unsubscribeAuth();
  }, []);

  return (
    <ScrollView>
      <View style={{paddingLeft: 10, flexWrap: "wrap", flexDirection: "row", justifyContent: "center"}}>
        {
          listings.filter(
            listing => listing.email !== currentUser.email
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
    </ScrollView>
  );
};
// card for viewing listings

const CardZoomIn = (props) => {
  const navigation = useNavigation();
  const { listings } = props.route.params;
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleChatPress = async () => {
    try {
      if (currentUser) {
        const chatroomsRef = collection(db, "chatrooms");
        const q = query(chatroomsRef, where("listingId", "==", listings.id), where("buyer", "==", currentUser.uid), where("owner", "==", listings.ownerId));

        const querySnapshot = await getDocs(q);
        let chatroomId;

        if (!querySnapshot.empty) {
          // Chatroom already exists
          chatroomId = querySnapshot.docs[0].id;
        } else {
          // Create a new chatroom

          const chatroomDocRef = await addDoc(chatroomsRef, {
            listingId: listings.id,
            listingName: listings.name,
            owner: listings.ownerId,
            buyer: currentUser.uid
            //messages: []
          });
          chatroomId = chatroomDocRef.id;
        }

        navigation.navigate("ListingChat", {
          chatroomId,
          currentUserEmail: currentUser.email
        });
      } else {
        console.error('User not authenticated.'); // Handle error if user is not authenticated
      }
    } catch (error) {
      console.error('Error querying Firestore:', error);
      // Handle specific errors or display a generic error message
      // You can also set state or manage UI to inform the user of the error
    }
  };

  const handleDeletePress = async () => {
    try {
      // Step 1: Delete associated chatrooms
      const chatroomsRef = collection(db, "chatrooms");
      const q = query(chatroomsRef, where("listingId", "==", listings.id));
  
      const querySnapshot = await getDocs(q);
      const deleteOperations = [];
  
      querySnapshot.forEach((doc) => {
        deleteOperations.push(deleteDoc(doc.ref));
      });
  
      // Step 2: Wait for all chatrooms to be deleted
      await Promise.all(deleteOperations);
  
      // Step 3: Delete the listing itself
      await deleteDoc(doc(db, "listings", listings.id));
  
      // Success message and navigation
      Alert.alert('Listing and associated chatrooms deleted successfully');
      navigation.navigate("Listing");
    } catch (error) {
      console.error('Error deleting listing and chatrooms:', error);
      Alert.alert('Error', 'Failed to delete listing and associated chatrooms');
    }
  };

  if (!currentUser) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView>
      <TouchableOpacity onPress={() => navigation.goBack()}>
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
      {currentUser.uid === listings.ownerId ? (
        <Button title="Delete" onPress={handleDeletePress} color="#F74046"/>
      ) : (
        <Button title="Chat" onPress={handleChatPress} />
      )}
    </ScrollView>
  );
};
export { CardZoomIn };

const ListingChat = (props) => {
  const navigation = useNavigation();
  const { chatroomId, currentUserEmail } = props.route.params;
  const [messages, setMessages] = useState([]);
  const [listing, setListing] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesCollectionRef = collection(db, "chatrooms", chatroomId, "messages");
        const unsubscribe = onSnapshot(query(messagesCollectionRef, orderBy('timestamp', 'desc')), (snapshot) => {
          const newMessages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              _id: doc.id,
              text: data.text,
              createdAt: data.timestamp ? data.timestamp.toDate() : new Date(),
              user: {
                _id: data.sender === currentUserEmail ? currentUserEmail : 'other-user-id',
                name: data.sender,
              },
            };
          });
          setMessages(newMessages);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    const fetchListing = async () => {
      try {
        const chatroomDocRef = doc(db, 'chatrooms', chatroomId);
        const chatroomDocSnap = await getDoc(chatroomDocRef);

        if (chatroomDocSnap.exists()) {
          const listingId = chatroomDocSnap.data().listingId;
          const listingDocRef = doc(db, 'listings', listingId);
          const listingDocSnap = await getDoc(listingDocRef);

          if (listingDocSnap.exists()) {
            setListing({ id: listingDocSnap.id, ...listingDocSnap.data() });
          } else {
            console.error('Listing not found for chatroom:', chatroomId);
          }
        } else {
          console.error('Chatroom document not found:', chatroomId);
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      }
    };

    fetchMessages();
    fetchListing();
  }, [chatroomId, currentUserEmail]);

  const handleSendMessage = async (newMessages) => {
    const message = newMessages[0];
    try {
      const messagesCollectionRef = collection(db, "chatrooms", chatroomId, "messages");
      await addDoc(messagesCollectionRef, {
        text: message.text,
        sender: currentUserEmail,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!listing) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", borderBottomColor: "#B2B8BB", borderBottomWidth: 1.5, flex: 1}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={{ paddingTop: 70, paddingBottom: 10, paddingLeft: 16 }}>
            <TabBarIcon size={35} name={"chevron-back-outline"} />
          </View>
        </TouchableOpacity>
        <View style={{ paddingTop: 50, paddingLeft: 15 }}>
          <Image
            style={styles.avatar}
            source={{ uri: listing.imageUrl }}
          />
        </View>
        <View style={{ flexDirection: "column", paddingTop: 50, paddingLeft: 16 }}>
          <Text style={styles.listingText}>{listing.name}</Text>
          <Text style={{ fontSize: 16, color: '#888888' }}>{currentUserEmail === listing.email ? 'You are the owner' : listing.email}</Text>
        </View>
      </View>
      <View style={{ backgroundColor: '#FFFFFF', flex: 6 }}>
        <GiftedChat
          messages={messages}
          onSend={handleSendMessage}
          user={{ _id: currentUserEmail, name: currentUserEmail }}
          alwaysShowSend
          scrollToBottom
        />
      </View>
    </View>
  );
}

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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 64,
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: "white",
  },
  listingText: {
    fontSize: 30,
    fontWeight: "bold",
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

  /*useEffect(() => {
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
  }, [auth]);*/
  
  return (
      <Stack.Navigator>
        <Stack.Screen name="Listing" component={Listing} options={{ headerShown: false }}/>
        <Stack.Screen name="ChatHistory" component={ChatHistory} options={{ headerShown: false}}/>
        <Stack.Screen name="ListingChat" component={ListingChat} options={{ headerShown: false}}/>
        <Stack.Screen name="CardZoomIn" component={CardZoomIn} options={{ headerShown: false }}/>
      </Stack.Navigator>
  );
}
