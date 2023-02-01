<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { ref, onMounted, computed, onUnmounted, watch } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";
import $ from "jquery";
import JournalForm from "./components/journal_form.vue";
import VatForm from "./components/vat_form.vue";
import TaxForm from "./components/tax_form.vue";
import ImageDataService from "../../services/ImageDataService";

const storeApp = useApp();
const content = ref();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const tabview = ref();
const confirmSaveDialog = ref(false);
const confirmRejectDialog = ref(false);
const onLoad = ref(false);
const selectedImg = ref(true);
const selectedImgUse = ref([]);
const selectSort = ref(0);
const isShowAll = ref(true);
const isShowWait = ref(false);
const isShowUnApprove = ref(false);
const searchItem = ref("");
const limitPage = ref(20);
const activePage = ref(1);
const showContent = ref("");
const showSelectFrom = ref(false);
const showImageList = ref(false);
const totalItemsCount = ref(10);
const data_gallery = ref([]);
const data_list = ref([]);
const selectedImgUrl = ref("");
const selectedImgData = ref({ guidfixed: "", imagereferences: [] });
const rotate = ref(0);

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
const updateMode = ref(false);
const accountChart_detail = ref([]);
const accountBook_detail = ref([]);
const groupAccount_detail = ref([]);
const conSave = "ต้องการบันทึกเอกสารรายวัน";
const conchange = "ต้องการเปลี่ยนรูปภาพ";
const connamechange = "";
const activeIndexList = ref(0);
const imagePreviewStyle = computed({
  get() {
    return {
      transform: "rotate(" + rotate.value + "deg) scale(" + scale.value + ")",
    };
  },
});

const sortOption = ref([
  {
    value: 0,
    name: "ตามชื่อ",
  },
  {
    value: 1,
    name: "ตามลำดับ",
  },
  {
    value: 2,
    name: "รายการล่าสุด",
  },
]);
const firstPage = ref(0);
const isGallery = ref(false);
const showUploadImage = ref(false);
const fileInput = ref(HTMLInputElement);

const daily_form = ref({
  accountdescription: "",
  accountgroup: "",
  accountperiod: "1",
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
const confirmChangeImageDialog = ref(false);
const confirmClearImageDialog = ref(false);
const confirmBackImageDialog = ref(false);
const newDocRefImage = ref("");
const showThumbnails = ref(false);
const modeEdit = ref(false);

const confirmRemoveImgDialog = ref(false);
const divCheckGl = ref(null);
const heightIamgeDivCheckGl = ref(null);
const jobId = ref("");
const showOveray = ref(false);

onUnmounted(() => {
  console.log(
    "unmounted--------------------------------------------------------"
  );

  WsConnectAllImage.value.close();
  WsConnectImage.value.close();
  connection.value.close();
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
watch(vats.value, (newValue, oldValue) => {
  if (vats.value.length > 0) {
    isChange.value = true;
    sendChange(1);
  } else {
    isChange.value = false;
    sendChange(0);
  }
});

watch(taxes.value, (newValue, oldValue) => {
  if (taxes.value.length > 0) {
    isChange.value = true;
    sendChange(1);
  } else {
    isChange.value = false;
    sendChange(0);
  }
});

watch(taxes.value, (newValue, oldValue) => {
  if (taxes.value.length > 0) {
    isChange.value = true;
    sendChange(1);
  } else {
    isChange.value = false;
    sendChange(0);
  }
});

onMounted(() => {
  // set height ifram
  heightIamgeDivCheckGl.value =
    "height:" + divCheckGl.value.offsetHeight + "px";

  jobId.value = route.params.id;
  storeApp.setActivePage("daily");
  storeApp.setActiveChild("daily_images_list");
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
    journaltype: daily_form.value.journaltype,
    bookcode: daily_form.value.bookcode,
    exdocrefdate: daily_form.value.exdocrefdate,
    exdocrefno: daily_form.value.exdocrefno,
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
});

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

    //  console.log("AllImageUsed ", AllImageUsed.value);
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

              selectedImg.value = true;
              waitForImages.value = false;

              disableAllinput(res.data.imagereferences[0].isreject);
              setTimeout(() => {
                checkActiveIndex();
              }, 100);
            }
          }
        })
        .catch((err) => {
          // console.log(err);
        });
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
  //console.log(waitForImages.value);
  setTimeout(() => {
    if (waitForImages.value || data == true) {
      $("#panelForm3 :input").prop("disabled", true);
      $("#panelForm3 .p-dropdown").prop("disabled", true);
    } else {
      $("#panelForm3 :input").prop("disabled", false);
      $("#panelForm3 .p-dropdown").prop("disabled", false);
    }
  }, 500);
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

function sendChange(data) {
  connection.value.send(
    JSON.stringify({ event: "change", payload: { status: data } })
  );
}

function goList() {
  removeSelectImg();

  setTimeout(() => {
    router.push({
      name: "images_job_daily_detail",
      params: { id: jobId.value },
    });
  }, 100);
}

