<template>
  <AppLayout>
    <MainContentWarp>
      <div class="p-2 surface-section flex-auto">
        <div class="grid p-fluid">
          <!--
          <div class="field mb-4 col-6 md:col-3">
            <label for="accountGroup" class="font-medium text-900">กลุ่มบัญชี</label>
            <Dropdown v-model="accountGroup" autofocus :options="data_list" :filter="true"
              :filterFields="['code', 'name1']" filterPlaceholder="ค้นหา" placeholder="เลือก">
              <template #value="slotProps">
                <div v-if="slotProps.value">
                  <div>{{ slotProps.value.code }} ~ {{ slotProps.value.name1 }}</div>
                </div>
                <span v-else>
                  {{ slotProps.placeholder }}
                </span>
              </template>
              <template #option="slotProps">
                <div>{{ slotProps.option.code }} ~ {{ slotProps.option.name1 }}</div>
              </template>
            </Dropdown>
          </div>
          -->
          <Dialog
            v-model:visible="showSearch"
            :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
            :style="{ width: '50vw' }"
            :modal="true"
          >
            <template #header>
              <i class="pi pi-cog" style="font-size: 1.5rem"> ค้นหา</i>
            </template>
            <div class="grid p-fluid formgrid">
              <div class="field col-12 md:col-6">
                <label for="startDate" class="font-medium text-900"
                  >สำหรับชุดบัญชี :</label
                >
                <Dropdown
                  v-model="accountGroup"
                  :options="groups"
                  optionValue="code"
                  optionLabel="name1"
                  placeholder="กรุณาเลือกชุดบัญชี"
                />
              </div>
              <div class="field col-12 md:col-6">
                <label for="closeyear" class="font-medium text-900"> </label>
                <div class="field-checkbox mt-2"></div>
              </div>
              <div class="field col-12 md:col-6">
                <label for="startDate" class="font-medium text-900"
                  >ช่วงระหว่างวันที่ :</label
                >
                <DatePicker
                  dateFormat="d/m/yy"
                  v-model="startDate"
                  :modelValue="startDate"
                  :showIcon="true"
                  :buddhist="buddhistYear"
                  :hideOnDateTimeSelect="true"
                  :hiddenTime="true"
                />
              </div>
              <div class="field col-12 md:col-6">
                <label for="endDate" class="font-medium text-900"
                  >ถึงวันที่ :</label
                >
                <DatePicker
                  dateFormat="d/m/yy"
                  v-model="endDate"
                  :modelValue="endDate"
                  :showIcon="true"
                  :buddhist="buddhistYear"
                  :hideOnDateTimeSelect="true"
                  :hiddenTime="true"
                />
              </div>

              <div class="field-checkbox col-12 md:col-12 p-button-outlined">
                <Button
                  label="จัดทำรายงาน"
                  icon="pi pi-book"
                  iconPos="left"
                  @click="exreport()"
                  :disabled="
                    startDate === null ||
                    endDate === null ||
                    accountGroup.length == 0
                  "
                />
              </div>
            </div>
          </Dialog>
        </div>
        <div class="surface-card p-3 shadow-2 border-round">
          <div class="mb-2 flex align-items-center justify-content-between">
            <span class="text-xl font-medium text-900">
              <i class="pi pi-book" style="font-size: 1.5rem">
                รายงานทางการเงิน / รายงานรหัสผังบัญชี</i
              >
            </span>
            <Button
              label="ค้นหา"
              icon="pi pi-cog"
              @click="showSearch = true"
              class="p-button-rounded mr-2"
            ></Button>
          </div>
          <div class="p-2 surface-section flex-auto">
            <div class="p-2 surface-section flex-auto" v-if="isvisible">
              <div class="card p-2">
                <div class="flex flex-column">
                  <div
                    class="flex align-items-center justify-content-center m-1"
                  >
                    <!-- รายงานรหัสบัญชี {{ nameCheck(accountcode1) }}
                    {{ nameCheck2(accountcode2) }} -->
                  </div>
                </div>
                <div class="flex">
                  <div class="flex">
                    <Button
                      label="ส่งออก Excel"
                      class="p-button-primary"
                      icon="pi pi-file-excel"
                      @click="DownloadExampleExcel()"
                      :disabled="isvisible === false"
                    />
                  </div>
                  <div class="flex ml-2">
                    <Button
                      label="ส่งออก PDF"
                      icon="pi pi-file-pdf"
                      class="p-button-primary"
                      @click="exportdowloadPDF()"
                      :disabled="isvisible === false"
                    />
                  </div>
                </div>
              </div>
              <DataTable
                :value="data_list"
                dataKey="docno"
                class="p-datatable-sm"
                :loading="loading"
                stripedRows
                responsiveLayout="scroll"
                @sort="sortBy"
                scrollHeight="69vh"
                v-model:expandedRows="expandedRows"
              >
                <template #header> </template>
                <template #empty> ไม่พบข้อมูล </template>
                <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
                <Column :expander="true" headerStyle="width: 3rem" />
                <Column field="docno" header="เลขที่เอกสาร"></Column>
                <Column field="docdate" header="วันที่" dataType="date">
                  <template #body="slotProps">
                    {{ Utils.getDateFormatDMY(slotProps.data.docdate) }}
                  </template>
                </Column>
                <Column field="accountyear" header="ปีบัญชี"></Column>
                <Column field="accountperiod" header="งวดบัญชี"></Column>
                <Column field="accountgroup" header="กลุ่มบัญชี"></Column>
                <Column field="accountdescription" header="รายละเอียด"></Column>
                <Column
                  field="amount"
                  header="มูลค่า"
                  class="text-header-right"
                  headerStyle="text-align: right;"
                >
                  <template #body="{ data, field }">
                    {{ Utils.formatCurrency(data[field]) }}
                  </template>
                </Column>

                <!-- <Column bodyStyle="text-align:center" style="width: 5%">
              <template #body="slotProps">
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-text"
                  @click="confirmDeleteDetail(slotProps.data)"
                />
              </template>
                </Column> -->
                <template #expansion="mainProps">
                  <h5
                    class="my-1"
                    v-if="mainProps.data.journaldetail.length == 0"
                  >
                    ไม่พบรายการตัวเลือก
                  </h5>
                  <div
                    class="orders-subtable"
                    v-if="mainProps.data.journaldetail.length > 0"
                  >
                    <DataTable
                      :value="mainProps.data.journaldetail"
                      responsiveLayout="scroll"
                      dataKey="guidfixed"
                    >
                      <Column
                        field="accountcode"
                        header="รหัสบัญชี"
                        style="width: 20%"
                      ></Column>
                      <Column
                        field="accountname"
                        header="ชื่อบัญชี"
                        footerStyle="text-align: right "
                        footer="รวม"
                      ></Column>
                      <Column
                        field="debitamount"
                        header="เดบิต"
                        style="width: 20%"
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
                        style="width: 20%"
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
            </div>
          </div>
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>
</template>

