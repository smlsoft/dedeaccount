<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import DialogApprove from "@/components/form/DialogApprove.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MasterdataService from "@/services/MasterdataService";
import ImageDataService from "@/services/ImageDataService";
import TaskService from "@/services/TaskService";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import ImageUpload from "./components/ImagesUpload.vue";
import ImageBlock from "./components/ImagesBlock.vue";
import DatePicker from "@/components/widget/DatePicker.vue";
import $ from "jquery";

import DocumentPreview from "./components/documentPreview.vue";

const confirmChangeImage = ref("ต้องการเปลี่ยนรูปภาพ ");
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

const fileLimit = ref(100);
const uploadedFileCount = ref(0);
const updateRefDialog = ref(false);
const WsConnectImage = ref();
const WsConnectAllImage = ref();
const confirmRejectDialog = ref(false);
const showSkeleton = ref(false);
const totalPage = ref(0);
const selectSort = ref("xorder");
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
const sortOrder = ref(1);

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
const imagesDragReject = ref(0);
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
const images_list_group = ref([]);
const imageGroup = ref();
const imageDialog = ref(false);
const dataImageDialog = ref({});

const pageGetAllImage = ref(1);
const pageGetAllImageGroup = ref(1);

const jobId = ref("");
const searchImageDate = ref();
const searchFromDate = ref(new Date());
const searchToDate = ref(new Date());
const searchDate = ref("");
const fromDate = ref("");
const toDate = ref("");
const showOveray = ref(false);
const selectedImag = ref("");
const showImgData = ref();
const showDocumentPreview = ref(true);
const isSelectedDocument = ref(false);
const isDataListNull = ref(false);

const taskDetail = ref({
  guidfixed: "",
  name: "",
  status: 0,
});
const dialogJobApprove = ref(false);

const sizeImageBloc = ref(true);
const sizeWidthImageBloc = ref(90);
const sizeHeightImageBloc = ref(90);

const data_save_group = ref({});
const ramdomNumber = ref();
const tag = ref();
const separatorExp = ref(/,| /);
const confirmDeleteImage = ref(false);
const modeReorder = ref(false);
const draggedItemIndex = ref(null);
const data_sort = ref([]);

onUnmounted(() => {});
onMounted(() => {
  jobId.value = route.params.id;
  getDocumentImageGroup();
  getTaskById(jobId.value);

  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_job_upload_detail");
});

