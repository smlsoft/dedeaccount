import { instanceApi } from '@/services/ProviderService'

export default {

    getFolderList() {
        return instanceApi(true).get(`/file-folder/list`).then(res => res.data);
    },
    postFolder(data) {
        return instanceApi(true).post(`/file-folder`, data).then(res => res.data);
    },

    putFolder(id, data) {
        return instanceApi(true).put(`/file-folder/` + id, data).then(res => res.data);
    },

}

