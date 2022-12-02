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

    getDocumentImageGroup(limitPage, page, search, sortField, sortOrder, showBy) {
        let q = "";     // search

        let sortShowBy = "";
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

        console.log(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}${sortShowBy}`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}${sortShowBy}`).then(res => res.data);
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
}