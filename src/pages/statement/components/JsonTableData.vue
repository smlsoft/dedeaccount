<template>
    <div lass="p-2 surface-section flex-auto">
      <div class="card" :style="screenHeight">
        <DataTable
          :value="props.pdfData"
          showGridlines
          stripedRows
          responsiveLayout="scroll"
          scrollHeight="77.9vh"
          selectionMode="single"
          tableStyle="font-size: 10px;"
          tableClass="tablepdf"
        >
          <Column
            header="ลำดับ"
            style="max-width: 50px"
            bodyStyle="text-align: center;width: 5%"
          >
            <template #body="{ index }">
              <span>{{ index + 1 }}</span>
            </template>
          </Column>
  
          <Column
            header="วันที่ทำรายการ"
            bodyStyle="text-align: right;width: 15%"
          >
            <template #body="slotProps">
              {{ dayjs(slotProps.data.date).format("DD/MM/YYYY") }}
            </template>
          </Column>
          <Column field="description" header="รายการ" />
          <Column header="เงินเข้า" bodyStyle="text-align: right;width: 10%">
            <template #body="slotProps">
              {{ slotProps.data.deposit}}
            </template>
          </Column>
          <Column header="เงินออก" bodyStyle="text-align: right;width: 10%">
            <template #body="slotProps">
              {{ slotProps.data.withdraw }}
            </template>
          </Column>
  
          <Column header="คงเหลือ" bodyStyle="text-align: right;width: 10%">
            <template #body="slotProps">
              {{ slotProps.data.balance }}
            </template>
          </Column>
  
          <template #empty> No records found </template>
          <template #loading>
            <ProgressSpinner animationDuration="10s"
          /></template>
        </DataTable>
      </div>
    </div>
  </template>
  <script setup>
  import { ref, onMounted } from "vue";
  const screenHeight = ref("height: 77.9vh");
  import dayjs from 'dayjs'
  
  const props = defineProps({
    pdfData: Object,
  });
  
  onMounted(() => {
    //console.log(screen.height);
    if (screen.height < 1440) {
      screenHeight.value = "height: calc(100vh - 35vh)";
    }
  });
  </script>
  