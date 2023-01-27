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

    getDocumentImageGroup(limitPage, page, search, sortField, sortOrder, showBy, fromDate, toDate, taskguid) {
        let q = "";     // search
        let filterDate = "";
        let sortShowBy = "";
        let sorttaskguid = "";

        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }

        if (showBy == "save") {
            sortShowBy = "&ref=2"
        } else if (showBy == "unsave") {
            sortShowBy = "&ref=1&reject=0"
        } else if (showBy == "reject") {
            sortShowBy = "&reject=1"
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

        console.log(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=guidfixed:1&${sortField}:${sortOrder}${sortShowBy}${filterDate}${sorttaskguid}`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=guidfixed:1&${sortField}:${sortOrder}${sortShowBy}${filterDate}${sorttaskguid}`).then(res => res.data);
    },

    // updateแค่ สถานะ 
    putDocumentImageGroupStatus(id, data) {
        return instanceApi(true).put(`/documentimagegroup/` + id + `/status`, data).then(res => res.data);
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
    documentimagegroupnoreserve(limitPage, page, search) {
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&reserve=1&ref=1&reject=0`).then(res => res.data);
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
    }
}