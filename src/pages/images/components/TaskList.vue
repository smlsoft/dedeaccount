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
    <Column
      v-if="props.modeMenu != 3"
      field="totaldocument"
      header="จำนวน"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    ></Column>
    <Column
      v-if="props.modeMenu == 1"
      field="totaldocumentstatus"
      header="เอกสารมีปัญหา"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="{ data }">
        <div v-if="data.totaldocumentstatus">
          <div v-for="item in data.totaldocumentstatus">
            <span v-if="item.status === 2">
              {{ item.total }}
            </span>
          </div>
          <span
            v-if="
              data.totaldocumentstatus.every((status) => status.status !== 2)
            "
          >
            0
          </span>
        </div>
        <div v-else>0</div>
      </template>
    </Column>
    <Column
      v-if="props.modeMenu == 2"
      header="ผ่าน"
      :field="totalDocumentStatusColumn"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    ></Column>

    <Column
      v-if="props.modeMenu == 2"
      field="totalreject"
      header="ไม่ผ่าน"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="{ data }">
        <div v-if="data.totaldocumentstatus">
          <div v-for="item in data.totaldocumentstatus">
            <span v-if="item.status === 2">
              {{ item.total }}
            </span>
          </div>
          <span
            v-if="
              data.totaldocumentstatus.every((status) => status.status !== 2)
            "
          >
            0
          </span>
        </div>
        <div v-else>0</div>
      </template>
    </Column>
    <Column
      v-if="props.modeMenu == 2"
      field="total"
      header="คงเหลือ"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="{ data }">
        <div v-if="data.totaldocumentstatus">
          <div v-for="item in data.totaldocumentstatus">
            <span v-if="item.status === 0">
              {{ item.total }}
            </span>
          </div>
          <span
            v-if="
              data.totaldocumentstatus.every((status) => status.status !== 0)
            "
          >
            0
          </span>
        </div>
        <div v-else>0</div>
      </template>
    </Column>
    <Column
      header="เอกสารที่ต้องบันทึก"
      v-if="props.modeMenu == 3"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="{ data }">
        <div v-if="data.totaldocumentstatus">
          <div v-for="item in data.totaldocumentstatus">
            <span v-if="item.status === 1">
              {{ item.total }}
            </span>
          </div>
          <span
            v-if="
              data.totaldocumentstatus.every((status) => status.status !== 1)
            "
          >
            0
          </span>
        </div>
        <div v-else>0</div>
      </template>
    </Column>
    <Column
      header="บันทึกเอกสาร"
      v-if="props.modeMenu == 3"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="slotProps">
        {{ 0 }}
      </template>
    </Column>

    <Column
      header="คงเหลือ"
      v-if="props.modeMenu == 3"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
    >
      <template #body="slotProps">
        {{ 0 }}
      </template>
    </Column>

    <Column field="ownerby" header="ผู้สร้าง"></Column>
    <Column field="status" header="สถานะ">
      <template #body="slotProps">
        <Tag
          v-if="
            slotProps.data.status == 0 && slotProps.data.parentguidfixed == ''
          "
          value="รออัพโหลด"
          icon="pi pi-upload"
          class="bg-gray-500"
        ></Tag>
        <Tag
          v-if="
            slotProps.data.status == 0 && slotProps.data.parentguidfixed != ''
          "
          value="รอแก้ไข"
          class="bg-gray-800"
          icon="pi pi-upload"
        ></Tag>
        <Tag
          v-if="slotProps.data.status == 1"
          severity="warning"
          value="รอตรวจสอบ"
          icon="pi pi-clock"
        ></Tag>
        <Tag
          v-if="slotProps.data.status == 2"
          severity="info"
          value="กำลังตรวจสอบ"
          icon="pi pi-clock"
        ></Tag>
        <Tag
          v-if="slotProps.data.status == 3"
          severity="Info"
          value="รอบันทึกบัญชี"
          icon="pi pi-history"
        ></Tag>
        <Tag
          v-if="slotProps.data.status == 4"
          severity="success"
          value="ลงบัญชีเสร็จแล้ว"
          icon="pi pi-check-circle"
        ></Tag>
        <Tag
          v-if="slotProps.data.status == 5"
          severity="danger"
          value="งานยกเลิก"
        ></Tag>
      </template>
    </Column>
    <Column field="description" header="หมายเหตุ"></Column>
    <Column field="taskchild" header="แก้ไข" v-if="props.modeMenu == 2">
      <template #body="{ slotProps, data, field }">
        <Button
          v-if="data[field].code != ''"
          class="bg-yellow-200 text-yellow-900 font-bold text-sm py-1 px-2"
          style="border-radius: 10px"
          :label="textstatus(data[field].status) + ' : ' + data[field].code"
        />
      </template>
    </Column>
    <Column
      headerStyle="width: 4rem; text-align: center"
      bodyStyle="text-align: center; overflow: visible"
      v-if="props.modeMenu == 1"
    >
      <template #body="slotProps">
        <Button
          :disabled="slotProps.data.status != 0"
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
            v-if="props.modeMenu == 1"
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
            @page="onPage($event)"
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
    <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
  </DataTable>
