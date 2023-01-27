<script setup>
import DialogApprove from "@/components/form/DialogApprove.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import ImageDataService from "@/services/ImageDataService";
import TaskService from "@/services/TaskService";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import ImageBlock from "./components/ImagesBlock.vue";
import $ from "jquery";

import DocumentPreview from "./components/documentPreview.vue";

const storeApp = useApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const data_list = ref([]);

const totalItemsCount = ref(10);
const loading = ref(true);
const activePage = ref(1);
const firstPage = ref(0);
const AllImageUsed = ref([]);
const searchItem = ref("");
const limitPage = ref(50);

const showSkeleton = ref(false);
const totalPage = ref(0);
const selectSort = ref("uploadedat");

const sortOrder = ref(-1);

const selectedImg = ref([]);

const showImageBy = ref("");

const imageDialog = ref(false);
const dataImageDialog = ref({});

const searchFolder = ref("");

const fromDate = ref("");
const toDate = ref("");
const showOveray = ref(false);
const selectedImag = ref("");
const showImgData = ref();
const showDocumentPreview = ref(true);
const isSelectedDocument = ref(false);
const isDataListNull = ref(false);
const ischeckApprove = ref(false);
const loadIcon = ref(false);

const job = ref({
  guidfixed: "",
  status: 0,
});
const dialogJobApprove = ref(false);

const listSizeImageBloc = ref([
  { icon: "pi pi-th-large", value: "normal" },
  { icon: "pi pi-table", value: "large" },
]);
const sizeImageBloc = ref(listSizeImageBloc.value[0]);
const sizeWidthImageBloc = ref(90);
const sizeHeightImageBloc = ref(90);

const ramdomNumber = ref();
const checkSuccess = ref(false);
const statusAllImage = ref(true);

onMounted(() => {
  searchFolder.value = route.params.id;
  getDocumentImageGroup();
  getTaskById(searchFolder.value);

  storeApp.setPageTitle("ตรวจสอบรูปภาพ JOB #" + searchFolder.value);
  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_job_approve_detail");
});

function getTaskById(guidfixed) {
  TaskService.getTaskById(guidfixed)
    .then((res) => {
      //console.log(res);
      if (res.success) {
        job.value = res.data;

        console.log(job.value);
      }
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: err,
        life: 3000,
      });
    });
}

function getDocumentImageGroupScroll() {
  showSkeleton.value = true;
  ImageDataService.getDocumentImageGroup(
    limitPage.value,
    activePage.value,
    searchItem.value,
    selectSort.value,
    sortOrder.value,
    showImageBy.value,
    fromDate.value,
    toDate.value,
    searchFolder.value
  )
    .then((res) => {
      if (res.success) {
        if (res.data == null) {
          isDataListNull.value = true;
          showSkeleton.value = false;
        } else {
          console.log("getDocumentImageGroupScroll");
          console.log(res);
          setTimeout(() => {
            res.data.forEach((ele) => {
              ele.isUpdate = false;
              ele.ischecked = false;

              let references = ele.references ?? [];
              if (ele.references == undefined) {
                ele.references = references;
              }

              data_list.value.push(ele);
            });

            firstPage.value = activePage.value;

            showSkeleton.value = false;
          }, 500);
        }
      }
    })

    .catch((err) => {
      getImageAll;
      console.log(err);
      showSkeleton.value = false;
    });
}

function getDocumentImageGroup() {
  showSkeleton.value = true;
  loading.value = true;
  isDataListNull.value = false;

  ImageDataService.getDocumentImageGroup(
    limitPage.value,
    activePage.value,
    searchItem.value,
    selectSort.value,
    sortOrder.value,
    showImageBy.value,
    fromDate.value,
    toDate.value,
    searchFolder.value
  )
    .then((res) => {
      if (res.success) {
        console.log("getDocumentImageGroup");
        console.log(res);
        if (res.data == null) {
          showSkeleton.value = false;
          data_list.value = [];
          isDataListNull.value = true;
        } else {
          data_list.value = res.data;
          data_list.value = data_list.value.map((element) => {
            let references = element.references ?? [];
            element.references = references;
            return element;
          });

          data_list.value.forEach((element) => {
            element.ischecked = false;
          });

          checkImageApprove();

          isDataListNull.value = false;
          loading.value = false;
          showSkeleton.value = false;
          totalPage.value = res.pagination.totalPage;
          totalItemsCount.value = res.pagination.total;
        }
      }
    })

    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: err,
        life: 3000,
      });
    });
}

