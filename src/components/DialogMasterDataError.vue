<script setup>
import { ref, onMounted, computed } from "vue";

const props = defineProps({
  confirmDialog: Boolean,
  errorData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["confirm"]);

onMounted(() => {});

const errorMessage = computed(() => {
  return props.errorData?.message || "ไม่พบข้อมูล Master Data";
});

const hasDetails = computed(() => {
  return props.errorData?.details;
});

const hasRequired = computed(() => {
  return props.errorData?.required;
});

function onConfirm() {
  emit("confirm");
}
</script>

<template>
  <Dialog
    :visible="props.confirmDialog"
    @update:visible="onConfirm"
    appendTo="body"
    :modal="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '50vw' }"
    :closable="false"
  >
    <template #header>
      <div class="flex align-items-center">
        <span
          class="flex align-items-center justify-content-center bg-red-100 text-red-800 mr-3 border-circle"
          style="width: 32px; height: 32px"
        >
          <i class="pi pi-exclamation-triangle text-lg"></i>
        </span>
        <span class="font-medium text-2xl text-900">ไม่พบข้อมูล Master Data</span>
      </div>
    </template>

    <div class="flex flex-column">
      <!-- Error Message -->
      <p
        class="line-height-3 mb-3"
        style="font-size: 1.1rem"
      >
        {{ errorMessage }}
      </p>

      <!-- Required Data Section -->
      <div v-if="hasRequired" class="mb-3">
        <h4 class="text-900 font-semibold mb-2">ข้อมูลที่จำเป็น:</h4>
        <ul class="list-none p-0 m-0">
          <li v-if="errorData.required.chart_of_accounts" class="flex align-items-start mb-2">
            <i class="pi pi-check-circle text-red-500 mr-2 mt-1"></i>
            <div>
              <span class="font-semibold">ผังบัญชี (Chart of Accounts):</span>
              <span class="text-600 ml-2">{{ errorData.required.chart_of_accounts }}</span>
            </div>
          </li>
          <li v-if="errorData.required.journal_books" class="flex align-items-start mb-2">
            <i class="pi pi-check-circle text-red-500 mr-2 mt-1"></i>
            <div>
              <span class="font-semibold">สมุดรายวัน (Journal Books):</span>
              <span class="text-600 ml-2">{{ errorData.required.journal_books }}</span>
            </div>
          </li>
          <li v-if="errorData.required.creditors" class="flex align-items-start mb-2">
            <i class="pi pi-info-circle text-blue-500 mr-2 mt-1"></i>
            <div>
              <span class="font-semibold">เจ้าหนี้ (Creditors):</span>
              <span class="text-600 ml-2">{{ errorData.required.creditors }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Current Status Section -->
      <div v-if="hasDetails" class="surface-50 p-3 border-round">
        <h4 class="text-900 font-semibold mb-2 mt-0">สถานะปัจจุบัน:</h4>
        <div class="grid">
          <div class="col-12 md:col-4">
            <div class="flex align-items-center">
              <i class="pi pi-list text-primary mr-2"></i>
              <div>
                <div class="text-600 text-sm">ผังบัญชี</div>
                <div class="font-semibold text-lg">{{ errorData.details.accounts_found || 0 }} รายการ</div>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="flex align-items-center">
              <i class="pi pi-book text-primary mr-2"></i>
              <div>
                <div class="text-600 text-sm">สมุดรายวัน</div>
                <div class="font-semibold text-lg">{{ errorData.details.journal_books_found || 0 }} รายการ</div>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="flex align-items-center">
              <i class="pi pi-users text-primary mr-2"></i>
              <div>
                <div class="text-600 text-sm">เจ้าหนี้</div>
                <div class="font-semibold text-lg">{{ errorData.details.creditors_found || 0 }} รายการ</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Shop ID Info -->
      <div v-if="errorData?.details?.shopid" class="mt-3 text-sm text-600">
        <i class="pi pi-info-circle mr-1"></i>
        Shop ID: {{ errorData.details.shopid }}
      </div>
    </div>

    <template #footer>
      <div class="border-top-1 surface-border pt-3">
        <Button 
          class="w-full" 
          @click="onConfirm" 
          label="ตกลง"
          severity="danger"
        ></Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.p-dialog.p-component.p-ripple-disabled {
  background-color: #fff;
}

ul li {
  line-height: 1.6;
}
</style>
