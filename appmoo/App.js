import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import หน้าจอที่เราสร้างขึ้น
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// สร้างตัวจัดการ Stack Navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login" // กำหนดให้หน้า Login เป็นหน้าแรก
        screenOptions={{
          headerTitleAlign: 'center', // ทำให้ชื่อหัวข้ออยู่ตรงกลาง
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Sign In' }} // ตั้งชื่อหัวข้อของหน้า
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Sign Up' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}