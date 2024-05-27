import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Explore from './explore.js';
import Index from './index.js';
import UploadListings from './uploadListings.js';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
          }}
        />
        <Tab.Screen
          name="uploadListings"
          component={UploadListings}
          options={{
            title: 'Upload Listings',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'duplicate' : 'duplicate-outline'} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="explore"
          component={Explore}
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
  );
}
