import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { postQuery } from '../api/client';

const AdminDashboardScreen = () => {
    const [userId, setUserId] = useState('');
    
    const handleAssignTier = async (tier) => {
        if (!userId) {
            Alert.alert("Error", "Please enter a User ID.");
            return;
        }
        const ASSIGN_TIER_MUTATION = `
            mutation AssignTier($userId: Int!, $tierName: String!) {
                assignTier(userId: $userId, tierName: $tierName) { id, tier }
            }
        `;
        try {
            const result = await postQuery(ASSIGN_TIER_MUTATION, { userId: parseInt(userId), tierName: tier });
            if (result.errors) throw new Error(result.errors[0].message);
            
            Alert.alert("Success", `User ${userId} has been assigned to ${result.data.assignTier.tier} tier.`);
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Admin Dashboard</Text>
            <TextInput
                placeholder="Enter User ID to assign tier"
                value={userId}
                onChangeText={setUserId}
                keyboardType="numeric"
                style={{ borderWidth: 1, padding: 10, marginVertical: 20 }}
            />
            <Button title="Assign to SAVER" onPress={() => handleAssignTier('SAVER')} />
            <View style={{ marginVertical: 5 }} />
            <Button title="Assign to PREMIUM" onPress={() => handleAssignTier('PREMIUM')} color="green" />
            <View style={{ marginVertical: 5 }} />
            <Button title="Assign to PENDING" onPress={() => handleAssignTier('PENDING')} color="red" />
        </View>
    );
};

export default AdminDashboardScreen;