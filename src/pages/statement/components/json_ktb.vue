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
        <Column header="ลำดับ" bodyStyle="text-align: center;width: 5%">
          <template #body="{ index }">
            <span>{{ index + 1 }}</span>
          </template>
        </Column>
        <Column
          field="date"
          header="วันที่"
          bodyStyle="text-align: center;width: 15%"
        />
        <Column
          field="name"
          header="รายการ"
          bodyStyle="text-align: left;width: 15%"
        />
        <Column
          field="description"
          header="รายละเอียด/หมายเลขเช็ค"
          bodyStyle="text-align: left;width: 30%"
        />
        <Column header="รายการถอน" bodyStyle="text-align: right;width: 10%">
          <template #body="slotProps">
            {{ slotProps.data.withdraw }}
          </template>
        </Column>
        <Column header="รายการฝาก" bodyStyle="text-align: right;width: 10%">
          <template #body="slotProps">
            {{ slotProps.data.deposit }}
          </template>
        </Column>

        <Column
          header="ยอดเงินคงเหลือ"
          bodyStyle="text-align: right;width: 10%"
        >
          <template #body="slotProps">
            {{ slotProps.data.balance }}
          </template>
        </Column>
        <Column
          field="branch"
          header="สาขา"
          bodyStyle="text-align: center;width: 5%"
        />

        <ColumnGroup type="footer">
          <Row>
            <Column footer="" :colspan="4" footerStyle="text-align:right">
              <template #footer>รวม</template>
            </Column>

            <Column
              :footer="Utils.formatNumberReport(totalWithdraw)"
              footerStyle="text-align:right"
            />
            <Column
              :footer="Utils.formatNumberReport(totalDeposit)"
              footerStyle="text-align:right"
            />
            <Column footer="" footerStyle="text-align:right"> </Column>
            <Column footer="" footerStyle="text-align:right"> </Column>
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
const screenHeight = ref("height: 77.9vh");

let totalDeposit = props.pdfData.reduce((acc, obj) => {
  let deposit = obj.deposit.replace(",", ""); // Remove comma separator
  if (!isNaN(parseFloat(deposit))) {
    return acc + parseFloat(deposit);
  } else {
    return acc;
  }
}, 0);

let totalWithdraw = props.pdfData.reduce((acc, obj) => {
  let withdraw = obj.withdraw.replace(",", ""); // Remove comma separator
  if (!isNaN(parseFloat(withdraw))) {
    return acc + parseFloat(withdraw);
  } else {
    return acc;
  }
}, 0);

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
