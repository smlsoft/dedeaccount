<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-card p-4 shadow-2 border-round">
        <div class="mb-3 flex align-items-center justify-content-between">
          <span class="text-xl font-medium text-900">รายงานสถานะลูกหนี้</span>
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
            <h3 class="m-0">รายงานสถานะลูกหนี้</h3>
            <h3 class="m-0">วันที่ {{ formatDateRange() }}</h3>
          </div>

          <div class="flex justify-content-between mb-2">
            <div>
              <strong>วันที่พิมพ์ : {{ formatDate(new Date()) }}</strong>
            </div>
            <div>
              <span>หน้า : {{ currentPage }}/{{ totalPages }}</span>
            </div>
          </div>

          <div class="report-table-container">
            <table class="report-table">
              <thead>
                <tr>
                  <th class="text-center">รหัสลูกหนี้</th>
                  <th class="text-center">ชื่อลูกหนี้</th>
                  <th class="text-center">ยอดยกมา</th>
                  <th class="text-center">ยอดเดบิต</th>
                  <th class="text-center">ยอดเครดิต</th>
                  <th class="text-center">ยอดยกไป</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in paginatedData"
                  :key="item.customerid || item.customername"
                >
                  <td>{{ item.customerid || "" }}</td>
                  <td>{{ item.customername || "" }}</td>
                  <td class="text-right">
                    {{ formatCurrency(item.beginning_balance) }}
                  </td>
                  <td class="text-right">
                    {{ formatCurrency(item.debit_amount) }}
                  </td>
                  <td class="text-right">
                    {{ formatCurrency(item.credit_amount) }}
                  </td>
                  <td class="text-right">
                    {{ formatCurrency(item.ending_balance) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="text-center">รวมทั้งสิ้น</td>
                  <td class="text-right">
                    {{ formatCurrency(totalBeginningBalance) }}
                  </td>
                  <td class="text-right">{{ formatCurrency(totalDebit) }}</td>
                  <td class="text-right">{{ formatCurrency(totalCredit) }}</td>
                  <td class="text-right">
                    {{ formatCurrency(totalEndingBalance) }}
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
            :value="receivableData"
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
            <Column field="customerid" header="รหัสลูกหนี้" sortable></Column>
            <Column field="customername" header="ชื่อลูกหนี้" sortable></Column>
            <Column field="beginning_balance" header="ยอดยกมา" sortable>
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.beginning_balance) }}
              </template>
            </Column>
            <Column field="debit_amount" header="ยอดเดบิต" sortable>
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.debit_amount) }}
              </template>
            </Column>
            <Column field="credit_amount" header="ยอดเครดิต" sortable>
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.credit_amount) }}
              </template>
            </Column>
            <Column field="ending_balance" header="ยอดยกไป" sortable>
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.ending_balance) }}
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
    :closable="false"
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
              dateFormat="dd/mm/yy"
              class="w-full"
              inputId="fromDate"
              :showIcon="true"
              :inputStyle="{ height: '54px' }"
            />
            <label for="fromDate">วันที่เริ่มต้น</label>
          </div>
        </div>
        <div class="col-6">
          <div class="p-float-label w-full">
            <Calendar
              v-model="searchParams.todate"
              dateFormat="dd/mm/yy"
              class="w-full"
              inputId="toDate"
              :showIcon="true"
              :inputStyle="{ height: '54px' }"
            />
            <label for="toDate">วันที่สิ้นสุด</label>
          </div>
        </div>
        <div class="col-6 mt-4">
          <div class="p-float-label w-full">
            <Dropdown
              v-model="searchParams.accountcode"
              :showClear="searchParams.accountcode !== '' ? true : false"
              :filter="true"
              :filterFields="['accountcode', 'accountname']"
              field="accountcode"
              :options="accountChartList"
              filterPlaceholder="ค้นหา"
              placeholder="-- กรุณาเลือก --"
              optionLabel="label"
              optionValue="accountcode"
              class="w-full"
              :inputStyle="{ height: '54px' }"
              :class="{ 'p-invalid': submitted && !searchParams.accountcode }"
              aria-required="true"
            />
            <label for="accountcode"
              >รหัสบัญชี <span class="text-red-500">*</span></label
            >
          </div>
          <small v-if="submitted && !searchParams.accountcode" class="p-error"
            >กรุณาเลือกรหัสบัญชี</small
          >
        </div>
        <div class="col-6 mt-4">
          <div class="p-float-label w-full">
            <Dropdown
              v-model="searchParams.custcode"
              :show-clear="searchParams.custcode !== '' ? true : false"
              :filter="true"
              :filterFields="['code', 'names']"
              field="code"
              :options="debtorList"
              filterPlaceholder="ค้นหา"
              placeholder="-- ทั้งหมด --"
              optionLabel="label"
              optionValue="code"
              class="w-full"
              :inputStyle="{ height: '54px' }"
            />
            <label for="custcode"
              >รหัสลูกหนี้</label
            >
          </div>
        </div>
      </div>
    </section>
    <template #footer>
      <div class="pt-3 flex">
        <Button
          @click="cancelSearch"
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
import reportPayableReceivableService from "@/services/ReportPayableReceivableService.js";
import MasterdataService from "@/services/MasterdataService";

