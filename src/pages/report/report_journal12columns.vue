<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-card p-4 shadow-2 border-round">
        <div class="mb-3 flex align-items-center justify-content-between">
          <span class="text-xl font-medium text-900"
            >รายงานการเงิน / งบกำไรขาดทุน 12 เดือน
          </span>
          <div class="flex gap-2">
            <Button
              label="PDF"
              icon="pi pi-file-pdf"
              severity="danger"
              @click="generatePDF"
              :loading="isPdfLoading"
              :disabled="isPdfLoading || loading"
            />
            <Button
              label="ค้นหา"
              icon="pi pi-search"
              @click="openSearchDialog"
              :disabled="isPdfLoading"
            />
          </div>
        </div>

        <!-- Report Section -->
        <div class="report-container" ref="reportRef">
          <!-- Report Header -->
          <div class="mb-4">
            <!-- ส่วนหัวตรงกลาง -->
            <div
              class="flex justify-content-center align-items-center flex-column"
            >
              <h2 class="font-bold text-xl mb-0">งบกำไรขาดทุน 12 เดือน</h2>
              <p class="mb-2">
               สำหรับระยะเวลา 12 เดือน สิ้นสุด ณ วันที่
                {{ formatDateThai(searchParams.todate) }}
              </p>
            </div>

            <!-- ส่วนข้อมูลบรรทัดที่ 1 -->
            <div class="flex justify-content-between align-items-center mb-2">
              <div>
                <span class="font-bold">ชื่อสถานประกอบการ:</span>
                {{ shopName }}
              </div>
              <div>
                <span class="font-bold">เลขประจำตัวผู้เสียภาษี:</span>
                {{ shopTaxId }}
              </div>
            </div>

            <!-- ส่วนข้อมูลบรรทัดที่ 2 -->
            <div class="flex justify-content-between align-items-center mb-2">
              <div>
                <span class="font-bold">ที่อยู่:</span> {{ shopAddress }}
              </div>
              <div><span class="font-bold">สาขา:</span> (สำนักงานใหญ่)</div>
            </div>
          </div>

          <div class="report-table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th class="text-left" style="min-width: 200px;">รายการ</th>
                  <th class="text-center" style="min-width: 90px;">รหัสบัญชี</th>
                  <th 
                    v-for="month in reportData.monthRange" 
                    :key="month.key"
                    class="text-center month-header"
                  >
                    {{ month.displayName }}
                  </th>
                  <th class="text-center" style="min-width: 100px;">รวม</th>
                </tr>
              </thead>
              <tbody>
                <!-- รายได้ -->
                <tr class="section-header">
                  <td colspan="15" class="text-left font-bold">รายได้</td>
                </tr>
                <tr 
                  v-for="item in reportData.revenue.items" 
                  :key="item.accountcode"
                >
                  <td class="text-left pl-4">{{ item.accountname }}</td>
                  <td class="text-center">{{ item.accountcode }}</td>
                  <td 
                    v-for="month in reportData.monthRange" 
                    :key="month.key"
                    :class="['text-right', { 'negative-value': isNegative(item[month.key]) }]"
                  >
                    {{ formatCurrency(item[month.key] || 0) }}
                  </td>
                  <td :class="['text-right font-bold', { 'negative-value': isNegative(item.total_amount) }]">
                    {{ formatCurrency(item.total_amount) }}
                  </td>
                </tr>
                <tr class="subtotal-row">
                  <td colspan="2" class="text-right font-bold">รวมรายได้</td>
                  <td 
                    v-for="month in reportData.monthRange" 
                    :key="month.key"
                    :class="['text-right font-bold', { 'negative-value': isNegative(reportData.revenue.summary.monthTotals[month.key]) }]"
                  >
                    {{ formatCurrency(reportData.revenue.summary.monthTotals[month.key] || 0) }}
                  </td>
                  <td :class="['text-right font-bold', { 'negative-value': isNegative(reportData.revenue.summary.grandTotal) }]">
                    {{ formatCurrency(reportData.revenue.summary.grandTotal) }}
                  </td>
                </tr>

                <!-- ต้นทุนขาย -->
                <tr class="section-header">
                  <td colspan="15" class="text-left font-bold">ต้นทุนขาย</td>
                </tr>
                <tr 
                  v-for="item in reportData.costOfSales.items" 
                  :key="item.accountcode"
                >
                  <td class="text-left pl-4">{{ item.accountname }}</td>
                  <td class="text-center">{{ item.accountcode }}</td>
                  <td 
                    v-for="month in reportData.monthRange" 
                    :key="month.key"
                    :class="['text-right', { 'negative-value': isNegative(item[month.key]) }]"
                  >
                    {{ formatCurrency(item[month.key] || 0) }}
                  </td>
                  <td :class="['text-right font-bold', { 'negative-value': isNegative(item.total_amount) }]">
                    {{ formatCurrency(item.total_amount) }}
                  </td>
                </tr>
                <tr class="subtotal-row">
                  <td colspan="2" class="text-right font-bold">รวมต้นทุนขาย</td>
                  <td 
                    v-for="month in reportData.monthRange" 
                    :key="month.key"
                    :class="['text-right font-bold', { 'negative-value': isNegative(reportData.costOfSales.summary.monthTotals[month.key]) }]"
                  >
                    {{ formatCurrency(reportData.costOfSales.summary.monthTotals[month.key] || 0) }}
                  </td>
                  <td :class="['text-right font-bold', { 'negative-value': isNegative(reportData.costOfSales.summary.grandTotal) }]">
                    {{ formatCurrency(reportData.costOfSales.summary.grandTotal) }}
                  </td>
                </tr>

                <!-- กำไรขั้นต้น -->
                <tr class="total-row">
                  <td colspan="2" class="text-right font-bold">กำไรขั้นต้น</td>
                  <td 
                    v-for="month in reportData.monthRange" 
                    :key="month.key"
                    :class="['text-right font-bold', { 'negative-value': isNegative(reportData.grossProfit.monthTotals[month.key]) }]"
                  >
                    {{ formatCurrency(reportData.grossProfit.monthTotals[month.key] || 0) }}
                  </td>
                  <td :class="['text-right font-bold', { 'negative-value': isNegative(reportData.grossProfit.grandTotal) }]">
                    {{ formatCurrency(reportData.grossProfit.grandTotal) }}
                  </td>
                </tr>

                <!-- ค่าใช้จ่าย -->
                <tr class="section-header">
                  <td colspan="15" class="text-left font-bold">ค่าใช้จ่าย</td>
                </tr>
                <tr 
                  v-for="item in reportData.expense.items" 
                  :key="item.accountcode"
                >
                  <td class="text-left pl-4">{{ item.accountname }}</td>
                  <td class="text-center">{{ item.accountcode }}</td>
                  <td 
                    v-for="month in reportData.monthRange" 
                    :key="month.key"
                    :class="['text-right', { 'negative-value': isNegative(item[month.key]) }]"
                  >
                    {{ formatCurrency(item[month.key] || 0) }}
                  </td>
                  <td :class="['text-right font-bold', { 'negative-value': isNegative(item.total_amount) }]">
                    {{ formatCurrency(item.total_amount) }}
                  </td>
                </tr>
                <tr class="subtotal-row">
                  <td colspan="2" class="text-right font-bold">รวมค่าใช้จ่าย</td>
                  <td 
                    v-for="month in reportData.monthRange" 
                    :key="month.key"
                    :class="['text-right font-bold', { 'negative-value': isNegative(reportData.expense.summary.monthTotals[month.key]) }]"
                  >
                    {{ formatCurrency(reportData.expense.summary.monthTotals[month.key] || 0) }}
                  </td>
                  <td :class="['text-right font-bold', { 'negative-value': isNegative(reportData.expense.summary.grandTotal) }]">
                    {{ formatCurrency(reportData.expense.summary.grandTotal) }}
                  </td>
                </tr>

                <!-- กำไรสุทธิ -->
                <tr class="total-row net-profit">
                  <td colspan="2" class="text-right font-bold">กำไร(ขาดทุน)สุทธิ</td>
                  <td 
                    v-for="month in reportData.monthRange" 
                    :key="month.key"
                    :class="['text-right font-bold', { 'negative-value': isNegative(reportData.netProfit.monthTotals[month.key]) }]"
                  >
                    {{ formatCurrency(reportData.netProfit.monthTotals[month.key] || 0) }}
                  </td>
                  <td :class="['text-right font-bold', { 'negative-value': isNegative(reportData.netProfit.grandTotal) }]">
                    {{ formatCurrency(reportData.netProfit.grandTotal) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
    :style="{ width: '52vw' }"
    :draggable="false"
    :resizable="false"
  >
    <template #header>
      <div class="flex flex-column gap-2">
        <h1 class="m-0 text-900 font-semibold text-xl line-height-3">
          เงื่อนไขการค้นหารายงาน
        </h1>
        <span class="text-600 text-base"
          >กรุณาเลือกช่วงวันที่ที่ต้องการเรียกรายงาน</span
        >
      </div>
    </template>
    <section class="flex flex-column w-full mt-4">
      <div class="grid">
        <div class="col-12">
          <div class="p-float-label w-full">
            <Calendar
              v-model="searchParams.todate"
              :showIcon="true"
              dateFormat="dd/mm/yy"
              class="w-full"
              inputId="toDateCalendar"
              :input-style="{ height: '54px' }"
            />
            <label for="toDateCalendar">ณ วันที่</label>
          </div>
        </div>
      </div>
    </section>
    <template #footer>
      <div class="pt-3 flex">
        <Button
          @click="searchDialogVisible = false"
          label="ยกเลิก"
          class="p-button-text flex-grow-1"
        ></Button>
        <Button
          @click="searchAndCloseDialog"
          label="ค้นหา"
          class="flex-grow-1"
        ></Button>
      </div>
    </template>
  </Dialog>

  <!-- PDF Status Dialog -->
  <Dialog
    v-model:visible="pdfStatusVisible"
    :modal="true"
    :closable="false"
    :showHeader="false"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '30vw' }"
  >
    <section class="flex flex-column align-items-center w-full py-4">
      <ProgressSpinner
        style="width: 50px; height: 50px"
        strokeWidth="5"
        animationDuration=".5s"
        class="mb-3"
      />
      <p class="font-semibold text-xl mt-3 mb-2 text-900 text-center">
        กำลังสร้างไฟล์ PDF
      </p>
      <p class="font-normal text-base mt-0 mb-3 text-600 text-center">
        โปรดรอสักครู่กำลังประมวลผลข้อมูล...
      </p>
      <p class="text-sm text-500 mt-3 text-center">
        หน้าต่างจะปิดอัตโนมัติเมื่อดาวน์โหลดเสร็จสิ้น
      </p>
    </section>
  </Dialog>

</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import ShopService from "@/services/ShopService.js";
import ReportJournal12columnService from "@/services/ReportJorunal12column.js";

const storeApp = useApp();
const shopId = localStorage.shopid;

// ข้อมูลกิจการ
const shopData = ref({
  names: [{ code: "th", name: "" }],
  address: [{ code: "th", name: "" }],
  settings: { taxid: "" },
});

// ตัวแปรเก็บข้อมูลกิจการในรูปแบบที่ง่ายต่อการใช้งาน
const shopName = computed(
  () => shopData.value.names?.[0]?.name || localStorage.shop_name || ""
);
const shopAddress = computed(() => shopData.value.address?.[0]?.name || "");
const shopTaxId = computed(() => shopData.value.settings?.taxid || "");

const toast = useToast();
const reportRef = ref(null);
const loading = ref(false);
const isPdfLoading = ref(false);
const pdfStatusVisible = ref(false);

// Search dialog
const searchDialogVisible = ref(false);

// ข้อมูลรายงาน
const reportData = ref({
  monthRange: [],
  revenue: { items: [], summary: { monthTotals: {}, grandTotal: 0 } },
  costOfSales: { items: [], summary: { monthTotals: {}, grandTotal: 0 } },
  grossProfit: { monthTotals: {}, grandTotal: 0 },
  expense: { items: [], summary: { monthTotals: {}, grandTotal: 0 } },
  netProfit: { monthTotals: {}, grandTotal: 0 }
});

// กำหนดวันเริ่มต้นเป็นวันแรกของเดือนปัจจุบัน และตั้งเวลาเป็น 00:00:00
const firstDayOfMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1
);
firstDayOfMonth.setHours(0, 0, 0, 0);

