import { instanceApi } from '@/services/ProviderService'
import { register } from 'numeral';

export default {
    login(username, password) {
        return instanceApi(false).post(`/login`, { "name": username, "username": username, "password": password });
    },
    getListShop() {
        return instanceApi(true).get(`/list-shop`).then(res => res.data);
    },
    selectShop() {
        return instanceApi(true).post(`/select-shop`, { "shopid": localStorage.shopid }).then(res => res.data);
    },
    register(name, username, password) {
        return instanceApi(false).post(`/register`, { "name": name, "username": username, "password": password });
    },
}

