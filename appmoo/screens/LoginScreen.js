import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
// ✅ 1. Import
import { postQuery } from '../api/client';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // ✅ 2. สร้าง GraphQL Mutation string สำหรับ Login
    const LOGIN_USER_MUTATION = `
        mutation LoginUser($username: String!, $password: String!) {
            loginUser(username: $username, password: $password) {
                success
                message
                user {
                    id
                    displayName
                    username
                }
            }
        }
    `;

    // ✅ 3. เปลี่ยน handleLogin ให้เป็น async
    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter both username and password.');
            return;
        }
        setLoading(true);

        try {
            // ✅ 4. เรียก API
            const result = await postQuery(LOGIN_USER_MUTATION, { username, password });
            
            const loginResponse = result.data.loginUser;

            // ✅ 5. ตรวจสอบผลลัพธ์จาก Backend
            if (loginResponse.success) {
                Alert.alert('Login Success', `Welcome, ${loginResponse.user.displayName}!`);
                // คุณสามารถนำทางไปยังหน้าหลักของแอปได้ที่นี่
            } else {
                // แสดง message จาก Backend หาก Login ไม่สำเร็จ
                throw new Error(loginResponse.message);
            }

        } catch (error) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Username or Email"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <View style={styles.buttonContainer}>
                 {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                 ) : (
                    <Button title="Login" onPress={handleLogin} />
                 )}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.switchText}>Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
};

// ... (StyleSheet เหมือนเดิม)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        marginTop: 10,
        marginBottom: 20,
        height: 40,
        justifyContent: 'center',
    },
    switchText: {
        marginTop: 20,
        color: 'blue',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;