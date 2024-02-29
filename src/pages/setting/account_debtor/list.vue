<script setup>
import { ref, onMounted } from "vue";
const screenHeight = window.screen.height;

const metaKey = ref(true);
const selectedRow = ref(null);
const filters = ref(null);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);


const props = defineProps({
  data_list: Object,
  loading: Boolean,
  totalItemsCount: Number,
  filters: String,
});
onMounted(() => { });

const emit = defineEmits([
  "debtorCodeFocus",
  "onRowSelect",
  "deleteDebtor",
  "editDebtor",
  "onPage",
  "doneTyping",
]);

function debtorCodeFocus() {
  selectedRow.value = null;
  emit("debtorCodeFocus");
}

function onRowSelect(event) {
  emit("onRowSelect", event.data);
}

function editdebtor(data) {
  selectedRow.value = data;
  emit("editDebtor", data);
}

function deletedebtor(data) {
  selectedRow.value = data;
  emit("deleteDebtor", data);
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
    <Button label="เพิ่มลูกหนี้" icon="pi pi-plus" @click="debtorCodeFocus" />
    <span class="p-input-icon-left">
      <i class="pi pi-search" />
      <InputText v-model="filters" placeholder="ค้นหา...." @keyup="keyup()" @keydown="keydown()" class="p-inputtext-sm" />
    </span>
  </div>
  <DataTable :value="props.data_list" dataKey="guidfixed" class="p-datatable-sm w-full p-2" :loading="props.loading"
    responsiveLayout="scroll" :scrollHeight="screenHeight <= 768 ? '70vh' : '80vh'" v-model:selection="selectedRow"
    selectionMode="single" :metaKeySelection="metaKey" @rowSelect="onRowSelect">

    <template #footer>
      <div class="flex align-items-center justify-content-center">
        <Paginator :rows="20" :totalRecords="props.totalItemsCount" @page="onPage($event)"
          :rowsPerPageOptions="[20, 50, 100]">
        </Paginator>
      </div>
    </template>

    <template #empty> ไม่พบข้อมูล </template>
    <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
    <Column field="code" header="รหัสลูกหนี้"></Column>
    <Column field="names" header="ชื่อลูกหนี้">
      <template #body="slotProps">
        {{ slotProps.data.names[0].name }}
      </template>
    </Column>
    <!-- <Column field="addressforbilling" header="ที่อยู่">
      <template #body="slotProps">
        {{ slotProps.data.addressforbilling && slotProps.data.addressforbilling.address ?
          slotProps.data.addressforbilling.address[0] : '' }}
      </template>
    </Column>



    <Column field="phoneprimary" header="หมายเลขโทรศัพท์">
      <template #body="slotProps">
        {{ slotProps.data.addressforbilling.phoneprimary }}
      </template>
    </Column> -->

    <Column bodyStyle="text-align:center" style="width: 5%" header="แก้ไข">
      <template #body="slotProps">
        <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning p-button-text"
          @click="editdebtor(slotProps.data)" selectionMode="single" />
      </template>
    </Column>
    <Column bodyStyle="text-align:center" style="width: 5%" header="ลบ">
      <template #body="slotProps">
        <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text"
          @click="deletedebtor(slotProps.data)" />
      </template>
    </Column>
  </DataTable>
</template> 
