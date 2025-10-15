import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const WaitingScreen = () => {
    const { checkStatus, userInfo, logout } = useContext(AuthContext);

    useEffect(() => {
        // Polling: เช็คสถานะทุก 5 วินาที
        const interval = setInterval(() => {
            console.log('Checking user status...');
            checkStatus();
        }, 5000);

        // Clear interval เมื่อ component ถูก unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <Text style={styles.title}>Hello, {userInfo?.displayName}!</Text>
            <Text style={styles.text}>Please wait for an Admin to assign your meal plan.</Text>
            <Text style={styles.text}>This screen will update automatically.</Text>
        </View>
    );
};
// ... styles