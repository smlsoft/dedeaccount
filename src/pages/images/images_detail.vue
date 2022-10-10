<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { ref, onMounted } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";

const storeApp = useApp();

const route = useRoute();
const router = useRouter();
const toast = useToast();
const selectedImageIndex1 = ref(0);
const image_list = ref([]);
const detail = ref();

onMounted(() => {
  storeApp.setPageTitle("เอกสารอ้างอิง " + route.params.id);
  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_list");
});

function goList() {
  router.push({ name: "list_images" });
}

function getImageList() {
  MasterdataService.getImageList()
    .then((res) => {
      console.log(res);
      if (res.success) {
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-ground">
        <Button
          label="กลับหน้ารายการ"
          icon="pi pi-arrow-left"
          class="p-button-text p-button-sm p-button-info"
          @click="goList()"
        />
        <div class="surface-card p-3 shadow-2 border-round p-fluid">
          <div class="flex">
            <div class="flex flex-column w-2 justify-content-between">
              <img
                v-for="(image, i) of image_list"
                :key="image.image"
                :src="image.image"
                class="
                  w-full
                  cursor-pointer
                  border-2 border-round border-transparent
                  transition-colors transition-duration-150
                "
                :class="{ 'border-primary': selectedImageIndex1 === i }"
                @click="selectedImageIndex1 = i"
              />
            </div>
            <div class="pl-3 w-10">
              <img
                :src="
                  image_list.length > 0
                    ? image_list[selectedImageIndex1].image
                    : ''
                "
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>
</template>
