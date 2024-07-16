<script setup>
import DialogApprove from "@/components/DialogApprove.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import ImageDataService from "@/services/ImageDataService";
import MasterdataService from "@/services/MasterdataService";
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
const limitPage = ref(100);

const showSkeleton = ref(false);
const totalPage = ref(0);
const selectSort = ref("xorder");

const sortOrder = ref(1);

const selectedImg = ref([]);

const showImageByStatus = ref("1,3,4");

const imageDialog = ref(false);
const dataImageDialog = ref({});

const jobId = ref("");

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

const sizeImageBloc = ref(true);
const sizeWidthImageBloc = ref(90);
const sizeHeightImageBloc = ref(90);

const ramdomNumber = ref();
const checkSuccess = ref(false);

const WsConnectImage = ref();
const WsConnectAllImage = ref();
const connection = ref();

const resetIndex = ref(0);
const fromScreen = ref("");

const idrandom = ref("");
const nullImage = ref(false);

function checkPopupOpenImage() {
  localStorage.setItem(idrandom.value, "1");
}

onUnmounted(() => {
  console.log(
    "unmounted--------------------------------------------------------"
  );

  WsConnectAllImage.value.close();
  WsConnectImage.value.close();
  connection.value.close();
});

onMounted(() => {
  idrandom.value = route.params.idrandom;
  jobId.value = route.params.id;

  setInterval(() => {
    checkPopupOpenImage();
  }, 300);

  getDocumentImageGroup();
  getTaskById(jobId.value);

  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_job_daily_detail_view");
  websocketConnect();
  WSImageConnect();
  WsAllImageConnect();
});

function websocketConnect() {
  connection.value = new WebSocket(
    "wss://api.dev.dedepos.com/gl/journal/ws/form?apikey=" +
      localStorage.getItem("_token")
  );
  connection.value.onopen = function (event) {
    //console.log(event);
    //console.log("Successfully connected to the echo websocket server...");
  };
  connection.value.onmessage = function (event) {
    // console.log("websocketConnect ", event);
    // var jsonData = JSON.parse(event.data);
    // if (jsonData.docref != "") {
    //     MasterdataService.getImagesByDocref(jsonData.docref)
    //         .then((res) => {
    //             if (res.success) {
    //                 //console.log(res.data);
    //                 if (res.data.imagereferences.length > 0) {
    //                     //router.push({ name: "daily_images_show" });
    //                 }
    //             }
    //         })
    //         .catch((err) => {
    //             // console.log(err);
    //         });
    // }
  };

  connection.value.onclose = function (e) {
    console.log(
      "Socket is closed. Reconnect will be attempted in 1 second.",
      e.reason
    );
    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "images_job_daily_detail_view"
      ) {
        console.log(
          "Socket is closed. Reconnect will be attempted in 1 second.",
          e.reason
        );
        websocketConnect();
        getAllSelectImage();
      }
    }, 1000);
  };
}

