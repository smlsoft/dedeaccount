<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import ImageDataService from "@/services/ImageDataService";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import { DomHandler } from "primevue/utils";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import ImageBlock from "../images_group/components/ImagesBlock.vue";
import ImagesGallery from "../images/components/ImagesGallery.vue";
import DialogForm from "@/components/form/DialogForm.vue";
import $ from "jquery";

const content = ref();
const conchange = "ต้องการเปลี่ยนรูปภาพ";
const storeApp = useApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const detail = ref();
const data_list = ref([]);
const deleteDetailDialog = ref(false);
const totalItemsCount = ref(10);
const filters = ref(null);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const data_import = ref([]);
const doneTypingInterval = ref(1000);
const onUploadProgress = ref(0);
const firstPage = ref(0);
const showImgDialog = ref(false);
const showImageDocRef = ref("");
const uploadmodel = ref(false);
const showImgHeader = ref("");
const showImgSrc = ref(null);
const isShowAll = ref(true);
const isShowWait = ref(false);
const isShowUnApprove = ref(false);
const AllImageUsed = ref([]);
const searchItem = ref("");
const limitPage = ref(50);
const showContent = ref("");
const createDialog = ref(false);
const data_gallery = ref([]);
const fileLimit = ref(50);
const uploadedFileCount = ref(0);
const updateRefDialog = ref(false);
const WsConnectImage = ref();
const showSkeleton = ref(false);
const WsConnectAllImage = ref();
const totalPage = ref(0);
const gallery_form = ref({
  code: "",
  name: "",
  creator: "superadmin",
  create_date: "26/06/2022",
});
const selectSort = ref("uploadedat");
const sortField = ref([
  {
    code: "uploadedat",
    name: "วันที่ Upload",
  },
  {
    code: "title",
    name: "ชื่อรูป",
  },
]);
const sortOrder = ref(-1);
const isGallery = ref(false);
const selectedImg = ref([]);
const groupDocRef = ref("");
const confirmChangeImageDialog = ref(false);
const newDocRefImage = ref("");
const showImageGallery = ref(false);
const connection = ref();
const sortRef = ref("0");
const sortReject = ref("0");
const showImageBy = ref("unsave");
onUnmounted(() => {
  console.log("unmounted--------------------------------------------------------");
  connection.value.close();
  WsConnectAllImage.value.close();
  WsConnectImage.value.close();
});

onMounted(() => {
  getDocumentImageGroup();

  storeApp.setActivePage("daily");
  storeApp.setActiveChild("daily_images_list");
  /*
  data_gallery.value.push({
    code: "0001",
    name: "เอกสารซื้อ2606",
    creator: "superadmin",
    create_date: "26/06/2022",
  });
  data_gallery.value.push({
    code: "0002",
    name: "เอกสารขาย2806",
    creator: "superadmin",
    create_date: "26/06/2022",
  });
*/
  if (route.params.id != "" && route.params.id != "" && route.params.id != undefined) {
    isGallery.value = true;
    storeApp.setPageTitle("รูปภาพเอกสาร Gallery" + route.params.id);
    data_gallery.value = [];
  } else {
    storeApp.setPageTitle("รูปภาพเอกสาร ");
  }
  //console.log(localStorage.getItem("_token"));
  websocketConnect();
  WSImageConnect();
  WsAllImageConnect();
});
function goForm() {
  router.push({ name: "daily_images_form" });
}

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
    console.log("onmessage ", event);
    var jsonData = JSON.parse(event.data);
    if (jsonData.docref != "") {
      MasterdataService.getImagesByDocref(jsonData.docref)
        .then((res) => {
          if (res.success) {
            console.log(res.data);
            if (res.data.imagereferences.length > 0) {
              router.push({ name: "daily_images_show" });
            }
          }
        })
        .catch((err) => {
          // console.log(err);
        });
    }
  };

  connection.value.onclose = function (e) {
    console.log("Socket is closed. Reconnect will be attempted in 1 second.", e.reason);
    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "daily_images_list"
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
    console.log("WsConnectImage ", event);
  };
  WsConnectImage.value.onclose = function (e) {
    // console.log(
    //   "WsConnectImage Socket is closed. Reconnect will be attempted in 1 second.",
    //   e.reason
    // );
    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "daily_images_list"
      ) {
        console.log(
          "Socket is closed. Reconnect will be attempted in 1 second.",
          e.reason
        );
        WSImageConnect();
      }
    }, 1000);
  };
}
function WsAllImageConnect() {
  WsConnectAllImage.value = new WebSocket(
    "wss://api.dev.dedepos.com/gl/journal/ws/docref?apikey=" +
    localStorage.getItem("_token")
  );
  WsConnectAllImage.value.onopen = function (event) {
    // console.log(event);
    // console.log(
    //   "WsAllImage Connect Successfully connected to the echo websocket server..."
    // );
  };
  WsConnectAllImage.value.onmessage = function (event) {
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
    // console.log(
    //   "WsAllImageConnect Socket is closed. Reconnect will be attempted in 1 second.",
    //   e.reason
    // );

    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "daily_images_list"
      ) {
        console.log(
          "Socket is closed. Reconnect will be attempted in 1 second.",
          e.reason
        );
        WsAllImageConnect();
      }
    }, 1000);
  };
}



