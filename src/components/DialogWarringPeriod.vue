<script setup>
import { ref, onMounted } from "vue";
const props = defineProps({
  confirmDialog: Boolean,
});

const emit = defineEmits(["confirm"]);

onMounted(() => {});

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
    :style="{ width: '40vw' }"
    :closable="false"
  >
    <template #header>
      <div class="flex align-items-center">
        <span
          class="flex align-items-center justify-content-center bg-cyan-100 text-cyan-800 mr-3 border-circle"
          style="width: 32px; height: 32px"
        >
          <i class="pi pi-exclamation-triangle text-lg"></i>
        </span>
        <span class="font-medium text-2xl text-900">แจ้งเตือนระบบ </span>
      </div>
    </template>

    <div class="flex flex-column justify-content-center align-items-center">
      <p
        class="line-height-3 p-0 m-0"
        style="font-size: 1.2rem; text-align: center"
      >
        <span>
          วันที่เอกสาร ได้ถูกปิดงวดไปแล้ว หรือยังไม่ได้กำหนดงวดบัญชี
        </span>
      </p>
    </div>

    <template #footer>
      <div class="border-top-1 surface-border pt-3">
        <Button class="w-full" @click="onConfirm" label="ตกลง"></Button>
      </div>
    </template>
  </Dialog>
</template>
<style scoped>
.p-dialog.p-component.p-ripple-disabled {
  background-color: #fff;
}
</style>
