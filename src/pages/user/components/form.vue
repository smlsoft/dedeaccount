<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import TextRequire from "@/components/form/TextRequire.vue";
import { useToast } from "primevue/usetoast";
import { ref, onMounted } from "vue";

const textContent = ref("ต้องการบันทึกข้อมูลผู้ใช้งาน");
const toast = useToast();
const confirmSaveDialog = ref(false);
const form_model = ref({
  shopid: "",
  username: "",
  role: 0,
});
const form_valid = ref({
  username: true,
});
const roles = ref([
  { name: "USER", code: 0 },
  { name: "ADMIN", code: 1 },
  { name: "OWNER", code: 2 },
]);

const props = defineProps({
  form_model: Object,
  form_valid: Object,
});

const emit = defineEmits(["save"]);

onMounted(async () => {});

async function onSave() {
  var isPass = await verifyData();

  console.log(isPass);
  if (isPass) {
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

function verifyData() {
  let checkValid = 0;
  let err_msg = "";
  if (props.form_model.username == "") {
    props.form_valid.username = false;
    err_msg += "Username ";
    checkValid += 1;
  } else {
    props.form_valid.username = true;
  }

  if (checkValid == 0) {
    return true;
  } else {
    toast.add({
      severity: "error",
      summary: "error",
      detail: "กรุณากรอบข้อมูล\n" + err_msg,
      life: 3000,
    });
    return false;
  }
}
</script>

<template>
  <div class="grid formgrid p-fluid">
    <div class="field mb-12 col-12 md:col-12">
      <label for="groupCode" class="font-medium text-900">
        <TextRequire textLabel="Username"></TextRequire>
      </label>
      <InputText
        id="username"
        type="text"
        v-model="props.form_model.username"
        :class="!props.form_valid.username ? 'p-invalid' : ''"
        :disabled="props.isUpdate"
      />
    </div>
    <div class="field mb-12 col-12 md:col-12">
      <label for="accountcategory" class="font-medium text-900"
        >สิทธิ์การใช้งาน</label
      >
      <div class="flex flex-wrap card-container blue-container">
        <div
          v-for="role of roles"
          :key="role.code"
          class="field-radiobutton m-3"
        >
          <RadioButton
            :id="role.code"
            name="category"
            :value="role.code"
            v-model="props.form_model.role"
          />
          <label :for="role.code">{{ role.name }}</label>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-2">
    <Button
      @click="onSave"
      label="บันทึกข้อมูลผู้ใช้งาน"
      icon="pi pi-save"
      class="w-auto p-button-success"
    ></Button>
  </div>
  <DialogForm
    :confirmDialog="confirmSaveDialog"
    :textContent="textContent"
    v-on:close="onClose"
    v-on:confirm="confirmSave"
  ></DialogForm>
</template>
