<template>
  <div
    class="relative cursor-pointer text-center m-3"
    :style="
      'width:' +
      props.sizeWidthImageBloc +
      'px;' +
      'height:' +
      props.sizeHeightImageBloc +
      'px'
    "
    :class="borderImage()"
    @click="zoomImg(props.images_data)"
    @mouseenter="hoveredItem = props.images_data.imageuri"
    @mouseleave="hoveredItem = null"
  >
    <div
      class="static flex align-items-center justify-content-center hover:shadow-3"
    >
      <div
        v-if="
          Utils.checkTypeImage(props.images_data.imagereferences[0].imageuri)
        "
      >
        <img
          :src="props.images_data.imagereferences[0].imageuri"
          class="w-full"
          style="object-fit: cover; margin: 3px"
          :style="
            'width:' +
            (props.sizeWidthImageBloc - 10) +
            'px;' +
            'height:' +
            (props.sizeHeightImageBloc - 6) +
            'px'
          "
        />
      </div>
      <div
        v-if="Utils.checkTypePDF(props.images_data.imagereferences[0].imageuri)"
      >
        <img
          src="@/assets/pdf-icon.svg"
          alt="PDF file"
          class="w-full"
          style="object-fit: cover; margin: 3px"
          :style="
            'width:' +
            (props.sizeWidthImageBloc - 10) +
            'px;' +
            'height:' +
            (props.sizeHeightImageBloc - 6) +
            'px'
          "
        />
      </div>
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
      <button
        v-if="props.ischeckApprove && props.modeMenu != 3"
        type="text"
        v-ripple
        class="absolute p-link w-2rem h-2rem border-circle inline-flex align-items-center justify-content-center"
        style="top: 0rem; right: 0rem"
        :class="[
          props.images_data.status == 0 || props.images_data.status == 99
            ? 'surface-300'
            : '',
          props.images_data.status == 1 ? 'bg-green-300' : '',
          props.images_data.status == 2 ? 'bg-red-400' : '',
          props.images_data.status == 3 ? 'bg-yellow-400' : '',
        ]"
      >
        <i
          :class="[
            props.images_data.status == 99 ? 'pi pi-spin pi-spinner' : '',
            props.images_data.status == 0 ? 'pi pi-clock' : '',
            props.images_data.status == 1 ? 'pi pi-check-circle' : '',
            props.images_data.status == 2 ? 'pi pi-times-circle' : '',
            props.images_data.status == 3 ? 'pi pi-question-circle' : '',
          ]"
        ></i>
      </button>
      <button
        v-if="!props.ischeckApprove && props.modeMenu != 3"
        type="text"
        v-ripple
        class="absolute p-link w-2rem h-2rem border-circle inline-flex align-items-center justify-content-center"
        style="top: 0rem; right: 0rem"
        :class="[
          props.images_data.status == 1 ? 'bg-green-300' : '',
          props.images_data.status == 2 ? 'bg-red-400' : '',
          props.images_data.status == 3 ? 'bg-yellow-400' : '',
        ]"
      >
        <i
          :class="[
            props.images_data.status == 1 ? 'pi pi-check-circle' : '',
            props.images_data.status == 2 ? 'pi pi-times-circle' : '',
            props.images_data.status == 3 ? 'pi pi-question-circle' : '',
          ]"
        ></i>
      </button>
      <button
        v-if="props.modeMenu == 3"
        type="text"
        v-ripple
        class="absolute p-link w-2rem h-2rem border-circle inline-flex align-items-center justify-content-center"
        style="top: 0rem; right: 0rem"
        :class="[
          props.images_data.references.length == 0
            ? 'surface-300'
            : 'bg-green-300',
          props.images_data.status == 4 ? 'bg-red-400' : '',
          props.images_data.status == 3 ? 'bg-yellow-400' : '',
        ]"
      >
        <i
          :class="[
            props.images_data.references.length == 0
              ? 'pi pi-clock'
              : 'pi pi-check-circle',
            props.images_data.status == 99 ? 'pi pi-spin pi-spinner' : '',
            props.images_data.status == 3 ? 'pi pi-question-circle' : '',
            props.images_data.status == 4 ? 'pi pi-times-circle' : '',
          ]"
        ></i>
      </button>
      <Checkbox
        v-if="
          isSelectedDocument &&
          props.images_data.references.length === 0 &&
          !checkUseImg(props.images_data.guidfixed)
        "
        style="top: 0rem; right: 0rem"
        class="absolute"
        inputId="binary"
        v-model="props.images_data.ischecked"
        :binary="true"
        :readonly="true"
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
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Utils from "@/utils/";
import $ from "jquery";
import MasterdataService from "@/services/MasterdataService";
import { useToast } from "primevue/usetoast";
import DialogForm from "@/components/DialogForm.vue";

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
  images_data_index: Number,
  images_selete: Array,
  allimage_used: Array,
  isSelectedDocument: Boolean,
  sizeWidthImageBloc: Number,
  sizeHeightImageBloc: Number,
  ischeckApprove: Boolean,
  modeMenu: Number,
});
const emit = defineEmits([
  "selectImg",
  "useImage",
  "onFileSelect",
  "onReloadData",
  "documentImageUnGroup",
  "addToGroupImage",
  "showImg",
]);

onMounted(async () => {
  setTimeout(() => {}, 1000);
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

function selectImg(data, tags, documentimageguid, data_index) {
  let dataSelet = {
    guidfixed: data,
    tags: tags,
    documentimageguid: documentimageguid,
    data_index: data_index,
  };
  emit("selectImg", dataSelet);
}

function zoomImg(data) {
  if (
    props.isSelectedDocument ||
    (props.ischeckApprove && props.images_data.status == 0)
  ) {
    selectModeImage();
  }

  data.imagereferences = data.imagereferences.sort((a, b) => {
    if (a.xorder < b.xorder) {
      return -1;
    }
  });

  zoomImgData.value = data;
  showImgData.value = data;
  showImageDocRef.value = data.documentref;

  //showImgDialog.value = true;

  emit("showImg", showImgData.value);
}

function useImage() {
  emit("useImage", props.images_data.documentref);
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

function addToGroupImage(data) {
  emit("addToGroupImage", data);
}

function selectModeImage() {
  console.log("selectModeImage");
  console.log(props.images_data);

  if (props.ischeckApprove) {
    selectImg(
      props.images_data.guidfixed,
      props.images_data.tags,
      props.images_data.imagereferences[0],
      props.images_data_index
    );
  } else {
    console.log("group");
    selectImg(
      props.images_data.guidfixed,
      props.images_data.tags,
      props.images_data.imagereferences[0],
      props.images_data_index
    );
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
  let statusImage = props.images_data.status;
  let referencesImage = props.images_data.references;
  let isUseImage = checkUseImg(props.images_data.guidfixed);

  if (referencesImage.length == 0) {
    if (statusImage != 2) {
      if (isUseImage) {
        userImageStyle = "bg-blue-300";
      } else {
        userImageStyle = "bg-blue-while hover:shadow-1 ";
      }
    } else if (statusImage == 2) {
      userImageStyle = "bg-red-400";
    }
  } else {
    userImageStyle = "bg-green-100";
  }

  return userImageStyle;
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
