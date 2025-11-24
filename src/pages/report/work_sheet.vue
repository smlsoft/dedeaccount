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
                <i class="pi pi-table text-blue-600 text-2xl"></i>
              </div>
              <div>
                <h2 class="text-2xl font-semibold text-900 m-0">กระดาษทำการ</h2>
                <p  v-if="!isvisible" class="text-600 m-0 mt-1" >รายงานกระดาษทำการทางบัญชี</p>
                <p v-if="isvisible" class="text-600 m-0 mt-1">
                  ณ วันที่
                  {{ headDataReportWorkSheet.endDateShow }}
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <Button
                v-if="isvisible"
                label="Excel"
                icon="pi pi-file-excel"
                class="p-button-success"
                @click="exportToExcel()"
                :loading="exportingExcel"
                aria-label="ส่งออก Excel"
              />
              <Button
                v-if="isvisible"
                label="PDF"
                icon="pi pi-file-pdf"
                class="p-button-danger"
                @click="exportToPDF()"
                :loading="exportingPDF"
                aria-label="ส่งออก PDF"
              />
              <Button
                label="ค้นหา"
                icon="pi pi-search"
                @click="openSearchDialog()"
                aria-label="เปิดหน้าต่างค้นหา"
              />
            </div>
          </div>
        </div>

        <!-- Report Content Section -->
        <div v-if="isvisible">
          <WorkSheet
            :dataReport="dataReport"
            :headDataReport="headDataReportWorkSheet"
            :loading="loadingWorkSheet"
          ></WorkSheet>
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

      <!-- Search Dialog -->
      <Dialog
        v-model:visible="showSearch"
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
            <!-- <div class="col-12 md:col-6">
              <div class="p-float-label w-full">
                <Calendar
                  v-model="startDate"
                  :showIcon="true"
                  dateFormat="dd/mm/yy"
                  class="w-full"
                  inputId="startDateCalendar"
                  :input-style="{ height: '54px' }"
                  aria-label="เลือกวันที่เริ่มต้น"
                />
                <label for="startDateCalendar">{{ $t("sincetime") }}</label>
              </div>
            </div> -->

            <div class="col-12 md:col-12">
              <div class="p-float-label w-full">
                <Calendar
                  v-model="endDate"
                  :showIcon="true"
                  dateFormat="dd/mm/yy"
                  class="w-full"
                  inputId="endDateCalendar"
                  :input-style="{ height: '54px' }"
                  aria-label="เลือกวันที่สิ้นสุด"
                />
                <label for="endDateCalendar">ณ วันที่</label>
              </div>
            </div>

            <div class="col-12 mt-3">
              <div class="field-checkbox mb-0">
                <Checkbox 
                  id="icaDialog" 
                  :binary="true" 
                  v-model="ica"
                  aria-label="รวมรายการปิดงบ"
                />
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
          <div class="pt-3 flex gap-2">
            <Button
              @click="showSearch = false"
              label="ยกเลิก"
              severity="secondary"
              text
              class="flex-grow-1"
            />
            <Button
              @click="searchAndCloseDialog()"
              label="ค้นหา"
              class="flex-grow-1"
              :disabled="!endDate"
            />
          </div>
        </template>
      </Dialog>
    </MainContentWarp>
  </AppLayout>
</template>

<script setup>
/* eslint-disable */
import ReportService from "@/services/ReportDataService";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import { ref, onMounted } from "vue";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import { useToast } from "primevue/usetoast";
import WorkSheet from "./components/tableWorkSheet.vue";
import XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";

// ตั้งค่าฟอนต์ไทย Sarabun สำหรับ PDF
pdfMake.fonts = {
  Sarabun: {
    normal: "https://fonts.gstatic.com/s/sarabun/v12/DtVjJx26TKEr37c9WBJDnlQN9gk.ttf",
    bold: "https://fonts.gstatic.com/s/sarabun/v12/DtVmJx26TKEr37c9YK5sulwm6gDXvwE.ttf",
    italics: "https://fonts.gstatic.com/s/sarabun/v12/DtVhJx26TKEr37c9aBBJmnYI5gnOpg.ttf",
    bolditalics: "https://fonts.gstatic.com/s/sarabun/v12/DtVkJx26TKEr37c9aBBxJlks7iLSrwFUlw.ttf"
  }
};