function selectGallery(data) {
  router.push({ name: "list_images_param", params: { id: data } });

  setTimeout(() => {
    window.location.reload();
  }, 100);
}
function goList(data) {
  router.push({ name: "list_images" });
  setTimeout(() => {
    window.location.reload();
  }, 100);
}

function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
  console.log(activePage.value);
  loading.value = true;
  getDocumentImageGroup();
}

function nextPage() {
  activePage.value += 1;

  if (activePage.value <= totalPage.value) {
    getDocumentImageGroupScroll();
  }
}


function getDocumentImageGroupScroll() {
    showSkeleton.value = true;
    ImageDataService.getDocumentImageGroup(
        limitPage.value,
        activePage.value,
        searchItem.value,
        selectSort.value,
        sortOrder.value,
        showImageBy.value
    )
        .then((res) => {
            console.log(res);
            if (res.success) {
                setTimeout(() => {
                    res.data.forEach((ele) => {
                        ele.isUpdate = false;

                        let references = ele.references ?? [];
                        if (ele.references == undefined) {
                            ele.references = references;
                        }

                        ele.imagereferences.sort(function (a, b) {
                            return a.xorder - b.xorder;
                        });
                        
                        data_list.value.push(ele);
                    });

                    //console.log(data_list.value);

                    //onsole.log(totalItemsCount.value);
                    getAllSelectImage();
                    firstPage.value = activePage.value;

                    // console.log("firstPage" + firstPage.value);
                    showSkeleton.value = false;
                }, 500);
            }
        })
        .catch((err) => {
            console.log(err);
            showSkeleton.value = false;
        });
}


