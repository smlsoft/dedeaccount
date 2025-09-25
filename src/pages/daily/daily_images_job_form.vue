<script setup>
import DialogForm from "@/components/DialogForm.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import OcrService from "@/services/OcrService";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { ref, onMounted, computed, onUnmounted, watch } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";
import $ from "jquery";
import JournalForm from "./components/journal_form.vue";
import VatForm from "./components/vat_form.vue";
import TaxForm from "./components/tax_form.vue";

import IncomeDataService from "@/services/IncomeDataService";
import IncomeForm from "../income/components/detail_form.vue";

import ExpensesDataService from "@/services/ExpensesDataService";
import ExpensesForm from "../expenses/components/detail_form.vue";

import ImageDataService from "@/services/ImageDataService";
import dayjs from "dayjs";
import PdfApp from "vue3-pdf-app";
import "vue3-pdf-app/dist/icons/main.css";

const storeApp = useApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const tabview = ref();
const confirmSaveDialog = ref(false);
const confirmRejectDialog = ref(false);
const onLoad = ref(false);
const selectedImg = ref(true);
const searchItem = ref("");
const limitPage = ref(20);
const activePage = ref(1);
const showContent = ref("");
const totalItemsCount = ref(10);
const data_list = ref([]);
const document_formate = ref([]);
const selectedImgUrl = ref("");
const selectedImgData = ref({ guidfixed: "", imagereferences: [] });

const scale = ref(1);
const panning = ref(false);
const pointX = ref(0);
const pointY = ref(0);
const start = ref({ x: 0, y: 0 });
const zoomStyle = ref("");

const doc_images = ref([]);
const countDocImage = ref();
const WsConnectImage = ref();
const AllImageUsed = ref([]);
const WsConnectAllImage = ref();
const activeIndex = ref(0);
const accountChart_detail = ref([]);
const accountBook_detail = ref([]);
const groupAccount_detail = ref([]);
const customer_detail = ref([]);
const creditor_detail = ref([]);
const conSave = "ต้องการบันทึกเอกสารรายวัน";
const conchange = "ต้องการเปลี่ยนรูปภาพ";
const connamechange = "";
const activeIndexList = ref(0);

const daily_form = ref({
  debtaccounttype: "0",
  debtor: "",
  creditor: "",
  accountdescription: "",
  accountgroup: "",
  accountperiod: null,
  accountyear: parseInt(Utils.getYear().toString()) + 543,
  amount: "",
  batchId: "",
  docdate: Utils.getDateTime(),
  docno: Utils.getDocNoDate("JO"),
  exdocrefdate: "",
  exdocrefno: "",
  journaltype: "0",
  bookcode: "",
  journaldetail: [
    {
      accountcode: "",
      accountname: "",
      debitamount: 0,
      creditamount: 0,
    },
  ],
  parid: "0000000",
});
const daily_form_has = ref();

const isChange = ref(false);
const daily_form_valid = ref({
  accountdescription: false,
  accountgroup: false,
  accountperiod: false,
  accountyear: false,
  amount: false,
  batchId: false,
  docdate: false,
  docno: false,
  bookcode: false,
  accountcode1: false,
});
const waitForImages = ref(true);
const vats = ref([]);

const vats_valid = ref([
  {
    vatdate: false,
    vatdocno: false,
    vatperiod: false,
    vatyear: false,
    vatbase: false,
    vatrate: false,
    vatamount: false,
    exceptvat: false,
    custname: false,
    custtaxid: false,
    branchcode: false,
  },
]);
const taxes = ref([]);
const connection = ref();
const taxes_valid = ref([
  {
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  },
]);

const filtersCust = ref(null);
const sortFieldCust = ref("code");

const confirmChangeImageDialog = ref(false);
const confirmClearImageDialog = ref(false);
const confirmBackImageDialog = ref(false);
const newDocRefImage = ref("");
const showThumbnails = ref(false);
const modeEdit = ref(false);

const confirmRemoveImgDialog = ref(false);
const confirmCompleteDialog = ref(false);
const divCheckGl = ref(null);
const heightIamgeDivCheckGl = ref(null);
const jobId = ref("");
const showOveray = ref(false);
const myWindow = ref();
const newWindow = ref(false);

// ใช้เช็ค จอ 2 ว่าเปิดอยู่ไหม
const idrandom = ref("");
const countIsOpenPopupImage = ref(0);
const myInterval = ref(null);

const listStatusImagesByDaily = ref([
  { name: "ผ่าน", code: 1 },
  { name: "ไม่ผ่าน", code: 4 },
  { name: "ไม่บันทึก", code: 3 },
]);

const statusImage = ref();
const dialogOCR = ref(false);
const responseDataOCR = ref();
const documentFormateSelected = ref();
const isSentOCR = ref(false);
const isTackingStatus = ref(false);

/// 1 = รายวัน , 2 = รายได้  , 3 = รายจ่าย
const imageDailyType = ref(null);

const income_detail = ref([]);
const income_form = ref({
  docdate: new Date(), /// วันที่เอกสาร
  docno: Utils.getDocNoDate("JO"), /// เลขที่เอกสาร
  bookcode: "", /// รหัสสมุดรายวัน
  debtorcode: "", /// รหัสลูกหนี้
  vattype: 1, /// ประเภทภาษี 1 = ภาษีแยกนอก , 2 = ภาษีรวมใน , 3 = ภาษีอัตราศูนย์ , 4 = ไม่กระทบภาษี
  docrefdate: new Date(), /// วันที่อ้างอิง
  docrefno: "", /// เลขที่อ้างอิง
  inquirytype: 1, /// ประเภทรายได้ 1 = เงินเชื่อ , 2 = เงินสด
  accountdescription: "", /// รายละเอียด
  accountperiod: null, /// งวดบัญชี
  accountyear: parseInt(Utils.getYear().toString()) + 543, /// ปีบัญชี
  incomedetail: [
    {
      incomecode: "", /// รหัสรายได้
      incomename: "", /// ชื่อรายได้
      description: "", /// คำอธิบายรายการ
      amount: 0, /// จำนวนเงิน
    },
  ],
  vatrate: 7, /// อัตราภาษี
  totalvalue: 0.0, /// มูลค่ารวม
  discount: "", /// ส่วนลด
  totaldiscount: 0, /// รวมส่วนลด
  totalvatvalue: 0, /// มูลค่าภาษี
  totalbeforevat: 0, /// มูลค่าก่อนภาษี
  totalaftervat: 0, /// มูลค่าหลังภาษี
  totalexceptvat: 0, /// มูลค่ายกเว้นภาษี
  totalamount: 0, /// มูลค่ารวมทั้งสิ้น
  payment: {
    paymenttype: 1, /// ประเภทการชำระเงิน 1 = เงินสด , 2 = โอน
    paymentamount: 0, /// จำนวนเงิน
  },
});

/// required field
const income_form_valid = ref({
  docdate: false, /// วันที่เอกสาร
  docno: false, /// เลขที่เอกสาร
  bookcode: false, /// รหัสสมุดรายวัน
  debtorcode: false, /// รหัสลูกหนี้
  paymentamount: false, /// จำนวนเงิน
  incomecode1: false, /// รหัสรายได้
});

const expenses_detail = ref([]);
const expenses_form = ref({
  docdate: new Date(), /// วันที่เอกสาร
  docno: Utils.getDocNoDate("JO"), /// เลขที่เอกสาร
  bookcode: "", /// รหัสสมุดรายวัน
  creditorcode: "", /// รหัสเจ้าหนี้
  vattype: 1, /// ประเภทภาษี 1 = ภาษีแยกนอก , 2 = ภาษีรวมใน , 3 = ภาษีอัตราศูนย์ , 4 = ไม่กระทบภาษี
  docrefdate: new Date(), /// วันที่อ้างอิง
  docrefno: "", /// เลขที่อ้างอิง
  inquirytype: 1, /// ประเภทรายได้ 1 = เงินเชื่อ , 2 = เงินสด
  accountdescription: "", /// รายละเอียด
  accountperiod: null, /// งวดบัญชี
  accountyear: parseInt(Utils.getYear().toString()) + 543, /// ปีบัญชี
  expensesdetail: [
    {
      expensescode: "", /// รหัสรายได้
      expensesname: "", /// ชื่อรายได้
      description: "", /// คำอธิบายรายการ
      amount: 0, /// จำนวนเงิน
    },
  ],
  vatrate: 7, /// อัตราภาษี
  totalvalue: 0.0, /// มูลค่ารวม
  discount: "", /// ส่วนลด
  totaldiscount: 0, /// รวมส่วนลด
  totalvatvalue: 0, /// มูลค่าภาษี
  totalbeforevat: 0, /// มูลค่าก่อนภาษี
  totalaftervat: 0, /// มูลค่าหลังภาษี
  totalexceptvat: 0, /// มูลค่ายกเว้นภาษี
  totalamount: 0, /// มูลค่ารวมทั้งสิ้น
  payment: {
    paymenttype: 1, /// ประเภทการชำระเงิน 1 = เงินสด , 2 = โอน
    paymentamount: 0, /// จำนวนเงิน
  },
});

/// required field
const expenses_form_valid = ref({
  docdate: false, /// วันที่เอกสาร
  docno: false, /// เลขที่เอกสาร
  bookcode: false, /// รหัสสมุดรายวัน
  creditorcode: false, /// รหัสเจ้าหนี้
  paymentamount: false, /// จำนวนเงิน
  expensescode1: false, /// รหัสรายได้
});

const activeTabIndex = ref(0);

const debtorData = ref(null);
const creditorData = ref(null);

onUnmounted(() => {
  console.log(
    "unmounted--------------------------------------------------------"
  );

  // removeSelectImg();

  WsConnectAllImage.value.close();
  WsConnectImage.value.close();
  connection.value.close();

  if (myWindow.value != undefined) {
    myWindow.value.close();
  }
});

watch(daily_form.value, (newValue, oldValue) => {
  if (
    JSON.stringify(daily_form.value) != JSON.stringify(daily_form_has.value)
  ) {
    isChange.value = true;
    sendChange(1);
  } else {
    isChange.value = false;
    sendChange(0);
  }
});

// เพิ่ม watch สำหรับติดตามการเปลี่ยนแปลงของลูกหนี้และเจ้าหนี้
watch(
  () => daily_form.value.debtor,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      console.log("Debtor changed to:", newVal);
      fetchDebtorData(newVal);
    } else if (newVal === null && oldVal !== null) {
      // เมื่อค่าเปลี่ยนจากมีค่าเป็น null = กดปุ่มล้างค่า
      console.log("Debtor cleared");
      clearDebtor();
    }
  }
);

watch(
  () => daily_form.value.creditor,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      console.log("Creditor changed to:", newVal);
      fetchCreditorData(newVal);
    } else if (newVal === null && oldVal !== null) {
      // เมื่อค่าเปลี่ยนจากมีค่าเป็น null = กดปุ่มล้างค่า
      console.log("Creditor cleared");
      clearCreditor();
    }
  }
);

// เพิ่มฟังก์ชันสำหรับดึงข้อมูลลูกหนี้
function fetchDebtorData(id) {
  if (!id) return;

  console.log("Fetching debtor data for CODE:", id);
  MasterdataService.getDebtorByCode(id)
    .then((res) => {
      console.log("Debtor API response:", res);
      if (res.data) {
        debtorData.value = res.data;
      }
    })
    .catch((err) => {
      console.error("Error fetching debtor data:", err);
    });
}

// เพิ่มฟังก์ชันสำหรับดึงข้อมูลเจ้าหนี้
function fetchCreditorData(id) {
  if (!id) return;

  console.log("Fetching creditor data for CODE:", id);
  MasterdataService.getCreditorByCode(id)
    .then((res) => {
      console.log("Creditor API response:", res);
      if (res.data) {
        creditorData.value = res.data;
      }
    })
    .catch((err) => {
      console.error("Error fetching creditor data:", err);
    });
}

function clearDebtor() {
  console.log("Clearing debtor data");
  debtorData.value = null;
}

function clearCreditor() {
  console.log("Clearing creditor data");
  creditorData.value = null;
}

