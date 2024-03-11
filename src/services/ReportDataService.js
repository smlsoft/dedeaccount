import { instanceApi } from '@/services/ProviderService'

export default {
    getBalanceSheet(accountgroup, enddate, ica) {
        return instanceApi(true).get(`/gl/report/balancesheet?accountgroup=${accountgroup}&enddate=${enddate}&ica=${ica}`).then(res => res.data);
    },
    getProfitandloss(accountgroup, startdate, enddate, ica) {
        return instanceApi(true).get(`/gl/report/profitandloss?accountgroup=${accountgroup}&startdate=${startdate}&enddate=${enddate}&ica=${ica}`).then(res => res.data);
    },
    getTrialBalanceSheet(accountgroup, startdate, enddate, ica) {
        let ag = "";
        if (accountgroup != "" && accountgroup != undefined && accountgroup != null) {
            ag = "&accountgroup=" + accountgroup
        }

        console.log(`/gl/report/trialbalancesheet?startdate=${startdate}&enddate=${enddate}&ica=${ica}${ag}`);
        return instanceApi(true).get(`/gl/report/trialbalancesheet?startdate=${startdate}&enddate=${enddate}&ica=${ica}${ag}`).then(res => res.data);
    }
    , getdailyreport(accountgroup, startdate, enddate) {
        return instanceApi(true).get(`/gl/journal?accountgroup=${accountgroup}&startdate=${startdate}&enddate=${enddate}`).then(res => res.data);
    }
}