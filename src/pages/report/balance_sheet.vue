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
            <i class="pi pi-book" style="font-size: 2rem">
              {{ $t("statement") }}</i
            >
          </div>
          <div class="field mb-12 col-12 md:col-12">
            <div class="flex flex-wrap card-container blue-container">
              <h1 for="selectedgroup" class="font-medium text-900"></h1>
              <h2 class="field mb-4 col-4 md:col-3">
                {{ $t("balancesheet") }}
              </h2>
              <h4 class="field mb-4 col-4 md:col-2">
                {{ $t("accountgroup") }}:
              </h4>
              <div class="field mb-4 col-4 md:col-">
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

          <div class="field mb-4 col-6 md:col-3 ml-1=">
            <label for="startDate" class="font-medium text-900"
              >{{ $t("enddate") }} :</label
            >
            <DatePicker
              dateFormat="d/m/yy"
              v-model="endDate"
              :modelValue="startDendDateate"
              :showIcon="true"
              :buddhist="buddhistYear"
              :hideOnDateTimeSelect="true"
              :hiddenTime="true"
            />
          </div>

          <div class="field-checkbox mb-1 col-5 md:col-3">
            <Checkbox :binary="true" v-model="ica" />
            <label>{{ $t("closing_entry") }}</label>
          </div>
          <div class="field-checkbox mb-1 col-1 md:col-2 p-button-outlined">
            <Button
              label="จัดทำรายงาน"
              icon="pi pi-book"
              iconPos="left"
              @click="exportPDF()"
              :disabled="endDate === null || accountGroup.length == 0"
              ><i class="pi pi-book"></i>
              <label style="text-align: center; margin: auto"
                >{{ $t("process") }}
              </label>
            </Button>
            <!-- <Button
              label="จัดทำรายงาน"
              class="p-button-raised p-button-text"
              icon="pi pi-book"
            
            /> -->
          </div>
          <div class="col-12" v-if="isvisible">
            <div class="overflow-auto surface-overlay">
              <iframe
                style="height: 90vh"
                class="w-full"
                frameborder="0"
                scrolling="no"
                id="iframeContainer"
                type="application/pdf"
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
import { ref, onMounted } from "vue";
import MasterdataService from "@/services/MasterdataService";
import pdfMake from "pdfmake/build/pdfmake";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import DatePicker from "@/components/widget/DatePicker.vue";

