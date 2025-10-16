// screens/OrderConfirmationScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button, FlatList, SafeAreaView } from 'react-native';

const OrderConfirmationScreen = ({ route, navigation }) => {
    // รับข้อมูล order ที่ส่งมาจากหน้าก่อนหน้า
    const { order } = route.params;

    // แปลงรูปแบบ items เช่น "ตับหมู-3" ให้สวยงาม
    const renderOrderItem = ({ item }) => {
        const parts = item.split('-');
        const name = parts[0];
        const quantity = parts.length > 1 ? parts[1] : '1';

        return (
            <View style={styles.itemContainer}>
                <Text style={styles.itemName}>{name}</Text>
                <Text style={styles.itemQuantity}>x {quantity}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Order Submitted!</Text>
                <Text style={styles.subtitle}>Here is a summary of your latest order.</Text>
            </View>

            <FlatList
                data={order.items}
                renderItem={renderOrderItem}
                keyExtractor={(item, index) => `${item}-${index}`}
                contentContainerStyle={styles.listContainer}
            />

            <View style={styles.buttonContainer}>
                <Button
                    title="Back to Menu"
                    onPress={() => navigation.goBack()} // กดแล้วกลับไปหน้าเมนูก่อนหน้า
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#28a745',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginTop: 8,
    },
    listContainer: {
        padding: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
    },
    itemName: {
        fontSize: 18,
    },
    itemQuantity: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#fff',
    },
});

export default OrderConfirmationScreen;