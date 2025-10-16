// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postQuery } from './api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const login = async (loginIdentifier, password) => {
        setIsLoading(true);
        // ✅ Changed: อัปเดต Mutation ให้ตรงกับ Backend ล่าสุด
        const LOGIN_MUTATION = `
            mutation LoginUser($loginIdentifier: String!, $password: String!) {
                loginUser(loginIdentifier: $loginIdentifier, password: $password) {
                    success
                    message
                    user {
                        id
                        username
                        role
                        tier
                    }
                }
            }
        `;
        try {
            const result = await postQuery(LOGIN_MUTATION, { loginIdentifier, password });
            const response = result.data.loginUser;

            if (response.success) {
                setUserInfo(response.user);
                setUserToken('dummy-token'); // ในระบบจริงควรใช้ JWT
                await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
                await AsyncStorage.setItem('userToken', 'dummy-token');
            } else {
                throw new Error(response.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setUserInfo(null);
        setUserToken(null);
        await AsyncStorage.removeItem('userInfo');
        await AsyncStorage.removeItem('userToken');
        setIsLoading(false);
    };

    const checkStatus = async () => {
        if (!userInfo) return;
        const CHECK_STATUS_QUERY = `query CheckStatus($userId: Int!) { checkMyStatus(userId: $userId) { id, tier } }`;
        try {
            const result = await postQuery(CHECK_STATUS_QUERY, { userId: userInfo.id });
            const freshUserInfo = result.data.checkMyStatus;
            if (freshUserInfo && freshUserInfo.tier !== userInfo.tier) {
                const updatedUserInfo = { ...userInfo, tier: freshUserInfo.tier };
                setUserInfo(updatedUserInfo);
                await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            }
        } catch (error) {
            console.error("Failed to check status:", error);
        }
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let storedUserInfo = await AsyncStorage.getItem('userInfo');
            let storedUserToken = await AsyncStorage.getItem('userToken');
            if (storedUserInfo) {
                setUserInfo(JSON.parse(storedUserInfo));
                setUserToken(storedUserToken);
            }
        } catch (e) {
            console.log(`isLoggedIn error: ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, checkStatus, isLoading, userToken, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};