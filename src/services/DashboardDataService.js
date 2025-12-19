import { instanceApi } from '@/services/ProviderService'

export default {
    getGLJournalList() {
        return instanceApi(true).get(`/gl/journal`).then(res => res.data);
    },
    getAccountChart() {
        return instanceApi(true).get(`/gl/chartofaccount`).then(res => res.data);
    },
    getDocumentImageGroup() {
        return instanceApi(true).get(`/documentimagegroup`).then(res => res.data);
    },
    getUserShop() {
        return instanceApi(true).get(`/shop/users`).then(res => res.data);
    },
    
    // Dashboard specific APIs - get all data for statistics
    getGLJournalListForDashboard() {
        return instanceApi(true).get(`/gl/journal?limit=9999`).then(res => res.data);
    },
    getDocumentImageGroupForDashboard() {
        return instanceApi(true).get(`/documentimagegroup?limit=9999`).then(res => res.data);
    },
}

