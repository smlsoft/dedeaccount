<script setup>
import From from "./components/form.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { ref, onMounted, computed } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";

const storeApp = useApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const form_model = ref({
    guidfixed: "",
    accountbalancetype: 1,
    accountcategory: 1,
    accountcode: "",
    accountgroup: "",
    accountlevel: 1,
    accountname: "",
    consolidateaccountcode: "",

});

onMounted(async () => {
    await getDetail(route.params.id);
    storeApp.setPageTitle("แก้ไขข้อมูลผังบัญชี");
    storeApp.setActivePage("master");
    storeApp.setActiveChild("chart_list");
});

async function getDetail(id) {
    try {
        const res = await MasterdataService.getAccountChartById(id)
        if (res.success) {
            //console.log(res);
            if (res.success) {
                form_model.value.guidfixed = res.data.guidfixed ?? "";
                form_model.value.accountcode = res.data.accountcode ?? "";
                form_model.value.accountname = res.data.accountname ?? "";
                form_model.value.accountcategory = res.data.accountcategory ?? 1;
                form_model.value.accountgroup = res.data.accountgroup ?? "";
                form_model.value.accountlevel = res.data.accountlevel ?? 1;
                form_model.value.consolidateaccountcode = res.data.consolidateaccountcode ?? "";
                form_model.value.accountbalancetype = res.data.accountbalancetype ?? 1;
            }
            //console.log(form_model.value);
        }
    } catch (err) {
        console.log(err);
    }
}

function goTo(path, param) {
    if (param != "") {
        router.push({ name: path, params: { id: param } });
    } else {
        router.push({ name: path });
    }
}

async function onSave(data) {
    // console.log(data);
    try {
        const res = await MasterdataService.putAccountChart(data, data.guidfixed)
        //console.log(res);
        if (res.success) {
            toast.add({
                severity: "success",
                summary: "success",
                detail: "บันทึกข้อมูลสำเร็จ",
                life: 3000,
            });
            setTimeout(() => {
                goTo("chartList", "");
            }, 1000);
        }
    } catch (err) {
        console.log(err);
        toast.add({
            severity: "error",
            summary: "error",
            detail: "บันทึกไม่สำเร็จ " + err,
            life: 3000,
        });
    }
}
</script>

<template>
    <AppLayout>
        <MainContentWarp>
            <div class="surface-ground px-2 py-2">
                <From :form_model="form_model" v-on:save="onSave" v-on:back="goTo('chartList', '')" />
            </div>
        </MainContentWarp>
    </AppLayout>
</template>
