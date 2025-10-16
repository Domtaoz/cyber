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

// รายการอาหารสำหรับ Saver Set
const SAVER_MENU_ITEMS = [
    'หมูสามชั้น',
    'สันคอหมู',
    'ตับหมู',
    'ผักกาดขาว',
    'ผักบุ้ง',
    'วุ้นเส้น',
    'ไข่ไก่',
    'น้ำจิ้มสุกี้',
];

const SaverMenuScreen = () => {
    const { userInfo, logout } = useContext(AuthContext);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ฟังก์ชันสำหรับเลือก/ยกเลิกอาหาร
    const handleSelectItem = (item) => {
        if (selectedItems.includes(item)) {
            // ถ้ามีอยู่แล้ว ให้เอาออก
            setSelectedItems(prevItems => prevItems.filter(i => i !== item));
        } else {
            // ถ้ายังไม่มี ให้เพิ่มเข้าไป
            setSelectedItems(prevItems => [...prevItems, item]);
        }
    };
    
    // GraphQL Mutation สำหรับสร้าง Order
    const CREATE_ORDER_MUTATION = `
        mutation CreateOrder($userId: Int!, $itemNames: [String!]!) {
            createOrder(userId: $userId, itemNames: $itemNames) {
                id
                items
            }
        }
    `;

    // ฟังก์ชันสำหรับส่ง Order
    const handleSubmitOrder = async () => {
        if (selectedItems.length === 0) {
            Alert.alert("No Items Selected", "Please select at least one item to order.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await postQuery(CREATE_ORDER_MUTATION, {
                userId: userInfo.id,
                itemNames: selectedItems
            });
            
            if (result.errors) {
                throw new Error(result.errors[0].message);
            }
            
            Alert.alert(
                "Order Submitted!", 
                `Your order for ${selectedItems.join(', ')} has been placed.`
            );
            setSelectedItems([]); // เคลียร์รายการที่เลือกหลังสั่งสำเร็จ
            
        } catch (error) {
            Alert.alert("Order Failed", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Saver Set Menu 🥩</Text>
                <Text style={styles.welcomeText}>Welcome, {userInfo?.username}!</Text>
            </View>

            <Text style={styles.subHeader}>Please select your items:</Text>

            {SAVER_MENU_ITEMS.map((item, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={[
                        styles.itemContainer, 
                        selectedItems.includes(item) && styles.itemSelected
                    ]} 
                    onPress={() => handleSelectItem(item)}
                >
                    <Text 
                        style={[
                            styles.itemText,
                            selectedItems.includes(item) && styles.itemTextSelected
                        ]}
                    >
                        {item}
                    </Text>
                </TouchableOpacity>
            ))}

            <View style={styles.buttonContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#ff6347" />
                ) : (
                     <Button 
                        title={`Submit Order (${selectedItems.length} items)`}
                        onPress={handleSubmitOrder}
                        disabled={selectedItems.length === 0}
                        color="#ff6347"
                    />
                )}
            </View>

            <View style={styles.logoutButton}>
                <Button title="Logout" onPress={logout} color="#888" />
            </View>
        </ScrollView>
    );
};

// ... โค้ด Stylesheet อยู่ด้านล่าง ...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
    },
    subHeader: {
        fontSize: 18,
        fontWeight: '600',
        margin: 20,
        marginBottom: 10,
    },
    itemContainer: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginVertical: 5,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#eee',
    },
    itemSelected: {
        borderColor: '#ff6347',
        backgroundColor: '#fff5f2',
    },
    itemText: {
        fontSize: 16,
    },
    itemTextSelected: {
        fontWeight: 'bold',
    },
    buttonContainer: {
        margin: 20,
        marginTop: 30,
    },
    logoutButton: {
        marginHorizontal: 20,
        marginBottom: 40,
    }
});

export default SaverMenuScreen;