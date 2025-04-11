<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import DialogApprove from "@/components/DialogApprove.vue";
import AccountPeriodDataService from "@/services/AccountPeriodService";
import MasterdataService from "@/services/MasterdataService";
import BankStatementReaderService from "@/services/BankStatementReaderService";
import { ref, onMounted, onUnmounted } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";
import { useToast } from "primevue/usetoast";
import JsonDataTable from "./components/JsonTableData.vue";
import StatementDailyConfig from "./components/StatementDailyConfig.vue";
import StatementDailyList from "./components/StatementDailyList.vue";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useRouter } from "vue-router";
import Numeral from "numeral";
import DialogWarringPeriod from "@/components/DialogWarringPeriod.vue";

import VuePdfApp from "vue3-pdf-app";

const toast = useToast();
const router = useRouter();
const storeApp = useApp();
const bank_list = ref([
  {
    code: "ktb",
    name: "กรุงไทย",
    logo: "ktb.png",
  },
  {
    code: "kma",
    name: "กรุงศรีอยุธยา",
    logo: "kma.png",
  },
  {
    code: "ttb",
    name: "ทหารไทยธนชาต",
    logo: "ttb.png",
  },
  {
    code: "uob",
    name: "ยูโอบี",
    logo: "uob.png",
  },
  {
    code: "kbank",
    name: "กสิกรไทย",
    logo: "kbank.png",
  },
  {
    code: "bbl",
    name: "กรุงเทพ",
    logo: "bbl.png",
  },
  {
    code: "scb",
    name: "ไทยพาณิชย์",
    logo: "scb.png",
  },
  {
    code: "gsb",
    name: "ออมสิน",
    logo: "gsb.png",
  },
]);

const pdfViewerKey = ref(0);

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
const isShowInputPassword = ref(false);
let originalConsoleError;
let pdfErrorDetected = false;
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

const pdfDisplayError = ref(false);

dayjs.extend(utc);
dayjs.extend(customParseFormat);

onMounted(() => {
  storeApp.setPageTitle("อัพโหลด Statement");
  storeApp.setActivePage("statement_upload");
  setupPdfErrorDetection();
});

onUnmounted(() => {
  teardownPdfErrorDetection();
});

function modalSelectBank(data) {
  selectedBank.value = data;

  filepassword.value = "";
  filepasswordValid.value = false;
  isShowInputPassword.value = false;
  myFiles.value.clear();
}

