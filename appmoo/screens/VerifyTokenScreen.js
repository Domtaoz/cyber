// screens/VerifyTokenScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { postQuery } from '../api/client';

const VerifyTokenScreen = ({ route, navigation }) => {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const { email } = route.params; // รับ email มาจากหน้าก่อน

    const VERIFY_TOKEN_MUTATION = `
        mutation VerifyResetToken($token: String!) {
            verifyResetToken(token: $token) {
                success
                message
            }
        }
    `;

    const handleVerifyToken = async () => {
        if (token.length !== 6) {
            Alert.alert('Error', 'Please enter the 6-character code.');
            return;
        }
        setLoading(true);
        try {
            const result = await postQuery(VERIFY_TOKEN_MUTATION, { token: token.toUpperCase() });
            const response = result.data.verifyResetToken;

            if (response.success) {
                // ✅ ถ้ายืนยันสำเร็จ ไปหน้าตั้งรหัสใหม่ พร้อมส่ง token ไปด้วย
                navigation.navigate('ResetPassword', { token: token.toUpperCase() });
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            Alert.alert("Verification Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>A 6-character code was sent to {email}.</Text>
            
            <TextInput
                style={styles.input}
                placeholder="XXXXXX"
                value={token}
                onChangeText={setToken}
                autoCapitalize="characters"
                maxLength={6}
            />

            <View style={styles.buttonContainer}>
                 {loading ? <ActivityIndicator size="large" color="#007bff" /> : <Button title="Verify" onPress={handleVerifyToken} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 32 },
    input: { height: 60, fontSize: 24, textAlign: 'center', letterSpacing: 10, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 24, paddingHorizontal: 10, backgroundColor: '#fff' },
    buttonContainer: { height: 40, justifyContent: 'center' }
});

export default VerifyTokenScreen;