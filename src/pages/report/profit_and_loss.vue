<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-card p-4 shadow-2 border-round">
        <!-- Header Section -->
        <div class="mb-4">
          <div class="flex align-items-center justify-content-between mb-3">
            <div class="flex align-items-center gap-3">
              <div
                class="flex align-items-center justify-content-center bg-blue-100 border-round"
                style="width: 3rem; height: 3rem"
              >
                <i class="pi pi-chart-line text-blue-600 text-2xl"></i>
              </div>
              <div>
                <h2 class="text-2xl font-semibold text-900 m-0">
                  {{ $t("profit_loss") }}
                </h2>
                <p class="text-600 m-0 mt-1">รายงานผลการดำเนินงาน</p>
              </div>
            </div>
            <Button
              label="ค้นหา"
              icon="pi pi-search"
              @click="openSearchDialog()"
            />
          </div>
        </div>

        <!-- PDF Preview Section -->
        <div
          v-if="isvisible"
          class="border-1 border-200 border-round overflow-hidden"
        >
          <div class="bg-blue-50 p-3 border-bottom-1 border-200">
            <div class="flex align-items-center justify-content-between">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-file-pdf text-red-600 text-xl"></i>
                <span class="font-semibold text-900">
                  รายงานงบกำไรขาดทุน สำหรับงวด {{ formatDisplayDate(startDate) }} ถึง {{ formatDisplayDate(endDate) }}
                </span>
              </div>
              <Button
                icon="pi pi-times"
                severity="secondary"
                text
                rounded
                @click="isvisible = false"
                v-tooltip.top="'ปิดตัวอย่าง'"
              />
            </div>
          </div>
          <div class="overflow-auto surface-overlay">
            <iframe
              style="height: 85vh"
              class="w-full"
              frameborder="0"
              scrolling="no"
              id="iframeContainer"
              type="application/pdf"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <div class="mb-3">
            <i class="pi pi-file text-6xl text-400"></i>
          </div>
          <h3 class="text-900 font-semibold mb-2">ยังไม่มีรายงานแสดง</h3>
          <p class="text-600 mb-4">กรุณาเลือกเงื่อนไขการค้นหาเพื่อแสดงรายงาน</p>
          <Button
            label="เลือกเงื่อนไขการค้นหา"
            icon="pi pi-search"
            size="large"
            @click="openSearchDialog()"
          />
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>

  <!-- Search Dialog -->
  <Dialog
    v-model:visible="searchDialogVisible"
    appendTo="body"
    modal
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '50vw' }"
    :draggable="false"
    :resizable="false"
  >
    <template #header>
      <div class="flex flex-column gap-2">
        <h1 class="m-0 text-900 font-semibold text-xl line-height-3">
          เงื่อนไขการค้นหารายงาน
        </h1>
        <span class="text-600 text-base">
          กรุณาเลือกวันที่และเงื่อนไขที่ต้องการเรียกรายงาน
        </span>
      </div>
    </template>

    <section class="flex flex-column w-full mt-4">
      <div class="grid">
        <div class="col-12 md:col-6">
          <div class="p-float-label w-full">
            <Calendar
              v-model="startDate"
              :showIcon="true"
              dateFormat="dd/mm/yy"
              class="w-full"
              inputId="startDateCalendar"
              :input-style="{ height: '54px' }"
            />
            <label for="startDateCalendar">{{ $t("from_acc_code") }}</label>
          </div>
        </div>

        <div class="col-12 md:col-6">
          <div class="p-float-label w-full">
            <Calendar
              v-model="endDate"
              :showIcon="true"
              dateFormat="dd/mm/yy"
              class="w-full"
              inputId="endDateCalendar"
              :input-style="{ height: '54px' }"
            />
            <label for="endDateCalendar">{{ $t("to_acc_code") }}</label>
          </div>
        </div>

        <div class="col-12 mt-3">
          <div class="field-checkbox mb-0">
            <Checkbox id="icaDialog" :binary="true" v-model="ica" />
            <label for="icaDialog" class="ml-2 text-900 font-medium">
              {{ $t("closing_entry") }}
            </label>
          </div>
          <small class="text-600 ml-4 block mt-1">
            เลือกเพื่อรวมรายการปิดงบในรายงาน
          </small>
        </div>
      </div>
    </section>

    <template #footer>
      <div class="pt-3 flex">
        <Button
          @click="searchDialogVisible = false"
          label="ยกเลิก"
          class="p-button-text flex-grow-1"
        />
        <Button
          @click="searchAndCloseDialog()"
          label="ค้นหา"
          class="flex-grow-1"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
