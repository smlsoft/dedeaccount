<template>
  <AppLayout>
    <MainContentWarp>
      <div class="p-2 surface-section flex-auto">
        <div class="grid p-fluid formgrid">
          <div class="field mb-12 col-12 md:col-12">
            <i class="pi pi-book" style="font-size: 2rem">
              รายงานทางการเงิน / บัญชีแยกประเภท</i
            >
          </div>
          <h3 class="field mb-4 col-4 md:col-3">บัญชีแยกประเภท</h3>

          <h4 class="field mb-4 col-4 md:col-2">
            <div class="field-checkbox">
              <Checkbox v-model="state" :binary="true" @change="switchOn()" />
              <label>เลือกช่วงผังบัญชี:</label>
            </div>
          </h4>

          <div class="field mb-4 col-6 md:col-3 ml-3">
            <label for="startDate" class="font-medium text-900"
              >ผังบัญชีที่
            </label>

            <Dropdown
              v-model="accountcode"
              :showClear="true"
              :filter="true"
              :filterFields="['accountcode', 'accountname']"
              field="accountcode"
              :options="groups"
              filterPlaceholder="ค้นหา"
              placeholder="เลือก"
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
              <template #footer>
                <div class="align-right">
                  <Button
                    style="font-size: 0.9rem"
                    label="เคลียร์ข้อความ"
                    icon="pi pi-times"
                    class="p-button-danger-sm"
                    @click="cleartext($event)"
                  />
                </div>
              </template>
            </Dropdown>
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
          <div class="field mb-4 col-6 md:col-3 ml-4">
            <label for="startDate" class="font-medium text-900"
              >ช่วงระหว่างวันที่ :</label
            >
            <DatePicker
              class="field mb-12 col-12 md:col-12"
              dateFormat="d/m/yy"
              v-model="startDate"
              :modelValue="startDate"
              :showIcon="true"
              :buddhist="buddhistYear"
              :hideOnDateTimeSelect="true"
              :hiddenTime="true"
            />
          </div>
          <div class="field mb-4 col-6 md:col-3 ml-4">
            <label for="endDate" class="font-medium text-900"
              >ถึงวันที่ :</label
            >
            <DatePicker
              class="field mb-10 col-12 md:col-12"
              dateFormat="d/m/yy"
              v-model="endDate"
              :modelValue="endDate"
              :showIcon="true"
              :buddhist="buddhistYear"
              :hideOnDateTimeSelect="true"
              :hiddenTime="true"
            />
          </div>

          <div class="field-checkbox mb-12 col-12 md:col-3">
            <Checkbox :binary="true" v-model="result" @change="addall()" />

            <label>แสดงผังที่ไม่เคลื่อนไหว</label>
          </div>
          <div class="field-checkbox col-12 md:col-12 p-button-outlined">
            <Button
              label="จัดทำรายงาน"
              icon="pi pi-book"
              iconPos="left"
              @click="exportreport()"
            />
          </div>
          <!-- <div class="col-12" v-if="isvisible">
            <iframe
              class="w-full overflow-auto surface-overlay"
              style="height: 90vh"
              id="iframeContainer"
            ></iframe>
          </div> -->
        </div>
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

          <!-- <Button
              label="จัดทำรายงาน"
              class="p-button-raised p-button-text"
              icon="pi pi-book"
            
            /> -->
        </div>

        <div class="card p-2">
          <div class="flex flex-column">
            <div
              class="flex align-items-center justify-content-center m-1"
            ></div>

            <div class="flex align-items-center justify-content-center m-1">
              รายงานบัญชีแยกประเภท
            </div>
          </div>
        </div>
        <div class="card">
          <div style="{{style}}">
            <DataTable
              :value="newData"
              rowGroupMode="subheader"
              groupRowsBy="accountcodegroup"
              sortMode="single"
              :sortOrder="1"
              scrollable
              scrollHeight="80vh"
              class="p-datatable-sm"
              showGridlines
            >
              <ColumnGroup type="header">
                <Row>
                  <Column header="รหัสบัญชี"> </Column>
                  <Column header="ชื่อบัญชี"> </Column>
                  <Column :colspan="3"> </Column>
                </Row>
                <Row>
                  <Column header="วันที่"> </Column>
                  <Column header="เลขที่เอกสาร"> </Column>
                  <Column header="รายละเอียด"> </Column>
                  <Column header="เดบิต"> </Column>
                  <Column header="เตรดิต"> </Column>
                  <Column header="ยอดรวม"> </Column>
                </Row>
              </ColumnGroup>

              <Column field="docdate">
                <template #body="slotProps">
                  <span
                    v-if="
                      slotProps.data.docdate != '' &&
                      slotProps.data.docdate != undefined
                    "
                  >
                    {{ dateCheck(slotProps.data.docdate) }}</span
                  >
                </template>
              </Column>
              <Column field="docno"
                ><template #body="slotProps">
                  <span
                    v-if="
                      slotProps.data.docno != '' &&
                      slotProps.data.docno != undefined
                    "
                  >
                    {{ slotProps.data.docno }}</span
                  >
                </template></Column
              >
              <Column field="accountdescription"
                ><template #body="slotProps">
                  <span
                    v-if="
                      slotProps.data.accountdescription != '' &&
                      slotProps.data.accountdescription != undefined
                    "
                  >
                    {{ slotProps.data.accountdescription }}</span
                  >
                </template></Column
              >
              <Column field="debit"
                ><template #body="slotProps">
                  <span
                    v-if="
                      slotProps.data.debit != '' &&
                      slotProps.data.debit != undefined
                    "
                    >{{ slotProps.data.debit }}</span
                  >
                </template></Column
              >
              <Column field="credit"
                ><template #body="slotProps">
                  <span
                    v-if="
                      slotProps.data.credit != '' &&
                      slotProps.data.credit != undefined
                    "
                  >
                    {{ slotProps.data.credit }}</span
                  >
                </template></Column
              >
              <Column field="amount"
                ><template #body="slotProps">
                  <span
                    v-if="
                      slotProps.data.amount != '' &&
                      slotProps.data.amount != undefined
                    "
                    >{{ slotProps.data.amount }}</span
                  >
                </template></Column
              >
              <template #groupheader="slotProps">
                <span
                  v-if="
                    slotProps.data.accountcodegroup != '' &&
                    slotProps.data.accountcodegroup != undefined
                  "
                  style="
                    font-size: 20px;
                    min-width: 16.5%;
                    min-height: 1000;
                    background-color: whitesmoke;
                    width: fit-content;
                  "
                >
                  {{ slotProps.data.accountcodegroup }}
                </span>

                <span
                  v-if="
                    slotProps.data.accountnamegroup != '' &&
                    slotProps.data.accountnamegroup != undefined
                  "
                  style="
                    font-size: 20px;
                    min-width: 84%;
                    background-color: whitesmoke;
                    min-height: 100%;
                    border-top: 10cm;
                  "
                >
                  {{ slotProps.data.accountnamegroup }}</span
                >
              </template>
            </DataTable>
          </div>
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
                @click="checkadExceldll()"
                :disabled="isvisible === false"
              />
            </div>
            <div class="flex ml-2">
              <Button
                label="ส่งออก PDF"
                icon="pi pi-file-pdf"
                class="p-button-primary"
                @click="exreportpdf()"
              />
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
import $ from "jquery";
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
const accountcode = ref([]);
const accountcode1 = ref([]);
const accountgroup = ref("");
const consolidateaccountcode = ref("");
const accountcode2 = ref([]);
const dataaccountcode = ref("");
const state = ref(false);
const group = ref([]);
const data_list = ref([{}]);
const data_listPdf = ref([{}]);
const data_list2 = ref([]);
const docno = ref();
const balance = ref();
const balancenext = ref();
const result = ref(false);
const accountmaintypeList = ref([{ name: "0", code: 1 }]);
3;
const customersGrouped = ref([
  {
    id: 1000,
    name: "James Butt",
    country: {
      name: "Algeria",
      code: "dz",
    },
    company: "Benton, John B Jr",
    date: "2015-09-13",
    status: "unqualified",
    verified: true,
    activity: 17,
    representative: {
      name: "Ioni Bowcher",
      image: "ionibowcher.png",
    },
    balance: 70663,
  },
  {
    id: 1001,
    name: "Josephine Darakjy",
    country: {
      name: "Egypt",
      code: "eg",
    },
    company: "Chanay, Jeffrey A Esq",
    date: "2019-02-09",
    status: "proposal",
    verified: true,
    activity: 0,
    representative: {
      name: "Amy Elsner",
      image: "amyelsner.png",
    },
    balance: 82429,
  },
  {
    id: 1002,
    name: "Art Venere",
    country: {
      name: "Panama",
      code: "pa",
    },
    company: "Chemel, James L Cpa",
    date: "2017-05-13",
    status: "qualified",
    verified: false,
    activity: 63,
    representative: {
      name: "Asiya Javayant",
      image: "asiyajavayant.png",
    },
    balance: 28334,
  },
]);