// กำหนดวันสิ้นสุดเป็นวันสุดท้ายของเดือนปัจจุบัน และตั้งเวลาเป็น 23:59:59
const lastDayOfMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  0
);
lastDayOfMonth.setHours(23, 59, 59, 999);

// พารามิเตอร์สำหรับการค้นหา
const searchParams = reactive({
  todate: lastDayOfMonth, // วันสุดท้ายของเดือนปัจจุบัน เวลา 23:59:59
  shopid: localStorage.shopid,
  shopname: localStorage.shop_name,
});

// ตั้งค่าเวลาของวันที่สิ้นสุดเป็น 23:59:59
const setToDateTime = () => {
  if (searchParams.todate) {
    const toDate = new Date(searchParams.todate);
    toDate.setHours(23, 59, 59, 999);
    searchParams.todate = toDate;
  }
};

// ฟังก์ชันเปิด dialog ค้นหา
const openSearchDialog = () => {
  searchDialogVisible.value = true;
};

// ฟังก์ชันค้นหาและปิด dialog
const searchAndCloseDialog = () => {
  // ตั้งค่าเวลาก่อนที่จะส่งคำขอ
  setToDateTime();
  fetchData();
  searchDialogVisible.value = false;
};

// ฟังก์ชันสร้าง PDF
const generatePDF = async () => {
  isPdfLoading.value = true;
  pdfStatusVisible.value = true;

  try {
    // ตั้งค่าเวลาก่อนที่จะส่งคำขอ
    setToDateTime();

    const params = {
      endDate: formatDateTimeForAPI(searchParams.todate),
      shopid: searchParams.shopid,
      shopname: searchParams.shopname,
      taxid: shopTaxId.value,
      address: shopAddress.value,
    };

    console.log("Generating PDF with params:", params);

    const result = await ReportJournal12columnService.generateJournal12columnsPDF(params);

    if (result.success) {
      const { jobId, fileName } = result.data;

      toast.add({
        severity: "info",
        summary: "กำลังสร้างไฟล์ PDF",
        detail: "โปรดรอสักครู่ กำลังประมวลผลข้อมูล",
        life: 3000,
      });

      try {
        // รอการสร้าง PDF เสร็จ แล้วดาวน์โหลด
        await ReportJournal12columnService.waitForPDFAndDownload(jobId, fileName);

        toast.add({
          severity: "success",
          summary: "สำเร็จ",
          detail: "ดาวน์โหลดไฟล์ PDF เรียบร้อยแล้ว",
          life: 3000,
        });
      } catch (waitError) {
        console.error("Error waiting for PDF:", waitError);

        // ตรวจสอบข้อความผิดพลาด
        if (waitError.message.includes("ไม่พบไฟล์ PDF")) {
          toast.add({
            severity: "error",
            summary: "ไม่พบไฟล์ PDF",
            detail: "ระบบไม่พบไฟล์ที่ต้องการดาวน์โหลด กรุณาลองอีกครั้ง",
            life: 5000,
          });
        } else {
          toast.add({
            severity: "error",
            summary: "ผิดพลาด",
            detail: waitError.message || "ไม่สามารถดาวน์โหลดไฟล์ PDF ได้",
            life: 3000,
          });
        }
      }
    } else {
      toast.add({
        severity: "error",
        summary: "ผิดพลาด",
        detail: result.message || "ไม่สามารถสร้างไฟล์ PDF ได้",
        life: 3000,
      });
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.add({
      severity: "error",
      summary: "ผิดพลาด",
      detail: "ไม่สามารถสร้างไฟล์ PDF ได้",
      life: 3000,
    });
  } finally {
    isPdfLoading.value = false;
    pdfStatusVisible.value = false;
  }
};

// ฟอร์แมตวันที่และเวลาสำหรับส่ง API (YYYY-MM-DD HH:MM:SS)
const formatDateTimeForAPI = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// ฟอร์แมตวันที่สำหรับส่ง API (YYYY-MM-DD) - ใช้ในกรณีที่ต้องการเฉพาะวันที่
const formatDateForAPI = (date) => {
  if (!date) return "";
  const dateTime = formatDateTimeForAPI(date);
  return dateTime.split(" ")[0]; // ตัดเอาเฉพาะส่วนวันที่
};

// ฟังก์ชันสำหรับดึงข้อมูล
const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      endDate: formatDateTimeForAPI(searchParams.todate),
      shopid: searchParams.shopid,
      shopname: searchParams.shopname,
      taxid: shopTaxId.value,
      address: shopAddress.value,
    };

    console.log("Fetching journal 12 columns data with params:", params);

    const result = await ReportJournal12columnService.getJournal12columns(params);

    if (result.success) {
      reportData.value = result.data;
      toast.add({
        severity: "success",
        summary: "สำเร็จ",
        detail: "ดึงข้อมูลเรียบร้อยแล้ว",
        life: 3000,
      });
    } else {
      console.error("Error fetching data:", result.msg);
      toast.add({
        severity: "error",
        summary: "ผิดพลาด",
        detail: result.msg || "ไม่สามารถดึงข้อมูลได้",
        life: 3000,
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    toast.add({
      severity: "error",
      summary: "ผิดพลาด",
      detail: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// ฟังก์ชันฟอร์แมตวันที่
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ฟังก์ชันฟอร์แมตวันที่แบบไทย (วัน/เดือน/ปี)
const formatDateThai = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// ฟังก์ชันฟอร์แมตจำนวนเงิน - ถ้าติดลบจะแสดงด้วยวงเล็บ
const formatCurrency = (value) => {
  if (!value && value !== 0) return "0.00";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const absNum = Math.abs(num);
  const formatted = absNum.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  // ถ้าเป็นค่าติดลบ ให้ใช้วงเล็บแทนเครื่องหมายลบ
  return num < 0 ? `(${formatted})` : formatted;
};

// ฟังก์ชันตรวจสอบว่าเป็นค่าลบหรือไม่
const isNegative = (value) => {
  if (!value && value !== 0) return false;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num < 0;
};

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
onMounted(async () => {
  // แสดง dialog ค้นหาทันทีเมื่อโหลดหน้า
  searchDialogVisible.value = true;

  storeApp.setPageTitle("งบกำไรขาดทุน 12 เดือน");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("report_journal12columns");

  try {
    const result = await ShopService.getShop(shopId);
    if (result.success) {
      shopData.value = result.data;

      // ตรวจสอบและเพิ่มข้อมูลที่จำเป็นถ้ายังไม่มี
      if (!shopData.value.names || !shopData.value.names.length) {
        shopData.value.names = [
          {
            code: "th",
            name: localStorage.shop_name || "",
            isauto: false,
            isdelete: false,
          },
        ];
      }

      if (!shopData.value.address || !shopData.value.address.length) {
        shopData.value.address = [
          { code: "th", name: "", isauto: false, isdelete: false },
        ];
      }

      if (!shopData.value.settings) {
        shopData.value.settings = { taxid: "" };
      }
    } else {
      console.error("Error fetching shop data:", result.msg);
      toast.add({
        severity: "error",
        summary: "ผิดพลาด",
        detail: result.msg || "ไม่สามารถดึงข้อมูลร้านค้าได้",
        life: 3000,
      });
    }
  } catch (error) {
    console.error("Error fetching shop data:", error);
    toast.add({
      severity: "error",
      summary: "ผิดพลาด",
      detail: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์",
      life: 3000,
    });
  }
});
</script>
<style scoped>
.report-container {
  font-family: "Sarabun", sans-serif;
}

.report-table-container {
  overflow-x: auto;
  background: #ffffff;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  border: 1px solid #d1d5db;
}

.report-table th,
.report-table td {
  padding: 6px 8px;
  white-space: nowrap;
  border: 1px solid #e5e7eb;
}

.report-table th {
  background-color: #e0f2fe;
  color: #0c4a6e;
  font-weight: 600;
  text-align: center;
  padding: 8px 6px;
  font-size: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.report-table th.month-header {
  min-width: 75px;
}

.report-table tbody tr.section-header td {
  background-color: #f0f9ff;
  font-weight: 600;
  padding: 6px 8px;
  color: #075985;
  font-size: 13.5px;
}

.report-table tbody tr.subtotal-row td {
  background-color: #fef9e7;
  font-weight: 600;
  padding: 5px 6px;
  color: #78350f;
}

.report-table tbody tr.total-row td {
  background-color: #dbeafe;
  font-weight: 700;
  font-size: 13.5px;
  padding: 6px 6px;
  color: #1e40af;
}

.report-table tbody tr.net-profit td {
  background-color: #d1fae5;
  font-size: 14px;
  font-weight: 700;
  border-top: 2px solid #6ee7b7;
  border-bottom: 2px solid #6ee7b7;
  padding: 7px 6px;
  color: #065f46;
}

.report-table tbody tr:not(.section-header):not(.subtotal-row):not(.total-row):not(.net-profit) td {
  color: #374151;
  background-color: #ffffff;
}

/* Hover effect สำหรับ row ธรรมดา */
.report-table tbody tr:not(.section-header):not(.subtotal-row):not(.total-row):not(.net-profit):hover td {
  background-color: #fef3c7 !important;
  transition: background-color 0.2s ease;
}

/* Hover effect สำหรับ subtotal row */
.report-table tbody tr.subtotal-row:hover td {
  background-color: #fde68a !important;
  transition: background-color 0.2s ease;
}

/* Hover effect สำหรับ total row */
.report-table tbody tr.total-row:hover td {
  background-color: #bfdbfe !important;
  transition: background-color 0.2s ease;
}

/* Hover effect สำหรับ net profit row */
.report-table tbody tr.net-profit:hover td {
  background-color: #a7f3d0 !important;
  transition: background-color 0.2s ease;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.pl-4 {
  padding-left: 16px !important;
}

.font-bold {
  font-weight: 600;
}

/* Negative values styling - แสดงด้วยวงเล็บและสีแดงอ่อนมาก */
.negative-value {
  color: #ef4444 !important;
  font-weight: 500;
}

/* Positive emphasis for summary rows */
.subtotal-row .negative-value,
.total-row .negative-value,
.net-profit .negative-value {
  color: #ef4444 !important;
  font-weight: 700;
}

/* Responsive adjustments */
@media screen and (max-width: 1200px) {
  .report-table {
    font-size: 12px;
  }
  
  .report-table th,
  .report-table td {
    padding: 3px 5px;
  }
  
  .report-table th.month-header {
    min-width: 65px;
  }
}

/* Scrollbar styling */
.report-table-container::-webkit-scrollbar {
  height: 8px;
}

.report-table-container::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.report-table-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
}

.report-table-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
