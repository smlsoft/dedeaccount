<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-card p-4 shadow-2 border-round">
        <div class="mb-3 flex align-items-center justify-content-between">
          <span class="text-xl font-medium text-900"
            >รายงานภาษี / ภาษีถูกหัก ณ ที่จ่าย
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
              <h2 class="font-bold text-xl mb-0">รายงานภาษีถูกหัก ณ ที่จ่าย</h2>
              <p class="mb-3">
                จากวันที่ :
                {{ formatDateThai(searchParams.fromdate) }} ถึงวันที่ :
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
                  <th class="text-center">ลำดับ</th>
                  <th class="text-center">ชื่อผู้มีเงินได้</th>
                  <th class="text-center">ที่อยู่ผู้มีเงินได้</th>
                  <th class="text-center">เลขประจำตัวผู้เสียภาษี</th>
                  <th class="text-center">วันที่ได้รับ</th>
                  <th class="text-center">ประเภทเงินได้ที่จ่าย</th>
                  <th class="text-center">อัตราภาษี</th>
                  <th class="text-center">จำนวนเงิน</th>
                  <th class="text-center">ภาษี</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in paginatedData"
                  :key="item.id"
                  @click="handleRowClick(item)"
                  :class="{
                    'row-selected': selectedItem && selectedItem.id === item.id,
                  }"
                >
                  <td class="text-center">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  <td>{{ item.custname }}</td>
                  <td>{{ item.address || "-" }}</td>
                  <td class="text-center">{{ item.custtaxid }}</td>
                  <td class="text-center">
                    {{ formatDateSimple(item.taxdate) }}
                  </td>
                  <td class="text-center">
                    {{
                      item.details && item.details[0]
                        ? item.details[0].description
                        : ""
                    }}
                  </td>
                  <td class="text-center">
                    {{
                      item.details && item.details[0]
                        ? item.details[0].taxrate + "%"
                        : ""
                    }}
                  </td>
                  <td class="text-right">
                    {{
                      item.details && item.details[0]
                        ? formatCurrency(item.details[0].taxbase)
                        : "0.00"
                    }}
                  </td>
                  <td class="text-right">
                    {{
                      item.details && item.details[0]
                        ? formatCurrency(item.details[0].taxamount)
                        : "0.00"
                    }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="7" class="text-center">รวม</td>
                  <td class="text-right">{{ formatCurrency(totalTaxBase) }}</td>
                  <td class="text-right">
                    {{ formatCurrency(totalTaxAmount) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div class="flex justify-content-between align-items-center mt-3">
            <div class="items-per-page">
              <span class="mr-2">รายการต่อหน้า:</span>
              <Dropdown
                v-model="itemsPerPage"
                :options="itemsPerPageOptions"
                class="w-auto"
                optionLabel="label"
                optionValue="value"
              />
            </div>
            <div class="pagination-controls">
              <Button
                icon="pi pi-angle-double-left"
                text
                @click="goToPage(1)"
                :disabled="currentPage === 1"
                class="mr-1"
              />
              <Button
                icon="pi pi-angle-left"
                text
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="mr-1"
              />
              <span class="mx-2"
                >หน้า {{ currentPage }} จาก {{ totalPages }}</span
              >
              <Button
                icon="pi pi-angle-right"
                text
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="ml-1"
              />
              <Button
                icon="pi pi-angle-double-right"
                text
                @click="goToPage(totalPages)"
                :disabled="currentPage === totalPages"
                class="ml-1"
              />
            </div>
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
        <div class="col-6">
          <div class="p-float-label w-full">
            <Calendar
              v-model="searchParams.fromdate"
              :showIcon="true"
              dateFormat="dd/mm/yy"
              class="w-full"
              inputId="fromDateCalendar"
              :input-style="{ height: '54px' }"
            />
            <label for="fromDateCalendar">จากวันที่</label>
          </div>
        </div>
        <div class="col-6">
          <div class="p-float-label w-full">
            <Calendar
              v-model="searchParams.todate"
              :showIcon="true"
              dateFormat="dd/mm/yy"
              class="w-full"
              inputId="toDateCalendar"
              :input-style="{ height: '54px' }"
            />
            <label for="toDateCalendar">ถึงวันที่</label>
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

  <!-- DetailDocDialog Component -->
  <DetailDocDialog
    v-model:visible="openDetailDocNo"
    :docno="selectedDocNo"
    :allowEdit="true"
  />
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import ReportTaxJournalDeductService from "@/services/ReportTaxJournalDeductService.js";
import ShopService from "@/services/ShopService.js";
import DetailDocDialog from "@/components/DetailDocDialog.vue";

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
const taxData = ref([]);
const loading = ref(false);
const isPdfLoading = ref(false);
const pdfStatusVisible = ref(false);
const pagination = ref({
  perPage: 20,
  page: 0,
  total: 0,
  totalPage: 0,
});

// ตัวแปรสำหรับ DetailDocDialog
const openDetailDocNo = ref(false);
const selectedDocNo = ref(null);

// ตัวแปรสำหรับการเลือกแถว
const selectedItem = ref(null);

// ฟังก์ชันจัดการคลิกที่แถว
const handleRowClick = (item) => {
  // ตรวจสอบว่ากำลังคลิกแถวเดียวกับที่เลือกอยู่หรือไม่
  if (selectedItem.value && selectedItem.value.id === item.id) {
    // ถ้าคลิกแถวเดิม ให้เปิด dialog เท่านั้น ไม่ต้องเปลี่ยน selection
    selectedDocNo.value = item.docno;
    openDetailDocNo.value = true;
    return;
  }

  // ถ้าเป็นแถวใหม่ ให้อัปเดต selectedItem
  selectedItem.value = item;
  selectedDocNo.value = item.docno;
  openDetailDocNo.value = true;
};

// Search dialog
const searchDialogVisible = ref(false);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "30", value: 30 },
  { label: "50", value: 50 },
  { label: "ทั้งหมด", value: 9999 },
];

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
  limit: 20,
  offset: 0,
  taxtype: 0,
  fromdate: firstDayOfMonth, // วันแรกของเดือนปัจจุบัน เวลา 00:00:00
  todate: lastDayOfMonth, // วันสุดท้ายของเดือนปัจจุบัน เวลา 23:59:59
  shopid: localStorage.shopid,
  shopname: localStorage.shop_name,
});

