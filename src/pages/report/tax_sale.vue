<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-card p-4 shadow-2 border-round">
        <div class="mb-3 flex align-items-center justify-content-between">
          <span class="text-xl font-medium text-900">รายงานภาษี / ภาษีขาย</span>
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
          <div class="text-center mb-3">
            <h2 class="m-0">{{ shopName }}</h2>
            <p class="m-0">
              ปีภาษี : {{ searchParams.year }} งวดที่ :
              {{ searchParams.period }}
            </p>
          </div>

          <div class="flex justify-content-between mb-2">
            <div>
              <strong>หัวข้อ : {{ reportTitle }}</strong>
            </div>
            <div>
              <span>หน้า : {{ currentPage }}/{{ totalPages }}</span>
            </div>
          </div>

          <div class="report-table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th class="text-center">ลำดับ</th>
                  <th class="text-center">วันที่</th>
                  <th class="text-center">เลขที่ใบกำกับ</th>
                  <th class="text-center">ชื่อผู้ซื้อสินค้า/ผู้รับบริการ</th>
                  <th class="text-center">เลขประจำตัวผู้เสียภาษี</th>
                  <th class="text-center">สำนักงานใหญ่</th>
                  <th class="text-center">ยอดยกเว้นภาษี</th>
                  <th class="text-center">มูลค่าสินค้า/บริการ</th>
                  <th class="text-center">จำนวนเงินภาษี</th>
                  <th class="text-center">รวมทั้งสิ้น</th>
                  <th class="text-center">ยื่นเพิ่มเติม</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in paginatedData" :key="item.id">
                  <td class="text-center">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  <td class="text-center">
                    {{ formatDateThai(item.vatdate) }}
                  </td>
                  <td>{{ item.vatdocno }}</td>
                  <td>{{ item.custname }}</td>
                  <td>{{ item.custtaxid }}</td>
                  <td class="text-center">
                    {{ item.organization === 0 ? "สำนักงานใหญ่" : item.branchcode }}
                  </td>
                  <td class="text-right">
                    {{ formatCurrency(item.exceptvat || 0) }}
                  </td>
                  <td class="text-right">{{ formatCurrency(item.vatbase) }}</td>
                  <td class="text-right">
                    {{ formatCurrency(item.vatamount) }}
                  </td>
                  <td class="text-right">
                    {{ formatCurrency(item.total || calculateTotal(item)) }}
                  </td>
                  <td class="text-center">{{ item.vatsubmit ? "ยื่นเพิ่มเติม" : "" }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-center">รวม</td>
                  <td class="text-right">
                    {{ formatCurrency(totalExceptVat) }}
                  </td>
                  <td class="text-right">{{ formatCurrency(totalBase) }}</td>
                  <td class="text-right">{{ formatCurrency(totalTax) }}</td>
                  <td class="text-right">{{ formatCurrency(grandTotal) }}</td>
                  <td></td>
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

        <!-- Data Table for Admin/Editing (Optional) -->
        <div class="mt-5" v-if="showDataTable">
          <DataTable
            :value="vatData"
            :rowHover="true"
            :paginator="true"
            :rows="10"
            :loading="loading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[10, 20, 50]"
            currentPageReportTemplate="{first} ถึง {last} จาก {totalRecords} รายการ"
            responsiveLayout="scroll"
            stripedRows
            class="p-datatable-sm"
          >
            <Column field="vatdocno" header="เลขที่เอกสาร" sortable></Column>
            <Column field="vatdate" header="วันที่เอกสาร" sortable>
              <template #body="slotProps">
                {{ formatDate(slotProps.data.vatdate) }}
              </template>
            </Column>
            <Column
              field="custname"
              header="ชื่อผู้ประกอบการ"
              sortable
            ></Column>
            <Column
              field="custtaxid"
              header="เลขประจำตัวผู้เสียภาษี"
              sortable
            ></Column>
            <Column field="branchcode" header="สาขา" sortable></Column>
            <Column field="exceptvat" header="ยอดยกเว้นภาษี" sortable>
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.exceptvat) }}
              </template>
            </Column>
            <Column field="vatbase" header="มูลค่าสินค้า" sortable>
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.vatbase) }}
              </template>
            </Column>
            <Column field="vatamount" header="ภาษีมูลค่าเพิ่ม" sortable>
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.vatamount) }}
              </template>
            </Column>
            <Column field="total" header="รวมทั้งสิ้น" sortable>
              <template #body="slotProps">
                {{
                  formatCurrency(
                    slotProps.data.total || calculateTotal(slotProps.data)
                  )
                }}
              </template>
            </Column>
            <Column field="vatsubmit" header="ยื่นเพิ่มเติม" sortable>
              <template #body="slotProps">
                {{ slotProps.data.vatsubmit ? "x" : "" }}
              </template>
            </Column>
            <Column field="remark" header="หมายเหตุ" sortable></Column>
            <Column header="ดำเนินการ">
              <template #body>
                <div class="flex justify-content-center gap-2">
                  <Button icon="pi pi-pencil" rounded text severity="info" />
                  <Button icon="pi pi-trash" rounded text severity="danger" />
                </div>
              </template>
            </Column>
          </DataTable>
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
          >กรุณาเลือกปีและเดือนที่ต้องการเรียกรายงาน</span
        >
      </div>
    </template>
    <section class="flex flex-column w-full mt-4">
      <div class="grid">
        <div class="col-6">
          <div class="p-float-label w-full">
            <Dropdown
              v-model="searchParams.year"
              :options="years"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              inputId="yearDropdown"
              :input-style="{ height: '54px' }"
            />
            <label for="yearDropdown">ปี</label>
          </div>
        </div>
        <div class="col-6">
          <div class="p-float-label w-full">
            <Dropdown
              v-model="searchParams.period"
              :options="periods"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              inputId="periodDropdown"
              :input-style="{ height: '54px' }"
            />
            <label for="periodDropdown">เดือน</label>
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
import { ref, reactive, onMounted, computed, watch } from "vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import reportTaxVatService from "@/services/ReportTaxVatService.js";

