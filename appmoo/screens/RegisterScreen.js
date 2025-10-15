import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
// ✅ 1. Import ฟังก์ชันสำหรับเรียก API
import { postQuery } from '../api/client';

const RegisterScreen = ({ navigation }) => {
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // State สำหรับ loading indicator

    // ✅ 2. สร้าง GraphQL Mutation string
    const ADD_USER_MUTATION = `
        mutation AddUser($displayName: String!, $username: String!, $password: String!) {
            addUser(displayName: $displayName, username: $username, password: $password) {
                id
                username
                displayName
            }
        }
    `;

    // ✅ 3. เปลี่ยน handleRegister ให้เป็น async function
    const handleRegister = async () => {
        if (!displayName || !username || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        setLoading(true); // เริ่ม loading

        try {
            // ✅ 4. เรียก API
            const result = await postQuery(ADD_USER_MUTATION, {
                displayName,
                username,
                password,
            });

            // ตรวจสอบ error จาก GraphQL
            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            console.log('Register Success:', result.data);
            Alert.alert('Registration Success', `Account for ${result.data.addUser.username} has been created!`);
            navigation.navigate('Login');

        } catch (error) {
            // ✅ 5. แสดงข้อผิดพลาด
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false); // หยุด loading
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <TextInput
                style={styles.input}
                placeholder="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
            />
            
            <TextInput
                style={styles.input}
                placeholder="Username (Email)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                keyboardType="email-address"
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
                    <ActivityIndicator size="large" color="#28a745" />
                ) : (
                    <Button title="Register" onPress={handleRegister} color="#28a745" />
                )}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.switchText}>Already have an account? Login</Text>
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
        height: 40, // เพิ่มความสูงเพื่อให้ ActivityIndicator แสดงผลได้ดี
        justifyContent: 'center',
    },
    switchText: {
        marginTop: 20,
        color: 'blue',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

export default RegisterScreen;