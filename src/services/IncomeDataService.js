import { instanceApi } from '@/services/ProviderService'

export default {


    // master รายได้
    getIncomeList(limitPage, page, search, sortField, sortOrder) {

        //console.log('Page' + page);
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        return instanceApi(true).get(`/master-income?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);
    },
    postIncome(data) {
        return instanceApi(true).post(`/master-income`, data).then(res => res.data);
    },
    getIncomeById(id) {
        return instanceApi(true).get(`/master-income/` + id).then(res => res.data);
    },
    putIncome(data, id) {
        return instanceApi(true).put(`/master-income/` + id, data).then(res => res.data);
    },
    deleteIncome(data) {
        return instanceApi(true).delete(`/master-income/` + data).then(res => res.data);
    },
    getIncome() {
        return instanceApi(true).get(`/master-income?limit=50000`).then(res => res.data);
    },

    /// รายวัน รายได้
    getIncomeDailyList(limitPage, page, search, sortField, sortOrder) {

        //console.log('Page' + page);
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        return instanceApi(true).get(`/daily-income?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);
    },


    /// getDocNo
    getDocNo() {
        return instanceApi(true).get(`/daily-income/docno`).then(res => res.data);
    }






}
