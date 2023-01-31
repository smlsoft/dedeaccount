<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import TaskService from "@/services/TaskService";
import DatePicker from "@/components/widget/DatePicker.vue";
import TaskList from "./components/TaskList.vue";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const data_list = ref([]);
const totalItemsCount = ref(0);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);

const filters = ref(null);
const sortField = ref("code");
const sortOrder = ref(1);
const limitPage = ref(20);

onMounted(() => {
  getTaskList();
  storeApp.setPageTitle("คีย์รายวันจากรูป");
  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("daily_job_list");
});

function getTaskList() {
  loading.value = true;
  TaskService.getTaskList()
    .then((res) => {
      console.log("getTaskList");
      console.log(res);
      if (res.success) {
        loading.value = false;
        data_list.value = res.data;
      }
    })
    .catch((err) => {
      loading.value = false;
      toast.add({
        severity: "error",
        summary: "Error",
        detail: err,
        life: 3000,
      });
    });
}

function onRowSelect(data) {
  if (data.status == 0) {
    toast.add({
      severity: "warn",
      summary: "Waring",
      detail: "กำลังอัพโหลดรูปภาพ",
      life: 3000,
    });
    return;
  } else if (data.status == 1) {
    toast.add({
      severity: "warn",
      summary: "Waring",
      detail: "รูปรอตรวจสอบ",
      life: 3000,
    });
    return;
  } else if (data.status == 2) {
    toast.add({
      severity: "warn",
      summary: "Waring",
      detail: "กำลังตรวจสอบรูป",
      life: 3000,
    });
    return;
  } else if (data.status == 3) {
    router.push({
      name: "images_job_daily_detail",
      params: { id: data.guidfixed },
    });
  }
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="grid">
        <div class="col-12">
          <TaskList
            :modeMenu="3"
            :data_list="data_list"
            :loading="loading"
            :firstPage="firstPage"
            :totalItemsCount="totalItemsCount"
            :filters="filters"
            v-on:onRowSelect="onRowSelect"
          />
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>
</template>
