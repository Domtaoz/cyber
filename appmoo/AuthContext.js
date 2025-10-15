// context/AuthContext.js (สร้างโฟลเดอร์ใหม่ชื่อ context)
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postQuery } from '../api/client'; // Reuse our api client

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const login = async (username, password) => {
        setIsLoading(true);
        const LOGIN_MUTATION = `
            mutation LoginUser($username: String!, $password: String!) {
                loginUser(username: $username, password: $password) {
                    success, message, user { id, displayName, username, role, tier }
                }
            }
        `;
        try {
            const result = await postQuery(LOGIN_MUTATION, { username, password });
            const response = result.data.loginUser;
            if (response.success) {
                setUserInfo(response.user);
                setUserToken('dummy-token'); // ในระบบจริงควรใช้ JWT Token
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
                // Tier มีการเปลี่ยนแปลง! อัปเดต state
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