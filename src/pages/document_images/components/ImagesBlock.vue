<template>
  <div
    class="relative cursor-pointer text-center m-3"
    style="width: 90px; height: 90px"
    :class="borderImage()"
    @click="zoomImg(props.images_data)"
    @mouseenter="hoveredItem = props.images_data.imageuri"
    @mouseleave="hoveredItem = null"
  >
    <div
      class="static flex align-items-center justify-content-center hover:shadow-3"
    >
      <img
        :src="props.images_data.imagereferences[0].imageuri"
        class="w-full"
        style="width: 80px; height: 84px; object-fit: cover; margin: 3px"
      />
      <button
        v-if="props.images_data.imagereferences.length > 1"
        type="text"
        v-ripple
        class="absolute p-link w-2rem h-2rem bg-primary-500 border-circle inline-flex align-items-center justify-content-center"
        style="top: 0rem; left: 0rem"
      >
        <span class="font-bold text-white">{{
          props.images_data.imagereferences.length
        }}</span>
      </button>
      <Checkbox
        v-if="
          isSelectedDocument &&
          props.images_data.imagereferences.length === 1 &&
          props.images_data.references.length === 0 &&
          props.images_data.isreject == false &&
          !checkUseImg(props.images_data.guidfixed)
        "
        style="top: 0rem; right: 0rem"
        class="absolute"
        inputId="binary"
        v-model="props.images_data.ischecked"
        :binary="true"
        @click="selectModeImage()"
      />
    </div>
    <div class="white-space-nowrap overflow-hidden text-overflow-ellipsis">
      <span class="text-900" style="font-size: 12px">{{
        props.images_data.title
      }}</span>
    </div>
  </div>

  <DialogForm
    :confirmDialog="confirmSaveImg"
    :textContent="'ต้องการบันทึกรูปภาพ'"
    v-on:close="confirmSaveImg = false"
    v-on:confirm="saveUpdateImg()"
  ></DialogForm>
  <DialogForm
    :confirmDialog="confirmUnGroup"
    :textContent="'ต้องการยกเลิกชุดรูปภาพ'"
    v-on:close="confirmUnGroup = false"
    v-on:confirm="documentImageUnGroup()"
  ></DialogForm>

  <DialogForm
    :confirmDialog="onfirmRejectDialog"
    v-on:close="onfirmRejectDialog = false"
    :textContent="contentOnfirmRejectDialog"
    v-on:confirm="
      rejectImage(
        props.images_data.imagereferences[activeIndexList].documentimageguid,
        isReject
      )
    "
  >
  </DialogForm>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Utils from "@/utils/";
import $ from "jquery";
import MasterdataService from "@/services/MasterdataService";
import { useToast } from "primevue/usetoast";
import DialogForm from "@/components/form/DialogForm.vue";

const toast = useToast();
const confirmSaveImg = ref(false);
const confirmUnGroup = ref(false);
const showImgData = ref(null);
const showImgDialog = ref(false);
const showImageDocRef = ref("");
const hoveredItem = ref();
const cropper = ref();
const zoomImgData = ref();
const activeIndexList = ref(0);
const onfirmRejectDialog = ref(false);
const isReject = ref(true);
const contentOnfirmRejectDialog = ref("");
const confirmEditGroup = ref(false);

const checkSelected = ref(false);

// const checkSelected = computed({
//   get() {
//     if (props.images_selete.length == 0) {
//       return false;
//     }
//   },
// });

const props = defineProps({
  images_data: Object,
  images_selete: Array,
  mode: Number,
  allimage_used: Array,
  isSelectedDocument: Boolean,
});
const emit = defineEmits([
  "selectImg",
  "useImage",
  "createform",
  "rejectImg",
  "onFileSelect",
  "onReloadData",
  "documentImageUnGroup",

  "rejectImage",
  "showDetailGlImage",
  "addToGroupImage",
  "showImg",
]);

onMounted(async () => {
  //console.log(props.images_data);
  let box = $(".cardimage");

  let width = box.offsetWidth;

  $(".titletext").attr(
    "style",
    "width:" +
      (width - 20) +
      "px;white-space: nowrap;overflow: hidden;  text-overflow: ellipsis;"
  );
});

function chooseFile() {
  document.getElementById("chooseFile").click();
}

