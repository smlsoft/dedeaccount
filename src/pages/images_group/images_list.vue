<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
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
import ImageUpload from "./components/ImagesUpload.vue";
import ImageBlock from "./components/ImagesBlock.vue";
import ImagesGallery from "./components/ImagesGallery.vue";
import DatePicker from "@/components/widget/DatePicker.vue";
import $ from "jquery";

const confirmChangeImage = ref("ต้องการเปลี่ยนรูปภาพ ");
const create = ref("ต้องการสร้าง Gallery ใหม่");
const content = ref();
const storeApp = useApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const detail = ref();
const data_list = ref([]);
const data_list_group = ref([]);
const data_set_group = ref([]);
const confirmSaveDialog = ref(false);
const confirmGroupImageDialog = ref(false);
const totalItemsCount = ref(10);
const filters = ref(null);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const data_import = ref([]);
const doneTypingInterval = ref(20);
const onUploadProgress = ref(0);
const firstPage = ref(0);
const showImgDialog = ref(false);
const showImageDocRef = ref("");
const uploadmodel = ref(false);
const showImgHeader = ref("");
const showImgSrc = ref(null);
const AllImageUsed = ref([]);
const searchItem = ref("");
const limitPage = ref(50);
const showContent = ref("");
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
const showrejectImgdialog = ref(false);
const rejectDocref = ref("");
const connection = ref();
const listShowImageBys = ref([
  { name: "แสดงทั้งหมด", code: "" },
  { name: "รูปที่ยังไม่ได้บันทึก", code: "unsave" },
  { name: "รูปที่บันทึกแล้ว", code: "save" },
  { name: "รูปที่โดนยกเลิก", code: "reject" },
]);
const showImageBy = ref("");
const createFormStatus = ref(false);
const dataGlDetail = ref({});
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

const imagesDragData = ref({});
const imagesDragCount = ref(0);
const imagesDragReject = ref(false);
const imagesDragReferences = ref(0);
const addToGroup = ref("");
const addImageGuidfixed = ref("");
const addImagenewData = ref([]);
const allowDropImage = ref("");

const modeCreateImageGroup = ref(false);
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
  getDocumentImageAll();

  storeApp.setActivePage("pic_group_docref");
  storeApp.setActiveChild("images_list");
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

