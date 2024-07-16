<script setup>
import { ref } from "vue";

const screenHeight = window.screen.height;

const metaKey = ref(true);
const selectedRow = ref(null);
const filters = ref(null);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);

const props = defineProps({
  data_list: Array,
  loading: Boolean,
  totalItemsCount: Number,
  filters: String,
});

const emit = defineEmits([
  "ExpensesCodeFocus",
  "onRowSelect",
  "deleteExpenses",
  "editExpenses",
  "onPage",
  "doneTyping",
]);

function ExpensesCodeFocus() {
  selectedRow.value = null;
  emit("ExpensesCodeFocus");
}

function onRowSelect(event) {
  emit("onRowSelect", event.data);
}

function editExpenses(data) {
  selectedRow.value = data;
  emit("editExpenses", JSON.parse(JSON.stringify(data)));
}

function deleteExpenses(data) {
  selectedRow.value = data;
  emit("deleteExpenses", data);
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
  <div class="flex justify-content-between p-2">
    <Button label="เพิ่มรายได้" icon="pi pi-plus" @click="ExpensesCodeFocus" />
    <span class="p-input-icon-left">
      <i class="pi pi-search" />
      <InputText
        v-model="filters"
        placeholder="ค้นหา...."
        @keyup="keyup"
        @keydown="keydown"
        class="p-inputtext-sm"
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
          @page="onPage"
          :rowsPerPageOptions="[20, 50, 100]"
        />
      </div>
    </template>
    <template #empty> ไม่พบข้อมูล </template>
    <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
    <Column field="code" header="รหัสรายได้" />
    <Column header="ชื่อรายได้">
      <template #body="slotProps">
        {{ slotProps.data.names[0].name }}
      </template>
    </Column>
    <Column header="ผังบัญชี">
      <template #body="slotProps">
        {{ slotProps.data.accountcode }} ~ {{ slotProps.data.accountname }}
      </template>
    </Column>
    <Column bodyStyle="text-align:center" style="width: 5%">
      <template #body="slotProps">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-warning p-button-text"
          @click="editExpenses(slotProps.data)"
          selectionMode="single"
        />
      </template>
    </Column>
    <Column bodyStyle="text-align:center" style="width: 5%">
      <template #body="slotProps">
        <Button
          icon="pi pi-trash"
          class="p-button-rounded p-button-danger p-button-text"
          @click="deleteExpenses(slotProps.data)"
        />
      </template>
    </Column>
  </DataTable>
</template>
