import { instanceApi } from '@/services/ProviderService'

export default {

    getJobList() {
        return instanceApi(true).get(`/job/list`).then(res => res.data);
    },

    getJobById(id) {
        return instanceApi(true).get(`/job/` + id).then(res => res.data);
    },
    postJob(data) {
        return instanceApi(true).post(`/job`, data).then(res => res.data);
    },

    putJob(id, data) {
        return instanceApi(true).put(`/job/` + id, data).then(res => res.data);
    },

}

