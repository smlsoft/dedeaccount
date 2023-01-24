<script setup>
import { ref, onMounted } from "vue";
import $ from "jquery";

const ramdomNumber = ref();
const confirmRamdomNumber = ref("");
const confirmRamdomNumber_valid = ref(false);

const props = defineProps({
  confirmDialog: Boolean,
  ramdomNumber: Number,
});

const emit = defineEmits(["close", "confirmJob", "confirmJobFalse"]);

onMounted(() => {
  ramdomNumber.value = props.ramdomNumber;
});
function onClose() {
  confirmRamdomNumber.value = "";
  confirmRamdomNumber_valid.value = false;
  emit("close");
}

function onConfirm() {
  if (confirmRamdomNumber.value != props.ramdomNumber) {
    confirmRamdomNumber.value = "";
    confirmRamdomNumber_valid.value = true;
    emit("confirmJobFalse");

    $(".confirmRamdomNumber").focus();
  } else {
    emit("confirmJob", true);
  }
}
</script>

<template>
  <Dialog
    :visible="props.confirmDialog"
    @update:visible="onClose"
    appendTo="body"
    :modal="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '40vw' }"
    :closable="false"
    :showHeader="false"
  >
    <div
      class="flex flex-column align-items-center justify-content-center my-4"
    >
      <div class="flex">
        <span
          class="flex align-items-center justify-content-center bg-cyan-100 text-cyan-800 border-circle mb-3"
          style="width: 64px; height: 64px"
        >
          <i class="pi pi-lock text-5xl"></i>
        </span>
      </div>
      <div class="flex">
        <div class="font-medium text-2xl text-900">ยืนยันการปิดงาน</div>
      </div>
      <div class="flex">
        <p class="line-height-3 p-0 m-3">กรุณากรอกหมายเลขที่เห็น</p>
      </div>
      <div class="flex">
        <span class="font-medium text-xl text-primary-700">{{
          props.ramdomNumber
        }}</span>
      </div>

      <InputText
        type="number"
        v-model="confirmRamdomNumber"
        autofocus
        class="confirmRamdomNumber"
        :class="confirmRamdomNumber_valid ? 'p-invalid' : ''"
      />
    </div>

    <template #footer>
      <div class="border-top-1 surface-border pt-3 flex">
        <Button
          icon="pi pi-times"
          @click="onClose"
          label="ยกเลิก"
          class="p-button-outlined w-6 mr-2"
        ></Button>
        <Button
          icon="pi pi-check"
          @click="onConfirm"
          label="ยืนยัน"
          class="w-6 ml-2"
        ></Button>
      </div>
    </template>
  </Dialog>
</template>
<style scoped>
.p-dialog.p-component.p-ripple-disabled {
  background-color: #fff;
}

.p-dialog .p-dialog-content {
  padding: 0px;
}
</style>
