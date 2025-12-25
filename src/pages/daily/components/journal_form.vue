<script setup>
import { ref, onMounted, computed, watch } from "vue";
import XLSX from "xlsx";
import Utils from "@/utils/";
import DatePicker from "@/components/widget/DatePicker.vue";
import MasterdataService from "@/services/MasterdataService";
import AccountPeriodDataService from "@/services/AccountPeriodService";
import TextInputNumber from "@/components/widget/TextInputNumber.vue";
import TextAutoComplete from "@/components/widget/TextAutoComplete.vue";
import $ from "jquery";
import { useToast } from "primevue/usetoast";
import dayjs from "dayjs";
import DialogWarringPeriod from "@/components/DialogWarringPeriod.vue";

const tempCheckDate = ref(null);
const toast = useToast();
const myFiles = ref();
const deleteDetailDialog = ref(false);
const update_mode = ref(false);
const detail = ref();
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const filteredCountries = ref();
const accountChart_detail = ref([]);
const warringAccountperiod = ref(false);
const useCust = ref(0);
const sumTableDebit = computed({
  get() {
    let sum = 0;
    props.daily_form.journaldetail.forEach((ele) => {
      if (ele.debitamount == null) {
        ele.debitamount = 0;
      }
      sum += parseFloat(ele.debitamount);
    });
    return sum.toFixed(2);
  },
});
const sumTableCredit = computed({
  get() {
    var sum = 0;
    props.daily_form.journaldetail.forEach((ele) => {
      if (ele.creditamount == null) {
        ele.creditamount = 0;
      }
      sum += parseFloat(ele.creditamount);
    });
    return sum.toFixed(2);
  },
});

// Update the difference computation to be debit - credit
const difference = computed({
  get() {
    const debit = parseFloat(sumTableDebit.value);
    const credit = parseFloat(sumTableCredit.value);
    return (debit - credit).toFixed(2); // Changed from Math.abs to show the actual difference
  },
});

const props = defineProps({
  daily_form: Object,
  daily_form_valid: Object,
  isUpdate: Boolean,
  accountChart_detail: Array,
  accountBook_detail: Array,
  document_formate: Array,
  groupAccount_detail: Array,
  customer_detail: Array,
  creditor_detail: Array,
  id: String,
  income_expenses_mode: Boolean,
});

const emit = defineEmits([
  "reload",
  "ImportDaliy",
  "deleteDetail",
  "addColumn",
  "onRowReorder",
  "selectAccount",
  "setAccountPeriod",
  "selectDucumentFormat",
  "debtorSelected", // เพิ่ม emit สำหรับส่งข้อมูลลูกหนี้
  "creditorSelected", // เพิ่ม emit สำหรับส่งข้อมูลเจ้าหนี้
  "clearCreditor",
  "clearDebtor",
]);

onMounted(async () => {
  checkAccountPeriod(props.daily_form.docdate);
});

watch(
  () => props.daily_form.debtor,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      console.log("Debtor changed to:", newVal);
      // เรียกใช้ API ทั้งในโหมดสร้างใหม่และแก้ไข
      fetchDebtorData(newVal);
    } else if (newVal === null && oldVal !== null) {
      // เมื่อค่าเปลี่ยนจากมีค่าเป็น null = กดปุ่มล้างค่า
      console.log("Debtor cleared");
      emit("clearDebtor", null);
    }
  }
);

watch(
  () => props.daily_form.creditor,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      console.log("Creditor changed to:", newVal);
      // เรียกใช้ API ทั้งในโหมดสร้างใหม่และแก้ไข
      fetchCreditorData(newVal);
    } else if (newVal === null && oldVal !== null) {
      // เมื่อค่าเปลี่ยนจากมีค่าเป็น null = กดปุ่มล้างค่า
      console.log("Creditor cleared");
      emit("clearCreditor", null);
    }
  }
);

