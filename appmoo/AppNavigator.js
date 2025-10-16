import React, { useContext } from 'react';
import { Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from './AuthContext';

// Import all screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyTokenScreen from './screens/VerifyTokenScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import WaitingScreen from './screens/WaitingScreen';
import SaverMenuScreen from './screens/SaverMenuScreen';
import PremiumMenuScreen from './screens/PremiumMenuScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import OrderConfirmationScreen from './screens/OrderConfirmationScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isLoading, userToken, userInfo, logout } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={'large'} />
            </View>
        );
    }

    const LogoutButton = () => (
        <Button onPress={logout} title="Logout" color="#ff4757" />
    );

    const renderUserScreens = () => {
        if (!userInfo) return null;

        if (userInfo.role === 'ADMIN') {
            return <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard', headerRight: () => <LogoutButton />, headerLeft: null }} />;
        }

        switch (userInfo.tier) {
            case 'PENDING':
                return <Stack.Screen name="Waiting" component={WaitingScreen} options={{ headerShown: false }} />;
            case 'SAVER':
                return (
                    <>
                        <Stack.Screen name="SaverMenu" component={SaverMenuScreen} options={{ title: 'Saver Menu', headerRight: () => <LogoutButton />, headerLeft: null }} />
                        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} options={{ title: 'Order Summary' }} />
                    </>
                );
            case 'PREMIUM':
                return (
                    <>
                        <Stack.Screen name="PremiumMenu" component={PremiumMenuScreen} options={{ title: 'Premium Menu', headerRight: () => <LogoutButton />, headerLeft: null }} />
                        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} options={{ title: 'Order Summary' }} />
                    </>
                );
            default:
                return <Stack.Screen name="Waiting" component={WaitingScreen} options={{ headerShown: false }} />;
        }
    };

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {userToken && userInfo ? (renderUserScreens()) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
                        <Stack.Screen name="VerifyToken" component={VerifyTokenScreen} options={{ title: 'Enter Code' }} />
                        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Set New Password' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;