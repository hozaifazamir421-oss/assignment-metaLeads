import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { io } from 'socket.io-client';


const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

export default function HomeScreen() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to backend:', socket.id);
    });

    socket.on('new_lead', (newLead) => {
      setLeads((prevLeads) => [newLead, ...prevLeads]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leads</Text>
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.leadCard}>
            <Text style={styles.leadName}>{item.name}</Text>
            <Text style={styles.leadDetail}>{item.email}</Text>
            <Text style={styles.leadDetail}>{item.phone}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  leadCard: { backgroundColor: '#f2f2f2', padding: 14, borderRadius: 10, marginBottom: 10 },
  leadName: { fontSize: 16, fontWeight: '600' },
  leadDetail: { fontSize: 13, color: '#555' },
});