onMounted(async () => {
  jobId.value = route.params.id;

  /// 1 = รายวัน , 2 = รายได้  , 3 = รายจ่าย
  imageDailyType.value = route.params.type;

  console.log("jobId : ", jobId.value);
  console.log("imageDailyType : ", imageDailyType.value);

  storeApp.setActivePage("daily");
  storeApp.setActiveChild("images_job_daily");
  storeApp.setPageTitle("เพิ่มข้อมูลรายวัน");

  disableAllinput(0);

  daily_form_has.value = {
    accountdescription: daily_form.value.accountdescription,
    accountgroup: daily_form.value.accountgroup,
    accountperiod: daily_form.value.accountperiod,
    accountyear: daily_form.value.accountyear,
    amount: daily_form.value.amount,
    batchId: daily_form.value.batchId,
    docdate: daily_form.value.docdate,
    docno: daily_form.value.docno,
    exdocrefdate: daily_form.value.exdocrefdate,
    exdocrefno: daily_form.value.exdocrefno,
    journaltype: daily_form.value.journaltype,
    bookcode: daily_form.value.bookcode,
    journaldetail: [
      {
        accountcode: "",
        accountname: "",
        debitamount: 0,
        creditamount: 0,
      },
    ],
    parid: daily_form.value.parid,
  };

  getAllSelectImage();
  getDocImageList();
  getAccountChart();
  getJournalBook();
  getAccountGroup();
  getCreditorList();
  getDebtorList();
  getDocumentFormate();

  websocketConnect();
  WSImageConnect();
  WsAllImageConnect();

  showpanel();

  // setTimeout(() => {
  //   console.log(selectedImgUrl.value );
  //   if (selectedImgUrl.value == "") {
  //     reLoadImage();
  //   }
  // }, 1500);

  /// income
  getIncome();

  /// expenses
  getExpenses();

  setTimeout(() => {
    // set height ifram
    heightIamgeDivCheckGl.value =
      "height:" + divCheckGl.value.offsetHeight + "px";
  }, 100);
});

function getCreditorList() {
  MasterdataService.getCreditorList(
    200,
    1,
    filtersCust.value,
    sortFieldCust.value,
    1
  )
    .then((res) => {
      if (res.success) {
        creditor_detail.value = res.data;
        creditor_detail.value.forEach((element) => {
          element.name = element.names.filter(
            (data) => data.code == "th"
          )[0].name;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function getDebtorList() {
  MasterdataService.getDebtorList(
    200,
    1,
    filtersCust.value,
    sortFieldCust.value,
    1
  )
    .then((res) => {
      if (res.success) {
        customer_detail.value = res.data;
        customer_detail.value.forEach((element) => {
          element.name = element.names.filter(
            (data) => data.code == "th"
          )[0].name;
        });
        console.log("customer_detail : ", customer_detail.value);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function WSImageConnect() {
  WsConnectImage.value = new WebSocket(
    "wss://api.dev.dedepos.com/gl/journal/ws/image?apikey=" +
      localStorage.getItem("_token")
  );
  WsConnectImage.value.onopen = function (event) {
    // console.log(event);
    // console.log(
    //   "WsConnectImage Successfully connected to the echo websocket server..."
    // );
  };
  WsConnectImage.value.onmessage = function (event) {
    //console.log("WsConnectImage ", event);
  };
  WsConnectImage.value.onclose = function (e) {
    // console.log(
    //   "WsConnectImage Socket is closed. Reconnect will be attempted in 1 second.",
    //   e.reason
    // );
    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "daily_images_job_form"
      ) {
        // console.log(
        //   "Socket is closed. Reconnect will be attempted in 1 second.",
        //   e.reason
        // );
        WSImageConnect();
      }
    }, 1000);
  };
}

function WsAllImageConnect() {
  WsConnectAllImage.value = new WebSocket(
    "wss://api.dev.dedepos.com/gl/journal/ws/docref?apikey=" +
      localStorage.getItem("_token")
  );
  WsConnectAllImage.value.onopen = function (event) {
    // console.log(event);
    // console.log(
    //   "WsAllImage Connect Successfully connected to the echo websocket server..."
    // );
  };
  WsConnectAllImage.value.onmessage = function (event) {
    var jsonData = JSON.parse(event.data);
    console.log("jsonData ", jsonData);
    if (jsonData.status == "selected") {
      //console.log("selected");
      var found = 0;
      AllImageUsed.value.forEach((data) => {
        if (data.docref == jsonData.docref) {
          found += 1;
        }
      });
      if (found == 0) {
        AllImageUsed.value.push({
          docref: jsonData.docref,
          username: jsonData.username,
        });
      }
    } else if (jsonData.status == "deselected") {
      //  console.log("unselected");
      if (jsonData.username == localStorage._usercode) {
        waitForImages.value = true;
        disableAllinput(0);
        deSelectImg();
      }
      var rebuild = [];
      AllImageUsed.value.forEach((data) => {
        if (data.docref != jsonData.docref) {
          rebuild.push(data);
        }
      });
      AllImageUsed.value = rebuild;
    }

    console.log("AllImageUsed ", AllImageUsed.value);
  };
  WsConnectAllImage.value.onclose = function (e) {
    // console.log(
    //   "WsAllImageConnect Socket is closed. Reconnect will be attempted in 1 second.",
    //   e.reason
    // );
    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "daily_images_job_form"
      ) {
        // console.log(
        //   "Socket is closed. Reconnect will be attempted in 1 second.",
        //   e.reason
        // );
        WsAllImageConnect();
        //getAllSelectImage();
      }
    }, 1000);
  };
}

function websocketConnect() {
  connection.value = new WebSocket(
    "wss://api.dev.dedepos.com/gl/journal/ws/form?apikey=" +
      localStorage.getItem("_token")
  );
  connection.value.onopen = function (event) {
    //console.log(event);
    //console.log("Successfully connected to the echo websocket server...");
  };
  connection.value.onmessage = function (event) {
    console.log("onmessage ", event);
    var jsonData = JSON.parse(event.data);
    if (jsonData.docref != "") {
      onLoad.value = false;
      MasterdataService.getImagesByDocref(jsonData.docref)
        .then((res) => {
          if (res.success) {
            console.log(res.data);

            if (res.data.imagereferences.length > 0) {
              doc_images.value = res.data;
              countDocImage.value = doc_images.value.references.length;

              var check_dup = data_list.value.filter(
                (val) => val.guidfixed == doc_images.value.guidfixed
              );

              if (check_dup.length == 0) {
                data_list.value.splice(0, 0, doc_images.value);
              }
              if (res.data.imagereferences.length > 1) {
                showThumbnails.value = true;
              } else {
                showThumbnails.value = false;
              }

              selectedImgData.value = res.data;
              selectedImgUrl.value = res.data.imagereferences[0].imageuri;

              //console.log(selectedImgUrl.value);

              // selectedImg.value = true;
              waitForImages.value = false;

              // get data gl กรณีจอ 2 เลือกรูปที่บันทึก GL เรียบร้อยแล้ว
              if (!isChange.value) {
                if (selectedImgData.value.references.length != 0) {
                  getDataGL(selectedImgData.value.references);
                } else {
                  clearData();
                }
              }
              disableAllinput(res.data.status);
              setTimeout(() => {
                checkActiveIndex();
              }, 100);
            }
          }
        })
        .catch((err) => {
          // console.log(err);
        });
    } else {
      onLoad.value = true;
    }
  };

  connection.value.onclose = function (e) {
    console.log(
      "Socket is closed. Reconnect will be attempted in 1 second.",
      e.reason
    );
    setTimeout(function () {
      if (
        localStorage._token != "" &&
        localStorage._token != undefined &&
        route.name == "daily_images_job_form"
      ) {
        // console.log(
        //   "Socket is closed. Reconnect will be attempted in 1 second.",
        //   e.reason
        // );

        websocketConnect();

        //getAllSelectImage();
      }
    }, 1000);
  };
}

function disableAllinput(data) {
  // console.log(data);
  setTimeout(() => {
    if (waitForImages.value || data == 3 || data == 4) {
      $("#panelForm3 :input").prop("disabled", true);
      $("#panelForm3 .p-dropdown").prop("disabled", true);
    } else {
      $("#panelForm3 :input").prop("disabled", false);
      $("#panelForm3 .p-dropdown").prop("disabled", false);
    }
  }, 500);
}

function checkActiveIndex() {
  setTimeout(() => {
    data_list.value.forEach((ele, index) => {
      // console.log(doc_images.value.guidfixed + " - " + ele.guidfixed);
      if (doc_images.value.guidfixed == ele.guidfixed) {
        activeIndexList.value = index;
      }
    });
  }, 30);
}

function getAllSelectImage() {
  MasterdataService.getAllSelectImage()
    .then((res) => {
      //console.log(res);
      if (res.success) {
        AllImageUsed.value = res.data;
      }
    })
    .catch((err) => {
      //console.log(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ดึงข้อมูลล้มเหลว " + err,
        life: 3000,
      });
    });
}

function putvatValid() {
  vats_valid.value.push({
    vatdate: false,
    vatdocno: false,
    vatperiod: false,
    vatyear: false,
    vatbase: false,
    vatrate: false,
    vatamount: false,
    exceptvat: false,
    custname: false,
    custtaxid: false,
    branchcode: false,
  });
}

function puttaxValid() {
  taxes_valid.value.push({
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  });
}

function getDataGL(references) {
  const result = references.filter((gl) => gl.module == "GL");
  console.log(result[0].docno);

  MasterdataService.getGLledger(result[0].docno)
    .then((res) => {
      if (res.success) {
        console.log(res);
        const vat = res.data.vats;
        const tax = res.data.taxes;

        daily_form.value.docno = res.data.guidfixed;
        daily_form.value.accountdescription = res.data.accountdescription;
        daily_form.value.accountgroup = res.data.accountgroup;
        daily_form.value.accountperiod = res.data.accountperiod;
        daily_form.value.accountyear = res.data.accountyear;
        daily_form.value.amount = res.data.amount;
        daily_form.value.batchId = res.data.batchId;
        daily_form.value.journaltype = res.data.journaltype.toString();
        daily_form.value.docdate = Utils.getDateTimeFromDate(res.data.docdate);
        daily_form.value.docno = res.data.docno;
        daily_form.value.bookcode = res.data.bookcode;
        daily_form.value.journaldetail = res.data.journaldetail;
        if (res.data.exdocrefdate == "0001-01-01T00:00:00Z") {
          daily_form.value.exdocrefdate = "";
        } else {
          daily_form.value.exdocrefdate = Utils.getDateTimeFromDate(
            res.data.exdocrefdate
          );
        }
        daily_form.value.exdocrefno = res.data.exdocrefno;

        if (vat.length > 0) {
          vats.value = [];
          vats_valid.value = [];

          for (var i = 0; i < res.data.vats.length; i++) {
            var vattemp = {
              vattype: vat[i].vattype,
              vatdate: Utils.getDateTimeFromDate(vat[i].vatdate),
              vatdocno: vat[i].vatdocno,
              vatperiod: vat[i].vatperiod,
              vatyear: vat[i].vatyear,
              vatbase: vat[i].vatbase,
              vatrate: vat[i].vatrate,
              vatamount: vat[i].vatamount,
              exceptvat: vat[i].exceptvat,
              vatmode: vat[i].vatmode,
              vatsubmit: vat[i].vatsubmit,
              custname: vat[i].custname,
              custtaxid: vat[i].custtaxid,
              organization: vat[i].organization,
              branchcode: vat[i].branchcode,
              remark: vat[i].remark,
            };
            putvatValid();
            vats.value.push(vattemp);
          }
        }

        if (tax.length > 0) {
          taxes.value = [];
          taxes_valid.value = [];
          for (var i = 0; i < tax.length; i++) {
            var taxes_temp = {
              taxdocno: tax[i].taxdocno,
              taxdate: Utils.getDateTimeFromDate(tax[i].taxdate),
              custname: tax[i].custname,
              custtype: tax[i].custtype,
              custtaxid: tax[i].custtaxid,
              taxtype: tax[i].taxtype,
              address: tax[i].address,
              details: [],
            };

            if (tax[i].details != null && tax[i].details.length > 0) {
              var sumamount = 0;
              var sumbase = 0;
              tax[i].details.forEach((data) => {
                var details_temp = {
                  description: data.description,
                  taxbase: data.taxbase,
                  taxrate: data.taxrate,
                  taxamount: data.taxamount,
                };

                taxes_temp.details.push(details_temp);
              });
            } else {
              taxes_temp.details = [
                {
                  description: "",
                  taxbase: 0,
                  taxrate: 0,
                  taxamount: 0,
                },
              ];
            }
            puttaxValid();
            taxes.value.push(taxes_temp);
          }
        }

        // console.log(daily_form.value);
        // console.log(vats.value);
        // console.log(taxes.value);

        // toast.add({
        //   severity: "success",
        //   summary: "success",
        //   detail: "ดึงข้อมูลเอกสาร : " + docno + " สำเร็จ",
        //   life: 3000,
        // });
      }
    })
    .catch((err) => {
      console.log(err);
      openDetailDocNo.value = false;
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ไม่สามารถดึงข้อมูล " + docno + " ได้ " + err,
        life: 3000,
      });
    });
}

