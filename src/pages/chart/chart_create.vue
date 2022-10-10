<script setup>
import Form from "./components/form.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { ref, onMounted, computed } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";

const storeApp = useApp();
const router = useRouter();
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

onMounted(() => {
  storeApp.setPageTitle("เพิ่มข้อมูลผังบัญชี");
  storeApp.setActivePage("master");
  storeApp.setActiveChild("chart_list");
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
    const res = await MasterdataService.postAccountChart(data);
    console.log(res);
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
      summary: "ทำรายการไม่สำเร็จ",
      detail: "บันทึกไม่สำเร็จ รหัสผังบัญชีซ้ำ",
      life: 3000,
    });
  }
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-ground px-2 py-2">
        <Form
          :form_model="form_model"
          v-on:save="onSave"
          v-on:back="goTo('chartList', '')"
        />
      </div>
    </MainContentWarp>
  </AppLayout>
</template>
