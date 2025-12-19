import axios from 'axios'
// import source from '@/store/modules/endpoint'
// import { useAuthen } from '@/stores/authen'

import { useAuthen } from "@/stores/authen.js"

const instanceApi = (authentication = true) => {


    const store = useAuthen();

    // console.log("API URL : ", process.env.VUE_APP_API);

    const http = axios.create({ baseURL: process.env.VUE_APP_API });
    http.defaults.headers.common['Content-Type'] = 'application/json';
    if (authentication) {
        http.defaults.headers.common['Authorization'] = "Bearer " + localStorage._token;

    }

    http.interceptors.response.use(
        function (response) {
            // Any status code that lie within the range of 2xx cause this function to trigger
            // Do something with response data
            return response;
        },
        error => {
            // console.log("Error In Interceptor")
            // console.log(error);
            if (!error.response) {
                return Promise.reject("Network Error");
            }
            else {
                if (error.response.status) {
                    switch (error.response.status) {
                        case 401:
                            //alert("session expired");
                            console.log("session expire")
                            store.directLogout()

                            break;
                        default:
                            return Promise.reject(error);
                    }
                }
            }
        }
    )

    return http;
}

const instanceOcrApi = () => {
    // console.log("OCR API URL : ", process.env.VUE_APP_API_OCR);

    const http = axios.create({ 
        baseURL: process.env.VUE_APP_API_OCR
    });
    http.defaults.headers.common['Content-Type'] = 'application/json';
    
    // OCR API ไม่ต้องใช้ authentication token
    // แต่ถ้าต้องการเพิ่มในอนาคต ก็เพิ่มได้ตรงนี้

    http.interceptors.response.use(
        function (response) {
            return response;
        },
        error => {
            if (!error.response) {
                return Promise.reject("Network Error");
            }
            return Promise.reject(error);
        }
    )

    return http;
}



export default {
    instanceApi,
    instanceOcrApi
}

export {
    instanceApi,
    instanceOcrApi
}
