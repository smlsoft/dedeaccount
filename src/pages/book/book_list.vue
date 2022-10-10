<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import DialogForm from "@/components/form/DialogForm.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
const textContent = ref("ต้องการลบสมุดรายวัน รหัสสมุดรายวัน ");
const booklistcode = ref("");
const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const detail = ref();
const data_list = ref([]);
const confirmSaveDialog = ref(false);
const totalItemsCount = ref(0);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);

const filters = ref(null);
const sortField = ref("code");
const sortOrder = ref(1);
const limitPage = ref(20);

onMounted(() => {
  getJournalBookList();
  storeApp.setPageTitle("สมุดรายวัน");
  storeApp.setActivePage("master");
  storeApp.setActiveChild("book_list");
});

function getJournalBookList() {
  loading.value = true;
  MasterdataService.getJournalBookList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data.sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        });
        totalItemsCount.value = res.pagination.total;
        //console.log(totalItemsCount.value);
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function goForm() {
  router.push({ name: "bookCreate" });
}

function goDetail(data) {
  router.push({ name: "bookEdit", params: { id: data.guidfixed } });
}
function onClosedelete() {
  confirmSaveDialog.value = false;
}
function confirmDeleteDetail(data) {
  console.log(data);
  detail.value = data;
  console.log(data.code);
  booklistcode.value = data.code;
  console.log(booklistcode.value);
  confirmSaveDialog.value = true;
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
  MasterdataService.getJournalBookList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data.sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        });
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
  console.log("DELECT " + detail.value.guidfixed);

  MasterdataService.deleteJournalBook(detail.value.guidfixed)
    .then((res) => {
      console.log(res);
      if (res.success) {
        getJournalBookList(activePage.value);
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "ลบสมุดรายวันเรียบร้อยแล้ว",
          life: 3000,
        });
        confirmSaveDialog.value = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
  loading.value = true;

  MasterdataService.getJournalBookList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      //console.log(res);
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

function sortBy(data) {
  //console.log(data);
  sortField.value = data.sortField;
  sortOrder.value = data.sortOrder;

  loading.value = true;
  MasterdataService.getJournalBookList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      //console.log(res);
      if (res.success) {
        data_list.value = res.data;
        totalItemsCount.value = res.pagination.total;
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
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
            dataKey="code"
            class="p-datatable-sm"
            :loading="loading"
            stripedRows
            responsiveLayout="scroll"
            @sort="sortBy"
          >
            <template #header>
              <div class="flex">
                <div
                  class="flex-none flex align-items-center justify-content-start"
                >
                  <Button
                    label="เพิ่มสมุดรายวัน"
                    icon="pi pi-plus"
                    class="w-auto"
                    @click="goForm()"
                  ></Button>
                </div>
                <div
                  class="flex-1 flex align-items-center justify-content-center"
                >
                  <Paginator
                    :rows="20"
                    v-model:first="firstPage"
                    :totalRecords="totalItemsCount"
                    @page="onPage($event)"
                    :rowsPerPageOptions="[20, 50, 100]"
                  >
                  </Paginator>
                </div>
                <div
                  class="flex-none flex align-items-center justify-content-end"
                >
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
              </div>
            </template>
            <template #empty> ไม่พบข้อมูล </template>
            <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
            <Column
              field="code"
              header="รหัสสมุดรายวัน"
              :sortable="true"
            ></Column>
            <Column
              field="name1"
              header="ชื่อสมุดรายวัน"
              :sortable="true"
            ></Column>

            <Column bodyStyle="text-align:center" style="width: 5%">
              <template #body="slotProps">
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-warning p-button-text"
                  @click="goDetail(slotProps.data)"
                />
              </template>
            </Column>
            <Column bodyStyle="text-align:center" style="width: 5%">
              <template #body="slotProps">
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-text"
                  @click="confirmDeleteDetail(slotProps.data)"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
      <DialogForm
        :confirmDialog="confirmSaveDialog"
        :textContent="textContent"
        :textContent2="booklistcode"
        v-on:close="onClosedelete"
        v-on:confirm="deleteDetail"
      ></DialogForm>
      <!-- <Dialog v-model:visible="deleteDetailDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                <div class="confirmation-content">
                    <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                    <span>ต้องการลบสมุดรายวัน <b>{{ detail.accountcode }} ~ {{ detail.accountname }} </b>
                        ใช่หรือไม่?</span>
                </div>
                <template #footer>
                    <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDetailDialog = false" />
                    <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteDetail" />
                </template>
            </Dialog> -->
    </MainContentWarp>
  </AppLayout>
</template>
