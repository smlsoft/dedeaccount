<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import { useToast } from "primevue/usetoast";
import ImageDataService from "@/services/ImageDataService";
import { ref, onMounted, onUnmounted, computed } from "vue";
import Utils from "@/utils/";

const toast = useToast();

const activeIndexList = ref(0);

const isReject = ref(true);
const onfirmRejectDialog = ref(false);
const contentOnfirmRejectDialog = ref("");

const props = defineProps({
  showImgData: Object,
  selectedImag: Object,
  showOveray: Boolean,
  allimage_used: Array,
});

const emit = defineEmits(["closeDocumentPreview", "rejectSuccess"]);

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

function selectRejectImage(reject) {
  if (reject) {
    contentOnfirmRejectDialog.value =
      "ต้องการยกเลิกรูปภาพ " +
      props.selectedImag.imagereferences[activeIndexList.value].name;
    isReject.value = true;
    onfirmRejectDialog.value = true;
  } else {
    contentOnfirmRejectDialog.value =
      "ต้องการนำรูปภาพ " +
      props.selectedImag.imagereferences[activeIndexList.value].name +
      " กลับมาใช้";
    isReject.value = false;
    onfirmRejectDialog.value = true;
  }
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
        onfirmRejectDialog.value = false;
        emit("rejectSuccess", true);
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
              props.showImgData[activeIndexList.value].isreject &&
              props.selectedImag.references.length == 0,
            label: "ยกเลิกรูปเอกสาร",
            icon: "pi pi-trash",
            command: () => {
              selectRejectImage(true);
            },
          },
          {
            disabled:
              !props.showImgData[activeIndexList.value].isreject &&
              props.selectedImag.references.length == 0,
            label: "นำรูปกลับมาใช้",
            icon: "pi pi-refresh",
            command: () => {
              selectRejectImage(false);
            },
          },
          {
            disabled:
              !props.showImgData[activeIndexList.value].isreject &&
              props.selectedImag.references.length == 0,
            label: "อัพโหลดรูปใหม่",
            icon: "pi pi-upload",
            command: () => {
              chooseFile();
            },
          },
        ],
      },
    ];
  },
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
    <div
      class="flex align-items-center"
      :class="
        checkUseImg(props.selectedImag.guidfixed)
          ? 'justify-content-between'
          : 'justify-content-end'
      "
    >
      <div v-if="checkUseImg(props.selectedImag.guidfixed)">
        <Chip
          :label="getUseData(props.selectedImag.guidfixed)"
          style="font-size: 12px"
          icon="pi pi-user"
          class="bg-blue-100 text-primary-700"
        />
      </div>
      <div class="flxe">
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

    <div class="flex justify-content-between">
      <div class="flex">
        <Button
          class="p-button-danger text-white p-button-sm"
          icon="pi pi-file-excel"
          label="ยกเลิกชุดเอกสาร"
          @click="confirmUnGroup = true"
          v-if="
            props.showImgData.length > 1 &&
            !checkUseImg(props.selectedImag.guidfixed) &&
            props.selectedImag.references.length == 0
          "
        />
      </div>
    </div>
  </div>
  <DialogForm
    :confirmDialog="onfirmRejectDialog"
    v-on:close="onfirmRejectDialog = false"
    :textContent="contentOnfirmRejectDialog"
    v-on:confirm="
      rejectImage(
        props.selectedImag.imagereferences[activeIndexList].documentimageguid,
        isReject
      )
    "
  >
  </DialogForm>
</template>
<style>
iframe {
  display: block; /* iframes are inline by default */
  background: #ffffff;
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
</style>
