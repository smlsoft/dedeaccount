<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import TaskService from "@/services/TaskService";
import DatePicker from "@/components/widget/DatePicker.vue";
import TaskList from "./components/TaskList.vue";
import { useRouter } from "vue-router";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import AppNavigation from "@/utils/app_navigation";

const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const data_list = ref([]);
const totalItemsCount = ref(0);
const loading = ref(true);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);

const firstPage = ref(0);
const activePage = ref(1);
const search = ref("");
const filtersStatus = ref("3,4");
const limitPage = ref(20);
const sortField = ref("ownerat");
const sortOrder = ref(-1);

onMounted(() => {
  // Check if there's a saved perPage value for this page
  const savedPerPage = localStorage.getItem('images_job_daily_perPage');
  if (savedPerPage) {
    limitPage.value = parseInt(savedPerPage);
  }

  getTaskList();
  storeApp.setPageTitle("คีย์รายวันจากรูป");
  storeApp.setActivePage("daily");
  storeApp.setActiveChild("images_job_daily");
});

onBeforeUnmount(() => {
  // เมื่อออกไปจากหน้า images_job_daily แต่ไม่ได้เปลี่ยนเมนูหลัก
  // เช็คว่ายังอยู่ในเมนู daily หรือไม่
  if (storeApp.activePage === 'daily' && storeApp.activeChild !== 'images_job_daily') {
    // ล้างค่า perPage เฉพาะเมื่อไม่ได้อยู่ในหน้า images_job_daily
    localStorage.removeItem('images_job_daily_perPage');
  }
});

function getTaskList() {
  loading.value = true;
  TaskService.getTaskList(
    limitPage.value,
    activePage.value,
    search.value,
    filtersStatus.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      console.log("getTaskList");
      console.log(res);
      if (res.success) {
        loading.value = false;
        data_list.value = res.data;
        totalItemsCount.value = res.pagination.total;
        firstPage.value = (activePage.value - 1) * limitPage.value;
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
  } else if (data.status == 4) {
    router.push({
      name: "images_job_daily_detail",
      params: { id: data.guidfixed },
    });
  }
}
function keyup(ketData) {
  search.value = ketData;
  console.log(search.value);

  clearTimeout(typingTimer.value);
  typingTimer.value = setTimeout(doneTyping, doneTypingInterval.value);
}
function keydown() {
  clearTimeout(typingTimer.value);
}
function doneTyping() {
  activePage.value = 1;
  firstPage.value = 0;
  loading.value = true;

  TaskService.getTaskList(
    limitPage.value,
    activePage.value,
    search.value,
    filtersStatus.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
        totalItemsCount.value = res.pagination.total;
        console.log(totalItemsCount.value);
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}
function onPage(active, limit) {
  activePage.value = active;
  limitPage.value = limit;
  firstPage.value = (active - 1) * limit;

  // Save the perPage value to localStorage
  localStorage.setItem('images_job_daily_perPage', limit.toString());

  getTaskList();
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
            :filters="search"
            v-on:onRowSelect="onRowSelect"
            v-on:keyup="keyup"
            v-on:keydown="keydown"
            v-on:onPage="onPage"
          />
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>
</template>
