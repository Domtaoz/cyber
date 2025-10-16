// screens/ResetPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { postQuery } from '../api/client';

const ResetPasswordScreen = ({ route, navigation }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { token } = route.params; // รับ token มาจากหน้าก่อน

    const RESET_PASSWORD_MUTATION = `
        mutation ResetPassword($token: String!, $newPassword: String!) {
            resetPassword(token: $token, newPassword: $newPassword) {
                success
                message
            }
        }
    `;

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        if (!password) {
            Alert.alert('Error', 'Please enter a new password.');
            return;
        }
        setLoading(true);
        try {
            const result = await postQuery(RESET_PASSWORD_MUTATION, { token, newPassword: password });
            const response = result.data.resetPassword;

            if (response.success) {
                Alert.alert("Success!", "Your password has been reset. Please log in.");
                navigation.navigate('Login');
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            Alert.alert("Reset Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Set New Password</Text>
            
            <View style={styles.passwordContainer}>
                <TextInput style={styles.passwordInput} placeholder="New Password" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.toggleButton}><Text>{isPasswordVisible ? 'Hide' : 'Show'}</Text></TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
                <TextInput style={styles.passwordInput} placeholder="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!isConfirmPasswordVisible} />
                <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.toggleButton}><Text>{isConfirmPasswordVisible ? 'Hide' : 'Show'}</Text></TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                {loading ? <ActivityIndicator size="large" color="#28a745" /> : <Button title="Reset Password" onPress={handleResetPassword} color="#28a745" />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 16, backgroundColor: '#fff' },
    passwordInput: { flex: 1, height: 50, paddingHorizontal: 10 },
    toggleButton: { padding: 10 },
    buttonContainer: { marginTop: 20, height: 40, justifyContent: 'center' }
});

export default ResetPasswordScreen;