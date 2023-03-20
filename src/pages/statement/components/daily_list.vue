<script setup>
import Utils from "@/utils/";
import { ref, onMounted, onUnmounted, computed } from "vue";
const expandedRows = ref([]);

const props = defineProps({
  data_list: Object,
});

function getSumDebitAmount(data) {
  //console.log(data);
  var sum = 0;
  if (data != null && data.length > 0) {
    data.forEach((element) => {
      sum += element.debitamount;
    });
  }
  return sum;
}

function getSumCreditAmount(data) {
  // console.log(data);
  var sum = 0;
  if (data != null && data.length > 0) {
    data.forEach((element) => {
      sum += element.creditamount;
    });
  }
  return sum;
}

function getSumAmount() {
  let sum = 0;
  props.data_list.forEach((element) => {
    // let result = element.amount.replace(/,/g, "");
    sum += parseFloat(element.amount);
  });

  return sum;
}

function accountPeriod(data) {
  if (data === 0) {
    return "text-red-500";
  }
}

function rowClass(data) {
  return [{ "bg-red-100": data.accountperiod === 0 }];
}
</script>

<template>
  <DataTable
    :value="props.data_list"
    dataKey="docno"
    class="p-datatable-sm"
    responsiveLayout="scroll"
    scrollHeight="77vh"
    v-model:expandedRows="expandedRows"
    :rowHover="true"
    tableStyle="font-size: 12px;"
    :rowClass="rowClass"
  >
    <template #empty> ไม่พบข้อมูล </template>
    <template #loading> กำลังประมวลผล กรุณารอซักครู่..</template>
    <Column :expander="true" headerStyle="width: 3rem" />
    <Column field="docno" header="เลขที่เอกสาร" style="width: 25%">
      <template #body="slotProps">
        <div :class="accountPeriod(slotProps.data.accountperiod)">
          {{ slotProps.data.docno }}
        </div>
      </template>
    </Column>
    <Column field="docdate" header="วันที่" dataType="date" style="width: 10%">
      <template #body="slotProps">
        <div :class="accountPeriod(slotProps.data.accountperiod)">
          {{ Utils.getDateFormatDMY(slotProps.data.docdate) }}
        </div>
      </template>
    </Column>

    <Column field="accountperiod" header="งวดบัญชี" style="width: 10%">
      <template #body="slotProps">
        <div :class="accountPeriod(slotProps.data.accountperiod)">
          {{ slotProps.data.accountperiod }}
        </div>
      </template>
    </Column>
    <Column
      field="accountdescription"
      header="รายละเอียด"
      style="width: 45%"
      footerStyle="text-align: right !important"
      footer="รวม"
    >
      <template #body="slotProps">
        <div :class="accountPeriod(slotProps.data.accountperiod)">
          {{ slotProps.data.accountdescription }}
        </div>
      </template>
    </Column>
    <Column
      field="amount"
      header="มูลค่า"
      class="text-header-right"
      headerStyle="text-align: right;"
      bodyStyle="text-align: right;"
      style="width: 10%"
    >
      <template #body="slotProps">
        <div :class="accountPeriod(slotProps.data.accountperiod)">
          {{ Utils.formatCurrency(slotProps.data.amount) }}
        </div>
      </template>
      <template #footer>
        {{ Utils.formatCurrency(getSumAmount()) }}
      </template>
    </Column>

    <template #expansion="mainProps">
      <h5 class="my-1" v-if="mainProps.data.journaldetail.length == 0">
        ไม่พบรายการตัวเลือก
      </h5>
      <div
        class="orders-subtable"
        v-if="mainProps.data.journaldetail.length > 0"
      >
        <h5 class="my-1">เลขที่: {{ mainProps.data.docno }}</h5>
        <DataTable
          :value="mainProps.data.journaldetail"
          responsiveLayout="scroll"
          dataKey="guidfixed"
          tableStyle="font-size: 12px;"
        >
          <Column field="accountcode" header="รหัสบัญชี"></Column>
          <Column
            field="accountname"
            header="ชื่อบัญชี"
            footerStyle="text-align: right !important"
            footer="รวม"
          ></Column>
          <Column
            field="debitamount"
            header="เดบิต"
            footerStyle="text-align: right !important"
            style="text-align: right !important"
            headerStyle="text-align:center;width: 10%"
          >
            <template #footer>
              {{
                Utils.formatCurrency(
                  getSumDebitAmount(mainProps.data.journaldetail)
                )
              }}
            </template>
            <template #body="{ data, field }">
              {{ Utils.formatCurrency(data[field]) }}
            </template>
          </Column>
          <Column
            field="creditamount"
            header="เครดิต"
            footerStyle="text-align: right !important"
            style="text-align: right !important"
            headerStyle="text-align:center;width: 10%"
          >
            <template #footer>
              {{
                Utils.formatCurrency(
                  getSumCreditAmount(mainProps.data.journaldetail)
                )
              }}
            </template>
            <template #body="{ data, field }">
              {{ Utils.formatCurrency(data[field]) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </DataTable>
</template>

<style>
.p-row-toggler-icon {
  font-size: 0.7rem;
}
</style>