function sendChange(data) {
  // Check if the WebSocket is already in the OPEN state
  if (connection.value.readyState === WebSocket.OPEN) {
    connection.value.send(
      JSON.stringify({ event: "change", payload: { status: data } })
    );
  } else {
    // Listen for the 'open' event before sending data
    connection.value.addEventListener(
      "open",
      function () {
        connection.value.send(
          JSON.stringify({ event: "change", payload: { status: data } })
        );
      },
      { once: true }
    ); // Use the { once: true } option to only listen once
  }
}

function goList() {
  removeSelectImg();

  if (myWindow.value != undefined) {
    myWindow.value.close();
  }

  setTimeout(() => {
    router.push({
      name: "images_job_daily_detail",
      params: { id: jobId.value },
    });
  }, 100);
}

async function confirmSave() {
  // console.log(daily_form.value);
  //console.log(vats.value);
  //console.log(taxes.value);

  var sumDebit = 0;
  await daily_form.value.journaldetail.forEach((ele) => {
    var debit = 0;
    if (ele.debitamount != "") {
      debit = parseFloat(ele.debitamount);
      sumDebit += debit;
    }
  });

  vats.value.forEach((ele) => {
    ele.vatperiod = parseInt(ele.vatperiod);
    ele.vatyear = parseInt(ele.vatyear);
  });
  daily_form.value.amount = sumDebit;
  //daily_form.value.docdate = Utils.getFormatDateTime(daily_form.value.docdate);
  // console.log(Utils.getFormatDateTime(daily_form.value.docdate));
  console.log(selectedImgData.value.guidfixed);
  var from_input = {
    debtor:
      daily_form.value.debtaccounttype == "1"
        ? {}
        : daily_form.value.debtor != ""
        ? customer_detail.value.filter(
            (data) => data.code == daily_form.value.debtor
          )[0]
        : {},
    creditor:
      daily_form.value.debtaccounttype == "0"
        ? {}
        : daily_form.value.creditor != ""
        ? creditor_detail.value.filter(
            (data) => data.code == daily_form.value.creditor
          )[0]
        : {},
    debtaccounttype: parseInt(daily_form.value.debtaccounttype),
    accountdescription: daily_form.value.accountdescription,
    accountgroup: daily_form.value.accountgroup,
    accountperiod: daily_form.value.accountperiod,
    accountyear: daily_form.value.accountyear,
    documentref: selectedImgData.value.guidfixed,
    amount: daily_form.value.amount,
    batchId: daily_form.value.batchId,
    docdate: Utils.getFormatDateTime(daily_form.value.docdate),
    docno: daily_form.value.docno,
    exdocrefdate:
      daily_form.value.exdocrefdate != ""
        ? Utils.getFormatDateTime(daily_form.value.exdocrefdate)
        : "0001-01-01T00:00:00Z",
    exdocrefno: daily_form.value.exdocrefno,
    bookcode: daily_form.value.bookcode,
    journaldetail: daily_form.value.journaldetail,
    parid: daily_form.value.parid,
    vats: vats.value,
    taxes: taxes.value,
  };
  from_input.vats.forEach((vat) => {
    vat.vatamount = parseFloat(vat.vatamount);
    vat.vatdate = Utils.getFormatDateTime(vat.vatdate);
  });
  from_input.taxes.forEach((tax) => {
    tax.taxdate = Utils.getFormatDateTime(tax.taxdate);
  });

  console.log(from_input);

  console.log(modeEdit.value);
  var old_img = selectedImgData.value.guidfixed;
  if (modeEdit.value) {
    MasterdataService.putGLJournal(from_input, daily_form.value.guidfixed)
      .then((res) => {
        console.log(res);
        if (res.success) {
          removeSelectImg();
          confirmSaveDialog.value = false;
          toast.add({
            severity: "success",
            summary: "ทำรายการสำเร็จ",
            detail: "บันทึกรายการเดินบัญชีสำเร็จ",
            life: 3000,
          });
          setTimeout(() => {
            nextImageOnSave(old_img);
            clearData();
          }, 500);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    MasterdataService.postGLJournal(from_input)
      .then((res) => {
        console.log(res);
        if (res.success) {
          removeSelectImg();
          confirmSaveDialog.value = false;
          toast.add({
            severity: "success",
            summary: "ทำรายการสำเร็จ",
            detail: "บันทึกรายการเดินบัญชีสำเร็จ",
            life: 3000,
          });
          setTimeout(() => {
            nextImageOnSave(old_img);
            clearData();
          }, 500);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

function readOCR() {
  if (documentFormateSelected.value == null) {
    toast.add({
      severity: "warn",
      summary: "แจ้งเตือน",
      detail: "กรุณาเลือก รูปแบบการบันทึกบัญชี ก่อนดึงข้อมูล OCR",
      life: 4000,
    });
    return;
  }

  dialogOCR.value = true;
  responseDataOCR.value = null;
  isTackingStatus.value = false;
  sentOCR();
}

async function sentOCR() {
  var data = {
    resourcekey: doc_images.value.guidfixed,
    urlresources: [],
  };

  doc_images.value.imagereferences.forEach((ele) => {
    data.urlresources.push(ele.imageuri);
  });

  try {
    const res = await OcrService.postOCR(data);
    if (res.success) {
      console.log(res);

      res.data.forEach((ele) => {
        if (ele.code == 200) {
          getDataOCR();
          // toast.add({
          //   severity: "success",
          //   summary: "SENT TO API OCR",
          //   detail: "OCR SENT SUCCESS",
          //   life: 3000,
          // });
        } else if (ele.code == 513) {
          getDataOCR();
          // toast.add({
          //   severity: "warn",
          //   summary: "SENT TO API OCR",
          //   detail: "The tracking id has already been taken. tracking id ซ้ำ ",
          //   life: 3000,
          // });
        } else {
          toast.add({
            severity: "error",
            summary: "SENT TO API OCR",
            detail: "OCR SENT FAIL" + ele.message,
            life: 3000,
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: err.response.data.message,
      life: 3000,
    });
  }
}

async function getDataOCR() {
  var data = {
    resourcekey: doc_images.value.guidfixed,
    urlresources: [],
  };

  doc_images.value.imagereferences.forEach((ele) => {
    data.urlresources.push(ele.imageuri);
  });

  try {
    const res = await OcrService.getOCR(data);
    if (res.success) {
      responseDataOCR.value = res.data[0];

      if (responseDataOCR.value.data[0].tracking_status == "ReadyToCheck") {
        isTackingStatus.value = true;
      } else if (
        responseDataOCR.value.data[0].tracking_status == "processing"
      ) {
        isTackingStatus.value = false;
        setTimeout(() => {
          getDataOCR();
        }, 30000);
      }

      dialogOCR.value = true;
    }
  } catch (err) {
    console.log(err);
    toast.add({
      severity: "error",
      summary: "error",
      detail: err.response.data.message,
      life: 3000,
    });
  }
}

function saveDataOCR(data) {
  dialogOCR.value = false;

  console.log(data);
  daily_form.value.accountdescription = data[0].body_json.sender_name;

  daily_form.value.journaldetail.forEach((ele) => {
    if (data[0].body_json.hasOwnProperty(ele.actioncode)) {
      ele.debitamount = parseFloat(
        data[0].body_json[ele.actioncode].replace(/,/g, "")
      );
    }
  });

  console.log(daily_form.value);
}

async function onSave() {
  console.log(daily_form.value);
  console.log(taxes.value);
  console.log(vats.value);

  var isPass = await verifyData();
  var isVaxPass = await verifyVat();
  var isTatPass = await verifyTax();
  if (isPass && isVaxPass && isTatPass) {
    confirmSaveDialog.value = true;
  }
}

function verifyData() {
  var errorCount = 0;

  if (daily_form.value.docdate == "") {
    errorCount += 1;
    daily_form_valid.value.docdate = true;
  } else {
    daily_form_valid.value.docdate = false;
  }
  if (daily_form.value.docno == "") {
    errorCount += 1;
    daily_form_valid.value.docno = true;
  } else {
    daily_form_valid.value.docno = false;
  }
  if (daily_form.value.accountyear == "") {
    errorCount += 1;
    daily_form_valid.value.accountyear = true;
  } else {
    daily_form_valid.value.accountyear = false;
  }

  if (daily_form.value.bookcode == "") {
    errorCount += 1;
    daily_form_valid.value.bookcode = true;
  } else {
    daily_form_valid.value.bookcode = false;
  }

  if (daily_form.value.accountperiod == null) {
    errorCount += 1;
    daily_form_valid.value.docdate = true;
  } else {
    daily_form_valid.value.docdate = false;
  }

  let deletIndex = [];
  daily_form.value.journaldetail.forEach((ele, index) => {
    // เก็บค่า index row ที่เป็นค่าว่าง
    if (
      ele.accountcode == "" &&
      ele.creditamount == "" &&
      ele.debitamount == ""
    ) {
      deletIndex.push(index);
    } else if (
      ele.accountcode == "" &&
      ele.creditamount != "" &&
      ele.debitamount != ""
    ) {
      deletIndex.push(index);
    } else if (
      ele.accountcode == "" &&
      ele.creditamount != "" &&
      ele.debitamount == ""
    ) {
      deletIndex.push(index);
    } else if (
      ele.accountcode == "" &&
      ele.creditamount == "" &&
      ele.debitamount != ""
    ) {
      deletIndex.push(index);
    } else if (
      ele.accountcode != "" &&
      ele.creditamount == "" &&
      ele.debitamount == ""
    ) {
      deletIndex.push(index);
    }
  });

  // ลบ row accountcode ที่เป็นค่าว่าง
  deletIndex.forEach((ele, index) => {
    let idx = ele - index;
    daily_form.value.journaldetail.splice(idx, 1);
  });

  if (daily_form.value.journaldetail.length == 0) {
    daily_form.value.journaldetail.push({
      accountcode: "",
      accountname: "",
      debitamount: 0,
      creditamount: 0,
    });
  }

  if (daily_form.value.accountperiod == null) {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "วันที่เอกสาร ได้ถูกปิดงวดไปแล้ว หรือยังไม่ได้กำหนดงวดบัญชี",
      life: 4000,
    });
  }

  if (daily_form.value.bookcode == "") {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณาเลือกสมุดรายวัน",
      life: 4000,
    });
  }

  var sumCredit = 0;
  var sumDebit = 0;
  daily_form.value.journaldetail.forEach((ele, index) => {
    if (ele.accountcode == "") {
      errorCount += 1;
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "กรุณาเลือกรหัสบัญชี รายการที่ " + (index + 1),
        life: 4000,
      });
    }
    if (ele.accountname == "") {
      errorCount += 1;
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "กรุณาเลือกรหัสบัญชี รายการที่" + (index + 1),
        life: 4000,
      });
    }

    var debit = 0;
    var credit = 0;
    if (ele.creditamount == null) {
      ele.creditamount = 0;
    }
    if (ele.creditamount.toString() != "") {
      credit = parseFloat(ele.creditamount);
      sumCredit += credit;
    }
    if (ele.debitamount == null) {
      ele.debitamount = 0;
    }
    if (ele.debitamount.toString() != "") {
      debit = parseFloat(ele.debitamount);
      sumDebit += debit;
      //console.log(sumDebit);
    }
  });

  //console.log(sumCredit);
  //console.log(sumDebit);
  if (parseFloat(sumCredit).toFixed(2) != parseFloat(sumDebit).toFixed(2)) {
    errorCount += 1;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "ยอดเดบิต และ เครดิต ไม่เท่ากัน",
      life: 4000,
    });
  }

  if (errorCount != 0) {
    return false;
  } else {
    var sumDebit;
    daily_form.value.journaldetail.forEach((ele) => {
      var debit = 0;
      var credit = 0;
      if (ele.creditamount != "") {
        credit = parseFloat(ele.creditamount);
      }
      if (ele.debitamount != "") {
        debit = parseFloat(ele.debitamount);
      }
      sumDebit += debit;
      ele.accountcode = ele.accountcode.toString();
      ele.accountname = ele.accountname.toString();
      ele.debitamount = debit;
      ele.creditamount = credit;
    });

    daily_form.value.amount = sumDebit;
    //daily_form.value.docdate = Utils.getFormatDateTime(daily_form.value.docdate);
    daily_form.value.accountperiod =
      daily_form.value.accountperiod != null
        ? parseInt(daily_form.value.accountperiod.toString())
        : null;
    daily_form.value.accountyear = parseInt(daily_form.value.accountyear);
    return true;
  }
}

async function onSaveIncome() {
  console.log(income_form.value);
  var isPass = await verifyDataIncome();
  var isPaymentPass = await verifyPaymentIncome();

  if (isPass && isPaymentPass) {
    // confirmSaveDialog.value = true;
  }
}

async function onSaveExpenses() {
  console.log(expenses_form.value);
  var isPass = await verifyDataExpenses();
  var isPaymentPass = await verifyPaymentExpenses();

  if (isPass && isPaymentPass) {
    // confirmSaveDialog.value = true;
  }
}

async function verifyDataIncome() {
  var errorCount = 0;

  if (income_form.value.docdate == "") {
    errorCount += 1;
    income_form_valid.value.docdate = true;
  } else {
    income_form_valid.value.docdate = false;
  }

  if (income_form.value.docno == "") {
    errorCount += 1;
    income_form_valid.value.docno = true;
  } else {
    income_form_valid.value.docno = false;
  }

  if (income_form.value.bookcode == "") {
    errorCount += 1;
    income_form_valid.value.bookcode = true;
  } else {
    income_form_valid.value.bookcode = false;
  }

  if (income_form.value.debtorcode == "") {
    errorCount += 1;
    income_form_valid.value.debtorcode = true;
  } else {
    income_form_valid.value.debtorcode = false;
  }

  let deletIndex = [];
  income_form.value.incomedetail.forEach((ele, index) => {
    // เก็บค่า index row ที่เป็นค่าว่าง
    if (ele.incomecode == "" && ele.amount == "") {
      deletIndex.push(index);
    } else if (ele.incomecode == "" && ele.amount != "") {
      deletIndex.push(index);
    } else if (ele.incomecode != "" && ele.amount == "") {
      deletIndex.push(index);
    }
  });

  // ลบ row incomecode ที่เป็นค่าว่าง
  deletIndex.forEach((ele, index) => {
    let idx = ele - index;
    income_form.value.incomedetail.splice(idx, 1);
  });

  if (income_form.value.incomedetail.length == 0) {
    income_form.value.incomedetail.push({
      incomecode: "",
      incomename: "",
      descriotion: "",
      amount: 0,
    });
  }

  if (income_form.value.accountperiod == null) {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "วันที่เอกสาร ได้ถูกปิดงวดไปแล้ว หรือยังไม่ได้กำหนดงวดบัญชี",
      life: 4000,
    });
  }

  if (income_form.value.bookcode == "") {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณาเลือกสมุดรายวัน",
      life: 4000,
    });
  }

  if (income_form.value.debtorcode == "") {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณาเลือกลูกหนี้",
      life: 4000,
    });
  }

  income_form.value.incomedetail.forEach((ele, index) => {
    if (ele.incomecode == "") {
      errorCount += 1;
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "กรุณาเลือกรหัสรายได้ รายการที่ " + (index + 1),
        life: 4000,
      });
      income_form_valid.value.incomecode1 = true;
    }
    if (ele.incomename == "") {
      errorCount += 1;
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "กรุณาเลือกรหัสรายได้ รายการที่" + (index + 1),
        life: 4000,
      });
    }
  });

  if (errorCount != 0) {
    return false;
  } else {
    income_form.value.accountperiod =
      income_form.value.accountperiod != null
        ? parseInt(income_form.value.accountperiod.toString())
        : null;
    income_form.value.accountyear = parseInt(income_form.value.accountyear);
    return true;
  }
}

