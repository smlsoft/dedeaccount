<template>
  <div lass="p-2 surface-section flex-auto">
    <div class="card">
      <div class="flex flex-column">
        <div class="flex justify-content-between">
          <div class="flex align-items-center justify-content-center"></div>
          <div class="flex align-items-center justify-content-center">
            {{ props.headDataReport.shopName }}
          </div>
          <div class="flex align-items-center justify-content-center">
            <Button
              icon="pi pi-times"
              class="p-button-rounded p-button-danger p-button-text"
              @click="closeSplitterLedger"
            />
          </div>
        </div>
        <div class="flex align-items-center justify-content-center m-1">
          บัญชีแยกประเภท ประจำวันที่ :
          {{ props.headDataReport.startDateShow }} ถึงวันที่ :
          {{ props.headDataReport.endDateShow }}
        </div>
      </div>
    </div>
    <div class="card" style="height: calc(100vh - 18vh)">
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
          {{ props.dataReport[0].accountcode }} :
          {{ props.dataReport[0].accountname }}
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
              <!-- <div class="flex justify-content-end pt-1">
                <div class="flex align-items-center justify-content-center">
                  <div style="padding-bottom: 1rem"></div>
                  <Badge
                    value="1"
                    class="mr-2"
                    aria-label="Tabable Primary Badge"
                    tabindex="0"
                  ></Badge>
                  <Badge value="2" severity="success" class="mr-2"></Badge>
                  <Badge value="12" severity="warning"></Badge>
                </div>
              </div> -->
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
const props = defineProps({
  headDataReport: Object,
  dataReport: Object,
  loading: Boolean,
});

const emit = defineEmits(["showDialogDocNo", "closeSplitterLedger"]);
onMounted(() => {});

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
