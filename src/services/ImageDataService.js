import { instanceApi } from '@/services/ProviderService'

export default {

    upLoadImages(file) {
        let fd = new FormData()
        fd.append('file', file)
        return instanceApi(true).post(`/upload/images`, fd).then(res => res.data);
    },

    // postDocumentImage
    postDocumentImage(data) {
        return instanceApi(true).post(`/documentimage`, data).then(res => res.data);
    },

    postDocumentImageBulk(data) {
        return instanceApi(true).post(`/documentimage/bulk`, data).then(res => res.data);
    },

    getDocumentImageGroup(limitPage, page, search, sortField, sortOrder, status, fromDate, toDate, taskguid) {
        let q = "";     // search
        let filterDate = "";
        let sorttaskguid = "";
        let sortStatus = "";

        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }

        if (fromDate != "" && fromDate != undefined && fromDate != null) {
            filterDate = "&fromdate=" + fromDate + "&todate=" + toDate;
        }

        if (taskguid == 'all') {
            sorttaskguid = "";
        } else {
            if (taskguid != "" && taskguid != undefined && taskguid != null) {
                sorttaskguid = "&taskguid=" + taskguid
            }
        }

        if (status != "" && status != undefined && status != null) {
            sortStatus = "&status=" + status
        }

        console.log(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder},guidfixed:1${filterDate}${sorttaskguid}${sortStatus}`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder},guidfixed:1${filterDate}${sorttaskguid}${sortStatus}`).then(res => res.data);
    },
    // add update tags in document image group
    putDocumentImageGroupTags(id, data) {
        return instanceApi(true).put(`/documentimagegroup/` + id + `/tags`, data).then(res => res.data);
    },
    //add update status in document image group
    putDocumentImageGroupStatus(id, data) {
        return instanceApi(true).put(`/documentimagegroup/` + id + `/status`, data).then(res => res.data);
    },

    //add update status ALL in job document image group
    putDocumentImageGroupStatusAll(id, data) {
        return instanceApi(true).put(`/documentimagegroup/task/` + id + `/status`, data).then(res => res.data);
    },

    // ดึงกลุ่มรูปทั้งหมด
    getDocumentImageGroupAll(limitPage, page) {
        //console.log(`/documentimagegroup?limit=${limitPage}&page=${page}`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}`).then(res => res.data);
    },

    //ดึงรูปทั้งหมด
    getImageAll(limitPage, page) {
        //console.log(`/documentimage?limit=${limitPage}&page=${page}`);
        return instanceApi(true).get(`/documentimage?limit=${limitPage}&page=${page}&sort=uploadedat:-1`).then(res => res.data);
    },

    getDocumentImageGroupById(data) {
        return instanceApi(true).get(`/documentimagegroup/${data}`).then(res => res.data);
    },

    getDocumentImageById(data) {
        return instanceApi(true).get(`/documentimage/${data}`).then(res => res.data);
    },
    //update image /documentimagegroup
    putUpdateImageDocumentimageGroup(id, data) {
        console.log(id)
        console.log(data)
        return instanceApi(true).put(`/documentimagegroup/` + id + `/documentimages`, data).then(res => res.data);
    },

    //Group
    postDocumentImageGroup(data) {
        return instanceApi(true).post(`/documentimagegroup`, data).then(res => res.data);
    },
    //UnGroup
    putDocumentImageUnGroup(id) {
        return instanceApi(true).put(`/documentimagegroup/` + id + `/ungroup`).then(res => res.data);
    },

    //rejectImage
    putRejectImage(id, data) {
        return instanceApi(true).put(`/documentimage/` + id + `/reject`, data).then(res => res.data);
    },
    //replaceImage
    upLoadDocImages(file, module) {
        let fd = new FormData()
        fd.append('file', file)
        return instanceApi(true).post(`/documentimage/upload?module=${module}`, fd).then(res => res.data);
    },

    //noreserve
    documentimagegroupnoreserve(limitPage, page, search, sorttaskguid) {
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        console.log(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=xorder:1,guidfixed:1&taskguid=${sorttaskguid}&reserve=1&ref=1&status=1`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=xorder:1,guidfixed:1&taskguid=${sorttaskguid}&reserve=1&ref=1&status=1`).then(res => res.data);
    },

    // เพิ่มรูปใน Group Image
    putAddImageInGroup(id, data) {
        return instanceApi(true).put(`/documentimagegroup/` + id + `/documentimages`, data).then(res => res.data);
    },

    // get documentimagegroup by docno
    getDocumentImageByDocNo(id) {
        return instanceApi(true).get(`/documentimagegroup/docref/` + id).then(res => res.data);
    },

    // ลบ
    deleteDocumentImageGroup(data) {
        return instanceApi(true).delete(`/documentimagegroup`, { data: data }).then(res => res.data);
    },

    //เรียงรูปใน JOB
    putDocumentImageXsort(id, data) {
        return instanceApi(true).put(`/documentimagegroup/xsort/${id}`, data).then(res => res.data);
    },

    // Commenty
    putDocumentImageComment(id, data) {
        return instanceApi(true).put(`/documentimage/` + id + `/comment`, data).then(res => res.data);
    },

}