</template>
<script setup>
import { ref, onMounted, computed, watch } from "vue";
import Utils from "@/utils/";

const searchText = ref(props.filters || "");
const first = ref(props.firstPage || 0);
const rowsPerPage = ref(20);

// Watch for changes in props to update local state
watch(() => props.firstPage, (newValue) => {
  first.value = newValue;
});

watch(() => props.filters, (newValue) => {
  searchText.value = newValue || "";
});

const totalDocumentStatusColumn = (rowData) => {
  let total = 0;
  rowData.totaldocumentstatus?.forEach((item) => {
    if (item.status === 1 || item.status === 3) {
      total += item.total;
    }
  });
  return total;
};

onMounted(() => {
  // ตรวจสอบ modeMenu และดึงค่า perPage จาก localStorage ตาม mode
  if (props.modeMenu === 1) { // upload
    const savedPerPage = localStorage.getItem('images_job_upload_perPage');
    if (savedPerPage) {
      rowsPerPage.value = parseInt(savedPerPage);
    }
  } else if (props.modeMenu === 2) { // approve
    const savedPerPage = localStorage.getItem('images_job_approve_perPage');
    if (savedPerPage) {
      rowsPerPage.value = parseInt(savedPerPage);
    }
  } else if (props.modeMenu === 3) { // daily
    const savedPerPage = localStorage.getItem('images_job_daily_perPage');
    if (savedPerPage) {
      rowsPerPage.value = parseInt(savedPerPage);
    }
  }
  
  first.value = props.firstPage || 0;
  searchText.value = props.filters || "";
});

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

function onRowSelect(event) {
  emit("onRowSelect", event.data);
}

function showDialogCreateJob() {
  emit("showDialogCreateJob");
}

function showDialogConfigJob(data) {
  emit("showDialogConfigJob", data);
}

function onSearchInput(event) {
  // Add debounce for search input to prevent too many requests
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    emit("keyup", searchText.value);
  }, 300);
}

let searchTimeout = null;

function keyup() {
  emit("keyup", searchText.value);
}

function keydown() {
  emit("keydown");
}

function textstatus(data) {
  let text = "";
  if (data == 0) {
    text = "รอแก้ไข";
  } else if (data == 1) {
    text = "รอตรวจสอบ";
  } else if (data == 2) {
    text = "กำลังตรวจสอบ";
  } else if (data == 3) {
    text = "รอบันทึกบัญชี";
  } else if (data == 4) {
    text = "ลงบัญชีเสร็จแล้ว";
  } else if (data == 5) {
    text = "ยกเลิกงาน";
  }
  return text;
}

function onPage(event) {
  rowsPerPage.value = event.rows;
  first.value = event.first;
  let activePage = Math.floor(event.first / event.rows) + 1;
  emit("onPage", activePage, event.rows);
}
</script>
<style>
.text-header-right .p-column-header-content {
  display: inline-flex;
}
</style>