// ปรับปรุงฟังก์ชันดึงข้อมูลลูกหนี้
function fetchDebtorData(id) {
  if (!id) return;

  console.log("Fetching debtor data for CODE:", id);
  MasterdataService.getDebtorByCode(id)
    .then((res) => {
      console.log("Debtor API response:", res);
      if (res.data) {
        // ส่งข้อมูลลูกหนี้ไปยัง component หลัก
        emit("debtorSelected", res.data);
      }
    })
    .catch((err) => {
      console.error("Error fetching debtor data:", err);
    });
}

// ปรับปรุงฟังก์ชันดึงข้อมูลเจ้าหนี้
function fetchCreditorData(id) {
  if (!id) return;

  console.log("Fetching creditor data for CODE:", id);
  MasterdataService.getCreditorByCode(id)
    .then((res) => {
      console.log("Creditor API response:", res);
      if (res.data) {
        // ส่งข้อมูลเจ้าหนี้ไปยัง component หลัก
        emit("creditorSelected", res.data);
      }
    })
    .catch((err) => {
      console.error("Error fetching creditor data:", err);
    });
}

function selectAccount(data, field, index) {
  emit("selectAccount", data, index);
  focusNext(field, index);
}

function onRowReorder(event) {
  emit("onRowReorder", event.value);
}

function addColumn(index) {
  emit("addColumn", index);
}

function reload() {
  emit("reload");
}
function deleteDetail() {
  console.log(detail.value.index);
  emit("deleteDetail", detail.value.index);
  deleteDetailDialog.value = false;
}

function selectDucumentFormat(event) {
  emit("selectDucumentFormat", event.value);
}

function confirmDeleteDetail(data, index) {
  console.log(index);
  detail.value = data;
  detail.value.index = index;
  console.log(detail);
  deleteDetailDialog.value = true;
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
    console.log(worksheet);
    var col_1 = worksheet.A1.w;
    var col_2 = worksheet.B1.w;
    var col_3 = worksheet.C1.w;
    var col_4 = worksheet.D1.w;
    // console.log(results);
    var details = [];
    for (let index = 0; index < results.length; index++) {
      console.log(results[index]);
      var val_1 = "";
      var val_2 = "";
      var val_3 = "";
      var val_4 = "";
      var i = 0;
      JSON.parse(JSON.stringify(results[index]), (key, value) => {
        if (key === col_1) {
          //console.log(key + " : " + value);
          val_1 = value;
        }
        if (key === col_2) {
          //console.log(key + " : " + value);
          val_2 = value;
        }
        if (key === col_3) {
          //console.log(key + " : " + value);
          val_3 = value;
        }
        if (key === col_4) {
          //console.log(key + " : " + value);
          val_4 = value;
        }
        //console.log(i);
        i++;
      });

      details.push({
        index: index,
        accountcode: val_1,
        accountname: val_2,
        debitamount: val_3 == "" ? 0 : val_3,
        creditamount: val_4 == "" ? 0 : val_4,
      });
    }
    emit("ImportDaliy", details);
  };
  reader.onerror = function (e) {
    console.log(e);
  };
}

function onCellEditComplete(event) {
  let { data, newValue, field } = event;
  data[field] = newValue;
}

function searchAccount(event) {
  setTimeout(() => {
    console.log(event.query);
    if (!event.query.trim().length) {
      filteredCountries.value = props.accountChart_detail;
    } else {
      filteredCountries.value = props.accountChart_detail.filter((account) => {
        if (
          account.accountcode
            .toLowerCase()
            .includes(event.query.toLowerCase()) ||
          account.accountname.toLowerCase().includes(event.query.toLowerCase())
        ) {
          return true;
        }
      });
    }
  }, 250);
}

