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
import DialogForm from "@/components/form/DialogForm.vue";
import DialogApprove from "@/components/form/DialogApprove.vue";

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
const filtersStatus = ref("0,1,2,3,4,5");
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
const modelConfirmUploadImage = ref(false);
const responseId = ref();
const dialogConfigJob = ref(false);
const dataConfigJob = ref();
const newDataConfigJobName = ref("");
const newDataConfigJobDes = ref("");
const modeEditName = ref(false);
const modeEditDescription = ref(false);
const ramdomNumber = ref();
const dialogJobCancel = ref(false);
const dialogJobDelete = ref(false);

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

function showDialogConfigJob(data) {
  dialogConfigJob.value = true;
  dataConfigJob.value = data;
  newDataConfigJobName.value = data.name;
  newDataConfigJobDes.value = data.description;
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
        responseId.value = res.id;
        closeDialogCreateJob();
        getTaskList();
        setTimeout(() => {
          modelConfirmUploadImage.value = true;
        }, 100);
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
function goTo() {
  router.push({
    name: "images_job_upload_detail",
    params: { id: responseId.value },
  });
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

function selectModeEditName() {
  if (!modeEditName.value) {
    modeEditName.value = true;
  } else {
    modeEditName.value = false;
    newDataConfigJobName.value = dataConfigJob.value.name;
  }
}

function selectModeEditDescription() {
  if (!modeEditDescription.value) {
    modeEditDescription.value = true;
  } else {
    modeEditDescription.value = false;
    newDataConfigJobDes.value = dataConfigJob.value.description;
  }
}

// ยกเลิก job
function cancelJob() {
  ramdomNumber.value = Utils.generateRandomNumber();
  dialogJobCancel.value = true;
}

// delete job
function deleteJob() {
  ramdomNumber.value = Utils.generateRandomNumber();
  dialogJobDelete.value = true;
}

function confirmJobFalse() {
  ramdomNumber.value = Utils.generateRandomNumber();
}

// update status job
async function jobUpdateStatus(data) {
  let status = {
    status: data,
  };
  try {
    const res = await TaskService.putTaskStatus(
      dataConfigJob.value.guidfixed,
      status
    );
    if (res.success) {
      dialogJobCancel.value = false;
      dialogConfigJob.value = false;
      dataConfigJob.value = {};
      newDataConfigJobName.value = "";
      newDataConfigJobDes.value = "";
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
      getTaskList();
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

// delete task service
async function jobDelete() {
  try {
    const res = await TaskService.deleteTask(dataConfigJob.value.guidfixed);
    if (res.success) {
      dialogJobDelete.value = false;
      dialogConfigJob.value = false;
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
      getTaskList();
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

async function updateDataJob() {
  if (
    newDataConfigJobName.value == dataConfigJob.value.name &&
    newDataConfigJobDes.value == dataConfigJob.value.description
  ) {
    dialogConfigJob.value = false;
    modeEditName.value = false;
    modeEditDescription.value = false;
    return;
  } else {
    dataConfigJob.value.name = newDataConfigJobName.value;
    dataConfigJob.value.description = newDataConfigJobDes.value;

    try {
      const res = await TaskService.putTask(
        dataConfigJob.value.guidfixed,
        newData
      );
      if (res.success) {
        dialogConfigJob.value = false;
        modeEditName.value = false;
        modeEditDescription.value = false;
        toast.add({
          severity: "success",
          summary: "success",
          detail: "บันทึกข้อมูลสำเร็จ",
          life: 3000,
        });
        getTaskList();
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
            v-on:showDialogConfigJob="showDialogConfigJob"
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

  <Dialog
    v-model:visible="dialogConfigJob"
    :modal="true"
    :closable="false"
    :showHeader="false"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '60vw' }"
  >
    <section class="flex flex-column w-full mt-4">
      <div class="flex w-full justify-content-between align-items-center mb-4">
        <span class="font-semibold text-base text-600"
          >ตั้งค่างาน /
          <span class="text-900">{{ dataConfigJob.name }}</span></span
        >
        <Button
          type="button"
          icon="pi pi-times"
          class="p-button-rounded p-button-secondary p-button-text align-self-start"
          @click="dialogConfigJob = false"
        ></Button>
      </div>
      <div class="flex align-items-center w-full mb-4">
        <p class="font-semibold text-xl mt-0 mb-0 text-900">รายละเอียดงาน</p>
      </div>

      <ul class="list-none p-0 m-0">
        <li
          class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap"
        >
          <div class="text-500 w-6 md:w-2 font-medium">วันที่</div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            {{ Utils.getDateFormatDMYHM(dataConfigJob.ownerat) }}
          </div>
        </li>
        <li
          class="flex align-items-center py-3 px-2 border-top-1 surface-border flex-wrap"
        >
          <div class="text-500 w-6 md:w-2 font-medium">เลขที่งาน</div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            {{ dataConfigJob.code }}
          </div>
        </li>

        <li
          class="flex align-items-center border-top-1 surface-border flex-wrap"
          :class="!modeEditName ? 'py-3 px-2' : 'py-2 px-2'"
        >
          <div class="text-500 w-6 md:w-2 font-medium">ชื่องาน</div>
          <div class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
            <span v-if="!modeEditName"> {{ dataConfigJob.name }}</span>
            <InputText
              type="text"
              v-model="newDataConfigJobName"
              v-if="modeEditName"
              class="py-2 w-full"
            />
          </div>
          <div class="w-6 md:w-2 flex justify-content-end">
            <Button
              :label="!modeEditName ? 'แก้ไข' : 'ยกเลิก'"
              :icon="!modeEditName ? 'pi pi-pencil' : 'pi pi-times'"
              class="p-button-text"
              :class="!modeEditName ? '' : 'p-button-danger'"
              style="padding: 0px"
              @click="selectModeEditName()"
            />
          </div>
        </li>
        <li
          class="flex align-items-start py-3 px-2 border-top-1 border-bottom-1 surface-border flex-wrap"
        >
          <div class="text-500 w-6 md:w-2 font-medium">หมายเหตุ</div>
          <div
            class="text-900 w-full md:w-8 md:flex-order-0 flex-order-1 line-height-3"
          >
            <span v-if="!modeEditDescription">
              {{ dataConfigJob.description }}
            </span>
            <Textarea
              v-if="modeEditDescription"
              type="text"
              v-model="newDataConfigJobDes"
              :autoResize="true"
              rows="5"
              class="w-full"
            />
          </div>
          <div class="w-6 md:w-2 flex justify-content-end">
            <Button
              :label="!modeEditDescription ? 'แก้ไข' : 'ยกเลิก'"
              :icon="!modeEditDescription ? 'pi pi-pencil' : 'pi pi-times'"
              class="p-button-text"
              :class="!modeEditDescription ? '' : 'p-button-danger'"
              style="padding: 0px"
              @click="selectModeEditDescription()"
            />
          </div>
        </li>
      </ul>
    </section>
    <template #footer>
      <div
        class="flex border-top-0 pt-2 surface-border justify-content-between align-items-center"
      >
        <div>
          <Button
            @click="cancelJob()"
            icon="pi pi-times"
            label="ยกเลิกงาน"
            class="m-0 mr-2 p-button-warning"
          />
          <Button
            @click="deleteJob()"
            icon="pi pi-trash"
            label="ลบงาน"
            class="m-0 p-button-danger"
          />
        </div>
        <div>
          <Button
            @click="updateDataJob()"
            icon="pi pi-save"
            label="บันทึก"
            class="m-0 p-button-success"
          />
        </div>
      </div>
    </template>
  </Dialog>

  <DialogForm
    :confirmDialog="modelConfirmUploadImage"
    :textContent="'ต้องการอัพโหลดเอกสาร'"
    v-on:close="modelConfirmUploadImage = false"
    v-on:confirm="goTo()"
  ></DialogForm>
  <DialogApprove
    :mode="'cancel'"
    :title="'ยืนยันการยกเลิกงาน'"
    :ramdomNumber="ramdomNumber"
    :confirmDialog="dialogJobCancel"
    v-on:close="dialogJobCancel = false"
    v-on:confirmJob="jobUpdateStatus(5)"
    v-on:confirmJobFalse="confirmJobFalse()"
  />
  <DialogApprove
    :mode="'delete'"
    :title="'ยืนยันการลบงาน'"
    :ramdomNumber="ramdomNumber"
    :confirmDialog="dialogJobDelete"
    v-on:close="dialogJobDelete = false"
    v-on:confirmJob="jobDelete()"
    v-on:confirmJobFalse="confirmJobFalse()"
  />
</template>
