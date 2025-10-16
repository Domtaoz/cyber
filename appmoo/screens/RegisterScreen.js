// screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { postQuery } from '../api/client';

const validateEmail = (email) => {
    // Regular Expression สำหรับตรวจสอบรูปแบบอีเมลพื้นฐาน
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
};

const RegisterScreen = ({ navigation }) => {
    // ✅ Changed: ลบ displayName, เพิ่ม email
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    // ✅ Changed: อัปเดต Mutation ให้ถูกต้อง
    const REGISTER_CUSTOMER_MUTATION = `
        mutation RegisterCustomer($username: String!, $email: String!, $password: String!) {
            registerCustomer(username: $username, email: $email, password: $password) {
                success
                message
                user {
                    id
                    username
                }
            }
        }
    `;

    const handleRegister = async () => {
        // ✅ Changed: ตรวจสอบ field ทั้งหมด
        if (password !== confirmPassword) {
            Alert.alert('Registration Failed', 'Passwords do not match.');
            return; // หยุดการทำงานทันที
        }
        
        if (!username || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return; // หยุดการทำงานถ้าอีเมลไม่ถูกต้อง
        }

        setLoading(true);

        try {
            // ✅ Changed: ส่งตัวแปรให้ครบ
            const result = await postQuery(REGISTER_CUSTOMER_MUTATION, {
                username,
                email,
                password,
            });

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            const response = result.data.registerCustomer;
            if (!response.success) {
                throw new Error(response.message);
            }

            console.log('Register Success:', response.user);
            Alert.alert('Registration Success', `Account for ${response.user.username} has been created!`);
            navigation.navigate('Login');

        } catch (error) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            {/* ❌ ลบช่อง Display Name */}
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            
            {/* ✅ เพิ่มช่อง Email */}
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity 
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={styles.toggleButton}
                >
                    <Text>{isPasswordVisible ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
            </View>
            
            {/* ✅ 3. สร้าง View ครอบช่อง Confirm Password */}
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!isConfirmPasswordVisible}
                />
                <TouchableOpacity 
                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    style={styles.toggleButton}
                >
                    <Text>{isConfirmPasswordVisible ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#28a745" />
                ) : (
                    <Button title="Register" onPress={handleRegister} color="#28a74as" />
                )}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.switchText}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
};

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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
    },
    toggleButton: {
        padding: 10,
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

export default RegisterScreen;