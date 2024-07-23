import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Image, Text, ScrollView } from 'react-native';
import MapView, { UrlTile, Marker, Callout } from 'react-native-maps';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from "../../firebaseConfig.js";

const XYZMapPage = () => {
  const xyzUrl = 'https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png';

  // Define the initial region and boundaries
  const initialRegion = {
    latitude: 1.29692,
    longitude: 103.77332,
    latitudeDelta: 0.006,
    longitudeDelta: 0.006,
  };

  // Define boundaries for NUS including water area
  const minLat = 1.28974;
  const maxLat = 1.31342;
  const minLng = 103.76492;
  const maxLng = 103.79219;
  
  // State to manage the current region and markers
  const [region, setRegion] = useState(initialRegion);
  const [markers, setMarkers] = useState([]);

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
  
        // Group listings by pickup location
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
  
        // Convert grouped listings to markers data
        const markersData = Object.keys(groupedListings).map(locationName => ({
          coordinate: groupedListings[locationName].coordinate,
          listings: groupedListings[locationName].listings
        }));
  
        setMarkers(markersData);
      });
  
      // Clean up the locations listener
      return () => unsubscribeLocations();
    });
  
    // Clean up the listings listener
    return () => unsubscribeListings();
  }, []);

  // Update region while scrolling to enforce boundaries
  const onRegionChangeComplete = useCallback((newRegion) => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = newRegion;
    let updatedRegion = { latitude, longitude, latitudeDelta, longitudeDelta };

    // Enforce boundaries
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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        <UrlTile
          urlTemplate={xyzUrl}
          maximumZ={18} // Adjust according to your tile provider's maximum zoom level
          zIndex={-1} // Ensure it's below other map layers
        />
        {/* Render markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
          >
            <Callout>
              <ScrollView style={styles.callout} contentContainerStyle={styles.calloutContent}>
                {marker.listings.map((listing, idx) => (
                  <View key={idx} style={styles.listingContainer}>
                    <Text style={{paddingBottom: 20, paddingRight: 10}}><Image source={{ uri: listing.imageUrl }} style={styles.image} /></Text>
                    <View style={styles.textContainer}>
                      <Text style={styles.title}>{listing.name}</Text>
                      <Text style={styles.ownerText}>{listing.email}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.bottomImageContainer}>
        <Image
          source={{ uri: 'https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png' }}
          style={styles.bottomImage}
        />
        <Text style={styles.bottomText}>
          <Text>OneMap</Text>
          <Text>&nbsp;</Text>
          <Text>&copy;</Text>
          <Text>&nbsp;</Text>
          <Text>contributors</Text>
          <Text>&nbsp;&#124;&nbsp;</Text>
          <Text
            style={{ color: 'blue' }}
            onPress={() => Linking.openURL('https://www.sla.gov.sg/')}
          >
            Singapore Land Authority
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  callout: {
    width: 250,
    maxHeight: 200, // Set a maximum height for the callout content
  },
  calloutContent: {
    flexGrow: 1,
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
    marginRight: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingTop: 3,
  },
  ownerText: {
    fontSize: 16,
    color: '#888888',
  },
  bottomImageContainer: {
    position: 'absolute',
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomImage: {
    width: 20,
    height: 20,
    marginRight: 2,
  },
  bottomText: {
    flexDirection: 'row',
    alignItems: 'center',
    color: '#888',
  },
});

export default XYZMapPage;
