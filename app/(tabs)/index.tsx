import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

type RootDrawerParamList = {
  tabs: undefined;
};

type NavigationProp = DrawerNavigationProp<RootDrawerParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleDrawerOpen = () => {
    navigation.openDrawer();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleDrawerOpen}
        >
          <Feather name="menu" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="droplet" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Good Morning</Text>
        <Text style={styles.subtext}>It's day 2 of 3</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBarFill} />
        </View>
        <View style={styles.weekLabels}>
          <Text style={styles.weekText}>Sa</Text>
          <Text style={styles.weekText}>Su</Text>
          <Text style={styles.weekText}>Mo</Text>
        </View>
      </View>

      <View style={styles.intentionContainer}>
        <Text style={styles.subtext}>Today I will...</Text>
        <Text style={styles.intentionText}>set your intention here</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.peopleContainer}>
        <Text style={styles.peopleCount}>533,784</Text>
        <Text style={styles.peopleSubtext}>people here today. 18,104 right now.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  subtext: {
    color: '#aaaaaa',
    fontSize: 16,
    marginTop: 5,
  },
  progressContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '80%',
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '60%',
    height: 8,
    backgroundColor: 'green',
  },
  weekLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 10,
  },
  weekText: {
    color: '#999999',
  },
  intentionContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  intentionText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 30,
    marginHorizontal: 20,
  },
  peopleContainer: {
    alignItems: 'center',
  },
  peopleCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  peopleSubtext: {
    color: '#999999',
    fontSize: 14,
    marginTop: 8,
  },
});