const storeApp = useApp();
const shopName = localStorage.shop_name;
const toast = useToast();
const reportRef = ref(null);
const showDataTable = ref(false);
const vatData = ref([]);
const loading = ref(false);
const isPdfLoading = ref(false);
const pdfStatusVisible = ref(false);
const pagination = ref({
  perPage: 20,
  page: 0,
  total: 0,
  totalPage: 0,
});

// ค่าคงที่สำหรับรายงานภาษีขาย (mode = 1)
const TAX_MODE = 1;

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

// พารามิเตอร์สำหรับการค้นหา
const searchParams = reactive({
  limit: 20,
  offset: 0,
  mode: TAX_MODE, // กำหนดค่าคงที่
  year: 2568,
  period: 3,
  shopid: localStorage.shopid,
});

// คำนวณผลรวม
const totalBase = computed(() => {
  return vatData.value.reduce(
    (sum, item) => sum + parseFloat(item.vatbase || 0),
    0
  );
});

const totalTax = computed(() => {
  return vatData.value.reduce(
    (sum, item) => sum + parseFloat(item.vatamount || 0),
    0
  );
});

const totalExceptVat = computed(() => {
  return vatData.value.reduce(
    (sum, item) => sum + parseFloat(item.exceptvat || 0),
    0
  );
});

const grandTotal = computed(() => {
  return vatData.value.reduce((sum, item) => {
    const total = item.total || calculateTotal(item);
    return sum + parseFloat(total || 0);
  }, 0);
});

// ฟังก์ชันคำนวณยอดรวมทั้งสิ้น
const calculateTotal = (item) => {
  const vatbase = parseFloat(item.vatbase || 0);
  const vatamount = parseFloat(item.vatamount || 0);
  const exceptvat = parseFloat(item.exceptvat || 0);
  return vatbase + vatamount + exceptvat;
};

// ชื่อรายงาน
const reportTitle = computed(() => {
  return "รายงานภาษีขาย";
});

// การแบ่งหน้า
const totalPages = computed(() => {
  if (vatData.value.length === 0) return 1;
  return Math.ceil(vatData.value.length / itemsPerPage.value);
});

