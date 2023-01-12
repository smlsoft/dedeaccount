<template>
  <AppLayout>
    <MainContentWarp>
      <div class="p-2 surface-section flex-auto">
        <div class="grid p-fluid formgrid">
          <div class="field mb-12 col-12 md:col-12">
            <i class="pi pi-book" style="font-size: 2rem">
              รายงานทางการเงิน / งบทดลอง</i
            >
          </div>
          <div class="field col-12 md:col-3">
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
          <div class="field col-12 md:col-3">
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
          <div class="field col-12 md:col-3">
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
          <div class="field col-12 md:col-3">
            <label for="closeyear" class="font-medium text-900"
              >รวมรายการปิดบัญชีสิ้นปี :</label
            >
            <div class="field-checkbox mt-2">
              <Checkbox :binary="true" v-model="ica" />
              <label>รวมรายการปิดบัญชีสิ้นปี</label>
            </div>
          </div>
          <div class="field-checkbox col-12 md:col-12 p-button-outlined">
            <Button
              label="จัดทำรายงาน"
              icon="pi pi-book"
              iconPos="left"
              @click="exportReport()"
              :disabled="
                startDate === null ||
                endDate === null ||
                accountGroup.length == 0
              "
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

        <Splitter v-if="isvisible" style="height: calc(100vh - 12vh)">
          <SplitterPanel id="panelForm1">
            <TrialBalance
              :dataReport="dataReport"
              :headDataReport="headDataReportTrialBalance"
              :loading="loadingTrialBalance"
              v-on:showSplitterLedger="showSplitterLedger"
            ></TrialBalance>
          </SplitterPanel>
          <SplitterPanel v-if="detailLedger" id="panelForm2">
            <Ledger
              :dataReport="dataReportLedger"
              :headDataReport="headDataReportLedger"
              :loading="loadingLedger"
              v-on:showDialogDocNo="getGLDetail"
              v-on:closeSplitterLedger="closeSplitterLedger"
            ></Ledger>
          </SplitterPanel>
        </Splitter>
      </div>

      <Dialog
        v-model:visible="openDetailDocNo"
        :header="'เอกสาร : ' + daily_form.docno"
        :breakpoints="{ '960px': '90vw', '640px': '100vw' }"
        :style="{ width: '50vw' }"
      >
        <div class="confirmation-content" id="boxconfirm" style="height: 70vh">
          <TabView class="tabview-custom" ref="tabview">
            <TabPanel>
              <template #header>
                <i class="pi pi-book mr-1"></i>
                <span> ข้อมูลรายวัน</span>
              </template>
              <JournalForm
                :isUpdate="readMode"
                :daily_form="daily_form"
                :daily_form_valid="daily_form_valid"
              >
              </JournalForm>
            </TabPanel>
            <TabPanel>
              <template #header>
                <i class="pi pi-wallet mr-1"></i>
                <span> ข้อมูลภาษี</span>
              </template>
              <VatForm
                :isUpdate="readMode"
                :vats="vats"
                :vats_valid="vats_valid"
              ></VatForm>
            </TabPanel>
            <TabPanel>
              <template #header>
                <i class="pi pi-wallet mr-1"></i>
                <span> ภาษีถูกหัก/หัก​ ณ ที่จ่าย</span>
              </template>
              <TaxForm
                :isUpdate="readMode"
                :taxes="taxes"
                :taxes_valid="taxes_valid"
              ></TaxForm>
            </TabPanel>
            <TabPanel v-if="showTabImage">
              <template #header>
                <i class="pi pi-image mr-1"></i>
                <span> รูปภาพ</span>
              </template>
              <div class="flex justify-content-between mb-2">
                <div class="flex">ชื่อรูป : {{ dataImage.name }}</div>
                <div class="flex">
                  วันที่ :{{
                    Utils.getDateTimeFormat(dataImage.uploadedat)
                  }}
                  โดย {{ dataImage.uploadedby }}
                </div>
              </div>
              <div style="margin: 0px; padding: 0px">
                <iframe
                  :src="
                    '/images_group/components/zoom?uri=' + dataImage.imageuri
                  "
                >
                </iframe>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </Dialog>
    </MainContentWarp>
  </AppLayout>
</template>

<script setup>
/* eslint-disable */
import ReportService from "@/services/ReportDataService";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import ImageDataService from "@/services/ImageDataService";
import { ref, onMounted } from "vue";
import pdfMake from "pdfmake/build/pdfmake";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import DatePicker from "@/components/widget/DatePicker.vue";
import { useToast } from "primevue/usetoast";
import TrialBalance from "./components/tableTrialBalance.vue";
import Ledger from "./components/tableLedger.vue";
import dayjs from "dayjs";
import JournalForm from "../daily/components/journal_form.vue";
import VatForm from "../daily/components/vat_form.vue";
import TaxForm from "../daily/components/tax_form.vue";

