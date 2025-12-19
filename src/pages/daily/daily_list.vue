<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import { useDailyList } from "@/stores/dailyList.js";
import Utils from "@/utils/";
import DialogForm from "@/components/DialogForm.vue";
import DatePicker from "@/components/widget/DatePicker.vue";
import dayjs from "dayjs";

const storeApp = useApp();
const storeDailyList = useDailyList();
const router = useRouter();
const toast = useToast();
const detail = ref();
const textContent = ref("");
const dailynum = ref("");
const data_list = ref([]);
const deleteDetailDialog = ref(false);
const totalItemsCount = ref(0);
const loading = ref(true);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);

const tempCheckDate = ref(null);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const confirmDeleteDialog = ref(false);
const confirmDeleteDialogBatchId = ref(false);
const listGlBatchId = ref([]);

onMounted(() => {
  getGLJournalList();
  storeApp.setPageTitle("รายการข้อมูลรายวัน");
  storeApp.setActivePage("daily");
  storeApp.setActiveChild("daily_list");
});


function getGLJournalList() {
  loading.value = true;
  MasterdataService.getGLJournalList(
    storeDailyList.limitPage,
    storeDailyList.activePage,
    storeDailyList.filtersByDocNo,
    storeDailyList.sendFiltersByDocDate,
    storeDailyList.filtersByAccYear,
    storeDailyList.filtersByAccPeriod,
    storeDailyList.filtersByDebtorName,
    storeDailyList.filtersByDescription,
    storeDailyList.filtersByDocformat,
    storeDailyList.filtersByAppname,
    storeDailyList.filtersByJobguidfixed,
    storeDailyList.filtersByAmount,
    storeDailyList.sendFiltersByCreateDate,
    storeDailyList.filtersByCreateBy,
    storeDailyList.sortField,
    storeDailyList.sortOrder
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


function keyup() {
  clearTimeout(typingTimer.value);
  typingTimer.value = setTimeout(doneTyping, doneTypingInterval.value);
}
function keydown() {
  clearTimeout(typingTimer.value);
}
function doneTyping() {
  storeDailyList.resetPagination();
  MasterdataService.getGLJournalList(
    storeDailyList.limitPage,
    storeDailyList.activePage,
    storeDailyList.filtersByDocNo,
    storeDailyList.sendFiltersByDocDate,
    storeDailyList.filtersByAccYear,
    storeDailyList.filtersByAccPeriod,
    storeDailyList.filtersByDebtorName,
    storeDailyList.filtersByDescription,
    storeDailyList.filtersByDocformat,
    storeDailyList.filtersByAppname,
    storeDailyList.filtersByJobguidfixed,
    storeDailyList.filtersByAmount,
    storeDailyList.sendFiltersByCreateDate,
    storeDailyList.filtersByCreateBy,
    storeDailyList.sortField,
    storeDailyList.sortOrder
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

function clearFilter(key) {
  storeDailyList.clearFilter(key);
  doneTyping();
}

function goForm() {
  router.push({ name: "dailyForm" });
}
function goDetail(data) {
  router.push({
    name: "dailyUpdate",
    params: { id: data.guidfixed, mode: "edit" },
  });
}

function confirmDeleteDetail(data) {
  console.log(data);

  if (data.batchid == "") {
    detail.value = data;
    dailynum.value = data.docno;
    textContent.value = "ต้องการลบข้อมูลรายวัน เลขที่เอกสาร";
    confirmDeleteDialog.value = true;
  } else {
    detail.value = data;
    dailynum.value = data.batchid;
    textContent.value = "ต้องการลบข้อมูลรายวันของ Statement";
    confirmDeleteDialogBatchId.value = true;
  }
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

function deleteDetailBatchId() {
  MasterdataService.deleteGLJournalBatchId(detail.value.batchid)
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
        confirmDeleteDialogBatchId.value = false;
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
  storeDailyList.setPage(event.page + 1, event.first);
  storeDailyList.setLimit(event.rows);
  loading.value = true;

  MasterdataService.getGLJournalList(
    storeDailyList.limitPage,
    storeDailyList.activePage,
    storeDailyList.filtersByDocNo,
    storeDailyList.sendFiltersByDocDate,
    storeDailyList.filtersByAccYear,
    storeDailyList.filtersByAccPeriod,
    storeDailyList.filtersByDebtorName,
    storeDailyList.filtersByDescription,
    storeDailyList.filtersByDocformat,
    storeDailyList.filtersByAppname,
    storeDailyList.filtersByAmount,
    storeDailyList.sendFiltersByCreateDate,
    storeDailyList.filtersByCreateBy,
    storeDailyList.sortField,
    storeDailyList.sortOrder
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
  storeDailyList.setSort(data.sortField, data.sortOrder);

  loading.value = true;
  MasterdataService.getGLJournalList(
    storeDailyList.limitPage,
    storeDailyList.activePage,
    storeDailyList.filtersByDocNo,
    storeDailyList.sendFiltersByDocDate,
    storeDailyList.filtersByAccYear,
    storeDailyList.filtersByAccPeriod,
    storeDailyList.filtersByDebtorName,
    storeDailyList.filtersByDescription,
    storeDailyList.filtersByDocformat,
    storeDailyList.filtersByAppname,
    storeDailyList.filtersByJobguidfixed,
    storeDailyList.filtersByAmount,
    storeDailyList.sendFiltersByCreateDate,
    storeDailyList.filtersByCreateBy,
    storeDailyList.sortField,
    storeDailyList.sortOrder
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

// เพิ่มฟังก์ชันสำหรับดึงชื่อลูกหนี้/เจ้าหนี้
function getContactName(data) {
  if (data.debtaccounttype === 0) {
    // ลูกหนี้
    if (data.debtor && data.debtor.names && data.debtor.names.length > 0) {
      const thaiName = data.debtor.names.find(n => n.code === "th");
      return thaiName ? thaiName.name : "ไม่ได้กำหนด";
    }
    return "ไม่ได้กำหนด";
  } else if (data.debtaccounttype === 1) {
    // เจ้าหนี้
    if (data.creditor && data.creditor.names && data.creditor.names.length > 0) {
      const thaiName = data.creditor.names.find(n => n.code === "th");
      return thaiName ? thaiName.name : "ไม่ได้กำหนด";
    }
    return "ไม่ได้กำหนด";
  }
  return "ไม่ได้กำหนด";
}

function filterDocDate(event, mode, key) {
  console.log(event);
  if (event.value == "") {
    return;
  }
  let keyDate = "";
  if (tempCheckDate.value != null) {
    clearTimeout(tempCheckDate.value);
  }
  tempCheckDate.value = setTimeout(() => {
    if (mode == 0) {
      keyDate = Utils.getDateFromYear(event);
    } else if (mode == 1) {
      const dateString = event.value;
      const dateParts = dateString.split("/");
      const isoDate = `${dateParts[2] - 543}-${dateParts[1]}-${dateParts[0]}`;
      keyDate = isoDate; // 2022-12-20
    }
    // console.log(dayjs(keyDate).format("YYYY-MM-DD"));
    if (key == "docdate") {
      storeDailyList.sendFiltersByDocDate = dayjs(keyDate).format("YYYY-MM-DD");
    } else if (key == "createdate") {
      storeDailyList.sendFiltersByCreateDate = dayjs(keyDate).format("YYYY-MM-DD");
    }

    console.log(storeDailyList.sendFiltersByCreateDate);
    doneTyping();
  }, 100);
}

function showfiltersColum() {
  storeDailyList.toggleFilters(true);
}

function closefiltersColum() {
  storeDailyList.closeFilters();
  doneTyping();
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
            responsiveLayout="scroll"
            @sort="sortBy"
            scrollHeight="77vh"
            v-model:expandedRows="storeDailyList.expandedRows"
            :rowHover="true"
            :filterDisplay="storeDailyList.showfilters ? 'row' : ''"
          >
            <template #header>
              <div class="flex justify-content-between">
                <div>
                  <Button
                    label="เพิ่มข้อมูลรายวัน"
                    icon="pi pi-plus"
                    class="w-auto"
                    @click="goForm()"
                  />
                </div>
                <div>
                  <Button
                    :label="!storeDailyList.showfilters ? 'ค้นหา' : 'ปิดการค้นหา'"
                    :icon="!storeDailyList.showfilters ? 'pi pi-filter' : 'pi pi-filter-slash'"
                    class="w-auto"
                    :class="
                      !storeDailyList.showfilters
                        ? 'p-button-outlined p-button-info'
                        : 'p-button-info'
                    "
                    @click="
                      !storeDailyList.showfilters ? showfiltersColum() : closefiltersColum()
                    "
                  />
                </div>
              </div>
            </template>
            <template #empty> ไม่พบข้อมูล </template>
            <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
            <Column :expander="true" headerStyle="width: 3rem" />
            <Column
              field="docno"
              header="เลขที่เอกสาร"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
            >
              <template #filter>
                <div class="flex align-content-center">
                  <InputText
                    v-model="storeDailyList.filtersByDocNo"
                    placeholder="ค้นหา...."
                    @keyup="keyup()"
                    @keydown="keydown()"
                    class="p-inputtext-sm"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('docno')"
                  />
                </div>
              </template>
            </Column>
            <Column
              field="docdate"
              header="วันที่"
              dataType="date"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
            >
              <template #body="slotProps">
                {{ Utils.getDateFormatDMY(slotProps.data.docdate) }}
              </template>
              <template #filter>
                <div class="flex align-content-center">
                  <DatePicker
                    placeholder="ค้นหา...."
                    dateFormat="d/m/yy"
                    v-model="storeDailyList.filtersByDocDate"
                    :modelValue="storeDailyList.filtersByDocDate"
                    :showIcon="true"
                    :buddhist="buddhistYear"
                    :hideOnDateTimeSelect="true"
                    :hiddenTime="true"
                    @date-select="filterDocDate($event, 0, 'docdate')"
                    @blur="filterDocDate($event, 1, 'docdate')"
                    inputStyle="padding: 0.875rem 0.875rem;"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('docdate')"
                  />
                </div>
              </template>
            </Column>
            <!-- เพิ่ม Column ชื่อ -->
            <Column
              header="ชื่อ"
              :sortable="false"
              :showFilterMenu="false"
              :showClearButton="false"
            >
              <template #body="slotProps">
                {{ getContactName(slotProps.data) }}
              </template>
              <template #filter>
                <div class="flex align-content-center">
                  <InputText
                    v-model="storeDailyList.filtersByDebtorName"
                    placeholder="ค้นหา...."
                    @keyup="keyup()"
                    @keydown="keydown()"
                    class="p-inputtext-sm"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('debtorname')"
                  />
                </div>
              </template>
            </Column>
            <Column
              field="accountperiod"
              header="งวดบัญชี"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
            >
              <template #filter>
                <div class="flex align-content-center">
                  <InputText
                    v-model="storeDailyList.filtersByAccPeriod"
                    placeholder="ค้นหา...."
                    @keyup="keyup()"
                    @keydown="keydown()"
                    class="p-inputtext-sm"
                    type="number"
                    :min="0"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('accountperiod')"
                  />
                </div>
              </template>
            </Column>
            <!-- <Column field="accountgroup" header="กลุ่มบัญชี" :sortable="true"></Column> -->
            <Column
              field="accountdescription"
              header="รายละเอียด"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
            >
              <template #filter>
                <div class="flex align-content-center">
                  <InputText
                    v-model="storeDailyList.filtersByDescription"
                    placeholder="ค้นหา...."
                    @keyup="keyup()"
                    @keydown="keydown()"
                    class="p-inputtext-sm"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('description')"
                  />
                </div>
              </template>
            </Column>
            <Column
              field="docformat"
              header="รูปแบบเอกสาร"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
              style="min-width: 150px"
            >
              <template #body="{ data }">
                <span v-if="data.docformat">{{ data.docformat }}</span>
                <span v-else class="text-400">-</span>
              </template>
              <template #filter>
                <div class="flex align-content-center">
                  <InputText
                    v-model="storeDailyList.filtersByDocformat"
                    placeholder="ค้นหา...."
                    @keyup="keyup()"
                    @keydown="keydown()"
                    class="p-inputtext-sm"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('docformat')"
                  />
                </div>
              </template>
            </Column>
            <Column
              field="appname"
              header="แหล่งที่มา"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
              style="min-width: 120px"
            >
              <template #body="{ data }">
                <Tag v-if="data.appname === 'AI'" value="AI" severity="success" icon="pi pi-sparkles" />
                <Tag v-else-if="data.appname" :value="data.appname" severity="info" />
                <span v-else class="text-400">ทำเอง</span>
              </template>
              <template #filter>
                <div class="flex align-content-center">
                  <InputText
                    v-model="storeDailyList.filtersByAppname"
                    placeholder="ค้นหา...."
                    @keyup="keyup()"
                    @keydown="keydown()"
                    class="p-inputtext-sm"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('appname')"
                  />
                </div>
              </template>
            </Column>
            <!-- <Column
              field="jobguidfixed"
              header="Job ID"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
              style="min-width: 200px"
            >
              <template #body="{ data }">
                <span v-if="data.jobguidfixed" class="text-sm font-mono">{{ data.jobguidfixed }}</span>
                <span v-else class="text-400">-</span>
              </template>
              <template #filter>
                <div class="flex align-content-center">
                  <InputText
                    v-model="storeDailyList.filtersByJobguidfixed"
                    placeholder="ค้นหา...."
                    @keyup="keyup()"
                    @keydown="keydown()"
                    class="p-inputtext-sm"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('jobguidfixed')"
                  />
                </div>
              </template>
            </Column> -->
            <Column
              field="amount"
              header="มูลค่า"
              class="text-header-right"
              headerStyle="text-align: right;"
              bodyStyle="text-align: right;"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
            >
              <template #body="{ data, field }">
                {{ Utils.formatCurrency(data[field]) }}
              </template>
              <template #filter>
                <div class="flex align-content-center">
                  <InputText
                    v-model="storeDailyList.filtersByAmount"
                    placeholder="ค้นหา...."
                    @keyup="keyup()"
                    @keydown="keydown()"
                    class="p-inputtext-sm"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('amount')"
                  />
                </div>
              </template>
            </Column>
            <Column
              field="createdat"
              header="วันที่สร้าง"
              dataType="date"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
            >
              <template #body="slotProps">
                {{ Utils.getDateFormatDMY(slotProps.data.createdat) }}
              </template>
              <template #filter>
                <div class="flex align-content-center">
                  <DatePicker
                    placeholder="ค้นหา...."
                    dateFormat="d/m/yy"
                    v-model="storeDailyList.filtersByCreateDate"
                    :modelValue="storeDailyList.filtersByCreateDate"
                    :showIcon="true"
                    :buddhist="buddhistYear"
                    :hideOnDateTimeSelect="true"
                    :hiddenTime="true"
                    @date-select="filterDocDate($event, 0, 'createdate')"
                    @blur="filterDocDate($event, 1, 'createdate')"
                    inputStyle="padding: 0.875rem 0.875rem;"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('createdate')"
                  />
                </div>
              </template>
            </Column>
            <Column
              field="createdby"
              header="ผู้สร้าง"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
            >
              <template #filter>
                <div class="flex align-content-center">
                  <InputText
                    v-model="storeDailyList.filtersByCreateBy"
                    placeholder="ค้นหา...."
                    @keyup="keyup()"
                    @keydown="keydown()"
                    class="p-inputtext-sm"
                  />
                  <Button
                    icon="pi pi-filter-slash"
                    class="p-button-rounded p-button-text p-button-plain"
                    @click="clearFilter('createby')"
                  />
                </div>
              </template>
            </Column>
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
            <template #expansion="mainProps">
              <h5 class="my-1" v-if="mainProps.data.journaldetail.length == 0">
                ไม่พบรายการตัวเลือก
              </h5>
              <div
                class="orders-subtable"
                v-if="mainProps.data.journaldetail.length > 0"
              >
                <h5 class="my-1">เลขที่: {{ mainProps.data.docno }}</h5>
                <DataTable
                  :value="mainProps.data.journaldetail"
                  responsiveLayout="scroll"
                  dataKey="guidfixed"
                >
                  <Column field="accountcode" header="รหัสบัญชี"></Column>
                  <Column
                    field="accountname"
                    header="ชื่อบัญชี"
                    footerStyle="text-align: right !important"
                    footer="รวม"
                  ></Column>
                  <Column
                    field="debitamount"
                    header="เดบิต"
                    footerStyle="text-align: right !important"
                    style="text-align: right !important"
                    headerStyle="text-align:center;width: 10%"
                  >
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
                  <Column
                    field="creditamount"
                    header="เครดิต"
                    footerStyle="text-align: right !important"
                    style="text-align: right !important"
                    headerStyle="text-align:center;width: 10%"
                  >
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
          <Paginator
            :rows="storeDailyList.limitPage"
            v-model:first="storeDailyList.firstPage"
            :totalRecords="totalItemsCount"
            @page="onPage($event)"
            :rowsPerPageOptions="[20, 50, 100]"
          >
          </Paginator>
        </div>
      </div>

      <DialogForm
        :confirmDialog="confirmDeleteDialog"
        :textContent="textContent"
        :textContent2="dailynum"
        v-on:close="onClose"
        v-on:confirm="deleteDetail"
      ></DialogForm>
      <DialogForm
        :confirmDialog="confirmDeleteDialogBatchId"
        :textContent="textContent"
        :textContent2="dailynum"
        v-on:close="confirmDeleteDialogBatchId = false"
        v-on:confirm="deleteDetailBatchId"
      ></DialogForm>
    </MainContentWarp>
  </AppLayout>
</template>

<style>
.text-header-right .p-column-header-content {
  display: inline-flex;
}
</style>
