<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-card p-4 shadow-2 border-round">
        <div class="mb-3 flex align-items-center justify-content-between">
          <span class="text-xl font-medium text-900"
            >รายงานภาษี / ภาษีหัก ณ ที่จ่าย ภ.ง.ด.3</span
          >
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
              จากวันที่ : {{ formatDateThai(searchParams.fromdate) }} ถึงวันที่
              : {{ formatDateThai(searchParams.todate) }}
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
                  <th class="text-center">ชื่อผู้เสียภาษี</th>
                  <th class="text-center">ที่อยู่ผู้เสียภาษี</th>
                  <th class="text-center">เลขประจำตัวผู้เสียภาษี</th>
                  <th class="text-center">เลขที่หนังสือรับรอง</th>
                  <th class="text-center">ประเภทเงินได้ที่จ่าย</th>
                  <th class="text-center">อัตราภาษี</th>
                  <th class="text-center">จำนวนเงินที่จ่ายในครั้งนี้</th>
                  <th class="text-center">ภาษีที่หักในครั้งนี้</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in paginatedData" :key="item.id">
                  <td class="text-center">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  <td>{{ item.custname }}</td>
                  <td>{{ item.address || "-" }}</td>
                  <td class="text-center">{{ item.custtaxid }}</td>
                  <td class="text-center">{{ item.taxdocno }}</td>
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

        <!-- Data Table for Admin/Editing (Optional) -->
        <div class="mt-5" v-if="showDataTable">
          <DataTable
            :value="taxData"
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
            <Column field="taxdate" header="วันที่" sortable>
              <template #body="slotProps">
                {{ formatDate(slotProps.data.taxdate) }}
              </template>
            </Column>
            <Column
              field="taxdocno"
              header="เลขที่หนังสือรับรอง"
              sortable
            ></Column>
            <Column field="custname" header="ชื่อผู้เสียภาษี" sortable></Column>
            <Column
              field="custtaxid"
              header="เลขประจำตัวผู้เสียภาษี"
              sortable
            ></Column>
            <Column field="organization" header="สำนักงานใหญ่/สาขา" sortable>
              <template #body="slotProps">
                {{
                  slotProps.data.organization === 0
                    ? "สำนักงานใหญ่"
                    : "สาขา " + slotProps.data.branchcode
                }}
              </template>
            </Column>
            <Column header="ประเภทเงินได้" sortable>
              <template #body="slotProps">
                {{
                  slotProps.data.details && slotProps.data.details[0]
                    ? slotProps.data.details[0].description
                    : ""
                }}
              </template>
            </Column>
            <Column header="ฐานภาษี" sortable>
              <template #body="slotProps">
                {{
                  formatCurrency(
                    slotProps.data.details && slotProps.data.details[0]
                      ? slotProps.data.details[0].taxbase
                      : 0
                  )
                }}
              </template>
            </Column>
            <Column header="อัตราภาษี" sortable>
              <template #body="slotProps">
                {{
                  slotProps.data.details && slotProps.data.details[0]
                    ? slotProps.data.details[0].taxrate + "%"
                    : "0%"
                }}
              </template>
            </Column>
            <Column header="ภาษีที่หัก" sortable>
              <template #body="slotProps">
                {{
                  formatCurrency(
                    slotProps.data.details && slotProps.data.details[0]
                      ? slotProps.data.details[0].taxamount
                      : 0
                  )
                }}
              </template>
            </Column>
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
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import ReportTaxJournalService from "@/services/ReportTaxJournalService.js";

const storeApp = useApp();
const shopName = localStorage.shop_name;
const toast = useToast();
const reportRef = ref(null);
const showDataTable = ref(false);
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
  taxtype: 1,
  custtype: 0,
  fromdate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // วันแรกของเดือนปัจจุบัน
  todate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // วันสุดท้ายของเดือนปัจจุบัน
  shopid: localStorage.shopid,
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

// ชื่อรายงาน
const reportTitle = computed(() => {
  return "รายงานภาษีหัก ณ ที่จ่าย ภ.ง.ด.3";
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

// ฟังก์ชันเปิด dialog ค้นหา
const openSearchDialog = () => {
  searchDialogVisible.value = true;
};

// ฟังก์ชันค้นหาและปิด dialog
const searchAndCloseDialog = () => {
  fetchData();
  searchDialogVisible.value = false;
};

// ฟังก์ชันสร้าง PDF
const generatePDF = async () => {
  isPdfLoading.value = true;
  pdfStatusVisible.value = true;

  try {
    const params = {
      taxtype: searchParams.taxtype,
      custtype: searchParams.custtype,
      fromdate: formatDateForAPI(searchParams.fromdate),
      todate: formatDateForAPI(searchParams.todate),
      shopid: searchParams.shopid,
    };

    const result = await ReportTaxJournalService.generateTaxReportPDF(params);

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
        await ReportTaxJournalService.waitForPDFAndDownload(jobId, fileName);

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

// ฟอร์แมตวันที่สำหรับส่ง API (YYYY-MM-DD)
const formatDateForAPI = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
      fromdate: formatDateForAPI(searchParams.fromdate),
      todate: formatDateForAPI(searchParams.todate),
      shopid: searchParams.shopid,
    };

    const result = await ReportTaxJournalService.getTaxReport(params);

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
onMounted(() => {
  // แสดง dialog ค้นหาทันทีเมื่อโหลดหน้า
  searchDialogVisible.value = true;

  storeApp.setPageTitle("รายงานภาษีหัก ณ ที่จ่าย ภ.ง.ด.3");
  storeApp.setActivePage("report_tax_list");
  storeApp.setActiveChild("report_tax_journal3");
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
