import { instanceApi } from '@/services/ProviderService'

export default {


    getAccountPeriod(limitPage, page, search, sortField, sortOrder) {
        //console.log('Page' + page);
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        console.log(`/gl/accountperiodmaster?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`);
        return instanceApi(true).get(`/gl/accountperiodmaster?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);
    },


    getAccountPeriodByDate(date) {
        return instanceApi(true).get(`/gl/accountperiodmaster/by-date?date-list=${date}`).then(res => res.data);
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

