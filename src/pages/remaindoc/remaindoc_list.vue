<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";

const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const detail = ref();
const data_list = ref([]);
const deleteDetailDialog = ref(false);
const totalItemsCount = ref(0);
const filters = ref(null);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);
onMounted(() => {
  getGLJournalList();
  storeApp.setPageTitle("รายการเอกสารค้างรับ");
});

function getGLJournalList() {
  loading.value = true;
  MasterdataService.getGLJournalList(activePage.value)
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
        totalItemsCount.value = res.pagination.total;
        console.log(totalItemsCount.value);
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function goForm() {
  router.push({ name: "dailyForm" });
}
function goDetail(data) {
  // router.push({ name: "dailyDetail", params: { id: data.guidfixed } });
  router.push({ name: "remaindocForm" });
}

function confirmDeleteDetail(data) {
  console.log(data);
  detail.value = data;
  console.log(detail);
  deleteDetailDialog.value = true;
}

function keyup() {
  clearTimeout(typingTimer.value);
  typingTimer.value = setTimeout(doneTyping, doneTypingInterval.value);
}
function keydown() {
  clearTimeout(typingTimer.value);
}
function doneTyping() {
  activePage.value = 1;
  firstPage.value = 0;
  MasterdataService.getGLJournalList(activePage.value, filters.value)
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
        totalItemsCount.value = res.pagination.total;
        console.log(totalItemsCount.value);
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function deleteDetail() {
  MasterdataService.deleteGLJournal(detail.value.guidfixed)
    .then((res) => {
      console.log(res);
      if (res.success) {
        getGLJournalList(activePage.value);
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "Deleted",
          life: 3000,
        });
        deleteDetailDialog.value = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function onPage(event) {
  activePage.value = event.page + 1;
  console.log(activePage.value);
  loading.value = true;
  MasterdataService.getGLJournalList(activePage.value)
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
      }
      loading.value = false;
    })
    .catch((err) => {
      console.log(err);
      loading.value = false;
    });
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="grid">
        <div class="col-12">
          <DataTable
            :value="data_list"
            dataKey="docno"
            class="p-datatable-sm"
            :loading="loading"
            stripedRows
            responsiveLayout="scroll"
          >
            <template #header>
              <div class="flex justify-content-between">
                <div></div>
                <span class="p-input-icon-left">
                  <i class="pi pi-search" />
                  <InputText
                    v-model="filters"
                    placeholder="ค้นหา...."
                    @keyup="keyup()"
                    @keydown="keydown()"
                  />
                </span>
              </div>
            </template>
            <template #empty> ไม่พบข้อมูล </template>
            <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
            <Column field="docno" header="เอกสารอ้างอิง"></Column>
            <Column field="docdate" header="วันที่"></Column>
            <Column field="accountperiod" header="จำนวน"></Column>

            <Column bodyStyle="text-align:center" style="width: 5%">
              <template #body="slotProps">
                <Button
                  icon="pi pi-check-square"
                  class="p-button-rounded p-button-success p-button-text"
                  @click="goDetail(slotProps.data)"
                />
              </template>
            </Column>
            <Column bodyStyle="text-align:center" style="width: 5%">
              <template #body="slotProps">
                <Button
                  icon="pi pi-times"
                  class="p-button-rounded p-button-danger p-button-text"
                  @click="confirmDeleteDetail(slotProps.data)"
                />
              </template>
            </Column>
          </DataTable>
          <Paginator
            :rows="3"
            v-model:first="firstPage"
            :totalRecords="totalItemsCount"
            @page="onPage($event)"
          ></Paginator>
        </div>
      </div>
      <Dialog
        v-model:visible="deleteDetailDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
          <span
            >ต้องการลบเอกสารเลขที่ <b>{{ detail.docno }}</b> ใช่หรือไม่?</span
          >
        </div>
        <template #footer>
          <Button
            label="No"
            icon="pi pi-times"
            class="p-button-text"
            @click="deleteDetailDialog = false"
          />
          <Button
            label="Yes"
            icon="pi pi-check"
            class="p-button-text"
            @click="deleteDetail"
          />
        </template>
      </Dialog>
    </MainContentWarp>
  </AppLayout>
</template>
