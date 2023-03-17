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
          field="date"
          header="เวลาทำรายการ"
          bodyStyle="text-align: center;width: 10%"
        />
        <Column field="name" header="รายการ" />
        <Column header="ถอน" bodyStyle="text-align: center;width: 10%">
          <template #body="slotProps">
            {{ slotProps.data.withdraw }}
          </template>
        </Column>
        <Column header="ฝาก" bodyStyle="text-align: center;width: 10%">
          <template #body="slotProps">
            {{ slotProps.data.deposit }}
          </template>
        </Column>
        <Column header="ยอดคงเหลือ" bodyStyle="text-align: center;width: 10%">
          <template #body="slotProps">
            {{ slotProps.data.balance }}
          </template>
        </Column>
        <Column
          field="funnel"
          header="ช่องทาง"
          bodyStyle="text-align: center;width: 5%"
        />
        <Column field="description" header="รายละเอียด" />

        <ColumnGroup type="footer">
          <Row>
            <Column footer="" :colspan="3" footerStyle="text-align:right">
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
const selectedRow = ref();
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
