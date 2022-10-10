<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import UsersDataService from "@/services/UsersDataService";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import DialogForm from "@/components/form/DialogForm.vue";
const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const detail = ref();
const textContent = ref("ต้องการลบผู้ใช้งาน");
const textContent2 = ref("");
const data_list = ref([]);
const deleteDetailDialog = ref(false);
const sortField = ref("accountcode");
const sortOrder = ref(1);
const totalItemsCount = ref(0);
const limitPage = ref(20);
const filters = ref(null);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);

const roles = ref([
  { name: "USER", code: 0 },
  { name: "ADMIN", code: 1 },
  { name: "OWNER", code: 2 },
]);

onMounted(() => {
  getUserShop();
  storeApp.setPageTitle("ผู้ใช้งาน");
  storeApp.setActivePage("user_list");
});

function newResultRole(data) {
  var result = [];
  result = roles.value.filter((val) => val.code == data);
  return result.length > 0 ? result[0].name : "ไม่พบข้อมูล";
}

function getUserShop() {
  loading.value = true;
  UsersDataService.getUserShop(
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

function sortBy(data) {
  //console.log(data);
  sortField.value = data.sortField;
  sortOrder.value = data.sortOrder;

  loading.value = true;
  UsersDataService.getUserShop(
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

function goCreate() {
  router.push({ name: "user_create" });
}
function goEdit(data) {
  router.push({ name: "user_edit", params: { id: data.id } });
}

function confirmDeleteDetail(data) {
  console.log(data);
  detail.value = data;
  console.log(detail.value.username);
  textContent2.value = detail.value.username;
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
  UsersDataService.getUserShop(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
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
  UsersDataService.deleteUserShop(detail.value.username)
    .then((res) => {
      console.log(res);
      if (res.success) {
        getUserShop(activePage.value);
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
      deleteDetailDialog.value = false;
      console.log(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ไม่สามารถลบได้ : " + err.response.data.message,
        life: 5000,
      });
    });
}

function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
  loading.value = true;

  UsersDataService.getUserShop(
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
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="grid mt-2">
        <div class="col-12">
          <DataTable :value="data_list" dataKey="id" class="p-datatable-sm" :loading="loading" stripedRows
            responsiveLayout="scroll" @sort="sortBy">
            <template #header>
              <div class="flex">
                <div class="flex-none flex align-items-center justify-content-start">
                  <Button label="เพิ่มผู้ใช้งาน" icon="pi pi-plus" class="w-auto" @click="goCreate()"></Button>
                </div>
                <div class="flex-1 flex align-items-center justify-content-center">
                  <Paginator :rows="20" v-model:first="firstPage" :totalRecords="totalItemsCount" @page="onPage($event)"
                    :rowsPerPageOptions="[20, 50, 100]">
                  </Paginator>
                </div>
                <div class="flex-none flex align-items-center justify-content-end">
                  <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters" placeholder="ค้นหา...." @keyup="keyup()" @keydown="keydown()" />
                  </span>
                </div>
              </div>
            </template>
            <template #empty> ไม่พบข้อมูล </template>
            <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
            <Column field="username" header="Username" :sortable="true"></Column>
            <Column field="role" header="สิทธิ์การใช้งาน" :sortable="true">
              <template #body="{ data, field }">
                {{ newResultRole(data[field]) }}
              </template>
            </Column>
            <Column bodyStyle="text-align:center" style="width: 5%">
              <template #body="slotProps">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning p-button-text"
                  @click="goEdit(slotProps.data)" />
              </template>
            </Column>
            <Column bodyStyle="text-align:center" style="width: 5%">
              <template #body="slotProps">
                <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text"
                  @click="confirmDeleteDetail(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
      <DialogForm :confirmDialog="deleteDetailDialog" :textContent="textContent" :textContent2="textContent2"
        v-on:close="deleteDetailDialog = false" v-on:confirm="deleteDetail"></DialogForm>
    </MainContentWarp>
  </AppLayout>
</template>