function getTaskById(guidfixed) {
  TaskService.getTaskById(guidfixed)
    .then((res) => {
      //console.log(res);
      if (res.success) {
        taskDetail.value = res.data;
        storeApp.setPageTitle("อัพโหลดรูป JOB #" + taskDetail.value.name);
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

function onClose() {
  confirmRejectDialog.value = false;
  confirmChangeImageDialog.value = false;
  confirmSaveDialog.value = false;
  updateRefDialog.value = false;
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

              ele.imagereferences.sort(function (a, b) {
                return a.xorder - b.xorder;
              });

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
    jobId.value
  )
    .then((res) => {
      if (res.success) {
        console.log("getDocumentImageGroup");
        console.log(res.data);
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

          data_list.value.forEach((element, index) => {
            element.ischecked = false;
          });

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

  let tags = [];
  selectedImg.value.forEach((element, index) => {
    if (element.tags != undefined) {
      tags = [...tags, ...element.tags];
    }
  });
  tag.value = Array.from(new Set(tags));

  console.log(selectedImg.value);

  ischeckedImage();
}

function ischeckedImage() {
  data_list.value.forEach((main) => {
    var result = selectedImg.value.filter(function (data) {
      return data.guidfixed == main.guidfixed;
    });
    if (result.length > 0) {
      main.ischecked = true;
    } else {
      main.ischecked = false;
    }
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

function openModalUpload() {
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
          showImgData.value = null;
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
  if (taskDetail.value.status != 0) {
    return;
  }
  imagesDragData.value = data;
  imagesDragCount.value = data.imagereferences.length;
  imagesDragReject.value = data.status;
  imagesDragReferences.value = data.references.length;

  if (!modeReorder.value) {
    if (checkUseImg(data.guidfixed)) {
      return;
    } else {
      //console.log(data);
      if (
        data.imagereferences.length == 1 &&
        data.isreject != 2 &&
        data.references.length == 0
      ) {
        if (selectedImg.value.length == 0) {
          selectedImg.value.push({
            guidfixed: data.guidfixed,
            tags: data.tags,
            documentimageguid: data.imagereferences[0],
          });
          ischeckedImage();
        }
      } else {
        return;
      }
    }
  } else {
    draggedItemIndex.value = data.xorder;
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
    return;
  }
  console.log(allowDropImage.value);

  // console.log(data);
  // console.log(event);
  event.stopPropagation();
  event.preventDefault();
}

async function drop(data, event) {
  event.preventDefault();
  console.log("drop");
  console.log(data);

  addImageGuidfixed.value = data.guidfixed;
  addImagenewData.value = data.imagereferences;

  if (addImageGuidfixed.value == imagesDragData.value.guidfixed) {
    removeSelectedImg();
    return;
  }

  if (!modeReorder.value) {
    if (data.isreject != 2 && data.references.length == 0) {
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
              tags: data.tags,
              documentimageguid: imagesDragData.value.imagereferences[0],
            });
          }
          updateRefDialog.value = true;
        } else {
          selectedImg.value.push({
            guidfixed: data.guidfixed,
            tags: data.tags,
            documentimageguid: data.imagereferences[0],
          });
          updateRefDialog.value = true;
        }

        let tags = [];
        selectedImg.value.forEach((element, index) => {
          if (element.tags != undefined) {
            tags = [...tags, ...element.tags];
          }
        });
        tag.value = Array.from(new Set(tags));

        console.log(tag.value);
        console.log(selectedImg.value);
        ischeckedImage();
        //เพิ่มรูปเข้าชุด
      } else {
        addToGroup.value = data.title;
        confirmGroupImageDialog.value = true;
      }
    }
  } else {
    // console.log("start: " + draggedItemIndex.value);
    // console.log("end: " + data.xorder);

    let startXorder = Math.min(draggedItemIndex.value, data.xorder);
    let endXorder = Math.max(draggedItemIndex.value, data.xorder);

    if (draggedItemIndex.value !== null) {
      const draggedItem = data_list.value[draggedItemIndex.value];
      data_list.value.splice(draggedItemIndex.value, 1);
      data_list.value.splice(data.xorder, 0, draggedItem);

      data_list.value.forEach((element, index) => {
        if (element.xorder >= startXorder && element.xorder <= endXorder) {
          data_sort.value.push({
            taskguid: jobId.value,
            guidfixed: element.guidfixed,
            xorder: index,
          });
        }
        element.xorder = index;
      });

      draggedItemIndex.value = data.xorder;

      // console.log(data_sort.value);
      // console.log(data_list.value);

      updateDocumentImageXsort();
    }
  }
}

function updateDocumentImageXsort() {
  ImageDataService.putDocumentImageXsort(data_sort.value)
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_sort.value = [];
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "Success",
          life: 1000,
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
}

async function addImageGroup() {
  selectedImg.value.forEach((element) => {
    element.documentimageguid.xorder = addImagenewData.value.length;
    addImagenewData.value.push(element.documentimageguid);
  });
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
      isSelectedDocument.value = false;
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

function addToGroupImage(data) {
  data_set_group.value.push(data);
  data_list.value = data_list.value.filter(
    (item) => !data_set_group.value.includes(item)
  );

  console.log(data_set_group.value);
}

function verifyData() {
  var errorCount = 0;

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

  if (errorCount != 0) {
    return false;
  } else {
    return true;
  }
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

function selectedDocument(isSelectedDoc) {
  isSelectedDocument.value = isSelectedDoc;

  if (!isSelectedDoc) {
    removeSelectedImg();
  }
  ischeckedImage();
}

function selectedModeReorder(data) {
  if (data) {
    modeReorder.value = true;
  } else {
    modeReorder.value = false;
  }
}

function removeSelectedImg() {
  selectedImg.value = [];
  data_list.value.forEach((element) => {
    element.ischecked = false;
  });
}

function clearFilterDocumentImageGroup() {
  limitPage.value = 50;
  activePage.value = 1;
  searchItem.value = "";
  selectSort.value = "uploadedat";
  sortOrder.value = -1;
  showImageBy.value = "";
  fromDate.value = "";
  toDate.value = "";
  jobId.value = "";
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
async function saveGropImages() {
  let newDate = new Date();

  newDate = uploadedat2.value;

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

  console.log(selectedImg.value);
  let isPass = await verifyData();
  if (isPass) {
    let imagereferences = [];
    selectedImg.value.forEach((element, index) => {
      element.documentimageguid.xorder = index;
      imagereferences.push(element.documentimageguid);
    });

    data_save_group.value = {
      imagereferences: imagereferences,
      title: title2.value,
      taskguid: route.params.id,
      tags: tag.value,
      uploadedat: Utils.getFormatDateTime(newDate),
    };
  } else {
    return;
  }

  console.log(data_save_group.value);

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
        isSelectedDocument.value = false;
        imageGroup.value = null;
        title.value = "";
        title_valid.value = false;
        uploadedat.value = new Date();
        title2.value = "";
        title2_valid.value = false;
        uploadedat2.value = new Date();
        updateRefDialog.value = false;
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

function cancelGropImages() {
  if (isSelectedDocument.value) {
    updateRefDialog.value = false;
    title2.value = "";
    title2_valid.value = false;
  } else {
    selectedImg.value = [];
    updateRefDialog.value = false;
    title2.value = "";
    title2_valid.value = false;
    tag.value = [];
    ischeckedImage();
  }
}

function closeJob() {
  ramdomNumber.value = Utils.generateRandomNumber();
  dialogJobApprove.value = true;
}

function confirmJobFalse() {
  ramdomNumber.value = Utils.generateRandomNumber();
}

// ส่งตรวจสอบ
async function jobApprove() {
  dialogJobApprove.value = false;
  let status = {
    status: 1,
  };
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
        router.push({ name: "images_job_upload" });
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

async function deleteImage() {
  let data = [];
  selectedImg.value.forEach((ele) => {
    data.push(ele.guidfixed);
  });
  console.log(data);
  try {
    const res = await ImageDataService.deleteDocumentImageGroup(data);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
      selectedImg.value = [];
      showImgData.value = null;
      isSelectedDocument.value = false;
      confirmDeleteImage.value = false;
      getDocumentImageGroup();
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

function onColseConfirmGroupImageDialog() {
  confirmGroupImageDialog.value = false;
  selectedImg.value = [];
}

async function updateTagImage(id, data) {
  // console.log(id);
  // console.log(data);

  try {
    const res = await ImageDataService.putDocumentImageGroupTags(id, data);
    if (res.success) {
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == id) {
          ele.tags = data;
        }
      });
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

function handleDragEnd() {
  draggedItemIndex.value = null;
}
</script>
<template>
  <AppLayout>
    <div
      class="flex align-items-center justify-content-between bg-primary-50 p-1"
    >
      <div class="flex">
        <div class="ml-1">
          <Button
            class="p-button-sm p-button-text"
            label="กลับหน้ารายการ"
            icon="pi pi-arrow-left"
            @click="router.push({ name: 'images_job_upload' })"
          />
        </div>

        <div class="ml-1">
          <Button
            :disabled="taskDetail.status != 0"
            class="p-button-sm"
            label="Upload รูปภาพ"
            icon="pi pi-upload"
            @click="openModalUpload()"
          />
        </div>
        <div class="ml-1">
          <Button
            :disabled="selectedImg.length <= 1 || taskDetail.status != 0"
            class="p-button-info text-white p-button-sm"
            icon="pi pi-pencil"
            label="กำหนดชุดเอกสาร"
            @click="updateRefDialog = true"
          />
        </div>

        <div class="ml-1">
          <Button
            :disabled="taskDetail.status != 0 || modeReorder"
            :class="!isSelectedDocument ? 'surface-600' : 'surface-700'"
            class="text-black p-button-sm"
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
        </div>
        <div class="ml-1">
          <Button
            :disabled="isSelectedDocument"
            :class="!modeReorder ? 'surface-800' : 'surface-700'"
            class="p-button-info text-white p-button-sm"
            :icon="!modeReorder ? 'pi pi pi-sort' : 'pi pi-times'"
            :label="!modeReorder ? 'เรียงรูป' : 'ยกเลิกเรียงรูป'"
            @click="
              !modeReorder
                ? selectedModeReorder(true)
                : selectedModeReorder(false)
            "
          />
        </div>
        <div class="ml-1">
          <Button
            v-if="selectedImg.length > 0"
            class="p-button-warning p-button-sm"
            icon="pi pi-times"
            :label="'เลือก: ' + selectedImg.length.toString()"
            @click="removeSelectedImg"
          />
        </div>
      </div>
      <div class="flex">
        <ToggleButton
          v-model="sizeImageBloc"
          onLabel=""
          offLabel=""
          offIcon="pi pi-th-large"
          onIcon="pi pi-table"
          @change="selectSizeImageBloc()"
          class="mr-2"
        ></ToggleButton>
        <Button
          :disabled="selectedImg.length == 0 || taskDetail.status != 0"
          class="p-button-danger p-button-sm mr-1 p-button-outlined"
          icon="pi pi-trash"
          label="ลบเอกสาร"
          @click="confirmDeleteImage = true"
        />
        <Button
          :disabled="taskDetail.status != 0 || data_list.length == 0"
          class="p-button-sm p-button-success"
          label="ปิดงาน"
          icon="pi pi-send"
          @click="closeJob()"
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
                <TransitionGroup name="fade">
                  <div
                    v-if="isDataListNull == false"
                    class="flex"
                    v-for="data in data_list"
                    :key="data.guidfixed"
                    draggable="true"
                    @dragstart="dragStart(data, $event)"
                    @drag="
                      taskDetail.status == 0 &&
                      imagesDragCount == 1 &&
                      imagesDragReject != 2 &&
                      imagesDragReferences == 0
                        ? dragging(data, $event)
                        : ''
                    "
                    @dragend="modeReorder ? handleDragEnd() : ''"
                    @drop="
                      taskDetail.status == 0 &&
                      imagesDragCount == 1 &&
                      imagesDragReject != 2 &&
                      imagesDragReferences == 0
                        ? drop(data, $event)
                        : ''
                    "
                    @dragover="
                      taskDetail.status == 0 &&
                      imagesDragCount == 1 &&
                      imagesDragReject != 2 &&
                      imagesDragReferences == 0
                        ? allowDrop(data, $event)
                        : ''
                    "
                    @dragover.prevent
                  >
                    <ImageBlock
                      :modeMenu="1"
                      :images_data="data"
                      :images_selete="selectedImg"
                      :allimage_used="AllImageUsed"
                      :isSelectedDocument="isSelectedDocument"
                      :sizeWidthImageBloc="sizeWidthImageBloc"
                      :sizeHeightImageBloc="sizeHeightImageBloc"
                      v-on:selectImg="selectImg"
                      v-on:useImage="useImage"
                      v-on:addToGroupImage="addToGroupImage"
                      v-on:showImg="showImg"
                    >
                    </ImageBlock>
                  </div>
                  <div
                    class="flex"
                    v-for="i in 50"
                    :key="i"
                    v-if="showSkeleton"
                  >
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
                </TransitionGroup>
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
              :jobStatus="taskDetail.status"
              :modeMenu="1"
              v-on:closeDocumentPreview="closeDocumentPreview"
              v-on:onFileSelect="onFileNewSelect"
              v-on:documentImageUnGroup="documentImageUnGroup"
              v-on:updateTagImage="updateTagImage"
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

    <Dialog
      v-model:visible="updateRefDialog"
      @update:visible="cancelGropImages"
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
        <div class="field mb-12 col-12 md:col-12" style="display: none">
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
        <div class="field mb-12 col-12 md:col-12">
          <label class="font-medium text-900">แท็กเอกสาร</label>
          <Chips
            v-model="tag"
            :separator="separatorExp"
            :allowDuplicate="false"
            placeholder="แท็กเอกสาร"
            :addOnBlur="true"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="ยกเลิก"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelGropImages()"
        />
        <Button
          label="บันทึก"
          icon="pi pi-check"
          class="p-button-text"
          @click="saveGropImages()"
        />
      </template>
    </Dialog>

    <Dialog
      header="Upload รูปภาพ"
      v-model:visible="uploadmodel"
      :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
      :style="{ width: '90vw' }"
      :modal="true"
      :closable="false"
      contentStyle="padding: 0rem;"
    >
      <ImageUpload
        :task_number="taskDetail"
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
      v-on:close="onColseConfirmGroupImageDialog"
      v-on:confirm="addImageGroup()"
    ></DialogForm>
    <DialogForm
      :confirmDialog="confirmDeleteImage"
      :textContent="'ต้องการลบรูป'"
      :textDetail="selectedImg"
      v-on:close="confirmDeleteImage = false"
      v-on:confirm="deleteImage()"
    ></DialogForm>
    <DialogApprove
      :title="'ยืนยันการตรวจสอบ'"
      :ramdomNumber="ramdomNumber"
      :confirmDialog="dialogJobApprove"
      v-on:close="dialogJobApprove = false"
      v-on:confirmJob="jobApprove()"
      v-on:confirmJobFalse="confirmJobFalse()"
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

.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.fade-leave-active {
  position: absolute;
}
</style>
