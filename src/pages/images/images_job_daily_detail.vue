<script setup>
import DialogApprove from "@/components/form/DialogApprove.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import ImageDataService from "@/services/ImageDataService";
import MasterdataService from "@/services/MasterdataService";
import TaskService from "@/services/TaskService";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import ImageBlock from "./components/ImagesBlock.vue";
import $ from "jquery";

import DocumentPreview from "./components/documentPreview.vue";
import JournalForm from "../daily/components/journal_form.vue";
import VatForm from "../daily/components/vat_form.vue";
import TaxForm from "../daily/components/tax_form.vue";

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
const openDetailDocNo = ref(false);
const daily_form = ref({});
const daily_form_valid = ref({
  accountdescription: false,
  accountgroup: false,
  accountperiod: false,
  accountyear: false,
  amount: false,
  batchId: false,
  docdate: false,
  docno: false,
  bookcode: false,
});
const taxes = ref([]);
const taxes_valid = ref([
  {
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  },
]);
const vats = ref([]);
const vats_valid = ref([
  {
    vatdate: false,
    vatdocno: false,
    vatperiod: false,
    vatyear: false,
    vatbase: false,
    vatrate: false,
    vatamount: false,
    exceptvat: false,
    custname: false,
    custtaxid: false,
    branchcode: false,
  },
]);

const myWindow = ref();
const newWindow = ref(false);

// ใช้เช็ค จอ 2 ว่าเปิดอยู่ไหม
const idrandom = ref("");
const countIsOpenPopupImage = ref(0);
const myInterval = ref(null);

onUnmounted(() => {
  console.log(
    "unmounted--------------------------------------------------------"
  );

  if (job.value.status == 3) {
    WsConnectAllImage.value.close();
    WsConnectImage.value.close();
    connection.value.close();
  }
});