<script setup>
/* eslint-disable */
import ReportService from "@/services/ReportDataService";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { ref, onMounted } from "vue";
import pdfMake from "pdfmake/build/pdfmake";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import DatePicker from "@/components/widget/DatePicker.vue";
import XLSX from "xlsx";
const detail = ref();
const textContent = ref("ต้องการลบข้อมูลรายวัน เลขที่เอกสาร");
const dailynum = ref("");
const head_example = ref([]);
const detail_example = ref([]);
const detail_examplenumbertwo = ref([]);

const deleteDetailDialog = ref(false);
const totalItemsCount = ref(0);
const filters = ref(null);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);
const showSearch = ref(true);
const sortField = ref("docno");
const sortOrder = ref(1);
const searchItem = ref("");
const limitPage = ref(20);
const confirmDeleteDialog = ref(false);
const expandedRows = ref([]);

const storeApp = useApp();
const isvisible = ref(false);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const startDate = ref();
const endDate = ref();
const accountGroup = ref("");
const data_list = ref([]);
const data_list2 = ref([]);
const groups = ref([]);
const ica = ref(false);

pdfMake.fonts = {
  Sarabun: {
    normal:
      "https://fonts.gstatic.com/s/sarabun/v12/DtVjJx26TKEr37c9WBJDnlQN9gk.ttf",
    bold: "https://fonts.gstatic.com/s/sarabun/v12/DtVmJx26TKEr37c9YK5sulwm6gDXvwE.ttf",
    italics:
      "https://fonts.gstatic.com/s/sarabun/v12/DtVhJx26TKEr37c9aBBJmnYI5gnOpg.ttf",
    bolditalics:
      "https://fonts.gstatic.com/s/sarabun/v12/DtVkJx26TKEr37c9aBBxJlks7iLSrwFUlw.ttf",
  },
};

