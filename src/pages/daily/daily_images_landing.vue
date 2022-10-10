<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import { DomHandler } from "primevue/utils";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";

const storeApp = useApp();
const router = useRouter();
const route = useRoute();

onUnmounted(() => {
  console.log("unmounted--------------------------------------------------------");
});

onMounted(() => {
  storeApp.setActivePage("daily");
  storeApp.setActiveChild("daily_images_list");
});
function goForm() {
  router.push({ name: "daily_images_form" });
}
function goList() {
  router.push({ name: "daily_images_list" });
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="flex align-items-center justify-content-center mt-7">
        <div class="flex mr-2">
          <Card
            class="shadow-2 border-round pl-3 pr-3 pb-0 align-items-center justify-content-center cursor-pointer hover:border-green-700 border-2 border-300"
            @click="goList()"
          >
            <template #header>
              <img
                src="@/assets/img/galleryimg.png"
                style="height: 200px; width: 200px"
              />
            </template>
            <template #title>เลือกจากคลังรูป</template>
          </Card>
        </div>
        <div class="flex mr-2">
          <Card
            class="shadow-2 border-round pl-3 pr-3 pb-0 align-items-center justify-content-center cursor-pointer hover:border-green-700 border-2 border-300"
            @click="goForm()"
          >
            <template #header>
              <img src="@/assets/img/file.png" style="height: 200px; width: 200px" />
            </template>
            <template #title>สร้างบันทึกรายวัน</template>
          </Card>
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>
</template>
<style>
.p-card-body {
  padding: 0px !important;
}
</style>
