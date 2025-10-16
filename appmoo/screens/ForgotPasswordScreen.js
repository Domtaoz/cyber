// screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { postQuery } from '../api/client';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const REQUEST_RESET_MUTATION = `
        mutation RequestPasswordReset($email: String!) {
            requestPasswordReset(email: $email) {
                success
                message
            }
        }
    `;

    const handleRequestReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }
        setLoading(true);
        try {
            const result = await postQuery(REQUEST_RESET_MUTATION, { email });

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }
            
            const response = result.data.requestPasswordReset;

            // ✅ ตรวจสอบค่า success ที่ได้จาก Backend
            if (response.success) {
                Alert.alert("Check Your Email", response.message);
                navigation.navigate('VerifyToken', { email });
            } else {
                // ถ้าไม่สำเร็จ ให้แสดง Error message จาก Backend
                throw new Error(response.message);

            }

        } catch (error) {
            Alert.alert("Request Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter the email address associated with your account.</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <View style={styles.buttonContainer}>
                 {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                 ) : (
                    <Button title="Send Reset Link" onPress={handleRequestReset} />
                 )}
            </View>
        </View>
    );
};

// ... (StyleSheet)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 32,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 24,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        height: 40,
        justifyContent: 'center',
    },
});

export default ForgotPasswordScreen;