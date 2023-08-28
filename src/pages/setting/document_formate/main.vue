<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import DialogForm from "@/components/form/DialogForm.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { ref, onMounted } from "vue";
import { useApp } from "@/stores/app.js";
import { useToast } from "primevue/usetoast";
import Utils from "@/utils/";

import dataList from "./list.vue";
import dataForm from "./form.vue";

const storeApp = useApp();
const toast = useToast();
const data_list = ref([]);
const totalItemsCount = ref(0);
const loading = ref(true);
const activePage = ref(1);
const filters = ref(null);
const limitPage = ref(20);
const docCodeFocus = ref(false);
const confirmSaveDialog = ref(false);
const readMode = ref(true);
const confirmEditDialog = ref(false);
const confirmDeleteDialog = ref(false);
const accountChart_detail = ref([]);

const form_model = ref({
  guidfixed: "",
  doccode: "",
  description: "",
  module: "GL",
  details: [
    {
      actioncode: "",
      accountcode: "",
      debit: "0",
      credit: "0",
      detail: "",
    },
  ],
});
const form_valid = ref({
  guidfixed: true,
  doccode: true,
  description: true,
});

onMounted(() => {
  getDocumentFormateList();
  getAccountChart();
  storeApp.setPageTitle("กำหนดรูปแบบการบันทึกบัญชี");
  storeApp.setActivePage("master");
  storeApp.setActiveChild("document_format");
});

function getAccountChart() {
  MasterdataService.getAccountChart()
    .then((res) => {
      console.log(res);
      if (res.success) {
        accountChart_detail.value = res.data.sort(function (obj1, obj2) {
          return obj1.accountcode - obj2.accountcode;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function getDocumentFormateList() {
  loading.value = true;
  MasterdataService.getDocumentFormateList(
    limitPage.value,
    activePage.value,
    filters.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        /// remove res.data where module != GL
        res.data = res.data.filter((val) => val.module == "GL");

        data_list.value = res.data.sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        });
        totalItemsCount.value = res.pagination.total;
        loading.value = false;
      }
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function createDocumentFormate() {
  clearForm();
  docCodeFocus.value = true;
  readMode.value = false;
}

function clearForm() {
  readMode.value = true;
  form_model.value = {
    guidfixed: "",
    doccode: "",
    description: "",
    module: "GL",
    details: [
      {
        actioncode: "",
        accountcode: "",
        debit: "0",
        credit: "0",
        detail: "",
      },
    ],
  };
  form_valid.value = {
    doccode: true,
    description: true,
  };
  if (form_model.value.details.length > 0) {
    form_model.value.details.forEach((element) => {
      /// credit covert to int
      element.credit = parseInt(element.credit);
      /// debit covert to int
      element.debit = parseInt(element.debit);
    });
  }

  // console.log(form_model.value);
}

function unFocusGroupCode() {
  docCodeFocus.value = false;
}

async function onSave() {
  var isPass = await verifyData();
  if (isPass) {
    confirmSaveDialog.value = true;
  }
}

async function confirmSave() {
  var form_model_save = ref({
    guidfixed: "",
    doccode: "",
    description: "",
    module: "GL",
    details: [],
  });

  form_model_save.value.guidfixed = form_model.value.guidfixed;
  form_model_save.value.doccode = form_model.value.doccode;
  form_model_save.value.description = form_model.value.description;

  if (form_model.value.details.length > 0) {
    form_model.value.details.forEach((element) => {
      form_model_save.value.details.push({
        actioncode: element.actioncode,
        accountcode: element.accountcode,
        debit: element.debit.toString(),
        credit: element.credit.toString(),
        detail: element.detail,
      });
    });
  }

  /// save
  if (
    form_model_save.value.guidfixed == undefined ||
    form_model_save.value.guidfixed == "" ||
    form_model_save.value.guidfixed == null
  ) {
    try {
      const res = await MasterdataService.postDocumentFormate(
        form_model_save.value
      );
      console.log(res);

      if (res.success) {
        clearForm();
        getDocumentFormateList();
        confirmSaveDialog.value = false;

        toast.add({
          severity: "success",
          summary: "success",
          detail: "บันทึกข้อมูลสำเร็จ",
          life: 3000,
        });
      }
    } catch (err) {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "ทำรายการไม่สำเร็จ",
        detail: "บันทึกไม่สำเร็จ รหัสกลุ่มบัญชีซ้ำ",
        life: 3000,
      });
    }
    /// update
  } else {
    try {
      const res = await MasterdataService.putDocumentFormate(
        form_model_save.value,
        form_model_save.value.guidfixed
      );
      //console.log(res);
      if (res.success) {
        clearForm();
        getDocumentFormateList();
        confirmSaveDialog.value = false;

        toast.add({
          severity: "success",
          summary: "success",
          detail: "บันทึกข้อมูลสำเร็จ",
          life: 3000,
        });
      }
    } catch (err) {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "error",
        detail: "บันทึกไม่สำเร็จ " + err,
        life: 3000,
      });
    }
  }
}

async function verifyData() {
  let checkValid = 0;
  let err_msg = "";
  if (form_model.value.doccode == "") {
    form_valid.value.doccode = false;
    err_msg += "กรุณากรอบข้อมูล รหัสกลุ่มบัญชี\n";
    checkValid += 1;
  } else {
    if (Utils.checkSpecialString(form_model.value.doccode)) {
      form_valid.value.doccode = false;
      err_msg += "รหัสกลุ่มบัญชีไม่สามารถใช้อักษรพิเศษได้";
      checkValid += 1;
    } else {
      form_valid.value.doccode = true;
    }
  }
  if (form_model.value.description == "") {
    form_valid.value.description = false;
    err_msg += "กรุณากรอบข้อมูล ชื่อกลุ่มบัญชี ";
    checkValid += 1;
  } else {
    form_valid.value.description = true;
  }

  if (checkValid == 0) {
    return true;
  } else {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: err_msg,
      life: 5000,
    });
    return false;
  }
}

