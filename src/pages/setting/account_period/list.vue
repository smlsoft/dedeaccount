<script setup>
import { ref, onMounted } from "vue";
const screenHeight = window.screen.height;

const metaKey = ref(true);
const selectedRow = ref(null);
const filters = ref(null);

onMounted(() => {});

const props = defineProps({
  data_list: Object,
  loading: Boolean,
  totalItemsCount: Number,
});

const emit = defineEmits(["startDateFocus"]);

function onRowSelect() {}

function onPage() {}

function startDateFocus() {
  selectedRow.value = null;
  emit("startDateFocus");
}
</script>

<template>
  <div class="flex justify-content-between p-2">
    <div>
      <Button
        label="เพิ่มงวดบัญชี"
        icon="pi pi-plus"
        class="p-button-success mr-2"
        @click="startDateFocus"
      />
      <Button
        label="เพิ่มงวดบัญชีอัตโนมัติ"
        icon="pi pi-play"
        class="p-button-help mr-2"
      />
    </div>
    <span class="p-input-icon-left">
      <i class="pi pi-search" />
      <InputText
        v-model="filters"
        placeholder="ค้นหา...."
        @keyup="keyup()"
        @keydown="keydown()"
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
    <Column field="startdateshow" header="จากวันที่"> </Column>
    <Column field="enddateshow" header="ถึงวันที่"></Column>
    <Column field="period" header="งวดลำดับที่"> </Column>
    <Column field="isdisabled" header="ปิด/เปิด">
      <template #body="slotProps">
        <InputSwitch
          :modelValue="!slotProps.data.isdisabled"
          style="display: flex"
          class="mt-1"
          :disabled="true"
        />
      </template>
    </Column>
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
  </DataTable>
</template>
