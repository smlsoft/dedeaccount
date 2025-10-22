<template>
  <div class="flex bg-primary-50 p-2">
    <div style="width: 200px; overflow-y: auto" class="flex-none">
      <ImagesFolder
        :isMain="false"
        :data_folder="props.data_folder"
        :selectedFolder="selectedFolder"
        v-on:selectFolder="selectFolder"
      />
    </div>
    <div class="surface-section flex-1 p-2">
      <div class="py-2">
        <i class="pi pi-folder-open mr-2"></i>
        <span class="font-medium text-xl text-primary-700">{{
          selectedFolder.name
        }}</span>
      </div>
      <div class="p-fluid">
        <Chips
          v-model="tags"
          :separator="separatorExp"
          :allowDuplicate="false"
          placeholder="แท็กเอกสาร"
        />
      </div>
      <div class="flex justify-content-between py-2">
        <div class="flex align-items-center justify-content-center">
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
              :disabled="loading == true || data_import.length == 0"
              class="p-button-success"
              icon="pi pi-save"
              label="อัพโหลด"
              @click="uploadClick()"
            />
          </div>
          <div class="flex ml-2">
            <Button
              :disabled="loading == true || data_import.length == 0"
              class="p-button-warning"
              icon="pi pi-trash"
              label="ยกเลิกรูปภาพ"
              @click="clear()"
            />
          </div>
        </div>
        <div class="flex align-items-center justify-content-center">
          <Button
            class="p-button-danger"
            icon="pi pi-times"
            label="ปิด"
            @click="closeDialogUpload()"
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
        <!-- <ProgressBar class="" v-if="loading" :value="onUploadProgress" style="height: 0.9em; font-size: 14px">
        {{ onUploadProgress }}% ({{ loadImg }}/{{ data_import.length }})</ProgressBar> -->

        <div class="flex flex-row flex-wrap" v-if="data_import.length > 0">
          <div class="flex align-items-center justify-content-center">
            <Tag
              icon="pi pi-image"
              severity="info"
              class="mr-2"
              :value="'จำนวน ' + data_import.length + ' รูป'"
              rounded
            >
            </Tag>
          </div>
          <div class="flex align-items-center justify-content-center">
            <Tag
              class="mr-2"
              icon="pi pi-check"
              severity="success"
              :value="'สำเร็จ ' + data_import_success.length + ' รูป'"
              rounded
            ></Tag>
          </div>
          <div class="flex align-items-center justify-content-center">
            <Tag
              icon="pi pi-times"
              severity="danger"
              :value="'ไม่สำเร็จ ' + data_import_false.length + ' รูป'"
              rounded
            >
            </Tag>
          </div>
        </div>
        <div class="p-fileupload-files pt-3" v-if="data_import.length > 0">
          <div class="relative mb-1">
            <div class="flex flex-wrap justify-content-center gap-1">
              <div
                class="border-round m-1"
                v-for="(file, index) of data_import"
                :key="file.name + file.type + file.size"
              >
                <div class="relative shadow-2 card-container">
                  <div class="relative p-3 border-round">
                    <img
                      v-if="isImage(file)"
                      :class="file.cmd != 'success' ? 'opacity-30' : ''"
                      :alt="file.name"
                      :src="file.objectURL"
                      class="mb-0 w-full h-9rem"
                      style="object-fit: cover"
                    />
                    <div class="flex justify-content-center pt-1">
                      <span class="text-900 font-medium titletext">
                        {{ file.name }}
                      </span>
                    </div>
                    <div
                      class="absolute top-0 left-0"
                      v-if="file.cmd == 'success'"
                    >
                      <Button
                        class="p-button-rounded p-button-outlined"
                        :icon="file.cmd == 'success' ? 'pi pi-trash' : ''"
                        :class="file.cmd == 'success' ? 'p-button-warning' : ''"
                        @click="remove(file.cmd, index)"
                      />
                    </div>
                    <div class="absolute top-0 right-0">
                      <Button
                        class="p-button-rounded"
                        :icon="
                          file.cmd == 'wait'
                            ? 'pi pi-times'
                            : file.cmd == 'progress'
                            ? 'pi pi-spin pi-spinner'
                            : file.cmd == 'error'
                            ? 'pi pi-trash'
                            : 'pi pi-check-circle'
                        "
                        :class="
                          file.cmd == 'error'
                            ? 'p-button-danger'
                            : file.cmd == 'wait'
                            ? 'p-button-danger'
                            : file.cmd == 'progress'
                            ? 'p-button-info'
                            : ' p-button-success'
                        "
                        @click="
                          file.cmd == 'error' || file.cmd == 'wait'
                            ? remove(file.cmd, index)
                            : ''
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-fileupload-empty" v-if="data_import.length == 0">
          <p>ลากไฟล์ที่ต้องการอัพโหลดวางที่นี่.</p>
        </div>
      </div>
      <div class="flex justify-content-end pt-5">
        <Button
          class="p-button-success"
          icon="pi pi-save"
          label="บันทึก"
          :disabled="!queSuccess"
          :loading="queDocRefSuccess"
          @click="saveDocumentImage()"
        />
      </div>
      <div class="pt-1">
        <ProgressBar mode="indeterminate" v-if="loadingSaveDocumentImage" />
      </div>
    </div>
  </div>

  <DialogForm
    :confirmDialog="showCloseDialogUpload"
    :textContent="'ต้องการยกเลิกรูปภาพทั้งหมด'"
    v-on:close="showCloseDialogUpload = false"
    v-on:confirm="cancelUploadImage()"
  ></DialogForm>

  <Dialog
    header="ยืนยันการอัพโหลด"
    v-model:visible="openConfirmationDocRef"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '350px' }"
    :modal="true"
    :closable="false"
  >
    <div class="confirmation-content">
      <i class="pi pi pi-check-circle mr-3" style="font-size: 2rem" />
      <span>{{ data_import_success.length }} Image Upload Complete </span>
    </div>
    <template #footer>
      <Button
        label="ยืนยัน"
        icon="pi pi-check"
        @click="emitImagesList()"
        autofocus
      />
    </template>
  </Dialog>
  <Toast position="top-right" />
