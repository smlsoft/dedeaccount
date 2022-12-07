<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import moment from "moment";
import Utils from "@/utils/";
import DialogForm from "@/components/form/DialogForm.vue";

const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const detail = ref();
const textContent = ref("ต้องการลบข้อมูลรายวัน เลขที่เอกสาร");
const dailynum = ref("");
const data_list = ref([]);
const deleteDetailDialog = ref(false);
const totalItemsCount = ref(0);
const filters = ref(null);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);

const sortField = ref("docno");
const sortOrder = ref(1);
const searchItem = ref("");
const limitPage = ref(20);
const confirmDeleteDialog = ref(false);
const expandedRows = ref([]);

onMounted(() => {
  getGLJournalList();
  storeApp.setPageTitle("รายการข้อมูลรายวัน");
  storeApp.setActivePage("daily");
  storeApp.setActiveChild("daily_list");
});

function getGLJournalList() {
  loading.value = true;
  MasterdataService.getGLJournalList(
    limitPage.value,
    activePage.value,
    searchItem.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
        totalItemsCount.value = res.pagination.total;
        // console.log(totalItemsCount.value);
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
  router.push({ name: "dailyUpdate", params: { id: data.guidfixed ,mode: "edit"} });
}

function confirmDeleteDetail(data) {
  detail.value = data;
  dailynum.value = data.docno;

  confirmDeleteDialog.value = true;
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
  //MasterdataService.getGLJournalList(activePage.value, filters.value)
  MasterdataService.getGLJournalList(
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
  MasterdataService.deleteGLJournal(detail.value.guidfixed)
    .then((res) => {
      console.log(res);
      if (res.success) {
        getGLJournalList();
        toast.add({
          severity: "success",
          summary: "ทำรายการสำเร็จ",
          detail: "ลบเอกสารรายวันสำเร็จ",
          life: 3000,
        });
        confirmDeleteDialog.value = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}



function getAccountGroup() {
  MasterdataService.getAccountGroup()
    .then((res) => {
      if (res.success) {
        groupAccount_detail.value = res.data;
      }
      console.log(groupAccount_detail.value);
    })
    .catch((err) => {
      console.log(err);
    });
}

function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
  loading.value = true;

  MasterdataService.getGLJournalList(
    limitPage.value,
    activePage.value,
    searchItem.value,
    sortField.value,
    sortOrder.value
  )
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
function onClose() {
  confirmDeleteDialog.value = false;
}
function sortBy(data) {
  //console.log(data);
  sortField.value = data.sortField;
  sortOrder.value = data.sortOrder;

  loading.value = true;
  MasterdataService.getGLJournalList(
    limitPage.value,
    activePage.value,
    searchItem.value,
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

function getSumDebitAmount(data) {
  //console.log(data);
  var sum = 0;
  if (data != null && data.length > 0) {
    data.forEach((element) => {
      sum += element.debitamount;
    });
  }
  return sum;
}

function getSumCreditAmount(data) {
  //console.log(data);
  var sum = 0;
  if (data != null && data.length > 0) {
    data.forEach((element) => {
      sum += element.creditamount;
    });
  }
  return sum;
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="grid">
        <div class="col-12">
          <DataTable :value="data_list" dataKey="docno" class="p-datatable-sm" :loading="loading" stripedRows
            responsiveLayout="scroll" @sort="sortBy" scrollHeight="69vh" v-model:expandedRows="expandedRows">
            <template #header>
              <div class="flex justify-content-between">
                <div>
                  <Button label="เพิ่มข้อมูลรายวัน" icon="pi pi-plus" class="w-auto" @click="goForm()"></Button>
                </div>
                <span class="p-input-icon-left">
                  <i class="pi pi-search" />
                  <InputText v-model="filters" placeholder="ค้นหา...." @keyup="keyup()" @keydown="keydown()" />
                </span>
              </div>
            </template>
            <template #empty> ไม่พบข้อมูล </template>
            <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
            <Column :expander="true" headerStyle="width: 3rem" />
            <Column field="docno" header="เลชที่เอกสาร" :sortable="true"></Column>
            <Column field="docdate" header="วันที่" dataType="date" :sortable="true">
              <template #body="slotProps">
                {{ Utils.getDateFormatDMY(slotProps.data.docdate) }}
              </template>
            </Column>
            <Column field="accountyear" header="ปีบัญชี" :sortable="true"></Column>
            <Column field="accountperiod" header="งวดบัญชี" :sortable="true"></Column>
            <!-- <Column field="accountgroup" header="กลุ่มบัญชี" :sortable="true"></Column> -->
            <Column field="accountdescription" header="รายละเอียด" :sortable="true"></Column>
            <Column field="amount" header="มูลค่า" class="text-header-right" headerStyle="text-align: right;"
              bodyStyle="text-align: right;" :sortable="true">
              <template #body="{ data, field }">
                {{ Utils.formatCurrency(data[field]) }}
              </template>
            </Column>
            <Column field="createdat" header="วันที่สร้าง" dataType="date" :sortable="true">
              <template #body="slotProps">
                {{ Utils.getDateFormatDMY(slotProps.data.createdat) }}
              </template>
            </Column>
             <Column field="createdby" header="ผู้สร้าง" :sortable="true"></Column>
            <Column bodyStyle="text-align:center" style="width: 5%">
              <template #body="slotProps">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning p-button-text"
                  @click="goDetail(slotProps.data)" />
              </template>
            </Column>
            <Column bodyStyle="text-align:center" style="width: 5%">
              <template #body="slotProps">
                <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text"
                  @click="confirmDeleteDetail(slotProps.data)" />
              </template>
            </Column>
            <template #expansion="mainProps">
              <h5 class="my-1" v-if="mainProps.data.journaldetail.length == 0">
                ไม่พบรายการตัวเลือก
              </h5>
              <div class="orders-subtable" v-if="mainProps.data.journaldetail.length > 0">
                <h5 class="my-1">เลขที่: {{ mainProps.data.docno }}</h5>
                <DataTable :value="mainProps.data.journaldetail" responsiveLayout="scroll" dataKey="guidfixed">
                  <Column field="accountcode" header="รหัสบัญชี"></Column>
                  <Column field="accountname" header="ชื่อบัญชี" footerStyle="text-align: right !important"
                    footer="รวม"></Column>
                  <Column field="debitamount" header="เดบิต" footerStyle="text-align: right !important"
                    style="text-align: right !important" headerStyle="text-align:center;width: 10%">
                    <template #footer>
                      {{
                          Utils.formatCurrency(
                            getSumDebitAmount(mainProps.data.journaldetail)
                          )
                      }}
                    </template>
                    <template #body="{ data, field }">
                      {{ Utils.formatCurrency(data[field]) }}
                    </template>
                  </Column>
                  <Column field="creditamount" header="เครดิต" footerStyle="text-align: right !important"
                    style="text-align: right !important" headerStyle="text-align:center;width: 10%">
                    <template #footer>
                      {{
                          Utils.formatCurrency(
                            getSumCreditAmount(mainProps.data.journaldetail)
                          )
                      }}
                    </template>
                    <template #body="{ data, field }">
                      {{ Utils.formatCurrency(data[field]) }}
                    </template>
                  </Column>
                </DataTable>
              </div>
            </template>
          </DataTable>
          <Paginator :rows="20" v-model:first="firstPage" :totalRecords="totalItemsCount" @page="onPage($event)"
            :rowsPerPageOptions="[20, 50, 100]">
          </Paginator>
        </div>
      </div>

      <DialogForm :confirmDialog="confirmDeleteDialog" :textContent="textContent" :textContent2="dailynum"
        v-on:close="onClose" v-on:confirm="deleteDetail"></DialogForm>
    </MainContentWarp>
  </AppLayout>
</template>

<style>
.text-header-right .p-column-header-content {
  display: inline-flex;
}
</style>
