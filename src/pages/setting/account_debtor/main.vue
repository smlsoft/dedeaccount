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

defineEmits(['editDebtor', 'deleteDebtor'])

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
const debtorCodeFocus = ref(false);
const confirmSaveDialog = ref(false);
const readMode = ref(false);
const confirmEditDialog = ref(false);
const confirmDeleteDialog = ref(false);

const form_model = ref({
  code: "",
  name: "",
  taxid: "",
  branchnumber: "",
  addressforbilling: "",
  address: "",

  districtcode: "",
  provincecode: "",
  subdistrictcode: "",
  zipcode: "",

  phoneprimary: "",
  personaltype: 0,
  customertype: 0,
});


const form_valid = ref({
  code: true,
  name: true,
  taxid: true,
  branchnumber: true,
  address: true,
  phoneprimary: true,
  personaltype: true,
  customertype: true,
  districtcode: true,
  provincecode: true,
  subdistrictcode: true,
  zipcode: true,
});

onMounted(() => {
  getDebtorList();
  storeApp.setPageTitle("ลูกหนี้");
  storeApp.setActivePage("master");
  storeApp.setActiveChild("account_debtor");
});


function getDebtorList() {
  loading.value = true;
  MasterdataService.getDebtorList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {

      if (res.success) {
        var newDataValue = res.data.map(x => {

          let addrZero = (x.addressforbilling.address != null && x.addressforbilling.address.length > 0) ? x.addressforbilling.address[0] : "";
          let telephoneZero = x.addressforbilling.phoneprimary;
          let district = x.addressforbilling.districtcode;
          let province = x.addressforbilling.provincecode;
          let subdistrict = x.addressforbilling.subdistrictcode;
          let zipcode = x.addressforbilling.zip_code;
          return {
            ...x,
            name: x.names[0].name,
            address: addrZero,
            phoneprimary: telephoneZero,
            districtcode: district,
            provincecode: province,
            subdistrictcode: subdistrict,
            zipcode: zipcode,
          };
        })


        data_list.value = newDataValue.sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        });
        console.log(data_list.value);
        totalItemsCount.value = res.pagination.total;
        loading.value = false;
      }
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function createDebtor() {
  clearForm();
  debtorCodeFocus.value = true;
  readMode.value = false;
}

function clearForm() {
  readMode.value = true;
  form_model.value = {
    code: "",
    name: "",
    taxid: "",
    branchnumber: "",
    address: "",
    addressforbilling: "",
    phoneprimary: "",
    customertype: 0,
    personaltype: 0,

  };
  form_valid.value = {
    code: true,
    name: true,
    idnumber: true,
    branchnumber: true,
    taxid: true,
    address: true,
    phoneprimary: true,

  };
}

function unFocusDebtorCode() {
  debtorCodeFocus.value = false;
}

async function onSave() {
  var isPass = await verifyData();
  if (isPass) {
    confirmSaveDialog.value = true;
  }
}

function transformDebtorModels() {

  // console.log("DATA", form_model)
  let data = {
    code: form_model.value.code,
    names: [
      {
        code: "th",
        name: form_model.value.name,
      }
    ],
    taxid: form_model.value.taxid,
    branchnumber: form_model.value.branchnumber,
    addressforbilling: {
      address: [form_model.value.address],
      districtcode: form_model.value.districtcode,
      phoneprimary: form_model.value.phoneprimary,
      provincecode: form_model.value.provincecode,
      subdistrictcode: form_model.value.subdistrictcode,
      zipcode: form_model.value.zipcode.zip_code,
    },
    personaltype: form_model.value.personaltype,
    customertype: form_model.value.customertype,

  };


  // console.log(data)
  return data;
}

