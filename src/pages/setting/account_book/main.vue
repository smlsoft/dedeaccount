<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import DialogForm from "@/components/DialogForm.vue";
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
const sortField = ref("code");
const sortOrder = ref(1);
const limitPage = ref(20);
const bookCodeFocus = ref(false);
const confirmSaveDialog = ref(false);
const readMode = ref(false);
const confirmEditDialog = ref(false);
const confirmDeleteDialog = ref(false);

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

onMounted(() => {
  getJournalBookList();
  storeApp.setPageTitle("สมุดรายวัน");
  storeApp.setActivePage("master");
  storeApp.setActiveChild("account_book");
});

function getJournalBookList() {
  loading.value = true;
  MasterdataService.getJournalBookList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
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

function createAccountBook() {
  clearForm();
  bookCodeFocus.value = true;
  readMode.value = false;
}

function clearForm() {
  readMode.value = true;
  form_model.value = {
    code: "",
    name1: "",
    name2: "",
    name3: "",
    name4: "",
    name5: "",
  };
  form_valid.value = {
    code: true,
    name1: true,
    name2: true,
    name3: true,
    name4: true,
    name5: true,
  };
}

function unFocusBookCode() {
  bookCodeFocus.value = false;
}

async function onSave() {
  var isPass = await verifyData();
  if (isPass) {
    confirmSaveDialog.value = true;
  }
}

async function confirmSave() {
  console.log(form_model.value.guidfixed);
  if (
    form_model.value.guidfixed == undefined ||
    form_model.value.guidfixed == "" ||
    form_model.value.guidfixed == null
  ) {
    try {
      const res = await MasterdataService.postJournalBook(form_model.value);
      console.log(res);

      if (res.success) {
        clearForm();
        getJournalBookList();
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
        detail: "บันทึกไม่สำเร็จ รหัสสมุดรายวันซ้ำ",
        life: 3000,
      });
    }
  } else {
    try {
      const res = await MasterdataService.putJournalBook(
        form_model.value,
        form_model.value.guidfixed
      );
      //console.log(res);
      if (res.success) {
        clearForm();
        getJournalBookList();
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
  if (form_model.value.code == "") {
    form_valid.value.code = false;
    err_msg += "กรุณากรอกข้อมูล รหัสสมุดรายวัน\n";
    checkValid += 1;
  } else {
    if (Utils.checkSpecialString(form_model.value.code)) {
      form_valid.value.code = false;
      err_msg += "รหัสสมุดรายวันไม่สามารถใช้อักษรพิเศษได้";
      checkValid += 1;
    } else {
      form_valid.value.code = true;
    }
  }
  if (form_model.value.name1 == "") {
    form_valid.value.name1 = false;
    err_msg += "กรุณากรอกข้อมูล ชื่อสมุดรายวัน ";
    checkValid += 1;
  } else {
    if (Utils.checkSpecialString(form_model.value.name1)) {
      form_valid.value.name1 = false;
      err_msg += "ชื่อสมุดรายวันไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.name1 = true;
    }
  }
  if (form_model.value.name2 != "") {
    if (Utils.checkSpecialString(form_model.value.name2)) {
      form_valid.value.name2 = false;
      err_msg += "ชื่อสมุดรายวัน2 ไม่สามารถใช้อักษรพิเศษได้ ";
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
      err_msg += "ชื่อสมุดรายวัน3 ไม่สามารถใช้อักษรพิเศษได้ ";
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
      err_msg += "ชื่อสมุดรายวัน4 ไม่สามารถใช้อักษรพิเศษได้";
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
      err_msg += "ชื่อสมุดรายวัน5 ไม่สามารถใช้อักษรพิเศษได้";
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

function editAccountBook(data) {
  readMode.value = true;
  confirmEditDialog.value = true;
  form_model.value = Object.assign({}, data); // Create a copy of the data object
}

function confirmEdit() {
  readMode.value = false;
  confirmEditDialog.value = false;
}

function deleteAccountBook(data) {
  readMode.value = true;
  confirmDeleteDialog.value = true;
  form_model.value = data;
}

function confirmDelete() {
  MasterdataService.deleteJournalBook(form_model.value.guidfixed)
    .then((res) => {
      console.log(res);
      if (res.success) {
        getJournalBookList();
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "ลบสมุดรายวันเรียบร้อยแล้ว",
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
  getJournalBookList();
}

function doneTyping(data) {
  filters.value = data;
  activePage.value = 1;
  getJournalBookList();
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
            v-on:bookCodeFocus="createAccountBook"
            v-on:onRowSelect="onRowSelect"
            v-on:editAccountBook="editAccountBook"
            v-on:deleteAccountBook="deleteAccountBook"
            v-on:onPage="onPage"
            v-on:doneTyping="doneTyping"
          ></dataList>
        </SplitterPanel>
        <SplitterPanel :minSize="30">
          <dataForm
            :form_model="form_model"
            :form_valid="form_valid"
            :bookCodeFocus="bookCodeFocus"
            :readMode="readMode"
            v-on:unFocusBookCode="unFocusBookCode"
            v-on:onSave="onSave"
          ></dataForm>
        </SplitterPanel>
      </Splitter>
    </MainContentWarp>
  </AppLayout>
  <DialogForm
    :confirmDialog="confirmSaveDialog"
    :textContent="'ต้องการบันทึกสมุดรายวัน'"
    :textContent2="form_model.name1"
    v-on:close="confirmSaveDialog = false"
    v-on:confirm="confirmSave"
  ></DialogForm>
  <DialogForm
    :confirmDialog="confirmEditDialog"
    :textContent="'ต้องการแก้ไขสมุดรายวัน'"
    :textContent2="form_model.name1"
    v-on:close="confirmEditDialog = false"
    v-on:confirm="confirmEdit"
  ></DialogForm>
  <DialogForm
    :confirmDialog="confirmDeleteDialog"
    :textContent="'ต้องการลบสมุดรายวัน'"
    :textContent2="form_model.name1"
    v-on:close="confirmDeleteDialog = false"
    v-on:confirm="confirmDelete"
  ></DialogForm>
</template>
<style>
.p-dialog.p-component.p-ripple-disabled {
  background-color: #fff;
}
</style>
