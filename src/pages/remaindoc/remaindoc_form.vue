<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { ref, onMounted } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";

const storeApp = useApp();

const router = useRouter();
const toast = useToast();

const docdate = ref("");
const docno = ref("");
const accountperiod = ref(1);
const accountyear = ref("");
const isInvalid = ref(false);
const accountgroup = ref("");
const batchid = ref("");
const accountdescription = ref("");
const editingRows = ref([]);
const deleteDetailDialog = ref(false);
const accountChart_detail = ref([]);
const confirmSaveDialog = ref(false);
const selectedImageIndex1 = ref(0);
const image_list = ref([
  {
    image: "/img/doc001.png",
  },
  {
    image: "/img/002.jpeg",
  },
  {
    image: "/img/doc001.png",
  },
  {
    image: "/img/doc001.png",
  },
]);
const account_detail = ref([
  {
    index: 0,
    accountcode: "",
    accountname: "",
    debitamount: "",
    creditamount: "",
  },
]);

const detail = ref();

onMounted(() => {
  storeApp.setPageTitle("เอกสารอ้างอิง FEE6505-00000001");
  docno.value = Utils.getDocNoDate("JO");
  docdate.value = Utils.getDateTime();
  console.log(Utils.getYear().toString());
  accountyear.value = parseInt(Utils.getYear().toString());
  getAccountChart();
});

function goList() {
  router.push({ name: "remaindocList" });
}