async function confirmSave() {
  let data = transformDebtorModels()
  if (
    form_model.value.guidfixed == undefined ||
    form_model.value.guidfixed == "" ||
    form_model.value.guidfixed == null
  ) {
    try {
      const res = await MasterdataService.postDebtor(data);
      // console.log(res);

      if (res.success) {
        clearForm();
        getDebtorList();
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
        detail: "บันทึกไม่สำเร็จ ลูกหนี้ซ้ำ",
        life: 3000,
      });
    }
  } else {
    try {
      // console.log(data,form_model.value.guidfixed);
      const res = await MasterdataService.putDebtor(
        form_model.value.guidfixed,
        data
      );
      // console.log(data.value,form_model.value.guidfixed);
      if (res.success) {
        clearForm();
        getDebtorList();
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
  // console.log(form_model);
  let checkValid = 0;
  let err_msg = "";
  if (form_model.value.code == "") {
    form_valid.value.code = false;
    err_msg += "กรุณากรอกรหัสลูกหนี้\n";
    checkValid += 1;
  } else {
    if (Utils.checkSpecialString(form_model.value.code)) {
      form_valid.value.code = false;
      err_msg += "รหัสลูกหนี้ไม่สามารถใช้อักษรพิเศษได้";
      checkValid += 1;
    } else {
      form_valid.value.code = true;
    }
  }
  if (form_model.value.name == "") {
    form_valid.value.name = false;
    err_msg += "กรุณากรอกข้อมูล ชื่อลูกหนี้ ";
    checkValid += 1;
  } else {
    if (Utils.checkSpecialString(form_model.value.name)) {
      form_valid.value.name = false;
      err_msg += "ชื่อลูกหนี้ไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.name = true;
    }
  }
  if (form_model.value.taxid == "") {
    form_valid.value.taxid = false;
    err_msg += "กรุณากรอกข้อมูล รหัสลูกหนี้ ";
    checkValid += 1;
  } else {
    if (Utils.checkSpecialString(form_model.value.taxid)) {
      form_valid.value.taxid = false;
      err_msg += "รหัสลูกหนี้ไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.taxid = true;
    }
  }
  if (form_model.value.customertype == "1") {
    if (form_model.value.branchnumber == "") {
      form_valid.value.branchnumber = false;
      err_msg += "กรุณากรอกข้อมูล หมายเลขสาขา ";
      checkValid += 1;
    } else {
      if (Utils.checkSpecialString(form_model.value.branchnumber)) {
        form_valid.value.branchnumber = false;
        err_msg += "หมายเลขสาขาไม่สามารถใช้อักษรพิเศษได้ ";
        checkValid += 1;
      } else {
        form_valid.value.branchnumber = true;
      }
    }
  } else {
    form_valid.value.branchnumber = true;
  }
  if (form_model.value.address == "") {
    form_valid.value.address = false;
    err_msg += "กรุณากรอกข้อมูล ที่อยู่ลูกหนี้ ";
    checkValid += 1;
  } else {
    if (Utils.checkSpecialString(form_model.value.address)) {
      form_valid.value.address = false;
      err_msg += "ที่อยู่ลูกหนี้ไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.address = true;
    }
  }
  if (form_model.value.phoneprimary == "") {
    form_valid.value.phoneprimary = false;
    err_msg += "กรุณากรอกข้อมูล หมายเลขโทรศัพท์ ";
    checkValid += 1;
  } else {
    if (Utils.checkSpecialString(form_model.value.phoneprimary)) {
      form_valid.value.phoneprimary = false;
      err_msg += "หมายเลขโทรศัพท์ ไม่สามารถใช้อักษรพิเศษได้ ";
      checkValid += 1;
    } else {
      form_valid.value.phoneprimary = true;
    }
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
  // console.log(data);
}

function editDebtor(data) {
  readMode.value = true;
  confirmEditDialog.value = true;
  form_model.value = data;
}

function confirmEdit() {
  readMode.value = false;
  confirmEditDialog.value = false;
}

function deleteDebtor(data) {
  readMode.value = true;
  confirmDeleteDialog.value = true;
  form_model.value = data;
}

function confirmDelete() {
  MasterdataService.deleteDebtor(form_model.value.guidfixed)
    .then((res) => {
      // console.log(res);
      if (res.success) {
        getDebtorList();
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "ลบลูกหนี้เรียบร้อยแล้ว",
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
  getDebtorList();
}

function doneTyping(data) {
  filters.value = data;
  activePage.value = 1;
  getDebtorList();
}

</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <Splitter style="height: 100vh">
        <SplitterPanel :minSize="30">
          <dataList :data_list="data_list" :loading="loading" :totalItemsCount="totalItemsCount"
            v-on:debtorCodeFocus="createDebtor" v-on:onRowSelect="onRowSelect" v-on:editDebtor="editDebtor"
            v-on:deleteDebtor="deleteDebtor" v-on:onPage="onPage" v-on:doneTyping="doneTyping"></dataList>
        </SplitterPanel>
        <SplitterPanel :minSize="30">
          <dataForm :form_model="form_model" :form_valid="form_valid" :debtorCodeFocus="debtorCodeFocus"
            :readMode="readMode" v-on:unFocusDebtorCode="unFocusDebtorCode" v-on:onSave="onSave"></dataForm>
        </SplitterPanel>
      </Splitter>
    </MainContentWarp>
  </AppLayout>
  <DialogForm :confirmDialog="confirmSaveDialog" :textContent="'ต้องการบันทึกลูกหนี้'" :textContent2="form_model.name"
    v-on:close="confirmSaveDialog = false" v-on:confirm="confirmSave"></DialogForm>
  <DialogForm :confirmDialog="confirmEditDialog" :textContent="'ต้องการแก้ไขลูกหนี้'" :textContent2="form_model.name"
    v-on:close="confirmEditDialog = false" v-on:confirm="confirmEdit"></DialogForm>
  <DialogForm :confirmDialog="confirmDeleteDialog" :textContent="'ต้องการลบลูกหนี้'" :textContent2="form_model.name"
    v-on:close="confirmDeleteDialog = false" v-on:confirm="confirmDelete"></DialogForm>
</template>
<style>
.p-dialog.p-component.p-ripple-disabled {
  background-color: #fff;
}
</style>
