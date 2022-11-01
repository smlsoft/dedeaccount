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

        console.log(showBy);

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


        console.log(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder},imagereferences.xorder:1${sortShowBy}`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder},imagereferences.xorder:1${sortShowBy}`).then(res => res.data);
    },

    getDocumentImageById(data) {
        return instanceApi(true).get(`/documentimage/${data}`).then(res => res.data);
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
}