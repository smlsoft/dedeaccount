import { instanceApi } from '@/services/ProviderService'

export default {
    // ดึงข้อมูลกิจการ
    getShop(shopId) {
        return instanceApi(true).get(`/shop/${shopId}`).then(res => res.data);
    },

    // แก้ไขข้อมูลกิจการ
    updateShop(shopId, data) {
        return instanceApi(true).put(`/shop/${shopId}`, data).then(res => res.data);
    }
}