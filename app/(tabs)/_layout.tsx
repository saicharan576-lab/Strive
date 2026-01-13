import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8A2BE2',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          // FIX 1: Make the bar taller on Android (was 60, now 70)
          height: Platform.OS === 'ios' ? 90 : 60, 
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10, // Give icons some breathing room at the top
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        }
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons name="compass-outline" size={28} color={color} />,
        }}
      />

      {/* THE BIG BUTTON FIX */}
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            // Position absolutely so it doesn't shift or cover adjacent icons
            <View style={{
              position: 'absolute',
              alignSelf: 'center',
              bottom: Platform.OS === 'ios' ? 18 : 6,
              height: 62,
              width: 62,
              backgroundColor: '#8A2BE2',
              borderRadius: 31,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 5 },
              elevation: 6,
              zIndex: 10,
            }}>
              <Ionicons name="add" size={36} color="white" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />

    </Tabs>
  );
}