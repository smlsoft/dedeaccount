<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import { DomHandler } from "primevue/utils";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import ImageUpload from "./components/ImagesUpload.vue";
import ImageBlock from "./components/ImagesBlock.vue";
import ImagesGallery from "./components/ImagesGallery.vue";
import $ from "jquery";

const textContent = ref("ต้องการยกเลิกรูปภาพ ");
const confirmChangeImage = ref("ต้องการเปลี่ยนรูปภาพ ");
const updateRef = ref("ต้องการกำหนดกลุ่มเอกสาร ");
const create = ref("ต้องการสร้าง Gallery ใหม่");
const content = ref();
const storeApp = useApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const detail = ref();
const data_list = ref([]);
const confirmSaveDialog = ref(false);
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
    code: "status",
    name: "สถานะ",
  },
  {
    code: "documentref",
    name: "กลุ่มเอกสาร",
  },
  {
    code: "uploadedat",
    name: "วันที่ Upload",
  },
]);
const sortOrder = ref(-1);

const isGallery = ref(false);
const selectedImg = ref([]);
const groupDocRef = ref("");
const confirmChangeImageDialog = ref(false);
const newDocRefImage = ref("");
const showrejectImgdialog = ref(false);
const rejectDocref = ref("");
const connection = ref();
const listShowImageBys = ref([
  { name: "แสดงทั้งหมด", code: "" },
  { name: "รูปที่ยังไม่ได้บันทึก", code: "0" },
  { name: "รูปที่บันทึกแล้ว", code: "2" },
  { name: "รูปที่โดนยกเลิก", code: "1" },
]);
const showImageBy = ref("");
const createFormStatus = ref(false);

onUnmounted(() => {
  console.log(
    "unmounted--------------------------------------------------------"
  );

  WsConnectAllImage.value.close();
  WsConnectImage.value.close();
  connection.value.close();
});

onMounted(() => {
  getDocImageList();

  storeApp.setActivePage("pic_group");
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
    console.log("onmessage ", event);
    var jsonData = JSON.parse(event.data);
    if (jsonData.docref != "") {
      MasterdataService.getImagesByDocref(jsonData.docref)
        .then((res) => {
          if (res.success) {
            console.log(res.data);
            if (res.data.documentimages.length > 0) {
              //router.push({ name: "daily_images_show" });
            }
          }
        })
        .catch((err) => {
          // console.log(err);
        });
    }
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
    console.log("WsConnectImage ", event);
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
        route.name == "list_images"
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
function onClose() {
  confirmRejectDialog.value = false;
  createDialog.value = false;
  confirmChangeImageDialog.value = false;
  confirmSaveDialog.value = false;
  updateRefDialog.value = false;
}
function editRef(data) {
  console.log(data);
  MasterdataService.updateDocRef(data)
    .then((res) => {
      console.log(res);
      if (res.success) {
        data.isUpdate = false;
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "บันทึกเลขอ้างอิงสำเร็จ",
          life: 3000,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "บันทึกล้มเหลว " + err,
        life: 3000,
      });
    });
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

function onUpdate(data) {
  data.isUpdate = true;
  setTimeout(() => {
    document.getElementById(data.guidfixed).focus();
  }, 300);
}

function getDocImageListScroll() {
  showSkeleton.value = true;
  MasterdataService.getDocImage(
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
            data_list.value.push(ele);
          });
          console.log(data_list.value);

          //onsole.log(totalItemsCount.value);
          getAllSelectImage();
          firstPage.value = activePage.value;

          console.log("firstPage" + firstPage.value);
          showSkeleton.value = false;
        }, 500);
      }
    })
    .catch((err) => {
      console.log(err);
      showSkeleton.value = false;
    });
}
function getDocImageListDefualt() {
  loading.value = true;
  selectedImg.value = [];
  limitPage.value = 50,
    activePage.value = 1,
    searchItem.value = "",
    showImageBy.value;
  getDocImageList();
}

function getDocImageList() {
  loading.value = true;
  selectedImg.value = [];
  MasterdataService.getDocImage(
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
        data_list.value.forEach((ele) => {
          ele.isUpdate = false;
        });
        totalPage.value = res.pagination.totalPage;
        totalItemsCount.value = res.pagination.total;
        //onsole.log(totalItemsCount.value);
        getAllSelectImage();
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
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
    getDocImageListScroll();
  }
}
function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
  console.log(activePage.value);
  loading.value = true;
  getDocImageList();
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

  uploadProgress();
}

async function uploadProgress() {
  console.log(data_import.value);
  var interval = 1000;
  await data_import.value.forEach((ele, index) => {
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
                getDocImageList();
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
    if (element == data) {
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
      if (element != data) {
        rebuild.push(element);
      }
    });
    selectedImg.value = rebuild;
  } else {
    selectedImg.value.push(data);
    setTimeout(() => {
      selectedImg.value = Utils.remove_duplicates_array(selectedImg.value);
    }, 100);
  }
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
  searchItem.value = "";
  selectSort.value = "uploadedat";
  sortOrder.value = 1;
  showImageBy.value = "";
  firstPage.value = 0;
  getDocImageList();
}

