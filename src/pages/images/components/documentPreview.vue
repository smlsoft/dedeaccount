<script setup>
import DialogForm from "@/components/DialogForm.vue";
import { useToast } from "primevue/usetoast";
import ImageDataService from "@/services/ImageDataService";
import { ref, onMounted, onUnmounted, computed, defineExpose } from "vue";
import Utils from "@/utils/";
import PdfApp from "vue3-pdf-app";
import "vue3-pdf-app/dist/icons/main.css";
const userName = localStorage._usercode;
const toast = useToast();

const activeIndexList = ref(0);

const onfirmRejectDialog = ref(false);
const contentOnfirmRejectDialog = ref("");
const confirmUnGroup = ref(false);
const loaddingButton = ref(false);
const lastGuidFixed = ref("");

const listStatusImages = ref([
  { name: "รอตรวจสอบ", code: 0 },
  { name: "ผ่าน", code: 1 },
  { name: "ไม่ผ่าน", code: 2 },
  { name: "ห้ามบันทึกรายวัน", code: 3 },
]);
const listStatusImagesByDaily = ref([
  { name: "ผ่าน", code: 1 },
  { name: "ไม่ผ่าน", code: 4 },
  { name: "ไม่บันทึก", code: 3 },
]);
const dialogEditTag = ref(false);
const tag = ref();
const separatorExp = ref(/,| /);
const confirmRejectDialog = ref(false);
const openEditImage = ref(false);
const sortImageReferencesModel = ref(false);
const draggedItemIndex = ref(null);
const tempImageReferences = ref([]);
const dialogComment = ref(false);
const comment = ref("");

const props = defineProps({
  showImgData: Object,
  selectedImag: Object,
  showOveray: Boolean,
  allimage_used: Array,
  jobStatus: Number,
  ischeckApprove: Boolean,
  modeMenu: Number,
  resetIndex: Number,
  loading: Boolean,
});

const emit = defineEmits([
  "closeDocumentPreview",
  "onFileSelect",
  "documentImageUnGroup",
  "upDateStatusImage",
  "updateTagImage",
  "createGL",
  "viewGL",
  "updateXorderImageReferences",
  "saveComment",
  "getDocumentImage",
]);

onUnmounted(() => {});
onMounted(() => {});

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

  window.open(data[0].imageuri, "_blank");

  // if (Utils.checkTypePDF(data[0].imageuri)) {
  //   window.open(data[0].imageuri, "_blank");
  // } else {
  //   var url = data;
  //   var w = window.open("", "");
  //   w.document.write("<html><head>");
  //   w.document.write("</head><body >");

  //   data.forEach((element, index) => {
  //     w.document.write(
  //       '<img id="print-image-element" src="' +
  //         element.imageuri +
  //         '" width="100%"/>'
  //     );
  //   });

  //   w.document.write(
  //     '<script>var img = document.getElementById("print-image-element"); img.addEventListener("load",function(){ window.focus(); window.print(); window.document.close(); window.close(); }); <//script>'
  //   );
  //   w.document.write("</body></html>");
  //   w.window.print();
  //   w.window.close();
  // }
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
            label: "แก้ไขรูปภาพ",
            icon: "pi pi-pencil",
            command: () => {
              dialogEditImae();
            },
          },
          {
            disabled: false,
            label: "ดาวน์โหลด",
            icon: "pi pi-download",
            command: () => {
              printImg(props.showImgData);
            },
          },
          // รอ service
          // {
          //   disabled: props.jobStatus != 0,
          //   label: "อัพโหลดรูปใหม่",
          //   icon: "pi pi-upload",
          //   command: () => {
          //     chooseFile();
          //   },
          // },
          {
            disabled:
              props.selectedImag.imagereferences.length == 1 ||
              props.jobStatus == 3,
            label: "เรียงรูปภาพในชุด",
            icon: "pi pi-image",
            command: () => {
              sortImageReferences();
            },
          },
          {
            disabled:
              props.selectedImag.imagereferences.length == 1 ||
              props.jobStatus == 3,
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
    props.selectedImag.imagereferences[activeIndex.value]
  );
}

function documentImageUnGroup() {
  confirmUnGroup.value = false;
  emit("documentImageUnGroup", props.selectedImag.guidfixed);
}

function upDateStatusImage(status) {
  let data = {
    guidfixed: props.selectedImag.guidfixed,
    status: status,
  };
  emit("upDateStatusImage", data);
}