function focusNext(field, index) {
  console.log(field);
  setTimeout(() => {
    let targetElement = null;

    if (field == "accountcode") {
      targetElement = $(".debit_" + index + " > input");
    } else if (field == "debitamount") {
      targetElement = $(".credit_" + index + " > input");
    } else if (field == "creditamount") {
      // Check if this is the last row in the table
      if (index === props.daily_form.journaldetail.length - 1) {
        // Add a new row and focus on its account code field
        addColumn(index);
        setTimeout(() => {
          const newRowElement = $(".accountcode_" + (index + 1) + " > input");
          newRowElement.focus();
          // Don't select all text for account code since it's likely empty
        }, 100);
        return;
      } else {
        // If not the last row, move to the next row's account code
        targetElement = $(".accountcode_" + (index + 1) + " > input");
      }
    }

    if (targetElement && targetElement.length > 0) {
      targetElement.focus();
      // Select all text for numeric fields to make it easy to replace
      if (field == "accountcode" || field == "debitamount") {
        targetElement[0]?.select();
      }
    }
  }, 100);
}

function checkAccountPeriod(event) {
  console.log(event);
  let keyDate = "";
  if (tempCheckDate.value != null) {
    clearTimeout(tempCheckDate.value);
  }
  tempCheckDate.value = setTimeout(() => {
    keyDate = Utils.getDateFromYear(event);
    getAccountPeriodByDate(dayjs(keyDate).format("YYYY-MM-DD"));
  }, 100);
}

function getAccountPeriodByDate(keyDate) {
  // console.log(keyDate);
  AccountPeriodDataService.getAccountPeriodByDate(keyDate)
    .then((res) => {
      console.log(res);
      if (res.success) {
        if (res.data[0].perioddata.guidfixed != "") {
          emit("setAccountPeriod", res.data[0].perioddata.period);
        } else {
          emit("setAccountPeriod", null);
          warringAccountperiod.value = true;
        }
      }
    })
    .catch((err) => {
      console.log(err.response.data.message);
      emit("setAccountPeriod", null);
      warringAccountperiod.value = true;
      // toast.add({
      //   severity: "warn",
      //   summary: "แจ้งเตือน",
      //   detail: "วันที่เอกสาร ได้ถูกปิดงวดไปแล้ว หรือยังไม่ได้กำหนดงวดบัญชี",
      //   life: 3000,
      // });
    });
}

function headerNextFocus(filedName) {
  console.log(filedName);
  setTimeout(() => {
    // Header section - follow the visual order of the form
    if (filedName == "docdate") {
      $(".docno").focus();
    } else if (filedName == "docno") {
      checkAccountPeriod(props.daily_form.docdate);
      $(".bookcode").click();
    } else if (filedName == "bookcode") {
      // Focus on the first radio button in the debtaccounttype group
      $(
        "input[name='debtaccounttype'][value='" +
          props.daily_form.debtaccounttype +
          "']"
      ).focus();
    } else if (filedName == "debtaccounttype") {
      // Select appropriate dropdown based on debtaccounttype value
      if (props.daily_form.debtaccounttype == "0") {
        $(".debtor").click();
      } else {
        $(".creditor").click();
      }
    } else if (filedName == "debtor" || filedName == "creditor") {
      $(".exdocrefdate").focus();
    } else if (filedName == "exdocrefdate") {
      $(".exdocrefno").focus();
    } else if (filedName == "exdocrefno") {
      // Focus on journaltype radio buttons
      $(
        "input[name='journaltype'][value='" +
          props.daily_form.journaltype +
          "']"
      ).focus();
    } else if (filedName == "journaltype") {
      $(".accountdescription").focus();
    } else if (filedName == "accountdescription") {
      // Move to the first row in the table
      $(".accountcode_0 > input").focus();
    }
    // Hidden or less common fields
    else if (filedName == "batchid") {
      $(".accountperiod").focus();
    } else if (filedName == "accountperiod") {
      $(".accountyear").focus();
    } else if (filedName == "accountyear") {
      $(".exdocrefdate").focus();
    } else if (filedName == "accountgroup") {
      $(".accountdescription").focus();
    }
    // Document format dropdown in the detail section
    else if (filedName == "documentformate") {
      $(".accountcode_0 > input").focus();
    }
    // First row in detail grid
    else if (filedName == "accountRow1") {
      $(".accountcode_0 > input").focus();
    }
  }, 100);
}