async function postGroupDocRef() {
  var docref = {
    documentref: groupDocRef.value,
    documentimages: selectedImg.value,
  };

  try {
    const res = await MasterdataService.postGroupDocRef(docref);
    if (res.success) {
      updateRefDialog.value = false;
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
      setTimeout(() => {
        groupDocRef.value = "";
        selectedImg.value = [];
        activePage.value = 1;
        getDocImageList();
      }, 100);
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "error",
      detail: "บันทึกไม่สำเร็จ " + err,
      life: 3000,
    });
  }
}

function rejectImg(data) {
  confirmSaveDialog.value = true;
  rejectDocref.value = data;
}

function rejectSelectimg() {
  var post_data = { status: 1 };
  selectedImg.value.forEach((ele, index) => {
    var filter = data_list.value.filter((val) => val.guidfixed == ele);
    if (filter.length == 1) {
      console.log(filter);
      MasterdataService.putrejectimagestatusonly(
        post_data,
        filter[0].documentref
      )
        .then((res) => {
          if (res.success) {
            setTimeout(() => {
              if (index + 1 == selectedImg.value.length) {
                toast.add({
                  severity: "success",
                  detail: "ยกเลิกเอกสารที่เลือกสำเร็จ",
                  summary: "success",
                  life: 3000,
                });
                activePage.value = 1;
                getDocImageList();
              }
            }, 1000);
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
    }
  });

  confirmRejectDialog.value = false;
}

function rejectImgUse() {
  var post_data = { status: 1 };
  MasterdataService.putrejectimagestatusonly(post_data, rejectDocref.value)
    .then((res) => {
      if (res.success) {
        toast.add({
          severity: "success",
          detail: "บันทึกข้อมูลสำเร็จ",
          summary: "success",
          life: 3000,
        });
        getDocImageList();
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
  confirmSaveDialog.value = false;
}

function removeReject(data) {
  console.log(data);
  var post_data = { status: 0 };
  MasterdataService.putrejectimagestatusonly(post_data, data)
    .then((res) => {
      if (res.success) {
        toast.add({
          severity: "success",
          detail: "บันทึกข้อมูลสำเร็จ",
          summary: "success",
          life: 3000,
        });
        activePage.value = 1;
        getDocImageList();
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
    //console.log(data_import);
    uploadNewProgress(data_import, data);
  }
}

async function uploadNewProgress(data_import, data) {
  //console.log(data);
  var interval = 1000;
  await data_import.forEach((ele) => {
    console.log(ele);
    MasterdataService.upLoadImages(ele, "GL")
      .then((res) => {
        //console.log(res);
        if (res.success) {
          console.log(res.data.uri);
          removeRejectwithImg(res.data.uri, data);
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
  });
  return data_import;
}

async function removeRejectwithImg(imageuri, data) {
  console.log(data);
  const rejectdata = ref({
    documentref: data.documentref,
    imageuri: imageuri,
    module: data.module,
    docguidref: data.docguidref,
    status: 0,
    uploadedby: data.uploadedby,
    uploadedat: data.uploadedat,
  });
  try {
    const res = await MasterdataService.putrejectimage(
      rejectdata.value,
      data.guidfixed
    );
    console.log(res);
    if (res.success) {
      getDocImageList();
    }
  } catch (err) {
    console.log(err);
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
      <div class="surface-ground" v-if="isGallery">
        <Button label="กลับหน้ารายการ" icon="pi pi-arrow-left" class="p-button-text p-button-sm p-button-info"
          @click="goList()" />
      </div>
      <Card class="p-3" ref="content" @dragenter="onDragEnter" @dragover="onDragOver" @dragleave="onDragLeave"
        @drop="onDrop">
        <template #header>
          <div class="grid pt-2">
            <div class="flex">
              <div class="flex ml-2" v-if="!isGallery">
                <!-- <Button
                  class="p-button-success"
                  icon="pi pi-plus"
                  label="สร้าง Gallery"
                  @click="createDialog = true"
                /> -->
                <Button class="ml-2" label="Upload รูปภาพ" icon="pi pi-upload" @click="openModal()" />
              </div>
              <div class="flex ml-2">
                <Button :disabled="selectedImg.length == 0" class="p-button-info text-white" icon="pi pi-pencil"
                  label="กำหนดกลุ่มเอกสาร" @click="updateRefDialog = true" />
              </div>
              <div class="flex ml-2">
                <Button :disabled="selectedImg.length == 0" class="p-button-danger text-white" icon="pi pi-pencil"
                  label="ยกเลิกรูปเอกสาร" @click="confirmRejectDialog = true" />
              </div>
            </div>
          </div>
          <div class="p-inputgroup mt-2">
            <InputText placeholder="ค้นหาเอกสาร" v-model="searchItem" />
            <Button icon="pi pi-search" @click="getDocImageList()" class="p-button-primary" />
          </div>
          <div class="flex justify-content-between">
            <div class="grid mt-3 ml-1">
              <div v-for="listShowImageBy of listShowImageBys" :key="listShowImageBy.code"
                class="field-radiobutton m-3">
                <RadioButton :id="listShowImageBy.code" name="listShowImageBy" :value="listShowImageBy.code"
                  v-model="showImageBy" @change="getDocImageListDefualt()" />
                <label :for="listShowImageBy.code">{{
                listShowImageBy.name
                }}</label>
              </div>
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
          <div class="flex">
            <Paginator class="justify-content-start" :rows="limitPage" v-model:first="firstPage"
              :totalRecords="totalItemsCount" @page="onPage($event)">
            </Paginator>
          </div>
        </template>
        <template #content class="p-0" >
          <div class="p-3 card" v-if="data_gallery.length == 0 && data_list.length == 0">
            <div class="flex align-content-center justify-content-center flex-wrap card-container"
              style="min-height: 56vh">
              <div class="p-0">
                <div class="text-xl text-300">
                  <h3>Drop File Here To Upload</h3>
                </div>
              </div>
            </div>
          </div>

          <div class="grid pt-0 mt-3">
            <div class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0" v-for="(data, index) in data_gallery" :key="index">
              <ImagesGallery :gallery_data="data" v-on:selectGallery="selectGallery"></ImagesGallery>
            </div>
            <div class="col-12 md:col-6 lg:col-4 xl:col-3 pt-0" v-for="data in data_list" :key="data.guidfixed">
              <ImageBlock :images_data="data" :images_selete="selectedImg" :allimage_used="AllImageUsed" :mode="1"
                v-on:selectImg="selectImg" v-on:useImage="useImage" v-on:createform="createform"
                v-on:rejectImg="rejectImg" v-on:removeReject="removeReject" v-on:onFileSelect="onFileNewSelect"
                v-on:onReloadData="getDocImageList">
              </ImageBlock>
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
          <!-- <VirtualScroller
            class="custom-loading"
            :items="basicItems"
            :itemSize="15"
            showLoader
            :delay="250"
            style="height: 500px"
            @scroll="scrollchange"
          >
            <template v-slot:item="{ item, options }">
              <div
                :class="['scroll-item p-2', { odd: options.odd }]"
                style="height: 50px"
              >
                {{ item }}
              </div>
            </template>
            <template v-slot:loader="{ options }">
              <div
                :class="['scroll-item p-2', { odd: options.odd }]"
                style="height: 50px"
              >
                <Skeleton :width="options.even ? '60%' : '50%'" height="1.3rem" />
              </div>
            </template>
          </VirtualScroller> -->
        </template>
      </Card>

      <DialogForm :confirmDialog="createDialog" :textContent="create" v-on:close="onClose" v-on:confirm="onSaveCreate">
      </DialogForm>
      <Dialog v-model:visible="updateRefDialog" :style="{ width: '450px' }" header="กำหนดกลุ่มเอกสาร" :modal="true">
        <div class="grid formgrid p-fluid">
          <div class="field mb-4 col-12">
            <label class="font-medium text-900">เลขที่อ้างอิง</label>
            <InputText type="text" v-model="groupDocRef" />
          </div>
        </div>
        <template #footer>
          <Button label="ยกเลิก" icon="pi pi-times" class="p-button-text" @click="updateRefDialog = false" />
          <Button label="บันทึก" icon="pi pi-check" class="p-button-text" @click="postGroupDocRef()" />
        </template>
      </Dialog>
      <!-- <DialogForm
        :confirmDialog="updateRefDialog"
        :textContent="updateRef"
        v-on:close="onClose"
        v-on:confirm="postGroupDocRef()"
      ></DialogForm> -->
      <Dialog header="Upload รูปภาพ" v-model:visible="uploadmodel" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        :style="{ width: '80vw' }" :modal="true">
        <ImageUpload v-on:success="uploadSuccess()"></ImageUpload>
      </Dialog>
      <DialogForm :confirmDialog="confirmChangeImageDialog" :textContent="confirmChangeImage" v-on:close="onClose"
        v-on:confirm="changeImage(newDocRefImage)"></DialogForm>

      <DialogForm :confirmDialog="confirmSaveDialog" :textContent="textContent" v-on:close="onClose"
        v-on:confirm="rejectImgUse()"></DialogForm>
      <DialogForm :confirmDialog="confirmRejectDialog" :textContent="textContent" v-on:close="onClose"
        v-on:confirm="rejectSelectimg()"></DialogForm>
    </MainContentWarp>
  </AppLayout>
</template>
<style lang="scss" scoped>
.p-card-body {
  padding: 0px !important;
}


</style>
