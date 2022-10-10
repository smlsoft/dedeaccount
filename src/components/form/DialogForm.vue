<script setup>
import { ref, onMounted } from "vue";
const textContent = ref("");
const textContent2 = ref("");
const detail = ref();
const props = defineProps({
  textContent: String,
  textContent2: String,
  confirmDialog: Boolean,

  mode: Number,
});

const emit = defineEmits(["close", "confirm"]);

onMounted(() => {});
function onClose() {
  emit("close");
}

function onConfirm() {
  emit("confirm");
}
</script>

<template>
  <Dialog
    :visible="props.confirmDialog"
    @update:visible="onClose"
    :style="{ width: '450px' }"
    header="Confirm"
    :modal="true"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span
        >{{ props.textContent }}

        {{ props.textContent2 }} ใช่หรือไม่ ?
      </span>
    </div>
    <template #footer>
      <Button
        label="ไม่"
        icon="pi pi-times"
        class="p-button-text"
        @click="onClose"
      />
      <Button
        label="ใช่"
        icon="pi pi-check"
        class="p-button-text"
        @click="onConfirm"
      />
    </template>
  </Dialog>
</template>