</template>

<script setup>
/* eslint-disable */
import ImageDataService from "@/services/ImageDataService";
import ImagesFolder from "./ImagesFolder.vue";
import { ref, onMounted } from "vue";
import { DomHandler } from "primevue/utils";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import { imagesUpload } from "@/stores/imagesUpload.js";
import $ from "jquery";
import DialogForm from "@/components/DialogForm.vue";
import Utils from "@/utils/";

const storeApp = useApp();
const storeImg = imagesUpload();
const toast = useToast();
const router = useRouter();
const data_import = ref([]);
const data_import_success = ref([]);
const data_import_false = ref([]);
const isLoad = ref(false);
const del_data = ref({});
const onUploadProgress = ref(0);
const onUploadProgressDocumentImage = ref(0);
const loadImg = ref(0);
const loadImgDocumentImage = ref(0);
const content = ref();
const fileInput = ref();
const loading = ref(false);
const loadingSaveDocumentImage = ref(false);
const fileLimit = ref(100);
const uploadedFileCount = ref(0);
const showCloseDialogUpload = ref(false);
const upLoadQue = ref(0);
const queProcess = ref(false);
const queSuccess = ref(false);
const queDocRefSuccess = ref(false);
const upLoadQueDocRef = ref(0);
const openConfirmationDocRef = ref(false);
const selectedFolder = ref({
  guidfixed: null,
  name: "All",
  status: 0,
});
const tags = ref();
const separatorExp = ref(/,| /);

const emit = defineEmits(["success", "closeDialogUpload"]);

const props = defineProps({
  data_ondrop: Array,
  data_folder: Array,
});
onMounted(() => {
  // console.log(props.data_ondrop.value);
  storeApp.setPageTitle("อัพโหลดรูปภาพเอกสาร");
  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_upload");
});

// function upLoadQue() {
//   console.log("upLoadQue");
//   loading.value = false;
//   storeImg.setDataImport(data_import.value);
//   setTimeout(() => {
//     data_import.value = [];
//   }, 500);
// }

function isImage(file) {
  return /^image\//.test(file.type);
}

function closeDialogUpload() {
  if (upLoadQue.value) {
    showCloseDialogUpload.value = true;
  } else {
    emit("closeDialogUpload");
  }
}

function cancelUploadImage() {
  data_import_success.value = [];
  data_import_false.value = [];
  data_import.value = [];
  queProcess.value = false;
  upLoadQue.value = 0;
  queSuccess.value = false;

  emit("closeDialogUpload");
}

