<template>
  <div class="p-3 surface-section flex-auto">
    <div class="grid pl-2 pt-2">
      <div class="flex">
        <FileUpload
          ref="fileInput"
          :disabled="loading == true"
          name="Image[]"
          mode="basic"
          @select="selectedFile"
          :multiple="true"
          accept="image/*"
          chooseLabel="เลือกรูป"
          :maxFileSize="10000000"
        >
        </FileUpload>
      </div>
      <div class="flex ml-2">
        <Button
          :disabled="loading == true"
          class="p-button-success"
          icon="pi pi-save"
          label="อัพโหลด"
          v-if="data_import.length > 0"
          @click="myUploader()"
        />
      </div>
      <div class="flex ml-2">
        <Button
          :disabled="loading == true"
          class="p-button-danger"
          icon="pi pi-times"
          label="ยกเลิก"
          v-if="data_import.length > 0"
          @click="clear()"
        />
      </div>
    </div>

    <div
      ref="content"
      class="p-fileupload-content mt-3 p-3 surface-card shadow-2 border-rounded"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <ProgressBar
        class=""
        v-if="loading"
        :value="onUploadProgress"
        style="height: 0.9em; font-size: 14px"
      >
        {{ onUploadProgress }}% ({{ loadImg }}/{{ data_import.length }})</ProgressBar
      >
      <p v-if="data_import.length > 0" style="font-size: 15px" class="p-text-grey">
        จำนวน {{ data_import.length }} รูป
      </p>
      <div class="p-fileupload-files" v-if="data_import.length > 0">
        <div
          class="p-fileupload-row"
          v-for="(file, index) of data_import"
          :key="file.name + file.type + file.size"
        >
          <div>
            <Image
              preview
              v-if="isImage(file)"
              role="presentation"
              :alt="file.name"
              :src="file.objectURL"
              :width="50"
            />
          </div>
          <div class="p-fileupload-filename">{{ file.name }}</div>
          <div>{{ formatSize(file.size) }}</div>
          <div>
            <Button
              :class="
                file.cmd == 'wait'
                  ? 'p-button-danger'
                  : file.cmd == 'progress'
                  ? 'p-button-info'
                  : file.cmd == 'error'
                  ? 'p-button-danger'
                  : 'p-button-success'
              "
              class="p-button-text"
              :icon="
                file.cmd == 'wait'
                  ? 'pi pi-times'
                  : file.cmd == 'progress'
                  ? 'pi pi-spin pi-spinner'
                  : file.cmd == 'error'
                  ? 'pi pi-ban'
                  : 'pi pi-check'
              "
              @click="remove(file.cmd, index)"
            />
          </div>
        </div>
      </div>
      <div class="p-fileupload-empty" v-if="data_import.length == 0">
        <p>ลากไฟล์ที่ต้องการอัพโหลดวางที่นี่.</p>
      </div>
    </div>
  </div>

  <Toast position="top-right" />
</template>

<script setup>
/* eslint-disable */
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { FilterMatchMode, FilterOperator } from "primevue/api";
import { ref, onMounted } from "vue";
import { DomHandler } from "primevue/utils";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import { imagesUpload } from "@/stores/imagesUpload.js";
import $ from "jquery";

const storeApp = useApp();
const storeImg = imagesUpload();
const toast = useToast();
const router = useRouter();
const data_import = ref([]);

const del_data = ref({});
const onUploadProgress = ref(0);
const loadImg = ref(0);
const content = ref();
const fileInput = ref();
const loading = ref(false);
const fileLimit = ref(100);
const uploadedFileCount = ref(0);

const emit = defineEmits(["success"]);

onMounted(() => {
  storeApp.setPageTitle("อัพโหลดรูปภาพเอกสาร");
  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_upload");
});

function upLoadQue() {
  console.log("upLoadQue");
  loading.value = false;
  storeImg.setDataImport(data_import.value);
  setTimeout(() => {
    data_import.value = [];
  }, 500);
}
function isImage(file) {
  return /^image\//.test(file.type);
}

