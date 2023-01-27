import { instanceApi } from '@/services/ProviderService'

export default {

    getTaskList() {
        return instanceApi(true).get(`/task/list`).then(res => res.data);
    },

    getTaskById(id) {
        return instanceApi(true).get(`/task/` + id).then(res => res.data);
    },
    postTask(data) {
        return instanceApi(true).post(`/task`, data).then(res => res.data);
    },

    putTaskStatus(id, data) {
        return instanceApi(true).put(`/task/` + id + `/status`, data).then(res => res.data);
    },

}

