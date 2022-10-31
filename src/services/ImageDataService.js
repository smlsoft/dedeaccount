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

    getDocumentImageGroup(limitPage, page, search, sortField, sortOrder, sortRef, sortReject) {

        let q = "";     // search
        let r = "";     // reject
        let ref = "";   // references

        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        if (sortRef != "" && sortRef != undefined && sortRef != null) {
            ref = "&ref=" + sortRef
        }
        if (sortReject != "" && sortReject != undefined && sortReject != null) {
            r = "&reject=" + sortReject
        }

        console.log(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}${ref}${r}`);
        return instanceApi(true).get(`/documentimagegroup?limit=${limitPage}&page=${page}${q}&sort=${sortField}:${sortOrder}${ref}${r}`).then(res => res.data);
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