function closeUploadStatement() {
  uploadStatement.value = false;
  selectedBank.value = {
    code: "ktb",
    name: "ธนาคารกรุงไทย",
    logo: "ktb.png",
  };
  filepassword.value = "";
  filepasswordValid.value = false;
  myFiles.value = null;
  isShowInputPassword.value = false;
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
    BankStatementReaderService.pdfReader(
      formData,
      selectedBank.value.code,
      filepassword.value
    )
      .then((response) => {
        uploadStatement.value = false;
        setTimeout(() => {
          showDataPDF.value = true;
          console.log(response);
          pdfData.value = response.result;

          /// add last row sum totalDeposit and sum totalWithdraw and check "" or null replace 0
          let sumDeposit = 0;
          let sumWithdraw = 0;
          pdfData.value.forEach((element) => {
            if (element.deposit != "") {
              sumDeposit += parseFloat(element.deposit.replace(/,/g, ""));
            }
            if (element.withdraw != "") {
              sumWithdraw += parseFloat(element.withdraw.replace(/,/g, ""));
            }
          });

          pdfData.value.push({
            date: "",
            description: "รวม",
            deposit: Numeral(sumDeposit).format("0,0.00"),
            withdraw: Numeral(sumWithdraw).format("0,0.00"),
            balance: "",
          });

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
        console.log(error.response.data.message);
        loading.value = false;
        if (
          error.response.data.message == "Error reading PDF: No password given or invalid password" || error.response.data.message == "Error reading PDF: PasswordException: No password given"
        ) {
          filepasswordValid.value = true;
          isShowInputPassword.value = true;
          toast.add({
            severity: "warn",
            summary: "แจ้งเตือน",
            detail: "กรุณากรอกรหัสผ่าน",
            life: 3000,
          });
        } else if (
          error.response.data.message == "Error reading PDF: Incorrect Password"
        ) {
          filepasswordValid.value = true;
          toast.add({
            severity: "error",
            summary: "แจ้งเตือน",
            detail: "รหัสผ่านไม่ถูกต้อง",
            life: 3000,
          });
        }
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

  if (errorCount != 0) {
    return false;
  } else {
    return true;
  }
}

function setupPdfErrorDetection() {
  // บันทึก console.error ต้นฉบับ
  originalConsoleError = console.error;

  // แทนที่ console.error ด้วยฟังก์ชันของเรา
  console.error = function () {
    // เรียกใช้ console.error ดั้งเดิม
    originalConsoleError.apply(console, arguments);

    // ตรวจสอบว่ามีข้อความเกี่ยวกับ PDF error หรือไม่
    const errorString = Array.from(arguments).join(" ");
    if (
      errorString.includes("PDF") ||
      errorString.includes("pdf") ||
      errorString.includes("Invalid stream") ||
      errorString.includes("FormatError") ||
      errorString.includes("Unknown compression")
    ) {
      pdfErrorDetected = true;
      // หากกำลังโหลด PDF อยู่ ให้แสดง overlay
      if (dataArrayBuffer.value !== null) {
        pdfDisplayError.value = true;
      }
    }
  };

  // เพิ่ม event listener สำหรับข้อผิดพลาดที่ไม่ได้จับ
  window.addEventListener("error", function (event) {
    if (
      event.message &&
      (event.message.includes("PDF") ||
        event.message.includes("pdf") ||
        event.message.includes("updateCallback") ||
        event.message.includes("overlay"))
    ) {
      pdfErrorDetected = true;
      // หากกำลังโหลด PDF อยู่ ให้แสดง overlay
      if (dataArrayBuffer.value !== null) {
        pdfDisplayError.value = true;
      }
    }
  });
}

function teardownPdfErrorDetection() {
  if (originalConsoleError) {
    console.error = originalConsoleError;
  }
}

async function showViewerPDF(myFiles) {
  // รีเซ็ตตัวแปรตรวจจับข้อผิดพลาด
  pdfErrorDetected = false;
  pdfDisplayError.value = false;

  try {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(myFiles);

    fileReader.onload = () => {
      try {
        dataArrayBuffer.value = fileReader.result;

        setTimeout(() => {
          try {
            const inpPdfPwd = document.getElementById("password");
            const btnPdfPwd = document.getElementById("passwordSubmit");

            if (inpPdfPwd && btnPdfPwd) {
              inpPdfPwd.value = filepassword.value;
              btnPdfPwd.click();

              // ตรวจสอบข้อผิดพลาดหลังจากพยายามโหลด PDF
              setTimeout(() => {
                if (pdfErrorDetected) {
                  pdfDisplayError.value = true;
                  return;
                }

                // ตรวจสอบว่า PDF ถูกแสดงอย่างถูกต้องหรือไม่
                const pdfPages = document.querySelectorAll(".page");
                const pdfErrorElements =
                  document.querySelectorAll(".pdf__error");

                if (pdfErrorElements.length > 0 || pdfPages.length === 0) {
                  pdfDisplayError.value = true;
                }
              }, 2000);
            } else {
              console.error("ไม่พบองค์ประกอบสำหรับใส่รหัสผ่าน PDF");
              pdfDisplayError.value = true;
            }
          } catch (innerErr) {
            console.error(
              "เกิดข้อผิดพลาดเมื่อกำลังตั้งค่ารหัสผ่านหรือคลิกปุ่ม:",
              innerErr
            );
            pdfDisplayError.value = true;
          }
        }, 500);
      } catch (loadErr) {
        console.error("เกิดข้อผิดพลาดระหว่างการโหลดไฟล์:", loadErr);
        pdfDisplayError.value = true;
      }
    };

    fileReader.onerror = (err) => {
      console.error("เกิดข้อผิดพลาดในการอ่านไฟล์:", err);
      pdfDisplayError.value = true;
    };
  } catch (err) {
    console.error("เกิดข้อผิดพลาดที่ไม่คาดคิดใน showViewerPDF:", err);
    pdfDisplayError.value = true;
  }
}

function cancelStatement() {
  pdfData.value = [];
  showDataPDF.value = false;
  dataArrayBuffer.value = null;
  showDataListDaily.value = false;
  daily_form_bulk.value = [];
  pdfDisplayError.value = false;
  pdfErrorDetected = false;
  pdfViewerKey.value++; // รีเซ็ต component VuePdfApp

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
  console.log(isPass);
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

  /// remove last row  sum totalDeposit and sum totalWithdraw
  pdfData.value.pop();

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

    float_deposit = parseFloat(element.deposit.replace(",", ""));
    float_withdraw = parseFloat(element.withdraw.replace(",", ""));

    //ถอน
    if (element.withdraw != "") {
      journaldetail[0].accountcode = daily_config.value.reversal.accountcode;
      journaldetail[0].accountname = daily_config.value.reversal.accountname;
      journaldetail[0].debitamount = float_withdraw;
      journaldetail[0].creditamount = 0;

      journaldetail[1].accountcode =
        daily_config.value.accountpassbook.accountcode;
      journaldetail[1].accountname =
        daily_config.value.accountpassbook.accountname;
      journaldetail[1].debitamount = 0;
      journaldetail[1].creditamount = float_withdraw;
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
    accountdescription = selectedBank.value.name + " ~ " + element.description;

    accountdescription.trim();

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

  // ส่วนการจัดการพิเศษสำหรับธนาคารออมสิน (แปลงปีพุทธศักราชเป็นคริสตศักราช)
  if (selectedBank.value.code === "gsb") {
    // ตรวจสอบรูปแบบวันที่ว่าเป็น YYYY-MM-DD หรือ DD/MM/YYYY
    if (dateString.includes("-")) {
      // กรณีรูปแบบ YYYY-MM-DD (เช่น 2567-05-20)
      const dateParts = dateString.split("-");

      // ตรวจสอบว่าปีเป็นปีพุทธศักราช (มากกว่า 2500)
      if (dateParts[0].length === 4 && parseInt(dateParts[0]) > 2500) {
        // แปลงปีพุทธศักราชเป็นคริสตศักราช (ลบด้วย 543)
        const gregorianYear = parseInt(dateParts[0]) - 543;
        // สร้างวันที่ใหม่ในรูปแบบ YYYY-MM-DD
        dateString = `${gregorianYear}-${dateParts[1]}-${dateParts[2]}`;
      }
    } else if (dateString.includes("/")) {
      // กรณีรูปแบบ DD/MM/YYYY
      const dateParts = dateString.split("/");

      // ตรวจสอบว่ามี 3 ส่วน (วัน/เดือน/ปี) และปีเป็นปีพุทธศักราช
      if (
        dateParts.length === 3 &&
        dateParts[2].length === 4 &&
        parseInt(dateParts[2]) > 2500
      ) {
        // แปลงปีพุทธศักราชเป็นคริสตศักราช
        const gregorianYear = parseInt(dateParts[2]) - 543;
        // สร้างวันที่ใหม่ในรูปแบบเดิม DD/MM/YYYY
        dateString = `${dateParts[0]}/${dateParts[1]}/${gregorianYear}`;
      }
    }
  }

  // แปลงวันที่เป็นรูปแบบ ISO
  try {
    let isoDate;

    if (dateString.includes("/")) {
      // กรณีวันที่ในรูปแบบ DD/MM/YYYY แปลงเป็น YYYY-MM-DD
      isoDate = new Date(
        dateString.split("/").reverse().join("-") + "T00:00:00.000Z"
      ).toISOString();
    } else {
      // กรณีวันที่ในรูปแบบ YYYY-MM-DD
      isoDate = new Date(dateString + "T00:00:00.000Z").toISOString();
    }

    return isoDate;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการแปลงวันที่:", error);
    // ส่งคืนค่าวันที่ปัจจุบันในกรณีที่มีข้อผิดพลาด
    return new Date().toISOString();
  }
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
            <SplitterPanel :size="50" :minSize="40">
              <!-- เพิ่ม container แบบ relative เพื่อรองรับ overlay -->
              <div class="position-relative" style="height: 78vh">
                <VuePdfApp
                  v-if="dataArrayBuffer != null"
                  :key="pdfViewerKey"
                  style="height: 100%"
                  :pdf="dataArrayBuffer"
                  :config="config"
                />

                <!-- เพิ่ม overlay สำหรับแสดงข้อความเมื่อไม่สามารถแสดง PDF ได้ -->
                <div
                  v-if="pdfDisplayError && dataArrayBuffer != null"
                  class="pdf-error-overlay"
                >
                  <div class="pdf-error-content">
                    <i
                      class="pi pi-file-pdf"
                      style="font-size: 3rem; color: #f44336"
                    ></i>
                    <h3>ไม่สามารถแสดงไฟล์ PDF ได้</h3>
                    <p>
                      ไฟล์ PDF
                      นี้มีการป้องกันด้วยรหัสผ่านหรือข้อจำกัดในการเข้าถึง<br />
                      (ข้อมูลยังสามารถแสดงในตารางด้านขวาได้ตามปกติ)
                    </p>
                  </div>
                </div>
              </div>
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
                <JsonDataTable :pdfData="pdfData" v-if="pdfData.length != 0" />
              </div>

              <StatementDailyList
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
      <div class="col-12 lg:col-6 p-3" v-for="bank in bank_list" :key="bank.id">
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
      <div class="col-12" v-if="isShowInputPassword">
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
    <StatementDailyConfig
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

#overlayContainer #passwordOverlay {
  display: none;
}

#outerContainer {
  z-index: 0000;
}

.tablepdf.p-datatable-table .p-datatable-tbody tr td {
  padding: 0rem 0rem;
}

/* สไตล์สำหรับ overlay */
.position-relative {
  position: relative;
}

.pdf-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(245, 245, 245, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.pdf-error-content {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 80%;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.pdf-error-content h3 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.pdf-error-content p {
  color: #666;
  margin-bottom: 1rem;
}
</style>
