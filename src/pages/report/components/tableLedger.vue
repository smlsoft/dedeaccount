<template>
  <div lass="p-2 surface-section flex-auto">
    <div class="card p-1">
      <div class="flex flex-column">
        <div class="flex justify-content-between">
          <div class="flex align-items-center justify-content-center"></div>
          <div class="flex align-items-center justify-content-center m-1">
            บัญชีแยกประเภท ประจำวันที่ :
            {{ props.headDataReport.startDateShow }} ถึงวันที่ :
            {{ props.headDataReport.endDateShow }}
          </div>
          <div class="flex align-items-center justify-content-center">
            <Button
              icon="pi pi-times"
              class="p-button-rounded p-button-danger p-button-text"
              @click="closeSplitterLedger"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="card" :style="screenHeight">
      <DataTable
        :value="props.dataReport[0].details"
        showGridlines
        stripedRows
        responsiveLayout="scroll"
        :scrollable="true"
        scrollHeight="flex"
        v-model:selection="selectedRow"
        selectionMode="single"
        @row-click="rowClick"
        :loading="props.loading"
      >
        <template #header>
          <div class="flex justify-content-between">
            <div>
              {{ props.dataReport[0].accountcode }} :
              {{ props.dataReport[0].accountname }}
            </div>
            <div class="flex align-items-center">
              <i class="pi pi-bookmark mr-1 text-teal-500"></i>
              <span class="mr-3 text-teal-500"> VAT</span>
              <i class="pi pi-bookmark-fill mr-1 text-green-500"></i>
              <span class="mr-3 text-green-500"> TAX</span>
              <i class="pi pi-image mr-1 text-cyan-500"></i>
              <span class="mr-3 text-cyan-500"> IMAGE</span>
            </div>
          </div>
        </template>
        <Column field="docdate" header="วันที่">
          <template #body="slotProps">
            {{ Utils.getDateFormatDMY(slotProps.data.docdate) }}
          </template>
        </Column>
        <Column field="docno" header="เลขที่เอกสาร" class="padding-docno">
          <template #body="slotProps">
            <div class="card" style="width: 100%">
              <div class="flex justify-content-start">
                <div class="flex align-items-center justify-content-center">
                  {{ slotProps.data.docno }}
                </div>
              </div>
              <div class="flex justify-content-end pt-1">
                <div class=" flex align-items-center">
                  <i
                    class="pi pi-bookmark mr-1 text-teal-500"
                    v-if="slotProps.data.countvat > 0"
                  ></i>
                  <span class="mr-3 text-teal-500" v-if="slotProps.data.countvat > 0"
                    >({{ slotProps.data.countvat }})</span
                  >

                  <i
                    class="pi pi-bookmark-fill mr-1 text-green-500"
                    v-if="slotProps.data.counttax > 0"
                  ></i>
                  <span class="mr-3 text-green-500" v-if="slotProps.data.counttax > 0"
                    >({{ slotProps.data.counttax }})</span
                  >

                  <i
                    class="pi pi-image mr-1 text-cyan-500"
                    v-if="slotProps.data.countimage > 0"
                  ></i>
                  <span class="text-cyan-500" v-if="slotProps.data.countimage > 0"
                    >({{ slotProps.data.countimage }})</span
                  >
                </div>
              </div>
            </div>
          </template>
        </Column>
        <Column field="accountdescription" header="รายละเอียด"> </Column>
        <Column
          field="debit"
          header="เดบิต"
          bodyStyle="text-align: right;flex-direction: row-reverse;"
        >
          <template #body="{ data, field }">
            {{ Utils.formatNumberReport(data[field]) }}
          </template>
        </Column>
        <Column
          field="credit"
          header="เครดิต"
          bodyStyle="text-align: right;flex-direction: row-reverse;"
        >
          <template #body="{ data, field }">
            {{ Utils.formatNumberReport(data[field]) }}
          </template>
        </Column>
        <Column
          field="amount"
          header="ยอดรวม"
          bodyStyle="text-align: right;flex-direction: row-reverse;"
        >
          <template #body="{ data, field }">
            {{ Utils.formatNumberReport(data[field]) }}
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
import ImageDataService from "@/services/ImageDataService";
import Utils from "@/utils/";
const selectedRow = ref();
const screenHeight = ref("height: calc(100vh - 25.6vh)");

const props = defineProps({
  headDataReport: Object,
  dataReport: Object,
  loading: Boolean,
});

const emit = defineEmits(["showDialogDocNo", "closeSplitterLedger"]);
onMounted(() => {
  //console.log(screen.height);
  if (screen.height < 1440) {
    screenHeight.value = "height: calc(100vh - 35vh)";
  }
});

function rowClick(event) {
  console.log(event.data);

  emit("showDialogDocNo", event.data.docno);
}

function closeSplitterLedger() {
  emit("closeSplitterLedger");
}
</script>

<style>
.p-datatable .p-column-header-content {
  flex-direction: column !important;
}
.padding-docno {
  padding-bottom: 5px !important;
}
</style>
