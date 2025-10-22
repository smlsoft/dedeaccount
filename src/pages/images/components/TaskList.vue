<template>
  <DataTable
    :value="props.data_list"
    dataKey="guidfixed"
    class="p-datatable-sm"
    :loading="loading"
    responsiveLayout="scroll"
    :scrollable="false"
    scrollHeight="80vh"
    selectionMode="single"
    :metaKeySelection="false"
    @rowSelect="onRowSelect"
  >
    <Column header="ลำดับ" style="max-width: 5%">
      <template #body="slotProps">
        {{ slotProps.index + 1 }}
      </template>
    </Column>
    <Column field="ownerat" header="วันที่" style="min-width: 15%">
      <template #body="slotProps">
        {{ Utils.getDateFormatDMYHM(slotProps.data.ownerat) }}
      </template>
    </Column>
    <Column field="code" header="เลขที่งาน"></Column>
    <Column field="name" header="ชื่องาน"></Column>

    <!-- คอลัมน์จำนวน -->
    <Column
      v-if="props.modeMenu !== 3"
      field="totaldocument"
      header="จำนวน"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    ></Column>

    <!-- modeMenu = 1: เอกสารมีปัญหา -->
    <Column
      v-if="props.modeMenu === 1"
      header="เอกสารมีปัญหา"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="{ data }">
        {{ getDocumentStatusTotal(data.totaldocumentstatus, 2) }}
      </template>
    </Column>

    <!-- modeMenu = 2: คอลัมน์ผ่าน, ไม่ผ่าน, คงเหลือ -->
    <Column
      v-if="props.modeMenu === 2"
      header="ผ่าน"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="{ data }">
        {{ getPassedDocumentsTotal(data.totaldocumentstatus) }}
      </template>
    </Column>

    <Column
      v-if="props.modeMenu === 2"
      header="ไม่ผ่าน"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="{ data }">
        {{ getDocumentStatusTotal(data.totaldocumentstatus, 2) }}
      </template>
    </Column>

    <Column
      v-if="props.modeMenu === 2"
      header="คงเหลือ"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="{ data }">
        {{ getDocumentStatusTotal(data.totaldocumentstatus, 0) }}
      </template>
    </Column>

    <Column
      v-if="props.modeMenu === 2"
      field="totaldocument"
      header="รอบันทึก"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    ></Column>

    <!-- modeMenu = 3: คอลัมน์เอกสารที่ต้องบันทึก, บันทึกเอกสาร, คงเหลือ -->
    <Column
      v-if="props.modeMenu === 3"
      header="เอกสารที่ต้องบันทึก"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="{ data }">
        {{ getDocumentStatusTotal(data.totaldocumentstatus, 1) }}
      </template>
    </Column>

    <Column
      v-if="props.modeMenu === 3"
      header="บันทึกเอกสาร"
      field="referencecount"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
    </Column>

    <Column
      v-if="props.modeMenu === 3"
      header="คงเหลือ"
      field="referencebalance"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
    </Column>

    <Column field="ownerby" header="ผู้สร้าง"></Column>

    <!-- คอลัมน์สถานะ -->
    <Column field="status" header="สถานะ">
      <template #body="slotProps">
        <Tag v-bind="getStatusTagProps(slotProps.data)"></Tag>
      </template>
    </Column>

    <Column field="description" header="หมายเหตุ"></Column>

    <!-- คอลัมน์แก้ไข (modeMenu = 2) -->
    <Column v-if="props.modeMenu === 2" field="taskchild" header="แก้ไข">
      <template #body="{ data, field }">
        <Button
          v-if="data[field]?.code"
          class="bg-yellow-200 text-yellow-900 font-bold text-sm py-1 px-2"
          style="border-radius: 10px"
          :label="`${getStatusText(data[field].status)} : ${data[field].code}`"
        />
      </template>
    </Column>

    <!-- คอลัมน์การตั้งค่า (modeMenu = 1) -->
    <Column
      v-if="props.modeMenu === 1"
      headerStyle="width: 4rem; text-align: center"
      bodyStyle="text-align: center; overflow: visible"
    >
      <template #body="slotProps">
        <Button
          :disabled="slotProps.data.status !== 0"
          class="p-button-text"
          type="button"
          icon="pi pi-cog"
          @click="showDialogConfigJob(slotProps.data)"
        ></Button>
      </template>
    </Column>

    <template #header>
      <div class="flex">
        <div class="flex-none flex align-items-center justify-content-start">
          <Button
            v-if="props.modeMenu === 1"
            label="สร้างงาน"
            icon="pi pi-plus"
            class="w-auto"
            @click="showDialogCreateJob"
          ></Button>
        </div>
        <div class="flex-1 flex align-items-center justify-content-center">
          <Paginator
            :rows="rowsPerPage"
            v-model:first="first"
            :totalRecords="props.totalItemsCount"
            @page="onPage"
            :rowsPerPageOptions="[20, 50, 100]"
          >
          </Paginator>
        </div>
        <div class="flex-none flex align-items-center justify-content-end">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="searchText"
              placeholder="ค้นหา...."
              @input="onSearchInput"
            />
          </span>
        </div>
      </div>
    </template>
    <template #empty> ไม่พบข้อมูล </template>
    <template #loading> กำลังประมวลผล กรุณารอซักครู่.. </template>
  </DataTable>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import Utils from "@/utils/";

