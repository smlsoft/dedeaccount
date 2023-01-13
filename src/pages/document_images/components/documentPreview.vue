<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Utils from "@/utils/";
const activeIndexList = ref(0);
const props = defineProps({
  showImgData: Object,
  showOveray: Boolean,
});

const emit = defineEmits(["closeDocumentPreview"]);

function closeDocumentPreview() {
  emit("closeDocumentPreview");
}
</script>
<template>
  <div class="flex align-items-center justify-content-end">
    <Button
      icon="pi pi-times"
      class="p-button-rounded p-button-danger p-button-text"
      @click="closeDocumentPreview"
    />
  </div>
  
  <div class="flex justify-content-between m-2">
    <div class="flex">ชื่อรูป : {{ showImgData[activeIndexList].name }}</div>
    <div class="flex">
      วันที่ :{{
        Utils.getDateTimeFormat(showImgData[activeIndexList].uploadedat)
      }}
      โดย {{ showImgData[activeIndexList].uploadedby }}
    </div>
  </div>
  <Galleria
    :value="props.showImgData"
    :circular="true"
    containerStyle="max-width: 100%"
    thumbnailsPosition="top"
    :show-thumbnails="props.showImgData.length > 1"
    v-model:activeIndex="activeIndexList"
    :numVisible="props.showImgData.length > 10 ? 10 : props.showImgData.length"
  >
    <template #item="slotProps">
      <div
        class="relative"
        style="margin: 0px; padding: 0px; width: 100%"
        :style="
          props.showImgData.length === 1 ? 'height: 70vh' : 'height: 65vh'
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
          style="width: 100%; height: 100%; background-color: white; opacity: 0"
        ></div>
      </div>
    </template>
    <template #thumbnail="slotProps">
      <img :src="slotProps.item.imageuri" style="width: 50px; height: 50px" />
    </template>
  </Galleria>
</template>
<style scoped>
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
</style>