function getDocumentImageGroup() {
    loading.value = true;

    ImageDataService.getDocumentImageGroup(
        limitPage.value,
        activePage.value,
        searchItem.value,
        selectSort.value,
        sortOrder.value,
        showImageBy.value
    )
        .then((res) => {
            console.log(res);
            if (res.success) {
                data_list.value = res.data;

                data_list.value = data_list.value.map((element) => {
                    let references = element.references ?? [];
                    element.references = references;
                    return element
                });

                data_list.value.forEach((element, index) => {
                    element.imagereferences.sort(function (a, b) {
                        return a.xorder - b.xorder;
                    });
                });

                loading.value = false;
                totalPage.value = res.pagination.totalPage;
                totalItemsCount.value = res.pagination.total;
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


function getDocImageListDefualt() {
  loading.value = true;
  selectedImg.value = [];
  limitPage.value = 50;
  activePage.value = 1;
  searchItem.value = "";
  getDocumentImageGroup();
}

function getAllSelectImage() {
  MasterdataService.getAllSelectImage()
    .then((res) => {
      //  console.log(res);
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

function selectImg(data) {
  console.log(data);

  var sendData = { docref: data };
  if (checkUseImgByUser(localStorage._usercode)) {
    confirmChangeImageDialog.value = true;
    newDocRefImage.value = data;
  } else {
    MasterdataService.postSelectImage(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
          }
          router.push({ name: "daily_images_show" });
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


function changeImage(data) {
  var sendData = { docref: data };
  if (checkUseImgByUser(localStorage._usercode)) {
    MasterdataService.postSelectImageForce(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
            confirmChangeImageDialog.value = false;
            router.push({ name: "daily_images_show" });
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
  } else if (checkUseImg(data)) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "ไม่สามารถเลือกรูปได้มีผู้ใช้กำลังใช้งานอยู่ ",
      life: 3000,
    });
  } else {
    MasterdataService.postSelectImage(sendData)
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

function checkUseImg(data) {
  var found = 0;
  AllImageUsed.value.forEach((element) => {
    if (element.docref == data) {
      found += 1;
    }
  });

  if (found == 0) {
    return false;
  } else {
    return true;
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



function selectSortUse(event) {
  selectSort.value = event.value;
  getDocImageListDefualt();
}
function selectSortOrder(data) {
  console.log(data);
  sortOrder.value = data;
  getDocImageListDefualt();
}


function onScroll() {
  let div = $("#maincontainer")[0];
  if (div.scrollTop + div.clientHeight >= div.scrollHeight - 10) {
    if (!showSkeleton.value) {
      nextPage();
    }
  }
}
</script>

<template>
  <AppLayout>
    <MainContentWarp @scroll="onScroll">
      <Card class="p-3" ref="content">
        <template #header>
          <div class="p-inputgroup mt-2">
            <InputText placeholder="ค้นหาเอกสาร" v-model="searchItem" />
            <Button icon="pi pi-search" @click="getDocumentImageGroup()" class="p-button-primary" />
          </div>
          <div class="flex justify-content-between">
            <div class="grid mt-3 ml-1">
              <Paginator class="justify-content-start" :rows="limitPage" v-model:first="firstPage"
                :totalRecords="totalItemsCount" @page="onPage($event)">
              </Paginator>
            </div>
            <div class="grid mt-3 mr-1">
              <div class="flex align-items-center ml-2">
                <span class="mr-2 text-900">การเรียงข้อมูล</span>
                <Dropdown v-model="selectSort" :options="sortField" optionLabel="name" optionValue="code"
                  @change="selectSortUse($event)">
                </Dropdown>
                <i v-if="sortOrder == -1" class="pi pi-sort-amount-up-alt cursor-pointer ml-2" style="font-size: 1.5rem"
                  @click="selectSortOrder(1)"></i>
                <i v-if="sortOrder == 1" class="pi pi pi-sort-amount-down-alt cursor-pointer ml-2"
                  style="font-size: 1.5rem" @click="selectSortOrder(-1)"></i>
              </div>
            </div>
          </div>
        </template>
        <template #content class="p-0">
          <div class="p-3 card" v-if="data_gallery.length == 0 && data_list.length == 0">
            <div class="flex align-content-center justify-content-center flex-wrap card-container"
              style="min-height: 56vh">
              <div class="p-0">
                <ProgressSpinner />
              </div>
            </div>
          </div>
          <div class="grid">
            <div class="col-12 md:col-6 lg:col-4 xl:col-3" v-for="data in data_list" :key="data.guidfixed">
              <ImageBlock :images_data="data" :images_selete="selectedImg" :allimage_used="AllImageUsed" :mode="4"
                v-on:selectImg="selectImg"></ImageBlock>
            </div>
            <div class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0" v-if="showSkeleton">
              <div class="custom-skeleton p-4">
                <div class="flex mb-3">
                  <div>
                    <Skeleton width="10rem" class="mb-2"></Skeleton>
                    <Skeleton width="5rem" class="mb-2"></Skeleton>
                    <Skeleton height=".5rem"></Skeleton>
                  </div>
                </div>
                <Skeleton width="100%" height="150px"></Skeleton>
                <div class="flex justify-content-center mt-3">
                  <Skeleton width="4rem" height="2rem"></Skeleton>
                  <Skeleton width="4rem" height="2rem"></Skeleton>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0" v-if="showSkeleton">
              <div class="custom-skeleton p-4">
                <div class="flex mb-3">
                  <div>
                    <Skeleton width="10rem" class="mb-2"></Skeleton>
                    <Skeleton width="5rem" class="mb-2"></Skeleton>
                    <Skeleton height=".5rem"></Skeleton>
                  </div>
                </div>
                <Skeleton width="100%" height="150px"></Skeleton>
                <div class="flex justify-content-center mt-3">
                  <Skeleton width="4rem" height="2rem"></Skeleton>
                  <Skeleton width="4rem" height="2rem"></Skeleton>
                </div>
              </div>
            </div>
            <div class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0" v-if="showSkeleton">
              <div class="custom-skeleton p-4">
                <div class="flex mb-3">
                  <div>
                    <Skeleton width="10rem" class="mb-2"></Skeleton>
                    <Skeleton width="5rem" class="mb-2"></Skeleton>
                    <Skeleton height=".5rem"></Skeleton>
                  </div>
                </div>
                <Skeleton width="100%" height="150px"></Skeleton>
                <div class="flex justify-content-center mt-3">
                  <Skeleton width="4rem" height="2rem"></Skeleton>
                  <Skeleton width="4rem" height="2rem"></Skeleton>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
      <DialogForm :confirmDialog="confirmChangeImageDialog" :textContent="conchange"
        v-on:close="confirmChangeImageDialog = false" v-on:confirm="changeImage(newDocRefImage)"></DialogForm>
    </MainContentWarp>
  </AppLayout>
</template>
<style>
.p-card-body {
  padding: 0px !important;
}
</style>
