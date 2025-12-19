<template>
  <Dialog
    :visible="visible"
    header="กำลังวิเคราะห์เอกสาร"
    :modal="true"
    :closable="false"
    :style="{ width: '400px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-column align-items-center py-4">
      <i class="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
      <p class="text-center mb-2">{{ message }}</p>
      <p class="text-center text-sm text-600">{{ subMessage }}</p>
    </div>
  </Dialog>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: 'กำลังประมวลผลเอกสารด้วย AI',
  },
  subMessage: {
    type: String,
    default: 'กรุณารอสักครู่ อาจใช้เวลาประมาณ 1 นาที...',
  },
});

defineEmits(['update:visible']);
</script>
