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
              <h3 class="field mb-4 col-4 md:col-3">กระดาษทำการ</h3>
              <h4 class="field mb-4 col-4 md:col-1">สำหรับชุดบัญชี:</h4>
              <div class="field mb-4 col-4 md:col-3">
                <Dropdown
                  class="field mb-12 col-12 md:col-12"
                  v-model="accountGroup"
                  :options="groups"
                  optionValue="code"
                  optionLabel="name1"
                  @change="selectAccount($event)"
                  placeholder="Select a City"
                />
                <!-- <RadioButton
                    :id="group.code"
                    name="group"
                    :value="group.code"
                    v-model="accountGroup"
                  />
                  <label :for="group.code"
                    >{{ group.code }} ~{{ group.name1 }}</label
                  > -->
              </div>
            </div>
          </div>

          <div class="field mb-4 col-6 md:col-3 ml-3">
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
          <div class="field mb-4 col-6 md:col-3">
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
          <div class="field-checkbox mb-1 col-5 md:col-2">
            <Checkbox :binary="true" v-model="ica" />
            <label>รวมรายการปิดบัญชีสิ้นปี</label>
          </div>
          <div class="field-checkbox mb-1 col-1 md:col-2 p-button-outlined">
            <Button
              label="จัดทำรายงาน"
              icon="pi pi-book"
              iconPos="left"
              @click="exportPDF()"
              :disabled="
                startDate === null ||
                endDate === null ||
                accountGroup.length == 0
              "
            />
          </div>

          <div class="col-12" v-if="isvisible">
            <iframe
              class="w-full overflow-auto surface-overlay"
              style="height: 90vh"
              id="iframeContainer"
            ></iframe>
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

const storeApp = useApp();
const isvisible = ref(false);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const startDate = ref();
const endDate = ref();
const accountGroup = ref("");
const data_list = ref([]);
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
  getAccountGroupList();
  getDate();
  storeApp.setPageTitle("กระดาษทำการ");
  storeApp.setActivePage("work_sheet");
  storeApp.setActiveChild("work_sheet");
});

async function getAccountGroup() {
  try {
    const res = await MasterdataService.getAccountGroup();
    //console.log(res);
    if (res.success) {
      groups.value = res.data
        .sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        })
        .map((acc) => {
          acc.label = `${acc.code} ~ ${acc.name1}`;
          return acc;
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
function selectAccount(event) {
  console.log(event);

  console.log(data_list.value);
  //   getAccountledger();
  //   isvisible.value = true;
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
          "\n กระดาษทำการ \n ณ วันที่ " +
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
          widths: ["40%", "15%", "15%", "15%", "15%"],
          body: data,
        },
      },
    ],
    pageOrientation: "portrait",
    pageMargins: [8, 8, 8, 8],
    defaultStyle: {
      font: "Sarabun",
      fontSize: 12,
      columnGap: 30,
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
    { text: "ชื่อบัญชี", style: "header" },
    { text: "เลขที่บัญชี", style: "header" },
    { text: "งบทดลอง", style: "header" },
    { text: "งบกำไรขาดทุน", style: "header" },
    { text: "งบดุล", style: "header" },
  ]);
  //   body.push([
  //     { text: "ชื่อบัญชี", style: "header" },
  //     { text: "เลขที่บัญชี", style: "header" },
  //     { text: "งบทดลอง", style: "header" },
  //     { text: "งบกำไรขาดทุน", style: "header" },
  //     { text: "งบดุล", style: "header" },
  //   ]);

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
    { colSpan: 3, text: "รวม", bold: true, alignment: "center" },
    {},
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
</script>