const newData = ref([]);
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
function expandAll() {
  expandedRows.value = data_list.value.filter((p) => p.accountcode);
  toast.add({ severity: "success", summary: "All Rows Expanded", life: 3000 });
}

// async function getAccountChart() {
//   try {
//     const res = await MasterdataService.getAccountChartList(limitPage.value);
//     console.log(res);
//     if (res.success) {
//       groups.value = res.data;
//     }
//   } catch (err) {
//     console.log(err);
//   }
// }
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
function onRowGroupExpand(event) {
  toast.add({
    severity: "info",
    summary: "Row Group Expanded",
    detail: "Value: " + event.data,
    life: 3000,
  });
}
function onRowGroupCollapse(event) {
  toast.add({
    severity: "success",
    summary: "Row Group Collapsed",
    detail: "Value: " + event.data,
    life: 3000,
  });
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

function dateCheck(data) {
  if (data == "NaN/NaN/NaN") {
    return "";
  } else if (data.length <= 7) {
    return data;
  } else {
    return Utils.getDateFormatDMY(data);
  }
}

function checkadExceldll() {
  result.value == false;
  console.log(result.value);
  if (result.value == false) {
    result.value == false;
    DownloadExampleExcel();
  } else if (result.value == true) {
    DownloadExampleExcelAll();
  }
}
function addall() {
  // result.value = true;
  console.log(result.value);
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
  // if ((event.value = "")) {
  //   console.log("emty");
  // }
  console.log(event);
  state.value == false;
  accountcode1.value = event.value;

  console.log(state.value);

  console.log(event.value);

  accountcode1.value = event.value;
  dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;

  // else if ((state.value = true)) {
  //   dataaccountcode.value = event.value + ":" + event.value;
  // }

  console.log(dataaccountcode.value);
}

function cleartext(event) {
  console.log(event);
  event.value = "";
  console.log(event);
  dataaccountcode.value = "";
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

function exportreport() {
  exreport2();
  isvisible.value = true;
}

function exreport2() {
  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);

  if (dataaccountcode.value == ":") {
    dataaccountcode.value = "";
  }
  isvisible.value = true;
  MasterdataService.getAccountledger(
    startdate,
    enddate,
    dataaccountcode.value,
    (accountgroup.value = ""),
    (consolidateaccountcode.value = "")
  )

    .then((res) => {
      // console.log(res.data);

      res.data.forEach((element, index) => {
        if (
          element.balance == 0 &&
          element.nextbalance == 0 &&
          element.balance == element.nextbalance &&
          element.details.length > 0
        ) {
          console.log("1");
          data_list.value.push(element);

          // console.log(data_list.value);
        } else if (
          (element.balance != 0 &&
            element.nextbalance != 0 &&
            element.details.length > 0) ||
          (element.balance == 0 &&
            element.nextbalance != 0 &&
            element.details.length > 0) ||
          (element.balance != 0 &&
            element.nextbalance == 0 &&
            element.details.length > 0)
        ) {
          data_list.value.push(element);
          // console.log(data_list.value);
        } else if (element.balance != 0 && element.nextbalance != 0) {
          data_list.value.push(element);
          // console.log(data_list.value);
        } else if (
          (element.balance == 0 &&
            element.nextbalance != 0 &&
            element.details.length == 0) ||
          (element.balance != 0 &&
            element.nextbalance == 0 &&
            element.details.length == 0)
        ) {
        } else if (
          element.balance == 0 &&
          element.nextbalance == 0 &&
          element.balance == element.nextbalance &&
          element.details.length == 0
        ) {
        }
      });
      if (res.success) {
        res.data.forEach((data) => {
          // console.log(data);
          group.value = data.details;

          if (
            data.balance == 0 &&
            data.nextbalance != 0 &&
            result.value == false
          ) {
            console.log(data.accountcode + " เงื่อนไข1");
            // console.log(data);

            data.details.unshift({
              docdate: data.accountcode,
              docno: data.accountname,
              accountdescription: "",
              credit: "",
              debit: "",
              amount: "",
              accountcodegroup: data.accountcode,
              accountnamegroup: data.accountname,
            });

            data.details.push({
              docdate: "",
              docno: "ยกไป",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: data.nextbalance,
            });
          } else if (result.value == true && data.balance == 0) {
            console.log(data.accountcode + "เงื่อนไข2");

            data.details.unshift({
              docdate: "",
              docno: "ยกมา ",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: data.balance,
              accountcodegroup: data.accountcode,
              accountnamegroup: data.accountname,
            });

            data.details.push({
              docdate: "",
              docno: "ยกไป",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: data.nextbalance,
            });
          } else if (
            data.balance == 0 &&
            data.nextbalance == 0 &&
            data.details.length == 0
          ) {
          } else if (data.balance != 0 && data.nextbalance != 0) {
            console.log(data.accountcode + "เงื่อนไข 1919191");
            data.details.unshift({
              docdate: "",
              docno: "ยกมา",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: data.balance,
            });
            data.details.unshift({
              docdate: data.accountcode,
              docno: data.accountname,
              accountdescription: "",
              credit: "",
              debit: "",
              amount: "",
              accountcodegroup: data.accountcode,
              accountnamegroup: data.accountname,
            });

            data.details.push({
              docdate: "",
              docno: "ยกไป",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: data.nextbalance,
            });
          } else {
            console.log(data.accountcode + "เงื่อนไขที่3");
            data.details.unshift({
              docdate: data.accountcode,
              docno: data.accountname,
              accountdescription: "",
              credit: "",
              debit: "",
              amount: "",
              accountcodegroup: data.accountcode,
              accountnamegroup: data.accountname,
            });

            data.details.push({
              docdate: "",
              docno: "ยกไป",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: data.nextbalance,
            });
          }

          data.details.forEach((element, index) => {
            newData.value.push(element);
          });
        });
        expandAll();

        setTimeout(() => {
          console.log("newData", newData.value);

          var html = $("tr.p-rowgroup-header td "); //.html();

          for (var i = 0; i < html.length; i++) {
            if (!html[i].innerHTML.includes("span")) {
              console.log(html[i].innerHTML);
              html[i].style.display = "none";
            }

            // if (!html[i].html().includes("span")) {
            //   console.log(html[i]);
            // }
          }
          var html2 = $("tr.td");
          for (var i = 0; i < html2.length; i++) {
            if (!html2[i].innerHTML.includes("span")) {
              console.log(html2[i].innerHTML);
              html2[i].style.display = "none";
            }
          }
          // if (!html.includes("span")) {
          //   console.log($("tr.p-rowgroup-header td"));
          // }
        }, 1500);
        setTimeout(() => {
          if (data_list.value == "") {
            group.value = data.details[0];
          }
        }, 100);
        console.log(data_list.value);
        // console.log(res.data);
        if (result.value == true) {
          data_list.value = res.data;
        }
        console.log(data_list.value);

        console.log(res);
        toast.add({
          severity: "success",
          summary: "จัดทำรายงานสำเร็จ",
          life: 1000,
        });
      }
      loading.value = false;
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
  //   newResultCategory();
  //   getGLJournalList();
  // expandAll();
  loading.value = false;
}
function exreportpdf() {
  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);

  if (dataaccountcode.value == ":") {
    dataaccountcode.value = "";
  }
  isvisible.value = true;
  MasterdataService.getAccountledger(
    startdate,
    enddate,
    dataaccountcode.value,
    (accountgroup.value = ""),
    (consolidateaccountcode.value = "")
  )

    .then((res) => {
      loading.value = true;

      if (res.success) {
        data_listPdf.value = res.data;
        exportdowloadPDF();
        setTimeout(() => {}, 100);

        console.log(res);
        toast.add({
          severity: "success",
          summary: "จัดทำรายงานสำเร็จ",
          life: 1000,
        });
      }
      loading.value = false;
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
  //   newResultCategory();
  //   getGLJournalList();
  // expandAll();
}
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
    targetElement.src = dataUrl;
  });
}
async function exportPDFAll() {
  isvisible.value = true;
  var body = [];
  var enddate = "";
  var startdate = "";
  body = await buildFromJson2();

  startdate = Utils.getYearBuddhist(startDate.value);
  enddate = Utils.getYearBuddhist(endDate.value);

  var docDefinition = pageSetup(body, startdate, enddate);

  const pdfDocGenerator = pdfMake.createPdf(docDefinition);
  pdfDocGenerator.getDataUrl((dataUrl) => {
    const targetElement = document.querySelector("#iframeContainer");
    targetElement.src = dataUrl;
  });
}
function buildFromJson2() {
  var body = [];

  body.push([
    { text: "รหัสบัญชี", style: "header" },
    { text: "ชื่อบัญชี", style: "header" },
    { colSpan: 5, text: "" },
    { text: "" },
    { text: "" },
    { text: "" },
    { text: "" },
  ]);
  body.push([
    { text: "วันที่", style: "header" },
    { text: "เลขที่เอกสาร", style: "header" },
    { colSpan: 2, text: "รายละเอียด", style: "header" },
    { text: "" },
    { text: "เดบิต ", style: "header" },
    { text: "เครดิต", style: "header" },
    { text: "ยอดรวม", style: "header" },
  ]);
  console.log(data_list.value);
  data_list.value.forEach((data) => {
    body.push([
      { text: data.accountcode, fillColor: "#d8eaf2" },

      { colSpan: 6, text: data.accountname, fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
      { text: "", fillColor: "#d8eaf2" },
    ]);

    body.push([
      { text: "" },

      { text: "ยกมา" },
      { colSpan: 2, text: "" },
      { text: "" },
      { text: "" },
      { text: "" },
      { text: Utils.formatNumber(data.balance), alignment: "center" },
    ]);
    data.details.forEach((details) => {
      // console.log(details);
      body.push([
        { text: Utils.getDateFormatDMY(details.docdate) },
        { text: details.docno },
        { colSpan: 2, text: details.accountdescription },
        { text: "" },
        { text: checkzero(Utils.formatNumber(details.debit)) },
        { text: checkzero(Utils.formatNumber(details.credit)) },
        { text: Utils.formatNumber(details.amount), alignment: "center" },
      ]);
    });

    body.push([
      { text: "" },
      { text: "ยกไป" },

      { colSpan: 2, text: "", style: ["header", "textdecoration"] },
      {
        text: "",
      },

      { text: "" },
      { text: "" },
      {
        text: Utils.formatNumber(data.nextbalance),
        alignment: "center",
      },
    ]);
  });

  return body;
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
  var enddate = "";
  var startdate = "";
  body = await buildFromJson();

  startdate = Utils.getYearBuddhist(startDate.value);
  enddate = Utils.getYearBuddhist(endDate.value);

  var docDefinition = pageSetup(body, startdate, enddate);
  pdfMake.createPdf(docDefinition).download("บัญชีแยกประเภท.pdf");
}
function pageSetup(data, startdate, enddate) {
  var docDefinition = {
    content: [
      {
        text:
          "รายงานบัญชีแยกประเภท" +
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

      {
        style: "tableExample",

        table: {
          widths: ["15%", "25%", "13%", "10%", "10%", "10%", "17%"],
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
    { text: "รหัสบัญชี", style: ["header", "textdecoration"] },
    { text: "ชื่อบัญชี", style: ["header", "textdecoration"] },
    { colSpan: 5, text: "" },
    { text: "" },
    { text: "" },
    { text: "" },
    { text: "" },
  ]);
  body.push([
    { text: "วันที่", style: "header" },
    { text: "เลขที่เอกสาร", style: "header" },
    { colSpan: 2, text: "รายละเอียด", style: "header" },
    { text: "" },
    { text: "เดบิต ", style: "header" },
    { text: "เครดิต", style: "header" },
    { text: "ยอดรวม", style: "header" },
  ]);
  console.log(data_listPdf.value);
  data_listPdf.value.forEach((data) => {
    if (
      data.balance == data.nextbalance &&
      data.balance == 0 &&
      data.nextbalance == 0 &&
      data.details.length > 0
    ) {
      console.log("1");
      body.push([
        {
          text: data.accountcode,
          fillColor: "#d8eaf2",
          style: ["header", "textdecoration"],
        },

        { colSpan: 6, text: data.accountname, fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
      ]);

      body.push([
        { text: "" },

        { text: checkbalanceWord(data.balance) },
        { colSpan: 2, text: "" },
        { text: "" },
        { text: "" },
        { text: "" },
        { text: checkbalance(data.balance), alignment: "center" },
      ]);
      data.details.forEach((details) => {
        // console.log(details);
        body.push([
          { text: Utils.getDateFormatDMY(details.docdate) },
          { text: details.docno },
          { colSpan: 2, text: details.accountdescription },
          { text: "" },
          {
            text: checkzero(Utils.formatNumber(details.debit)),
            alignment: "center",
          },
          {
            text: checkzero(Utils.formatNumber(details.credit)),
            alignment: "center",
          },
          { text: Utils.formatNumber(details.amount), alignment: "center" },
        ]);
      });

      body.push([
        { text: "" },
        { text: "ยกไป" },

        { colSpan: 2, text: "", style: ["header", "textdecoration"] },
        {
          text: "",
        },

        { text: "" },
        { text: "" },
        {
          text: data.nextbalance,
          alignment: "center",
        },
      ]);
    } else if (data.balance == 0 && data.nextbalance == 0) {
    } else {
      body.push([
        {
          text: data.accountcode,
          fillColor: "#d8eaf2",
          style: ["header", "textdecoration"],
        },

        { colSpan: 6, text: data.accountname, fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
      ]);

      body.push([
        { text: "" },

        { text: checkbalanceWord(data.balance) },
        { colSpan: 2, text: "" },
        { text: "" },
        { text: "" },
        { text: "" },
        { text: checkbalance(data.balance), alignment: "center" },
      ]);
      data.details.forEach((details) => {
        // console.log(details);
        body.push([
          { text: Utils.getDateFormatDMY(details.docdate) },
          { text: details.docno },
          { colSpan: 2, text: details.accountdescription },
          { text: "" },
          {
            text: checkzero(Utils.formatNumber(details.debit)),
            alignment: "center",
          },
          {
            text: checkzero(Utils.formatNumber(details.credit)),
            alignment: "center",
          },
          { text: Utils.formatNumber(details.amount), alignment: "center" },
        ]);
      });

      body.push([
        { text: "" },
        { text: "ยกไป" },

        { colSpan: 2, text: "", style: ["header", "textdecoration"] },
        {
          text: "",
        },

        { text: "" },
        { text: "" },
        {
          text: checkbalance(data.nextbalance),
          alignment: "center",
        },
      ]);
    }
  });

  return body;
}
function DownloadExampleExcel() {
  result.value == false;
  console.log("DownloadExampleExcel");

  data_list.value.forEach((data) => {
    if (
      data.balance == data.nextbalance &&
      data.balance == 0 &&
      data.nextbalance == 0
    ) {
      result.value == false;
      return console.log("true");
    }
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
    );
    detail_example.value.push({
      1: "",

      2: checkbalanceWord(data.balance),
      3: "",
      4: "",
      5: "",
      6: checkbalance(data.balance),
      7: "",
      8: "",
    });
    data.details.forEach((details) => {
      // console.log(details);

      detail_example.value.push({
        1: Utils.getDateFormatDMY(details.docdate),

        2: details.docno,
        3: details.accountdescription,
        4: checkzero(Utils.formatNumberforExcel(details.debit)),
        5: checkzero(Utils.formatNumberforExcel(details.credit)),
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
        6: data.nextbalance,
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
function DownloadExampleExcelAll() {
  console.log("DownloadExampleExcelAll");

  data_list.value.forEach((data) => {
    detail_examplenumbertwo.value.push(
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
    );
    detail_examplenumbertwo.value.push({
      1: "",

      2: "ยกมา",
      3: "",
      4: "",
      5: "",
      6: data.balance,
      7: "",
      8: "",
    });
    data.details.forEach((details) => {
      // console.log(details);

      detail_examplenumbertwo.value.push({
        1: Utils.getDateFormatDMY(details.docdate),

        2: details.docno,
        3: details.accountdescription,
        4: checkzero(Utils.formatNumberforExcel(details.debit)),
        5: checkzero(Utils.formatNumberforExcel(details.credit)),
        6: Utils.formatNumberforExcel(details.amount),
        7: "",
        8: "",
      });
    });
    detail_examplenumbertwo.value.push(
      {
        1: "",

        2: "ยกไป",
        3: "",
        4: "",
        5: "",
        6: data.nextbalance,
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
//resulstCheck start
function newResultmain(data) {
  console.log(data);
  var result = [];
  result = accountmaintypeList.value.filter((val) => (val.code = data));
  return (result = 0 ? "" : data);
}

function checkzero(data) {
  if (data == 0) {
    return "";
  } else {
    return data;
  }
}
function checkbalance(data) {
  balance.value = data;
  if (balance.value == 0 && result.value == false) {
    return "";
  } else if (balance == 0 && result.value == true) {
    console.log();
    return data;
  } else {
    // console.log(data);
    return data;
  }
}
// function checkbalancenext(data) {
//   balancenext.value = data;
//   if (balancenext.value == 0 && balancenext.value == balance.value) {
//     result.value = true;
//     console.log(result.value);
//     console.log(balancenext.value);
//     return;
//   } else {
//     return Utils.formatNumber(data);
//   }
// }
// function checkword(data) {
//   balancenext.value = data;
//   if (balancenext.value == 0 && balancenext.value == balance.value) {
//     console.log(true);
//     return;
//   } else {
//     console.log(false);
//     return data;
//   }
// }
// function checkbalancenextWord(data) {
//   balancenext.value = data;
//   if (balancenext.value == 0 && balancenext.value == balance.value) {
//     console.log(balancenext.value);
//     return;
//   } else {
//     return "ยกไป";
//   }
// }
function checkbalanceWord(data) {
  if (data == 0 && result.value == false) {
    return;
  } else {
    return "ยกมา";
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
//resulstCheckEnd
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
<style lang="scss" scoped>
.p-rowgroup-footer td {
  font-weight: normal;
}

.bold-font {
  font-weight: bold;
}

::v-deep(.p-rowgroup-header) {
  span {
    font-weight: 700;
  }

  .p-row-toggler {
    vertical-align: middle;
    margin-right: 0.25rem;
  }
}
</style>
