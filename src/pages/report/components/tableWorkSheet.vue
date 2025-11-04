<template>
  <div class="worksheet-container">
    <div class="worksheet-card" :style="screenHeight">
      <DataTable
        :value="props.dataReport.accountdetails"
        showGridlines
        responsiveLayout="scroll"
        :scrollable="true"
        scrollHeight="flex"
        :loading="props.loading"
        class="worksheet-table"
        tableStyle="table-layout: fixed; width: 100%"
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="" :rowspan="2" :style="{ width: '28%', minWidth: '28%', maxWidth: '28%' }" headerClass="header-group">
              <template #header>ชื่อบัญชี</template>
            </Column>
            <Column header="" :colspan="2" :style="{ width: '24%', minWidth: '24%', maxWidth: '24%' }" headerClass="header-group">
              <template #header>ยอดสะสม</template>
            </Column>
            <Column header="" :colspan="2" :style="{ width: '24%', minWidth: '24%', maxWidth: '24%' }" headerClass="header-group">
              <template #header>งบกำไรขาดทุน</template>
            </Column>
            <Column header="" :colspan="2" :style="{ width: '24%', minWidth: '24%', maxWidth: '24%' }" headerClass="header-group">
              <template #header>งบแสดงฐานะทางการเงิน</template>
            </Column>
          </Row>
          <Row>
            <Column header="" :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" headerClass="header-sub">
              <template #header>เดบิต</template>
            </Column>
            <Column header="" :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" headerClass="header-sub">
              <template #header>เครดิต</template>
            </Column>
            <Column header="" :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" headerClass="header-sub">
              <template #header>เดบิต</template>
            </Column>
            <Column header="" :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" headerClass="header-sub">
              <template #header>เครดิต</template>
            </Column>
            <Column header="" :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" headerClass="header-sub">
              <template #header>เดบิต</template>
            </Column>
            <Column header="" :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" headerClass="header-sub">
              <template #header>เครดิต</template>
            </Column>
          </Row>
        </ColumnGroup>

        <Column field="accountname" :style="{ width: '28%', minWidth: '28%', maxWidth: '28%' }" bodyStyle="text-align: left">
          <template #body="slotProps">
            <div class="font-medium text-sm text-truncate">
              {{ slotProps.data.accountcode }}~{{ slotProps.data.accountname }}
            </div>
          </template>
        </Column>
        
        <Column :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            <span class="font-semibold text-sm">
              {{ formatCurrency(slotProps.data.nextbalancedebitamount) }}
            </span>
          </template>
        </Column>
        
        <Column :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            <span class="font-semibold text-sm">
              {{ formatCurrency(slotProps.data.nextbalancecreditamount) }}
            </span>
          </template>
        </Column>
        
        <Column :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            <span class="text-sm" :class="isProfitLoss(slotProps.data) ? 'font-semibold text-green-700' : 'text-400'">
              {{ formatCurrency(isProfitLoss(slotProps.data) ? slotProps.data.nextbalancedebitamount : 0) }}
            </span>
          </template>
        </Column>
        
        <Column :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            <span class="text-sm" :class="isProfitLoss(slotProps.data) ? 'font-semibold text-green-700' : 'text-400'">
              {{ formatCurrency(isProfitLoss(slotProps.data) ? slotProps.data.nextbalancecreditamount : 0) }}
            </span>
          </template>
        </Column>
        
        <Column :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            <span class="text-sm" :class="isBalanceSheet(slotProps.data) ? 'font-semibold text-blue-700' : 'text-400'">
              {{ formatCurrency(isBalanceSheet(slotProps.data) ? slotProps.data.nextbalancedebitamount : 0) }}
            </span>
          </template>
        </Column>
        
        <Column :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }" bodyStyle="text-align: right;flex-direction: row-reverse;">
          <template #body="slotProps">
            <span class="text-sm" :class="isBalanceSheet(slotProps.data) ? 'font-semibold text-blue-700' : 'text-400'">
              {{ formatCurrency(isBalanceSheet(slotProps.data) ? slotProps.data.nextbalancecreditamount : 0) }}
            </span>
          </template>
        </Column>

        <ColumnGroup type="footer">
          <Row>
            <Column footer="รวม" :style="{ width: '28%', minWidth: '28%', maxWidth: '28%' }" footerStyle="text-align: right; font-weight: bold" footerClass="footer-total" />
            <Column 
              :footer="formatCurrency(props.dataReport.totalnextbalancedebit)"
              :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }"
              footerStyle="text-align: right; font-weight: bold"
              footerClass="footer-balance"
            />
            <Column 
              :footer="formatCurrency(props.dataReport.totalnextbalancecredit)"
              :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }"
              footerStyle="text-align: right; font-weight: bold"
              footerClass="footer-balance"
            />
            <Column 
              :footer="formatCurrency(calculateProfitLossDebit())"
              :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }"
              footerStyle="text-align: right; font-weight: bold"
              footerClass="footer-profit"
            />
            <Column 
              :footer="formatCurrency(calculateProfitLossCredit())"
              :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }"
              footerStyle="text-align: right; font-weight: bold"
              footerClass="footer-profit"
            />
            <Column 
              :footer="formatCurrency(calculateBalanceSheetDebit())"
              :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }"
              footerStyle="text-align: right; font-weight: bold"
              footerClass="footer-statement"
            />
            <Column 
              :footer="formatCurrency(calculateBalanceSheetCredit())"
              :style="{ width: '12%', minWidth: '12%', maxWidth: '12%' }"
              footerStyle="text-align: right; font-weight: bold"
              footerClass="footer-statement"
            />
          </Row>
        </ColumnGroup>

        <template #empty>
          <div class="text-center p-4 text-500">
            <i class="pi pi-inbox text-4xl mb-3"></i>
            <p>ไม่พบข้อมูล</p>
          </div>
        </template>
        
        <template #loading>
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="5" />
        </template>
      </DataTable>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import * as Utils from "@/utils";

