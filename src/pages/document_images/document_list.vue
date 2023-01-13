<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import ImageDataService from "@/services/ImageDataService";
import FolderService from "@/services/FolderService";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import { DomHandler } from "primevue/utils";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import ImageUpload from "./components/ImagesUpload.vue";
import ImageBlock from "./components/ImagesBlock.vue";
import ImagesFolder from "./components/ImagesFolder.vue";
import DatePicker from "@/components/widget/DatePicker.vue";
import $ from "jquery";

import DocumentPreview from "./components/documentPreview.vue";

const confirmChangeImage = ref("ต้องการเปลี่ยนรูปภาพ ");
const create = ref("ต้องการสร้าง Gallery ใหม่");
const content = ref();
const storeApp = useApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const data_list = ref([]);
const data_list_group = ref([]);
const data_set_group = ref([]);
const confirmSaveDialog = ref(false);
const confirmGroupImageDialog = ref(false);
const totalItemsCount = ref(10);
const loading = ref(true);
const activePage = ref(1);
const data_import = ref([]);
const onUploadProgress = ref(0);
const firstPage = ref(0);
const uploadmodel = ref(false);
const AllImageUsed = ref([]);
const searchItem = ref("");
const limitPage = ref(50);
const createDialog = ref(false);
const data_gallery = ref([]);
const fileLimit = ref(100);
const uploadedFileCount = ref(0);
const updateRefDialog = ref(false);
const WsConnectImage = ref();
const WsConnectAllImage = ref();
const confirmRejectDialog = ref(false);
const showSkeleton = ref(false);
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
const confirmChangeImageDialog = ref(false);
const newDocRefImage = ref("");
const connection = ref();
const listShowImageBys = ref([
  { name: "แสดงทั้งหมด", code: "" },
  { name: "รูปที่ยังไม่ได้บันทึก", code: "unsave" },
  { name: "รูปที่บันทึกแล้ว", code: "save" },
  { name: "รูปที่โดนยกเลิก", code: "reject" },
]);
const showImageBy = ref("");
const createFormStatus = ref(false);

const imagesDragData = ref({});
const imagesDragCount = ref(0);
const imagesDragReject = ref(false);
const imagesDragReferences = ref(0);
const addToGroup = ref("");
const addImageGuidfixed = ref("");
const addImagenewData = ref([]);
const allowDropImage = ref("");

const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const title = ref("");
const title_valid = ref(false);
const title2 = ref("");
const title2_valid = ref(false);
const uploadedat = ref(new Date());
const uploadedat2 = ref(new Date());
const data_save_group = ref({});
const images_list_group = ref([]);
const imageGroup = ref();
const imageDialog = ref(false);
const dataImageDialog = ref({});

const pageGetAllImage = ref(1);
const pageGetAllImageGroup = ref(1);

const searchImageDate = ref();
const searchFromDate = ref(new Date());
const searchToDate = ref(new Date());
const searchDate = ref("");
const fromDate = ref("");
const toDate = ref("");
const showOveray = ref(false);
const showImgData = ref();
const showDocumentPreview = ref(true);
const isSelectedDocument = ref(false);

const data_folder = ref([]);
const selectedFolder = ref({
  guidfixed: "all",
  name: "",
  status: 0,
});

onUnmounted(() => {
  console.log(
    "unmounted--------------------------------------------------------"
  );

  WsConnectAllImage.value.close();
  WsConnectImage.value.close();
  connection.value.close();
});
onMounted(() => {
  getDocumentImageGroup();
  getFolderList();
  getImageAll();

  storeApp.setActivePage("document_images");
  storeApp.setPageTitle("คลังเอกสาร");

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
  if (
    route.params.id != "" &&
    route.params.id != "" &&
    route.params.id != undefined
  ) {
    isGallery.value = true;
    storeApp.setPageTitle("รูปภาพเอกสาร Gallery" + route.params.id);
    data_gallery.value = [];
  } else {
    storeApp.setPageTitle("รูปภาพเอกสาร ");
  }
  //console.log(localStorage.getItem("_token"));

  WSImageConnect();
  WsAllImageConnect();
  websocketConnect();
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
        route.name == "daily_images_form"
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
        route.name == "dailyForm"
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
    // setTimeout(function () {
    //     if (
    //         localStorage._token != "" &&
    //         localStorage._token != undefined &&
    //         route.name == "list_images"
    //     ) {
    //         console.log(
    //             "Socket is closed. Reconnect will be attempted in 1 second.",
    //             e.reason
    //         );
    //         WsAllImageConnect();
    //         getAllSelectImage();
    //     }
    // }, 1000);
  };
}
function onClose() {
  confirmRejectDialog.value = false;
  createDialog.value = false;
  confirmChangeImageDialog.value = false;
  confirmSaveDialog.value = false;
  updateRefDialog.value = false;
}