function getAccountChart() {
  MasterdataService.getAccountChart()
    .then((res) => {
      console.log(res);
      if (res.success) {
        accountChart_detail.value = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
function onRowReorder(event) {
  account_detail.value = event.value;
  toast.add({
    severity: "success",
    summary: "ทำรายการสำเร็จ",
    detail: "ย้ายตำแหน่งสำเร็จ",
    life: 3000,
  });
}

function onRowEditSave(event) {
  let { newData, index } = event;

  account_detail.value[index] = newData;
}

function confirmDeleteDetail(data) {
  console.log(data);
  detail.value = data;
  console.log(detail);
  deleteDetailDialog.value = true;
}
function deleteDetail() {
  account_detail.value = account_detail.value.filter(
    (val) => val.index !== detail.value.index
  );
  deleteDetailDialog.value = false;
  detail.value = {};

  if (account_detail.value.length == 0) {
    account_detail.value.push({
      index: 0,
      accountcode: "",
      accountname: "",
      debitamount: "",
      creditamount: "",
    });
  }
  generateIndex();
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Detail Deleted",
    life: 3000,
  });
}
function generateIndex() {
  var newData = [];
  account_detail.value.forEach((ele, index) => {
    newData.push({
      index: index,
      accountcode: ele.accountcode,
      accountname: ele.accountname,
      debitamount: ele.debitamount,
      creditamount: ele.creditamount,
    });
  });

  account_detail.value = newData;
}
function addColumn(index) {
  account_detail.value.splice(index + 1, 0, {
    index: index + 1,
    accountcode: "",
    accountname: "",
    debitamount: "",
    creditamount: "",
  });
  generateIndex();
}
function up(index) {
  const element = account_detail.value.splice(index, 1)[0];
  account_detail.value.splice(index - 1, 0, element);
}
function down(index) {
  const element = account_detail.value.splice(index, 1)[0];
  account_detail.value.splice(index + 1, 0, element);
}

async function confirmSave() {
  var journaldetail = [];
  var sumCredit = 0;
  var sumDebit = 0;
  await account_detail.value.forEach((ele) => {
    var debit = 0;
    var credit = 0;
    if (ele.creditamount != "") {
      credit = parseFloat(ele.creditamount);
      sumCredit += credit;
    }
    if (ele.debitamount != "") {
      debit = parseFloat(ele.debitamount);
      sumDebit += debit;
    }
    journaldetail.push({
      accountcode: ele.accountcode,
      accountname: ele.accountname,
      debitamount: debit,
      creditamount: credit,
    });
  });
  // console.log(Utils.getFormatDateTime(accountyear.value));
  // console.log(Utils.getYear(docdate.value));

  var post_data = {
    accountdescription: accountdescription.value,
    accountgroup: accountgroup.value,
    accountperiod: parseInt(accountperiod.value.toString()),
    accountyear: parseInt(accountyear.value),
    amount: sumDebit,
    batchId: batchid.value,
    docdate: Utils.getFormatDateTime(docdate.value),
    docno: docno.value,
    journaldetail: journaldetail,
    parid: "0000000",
  };
  console.log(post_data);
  MasterdataService.postGLJournal(post_data)
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
  var isPass = await verifyData();
  if (isPass) {
    confirmSaveDialog.value = true;
  } else {
  }
}
function selectAccount(data, index) {
  var ele = accountChart_detail.value.filter((val) => val.accountcode == data);
  account_detail.value[index].accountname = ele[0].accountname;
}

function onCellEditComplete(event) {
  let { data, newValue, field } = event;

  data[field] = newValue;
}

function verifyData() {
  var errorCount = 0;

  if (docdate.value == "") {
    errorCount += 1;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "วันที่",
      life: 3000,
    });
  }
  if (docno.value == "") {
    errorCount += 1;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "เลขที่เอกสาร",
      life: 3000,
    });
  }
  if (accountperiod.value == "") {
    errorCount += 1;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "งวดบัญชี",
      life: 3000,
    });
  }
  if (accountyear.value == "") {
    errorCount += 1;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "ปีบัญชี",
      life: 3000,
    });
  }
  if (accountgroup.value == "") {
    errorCount += 1;
    isInvalid.value = true;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กลุ่มบัญชี",
      life: 3000,
    });
  } else {
    isInvalid.value = false;
  }
  var sumCredit = 0;
  var sumDebit = 0;
  account_detail.value.forEach((ele, index) => {
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
    if (ele.creditamount != "") {
      credit = parseFloat(ele.creditamount);
      sumCredit += credit;
    }
    if (ele.debitamount != "") {
      debit = parseFloat(ele.debitamount);
      sumDebit += debit;
    }
  });

  if (sumCredit != sumDebit) {
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
    return true;
  }
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
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-ground">
        <Button
          label="กลับหน้ารายการ"
          icon="pi pi-arrow-left"
          class="p-button-text p-button-sm p-button-info"
          @click="goList()"
        />
        <div class="surface-card p-3 shadow-2 border-round p-fluid">
          <div class="flex">
            <div class="flex flex-column w-2 justify-content-between">
              <img
                v-for="(image, i) of image_list"
                :key="image.image"
                :src="image.image"
                class="w-full cursor-pointer border-2 border-round border-transparent transition-colors transition-duration-150"
                :class="{ 'border-primary': selectedImageIndex1 === i }"
                @click="selectedImageIndex1 = i"
              />
            </div>
            <div class="pl-3 w-10">
              <img :src="image_list[selectedImageIndex1].image" class="w-full" />
            </div>
          </div>
          <!-- <div class="grid">
            <div class="col-12 lg:col-6">
              <img :src="image_list[selectedImageIndex1].image" class="mb-3 w-full" />
              <div class="grid">
                <div v-for="(data, i) of image_list" :key="i" class="col-3">
                  <img
                    :src="data.image"
                    class="w-full cursor-pointer border-2 border-round border-transparent transition-colors transition-duration-150"
                    :class="{ 'border-primary': selectedImageIndex1 === i }"
                    @click="selectedImageIndex1 = i"
                  />
                </div>
              </div>
            </div>
          </div> -->
        </div>
      </div>
      <Dialog
        v-model:visible="deleteDetailDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
          <span
            >Are you sure you want to delete <b>{{ detail.accountname }}</b> ?</span
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
      <Dialog
        v-model:visible="confirmSaveDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
          <span>ต้องการบันทึกเอกสารรายวันใช่หรือไม่ ?</span>
        </div>
        <template #footer>
          <Button
            label="No"
            icon="pi pi-times"
            class="p-button-text"
            @click="confirmSaveDialog = false"
          />
          <Button
            label="Yes"
            icon="pi pi-check"
            class="p-button-text"
            @click="confirmSave"
          />
        </template>
      </Dialog>
    </MainContentWarp>
  </AppLayout>
</template>