function checkSelect(data) {
  var found = 0;

  props.images_selete.forEach((element) => {
    if (element.guidfixed == data) {
      found += 1;
    }
  });

  if (found == 0) {
    return false;
  } else {
    return true;
  }
}

function flip(x, y) {
  cropper.value.flip(x, y);
}

function rotate(angle) {
  cropper.value.rotate(angle);
}

function saveUpdateImg() {
  const { canvas } = cropper.value.getResult();

  if (canvas) {
    const form = new FormData();

    // console.log(canvas.toDataURL());
    var dataUrl = canvas.toDataURL();
    // var resizedImage = dataURLToBlob(dataUrl);
    // $.event.trigger({
    //   type: "imageResized",
    //   blob: resizedImage,
    //   url: dataUrl,
    // });

    // var newfile = createFile(resizedImage);

    // console.log(newfile);

    var image = new Image();
    image.onload = function (imageEvent) {
      // Resize the image
      var canvasx = document.createElement("canvas"),
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
      canvasx.width = width;
      canvasx.height = height;
      canvasx.getContext("2d").drawImage(image, 0, 0, width, height);
      var dataUrl = canvasx.toDataURL("image/jpeg");
      var resizedImage = dataURLToBlob(dataUrl);
      $.event.trigger({
        type: "imageResized",
        blob: resizedImage,
        url: dataUrl,
      });

      var newfile = createFile(resizedImage);

      console.log(newfile);
      console.log(zoomImgData.value);
      MasterdataService.upLoadImages(newfile, "GL")
        .then((res) => {
          console.log(res);
          if (res.success) {
            console.log(res.data.uri);
            replaceImg(res.data.uri);
            toast.add({
              severity: "success",
              summary: "Success",
              detail: " Uploaded",
              life: 5000,
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
    image.src = dataUrl;
  }
}
async function replaceImg(imageuri) {
  console.log(zoomImgData.value);
  var replaceData = {
    documentref: zoomImgData.value.documentref,
    imageuri: imageuri,
    module: zoomImgData.value.module,
    docguidref: zoomImgData.value.docguidref,
    status: 0,
    uploadedby: zoomImgData.value.uploadedby,
    uploadedat: zoomImgData.value.uploadedat,
  };
  try {
    const res = await MasterdataService.putrejectimage(
      replaceData,
      zoomImgData.value.guidfixed
    );
    console.log(res);
    if (res.success) {
      showImgDialog.value = false;
      confirmSaveImg.value = false;
      reloadData();
    }
  } catch (err) {
    console.log(err);
  }
}

function createFile(image) {
  let newFile = new File([image], Utils.uuidv4() + Utils.uuidv4() + ".jpg", {
    type: "image/png",
  });
  newFile.objectURL = window.URL.createObjectURL(image);
  return newFile;
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

function download() {
  const result = this.$refs.cropper.getResult().canvas.toDataURL();
  const newTab = window.open();
  newTab.document.body.innerHTML = `<img src="${result}"></img>`;
}
function checkUseImg(data) {
  var found = 0;

  props.allimage_used.forEach((element) => {
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

function getUseData(data) {
  var found = 0;
  var detail = "";
  props.allimage_used.forEach((element) => {
    if (element.docref == data) {
      found = 1;
      detail = element.username;
    }
  });
  if (found != 0) {
    return detail;
  } else {
    return "Not Found";
  }
}

function selectImg(data, documentimageguid) {
  if (props.mode == 1) {
    let dataSelet = {
      guidfixed: data,
      documentimageguid: documentimageguid,
    };
    emit("selectImg", dataSelet);
  } else if (props.mode == 3 || props.mode == 4) {
    emit("selectImg", data);
  } else {
    emit("selectImg", data);
  }
}

function zoomImg(data) {
  data.imagereferences = data.imagereferences.sort((a, b) => {
    if (a.xorder < b.xorder) {
      return -1;
    }
  });
  console.log(data);

  zoomImgData.value = data;
  showImgData.value = data.imagereferences;
  showImageDocRef.value = data.documentref;

  //showImgDialog.value = true;

  emit("showImg", showImgData.value);
}

function createform() {
  emit("createform", props.images_data.documentref);
}

function useImage() {
  emit("useImage", props.images_data.documentref);
}

function rejectImg() {
  emit("rejectImg", props.images_data.documentref);
}
function onFileSelect(event) {
  emit(
    "onFileSelect",
    event,
    props.images_data.imagereferences[activeIndexList.value]
  );
  showImgDialog.value = false;
}

function reloadData() {
  emit("onReloadData", "");
}

function documentImageUnGroup() {
  emit("documentImageUnGroup", props.images_data.guidfixed);
  confirmUnGroup.value = false;
  showImgDialog.value = false;
}

function rejectImage(documentimageguid, isReject) {
  onfirmRejectDialog.value = false;
  showImgDialog.value = false;

  emit("rejectImage", documentimageguid, isReject);
}

function showDetailGlImage(docno) {
  emit("showDetailGlImage", docno);
}

function addToGroupImage(data) {
  emit("addToGroupImage", data);
}

function selectRejectImage(reject) {
  if (reject) {
    contentOnfirmRejectDialog.value =
      "ต้องการยกเลิกรูปภาพ " +
      props.images_data.imagereferences[activeIndexList.value].name;
    isReject.value = true;
    onfirmRejectDialog.value = true;
  } else {
    contentOnfirmRejectDialog.value =
      "ต้องการนำรูปภาพ " +
      props.images_data.imagereferences[activeIndexList.value].name +
      " กลับมาใช้";
    isReject.value = false;
    onfirmRejectDialog.value = true;
  }
}

function selectModeImage() {
  console.log("selectModeImage");
  console.log(checkUseImg(props.images_data.guidfixed));

  // mode 1 page : images_list                   เมนู: รูปภาพเอกสาร
  // mode 3 page : daily_form                    เมน: บันทึกรายการบัญชี
  // mode 4 page : daily_images_group_list       เมนู: บันทึกรายวันจากรูป

  if (showImgDialog.value) {
    return;
  }

  let modeMenu = props.mode;
  let statusImage = props.images_data.isreject;
  if (!checkUseImg(props.images_data.guidfixed)) {
    if (props.images_data.references.length > 0) {
      return false;
    } else {
      if (modeMenu == 1 && statusImage == false) {
        if (props.images_data.imagereferences.length > 1) {
          console.log("group");
          // zoomImg(props.images_data);
        } else {
          selectImg(
            props.images_data.guidfixed,
            props.images_data.imagereferences[0]
          );
        }
      } else if (modeMenu == 3 || (modeMenu == 4 && statusImage == false)) {
        selectImg(props.images_data.guidfixed);
      } else if (statusImage == true) {
        zoomImg(props.images_data);
      }
    }
  }
}

function printImg(data) {
  console.log(data);
  var url = data;
  var w = window.open("", "");
  w.document.write("<html><head>");
  w.document.write("</head><body >");

  data.forEach((element, index) => {
    w.document.write(
      '<img id="print-image-element" src="' +
        element.imageuri +
        '" width="100%"/>'
    );
  });

  w.document.write(
    '<script>var img = document.getElementById("print-image-element"); img.addEventListener("load",function(){ window.focus(); window.print(); window.document.close(); window.close(); }); <//script>'
  );
  w.document.write("</body></html>");
  w.window.print();
  w.window.close();
  selectModeImage();
}

function borderImage() {
  let userImageStyle = "";
  let isUseImage = checkUseImg(props.images_data.guidfixed);
  let selectedImage = checkSelect(props.images_data.guidfixed);
  let statusImage = props.images_data.isreject;
  let referencesImage = props.images_data.references;

  if (referencesImage.length == 0) {
    if (statusImage == false) {
      if (isUseImage) {
        userImageStyle = "bg-blue-100";
      } else {
        if (selectedImage) {
          userImageStyle = "bg-blue-500 ";
        } else {
          userImageStyle = "bg-blue-while hover:shadow-1 ";
        }
      }
    } else if (statusImage == true) {
      userImageStyle = "bg-red-400";
    }
  } else {
    userImageStyle = "bg-green-100";
  }

  return userImageStyle;
}

function exitDialog() {
  console.log("exitDialog");
  activeIndexList.value = 0;
}
</script>
<style scoped>
.selectimgDialog .p-dialog-header {
  padding: 10px 15px 10px 15px;
}

.p-galleria-thumbnails-top {
  width: 100% !important;
}

.p-message {
  margin: 0px;
  width: 100% !important;
}

iframe {
  display: block; /* iframes are inline by default */
  background: #000;
  border: none; /* Reset default border */
  height: 100%; /* Viewport-relative units */
  width: 100%;
}
</style>
