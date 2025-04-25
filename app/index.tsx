import { Redirect } from 'expo-router';

export default function Index() {
  // Directly redirect to the home tab
  return <Redirect href="/(tabs)" />;
} 