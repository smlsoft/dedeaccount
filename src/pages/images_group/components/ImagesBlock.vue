<template>
  <div class="p-1 cursor-pointer card-container blue-container bg-blue-while hover:shadow-2" :class="borderImage()"
    @click="selectModeImage()" @mouseenter="hoveredItem = props.images_data.imageuri" @mouseleave="hoveredItem = null">
    <div class="p-2 surface-card border-round cardimage">
      <div class="surface-section z-1 relative transition-all transition-duration-300 p-1">
        <div class="relative mb-1 ">
          <img :src="props.images_data.imagereferences[0].imageuri" class="w-full "
            style="object-fit: cover; height: 12rem" :style="props.mode != 4 ? 'cursor: zoom-in' : ''"
            @click="props.mode != 4 ? zoomImg(props.images_data) : ''" />
          <button v-if="props.images_data.imagereferences.length > 1" @click="zoomImg(props.images_data)" type="text"
            v-ripple
            class="fadein p-link w-3rem h-3rem bg-blue-500 hover:bg-blue-600 border-circle shadow-2 inline-flex align-items-center justify-content-center absolute transition-colors transition-duration-300"
            style="top: 0rem; right: 1rem">
            <span class="font-bold text-white">{{ props.images_data.imagereferences.length }}</span>
          </button>
          <div class="absolute" style="bottom: 0.5rem; right: 0.3rem" v-if="checkUseImg(props.images_data.guidfixed)">
            <Chip :label="getUseData(props.images_data.guidfixed)" icon="pi pi-user" class="mr-2 mb-2 " />
          </div>
        </div>
        <div class="flex justify-content-between align-items-center mb-2">
          <span class="text-900 font-medium titletext" v-if="props.images_data.imagereferences.length == 1"> ชื่อ:
            {{ props.images_data.title }}</span>
          <span class="text-900 font-medium titletext" v-if="props.images_data.imagereferences.length > 1"> กลุ่ม:
            {{ props.images_data.title }}</span>
        </div>
        <div class=" mb-0 flex text-600 justify-content-between">
          <div class="font-medium text-sm ">
            <!-- {{ Utils.getDateTimeFormat(props.images_data.imagereferences[0].metafileat) }} -->
          </div>
          <div class="font-medium text-sm">
            {{ (props.images_data.title != "") ? Utils.getDateTimeFormat(
                props.images_data.imagereferences[0].uploadedat) : Utils.getDateTimeFormat(props.images_data.uploadedat)
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <Dialog :dismissableMask="true" :close-on-escape="false" v-model:visible="showImgDialog"
    :header="'รายละเอียด ' + props.images_data.title" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '60vw' }" :modal="true">
    <div class="confirmation-content" id="boxconfirm">
      <div class="flex justify-content-between mb-2">
        <div class="flex">ชื่อรูป : {{ showImgData[activeIndexList].name }}</div>
        <div class="flex">
          วันที่ :{{ Utils.getDateTimeFormat(showImgData[activeIndexList].uploadedat) }}
          โดย {{ showImgData[activeIndexList].uploadedby }}</div>
      </div>
      <div class="flex justify-content-between pt-2 pb-2">
        <div class="flex">
          <Button class="p-button-danger text-white" icon="pi pi-file-excel" label="ยกเลิกกลุ่มเอกสาร"
            @click="confirmUnGroup = true" v-if="showImgData.length > 1 && !checkUseImg(props.images_data.guidfixed)" />
          <Button v-if="props.mode != 4" class="p-button-warning  ml-1" icon="pi pi-print"
            @click="printImg(showImgData)" label="ปริ้นเอกสาร" />
        </div>
        <div class="flex"
          v-if="props.mode == 1 && !checkUseImg(props.images_data.guidfixed) && props.images_data.references.length == 0">
          <Button class="p-button-outlined p-button-danger " icon="pi pi-trash" label="ยกเลิกรูปเอกสาร"
            @click="selectRejectImage(true)" v-if="!showImgData[activeIndexList].isreject" />
          <Button class="p-button-outlined p-button-success mr-1 " icon="pi pi-refresh" label="นำรูปกลับมาใช้"
            @click="selectRejectImage(false)" v-if="showImgData[activeIndexList].isreject" />
          <Button class="p-button-outlined  " icon="pi pi-upload" label="อัพโหลดรูปใหม่" @click="chooseFile()"
            v-if="showImgData[activeIndexList].isreject" />
          <input id="chooseFile" ref="fileInput" type="file" @change="onFileSelect" :multiple="false" accept="image/*"
            style="display: none" />
        </div>
      </div>

      <Galleria :value="showImgData" thumbnailsPosition="top" :circular="true" :show-thumbnails="showImgData.length > 1"
        v-model:activeIndex="activeIndexList">
        <template #header="slotProps">

        </template>
        <template #item="slotProps">
          <div class="grid">
            <div class="col-12">
              <Message severity="warn" v-if="slotProps.item.isreject">รูป {{ slotProps.item.name }} โดนยกเลิก</Message>
            </div>
            <div class="col-12">
              <img :src="slotProps.item.imageuri" style="width: 100%; display: block;" />
            </div>
          </div>

        </template>
        <template #thumbnail="slotProps">
          <img :src="slotProps.item.imageuri" style="width: 50px; height: 50px;" />
        </template>
      </Galleria>

    </div>

  </Dialog>
  <DialogForm :confirmDialog="confirmSaveImg" :textContent="'ต้องการบันทึกรูปภาพใช่หรือไม่'"
    v-on:close="confirmSaveImg = false" v-on:confirm="saveUpdateImg()"></DialogForm>
  <DialogForm :confirmDialog="confirmUnGroup" :textContent="'ต้องการยกเลิกกลุ่มรูปภาพใช่หรือไม่'"
    v-on:close="confirmUnGroup = false" v-on:confirm="documentImageUnGroup()"></DialogForm>
  <DialogForm :confirmDialog="onfirmRejectDialog" v-on:close="onfirmRejectDialog = false"
    :textContent="contentOnfirmRejectDialog"
    v-on:confirm="rejectImage(props.images_data.imagereferences[activeIndexList].documentimageguid, isReject)">
  </DialogForm>


</template>

<script setup>
import { ref, onMounted } from "vue";
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

const props = defineProps({
  images_data: Object,
  images_selete: Array,
  mode: Number,
  allimage_used: Array,
});
const emit = defineEmits([
  "selectImg",
  "useImage",
  "createform",
  "rejectImg",
  "onFileSelect",
  "onReloadData",
  "documentImageUnGroup",
  "rejectImage"

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
    }
    emit("selectImg", dataSelet);

  } else if (props.mode == 3 || props.mode == 4) {
    emit("selectImg", data);
  }


}

