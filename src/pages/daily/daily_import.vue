<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { ref, onMounted } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";
import XLSX from "xlsx";
import JournalForm from "./components/journal_form.vue";
import VatForm from "./components/vat_form.vue";
import TaxForm from "./components/tax_form.vue";
import DialogForm from "@/components/form/DialogForm.vue";
const storeApp = useApp();

const router = useRouter();
const toast = useToast();
const myFiles = ref();
const confirmSaveDialog = ref(false);
const textContent = ref("ต้องการนำเข้าข้อมูลรายวัน");
const import_form = ref([]);
const error_message = ref([]);
const accountChart_detail = ref([]);
const accountBook_detail = ref([]);
const groupAccount_detail = ref([]);
const taxes_valid = ref([
  {
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  },
]);
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

onMounted(() => {
  storeApp.setPageTitle("นำเข้าข้อมูลรายวัน");
  storeApp.setActivePage("daily");
  storeApp.setActiveChild("daily_import");

  getAccountChart();
  getJournalBook();
  getAccountGroup();
});

function goList() {
  router.push({ name: "dailyList" });
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

function selectBookDetail(data) {
  var ele = [];
  ele = accountBook_detail.value.filter((val) => val.code == data);

  return ele;
}
function selectAccountGroup(data) {
  var ele = [];
  ele = groupAccount_detail.value.filter((val) => val.code == data);

  return ele;
}

function selectAccount(data) {
  var ele = [];
  ele = accountChart_detail.value.filter((val) => val.accountcode == data);

  return ele;
}

async function confirmSave() {
  var post_import = [];
  console.log(import_form.value);
  await import_form.value.forEach((ele) => {
    var sumDebit = 0;
    ele.import_daily.journaldetail.forEach((detail) => {
      var debit = 0;
      if (detail.debitamount != "") {
        debit = parseFloat(detail.debitamount);
        sumDebit += debit;
      }
    });

    var from_input = {
      accountdescription: ele.import_daily.accountdescription,
      accountgroup: ele.import_daily.accountgroup,
      accountperiod: ele.import_daily.accountperiod,
      accountyear: ele.import_daily.accountyear,
      journaltype: parseInt(ele.import_daily.journaltype),
      amount: sumDebit,
      batchId: ele.import_daily.batchId,
      docdate: Utils.getFormatDateTime(ele.import_daily.docdate),
      docno: ele.import_daily.docno,
      bookcode: ele.import_daily.bookcode,
      journaldetail: ele.import_daily.journaldetail,
      parid: ele.import_daily.parid,
      vats: [],
      taxes: [],
    };

    if (ele.import_vats.length > 0) {
      if (ele.import_vats[0].vatdocno != "") {
        from_input.vats = ele.import_vats;
      }
    }
    if (ele.import_taxs.length > 0) {
      if (ele.import_taxs[0].taxdocno != "") {
        from_input.taxes = ele.import_taxs;
      }
    }
    post_import.push(from_input);
  });

  console.log(post_import);

  MasterdataService.ImportGLJournal(post_import)
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
          router.push({ name: "dailyList" });
        }, 1500);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

async function onSave() {
  // var isPass = await verifyData();
  // var isTaxPass = await verifyTax();
  // var isVatPass = await verifyVat();
  // if (isPass && isTaxPass && isVatPass) {
  //   confirmSaveDialog.value = true;
  // }
  if (error_message.value.length == 0) {
    confirmSaveDialog.value = true;
  }
}