const storeApp = useApp();
const shopName = localStorage.shop_name || "DEMOAccount";
const toast = useToast();
const reportRef = ref(null);
const showDataTable = ref(false);
const receivableData = ref([]);
const loading = ref(false);
const isPdfLoading = ref(false);
const pdfStatusVisible = ref(false);
const pagination = ref({
  perPage: 20,
  page: 0,
  total: 0,
  totalPage: 0,
});

const debtorList = ref([]);
const accountChartList = ref([]);
const activePage = ref(1);
const filters = ref(null);
const sortField = ref("code");
const sortOrder = ref(1);
const submitted = ref(false);

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
  fromdate: firstDayOfMonth, // วันแรกของเดือนปัจจุบัน เวลา 00:00:00
  todate: lastDayOfMonth, // วันสุดท้ายของเดือนปัจจุบัน เวลา 23:59:59
  shopid: localStorage.shopid || "",
  accountcode: "",
  custcode: "",
});

// คำนวณผลรวม
const totalBeginningBalance = computed(() => {
  return receivableData.value.reduce(
    (sum, item) => sum + parseFloat(item.beginning_balance || 0),
    0
  );
});

const totalDebit = computed(() => {
  return receivableData.value.reduce(
    (sum, item) => sum + parseFloat(item.debit_amount || 0),
    0
  );
});

const totalCredit = computed(() => {
  return receivableData.value.reduce(
    (sum, item) => sum + parseFloat(item.credit_amount || 0),
    0
  );
});

// ฟังก์ชันยกเลิกการค้นหา
const cancelSearch = () => {
  searchDialogVisible.value = false;
};

const getDebtorsList = async () => {
  try {
    const res = await MasterdataService.getDebtorList(
      10000, // limit
      activePage.value,
      filters.value,
      sortField.value,
      sortOrder.value
    );

    if (res.success) {
      debtorList.value = res.data.sort((obj1, obj2) => obj1.code - obj2.code);
      // เพิ่ม label สำหรับแสดงใน dropdown
      debtorList.value.forEach((ele) => {
        ele.label = ele.code + "~" + (ele.names[0]?.name || "");
      });
      console.log("Debtor list loaded:", debtorList.value.length);
    } else {
      console.error("Failed to load Debtor list");
    }
  } catch (err) {
    console.error("Error loading Debtor list:", err);
  }
};

// ดึงข้อมูลผังบัญชีทั้งหมด
const getAccountChartList = async () => {
  try {
    const res = await MasterdataService.getAccountChartList(
      10000, // limit
      activePage.value,
      filters.value,
      "accountcode",
      1
    );

    if (res.success) {
      accountChartList.value = res.data.sort((a, b) =>
        a.accountcode.localeCompare(b.accountcode)
      );
      // เพิ่ม label สำหรับแสดงใน dropdown
      accountChartList.value.forEach((item) => {
        item.label = item.accountcode + "~" + item.accountname;
      });
      console.log("Account chart list loaded:", accountChartList.value.length);
    } else {
      console.error("Failed to load account chart list");
    }
  } catch (err) {
    console.error("Error loading account chart list:", err);
  }
};

