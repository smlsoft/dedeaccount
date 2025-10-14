<script setup>
import DialogForm from "@/components/DialogForm.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import XLSX from "xlsx";
import Utils from "@/utils/";

const textContent = ref("ต้องการบันทึกนำเข้าผังบัญชี");
const storeApp = useApp();
const toast = useToast();
const detail = ref();
const myFiles = ref();
const deleteDetailDialog = ref(false);
const import_data = ref([]);
const confirmSaveDialog = ref(false);
const error_msg = ref([]);
const accountbalancetypeList = ref([
  { name: "เดบิต", code: 1 },
  { name: "เครดิต", code: 2 },
]);
const accountCategoryList = ref([
  { name: "สินทรัพย์", code: 1 },
  { name: "หนี้สิน", code: 2 },
  { name: "ทุน", code: 3 },
  { name: "รายได้", code: 4 },
  { name: "ค่าใช้จ่าย", code: 5 },
]);
const financialstatementsList = ref([
  { name: "ทั่วไป", code: 1 },
  { name: "ต้นทุนขาย", code: 2 },
]);

onMounted(() => {
  storeApp.setPageTitle("นำเข้าผังบัญชี");
  storeApp.setActivePage("master");
  storeApp.setActiveChild("import_chart");
});
function onClose() {
  confirmSaveDialog.value = false;
}
function onopen() {
  console.log();

  confirmSaveDialog.value = true;
}
function ImportFile() {
  var config = { raw: true, type: "string" };
  var reader = new FileReader();
  reader.readAsArrayBuffer(myFiles.value.files[0]);
  reader.onload = function (e) {
    var data = new Uint8Array(reader.result);
    var wb = XLSX.read(data, { type: "array" });
    var firstSheetName = wb.SheetNames[0];
    var worksheet = wb.Sheets[firstSheetName];
    var results = XLSX.utils.sheet_to_json(worksheet, config);

    //console.log(results);
    var details = [];
    for (let index = 0; index < results.length; index++) {
      console.log(results[index]);
      details.push({
        accountbalancetype:
          results[index].balance_mode != undefined
            ? parseInt(results[index].balance_mode.toString().trim())
            : "",
        accountcategory:
          results[index].account_type != undefined
            ? parseInt(results[index].account_type.toString().trim())
            : "",
        accountcode:
          results[index].account_code != undefined
            ? results[index].account_code.toString().trim()
            : "",
        accountgroup:
          results[index].account_group != undefined
            ? results[index].account_group.toString().trim()
            : "",
        accountname:
          results[index].account_name != undefined
            ? results[index].account_name.toString().trim()
            : "",
        consolidateaccountcode:
          results[index].main_account != undefined
            ? results[index].main_account.toString()
            : "",
        accountlevel:
          results[index].account_level != undefined
            ? parseInt(results[index].account_level.toString().trim())
            : "",
        financialstatements:
          results[index].financial_statements != undefined
            ? parseInt(results[index].financial_statements.toString().trim())
            : 1,
      });
    }
    error_msg.value = [];
    setTimeout(() => {
      console.log(verifyData(details));
      if (verifyData(details)) {
        import_data.value = details;
      }
    }, 500);
  };
  reader.onerror = function (e) {
    console.log(e);
  };
}

function verifyData(arr) {
  var journal_head = [];
  arr.forEach((data) => {
    journal_head.push(data.accountcode);
  });

  remove_duplicates(journal_head).forEach((data) => {
    var filter = arr.filter((val) => val.accountcode == data);
    if (filter.length > 1) {
      console.log("duplicate " + filter[0].accountcode);
      error_msg.value.push({ word: "รหัสผังบัญชีซ้ำ ", acc_code: filter[0].accountcode });
    } else if (filter.length == 1) {
      if (Utils.checkSpecialString(filter[0].accountcode)) {
        error_msg.value.push({
          word: "รหัสผังบัญชีไม่สามารถใช้อักษรพิเศษได้",
          acc_code: filter[0].accountcode,
        });
      }
      if (Utils.checkSpecialString(filter[0].accountname)) {
        error_msg.value.push({
          word: "ชื่อผังบัญชี " + filter[0].accountname + " ไม่สามารถใช้อักษรพิเศษได้",
          acc_code: filter[0].accountcode,
        });
      }
      if (filter[0].consolidateaccountcode != "") {
        if (Utils.checkSpecialString(filter[0].consolidateaccountcode)) {
          error_msg.value.push({
            word:
              "รหัสผังบัญชีกลาง " +
              filter[0].consolidateaccountcode +
              " ไม่สามารถใช้อักษรพิเศษได้",
            acc_code: filter[0].accountcode,
          });
        }
      }
    }
  });
  return error_msg.value.length == 0 ? true : false;
}

