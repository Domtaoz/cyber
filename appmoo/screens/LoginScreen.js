// screens/LoginScreen.js
import React, { useState, useContext } from 'react'; // ✅ Import useContext
import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AuthContext, PasswordExpiredError } from '../AuthContext';
import { postQuery } from '../api/client';

const LoginScreen = ({ navigation }) => {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const { login } = useContext(AuthContext);

    const handleForceResetPassword = async (email) => {
        setLoading(true);
        try {
            const REQUEST_RESET_MUTATION = `
                mutation RequestPasswordReset($email: String!) {
                    requestPasswordReset(email: $email) { success, message }
                }
            `;
            
            await postQuery(REQUEST_RESET_MUTATION, { email });
            
            Alert.alert(
                "Reset Code Sent",
                "A password reset code has been sent to your email. Please check your inbox."
            );
            navigation.navigate('VerifyToken', { email });

        } catch (apiError) {
            Alert.alert('Error', 'Could not start the password reset process. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!loginIdentifier || !password) {
            Alert.alert('Error', 'Please enter both username/email and password.');
            return;
        }
        setLoading(true);
        try {
            await login(loginIdentifier, password);
        } catch (error) {
            if (error instanceof PasswordExpiredError) {
                Alert.alert(
                    'Password Expired',
                    'Your password has expired. You must reset it now to continue.',
                    [
                        {
                            text: 'Reset Password',
                            onPress: () => handleForceResetPassword(error.user.email),
                        },
                    ]
                );
            } else {
                Alert.alert('Login Failed', error.message);
            }
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
                value={loginIdentifier}
                onChangeText={setLoginIdentifier}
                autoCapitalize="none"
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

            <View style={styles.buttonContainer}>
                 {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                 ) : (
                    <Button title="Login" onPress={handleLogin} />
                 )}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.switchText}>Don't have an account? Register</Text>
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
    forgotPasswordText: {
        marginTop: 15,
        color: '#555',
        textAlign: 'center',
    },
});

export default LoginScreen;