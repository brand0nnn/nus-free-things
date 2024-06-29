import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { UrlTile, Marker } from 'react-native-maps';

const XYZMapPage = () => {
  const xyzUrl = 'https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png';

  // Define the initial region and boundaries
  const initialRegion = {
    latitude: 1.29692,
    longitude: 103.77332,
    latitudeDelta: 0.006,
    longitudeDelta: 0.006,
  };

  // Define boundaries for NUS
  const minLat = 1.29240;
  const maxLat = 1.31028;
  const minLng = 103.76714;
  const maxLng = 103.78619;

  // State to manage the current region
  const [region, setRegion] = useState(initialRegion);
  const [markers, setMarkers] = useState([
    { coordinate: { latitude: 1.29692, longitude: 103.77332 }, title: 'Central Library' },
  ]);

  // Update region while scrolling to enforce boundaries
  const onRegionChange = (newRegion) => {
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
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={region}
        onRegionChange={onRegionChange}
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
            title={marker.title}
          />
        ))}
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

export default XYZMapPage;