const storeApp = useApp();
const isvisible = ref(false);
const toast = useToast();
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const startDate = ref();
const endDate = ref();
const startDateShow = ref();
const endDateShow = ref();
const accountGroup = ref("");
const data_list = ref([]);
const groups = ref([]);
const shopName = ref("");
const dataReport = ref([]);
const headDataReportTrialBalance = ref({});
const headDataReportLedger = ref({});
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

const detailLedger = ref(false);
const dataReportLedger = ref([{}]);
const openDetailDocNo = ref(false);
const readMode = ref(true);

const daily_form = ref({});
const daily_form_valid = ref({
  accountdescription: false,
  accountgroup: false,
  accountperiod: false,
  accountyear: false,
  amount: false,
  batchId: false,
  docdate: false,
  docno: false,
  bookcode: false,
});
const taxes = ref([]);
const taxes_valid = ref([
  {
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  },
]);
const vats = ref([]);
const vats_valid = ref([
  {
    vatdate: false,
    vatdocno: false,
    vatperiod: false,
    vatyear: false,
    vatbase: false,
    vatrate: false,
    vatamount: false,
    exceptvat: false,
    custname: false,
    custtaxid: false,
    branchcode: false,
  },
]);
const showTabImage = ref(false);
const dataImage = ref({});
const loadingLedger = ref(false);
const loadingTrialBalance = ref(false);

const countVats = ref(0);
const countTaxes = ref(0);
const countImages = ref(0);

onMounted(async () => {
  await getAccountGroup();
  getAccountGroupList();
  getDate();
  storeApp.setPageTitle("งบทดลอง");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("report_trialbalance");
});

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

      // groups.value = (res.data
      //   .sort(function (obj1, obj2) {
      //     return obj1.code - obj2.code;
      //   })
      //   .map((acc) => {
      //     acc.label = `${acc.code} ~ ${acc.name1}`;
      //     return acc;
      //   }));

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

async function exportReport() {
  isvisible.value = true;
  detailLedger.value = false;
  shopName.value = localStorage.shop_name;
  startDateShow.value = Utils.getYearBuddhist(startDate.value);
  endDateShow.value = Utils.getYearBuddhist(endDate.value);

  await getDataReport();

  //exportPDF();
}

async function getDataReport() {
  loadingTrialBalance.value = true;

  let accountgroup =
    accountGroup.value == "gruupAll" ? null : accountGroup.value;
  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);

  let icax = "0";
  if (ica.value) {
    icax = "1";
  }
  try {
    const res = await ReportService.getTrialBalanceSheet(
      accountgroup,
      startdate,
      enddate,
      icax
    );
    if (res.success) {
      headDataReportTrialBalance.value = {
        shopName: shopName.value,
        startDateShow: Utils.getDateShowText(startDateShow.value),
        endDateShow: Utils.getDateShowText(endDateShow.value),
      };
      setTimeout(() => {
        console.log(res.data);
        dataReport.value = res.data;
        loadingTrialBalance.value = false;
        // toast.add({
        //   severity: "success",
        //   summary: "success",
        //   detail: "ดึงข้อมูลสำเร็จ",
        //   life: 3000,
        // });
      }, 1000);
    }
  } catch (err) {
    console.log(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "ไม่สามารถดึงข้อมูลได้ " + err,
      life: 3000,
    });
  }
}