function onSaveCreate() {
  data_gallery.value.push({
    name: gallery_form.value.name,
    creator: gallery_form.value.creator,
    create_date: gallery_form.value.create_date,
  });

  setTimeout(() => {
    gallery_form.value.name = "";
    createDialog.value = false;
  }, 200);
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
    toDate.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        setTimeout(() => {
          res.data.forEach((ele) => {
            ele.isUpdate = false;
            ele.ischecked = false;

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
      getImageAll;
      console.log(err);
      showSkeleton.value = false;
    });
}

function getImageAll() {
  let limePage = 1000;
  ImageDataService.getImageAll(limePage, pageGetAllImage.value)
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list_group.value = res.data;

        if (pageGetAllImage.value <= res.pagination.totalPage) {
          pageGetAllImage.value += 1;
          getImageAllAppend();
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

function getImageAllAppend() {
  let limePage = 1000;
  ImageDataService.getImageAll(limePage, pageGetAllImage.value)
    .then((res) => {
      //console.log(res);
      if (res.success) {
        res.data.forEach((ele) => {
          data_list_group.value.push(ele);
        });

        data_list_group.value.forEach((element) => {
          element.uploadedat = Utils.getDateFormatDMY(element.uploadedat);
        });

        // group by uploaddate
        const result = data_list_group.value.reduce(
          (r, { uploadedat: uploadedat, ...object }) => {
            var temp = r.find((o) => o.uploadedat === uploadedat);
            if (!temp) r.push((temp = { uploadedat, children: [] }));
            temp.children.push(object);
            return r;
          },
          []
        );
        console.log("count image : " + data_list_group.value.length);
        console.log(result);
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

function getImageGroupAll() {
  let limePage = 1000;
  ImageDataService.getDocumentImageGroupAll(
    limePage,
    pageGetAllImageGroup.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        images_list_group.value = res.data;

        if (pageGetAllImageGroup.value <= res.pagination.totalPage) {
          pageGetAllImageGroup.value += 1;
          getDocumentImageGroupAllAppend();
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

function getDocumentImageGroupAllAppend() {
  let limePage = 1000;
  ImageDataService.getDocumentImageGroupAll(
    limePage,
    pageGetAllImageGroup.value
  )
    .then((res) => {
      //console.log(res);
      if (res.success) {
        res.data.forEach((ele) => {
          images_list_group.value.push(ele);
        });

        let filtered = images_list_group.value.filter(function (ele) {
          return (
            ele.imagereferences.length > 1 &&
            ele.isreject == false &&
            ele.references.length == 0
          );
        });
        images_list_group.value = filtered;
        console.log(images_list_group.value);
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

function getDocumentImageGroup() {
  showSkeleton.value = true;
  loading.value = true;

  ImageDataService.getDocumentImageGroup(
    limitPage.value,
    activePage.value,
    searchItem.value,
    selectSort.value,
    sortOrder.value,
    showImageBy.value,
    fromDate.value,
    toDate.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;

        data_list.value = data_list.value.map((element) => {
          let references = element.references ?? [];
          element.references = references;
          return element;
        });

        data_list.value.forEach((element) => {
          element.ischecked = false;
        });

        loading.value = false;
        showSkeleton.value = false;
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

function nextPage() {
  activePage.value += 1;

  if (activePage.value <= totalPage.value) {
    getDocumentImageGroupScroll();
  }
}
function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
  console.log(activePage.value);
  loading.value = true;
  setTimeout(() => {
    getDocumentImageGroup();
  }, 100);
}

function onDragEnter(event) {
  event.stopPropagation();
  event.preventDefault();
}

function onDragOver(event) {
  DomHandler.addClass(content.value, "p-fileupload-highlight");
  event.stopPropagation();
  event.preventDefault();
}

function onDragLeave() {
  DomHandler.removeClass(content.value, "p-fileupload-highlight");
}

function onDrop(event) {
  DomHandler.removeClass(content.value, "p-fileupload-highlight");
  event.stopPropagation();
  event.preventDefault();

  const files = event.dataTransfer
    ? event.dataTransfer.files
    : event.target.files;
  const allowDrop = true || (files && files.length === 1);

  if (allowDrop) {
    onFileSelect(event);
  }
}
function onFileSelect(event) {
  console.log(event);
  data_import.value = [];
  let files = event.dataTransfer
    ? event.dataTransfer.files
    : event.target.files;
  uploadedFileCount.value = files.length;
  if (checkFileLimit()) {
    for (let file of files) {
      if (Utils.isImage(file)) {
        file.objectURL = window.URL.createObjectURL(file);
        data_import.value.push(file);
      }
    }

    checkDulicate(data_import.value);
  }
}

function isFileLimitExceeded() {
  return fileLimit.value <= data_import.value.length + uploadedFileCount.value;
}
function checkFileLimit() {
  if (isFileLimitExceeded()) {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "นำเข้าได้สูงสุด " + fileLimit.value + " รูปภาพ",
      life: 3000,
    });
    return false;
  } else {
    return true;
  }
}

function checkDulicate(array) {
  var a = array.concat();

  for (var i = 0; i < a.length; i++) {
    for (var j = i + 1; j < a.length; j++) {
      if (a[i].name === a[j].name) {
        a.splice(j--, 1);
      }
    }
  }
  a.forEach((ele) => {
    ele.cmd = "wait";
  });
  data_import.value = a;

  console.log(data_import.value);
  uploadmodel.value = true;

  // uploadProgress();
}

async function uploadProgress() {
  console.log(data_import.value);
  var interval = 1000;
  data_import.value.forEach((ele, index) => {
    setTimeout(function () {
      MasterdataService.upLoadDocImages(ele, "GL")
        .then((res) => {
          console.log(res);
          if (res.success) {
            onUploadProgress.value =
              ((index + 1) / data_import.value.length) * 100;
            onUploadProgress.value = parseFloat(
              onUploadProgress.value.toFixed(2)
            );
            setTimeout(() => {
              if (onUploadProgress.value == 100) {
                toast.add({
                  severity: "success",
                  summary: "Success",
                  detail: ele.name + " Uploaded",
                  life: 10000,
                });
                onUploadProgress.value = 0;
                data_import.value = [];
                getDocumentImageGroup();
              }
            }, 2000);
          }
        })
        .catch((err) => {
          loading.value = false;
          console.log(err);
          ele.cmd = "error";
          toast.add({
            severity: "error",
            summary: "Error",
            detail: err,
            life: 3000,
          });
        });
    }, index * interval);
  });
}

function checkSelect(data) {
  var found = 0;
  selectedImg.value.forEach((element) => {
    if (element.guidfixed == data.guidfixed) {
      found += 1;
    }
  });
  if (found == 0) {
    return false;
  } else {
    return true;
  }
}

function selectImg(data) {
  console.log(data);
  if (checkSelect(data)) {
    var rebuild = [];
    selectedImg.value.forEach((element) => {
      if (element.guidfixed != data.guidfixed) {
        rebuild.push(element);
      }
    });
    selectedImg.value = rebuild;
  } else {
    selectedImg.value.push(data);
    setTimeout(() => {
      selectedImg.value.forEach((element) => {
        element = Utils.remove_duplicates_array(element);
      });
    }, 100);
  }

  console.log(selectedImg.value);
}
function getAllSelectImage() {
  MasterdataService.getAllSelectImage()
    .then((res) => {
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

function useImage(data) {
  var sendData = { docref: data };

  if (checkUseImgByUser(localStorage._usercode)) {
    // confirmChangeImageDialog.value = true;
    // newDocRefImage.value = data;
    MasterdataService.postSelectImageForce(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
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
  } else {
    MasterdataService.postSelectImage(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
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
  }
}
//แก้ สร้างเอกสาร
function createform(data) {
  console.log(data);
  console.log(!checkUseImgByUser(localStorage._usercode));
  var sendData = { docref: data };
  if (!checkUseImgByUser(localStorage._usercode)) {
    MasterdataService.postSelectImage(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
            router.push({ name: "dailyForm" });
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
  } else {
    createFormStatus.value = true;
    confirmChangeImageDialog.value = true;
    newDocRefImage.value = data;
  }

  /*
    var sendData = { docref: data };
    if (AllImageUsed.value.length == 0) {
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
    } else {
      changechooseImage(data);
      newDocRefImage.value = data;
    }
    */
}
//แก้ สร้างเอกสาร
function changechooseImage(data) {
  var sendData = { docref: data };
  if (checkUseImgByUser(localStorage._usercode)) {
    MasterdataService.postSelectImageForce(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          router.push({ name: "dailyForm" });
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
            confirmChangeImageDialog.value = false;
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
function changeImage(data) {
  var sendData = { docref: data };
  if (checkUseImgByUser(localStorage._usercode)) {
    MasterdataService.postSelectImageForce(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
            if (createFormStatus.value) {
              router.push({ name: "dailyForm" });
            } else {
              confirmChangeImageDialog.value = false;
            }
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

function openModal() {
  uploadmodel.value = true;
}

function uploadSuccess() {
  uploadmodel.value = false;
  limitPage.value = 50;
  activePage.value = 1;
  firstPage.value = 0;
  getDocumentImageGroup();
}

async function documentImageUnGroup(data) {
  console.log(data);

  await ImageDataService.putDocumentImageUnGroup(data)
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

function getDocImageListDefualt() {
  loading.value = true;
  selectedImg.value = [];
  limitPage.value = 50;
  activePage.value = 1;
  searchItem.value = "";
  getDocumentImageGroup();
}

function onFileNewSelect(imageData, data) {
  //console.log(data);
  var data_import = [];
  let files = imageData.dataTransfer
    ? imageData.dataTransfer.files
    : imageData.target.files;

  for (let file of files) {
    if (Utils.isImage(file)) {
      file.objectURL = window.URL.createObjectURL(file);
      data_import.push(file);
    }

    uploadNewProgress(data_import, data);
  }
}

async function uploadNewProgress(data_import, data) {
  var ele = data_import[0];

  setTimeout(() => {
    var file = ele;
    var reader = new FileReader();
    var returnimgblob;
    reader.onload = function (readerEvent) {
      var image = new Image();
      image.onload = function (imageEvent) {
        // Resize the image
        var canvas = document.createElement("canvas"),
          max_size = 1280, // TODO : pull max size from a site config
          width = image.width,
          height = image.height;
        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
        var dataUrl = canvas.toDataURL("image/jpeg");
        var resizedImage = dataURLToBlob(dataUrl);
        $.event.trigger({
          type: "imageResized",
          blob: resizedImage,
          url: dataUrl,
        });

        var newfile = createFile(resizedImage, ele);
        // console.log(ele);
        // console.log(newfile);
        ele = newfile;

        MasterdataService.upLoadImages(ele, "GL")
          .then((res) => {
            //console.log(res);
            if (res.success) {
              let datex = data_import[0].lastModified.toString().slice(0, -3);
              let timex = new Date(datex * 1000);

              let newData = {
                name: data_import[0].name,
                metafileat: Utils.getFormatDateTime(timex),
                imageuri: res.data.uri,
                uploadedby: localStorage._usercode,
                uploadedat: Utils.getFormatDateTime(new Date()),
              };

              updateDocmentImage(newData, data.documentimageguid);
              toast.add({
                severity: "success",
                summary: "Success",
                detail: ele.name + " Uploaded",
                life: 10000,
              });
            }
          })
          .catch((err) => {
            console.log(err);
            toast.add({
              severity: "error",
              summary: "Error",
              detail: err,
              life: 3000,
            });
          });
      };
      image.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  }, 100);

  return data_import;
}

async function updateDocmentImage(newData, documentimageguid) {
  console.log(newData);
  console.log(documentimageguid);

  try {
    const res = await MasterdataService.putrejectimage(
      newData,
      documentimageguid
    );
    console.log(res);
    if (res.success) {
      getDocumentImageGroup();
    }
  } catch (err) {
    console.log(err);
  }
}

function dataURLToBlob(dataURL) {
  var BASE64_MARKER = ";base64,";
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(",");
    var contentType = parts[0].split(":")[1];
    var raw = parts[1];

    return new Blob([raw], { type: contentType });
  }

  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(":")[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

function createFile(image, file) {
  // let newFile = {
  //   cmd: file.cmd,
  //   name: file.name,
  //   objectURL: URL.createObjectURL(image),
  //   size: image.size,
  //   type: file.type,
  //   lastModifiedDate: file.lastModifiedDate,
  //   lastModified: file.lastModified,
  // };
  let newFile = new File([image], file.name, {
    type: "image/png",
  });
  newFile.cmd = file.cmd;
  newFile.objectURL = URL.createObjectURL(image);
  return newFile;
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
  let div = $("#content")[0];
  // console.log(div.scrollTop);
  if (div.scrollTop + div.clientHeight >= div.scrollHeight - 10) {
    if (!showSkeleton.value) {
      nextPage();
    }
  }
}

function closeDialogUpload() {
  uploadmodel.value = false;
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

function showDetailGlImage(docno) {
  MasterdataService.getGLledger(docno)
    .then((res) => {
      //console.log(res);
      if (res.success) {
        setTimeout(() => {
          router.push({
            name: "dailyUpdate",
            params: { id: res.data.guidfixed, mode: "read" },
          });
        }, 200);
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

function dragStart(data) {
  imagesDragData.value = data;
  imagesDragCount.value = data.imagereferences.length;
  imagesDragReject.value = data.isreject;
  imagesDragReferences.value = data.references.length;

  if (checkUseImg(data.guidfixed)) {
    return;
  } else {
    //console.log(data);
    if (
      data.imagereferences.length == 1 &&
      data.isreject == false &&
      data.references.length == 0
    ) {
      if (selectedImg.value.length == 0) {
        selectedImg.value.push({
          guidfixed: data.guidfixed,
          documentimageguid: data.imagereferences[0],
        });
      }
    } else {
      return;
    }
  }
}

function dragging(data, event) {
  if (checkUseImg(data.guidfixed)) {
    return;
  }
  event.stopPropagation();
  event.preventDefault();
}

function allowDrop(data, event) {
  if (checkUseImg(data.guidfixed)) {
    return;
  }
  if (allowDropImage.value != data.guidfixed) {
    allowDropImage.value = data.guidfixed;
  } else {
    //return;
  }
  //console.log(allowDropImage.value);

  // console.log(data);
  // console.log(event);
  event.stopPropagation();
  event.preventDefault();
}

async function drop(data, event) {
  //console.log(data);
  event.preventDefault();
  console.log("drop");

  if (checkUseImg(imagesDragData.value.guidfixed)) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "ไม่สามารถเลือกรูปได้ ",
      life: 3000,
    });
    return;
  }

  addImageGuidfixed.value = data.guidfixed;
  addImagenewData.value = data.imagereferences;

  if (addImageGuidfixed.value == imagesDragData.value.guidfixed) {
    return;
  }

  if (!data.isreject && data.references.length == 0) {
    //จัดชุดใหม่
    if (data.imagereferences.length == 1) {
      let result = [];
      result = selectedImg.value.filter(
        (el) => el.guidfixed == addImageGuidfixed.value
      );
      if (result.length > 0) {
        let result_detail = [];
        result_detail = selectedImg.value.filter(
          (el) => el.guidfixed == imagesDragData.value.guidfixed
        );
        if (result_detail.length > 0) {
          updateRefDialog.value = true;
        } else {
          selectedImg.value.push({
            guidfixed: imagesDragData.value.guidfixed,
            documentimageguid: imagesDragData.value.imagereferences[0],
          });
        }
        updateRefDialog.value = true;
      } else {
        selectedImg.value.push({
          guidfixed: data.guidfixed,
          documentimageguid: data.imagereferences[0],
        });
        updateRefDialog.value = true;
      }
      console.log(selectedImg.value);
      //เพิ่มรูปเข้าชุด
    } else {
      addToGroup.value = data.title;
      confirmGroupImageDialog.value = true;
    }
  }
}

function dropGrupImage(event) {
  console.log("dropGrupImage");
  //console.log(event);
  //console.log(selectedImg.value);

  if (checkUseImg(imagesDragData.value.guidfixed)) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "ไม่สามารถเลือกรูปได้ ",
      life: 3000,
    });
    return;
  }

  if (selectedImg.value.length > 1) {
    selectedImg.value.forEach((element) => {
      data_set_group.value.push(element);
      data_list.value = data_list.value.filter(
        (item) => !data_set_group.value.includes(item)
      );
    });
  } else {
    data_set_group.value.push(imagesDragData.value);
    data_list.value = data_list.value.filter(
      (item) => !data_set_group.value.includes(item)
    );
  }

  selectedImg.value = [];
}

function allowDropImageGroup(event) {
  //console.log(event);
  event.stopPropagation();
  event.preventDefault();
}

async function addImageGroup() {
  selectedImg.value.forEach((element) => {
    element.documentimageguid.xorder = addImagenewData.value.length;
    addImagenewData.value.push(element.documentimageguid);
  });
  //console.log(newData);

  try {
    const res = await ImageDataService.putAddImageInGroup(
      addImageGuidfixed.value,
      addImagenewData.value
    );
    //console.log(res);
    if (res.success) {
      confirmGroupImageDialog.value = false;
      activePage.value = 1;
      selectedImg.value = [];
      addImageGuidfixed.value = "";
      addImagenewData.value = [];
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });

      setTimeout(() => {
        getDocumentImageGroup();
      }, 500);
    }
  } catch (err) {
    console.log(err);
  }
}

function removeSetImageGroup(data) {
  console.log(data);

  let index = data_set_group.value.indexOf(data);

  if (index != -1) {
    data_set_group.value.splice(index, 1);
  }

  data_list.value.push(data);

  selectedImg.value = [];
}

function addToGroupImage(data) {
  data_set_group.value.push(data);
  data_list.value = data_list.value.filter(
    (item) => !data_set_group.value.includes(item)
  );

  console.log(data_set_group.value);
}

function verifyData(mode) {
  var errorCount = 0;

  if (mode) {
    if (title.value == "") {
      errorCount += 1;
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "กรุณาป้อนชื่อชุดเอกสาร ",
        life: 4000,
      });
      title_valid.value = true;
    } else {
      title_valid.value = false;
    }

    if (data_set_group.value.length == 0) {
      errorCount += 1;
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "กรุณาเลือกรูปเอกสาร ",
        life: 4000,
      });
    }
  } else {
    if (title2.value == "") {
      errorCount += 1;
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "กรุณาป้อนชื่อชุดเอกสาร ",
        life: 4000,
      });
      title2_valid.value = true;
    } else {
      title2_valid.value = false;
    }
  }

  if (errorCount != 0) {
    return false;
  } else {
    return true;
  }
}

async function getDataImageSelectGroup() {
  console.log(imageGroup.value);
  if (imageGroup.value != null) {
    try {
      let res = await ImageDataService.getDocumentImageGroupById(
        imageGroup.value
      );
      if (res.success) {
        console.log(res.data);
        data_set_group.value = [];
        res.data.imagereferences.forEach((ele) => {
          var imgref = {
            guidfixed: ele.documentimageguid,
            isreject: res.data.isreject,
            imagereferences: [ele],
            references: res.data.references,
            tags: res.data.tags,
            title: ele.name,
            uploadedat: res.data.uploadedat,
            uploadedby: res.data.uploadedby,
          };
          data_set_group.value.push(imgref);
        });
        title.value = res.data.title;
        uploadedat.value = Utils.getDateTimeFromDate(res.data.uploadedat);

        console.log(data_set_group.value);
        getDocumentImageGroup();
      }
    } catch (err) {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "ดึงข้อมูลไม่สำเร็จ ",
        life: 4000,
      });
    }
  } else {
    title.value = "";
    uploadedat.value = new Date();
    data_set_group.value = [];
  }
}

function showImageDialog(data) {
  console.log(data);
  imageDialog.value = true;
  if (data != "") {
    dataImageDialog.value = data;
  } else {
    return;
  }
}

function searchImageDateToDate(event) {
  searchImageDate.value.toggle(event);
}

function filterDatetoDate() {
  searchImageDate.value.hide();
  // console.log(Utils.getDateTimeFormatStandard(searchFromDate.value));
  // console.log(Utils.getDateTimeFormatStandard(searchToDate.value));

  searchDate.value =
    Utils.getDateDisplayFromDate(searchFromDate.value) +
    " - " +
    Utils.getDateDisplayFromDate(searchToDate.value);
  activePage.value = 1;
  fromDate.value = Utils.getDateTimeFormatStandard(searchFromDate.value);
  toDate.value = Utils.getDateTimeFormatStandard(searchToDate.value);
  getDocumentImageGroup();
}

function clearFilterDatetoDate() {
  searchImageDate.value.hide();
  activePage.value = 1;
  searchDate.value = "";
  fromDate.value = "";
  toDate.value = "";
  getDocumentImageGroup();
}

function resizeSplitter(isOveray) {
  showOveray.value = isOveray;
}

function showImg(data) {
  showImgData.value = data;
  showDocumentPreview.value = true;
}

function closeDocumentPreview() {
  showDocumentPreview.value = false;
}

function selectedDocument(isSelectedDoc) {
  isSelectedDocument.value = isSelectedDoc;

  if (!isSelectedDoc) {
    removeSelectedImg();
  }
}

function removeSelectedImg() {
  selectedImg.value = [];
  data_list.value.forEach((element) => {
    element.ischecked = false;
  });
}

function getFolderList() {
  FolderService.getFolderList()
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_folder.value = res.data;
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

function saveFolderSuccess(status) {
  if (status) {
    getFolderList();
  }
}

function selectFolder(data) {
  let newData = {};
  if (data == "all") {
    newData = {
      guidfixed: "all",
      name: "",
      status: 0,
    };
  } else {
    newData = {
      guidfixed: data.guidfixed,
      name: data.name,
      status: data.status == 0 ? false : true,
    };
  }
  selectedFolder.value = newData;
}
</script>
<template>
  <AppLayout>
    <div class="flex bg-primary-50 p-1">
      <div class="flex ml-1">
        <Button
          class="p-button-sm"
          label="Upload รูปภาพ"
          icon="pi pi-upload"
          @click="openModal()"
        />
      </div>
      <div class="flex ml-1">
        <Button
          :disabled="selectedImg.length <= 1"
          class="p-button-info text-white p-button-sm"
          icon="pi pi-pencil"
          label="กำหนดชุดเอกสาร"
          @click="updateRefDialog = true"
        />
      </div>
      <div class="flex ml-1">
        <Button
          class="p-button-secondary p-button-sm"
          :label="searchDate == '' ? ' ค้นหาตามวันที่' : searchDate"
          icon="pi pi-search"
          @click="searchImageDateToDate($event)"
        />
      </div>
      <div class="flex ml-1">
        <Button
          :class="!isSelectedDocument ? 'bg-primary-700' : 'bg-red-600'"
          class="text-white p-button-sm"
          :icon="
            !isSelectedDocument ? 'pi pi-check-square' : 'pi pi-file-excel'
          "
          :label="!isSelectedDocument ? 'เลือกเอกสาร' : 'ยกเลิกเลือกเอกสาร'"
          @click="
            !isSelectedDocument
              ? selectedDocument(true)
              : selectedDocument(false)
          "
        />
        <div class="flex ml-1">
          <Button
            v-if="selectedImg.length > 0"
            class="p-button-warning p-button-sm"
            icon="pi pi-times"
            :label="selectedImg.length.toString()"
            @click="removeSelectedImg"
          />
        </div>
      </div>
    </div>
    <div class="flex bg-primary-50">
      <div style="height: 90vh; width: 200px; overflow-y: auto">
        <ImagesFolder
          :data_folder="data_folder"
          :selectedFolder="selectedFolder"
          v-on:saveFolderSuccess="saveFolderSuccess"
          v-on:selectFolder="selectFolder"
        />
      </div>
      <div class="flex-1 flex">
        <Splitter
          class="w-full"
          @resizestart="resizeSplitter(true)"
          @resizeend="resizeSplitter(false)"
        >
          <SplitterPanel :size="50">
            <div
              style="height: 90vh; overflow-y: auto"
              @scroll="onScroll"
              id="content"
            >
              <div
                class="flex flex-wrap align-items-center justify-content-center m-1"
              >
                <div
                  class="flex"
                  v-for="data in data_list"
                  :key="data.guidfixed"
                >
                  <div
                    draggable="true"
                    @dragstart="dragStart(data, $event)"
                    @drag="
                      imagesDragCount == 1 &&
                      imagesDragReject == false &&
                      imagesDragReferences == 0
                        ? dragging(data, $event)
                        : ''
                    "
                    @drop="
                      imagesDragCount == 1 &&
                      imagesDragReject == false &&
                      imagesDragReferences == 0
                        ? drop(data, $event)
                        : ''
                    "
                    @dragover="
                      imagesDragCount == 1 &&
                      imagesDragReject == false &&
                      imagesDragReferences == 0
                        ? allowDrop(data, $event)
                        : ''
                    "
                  >
                    <ImageBlock
                      :images_data="data"
                      :images_selete="selectedImg"
                      :allimage_used="AllImageUsed"
                      :mode="1"
                      :isSelectedDocument="isSelectedDocument"
                      v-on:selectImg="selectImg"
                      v-on:useImage="useImage"
                      v-on:createform="createform"
                      v-on:onFileSelect="onFileNewSelect"
                      v-on:onReloadData="getDocumentImageGroup"
                      v-on:documentImageUnGroup="documentImageUnGroup"
                      v-on:rejectImage="rejectImage"
                      v-on:showDetailGlImage="showDetailGlImage"
                      v-on:addToGroupImage="addToGroupImage"
                      v-on:showImg="showImg"
                    >
                    </ImageBlock>
                  </div>
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
            <DocumentPreview
              v-if="showImgData != null"
              :showOveray="showOveray"
              :showImgData="showImgData"
              v-on:closeDocumentPreview="closeDocumentPreview"
            />
          </SplitterPanel>
        </Splitter>
      </div>
    </div>
    <OverlayPanel
      ref="searchImageDate"
      :showCloseIcon="true"
      style="width: 450px"
      :breakpoints="{ '960px': '75vw' }"
    >
      <div class="grid formgrid p-fluid">
        <div class="field mb-4 col-12 md:col-6">
          <label class="font-medium text-900">จากวันที่</label>
          <DatePicker
            :disabled="imageGroup != null"
            v-model="searchFromDate"
            dateFormat="d/m/yy"
            :showIcon="true"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="false"
            :hiddenTime="true"
          />
        </div>
        <div class="field mb-4 col-12 md:col-6">
          <label class="font-medium text-900">ถึงวันที่</label>
          <DatePicker
            :disabled="imageGroup != null"
            v-model="searchToDate"
            dateFormat="d/m/yy"
            :showIcon="true"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="false"
            :hiddenTime="true"
          />
        </div>
        <Button
          @click="filterDatetoDate()"
          label="ค้นหา"
          class="p-button-raised p-button-secondary mb-2"
        />
        <Button
          @click="clearFilterDatetoDate()"
          label="ล้างการค้นหา"
          class="p-button-raised p-button-danger"
        />
      </div>
    </OverlayPanel>

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

    <DialogForm
      :confirmDialog="createDialog"
      :textContent="create"
      v-on:close="onClose"
      v-on:confirm="onSaveCreate"
    >
    </DialogForm>
    <Dialog
      v-model:visible="updateRefDialog"
      :style="{ width: '450px' }"
      header="กำหนดชุดเอกสาร"
      :modal="true"
    >
      <div class="grid formgrid p-fluid">
        <div class="field mb-12 col-12 md:col-12">
          <label for="title" class="font-medium text-900">ชื่อชุดเอกสาร</label>
          <InputText
            id="title"
            type="text"
            v-model="title2"
            :class="title2_valid ? 'p-invalid' : ''"
          />
        </div>
        <div class="field mb-12 col-12 md:col-12">
          <label class="font-medium text-900">วันที่เอกสาร</label>
          <DatePicker
            v-model="uploadedat2"
            dateFormat="d/m/yy"
            :showIcon="true"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="false"
            :hiddenTime="true"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="ยกเลิก"
          icon="pi pi-times"
          class="p-button-text"
          @click="updateRefDialog = false"
        />
        <Button
          label="บันทึก"
          icon="pi pi-check"
          class="p-button-text"
          @click="saveGropImages(modeCreateImageGroup)"
        />
      </template>
    </Dialog>

    <Dialog
      header="Upload รูปภาพ"
      v-model:visible="uploadmodel"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '80vw' }"
      :modal="true"
      :closable="false"
    >
      <ImageUpload
        v-on:success="uploadSuccess()"
        :data_ondrop="data_import"
        v-on:closeDialogUpload="closeDialogUpload()"
      ></ImageUpload>
    </Dialog>
    <DialogForm
      :confirmDialog="confirmChangeImageDialog"
      :textContent="confirmChangeImage"
      v-on:close="onClose"
      v-on:confirm="changeImage(newDocRefImage)"
    ></DialogForm>
    <DialogForm
      :confirmDialog="confirmGroupImageDialog"
      :textContent="'ต้องการรวมชุดรูป ' + addToGroup"
      v-on:close="confirmGroupImageDialog = false"
      v-on:confirm="addImageGroup()"
    ></DialogForm>
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