function remove(cmd, index) {
  console.log(cmd);

  if (cmd == "wait") {
    data_import.value.splice(index, 1)[0];
  } else if (cmd == "success") {
    data_import_success.value.splice(index, 1)[0];
    data_import.value.splice(index, 1)[0];
  } else if (cmd == "error") {
    data_import_false.value.splice(index, 1)[0];
    data_import.value.splice(index, 1)[0];
  }

  if (data_import.value.length == 0) {
    loading.value = false;
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
  console.log(
    fileLimit.value < data_import.value.length + uploadedFileCount.value
  );
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
        toast.add({
          severity: "warn",
          summary: "แจ้งเตือน",
          detail: "รูป " + a[i].name + " ซ้ำ",
          life: 6000,
        });
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
  let files = event.dataTransfer
    ? event.dataTransfer.files
    : event.target.files;
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

function uploadClick() {
  data_import.value.forEach((element) => {
    element.cmd = "progress";
  });
  queProcess.value = true;
  queSuccess.value = false;
  myUploader();
}

function myUploader() {
  loading.value = true;
  var interval = 300;
  if (data_import.value.length > 0) {
    var ele = data_import.value[upLoadQue.value];
    var index = upLoadQue.value;

    console.log(ele);
    console.log(index);

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
          // console.log(ele);
          // console.log(newfile);
          ele = newfile;

          ImageDataService.upLoadImages(newfile, "GL")
            .then((res) => {
              console.log(res);
              if (res.success) {
                file.cmd = "success";

                upLoadQue.value++;

                let datex = file.lastModified.toString().slice(0, -3);
                let timex = new Date(datex * 1000);

                data_import_success.value.push({
                  name: ele.name,
                  metafileat: Utils.getFormatDateTime(timex),
                  imageuri: res.data.uri,
                  uploadedby: localStorage._usercode,
                  uploadedat: Utils.getFormatDateTime(new Date()),
                  billcount: 1,
                });

                loadImg.value = index + 1;
                onUploadProgress.value =
                  ((index + 1) / data_import.value.length) * 100;
                onUploadProgress.value = parseFloat(
                  onUploadProgress.value.toFixed(2)
                );
                // setTimeout(() => {
                //   if (onUploadProgress.value == 100) {
                //     onUploadProgress.value = 0;
                //   }
                // }, 2000);
                if (upLoadQue.value < data_import.value.length) {
                  setTimeout(() => {
                    myUploader();
                  }, 1000);
                } else {
                  queSuccess.value = true;
                  queProcess.value = false;
                }
              }
            })
            .catch((err) => {
              console.log(err);
              loading.value = true;
              if (err == "Network Error") {
                setTimeout(() => {
                  console.log(err);
                  myUploader();
                }, 5000);
              } else {
                data_import_false.value.push(data_import.value[index]);
              }
              toast.add({
                severity: "warn",
                summary: "แจ้งเตือน",
                detail: err + " กรุณารอสักครู่",
                life: 6000,
              });
            });
        };
        image.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
    }, interval);
  }
}

function emitImagesList() {
  openConfirmationDocRef.value = false;
  loadingSaveDocumentImage.value = false;
  data_import_success.value = [];
  data_import_false.value = [];
  data_import.value = [];
  queProcess.value = false;
  upLoadQue.value = 0;
  queSuccess.value = false;

  emit("success");
}

function saveDocumentImage() {
  // console.log(data_import.value);
  // console.log(data_import_success.value);

  let data = [];

  data_import_success.value.forEach((element) => {
    element.tags = tags.value == null ? [] : tags.value;
    element.pathfilefolder =
      selectedFolder.value.guidfixed == null
        ? ""
        : selectedFolder.value.guidfixed;
  });

  data_import.value.forEach((master_data) => {
    if (master_data.cmd == "success") {
      let newDaa = data_import_success.value.filter(
        (dataSuccess) => dataSuccess.name == master_data.name
      );
      if (newDaa.length > 0) {
        data.push(newDaa[0]);
      }
    }
  });

  console.log(data);

  loadingSaveDocumentImage.value = true;
  queDocRefSuccess.value = true;

  ImageDataService.postDocumentImageBulk(data)
    .then((res) => {
      console.log(res);
      if (res.success) {
        setTimeout(() => {
          queDocRefSuccess.value = false;
          loadingSaveDocumentImage.value = false;
          openConfirmationDocRef.value = true;
        }, 2000);
      }
    })
    .catch((err) => {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: err,
        life: 6000,
      });
    });
}

function selectFolder(data) {
  let newData = {};
  if (data == null) {
    newData = {
      guidfixed: null,
      name: "All",
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
