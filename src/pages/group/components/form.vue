<script setup>
import DialogForm from "@/components/DialogForm.vue";
import { useToast } from "primevue/usetoast";
import { ref, onMounted } from "vue";
import Utils from "@/utils/";
const textContent = ref("ต้องการบันทึกรหัสกลุ่มบัญชี ");
const groupCode = ref("ไม่มีรหัสกลุ่มบัญชี");
const toast = useToast();
const confirmSaveDialog = ref(false);
const form_model = ref({
  guidfixed: "",
  code: "",
  name1: "",
  name2: "",
  name3: "",
  name4: "",
  name5: "",
});
const form_valid = ref({
  code: true,
  name1: true,
  name2: true,
  name3: true,
  name4: true,
  name5: true,
});

const props = defineProps({
  form_model: Object,
});

const emit = defineEmits(["save", "back"]);

onMounted(async () => {
  form_model.value = props.form_model;
});

async function onSave() {
  var isPass = await verifyData();
  if (isPass) {
    groupCode.value = form_model.value.code;
    confirmSaveDialog.value = true;
  }
}

function confirmSave() {
  confirmSaveDialog.value = false;
  emit("save", form_model.value);
}

function onClose() {
  confirmSaveDialog.value = false;
}

function onBack() {
  emit("back");
}
function verifyData() {
  let checkValid = 0;
  let err_msg = "";
  if (form_model.value.code == "") {
    form_valid.value.code = false;
    err_msg += "กรุณากรอบข้อมูล รหัสกลุ่มบัญชี ";
    checkValid += 1;
  } else {
    if (Utils.checkSpecialString(form_model.value.code)) {
      form_valid.value.code = false;
      err_msg += "รหัสกลุ่มบัญชีไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.code = true;
    }
  }

  if (form_model.value.name1 != "") {
    if (Utils.checkSpecialString(form_model.value.name1)) {
      form_valid.value.name1 = false;
      err_msg += "ชื่อกลุ่มบัญชี1 ไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.name1 = true;
    }
  } else {
    form_valid.value.name1 = true;
  }

  if (form_model.value.name2 != "") {
    if (Utils.checkSpecialString(form_model.value.name2)) {
      form_valid.value.name2 = false;
      err_msg += "ชื่อกลุ่มบัญชี2 ไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.name2 = true;
    }
  } else {
    form_valid.value.name2 = true;
  }

  if (form_model.value.name3 != "") {
    if (Utils.checkSpecialString(form_model.value.name3)) {
      form_valid.value.name3 = false;
      err_msg += "ชื่อกลุ่มบัญชี3 ไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.name3 = true;
    }
  } else {
    form_valid.value.name3 = true;
  }

  if (form_model.value.name4 != "") {
    if (Utils.checkSpecialString(form_model.value.name4)) {
      form_valid.value.name4 = false;
      err_msg += "ชื่อกลุ่มบัญชี4 ไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.name4 = true;
    }
  } else {
    form_valid.value.name4 = true;
  }

  if (form_model.value.name5 != "") {
    if (Utils.checkSpecialString(form_model.value.name5)) {
      form_valid.value.name5 = false;
      err_msg += "ชื่อกลุ่มบัญชี5 ไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.name5 = true;
    }
  } else {
    form_valid.value.name5 = true;
  }

  if (checkValid == 0) {
    return true;
  } else {
    toast.add({
      severity: "error",
      summary: "error",
      detail: err_msg,
      life: 3000,
    });
    return false;
  }
}
</script>

<template>
  <div class="surface-ground px-2 py-2">
    <Button
      label="กลับหน้ารายการ"
      icon="pi pi-arrow-left"
      class="p-button-text p-button-sm p-button-info"
      @click="onBack()"
    />
    <div class="surface-card p-4 shadow-2 border-round p-fluid">
      <div class="grid formgrid p-fluid">
        <div class="field mb-6 col-6 md:col-6">
          <label for="groupCode" class="font-medium"
            ><span class="text-orange-500">* </span>รหัสกลุ่มบัญชี</label
          >
          <InputText
            id="code"
            type="text"
            v-model="form_model.code"
            :class="!form_valid.code ? 'p-invalid' : ''"
          />
        </div>
        <div class="field mb-6 col-6 md:col-6">
          <label for="name1" class="font-medium"
            ><span class="text-orange-500">* </span>ชื่อกลุ่มบัญชี 1</label
          >
          <InputText
            id="name1"
            type="text"
            v-model="form_model.name1"
            :class="!form_valid.name1 ? 'p-invalid' : ''"
          />
        </div>
        <div class="field mb-12 col-12 md:col-12">
          <Panel header="More" :toggleable="true">
            <div class="grid formgrid p-fluid">
              <div class="field mb-6 col-6 md:col-6">
                <label for="name2" class="font-medium text-900">ชื่อกลุ่มบัญชี 2</label>
                <InputText
                  id="name2"
                  type="text"
                  v-model="form_model.name2"
                  :class="!form_valid.name2 ? 'p-invalid' : ''"
                />
              </div>
              <div class="field mb-6 col-6 md:col-6">
                <label for="name3" class="font-medium text-900">ชื่อกลุ่มบัญชี 3</label>
                <InputText
                  id="name3"
                  type="text"
                  v-model="form_model.name3"
                  :class="!form_valid.name3 ? 'p-invalid' : ''"
                />
              </div>
              <div class="field mb-6 col-6 md:col-6">
                <label for="name4" class="font-medium text-900">ชื่อกลุ่มบัญชี 4</label>
                <InputText
                  id="name4"
                  type="text"
                  v-model="form_model.name4"
                  :class="!form_valid.name4 ? 'p-invalid' : ''"
                />
              </div>
              <div class="field mb-6 col-6 md:col-6">
                <label for="name5" class="font-medium text-900">ชื่อกลุ่มบัญชี 5</label>
                <InputText
                  id="name5"
                  type="text"
                  v-model="form_model.name5"
                  :class="!form_valid.name5 ? 'p-invalid' : ''"
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>
      <div class="mt-2">
        <Button
          @click="onSave"
          label="บันทึกกลุ่มบัญชี"
          icon="pi pi-save"
          class="w-auto p-button-success"
        ></Button>
      </div>
    </div>
  </div>
  <DialogForm
    :confirmDialog="confirmSaveDialog"
    :textContent="textContent"
    :textContent2="groupCode"
    v-on:close="onClose"
    v-on:confirm="confirmSave"
  ></DialogForm>
</template>