// คำนวณผลรวม
const totalTaxBase = computed(() => {
  return taxData.value.reduce((sum, item) => {
    const details =
      item.details && item.details.length > 0
        ? item.details[0]
        : { taxbase: 0 };
    return sum + parseFloat(details.taxbase || 0);
  }, 0);
});

const totalTaxAmount = computed(() => {
  return taxData.value.reduce((sum, item) => {
    const details =
      item.details && item.details.length > 0
        ? item.details[0]
        : { taxamount: 0 };
    return sum + parseFloat(details.taxamount || 0);
  }, 0);
});

const formatDateSimple = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// ชื่อรายงาน
const reportTitle = computed(() => {
  return "รายงานภาษีถูกหัก ณ ที่จ่าย ";
});

// การแบ่งหน้า
const totalPages = computed(() => {
  if (taxData.value.length === 0) return 1;
  return Math.ceil(taxData.value.length / itemsPerPage.value);
});

const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = Math.min(
    startIndex + itemsPerPage.value,
    taxData.value.length
  );
  return taxData.value.slice(startIndex, endIndex);
});

// ฟังก์ชันการเปลี่ยนหน้า
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// เมื่อเปลี่ยนขนาดรายการต่อหน้า กลับไปหน้าแรก
watch(itemsPerPage, () => {
  currentPage.value = 1;
});

// ตั้งค่าเวลาของวันที่เริ่มต้นเป็น 00:00:00
const setFromDateTime = () => {
  if (searchParams.fromdate) {
    const fromDate = new Date(searchParams.fromdate);
    fromDate.setHours(0, 0, 0, 0);
    searchParams.fromdate = fromDate;
  }
};

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
  setFromDateTime();
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
    setFromDateTime();
    setToDateTime();

    const params = {
      taxtype: searchParams.taxtype,
      custtype: searchParams.custtype,
      fromdate: formatDateTimeForAPI(searchParams.fromdate),
      todate: formatDateTimeForAPI(searchParams.todate),
      shopid: searchParams.shopid,
      shopname: searchParams.shopname,
      taxid: shopTaxId.value,
      address: shopAddress.value
    };

    console.log("Generating PDF with params:", params);

    const result = await ReportTaxJournalDeductService.generateTaxReportPDF(
      params
    );

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
        await ReportTaxJournalDeductService.waitForPDFAndDownload(
          jobId,
          fileName
        );

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
      limit: searchParams.limit,
      offset: searchParams.offset,
      taxtype: searchParams.taxtype,
      custtype: searchParams.custtype,
      fromdate: formatDateTimeForAPI(searchParams.fromdate),
      todate: formatDateTimeForAPI(searchParams.todate),
      shopid: searchParams.shopid,
      shopname: searchParams.shopname,
      taxid: shopTaxId.value,
      address: shopAddress.value
    };

    console.log("Fetching data with params:", params);

    const result = await ReportTaxJournalDeductService.getTaxReport(params);

    if (result.success) {
      taxData.value = result.data;
      pagination.value = result.pagination;
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

// ฟังก์ชันฟอร์แมตจำนวนเงิน
const formatCurrency = (value) => {
  if (!value) return "0.00";
  return parseFloat(value).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// เมื่อข้อมูลเปลี่ยน กลับไปหน้าแรก
watch(taxData, () => {
  currentPage.value = 1;
});

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
onMounted(async () => {
  // แสดง dialog ค้นหาทันทีเมื่อโหลดหน้า
  searchDialogVisible.value = true;

  storeApp.setPageTitle("รายงานภาษีถูกหัก ณ ที่จ่าย");
  storeApp.setActivePage("report_tax_list");
  storeApp.setActiveChild("report_tax_journal_deduct");

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
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.report-table th,
.report-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.report-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.report-table tbody tr {
  cursor: pointer;
}

.report-table tbody tr:hover {
  background-color: #f0f7ff;
}

.report-table tbody tr.row-selected {
  background-color: #e0f0ff;
}

.report-table tbody tr:nth-child(even):not(.row-selected) {
  background-color: #f9f9f9;
}

.report-table tbody tr:nth-child(even):hover:not(.row-selected) {
  background-color: #f0f7ff;
}

.report-table tfoot {
  font-weight: bold;
  background-color: #f2f2f2;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.items-per-page {
  display: flex;
  align-items: center;
}
</style>