const storeApp = useApp();
const isvisible = ref(false);
const toast = useToast();
const startDate = ref();
const endDate = ref();
const startDateShow = ref();
const endDateShow = ref();
const shopName = ref("");
const dataReport = ref([]);
const headDataReportWorkSheet = ref({});
const ica = ref(false);
const loadingWorkSheet = ref(false);
const showSearch = ref(false);
const exportingExcel = ref(false);
const exportingPDF = ref(false);

onMounted(async () => {
  getDate();
  showSearch.value = true;
  storeApp.setPageTitle("กระดาษทำการ");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("work_sheet");
});

// ฟังก์ชันเปิด dialog ค้นหา
const openSearchDialog = () => {
  showSearch.value = true;
};

// ฟังก์ชันค้นหาและปิด dialog
const searchAndCloseDialog = async () => {
  if (!endDate.value) {
    toast.add({
      severity: "warn",
      summary: "คำเตือน",
      detail: "กรุณาเลือกวันที่",
      life: 3000,
    });
    return;
  }

  showSearch.value = false;
  await exportReport();
};


async function exportReport() {
  isvisible.value = true;
  shopName.value = localStorage.shop_name;
  startDateShow.value = Utils.getYearBuddhist(startDate.value);
  endDateShow.value = Utils.getYearBuddhist(endDate.value);
  await getDataReport();
}