function getDocumentImageAll() {
  ImageDataService.getDocumentImageAll()
    .then((res) => {
      //console.log(res);
      if (res.success) {
        data_list_group.value = res.data;

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

        if (!modeCreateImageGroup.value) {
          data_list.value = data_list.value.map((element) => {
            let references = element.references ?? [];
            element.references = references;
            return element;
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
        } else {
          let filtered = data_list.value.filter(function (ele) {
            return (
              ele.isreject == false &&
              ele.imagereferences.length == 1 &&
              ele.references.length == 0
            );
          });

          if (data_set_group.value.length > 0) {
            data_list.value = filtered.filter(function (dataList) {
              return (
                data_set_group.value.filter(function (dataGroup) {
                  return dataGroup.guidfixed == dataList.guidfixed;
                }).length == 0
              );
            });
          } else {
            data_list.value = filtered;
          }
          //data_list.value = filtered;
          totalPage.value = res.pagination.totalPage;
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
  let div = $("#maincontainer")[0];
  console.log(div.scrollTop);
  if (div.scrollTop + div.clientHeight >= div.scrollHeight - 10) {
    if (!showSkeleton.value) {
      nextPage();
    }
  }

  let header = document.getElementById("headMenu");

  if (!modeCreateImageGroup.value) {
    if (div.scrollTop > 0) {
      header.classList.add("sticky-custom");
    } else {
      header.classList.remove("sticky-custom");
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

  if (!modeCreateImageGroup.value) {
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
  } else {
    console.log(event);
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

function getImageGroup() {
  ImageDataService.getDocumentImageGroup(9999)
    .then((res) => {
      //console.log(res);
      if (res.success) {
        images_list_group.value = res.data;
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

function getImageNoGroup(mode) {
  if (mode) {
    setTimeout(() => {
      var panel2 = document.getElementById("panelForm2");
      panel2.setAttribute("style", "flex-basis: calc(70% - 4px) !important");

      var panel1 = document.getElementById("panelForm1");
      panel1.setAttribute("style", "flex-basis: calc(30% - 4px) !important");
    }, 50);

    modeCreateImageGroup.value = true;
    getImageGroup();
  } else {
    imageGroup.value = null;
    title.value = "";
    uploadedat.value = new Date();
    title_valid.value = false;
    selectedImg.value = [];
    data_set_group.value = [];
    modeCreateImageGroup.value = false;
  }
  setTimeout(() => {
    activePage.value = 1;
    getDocumentImageGroup();
  }, 100);
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

async function saveGropImages(mode) {
  // mode true == สร้างชุดเอกสาร
  // mode false == กำหนดชุดเอกสาร
  console.log(mode);

  let newDate = new Date();
  if (mode) {
    newDate = uploadedat.value;
  } else {
    newDate = uploadedat2.value;
  }

  if (newDate.getHours() == 0) {
    let d = new Date();
    let hours = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
    let minutes = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
    let seconds = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();

    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(seconds);
  }

  console.log(newDate);

  if (mode) {
    console.log(data_set_group.value);
    let isPass = await verifyData(mode);
    if (isPass) {
      let imagereferences = [];
      data_set_group.value.forEach((element, index) => {
        element.imagereferences[0].xorder = index;
        imagereferences.push(element.imagereferences[0]);
      });
      data_save_group.value = {
        imagereferences: imagereferences,
        title: title.value,
        uploadedat: Utils.getFormatDateTime(newDate),
      };
    } else {
      return;
    }
  } else {
    console.log(selectedImg.value);
    let isPass = await verifyData(mode);
    if (isPass) {
      let imagereferences = [];
      selectedImg.value.forEach((element, index) => {
        element.documentimageguid.xorder = index;
        imagereferences.push(element.documentimageguid);
      });

      data_save_group.value = {
        imagereferences: imagereferences,
        title: title2.value,
        uploadedat: Utils.getFormatDateTime(newDate),
      };
    } else {
      return;
    }
  }

  try {
    const res = await ImageDataService.postDocumentImageGroup(
      data_save_group.value
    );
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
      setTimeout(() => {
        imageGroup.value = null;
        title.value = "";
        title_valid.value = false;
        uploadedat.value = new Date();
        title2.value = "";
        title2_valid.value = false;
        uploadedat2.value = new Date();
        updateRefDialog.value = false;
        modeCreateImageGroup.value = false;
        data_set_group.value = [];
        selectedImg.value = [];
        activePage.value = 1;
        getDocumentImageGroup();
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

async function updateGropImages() {
  console.log(imageGroup.value);
  console.log(data_set_group.value);

  let data = [];
  data_set_group.value.forEach((ele, index) => {
    data.push({
      xorder: index,
      documentimageguid: ele.imagereferences[0].documentimageguid,
    });
  });

  console.log(data);

  try {
    const res = await ImageDataService.putUpdateImageDocumentimageGroup(
      imageGroup.value,
      data
    );
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
      setTimeout(() => {
        imageGroup.value = null;
        modeCreateImageGroup.value = false;
        data_set_group.value = [];
        selectedImg.value = [];
        activePage.value = 1;
        getDocumentImageGroup();
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

function documentImageEditGroup(data) {
  setTimeout(() => {
    var panel2 = document.getElementById("panelForm2");
    panel2.setAttribute("style", "flex-basis: calc(70% - 4px) !important");

    var panel1 = document.getElementById("panelForm1");
    panel1.setAttribute("style", "flex-basis: calc(30% - 4px) !important");
  }, 50);

  modeCreateImageGroup.value = true;
  getImageGroup();

  setTimeout(() => {
    activePage.value = 1;
    imageGroup.value = data;
    getDocumentImageGroup();
    getDataImageSelectGroup();
  }, 100);
}

function showImageDialog(data) {
  console.log(data);
  imageDialog.value = true;
  if(data != ""){
    dataImageDialog.value = data;

  }else{
    return
  }
}
</script>

<template>
  <AppLayout>
    <MainContentWarp @scroll="onScroll">
      <Splitter>
        <SplitterPanel
          id="panelForm1"
          v-if="modeCreateImageGroup"
          @dragover="allowDropImageGroup($event)"
          @drop="dropGrupImage($event)"
        >
          <div class="grid formgrid p-fluid m-3">
            <div class="field mb-12 col-12 md:col-12">
              <label for="bookcode" class="font-medium text-900"
                >ชุดเอกสารอื่น ๆ</label
              >
              <Dropdown
                :showClear="true"
                v-model="imageGroup"
                :options="images_list_group"
                :filter="true"
                :filterFields="['guidfixed', 'title']"
                optionValue="guidfixed"
                optionLabel="title"
                filterPlaceholder="ค้นหา"
                placeholder="เลือก"
                @change="getDataImageSelectGroup()"
              >
                <template #option="slotProps">
                  <div>
                    {{ slotProps.option.title }}
                  </div>
                </template>
              </Dropdown>
            </div>

            <div class="field mb-12 col-12 md:col-12">
              <label for="title" class="font-medium text-900"
                >ชื่อชุดเอกสาร</label
              >
              <InputText
                id="title"
                type="text"
                v-model="title"
                :disabled="imageGroup != null"
                :class="title_valid ? 'p-invalid' : ''"
              />
            </div>
            <div class="field mb-12 col-12 md:col-12">
              <label class="font-medium text-900">วันที่เอกสาร</label>
              <DatePicker
                :disabled="imageGroup != null"
                v-model="uploadedat"
                dateFormat="d/m/yy"
                :showIcon="true"
                :buddhist="buddhistYear"
                :hideOnDateTimeSelect="false"
                :hiddenTime="true"
              />
            </div>
            <div class="field col-12 md:col-12 lg:col-6">
              <Button
                label="ยกเลิก"
                icon="pi pi-arrow-left"
                class="p-button-outlined p-button-danger"
                @click="getImageNoGroup(false)"
              />
            </div>
            <div class="field col-12 md:col-12 lg:col-6">
              <Button
                v-if="imageGroup != null"
                label="แก้ไข"
                icon="pi pi-save"
                class="p-button-warning"
                @click="updateGropImages()"
              />
              <Button
                v-if="imageGroup == null"
                label="บันทึก"
                icon="pi pi-save"
                class="p-button-success"
                @click="saveGropImages(modeCreateImageGroup)"
              />
            </div>
          </div>
          <div
            class="flex align-content-center justify-content-center flex-wrap card-container"
            v-if="data_set_group.length == 0"
          >
            <div class="text-xl text-300">
              <h3>Drop File Here To Group</h3>
            </div>
          </div>
          <div class="card" v-if="data_set_group.length > 0">
            <ScrollPanel style="height: 60vh">
              <div
                class="flex flex-wrap align-content-start justify-content-start card-container"
              >
                <div
                  class="flex relative align-items-center justify-content-center surface-500 font-bold m-2 border-round"
                  style="min-width: 200px"
                  v-for="data in data_set_group"
                  :key="data.documentimageguid"
                >
                  <div class="p-1 cursor-pointer">
                    <div class="p-1 surface-card border-round">
                      <img
                        :src="data.imagereferences[0].imageuri"
                        class="w-full"
                        style="object-fit: cover; height: 100px"
                        @click="showImageDialog(data.imagereferences[0])"
                      />
                    </div>
                    <div class="align-items-center justify-content-center p-1">
                      {{ data.title }}
                    </div>
                  </div>
                  <div class="absolute top-0 right-0">
                    <Button
                      icon="pi pi-times"
                      class="p-button-rounded p-button-danger"
                      @click="removeSetImageGroup(data)"
                    />
                  </div>
                </div>
              </div>
            </ScrollPanel>
          </div>
        </SplitterPanel>
        <SplitterPanel id="panelForm2">
          <Card class="p-1" ref="content">
            <template #header>
              <div id="headMenu" v-if="!modeCreateImageGroup">
                <div class="flex">
                  <div class="flex ml-0" v-if="!isGallery">
                    <!-- <Button
                                class="p-button-success"
                                icon="pi pi-plus"
                                label="สร้าง Gallery"
                                @click="createDialog = true"
                                /> -->
                    <Button
                      class="ml-0"
                      label="Upload รูปภาพ"
                      icon="pi pi-upload"
                      @click="openModal()"
                    />
                  </div>
                  <div class="flex ml-2">
                    <Button
                      :disabled="selectedImg.length <= 1"
                      class="p-button-info text-white"
                      icon="pi pi-pencil"
                      label="กำหนดชุดเอกสาร"
                      @click="updateRefDialog = true"
                    />
                  </div>
                  <div class="flex ml-2">
                    <Button
                      class="p-button-warning"
                      icon="pi pi-images"
                      label="สร้างชุดเอกสาร"
                      @click="getImageNoGroup(true)"
                    />
                  </div>
                  <div class="flex ml-2">
                    <Button
                      v-if="selectedImg.length > 0"
                      class="p-button-danger text-white"
                      icon="pi pi-times"
                      :label="selectedImg.length.toString()"
                      @click="selectedImg = []"
                    />
                  </div>
                  <!-- <div class="flex ml-2">
                                <Button :disabled="selectedImg.length == 0" class="p-button-danger text-white"
                                    icon="pi pi-pencil" label="ยกเลิกรูปเอกสาร" @click="confirmRejectDialog = true" />
                            </div> -->
                </div>
              </div>
              <div class="p-inputgroup mt-2">
                <InputText placeholder="ค้นหาเอกสาร" v-model="searchItem" />
                <Button
                  icon="pi pi-search"
                  @click="getDocumentImageGroup()"
                  class="p-button-primary"
                />
              </div>
              <div class="flex justify-content-between">
                <div class="grid mt-3 ml-1">
                  <div
                    v-if="!modeCreateImageGroup"
                    v-for="listShowImageBy of listShowImageBys"
                    :key="listShowImageBy.code"
                    class="field-radiobutton m-3"
                  >
                    <RadioButton
                      :id="listShowImageBy.code"
                      name="listShowImageBy"
                      :value="listShowImageBy.code"
                      v-model="showImageBy"
                      @change="getDocImageListDefualt()"
                    />
                    <label :for="listShowImageBy.code">{{
                      listShowImageBy.name
                    }}</label>
                  </div>
                </div>
                <div class="grid mt-3 mr-1">
                  <div class="flex align-items-center ml-2">
                    <span class="mr-2 text-900">การเรียงข้อมูล</span>
                    <Dropdown
                      v-model="selectSort"
                      :options="sortField"
                      optionLabel="name"
                      optionValue="code"
                      @change="selectSortUse($event)"
                    >
                    </Dropdown>
                    <i
                      v-if="sortOrder == -1"
                      class="pi pi-sort-amount-up-alt cursor-pointer ml-2"
                      style="font-size: 1.5rem"
                      @click="selectSortOrder(1)"
                    ></i>
                    <i
                      v-if="sortOrder == 1"
                      class="pi pi pi-sort-amount-down-alt cursor-pointer ml-2"
                      style="font-size: 1.5rem"
                      @click="selectSortOrder(-1)"
                    ></i>
                  </div>
                </div>
              </div>
              <div class="flex" v-if="!modeCreateImageGroup">
                <div class="mt-2">
                  <Paginator
                    class="justify-content-start"
                    :rows="limitPage"
                    v-model:first="firstPage"
                    :totalRecords="totalItemsCount"
                    @page="onPage($event)"
                  >
                  </Paginator>
                </div>
              </div>
            </template>
            <template #content class="p-0">
              <div
                class="p-3 card"
                v-if="data_gallery.length == 0 && data_list.length == 0"
              >
                <div
                  class="flex align-content-center justify-content-center flex-wrap card-container"
                  style="min-height: 56vh"
                >
                  <div class="p-0">
                    <div class="text-xl text-300">
                      <h3>Drop File Here To Upload</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="!modeCreateImageGroup">
                <div class="grid pt-0 mt-0">
                  <div
                    class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0"
                    v-for="(data, index) in data_gallery"
                    :key="index"
                  >
                    <ImagesGallery
                      :gallery_data="data"
                      v-on:selectGallery="selectGallery"
                    ></ImagesGallery>
                  </div>
                  <div
                    class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0"
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
                        :modeAddGroup="modeCreateImageGroup"
                        :images_data="data"
                        :images_selete="selectedImg"
                        :allimage_used="AllImageUsed"
                        :mode="1"
                        v-on:selectImg="selectImg"
                        v-on:useImage="useImage"
                        v-on:createform="createform"
                        v-on:onFileSelect="onFileNewSelect"
                        v-on:onReloadData="getDocumentImageGroup"
                        v-on:documentImageUnGroup="documentImageUnGroup"
                        v-on:documentImageEditGroup="documentImageEditGroup"
                        v-on:rejectImage="rejectImage"
                        v-on:showDetailGlImage="showDetailGlImage"
                        v-on:addToGroupImage="addToGroupImage"
                      >
                      </ImageBlock>
                    </div>
                  </div>
                  <div
                    class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0"
                    v-if="showSkeleton"
                  >
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
                  <div
                    class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0"
                    v-if="showSkeleton"
                  >
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
                  <div
                    class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0"
                    v-if="showSkeleton"
                  >
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
              </div>
              <ScrollPanel style="height: 73vh" v-if="modeCreateImageGroup">
                <div class="grid pt-0 mt-0">
                  <div
                    class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0"
                    v-for="(data, index) in data_gallery"
                    :key="index"
                  >
                    <ImagesGallery
                      :gallery_data="data"
                      v-on:selectGallery="selectGallery"
                    ></ImagesGallery>
                  </div>
                  <div
                    class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0"
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
                        :modeAddGroup="modeCreateImageGroup"
                        :images_data="data"
                        :images_selete="selectedImg"
                        :allimage_used="AllImageUsed"
                        :mode="1"
                        v-on:selectImg="selectImg"
                        v-on:useImage="useImage"
                        v-on:createform="createform"
                        v-on:onFileSelect="onFileNewSelect"
                        v-on:onReloadData="getDocumentImageGroup"
                        v-on:documentImageUnGroup="documentImageUnGroup"
                        v-on:documentImageEditGroup="documentImageEditGroup"
                        v-on:rejectImage="rejectImage"
                        v-on:showDetailGlImage="showDetailGlImage"
                        v-on:addToGroupImage="addToGroupImage"
                      >
                      </ImageBlock>
                    </div>
                  </div>
                  <div
                    class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0"
                    v-if="showSkeleton"
                  >
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
                  <div
                    class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0"
                    v-if="showSkeleton"
                  >
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
                  <div
                    class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0"
                    v-if="showSkeleton"
                  >
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
              </ScrollPanel>
            </template>
          </Card>
        </SplitterPanel>
      </Splitter>

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
            <div class="flex">
              ชื่อรูป : {{ dataImageDialog.name }}
            </div>
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
            <label for="title" class="font-medium text-900"
              >ชื่อชุดเอกสาร</label
            >
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
    </MainContentWarp>
  </AppLayout>
</template>
<style lang="scss" scoped>
.p-card-body {
  padding: 0px !important;
}

.sticky-custom {
  z-index: 999;
  margin-top: 140px;
  position: fixed;
  top: 0;
  width: 100%;
}

@media only screen and (max-width: 991px) {
  .sticky-custom {
    z-index: 999;
    margin-top: 70px;
    position: fixed;
    top: 0;
    width: 100%;
  }
}
iframe {
  display: block; /* iframes are inline by default */
  border: none; /* Reset default border */
  height: 78vh; /* Viewport-relative units */
  width: 57.39vw;
}
</style>
