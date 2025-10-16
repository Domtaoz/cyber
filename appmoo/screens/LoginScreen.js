// screens/LoginScreen.js
import React, { useState, useContext } from 'react'; // ✅ Import useContext
import { View, Text, TextInput, StyleSheet, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../AuthContext'; // ✅ Import AuthContext

const LoginScreen = ({ navigation }) => {
    // ✅ Changed: เปลี่ยนชื่อ state เพื่อความชัดเจน
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // ✅ Changed: ดึงฟังก์ชัน login มาจาก Context
    const { login } = useContext(AuthContext);

    // ✅ Changed: ทำให้ handleLogin เรียกใช้ฟังก์ชันจาก Context
    const handleLogin = async () => {
        if (!loginIdentifier || !password) {
            Alert.alert('Error', 'Please enter both username/email and password.');
            return;
        }
        setLoading(true);
        try {
            await login(loginIdentifier, password);
            // การนำทางจะเกิดขึ้นอัตโนมัติโดย AppNavigator
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
                value={loginIdentifier}
                onChangeText={setLoginIdentifier} // ✅ Changed
                autoCapitalize="none"
            />
            
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    // ✅ 3. ทำให้การซ่อน/แสดงผลขึ้นอยู่กับ State
                    secureTextEntry={!isPasswordVisible} 
                />
                <TouchableOpacity 
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={styles.toggleButton}
                >
                    {/* ✅ 4. เปลี่ยนข้อความตาม State */}
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    // Style สำหรับ TextInput รหัสผ่าน (เอาเส้นขอบออก)
    passwordInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
    },
    // Style สำหรับปุ่ม Show/Hide
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