//modeMenu
// 1 = เมนู upload image
// 2 = เมนู ตรวจสอบรูป
// 3 = บันทึกรายวันจากรูป
const props = defineProps({
  modeMenu: Number,
  data_list: Array,
  loading: Boolean,
  firstPage: Number,
  totalItemsCount: Number,
  filters: String,
});

const emit = defineEmits([
  "onRowSelect",
  "showDialogCreateJob",
  "showDialogConfigJob",
  "keyup",
  "keydown",
  "onPage",
]);

// Reactive state
const searchText = ref(props.filters || "");
const first = ref(props.firstPage || 0);
const rowsPerPage = ref(20);
let searchTimeout = null;

// Constants for status mapping
const STATUS_CONFIG = {
  0: { text: "รอแก้ไข", icon: "pi pi-upload" },
  1: { text: "รอตรวจสอบ", severity: "warning", icon: "pi pi-clock" },
  2: { text: "กำลังตรวจสอบ", severity: "info", icon: "pi pi-clock" },
  3: { text: "รอบันทึกบัญชี", severity: "Info", icon: "pi pi-history" },
  4: {
    text: "ลงบัญชีเสร็จแล้ว",
    severity: "success",
    icon: "pi pi-check-circle",
  },
  5: { text: "งานยกเลิก", severity: "danger" },
};

const LOCAL_STORAGE_KEYS = {
  1: "images_job_upload_perPage",
  2: "images_job_approve_perPage",
  3: "images_job_daily_perPage",
};

// Watchers
watch(
  () => props.firstPage,
  (newValue) => {
    first.value = newValue;
  }
);

watch(
  () => props.filters,
  (newValue) => {
    searchText.value = newValue || "";
  }
);

// Computed-like functions for document status
/**
 * ดึงจำนวนเอกสารตาม status ที่กำหนด
 * @param {Array} statusArray - array ของ totaldocumentstatus
 * @param {Number} targetStatus - status ที่ต้องการหา
 * @returns {Number} - จำนวนเอกสาร
 */
const getDocumentStatusTotal = (statusArray, targetStatus) => {
  if (!statusArray || !Array.isArray(statusArray)) return 0;
  const found = statusArray.find((item) => item.status === targetStatus);
  return found?.total || 0;
};

/**
 * คำนวณจำนวนเอกสารที่ผ่าน (status 1 หรือ 3)
 * @param {Array} statusArray - array ของ totaldocumentstatus
 * @returns {Number} - จำนวนเอกสารรวม
 */
const getPassedDocumentsTotal = (statusArray) => {
  if (!statusArray || !Array.isArray(statusArray)) return 0;
  return statusArray
    .filter((item) => item.status === 1 || item.status === 3)
    .reduce((sum, item) => sum + item.total, 0);
};

/**
 * แปลง status เป็นข้อความ
 * @param {Number} status - รหัสสถานะ
 * @returns {String} - ข้อความสถานะ
 */
const getStatusText = (status) => {
  return STATUS_CONFIG[status]?.text || "";
};

/**
 * สร้าง props สำหรับ Tag component
 * @param {Object} data - ข้อมูลแถว
 * @returns {Object} - props object
 */
const getStatusTagProps = (data) => {
  const { status, parentguidfixed } = data;
  const config = STATUS_CONFIG[status];

  // Special case for status 0
  if (status === 0) {
    if (parentguidfixed === "") {
      return {
        value: "รออัพโหลด",
        icon: "pi pi-upload",
        class: "bg-gray-500",
      };
    } else {
      return {
        value: "รอแก้ไข",
        icon: "pi pi-upload",
        class: "bg-gray-800",
      };
    }
  }

  return {
    value: config?.text || "",
    severity: config?.severity,
    icon: config?.icon,
  };
};

// Event handlers
const onRowSelect = (event) => {
  emit("onRowSelect", event.data);
};

const showDialogCreateJob = () => {
  emit("showDialogCreateJob");
};

const showDialogConfigJob = (data) => {
  emit("showDialogConfigJob", data);
};

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    emit("keyup", searchText.value);
  }, 300);
};

const onPage = (event) => {
  rowsPerPage.value = event.rows;
  first.value = event.first;
  const activePage = Math.floor(event.first / event.rows) + 1;
  emit("onPage", activePage, event.rows);
};

// Lifecycle hooks
onMounted(() => {
  // Load saved perPage from localStorage based on modeMenu
  const storageKey = LOCAL_STORAGE_KEYS[props.modeMenu];
  if (storageKey) {
    const savedPerPage = localStorage.getItem(storageKey);
    if (savedPerPage) {
      rowsPerPage.value = parseInt(savedPerPage, 10);
    }
  }

  first.value = props.firstPage || 0;
  searchText.value = props.filters || "";
});
</script>
<style>
.text-header-right .p-column-header-content {
  display: inline-flex;
}
</style>
