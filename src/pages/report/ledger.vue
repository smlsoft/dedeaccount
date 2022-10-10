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

          <div class="field mb-12 col-12 md:col-12">
            <i class="pi pi-book" style="font-size: 2rem"> รายงานทางการเงิน</i>
          </div>
          <div class="field mb-12 col-12 md:col-12">
            <div class="flex flex-wrap card-container blue-container">
              <h1 for="selectedgroup" class="font-medium text-900"></h1>

              <h3 class="field mb-4 col-4 md:col-3">บัญชีแยกประเภท</h3>

              <h4 class="field mb-4 col-4 md:col-2">
                <div class="field-checkbox">
                  <Checkbox
                    v-model="state"
                    :binary="true"
                    @change="switchOn()"
                  />
                  <label>เลือกช่วงผังบัญชี:</label>
                </div>
              </h4>

              <div class="field mb-4 col-6 md:col-3 ml-3">
                <label for="startDate" class="font-medium text-900"
                  >ผังบัญชีที่
                </label>

                <Dropdown
                  v-model="accountcode"
                  field="accountcode"
                  :options="groups"
                  :filter="true"
                  :editable="true"
                  filterPlaceholder="ค้นหา"
                  @change="selectAccount($event)"
                  optionLabel="accountcode"
                  optionValue="accountcode"
                  placeholder="เลือกทั้งหมด"
                />
              </div>
              <div class="field mb-4 col-6 md:col-3">
                <label
                  for="endDate"
                  class="font-medium text-900"
                  v-if="state == true"
                  >ถึงผังบัญชีที่
                </label>
                <Dropdown
                  v-if="state == true"
                  v-model="accountcode2"
                  field="accountcode"
                  :options="groups"
                  :filter="true"
                  :editable="true"
                  filterPlaceholder="ค้นหา"
                  @change="selectAccount2($event)"
                  optionLabel="accountcode"
                  optionValue="accountcode"
                  placeholder="เลือกทั้งหมด"
                />
              </div>
            </div>
          </div>
          <div class="field mb-4 col-6 md:col-3 ml-3">
            <label for="startDate" class="font-medium text-900"
              >จากวันที่</label
            >
            <DatePicker
              dateFormat="d/m/yy"
              v-model="startDate"
              :modelValue1="startDate"
              :showIcon="true"
              :buddhist="buddhistYear"
              :hideOnDateTimeSelect="true"
              :hiddenTime="true"
            />
          </div>
          <div class="field mb-4 col-6 md:col-3">
            <label for="endDate" class="font-medium text-900">ถึงวันที่</label>
            <DatePicker
              dateFormat="d/m/yy"
              v-model="endDate"
              :modelValu1e="endDate"
              :showIcon="true"
              :buddhist="buddhistYear"
              :hideOnDateTimeSelect="true"
              :hiddenTime="true"
            />
          </div>
          <div class="field-checkbox mb-1 col-1 md:col-2 p-button-outlined">
            <Button
              label="จัดทำรายงาน"
              icon="pi pi-book"
              iconPos="left"
              @click="exreport2()"
              :disabled="startDate === null || endDate === null"
            />
            <!-- <Button
              label="จัดทำรายงาน"
              class="p-button-raised p-button-text"
              icon="pi pi-book"
            
            /> -->
          </div>
        </div>
        <div class="col-12">
          <div class="overflow-auto surface-overlay">
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
        </div>
        <!-- <iframe
          v-if="isvisible"
          style="height: 90vh"
          class="w-full"
          frameborder="0"
          scrolling="no"
          id="iframeContainer"
          type="application/pdf"
        /> -->
        <!-- <div>
          <div class="flex">
            <div class="flex">
              <Button
                label="ส่งออก Excel"
                class="p-button-primary"
                icon="pi pi-file-excel"
                @click="DownloadExampleExcel()"
              />
            </div>
            <div class="flex ml-2">
              <Button
                label="ส่งออก PDF"
                icon="pi pi-file-pdf"
                class="p-button-primary"
                @click="exportPDF()"
              />
            </div>
          </div>
        </div> -->
        <div class="grid">
          <div class="col-12" v-if="isvisible">
            <div class="flex justify-content-between">
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

            <DataTable
              :value="data_list"
              dataKey="accountcode"
              class="p-datatable-sm"
              :loading="loading"
              scrollHeight="69vh"
              v-model:expandedRows="expandedRows"
            >
              <DataTable>
                <Column header="วันที่" style="width: 8%"> </Column>
                <Column header="เลขที่เอกสาร" style="width: 10%"> </Column>
                <Column header="รายละเอียด" style="width: 10%"> </Column>
                <Column header="เดบิต" style="width: 10%"> </Column>
                <Column header="เครดิต" style="width: 10%"> </Column>
                <Column header="มูลค่าคงเหลือ" style="width: 10%"> </Column>
              </DataTable>
              <Column field="accountcode" header="รหัสบัญชี" style="width: 10%">
              </Column>
              <Column field="accountname" header="ชื่อบัญชี" style="width: 10%">
              </Column>
              <Column style="width: 10%"> </Column>
              <Column style="width: 10%"> </Column>
              <Column style="width: 10%"> </Column>
              <Column style="width: 10%"> </Column>
              <Column
                :expander="true"
                headerStyle="width: 3rem"
                style="width: 10%"
              />
            </DataTable>
            <DataTable
              :value="data_list"
              dataKey="accountcode"
              class="p-datatable-sm"
              :loading="loading"
              scrollHeight="69vh"
              v-model:expandedRows="expandedRows"
            >
              <Column style="width: 15%"></Column>
              <Column style="width: 10%">
                <template #body>ยกมา</template>
              </Column>
              <Column style="width: 10%"> </Column>
              <Column style="width: 10%"> </Column>
              <Column style="width: 10%"> </Column>
              <Column style="width: 30%"></Column>
              <Column field="balance" style="width: 8%"> </Column>

              <Column> </Column>

              <template #expansion="mainProps">
                <div class="orders-subtable">
                  <DataTable
                    :value="mainProps.data.details"
                    responsiveLayout="scroll"
                    dataKey="accountcode"
                  >
                    <template #empty> รหัสบัญชีนี้ไม่มีข้อมูล </template>
                    <template #loading>
                      กำลังประมวลผล กรุณารอซักครู่..</template
                    >
                    <Column field="docdate" style="width: 15%">
                      <template #body="slotProps">
                        {{ Utils.getDateFormatDMY(slotProps.data.docdate) }}
                      </template>
                    </Column>
                    <Column field="docno" style="width: 18%"> </Column>
                    <Column field="accountdescription" style="width: 17%">
                    </Column>
                    <Column field="debit" style="width: 17%"> </Column>
                    <Column field="credit" style="width: 18%">
                      <template #body="{ data, field }">
                        {{ checkzero(data[field]) }}
                      </template>
                    </Column>
                    <Column field="amount"> </Column>
                  </DataTable>
                </div>
              </template>
            </DataTable>
            <DataTable
              :value="data_list"
              dataKey="accountcode"
              class="p-datatable-sm"
              :loading="loading"
              scrollHeight="69vh"
              v-model:expandedRows="expandedRows"
            >
              <Column style="width: 15%"></Column>
              <Column style="width: 10%">
                <template #body>ยกมา</template>
              </Column>
              <Column style="width: 10%"> </Column>
              <Column style="width: 10%"> </Column>
              <Column style="width: 10%"> </Column>
              <Column style="width: 30%"></Column>
              <Column field="balance" style="width: 5%"> </Column>

              <Column> </Column
            ></DataTable>
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
import TextAutoComplete from "@/components/widget/TextAutoComplete.vue";
import XLSX from "xlsx";
const detail = ref();
const textContent = ref("ต้องการลบข้อมูลรายวัน เลขที่เอกสาร");
const dailynum = ref("");
const head_example = ref([]);
const detail_example = ref([]);
const detail_examplenumbertwo = ref([]);
const textChart = ref("");

