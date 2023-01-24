<template>
  <DataTable
    :value="props.data_list"
    dataKey="guidfixed"
    class="p-datatable-sm"
    :loading="loading"
    responsiveLayout="scroll"
    :scrollable="true"
    scrollHeight="80vh"
    selectionMode="single"
    :metaKeySelection="false"
    @rowSelect="onRowSelect"
  >
    <template #header>
      <div class="flex">
        <div class="flex-none flex align-items-center justify-content-start">
          <Button
            v-if="props.modeMenu == 0"
            label="สร้าง Job"
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
    <Column header="ลำดับ" style="width: 5%">
      <template #body="slotProps">
        {{ slotProps.index + 1 }}
      </template>
    </Column>
    <Column field="createdat" header="วันที่" :sortable="true"></Column>
    <Column field="name" header="ชื่อ" :sortable="true"></Column>
    <Column field="total" header="จำนวน" :sortable="true"></Column>
    <Column
      v-if="props.modeMenu == 0"
      field="totalreject"
      header="เอกสารมีปัญหา"
      :sortable="true"
    ></Column>
    <Column
      v-if="props.modeMenu == 1"
      field="total"
      header="ผ่าน"
      :sortable="true"
    ></Column>
    <Column
      v-if="props.modeMenu == 1"
      field="total"
      header="ไม่ผ่าน"
      :sortable="true"
    ></Column>
    <Column
      v-if="props.modeMenu == 1"
      field="total"
      header="คงเหลือ"
      :sortable="true"
    ></Column>

    <Column field="name" header="ผู้สร้าง" :sortable="true"></Column>
    <Column field="description" header="หมายเหตุ" :sortable="true"></Column>
    <Column field="status" header="สถานะ" :sortable="true">
      <template #body="slotProps">
        <Tag
          v-if="slotProps.data.status == 0"
          value="กำลังอัพโหลด"
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
          severity="success"
          value="ตรวจสอบเสร็จแล้ว"
          icon="pi pi-check-circle"
        ></Tag>
      </template>
    </Column>
  </DataTable>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
const searchText = ref(props.filters);

onMounted(() => {});

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
</script>
<style scoped></style>
