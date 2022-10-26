import { instanceApi } from '@/services/ProviderService'

export default {

    upLoadImages(file) {
        let fd = new FormData()
        fd.append('file', file)
        return instanceApi(true).post(`/upload/images`, fd).then(res => res.data);
    },

    postDocumentImageBulk(data) {
        return instanceApi(true).post(`/documentimage/bulk`, data).then(res => res.data);
    },

    getDocumentImageGroup(limitPage, page, search) {
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        //console.log(`/documentimagegroup?limit=${limitPage}&page=${page}${q}`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}`).then(res => res.data);
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

}