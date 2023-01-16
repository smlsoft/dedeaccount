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
  <!-- <Dialog
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
        class="p-button-outlined p-button-danger"
        @click="onClose"
      />
      <Button label="ใช่" icon="pi pi-check" @click="onConfirm" />
    </template>
  </Dialog> -->
  <Dialog
    :visible="props.confirmDialog"
    @update:visible="onClose"
    appendTo="body"
    :modal="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '40vw' }"
  >
    <template #header>
      <div class="flex align-items-center">
        <span
          class="flex align-items-center justify-content-center bg-cyan-100 text-cyan-800 mr-3 border-circle"
          style="width: 32px; height: 32px"
        >
          <i class="pi pi-info text-lg"></i>
        </span>
        <span class="font-medium text-2xl text-900">Confirm </span>
      </div>
    </template>
    <p
      class="line-height-3 p-0 m-0"
      style="font-size: 1.2rem; text-align: center"
    >
      <span
        >{{ props.textContent }}

        {{ props.textContent2 }} ใช่หรือไม่ ?
      </span>
    </p>
    <template #footer>
      <div class="border-top-1 surface-border pt-3">
        <Button
          icon="pi pi-times"
          @click="onClose"
          label="ไม่"
          class="p-button-text"
        ></Button>
        <Button
          class="p-button-success"
          icon="pi pi-save"
          @click="onConfirm"
          label="ใช่"
        ></Button>
      </div>
    </template>
  </Dialog>
</template>