function navigateVertical(currentIndex, currentField, direction) {
  const targetIndex = currentIndex + direction;

  // Check if target index is within bounds
  if (targetIndex >= 0 && targetIndex < props.daily_form.journaldetail.length) {
    // Focus on the same field (debit or credit) but in different row
    setTimeout(() => {
      let targetElement;
      if (currentField === "debitamount") {
        targetElement = $(`.debit_${targetIndex} > input`);
      } else if (currentField === "creditamount") {
        targetElement = $(`.credit_${targetIndex} > input`);
      }

      if (targetElement && targetElement.length > 0) {
        targetElement.focus();
        // Select all text to make it easy to replace
        targetElement[0].select();
      }
    }, 10); // Small delay to ensure DOM is ready
  }
}

function navigateHorizontal(currentIndex, currentField, direction) {
  let targetElement;

  // Moving left from debit to account code or right from credit to account code
  if (
    (currentField === "debitamount" && direction < 0) ||
    (currentField === "creditamount" && direction > 0)
  ) {
    targetElement = $(`.accountcode_${currentIndex} > input`);
  }
  // Moving right from debit to credit
  else if (currentField === "debitamount" && direction > 0) {
    targetElement = $(`.credit_${currentIndex} > input`);
  }
  // Moving left from credit to debit
  else if (currentField === "creditamount" && direction < 0) {
    targetElement = $(`.debit_${currentIndex} > input`);
  }

  if (targetElement && targetElement.length > 0) {
    setTimeout(() => {
      targetElement.focus();
      // Select all text to make it easy to replace
      targetElement[0].select();
    }, 10); // Small delay to ensure DOM is ready
  }
}
</script>

