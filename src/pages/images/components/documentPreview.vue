<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import { useToast } from "primevue/usetoast";
import ImageDataService from "@/services/ImageDataService";
import { ref, onMounted, onUnmounted, computed } from "vue";
import Utils from "@/utils/";
const userName = localStorage._usercode;
const toast = useToast();

const activeIndexList = ref(0);

const isReject = ref(true);
const onfirmRejectDialog = ref(false);
const contentOnfirmRejectDialog = ref("");
const confirmUnGroup = ref(false);
const loaddingButton = ref(false);

const listStatusImages = ref([
  { name: "ผ่าน", code: 1 },
  { name: "ไม่ผ่าน", code: 2 },
  { name: "ไม่บันทึก", code: 3 },
  { name: "รอตรวจสอบ", code: 0 },
]);
const dialogEditTag = ref(false);
const tag = ref();
const separatorExp = ref(/,| /);
const confirmRejectDialog = ref(false);
const props = defineProps({
  showImgData: Object,
  selectedImag: Object,
  showOveray: Boolean,
  allimage_used: Array,
  jobStatus: Number,
  ischeckApprove: Boolean,
  modeMenu: Number,
});

const emit = defineEmits([
  "closeDocumentPreview",
  "onFileSelect",
  "documentImageUnGroup",
  "upDateStatusImage",
  "updateTagImage",
  "createGL",
]);

function closeDocumentPreview() {
  emit("closeDocumentPreview");
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
}

const toggle = (event) => {
  menu.value.toggle(event);
};
const menu = ref("");
const items = computed({
  get() {
    return [
      {
        label: "Options",
        items: [
          {
            disabled: false,
            label: "ปริ้นเอกสาร",
            icon: "pi pi-print",
            command: () => {
              printImg(props.showImgData);
            },
          },
          {
            disabled:
              (!props.showImgData[activeIndexList.value].isreject &&
                props.selectedImag.references.length == 0) ||
              props.jobStatus != 0,
            label: "อัพโหลดรูปใหม่",
            icon: "pi pi-upload",
            command: () => {
              chooseFile();
            },
          },
          {
            disabled:
              props.selectedImag.imagereferences.length == 1 ||
              props.jobStatus != 0,
            label: "ยกเลิกชุดเอกสาร",
            icon: "pi pi-external-link",
            command: () => {
              confirmUnGroup.value = true;
            },
          },
        ],
      },
    ];
  },
});

function chooseFile() {
  document.getElementById("chooseFile").click();
}

function onFileSelect(event) {
  emit(
    "onFileSelect",
    event,
    props.selectedImag.imagereferences[activeIndexList.value]
  );
}

function documentImageUnGroup() {
  confirmUnGroup.value = false;

  emit("documentImageUnGroup", props.selectedImag.guidfixed);
}

function upDateStatusImage() {
  let data = {
    guidfixed: props.selectedImag.guidfixed,
    status: props.selectedImag.status,
  };
  emit("upDateStatusImage", data);
}

function upDateStatusImageByButton() {
  let data = {
    guidfixed: props.selectedImag.guidfixed,
    status: 4,
  };
  emit("upDateStatusImage", data);
}

function editTag() {
  dialogEditTag.value = true;
  tag.value = props.selectedImag.tags;
}
function updateTagImage() {
  dialogEditTag.value = false;
  emit("updateTagImage", props.selectedImag.guidfixed, tag.value);
}

function createGL(data) {
  loaddingButton.value = true;
  setTimeout(() => {
    emit("createGL", data);
    loaddingButton.value = false;
  }, 500);
}
</script>