function onRowSelect(data) {
  readMode.value = true;
  form_model.value.doccode = data.doccode;
  form_model.value.description = data.description;
  form_model.value.guidfixed = data.guidfixed;
  form_model.value.details = data.details;
}

function editAccountGroup(data) {
  readMode.value = true;
  confirmEditDialog.value = true;

  form_model.value.doccode = data.doccode;
  form_model.value.description = data.description;
  form_model.value.guidfixed = data.guidfixed;
  form_model.value.details = data.details;
  form_model.value.details.forEach((element) => {
    /// credit covert to int
    element.credit = parseInt(element.credit);
    /// debit covert to int
    element.debit = parseInt(element.debit);
  });
}

function confirmEdit() {
  readMode.value = false;
  confirmEditDialog.value = false;
}

function deleteAccountGroup(data) {
  readMode.value = true;
  confirmDeleteDialog.value = true;
  form_model.value.doccode = data.doccode;
  form_model.value.description = data.description;
  form_model.value.guidfixed = data.guidfixed;
  form_model.value.details = data.details;
}

function confirmDelete() {
  MasterdataService.deleteDocumentFormate(form_model.value.guidfixed)
    .then((res) => {
      console.log(res);
      if (res.success) {
        getDocumentFormateList();
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "ลบกลุ่มบัญชีเรียบร้อยแล้ว",
          life: 3000,
        });
        clearForm();
        confirmDeleteDialog.value = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
  getDocumentFormateList();
}

function doneTyping(data) {
  filters.value = data;
  activePage.value = 1;
  getDocumentFormateList();
}

function onRowReorder(data) {
  form_model.value.details = data;
  toast.add({
    severity: "success",
    summary: "ทำรายการสำเร็จ",
    detail: "ย้ายตำแหน่งสำเร็จ",
    life: 3000,
  });
}

function selectAccount(data, index) {
  var ele = accountChart_detail.value.filter(
    (val) => val.accountcode == data.accountcode
  );
  form_model.value.details[index].accountcode = ele[0].accountcode;
  form_model.value.details[index].detail = ele[0].accountname;
}

function addColumn(index) {
  form_model.value.details.splice(index + 1, 0, {
    actioncode: "",
    accountcode: "",
    detail: "",
    debit: 0,
    credit: 0,
  });
}
function deleteDetail(data) {
  form_model.value.details = form_model.value.details.filter(
    (val) => val.index !== data
  );

  if (form_model.value.details.length == 0) {
    form_model.value.details.push({
      actioncode: "",
      accountcode: "",
      detail: "",
      debit: 0,
      credit: 0,
    });
  }
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Detail Deleted",
    life: 3000,
  });
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <Splitter style="height: 100vh">
        <SplitterPanel :minSize="30" :size="30">
          <dataList
            :data_list="data_list"
            :loading="loading"
            :totalItemsCount="totalItemsCount"
            v-on:docCodeFocus="createDocumentFormate"
            v-on:onRowSelect="onRowSelect"
            v-on:editAccountGroup="editAccountGroup"
            v-on:deleteAccountGroup="deleteAccountGroup"
            v-on:onPage="onPage"
            v-on:doneTyping="doneTyping"
          ></dataList>
        </SplitterPanel>
        <SplitterPanel :minSize="30" :size="70">
          <dataForm
            :form_model="form_model"
            :form_valid="form_valid"
            :accountChart_detail="accountChart_detail"
            :docCodeFocus="docCodeFocus"
            :readMode="readMode"
            v-on:unFocusGroupCode="unFocusGroupCode"
            v-on:onSave="onSave"
            v-on:onRowReorder="onRowReorder"
            v-on:selectAccount="selectAccount"
            v-on:addColumn="addColumn"
            v-on:deleteDetail="deleteDetail"
          ></dataForm>
        </SplitterPanel>
      </Splitter>
    </MainContentWarp>
  </AppLayout>
  <DialogForm
    :confirmDialog="confirmSaveDialog"
    :textContent="'ต้องการบันทึกรูปแบบการบันทึกบัญชี'"
    :textContent2="form_model.description"
    v-on:close="confirmSaveDialog = false"
    v-on:confirm="confirmSave"
  ></DialogForm>
  <DialogForm
    :confirmDialog="confirmEditDialog"
    :textContent="'ต้องการแก้ไขรูปแบบการบันทึกบัญชี'"
    :textContent2="form_model.description"
    v-on:close="confirmEditDialog = false"
    v-on:confirm="confirmEdit"
  ></DialogForm>
  <DialogForm
    :confirmDialog="confirmDeleteDialog"
    :textContent="'ต้องการลบรูปแบบการบันทึกบัญชี'"
    :textContent2="form_model.description"
    v-on:close="confirmDeleteDialog = false"
    v-on:confirm="confirmDelete"
  ></DialogForm>
</template>
<style>
.p-dialog.p-component.p-ripple-disabled {
  background-color: #fff;
}
</style>