async function getDataReport() {
  loadingWorkSheet.value = true;

  // ใช้วันที่เริ่มต้นตั้งแต่ 2000-01-01 เพื่อดึงข้อมูลทั้งหมดตั้งแต่เริ่มต้น
  let startdate = "2000-01-01";
  let enddate = Utils.getDateFromYear(endDate.value);

  let icax = ica.value ? "1" : "0";
  
  try {
    const res = await ReportService.getTrialBalanceSheet(
      null,
      startdate,
      enddate,
      icax
    );
    
    if (res.success) {
      headDataReportWorkSheet.value = {
        shopName: shopName.value,
        startDateShow: Utils.getDateShowText(startDateShow.value),
        endDateShow: Utils.getDateShowText(endDateShow.value),
      };
      
      dataReport.value = res.data;
      loadingWorkSheet.value = false;
      
      toast.add({
        severity: "success",
        summary: "สำเร็จ",
        detail: "ดึงข้อมูลรายงานสำเร็จ",
        life: 3000,
      });
    } else {
      throw new Error(res.message || "ไม่สามารถดึงข้อมูลได้");
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    loadingWorkSheet.value = false;
    isvisible.value = false;
    
    toast.add({
      severity: "error",
      summary: "เกิดข้อผิดพลาด",
      detail: err.message || "ไม่สามารถดึงข้อมูลรายงานได้ กรุณาลองใหม่อีกครั้ง",
      life: 5000,
    });
  }
}

function getDate() {
  const date = new Date();
  startDate.value = new Date(date.getFullYear(), date.getMonth(), 1);
  endDate.value = new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// ==================== Export Functions ====================

function formatCurrency(value) {
  if (!value && value !== 0) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function exportToExcel() {
  if (!dataReport.value?.accountdetails || dataReport.value.accountdetails.length === 0) {
    toast.add({
      severity: "warn",
      summary: "ไม่มีข้อมูล",
      detail: "ไม่มีข้อมูลสำหรับส่งออก",
      life: 3000,
    });
    return;
  }

  const totalRows = dataReport.value.accountdetails.length;
  
  if (totalRows > 5000) {
    toast.add({
      severity: "warn",
      summary: "ข้อมูลจำนวนมาก",
      detail: `มีข้อมูล ${totalRows.toLocaleString()} รายการ อาจใช้เวลาสักครู่`,
      life: 5000,
    });
  }

  try {
    exportingExcel.value = true;

    const excelData = [];
    
    // Header กระทัดรัด 1 บรรทัด
    excelData.push([`${shopName.value || "ชื่อร้าน"} | กระดาษทำการ | ณ ${Utils.getDateShowText(endDateShow.value)}`]);
    excelData.push([""]); // บรรทัดว่าง

    // Header ตาราง - 2 ระดับ (ใช้ merge cells ใน Excel)
    excelData.push([
      "ชื่อบัญชี",
      "ยอดสะสม", "",
      "งบกำไรขาดทุน", "",
      "งบแสดงฐานะทางการเงิน", ""
    ]);
    excelData.push([
      "", // ชื่อบัญชี (merged)
      "เดบิต", "เครดิต", // ยอดสะสม
      "เดบิต", "เครดิต", // งบกำไรขาดทุน
      "เดบิต", "เครดิต"  // งบแสดงฐานะทางการเงิน
    ]);

    // คำนวณค่าต่างๆ
    const calculateProfitLossDebit = () => {
      return dataReport.value.accountdetails
        .filter(item => item.accountcategory == 4 || item.accountcategory == 5)
        .reduce((sum, item) => sum + (parseFloat(item.nextbalancedebitamount) || 0), 0);
    };

    const calculateProfitLossCredit = () => {
      return dataReport.value.accountdetails
        .filter(item => item.accountcategory == 4 || item.accountcategory == 5)
        .reduce((sum, item) => sum + (parseFloat(item.nextbalancecreditamount) || 0), 0);
    };

    const calculateBalanceSheetDebit = () => {
      return dataReport.value.accountdetails
        .filter(item => item.accountcategory == 1 || item.accountcategory == 2 || item.accountcategory == 3)
        .reduce((sum, item) => sum + (parseFloat(item.nextbalancedebitamount) || 0), 0);
    };

    const calculateBalanceSheetCredit = () => {
      return dataReport.value.accountdetails
        .filter(item => item.accountcategory == 1 || item.accountcategory == 2 || item.accountcategory == 3)
        .reduce((sum, item) => sum + (parseFloat(item.nextbalancecreditamount) || 0), 0);
    };

    const calculateProfitLoss = () => {
      return calculateProfitLossDebit() - calculateProfitLossCredit();
    };

    const profitLoss = calculateProfitLoss();
    const profitLossDebit = profitLoss > 0 ? Math.abs(profitLoss) : 0;
    const profitLossCredit = profitLoss < 0 ? Math.abs(profitLoss) : 0;

    // รายละเอียดแต่ละบัญชี (optimized loop)
    for (let i = 0; i < dataReport.value.accountdetails.length; i++) {
      const item = dataReport.value.accountdetails[i];
      const isProfitLoss = item.accountcategory == 4 || item.accountcategory == 5;
      const isBalanceSheet = item.accountcategory == 1 || item.accountcategory == 2 || item.accountcategory == 3;

      // แปลงค่าให้เป็นตัวเลข และบังคับให้เป็น 0 ถ้าไม่มีค่า
      const debitAmount = parseFloat(item.nextbalancedebitamount) || 0;
      const creditAmount = parseFloat(item.nextbalancecreditamount) || 0;

      excelData.push([
        `${item.accountcode}~${item.accountname}`,
        debitAmount,  // ยอดสะสม เดบิต - แสดง 0 เสมอ
        creditAmount, // ยอดสะสม เครดิต - แสดง 0 เสมอ
        isProfitLoss ? debitAmount : 0,   // งบกำไร เดบิต - แสดง 0 ถ้าไม่ใช่
        isProfitLoss ? creditAmount : 0,  // งบกำไร เครดิต - แสดง 0 ถ้าไม่ใช่
        isBalanceSheet ? debitAmount : 0, // งบฐานะ เดบิต - แสดง 0 ถ้าไม่ใช่
        isBalanceSheet ? creditAmount : 0 // งบฐานะ เครดิต - แสดง 0 ถ้าไม่ใช่
      ]);
    }

    // แถวรวม
    excelData.push([
      "รวม",
      parseFloat(dataReport.value.totalnextbalancedebit) || 0,
      parseFloat(dataReport.value.totalnextbalancecredit) || 0,
      calculateProfitLossDebit(),
      calculateProfitLossCredit(),
      calculateBalanceSheetDebit(),
      calculateBalanceSheetCredit()
    ]);

    // แถวกำไรขาดทุน
    excelData.push([
      "กำไรขาดทุน",
      "", "",
      profitLossCredit,
      profitLossDebit,
      profitLossDebit,
      profitLossCredit
    ]);

    // แถวผลรวม
    excelData.push([
      "ผลรวม",
      "", "",
      calculateProfitLossDebit() + profitLossCredit,
      calculateProfitLossCredit() + profitLossDebit,
      calculateBalanceSheetDebit() + profitLossDebit,
      calculateBalanceSheetCredit() + profitLossCredit
    ]);

    // สร้าง workbook
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // ตั้งค่า Number Format สำหรับทุก cell ที่เป็นตัวเลข (แสดง 0)
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        
        // ถ้าเป็นตัวเลข (คอลัมน์ B-G และไม่ใช่ header)
        if (C >= 1 && R >= 4) {
          const cellValue = ws[cellAddress].v;
          if (typeof cellValue === 'number') {
            ws[cellAddress].z = '0.00'; // Number format แสดงทศนิยม 2 ตำแหน่ง
            ws[cellAddress].t = 'n'; // Type = number
          }
        }
      }
    }
    
    // ตั้งค่าความกว้างคอลัมน์ (กระทัดรัด)
    ws['!cols'] = [
      { wch: 32 },  // ชื่อบัญชี
      { wch: 13 },  // ยอดสะสม เดบิต
      { wch: 13 },  // ยอดสะสม เครดิต
      { wch: 13 },  // งบกำไร เดบิต
      { wch: 13 },  // งบกำไร เครดิต
      { wch: 13 },  // งบฐานะ เดบิต
      { wch: 13 }   // งบฐานะ เครดิต
    ];

    // Merge cells สำหรับ header 2 ระดับ
    // Excel row index: 0=header, 1=blank, 2=ชื่อบัญชี/ยอดสะสม/งบกำไร/งบฐานะ, 3=เดบิต/เครดิต
    ws['!merges'] = [
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } }, // ชื่อบัญชี (merge 2 แถว)
      { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } }, // ยอดสะสม
      { s: { r: 2, c: 3 }, e: { r: 2, c: 4 } }, // งบกำไรขาดทุน
      { s: { r: 2, c: 5 }, e: { r: 2, c: 6 } }  // งบแสดงฐานะทางการเงิน
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "กระดาษทำการ");
    
    const filename = `กระดาษทำการ_${Utils.getDateShowText(endDateShow.value)}.xlsx`;
    XLSX.writeFile(wb, filename);

    toast.add({
      severity: "success",
      summary: "สำเร็จ",
      detail: `ส่งออก Excel สำเร็จ (${totalRows.toLocaleString()} รายการ)`,
      life: 3000,
    });
  } catch (error) {
    console.error("Export Excel Error:", error);
    toast.add({
      severity: "error",
      summary: "เกิดข้อผิดพลาด",
      detail: "ไม่สามารถส่งออก Excel ได้",
      life: 3000,
    });
  } finally {
    exportingExcel.value = false;
  }
}