function nextPage() {
  activePage.value += 1;

  if (activePage.value <= totalPage.value) {
    getDocumentImageGroupScroll();
  }
}

function onScroll() {
  let div = $("#content")[0];
  // console.log(div.scrollTop);
  if (div.scrollTop + div.clientHeight >= div.scrollHeight - 10) {
    if (!showSkeleton.value) {
      nextPage();
    }
  }
}

async function rejectImage(documentimageguid, isReject) {
  console.log("documentimageguid :" + documentimageguid);
  console.log("isReject :" + isReject);
  let data = {
    isreject: true,
  };

  if (!isReject) {
    data.isreject = false;
  }

  await ImageDataService.putRejectImage(documentimageguid, data)
    .then((res) => {
      console.log(res);
      if (res.success) {
        toast.add({
          severity: "success",
          summary: "success",
          detail: "บันทึกข้อมูลสำเร็จ",
          life: 3000,
        });
        setTimeout(() => {
          activePage.value = 1;
          getDocumentImageGroup();
        }, 100);
      }
    })
    .catch((err) => {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ไม่สามารถเลือกรูปได้ " + err,
        life: 3000,
      });
    });
}

function resizeSplitter(isOveray) {
  showOveray.value = isOveray;
}

function showImg(data) {
  selectedImag.value = data;
  showImgData.value = data.imagereferences;
  showDocumentPreview.value = true;
}

function closeDocumentPreview() {
  showDocumentPreview.value = false;
}

function rejectSuccess(status) {
  if (status) {
    showImgData.value = null;
    selectedImag.value = "";
    getDocumentImageGroup();
  }
}

function startApproveJob() {
  ischeckApprove.value = true;
  if (job.value.status == 1) {
    jobApprove(2);
  }
}

function stopApproveJob() {
  ischeckApprove.value = false;
}

function endApproveJob() {
  console.log("endApproveJob");
  ramdomNumber.value = Utils.generateRandomNumber();
  dialogJobApprove.value = true;
}

function confirmApproveFalse() {
  ramdomNumber.value = Utils.generateRandomNumber();
}

// ตรวจเสร็จแล้ว
async function jobApprove(statusJob) {
  dialogJobApprove.value = false;
  let status = {
    status: statusJob,
  };
  try {
    const res = await TaskService.putTaskStatus(searchFolder.value, status);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });

      if (statusJob == 3) {
        setTimeout(() => {
          router.push({ name: "images_job_approve" });
        }, 1000);
      }
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

// Update status
async function updateStatus(guidfixed, data_status) {
  let status = {
    status: data_status,
  };
  try {
    const res = await ImageDataService.putDocumentImageGroupStatus(
      guidfixed,
      status
    );
    if (res.success) {
      return true;
    }
  } catch (err) {
    console.log(err);
    toast.add({
      severity: "error",
      summary: "error",
      detail: "บันทึกไม่สำเร็จ " + err,
      life: 3000,
    });

    return false;
  }
}

async function updateStatusFrist(data) {
  console.log(data.guidfixed);
  // 99= ตั้งค่าสถานะให้ icon โหลด
  data_list.value.filter(function (ele) {
    if (ele.guidfixed == data.guidfixed) {
      ele.status = 99;
    }
  });

  const updateData = await updateStatus(data.guidfixed, 1);
  setTimeout(() => {
    if (updateData) {
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == data.guidfixed) {
          ele.status = 1;
        }
      });
    } else {
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == data.guidfixed) {
          ele.status = 0;
        }
      });
    }

    checkImageApprove();
  }, 300);
}

