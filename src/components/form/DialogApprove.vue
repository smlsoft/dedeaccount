<script setup>
import { ref, onMounted } from "vue";
import $ from "jquery";

const ramdomNumber = ref();
const confirmRamdomNumber = ref("");
const confirmRamdomNumber_valid = ref(false);

const props = defineProps({
  confirmDialog: Boolean,
  ramdomNumber: Number,
  title: String,
  mode: String,
  loading: Boolean,
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
          class="flex align-items-center justify-content-center border-circle mb-3"
          :class="
            props.mode == 'approve'
              ? ' bg-cyan-100 text-cyan-800'
              : props.mode == 'cancel'
              ? ' bg-yellow-100 text-yellow-800'
              : props.mode == 'gl'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          "
          style="width: 64px; height: 64px"
        >
          <i class="pi pi-lock text-5xl" v-if="props.mode == 'approve'"></i>
          <i class="pi pi-trash text-5xl" v-if="props.mode == 'delete'"></i>
          <i class="pi pi-times text-5xl" v-if="props.mode == 'cancel'"></i>
          <i class="pi pi-file text-5xl" v-if="props.mode == 'gl'"></i>
        </span>
      </div>
      <div class="flex">
        <div class="font-medium text-2xl text-900">{{ props.title }}</div>
      </div>
      <div class="flex">
        <p class="line-height-3 p-0 m-3">กรุณากรอกหมายเลขที่เห็น</p>
      </div>
      <div class="flex">
        <span
          class="font-medium text-xl"
          :class="props.mode == 'approve' ? 'text-primary-700' : 'text-red-700'"
          >{{ props.ramdomNumber }}</span
        >
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
          @click="onClose"
          label="ยกเลิก"
          class="p-button-outlined w-6 mr-2"
        ></Button>
        <Button
          :loading="props.loading"
          @click="onConfirm"
          :label="
            props.mode == 'approve' || props.mode == 'gl'
              ? 'ยืนยัน'
              : props.mode == 'cancel'
              ? 'ยกเลิกงาน'
              : 'ลบงาน'
          "
          :class="
            props.mode == 'approve' || 'gl'
              ? ''
              : props.mode == 'cancel'
              ? 'p-button-warning'
              : 'p-button-danger'
          "
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
</style>