function exportToPDF() {
  if (!dataReport.value?.accountdetails || dataReport.value.accountdetails.length === 0) {
    toast.add({
      severity: "warn",
      summary: "ไม่มีข้อมูล",
      detail: "ไม่มีข้อมูลสำหรับส่งออก",
      life: 3000,
    });
    return;
  }

  const totalRows = dataReport.value.accountdetails.length;
  
  if (totalRows > 10000) {
    toast.add({
      severity: "error",
      summary: "ข้อมูลมากเกินไป",
      detail: `มีข้อมูล ${totalRows.toLocaleString()} รายการ แนะนำให้ใช้ Excel แทน หรือกรองข้อมูลให้น้อยลง`,
      life: 8000,
    });
    return;
  } else if (totalRows > 3000) {
    toast.add({
      severity: "warn",
      summary: "ข้อมูลจำนวนมาก",
      detail: `มีข้อมูล ${totalRows.toLocaleString()} รายการ PDF อาจใช้เวลานาน`,
      life: 5000,
    });
  }

  try {
    exportingPDF.value = true;

    // คำนวณค่าต่างๆ
    const calculateProfitLossDebit = () => {
      return dataReport.value.accountdetails
        .filter(item => item.accountcategory == 4 || item.accountcategory == 5)
        .reduce((sum, item) => sum + (parseFloat(item.nextbalancedebitamount) || 0), 0);
    };

    const calculateProfitLossCredit = () => {
      return dataReport.value.accountdetails
        .filter(item => item.accountcategory == 4 || item.accountcategory == 5)
        .reduce((sum, item) => sum + (parseFloat(item.nextbalancecreditamount) || 0), 0);
    };

    const calculateBalanceSheetDebit = () => {
      return dataReport.value.accountdetails
        .filter(item => item.accountcategory == 1 || item.accountcategory == 2 || item.accountcategory == 3)
        .reduce((sum, item) => sum + (parseFloat(item.nextbalancedebitamount) || 0), 0);
    };

    const calculateBalanceSheetCredit = () => {
      return dataReport.value.accountdetails
        .filter(item => item.accountcategory == 1 || item.accountcategory == 2 || item.accountcategory == 3)
        .reduce((sum, item) => sum + (parseFloat(item.nextbalancecreditamount) || 0), 0);
    };

    const profitLoss = calculateProfitLossDebit() - calculateProfitLossCredit();
    const profitLossDebit = profitLoss > 0 ? Math.abs(profitLoss) : 0;
    const profitLossCredit = profitLoss < 0 ? Math.abs(profitLoss) : 0;

    // สร้างตารางข้อมูล
    const tableBody = [];

    // Header 2 ระดับ
    // ระดับ 1: หัวข้อหลัก
    tableBody.push([
      { text: "ชื่อบัญชี", fontSize: 7, bold: true, alignment: "center", rowSpan: 2, fillColor: null },
      { text: "ยอดสะสม", fontSize: 7, bold: true, alignment: "center", colSpan: 2 },
      {},
      { text: "งบกำไรขาดทุน", fontSize: 7, bold: true, alignment: "center", colSpan: 2 },
      {},
      { text: "งบแสดงฐานะทางการเงิน", fontSize: 7, bold: true, alignment: "center", colSpan: 2 },
      {}
    ]);
    
    // ระดับ 2: เดบิต/เครดิต
    tableBody.push([
      {},
      { text: "เดบิต", fontSize: 7, bold: true, alignment: "center" },
      { text: "เครดิต", fontSize: 7, bold: true, alignment: "center" },
      { text: "เดบิต", fontSize: 7, bold: true, alignment: "center" },
      { text: "เครดิต", fontSize: 7, bold: true, alignment: "center" },
      { text: "เดบิต", fontSize: 7, bold: true, alignment: "center" },
      { text: "เครดิต", fontSize: 7, bold: true, alignment: "center" }
    ]);

    // รายละเอียดแต่ละบัญชี (batch processing)
    for (let i = 0; i < dataReport.value.accountdetails.length; i++) {
      const item = dataReport.value.accountdetails[i];
      const isProfitLoss = item.accountcategory == 4 || item.accountcategory == 5;
      const isBalanceSheet = item.accountcategory == 1 || item.accountcategory == 2 || item.accountcategory == 3;

      tableBody.push([
        { text: `${item.accountcode}~${item.accountname}`, fontSize: 6 },
        { text: formatCurrency(item.nextbalancedebitamount), alignment: "right", fontSize: 6 },
        { text: formatCurrency(item.nextbalancecreditamount), alignment: "right", fontSize: 6 },
        { text: isProfitLoss ? formatCurrency(item.nextbalancedebitamount) : "0.00", alignment: "right", fontSize: 6 },
        { text: isProfitLoss ? formatCurrency(item.nextbalancecreditamount) : "0.00", alignment: "right", fontSize: 6 },
        { text: isBalanceSheet ? formatCurrency(item.nextbalancedebitamount) : "0.00", alignment: "right", fontSize: 6 },
        { text: isBalanceSheet ? formatCurrency(item.nextbalancecreditamount) : "0.00", alignment: "right", fontSize: 6 }
      ]);
    }

    // แถวรวม
    tableBody.push([
      { text: "รวม", fontSize: 7, bold: true },
      { text: formatCurrency(dataReport.value.totalnextbalancedebit), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(dataReport.value.totalnextbalancecredit), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(calculateProfitLossDebit()), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(calculateProfitLossCredit()), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(calculateBalanceSheetDebit()), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(calculateBalanceSheetCredit()), alignment: "right", fontSize: 7, bold: true }
    ]);

    // แถวกำไรขาดทุน
    tableBody.push([
      { text: "กำไรขาดทุน", fontSize: 7, bold: true },
      { text: "", fontSize: 7 },
      { text: "", fontSize: 7 },
      { text: formatCurrency(profitLossCredit), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(profitLossDebit), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(profitLossDebit), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(profitLossCredit), alignment: "right", fontSize: 7, bold: true }
    ]);

    // แถวผลรวม
    tableBody.push([
      { text: "ผลรวม", fontSize: 7, bold: true },
      { text: "", fontSize: 7 },
      { text: "", fontSize: 7 },
      { text: formatCurrency(calculateProfitLossDebit() + profitLossCredit), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(calculateProfitLossCredit() + profitLossDebit), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(calculateBalanceSheetDebit() + profitLossDebit), alignment: "right", fontSize: 7, bold: true },
      { text: formatCurrency(calculateBalanceSheetCredit() + profitLossCredit), alignment: "right", fontSize: 7, bold: true }
    ]);

    // สร้าง PDF (แนวนอน ขาวดำ)
    const docDefinition = {
      pageSize: "A4",
      pageOrientation: "landscape", // แนวนอน
      pageMargins: [10, 12, 10, 12], // ลด margin
      content: [
        {
          text: `${shopName.value || "ชื่อร้าน"} | กระดาษทำการ | ณ ${Utils.getDateShowText(endDateShow.value)}`,
          fontSize: 8,
          alignment: "center",
          margin: [0, 0, 0, 6]
        },
        {
          table: {
            headerRows: 2,
            widths: ["28%", "12%", "12%", "12%", "12%", "12%", "12%"],
            body: tableBody
          },
          layout: {
            hLineWidth: function (i, node) {
              if (i === 0 || i === 1 || i === 2) return 0.5;
              if (i === node.table.body.length - 3 || i === node.table.body.length - 2 || i === node.table.body.length - 1 || i === node.table.body.length) return 0.5;
              return 0.25;
            },
            vLineWidth: function () {
              return 0.25;
            },
            hLineColor: function () {
              return "#000000";
            },
            vLineColor: function () {
              return "#000000";
            },
            fillColor: function () { return null; }, // ไม่มีสีพื้นหลัง
            paddingLeft: function () { return 2; },
            paddingRight: function () { return 2; },
            paddingTop: function (i) { 
              // เพิ่ม padding บนสำหรับ "ชื่อบัญชี" ใน header row แรก
              return (i === 0) ? 4 : 1; 
            },
            paddingBottom: function () { return 1; }
          }
        }
      ],
      defaultStyle: {
        font: "Sarabun",
        fontSize: 6
      }
    };

    const filename = `กระดาษทำการ_${Utils.getDateShowText(endDateShow.value)}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);

    toast.add({
      severity: "success",
      summary: "สำเร็จ",
      detail: `ส่งออก PDF สำเร็จ (${totalRows.toLocaleString()} รายการ)`,
      life: 3000,
    });
  } catch (error) {
    console.error("Export PDF Error:", error);
    toast.add({
      severity: "error",
      summary: "เกิดข้อผิดพลาด",
      detail: "ไม่สามารถส่งออก PDF ได้: " + error.message,
      life: 3000,
    });
  } finally {
    exportingPDF.value = false;
  }
}
</script>

<style scoped>
.p-galleria-thumbnails-top {
  width: 100% !important;
}

iframe {
  display: block; /* iframes are inline by default */
  background: #000;
  border: none; /* Reset default border */
  height: 100%; /* Viewport-relative units */
  width: 100%;
}
</style>