<template>
  <input
    id="chooseFile"
    ref="fileInput"
    type="file"
    @change="onFileSelect"
    :multiple="false"
    accept="image/*"
    style="display: none"
  />
  <div v-if="props.showImgData.length > 0">
    <div class="flex align-items-center justify-content-between">
      <div
        class="flex"
        v-if="props.modeMenu == 3 && props.selectedImag.status != 2"
      >
        <Button
          label="ไม่ผ่าน"
          class="p-button-danger p-b mr-1"
          @click="confirmRejectDialog = true"
          :disabled="
            checkUseImg(props.selectedImag.guidfixed) ||
            props.selectedImag.references.length > 0
          "
        />
        <Button
          label="คีย์เอกสาร"
          class=""
          :disabled="
            checkUseImg(props.selectedImag.guidfixed) ||
            props.selectedImag.references.length > 0
          "
          @click="createGL(props.selectedImag)"
          :loading="loaddingButton"
        />
      </div>
      <div class="flex" v-if="props.modeMenu != 3">
        <div
          v-for="listStatusImage of listStatusImages"
          :key="listStatusImage.code"
          class="field-radiobutton m-2 my-3 flex align-items-center justify-content-center"
        >
          <RadioButton
            :disabled="!props.ischeckApprove"
            :id="listStatusImage.code"
            name="listStatusImage"
            :value="listStatusImage.code"
            v-model="props.selectedImag.status"
            @change="upDateStatusImage"
          />
          <label :for="listStatusImage.code">{{ listStatusImage.name }}</label>
        </div>
      </div>

      <div class="flex">
        <Chip
          v-if="checkUseImg(props.selectedImag.guidfixed)"
          :label="getUseData(props.selectedImag.guidfixed)"
          icon="pi pi-user"
          class="mr-2"
        />
        <!-- <Button
          icon="pi pi-print"
          class="p-button-rounded p-button-danger p-button-text"
          @click="printImg(props.showImgData)"
        /> -->
        <Button
          icon="pi pi-list"
          class="p-button-rounded p-button-danger p-button-text"
          type="button"
          @click="toggle"
          aria-haspopup="true"
          aria-controls="overlay_menu"
        />
        <Menu id="overlay_menu" ref="menu" :model="items" :popup="true" />
        <Button
          icon="pi pi-times"
          class="p-button-rounded p-button-danger p-button-text"
          @click="closeDocumentPreview"
        />
      </div>
    </div>

    <Galleria
      :value="props.showImgData"
      :circular="true"
      containerStyle="max-width: 100%"
      thumbnailsPosition="buttom"
      :show-thumbnails="props.showImgData.length > 1"
      v-model:activeIndex="activeIndexList"
      :numVisible="
        props.showImgData.length > 10 ? 10 : props.showImgData.length
      "
    >
      <template #item="slotProps">
        <div
          class="relative"
          style="margin: 0px; padding: 0px; width: 100%"
          :style="
            props.showImgData.length === 1 ? 'height: 70vh' : 'height: 63vh'
          "
        >
          <iframe
            :name="slotProps.item.imageuri"
            :src="
              '/document_images/components/zoom?uri=' + slotProps.item.imageuri
            "
            class="static"
          >
          </iframe>
          <div
            v-if="showOveray"
            class="absolute top-0 left-0"
            style="
              width: 100%;
              height: 100%;
              background-color: white;
              opacity: 0;
            "
          ></div>
        </div>
      </template>
      <template #thumbnail="slotProps">
        <img
          :src="slotProps.item.imageuri"
          style="width: 50px; height: 50px; display: block"
        />
      </template>
    </Galleria>
    <Message
      severity="warn"
      :closable="false"
      v-if="props.showImgData[activeIndexList].isreject"
      >รูปมีปัญหา</Message
    >
    <div class="flex flex-wrap align-items-center m-2">
      <div v-for="data in props.selectedImag.tags">
        <Tag class="mr-1 my-1 bg-primary-500" :value="'#' + data" rounded></Tag>
      </div>
      <Button
        icon="pi pi-pencil"
        class="p-button-rounded p-button-danger p-button-text"
        @click="editTag"
        v-if="props.modeMenu != 3"
      />
    </div>
    <div class="flex justify-content-between m-2">
      <div class="flex">
        ชื่อรูป : {{ props.showImgData[activeIndexList].name }}
      </div>
      <div class="flex">
        วันที่ :{{
          Utils.getDateTimeFormat(props.showImgData[activeIndexList].uploadedat)
        }}
        โดย {{ props.showImgData[activeIndexList].uploadedby }}
      </div>
    </div>
  </div>
  <DialogForm
    :confirmDialog="confirmRejectDialog"
    :textContent="'ต้องการยกเลิกรูปภาพ'"
    :textContent2="props.showImgData[activeIndexList].name"
    v-on:close="confirmRejectDialog = false"
    v-on:confirm="upDateStatusImageByButton()"
  ></DialogForm>
  <DialogForm
    :confirmDialog="confirmUnGroup"
    :textContent="'ต้องการยกเลิกชุดรูปภาพ'"
    v-on:close="confirmUnGroup = false"
    v-on:confirm="documentImageUnGroup()"
  ></DialogForm>
  <Dialog
    v-model:visible="dialogEditTag"
    :style="{ width: '550px' }"
    header="แก้ไขแท็กรูปภาพ"
    :modal="true"
  >
    <div class="grid formgrid p-fluid pt-3">
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
        @click="dialogEditTag = false"
      />
      <Button
        label="บันทึก"
        icon="pi pi-save"
        class="p-button-success"
        @click="updateTagImage"
      />
    </template>
  </Dialog>
</template>
<style>
iframe {
  display: block; /* iframes are inline by default */
  background: #000;
  border: none; /* Reset default border */
  height: 100%; /* Viewport-relative units */
  width: 100%;
}

.p-galleria {
  width: 100% !important;
}

.p-galleria .p-galleria-thumbnail-container {
  background: rgba(0, 0, 0, 0.9);
  padding: 0.25rem 0.25rem;
}

.p-message {
  margin-bottom: 14px;
}
.p-message .p-message-wrapper {
  padding: 0.5rem 1.5rem;
}
</style>
