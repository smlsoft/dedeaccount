<template>
  <AppLayout>
    <MainContentWarp>
      <div class="p-3 surface-section flex-auto">
        <div class="grid pt-2">
          <div class="flex">
            <div class="flex ml-2">
              <Button
                class="p-button-success"
                icon="pi pi-plus"
                label="สร้าง Gallery"
                @click="createDialog = true"
              />
            </div>
          </div>
        </div>
        <div class="p-inputgroup mt-3">
          <InputText placeholder="ค้นหาgallery" v-model="searchItem" />
          <Button icon="pi pi-search" class="p-button-primary" />
        </div>
        <Paginator
          class="justify-content-start"
          :rows="limitPage"
          v-model:first="firstPage"
          :totalRecords="totalItemsCount"
          @page="onPage($event)"
        >
        </Paginator>
        <div class="grid justify-content-start flex-column lg:flex-row mt-3">
          <div
            v-for="(data, index) in data_gallery"
            :key="index"
            class="shadow-2 p-3 m-2 surface-card"
            style="cursor: pointer"
            @click="goList()"
          >
            <div class="flex justify-content-between align-items-center">
              <div class="p-1">
                <div style="height: 80px"></div>
                <div class="text-xl text-900 font-medium mb-2">
                  {{ data.name }}
                </div>
                <div class="text-sm text-text-600">
                  วันที่ {{ data.create_date }}
                </div>
                <div class="text-sm text-text-600">โดย {{ data.creator }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        v-model:visible="createDialog"
        :style="{ width: '450px' }"
        header="สร้าง Gallery ใหม่"
        :modal="true"
      >
        <div class="grid formgrid p-fluid">
          <div class="field mb-4 col-12">
            <label class="font-medium text-900">ชื่อ Gallery</label>
            <InputText type="text" v-model="gallery_form.name" />
          </div>
        </div>
        <template #footer>
          <Button
            label="ยกเลิก"
            icon="pi pi-times"
            class="p-button-text"
            @click="createDialog = false"
          />
          <Button
            label="บันทึก"
            icon="pi pi-check"
            class="p-button-text"
            @click="onSaveCreate"
          />
        </template>
      </Dialog>
      <DialogForm
        :confirmDialog="createDialog"
        :textContent="textContent"
        :textContent2="name"
        v-on:close="onClose"
        v-on:confirm="onSaveCreate"
      ></DialogForm>

      <Toast position="top-right" />
    </MainContentWarp>
  </AppLayout>
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
import DialogForm from "@/components/form/DialogForm.vue";
const textContent = ref("ชื่อ Gallery");
const textContent2 = ref("");
const storeApp = useApp();
const toast = useToast();
const router = useRouter();
const limitPage = ref(20);
const del_data = ref({});
const totalItemsCount = ref(10);
const loadImg = ref(0);
const loading = ref(false);
const firstPage = ref(0);
const searchItem = ref("");
const gallery_form = ref({
  name: "",
  creator: "superadmin",
  create_date: "26/06/2022",
});
const createDialog = ref(false);
const data_gallery = ref([]);

onMounted(() => {
  storeApp.setPageTitle("รูปภาพเอกสาร");
  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_upload");
  data_gallery.value.push({
    name: "เอกสารซื้อ",
    creator: "superadmin",
    create_date: "26/06/2022",
  });
});

function goList() {
  router.push({ name: "list_images" });
}

function onSaveCreate() {
  data_gallery.value.push({
    name: gallery_form.value.name,
    creator: gallery_form.value.creator,
    create_date: gallery_form.value.create_date,
  });

  setTimeout(() => {
    gallery_form.value.name = "";
    createDialog.value = false;
  }, 200);
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
