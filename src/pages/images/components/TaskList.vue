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
      header="รอแก้ไข"
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
      </template>
    </Column>
    <Column field="description" header="หมายเหตุ"></Column>

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
            :rows="20"
            v-model:first="props.firstPage"
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
              @keyup="keyup()"
              @keydown="keydown()"
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
import { ref, onMounted, computed } from "vue";
import Utils from "@/utils/";
const searchText = ref(props.filters);

const totalDocumentStatusColumn = (rowData) => {
  let total = 0;
  rowData.totaldocumentstatus?.forEach((item) => {
    if (item.status === 1 || item.status === 3) {
      total += item.total;
    }
  });
  return total;
};

onMounted(() => {});

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
  "keyup",
  "keydown",
]);

function onRowSelect(event) {
  emit("onRowSelect", event.data);
}

function showDialogCreateJob() {
  emit("showDialogCreateJob");
}

function keyup() {
  emit("keyup", searchText.value);
}

function keydown() {
  emit("keydown");
}

function sumTotalPass(data) {
  console.log(data);
  // let total = 0;
  // data.forEach((element) => {
  //   total += element.total;
  // });
  // return total;
}
</script>
<style>
.text-header-right .p-column-header-content {
  display: inline-flex;
}
</style>