<template>
  <form style="height: 100%; display: flex; flex-direction: column; overflow-y: auto;">
        <div
          class="grid formgrid p-fluid"
          v-if="props.income_expenses_mode == false"
        >
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <DatePicker
            dateFormat="d/m/yy"
            v-model="props.daily_form.docdate"
            :modelValue="props.daily_form.docdate"
            :class="props.daily_form_valid.docdate ? 'p-invalid' : ''"
            :showIcon="true"
            :disabled="props.isUpdate"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="true"
            :hiddenTime="true"
            @date-select="checkAccountPeriod($event)"
            @keyup.enter="headerNextFocus('docdate')"
            @keydown.tab="headerNextFocus('docdate')"
            inputClass="docdate"
          />
          <label for="docdate">เอกสารวันที่</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-5">
        <span class="p-float-label">
          <InputText
            type="text"
            v-model="props.daily_form.docno"
            :class="props.daily_form_valid.docno ? 'p-invalid ' : ''"
            :disabled="props.isUpdate || update_mode"
            @keyup.enter="headerNextFocus('docno')"
            @keydown.tab="headerNextFocus('docno')"
            class="docno"
          />
          <label for="docNo">เลขที่เอกสาร</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-4">
        <span class="p-float-label">
          <Dropdown
            v-model="props.daily_form.bookcode"
            :options="props.accountBook_detail"
            :class="props.daily_form_valid.bookcode ? 'p-invalid' : ''"
            :disabled="props.isUpdate"
            :filter="true"
            :filterFields="['code', 'name1']"
            optionValue="code"
            optionLabel="label"
            filterPlaceholder="ค้นหา"
            placeholder="เลือก"
            :autoFilterFocus="true"
            @keyup.enter="headerNextFocus('bookcode')"
            @keydown.tab="headerNextFocus('bookcode')"
            inputClass="bookcode"
            inputStyle="height: 51px;"
          >
            <template #option="slotProps">
              <div>
                {{ slotProps.option.code }} ~ {{ slotProps.option.name1 }}
              </div>
            </template>
          </Dropdown>
          <label for="bookcode">สมุดรายวัน</label>
        </span>
      </div>
      <div class="field mt-3 col-12 md:col-3">
        <div class="grid mt-0 ml-2">
          <div class="flex field-checkbox">
            <RadioButton
              :disabled="props.isUpdate"
              name="debtaccounttype"
              value="0"
              v-model="props.daily_form.debtaccounttype"
              @keyup.enter="headerNextFocus('debtaccounttype')"
              @keydown.tab="headerNextFocus('debtaccounttype')"
            />
            <label>ลูกหนี้</label>
          </div>
          <div class="flex field-checkbox ml-3">
            <RadioButton
              :disabled="props.isUpdate"
              name="debtaccounttype"
              value="1"
              v-model="props.daily_form.debtaccounttype"
              @keyup.enter="headerNextFocus('debtaccounttype')"
              @keydown.tab="headerNextFocus('debtaccounttype')"
            />
            <label>เจ้าหนี้</label>
          </div>
        </div>
      </div>
      <div
        class="field mb-4 col-12 md:col-9"
        v-if="props.daily_form.debtaccounttype == 0"
      >
        <span class="p-float-label">
          <Dropdown
            showClear
            v-model="props.daily_form.debtor"
            :options="props.customer_detail"
            :disabled="props.isUpdate"
            :filter="true"
            :filterFields="['code', 'name']"
            optionValue="code"
            optionLabel="name"
            filterPlaceholder="ค้นหา"
            placeholder="เลือก"
            :autoFilterFocus="true"
            @keyup.enter="headerNextFocus('debtor')"
            @keydown.tab="headerNextFocus('debtor')"
            inputClass="debtor"
            inputStyle="height: 51px;"
          >
            <template #option="slotProps">
              <div>
                {{ slotProps.option.code }} ~ {{ slotProps.option.name }}
              </div>
            </template>
          </Dropdown>
          <label for="bookcode">ลูกหนี้</label>
        </span>
      </div>
      <div
        class="field mb-4 col-12 md:col-9"
        v-if="props.daily_form.debtaccounttype == 1"
      >
        <span class="p-float-label">
          <Dropdown
            showClear
            v-model="props.daily_form.creditor"
            :options="props.creditor_detail"
            :disabled="props.isUpdate"
            :filter="true"
            :filterFields="['code', 'name']"
            optionValue="code"
            optionLabel="name"
            filterPlaceholder="ค้นหา"
            placeholder="เลือก"
            :autoFilterFocus="true"
            @keyup.enter="headerNextFocus('creditor')"
            @keydown.tab="headerNextFocus('creditor')"
            inputClass="creditor"
            inputStyle="height: 51px;"
          >
            <template #option="slotProps">
              <div>
                {{ slotProps.option.code }} ~ {{ slotProps.option.name }}
              </div>
            </template>
          </Dropdown>
          <label for="bookcode">เจ้าหนี้</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3">
        <span class="p-float-label">
          <DatePicker
            dateFormat="d/m/yy"
            v-model="props.daily_form.exdocrefdate"
            :modelValue="props.daily_form.exdocrefdate"
            :showIcon="true"
            :disabled="props.isUpdate"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="true"
            :hiddenTime="true"
            inputClass="exdocrefdate"
            @keyup.enter="headerNextFocus('exdocrefdate')"
            @keydown.tab="headerNextFocus('exdocrefdate')"
          />
          <label for="exdocrefdate">เอกสารวันที่อ้างอิง</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-5">
        <span class="p-float-label">
          <InputText
            id="exdocrefno"
            type="text"
            v-model="props.daily_form.exdocrefno"
            :disabled="props.isUpdate || update_mode"
            @keyup.enter="headerNextFocus('exdocrefno')"
            @keydown.tab="headerNextFocus('exdocrefno')"
            class="exdocrefno"
          />
          <label for="exdocrefno">เลขที่เอกสารอ้างอิง</label>
        </span>
      </div>

      <div class="field mb-4 col-12 md:col-3">
        <label class="font-medium text-900 ml-0 mr-2">ประเภทรายการ</label>

        <div class="grid mt-0 ml-2">
          <div class="flex field-checkbox">
            <RadioButton
              :disabled="props.isUpdate"
              name="journaltype"
              value="0"
              v-model="props.daily_form.journaltype"
              inputClass="isUpdate"
              @keyup.enter="headerNextFocus('journaltype')"
              @keydown.tab="headerNextFocus('journaltype')"
            />
            <label>ทั่วไป</label>
          </div>
          <div class="flex field-checkbox ml-3">
            <RadioButton
              :disabled="props.isUpdate"
              name="journaltype"
              value="1"
              v-model="props.daily_form.journaltype"
              @keyup.enter="headerNextFocus('journaltype')"
              @keydown.tab="headerNextFocus('journaltype')"
            />
            <label>ปิดบัญชี</label>
          </div>
        </div>
      </div>
      <div class="field mb-12 col-12 md:col-12">
        <span class="p-float-label">
          <Textarea
            type="text"
            :disabled="props.isUpdate"
            v-model="props.daily_form.accountdescription"
            @keyup.enter="headerNextFocus('accountdescription')"
            @keydown.tab="headerNextFocus('accountdescription')"
            class="accountdescription"
            :autoResize="true"
            rows="2"
          />
          <label for="accountdescription">คำอธิบาย</label>
        </span>
      </div>
      <div class="field mb-4 col-12 md:col-3 hidden">
        <label for="accountgroup" class="font-medium text-900"
          >กลุ่มบัญชี</label
        >
        <Dropdown
          showClear
          class="w-full md:w-14rem"
          v-model="props.daily_form.docformat"
          :options="props.document_formate"
          :disabled="props.isUpdate"
          :filter="true"
          :filterFields="['doccode', 'description']"
          optionValue="description"
          optionLabel="label"
          filterPlaceholder="ค้นหา"
          placeholder="เลือก"
          :autoFilterFocus="true"
          @change="selectDucumentFormat($event)"
          @keyup.enter="headerNextFocus('documentformate')"
          @keydown.tab="headerNextFocus('documentformate')"
          inputClass="documentformate"
        >
          <template #option="slotProps">
            <div>
              {{ slotProps.option.code }} ~ {{ slotProps.option.name1 }}
            </div>
          </template>
        </Dropdown>
      </div>
      <div class="field mb-4 col-12 md:col-3 hidden">
        <label class="font-medium text-900">หมายเลขดำเนินการ</label>
        <InputText
          type="text"
          v-model="props.daily_form.batchId"
          :class="props.daily_form_valid.batchId ? 'p-invalid' : ''"
          :disabled="props.isUpdate"
          @keyup.enter="headerNextFocus('accountperiod')"
          class="batchid"
        />
      </div>
      <div class="field mb-4 col-12 md:col-3" hidden>
        <label class="font-medium text-900">งวดบัญชี</label>
        <InputText
          type="number"
          :min="0"
          v-model="props.daily_form.accountperiod"
          :disabled="true"
          @keyup.enter="headerNextFocus('accountyear')"
          class="accountperiod"
        />
      </div>
      <div class="field mb-4 col-12 md:col-3 hidden">
        <label class="font-medium text-900">ปีบัญชี</label>
        <InputText
          type="number"
          :min="0"
          v-model="props.daily_form.accountyear"
          :class="props.daily_form_valid.accountyear ? 'p-invalid' : ''"
          :disabled="props.isUpdate"
          @keyup.enter="headerNextFocus('exdocrefdate')"
          class="accountyear"
        />
      </div>

      <div class="surface-border border-top-1 opacity-50 col-12"></div>
    </div>

    <div
      class="flex flex-column lg:flex-row gap-3 justify-content-between lg:align-items-center"
      :class="
        props.income_expenses_mode == false ? 'border-primary py-5' : 'py-0'
      "
      :style="
        props.income_expenses_mode == false
          ? 'border-top: 6px solid'
          : 'border-top: 0px solid'
      "
      v-if="!props.isUpdate"
    >
      <div class="flex flex-column gap-2" >
        <div class="flex align-items-center gap-2">
          <h1 class="m-0 font-semibold text-900 text-xl line-height-3">
            นำเข้ารายการบัญชี
          </h1>
          <FileUpload
            mode="basic"
            name="input file"
            accept=".xls,.xlsx"
            ref="myFiles"
            :customUpload="true"
            v-if="!props.isUpdate"
            @change="ImportFile()"
            class="p-button-plain p-button-primary p-button-sm"
            chooseLabel=".xml"
          >
          </FileUpload>
        </div>
        <p class="mb-0 mt-0 text-base text-600">
          นำเข้าข้อมูลรายการบัญชีจาก Excel.
        </p>
      </div>
      <div class="flex flex-column gap-2">
        <div class="flex align-items-center gap-2">
          <Dropdown
            showClear
            class="w-full md:w-14rem"
            v-model="props.daily_form.docformat"
            :options="props.document_formate"
            :disabled="props.isUpdate"
            :filter="true"
            :filterFields="['doccode', 'description']"
            optionValue="description"
            optionLabel="label"
            filterPlaceholder="ค้นหา"
            placeholder="เลือก"
            :autoFilterFocus="true"
            @change="selectDucumentFormat($event)"
          >
            <template #option="slotProps">
              <div>
                {{ slotProps.option.doccode }} ~
                {{ slotProps.option.description }}
              </div>
            </template>
          </Dropdown>
        </div>
        <p class="mb-0 mt-0 text-base text-600">เลือกรูปแบบการบันทึกบัญชี.</p>
      </div>
    </div>

    <div>
      <DataTable
        :value="props.daily_form.journaldetail"
        :reorderableColumns="false"
        @rowReorder="onRowReorder"
        class="editable-cells-table"
        responsiveLayout="scroll"
      >
        <Column
          header="ย้าย"
          :rowReorder="true"
          style="width: 5%"
          v-if="!props.isUpdate"
        >
        </Column>
        <Column field="accountcode" header="รหัสบัญชี" style="min-width: 100px">
          <template #body="{ data, field, index }" v-if="!props.isUpdate">
            <TextAutoComplete
              v-model="data[field]"
              :suggestions="filteredCountries"
              @complete="searchAccount($event)"
              :class="'accountcode_' + index"
              :dropdown="false"
              optionLabel="accountcode"
              @item-select="selectAccount(data[field], field, index)"
              :inputClass="
                props.daily_form_valid.accountcode1 ? 'p-invalid' : ''
              "
            >
              <template #item="slotProps">
                <div class="ml-2">
                  {{ slotProps.item.accountcode }} ~
                  {{ slotProps.item.accountname }}
                </div>
              </template>
            </TextAutoComplete>
            <!--
            <Dropdown  v-model="data[field]" autofocus :disabled="props.isUpdate" 
              :options="props.accountChart_detail" :filter="true" :filterFields="['accountcode', 'accountname']"
              filterPlaceholder="ค้นหา" @change="selectAccount(data[field], index)" optionLabel="accountcode"
              optionValue="accountcode" placeholder="เลือก">
              <template #option="slotProps">
                <span>{{ slotProps.option.accountcode }} ~
                  {{ slotProps.option.accountname }}</span>
              </template>
            </Dropdown>
            -->
          </template>
        </Column>
        <Column
          field="accountname"
          header="ชื่อบัญชี"
          style="min-width: 200px"
          footerStyle="text-align: right !important"
          footer="รวม"
        >
        </Column>

        <Column
          field="debitamount"
          header="เดบิต"
          footerStyle="text-align: right !important"
          :footer="Utils.formatCurrency(sumTableDebit)"
          bodyStyle="text-align: right !important"
          headerStyle="text-align:center;width: 10%"
          style="min-width: 180px"
        >
          <template #body="{ data, field, index }">
            <div v-if="props.isUpdate">
              {{ Utils.formatCurrency(data[field]) }}
            </div>
            <TextInputNumber
              v-else
              :class="'debit_' + index"
              v-model="data[field]"
              mode="decimal"
              :maxFractionDigits="2"
              @enter="focusNext(field, index)"
              @arrow-up="navigateVertical(index, 'debitamount', -1)"
              @arrow-down="navigateVertical(index, 'debitamount', 1)"
              @arrow-left="navigateHorizontal(index, 'debitamount', -1)"
              @arrow-right="navigateHorizontal(index, 'debitamount', 1)"
              :rowIndex="index"
              fieldType="debitamount"
            />
          </template>
        </Column>

        <Column
          field="creditamount"
          header="เครดิต"
          footerStyle="text-align: right !important"
          :footer="Utils.formatCurrency(sumTableCredit)"
          bodyStyle="text-align: right !important"
          headerStyle="text-align:center;width: 10%"
          style="min-width: 180px"
        >
          <template #body="{ data, field, index }">
            <div v-if="props.isUpdate">
              {{ Utils.formatCurrency(data[field]) }}
            </div>
            <TextInputNumber
              v-else
              :class="'credit_' + index"
              v-model="data[field]"
              mode="decimal"
              :maxFractionDigits="2"
              @enter="focusNext(field, index)"
              @arrow-up="navigateVertical(index, 'creditamount', -1)"
              @arrow-down="navigateVertical(index, 'creditamount', 1)"
              @arrow-left="navigateHorizontal(index, 'creditamount', -1)"
              @arrow-right="navigateHorizontal(index, 'creditamount', 1)"
              :rowIndex="index"
              fieldType="creditamount"
            />
          </template>
        </Column>

        <!-- Use footer of action columns to display the difference -->
        <Column
          header="ลบ"
          bodyStyle="text-align:center"
          style="width: 5%"
          footerStyle="text-align: center !important; font-weight: bold;"
          v-if="!props.isUpdate"
          :footerColSpan="2"
          :footer="Utils.formatCurrency(difference)"
          :class="{ 'text-red-500': difference != '0.00' }"
        >
          <template #body="slotProps">
            <Button
              icon="pi pi-times"
              class="p-button-rounded p-button-danger p-button-text"
              @click="confirmDeleteDetail(slotProps.data, slotProps.index)"
            />
          </template>
        </Column>
        <Column
          header="เพิ่ม"
          bodyStyle="text-align:center"
          style="width: 5%"
          v-if="!props.isUpdate"
        >
          <template #body="slotProps">
            <Button
              icon="pi pi-plus"
              class="p-button-rounded p-button-success p-button-text"
              @click="addColumn(slotProps.index)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </form>
  <Dialog
    v-model:visible="deleteDetailDialog"
    :style="{ width: '450px' }"
    header="แจ้งเตือน"
    :modal="true"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span
        >คุณแน่ใจหรือไม่ที่จะลบ <b>{{ detail.accountname }}</b> ?</span
      >
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        class="p-button-text"
        @click="deleteDetailDialog = false"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        class="p-button-text"
        @click="deleteDetail"
      />
    </template>
  </Dialog>

  <DialogWarringPeriod
    :confirmDialog="warringAccountperiod"
    v-on:confirm="warringAccountperiod = false"
  />

  <!-- <Dialog
    :visible="warringAccountperiod"
    appendTo="body"
    :modal="true"
    :breakpoints="{ '960px': '75vw', '640px': '100vw' }"
    :style="{ width: '40vw' }"
    :closable="false"
  >
    <template #header>
      <div class="flex align-items-center">
        <span
          class="flex align-items-center justify-content-center bg-cyan-100 text-cyan-800 mr-3 border-circle"
          style="width: 32px; height: 32px"
        >
          <i class="pi pi-exclamation-triangle text-lg"></i>
        </span>
        <span class="font-medium text-2xl text-900">แจ้งเตือนระบบ </span>
      </div>
    </template>

    <div class="flex flex-column justify-content-center align-items-center">
      <p
        class="line-height-3 p-0 m-0"
        style="font-size: 1.2rem; text-align: center"
      >
        <span>
          วันที่เอกสาร ได้ถูกปิดงวดไปแล้ว หรือยังไม่ได้กำหนดงวดบัญชี
        </span>
      </p>
    </div>

    <template #footer>
      <div class="border-top-1 surface-border pt-3">
        <Button
          class="w-full"
          @click="warringAccountperiod = false"
          label="ตกลง"
        ></Button>
      </div>
    </template>
  </Dialog> -->
</template>
<style>
.p-dialog.p-component.p-ripple-disabled {
  background-color: #fff;
}
</style>
