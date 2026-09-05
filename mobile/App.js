import {StatusBar, SafeAreaView} from 'react-native';
import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {styles} from './src/Theme';
import AppNavigator from './src/Navigation';
import 'react-native-gesture-handler';
import {Colors} from './src/Theme/Colors';
import {AuthProvider} from './src/api/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {retry: 1, staleTime: 30_000},
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaView style={styles.flex}>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.White} />
          <AppNavigator />
        </SafeAreaView>
      </AuthProvider>
    </QueryClientProvider>
  );
}