function verifyPaymentIncome() {
  if (income_form.value.payment.paymentamount == 0) {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณากรอกจำนวนเงิน",
      life: 4000,
    });
    income_form_valid.value.paymentamount = true;
    return false;
  } else {
    /// check payment amount is not over total amount
    if (
      income_form.value.payment.paymentamount > income_form.value.totalamount
    ) {
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "จำนวนเงินที่ชำระมากกว่าจำนวนเงินที่ต้องชำระ",
        life: 4000,
      });
      income_form_valid.value.paymentamount = true;
      return false;
    } else if (
      income_form.value.payment.paymentamount < income_form.value.totalamount
    ) {
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "จำนวนเงินที่ชำระน้อยกว่าจำนวนเงินที่ต้องชำระ",
        life: 4000,
      });
      income_form_valid.value.paymentamount = true;
      return false;
    } else {
      income_form_valid.value.paymentamount = false;
      return true;
    }
  }
  return true;
}

function verifyPaymentExpenses() {
  if (expenses_form.value.payment.paymentamount == 0) {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณากรอกจำนวนเงิน",
      life: 4000,
    });
    expenses_form_valid.value.paymentamount = true;
    return false;
  } else {
    /// check payment amount is not over total amount
    if (
      expenses_form.value.payment.paymentamount >
      expenses_form.value.totalamount
    ) {
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "จำนวนเงินที่ชำระมากกว่าจำนวนเงินที่ต้องชำระ",
        life: 4000,
      });
      expenses_form_valid.value.paymentamount = true;
      return false;
    } else if (
      expenses_form.value.payment.paymentamount <
      expenses_form.value.totalamount
    ) {
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "จำนวนเงินที่ชำระน้อยกว่าจำนวนเงินที่ต้องชำระ",
        life: 4000,
      });
      expenses_form_valid.value.paymentamount = true;
      return false;
    } else {
      expenses_form_valid.value.paymentamount = false;
      return true;
    }
  }

  return true;
}

async function verifyDataExpenses() {
  var errorCount = 0;

  if (expenses_form.value.docdate == "") {
    errorCount += 1;
    expenses_form_valid.value.docdate = true;
  } else {
    expenses_form_valid.value.docdate = false;
  }

  if (expenses_form.value.docno == "") {
    errorCount += 1;
    expenses_form_valid.value.docno = true;
  } else {
    expenses_form_valid.value.docno = false;
  }

  if (expenses_form.value.bookcode == "") {
    errorCount += 1;
    expenses_form_valid.value.bookcode = true;
  } else {
    expenses_form_valid.value.bookcode = false;
  }

  if (expenses_form.value.creditorcode == "") {
    errorCount += 1;
    expenses_form_valid.value.creditorcode = true;
  } else {
    expenses_form_valid.value.creditorcode = false;
  }

  let deletIndex = [];
  expenses_form.value.expensesdetail.forEach((ele, index) => {
    // เก็บค่า index row ที่เป็นค่าว่าง
    if (ele.expensescode == "" && ele.amount == "") {
      deletIndex.push(index);
    } else if (ele.expensescode == "" && ele.amount != "") {
      deletIndex.push(index);
    } else if (ele.expensescode != "" && ele.amount == "") {
      deletIndex.push(index);
    }
  });

  // ลบ row expensescode ที่เป็นค่าว่าง
  deletIndex.forEach((ele, index) => {
    let idx = ele - index;
    expenses_form.value.expensesdetail.splice(idx, 1);
  });

  if (expenses_form.value.expensesdetail.length == 0) {
    expenses_form.value.expensesdetail.push({
      expensescode: "",
      expensesname: "",
      descriotion: "",
      amount: 0,
    });
  }

  if (expenses_form.value.accountperiod == null) {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "วันที่เอกสาร ได้ถูกปิดงวดไปแล้ว หรือยังไม่ได้กำหนดงวดบัญชี",
      life: 4000,
    });
  }

  if (expenses_form.value.bookcode == "") {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณาเลือกสมุดรายวัน",
      life: 4000,
    });
  }

  if (expenses_form.value.creditorcode == "") {
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณาเลือกเจ้าหนี้",
      life: 4000,
    });
  }

  expenses_form.value.expensesdetail.forEach((ele, index) => {
    if (ele.expensescode == "") {
      errorCount += 1;
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "กรุณาเลือกรหัสรายได้ รายการที่ " + (index + 1),
        life: 4000,
      });
      expenses_form_valid.value.expensescode1 = true;
    }
    if (ele.expensesname == "") {
      errorCount += 1;
      toast.add({
        severity: "error",
        summary: "ไม่สามารถทำรายการได้",
        detail: "กรุณาเลือกรหัสรายได้ รายการที่" + (index + 1),
        life: 4000,
      });
    }
  });

  if (errorCount != 0) {
    return false;
  } else {
    expenses_form.value.accountperiod =
      expenses_form.value.accountperiod != null
        ? parseInt(expenses_form.value.accountperiod.toString())
        : null;
    expenses_form.value.accountyear = parseInt(expenses_form.value.accountyear);
    return true;
  }
}

function verifyVat() {
  var errorCount = 0;

  vats.value.forEach((ele, index) => {
    var errorDetail = 0;
    var vat_error_detail = {
      vatdate: false,
      vatdocno: false,
      vatperiod: false,
      vatyear: false,
      vatbase: false,
      vatrate: false,
      vatamount: false,
      exceptvat: false,
      custname: false,
      custtaxid: false,
      branchcode: false,
    };

    // console.log(ele);

    if (ele.vatdocno === "") {
      toast.add({
        severity: "warn",
        summary: "ข้อมูลภาษี",
        detail: "ระบุเลขที่ใบกำกับ ใน ข้อ รายการที่ " + (index + 1),
        life: 4000,
      });
      vat_error_detail.vatdocno = true;
      errorCount++;
      errorDetail++;
    } else {
      vat_error_detail.vatdocno = false;
    }

    if (ele.vatdocno != "") {
      if (ele.vatdate == "") {
        errorDetail += 1;
        vat_error_detail.vatdate = true;
      } else {
        vat_error_detail.vatdate = false;
      }
      if (ele.vatdocno == "") {
        errorDetail += 1;
        vat_error_detail.vatdocno = true;
      } else {
        vat_error_detail.vatdocno = false;
      }
      if (ele.vatperiod == "") {
        errorDetail += 1;
        vat_error_detail.vatperiod = true;
      } else {
        vat_error_detail.vatperiod = false;
      }
      if (ele.vatyear.toString() == "") {
        errorDetail += 1;
        vat_error_detail.vatyear = true;
      } else {
        vat_error_detail.vatyear = false;
      }

      if (ele.vatbase.toString() == "") {
        errorDetail += 1;
        vat_error_detail.vatbase = true;
      } else {
        vat_error_detail.vatbase = false;
      }
      if (ele.vatrate.toString() == "") {
        errorDetail += 1;
        vat_error_detail.vatrate = true;
      } else {
        vat_error_detail.vatrate = false;
      }

      if (ele.custname == "") {
        errorDetail += 1;
        vat_error_detail.custname = true;
      } else {
        vat_error_detail.custname = false;
      }
      if (ele.custtaxid == "") {
        errorDetail += 1;
        vat_error_detail.custtaxid = true;
      } else {
        vat_error_detail.custtaxid = false;
      }
      if (ele.branchcode == "") {
        errorDetail += 1;
        vat_error_detail.branchcode = true;
      } else {
        vat_error_detail.branchcode = false;
      }

      if (errorDetail != 0) {
        toast.add({
          severity: "error",
          summary: "ไม่สามารถทำรายการได้",
          detail: "กรุณากรอกข้อมูลภาษีรายการที่ " + (index + 1) + " ให้ครบ",
          life: 4000,
        });
      }
      errorCount += errorDetail;
    }
    vats_valid.value[index] = vat_error_detail;
  });
  if (errorCount != 0) {
    return false;
  } else {
    return true;
  }
}