const deleteDetailDialog = ref(false);
const totalItemsCount = ref(0);
const filters = ref(null);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);
const accDescript = ref("");
const sortField = ref("docno");
const sortOrder = ref(1);
const searchItem = ref("");
const limitPage = ref(1000);
const confirmDeleteDialog = ref(false);
const expandedRows = ref([]);
const filteredCountries = ref();
const storeApp = useApp();
const isvisible = ref(false);
const isvisible2 = ref(false);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const startDate = ref();
const endDate = ref();
const accountGroup = ref("");
const accountcode = ref([]);
const accountcode1 = ref([]);
const accountcode2 = ref([]);
const dataaccountcode = ref([]);
const state = ref(false);
const data_list = ref([]);
const data_list2 = ref([]);
const docno = ref();
const accountmaintypeList = ref([{ name: "0", code: 1 }]);
3;
const props = defineProps({
  daily_form: Object,
  daily_form_valid: Object,
  isUpdate: Boolean,
  accountChart_detail: Array,
  accountBook_detail: Array,
  groupAccount_detail: Array,
  id: String,
});
const groups = ref([
  // { accountcode: "11000", accountname: "สินทรัพย์" },
  // { accountcode: "11001", accountname: "เงินสด" },
  // { accountcode: "11002", accountname: "หนี้สิน" },
]);
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
  await getAccountChart();

  getDate();
  switchOn();
  //   newResultdocno();
  console.log(data_list.value);
  // getAccountChartList();
  //   getAccountledger();
  getGLJournalList();
  checkzero();
  storeApp.setPageTitle("บัญชีแยกประเภท");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("ledger");
});
async function expandAll() {
  expandedRows.value = data_list.value.filter();
  toast.add({ severity: "success", summary: "All Rows Expanded", life: 3000 });
}

