import axios from 'axios';

// ❗️❗️❗️ สำคัญมาก ❗️❗️❗️
// ให้เปลี่ยน 'YOUR_COMPUTER_IP' เป็น IP Address ที่ได้จากขั้นตอนที่ 1
const API_URL = 'http://192.168.10.123:8000/graphql'; 

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ฟังก์ชันสำหรับส่ง GraphQL request โดยเฉพาะ
export const postQuery = async (query, variables = {}) => {
    try {
        const response = await apiClient.post('', {
            query,
            variables,
        });
        // GraphQL ส่งข้อมูลกลับมาใน key `data` เสมอ
        return response.data;
    } catch (error) {
        // จัดการ error ที่ซับซ้อนขึ้น
        if (error.response) {
            // Server ตอบกลับมาพร้อม error status (e.g., 4xx, 5xx)
            console.error('API Error Response:', error.response.data);
            throw new Error(error.response.data.errors?.[0]?.message || 'An unknown error occurred');
        } else if (error.request) {
            // Request ถูกส่งไป แต่ไม่ได้รับการตอบกลับ (เช่น ปัญหา network)
            console.error('API No Response:', error.request);
            throw new Error('Cannot connect to the server. Please check your network.');
        } else {
            // Error อื่นๆ
            console.error('Error:', error.message);
            throw error;
        }
    }
};