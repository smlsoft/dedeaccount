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
                  :minDate="startDate"
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
              :disabled="!startDate || !endDate"
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
  if (!startDate.value || !endDate.value) {
    toast.add({
      severity: "warn",
      summary: "คำเตือน",
      detail: "กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุด",
      life: 3000,
    });
    return;
  }

  // ตรวจสอบว่า startDate ต้องไม่มากกว่า endDate
  if (startDate.value > endDate.value) {
    toast.add({
      severity: "warn",
      summary: "คำเตือน",
      detail: "วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด",
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

  let startdate = Utils.getDateFromYear(startDate.value);
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