onMounted(async () => {
  await getAccountGroup();
  getAccountChartList();
  getAccountGroupList();
  getDate();
  getGLJournalList();
  storeApp.setPageTitle("รายงานข้อมูลรายวัน");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("daily_report");
});
async function expandAll() {
  expandedRows.value = data_list.value.filter();
  toast.add({ severity: "success", summary: "All Rows Expanded", life: 3000 });
}
async function getAccountGroup() {
  try {
    const res = await MasterdataService.getAccountGroup();
    //console.log(res);
    if (res.success) {
      groups.value.push({
        code: "gruupAll",
        name1: "ทั้งหมด",
      });

      res.data.forEach((element) => {
        groups.value.push({
          code: element.code,
          name1: element.name1,
        });
      });
      setTimeout(() => {
        if (accountGroup.value == "") {
          accountGroup.value = groups.value[0].code;
        }
      }, 100);
      console.log(groups.value);
    }
  } catch (err) {
    console.log(err);
  }
}

function getAccountChartList() {
  loading.value = true;
  MasterdataService.getAccountChartList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      //console.log(res);
      if (res.success) {
        data_list2.value = res.data;
        totalItemsCount.value = res.pagination.total;
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}
//output------
async function exportPDF() {
  var body = [];
  body = await buildFromJson();
  var docDefinition = pageSetup(body);
  pdfMake.createPdf(docDefinition).download();
}
function pageSetup(data) {
  var docDefinition = {
    content: [
      // {
      //   style: "tableExample",
      //   table: {
      //     widths: ["46%", "10%", "22%", "22%"],
      //     body: data,
      //   },
      //   layout: "lightHorizontalLines",
      // },
      {
        style: "tableExample",
        table: {
          body: data,
        },
        layout: "lightHorizontalLines",
      },
    ],
    pageOrientation: "portrait",
    pageMargins: [8, 8, 8, 8],
    defaultStyle: {
      font: "Sarabun",
    },
  };
  return docDefinition;
}
function buildFromJson() {
  var body = [];

  body.push([
    { text: "เลขที่เอกสาร", fillColor: "#81d4fa" },
    { text: "วันที่", fillColor: "#81d4fa" },
    { text: "ปีบัญชี", fillColor: "#81d4fa" },
    { text: "งวดบัญชี", fillColor: "#81d4fa" },
    { text: "กลุ่มบัญชี", fillColor: "#81d4fa" },
    { text: "รายละเอียด", fillColor: "#81d4fa" },
    { text: "มูลค่า", fillColor: "#81d4fa" },
  ]);

  data_list.value.forEach((data) => {
    body.push([
      { text: data.docno },

      { text: Utils.getDateFormatDMY(data.docdate) },
      {
        text: data.accountyear,
      },
      { text: data.accountperiod },
      { text: data.accountgroup },
      { text: data.accountdescription },
      { text: data.amount },
    ]);
    body.push([
      { text: "รหัสบัญชี", fillColor: "#d8eaf2" },
      { text: "ชื่อบัญชี", fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
      { colSpan: 2, text: "เดบิต", fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
      { colSpan: 2, text: "เครดิต", fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
    ]);

    data.journaldetail.forEach((details) => {
      console.log(details);
      body.push([
        { text: details.accountcode },
        { text: details.accountname },
        { text: "" },
        { colSpan: 2, text: Utils.formatCurrency(details.debitamount) },
        { text: "" },
        { colSpan: 2, text: Utils.formatCurrency(details.creditamount) },
        { text: "" },
      ]);
    });

    body.push([
      { text: "", fillColor: "#d8eaf1" },
      { text: "", fillColor: "#d8eaf1" },
      {
        text: "รวม",
        style: ["header", "textdecoration"],
        fillColor: "#d8eaf1",
      },
      {
        colSpan: 2,
        text: Utils.formatCurrency(getSumDebitAmount(data.journaldetail)),
        fillColor: "#d8eaf1",
      },
      { text: "", fillColor: "#d8eaf1" },
      {
        colSpan: 2,
        text: Utils.formatCurrency(getSumCreditAmount(data.journaldetail)),
        fillColor: "#d8eaf1",

        // Utils.formatCurrency(
        //   getSumDebitAmount(data.journaldetail.debitamount)
        // ),
      },
      {},
    ]);

    body.push([
      { text: "เลขที่เอกสาร", fillColor: "#81d4fa" },
      { text: "วันที่", fillColor: "#81d4fa" },
      { text: "ปีบัญชี", fillColor: "#81d4fa" },
      { text: "งวดบัญชี", fillColor: "#81d4fa" },
      { text: "กลุ่มบัญชี", fillColor: "#81d4fa" },
      { text: "รายละเอียด", fillColor: "#81d4fa" },
      { text: "มูลค่า", fillColor: "#81d4fa" },
    ]);
  });

  return body;
}
function DownloadExampleExcel() {
  console.log("DownloadExampleExcel");

  data_list.value.forEach((data) => {
    detail_example.value.push(
      {
        เลขที่เอกสาร: data.docno,

        วันที่: Utils.getDateFormatDMY(data.docdate),
        ปีบัญชี: data.accountyear,
        งวดบัญชี: data.accountperiod,
        กลุ่มบัญชี: data.accountgroup,
        รายละเอียด: data.accountdescription,
        มูลค่า: data.amount,
      },
      {
        เลขที่เอกสาร: "รหัสบัญชี",

        วันที่: "ชื่อบัญชี",
        ปีบัญชี: "",
        งวดบัญชี: "",
        กลุ่มบัญชี: "",
        รายละเอียด: "เดบิต",
        มูลค่า: "เครดิต",
      }
    );

    data.journaldetail.forEach((details) => {
      // console.log(details);
      detail_example.value.push({
        เลขที่เอกสาร: details.accountcode,

        วันที่: details.accountname,
        ปีบัญชี: "",
        งวดบัญชี: "",
        กลุ่มบัญชี: "",
        รายละเอียด: Utils.formatCurrency(details.debitamount),
        มูลค่า: Utils.formatCurrency(details.creditamount),
      });
    });

    detail_example.value.push({
      เลขที่เอกสาร: data.accountname,

      วันที่: "",
      ปีบัญชี: "",
      งวดบัญชี: "",
      กลุ่มบัญชี: "รวม",
      รายละเอียด: Utils.formatCurrency(getSumDebitAmount(data.journaldetail)),
      มูลค่า: Utils.formatCurrency(getSumCreditAmount(data.journaldetail)),
    });
    detail_example.value.push({
      เลขที่เอกสาร: "เลขที่เอกสาร",

      วันที่: "วันที่",
      ปีบัญชี: "ปีบัญชี",
      งวดบัญชี: "งวดบัญชี",
      กลุ่มบัญชี: "กลุ่มบัญชี",
      รายละเอียด: "รายละเอียด",
      มูลค่า: "มูลค่า",
    });
  });

  var config = { raw: true, type: "string" };
  var Example = XLSX.utils.json_to_sheet(
    detail_example.value,
    detail_examplenumbertwo.value,
    head_example.value,
    config
  );

  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, Example, "รายงานข้อมูลผังบัญชี");
  XLSX.writeFile(wb, "รายงานข้อมูลผังบัญชี.xlsx");
}
//output------
function getDate() {
  var date = new Date();
  startDate.value = new Date(date.getFullYear(), date.getMonth(), 1);
  endDate.value = new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getAccountGroupList() {
  MasterdataService.getAccountGroup()
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data.sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
function getGLJournalList() {
  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);

  loading.value = true;
  MasterdataService.getdailyreport(
    accountGroup.value,
    startdate,
    enddate,
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

function exreport() {
  getGLJournalList();
  // expandAll();
  isvisible.value = true;
}

function goDetail(data) {
  router.push({ name: "dailyUpdate", params: { id: data.guidfixed } });
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
  MasterdataService.getAccountGroup(
    accountGroup.value,
    startDate.value,
    endDate.value,
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
        console.log(totalItemsCount.value);
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
  loading.value = true;

  MasterdataService.getdailyreport(
    accountGroup.value,
    startDate.value,
    endDate.value,
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

function sortBy(data) {
  //console.log(data);
  sortField.value = data.sortField;
  sortOrder.value = data.sortOrder;

  loading.value = true;
  MasterdataService.getdailyreport(
    accountGroup.value,
    startDate.value,
    endDate.value,
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
  console.log(data);
  var sum = 0;
  if (data != null && data.length >= 0) {
    data.forEach((element) => {
      sum += element.debitamount;
    });
  }
  return sum;
}

function getSumCreditAmount(data) {
  console.log(data);
  var sum = 0;
  if (data != null && data.length >= 0) {
    data.forEach((element) => {
      sum += element.creditamount;
    });
  }
  return sum;
}
</script>