async function getAccountChart() {
  try {
    const res = await MasterdataService.getAccountChartList(limitPage.value);
    console.log(res);
    if (res.success) {
      groups.value = res.data;
    }
  } catch (err) {
    console.log(err);
  }
}
function searchCountry(event) {
  setTimeout(() => {
    if (!event.query.trim().length) {
      filteredCountries.value = groups.value;
    } else {
      filteredCountries.value = groups.value.filter((groups) => {
        if (
          groups.accountcode.toLowerCase().includes(event.query.toLowerCase())
        ) {
          // console.log(groups.accountcode);
          return groups.accountcode
            .toLowerCase()
            .includes(event.query.toLowerCase());
        }
      });
    }
  }, 250);
}

function switchOn() {
  if (state.value == true) {
    dataaccountcode.value = accountcode1.value + ":" + accountcode2.value;

    textChart.value = "เลือกผังบัญชีเดียว";
  } else if (state.value == false) {
    state.value == false;
    dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;
    textChart.value = "จากผังบัญชีที่";
  }
}

function selectAccount(event) {
  state.value == false;
  accountcode1.value = event.value;
  console.log(state.value);
  console.log(event.value);
  console.log(event.value);
  accountcode1.value = event.value;
  dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;
  // else if ((state.value = true)) {
  //   dataaccountcode.value = event.value + ":" + event.value;
  // }

  console.log(dataaccountcode.value);
}
function selectAccount2(event) {
  if ((state.value = false)) {
    accountcode2.value = event.value;

    dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;
  } else if ((state.value = true)) {
    state.value = true;
    dataaccountcode.value = accountcode1.value + ":" + accountcode2.value;
  }
  state.value = true;
  // accountcode2.value = event.value;
  // dataaccountcode.value = accountcode1.value + ":" + accountcode2.value;
}
function exreport2() {
  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);
  // for (let i = 0; i < dataaccountcode.value.length; i++) {
  //   const element = dataaccountcode.value[i];
  //   console.log(dataaccountcode.value[i]);

  //   // accountcode.value.accountcode = [
  //   //   dataaccountcode.value[i] + ":" + dataaccountcode.value[i],
  //   // ];
  // }
  // dataaccountcode.value =
  //   data_list.value.accountcode + ":" + data_list.value.accountcode;

  // data_list.value.forEach((data) => {
  //   console.log(data_list.value.accountcode.length);
  //   if (data_list.value.accountcode.length > 5) {
  //     console.log(data_list.value.accountcode.length);
  //     dataaccountcode.value =
  //       "," + data_list.value.accountcode + ":" + data_list.value.accountcode;
  //   }
  // });
  // console.log(data_list.value.accountcode + ":" + data_list.value.accountcode);

  loading.value = true;
  MasterdataService.getAccountledger(startdate, enddate, dataaccountcode.value)
    .then((res) => {
      if (res.success) {
        data_list.value = res.data;
        exportPDF();
        // console.log(totalItemsCount.value);
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
  //   newResultCategory();
  //   getGLJournalList();
  // expandAll();
}

// const searchCountry = (event) => {
//   setTimeout(() => {
//     if (!event.query.trim().length) {
//       filteredCountries.value = [...data_list.value];
//     } else {
//       filteredCountries.value = data_list.value.filter((account) => {
//         return data_list.name
//           .toLowerCase()
//           .startsWith(event.query.toLowerCase());
//       });
//     }
//   }, 250);
// };
async function exportPDF() {
  isvisible.value = true;
  var body = [];
  var enddate = "";
  body = await buildFromJson();

  enddate = Utils.getYearBuddhist(endDate.value);

  var docDefinition = pageSetup(body, enddate);

  const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  pdfDocGenerator.getDataUrl((dataUrl) => {
    const targetElement = document.querySelector("#iframeContainer");
    targetElement.src = dataUrl;
  });
}

// function newResultdocno(data) {
//   var result = [];
//   loading.value = true;
//   console.log(data_list.value);
//   MasterdataService.getGLledger((docno.value = "JO-202209069972C3"))
//     .then((res) => {
//       console.log(res);
//       if (res.success) {
//         console.log(res);
//         data_list.value = res.data;
//         console.log(data.docno);
//         docno.value = data_list.value.accountdescription;
//         console.log(data_list.value.accountdescription);
//         // totalItemsCount.value = res.pagination.total;

//         // result = docno.value.filter((val) => val.code == data);
//         // return result.length > 0 ? result[0].name : "ไม่พบข้อมูล";
//       }
//       loading.value = false;
//     })
//     .catch((err) => {
//       loading.value = false;
//       console.log(err);
//     });
// }
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
async function exportdowloadPDF() {
  var body = [];
  body = await buildFromJson();
  var docDefinition = pageSetup(body);
  pdfMake.createPdf(docDefinition).download("บัญชีแยกประเภท.pdf");
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
          widths: ["15%", "25%", "15%", "10%", "10%", "10%", "15%"],
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
    { text: "รหัสบัญชี", fillColor: "#81d4fa" },
    { text: "ชื่อบัญชี", fillColor: "#81d4fa" },
    { text: "", fillColor: "#81d4fa" },
    { text: "", fillColor: "#81d4fa" },
    { text: "", fillColor: "#81d4fa" },
    { text: "", fillColor: "#81d4fa" },
    { text: "", fillColor: "#81d4fa" },
  ]);
  body.push([
    { text: "วันที่", fillColor: "#81d4fa" },
    { text: "เลขที่เอกสาร", fillColor: "#81d4fa" },
    { colSpan: 2, text: "รายละเอียด", fillColor: "#81d4fa" },
    { text: "", fillColor: "#81d4fa" },
    { text: "เดบิต", fillColor: "#81d4fa" },
    { text: "เครดิต", fillColor: "#81d4fa" },
    { text: "ยอดรวม", fillColor: "#81d4fa" },
  ]);

  data_list.value.forEach((data) => {
    body.push([
      { text: data.accountcode, fillColor: "#d8eaf2" },

      { text: data.accountname, fillColor: "#d8eaf2" },
      {
        text: "",
        fillColor: "#d8eaf2",
      },
      { text: "", fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
    ]);

    body.push([
      { text: "" },

      { text: "ยกมา" },
      {
        text: "",
      },
      { text: "" },
      { text: "" },
      { text: "" },
      { text: Utils.formatNumber(data.balance) },
    ]);
    data.details.forEach((details) => {
      console.log(details);
      body.push([
        { text: Utils.getDateFormatDMY(details.docdate) },
        { text: details.docno },
        { colSpan: 2, text: details.accountdescription },
        { text: "" },
        { text: newResultmain(Utils.formatNumber(details.debit)) },
        { text: newResultmain(Utils.formatNumber(details.credit)) },
        { text: Utils.formatNumber(details.amount) },
      ]);
    });

    body.push([
      { text: "" },
      { text: "ยกไป" },
      {
        text: "",
        style: ["header", "textdecoration"],
      },
      {
        text: "",
      },

      { text: "" },
      { text: "" },
      {
        text: Utils.formatNumber(data.nextbalance),

        // Utils.formatCurrency(
        //   getSumDebitAmount(data.journaldetail.debitamount)
        // ),
      },
    ]);
    // body.push([
    //   { text: "รหัสบัญชี", fillColor: "#81d4fa" },
    //   { text: "ชื่อบัญชี", fillColor: "#81d4fa" },
    //   { text: "", fillColor: "#81d4fa" },
    //   { text: "", fillColor: "#81d4fa" },
    //   { text: "", fillColor: "#81d4fa" },
    //   { text: "", fillColor: "#81d4fa" },
    //   { text: "", fillColor: "#81d4fa" },
    // ]);
  });

  return body;
}
function DownloadExampleExcel() {
  console.log("DownloadExampleExcel");

  data_list.value.forEach((data) => {
    detail_example.value.push(
      {
        1: "รหัสบัญชี",

        2: "ชื่อบัญชี",
        3: "",
        4: "",
        5: "",
        6: "",
        7: "",
        8: "",
      },
      {
        1: "วันที่",

        2: "เลขที่เอกสาร",
        3: "รายละเอียด",
        4: "เดบิต",
        5: "เครดิต",
        6: "ยอดรวม",
        7: "",
        8: "",
      },
      {
        1: data.accountcode,

        2: data.accountname,
        3: "",
        4: "",
        5: "",
        6: "",
        7: "",
        8: "",
      }
      // {
      //   "": "",
      //   "": "",
      //   วันที่: "",
      //   เลขที่เอกสาร: "",
      //   รายละเอียด: "",
      //   เดบิต: "เดบิต",
      //   เครดิต: "เครดิต",
      //   ยอดรวม: "",
      // },
    );
    detail_example.value.push(
      {
        1: "",

        2: "ยกมา",
        3: "",
        4: "",
        5: "",
        6: Utils.formatNumberforExcel(data.balance),
        7: "",
        8: "",
      }
      // {
      //   "": "",
      //   "": "",
      //   วันที่: "",
      //   เลขที่เอกสาร: "",
      //   รายละเอียด: "",
      //   เดบิต: "เดบิต",
      //   เครดิต: "เครดิต",
      //   ยอดรวม: "",
      // },
    );
    data.details.forEach((details) => {
      // console.log(details);

      detail_example.value.push({
        1: Utils.getDateFormatDMY(details.docdate),

        2: details.docno,
        3: details.accountdescription,
        4: newResultmain(Utils.formatNumberforExcel(details.debit)),
        5: newResultmain(Utils.formatNumberforExcel(details.credit)),
        6: Utils.formatNumberforExcel(details.amount),
        7: "",
        8: "",
      });
    });
    detail_example.value.push(
      {
        1: "",

        2: "ยกไป",
        3: "",
        4: "",
        5: "",
        6: Utils.formatNumberforExcel(data.nextbalance),
        7: "",
        8: "",
      }
      // {
      //   "": "",
      //   "": "",
      //   วันที่: "",
      //   เลขที่เอกสาร: "",
      //   รายละเอียด: "",
      //   เดบิต: "เดบิต",
      //   เครดิต: "เครดิต",
      //   ยอดรวม: "",
      // },
    );
    // detail_example.value.push({
    //   รหัสบัญชี: "รหัสบัญชี",

    //   วันที่: "วันที่",
    //   ชื่อบัญชี: "ชื่อบัญชี",
    //   เลขที่เอกสาร: "เลขที่เอกสาร",
    //   รายละเอียด: "รายละเอียด",
    //   เดบิต: "เดบิต",
    //   เครดิต: "เครดิต",
    //   ยอดรวม: "ยอดรวม",
    // });
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
function getGLledger() {
  MasterdataService.getGLledger()
    .then((res) => {
      console.log(res);
      if (res.success) {
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function newResultmain(data) {
  console.log(data);
  var result = [];
  result = accountmaintypeList.value.filter((val) => val.code == data);
  return result == 0 ? "" : data;
}

function checkzero(data) {
  if (data == 0) {
    return "";
  } else {
    return data;
  }
}
function docnoCheck(data) {
  let accDes = "";
  MasterdataService.getGLledger(data)
    .then((res) => {
      if (res.success) {
        // console.log(data);
        // console.log(res.data.accountdescription);
        accDes = res.data.docno;
      }

      loading.value = false;
      console.log(accDes);
      return accDes;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}
function getAccountledger() {
  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);

  loading.value = true;
  MasterdataService.getAccountledger(
    startdate,
    enddate,
    (accountcode.value = 11),
    limitPage.value
  )
    .then((res) => {
      if (res.success) {
        console.log(res);
        data_list.value = res.data;

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
  //   getAccountledger();
  //   getAccountChartList();
  //   newResultCategory();
  //   getGLJournalList();
  // expandAll();
  //   isvisible.value = false;
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
