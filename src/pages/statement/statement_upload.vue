<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import DialogApprove from "@/components/form/DialogApprove.vue";
import AccountPeriodDataService from "@/services/AccountPeriodService";
import MasterdataService from "@/services/MasterdataService";
import { ref, onMounted, onUnmounted } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";
import { useToast } from "primevue/usetoast";
import axios from "axios";
import ktb from "./components/json_ktb.vue";
import kma from "./components/json_kma.vue";
import ttb from "./components/json_ttb.vue";
import dailyConfig from "./components/daily_config.vue";
import dailyList from "./components/daily_list.vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useRouter } from "vue-router";
import Numeral from "numeral";
import DialogWarringPeriod from "@/components/form/DialogWarringPeriod.vue";

import VuePdfApp from "vue3-pdf-app";

const toast = useToast();
const router = useRouter();
const storeApp = useApp();
const bank_list = ref([
  {
    code: "ktb",
    name: "ธนาคารกรุงไทย",
    logo: "ktb.png",
  },
  {
    code: "kma",
    name: "ธนาคารกรุงศรีอยุธยา",
    logo: "kma.png",
  },
  {
    code: "ttb",
    name: "ธนาคารทหารไทยธนชาต",
    logo: "ttb.png",
  },
]);

const uploadStatement = ref(true);
const selectedBank = ref({
  code: "ktb",
  name: "ธนาคารกรุงไทย",
  logo: "ktb.png",
});
const pdfData = ref([]);
const myFiles = ref(null);
const filepassword = ref("");
const filepasswordValid = ref(false);
const loading = ref(false);
const loadingGL = ref(false);
const screenHeight = ref("height: calc(100vh - 22vh)");
const dataArrayBuffer = ref(null);
const modalConfigDaily = ref(false);
const showDataListDaily = ref(false);
const showDataPDF = ref(false);

const ramdomNumber = ref();
const dialogSaveDaily = ref(false);
const warringAccountperiod = ref(false);

// disable "Previous page" button
const config = ref({
  sidebar: false,
  secondaryToolbar: false,
  toolbar: {
    toolbarViewerLeft: {
      findbar: false,
      previous: true,
      next: true,
      pageNumber: true,
    },
    toolbarViewerRight: false,
    toolbarViewerMiddle: {
      zoomOut: true,
      zoomIn: true,
      scaleSelectContainer: true,
    },
  },
  errorWrapper: true,
});

const daily_config = ref({
  bookcode: "",
  exdocrefdate: "",
  exdocrefno: "",
  accountpassbook: null,
  reversal: null,
});

const daily_config_valid = ref({
  bookcode: false,
  accountpassbook: false,
  reversal: false,
});

const daily_form_bulk = ref([]);
const isDailyPeriod = ref(true);

dayjs.extend(utc);
dayjs.extend(customParseFormat);

onMounted(() => {
  storeApp.setPageTitle("อัพโหลด Statement");
  storeApp.setActivePage("statement_upload");
});

function modalSelectBank(data) {
  uploadStatement.value = true;
  selectedBank.value = data;

  if (selectedBank.value.code == "ttb") {
    filepassword.value = "";
  }
}

function closeUploadStatement() {
  uploadStatement.value = false;
  selectedBank.value = {
    code: "ktb",
    name: "ธนาคารกรุงไทย",
    logo: "ktb.png",
  };
  filepasswordValid.value = false;
  myFiles.value = null;
}

async function uploadFile() {
  if (pdfData.value.length != 0) {
    pdfData.value = [];
  }
  loading.value = true;
  let isPass = await verifyData();
  if (isPass) {
    const formData = new FormData();
    const dataPdfFile = myFiles.value.files[0];
    formData.append("pdf", myFiles.value.files[0]);

    await axios
      .post("http://192.168.2.64:3001/", formData, {
        params: {
          bank: selectedBank.value.code,
          password: filepassword.value,
        },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        uploadStatement.value = false;
        setTimeout(() => {
          pdfData.value = response.data.result;
          showDataPDF.value = true;
          console.log(pdfData.value);
          if (pdfData.value.length == 0) {
            toast.add({
              severity: "error",
              summary: "Error",
              detail: "รูปแบบไฟล์ไม่ถูกต้อง กรุณาตรวจสอบ",
              life: 3000,
            });
            loading.value = false;
            return;
          } else {
            loading.value = false;
            showViewerPDF(dataPdfFile);
          }
        }, 500);
      })
      .catch((error) => {
        console.log(error.response);
        loading.value = false;
        toast.add({
          severity: "error",
          summary: "Error",
          detail: error.response.data.message,
          life: 3000,
        });
      });
  } else {
    loading.value = false;
  }
}

