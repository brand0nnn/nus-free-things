import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';

const OneMapXYZMap = () => {
  const [tileUrl, setTileUrl] = useState(null);

  // Function to fetch OneMap XYZ tile URL
  useEffect(() => {
    const fetchTileUrl = async () => {
      try {
        //const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNzViNzJkNTRjYTQ2YjVkZGUyODQ5YThkZjZmYjljNCIsImlzcyI6Imh0dHA6Ly9pbnRlcm5hbC1hbGItb20tcHJkZXppdC1pdC0xMjIzNjk4OTkyLmFwLXNvdXRoZWFzdC0xLmVsYi5hbWF6b25hd3MuY29tL2FwaS92Mi91c2VyL3Bhc3N3b3JkIiwiaWF0IjoxNzE5NTcxMTkyLCJleHAiOjE3MTk4MzAzOTIsIm5iZiI6MTcxOTU3MTE5MiwianRpIjoic1JTTWpYcDlkRmtGdU9JayIsInVzZXJfaWQiOjM5NjEsImZvcmV2ZXIiOmZhbHNlfQ.AdA8cQS71PHvvh9KvWiaQ3AR9alkFRlQG_znTkjcuD4'; // Replace with your token
        //const url = `https://www.onemap.gov.sg/maps/arcgis/rest/services/BASEMAP/MapServer/tile/{z}/{y}/{x}?token=${token}`;
        const url = 'https://www.onemap.gov.sg/minimap/minimap.html?mapStyle=Night&zoomLevel=15'
        setTileUrl(url);
      } catch (error) {
        console.error('Error fetching tile URL:', error);
      }
    };

    fetchTileUrl();
  }, []);

  /*if (!tileUrl) {
    return null; // Or loading indicator while fetching
  }*/

  return (
    <View style={styles.container}>
      <MapView
        style={styles.container}
        initialRegion={{
          latitude: 200.28676, // Default starting point latitude
          longitude: 200.8535, // Default starting point longitude
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Use UrlTile to fetch and display OneMap XYZ tiles */}
        <UrlTile
          urlTemplate={tileUrl} // Provide the fetched tile URL
          maximumZ={19} // Maximum zoom level
        />
      </MapView>
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
});

export default OneMapXYZMap;