function WSImageConnect() {
  WsConnectImage.value = new WebSocket(
    "wss://api.dev.dedepos.com/gl/journal/ws/image?apikey=" +
      localStorage.getItem("_token")
  );

  WsConnectImage.value.onopen = function (event) {
    // console.log(event);
    // console.log(
    //   "WsConnectImage Successfully connected to the echo websocket server..."
    // );
  };
  WsConnectImage.value.onmessage = function (event) {
    //console.log("WSImageConnect ", event);
  };
  WsConnectImage.value.onclose = function (e) {
    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "images_job_daily_detail_view"
      ) {
        console.log(
          "Socket is closed. Reconnect will be attempted in 1 second.",
          e.reason
        );
        WSImageConnect();
        getAllSelectImage();
      }
    }, 1000);
  };
}
function WsAllImageConnect() {
  console.log("Starting connection to WebSocket Server");
  WsConnectAllImage.value = new WebSocket(
    "wss://api.dev.dedepos.com/gl/journal/ws/docref?apikey=" +
      localStorage.getItem("_token")
  );
  WsConnectAllImage.value.onopen = function (event) {
    // console.log("onopen", event);
    // console.log(
    //     "WsAllImage Connect Successfully connected to the echo websocket server..."
    // );
  };
  WsConnectAllImage.value.onmessage = function (event) {
    console.log("WsAllImageConnect", event);
    var jsonData = JSON.parse(event.data);
    console.log("jsonData ", jsonData);
    if (jsonData.status == "selected") {
      console.log("selected");
      var found = 0;
      AllImageUsed.value.forEach((data) => {
        if (data.docref == jsonData.docref) {
          found += 1;
        }
      });
      if (found == 0) {
        AllImageUsed.value.push({
          docref: jsonData.docref,
          username: jsonData.username,
        });
      }
    } else if (jsonData.status == "deselected") {
      console.log("unselected");
      var rebuild = [];
      AllImageUsed.value.forEach((data) => {
        if (data.docref != jsonData.docref) {
          rebuild.push(data);
        }
      });
      AllImageUsed.value = rebuild;
    }
    console.log("AllImageUsed ", AllImageUsed.value.length);

    setTimeout(() => {
      setUseImage();
    }, 100);
  };
  WsConnectAllImage.value.onclose = function (e) {
    console.log(
      "WsAllImageConnect Socket is closed. Reconnect will be attempted in 1 second.",
      e.reason
    );
    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "images_job_daily_detail_view"
      ) {
        console.log(
          "Socket is closed. Reconnect will be attempted in 1 second.",
          e.reason
        );
        WsAllImageConnect();
        getAllSelectImage();
      }
    }, 1000);
  };
}

function setUseImage() {
  let imageUse = "";
  AllImageUsed.value.forEach((element) => {
    if (element.username == localStorage._usercode) {
      imageUse = element.docref;
    }
  });

  const result = data_list.value.filter((data) => data.guidfixed == imageUse);

  //console.log(result[0]);
  if (result.length == 0) {
    nullImage.value = true;
  } else {
    nullImage.value = false;
    showImg(result[0]);
  }
}

function getAllSelectImage() {
  MasterdataService.getAllSelectImage()
    .then((res) => {
      console.log("getAllSelectImage");
      console.log(res);
      if (res.success) {
        console.log(res.data.length);
        if (res.data.length == 0) {
          nullImage.value = true;
        } else {
          nullImage.value = false;
          AllImageUsed.value = res.data;
          setUseImage();
        }
      }
    })
    .catch((err) => {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ดึงข้อมูลล้มเหลว " + err,
        life: 3000,
      });
    });
}

