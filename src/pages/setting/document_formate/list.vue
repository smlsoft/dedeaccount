<script setup>
import { ref, onMounted } from "vue";
const screenHeight = window.screen.height;

const metaKey = ref(true);
const selectedRow = ref(null);
const filters = ref(null);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);

onMounted(() => {});

const props = defineProps({
  data_list: Object,
  loading: Boolean,
  totalItemsCount: Number,
  filters: String,
});

const emit = defineEmits([
  "docCodeFocus",
  "onRowSelect",
  "deleteAccountGroup",
  "editAccountGroup",
  "onPage",
  "doneTyping",
]);

function docCodeFocus() {
  selectedRow.value = null;
  emit("docCodeFocus");
}

function onRowSelect(event) {
  emit("onRowSelect", event.data);
}

function editAccountGroup(data) {
  selectedRow.value = data;
  emit("editAccountGroup", data);
}

function deleteAccountGroup(data) {
  selectedRow.value = data;
  emit("deleteAccountGroup", data);
}

function onPage(event) {
  emit("onPage", event);
}

function keyup() {
  clearTimeout(typingTimer.value);
  typingTimer.value = setTimeout(doneTyping, doneTypingInterval.value);
}
function keydown() {
  clearTimeout(typingTimer.value);
}

function doneTyping() {
  selectedRow.value = null;

  emit("doneTyping", filters.value);
}
</script>

<template>
  <div
    class="px-2 lg:px-2 py-4 flex flex-column flex-wrap md:flex-row gap-3 w-full md:justify-content-between md:align-items-center"
  >
    <Button
      label="เพิ่มรูปแบบบันทึกบัญชี"
      icon="pi pi-plus"
      @click="docCodeFocus"
    />

    <span class="p-input-icon-right w-full mt-2 md:mt-0 md:w-15rem">
      <i class="pi pi-search"></i>
      <InputText
        type="text"
        class="w-full md:w-15rem border-round p-inputtext-sm"
        v-model="filters"
        placeholder="ค้นหา...."
        @keyup="keyup()"
        @keydown="keydown()"
      />
    </span>
  </div>

  <DataTable
    :value="props.data_list"
    dataKey="guidfixed"
    class="p-datatable-sm w-full p-2"
    :loading="props.loading"
    responsiveLayout="scroll"
    :scrollHeight="screenHeight <= 768 ? '70vh' : '80vh'"
    v-model:selection="selectedRow"
    selectionMode="single"
    :metaKeySelection="metaKey"
    @rowSelect="onRowSelect"
  >
    <template #footer>
      <div class="flex align-items-center justify-content-center">
        <Paginator
          :rows="20"
          :totalRecords="props.totalItemsCount"
          @page="onPage($event)"
          :rowsPerPageOptions="[20, 50, 100]"
        >
        </Paginator>
      </div>
    </template>
    <template #empty> ไม่พบข้อมูล </template>
    <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
    <Column field="doccode" header="รหัสรูปแบบบันทึกบัญชี"></Column>
    <Column field="description" header="ชื่อรูปแบบบันทึกบัญชี"></Column>

    <Column bodyStyle="text-align:center" style="width: 5%">
      <template #body="slotProps">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-warning p-button-text"
          @click="editAccountGroup(slotProps.data)"
          selectionMode="single"
        />
      </template>
    </Column>
    <Column bodyStyle="text-align:center" style="width: 5%">
      <template #body="slotProps">
        <Button
          icon="pi pi-trash"
          class="p-button-rounded p-button-danger p-button-text"
          @click="deleteAccountGroup(slotProps.data)"
        />
      </template>
    </Column>
  </DataTable>
</template>
