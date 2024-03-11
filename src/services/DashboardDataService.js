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
}

