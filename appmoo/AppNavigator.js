// navigation/AppNavigator.js (สร้างโฟลเดอร์ใหม่ชื่อ navigation)
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';

// Import all screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WaitingScreen from '../screens/WaitingScreen';
import SaverMenuScreen from '../screens/SaverMenuScreen';
import PremiumMenuScreen from '../screens/PremiumMenuScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isLoading, userToken, userInfo } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'large'} />
            </View>
        );
    }

    const renderUserScreens = () => {
        if (!userInfo) return null;

        if (userInfo.role === 'ADMIN') {
            return <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />;
        }
        
        switch (userInfo.tier) {
            case 'PENDING':
                return <Stack.Screen name="Waiting" component={WaitingScreen} options={{ headerLeft: null }} />;
            case 'SAVER':
                return <Stack.Screen name="SaverMenu" component={SaverMenuScreen} />;
            case 'PREMIUM':
                return <Stack.Screen name="PremiumMenu" component={PremiumMenuScreen} />;
            default:
                // Fallback to login if something is wrong
                return <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />;
        }
    };

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {userToken !== null ? (
                    renderUserScreens()
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;