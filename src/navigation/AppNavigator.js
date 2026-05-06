import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';

import AuthScreen from '../screens/AuthScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import PostListingScreen from '../screens/PostListingScreen';
import PostSeekerScreen from '../screens/PostSeekerScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import MessagesScreen from '../screens/MessagesScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0A0A0F' },
  animation: 'slide_from_right',
};

export default function AppNavigator() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading state while checking auth
  if (session === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#FF6B35" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!session ? (
          // Auth flow
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          // App flow
          <>
            <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
            <Stack.Screen name="PostListing" component={PostListingScreen} />
            <Stack.Screen name="PostSeeker" component={PostSeekerScreen} />
            <Stack.Screen
              name="ListingDetail"
              component={ListingDetailScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="Messages" component={MessagesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
