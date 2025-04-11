

import { instanceApi } from '@/services/ProviderService'
import axios from 'axios';

// สร้าง Axios instance สำหรับ local development
const localInstance = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ตั้งค่าสำหรับเลือกว่าจะใช้ local หรือ production
const USE_LOCAL_API = true; // ตั้งค่าเป็น true เพื่อทดสอบกับ localhost


// export default {

//     pdfReader(file, bank, password) {
//         // let fd = new FormData()
//         // fd.append('file', file)
//         return instanceApi(true).post(`/bankstatementreader/?bank=${bank}&password=${password}`, file).then(res => res.data);
//     },

// }


export default {
    pdfReader(file, bank, password) {
        // กำหนด URL สำหรับ endpoint
        const url = `/bankstatementreader/?bank=${bank}&password=${password}`;

        // เลือกใช้ instance ตามการตั้งค่า
        if (USE_LOCAL_API) {
            return localInstance.post(url, file)
                .then(res => res.data)
                .catch(error => {
                    console.error('Error calling local API:', error);
                    throw error;
                });
        } else {
            return instanceApi(true).post(url, file)
                .then(res => res.data);
        }
    },

};

