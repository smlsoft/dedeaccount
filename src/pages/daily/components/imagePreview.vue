<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import { useToast } from "primevue/usetoast";
import ImageDataService from "@/services/ImageDataService";
import { ref, onMounted, onUnmounted, computed } from "vue";
import Utils from "@/utils/";
const userName = localStorage._usercode;
const toast = useToast();

const props = defineProps({
  showImgData: Object,
  showOveray: Boolean,
});

const emit = defineEmits([]);

onMounted(() => {
  setTimeout(() => {
    console.log(props.showImgData);
  }, 1000);
});
</script>

<template>
  <Galleria
    :value="props.showImgData"
    :circular="true"
    containerStyle="max-width: 100%"
    thumbnailsPosition="buttom"
    v-model:activeIndex="activeIndexList"
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
          style="width: 100%; height: 100%; background-color: white; opacity: 0"
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

  <!-- <div class="flex justify-content-between m-2">
    <div class="flex">
      ชื่อรูป : {{ props.showImgData[activeIndexList].name }}
    </div>
    <div class="flex">
      วันที่ :{{
        Utils.getDateTimeFormat(props.showImgData[activeIndexList].uploadedat)
      }}
      โดย {{ props.showImgData[activeIndexList].uploadedby }}
    </div>
  </div> -->
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
