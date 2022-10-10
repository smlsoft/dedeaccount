<script setup>
import Form from "./components/form.vue";
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
    code: "",
    name1: "",
    name2: "",
    name3: "",
    name4: "",
    name5: "",
});

onMounted(async () => {
    await getDetail(route.params.id);
    storeApp.setPageTitle("แก้ไขข้อมูลกลุ่มบัญชี");
    storeApp.setActivePage("master");
    storeApp.setActiveChild("group_list");
});


async function getDetail(id) {
    try {
        const res = await MasterdataService.getAccountGroupById(id)
        if (res.success) {
            //console.log(res);
            if (res.success) {
                form_model.value.guidfixed = res.data.guidfixed ?? "";
                form_model.value.code = res.data.code ?? "";
                form_model.value.name1 = res.data.name1 ?? "";
                form_model.value.name2 = res.data.name2 ?? "";
                form_model.value.name3 = res.data.name3 ?? "";
                form_model.value.name4 = res.data.name4 ?? "";
                form_model.value.name5 = res.data.name5 ?? "";
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
        const res = await MasterdataService.putAccountGroup(data, data.guidfixed)
        //console.log(res);
        if (res.success) {
            toast.add({
                severity: "success",
                summary: "success",
                detail: "บันทึกข้อมูลสำเร็จ",
                life: 3000,
            });
            setTimeout(() => {
                goTo("groupList", "");
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
                <Form :form_model="form_model" v-on:save="onSave" v-on:back="goTo('groupList', '')" />
            </div>
        </MainContentWarp>
    </AppLayout>
</template>