const props = defineProps({
  dataReport: {
    type: Object,
    default: () => ({}),
  },
  headDataReport: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const screenHeight = computed(() => {
  const heighttopbar = 220;
  let height = window.innerHeight - heighttopbar;
  return "height:" + height + "px";
});

const isProfitLoss = (item) => {
  return item.accountcategory == 4 || item.accountcategory == 5;
};

const isBalanceSheet = (item) => {
  return item.accountcategory == 1 || item.accountcategory == 2 || item.accountcategory == 3;
};

const calculateProfitLossDebit = () => {
  if (!props.dataReport.accountdetails) return 0;
  return props.dataReport.accountdetails
    .filter(item => item.accountcategory == 4 || item.accountcategory == 5)
    .reduce((sum, item) => sum + (parseFloat(item.nextbalancedebitamount) || 0), 0);
};

const calculateProfitLossCredit = () => {
  if (!props.dataReport.accountdetails) return 0;
  return props.dataReport.accountdetails
    .filter(item => item.accountcategory == 4 || item.accountcategory == 5)
    .reduce((sum, item) => sum + (parseFloat(item.nextbalancecreditamount) || 0), 0);
};

const calculateBalanceSheetDebit = () => {
  if (!props.dataReport.accountdetails) return 0;
  return props.dataReport.accountdetails
    .filter(item => item.accountcategory == 1 || item.accountcategory == 2 || item.accountcategory == 3)
    .reduce((sum, item) => sum + (parseFloat(item.nextbalancedebitamount) || 0), 0);
};

const calculateBalanceSheetCredit = () => {
  if (!props.dataReport.accountdetails) return 0;
  return props.dataReport.accountdetails
    .filter(item => item.accountcategory == 1 || item.accountcategory == 2 || item.accountcategory == 3)
    .reduce((sum, item) => sum + (parseFloat(item.nextbalancecreditamount) || 0), 0);
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return "0.00";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
</script>

<style scoped>
.worksheet-container {
  width: 100%;
  height: 100%;
}

.worksheet-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.worksheet-table {
  font-size: 0.875rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ป้องกัน text overflow */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Table Layout */
:deep(.p-datatable-table) {
  table-layout: fixed !important;
  width: 100% !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

/* Box Model */
:deep(.p-datatable-table th),
:deep(.p-datatable-table td) {
  box-sizing: border-box !important;
  border: none !important;
}

/* Header Styles - Minimal & Clean */
:deep(.p-datatable-thead > tr > th) {
  padding: 0.625rem 0.5rem !important;
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: normal !important;
  word-wrap: break-word;
  line-height: 1.3;
  text-align: center !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

:deep(.p-datatable-thead > tr > th > div) {
  justify-content: center !important;
  text-align: center !important;
  font-weight: 600 !important;
}

/* Header Group - Minimal Blue */
:deep(.header-group) {
  background-color: #f8fafc !important;
  color: #334155 !important;
  font-weight: 600 !important;
  text-align: center !important;
  border-bottom: 2px solid #cbd5e1 !important;
}

/* Header Sub - Very Light */
:deep(.header-sub) {
  background-color: #ffffff !important;
  color: #64748b !important;
  font-weight: 500 !important;
  text-align: center !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

/* Body Styles - Ultra Clean */
:deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem 0.5rem !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid #f1f5f9 !important;
  color: #1e293b;
}

/* สีคอลัมน์แบบ Minimal - เกือบไม่มีสี */
:deep(.p-datatable-tbody > tr > td:nth-child(1)) {
  background-color: #ffffff !important;
  font-weight: 500;
}

:deep(.p-datatable-tbody > tr > td:nth-child(2)),
:deep(.p-datatable-tbody > tr > td:nth-child(3)) {
  background-color: #fefce8 !important;
}

:deep(.p-datatable-tbody > tr > td:nth-child(4)),
:deep(.p-datatable-tbody > tr > td:nth-child(5)) {
  background-color: #f0fdf4 !important;
}

:deep(.p-datatable-tbody > tr > td:nth-child(6)),
:deep(.p-datatable-tbody > tr > td:nth-child(7)) {
  background-color: #fef2f2 !important;
}

/* Row Hover - Subtle */
:deep(.p-datatable-tbody > tr) {
  transition: background-color 0.15s ease;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: transparent !important;
}

:deep(.p-datatable-tbody > tr:hover > td) {
  background-color: #f8fafc !important;
}

/* Footer Styles - Clean & Simple */
:deep(.p-datatable-tfoot > tr > td) {
  font-size: 0.9375rem !important;
  padding: 0.625rem 0.5rem !important;
  position: sticky;
  bottom: 0;
  z-index: 10;
  border-top: 2px solid #e2e8f0 !important;
  font-weight: 600 !important;
  background-color: #ffffff !important;
}

:deep(.footer-total) {
  background-color: #f8fafc !important;
  color: #1e293b !important;
  font-weight: 700 !important;
}

:deep(.footer-balance) {
  background-color: #fffbeb !important;
  color: #78350f !important;
  font-weight: 600 !important;
}

:deep(.footer-profit) {
  background-color: #f0fdf4 !important;
  color: #14532d !important;
  font-weight: 600 !important;
}

:deep(.footer-statement) {
  background-color: #fef2f2 !important;
  color: #7f1d1d !important;
  font-weight: 600 !important;
}

/* DataTable Wrapper */
:deep(.p-datatable-wrapper) {
  overflow-x: hidden !important;
  overflow-y: auto !important;
  scrollbar-gutter: stable;
}

/* Minimal Scrollbar */
:deep(.p-datatable-wrapper)::-webkit-scrollbar {
  width: 6px;
}

:deep(.p-datatable-wrapper)::-webkit-scrollbar-track {
  background: #f8fafc;
}

:deep(.p-datatable-wrapper)::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

:deep(.p-datatable-wrapper)::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Loading Spinner */
:deep(.p-progress-spinner) {
  width: 48px !important;
  height: 48px !important;
}

:deep(.p-progress-spinner-circle) {
  stroke: #64748b !important;
}

/* Empty State */
:deep(.p-datatable-emptymessage) {
  background-color: #ffffff;
  padding: 3rem 2rem !important;
}

:deep(.p-datatable-emptymessage i) {
  color: #cbd5e1;
  display: block;
  margin-bottom: 1rem;
}

:deep(.p-datatable-emptymessage p) {
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 500;
}

/* Responsive Design */
@media screen and (max-width: 1400px) {
  .worksheet-table {
    font-size: 0.8125rem;
  }
  
  :deep(.p-datatable-thead > tr > th) {
    font-size: 0.75rem !important;
    padding: 0.5rem 0.375rem !important;
  }
  
  :deep(.p-datatable-tbody > tr > td) {
    padding: 0.4rem 0.375rem !important;
  }
  
  :deep(.p-datatable-tfoot > tr > td) {
    font-size: 0.875rem !important;
    padding: 0.5rem 0.375rem !important;
  }
}

@media screen and (max-width: 1200px) {
  .worksheet-table {
    font-size: 0.75rem;
  }
  
  :deep(.p-datatable-thead > tr > th) {
    font-size: 0.6875rem !important;
    padding: 0.4rem 0.3rem !important;
  }
  
  :deep(.p-datatable-tbody > tr > td) {
    padding: 0.35rem 0.3rem !important;
  }
  
  :deep(.p-datatable-tfoot > tr > td) {
    font-size: 0.8125rem !important;
    padding: 0.4rem 0.3rem !important;
  }
}
</style>
