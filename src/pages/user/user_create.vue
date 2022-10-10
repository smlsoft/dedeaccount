<script setup>
import Form from "./components/form.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import UsersDataService from "@/services/UsersDataService";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { ref, onMounted, computed } from "vue";
import { useApp } from "@/stores/app.js";

const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const isUpdate = ref(false);

const form_model = ref({
    shopid: localStorage.shopid,
    username: "",
    role: 0,
});

onMounted(() => {
    storeApp.setPageTitle("เพิ่มผู้ใช้งาน");
    storeApp.setActivePage("user_list");
});


function goTo(path, param) {
    if (param != "") {
        router.push({ name: path, params: { id: param } });
    } else {
        router.push({ name: path });
    }
}

async function onSave(data) {
    console.log(data);
    try {
        const res = await UsersDataService.postUserShop(data)
        console.log(res);
        if (res.success) {
            toast.add({
                severity: "success",
                summary: "success",
                detail: "บันทึกข้อมูลสำเร็จ",
                life: 3000,
            });
            setTimeout(() => {
                goTo("user_list", "");
            }, 1000);
        }
    } catch (err) {
        console.log(err.response.data.message);
        toast.add({
            severity: "error",
            summary: "error",
            detail: "บันทึกไม่สำเร็จ " + err.response.data.message,
            life: 3000,
        });
    }

}
</script>

<template>
    <AppLayout>
        <MainContentWarp>
            <div class="surface-ground px-2 py-2">
                <Form :isUpdate="isUpdate" :form_model="form_model" v-on:save="onSave" v-on:back="goTo('user_list', '')" />
            </div>
        </MainContentWarp>
    </AppLayout>
</template>