async function verifyData() {
  var errorCount = 0;

  if (myFiles.value.files[0] == undefined) {
    toast.add({
      severity: "warn",
      summary: "แจ้งเตือน",
      detail: "กรุณาเลือก File Statement",
      life: 3000,
    });
    errorCount += 1;
  }

  if (filepassword.value == "" && selectedBank.value.code != "ttb") {
    toast.add({
      severity: "warn",
      summary: "แจ้งเตือน",
      detail: "กรุณากรอกรหัสผ่าน",
      life: 3000,
    });
    filepasswordValid.value = true;
    errorCount += 1;
  } else {
    filepasswordValid.value = false;
  }

  if (errorCount != 0) {
    return false;
  } else {
    return true;
  }
}

async function showViewerPDF(myFiles) {
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(myFiles);

  fileReader.onload = () => {
    const arrayBuffer = fileReader.result;
    dataArrayBuffer.value = arrayBuffer;

    setTimeout(() => {
      const inpPdfPwd = document.getElementById("password");
      const btnPdfPwd = document.getElementById("passwordSubmit");

      inpPdfPwd.value = filepassword.value;
      btnPdfPwd.click();
    }, 500);
  };
}

function cancelStatement() {
  pdfData.value = [];
  showDataPDF.value = false;
  dataArrayBuffer.value = null;
  showDataListDaily.value = false;
  daily_form_bulk.value = [];

  closeUploadStatement();
}

function configDaily() {
  modalConfigDaily.value = true;
}

function closeConfigDaily() {
  modalConfigDaily.value = false;

  daily_config.value = {
    bookcode: "",
    exdocrefdate: "",
    exdocrefno: "",
    accountpassbook: null,
    reversal: null,
  };

  daily_config_valid.value = {
    bookcode: false,
    accountpassbook: false,
    reversal: false,
  };
}

async function saveStatement() {
  let isPass = await verifyDataSave();
  if (isPass) {
    generateDoc();
  }
}

async function verifyDataSave() {
  var errorCount = 0;
  if (daily_config.value.bookcode == "") {
    errorCount += 1;
    daily_config_valid.value.bookcode = true;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณาเลือก ผังบัญชีสมุดเงินฝาก",
      life: 3000,
    });
  } else {
    daily_config_valid.value.bookcode = false;
  }

  if (daily_config.value.accountpassbook == null) {
    errorCount += 1;
    daily_config_valid.value.accountpassbook = true;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณาเลือกสมุดรายวัน",
      life: 3000,
    });
  } else {
    daily_config_valid.value.accountpassbook = false;
  }

  if (daily_config.value.reversal == null) {
    errorCount += 1;
    daily_config_valid.value.reversal = true;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณาเลือก ผังบัญชีกลับรายการ",
      life: 3000,
    });
  } else {
    daily_config_valid.value.reversal = false;
  }

  if (errorCount != 0) {
    return false;
  } else {
    return true;
  }
}

