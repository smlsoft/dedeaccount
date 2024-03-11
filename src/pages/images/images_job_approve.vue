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
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);
const activePage = ref(1);
const search = ref("");
const filtersStatus = ref("1,2,3,4");
const limitPage = ref(20);
const sortField = ref("ownerat");
const sortOrder = ref(-1);

onMounted(() => {
  getTaskList();
  storeApp.setPageTitle("ตรวจสอบรูปภาพเอกสาร");
  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_job_approve");
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
  }
  router.push({
    name: "images_job_approve_detail",
    params: { id: data.guidfixed },
  });
}

function keyup(ketData) {
  filters.value = ketData;
  console.log(filters.value);

  clearTimeout(typingTimer.value);
  typingTimer.value = setTimeout(doneTyping, doneTypingInterval.value);
}
function keydown() {
  clearTimeout(typingTimer.value);
}
function doneTyping() {
  activePage.value = 1;
  firstPage.value = 0;
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
        totalItemsCount.value = res.total;
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
  getTaskList();
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="grid">
        <div class="col-12">
          <TaskList
            :modeMenu="2"
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
