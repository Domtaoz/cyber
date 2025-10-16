import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { AuthContext } from '../AuthContext';

const WaitingScreen = () => {
    const { checkStatus, userInfo, logout } = useContext(AuthContext);

    useEffect(() => {
        const interval = setInterval(() => {
            checkStatus();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007bff" />
            
            <Text style={styles.title}>Hello, {userInfo?.username}!</Text>
            
            <Text style={styles.text}>Please wait for an Admin to assign your meal plan.</Text>
            <Text style={styles.text}>This screen will update automatically.</Text>
            
            <View style={styles.logoutButton}>
                <Button title="Logout" onPress={logout} color="#888" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
    },
    logoutButton: {
        marginTop: 40,
        width: '60%',
    }
});

export default WaitingScreen;