const storeApp = useApp();
const isvisible = ref(false);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const endDate = ref(null);
const accountGroup = ref("");
const groups = ref([]);
const data_list = ref([]);
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
  getDate();
  storeApp.setPageTitle("งบดุล");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("report_balancesheet");
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
    }
  } catch (err) {
    console.log(err);
  }
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
function getDate() {
  var date = new Date();
  endDate.value = new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function pageSetup(data, enddate) {
  var docDefinition = {
    content: [
      {
        text:
          "บัญชีชุดที่ " +
          accountGroup.value +
          " \n " +
          localStorage.shop_name +
          "\n งบดุล \n ณ วันที่ " +
          Utils.getDateShowText(enddate) +
          "\n\n",
        style: "header",
        alignment: "center",
      },
      {
        style: "tableExample",
        table: {
          widths: ["60%", "39%", "1%"],
          body: [
            [
              { text: "", style: "" },
              {
                text: "หน่วย:บาท",
                bold: true,
                alignment: "right",
              },
              { text: "" },
            ],
          ],
        },
        layout: "noBorders",
      },
      {
        style: "tableExample",
        table: {
          widths: ["60%", "39%", "1%"],
          body: data,
        },
        layout: "noBorders",
      },
    ],
    pageOrientation: "portrait",
    pageMargins: [40, 8, 40, 8],
    defaultStyle: {
      font: "Sarabun",
      fontSize: 12,
      columnGap: 20,
      color: "#0A065D",
    },
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
  };
  return docDefinition;
}

async function buildFromJson() {
  let body = [];
  let listBalanceSheet = [];

  let totalAssetAmount = "";
  let totalLiabilityAmount = "";
  let totalOwnersequityAmount = "";
  let totalLiabilityAndOwnersequityAmount = "";

  let accountgroup = accountGroup.value;
  let enddate = Utils.getDateFromYear(endDate.value);
  console.log("ica", ica.value);

  let icax = "0";
  if (ica.value) {
    icax = "1";
  }
  try {
    const res = await ReportService.getBalanceSheet(
      accountgroup,
      enddate,
      icax
    );
    if (res.success) {
      console.log(res.data);
      listBalanceSheet.value = res.data;
      totalAssetAmount = res.data.totalassetamount;
      totalLiabilityAmount = res.data.totalliabilityamount;
      totalOwnersequityAmount = res.data.totalownersequityamount;
      totalLiabilityAndOwnersequityAmount =
        res.data.totalliabilityandownersequityamount;
    }
  } catch (err) {
    console.log(err);
  }

  // Assets

  body.push(
    [
      { colSpan: 3, text: "สินทรัพย์", style: "header", alignment: "center" },
      {},
      {},
    ],
    [{ text: "สินทรัพย์หมุนเวียน", style: "header" }, {}, {}]
  );
  if (listBalanceSheet.value.assets != null) {
    for (let detailAsset of listBalanceSheet.value.assets) {
      body.push([
        { text: detailAsset.accountname, style: "margindetail" },
        {
          text: Utils.formatNumber(detailAsset.amount),
          style: "margindetail",
          alignment: "right",
        },
        { text: "" },
      ]);
    }
  }
  body.push([
    { text: "รวมสินทรัพย์ :-", style: ["header", "margintotal"] },
    {
      text: Utils.formatNumber(totalAssetAmount),
      alignment: "right",
      style: ["header", "textdecoration"],
    },
    { text: "", bold: true },
  ]);
  // liabilities
  body.push(
    [
      {
        colSpan: 3,
        text: "หนี้สินและทุน",
        style: "header",
        alignment: "center",
      },
      {},
      {},
    ],
    [{ text: "หนี้สินหมุนเวียน", style: "header" }, {}, {}]
  );
  if (listBalanceSheet.value.liabilities != null) {
    for (let detailLiabilities of listBalanceSheet.value.liabilities) {
      body.push([
        { text: detailLiabilities.accountname, style: "margindetail" },
        {
          text: Utils.formatNumber(detailLiabilities.amount),
          style: "margindetail",
          alignment: "right",
        },
        { text: "" },
      ]);
    }
  }
  body.push([
    { text: "รวมหนี้สินหมุนเวียน:-", style: ["header", "margintotal"] },
    {
      text: Utils.formatNumber(totalLiabilityAmount),
      alignment: "right",
      style: ["header", "textdecoration"],
    },
    { text: "", bold: true },
  ]);
  // Ownesequities
  body.push([{ text: "ทุน", style: "header" }, {}, {}]);
  if (listBalanceSheet.value.ownesequities != null) {
    for (let detailOwnesequities of listBalanceSheet.value.ownesequities) {
      body.push([
        { text: detailOwnesequities.accountname, style: "margindetail" },
        {
          text: Utils.formatNumber(detailOwnesequities.amount),
          style: "margindetail",
          alignment: "right",
        },
        { text: "" },
      ]);
    }
  }
  body.push([
    { text: "รวมทุน:-", style: ["header", "margintotal"] },
    {
      text: Utils.formatNumber(totalOwnersequityAmount),
      alignment: "right",
      style: ["header", "textdecoration"],
    },
    { text: "", bold: true },
  ]);
  body.push([
    { text: "รวมหนี้สินและทุน :-", style: ["header", "margintotal"] },
    {
      text: Utils.formatNumber(totalLiabilityAndOwnersequityAmount),
      alignment: "right",
      style: ["header", "textdecoration"],
    },
    { text: "", bold: true },
  ]);

  return body;
}

function formatCurrency(value) {
  return value.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}
</script>
