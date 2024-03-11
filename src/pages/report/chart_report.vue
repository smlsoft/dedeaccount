<template>
  <AppLayout>
    <MainContentWarp>
      <div class="p-2 surface-section flex-auto">
        <div class="grid p-fluid">
          <Dialog
            v-model:visible="showSearch"
            :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
            :style="{ width: '50vw' }"
            :modal="true"
          >
            <template #header>
              <i class="pi pi-cog" style="font-size: 1.5rem">
                {{ $t("search") }}</i
              >
            </template>

            <div class="grid p-fluid formgrid">
              <div class="field mb-4 col-6 md:col-3 ml-3">
                <label for="startDate" class="font-medium text-900"
                  >{{ $t("from_acc_code") }}
                </label>

                <Dropdown
                  :disabled="state == true"
                  v-model="accountcode"
                  :showClear="true"
                  :filter="true"
                  :filterFields="['accountcode', 'accountname']"
                  field="accountcode"
                  :options="groups"
                  filterPlaceholder="ค้นหา"
                  placeholder="เลือกทั้งหมด"
                  @change="selectAccount($event)"
                  optionLabel="label"
                  optionValue="accountcode"
                >
                  <template #option="groups">
                    <div>
                      {{ groups.option.accountcode }} ~
                      {{ groups.option.accountname }}
                    </div>
                  </template>
                  <!-- <template #footer>
                    <div class="align-right">
                      <Button
                        style="font-size: 0.9rem"
                        label="เคลียร์ข้อความ"
                        icon="pi pi-times"
                        class="p-button-danger-sm"
                        @click="cleartext($event)"
                      />
                    </div>
                  </template> -->
                </Dropdown>
              </div>
              <div class="field mb-4 col-6 md:col-3">
                <label for="endDate" class="font-medium text-900">
                  {{ $t("to_acc_code") }}
                </label>
                <Dropdown
                  :disabled="state == true"
                  v-model="accountcode2"
                  :showClear="true"
                  :filter="true"
                  :filterFields="['accountcode', 'accountname']"
                  field="accountcode"
                  :options="groups"
                  filterPlaceholder="ค้นหา"
                  placeholder="เลือก"
                  @change="selectAccount2($event)"
                  optionLabel="label"
                  optionValue="accountcode"
                />
              </div>
              <div class="field col-2 md:col-3">
                <label for="closeyear" class="font-medium text-900"
                  >{{ $t("all_acc") }} :</label
                >
                <div class="field-checkbox mt-2">
                  <Checkbox :binary="true" v-model="state" />
                  <label>{{ $t("all_acc") }}</label>
                </div>
              </div>

              <div class="field-checkbox col-12 md:col-12 p-button-outlined">
                <Button
                  label="จัดทำรายงาน"
                  icon="pi pi-book"
                  iconPos="left"
                  @click="exreport2()"
                  ><i class="pi pi-book"></i>

                  <label style="text-align: center; margin: auto"
                    >{{ $t("process") }}
                  </label></Button
                >
              </div>
            </div>
          </Dialog>
        </div>
        <div class="surface-card p-3 shadow-2 border-round">
          <div class="mb-2 flex align-items-center justify-content-between">
            <span class="text-xl font-medium text-900">
              <i class="pi pi-book" style="font-size: 1.5rem">
                {{ $t("statement") }} / {{ $t("chart_of_acc") }}</i
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
                    {{ $t("chart_of_acc") }} {{ nameCheck(accountcode1) }}
                    {{ nameCheck2(accountcode2) }}
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
                    >
                      <i class="pi pi-file-excel"></i>

                      <label style="text-align: center; margin: auto"
                        >{{ $t("export") }} Excel</label
                      ></Button
                    >
                  </div>
                  <div class="flex ml-2">
                    <Button
                      label="ส่งออก PDF"
                      icon="pi pi-file-pdf"
                      class="p-button-primary"
                      @click="exportdowloadPDF()"
                      :disabled="isvisible === false"
                    >
                      <i class="pi pi-file-pdf"></i>

                      <label style="text-align: center; margin: auto"
                        >{{ $t("export") }} PDF</label
                      ></Button
                    >
                  </div>
                </div>
              </div>
              <DataTable
                id="section"
                :value="data_list"
                dataKey="accountcode"
                class="p-datatable-sm"
                stripedRows
                responsiveLayout="scroll"
                :scrollable="true"
                scrollHeight="1000px"
                @sort="sortBy"
              >
                <template #header>
                  <div class="flex justify-content-between">
                    <div>
                      <div class="flex">
                        <div class="flex">
                          <!-- <Button
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
                        /> -->
                        </div>
                      </div>
                    </div>
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
                <template #loading :loading="loading"> กำลังประมวลผล </template>

                <Column field="accountcode" header=""
                  ><template #header>{{ $t("accountcode") }}</template></Column
                >
                <Column field="accountname" header="" class="accountname"
                  ><template #header>{{ $t("accountname") }}</template></Column
                >
                <Column field="consolidateaccountcode" header=""
                  ><template #header>{{
                    $t("consolidate_acc")
                  }}</template></Column
                >
                <Column field="accountgroup" header="">
                  <template #header>{{ $t("status") }}</template>
                  <template #body="{ data, field }">
                    {{ newResultmainClose(data[field]) }}
                  </template></Column
                >
              </DataTable>
            </div>
          </div>
        </div>
      </div>

      <div><p></p></div>
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
import router from "../../router";
import { useToast } from "primevue/usetoast";
import utils from "../../utils";
const detail = ref();
const textContent = ref("ต้องการลบข้อมูลรายวัน เลขที่เอกสาร");
const dailynum = ref("");
const head_example = ref([]);
const detail_example = ref([]);
const detail_examplenumbertwo = ref([]);
const textChart = ref("");
const showSearch = ref(true);
const toast = useToast();
const deleteDetailDialog = ref(false);
const totalItemsCount = ref(0);
const filters = ref(null);
const loading = ref(true);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);
const accDescript = ref("");
const sortField = ref("accountcode");
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
const accountgroup = ref();
const consolidateaccountcode = ref();
const accountcode = ref([]);
const accountcode1 = ref([]);
const accountcode2 = ref([]);
const dataaccountcode = ref([]);
const state = ref(false);
const data_list = ref([]);
const data_list2 = ref([]);
const docno = ref();
const accountmaintypeList = ref([{ name: "0", code: 1 }]);

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

  //   newResultdocno();
  console.log(data_list.value);
  // getAccountChartList();
  //   getAccountledger();
  // getGLJournalList();
  checkzero();

  storeApp.setPageTitle("รายงานข้อมูลผังบัญชี");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("chart_report");
});
async function expandAll() {
  expandedRows.value = data_list.value.filter();
  toast.add({ severity: "success", summary: "All Rows Expanded", life: 3000 });
}
function nameCheck(data) {
  if (data == "") {
    return (data = "รหัสผังบัญชีทั้งหมด");
  } else if (data == accountcode1.value) {
    return (data = accountcode1.value);
  }
}
function nameCheck2(data) {
  if (data == "") {
    return (data = "");
  } else if (data == accountcode2.value) {
    return (data = "ถึง" + accountcode2.value);
  }
}
async function getAccountChart() {
  try {
    const res = await MasterdataService.getAccountChartList(
      limitPage.value,
      activePage.value,
      filters.value,
      sortField.value,
      sortOrder.value
    );
    console.log(res);
    if (res.success) {
      groups.value = res.data.sort(function (obj1, obj2) {
        return obj1.code - obj2.code;
      });
      groups.value.forEach((ele) => {
        ele.label = ele.accountcode + "~" + ele.accountname;
      });
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
    getAccountChartList();
  } else if (state.value == false) {
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
  dataaccountcode.value = accountcode1.value + ":" + accountcode2.value;
  // if ((state.value = false)) {
  //   accountcode2.value = event.value;

  //   dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;
  // } else if ((state.value = true)) {
  //   dataaccountcode.value = accountcode1.value + ":" + accountcode2.value;
  // }
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
  if (state.value == true) {
    getAccountChartList();
  } else if (state.value == false) {
    loading.value = true;

    MasterdataService.getAccountledger(
      startdate,
      enddate,
      dataaccountcode.value,
      (accountgroup.value = ""),
      (consolidateaccountcode.value = "")
    )
      .then((res) => {
        if (res.success) {
          console.log(res);
          data_list.value = res.data;
          console.log(data_list.value);
          toast.add({
            severity: "success",
            summary: "จัดทำรายงานสำเร็จ",
            life: 1000,
          });
          exportPDF();
          // console.log(totalItemsCount.value);
        }
        loading.value = false;
        showSearch.value = false;
      })
      .catch((err) => {
        toast.add({
          severity: "error",
          summary: "จัดทำรายงานไม่สำเร็จ",
          detail: "โปรดตรวจสอบวันที่และผังบัญชี",
          life: 3000,
        });
        isvisible.value = false;
        loading.value = false;
        console.log(err);
      });
  }

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
  var startdate = "";
  body = await buildFromJson();

  startdate = Utils.getYearBuddhist(startDate.value);
  enddate = Utils.getYearBuddhist(endDate.value);

  var docDefinition = pageSetup(body, startdate, enddate);

  const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  pdfDocGenerator.getDataUrl((dataUrl) => {
    const targetElement = document.querySelector("#iframeContainer");
    // targetElement.src = dataUrl;
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
      console.log(res);
      if (res.success) {
        isvisible.value = true;
        data_list.value = res.data;
        data_list.value.forEach((ele) => {
          ele.isUpdate = false;
        });
        // totalPage.value = res.pagination.totalPage;
        totalItemsCount.value = res.pagination.total;
        //onsole.log(totalItemsCount.value);
        // getAllSelectImage();
      }
      loading.value = false;
      showSearch.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}
//output------
async function exportdowloadPDF() {
  var body = [];
  var enddate = "";
  var startdate = "";
  body = await buildFromJson();

  startdate = Utils.getYearBuddhist(startDate.value);
  enddate = Utils.getYearBuddhist(endDate.value);

  var docDefinition = pageSetup(body, startdate, enddate);
  pdfMake.createPdf(docDefinition).download("รายงานรหัสบัญชี.pdf");
}
function pageSetup(data, startdate, enddate) {
  var docDefinition = {
    content: [
      {
        text:
          "รายงานรหัสบัญชี" +
          "\n" +
          localStorage.shop_name +
          "\n" +
          "สิ้นสุด ณ  วันที่" +
          Utils.getDateShowText(enddate) +
          "\n" +
          "\n ",

        style: "header",
        bold: true,
        alignment: "center",
      },
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
          widths: "auto",
          body: data,
        },
        layout: "noBorders",
      },
    ],
    pageOrientation: "lightHorizontalLines",
    pageMargins: [15, 15, 15, 15],
    defaultStyle: {
      font: "Sarabun",
      fontSize: 12,
      columnGap: 20,
      color: "#0A065D",
    },
    styles: {
      header: {
        bold: true,
        alignment: "center",
      },
    },
  };
  return docDefinition;
}
function buildFromJson() {
  var body = [];

  body.push([
    { text: "รหัสผังบัญชี", fillColor: "#81d4fa" },
    { text: "ชื่อผังบัญชี", fillColor: "#81d4fa" },
    { text: "รหัสผังบัญชีคุม", fillColor: "#81d4fa" },
    { text: "สถานะ", fillColor: "#81d4fa" },
  ]);

  data_list.value.forEach((data) => {
    body.push([
      { text: data.accountcode },
      { text: data.accountname },
      {
        text: data.consolidateaccountcode,
      },
      { text: newResultmainClose(data.accountgroup) },
    ]);
  });

  return body;
}
function DownloadExampleExcel() {
  console.log("DownloadExampleExcel");

  data_list.value.forEach((data) => {
    // console.log(details);

    detail_example.value.push({
      รหัสบัญชี: data.accountcode,

      ชื่อผังบัญชี: data.accountname,
      รหัสผังบัญชีคุม: data.consolidateaccountcode,
      สถานะ: newResultmainClose(data.accountgroup),
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
  XLSX.utils.book_append_sheet(wb, Example, "รายงานรหัสบัญชี");
  XLSX.writeFile(wb, "รายงานรหัสบัญชี.xlsx");
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
  result = accountmaintypeList.value.filter((val) => (val.code = data));
  return (result = 0 ? "" : data);
}
function newResultmainClose(data) {
  var result = [];
  result = accountmaintypeList.value.filter((val) => val.code == data);
  return result.length > 0 ? "ใช้งาน" : "ปิด";
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
const imgWithbaseUrl = (uri) => {
  let baseUrl =
    process.env.NODE_ENV == "development"
      ? import.meta.url
      : process.env.VUE_APP_URL;
  console.log("Mode :", process.env.NODE_ENV, baseUrl);

  if (process.env.NODE_ENV != "development") {
    uri = uri.replace("@/", import.meta.env.BASE_URL);
  } else {
    uri = uri.replace("@/", import.meta.env.BASE_URL);
  }

  return new URL(uri, baseUrl).href;
};
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

<!-- <script setup>
import DialogForm from "@/components/DialogForm.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import $ from "jquery";
pdfMake.fonts = {
  Sarabun: {
    normal:
      "http://fonts.gstatic.com/s/sarabun/v12/DtVjJx26TKEr37c9WBJDnlQN9gk.ttf",
    bold: "http://fonts.gstatic.com/s/sarabun/v12/DtVmJx26TKEr37c9YK5sulwm6gDXvwE.ttf",
    italics:
      "http://fonts.gstatic.com/s/sarabun/v12/DtVhJx26TKEr37c9aBBJmnYI5gnOpg.ttf",
    bolditalics:
      "https://fonts.gstatic.com/s/sarabun/v12/DtVkJx26TKEr37c9aBBxJlks7iLSrwFUlw.ttf",
  },
};
const texthead = ref("ต้องการลบข้อมูลผังบัญชี รหัสผังบัญชี");
const chartlistcode = ref("");
const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const detail = ref();
const myFiles = ref();
const data_list = ref([]);
const head_example = ref([]);
const detail_example = ref([]);
const sortField = ref("accountcode");
const isvisible = ref(true);
const sortOrder = ref(1);
const totalItemsCount = ref(1000);
const limitPage = ref(1000);
const filters = ref(null);
const loading = ref(false);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(20);
const firstPage = ref(0);
const totalPage = ref(1000);
const value1 = ref(0);
const value2 = ref(50);
const interval = ref(null);
const showSkeleton = ref(false);
const import_data = ref([]);
const confirmDeleteDialog = ref(false);
const props = defineProps({
  chartlistcode: Object,
});

const accountCategoryList = ref([
  { name: "สินทรัพย์", code: 1 },
  { name: "หนี้สิน", code: 2 },
  { name: "ทุน", code: 3 },
  { name: "รายได้", code: 4 },
  { name: "ค่าใช้จ่าย", code: 5 },
]);
const accountmaintypeList = ref([
  { name: "1", code: 1 },
  { name: "2", code: 2 },
  { name: "3", code: 3 },
  { name: "4", code: 4 },
]);
const accountbalancetypeList = ref([
  { name: "เดบิต", code: 1 },
  { name: "เครดิต", code: 2 },
]);
const groupAccount_detail = ref([]);

onMounted(() => {
  getAccountChartList();
  getAccountChart() 
  // getAccountGroup();
  // getChartListScroll();

  storeApp.setPageTitle("รายงานข้อมูลผังบัญชี");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("chart_report");
});

function newResultmain(data) {
  var result = [];
  result = accountmaintypeList.value.filter((val) => val.code == data);
  return result.length > 0 ? "ใช้งาน" : "ปิด";
}
function newResultCategory(data) {
  var result = [];
  result = accountCategoryList.value.filter((val) => val.code == data);
  return result.length > 0 ? result[0].name : "ไม่พบข้อมูล";
}

function newResultBalance(data) {
  var result = [];
  result = accountbalancetypeList.value.filter((val) => val.code == data);
  return result.length > 0 ? result[0].name : "ไม่พบข้อมูล";
}
function getDate() {
  var date = new Date();
  startDate.value = new Date(date.getFullYear(), date.getMonth(), 1);
  endDate.value = new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function nextPage() {
  activePage.value += 1;
  if (activePage.value <= totalPage.value) {
    getChartListScroll();
  }
}

function onScroll() {
  let div = $("#maincontainer")[0];

  if (!showSkeleton.value) {
    nextPage();
  }
}
function getChartListScroll() {
  showSkeleton.value = true;
  loading.value = true;
  MasterdataService.getAccountChartList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )

    .then((res) => {
      console.log(res);
      if (res.success) {
        setTimeout(() => {
          res.data.forEach((ele) => {
            ele.isUpdate = false;
            data_list.value.push(ele);
          });
          console.log(data_list.value);

          //onsole.log(totalItemsCount.value);

          firstPage.value = activePage.value;

          console.log("firstPage" + firstPage.value);
          showSkeleton.value = false;
        }, 500);
      }
    })
    .catch((err) => {
      console.log(err);
      showSkeleton.value = false;
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
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
        data_list.value.forEach((ele) => {
          ele.isUpdate = false;
        });
        totalPage.value = res.pagination.totalPage;
        totalItemsCount.value = res.pagination.total;
        //onsole.log(totalItemsCount.value);
        // getAllSelectImage();
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function getAccountGroup() {
  MasterdataService.getAccountGroup()
    .then((res) => {
      if (res.success) {
        groupAccount_detail.value = res.data;
      }
      // console.log(groupAccount_detail.value);
    })
    .catch((err) => {
      console.log(err);
    });
}

function sortBy(data) {
  console.log(data);
  sortField.value = data.sortField;
  sortOrder.value = data.sortOrder;

  loading.value = true;
  MasterdataService.getAccountChartList(
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
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function goCreate() {
  router.push({ name: "chartCreate" });
}

function goEdit(data) {
  router.push({ name: "chartEdit", params: { id: data.guidfixed } });
}

function keyup() {
  clearTimeout(typingTimer.value);
  typingTimer.value = setTimeout(doneTyping, doneTypingInterval.value);
}
function keydown() {
  clearTimeout(typingTimer.value);
}
function exreport() {
  isvisible.value = true;
}
function doneTyping() {
  activePage.value = 1;
  firstPage.value = 0;
  MasterdataService.getAccountChartList(
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
  MasterdataService.deleteAccountChart(detail.value.guidfixed)
    .then((res) => {
      console.log(res);
      if (res.success) {
        getAccountChartList(activePage.value);
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "Deleted",
          life: 3000,
        });
        confirmDeleteDialog.value = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
function onClose() {
  confirmDeleteDialog.value = false;
}
function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
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
        data_list.value = res.data;
      }
      loading.value = false;
    })
    .catch((err) => {
      console.log(err);
      loading.value = false;
    });
}

async function exportPDF() {
  var body = [];
  body = await buildFromJson();
  var docDefinition = pageSetup(body);
  pdfMake.createPdf(docDefinition).download("รายงานข้อมูลผังบัญชี.pdf");
}
function pageSetup(data) {
  var docDefinition = {
    content: [
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
      styles: {
        header: {
          bold: true,
        },
        textdecoration: {
          italics: true,
          alignment: "right",
          decoration: "underline",
          decorationStyle: "double",
        },
        margindetail: {
          margin: [20, 0, 0, 0],
        },
        margintotal: {
          margin: [50, 0, 0, 0],
        },
      },
    },
  };
  return docDefinition;
}

function buildFromJson() {
  var body = [];
  body.push([{ text: localStorage.shop_name }, {}, {}, {}]);
  body.push([{ text: "รายงานข้อมูลผังบัญชี" }, {}, { text: "" }, { text: "" }]);
  body.push([
    { text: "รหัสผังบัญชี", fillColor: "#81d4fa" },
    { text: "ชื่อผังบัญชี", fillColor: "#81d4fa" },
    { text: "รหัสผังบัญชีคุม", fillColor: "#81d4fa" },
    { text: "สถานะ", fillColor: "#81d4fa" },
  ]);

  data_list.value.forEach((data) => {
    body.push([
      { text: data.accountcode },
      { text: data.accountname },
      {
        text: data.consolidateaccountcode,
      },
      { text: newResultmain(data.accountgroup) },
    ]);
  });

  return body;
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

function DownloadExampleExcel() {
  console.log("DownloadExampleExcel");

  head_example.value = ["5555"];
  data_list.value.forEach((data) => {
    detail_example.value.push({
      รหัสผังบัญชี: data.accountcode,
      ชื่อผังบัญชี: data.accountname,
      รหัสผังบัญชีคุม: data.consolidateaccountcode,
      สถานะ: newResultmain(data.accountgroup),
    });
  });
  console.log(data_list.value.accountcode);
  var config = { raw: true, type: "string" };
  var Example = XLSX.utils.json_to_sheet(
    detail_example.value,
    head_example.value,
    config
  );

  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, Example, "รายงานข้อมูลผังบัญชี");
  XLSX.writeFile(wb, "รายงานข้อมูลผังบัญชี.xlsx");
}
// function rowClass(data) {
//   var level = "";
//   if (data.accountlevel === 1) {
//     level = "level1";
//   } else if (data.accountlevel === 2) {
//     level = "level2";
//   } else if (data.accountlevel === 3) {
//     level = "level3";
//   } else if (data.accountlevel === 4) {
//     level = "level4";
//   } else {
//     level = "level5";
//   }
//   if (data.accountcode === data.consolidateaccountcode) {
//     level = "level7";
//   } else {
//   }
//   return level;
//   // if (data.accountlevel >= 1 && data.accountlevel <= 4) {
//   //   return "level" + data.accountlevel;
//   // } else if (data.accountcode === data.consolidateaccountcode) {
//   //   return "level7";
//   // } else {
//   //   return "level5";
//   // }
// }
function rowClass(data) {
  var level = "";
  if (data.accountlevel === 1) {
    level = "level1";
  } else if (data.accountlevel === 2) {
    level = "level2";
  } else if (data.accountlevel === 3) {
    level = "level3";
  } else if (data.accountlevel === 4) {
    level = "level4";
  } else {
    level = "level5";
  }
  if (data.accountcode === data.consolidateaccountcode) {
    level = "level7";
  } else {
  }
  return level;
}
</script>

<template>
  <AppLayout>
    <MainContentWarp @scroll="onScroll">
      <div class="field mb-12 col-12 md:col-12">
        <i class="pi pi-book" style="font-size: 2rem"> รายงานทางการเงิน</i>
      </div>
      <ProgressBar
        v-if="loading"
        :value="(1, 100)"
        style="height: 1em; font-size: 14px"
      />

      <div class="p-2 surface-section flex-auto">
        <div class="grid mt-2" v-if="isvisible">
          <div class="col-12">
            <h2 for="selectedgroup" class="font-medium text-900">
              รายงานรหัสบัญชี
            </h2>
            <div class="field mb-12 col-12 md:col-12">
            <div class="flex flex-wrap card-container blue-container">
  



              <div class="field mb-4 col-6 md:col-3 ml-3">
          
                  ผังบัญชีที่:
             
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
          
                  >ถึงผังบัญชีที่
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
            </div>
        
          <div class="field-checkbox mb-1 col-5 md:col-2">
            <Checkbox :binary="true" v-model="ica" />
            <label>รวมรายการปิดบัญชีสิ้นปี</label>
          </div>
          </div>
            <DataTable
              :value="data_list"
              dataKey="accountcode"
              class="p-datatable-sm"
              stripedRows
              responsiveLayout="scroll"
              @sort="sortBy"
              :rowClass="rowClass"
            >
              <template #header>
                <div class="flex justify-content-between">
                  <div>
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
                  </div>
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
              <template #loading :loading="loading"> กำลังประมวลผล </template>

              <Column
                field="accountcode"
                header="รหัสผังบัญชี"
                :sortable="true"
              ></Column>
              <Column
                field="accountname"
                header="ชื่อผังบัญชี"
                class="accountname"
                :sortable="true"
              ></Column>
              <Column
                field="consolidateaccountcode"
                header="รหัสผังบัญชีคุม"
                :sortable="true"
              ></Column>
              <Column field="accountgroup" header="สถานะ" :sortable="true">
                <template #body="{ data, field }">
                  {{ newResultmain(data[field]) }}
                </template></Column
              >
            </DataTable>
          </div>
        </div>
      </div>

      <div>
        <DialogForm
          :confirmDialog="confirmDeleteDialog"
          :textContent="texthead"
          :textContent2="chartlistcode"
          v-on:close="onClose"
          v-on:confirm="deleteDetail"
        ></DialogForm>
      </div>
    </MainContentWarp>
  </AppLayout>
</template>

<style>
.level1 .accountname {
  font-weight: 900;
}

.level2 .accountname {
  padding-left: 20px !important;
}

.level3 .accountname {
  padding-left: 40px !important;
}

.level4 .accountname {
  padding-left: 60px !important;
}

.level5 .accountname {
  padding-left: 70px !important;
}

.level6 .accountname {
  padding-left: 80px !important;
}
.level7 .accountcode {
  font-weight: 900;
}
.level7 .accountname {
  padding-left: 60px !important;
  font-weight: 900;
}
</style> -->