/* eslint-disable */
import ReportService from "@/services/ReportDataService";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import { ref, onMounted } from "vue";
import pdfMake from "pdfmake/build/pdfmake";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import DatePicker from "@/components/widget/DatePicker.vue";

const storeApp = useApp();
const isvisible = ref(false);
const searchDialogVisible = ref(false);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const startDate = ref(null);
const endDate = ref(null);
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
  getDate();
  // เปิด dialog ค้นหาทันทีเมื่อโหลดหน้า
  searchDialogVisible.value = true;

  storeApp.setPageTitle("งบกำไรขาดทุน");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("report_profitandloss");
});

// ฟังก์ชันเปิด dialog ค้นหา
const openSearchDialog = () => {
  searchDialogVisible.value = true;
};

// ฟังก์ชันค้นหาและปิด dialog
const searchAndCloseDialog = async () => {
  if (startDate.value && endDate.value) {
    searchDialogVisible.value = false;
    // เรียกฟังก์ชันสร้าง PDF ทันที
    await exportPDF();
  }
};

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

// ฟังก์ชันแสดงวันที่ในรูปแบบไทย
function formatDisplayDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function pageSetup(data, startdate, enddate) {
  var docDefinition = {
    content: [
      {
        text:
          localStorage.shop_name +
          "\n งบกำไรขาดทุน \n สำหรับปีสิ้นสุดวันที่ " +
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
        margin: [40, 0, 0, 0],
      },
      margintotal: {
        margin: [60, 0, 0, 0],
      },
    },
  };
  return docDefinition;
}

async function buildFromJson() {
  let body = [];
  let listProfitandloss = [];
  let totalIncomeAmount = "0.00";
  let totalExpenseAmount = "0.00";
  let profitAndLossAmount = "";

  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);
  console.log("ica", ica.value);

  let icax = "0";
  if (ica.value) {
    icax = "1";
  }
  try {
    const res = await ReportService.getProfitandloss(
      "",
      startdate,
      enddate,
      icax
    );
    if (res.success) {
      console.log(res.data);
      listProfitandloss.value = res.data;
      totalIncomeAmount = res.data.totalincomeamount;
      totalExpenseAmount = res.data.totalexpenseamount;
      profitAndLossAmount = res.data.profitandlossamount;
    }
  } catch (err) {
    console.log(err);
  }

  // รายได้
  body.push([{ text: "รายได้", style: "header" }, {}, {}]);
  if (listProfitandloss.value.incomes != null) {
    for (let detailIncome of listProfitandloss.value.incomes) {
      body.push([
        { text: detailIncome.accountname, style: "margindetail" },
        {
          text: Utils.formatNumber(detailIncome.amount),
          style: "margindetail",
          alignment: "right",
        },
        { text: "" },
      ]);
    }
  }
  body.push([
    { text: "รวมรายได้ ", style: ["header", "margintotal"] },
    {
      text: Utils.formatNumber(totalIncomeAmount),
      alignment: "right",
      style: ["header", "textdecoration"],
    },
    { text: "", bold: true },
  ]);

  // ค่าใช้จ่าย
  body.push([{ text: "ค่าใช้จ่าย", style: "header" }, {}, {}]);
  if (listProfitandloss.value.expenses != null) {
    for (let detailExpenses of listProfitandloss.value.expenses) {
      body.push([
        { text: detailExpenses.accountname, style: "margindetail" },
        {
          text: Utils.formatNumber(detailExpenses.amount),
          style: "margindetail",
          alignment: "right",
        },
        { text: "" },
      ]);
    }
  }
  body.push(
    [
      { text: "รวมค่าใช้จ่าย", style: ["header", "margintotal"] },
      {
        text: Utils.formatNumber(totalExpenseAmount),
        alignment: "right",
        style: ["header", "textdecoration"],
      },
      { text: "", bold: true },
    ],
    [
      { text: "กำไร (ขาดทุน) สุทธิ", style: "header", margin: [0, 0, 0, 0] },
      {
        text: Utils.formatNumber(profitAndLossAmount),
        alignment: "right",
        style: ["header", "textdecoration"],
      },
      { text: "", bold: true },
    ]
  );

  return body;
}

function formatCurrency(value) {
  return value.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}
</script>
