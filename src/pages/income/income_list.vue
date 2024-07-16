<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import IncomeDataService from "@/services/IncomeDataService";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import DialogForm from "@/components/DialogForm.vue";
import DatePicker from "@/components/widget/DatePicker.vue";
import dayjs from "dayjs";

const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const detail = ref();
const textContent = ref("");
const dailynum = ref("");
const data_list = ref([]);
const totalItemsCount = ref(0);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);
const sortField = ref("docdate");
const sortOrder = ref(-1);
const limitPage = ref(20);
const confirmDeleteDialog = ref(false);
const expandedRows = ref([]);
const showfilters = ref(false);
const tempCheckDate = ref(null);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const filtersByDocNo = ref(null);
const filtersByDocDate = ref(null);
const sendFiltersByDocDate = ref(null);
const filtersByAccYear = ref(null);
const filtersByAccPeriod = ref(null);
const filtersByDescription = ref(null);
const filtersByAmount = ref(null);
const filtersByCreateDate = ref(null);
const sendFiltersByCreateDate = ref(null);
const filtersByCreateBy = ref(null);

onMounted(() => {
  getIncomeDailyList();
  storeApp.setPageTitle("รายการข้อมูลรายได้อื่น ๆ");
  storeApp.setActivePage("daily");
  storeApp.setActiveChild("income_list");
});

function getIncomeDailyList() {
  loading.value = true;
  IncomeDataService.getIncomeDailyList(
    limitPage.value,
    activePage.value,
    filtersByDocNo.value,
    sendFiltersByDocDate.value,
    filtersByAccYear.value,
    filtersByAccPeriod.value,
    filtersByDescription.value,
    filtersByAmount.value,
    sendFiltersByCreateDate.value,
    filtersByCreateBy.value,
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
  IncomeDataService.getIncomeDailyList(
    limitPage.value,
    activePage.value,
    filtersByDocNo.value,
    sendFiltersByDocDate.value,
    filtersByAccYear.value,
    filtersByAccPeriod.value,
    filtersByDescription.value,
    filtersByAmount.value,
    sendFiltersByCreateDate.value,
    filtersByCreateBy.value,
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

function clearFilter(key) {
  if (key == "docno") {
    filtersByDocNo.value = null;
  } else if (key == "docdate") {
    filtersByDocDate.value = null;
    sendFiltersByDocDate.value = null;
  } else if (key == "accountyear") {
    filtersByAccYear.value = null;
  } else if (key == "accountperiod") {
    filtersByAccPeriod.value = null;
  } else if (key == "description") {
    filtersByDescription.value = null;
  } else if (key == "amount") {
    filtersByAmount.value = null;
  } else if (key == "createdate") {
    filtersByCreateDate.value = null;
    sendFiltersByCreateDate.value = null;
  } else if (key == "createby") {
    filtersByCreateBy.value = null;
  }

  doneTyping();
}

function goForm() {
  router.push({ name: "income_form" });
}
function goDetail(data) {
  router.push({
    name: "income_form_edit",
    params: { id: data.guidfixed, mode: "edit" },
  });
}

function confirmDeleteDetail(data) {
  console.log(data);

  detail.value = data;
  dailynum.value = data.docno;
  textContent.value = "ต้องการลบข้อมูลรายได้อื่น ๆ เลขที่เอกสาร";
  confirmDeleteDialog.value = true;
}

function deleteDetail() {
  IncomeDataService.deleteGLJournal(detail.value.guidfixed)
    .then((res) => {
      console.log(res);
      if (res.success) {
        getIncomeDailyList();
        toast.add({
          severity: "success",
          summary: "ทำรายการสำเร็จ",
          detail: "ลบเอกสารรายได้อื่น ๆ สำเร็จ",
          life: 3000,
        });
        confirmDeleteDialog.value = false;
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

  IncomeDataService.getIncomeDailyList(
    limitPage.value,
    activePage.value,
    filtersByDocNo.value,
    sendFiltersByDocDate.value,
    filtersByAccYear.value,
    filtersByAccPeriod.value,
    filtersByDescription.value,
    filtersByAmount.value,
    sendFiltersByCreateDate.value,
    filtersByCreateBy.value,
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
  IncomeDataService.getIncomeDailyList(
    limitPage.value,
    activePage.value,
    filtersByDocNo.value,
    sendFiltersByDocDate.value,
    filtersByAccYear.value,
    filtersByAccPeriod.value,
    filtersByDescription.value,
    filtersByAmount.value,
    sendFiltersByCreateDate.value,
    filtersByCreateBy.value,
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
      sendFiltersByDocDate.value = dayjs(keyDate).format("YYYY-MM-DD");
    } else if (key == "createdate") {
      sendFiltersByCreateDate.value = dayjs(keyDate).format("YYYY-MM-DD");
    }

    console.log(sendFiltersByCreateDate.value);
    doneTyping();
  }, 100);
}

function showfiltersColum() {
  showfilters.value = true;
}

function closefiltersColum() {
  showfilters.value = false;

  filtersByDocNo.value = null;
  filtersByDocDate.value = null;
  sendFiltersByDocDate.value = null;
  filtersByAccYear.value = null;
  filtersByAccPeriod.value = null;
  filtersByDescription.value = null;
  filtersByAmount.value = null;
  filtersByCreateDate.value = null;
  sendFiltersByCreateDate.value = null;
  filtersByCreateBy.value = null;

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
            v-model:expandedRows="expandedRows"
            :rowHover="true"
            :filterDisplay="showfilters ? 'row' : ''"
          >
            <template #header>
              <div class="flex justify-content-between">
                <div>
                  <Button
                    label="เพิ่มข้อมูลรายได้อื่น ๆ"
                    icon="pi pi-plus"
                    class="w-auto p-button-success"
                    @click="goForm()"
                  />
                </div>
                <div>
                  <Button
                    :label="!showfilters ? 'ค้นหา' : 'ปิดการค้นหา'"
                    :icon="!showfilters ? 'pi pi-filter' : 'pi pi-filter-slash'"
                    class="w-auto"
                    :class="
                      !showfilters
                        ? 'p-button-outlined p-button-info'
                        : 'p-button-info'
                    "
                    @click="
                      !showfilters ? showfiltersColum() : closefiltersColum()
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
                    v-model="filtersByDocNo"
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
                    v-model="filtersByDocDate"
                    :modelValue="filtersByDocDate"
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
            <!-- <Column
              field="accountyear"
              header="ปีบัญชี"
              :sortable="true"
              :showFilterMenu="false"
              :showClearButton="false"
            >
              <template #filter>
                <div class="flex align-content-center">
                  <InputText
                    v-model="filtersByAccYear"
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
                    @click="clearFilter('accountyear')"
                  />
                </div>
              </template>
            </Column> -->
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
                    v-model="filtersByAccPeriod"
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
                    v-model="filtersByDescription"
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
                    v-model="filtersByAmount"
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
                    v-model="filtersByCreateDate"
                    :modelValue="filtersByCreateDate"
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
                    v-model="filtersByCreateBy"
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
            :rows="20"
            v-model:first="firstPage"
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
    </MainContentWarp>
  </AppLayout>
</template>

<style>
.text-header-right .p-column-header-content {
  display: inline-flex;
}
</style>