const totalEndingBalance = computed(() => {
  return receivableData.value.reduce(
    (sum, item) => sum + parseFloat(item.ending_balance || 0),
    0
  );
});

// ชื่อรายงาน
const reportTitle = computed(() => {
  return "รายงานสถานะลูกหนี้";
});

// การแบ่งหน้า
const totalPages = computed(() => {
  if (receivableData.value.length === 0) return 1;
  return Math.ceil(receivableData.value.length / itemsPerPage.value);
});

const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = Math.min(
    startIndex + itemsPerPage.value,
    receivableData.value.length
  );
  return receivableData.value.slice(startIndex, endIndex);
});

// ฟังก์ชันการเปลี่ยนหน้า
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// ฟังก์ชันแสดงวันที่ปัจจุบัน (วันที่พิมพ์)
const formatCurrentDate = () => {
  const now = new Date();
  return formatDateThai(now);
};

// เมื่อเปลี่ยนขนาดรายการต่อหน้า กลับไปหน้าแรก
watch(itemsPerPage, () => {
  currentPage.value = 1;
});

// ฟังก์ชันแสดงช่วงวันที่
const formatDateRange = () => {
  if (!searchParams.fromdate || !searchParams.todate) return "";

  const fromDate = formatDateThai(searchParams.fromdate);
  const toDate = formatDateThai(searchParams.todate);

  return `${fromDate} - ${toDate}`;
};

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
  if (!searchParams.fromdate || !searchParams.todate) {
    toast.add({
      severity: "error",
      summary: "ข้อมูลไม่ครบถ้วน",
      detail: "กรุณาระบุวันที่เริ่มต้นและวันที่สิ้นสุด",
      life: 3000,
    });
    return;
  }

  if (searchParams.fromdate > searchParams.todate) {
    toast.add({
      severity: "error",
      summary: "วันที่ไม่ถูกต้อง",
      detail: "วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด",
      life: 3000,
    });
    return;
  }

  // ตรวจสอบว่ามีการกำหนด accountcode หรือไม่
  if (!searchParams.accountcode) {
    toast.add({
      severity: "error",
      summary: "ข้อมูลไม่ครบถ้วน",
      detail: "กรุณาระบุรหัสบัญชี",
      life: 3000,
    });
    return;
  }


  // ตั้งค่าเวลาก่อนที่จะส่งคำขอ
  setFromDateTime();
  setToDateTime();

  console.log("Search with parameters:", {
    fromdate: formatDateTimeForAPI(searchParams.fromdate),
    todate: formatDateTimeForAPI(searchParams.todate),
    accountcode: searchParams.accountcode,
    custcode: searchParams.custcode || "",
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
    // ตั้งค่าเวลาก่อนที่จะส่งคำขอ
    setFromDateTime();
    setToDateTime();

    const params = {
      fromdate: formatDateTimeForAPI(searchParams.fromdate),
      todate: formatDateTimeForAPI(searchParams.todate),
      shopid: searchParams.shopid,
      accountcode: searchParams.accountcode, // เพิ่ม accountcode
      custcode: searchParams.custcode || "", // เพิ่ม custcode
      limit: searchParams.limit,
      offset: searchParams.offset,
    };

    console.log("Generating PDF with params:", params);

    const result =
      await reportPayableReceivableService.generateReceivableReportPDF(params);

    if (result.success) {
      const { jobId, fileName, downloadLink } = result.data;

      toast.add({
        severity: "info",
        summary: "กำลังสร้างไฟล์ PDF",
        detail: "โปรดรอสักครู่ กำลังประมวลผลข้อมูล",
        life: 3000,
      });

      try {
        // ตรวจสอบสถานะการสร้าง PDF และรอให้เสร็จก่อนดาวน์โหลด
        await reportPayableReceivableService.waitForPDFAndDownload(
          jobId,
          fileName,
          "receivable",
          30, // เพิ่มจำนวนครั้งการรอเป็น 30 ครั้ง
          2000 // รอทุก 2 วินาที
        );

        toast.add({
          severity: "success",
          summary: "สำเร็จ",
          detail: "ดาวน์โหลดไฟล์ PDF เรียบร้อยแล้ว",
          life: 3000,
        });
      } catch (waitError) {
        console.error("Error waiting for PDF:", waitError);

        // พยายามดาวน์โหลดไฟล์โดยตรงแม้จะมีข้อผิดพลาดในการรอ
        try {
          reportPayableReceivableService.downloadReportPDF(
            jobId,
            fileName,
            "receivable"
          );

          toast.add({
            severity: "warning",
            summary: "ดาวน์โหลดสำเร็จ",
            detail: "กำลังดาวน์โหลดไฟล์ PDF โดยตรง",
            life: 3000,
          });
        } catch (directDownloadError) {
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
    const params = {
      limit: searchParams.limit,
      offset: searchParams.offset,
      fromdate: formatDateTimeForAPI(searchParams.fromdate),
      todate: formatDateTimeForAPI(searchParams.todate),
      shopid: searchParams.shopid,
      accountcode: searchParams.accountcode,
      custcode: searchParams.custcode || "",
    };

    console.log("Fetching receivable data with params:", params);

    // สำหรับการใช้งานจริง ให้เรียกใช้ service จริง
    const result = await reportPayableReceivableService.getReceivableReport(
      params
    );

    if (result.success) {
      receivableData.value = result.data;
      pagination.value = result.pagination;

      // ถ้าไม่มีข้อมูล แสดงข้อความแจ้งเตือน
      if (result.data.length === 0) {
        toast.add({
          severity: "info",
          summary: "ไม่พบข้อมูล",
          detail: "ไม่พบข้อมูลรายงานตามเงื่อนไขที่กำหนด",
          life: 3000,
        });
      } else {
        toast.add({
          severity: "success",
          summary: "สำเร็จ",
          detail: "ดึงข้อมูลเรียบร้อยแล้ว",
          life: 3000,
        });
      }
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

    // แสดงข้อความผิดพลาดที่เฉพาะเจาะจงมากขึ้น
    let errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์";

    if (error.response) {
      // ข้อผิดพลาดจาก API
      errorMessage = `ข้อผิดพลาดจากเซิร์ฟเวอร์: ${error.response.status} - ${
        error.response.data?.msg || error.message
      }`;
    } else if (error.request) {
      // ไม่ได้รับการตอบกลับ
      errorMessage =
        "ไม่ได้รับการตอบกลับจากเซิร์ฟเวอร์ โปรดตรวจสอบการเชื่อมต่อ";
    }

    toast.add({
      severity: "error",
      summary: "ผิดพลาด",
      detail: errorMessage,
      life: 5000,
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

// ฟังก์ชันฟอร์แมตวันที่แบบไทย (วัน/เดือน/ปี พ.ศ.)
const formatDateThai = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
  return `${day}/${month}/${year}`;
};

// ฟังก์ชันฟอร์แมตจำนวนเงิน (ถ้าเป็นลบให้ใส่วงเล็บ)
const formatCurrency = (value) => {
  if (!value) return "0.00";
  const numValue = parseFloat(value);

  if (numValue < 0) {
    // กรณีติดลบ ใส่วงเล็บ
    return `(${Math.abs(numValue).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })})`;
  }

  return numValue.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// เมื่อข้อมูลเปลี่ยน กลับไปหน้าแรก
watch(receivableData, () => {
  currentPage.value = 1;
});

// โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
onMounted(async () => {
  // โหลดข้อมูลลูกหนี้
  await getDebtorsList();

  // โหลดข้อมูลผังบัญชี
  await getAccountChartList();
  // แสดง dialog ค้นหาทันทีเมื่อโหลดหน้า
  searchDialogVisible.value = true;

  storeApp.setPageTitle("รายงานสถานะลูกหนี้");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("receivable_report");
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