onMounted(() => {
  jobId.value = route.params.id;
  getDocumentImageGroup();
  getTaskById(jobId.value);

  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_job_daily_detail");
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
        route.name == "images_job_daily_detail"
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
        route.name == "images_job_daily_detail"
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

    console.log("AllImageUsed ", AllImageUsed.value);
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
        route.name == "images_job_daily_detail"
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

function getAllSelectImage() {
  MasterdataService.getAllSelectImage()
    .then((res) => {
      console.log("getAllSelectImage");
      console.log(res);
      if (res.success) {
        AllImageUsed.value = res.data;
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
      console.log(res);
      if (res.success) {
        job.value = res.data;
        storeApp.setPageTitle("บันทึกรายวัน JOB #" + job.value.name);
        console.log(job.value.status);
        if (job.value.status == 3) {
          ischeckApprove.value = true;
          WSImageConnect();
          WsAllImageConnect();
          websocketConnect();
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

function getDocumentImageGroupScroll() {
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
  showImgData.value = data.imagereferences;
  showDocumentPreview.value = true;

  resetIndex.value = 1;
}

function createGL(data) {
  var sendData = { docref: data.guidfixed };
  if (checkUseImgByUser(localStorage._usercode)) {
    swapImage(data.guidfixed);
  } else {
    MasterdataService.postSelectImage(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
            router.push({
              name: "daily_images_job_form",
              params: { id: jobId.value },
            });
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

function swapImage(data) {
  var sendData = { docref: data };
  if (checkUseImgByUser(localStorage._usercode)) {
    MasterdataService.postSelectImageForce(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
            router.push({
              name: "daily_images_job_form",
              params: { id: jobId.value },
            });
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

function checkUseImgByUser(user) {
  var found = 0;
  AllImageUsed.value.forEach((element) => {
    if (element.username == user) {
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

function endDailyJob() {
  console.log("endDailyJob");
  ramdomNumber.value = Utils.generateRandomNumber();
  dialogJobApprove.value = true;
}

function confirmApproveFalse() {
  ramdomNumber.value = Utils.generateRandomNumber();
}

// บันทึกเสร็จแล้ว
async function jobApprove(statusJob) {
  dialogJobApprove.value = false;
  let status = {
    status: statusJob,
  };
  console.log(statusJob);
  try {
    const res = await TaskService.putTaskStatus(jobId.value, status);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });

      setTimeout(() => {
        router.push({ name: "images_job_daily" });
      }, 200);
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

function checkImagereferences() {
  let notImagereferences = 0;
  data_list.value.forEach((element) => {
    // console.log(element);
    if (element.references.length == 0) {
      if (element.status == 1) {
        notImagereferences += 1;
      }
    }
  });

  // console.log(notImagereferences);

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

function selectSizeImageBloc() {
  if (sizeImageBloc.value) {
    sizeWidthImageBloc.value = 90;
    sizeHeightImageBloc.value = 90;
  } else {
    sizeWidthImageBloc.value = 230;
    sizeHeightImageBloc.value = 230;
  }
}

function getGLDetail(docno) {
  console.log(docno);

  MasterdataService.getGLledger(docno)
    .then((res) => {
      if (res.success) {
        console.log(res);
        openDetailDocNo.value = true;
        const vat = res.data.vats;
        const tax = res.data.taxes;

        daily_form.value.docno = res.data.guidfixed;
        daily_form.value.accountdescription = res.data.accountdescription;
        daily_form.value.accountgroup = res.data.accountgroup;
        daily_form.value.accountperiod = res.data.accountperiod;
        daily_form.value.accountyear = res.data.accountyear;
        daily_form.value.amount = res.data.amount;
        daily_form.value.batchId = res.data.batchId;
        daily_form.value.journaltype = res.data.journaltype.toString();
        daily_form.value.docdate = Utils.getDateTimeFromDate(res.data.docdate);
        daily_form.value.docno = res.data.docno;
        daily_form.value.bookcode = res.data.bookcode;
        daily_form.value.journaldetail = res.data.journaldetail;
        if (daily_form.value.exdocrefdate == "0001-01-01T00:00:00Z") {
          daily_form.value.exdocrefdate = "";
        } else {
          daily_form.value.exdocrefdate = Utils.getDateTimeFromDate(
            res.data.exdocrefdate
          );
        }
        daily_form.value.exdocrefno = res.data.exdocrefno;

        if (vat.length > 0) {
          vats.value = [];
          vats_valid.value = [];

          for (var i = 0; i < res.data.vats.length; i++) {
            var vattemp = {
              vattype: vat[i].vattype,
              vatdate: Utils.getDateTimeFromDate(vat[i].vatdate),
              vatdocno: vat[i].vatdocno,
              vatperiod: vat[i].vatperiod,
              vatyear: vat[i].vatyear,
              vatbase: vat[i].vatbase,
              vatrate: vat[i].vatrate,
              vatamount: vat[i].vatamount,
              exceptvat: vat[i].exceptvat,
              vatmode: vat[i].vatmode,
              vatsubmit: vat[i].vatsubmit,
              custname: vat[i].custname,
              custtaxid: vat[i].custtaxid,
              organization: vat[i].organization,
              branchcode: vat[i].branchcode,
              remark: vat[i].remark,
            };
            putvatValid();
            vats.value.push(vattemp);
          }
        }

        if (tax.length > 0) {
          taxes.value = [];
          taxes_valid.value = [];
          for (var i = 0; i < tax.length; i++) {
            var taxes_temp = {
              taxdocno: tax[i].taxdocno,
              taxdate: Utils.getDateTimeFromDate(tax[i].taxdate),
              custname: tax[i].custname,
              custtype: tax[i].custtype,
              custtaxid: tax[i].custtaxid,
              taxtype: tax[i].taxtype,
              address: tax[i].address,
              details: [],
            };

            if (tax[i].details != null && tax[i].details.length > 0) {
              var sumamount = 0;
              var sumbase = 0;
              tax[i].details.forEach((data) => {
                var details_temp = {
                  description: data.description,
                  taxbase: data.taxbase,
                  taxrate: data.taxrate,
                  taxamount: data.taxamount,
                };

                taxes_temp.details.push(details_temp);
              });
            } else {
              taxes_temp.details = [
                {
                  description: "",
                  taxbase: 0,
                  taxrate: 0,
                  taxamount: 0,
                },
              ];
            }
            puttaxValid();
            taxes.value.push(taxes_temp);
          }
        }

        // console.log(daily_form.value);
        // console.log(vats.value);
        // console.log(taxes.value);

        // toast.add({
        //   severity: "success",
        //   summary: "success",
        //   detail: "ดึงข้อมูลเอกสาร : " + docno + " สำเร็จ",
        //   life: 3000,
        // });
      }
    })
    .catch((err) => {
      console.log(err);
      openDetailDocNo.value = false;
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ไม่สามารถดึงข้อมูล " + docno + " ได้ " + err,
        life: 3000,
      });
    });
}

function goList() {
  router.push({ name: "images_job_daily" });
}

function openImageNewWindow() {
  if (idrandom.value == "") {
    idrandom.value = Utils.generateRandomNumber();
  }
  if (newWindow.value) {
    myWindow.value = window.open(
      router.resolve({
        name: "images_job_daily_detail_view",
        params: { id: jobId.value, idrandom: idrandom.value },
      }).href,
      "myWindow",
      "width=1000, height=1000"
    );
    countIsOpenPopupImage.value = 0;
    myInterval.value = setInterval(() => {
      checkPopupOpenImage();
    }, 300);
  } else {
    if (myWindow.value != undefined) {
      myWindow.value.close();
      clearInterval(myInterval.value);
      localStorage.removeItem(idrandom.value);
      idrandom.value = "";
    }
  }
}

// ใช้เช็ค จอ 2 ว่าเปิดอยู่ไหม
async function checkPopupOpenImage() {
  let popupImageStatus = localStorage.getItem(idrandom.value);

  if (popupImageStatus == "1") {
    localStorage.setItem(idrandom.value, "0");
    countIsOpenPopupImage.value = 0;
  } else {
    if (countIsOpenPopupImage.value > 3) {
      console.log("Close New Window Image");
      if (myInterval.value != null) {
        newWindow.value = false;
        clearInterval(myInterval.value);
        localStorage.removeItem(idrandom.value);
        idrandom.value = "";
      }

      // let sendData = { docref: selectedImag.value.guidfixed };
      // try {
      //   const res = await MasterdataService.postUnSelectImage(sendData);
      //   // console.log(res);
      //   if (res.success) {
      //     if (myInterval.value != null) {
      //       newWindow.value = false;
      //       clearInterval(myInterval.value);
      //       localStorage.removeItem(idrandom.value);
      //     }
      //   }
      // } catch (err) {
      //   console.log(err);
      //   toast.add({
      //     severity: "error",
      //     summary: "error",
      //     detail: err.response.data.message,
      //     life: 3000,
      //   });
      // }
    }
    countIsOpenPopupImage.value += 1;
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
          @click="goList()"
        />
      </div>
      <div class="flex">
        <ToggleButton
          v-model="newWindow"
          onLabel=""
          offLabel=""
          offIcon="pi pi pi-desktop"
          onIcon="pi pi-times"
          @change="openImageNewWindow()"
          class="p-button-text"
        />
        <ToggleButton
          v-model="sizeImageBloc"
          onLabel=""
          offLabel=""
          offIcon="pi pi-th-large"
          onIcon="pi pi-table"
          @change="selectSizeImageBloc()"
          class="ml-2"
        ></ToggleButton>

        <Button
          :disabled="!checkSuccess || job.status == 4"
          class="p-button-sm p-button-success ml-2"
          label="บันทึก"
          icon="pi pi-save"
          @click="endDailyJob()"
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
                    :modeMenu="3"
                    :images_data="data"
                    :images_selete="selectedImg"
                    :allimage_used="AllImageUsed"
                    :ischeckApprove="ischeckApprove"
                    :sizeWidthImageBloc="sizeWidthImageBloc"
                    :sizeHeightImageBloc="sizeHeightImageBloc"
                    v-on:showImg="showImg"
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
              :modeMenu="3"
              v-on:closeDocumentPreview="closeDocumentPreview"
              v-on:upDateStatusImage="upDateStatusImage"
              v-on:createGL="createGL"
              v-on:viewGL="getGLDetail"
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
      v-on:confirmJob="jobApprove(4)"
      v-on:confirmJobFalse="confirmApproveFalse()"
    />

    <Dialog
      v-model:visible="openDetailDocNo"
      :breakpoints="{ '960px': '90vw', '640px': '100vw' }"
      :style="{ width: '60vw' }"
    >
      <template #header>
        <h3>{{ $t("docno") }} : {{ daily_form.docno }}</h3>
      </template>
      <div class="confirmation-content" id="boxconfirm" style="height: 70vh">
        <TabView class="tabview-custom" ref="tabview">
          <TabPanel>
            <template #header>
              <i class="pi pi-book mr-1"></i>
              <span> {{ $t("journal") }}</span>
            </template>
            <JournalForm
              :isUpdate="true"
              :daily_form="daily_form"
              :daily_form_valid="daily_form_valid"
            >
            </JournalForm>
          </TabPanel>
          <TabPanel>
            <template #header>
              <i class="pi pi-wallet mr-1"></i>
              <span> {{ $t("vat") }}</span>
            </template>
            <VatForm
              :isUpdate="true"
              :vats="vats"
              :vats_valid="vats_valid"
            ></VatForm>
          </TabPanel>
          <TabPanel>
            <template #header>
              <i class="pi pi-wallet mr-1"></i>
              <span> {{ $t("taxes") }}</span>
            </template>
            <TaxForm
              :isUpdate="true"
              :taxes="taxes"
              :taxes_valid="taxes_valid"
            ></TaxForm>
          </TabPanel>
        </TabView>
      </div>
    </Dialog>
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
