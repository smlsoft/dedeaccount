import { instanceApi, instanceOcrApi } from '@/services/ProviderService'

export default {

    postOCR(data) {
        return instanceApi(true).post(`/ocr/upload`, data).then(res => res.data);
    },

    getOCR(data) {
        return instanceApi(true).post(`/ocr/result`, data).then(res => res.data);
    },

    // AI OCR Analysis
    analyzeReceipt(data) {
        console.log('OCR API URL:', process.env.VUE_APP_API_OCR);
        return instanceOcrApi().post('/api/v1/analyze-receipt', data).then(res => res.data);
    },

    // Test Template
    testTemplate(formData) {
        console.log('OCR API URL:', process.env.VUE_APP_API_OCR);
        return instanceOcrApi().post('/api/v1/test-template', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => res.data);
    }

}