function zoomImg(data) {
  console.log(data);
  zoomImgData.value = data;
  showImgData.value = data.imagereferences;
  showImgDialog.value = true;

  showImageDocRef.value = data.documentref;
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
  emit("onFileSelect", event, props.images_data.imagereferences[activeIndexList.value]);
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

function selectRejectImage(reject) {
  if (reject) {
    contentOnfirmRejectDialog.value = "ต้องการยกเลิกรูปภาพ " + props.images_data.imagereferences[activeIndexList.value].name;
    isReject.value = true;
    onfirmRejectDialog.value = true;
  } else {
    contentOnfirmRejectDialog.value = "ต้องการนำรูปภาพ " + props.images_data.imagereferences[activeIndexList.value].name + " กลับมาใช้";
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
      zoomImg(props.images_data);
    } else {
      if (modeMenu == 1 && statusImage == false) {
        if (props.images_data.imagereferences.length > 1) {
          console.log("group");
          zoomImg(props.images_data);
        } else {
          console.log("sigle");
          selectImg(props.images_data.guidfixed, props.images_data.imagereferences[0]);
        }
      } else if (modeMenu == 3 || modeMenu == 4 && statusImage == false) {
        selectImg(props.images_data.guidfixed);
      } else if (statusImage == true) {
        zoomImg(props.images_data);
      }
    }
  }




  // console.log(checkUseImg(props.images_data.documentref));
  // console.log("menu", modeMenu);
  // console.log("status", statusImage);
  // console.log("--------------");

  // if (showImgDialog.value) {
  //   return;
  // }
  // if (!checkUseImg(props.images_data.documentref)) {
  //   if (modeMenu == 1 && statusImage == 0) {
  //     console.log("xxx");
  //     selectImg(props.images_data.guidfixed);
  //   } else if (modeMenu == 2 && statusImage == 0) {
  //     selectImg(props.images_data.documentref);
  //   } else if (modeMenu == 3 && statusImage == 0) {
  //     selectImg(props.images_data.documentref);
  //   }
  // }
  // if (modeMenu == 4 && statusImage == 0) {
  //   selectImg(props.images_data.documentref);
  // }
}

function printImg(data) {
  console.log(data);
  var url = data;
  var w = window.open("", "");
  w.document.write("<html><head>");
  w.document.write("</head><body >");

  data.forEach((element, index) => {
    w.document.write('<img id="print-image-element" src="' + element.imageuri + '" width="100%"/>');
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



  if (referencesImage.length == 0 ) {
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




  // if (statusImage == imageStatus.Normal) {
  //   if (isUseImage) {
  //     userImageStyle = "bg-blue-100";
  //   } else {
  //     if (selectedImage) {
  //       userImageStyle = "bg-blue-500 ";
  //     } else {
  //       userImageStyle = "bg-blue-while hover:shadow-1 ";
  //     }
  //   }
  // } else if (statusImage == imageStatus.Reject) {
  //   userImageStyle = "bg-yellow-200";
  // } else if (statusImage == imageStatus.Saved) {
  //   userImageStyle = "bg-green-100";
  // }
  return userImageStyle;
}



</script>
<style scoped>
.textcenter {
  margin: auto;
  line-height: 1.25rem;

  padding: 0px;
}
</style>