async function exportPDF() {
  isvisible.value = true;
  var body = [];
  var startdate = "";
  var enddate = "";

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

function getDate() {
  var date = new Date();
  startDate.value = new Date(date.getFullYear(), date.getMonth(), 1);
  endDate.value = new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function pageSetup(data, startdate, enddate) {
  console.log(enddate);

  var docDefinition = {
    content: [
      {
        text:
          "บัญชีชุดที่ " +
          accountGroup.value +
          " \n" +
          localStorage.shop_name +
          "\n งบทดลอง \n ณ วันที่ " +
          Utils.getDateShowText(enddate) +
          "\n\n",
        style: "header",
        alignment: "center",
      },
      {
        text: "หน่วย:บาท",
        style: "header",
        alignment: "right",
      },
      {
        style: "tableExample",
        table: {
          heights: "auto",
          widths: ["46%", "10%", "22%", "22%"],
          body: data,
        },
      },
    ],
    pageOrientation: "portrait",
    pageMargins: [8, 8, 8, 8],
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

async function buildFromJson() {
  let body = [];
  let listTrialBalanceSheet = [];

  let totalnextbalancedebit = "";
  let totalnextbalancecredit = "";

  let accountgroup = accountGroup.value;
  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);
  console.log("ica", ica.value);

  let icax = "0";
  if (ica.value) {
    icax = "1";
  }
  try {
    const res = await ReportService.getTrialBalanceSheet(
      accountgroup,
      startdate,
      enddate,
      icax
    );
    if (res.success) {
      console.log(res.data);
      listTrialBalanceSheet.value = res.data;
      totalnextbalancedebit = res.data.totalnextbalancedebit;
      totalnextbalancecredit = res.data.totalnextbalancecredit;
    }
  } catch (err) {
    console.log(err);
  }

  body.push([
    { text: "ชื่อบัญชี", style: "header", margin: [0, 9, 0, 0] },
    { text: "เลขที่บัญชี", style: "header", margin: [0, 9, 0, 0] },
    { text: "ยอดคงเหลือบัญชีหมวด\nสินทรัพย์ / ค่าใช้จ่าย", style: "header" },
    { text: "ยอดคงเหลือบัญชีหมวด\nหนี้สิ้น / ทุน / รายได้", style: "header" },
  ]);

  for (let detailAccount of listTrialBalanceSheet.value.accountdetails) {
    body.push([
      { text: detailAccount.accountname },
      { text: detailAccount.accountcode, alignment: "center" },
      {
        text:
          detailAccount.accountcategory == 1 ||
          detailAccount.accountcategory == 5
            ? Utils.formatNumber(detailAccount.nextbalanceamount)
            : "",
        alignment: "right",
      },
      {
        text:
          detailAccount.accountcategory == 2 ||
          detailAccount.accountcategory == 3 ||
          detailAccount.accountcategory == 4
            ? Utils.formatNumber(detailAccount.nextbalanceamount)
            : "",
        alignment: "right",
      },
    ]);
  }

  body.push([
    { colSpan: 2, text: "รวม", bold: true, alignment: "center" },
    {},
    {
      text: Utils.formatNumber(totalnextbalancedebit),
      bold: true,
      alignment: "right",
    },
    {
      text: Utils.formatNumber(totalnextbalancecredit),
      bold: true,
      alignment: "right",
    },
  ]);

  return body;
}

function formatCurrency(value) {
  return value.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}

function showSplitterPanel() {
  setTimeout(() => {
    var panel1 = document.getElementById("panelForm1");
    panel1.setAttribute("style", "flex-basis: calc(50% - 4px) !important");
    var panel2 = document.getElementById("panelForm2");
    panel2.setAttribute("style", "flex-basis: calc(50% - 4px) !important");
  }, 50);
}

function showSplitterLedger(data) {
  console.log(data);
  openDetailDocNo.value = false;
  detailLedger.value = true;
  showSplitterPanel();

  loadingLedger.value = true;
  let accountcode = "";
  let startdate = "";
  let d = "";
  let enddate = "";

  // console.log(startDate.value);
  // accountcode = data.accountcode + ":" + data.accountcode;
  // startdate = "2000-01-01";
  // enddate = dayjs(startDate.value).subtract(1, "day").format("YYYY-MM-DD");
  // headDataReportLedger.value = {
  //   shopName: shopName.value,
  //   startDateShow: Utils.getDateShowText(Utils.getYearBuddhist(startdate)),
  //   endDateShow: Utils.getDateShowText(Utils.getYearBuddhist(enddate)),
  // };

  accountcode = data.accountcode + ":" + data.accountcode;
  startdate = Utils.getDateFromYear(startDate.value);
  enddate = Utils.getDateFromYear(endDate.value);

  console.log("startdate :" + startdate);
  console.log("enddate :" + enddate);
  console.log("accountcode : " + accountcode);

  MasterdataService.getAccountledger(startdate, enddate, accountcode)
    .then((res) => {
      if (res.success) {
        console.log(res.data);
        headDataReportLedger.value = {
          shopName: shopName.value,
          startDateShow: Utils.getDateShowText(
            Utils.getYearBuddhist(startdate)
          ),
          endDateShow: Utils.getDateShowText(Utils.getYearBuddhist(enddate)),
        };

        setTimeout(() => {
          dataReportLedger.value = res.data;
          loadingLedger.value = false;
          // toast.add({
          //   severity: "success",
          //   summary: "success",
          //   detail: "ดึงข้อมูล แยกประเภท : " + data.accountcode + " สำเร็จ",
          //   life: 3000,
          // });
        }, 1000);
      }
    })
    .catch((err) => {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ไม่สามารถดึงข้อมูล แยกประเภท ได้ " + err,
        life: 3000,
      });
    });
}

function getGLDetail(docno) {
  console.log(docno);

  MasterdataService.getGLledger(docno)
    .then((res) => {
      if (res.success) {
        console.log(res);
        getDocumentImageByDocNo(docno);

        openDetailDocNo.value = true;
        const vat = res.data.vats;
        const tax = res.data.taxes;

        daily_form.value.docno = res.data.guidfixed;
        daily_form.value.accountdescription = res.data.accountdescription;
        daily_form.value.accountgroup = res.data.accountgroup;
        daily_form.value.accountperiod = res.data.accountperiod;
        daily_form.value.accountyear = res.data.accountyear;
        daily_form.value.amount = res.data.amount;
        daily_form.value.batchId = res.data.batchId;
        daily_form.value.journaltype = res.data.journaltype.toString();
        daily_form.value.docdate = Utils.getDateTimeFromDate(res.data.docdate);
        daily_form.value.docno = res.data.docno;
        daily_form.value.bookcode = res.data.bookcode;
        daily_form.value.journaldetail = res.data.journaldetail;
        if (daily_form.value.exdocrefdate == "0001-01-01T00:00:00Z") {
          daily_form.value.exdocrefdate = "";
        } else {
          daily_form.value.exdocrefdate = Utils.getDateTimeFromDate(
            res.data.exdocrefdate
          );
        }
        daily_form.value.exdocrefno = res.data.exdocrefno;

        if (vat.length > 0) {
          vats.value = [];
          vats_valid.value = [];

          for (var i = 0; i < res.data.vats.length; i++) {
            var vattemp = {
              vattype: vat[i].vattype,
              vatdate: Utils.getDateTimeFromDate(vat[i].vatdate),
              vatdocno: vat[i].vatdocno,
              vatperiod: vat[i].vatperiod,
              vatyear: vat[i].vatyear,
              vatbase: vat[i].vatbase,
              vatrate: vat[i].vatrate,
              vatamount: vat[i].vatamount,
              exceptvat: vat[i].exceptvat,
              vatmode: vat[i].vatmode,
              vatsubmit: vat[i].vatsubmit,
              custname: vat[i].custname,
              custtaxid: vat[i].custtaxid,
              organization: vat[i].organization,
              branchcode: vat[i].branchcode,
              remark: vat[i].remark,
            };
            putvatValid();
            vats.value.push(vattemp);
          }
        }

        if (tax.length > 0) {
          taxes.value = [];
          taxes_valid.value = [];
          for (var i = 0; i < tax.length; i++) {
            var taxes_temp = {
              taxdocno: tax[i].taxdocno,
              taxdate: Utils.getDateTimeFromDate(tax[i].taxdate),
              custname: tax[i].custname,
              custtype: tax[i].custtype,
              custtaxid: tax[i].custtaxid,
              taxtype: tax[i].taxtype,
              address: tax[i].address,
              details: [],
            };

            if (tax[i].details != null && tax[i].details.length > 0) {
              var sumamount = 0;
              var sumbase = 0;
              tax[i].details.forEach((data) => {
                var details_temp = {
                  description: data.description,
                  taxbase: data.taxbase,
                  taxrate: data.taxrate,
                  taxamount: data.taxamount,
                };

                taxes_temp.details.push(details_temp);
              });
            } else {
              taxes_temp.details = [
                {
                  description: "",
                  taxbase: 0,
                  taxrate: 0,
                  taxamount: 0,
                },
              ];
            }
            puttaxValid();
            taxes.value.push(taxes_temp);
          }
        }

        // console.log(daily_form.value);
        // console.log(vats.value);
        // console.log(taxes.value);

        // toast.add({
        //   severity: "success",
        //   summary: "success",
        //   detail: "ดึงข้อมูลเอกสาร : " + docno + " สำเร็จ",
        //   life: 3000,
        // });
      }
    })
    .catch((err) => {
      console.log(err);
      openDetailDocNo.value = false;
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ไม่สามารถดึงข้อมูล " + docno + " ได้ " + err,
        life: 3000,
      });
    });
}

function getDocumentImageByDocNo(docno) {
  ImageDataService.getDocumentImageByDocNo(docno)
    .then((res) => {
      if (res.success) {
        console.log(res);
        showTabImage.value = true;
        dataImage.value = res.data.imagereferences[0];
      }
    })
    .catch((err) => {
      console.log(err);
      showTabImage.value = false;
    });
}

function closeSplitterLedger() {
  detailLedger.value = false;
}

function putvatValid() {
  vats_valid.value.push({
    vatdate: false,
    vatdocno: false,
    vatperiod: false,
    vatyear: false,
    vatbase: false,
    vatrate: false,
    vatamount: false,
    exceptvat: false,
    custname: false,
    custtaxid: false,
    branchcode: false,
  });
}
function puttaxValid() {
  taxes_valid.value.push({
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  });
}
</script>

<style scoped>
iframe {
  display: block; /* iframes are inline by default */
  border: none; /* Reset default border */
  height: 73vh; /* Viewport-relative units */
  width: 100%;
}
</style>