function getDocImageList() {
  ImageDataService.documentimagegroupnoreserve(
    limitPage.value,
    activePage.value,
    searchItem.value,
    jobId.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
        totalItemsCount.value = res.pagination.total;
        setTimeout(() => {
          checkActiveIndex();
        }, 500);
        console.log(data_list.value);
        // if (res.data.length == 0) {
        //   router.push({
        //     name: "images_job_daily_detail",
        //     params: { id: jobId.value },
        //   });
        // } else {
        //   data_list.value = res.data;
        //   totalItemsCount.value = res.pagination.total;
        //   setTimeout(() => {
        //     checkActiveIndex();
        //   }, 500);
        //   console.log(data_list.value);
        // }
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function getNewDocImageList() {
  ImageDataService.documentimagegroupnoreserve(
    limitPage.value,
    activePage.value,
    searchItem.value,
    jobId.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;

        var check_dup = data_list.value.filter(
          (val) => val.guidfixed == doc_images.value.guidfixed
        );

        if (check_dup.length == 0) {
          data_list.value.splice(0, 0, doc_images.value);
        }

        totalItemsCount.value = res.pagination.total;
        setTimeout(() => {
          checkActiveIndex();
        }, 500);
        console.log(data_list.value);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function deSelectImg() {
  selectedImgData.value = { guidfixed: "", imagereferences: [] };
  // selectedImg.value = false;
  selectedImgUrl.value = "";
}
function removeSelectImg() {
  console.log(selectedImgData.value.guidfixed);
  var sendData = { docref: selectedImgData.value.guidfixed };
  MasterdataService.postUnSelectImage(sendData)
    .then((res) => {
      console.log(res);
      if (res.success) {
        selectedImgData.value = { guidfixed: "", imagereferences: [] };
        // selectedImg.value = false;
        selectedImgUrl.value = "";
      }
    })
    .catch((err) => {
      selectedImgData.value = { guidfixed: "", imagereferences: [] };
      // selectedImg.value = false;
      selectedImgUrl.value = "";
    });
}
function removeMagnify() {
  const elements = document.getElementsByClassName("img-magnifier-glass");
  //console.log(elements);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function verifyTax() {
  var errorCount = 0;

  taxes.value.forEach((ele, index) => {
    var errorDetail = 0;
    var tax_error_detail = {
      taxdate: false,
      taxdocno: false,
      custname: false,
      custtaxid: false,
      details: [
        {
          description: false,
        },
      ],
    };

    //console.log(ele);

    if (ele.taxdocno === "") {
      toast.add({
        severity: "warn",
        summary: "ภาษีหัก​​ ณ ที่จ่าย",
        detail: "ระบุเลขที่เอกสาร ใน ข้อ รายการที่ " + (index + 1),
        life: 4000,
      });
      tax_error_detail.taxdocno = true;
      errorCount++;
      errorDetail++;
    } else {
      tax_error_detail.taxdocno = false;
    }

    if (ele.taxdocno != "") {
      if (ele.taxdate == "") {
        errorDetail += 1;
        tax_error_detail.taxdate = true;
      } else {
        tax_error_detail.taxdate = false;
      }
      if (ele.taxdocno == "") {
        errorDetail += 1;
        tax_error_detail.taxdocno = true;
      } else {
        tax_error_detail.taxdocno = false;
      }
      if (ele.custname == "") {
        errorDetail += 1;
        tax_error_detail.custname = true;
      } else {
        tax_error_detail.custname = false;
      }
      if (ele.custtaxid.toString() == "") {
        errorDetail += 1;
        tax_error_detail.custtaxid = true;
      } else {
        tax_error_detail.custtaxid = false;
      }
      ele.details.forEach((detail, indexx) => {
        if (detail.description == "" && indexx == 0) {
          errorDetail += 1;
        }
      });

      if (errorDetail != 0) {
        toast.add({
          severity: "error",
          summary: "ไม่สามารถทำรายการได้",
          detail:
            "กรุณากรอกข้อมูลภาษีหัก​​ ณ ที่จ่าย รายการที่ " +
            (index + 1) +
            " ให้ครบ",
          life: 4000,
        });
        // ele.details.forEach((detail, indexx) => {
        //   if (detail.description == "" && indexx == 0) {
        //     toast.add({
        //       severity: "error",
        //       summary: "ไม่สามารถทำรายการได้",
        //       detail:
        //         "กรุณากรอกข้อมูลรายละเอียดภาษีหัก​​ ณ ที่จ่าย รายการที่ " +
        //         (indexx + 1),
        //       life: 4000,
        //     });
        //   }
        // });
      }
      errorCount += errorDetail;
    }
    taxes_valid.value[index] = tax_error_detail;
  });
  if (errorCount != 0) {
    return false;
  } else {
    return true;
  }
}

function hidepanel() {
  setTimeout(() => {
    var panel = document.getElementById("panelForm3");
    panel.setAttribute("style", "flex-basis: calc(98% - 4px) !important");
    var panel2 = document.getElementById("panelForm2");
    panel2.setAttribute("style", "flex-basis: calc(2% - 4px) !important");
  }, 50);
}
function showpanel() {
  setTimeout(() => {
    var panel3 = document.getElementById("panelForm3");
    panel3.setAttribute("style", "flex-basis: calc(60% - 4px) !important");

    var panel2 = document.getElementById("panelForm2");
    panel2.setAttribute("style", "flex-basis: calc(40% - 4px) !important");
  }, 50);
}

function ImportDaliy(data) {
  daily_form.value.journaldetail = data;
}

function deleteDetail(data) {
  /// 1 = รายวัน , 2 = รายได้  , 3 = รายจ่าย
  if (imageDailyType.value == 1) {
    daily_form.value.journaldetail = daily_form.value.journaldetail.filter(
      (val) => val.index !== data
    );

    if (daily_form.value.journaldetail.length == 0) {
      daily_form.value.journaldetail.push({
        index: 0,
        accountcode: "",
        accountname: "",
        debitamount: 0,
        creditamount: 0,
      });
    }
    toast.add({
      severity: "success",
      summary: "Successful",
      detail: "Detail Deleted",
      life: 3000,
    });
  } else if (imageDailyType.value == 2) {
    income_form.value.incomedetail = income_form.value.incomedetail.filter(
      (val) => val.index !== data
    );

    if (income_form.value.incomedetail.length == 0) {
      income_form.value.incomedetail.push({
        index: 0,
        accountcode: "",
        accountname: "",
        amount: 0,
      });
    }
    toast.add({
      severity: "success",
      summary: "Successful",
      detail: "Detail Deleted",
      life: 3000,
    });
  } else if (imageDailyType.value == 3) {
    expenses_form.value.expensesdetail =
      expenses_form.value.expensesdetail.filter((val) => val.index !== data);

    if (expenses_form.value.expensesdetail.length == 0) {
      expenses_form.value.expensesdetail.push({
        expensescode: "",
        expensesname: "",
        descriotion: "",
        amount: 0,
      });
    }
    toast.add({
      severity: "success",
      summary: "Successful",
      detail: "Detail Deleted",
      life: 3000,
    });
  }
}
function addColumn(index) {
  heightIamgeDivCheckGl.value =
    "height : " + divCheckGl.value.offsetHeight + "px";

  /// 1 = รายวัน , 2 = รายได้  , 3 = รายจ่าย
  if (imageDailyType.value == 1) {
    daily_form.value.journaldetail.splice(index + 1, 0, {
      index: index + 1,
      accountcode: "",
      accountname: "",
      debitamount: 0,
      creditamount: 0,
    });
  } else if (imageDailyType.value == 2) {
    income_form.value.incomedetail.splice(index + 1, 0, {
      index: index + 1,
      accountcode: "",
      accountname: "",
      amount: 0,
    });
  } else if (imageDailyType.value == 3) {
    expenses_form.value.expensesdetail.splice(index + 1, 0, {
      expensescode: "",
      expensesname: "",
      descriotion: "",
      amount: 0,
    });
  }
}

function onRowReorder(data) {
  if (imageDailyType.value == 1) {
    daily_form.value.journaldetail = data;
  } else if (imageDailyType.value == 2) {
    income_form.value.incomedetail = data;
  } else if (imageDailyType.value == 3) {
    expenses_form.value.expensesdetail = data;
  }
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
  daily_form.value.journaldetail[index].accountcode = ele[0].accountcode;
  daily_form.value.journaldetail[index].accountname = ele[0].accountname;
}

function getAccountChart() {
  MasterdataService.getAccountChart()
    .then((res) => {
      //console.log(res);
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

function getJournalBook() {
  MasterdataService.getJournalBook()
    .then((res) => {
      //console.log(res);
      if (res.success) {
        accountBook_detail.value = res.data.sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        });
        accountBook_detail.value.forEach((ele) => {
          ele.label = ele.code + "~" + ele.name1;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
function getAccountGroup() {
  MasterdataService.getAccountGroup()
    .then((res) => {
      //console.log(res);
      if (res.success) {
        groupAccount_detail.value = res.data.sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        });
        groupAccount_detail.value.forEach((ele) => {
          ele.label = ele.code + "~" + ele.name1;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function addBoxVat() {
  // ใช้วันที่เอกสารจาก daily_form หรือวันที่ปัจจุบันถ้าไม่มี
  const vatDate = daily_form.value.docdate || Utils.getDateTime();
  
  // ดึงเดือนจากวันที่ใบกำกับ (เดือนใน JavaScript เริ่มจาก 0)
  const vatMonth = new Date(vatDate).getMonth() + 1;
  
  // กำหนดประเภทภาษีตาม debtaccounttype
  // "0" = ลูกหนี้ → ภาษีขาย (vatmode = 1)
  // "1" = เจ้าหนี้ → ภาษีซื้อ (vatmode = 0)
  const isCreditor = daily_form.value.debtaccounttype === "1";
  const vatMode = isCreditor ? 0 : 1; // vatmode: 0=ภาษีซื้อ, 1=ภาษีขาย

  vats.value.push({
    vattype: 0, // vattype ต้องเป็น 0 (ปกติ) เสมอ
    vatdate: vatDate,
    vatdocno: "",
    vatperiod: vatMonth.toString(),
    vatyear: parseInt(Utils.getYear().toString()) + 543,
    vatbase: 0,
    vatrate: 0,
    vatamount: 0,
    exceptvat: 0,
    vatmode: vatMode, // vatmode เปลี่ยนตาม debtaccounttype
    vatsubmit: false,
    custname: "",
    custtaxid: "",
    organization: 0,
    branchcode: "00000",
    remark: "",
  });

  vats_valid.value.push({
    vatdate: false,
    vatdocno: false,
    vatperiod: false,
    vatyear: false,
    vatbase: false,
    vatrate: false,
    vatamount: false,
    exceptvat: false,
    custname: false,
    custtaxid: false,
    branchcode: false,
  });
}

function deleteDetailVat(index) {
  vats.value.splice(index, 1);
  vats_valid.value.splice(index, 1);
}

function calVatAmount(index) {
  var vatbase = vats.value[index].vatbase;
  var vatrate = vats.value[index].vatrate;
  if (vatbase == "" || vatbase == null) {
    vatbase = 0;
  }
  if (vatrate == "" || vatrate == null) {
    vatrate = 0;
  }
  var vatAmount = (parseFloat(vatbase) * parseFloat(vatrate)) / 100;
  vatAmount = vatAmount.toFixed(2);
  vats.value[index].vatamount = parseFloat(vatAmount);
}

function checkDateFormat(index) {
  if (vats.value[index].vatperiod > 12) {
    vats.value[index].vatperiod = 12;
  }
  if (vats.value[index].vatperiod < 1) {
    vats.value[index].vatperiod = 1;
  }
}
function setBranch(index) {
  if (vats.value[index].organization == 0) {
    vats.value[index].branchcode = "00000";
  } else {
    vats.value[index].branchcode = "";
  }
}

function addBoxTax() {
  // ใช้วันที่เอกสารจาก daily_form หรือวันที่ปัจจุบันถ้าไม่มี
  const taxDate = daily_form.value.docdate || Utils.getDateTime();
  
  // กำหนด custtype ตาม debtaccounttype และข้อมูลลูกหนี้/เจ้าหนี้
  let custType = 0; // default เป็นบุคคลธรรมดา
  
  if (daily_form.value.debtaccounttype === "0" && debtorData.value) {
    // ใช้ข้อมูลลูกหนี้
    custType = debtorData.value.custtype || 0;
  } else if (daily_form.value.debtaccounttype === "1" && creditorData.value) {
    // ใช้ข้อมูลเจ้าหนี้
    custType = creditorData.value.custtype || 0;
  }

  taxes.value.push({
    taxdocno: "",
    taxdate: taxDate, // ใช้วันที่เอกสาร
   
    custname: "",
    custtype: custType, // ใช้ custtype จากข้อมูลลูกหนี้/เจ้าหนี้
   
    custtaxid: "",
    taxtype: 0,
    address: "",
    details: [
      {
        description: "",
        taxbase: 0,
        taxrate: 0,
        taxamount: 0,
      },
    ],
  });

  taxes_valid.value.push({
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  });
}

function deleteDetailTax(index) {
  taxes.value.splice(index, 1);
  taxes_valid.value.splice(index, 1);
}
function getSumTaxBase(data) {
  var sum = 0;
  if (data != null && data.length > 0) {
    data.forEach((element) => {
      sum += element.taxbase;
    });
  }
  return sum.toFixed(2);
}

function nextImage(index) {
  activeIndex.value = 0;
  resetZoomImage();
  //console.log(index);
  var docref = data_list.value[index].guidfixed;
  var sendData = { docref: docref };
  console.log(checkUseImgByUser(localStorage._usercode));
  if (checkUseImgByUser(localStorage._usercode)) {
    confirmChangeImageDialog.value = true;
    newDocRefImage.value = docref;
  } else {
    MasterdataService.postSelectImage(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
            clearData();
          }
        }
      })
      .catch((err) => {
        console.log(err);

        toast.add({
          severity: "error",
          summary: "Error",
          detail: "ไม่สามารถเลือกรูปได้ " + err,
          life: 3000,
        });
      });
  }

  if (index > data_list.value.length - 6) {
    if (data_list.value.length - 6 < totalItemsCount.value - 6) {
      MasterdataService.getDocImage(
        limitPage.value,
        activePage.value + 1,
        searchItem.value
      )
        .then((res) => {
          console.log(res);
          if (res.success) {
            console.log(res.data);
            activePage.value = activePage.value + 1;
            data_list.value.push(...res.data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
}

function clearData() {
  resetZoomImage();
  daily_form.value.docno = Utils.getDocNoDate("JO");
  daily_form.value.accountdescription = "";
  // daily_form.value.accountgroup = "";
  // daily_form.value.accountperiod = null;
  // daily_form.value.accountyear = parseInt(Utils.getYear().toString()) + 543;
  // daily_form.value.amount = "";
  // daily_form.value.batchId = "";
  // daily_form.value.docdate = Utils.getDateTime();
  // daily_form.value.exdocrefdate = "";
  // daily_form.value.exdocrefno = "";
  // daily_form.value.bookcode = "";
  // daily_form.value.journaldetail = [
  //   {
  //     accountcode: "",
  //     accountname: "",
  //     debitamount: 0,
  //     creditamount: 0,
  //   },
  // ];
  // daily_form.value.parid = "0000000";
  daily_form.value.debtaccounttype = "0";
  daily_form.value.debtor = "";
  daily_form.value.creditor = "";

  // แก้ไขการล้างค่า journaldetail - คงรายการเดิมไว้แต่ล้างค่า debit และ credit
  if (daily_form.value.journaldetail && daily_form.value.journaldetail.length > 0) {
    daily_form.value.journaldetail.forEach((item) => {
      item.debitamount = 0;
      item.creditamount = 0;
    });
  } else {
    // ถ้าไม่มีรายการเลย ให้สร้างรายการเปล่า
    daily_form.value.journaldetail = [
      {
        accountcode: "",
        accountname: "",
        debitamount: 0,
        creditamount: 0,
      },
    ];
  }

  // ล้างข้อมูลลูกหนี้และเจ้าหนี้
  debtorData.value = null;
  creditorData.value = null;

  daily_form_has.value = {
    accountdescription: daily_form.value.accountdescription,
    accountgroup: daily_form.value.accountgroup,
    accountperiod: daily_form.value.accountperiod,
    accountyear: daily_form.value.accountyear,
    amount: daily_form.value.amount,
    batchId: daily_form.value.batchId,
    docdate: daily_form.value.docdate,
    docno: daily_form.value.docno,
    exdocrefdate: daily_form.value.exdocrefdate,
    exdocrefno: daily_form.value.exdocrefno,
    journaltype: daily_form.value.journaltype,
    bookcode: daily_form.value.bookcode,
    journaldetail: daily_form.value.journaldetail,
    parid: daily_form.value.parid,
  };

  daily_form_valid.value = {
    accountdescription: false,
    accountgroup: false,
    accountperiod: false,
    accountyear: false,
    amount: false,
    batchId: false,
    docdate: false,
    docno: false,
    bookcode: false,
  };

  vats.value.splice(0, vats.value.length);
  vats_valid.value = [];

  taxes.value.splice(0, taxes.value.length);
  taxes_valid.value = [];
}

function clearDataIncome() {
  resetZoomImage();
  /// inconme
  income_form.value.docdate = new Date();
  income_form.value.docno = Utils.getDocNoDate("JO");
  income_form.value.bookcode = "";
  income_form.value.debtorcode = "";
  income_form.value.vattype = 1;
  income_form.value.docrefdate = new Date();
  income_form.value.docrefno = "";
  income_form.value.inquirytype = 1;
  income_form.value.accountdescription = "";
  income_form.value.accountperiod = null;
  income_form.value.accountyear = parseInt(Utils.getYear().toString()) + 543;
  income_form.value.incomedetail = [
    {
      incomecode: "",
      incomename: "",
      description: "",
      amount: 0,
    },
  ];
  income_form.value.vatrate = 7;
  income_form.value.totalvalue = 0.0;
  income_form.value.discount = "";
  income_form.value.totaldiscount = 0;
  income_form.value.totalvatvalue = 0;
  income_form.value.totalbeforevat = 0;
  income_form.value.totalaftervat = 0, /// มูลค่าหลังภาษี
  income_form.value.totalexceptvat = 0, /// มูลค่ายกเว้นภาษี
  income_form.value.totalamount = 0, /// มูลค่ารวมทั้งสิ้น
  income_form.value.payment = {
    paymenttype: 1,
    paymentamount: 0,
  };

  income_form_valid.value.docdate = false;
  income_form_valid.value.docno = false;
  income_form_valid.value.bookcode = false;
  income_form_valid.value.debtorcode = false;
  income_form_valid.value.paymentamount = false;
  income_form_valid.value.incomecode1 = false;
}

function clearDataExpenses() {
  resetZoomImage();
  /// expenses
  expenses_form.value.docdate = new Date();
  expenses_form.value.docno = Utils.getDocNoDate("JO");
  expenses_form.value.bookcode = "";
  expenses_form.value.creditorcode = "";
  expenses_form.value.accountdescription = "";
  expenses_form.value.accountperiod = null;
  expenses_form.value.accountyear = parseInt(Utils.getYear().toString()) + 543;
  expenses_form.value.expensesdetail = [
    {
      expensescode: "",
      expensesname: "",
      descriotion: "",
      amount: 0,
    },
  ];
  expenses_form.value.totalamount = 0;
  expenses_form.value.payment = {
    paymenttype: 1,
    paymentamount: 0,
  };

  expenses_form_valid.value = {
    docdate: false,
    docno: false,
    bookcode: false,
    creditorcode: false,
    paymentamount: false,
    expensescode1: false,
  };

  expenses_form_valid.value.docdate = false;
  expenses_form_valid.value.docno = false;
  expenses_form_valid.value.bookcode = false;
  expenses_form_valid.value.creditorcode = false;
  expenses_form_valid.value.paymentamount = false;
  expenses_form_valid.value.expensescode1 = false;
}

async function nextImageOnSave(old_img) {
  console.log(data_list.value);
  console.log(data_list.value.length);
  console.log(old_img);
  var rebuild = [];
  data_list.value.forEach((ele) => {
    if (ele.guidfixed != old_img) {
      rebuild.push(ele);
    }
  });

  data_list.value = rebuild;

  activeIndexList.value = 0;
  activeIndex.value = 0;

  // ตรวจสอบว่ามีรูปเหลือใน Galleria หรือไม่
  if (data_list.value.length > activeIndexList.value) {
    console.log(data_list.value[activeIndexList.value].guidfixed);
    useImage(data_list.value[activeIndexList.value].guidfixed);
  } else {
    // ถ้ารูปใน Galleria หมดแล้ว ให้เช็คว่าต้องโหลดรูปชุดใหม่หรือไม่
    try {
      const nextPageResponse = await ImageDataService.documentimagegroupnoreserve(
        limitPage.value,
        activePage.value + 1, // เพิ่ม page เพื่อโหลดรูปชุดใหม่
        searchItem.value,
        jobId.value
      );
      
      if (nextPageResponse.success && nextPageResponse.data && nextPageResponse.data.length > 0) {
        // ยังมีรูปชุดใหม่ที่ต้องบันทึก - โหลดมาแสดง
        console.log('Loading next batch of images:', nextPageResponse.data.length);
        data_list.value = nextPageResponse.data;
        totalItemsCount.value = nextPageResponse.pagination.total;
        activePage.value++;
        useImage(data_list.value[0].guidfixed);
      } else {
        // ไม่มีรูปที่ต้องบันทึกแล้ว - จบจริงๆ
        console.log('No more images to process - showing completion dialog');
        confirmCompleteDialog.value = true;
      }
    } catch (error) {
      console.error('Error loading next batch of images:', error);
      // ถ้า error ให้แสดง dialog เสร็จสิ้น
      confirmCompleteDialog.value = true;
    }
  }
}

function confirmComplete() {
  confirmCompleteDialog.value = false;
  goList();
}

function checkUseImgByUser(user) {
  var found = 0;
  AllImageUsed.value.forEach((element) => {
    if (element.username == user) {
      found += 1;
    }
  });

  if (found == 0) {
    return false;
  } else {
    return true;
  }
}

function checkUseImg(data) {
  var found = 0;
  AllImageUsed.value.forEach((element) => {
    if (element.docref == data) {
      found += 1;
    }
  });

  if (found == 0) {
    return false;
  } else {
    return true;
  }
}

function useImage(data) {
  var sendData = { docref: data };
  if (checkUseImgByUser(localStorage._usercode)) {
    confirmChangeImageDialog.value = true;
    newDocRefImage.value = data;
  } else {
    MasterdataService.postSelectImage(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
            clearData();
          }
        }
      })
      .catch((err) => {
        nextImageOnSave(data);
        console.log(err);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "ไม่สามารถเลือกรูปได้ " + err,
          life: 3000,
        });
      });
  }
}

function changeImage(data) {
  var sendData = { docref: data };
  if (checkUseImg(data)) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "ไม่สามารถเลือกรูปได้มีผู้ใช้กำลังใช้งานอยู่ ",
      life: 3000,
    });
    confirmChangeImageDialog.value = false;
    getNewDocImageList();
    return;
  }
  if (checkUseImgByUser(localStorage._usercode)) {
    MasterdataService.postSelectImageForce(sendData)
      .then((res) => {
        //console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
            confirmChangeImageDialog.value = false;
            clearData();
          }
        }
      })
      .catch((err) => {
        console.log(err);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "ไม่สามารถเลือกรูปได้ " + err,
          life: 3000,
        });
      });
  } else {
    MasterdataService.postSelectImage(sendData)
      .then((res) => {
        console.log(res);
        if (res.success) {
          if (res.data) {
            WsConnectImage.value.send(JSON.stringify(sendData));
          }
        }
      })
      .catch((err) => {
        console.log(err);
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "ไม่สามารถเลือกรูปได้ " + err,
          life: 3000,
        });
      });
  }
}

function reLoadImage() {
  console.log("postNextImage");
  MasterdataService.postNextImage()
    .then((res) => {
      if (res.success) {
        console.log(res.data);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function resetZoomImage() {
  scale.value = 1;
  panning.value = false;
  pointX.value = 0;
  pointY.value = 0;
  start.value = { x: 0, y: 0 };
  zoomStyle.value = "";
}

function resizeSplitter(isOveray) {
  showOveray.value = isOveray;
  console.log(isOveray);
}

function openImageNewWindow() {
  idrandom.value = Utils.generateRandomNumber();
  if (newWindow.value) {
    myWindow.value = window.open(
      router.resolve({
        name: "images_job_daily_detail_view",
        params: { id: jobId.value, idrandom: idrandom.value },
      }).href,
      "myWindow",
      "width=1000, height=1000"
    );
    countIsOpenPopupImage.value = 0;
    myInterval.value = setInterval(() => {
      checkPopupOpenImage();
    }, 300);
  } else {
    if (myWindow.value != undefined) {
      myWindow.value.close();
    }
  }
}

// ใช้เช็ค จอ 2 ว่าเปิดอยู่ไหม
async function checkPopupOpenImage() {
  let popupImageStatus = localStorage.getItem(idrandom.value);

  if (popupImageStatus == "1") {
    localStorage.setItem(idrandom.value, "0");
    countIsOpenPopupImage.value = 0;
  } else {
    if (countIsOpenPopupImage.value > 3) {
      console.log("Close New Window Image");

      if (myInterval.value != null) {
        newWindow.value = false;
        clearInterval(myInterval.value);
        localStorage.removeItem(idrandom.value);
      }

      // let sendData = { docref: selectedImag.value.guidfixed };
      // try {
      //   const res = await MasterdataService.postUnSelectImage(sendData);
      //   // console.log(res);
      //   if (res.success) {
      //     if (myInterval.value != null) {
      //       newWindow.value = false;
      //       clearInterval(myInterval.value);
      //       localStorage.removeItem(idrandom.value);
      //     }
      //   }
      // } catch (err) {
      //   console.log(err);
      //   toast.add({
      //     severity: "error",
      //     summary: "error",
      //     detail: err.response.data.message,
      //     life: 3000,
      //   });
      // }
    }
    countIsOpenPopupImage.value += 1;
  }
}

function upDateStatusImage(status) {
  if (status == 1) {
    statusImage.value = 1;
    updateStatus();
  } else if (status == 3) {
    statusImage.value = 3;
    showContent.value = "ต้องการไม่บันทึกรูปภาพ";
    confirmRejectDialog.value = true;
  } else if (status == 4) {
    statusImage.value = 4;
    showContent.value = "ต้องการยกเลิกรูปภาพ";
    confirmRejectDialog.value = true;
  }
}

function updateStatusCancel() {
  confirmRejectDialog.value = false;
}

// Update status
async function updateStatus() {
  let data = {
    status: statusImage.value,
  };
  try {
    const res = await ImageDataService.putDocumentImageGroupStatus(
      doc_images.value.guidfixed,
      data
    );
    if (res.success) {
      confirmRejectDialog.value = false;

      if (statusImage.value == 1) {
        return;
      } else {
        removeSelectImg();
        setTimeout(() => {
          nextImageOnSave(doc_images.value.guidfixed);
          clearData();
        }, 200);
      }
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

function setAccountPeriod(data) {
  console.log(imageDailyType.value);
  if (imageDailyType.value == 1) {
    daily_form.value.accountperiod = data;
  } else if (imageDailyType.value == 2) {
    income_form.value.accountperiod = data;
  } else if (imageDailyType.value == 3) {
    expenses_form.value.accountperiod = data;
  }
}

function getDocumentFormate() {
  MasterdataService.getDocumentFormateList()
    .then((res) => {
      console.log(res);
      if (res.success) {
        /// remove res.data where module != GL
        res.data = res.data.filter((val) => val.module == "GL");
        document_formate.value = res.data.sort(function (obj1, obj2) {
          return obj1.doccode - obj2.doccode;
        });
        document_formate.value.forEach((ele) => {
          ele.label = ele.doccode + "~" + ele.description;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function selectDucumentFormat(data) {
  documentFormateSelected.value = data;
  if (data != null) {
    daily_form.value.journaldetail = [];
    var ele = document_formate.value.filter((val) => val.doccode == data);

    console.log(ele[0]);

    ele[0].details.forEach((element) => {
      daily_form.value.journaldetail.push({
        actioncode: element.actioncode,
        accountcode: element.accountcode,
        accountname: element.detail,
        debitamount: parseInt(element.debit),
        creditamount: parseInt(element.credit),
      });
    });
  } else {
    daily_form.value.journaldetail = [
      {
        accountcode: "",
        accountname: "",
        debitamount: 0,
        creditamount: 0,
      },
    ];
  }
}

function selectIncome(data, index) {
  var ele = income_detail.value.filter((val) => val.code == data.code);
  income_form.value.incomedetail[index].incomecode = ele[0].code;
  income_form.value.incomedetail[index].incomename = ele[0].names[0].name;

  console.log(income_form.value);
}

function getIncome() {
  IncomeDataService.getIncome()
    .then((res) => {
      //   console.log(res);
      if (res.success) {
        income_detail.value = res.data.sort(function (obj1, obj2) {
          return obj1.incomecode - obj2.incomecode;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function selectexpenses(data, index) {
  var ele = expenses_detail.value.filter((val) => val.code == data.code);
  expenses_form.value.expensesdetail[index].expensescode = ele[0].code;
  expenses_form.value.expensesdetail[index].expensesname = ele[0].names[0].name;

  console.log(expenses_form.value);
}

function getExpenses() {
  ExpensesDataService.getExpensesList()
    .then((res) => {
      //   console.log(res);
      if (res.success) {
        expenses_detail.value = res.data.sort(function (obj1, obj2) {
          return obj1.expensescode - obj2.expensescode;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

/// swapType
function swapType(type) {
  imageDailyType.value = type;
  activeTabIndex.value = 0;

  clearData();
  clearDataIncome();
  clearDataExpenses();

  setTimeout(() => {
    // set height ifram
    heightIamgeDivCheckGl.value =
      "height:" + divCheckGl.value.offsetHeight + "px";
  }, 100);

  if (type == 1) {
    toast.add({
      severity: "success",
      summary: "เปลี่ยนรูปแบบ",
      detail: "เปลี่ยนรูปแบบเป็น บันทึกรายวัน",
      life: 4000,
    });
  } else if (type == 2) {
    toast.add({
      severity: "success",
      summary: "เปลี่ยนรูปแบบ",
      detail: "เปลี่ยนรูปแบบเป็น บันทึกรายได้",
      life: 4000,
    });
  } else if (type == 3) {
    toast.add({
      severity: "success",
      summary: "เปลี่ยนรูปแบบ",
      detail: "เปลี่ยนรูปแบบเป็น บันทึกค่าใช้จ่าย",
      life: 4000,
    });
  }
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-ground px-2 py-0">
        <Button
          label="กลับหน้ารายการ"
          icon="pi pi-arrow-left"
          class="p-button-text p-button-sm p-button-info"
          @click="!isChange ? goList() : (confirmBackImageDialog = true)"
        />

        <div class="surface-card p-4 shadow-2 border-round p-fluid">
          <!-- <div class="flex mb-2">
            <Button
              icon="pi pi-file"
              label="บันทึกรายวัน"
              class="p-button-sm mr-1"
              :disabled="imageDailyType == 1"
              @click="swapType(1)"
            />
            <Button
              icon="pi pi-plus-circle"
              label="บันทึกรายได้"
              class="p-button-sm mr-1 p-button-success"
              :disabled="imageDailyType == 2"
              @click="swapType(2)"
            />
            <Button
              icon="pi pi-minus-circle"
              label="บันทึกค่าใช้จ่าย"
              class="p-button-sm mr-1 p-button-warning"
              :disabled="imageDailyType == 3"
              @click="swapType(3)"
            />
          </div> -->
          <Splitter
            layout="horizontal"
            @resizestart="resizeSplitter(true)"
            @resizeend="resizeSplitter(false)"
          >
            <SplitterPanel
              class="relative"
              id="panelForm2"
              @mouseleave="removeMagnify()"
              :size="50"
            >
              <div
                class="flex align-items-center justify-content-center"
                style="min-height: 60vh"
                v-if="onLoad"
              >
                <ProgressSpinner animationDuration="10s" />
              </div>
              <div v-if="!onLoad">
                <div
                  class="flex justify-content-between"
                  :class="!selectedImg ? 'flex-column' : ''"
                >
                  <div class="flex">
                    <Button
                      v-if="selectedImg == false"
                      icon="pi pi-angle-double-right"
                      class="p-button-text"
                      @click="
                        selectedImg = true;
                        showpanel();
                      "
                    />
                    <Button
                      v-if="selectedImg == true"
                      icon="pi pi-angle-double-left"
                      class="p-button-text"
                      @click="
                        selectedImg = false;
                        hidepanel();
                      "
                    />
                  </div>

                  <div class="flex">
                    <!-- <div
                      v-if="selectedImg"
                      v-for="listStatusImage of listStatusImagesByDaily"
                      :key="listStatusImage.code"
                      class="field-radiobutton m-0 mr-2 ml-2 flex align-items-center justify-content-center"
                    >
                      <RadioButton
                        :id="listStatusImage.code"
                        name="listStatusImage"
                        :value="listStatusImage.code"
                        v-model="doc_images.status"
                        @change="upDateStatusImage"
                      />
                      <label :for="listStatusImage.code">{{
                        listStatusImage.name
                      }}</label>
                    </div> -->
                    <ToggleButton
                      v-if="!selectedImg"
                      v-model="newWindow"
                      onLabel=""
                      offLabel=""
                      offIcon="pi pi pi-desktop"
                      onIcon="pi pi-times"
                      @change="openImageNewWindow()"
                      class="p-button-text"
                    />
                  </div>
                  <!-- <div class="flex">
                    <Button
                      label="OCR"
                      icon="pi pi-eye"
                      class="p-button-text"
                      @click="readOCR()"
                    />
                  </div> -->
                </div>

                <KeepAlive>
                  <div id="galleriabox" v-if="selectedImg && !waitForImages">
                    <Galleria
                      :value="doc_images.imagereferences"
                      :thumbnailsPosition="'top'"
                      v-model:activeIndex="activeIndex"
                      @update:activeIndex="resetZoomImage()"
                      :showThumbnails="false"
                      :showIndicators="doc_images.imagereferences.length > 1"
                    >
                      <template #item="slotProps">
                        <div class="grid w-full">
                          <div class="col-12">
                            <div
                              class="flex justify-content-between flex-wrap card-container purple-container"
                            >
                              <Chip
                                :label="slotProps.item.name"
                                icon="pi pi-image"
                                class="mt-2"
                              />
                              <Chip
                                :label="
                                  'วันที่ : ' +
                                  Utils.getDateTimeFormat(
                                    slotProps.item.uploadedat
                                  )
                                "
                                icon="pi pi-calendar"
                                class="mr-2 mt-2"
                              />
                            </div>
                          </div>
                          <div class="col-12" :style="heightIamgeDivCheckGl">
                            <div
                              class="relative"
                              style="margin: 0px; padding: 0px; height: 100%"
                            >
                              <div
                                v-if="
                                  Utils.checkTypeImage(slotProps.item.imageuri)
                                "
                                class="h-full"
                              >
                                <iframe
                                  :name="slotProps.item.imageuri"
                                  :src="
                                    '/images/components/zoom?uri=' +
                                    slotProps.item.imageuri
                                  "
                                  class="static"
                                >
                                </iframe>
                              </div>
                              <div
                                v-if="
                                  Utils.checkTypePDF(slotProps.item.imageuri)
                                "
                                class="h-full"
                              >
                                <PdfApp
                                  :pdf="slotProps.item.imageuri"
                                  :config="{
                                    toolbar: false,
                                  }"
                                  class="static"
                                ></PdfApp>
                              </div>
                              <div
                                v-if="showOveray"
                                class="absolute top-0 left-0"
                                style="
                                  width: 100%;
                                  height: 100%;
                                  background-color: white;
                                  opacity: 0;
                                "
                              ></div>
                            </div>
                          </div>
                        </div>
                      </template>
                      <template #thumbnail="slotProps">
                        <div
                          v-if="Utils.checkTypeImage(slotProps.item.imageuri)"
                        >
                          <img
                            :src="slotProps.item.imageuri"
                            style="width: 40px; height: 40px"
                          />
                        </div>
                        <div v-if="Utils.checkTypePDF(slotProps.item.imageuri)">
                          <img
                            src="@/assets/pdf-icon.svg"
                            style="width: 40px; height: 40px"
                          />
                        </div>
                      </template>
                      <template #footer> </template>
                    </Galleria>
                  </div>
                </KeepAlive>
              </div>
            </SplitterPanel>
            <SplitterPanel @click="removeMagnify()" id="panelForm3" :size="50">
              <div ref="divCheckGl">
                <TabView
                  class="tabview-custom"
                  ref="tabview"
                  v-model:activeIndex="activeTabIndex"
                >
                  <TabPanel>
                    <template #header>
                      <i class="pi pi-book mr-1"></i>
                      <span v-if="imageDailyType == 1"> ข้อมูลรายวัน</span>
                      <span v-if="imageDailyType == 2">
                        ข้อมูลรายได้อื่น ๆ</span
                      >
                      <span v-if="imageDailyType == 3">
                        ข้อมูลค่าใช้จ่ายอื่น ๆ</span
                      >
                    </template>
                    <div v-if="imageDailyType == 1">
                      <JournalForm
                        :daily_form="daily_form"
                        :daily_form_valid="daily_form_valid"
                        :accountChart_detail="accountChart_detail"
                        :accountBook_detail="accountBook_detail"
                        :groupAccount_detail="groupAccount_detail"
                        :document_formate="document_formate"
                        :customer_detail="customer_detail"
                        :creditor_detail="creditor_detail"
                        :income_expenses_mode="false"
                        v-on:ImportDaliy="ImportDaliy"
                        v-on:deleteDetail="deleteDetail"
                        v-on:addColumn="addColumn"
                        v-on:onRowReorder="onRowReorder"
                        v-on:selectAccount="selectAccount"
                        v-on:setAccountPeriod="setAccountPeriod"
                        v-on:selectDucumentFormat="selectDucumentFormat"
                      />
                    </div>
                    <div v-if="imageDailyType == 2">
                      <IncomeForm
                        :isUpdate="false"
                        :income_form="income_form"
                        :income_form_valid="income_form_valid"
                        :customer_detail="customer_detail"
                        :income_detail="income_detail"
                        :accountBook_detail="accountBook_detail"
                        :groupAccount_detail="groupAccount_detail"
                        v-on:deleteDetail="deleteDetail"
                        v-on:addColumn="addColumn"
                        v-on:onRowReorder="onRowReorder"
                        v-on:selectIncome="selectIncome"
                        v-on:setAccountPeriod="setAccountPeriod"
                      >
                      </IncomeForm>
                    </div>
                    <div v-if="imageDailyType == 3">
                      <ExpensesForm
                        :isUpdate="false"
                        :expenses_form="expenses_form"
                        :expenses_form_valid="expenses_form_valid"
                        :customer_detail="customer_detail"
                        :expenses_detail="expenses_detail"
                        :accountBook_detail="accountBook_detail"
                        :groupAccount_detail="groupAccount_detail"
                        v-on:ImportDaliy="ImportDaliy"
                        v-on:deleteDetail="deleteDetail"
                        v-on:addColumn="addColumn"
                        v-on:onRowReorder="onRowReorder"
                        v-on:selectexpenses="selectexpenses"
                        v-on:setAccountPeriod="setAccountPeriod"
                      >
                      </ExpensesForm>
                    </div>
                  </TabPanel>
                  <TabPanel v-if="imageDailyType == 1">
                    <template #header>
                      <i class="pi pi-wallet mr-1"></i>
                      <span> ข้อมูลภาษี</span>
                    </template>
                    <div>
                      <VatForm
                        :vats="vats"
                        :vats_valid="vats_valid"
                        :debtorData="debtorData"
                        :creditorData="creditorData"
                        :debtaccounttype="daily_form.debtaccounttype"
                        v-on:addBoxVat="addBoxVat"
                        v-on:deleteDetailVat="deleteDetailVat"
                        v-on:calVatAmount="calVatAmount"
                        v-on:checkDateFormat="checkDateFormat"
                        v-on:setBranch="setBranch"
                      ></VatForm>
                    </div>
                  </TabPanel>
                  <TabPanel v-if="imageDailyType == 1">
                    <template #header>
                      <i class="pi pi-wallet mr-1"></i>
                      <span> ภาษีถูกหัก/หัก​ ณ ที่จ่าย</span>
                    </template>
                    <div>
                      <TaxForm
                        :taxes="taxes"
                        :taxes_valid="taxes_valid"
                        :debtorData="debtorData"
                        :creditorData="creditorData"
                        :debtaccounttype="daily_form.debtaccounttype"
                        v-on:addBoxTax="addBoxTax"
                        v-on:deleteDetailTax="deleteDetailTax"
                        v-on:getSumTaxBase="getSumTaxBase"
                      ></TaxForm>
                    </div>
                  </TabPanel>
                </TabView>
              </div>
            </SplitterPanel>
          </Splitter>

          <div class="flex justify-content-between">
            <!-- <div class="mt-4 ml-0">
              <Button
                :disabled="!isChange"
                @click="confirmClearImageDialog = true"
                :label="'ยกเลิกอัพเดท'"
                icon="pi pi-refresh"
                class="w-auto p-button-danger"
              ></Button>
            </div> -->
            <div class="mt-4 ml-0">
              <!-- <Button
                @click="sentOCR"
                label="OCR"
                icon="pi pi-send"
                class="w-auto p-button-info"
              ></Button>
              <Button
                :disabled="documentFormateSelected == null"
                @click="getDataOCR"
                label="GET DATA OCR"
                icon="pi pi-cloud-download"
                class="w-auto p-button-warning ml-2"
              ></Button> -->
            </div>

            <div
              class="mt-4 ml-0 flex align-items-center justify-content-center"
            >
              <Button
                v-if="imageDailyType == 1"
                @click="onSave"
                label="บันทึกรายวัน"
                icon="pi pi-save"
                class="w-auto p-button-success"
              ></Button>
              <Button
                v-if="imageDailyType == 2"
                @click="onSaveIncome"
                label="บันทึกรายได้"
                icon="pi pi-save"
                class="w-auto p-button-success"
              ></Button>
              <Button
                v-if="imageDailyType == 3"
                @click="onSaveExpenses"
                label="บันทึกค่าใช้จ่าย"
                icon="pi pi-save"
                class="w-auto p-button-success"
              ></Button>
            </div>
          </div>
        </div>
        <div class="flex mt-4 align-items-center justify-content-between">
          <div
            class="flex-grow-1 flex align-items-center justify-content-center"
          >
            <Galleria
              :value="data_list"
              thumbnailsPosition="top"
              :showThumbnails="true"
              :numVisible="10"
              v-model:activeIndex="activeIndexList"
              @update:activeIndex="nextImage"
            >
              <!-- <template #item="slotProps"> </template> -->
              <template #thumbnail="slotProps">
                <div class="p-1 cursor-pointer">
                  <div class="p-1 surface-card border-round">
                    <div class="relative mb-1">
                      <div
                        v-if="
                          Utils.checkTypeImage(
                            slotProps.item.imagereferences[0].imageuri
                          )
                        "
                      >
                        <img
                          v-if="slotProps.item.imagereferences.length > 0"
                          :src="slotProps.item.imagereferences[0].imageuri"
                          class="w-full"
                          style="object-fit: cover; height: 100px"
                        />
                      </div>
                      <div
                        v-if="
                          Utils.checkTypePDF(
                            slotProps.item.imagereferences[0].imageuri
                          )
                        "
                      >
                        <img
                          v-if="slotProps.item.imagereferences.length > 0"
                          src="@/assets/pdf-icon.svg"
                          class="w-full"
                          style="object-fit: cover; height: 100px"
                        />
                      </div>

                      <button
                        v-if="slotProps.item.imagereferences.length > 1"
                        type="text"
                        v-ripple
                        class="fadein p-link w-2rem h-2rem bg-blue-500 hover:bg-blue-600 border-circle shadow-2 inline-flex align-items-center justify-content-center absolute transition-colors transition-duration-300"
                        style="top: 0rem; right: 0rem"
                      >
                        <span class="font-bold text-white">{{
                          slotProps.item.imagereferences.length
                        }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </Galleria>
          </div>
        </div>
      </div>
      <DialogForm
        :confirmDialog="confirmRejectDialog"
        :textContent="showContent"
        :textContent2="doc_images.title"
        v-on:close="updateStatusCancel()"
        v-on:confirm="updateStatus()"
      ></DialogForm>
      <DialogForm
        :confirmDialog="confirmRemoveImgDialog"
        :textContent="'ต้องการเปลี่ยนรูปใช่หรือไม่'"
        v-on:close="confirmRemoveImgDialog = false"
        v-on:confirm="
          reLoadImage();
          confirmRemoveImgDialog = false;
        "
      ></DialogForm>
      <DialogForm
        :confirmDialog="confirmBackImageDialog"
        :textContent="'ต้องการยกเลิกข้อมูลใช่หรือไม่'"
        v-on:close="confirmBackImageDialog = false"
        v-on:confirm="
          clearData();
          goList();
          confirmBackImageDialog = false;
        "
      ></DialogForm>
      <DialogForm
        :confirmDialog="confirmClearImageDialog"
        :textContent="'ต้องการล้างข้อมูลใช่หรือไม่'"
        v-on:close="confirmClearImageDialog = false"
        v-on:confirm="
          clearData();
          confirmClearImageDialog = false;
        "
      ></DialogForm>
      <DialogForm
        :confirmDialog="confirmSaveDialog"
        :textContent="conSave"
        v-on:close="confirmSaveDialog = false"
        v-on:confirm="confirmSave"
      ></DialogForm>
      <DialogForm
        :confirmDialog="confirmCompleteDialog"
        :textContent="'บันทึกรูปภาพทั้งหมดเรียบร้อยแล้ว'"
        :textContent2="'กดตกลงเพื่อกลับไปหน้ารายการ'"
        :showCloseButton="false"
        v-on:confirm="confirmComplete"
      ></DialogForm>
      <DialogForm
        :confirmDialog="confirmChangeImageDialog"
        :textContent="conchange"
        :textContent2="connamechange"
        v-on:close="
          confirmChangeImageDialog = false;
          checkActiveIndex();
        "
        v-on:confirm="changeImage(newDocRefImage)"
      ></DialogForm>
      <Dialog
        v-model:visible="dialogOCR"
        appendTo="body"
        :modal="true"
        :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
        :style="{ width: '40vw' }"
        header="DATA RESPONSE OCR"
      >
        <div class="flex flex-column align-items-center">
          <span
            class="flex align-items-center justify-content-center text-cyan-800 mr-3 border-circle mb-3"
            v-if="!isTackingStatus"
          >
            <ProgressSpinner />
          </span>
          <div class="font-medium text-1xl text-900" v-if="!isTackingStatus">
            กำลังประมวลผลข้อมูล OCR
          </div>
        </div>
        <p class="line-height-3 p-0 m-0" v-if="isTackingStatus">
          {{ responseDataOCR.data }}
        </p>
        <template #footer>
          <div class="border-top-1 surface-border pt-3">
            <Button
              icon="pi pi-save"
              :disabled="!isTackingStatus"
              @click="saveDataOCR(responseDataOCR.data)"
              label="นำเข้าข้อมูล"
            ></Button>
          </div>
        </template>
      </Dialog>
    </MainContentWarp>
  </AppLayout>
</template>

<style>
.img-magnifier-container {
  position: relative;
}

.img-magnifier-glass {
  position: absolute;
  border: 1px solid #000;
  border-radius: 40%;
  cursor: none;
  /*Set the size of the magnifier glass:*/
  width: 200px;
  height: 200px;
}

.selectimgDialog .p-dialog-header {
  padding: 10px 15px 10px 15px;
}

.p-galleria-thumbnails-top {
  width: 100% !important;
}

iframe {
  display: block; /* iframes are inline by default */
  background: #ffffff;
  border: none; /* Reset default border */
  height: 100%; /* Viewport-relative units */
  width: 100%;
}
</style>