function ImportFile() {
  import_form.value = [];
  var config = { raw: true, type: "string", range: 1 };
  var reader = new FileReader();
  reader.readAsArrayBuffer(myFiles.value.files[0]);
  reader.onload = function (e) {
    var data = new Uint8Array(reader.result);
    var wb = XLSX.read(data, { type: "array" });
    var firstSheetName = wb.SheetNames[0];
    var worksheet = wb.Sheets[firstSheetName];
    var results = XLSX.utils.sheet_to_json(worksheet, config);
    // console.log(worksheet);

    console.log(results);
    var error_msg = [];
    var details = [];
    for (let index = 0; index < results.length; index++) {
      console.log(results[index]);

      var import_daily_json = {
        accountdescription: "",
        accountgroup: "",
        accountperiod: "",
        accountyear: "",
        journaltype: "0",
        amount: "",
        batchId: "",
        docdate: "",
        docno: "",
        bookcode: "",
        journaldetail: [],
        parid: "0000000",
      };

      var import_vats_json = {
        vatdocno: "",
        vattype: 0,
        vatdate: "",
        vatperiod: "",
        vatyear: "",
        vatbase: 0,
        vatrate: 0,
        vatamount: 0,
        exceptvat: 0,
        vatmode: 0,
        vatsubmit: false,
        custcode: "",
        custtaxid: "",
        organization: 0,
        branchcode: "00000",
        remark: "",
      };

      var import_taxs_json = {
        taxdocno: "",
        taxdate: "",
        custname: "",
        custtype: "0",
        custtaxid: "",
        taxtype: 0,
        address: "",
        taxamount: "",
        details: [
          {
            description: "",
            taxbase: 0,
            taxrate: 0,
            taxamount: 0,
          },
          {
            description: "",
            taxbase: 0,
            taxrate: 0,
            taxamount: 0,
          },
        ],
      };

      var journal = [];
      var journal_head = [];

      JSON.parse(JSON.stringify(results[index]), (key, value) => {
        //console.log("key " + key);
        if (key == "ACCGROUP") {
          var accgroup = selectAccountGroup(value);
          //  console.log(accgroup);
          import_daily_json.accountgroup = accgroup.length > 0 ? accgroup[0].code : "";
          console.log("ACCGROUP ", import_daily_json.accountgroup);
        }
        if (key == "PERIOD") {
          import_daily_json.accountperiod = value;
        }
        if (key == "YEAR") {
          import_daily_json.accountyear = parseInt(value);
        }

        if (key == "VATISADD") {
          if (value == "1") {
            import_vats_json.vatsubmit = true;
          }
        }
        if (key == "BRANCHNO") {
          import_vats_json.branchcode = value;
        }
        if (key == "ORGTYPE") {
          import_vats_json.organization = parseInt(value);
        }
        if (key == "WHTTOTAL") {
          import_taxs_json.taxamount = parseFloat(value);
        }
        if (key == "CUSTTYPE") {
          import_taxs_json.custtype = parseInt(value);
        }
        if (key == "CUSTNAME") {
          import_vats_json.custname = value;
          import_taxs_json.custname = value;
        }

        if (key == "DESC") {
          import_daily_json.accountdescription = value;
        }
        if (key == "NO") {
          console.log(value);
          import_daily_json.docno = value;
        }
        if (key == "DATE") {
          import_daily_json.docdate = Utils.getDateTimeFromDate(value);
        }
        if (key == "EXCEPTVAT") {
          import_vats_json.exceptvat = parseFloat(value);
        }

        if (key == "CUSTTAXID") {
          import_taxs_json.custtaxid = value;
        }
        if (key == "CUSTADDR") {
          import_taxs_json.address = value;
        }
        if (key == "BOOK") {
          var accbook = selectBookDetail(value);

          import_daily_json.bookcode = accbook.length > 0 ? accbook[0].code : "";
          console.log("BOOK ", import_daily_json.bookcode);
        }
        if (key == "TYPE") {
          import_daily_json.journaltype = value.toString();
        }
        if (key == "Reference doc") {
          import_daily_json.batchId = value;
        }
        if (key == "VATMONTH") {
          import_vats_json.vatperiod = value;
        }
        if (key == "VATYEAR") {
          import_vats_json.vatyear = parseInt(value);
        }
        if (key == "CUSTTAXID") {
          import_vats_json.custtaxid = value;
        }

        if (key == "CUSTTAXID") {
          import_taxs_json.custtaxid = value;
        }
        if (key == "VATDATE") {
          import_vats_json.vatdate = Utils.getDateTimeFromDate(value);
        }
        if (key == "VATNO") {
          import_vats_json.vatdocno = value;
        }
        if (key == "VATTYPE") {
          import_vats_json.vattype = value;
        }
        if (key == "VATBASE") {
          import_vats_json.vatbase = parseFloat(value);
        }
        if (key == "VATRATE") {
          import_vats_json.vatrate = parseFloat(value);
        }
        if (key == "VATMODE") {
          import_vats_json.vatmode = value;
        }
        if (key == "VATVALUE") {
          import_vats_json.vatamount = parseFloat(value);
        }

        if (key == "WHTDATE") {
          import_taxs_json.taxdate = Utils.getDateTimeFromDate(value);
        }

        if (key == "WHTNO") {
          import_taxs_json.taxdocno = value;
        }

        if (key == "WHTRATE") {
          import_taxs_json.details[0].taxrate = parseFloat(value);
        }

        if (key == "WHTRATE2") {
          import_taxs_json.details[1].taxrate = parseFloat(value);
        }
        if (key == "WHTBASE") {
          import_taxs_json.details[0].taxbase = parseFloat(value);
        }
        if (key == "WHTBASE2") {
          import_taxs_json.details[1].taxbase = parseFloat(value);
        }
        if (key == "WHTDESC") {
          import_taxs_json.details[0].description = value;
        }
        if (key == "WHTDESC2") {
          import_taxs_json.details[1].description = value;
        }
        if (key == "WHTVALUE") {
          import_taxs_json.details[0].taxamount = parseFloat(value);
        }
        if (key == "WHTVALUE2") {
          import_taxs_json.details[1].taxamount = parseFloat(value);
        }
        if (key == "WHTMODE") {
          import_taxs_json.taxtype = value;
        }

        if (key.search("C_") == 0) {
          var accountdetail = [];
          accountdetail = selectAccount(key.split("C_")[1]);

          journal_head.push(
            accountdetail.length > 0 ? accountdetail[0].accountcode : key
          );
          journal.push({
            accountcode: accountdetail.length > 0 ? accountdetail[0].accountcode : key,
            accountname:
              accountdetail.length > 0
                ? accountdetail[0].accountname
                : key.split("C_")[1],
            debitamount: 0,
            creditamount: value,
          });
        }

        if (key.search("D_") == 0) {
          var accountdetail = [];
          accountdetail = selectAccount(key.split("D_")[1]);

          journal_head.push(
            accountdetail.length > 0 ? accountdetail[0].accountcode : key
          );
          journal.push({
            accountcode: accountdetail.length > 0 ? accountdetail[0].accountcode : key,
            accountname:
              accountdetail.length > 0
                ? accountdetail[0].accountname
                : key.split("D_")[1],
            debitamount: value,
            creditamount: 0,
          });
        }
      });
      console.log(journal_head);
      console.log(remove_duplicates(journal_head));

      var res = groupByKey(journal, "accountcode");

      //console.log(res);
      remove_duplicates(journal_head).forEach((data) => {
        console.log(data);
        if (res[data].length == 1) {
          import_daily_json.journaldetail.push({
            accountcode: res[data][0].accountcode,
            accountname: res[data][0].accountname,
            debitamount: parseFloat(res[data][0].debitamount),
            creditamount: parseFloat(res[data][0].creditamount),
          });

          //console.log(res[data][0]);
        } else if (res[data].length > 1) {
          var sumdebit = 0;
          var sumcredit = 0;
          res[data].forEach((el) => {
            sumdebit += parseFloat(el.debitamount);
            sumcredit += parseFloat(el.creditamount);
          });
          import_daily_json.journaldetail.push({
            accountcode: res[data][0].accountcode,
            accountname: res[data][0].accountname,
            debitamount: sumdebit,
            creditamount: sumcredit,
          });
        }
      });

      var sum_Credit = 0.0;
      var sum_Debit = 0.0;
      import_daily_json.journaldetail.forEach((jr) => {
        var credit = 0;
        var debit = 0;
        if (jr.creditamount == null) {
          jr.creditamount = 0;
        }
        if (jr.creditamount.toString() != "") {
          credit = parseFloat(jr.creditamount);
          sum_Credit += parseFloat(credit);
        }
        if (jr.debitamount == null) {
          jr.debitamount = 0;
        }
        if (jr.debitamount.toString() != "") {
          debit = parseFloat(jr.debitamount);
          sum_Debit += parseFloat(debit);
          console.log("debit " + parseFloat(jr.debitamount));
        }
      });
      sum_Credit = sum_Credit.toFixed(2);
      sum_Debit = sum_Debit.toFixed(2);
      if (sum_Credit != sum_Debit) {
        error_msg.push({
          name: "ยอดเดบิต และ เครดิต ไม่เท่ากัน",
          docno: import_daily_json.docno,
          tab: 1,
        });
      }

      if (import_daily_json.docdate == "") {
        error_msg.push({
          name: "เอกสารวันที่",
          docno: import_daily_json.docno,
          tab: 1,
        });
      }

      if (import_daily_json.accountperiod == "") {
        error_msg.push({
          name: "งวดบัญชี",
          docno: import_daily_json.docno,
          tab: 1,
        });
      }

      if (import_daily_json.accountyear == "") {
        error_msg.push({
          name: "ปีบัญชี",
          docno: import_daily_json.docno,
          tab: 1,
        });
      }
      if (import_daily_json.bookcode == "") {
        error_msg.push({
          name: "สมุดรายวัน",
          docno: import_daily_json.docno,
          tab: 1,
        });
      }

      console.log(import_daily_json.journaldetail);

      import_daily_json.journaldetail.forEach((ele) => {
        if (
          ele.accountcode.search("D_") == 0 ||
          ele.accountcode.search("C_") == 0 ||
          ele.accountcode == ""
        ) {
          error_msg.push({
            name: "ไม่พบรายละเอียดรายการบัญชีหรือรายการซ้ำ " + ele.accountname,
            docno: import_daily_json.docno,
            tab: 1,
          });
        }
      });

      if (import_vats_json.vatdocno != "") {
        if (import_vats_json.vatdate == "") {
          error_msg.push({
            name: "วันที่ใบกำกับ",
            docno: import_daily_json.docno,
            tab: 2,
          });
        }
        if (import_vats_json.vatperiod.toString() == "") {
          error_msg.push({
            name: "เดือนภาษี",
            docno: import_daily_json.docno,
            tab: 2,
          });
        }
        if (import_vats_json.vatyear.toString() == "") {
          error_msg.push({
            name: "ปีภาษี",
            docno: import_daily_json.docno,
            tab: 2,
          });
        }
        if (import_vats_json.vatbase.toString() == "") {
          error_msg.push({
            name: "ฐานภาษี",
            docno: import_daily_json.docno,
            tab: 2,
          });
        }
        if (import_vats_json.vatrate.toString() == "") {
          error_msg.push({
            name: "อัตรา",
            docno: import_daily_json.docno,
            tab: 2,
          });
        }
        if (import_vats_json.vatamount.toString() == "") {
          error_msg.push({
            name: "ยอดภาษี",
            docno: import_daily_json.docno,
            tab: 2,
          });
        }
        // if (import_vats_json.exceptvat.toString() == "") {
        //   error_msg.push({
        //     name: "ยอดยกเว้นภาษี",
        //     docno: import_daily_json.docno,
        //     tab: 2,
        //   });
        // }
        // if (import_vats_json.custcode == "") {
        //   error_msg.push({
        //     name: "ชื่อ",
        //     docno: import_daily_json.docno,
        //     tab: 2,
        //   });
        // }
        // if (import_vats_json.custtaxid == "") {
        //   error_msg.push({
        //     name: "รหัสประจำตัว",
        //     docno: import_daily_json.docno,
        //     tab: 2,
        //   });
        // }
        // if (import_vats_json.branchcode == "") {
        //   error_msg.push({
        //     name: "ลำดับที่สาขา",
        //     docno: import_daily_json.docno,
        //     tab: 2,
        //   });
        // }
      }
      if (import_taxs_json.taxdocno != "") {
        if (import_taxs_json.taxdate == "") {
          error_msg.push({
            name: "วันที่หัก ณ ที่จ่าย",
            docno: import_taxs_json.taxdocno,
            tab: 3,
          });
        }
        // if (import_taxs_json.custname == "") {
        //   error_msg.push({
        //     name: "ชื่อ",
        //     docno: import_taxs_json.taxdocno,
        //     tab: 3,
        //   });
        // }
        // if (import_taxs_json.custtaxid == "") {
        //   error_msg.push({
        //     name: "เลขประจำตัวผู้เสียภาษี",
        //     docno: import_taxs_json.taxdocno,
        //     tab: 3,
        //   });
        // }

        if (import_taxs_json.details[0].description == "") {
          error_msg.push({
            name: "รายละเอียด 1",
            docno: import_taxs_json.taxdocno,
            tab: 3,
          });
        }

        if (
          import_taxs_json.details[0].description != "" &&
          import_taxs_json.details[0].description != undefined
        ) {
          if (
            import_taxs_json.details[0].taxamount == "" ||
            import_taxs_json.details[0].taxamount == undefined
          ) {
            import_taxs_json.details[0].taxamount = 0;
          }
        }

        if (
          import_taxs_json.details[1].description != "" &&
          import_taxs_json.details[1].description != undefined
        ) {
          if (
            import_taxs_json.details[1].taxamount == "" ||
            import_taxs_json.details[1].taxamount == undefined
          ) {
            import_taxs_json.details[1].taxamount = 0;
          }
        }

        if (
          parseFloat(import_taxs_json.details[0].taxamount) +
            parseFloat(import_taxs_json.details[1].taxamount) !=
          parseFloat(import_taxs_json.taxamount)
        ) {
          error_msg.push({
            name: "ยอดรวมภาษีหัก ณ ที่จ่าย ไม่สัมพันธ์กัน",
            docno: import_taxs_json.taxdocno,
            tab: 3,
          });
        }
      }

      details.push({
        import_daily: import_daily_json,
        import_vats: [import_vats_json],
        import_taxs: [import_taxs_json],
      });

      //  if()
      // details.push({
      //   index: index,
      //   accountcode: val_1,
      //   accountname: val_2,
      //   debitamount: val_3,
      //   creditamount: val_4,
      // });
    }

    setTimeout(() => {
      error_message.value = error_msg;
      console.log(details);
      //  console.log(error_message.value);
      if (error_message.value.length == 0) {
        error_message.value = [];
        import_form.value = details;
        //  console.log(import_form.value);
      }
    }, 500);
    //account_detail.value = details;
    // generateIndex();
  };
  reader.onerror = function (e) {
    // console.log(e);
  };
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
function groupByKey(array, key) {
  return array.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, {
      [obj[key]]: (hash[obj[key]] || []).concat(obj),
    });
  }, {});
}
function isPositiveInteger(val) {
  let str = String(val);
  str = str.trim();
  if (!str) {
    return false;
  }
  str = str.replace(/^0+/, "") || "0";
  var n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n >= 0;
}
function onClose() {
  confirmSaveDialog.value = false;
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-ground px-2 py-2">
        <div class="py-1 flex">
          <div class="flex">
            <FileUpload
              mode="basic"
              name="input file"
              accept=".xls,.xlsx"
              ref="myFiles"
              :customUpload="true"
              @change="ImportFile()"
              class="p-button-plain p-button-primary p-button-sm"
              chooseLabel="นำเข้าไฟล์"
            >
            </FileUpload>
          </div>
          <div class="flex ml-2">
            <Button
              v-if="import_form.length > 0 && error_message.length == 0"
              @click="onSave"
              label="บันทึกรายวัน"
              icon="pi pi-save"
              class="w-auto p-button-success p-button-sm"
            ></Button>
          </div>
        </div>
        <div class="py-0 flex" v-if="import_form.length > 0">
          <div class="flex">
            <p>จำนวน {{ import_form.length }} รายการ</p>
          </div>
        </div>
        <div
          class="surface-card p-4 shadow-2 border-round p-fluid my-2"
          v-for="(data, index) in import_form"
          :key="index"
        >
          <div v-if="import_form.length > 0">
            <!--            <FormMain :daily_form="data.import_daily" :daily_form_valid="daily_form_valid" :vats="data.import_vats"
              :vats_valid="vats_valid" :taxes="data.import_taxs" :taxes_valid="taxes_valid" :isUpdate="true"
              :id="'fastimport'"></FormMain>
-->

            <TabView class="tabview-custom" ref="tabview">
              <TabPanel>
                <template #header>
                  <i class="pi pi-book mr-1"></i>
                  <span> ข้อมูลรายวัน</span>
                </template>
                <div>
                  <JournalForm
                    :daily_form="data.import_daily"
                    :daily_form_valid="daily_form_valid"
                    :accountChart_detail="accountChart_detail"
                    :accountBook_detail="accountBook_detail"
                    :groupAccount_detail="groupAccount_detail"
                    :isUpdate="true"
                    :id="'fastimport'"
                  ></JournalForm>
                </div>
              </TabPanel>
              <TabPanel>
                <template #header>
                  <i class="pi pi-wallet mr-1"></i>
                  <span> ข้อมูลภาษี</span>
                </template>
                <div>
                  <VatForm
                    :vats="data.import_vats"
                    :vats_valid="vats_valid"
                    :isUpdate="true"
                    :id="'fastimport'"
                  >
                  </VatForm>
                </div>
              </TabPanel>
              <TabPanel>
                <template #header>
                  <i class="pi pi-wallet mr-1"></i>
                  <span> ภาษีถูกหัก/หัก​ ณ ที่จ่าย</span>
                </template>
                <div>
                  <TaxForm
                    :taxes="data.import_taxs"
                    :taxes_valid="taxes_valid"
                    :isUpdate="true"
                    :id="'fastimport'"
                  >
                  </TaxForm>
                </div>
              </TabPanel>
            </TabView>
          </div>
        </div>

        <div
          class="surface-card p-4 shadow-2 border-round p-fluid my-2"
          v-if="error_message.length > 0"
        >
          <h3>ไม่สามารถทำรายการได้ กรุณาตรวจสอบข้อมูล</h3>
          <div v-for="(data, index) in error_message" :key="index">
            <p>
              {{
                data.tab == 1
                  ? "ข้อมูลรายวัน "
                  : data.tab == 2
                  ? "ข้อมูลภาษี"
                  : "ข้อมูลภาษีหัก ณ ที่จ่าย"
              }}
              : {{ data.name }} เอกสารเลขที่ : {{ data.docno }}
            </p>
          </div>
        </div>
      </div>
      <DialogForm
        :confirmDialog="confirmSaveDialog"
        :textContent="textContent"
        v-on:close="onClose"
        v-on:confirm="confirmSave"
      ></DialogForm>
      <!-- <Dialog v-model:visible="confirmSaveDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
          <span>ต้องการบันทึกเอกสารรายวันใช่หรือไม่ ?</span>
        </div>
        <template #footer>
          <Button label="No" icon="pi pi-times" class="p-button-text" @click="confirmSaveDialog = false" />
          <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="confirmSave" />
        </template>
      </Dialog> -->
    </MainContentWarp>
  </AppLayout>
</template>