function getTaskById(guidfixed) {
  TaskService.getTaskById(guidfixed)
    .then((res) => {
      //console.log(res);
      if (res.success) {
        job.value = res.data;
        storeApp.setPageTitle("บันทึกรายวัน JOB #" + job.value.name);
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
  limitPage.value = 100;
  showSkeleton.value = true;
  ImageDataService.getDocumentImageGroup(
    limitPage.value,
    activePage.value,
    searchItem.value,
    selectSort.value,
    sortOrder.value,
    showImageByStatus.value,
    fromDate.value,
    toDate.value,
    jobId.value
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
          getAllSelectImage();
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
    showImageByStatus.value,
    fromDate.value,
    toDate.value,
    jobId.value
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

          checkImagereferences();

          isDataListNull.value = false;
          loading.value = false;
          showSkeleton.value = false;
          totalPage.value = res.pagination.totalPage;
          totalItemsCount.value = res.pagination.total;
        }
        getAllSelectImage();
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

function resizeSplitter(isOveray) {
  showOveray.value = isOveray;
}

function showImg(data) {
  selectedImag.value = data;

  console.log(data.imagereferences.length);
  showImgData.value =
    data.imagereferences.length > 0 ? data.imagereferences : [];
  showDocumentPreview.value = true;
  resetIndex.value = 1;
}

function chooseImage(data) {
  showImg(data);
  swapImage(data.guidfixed);
}

function swapImage(data) {
  var sendData = { docref: data };

  if (!checkUseImgByUser(localStorage._usercode, data)) {
    MasterdataService.postSelectImageForce(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
          }
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
}

function checkUseImgByUser(user, guidfixed) {
  var found = 0;
  AllImageUsed.value.forEach((element) => {
    if (element.username == user && element.docref == guidfixed) {
      found += 1;
    }
  });

  if (found == 0) {
    return false;
  } else {
    return true;
  }
}

function closeDocumentPreview() {
  showDocumentPreview.value = false;
}

function checkImagereferences() {
  let notImagereferences = 0;
  data_list.value.forEach((element) => {
    // console.log(element.references.length);
    if (element.references.length == 1) {
      notImagereferences += 1;
    }
  });

  if (notImagereferences == 0) {
    checkSuccess.value = true;
  } else {
    checkSuccess.value = false;
  }

  console.log("checkImagereferences : " + checkSuccess.value);
}

async function upDateStatusImage(data) {
  console.log(data);

  // 99= ตั้งค่าสถานะให้ icon โหลด
  data_list.value.filter(function (ele) {
    if (ele.guidfixed == data.guidfixed) {
      ele.status = 99;
    }
  });
  console.log(data_list.value);

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

    checkImagereferences();
  }, 300);
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
</script>
<template>
  <div v-if="nullImage">
    <div
      class="flex justify-content-center align-items-center"
      style="height: 90vh"
    >
      <div class="text-center">
        <div class="mb-3 font-bold text-6xl text-900">
          Picture not selected!
        </div>
        <p class="text-700 text-3xl mt-0 mb-6">
          Please select an image in jobName
          <span class="text-primary font-medium underline">
            #{{ job.name }}</span
          >
        </p>
      </div>
    </div>
  </div>

  <div class="flex bg-primary-50 p-1" v-if="!nullImage">
    <div class="flex-1 flex">
      <Splitter
        class="w-full"
        @resizestart="resizeSplitter(true)"
        @resizeend="resizeSplitter(false)"
      >
        <SplitterPanel :size="5">
          <div
            style="height: 95vh"
            @scroll="onScroll"
            id="content"
            :style="[
              data_list.length == 0 ? 'overflow-y: hidden' : 'overflow-y: auto',
            ]"
            class="m-2"
          >
            <div
              class="flex flex-wrap align-items-center justify-content-center"
            >
              <template v-for="data in data_list" :key="data.guidfixed">
                <div v-if="isDataListNull == false" class="flex">
                  <ImageBlock
                    :modeMenu="3"
                    :images_data="data"
                    :images_selete="selectedImg"
                    :allimage_used="AllImageUsed"
                    :ischeckApprove="ischeckApprove"
                    :sizeWidthImageBloc="sizeWidthImageBloc"
                    :sizeHeightImageBloc="sizeHeightImageBloc"
                    v-on:showImg="chooseImage"
                  >
                  </ImageBlock>
                </div>
              </template>

              <template v-for="i in 50" :key="i">
                <div class="flex" v-if="showSkeleton">
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
              </template>
            </div>
          </div>
        </SplitterPanel>
        <SplitterPanel :size="95" v-if="showDocumentPreview">
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
            :ischeckApprove="true"
            :modeMenu="4"
            v-on:closeDocumentPreview="closeDocumentPreview"
            v-on:upDateStatusImage="upDateStatusImage"
          />
        </SplitterPanel>
      </Splitter>
    </div>
  </div>
</template>
<style scoped>
.p-splitter {
  border-radius: 0px;
}

.p-inputtext.p-inputtext-sm {
  font-size: 0.875rem;
}
</style>
