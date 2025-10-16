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

// รายการอาหารสำหรับ Premium Set (มีของ Saver + ของพิเศษ)
const PREMIUM_MENU_ITEMS = [
    // --- Saver Items ---
    'หมูสามชั้น',
    'สันคอหมู',
    'ตับหมู',
    'ผักกาดขาว',
    'ผักบุ้ง',
    'วุ้นเส้น',
    'ไข่ไก่',
    'น้ำจิ้มสุกี้',
    // --- Premium Exclusive Items ---
    'กุ้งแม่น้ำ',
    'เนื้อริบอาย',
    'หอยเชลล์',
    'ชีส',
];

const PremiumMenuScreen = () => {
    const { userInfo, logout } = useContext(AuthContext);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectItem = (item) => {
        if (selectedItems.includes(item)) {
            setSelectedItems(prevItems => prevItems.filter(i => i !== item));
        } else {
            setSelectedItems(prevItems => [...prevItems, item]);
        }
    };
    
    const CREATE_ORDER_MUTATION = `
        mutation CreateOrder($userId: Int!, $itemNames: [String!]!) {
            createOrder(userId: $userId, itemNames: $itemNames) {
                id
                items
            }
        }
    `;

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
                `Your premium order for ${selectedItems.join(', ')} has been placed.`
            );
            setSelectedItems([]);
            
        } catch (error) {
            Alert.alert("Order Failed", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>⭐ Premium Set Menu ⭐</Text>
                <Text style={styles.welcomeText}>Welcome, {userInfo?.displayName}!</Text>
            </View>

            <Text style={styles.subHeader}>Please select your items:</Text>

            {PREMIUM_MENU_ITEMS.map((item, index) => {
                // เช็คว่าเป็นเมนูพิเศษหรือไม่
                const isExclusive = !['หมูสามชั้น', 'สันคอหมู', 'ตับหมู', 'ผักกาดขาว', 'ผักบุ้ง', 'วุ้นเส้น', 'ไข่ไก่', 'น้ำจิ้มสุกี้'].includes(item);
                return (
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
                                selectedItems.includes(item) && styles.itemTextSelected,
                                isExclusive && styles.exclusiveItemText // เพิ่ม style สำหรับเมนูพิเศษ
                            ]}
                        >
                            {isExclusive ? `⭐ ${item}` : item}
                        </Text>
                    </TouchableOpacity>
                );
            })}

            <View style={styles.buttonContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#ffd700" />
                ) : (
                     <Button 
                        title={`Submit Order (${selectedItems.length} items)`}
                        onPress={handleSubmitOrder}
                        disabled={selectedItems.length === 0}
                        color="#ff8c00" // สีปุ่มพรีเมียม
                    />
                )}
            </View>

            <View style={styles.logoutButton}>
                <Button title="Logout" onPress={logout} color="#888" />
            </View>
        </ScrollView>
    );
};

// ... โค้ด Stylesheet (มีการเพิ่ม style เล็กน้อย) ...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffefa', // พื้นหลังสีพรีเมียม
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
        color: '#ff8c00', // สีตัวอักษรพรีเมียม
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
        borderColor: '#ff8c00',
        backgroundColor: '#fffaf0',
    },
    itemText: {
        fontSize: 16,
    },
    itemTextSelected: {
        fontWeight: 'bold',
    },
    exclusiveItemText: { // Style สำหรับเมนูพิเศษ
        color: '#b8860b',
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

export default PremiumMenuScreen;