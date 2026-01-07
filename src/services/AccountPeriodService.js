import { instanceApi } from '@/services/ProviderService'

export default {


    getAccountPeriod(limitPage, page, search, sortField, sortOrder) {
        //console.log('Page' + page);
        const params = new URLSearchParams();
        
        // เพิ่มพารามิเตอร์เฉพาะเมื่อมีค่า
        if (limitPage !== undefined && limitPage !== null) {
            params.append('limit', limitPage);
        }
        if (page !== undefined && page !== null) {
            params.append('page', page);
        }
        if (search && search !== "" && search !== undefined && search !== null) {
            params.append('q', search);
        }
        if (sortField !== undefined && sortField !== null && sortOrder !== undefined && sortOrder !== null) {
            params.append('sort', `${sortField}:${sortOrder}`);
        }
        
        const queryString = params.toString();
        const url = `/gl/accountperiodmaster${queryString ? '?' + queryString : ''}`;
        console.log(url);
        return instanceApi(true).get(url).then(res => res.data);
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

