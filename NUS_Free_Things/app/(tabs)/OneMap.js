import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Image, Text, ScrollView, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { db } from "../../firebaseConfig.js";
import { CardZoomIn } from './index.js';
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const XYZMapPage = () => {
  const navigation = useNavigation(); // Get the navigation prop

  const initialRegion = {
    latitude: 1.29692,
    longitude: 103.77332,
    latitudeDelta: 0.006,
    longitudeDelta: 0.006,
  };

  const minLat = 1.28974;
  const maxLat = 1.31342;
  const minLng = 103.76492;
  const maxLng = 103.79219;

  const [region, setRegion] = useState(initialRegion);
  const [markers, setMarkers] = useState([]);
  const [selectedListings, setSelectedListings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    const unsubscribeListings = onSnapshot(collection(db, 'listings'), (listingsSnapshot) => {
      const listingsData = listingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const unsubscribeLocations = onSnapshot(collection(db, 'locations'), (locationsSnapshot) => {
        const locationsData = locationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const groupedListings = listingsData.reduce((acc, listing) => {
          const location = locationsData.find(loc => loc.name === listing.pickup);
          if (location) {
            if (!acc[location.name]) {
              acc[location.name] = {
                coordinate: {
                  latitude: location.latitude,
                  longitude: location.longitude
                },
                listings: []
              };
            }
            acc[location.name].listings.push(listing);
          }
          return acc;
        }, {});

        const markersData = Object.keys(groupedListings).map(locationName => ({
          coordinate: groupedListings[locationName].coordinate,
          listings: groupedListings[locationName].listings,
          locationname: locationName
        }));

        setMarkers(markersData);
      });

      return () => unsubscribeLocations();
    });

    return () => unsubscribeListings();
  }, []);

  const onRegionChangeComplete = useCallback((newRegion) => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = newRegion;
    let updatedRegion = { latitude, longitude, latitudeDelta, longitudeDelta };

    if (latitude < minLat) {
      updatedRegion.latitude = minLat;
    } else if (latitude > maxLat) {
      updatedRegion.latitude = maxLat;
    }
    if (longitude < minLng) {
      updatedRegion.longitude = minLng;
    } else if (longitude > maxLng) {
      updatedRegion.longitude = maxLng;
    }

    setRegion(updatedRegion);
  }, []);

  const handleMarkerPress = (listings, location) => {
    setSelectedListings(listings);
    setLocationName(location); // Set location name
    setModalVisible(true);
  };

  const handleListingPress = (listing) => {
    setModalVisible(false);
    navigation.navigate('CardZoomIn', { listings: listing }); // Pass the listing data to the CardZoomIn page
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            onPress={() => handleMarkerPress(marker.listings, marker.locationname)}
          />
        ))}
      </MapView>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.locationName}>Listings at {locationName}</Text>
            <ScrollView style={styles.scrollView}>
              {selectedListings.map((listing, idx) => (
                <TouchableOpacity key={idx} style={styles.listingContainer} onPress={() => handleListingPress(listing)}>
                  <Image source={{ uri: listing.imageUrl }} style={styles.image} />
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{listing.name}</Text>
                    <Text style={styles.ownerText}>{listing.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default XYZMapPage;

const MapScreen = () => {

  return (
    <Stack.Navigator>
      <Stack.Screen name="XYZMapPage" component={XYZMapPage} options={{ headerShown: false }}/>
      <Stack.Screen name="CardZoomIn" component={CardZoomIn} options={{ headerShown: false }}/>
    </Stack.Navigator>
  )
}
export { MapScreen };

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  locationName: {
    fontSize: 18,
    //fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  closeButton: {
    alignSelf: 'center',
    paddingTop: 20,
  },
  closeButtonText: {
    color: 'blue',
  },
  scrollView: {
    marginTop: 10,
  },
  listingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  ownerText: {
    fontSize: 16,
    color: '#888888',
  },
});
