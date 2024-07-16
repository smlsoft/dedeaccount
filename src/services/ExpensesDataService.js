import { instanceApi } from '@/services/ProviderService'

export default {


    // ค่าใช้จ่าย
    getExpensesList(limitPage, page, search, sortField, sortOrder) {

        //console.log('Page' + page);
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        return instanceApi(true).get(`/master-expense?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);
    },
    postExpenses(data) {
        return instanceApi(true).post(`/master-expense`, data).then(res => res.data);
    },
    getExpensesById(id) {
        return instanceApi(true).get(`/master-expense/` + id).then(res => res.data);
    },
    putExpenses(data, id) {
        return instanceApi(true).put(`/master-expense/` + id, data).then(res => res.data);
    },
    deleteExpenses(data) {
        return instanceApi(true).delete(`/master-expense/` + data).then(res => res.data);
    },

    /// รายวัน ค่าใช้จ่ายอื่น ๆ
    getExpensesDailyList(limitPage, page, search, sortField, sortOrder) {

        //console.log('Page' + page);
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        return instanceApi(true).get(`/daily-expenses?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);
    },




}
