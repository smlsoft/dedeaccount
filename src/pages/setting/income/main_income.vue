<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import DialogForm from "@/components/DialogForm.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { ref, onMounted } from "vue";
import { useApp } from "@/stores/app.js";
import { useToast } from "primevue/usetoast";
import Utils from "@/utils/";

import dataList from "./list_income.vue";
import dataForm from "./form_income.vue";

const storeApp = useApp();
const toast = useToast();
const data_list = ref([]);
const totalItemsCount = ref(0);
const loading = ref(false);
const activePage = ref(1);
const filters = ref(null);
const sortField = ref("code");
const sortOrder = ref(1);
const limitPage = ref(20);
const incomeCodeFocus = ref(false);
const confirmSaveDialog = ref(false);
const readMode = ref(false);
const confirmEditDialog = ref(false);
const confirmDeleteDialog = ref(false);

const form_model = ref({
  guidfixed: "",
  code: "",
  names: [{ name: "", code: "th" }],
  accountcode: "",
  accountname: "",
});
const form_valid = ref({
  code: true,
  name1: true,
});

const accountChart_list = ref([]);

onMounted(() => {
  getIncomeList();
  getAccountChart();
  storeApp.setPageTitle("กำหนดรายได้");
  storeApp.setActivePage("master");
  storeApp.setActiveChild("income");
});

function getIncomeList() {
  loading.value = true;
  MasterdataService.getIncomeList(limitPage.value, activePage.value, filters.value, sortField.value, sortOrder.value)
    .then((res) => {
      if (res.success) {
        data_list.value = res.data.sort((a, b) => a.code - b.code);
        totalItemsCount.value = res.pagination.total;
      }
      loading.value = false;
    })
    .catch((err) => {
      console.log(err);
      loading.value = false;
    });
}

function createIncome() {
  clearForm();
  incomeCodeFocus.value = true;
  readMode.value = false;
}

function clearForm() {
  readMode.value = true;
  form_model.value = {
    guidfixed: "",
    code: "",
    names: [{ name: "", code: "th" }],
    accountcode: "",
    accountname: "",
  };
  form_valid.value = { code: true, name1: true };
}

function unFocusincomeCode() {
  incomeCodeFocus.value = false;
}

async function onSave() {
  if (await verifyData()) {
    confirmSaveDialog.value = true;
  }
}

async function confirmSave() {
  try {
    const res = form_model.value.guidfixed
      ? await MasterdataService.putIncome(form_model.value, form_model.value.guidfixed)
      : await MasterdataService.postIncome(form_model.value);

    if (res.success) {
      clearForm();
      getIncomeList();
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
      detail: form_model.value.guidfixed ? "บันทึกไม่สำเร็จ" : "รหัสรายได้ซ้ำ",
      life: 3000,
    });
  }
}

async function verifyData() {
  let err_msg = "กรุณากรอกข้อมูล ";
  if (!form_model.value.code || Utils.checkSpecialString(form_model.value.code)) {
    form_valid.value.code = false;
    err_msg += "รหัสรายได้ ";
  } else {
    form_valid.value.code = true;
  }

  if (!form_model.value.names[0].name) {
    form_valid.value.name1 = false;
    err_msg += "ชื่อรายได้ ";
  } else {
    form_valid.value.name1 = true;
  }

  if (form_valid.value.code && form_valid.value.name1) {
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
  form_model.value = data;
}

function editIncome(data) {
  readMode.value = true;
  confirmEditDialog.value = true;
  form_model.value = JSON.parse(JSON.stringify(data));
}

function confirmEdit() {
  readMode.value = false;
  confirmEditDialog.value = false;
}

function deleteIncome(data) {
  readMode.value = true;
  confirmDeleteDialog.value = true;
  form_model.value = data;
}

function confirmDelete() {
  MasterdataService.deleteIncome(form_model.value.guidfixed)
    .then((res) => {
      if (res.success) {
        getIncomeList();
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "ลบรายได้เรียบร้อยแล้ว",
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
  getIncomeList();
}

function doneTyping(data) {
  filters.value = data;
  activePage.value = 1;
  getIncomeList();
}

function getAccountChart() {
  MasterdataService.getAccountChart(4)
    .then((res) => {
      if (res.success) {
        accountChart_list.value = res.data.sort((a, b) => a.accountcode - b.accountcode);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <Splitter style="height: 100vh">
        <SplitterPanel :minSize="30">
          <dataList
            :data_list="data_list"
            :loading="loading"
            :totalItemsCount="totalItemsCount"
            @incomeCodeFocus="createIncome"
            @onRowSelect="onRowSelect"
            @editIncome="editIncome"
            @deleteIncome="deleteIncome"
            @onPage="onPage"
            @doneTyping="doneTyping"
          />
        </SplitterPanel>
        <SplitterPanel :minSize="30">
          <dataForm
            :form_model="form_model"
            :form_valid="form_valid"
            :incomeCodeFocus="incomeCodeFocus"
            :readMode="readMode"
            :accountChart_list="accountChart_list"
            @unFocusincomeCode="unFocusincomeCode"
            @onSave="onSave"
          />
        </SplitterPanel>
      </Splitter>
    </MainContentWarp>
  </AppLayout>
  <DialogForm
    :confirmDialog="confirmSaveDialog"
    textContent="ต้องการบันทึกรายได้"
    :textContent2="form_model.names[0].name"
    @close="confirmSaveDialog = false"
    @confirm="confirmSave"
  />
  <DialogForm
    :confirmDialog="confirmEditDialog"
    textContent="ต้องการแก้ไขรายได้"
    :textContent2="form_model.names[0].name"
    @close="confirmEditDialog = false"
    @confirm="confirmEdit"
  />
  <DialogForm
    :confirmDialog="confirmDeleteDialog"
    textContent="ต้องการลบรายได้"
    :textContent2="form_model.names[0].name"
    @close="confirmDeleteDialog = false"
    @confirm="confirmDelete"
  />
</template>

<style>
.p-dialog.p-component.p-ripple-disabled {
  background-color: #fff;
}
</style>