function remove_duplicates(arr) {
  var obj = {};
  var ret_arr = [];
  for (var i = 0; i < arr.length; i++) {
    obj[arr[i]] = true;
  }
  for (var key in obj) {
    ret_arr.push(key);
  }
  return ret_arr;
}

async function confirmSave() {
  MasterdataService.importChart(import_data.value)
    .then((res) => {
      console.log(res);
      if (res.success) {
        toast.add({
          severity: "success",
          summary: "ทำรายการสำเร็จ",
          detail:
            "สร้างรายการผังบัญชี " +
            res.created.length +
            " รายการ และ ปรับปรุงผังบัญชี " +
            res.updated.length +
            " รายการ",
          life: 7000,
        });
        setTimeout(() => {
          confirmSaveDialog.value = false;
          import_data.value = [];
        }, 5000);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function newResultBalance(data) {
  var result = [];
  result = accountbalancetypeList.value.filter((val) => val.code == data);
  return result.length > 0 ? result[0].name : "ไม่พบข้อมูล";
}

function newResultCategory(data) {
  var result = [];
  result = accountCategoryList.value.filter((val) => val.code == data);
  return result.length > 0 ? result[0].name : "ไม่พบข้อมูล";
}

function newResultFinancialStatements(data) {
  var result = [];
  result = financialstatementsList.value.filter((val) => val.code == data);
  return result.length > 0 ? result[0].name : "ไม่พบข้อมูล";
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="grid">
        <div class="col-4 md:col-3">
          <FileUpload
            mode="basic"
            name="input file"
            accept=".xls,.xlsx"
            ref="myFiles"
            :customUpload="true"
            @change="ImportFile()"
            class="p-button-plain p-button-primary"
            chooseIcon="pi pi-upload"
            chooseLabel="นำเข้าผังบัญชี"
          ></FileUpload>
        </div>
      </div>

      <div class="grid" v-if="import_data.length != 0">
        <div class="col-12">
          <Button
            label="บันทึกนำเข้าผังบัญชี"
            icon="pi pi-save"
            class="w-auto p-button-success"
            @click="onopen()"
          ></Button>
          <Button
            label="ยกเลิกนำเข้าผัง"
            icon="pi pi-minus"
            class="w-auto p-button-danger ml-2"
            @click="import_data = []"
          ></Button>
        </div>
      </div>
      <div class="grid mt-2">
        <div class="col-12" v-if="error_msg.length > 0">
          <div class="surface-card p-4 shadow-2 border-round p-fluid my-2">
            <h3>ไม่สามารถทำรายการได้ กรุณาตรวจสอบข้อมูล</h3>
            <div v-for="(data, index) in error_msg" :key="index">
              <p>{{ data.word }} รหัสผังบัญชี : {{ data.acc_code }}</p>
            </div>
          </div>
        </div>
        <div class="col-12" v-if="import_data.length != 0">
          <DataTable
            :value="import_data"
            :paginator="true"
            :rows="20"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDrop56555wn"
            :rowsPerPageOptions="[10, 20, 50]"
            responsiveLayout="scroll"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            stripedRows
            :scrollable="true"
            paginatorPosition="top"
          >
            <Column field="accountcode" header="รหัสฝังบัญชี"></Column>
            <Column field="accountname" header="ชื่อบัญชี"></Column>
            <Column field="accountcategory" header="หมวดบัญชี">
              <template #body="{ data, field }">
                {{ newResultCategory(data[field]) }}
              </template>
            </Column>
            <Column field="accountgroup" header="กลุ่มบัญชี"></Column>
            <Column field="accountlevel" header="ระดับบัญชี"></Column>
            <Column field="consolidateaccountcode" header="รหัสผังบัญชีกลาง"></Column>
            <!-- <Column field="accountbalancetype" header="ด้านบัญชี"></Column> -->
            <Column field="accountbalancetype" header="ด้านบัญชี">
              <template #body="{ data, field }">
                {{ newResultBalance(data[field]) }}
              </template>
            </Column>
            <Column field="financialstatements" header="ผลกระทบต่องบการเงิน">
              <template #body="{ data, field }">
                {{ newResultFinancialStatements(data[field]) }}
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <DialogForm
        :confirmDialog="confirmSaveDialog"
        :textContent="textContent"
        v-on:close="onClose"
        v-on:confirm="confirmSave"
      ></DialogForm>
    </MainContentWarp>
  </AppLayout>
</template>
