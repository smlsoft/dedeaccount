import { instanceApi } from '@/services/ProviderService'

export default {
    getUserShop() {
        return instanceApi(true).get(`/shop/users`).then(res => res.data);
    },
    postUserShop(data) {
        return instanceApi(true).put(`/shop/permission`, data).then(res => res.data);
    },
    deleteUserShop(username) {
        return instanceApi(true).delete(`/shop/permission/` + username).then(res => res.data);
    },
}