async function upDateStatusImage(data) {
  console.log(data);

  // 99= ตั้งค่าสถานะให้ icon โหลด
  data_list.value.filter(function (ele) {
    if (ele.guidfixed == data.guidfixed) {
      ele.status = 99;
    }
  });

  const updateData = await updateStatus(data.guidfixed, data.status);
  setTimeout(() => {
    if (updateData) {
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == data.guidfixed) {
          ele.status = data.status;
        }
      });
    } else {
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == data.guidfixed) {
          ele.status = 0;
        }
      });
    }

    checkImageApprove();
  }, 300);
}

function checkImageApprove() {
  let notApproveImate = 0;
  data_list.value.forEach((element) => {
    if (element.status == 0) {
      notApproveImate += 1;
    }
  });

  if (notApproveImate == 0) {
    checkSuccess.value = true;
  } else {
    checkSuccess.value = false;
  }
}

function updateAllStatusImage() {
  if (!statusAllImage.value) {
    data_list.value.forEach((element) => {
      // 99= ตั้งค่าสถานะให้ icon โหลด
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == element.guidfixed) {
          ele.status = 99;
        }
      });

      const updateData = updateStatus(element.guidfixed, 1);
      setTimeout(() => {
        if (updateData) {
          data_list.value.filter(function (ele) {
            if (ele.guidfixed == element.guidfixed) {
              ele.status = 1;
            }
          });
        } else {
          data_list.value.filter(function (ele) {
            if (ele.guidfixed == element.guidfixed) {
              ele.status = 0;
            }
          });
        }

        checkImageApprove();
      }, 300);
    });
  } else {
    data_list.value.forEach((element) => {
      // 99= ตั้งค่าสถานะให้ icon โหลด
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == element.guidfixed) {
          ele.status = 99;
        }
      });
      const updateData = updateStatus(element.guidfixed, 0);
      setTimeout(() => {
        if (updateData) {
          data_list.value.filter(function (ele) {
            if (ele.guidfixed == element.guidfixed) {
              ele.status = 0;
            }
          });
        }
        checkImageApprove();
      }, 300);
    });
  }
}
</script>
<template>
  <AppLayout>
    <div
      class="flex align-items-center justify-content-between bg-primary-50 p-1"
    >
      <div class="flex">
        <Button
          class="p-button-sm p-button-text"
          label="กลับหน้ารายการ"
          icon="pi pi-arrow-left"
          @click="router.push({ name: 'images_job_approve' })"
        />
        <Button
          :disabled="ischeckApprove || job.status == 3"
          class="p-button-sm ml-2"
          label="เริ่มตรวจสอบ"
          icon="pi pi-play"
          @click="startApproveJob()"
        />
        <Button
          :disabled="!ischeckApprove || checkSuccess"
          class="p-button-sm ml-2"
          label="หยุดตรวจสอบ"
          icon="pi pi-pause"
          @click="stopApproveJob()"
        />
        <ToggleButton
          :disabled="!ischeckApprove"
          v-model="statusAllImage"
          onLabel="ผ่านทั้งหมด"
          offLabel="ยกเลิกผ่านทั้งหมด"
          onIcon="pi pi-check"
          offIcon="pi pi-times"
          class="p-button-sm ml-2"
          @change="updateAllStatusImage"
        />
      </div>
      <div class="flex">
        <Chip
          :label="data_list.length.toString()"
          icon="pi pi-image"
          class="ml-2 bg-primary-100"
        />
        <Chip
          :label="data_list.length.toString()"
          icon="pi pi-clock"
          class="ml-2"
        />
        <Chip label="0" icon="pi pi-check-circle" class="ml-2 bg-green-300" />
        <Chip label="0" icon="pi pi-times-circle" class="ml-2 bg-red-400" />
        <Button
          :disabled="!checkSuccess || job.status == 3"
          class="p-button-sm p-button-success ml-2"
          label="บันทึก"
          icon="pi pi-save"
          @click="endApproveJob()"
        />
      </div>
    </div>
    <div class="flex bg-primary-50">
      <div class="flex-1 flex">
        <Splitter
          class="w-full"
          @resizestart="resizeSplitter(true)"
          @resizeend="resizeSplitter(false)"
        >
          <SplitterPanel :size="50">
            <div
              style="height: 90vh"
              @scroll="onScroll"
              id="content"
              :style="[
                data_list.length == 0
                  ? 'overflow-y: hidden'
                  : 'overflow-y: auto',
              ]"
              class="m-2"
            >
              <!-- <div class="flex align-items-center justify-content-center">
                <div class="p-inputgroup">
                  <InputText placeholder="ค้นหาเอกสาร" v-model="searchItem" />
                  <Button
                    icon="pi pi-search"
                    @click="getDocumentImageGroup()"
                    class="p-button-primary"
                  />
                </div>
              </div> -->
              <div
                class="flex flex-wrap align-items-center justify-content-center"
              >
                <div
                  v-if="isDataListNull == false"
                  class="flex"
                  v-for="data in data_list"
                  :key="data.guidfixed"
                >
                  <ImageBlock
                    :images_data="data"
                    :images_selete="selectedImg"
                    :allimage_used="AllImageUsed"
                    :mode="1"
                    :ischeckApprove="ischeckApprove"
                    :sizeWidthImageBloc="sizeWidthImageBloc"
                    :sizeHeightImageBloc="sizeHeightImageBloc"
                    v-on:rejectImage="rejectImage"
                    v-on:showImg="showImg"
                    v-on:selectImg="updateStatusFrist"
                  >
                  </ImageBlock>
                </div>
                <div class="flex" v-for="i in 50" :key="i" v-if="showSkeleton">
                  <div
                    class="text-center m-3"
                    style="width: 90px; height: 90px"
                  >
                    <div
                      class="border-1 border-200 surface-50 flex align-items-center justify-content-center border-round mx-auto"
                    >
                      <Skeleton
                        style="width: 90px; height: 90px; object-fit: cover"
                      ></Skeleton>
                    </div>

                    <Skeleton class="mt-2"></Skeleton>
                  </div>
                </div>
              </div>
            </div>
          </SplitterPanel>
          <SplitterPanel :size="50" v-if="showDocumentPreview">
            <div
              v-if="showImgData == null"
              class="flex align-items-center justify-content-center h-full"
            >
              <p class="text-600">เลือกเอกสารเพื่อแสดง</p>
            </div>
            <DocumentPreview
              v-if="showImgData != null"
              :allimage_used="AllImageUsed"
              :showOveray="showOveray"
              :showImgData="showImgData"
              :selectedImag="selectedImag"
              :jobStatus="job.status"
              :ischeckApprove="ischeckApprove"
              v-on:closeDocumentPreview="closeDocumentPreview"
              v-on:rejectSuccess="rejectSuccess"
              v-on:upDateStatusImage="upDateStatusImage"
            />
          </SplitterPanel>
        </Splitter>
      </div>
    </div>

    <Dialog
      :dismissableMask="true"
      :close-on-escape="false"
      :closeOnEscape="true"
      v-model:visible="imageDialog"
      :header="'รายละเอียด ' + dataImageDialog.name"
      :breakpoints="{ '960px': '90vw', '640px': '100vw' }"
      :style="{ width: '60vw' }"
      :modal="true"
    >
      <div class="confirmation-content" id="boxconfirm" style="height: 80vh">
        <div class="flex justify-content-between mb-2">
          <div class="flex">ชื่อรูป : {{ dataImageDialog.name }}</div>
          <div class="flex">
            วันที่ :{{
              Utils.getDateTimeFormat(dataImageDialog.uploadedat)
            }}
            โดย {{ dataImageDialog.uploadedby }}
          </div>
        </div>
        <div style="margin: 0px; padding: 0px">
          <iframe
            :src="
              '/images_group/components/zoom?uri=' + dataImageDialog.imageuri
            "
          >
          </iframe>
        </div>
      </div>
    </Dialog>

    <DialogApprove
      :title="'ยืนยันการตรวจสอบ'"
      :ramdomNumber="ramdomNumber"
      :confirmDialog="dialogJobApprove"
      v-on:close="dialogJobApprove = false"
      v-on:confirmJob="jobApprove(3)"
      v-on:confirmJobFalse="confirmApproveFalse()"
    />
  </AppLayout>
</template>
<style scoped>
.p-splitter {
  border-radius: 0px;
}

.p-inputtext.p-inputtext-sm {
  font-size: 0.875rem;
}
</style>
