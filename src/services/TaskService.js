import { instanceApi } from '@/services/ProviderService'

export default {

    getTaskList(limitPage, page, search, filtersStatus, sortField, sortOrder) {
        var q = "";
        if (search != "" && search != undefined && search != null) {
            q = "&q=" + search
        }
        console.log(`/task?limit=${limitPage}&page=${page}${q}&status=${filtersStatus}&sort=${sortField}:${sortOrder}`);
        return instanceApi(true).get(`/task?limit=${limitPage}&page=${page}${q}&status=${filtersStatus}&sort=${sortField}:${sortOrder}`).then(res => res.data);

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

    getGenerateTaskID() {
        return instanceApi(true).get(`/task/generate-code`).then(res => res.data);
    },

    putTask(id, data) {
        return instanceApi(true).put(`/task/` + id, data).then(res => res.data);
    },

    deleteTask(data) {
        return instanceApi(true).delete(`/task/` + data).then(res => res.data);
    },
}

