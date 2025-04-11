<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { ref, onMounted } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";
import DialogForm from "@/components/DialogForm.vue";
const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const route = useRoute();
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
const conSave = ref("ต้องการบันทึกเอกสารรายวันใช่หรือไม่");
const conDelete = ref("ต้องการบันทึกเอกสารรายวันใช่หรือไม่");
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

onMounted(async () => {
  await getAccountChart();
  await getGLDetail(route.params.id);
  storeApp.setPageTitle("แก้ไขข้อมูลรายวัน");
});

function goList() {
  router.push({ name: "dailyList" });
}

function getGLDetail(id) {
  MasterdataService.getGLDetail(id)
    .then((res) => {
      console.log(res);
      if (res.success) {
        docno.value = res.data.docno;
        docdate.value = Utils.getDateTimeFromDate(res.data.docdate);
        batchid.value = res.data.batchId;
        accountperiod.value = res.data.accountperiod;
        accountyear.value = res.data.accountyear;
        accountgroup.value = res.data.accountgroup;
        accountdescription.value = res.data.accountdescription;
        account_detail.value = res.data.journaldetail;
      }
    })
    .catch((err) => {
      console.log(err);
    });
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
    accountyear: accountyear.value,
    amount: sumDebit,
    batchId: batchid.value,
    docdate: Utils.getFormatDateTime(docdate.value),
    docno: docno.value,
    journaldetail: journaldetail,
    parid: "0000000",
  };
  console.log(post_data);
  MasterdataService.putGLJournal(post_data, route.params.id)
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
      <div class="surface-ground px-2 py-2">
        <Button
          label="กลับหน้ารายการ"
          icon="pi pi-arrow-left"
          class="p-button-text p-button-sm p-button-info"
          @click="goList()"
        />
        <div class="surface-card p-4 shadow-2 border-round p-fluid">
          <div class="grid formgrid p-fluid">
            <div class="field mb-4 col-12 md:col-3">
              <label for="docNo" class="font-medium text-900"
                >เลขที่เอกสาร</label
              >
              <InputText
                id="docNo"
                type="text"
                :readonly="true"
                v-model="docno"
              />
            </div>
            <div class="field mb-4 col-12 md:col-3">
              <label class="font-medium text-900">เอกสารวันที่</label>
              <Calendar
                dateFormat="d/m/yy"
                v-model="docdate"
                :showTime="true"
                :showSeconds="true"
                :showIcon="true"
              ></Calendar>
            </div>
            <div class="field mb-4 col-12 md:col-3">
              <label class="font-medium text-900">หมายเลขดำเนินการ</label>
              <InputText type="text" v-model="batchid" />
            </div>
            <div class="field mb-4 col-12 md:col-3">
              <label class="font-medium text-900">งวดบัญชี</label>
              <InputText type="number" :min="0" v-model="accountperiod" />
            </div>
            <div class="col-12"></div>
            <div class="field mb-4 col-12 md:col-3">
              <label class="font-medium text-900">ปีบัญชี</label>
              <InputText type="number" :min="0" v-model="accountyear" />
            </div>
            <div class="field mb-4 col-12 md:col-3">
              <label class="font-medium text-900">กลุ่มบัญชี</label>
              <InputText
                type="text"
                id="accountgroup"
                v-model="accountgroup"
                :class="isInvalid ? 'p-invalid' : ''"
              />
            </div>
            <div class="field mb-4 col-12 md:col-6">
              <label class="font-medium text-900">คำอธิบาย</label>
              <InputText type="text" v-model="accountdescription" />
            </div>
            <div
              class="surface-border border-top-1 opacity-50 mb-4 col-12"
            ></div>
          </div>
          <div>
            <DataTable
              :value="account_detail"
              editMode="cell"
              @cell-edit-complete="onCellEditComplete"
              :reorderableColumns="true"
              @rowReorder="onRowReorder"
              class="editable-cells-table"
              responsiveLayout="scroll"
            >
              <Column field="accountcode" header="รหัสบัญชี" style="width: 20%">
                <template #editor="{ data, field, index }">
                  <Dropdown
                    v-model="data[field]"
                    autofocus
                    :options="accountChart_detail"
                    @change="selectAccount(data[field], index)"
                    optionLabel="accountcode"
                    optionValue="accountcode"
                    placeholder="เลือก"
                  >
                    <template #option="slotProps">
                      <span>{{ slotProps.option.accountcode }}</span>
                    </template>
                  </Dropdown>
                </template>
              </Column>

              <Column field="accountname" header="ชื่อบัญชี" style="width: 20%">
              </Column>

              <Column
                field="debitamount"
                header="เดบิต"
                headerStyle="text-align:center;width: 10%"
                style="width: 13%"
              >
                <template #editor="{ data, field }">
                  <InputText
                    v-model="data[field]"
                    autofocus
                    type="number"
                    style="text-align: right"
                  />
                </template>
              </Column>
              <Column
                field="creditamount"
                header="เครดิต"
                headerStyle="text-align:center;width: 10%"
              >
                <template #editor="{ data, field }">
                  <InputText
                    v-model="data[field]"
                    autofocus
                    type="number"
                    style="text-align: right"
                  />
                </template>
              </Column>
              <Column header="ย้าย" :rowReorder="true" style="width: 5%">
              </Column>
              <!-- <Column bodyStyle="text-align:center" style="width: 10%">
                <template #body="slotProps">
                  <Button
                    v-if="slotProps.index != 0"
                    icon="pi pi-arrow-up"
                    class="p-button-rounded p-button-primary p-button-text"
                    @click="up(slotProps.index)"
                  />
                  <Button
                    v-if="account_detail.length - 1 > slotProps.index"
                    icon="pi pi-arrow-down"
                    class="p-button-rounded p-button-primary p-button-text"
                    @click="down(slotProps.index)"
                  />
                </template>
              </Column> -->
              <Column
                header="ลบ"
                bodyStyle="text-align:center"
                style="width: 5%"
              >
                <template #body="slotProps">
                  <Button
                    icon="pi pi-times"
                    class="p-button-rounded p-button-danger p-button-text"
                    @click="confirmDeleteDetail(slotProps.data)"
                  />
                </template>
              </Column>
              <Column
                header="เพิ่ม"
                bodyStyle="text-align:center"
                style="width: 5%"
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
          <div class="mt-2">
            <Button
              @click="onSave"
              label="บันทึกรายวัน"
              icon="pi pi-save"
              class="w-auto p-button-success"
            ></Button>
          </div>
        </div>
      </div>
      <Dialog
        v-model:visible="deleteDetailDialog"
        :style="{ width: '450px' }"
        header="แจ้งเตือน"
        :modal="true"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
          <span
            >คุณแน่ใจหรือไม่ที่จะลบ
            <b>{{ detail.accountname }}</b> ?</span
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

      <DialogForm
        :confirmDialog="deleteDetailDialog"
        :textContent="conDelete"
        v-on:close="onClose"
        v-on:confirm="confirmSave"
      ></DialogForm>

      <DialogForm
        :confirmDialog="confirmSaveDialog"
        :textContent="conSave"
        v-on:close="onClose"
        v-on:confirm="confirmSave"
      ></DialogForm>
    </MainContentWarp>
  </AppLayout>
</template>
