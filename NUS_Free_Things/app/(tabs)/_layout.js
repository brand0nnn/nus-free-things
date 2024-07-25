import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Explore from './explore.js';
import Index from './index.js';
import { Profiles } from './profile.js';
import { MapScreen } from './OneMap.js';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  initalRouteName = "layout";
  return (
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}>
        <Tab.Screen
          name="index"
          component={Index}
          options={{
            title: 'Listings',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} />
            ),
            tabBarLabel:() => {return null},
          }}
        />
        <Tab.Screen
          name="mapScreen"
          component={MapScreen}
          options={{
            title: 'mapscreen',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'map' : 'map-outline'} color={color} />
            ),
            tabBarLabel:() => {return null},
          }}
        />
        <Tab.Screen
          name="profile"
          component={Profiles}
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
            ),
            tabBarLabel:() => {return null},
          }}
        />
      </Tab.Navigator>
  );
}
