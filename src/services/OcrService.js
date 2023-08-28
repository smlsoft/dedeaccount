import { instanceApi } from '@/services/ProviderService'

export default {

    postOCR(data) {
        return instanceApi(true).post(`/ocr/upload`, data).then(res => res.data);
    },

    getOCR(data) {
        return instanceApi(true).post(`/ocr/result`, data).then(res => res.data);
    }

}