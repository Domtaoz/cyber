import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { AuthContext } from '../AuthContext';
import { postQuery } from '../api/client';

// รายการอาหารสำหรับ Premium (มีของ Saver + ของพิเศษ)
const SAVER_ITEMS = ['หมูสามชั้น', 'สันคอหมู', 'ตับหมู', 'ผักกาดขาว', 'ผักบุ้ง', 'วุ้นเส้น', 'ไข่ไก่', 'น้ำจิ้มสุกี้'];
const PREMIUM_EXCLUSIVE_ITEMS = ['กุ้งแม่น้ำ', 'เนื้อริบอาย', 'หอยเชลล์', 'ชีส'];
const PREMIUM_MENU_ITEMS = [...SAVER_ITEMS, ...PREMIUM_EXCLUSIVE_ITEMS];

const PremiumMenuScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [order, setOrder] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateQuantity = (item, change) => {
        setOrder(prevOrder => {
            const currentQuantity = prevOrder[item] || 0;
            const newQuantity = currentQuantity + change;
            const newOrder = { ...prevOrder };

            if (newQuantity <= 0) {
                delete newOrder[item];
            } else {
                newOrder[item] = newQuantity;
            }
            return newOrder;
        });
    };

    // ✅ อัปเดต Mutation ให้คืนค่าตาม OrderType ใหม่
    const CREATE_ORDER_MUTATION = `
        mutation CreateOrder($userId: Int!, $itemNames: [String!]!) {
            createOrder(userId: $userId, itemNames: $itemNames) {
                id
                orderedAt
                items
            }
        }
    `;

    const handleSubmitOrder = async () => {
        const itemNames = Object.entries(order).map(([item, quantity]) => `${item}-${quantity}`);

        if (itemNames.length === 0) {
            Alert.alert("No Items Selected", "Please select at least one item.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await postQuery(CREATE_ORDER_MUTATION, {
                userId: userInfo.id,
                itemNames: itemNames
            });

            setOrder({});

            navigation.navigate('OrderConfirmation', { order: result.data.createOrder });

        } catch (error) {
            Alert.alert("Order Failed", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const totalItems = Object.values(order).reduce((sum, quantity) => sum + quantity, 0);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>⭐ Premium Set Menu ⭐</Text>
                <Text style={styles.welcomeText}>Welcome, {userInfo?.username}!</Text>
            </View>

            <Text style={styles.subHeader}>Please select your items:</Text>

            {PREMIUM_MENU_ITEMS.map((item, index) => {
                const quantity = order[item] || 0;
                const isExclusive = PREMIUM_EXCLUSIVE_ITEMS.includes(item);
                return (
                    <View key={index} style={styles.itemContainer}>
                        <Text style={[styles.itemText, isExclusive && styles.exclusiveItemText]}>
                            {isExclusive ? `⭐ ${item}` : item}
                        </Text>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity onPress={() => handleUpdateQuantity(item, -1)} style={styles.quantityButton}>
                                <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity onPress={() => handleUpdateQuantity(item, 1)} style={styles.quantityButton}>
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            })}

            <View style={styles.buttonContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#ff8c00" />
                ) : (
                    <Button
                        title={`Submit Order (${totalItems} items)`}
                        onPress={handleSubmitOrder}
                        disabled={totalItems === 0}
                        color="orange" // ธีมสี Premium
                    />
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fffefa' }, // พื้นหลังสี Premium
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#ff8c00' },
    welcomeText: { fontSize: 16, textAlign: 'center', color: '#666' },
    subHeader: { fontSize: 18, fontWeight: '600', margin: 20, marginBottom: 10 },
    itemContainer: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 20, marginVertical: 5, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemText: { fontSize: 16, flex: 1 },
    exclusiveItemText: { color: '#b8860b', fontWeight: 'bold' }, // Style สำหรับเมนูพิเศษ
    quantityControl: { flexDirection: 'row', alignItems: 'center' },
    quantityButton: { width: 30, height: 30, backgroundColor: '#eee', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    quantityButtonText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    quantityText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15 },
    buttonContainer: { margin: 20, marginTop: 30, marginBottom: 40 },
});

export default PremiumMenuScreen;