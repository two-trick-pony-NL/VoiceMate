import React, { useEffect, useState } from 'react';
import { 
  Image, 
  StyleSheet, 
  Button, 
  View, 
  ActivityIndicator, 
  FlatList, 
  Text 
} from 'react-native';
import { useAuth } from '@/authentication/authContext';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const { logout, refreshToken, authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = authState.accessToken;
        const response = await fetch('https://triage.voicemate.nl/api/calls/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        const data = await response.json();
        setData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [authState.accessToken]);

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
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View>
                <Text>{item.caller}</Text>
              </View>
            )}
          />
        )}
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