async function confirmSave() {
  //console.log(daily_form.value);
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

async function onSave() {
  // console.log(daily_form.value);
  // console.log(taxes.value);
  // console.log(vats.value);
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
  if (daily_form.value.accountperiod == "") {
    errorCount += 1;
    daily_form_valid.value.accountperiod = true;
  } else {
    daily_form_valid.value.accountperiod = false;
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

  var sumCredit = 0;
  var sumDebit = 0;
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

    // if (ele.accountcode == "") {
    //   errorCount += 1;
    //   toast.add({
    //     severity: "error",
    //     summary: "ไม่สามารถทำรายการได้",
    //     detail: "กรุณาเลือกรหัสบัญชี รายการที่ " + (index + 1),
    //     life: 4000,
    //   });
    // }
    // if (ele.accountname == "") {
    //   errorCount += 1;
    //   toast.add({
    //     severity: "error",
    //     summary: "ไม่สามารถทำรายการได้",
    //     detail: "กรุณาเลือกรหัสบัญชี รายการที่" + (index + 1),
    //     life: 4000,
    //   });
    // }

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

  // ลบ row accountcode ที่เป็นค่าว่าง
  deletIndex.forEach((ele, index) => {
    let idx = ele - index;
    daily_form.value.journaldetail.splice(idx, 1);
  });
  // console.log(sumCredit);
  // console.log(sumDebit);
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
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณาป้อนข้อมูลให้ครบ",
      life: 4000,
    });
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
    daily_form.value.accountperiod = parseInt(
      daily_form.value.accountperiod.toString()
    );
    daily_form.value.accountyear = parseInt(daily_form.value.accountyear);
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
  selectedImg.value = false;
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
        selectedImg.value = false;
        selectedImgUrl.value = "";
      }
    })
    .catch((err) => {
      selectedImgData.value = { guidfixed: "", imagereferences: [] };
      selectedImg.value = false;
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
}
function addColumn(index) {
  heightIamgeDivCheckGl.value =
    "height : " + divCheckGl.value.offsetHeight + "px";

  daily_form.value.journaldetail.splice(index + 1, 0, {
    index: index + 1,
    accountcode: "",
    accountname: "",
    debitamount: 0,
    creditamount: 0,
  });
}

function onRowReorder(data) {
  daily_form.value.journaldetail = data;
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
  vats.value.push({
    vattype: 0,
    vatdate: Utils.getDateTime(),
    vatdocno: "",
    vatperiod: "1",
    vatyear: parseInt(Utils.getYear().toString()) + 543,
    vatbase: 0,
    vatrate: 0,
    vatamount: 0,
    exceptvat: 0,
    vatmode: 0,
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
  taxes.value.push({
    taxdocno: "",
    taxdate: Utils.getDateTime(),
    custname: "",
    custtype: 0,
    custtaxid: "",
    taxtype: 0,
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

  daily_form.value.accountdescription = "";
  daily_form.value.accountgroup = "";
  daily_form.value.accountperiod = "1";
  daily_form.value.accountyear = parseInt(Utils.getYear().toString()) + 543;
  daily_form.value.amount = "";
  daily_form.value.batchId = "";
  daily_form.value.docdate = Utils.getDateTime();
  daily_form.value.docno = Utils.getDocNoDate("JO");
  daily_form.value.exdocrefdate = "";
  daily_form.value.exdocrefno = "";
  daily_form.value.bookcode = "";
  daily_form.value.journaldetail = [
    {
      accountcode: "",
      accountname: "",
      debitamount: 0,
      creditamount: 0,
    },
  ];
  daily_form.value.parid = "0000000";

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

function nextImageOnSave(old_img) {
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

  if (data_list.value.length > activeIndexList.value) {
    console.log(data_list.value[activeIndexList.value].guidfixed);
    useImage(data_list.value[activeIndexList.value].guidfixed);
  }

  removeImgFromList(old_img);
}
function removeImgFromList(data) {
  console.log(data);

  console.log(data_list.value);
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

// Update status
async function rejectImg() {
  let status = {
    status: 4,
  };
  try {
    const res = await ImageDataService.putDocumentImageGroupStatus(
      doc_images.value.guidfixed,
      status
    );
    if (res.success) {
      confirmRejectDialog.value = false;
      removeSelectImg();
      setTimeout(() => {
        nextImageOnSave(doc_images.value.guidfixed);
        clearData();
      }, 200);
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
          v-if="!onLoad"
        />
        <div
          class="flex align-items-center justify-content-center"
          style="min-height: 60vh"
          v-if="onLoad"
        >
          <ProgressSpinner animationDuration="10s" />
        </div>
        <div
          class="surface-card p-4 shadow-2 border-round p-fluid"
          v-if="!onLoad"
        >
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
              <div>
                <div class="flex justify-content-between align-items-right">
                  <div>
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
                  <div>
                    <Button
                      label="ไม่ผ่าน"
                      class="p-button-danger p-b mr-1"
                      @click="confirmRejectDialog = true"
                    />
                  </div>
                  <!-- <div>
                   
                    <Button v-if="waitForImages" icon="pi pi-refresh" class="p-button-text text-blue-500"
                      @click="reLoadImage" />
                    <Button v-if="selectedImg && selectedImgUrl != ''" icon="pi pi-refresh" class="p-button-text"
                      @click="
                        confirmRemoveImgDialog = true;

                        removeMagnify();
                      " />
                  </div> -->
                </div>

                <KeepAlive>
                  <div id="galleriabox" v-if="selectedImg && !waitForImages">
                    <Galleria
                      :value="doc_images.imagereferences"
                      :thumbnailsPosition="'top'"
                      :showThumbnails="showThumbnails"
                      v-model:activeIndex="activeIndex"
                      :numVisible="
                        doc_images.imagereferences.length > 5
                          ? 10
                          : doc_images.imagereferences.length
                      "
                      @update:activeIndex="resetZoomImage()"
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
                                class="ml-2 mt-2"
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
                              <iframe
                                :name="slotProps.item.imageuri"
                                :src="
                                  '/document_images/components/zoom?uri=' +
                                  slotProps.item.imageuri
                                "
                                class="static"
                              >
                              </iframe>
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
                        <img
                          :src="slotProps.item.imageuri"
                          style="width: 40px; height: 40px"
                        />
                      </template>
                      <template #footer> </template>
                    </Galleria>
                  </div>
                </KeepAlive>
              </div>
            </SplitterPanel>
            <SplitterPanel @click="removeMagnify()" id="panelForm3" :size="50">
              <div ref="divCheckGl">
                <TabView class="tabview-custom" ref="tabview">
                  <TabPanel>
                    <template #header>
                      <i class="pi pi-book mr-1"></i>
                      <span> ข้อมูลรายวัน</span>
                    </template>
                    <div v-if="!onLoad">
                      <JournalForm
                        :daily_form="daily_form"
                        :daily_form_valid="daily_form_valid"
                        :accountChart_detail="accountChart_detail"
                        :accountBook_detail="accountBook_detail"
                        :groupAccount_detail="groupAccount_detail"
                        v-on:ImportDaliy="ImportDaliy"
                        v-on:deleteDetail="deleteDetail"
                        v-on:addColumn="addColumn"
                        v-on:onRowReorder="onRowReorder"
                        v-on:selectAccount="selectAccount"
                      >
                      </JournalForm>
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <template #header>
                      <i class="pi pi-wallet mr-1"></i>
                      <span> ข้อมูลภาษี</span>
                    </template>
                    <div v-if="!onLoad">
                      <VatForm
                        :vats="vats"
                        :vats_valid="vats_valid"
                        v-on:addBoxVat="addBoxVat"
                        v-on:deleteDetailVat="deleteDetailVat"
                        v-on:calVatAmount="calVatAmount"
                        v-on:checkDateFormat="checkDateFormat"
                        v-on:setBranch="setBranch"
                      ></VatForm>
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <template #header>
                      <i class="pi pi-wallet mr-1"></i>
                      <span> ภาษีถูกหัก/หัก​ ณ ที่จ่าย</span>
                    </template>
                    <div v-if="!onLoad">
                      <TaxForm
                        :taxes="taxes"
                        :taxes_valid="taxes_valid"
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
            <div class="mt-4 ml-0">
              <Button
                :disabled="!isChange"
                @click="confirmClearImageDialog = true"
                :label="'ยกเลิกอัพเดท'"
                icon="pi pi-refresh"
                class="w-auto p-button-danger"
              ></Button>
            </div>
            <div class="mt-4 ml-0">
              <Button
                @click="onSave"
                label="บันทึกรายวัน"
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
              :thumbnailsPosition="'top'"
              :showThumbnails="true"
              :numVisible="6"
              v-model:activeIndex="activeIndexList"
              @update:activeIndex="nextImage"
            >
              <template #thumbnail="slotProps">
                <div class="p-1 cursor-pointer">
                  <div class="p-1 surface-card border-round">
                    <div class="relative mb-1">
                      <img
                        v-if="slotProps.item.imagereferences.length > 0"
                        :src="slotProps.item.imagereferences[0].imageuri"
                        class="w-full"
                        style="object-fit: cover; height: 100px"
                      />

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
        :textContent="'ต้องการยกเลิกรูปภาพ'"
        :textContent2="doc_images.title"
        v-on:close="confirmRejectDialog = false"
        v-on:confirm="rejectImg()"
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
        :confirmDialog="confirmChangeImageDialog"
        :textContent="conchange"
        :textContent2="connamechange"
        v-on:close="
          confirmChangeImageDialog = false;
          checkActiveIndex();
        "
        v-on:confirm="changeImage(newDocRefImage)"
      ></DialogForm>
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