async function generateDoc() {
  loading.value = true;

  // head gl
  const batchId = Utils.getBatchID();
  const bookcode = daily_config.value.bookcode;
  const exdocrefdate = daily_config.value.exdocrefdate;
  const exdocrefno = daily_config.value.exdocrefno;

  pdfData.value.forEach((element, index) => {
    let accountdescription = "";
    let journaldetail = [
      {
        accountcode: "",
        accountname: "",
        debitamount: 0,
        creditamount: 0,
      },
      {
        accountcode: "",
        accountname: "",
        debitamount: 0,
        creditamount: 0,
      },
    ];

    let float_deposit = 0;
    let float_withdraw = 0;

    if (selectedBank.value.code == "ktb" || selectedBank.value.code == "kma") {
      float_deposit = parseFloat(element.deposit.replace(",", ""));
      float_withdraw = parseFloat(element.withdraw.replace(",", ""));
      //ถอน
      if (element.withdraw != "") {
        journaldetail[0].accountcode =
          daily_config.value.accountpassbook.accountcode;
        journaldetail[0].accountname =
          daily_config.value.accountpassbook.accountname;
        journaldetail[0].debitamount = 0;
        journaldetail[0].creditamount = float_withdraw;

        journaldetail[1].accountcode = daily_config.value.reversal.accountcode;
        journaldetail[1].accountname = daily_config.value.reversal.accountname;
        journaldetail[1].debitamount = float_withdraw;
        journaldetail[1].creditamount = 0;
      }
      //ฝาก
      if (element.deposit != "") {
        journaldetail[0].accountcode =
          daily_config.value.accountpassbook.accountcode;
        journaldetail[0].accountname =
          daily_config.value.accountpassbook.accountname;
        journaldetail[0].debitamount = float_deposit;
        journaldetail[0].creditamount = 0;

        journaldetail[1].accountcode = daily_config.value.reversal.accountcode;
        journaldetail[1].accountname = daily_config.value.reversal.accountname;
        journaldetail[1].debitamount = 0;
        journaldetail[1].creditamount = float_deposit;
      }

      //รายละเอียด
      accountdescription =
        selectedBank.value.name +
        " ~ " +
        element.name +
        " " +
        element.description;

      accountdescription.trim();
    } else if (selectedBank.value.code == "ttb") {
      const regexDeposit = /^\+.*/g;
      const regexWithdraw = /^\-.*/g;
      if (regexDeposit.test(element.quantity)) {
        float_deposit = Numeral(element.quantity.replace("+", "")).value();

        journaldetail[0].accountcode =
          daily_config.value.accountpassbook.accountcode;
        journaldetail[0].accountname =
          daily_config.value.accountpassbook.accountname;
        journaldetail[0].debitamount = float_deposit;
        journaldetail[0].creditamount = 0;

        journaldetail[1].accountcode = daily_config.value.reversal.accountcode;
        journaldetail[1].accountname = daily_config.value.reversal.accountname;
        journaldetail[1].debitamount = 0;
        journaldetail[1].creditamount = float_deposit;
      } else if (regexWithdraw.test(element.quantity)) {
        float_withdraw = Numeral(element.quantity.replace("-", "")).value();

        journaldetail[0].accountcode =
          daily_config.value.accountpassbook.accountcode;
        journaldetail[0].accountname =
          daily_config.value.accountpassbook.accountname;
        journaldetail[0].debitamount = 0;
        journaldetail[0].creditamount = float_withdraw;

        journaldetail[1].accountcode = daily_config.value.reversal.accountcode;
        journaldetail[1].accountname = daily_config.value.reversal.accountname;
        journaldetail[1].debitamount = float_withdraw;
        journaldetail[1].creditamount = 0;
      }

      //รายละเอียด
      accountdescription = selectedBank.value.name + " ~ " + element.name;
    }

    daily_form_bulk.value.push({
      docdate: covertDateToService(element.date),
      docno: Utils.getDocNoDate("JO"),
      bookcode: bookcode,
      batchid: batchId,
      exdocrefdate:
        exdocrefdate != ""
          ? Utils.getFormatDateTime(exdocrefdate)
          : "0001-01-01T00:00:00Z",
      exdocrefno: exdocrefno,
      journaltype: 0,
      accountyear: parseInt(Utils.getYear().toString()) + 543,
      accountperiod: 0,
      accountdescription: accountdescription,
      journaldetail: journaldetail,
      amount: float_deposit || float_withdraw,
    });
  });

  console.log(daily_form_bulk.value);

  await checkPeriod();

  modalConfigDaily.value = false;
  closeConfigDaily();

  showDataPDF.value = false;
  setTimeout(() => {
    loading.value = false;

    //check account period
    const checkDailyPeriod = daily_form_bulk.value.filter(
      (data) => data.accountperiod == 0
    );

    if (checkDailyPeriod.length == 0) {
      isDailyPeriod.value = false;
    } else {
      isDailyPeriod.value = true;
      warringAccountperiod.value = true;
    }

    showDataListDaily.value = true;
  }, 500);
}

