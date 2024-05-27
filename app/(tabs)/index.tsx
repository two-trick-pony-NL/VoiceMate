import React, { useEffect, useState } from 'react';
import { 
  Image, 
  StyleSheet, 
  Button, 
  View, 
  ActivityIndicator, 
  FlatList, 
  Text,
  RefreshControl
} from 'react-native';
import { useAuth, useAxiosInstance } from '@/authentication/authContext';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const { logout, refreshToken, authState } = useAuth();
  const axiosInstance = useAxiosInstance(); // Get the Axios instance
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state

  const fetchData = async () => {
    console.log("Refreshing data")
    try {
      const token = authState.accessToken;
      const response = await axiosInstance.get('https://triage.voicemate.nl/api/calls/', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      setData(response.data);
      setLoading(false);
      setRefreshing(false); // Set refreshing to false after data fetch
    } catch (error) {
      //console.error('Error fetching data:', error);
      setLoading(false);
      setRefreshing(false); // Set refreshing to false on error
    }
  };

  useEffect(() => {
    fetchData();
  }, [authState.accessToken, axiosInstance]); // Add axiosInstance to dependency array

  const onRefresh = () => {
    setRefreshing(true); // Set refreshing to true when pull-to-refresh starts
    fetchData(); // Fetch data again
  };

  return (
    <View>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
        
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <Button title="Logout" onPress={logout} />
        <Button title="RefreshAuthToken" onPress={refreshToken} />
        <ThemedText>
          <ThemedText type="subtitle">Fetching Data{' '}</ThemedText>
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View>
              <Text>{item.caller}</Text>
            </View>
          )}
          refreshControl={ // Add refreshControl prop to FlatList
            <RefreshControl
              refreshing={refreshing} // Set refreshing state
              onRefresh={onRefresh} // Function to call when refreshing
            />
          }
        />
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 100,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