function remove(cmd, index) {
  if (cmd == "wait") {
    data_import.value.splice(index, 1)[0];
  }
}
function formatSize(bytes) {
  if (bytes === 0) {
    return "0 B";
  }
  let k = 1000,
    dm = 3,
    sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
function onDragEnter(event) {
  event.stopPropagation();
  event.preventDefault();
}

function isFileLimitExceeded() {
  console.log(fileLimit.value < data_import.value.length + uploadedFileCount.value);
  return fileLimit.value < data_import.value.length + uploadedFileCount.value;
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
}

function onDragOver(event) {
  DomHandler.addClass(content.value, "p-fileupload-highlight");
  event.stopPropagation();
  event.preventDefault();
}

function clear() {
  data_import.value = [];
}

function onDragLeave() {
  DomHandler.removeClass(content.value, "p-fileupload-highlight");
}
function onDrop(event) {
  DomHandler.removeClass(content.value, "p-fileupload-highlight");
  event.stopPropagation();
  event.preventDefault();

  const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
  const allowDrop = true || (files && files.length === 1);

  if (allowDrop) {
    onFileSelect(event);
  }
}
function onFileSelect(event) {
  console.log(event);
  let files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
  uploadedFileCount.value = files.length;
  if (checkFileLimit()) {
    for (let file of files) {
      if (isImage(file)) {
        file.objectURL = window.URL.createObjectURL(file);
        data_import.value.push(file);
      }
    }

    checkDulicate(data_import.value);
  }

  fileInput.value.files = "";
}

function onImageSelectUpload(datax) {
  var file = datax;
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

      var newfile = createFile(resizedImage, datax);
      console.log(newfile);
    };
    image.src = readerEvent.target.result;
  };
  reader.readAsDataURL(file);
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

function selectedFile(event) {
  console.log(event);
  uploadedFileCount.value = event.files.length;

  if (checkFileLimit()) {
    console.log(checkFileLimit());
    for (let file of event.files) {
      data_import.value.push(file);
    }

    checkDulicate(data_import.value);
  }
  console.log(data_import.value);

  fileInput.value.files = "";
}

async function myUploader(event) {
  loading.value = true;
  var interval = 2500;
  await data_import.value.forEach((ele, index) => {
    ele.cmd = "progress";
    setTimeout(function () {
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
          console.log(ele);
          console.log(newfile);
          ele = newfile;

          MasterdataService.upLoadDocImages(newfile, "GL")
            .then((res) => {
              console.log(res);
              if (res.success) {
                file.cmd = "success";
                loadImg.value = index + 1;
                onUploadProgress.value = ((index + 1) / data_import.value.length) * 100;

                onUploadProgress.value = parseFloat(onUploadProgress.value.toFixed(2));
                setTimeout(() => {
                  if (onUploadProgress.value == 100) {
                    toast.add({
                      severity: "success",
                      summary: "Success",
                      detail: "File Uploaded",
                      life: 10000,
                    });

                    loading.value = false;
                    onUploadProgress.value = 0;
                    data_import.value = [];
                    emit("success");
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
        };
        image.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
    }, index * interval);
  });
}
</script>

<style>
.p-fileupload-content {
  position: relative;
}

.p-fileupload-row {
  display: flex;
  align-items: center;
}

.p-fileupload-row > div {
  flex: 1 1 auto;
  width: 25%;
}

.p-fileupload-row > div:last-child {
  text-align: right;
}

.p-fileupload-content .p-progressbar {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.p-button.p-fileupload-choose {
  position: relative;
  overflow: hidden;
}

.p-button.p-fileupload-choose input[type="file"] {
  display: none;
}

.p-fileupload-choose.p-fileupload-choose-selected input[type="file"] {
  display: none;
}

.p-fileupload-filename {
  word-break: break-all;
}

.p-fluid .p-fileupload .p-button {
  width: auto;
}
</style>