function upDateStatusImageByButton() {
  let data = {
    guidfixed: props.selectedImag.guidfixed,
    status: 4,
  };
  confirmRejectDialog.value = false;

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

function createGL(data , type) {
  /// type 1 = รายวัน , 2 = รายได้ , 3 = ค่าใช้จ่าย
  loaddingButton.value = true;
  setTimeout(() => {
    emit("createGL", data , type);
    loaddingButton.value = false;
  }, 500);
}

const activeIndex = computed({
  get() {
    if (lastGuidFixed.value != props.selectedImag.guidfixed) {
      lastGuidFixed.value = props.selectedImag.guidfixed;
      activeIndexList.value = 0;
    }
    return activeIndexList.value;
  },
});

function viewGL(data) {
  const result = data.references.filter((gl) => gl.module == "GL");
  // console.log(result[0].docno);
  emit("viewGL", result[0].docno);
}

function dialogEditImae() {
  openEditImage.value = true;
}
function closeEditImage() {
  openEditImage.value = false;
}

function handleDragStart(index) {
  draggedItemIndex.value = index;
}

function handleDragEnd() {
  draggedItemIndex.value = null;
}

function handleDrop(index) {
  if (draggedItemIndex.value !== null) {
    const draggedItem = tempImageReferences.value[draggedItemIndex.value];
    tempImageReferences.value.splice(draggedItemIndex.value, 1);
    tempImageReferences.value.splice(index, 0, draggedItem);

    tempImageReferences.value.forEach((element, index) => {
      element.xorder = index;
    });

    draggedItemIndex.value = index;

    // console.log(tempImageReferences.value);
  }
}

function sortImageReferences() {
  props.selectedImag.imagereferences.forEach((element) => {
    tempImageReferences.value.push(element);
  });

  sortImageReferencesModel.value = true;
}

function sortImageReferencesModelClose() {
  tempImageReferences.value = [];
  sortImageReferencesModel.value = false;
}

function sortImageReferencesModelSave() {
  if (
    JSON.stringify(props.selectedImag.imagereferences) ===
    JSON.stringify(tempImageReferences.value)
  ) {
    tempImageReferences.value = [];
  } else {
    emit(
      "updateXorderImageReferences",
      props.selectedImag.guidfixed,
      tempImageReferences.value
    );
  }

  sortImageReferencesModel.value = false;
}

function showComment() {
  dialogComment.value = true;
}

function cancelShowComment() {
  comment.value = "";
  dialogComment.value = false;
}

function saveComment() {
  if (comment.value == "") {
    toast.add({
      severity: "warn",
      summary: "แจ้งเตือน",
      detail: "กรุณากรอกข้อความ",
      life: 3000,
    });
    return;
  }
  emit(
    "saveComment",
    props.showImgData[activeIndex.value].documentimageguid,
    comment.value,
    activeIndex.value
  );

  comment.value = "";
}

function getDocumentImage() {
  emit(
    "getDocumentImage",
    props.showImgData[activeIndex.value].documentimageguid,
    activeIndex.value
  );
}

function heightDocumentPreview() {
  let styleHeight = "";
  if (props.modeMenu != 4) {
    if (props.showImgData.length == 1) {
      styleHeight = "height: 70vh";
    } else {
      styleHeight = "height: 63vh";
    }
  } else if (props.modeMenu == 4) {
    if (props.showImgData.length == 1) {
      styleHeight = "height: 84.5vh";
    } else {
      styleHeight = "height: 80vh";
    }
  }

  return styleHeight;
}

function scrollToBottom() {
  const dialogContent = document.querySelector(".p-dialog-content");
  dialogContent.scrollTop = dialogContent.scrollHeight;
}

defineExpose({
  scrollToBottom,
});
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
      <!--left-->
      <div class="flex" v-if="props.modeMenu == 1 || props.modeMenu == 4"></div>
      <div class="flex" v-if="props.modeMenu == 2 || props.modeMenu == 3">
        <Button
          v-if="props.selectedImag.references.length > 0 && props.modeMenu == 3"
          icon="pi pi-eye"
          label="รายวัน"
          class="p-button-sm p-button-success mr-1"
          @click="viewGL(props.selectedImag)"
          :loading="loaddingButton"
        />
        <Button
          v-if="
            props.selectedImag.references.length == 0 && props.modeMenu == 3
          "
          icon="pi pi-file"
          label="บันทึกรายวัน"
          class="p-button-sm mr-1"
          :disabled="
            checkUseImg(props.selectedImag.guidfixed) ||
            props.selectedImag.references.length > 0 ||
            props.selectedImag.status == 3
          "
          @click="createGL(props.selectedImag, 1)"
          :loading="loaddingButton"
        />
        <Button
          v-if="
            props.selectedImag.references.length == 0 && props.modeMenu == 3
          "
          icon="pi pi-plus-circle"
          label="บันทึกรายได้"
          class="p-button-sm mr-1 p-button-success"
          :disabled="
            checkUseImg(props.selectedImag.guidfixed) ||
            props.selectedImag.references.length > 0 ||
            props.selectedImag.status == 3
          "
          @click="createGL(props.selectedImag, 2)"
          :loading="loaddingButton"
        />
        <Button
          v-if="
            props.selectedImag.references.length == 0 && props.modeMenu == 3
          "
          icon="pi pi-minus-circle"
          label="บันทึกค่าใช้จ่าย"
          class="p-button-sm mr-1 p-button-warning"
          :disabled="
            checkUseImg(props.selectedImag.guidfixed) ||
            props.selectedImag.references.length > 0 ||
            props.selectedImag.status == 3
          "
          @click="createGL(props.selectedImag, 3)"
          :loading="loaddingButton"
        />
        <div v-if="props.modeMenu == 2">
          <Button
            :disabled="
              props.selectedImag.references.length > 0 ||
              props.selectedImag.status == 1 ||
              jobStatus == 3
            "
            label="ผ่าน"
            @click="upDateStatusImage(1)"
            class="p-button-success p-button-sm mr-1"
          />
          <Button
            :disabled="
              props.selectedImag.references.length > 0 ||
              props.selectedImag.status == 2 ||
              jobStatus == 3
            "
            label="ไม่ผ่าน"
            @click="upDateStatusImage(2)"
            class="p-button-danger p-button-sm mr-1"
          />
          <Button
            :disabled="
              props.selectedImag.references.length > 0 ||
              props.selectedImag.status == 3 ||
              jobStatus == 3
            "
            label="ห้ามบันทึกรายวัน"
            @click="upDateStatusImage(3)"
            class="p-button-warning p-button-sm mr-1"
          />
          <Button
            :disabled="
              props.selectedImag.references.length > 0 ||
              props.selectedImag.status == 0 ||
              jobStatus == 3
            "
            label="รอตรวจสอบ"
            @click="upDateStatusImage(0)"
            class="p-button-secondary p-button-sm"
          />
        </div>

        <!-- <div v-if="props.modeMenu == 3">
          <Button
            :disabled="props.selectedImag.references.length > 0"
            label="ไม่ผ่าน"
            @click="upDateStatusImage(4)"
            class="p-button-danger p-button-sm mr-1"
          />
          <Button
            :disabled="props.selectedImag.references.length > 0"
            label="ห้ามบันทึกรายวัน"
            @click="upDateStatusImage(3)"
            class="p-button-warning p-button-sm"
          />
        </div> -->
      </div>

      <!--right-->
      <div class="flex" v-if="props.modeMenu != 4">
        <Button
          type="button"
          label="Comment"
          icon="pi pi-comments"
          class="p-button-sm p-button-text p-button-rounded"
          :badge="
            props.showImgData[activeIndex].comments != null
              ? props.showImgData[activeIndex].comments.length.toString()
              : '0'
          "
          badgeClass="p-badge-danger"
          @click="showComment()"
        />
        <Button
          v-if="checkUseImg(props.selectedImag.guidfixed)"
          :label="getUseData(props.selectedImag.guidfixed)"
          class="p-button-text p-button-rounded mr-2 p-button-sm"
          icon="pi pi-user"
        />
        <!-- <Button
          icon="pi pi-print"
          class="p-button-rounded p-button-danger p-button-text"
          @click="printImg(props.showImgData)"
        /> -->
        <Button
          v-if="props.modeMenu != 4"
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
      <div class="flex" v-if="props.modeMenu == 4"></div>
    </div>

    <Galleria
      :value="props.showImgData"
      v-model:activeIndex="activeIndexList"
      @update:activeIndex="getDocumentImage()"
      :circular="true"
      :showThumbnails="false"
      :showIndicators="props.showImgData.length > 1"
    >
      <template #item="slotProps">
        <div
          class="relative"
          style="margin: 0px; padding: 0px; width: 100%"
          :style="heightDocumentPreview()"
        >
          <div
            v-if="Utils.checkTypeImage(slotProps.item.imageuri)"
            class="h-full"
          >
            <iframe
              :name="slotProps.item.imageuri"
              :src="'/images/components/zoom?uri=' + slotProps.item.imageuri"
              class="static"
            >
            </iframe>
          </div>
          <div
            v-if="Utils.checkTypePDF(slotProps.item.imageuri)"
            class="h-full"
          >
            <PdfApp
              :pdf="slotProps.item.imageuri"
              :config="{
                toolbar: false,
              }"
              class="static"
            ></PdfApp>
          </div>

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
    </Galleria>

    <div class="flex flex-wrap align-items-center m-2">
      <div v-for="data in props.selectedImag.tags" :key="data.guidfixed">
        <Tag class="mr-1 my-1 bg-primary-500" :value="'#' + data" rounded></Tag>
      </div>
      <Button
        icon="pi pi-pencil"
        class="p-button-rounded p-button-danger p-button-text"
        @click="editTag"
        v-if="props.modeMenu != 3 && props.modeMenu != 4"
      />
    </div>
    <div class="flex justify-content-between m-2">
      <div class="flex">
        ชื่อรูป : {{ props.showImgData[activeIndex].name }}
      </div>
      <div class="flex">
        วันที่ :{{
          Utils.getDateTimeFormat(props.showImgData[activeIndex].uploadedat)
        }}
        โดย {{ props.showImgData[activeIndex].uploadedby }}
      </div>
    </div>
  </div>
  <DialogForm
    :confirmDialog="confirmRejectDialog"
    :textContent="'ต้องการยกเลิกรูปภาพ'"
    :textContent2="props.showImgData[activeIndex].name"
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

  <Dialog
    header="Header"
    v-model:visible="openEditImage"
    class="p-dialog-maximized configheader"
    @update:visible="closeEditImage"
  >
    <iframe
      :name="props.showImgData[activeIndex].imageuri"
      :src="
        '/images/components/zoomFabric?uri=' +
        props.showImgData[activeIndex].imageuri
      "
    >
    </iframe>
  </Dialog>

  <Dialog
    v-model:visible="sortImageReferencesModel"
    header="เรียงรูปภาพในชุด"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '70vw' }"
    :modal="true"
    :closable="false"
    contentStyle="padding: 0rem;"
  >
    <div class="flex flex-wrap align-items-center justify-content-center">
      <TransitionGroup name="fade">
        <div
          class="flex"
          v-for="(data, index) in tempImageReferences"
          :key="data.documentimageguid"
          :dragdrop="true"
          @dragstart="handleDragStart(index)"
          @dragend="handleDragEnd()"
          @drop="handleDrop(index)"
          @dragover.prevent
        >
          <div class="relative cursor-pointer text-center m-3">
            <div
              class="static flex align-items-center justify-content-center hover:shadow-3"
            >
              <div v-if="Utils.checkTypeImage(data.imageuri)">
                <img
                  :src="data.imageuri"
                  class="w-full"
                  style="
                    object-fit: cover;
                    margin: 3px;
                    width: 80px;
                    height: 86px;
                  "
                />
              </div>
              <div v-if="Utils.checkTypePDF(data.imageuri)">
                <img
                  src="@/assets/pdf-icon.svg"
                  class="w-full"
                  style="
                    object-fit: cover;
                    margin: 3px;
                    width: 80px;
                    height: 86px;
                  "
                />
              </div>
            </div>
            <div
              class="white-space-nowrap overflow-hidden text-overflow-ellipsis"
            >
              <span class="text-900" style="font-size: 12px">{{
                data.name
              }}</span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
    <template #footer>
      <Button
        label="ยกเลิก"
        icon="pi pi-times"
        class="p-button-text"
        @click="sortImageReferencesModelClose()"
      />
      <Button
        label="บันทึก"
        icon="pi pi-save"
        class="p-button-success"
        @click="sortImageReferencesModelSave()"
      />
    </template>
  </Dialog>

  <Dialog
    @show="scrollToBottom"
    :header="'Comment : ' + props.showImgData[activeIndex].name"
    :modal="true"
    v-model:visible="dialogComment"
    @update:visible="cancelShowComment()"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '60vw' }"
  >
    <div
      class="flex mt-3"
      v-for="commets in props.showImgData[activeIndex].comments"
      :key="commets.commentid"
    >
      <div class="surface-card shadow-3 border-round p-3 flex-auto">
        <div class="mb-3">
          <span class="text-900 font-medium inline-block mr-3">
            {{ commets.commentedby }}
          </span>
          <span class="text-500 text-sm">
            {{ Utils.getDateFormatDMYHM(commets.commentedat) }}
          </span>
        </div>
        <div class="line-height-3 text-700 mb-2">
          {{ commets.comment }}
        </div>
      </div>
    </div>
    <template #footer>
      <Textarea
        v-model="comment"
        :autoResize="true"
        rows="2"
        class="w-full"
        autofocus
      />
      <Button
        label="ยกเลิก"
        icon="pi pi-times"
        class="p-button-text p-button-sm mt-1"
        @click="cancelShowComment()"
      />
      <Button
        label="บันทึก"
        :loading="props.loading"
        icon="pi pi-save"
        class="p-button-success m-0 mt-1 p-button-sm"
        @click="saveComment()"
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

/* .p-galleria {
  width: 100% !important;
} */

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

.configheader .p-dialog-header {
  padding: 10px 15px 10px 15px;
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
