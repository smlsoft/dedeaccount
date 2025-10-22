import { instanceApi } from '@/services/ProviderService'
import { data } from 'jquery';

export default {
    getAccountChart(accountcode) {
        var filtteraccount = "";
        if (accountcode != "") {
            filtteraccount = `&accountcode=${accountcode}`;
        }
        // console.log(`/gl/chartofaccount?limit=50000${filtteraccount}`);
        return instanceApi(true).get(`/gl/chartofaccount?limit=50000${filtteraccount}`).then(res => res.data);
    }
    , getdailyreport(accountgroup, startdate, enddate, limitPage, page, search, sortField, sortOrder) {
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        return instanceApi(true).get(`/gl/journal?accountgroup=${accountgroup}&startdate=${startdate}&enddate=${enddate}&limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);
    },

    getAccountGroup() {
        return instanceApi(true).get(`/gl/accountgroup?limit=50000`).then(res => res.data);
    },
    getAccountGroupwithady(accountgroup, startdate, enddate) {
        return instanceApi(true).get(`/gl/journal?accountgroup=${accountgroup}&startdate=${startdate}&enddate=${enddate}`).then(res => res.data);
    },
    getJournalBook() {
        return instanceApi(true).get(`/gl/journalbook?limit=50000`).then(res => res.data);
    },
    // ข้อมูลรายวัน
    postGLJournal(data) {
        return instanceApi(true).post(`/gl/journal`, data).then(res => res.data);
    },

    ImportGLJournal(data) {
        return instanceApi(true).post(`/gl/journal/bulk`, data).then(res => res.data);
    },
    getGLJournalList(limitPage, page, filtersByDocNo, filtersByDocDate, filtersByAccYear, filtersByAccPeriod, filtersByDescription, filtersByAmount, sendFiltersByCreateDate, filtersByCreateBy, sortField, sortOrder) {
        //console.log('Page' + page);
        var docno = "";
        var docdate = "";
        var accountyear = "";
        var accountperiod = "";
        var description = "";
        var amount = "";
        var createdate = "";
        var createdby = "";

        if (filtersByDocNo != "" && filtersByDocNo != undefined && filtersByDocNo != null) {
            docno = "&docno=" + filtersByDocNo
        }
        if (filtersByDocDate != "" && filtersByDocDate != undefined && filtersByDocDate != null) {
            docdate = "&docdate=" + filtersByDocDate
        }

        if (filtersByAccYear != "" && filtersByAccYear != undefined && filtersByAccYear != null) {
            accountyear = "&accountyear=" + filtersByAccYear
        }

        if (filtersByAccPeriod != "" && filtersByAccPeriod != undefined && filtersByAccPeriod != null) {
            accountperiod = "&accountperiod=" + filtersByAccPeriod
        }

        if (filtersByDescription != "" && filtersByDescription != undefined && filtersByDescription != null) {
            description = "&accountdescription=" + filtersByDescription
        }

        if (filtersByAmount != "" && filtersByAmount != undefined && filtersByAmount != null) {
            amount = "&amount=" + filtersByAmount
        }

        if (sendFiltersByCreateDate != "" && sendFiltersByCreateDate != undefined && sendFiltersByCreateDate != null) {
            createdate = "&createdat=" + sendFiltersByCreateDate
        }

        if (filtersByCreateBy != "" && filtersByCreateBy != undefined && filtersByCreateBy != null) {
            createdby = "&createdby=" + filtersByCreateBy
        }

        console.log(`/gl/journal?limit=${limitPage}&page=${page}${docno}${docdate}${accountyear}${accountperiod}${description}${amount}${createdate}${createdby}&sort=${sortField}:${sortOrder}`);
        return instanceApi(true).get(`/gl/journal?limit=${limitPage}&page=${page}${docno}${docdate}${accountyear}${accountperiod}${description}${amount}${createdate}${createdby}&sort=${sortField}:${sortOrder}`).then(res => res.data);
    },

    getGLJournalListByDocref(data) {
        return instanceApi(true).get(`/gl/journal/docref/` + data).then(res => res.data);
    },
    deleteGLJournal(data) {
        return instanceApi(true).delete(`/gl/journal/` + data).then(res => res.data);
    },
    deleteGLJournalBatchId(data) {
        return instanceApi(true).delete(`/gl/journal/batchid/` + data).then(res => res.data);
    },
    getGLDetail(id) {
        return instanceApi(true).get(`/gl/journal/${id}`).then(res => res.data);
    },

    getGLledger(data) {
        return instanceApi(true).get(`/gl/journal/docno/${data}`).then(res => res.data);
    },



    putGLJournal(data, id) {
        return instanceApi(true).put(`/gl/journal/${id}`, data).then(res => res.data);
    },
    updateDocRef(data) {
        return instanceApi(true).put(`/documentimage/${data.guidfixed}`, data).then(res => res.data);
    },

    importImages(file, onUploadProgress) {
        let fd = new FormData()
        fd.append('file', file)
        return instanceApi(true).post(`/upload/productimage`, fd, { onUploadProgress }).then(res => res.data);
    },
    importChart(data) {
        return instanceApi(true).post(`/gl/chartofaccount/bulk`, data).then(res => res.data);
    },
    // postDocumentImage
    postDocumentImage(data) {
        return instanceApi(true).post(`/documentimage`, data).then(res => res.data);
    },
    getDocImage(limitPage, page, search, sortField, sortOrder, status) {
        let byguid = "guidfixed:1";
        let s = "";
        let q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        if (status != "" && status != undefined && status != null) {
            s = "&status=" + status
        }
        console.log(`/documentimage?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}&${byguid}${s}`);
        return instanceApi(true).get(`/documentimage?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}&${byguid}${s}`).then(res => res.data);
    },
    getDocImageGroup(limitPage, page, search, sortField, sortOrder, status) {
        let s = "";
        let q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        if (status != "" && status != undefined && status != null) {
            s = "&status=" + status
        }
        console.log(`/documentimage?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}${s}`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}${s}`).then(res => res.data);
    },

    importGroup(data) {
        return instanceApi(true).post(`/gl/accountgroup/bulk`, data).then(res => res.data);
    },
    upLoadDocImages(file, module) {
        let fd = new FormData()
        fd.append('file', file)
        return instanceApi(true).post(`/documentimage/upload?module=${module}`, fd).then(res => res.data);
    },
    // ผังบัญชี
    getAccountChartList(limitPage, page, search, sortField, sortOrder) {
        //console.log('Page' + page);
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        // console.log(`/gl/chartofaccount?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`);
        return instanceApi(true).get(`/gl/chartofaccount?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);
    },
    getAccountledger(startdate, enddate, accountcode, custtype, custcode, accountbook) {
        var searchcustcode = "";
        var searchaccountbook = "";

        if (custcode != '' && custcode != undefined && custcode != null) {
            /// 0 = ลูกหนี้ 1 = เจ้าหนี้
            if (custtype == 0) {
                searchcustcode = `&debtorcode=${custcode}`;

            } else if (custtype == 1) {
                searchcustcode = `&creditorcode=${custcode}`;
            }
        }

        if (accountbook != '' && accountbook != undefined && accountbook != null) {
            searchaccountbook = `&bookcode=${accountbook}`;
        }


        console.log(`/gl/report/ledgeraccount?startdate=${startdate}&enddate=${enddate}&accountcode=${accountcode}${searchcustcode}${searchaccountbook}`);
        return instanceApi(true).get(`/gl/report/ledgeraccount?startdate=${startdate}&enddate=${enddate}&accountcode=${accountcode}${searchcustcode}${searchaccountbook}`).then(res => res.data);
    },

    postAccountChart(data) {
        return instanceApi(true).post(`/gl/chartofaccount`, data).then(res => res.data);
    },
    getAccountChartById(id) {
        return instanceApi(true).get(`/gl/chartofaccount/` + id).then(res => res.data);
    },
    putAccountChart(data, id) {
        return instanceApi(true).put(`/gl/chartofaccount/` + id, data).then(res => res.data);
    },
    deleteAccountChart(data) {
        return instanceApi(true).delete(`/gl/chartofaccount/` + data).then(res => res.data);
    },
    putrejectimage(data, id) {
        return instanceApi(true).put(`/documentimage/` + id, data).then(res => res.data);
    },
    putrejectimagestatusonly(data, id) {
        return instanceApi(true).put(`/documentimage/documentref/status/` + id, data).then(res => res.data);
    },
    putrejectimagestatusonlyGuiD(data, id) {
        return instanceApi(true).put(`/documentimage/status/` + id, data).then(res => res.data);
    },

    // สมุดรายวัน
    getJournalBookList(limitPage, page, search, sortField, sortOrder) {

        //console.log('Page' + page);
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        //console.log(`/gl/journalbook?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`);
        return instanceApi(true).get(`/gl/journalbook?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);
    },
    postJournalBook(data) {
        return instanceApi(true).post(`/gl/journalbook`, data).then(res => res.data);
    },
    getJournalBookById(id) {
        return instanceApi(true).get(`/gl/journalbook/` + id).then(res => res.data);
    },
    putJournalBook(data, id) {
        return instanceApi(true).put(`/gl/journalbook/` + id, data).then(res => res.data);
    },
    deleteJournalBook(data) {
        return instanceApi(true).delete(`/gl/journalbook/` + data).then(res => res.data);
    },

    // กลุ่มบัญชี
    getAccountGroupList(limitPage, page, search, sortField, sortOrder) {
        //console.log('Page' + page);
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        //console.log(`/gl/journalbook?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`);
        return instanceApi(true).get(`/gl/accountgroup?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);


    },
    postAccountGroup(data) {
        return instanceApi(true).post(`/gl/accountgroup`, data).then(res => res.data);
    },
    getAccountGroupById(id) {
        return instanceApi(true).get(`/gl/accountgroup/` + id).then(res => res.data);
    },
    putAccountGroup(data, id) {
        return instanceApi(true).put(`/gl/accountgroup/` + id, data).then(res => res.data);
    },
    deleteAccountGroup(data) {
        return instanceApi(true).delete(`/gl/accountgroup/` + data).then(res => res.data);
    },
    upLoadImages(file) {
        let fd = new FormData()

        fd.append('file', file)
        return instanceApi(true).post(`/upload/images`, fd).then(res => res.data);
    },

    postSelectImage(data) {
        return instanceApi(true).post(`/gl/journal/docref/select`, data).then(res => res.data);
    },
    postNextImage() {
        return instanceApi(true).post(`/gl/journal/docref/next`).then(res => res.data);
    },
    postSelectImageForce(data) {
        return instanceApi(true).post(`/gl/journal/docref/select?force=1`, data).then(res => res.data);
    },
    postUnSelectImage(data) {
        return instanceApi(true).post(`/gl/journal/docref/deselect`).then(res => res.data);
    },
    getAllSelectImage() {
        return instanceApi(true).get(`/gl/journal/docref/selected`).then(res => res.data);
    },


    // update Group docref
    postGroupDocRef(data) {
        return instanceApi(true).post(`/documentimagegroup`, data).then(res => res.data);
    },
    getImagesByDocref(data) {
        return instanceApi(true).get(`/documentimagegroup/${data}`).then(res => res.data);
    },
    documentimagegroup(limitPage, page, search) {
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        // console.log(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&status=0`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&status=0`).then(res => res.data);
    },
    documentimagegroupnoreserve(limitPage, page, search) {
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        // console.log(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&status=0`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&status=0&docref-reserve=1`).then(res => res.data);
    },

    /// document formate
    getDocumentFormateList(limitPage, page, search) {
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        return instanceApi(true).get(`/transaction/document-formate?limit=${limitPage}&page=${page}${q}`).then(res => res.data);

    },

    postDocumentFormate(data) {
        return instanceApi(true).post(`/transaction/document-formate`, data).then(res => res.data);
    },

    putDocumentFormate(data, id) {
        return instanceApi(true).put(`/transaction/document-formate/` + id, data).then(res => res.data);
    },

    deleteDocumentFormate(data) {
        return instanceApi(true).delete(`/transaction/document-formate/` + data).then(res => res.data);
    },


    ///ลูกหนี้

    getDebtorList(limitPage, page, search, sortField, sortOrder) {
        //console.log('Page' + page);
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        //console.log(`/gl/journalbook?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`);
        return instanceApi(true).get(`/debtaccount/debtor?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);

    },

    postDebtor(data) {
        return instanceApi(true).post(`/debtaccount/debtor`, data).then(res => res.data);
    },
    getDebtorById(id) {
        return instanceApi(true).get(`/debtaccount/debtor/` + id).then(res => res.data);
    },
    getDebtorByCode(code) {
        return instanceApi(true).get(`/debtaccount/debtor/code/` + code).then(res => res.data);
    },
    putDebtor(id, data) {
        return instanceApi(true).put(`/debtaccount/debtor/` + id, data).then(res => res.data);
    },
    deleteDebtor(data) {
        return instanceApi(true).delete(`/debtaccount/debtor/` + data).then(res => res.data);
    },

    ///เจ้าหนี้

    getCreditorList(limitPage, page, search, sortField, sortOrder) {
        //console.log('Page' + page);
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        //console.log(`/gl/journalbook?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`);
        return instanceApi(true).get(`/debtaccount/creditor?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}`).then(res => res.data);

    },

    postCreditor(data) {
        return instanceApi(true).post(`/debtaccount/creditor`, data).then(res => res.data);
    },
    getCreditorById(id) {
        return instanceApi(true).get(`/debtaccount/creditor/` + id).then(res => res.data);
    },
    getCreditorByCode(code) {
        return instanceApi(true).get(`/debtaccount/creditor/code/` + code).then(res => res.data);
    },
    putCreditor(id, data) {
        return instanceApi(true).put(`/debtaccount/creditor/` + id, data).then(res => res.data);
    },
    deleteCreditor(data) {
        return instanceApi(true).delete(`/debtaccount/creditor/` + data).then(res => res.data);
    },


    // รายได้
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




}
