

import { instanceApi } from '@/services/ProviderService'

export default {

    pdfReader(file, bank, password) {
        // let fd = new FormData()
        // fd.append('file', file)
        return instanceApi(true).post(`/bankstatementreader/?bank=${bank}&password=${password}`, file).then(res => res.data);
    },


}