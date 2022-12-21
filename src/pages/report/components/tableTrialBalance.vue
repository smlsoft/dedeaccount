<template>
  <div lass="p-2 surface-section flex-auto">
    <div class="card p-2">
      <div class="flex flex-column">
        <div class="flex align-items-center justify-content-center m-1">
          งบทดลอง ประจำวันที่ :
          {{ props.headDataReport.startDateShow }} ถึงวันที่ :
          {{ props.headDataReport.endDateShow }}
        </div>
      </div>
    </div>
    <div class="card" :style="screenHeight">
      <DataTable
        :value="props.dataReport.accountdetails"
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
        <ColumnGroup type="header">
          <Row>
            <Column header="ชื่อบัญชี" :rowspan="2" />
            <Column header="เลขที่บัญชี" :rowspan="2" />
            <Column header="ยอดยกมา" :colspan="2" />
            <Column header="ยอดประจำงวด" :colspan="2" />
            <Column header="ยอดสะสม" :colspan="2" />
          </Row>

          <Row>
            <Column header="เดบิต" />
            <Column header="เครดิต" />
            <Column header="เดบิต" />
            <Column header="เครดิต" />
            <Column header="เดบิต" />
            <Column header="เครดิต" />
          </Row>
        </ColumnGroup>
        <Column field="accountcode" />
        <Column field="accountname" />
        <Column bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            {{ Utils.formatNumberReport(slotProps.data.balancedebitamount) }}
          </template>
        </Column>
        <Column bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            {{ Utils.formatNumberReport(slotProps.data.balancecreditamount) }}
          </template>
        </Column>
        <Column bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            {{ Utils.formatNumberReport(slotProps.data.debitamount) }}
          </template>
        </Column>
        <Column bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            {{ Utils.formatNumberReport(slotProps.data.creditamount) }}
          </template>
        </Column>
        <Column bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            {{
              Utils.formatNumberReport(slotProps.data.nextbalancedebitamount)
            }}
          </template>
        </Column>
        <Column bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            {{
              Utils.formatNumberReport(slotProps.data.nextbalancecreditamount)
            }}
          </template>
        </Column>

        <ColumnGroup type="footer">
          <Row>
            <Column
              footer="ยอดรวม :"
              :colspan="2"
              footerStyle="text-align:right"
            />
            <Column
              :footer="
                Utils.formatNumberReport(props.dataReport.totalbalancedebit)
              "
              footerStyle="text-align:right"
            />
            <Column
              :footer="
                Utils.formatNumberReport(props.dataReport.totalbalancecredit)
              "
              footerStyle="text-align:right"
            />
            <Column
              :footer="
                Utils.formatNumberReport(props.dataReport.totalamountdebit)
              "
              footerStyle="text-align:right"
            />
            <Column
              :footer="
                Utils.formatNumberReport(props.dataReport.totalbalancecredit)
              "
              footerStyle="text-align:right"
            />
            <Column
              :footer="
                Utils.formatNumberReport(props.dataReport.totalnextbalancedebit)
              "
              footerStyle="text-align:right"
            />
            <Column
              :footer="
                Utils.formatNumberReport(
                  props.dataReport.totalnextbalancecredit
                )
              "
              footerStyle="text-align:right"
            />
          </Row>
        </ColumnGroup>

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
import Utils from "@/utils/";
const selectedRow = ref();
const screenHeight = ref("height: calc(100vh - 25.6vh)");

const props = defineProps({
  headDataReport: Object,
  dataReport: Object,
  loading: Boolean,
});

const emit = defineEmits(["showSplitterLedger"]);
onMounted(() => {
  //console.log(screen.height);
  if (screen.height < 1440) {
    screenHeight.value = "height: calc(100vh - 35vh)";
  }
});

function rowClick(event) {
  //console.log(event.data);

  emit("showSplitterLedger", event.data);
}
</script>