const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = Math.min(
    startIndex + itemsPerPage.value,
    vatData.value.length
  );
  return vatData.value.slice(startIndex, endIndex);
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

// ตัวเลือกสำหรับ Dropdown
const years = [
  { label: "2568", value: 2568 },
  { label: "2567", value: 2567 },
  { label: "2566", value: 2566 },
];

const periods = [
  { label: "มกราคม", value: 1 },
  { label: "กุมภาพันธ์", value: 2 },
  { label: "มีนาคม", value: 3 },
  { label: "เมษายน", value: 4 },
  { label: "พฤษภาคม", value: 5 },
  { label: "มิถุนายน", value: 6 },
  { label: "กรกฎาคม", value: 7 },
  { label: "สิงหาคม", value: 8 },
  { label: "กันยายน", value: 9 },
  { label: "ตุลาคม", value: 10 },
  { label: "พฤศจิกายน", value: 11 },
  { label: "ธันวาคม", value: 12 },
];

// ฟังก์ชันสำหรับคำนวณวันที่เริ่มต้นและสิ้นสุดของรอบภาษี
const calculateTaxPeriodDates = () => {
  const year = searchParams.year - 543; // แปลงจากปี พ.ศ. เป็น ค.ศ.
  const month = searchParams.period - 1; // เดือนใน JavaScript เริ่มจาก 0
  
  // วันแรกของเดือน
  const startDate = new Date(year, month, 1);
  startDate.setHours(0, 0, 0, 0);
  
  // วันสุดท้ายของเดือน
  const endDate = new Date(year, month + 1, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

// ฟังก์ชันเปิด dialog ค้นหา
const openSearchDialog = () => {
  searchDialogVisible.value = true;
};

// ฟังก์ชันค้นหาและปิด dialog
const searchAndCloseDialog = () => {
  const { startDate, endDate } = calculateTaxPeriodDates();
  
  // เพิ่มข้อมูลวันที่เริ่มต้นและสิ้นสุดในพารามิเตอร์
  searchParams.fromdate = startDate;
  searchParams.todate = endDate;
  
  console.log("Search with period dates:", {
    year: searchParams.year,
    period: searchParams.period,
    fromdate: formatDateTimeForAPI(startDate),
    todate: formatDateTimeForAPI(endDate)
  });
  
  fetchData();
  searchDialogVisible.value = false;
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

// ฟังก์ชันสร้าง PDF
const generatePDF = async () => {
  isPdfLoading.value = true;
  pdfStatusVisible.value = true;

  try {
    const { startDate, endDate } = calculateTaxPeriodDates();
    
    const params = {
      mode: TAX_MODE, // ใช้ค่าคงที่
      year: searchParams.year,
      period: searchParams.period,
      fromdate: formatDateTimeForAPI(startDate),
      todate: formatDateTimeForAPI(endDate),
      shopid: searchParams.shopid,
    };

    console.log("Generating PDF with params:", params);

    const result = await reportTaxVatService.generateVatReportPDF(params);

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
        await reportTaxVatService.waitForPDFAndDownload(jobId, fileName);

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

// ฟังก์ชันสำหรับดึงข้อมูล
const fetchData = async () => {
  loading.value = true;
  try {
    const { startDate, endDate } = calculateTaxPeriodDates();
    
    const params = {
      limit: searchParams.limit,
      offset: searchParams.offset,
      mode: TAX_MODE, // ใช้ค่าคงที่
      year: searchParams.year,
      period: searchParams.period,
      fromdate: formatDateTimeForAPI(startDate),
      todate: formatDateTimeForAPI(endDate),
      shopid: searchParams.shopid,
    };

    console.log("Fetching data with params:", params);

    const result = await reportTaxVatService.getVatReport(params);

    if (result.success) {
      vatData.value = result.data;
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
watch(vatData, () => {
  currentPage.value = 1;
});

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
onMounted(() => {
  // แสดง dialog ค้นหาทันทีเมื่อโหลดหน้า
  searchDialogVisible.value = true;

  storeApp.setPageTitle("รายงานภาษีขาย");
  storeApp.setActivePage("report_tax_list");
  storeApp.setActiveChild("report_tax_sale");
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

.report-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
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
