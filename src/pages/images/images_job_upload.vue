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
const filtersStatus = ref("0,1,2,3,4");
const limitPage = ref(20);
const sortField = ref("ownerat");
const sortOrder = ref(-1);

const dialogCreateJob = ref(false);
const jobDate = ref(new Date());
const jobId = ref("");
const jobId_valid = ref(false);
const jobName = ref("");
const jobName_valid = ref(false);
const jobDescription = ref("");
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");

onMounted(() => {
  getTaskList();
  storeApp.setPageTitle("อัพโหลดรูปภาพเอกสาร");
  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_job_upload");
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

function showDialogCreateJob() {
  getGenerateTaskID();
  jobDate.value = new Date();
  dialogCreateJob.value = true;
}

async function getGenerateTaskID() {
  try {
    const res = await TaskService.getGenerateTaskID();
    if (res.success) {
      // console.log("getGenerateTaskID");
      // console.log(res.data);
      jobId.value = res.data;
    }
  } catch (err) {
    console.log(err);
    toast.add({
      severity: "error",
      summary: "error",
      detail: err,
      life: 3000,
    });
  }
}

function closeDialogCreateJob() {
  clearDataFrom();
  dialogCreateJob.value = false;
}

function clearDataFrom() {
  jobId.value = "";
  jobId_valid.value = false;
  jobName.value = "";
  jobName_valid.value = false;
  jobDescription.value = "";
}
async function saveJob() {
  if (jobName.value == "") {
    jobName_valid.value = true;
  } else if (jobId.value == "") {
    jobId_valid.value = true;
  } else {
    let data = {
      code: jobId.value,
      name: jobName.value,
      description: jobDescription.value,
      status: 0,
    };
    try {
      const res = await TaskService.postTask(data);
      if (res.success) {
        getTaskList();
        closeDialogCreateJob();
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
}

function onRowSelect(data) {
  router.push({
    name: "images_job_upload_detail",
    params: { id: data.guidfixed },
  });
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
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="grid">
        <div class="col-12">
          <TaskList
            :modeMenu="1"
            :data_list="data_list"
            :loading="loading"
            :firstPage="firstPage"
            :totalItemsCount="totalItemsCount"
            :filters="search"
            v-on:onRowSelect="onRowSelect"
            v-on:showDialogCreateJob="showDialogCreateJob"
            v-on:keyup="keyup"
            v-on:keydown="keydown"
          />
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>

  <Dialog
    v-model:visible="dialogCreateJob"
    :style="{ width: '550px' }"
    header="สร้าง Job"
    :modal="true"
  >
    <div class="grid formgrid p-fluid pt-3">
      <div class="field mb-12 col-12 md:col-12">
        <label for="jobDate" class="font-medium text-900">วันที่/เวลา</label>
        <DatePicker
          dateFormat="d/m/yy"
          v-model="jobDate"
          :modelValue="jobDate"
          :showIcon="true"
          :disabled="true"
          :buddhist="buddhistYear"
          :showTime="true"
          :showSeconds="true"
        />
      </div>
      <div class="field mb-12 col-12 md:col-12">
        <label for="jobId" class="font-medium text-900">เลขที่งาน</label>
        <InputText
          :disabled="true"
          id="jobId"
          type="text"
          v-model="jobId"
          :class="jobId_valid ? 'p-invalid' : ''"
        />
      </div>
      <div class="field mb-12 col-12 md:col-12">
        <label for="jobName" class="font-medium text-900">ชื่องาน</label>
        <InputText
          id="jobName"
          type="text"
          v-model="jobName"
          :class="jobName_valid ? 'p-invalid' : ''"
        />
      </div>
      <div class="field mb-12 col-12 md:col-12">
        <label for="jobName" class="font-medium text-900">หมายเหตุ</label>
        <Textarea
          v-model="jobDescription"
          type="text"
          class="accountdescription"
          :autoResize="true"
          rows="5"
        />
      </div>
    </div>
    <template #footer>
      <Button
        label="ยกเลิก"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeDialogCreateJob"
      />
      <Button
        label="บันทึก"
        icon="pi pi-save"
        class="p-button-success"
        @click="saveJob"
      />
    </template>
  </Dialog>
</template>