function covertDateToService(data) {
  let dateString = data;

  // Convert the date object to ISO 8601 format
  let dateObj = null;
  if (selectedBank.value.code == "ktb") {
    dateObj = dayjs.utc(dateString, "DD/MM/YY HH:mm");
  } else if (selectedBank.value.code == "kma") {
    dateObj = dayjs.utc(dateString, "DD/MM/YYYY HH:mm:ss");
  } else if (selectedBank.value.code == "ttb") {
    dateObj = dayjs.utc(dateString, "DD/MM/YYYY");
  }

  let isoDate = dateObj.toISOString();
  return isoDate;
}

async function checkPeriod() {
  // group date and covert 2023-01-31T00:00:00.000Z to 2023-01-31
  const groupedData = daily_form_bulk.value.reduce((groups, item) => {
    const date = new Date(item.docdate).toISOString().split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item.id);
    return groups;
  }, {});

  //2022-01-29, 2023-01-30, 2023-01-31
  const docDates = Object.keys(groupedData).reverse().join(",");

  AccountPeriodDataService.getAccountPeriodByDate(docDates)
    .then((res) => {
      console.log(res);
      if (res.success) {
        // check ข้อมูลถ้าวันที่ตรงกันให้เพิ่มใน daily_form_bulk
        res.data.forEach((group) => {
          daily_form_bulk.value.forEach((record) => {
            const date = new Date(record.docdate);
            date.setUTCHours(0, 0, 0, 0);
            const newDateString = date.toISOString();

            if (
              newDateString ===
              dayjs.utc(group.date, "YYYY-MM-DD").toISOString()
            ) {
              record.accountperiod = group.perioddata.period;
            }
          });
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function confrimeSaveDaily() {
  ramdomNumber.value = Utils.generateRandomNumber();
  dialogSaveDaily.value = true;
}

function confirmSaveDailyFalse() {
  ramdomNumber.value = Utils.generateRandomNumber();
}

function createDaily() {
  loadingGL.value = true;

  MasterdataService.ImportGLJournal(daily_form_bulk.value)
    .then((res) => {
      console.log(res);
      if (res.success) {
        toast.add({
          severity: "success",
          summary: "ทำรายการสำเร็จ",
          detail: "บันทึกรายการเดินบัญชีสำเร็จ",
          life: 3000,
        });
        setTimeout(() => {
          loadingGL.value = true;
          router.push({ name: "dailyList" });
        }, 1000);
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
      <div class="surface-card p-3 shadow-2 border-round">
        <div class="mb-2 flex align-items-center justify-content-between">
          <div>
            <Button
              icon="pi pi-upload"
              @click="uploadStatement = true"
              label="อัพโหลด"
              v-if="pdfData.length == 0"
            />
            <Button
              class="p-button-danger"
              icon="pi pi-times"
              @click="cancelStatement()"
              label="ยกเลิก"
              v-if="pdfData.length != 0"
            />
          </div>
          <div>
            <Button
              v-if="!showDataListDaily"
              :disabled="pdfData.length == 0"
              class="p-button-warning"
              icon="pi pi-save"
              label="ยืนยัน"
              @click="configDaily()"
            />
            <Button
              v-if="showDataListDaily"
              :disabled="isDailyPeriod"
              class="p-button-success"
              icon="pi pi-save"
              label="บันทึกรายวัน"
              @click="confrimeSaveDaily()"
            />
          </div>
        </div>
        <div class="surface-section flex-auto">
          <Splitter :style="screenHeight">
            <SplitterPanel :size="50">
              <VuePdfApp
                v-if="dataArrayBuffer != null"
                style="height: 78vh"
                :pdf="dataArrayBuffer"
                :config="config"
              />
            </SplitterPanel>
            <SplitterPanel :size="50">
              <div
                v-if="loading"
                class="flex align-items-center justify-content-between"
                style="height: 73vh"
              >
                <ProgressSpinner animationDuration="10s" />
              </div>
              <div v-if="showDataPDF">
                <ktb
                  :pdfData="pdfData"
                  v-if="selectedBank.code == 'ktb' && pdfData.length != 0"
                />
                <kma
                  :pdfData="pdfData"
                  v-if="selectedBank.code == 'kma' && pdfData.length != 0"
                />
                <ttb
                  :pdfData="pdfData"
                  v-if="selectedBank.code == 'ttb' && pdfData.length != 0"
                />
              </div>

              <dailyList
                :data_list="daily_form_bulk"
                v-if="showDataListDaily"
              />
            </SplitterPanel>
          </Splitter>
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>

  <Dialog
    v-model:visible="uploadStatement"
    @update:visible="closeUploadStatement"
    appendTo="body"
    :modal="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '60vw' }"
    header="Upload Statement"
  >
    <div class="text-900 text-xl font-medium mb-3 text-center">
      กรุณาเลือกธนาคาร
    </div>

    <div class="grid">
      <div class="col-12 lg:col-6 p-3" v-for="bank in bank_list">
        <div
          class="shadow-2 surface-card p-4 border-2 border-transparent cursor-pointer"
          style="border-radius: 10px"
          :class="{ 'border-blue-500': selectedBank.code === bank.code }"
          @click="modalSelectBank(bank)"
        >
          <div class="flex align-items-center mb-0">
            <div class="mr-3">
              <span
                class="inline-flex justify-content-center align-items-center"
                style="border-radius: 4px; width: 45px; height: 45px"
              >
                <img
                  :src="`/images/bankslogo/` + bank.logo"
                  alt="Image"
                  class="w-full"
                />
              </span>
            </div>
            <div>
              <span class="text-900 text-xl mb-0 font-medium">{{
                bank.name
              }}</span>
              <p class="m-0 text-600 font-medium text-sm">PDF File Statement</p>
            </div>
            <RadioButton
              name="selectedBank"
              :value="bank.code"
              v-model="selectedBank.code"
              class="ml-auto"
            ></RadioButton>
          </div>
        </div>
      </div>
      <div class="col-12">
        <FileUpload
          mode="basic"
          ref="myFiles"
          accept=".pdf"
          :maxFileSize="1000000"
          chooseLabel="เลือกไฟล์"
          :customUpload="true"
          class="w-full"
        />
      </div>
      <div class="col-12" >
        <span class="p-float-label">
          <InputText
            type="password"
            v-model="filepassword"
            :class="filepasswordValid ? 'p-invalid ' : ''"
            class="filepassword w-full"
          />
          <label for="filepassword">รหัสผ่าน</label>
        </span>
      </div>
    </div>

    <template #footer>
      <div class="border-top-1 surface-border pt-3">
        <Button
          icon="pi pi-times"
          @click="closeUploadStatement()"
          label="Cancel"
          class="p-button-text"
        ></Button>
        <Button
          icon="pi pi-upload"
          :loading="loading"
          @click="uploadFile"
          label="Upload"
          class="p-button-success"
        ></Button>
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="modalConfigDaily"
    @update:visible="closeConfigDaily"
    appendTo="body"
    :modal="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '60vw' }"
    header="กำหนดค่ารายวัน"
  >
    <dailyConfig
      :daily_config="daily_config"
      :daily_config_valid="daily_config_valid"
    />

    <template #footer>
      <div class="border-top-1 surface-border pt-3">
        <Button
          icon="pi pi-times"
          @click="closeConfigDaily()"
          label="Cancel"
          class="p-button-text"
        ></Button>
        <Button
          icon="pi pi-save"
          :loading="loading"
          @click="saveStatement()"
          label="บันทึก"
          class="p-button-success"
        ></Button>
      </div>
    </template>
  </Dialog>

  <DialogApprove
    :loading="loadingGL"
    :mode="'gl'"
    :title="'ยืนยันการสร้างเอกสารรายวัน'"
    :ramdomNumber="ramdomNumber"
    :confirmDialog="dialogSaveDaily"
    v-on:close="dialogSaveDaily = false"
    v-on:confirmJob="createDaily()"
    v-on:confirmJobFalse="confirmSaveDailyFalse()"
  />

  <DialogWarringPeriod
    :confirmDialog="warringAccountperiod"
    v-on:confirm="warringAccountperiod = false"
  />
</template>

<style>
#overlayContainer #passwordOverlay {
  display: none;
}

#outerContainer {
  z-index: 0000;
}

.tablepdf.p-datatable-table .p-datatable-tbody tr td {
  padding: 0rem 0rem;
}
</style>
