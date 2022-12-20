import { instanceApi } from '@/services/ProviderService'

export default {
    getAccountPeriod() {
        return instanceApi(true).get(`/gl/accountperiodmaster?limit=99999`).then(res => res.data);
    },
    getAccountPeriodByDate(date) {
        return instanceApi(true).get(`/gl/accountperiodmaster/bydate?date=${date}`).then(res => res.data);
    },

    postAccountPeriod(data) {
        return instanceApi(true).post(`/gl/accountperiodmaster`, data).then(res => res.data);
    },

    postAccountPeriodBulk(data) {
        return instanceApi(true).post(`gl/accountperiodmaster/bulk`, data).then(res => res.data);
    },

    puttAccountPeriod(guidfixed, data) {
        return instanceApi(true).put(`/gl/accountperiodmaster/${guidfixed}`, data).then(res => res.data);
    },

    deleteAccountPeriod(guidfixed) {
        return instanceApi(true).delete(`/gl/accountperiodmaster/` + guidfixed).then(res => res.data);
    },
    deleteAccountPeriodBulk(data) {
        return instanceApi(true).delete(`/gl/accountperiodmaster`, { data: data }).then(res => res.data);
    },
}

