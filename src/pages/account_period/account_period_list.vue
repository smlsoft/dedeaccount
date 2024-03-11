<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import AccountPeriodDataService from "@/services/AccountPeriodService";
import { ref, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import DatePicker from "@/components/widget/DatePicker.vue";
import dayjs from "dayjs";
import { FilterMatchMode, FilterOperator } from "primevue/api";
import DialogForm from "@/components/DialogForm.vue";
import Utils from "@/utils/";

const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const storeApp = useApp();
const toast = useToast();
const loading = ref(false);
const data_list = ref([
  {
    guidfixed: "",
    startdate: "",
    enddate: "",
    period: "",
    description: "",
    isdisabled: false,
  },
]);

const dialogAccountPeriod = ref(false);
const dialogAccountPeriodSingle = ref(false);
const accountPeriodModeSelect = ref(1);
const startDate = ref(new Date());
const endDate = ref(new Date());
const startAccountPeriod = ref();
const countAccountPeriod = ref(12);
const description = ref("");
const statusAccountPeriod = ref(false);

const deleteDialog = ref(false);
const deleteData = ref([]);
const dialogMode = ref(0);
const editGuidfixed = ref("");

const selectedAccountPeriod = ref([]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

onMounted(() => {
  getAccountPeriod();
  storeApp.setPageTitle("กำหนดงวดบัญชี");
  storeApp.setActivePage("accountPeriod");
});

function getAccountPeriod() {
  loading.value = true;
  AccountPeriodDataService.getAccountPeriod()
    .then((res) => {
      console.log(res);
      if (res.success) {
        res.data.forEach((element) => {
          element.startdateshow = Utils.getDateFormatDMY(element.startdate);
          element.enddateshow = Utils.getDateFormatDMY(element.enddate);
        });
        data_list.value = res.data;
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err.response.data.message);
      toast.add({
        severity: "error",
        summary: "error",
        detail: "ดึงข้อมูลไม่สำเร็จ " + err.response.data.message,
        life: 3000,
      });
    });
}

function opendialogAccountPeriodSingle() {
  dialogMode.value = 0;
  dialogAccountPeriodSingle.value = true;
  if (data_list.value.length != 0) {
    // หาจำนวนงวดเริ่มต้นที่มากที่สุด
    let maxValue = Math.max.apply(
      null,
      data_list.value.map(function (o) {
        return o.period;
      })
    );
    startAccountPeriod.value = maxValue + 1;
  } else {
    startAccountPeriod.value = 1;
  }
  countAccountPeriod.value = 1;
}

function opendialogAccountPeriod() {
  dialogAccountPeriod.value = true;

  if (data_list.value.length != 0) {
    // หาจำนวนงวดเริ่มต้นที่มากที่สุด
    let maxValue = Math.max.apply(
      null,
      data_list.value.map(function (o) {
        return o.period;
      })
    );

    startAccountPeriod.value = maxValue + 1;
  } else {
    startAccountPeriod.value = 1;
  }
}

async function saveAccountPeriod() {
  console.log(startDate.value);
  console.log(startAccountPeriod.value);
  console.log(countAccountPeriod.value);

  let genData = [];
  let newStartDate = "";
  let newEndDate = "";
  for (let i = 0; i < countAccountPeriod.value; i++) {
    // เดือน
    if (accountPeriodModeSelect.value == 1) {
      newStartDate = dayjs(startDate.value)
        .add(i, "month")
        .format("YYYY-MM-DD");
      newEndDate = dayjs(startDate.value)
        .add(i + 1, "month")
        .subtract(1, "day")
        .format("YYYY-MM-DD");
      // ไตรมาส
    } else if (accountPeriodModeSelect.value == 2) {
      if (i == 0) {
        newStartDate = dayjs(startDate.value)
          .add(i, "month")
          .format("YYYY-MM-DD");
        newEndDate = dayjs(startDate.value)
          .add(i + 3, "month")
          .subtract(1, "day")
          .format("YYYY-MM-DD");
      } else {
        newStartDate = dayjs(newStartDate).add(3, "month").format("YYYY-MM-DD");
        newEndDate = dayjs(newStartDate)
          .add(3, "month")
          .subtract(1, "day")
          .format("YYYY-MM-DD");
      }
      // ปี
    } else if (accountPeriodModeSelect.value == 3) {
      if (i == 0) {
        newStartDate = dayjs(startDate.value)
          .add(0, "month")
          .format("YYYY-MM-DD");
        newEndDate = dayjs(startDate.value)
          .add(12, "month")
          .subtract(1, "day")
          .format("YYYY-MM-DD");
      } else {
        newStartDate = dayjs(newStartDate)
          .add(12, "month")
          .format("YYYY-MM-DD");
        newEndDate = dayjs(newStartDate)
          .add(12, "month")
          .subtract(1, "day")
          .format("YYYY-MM-DD");
      }
    }

    // data_list.value.push({
    //   startdate: newStartDate,
    //   enddate: newEndDate,
    //   period: startAccountPeriod.value + i,
    //   description: "",
    //   isdisabled: true,
    // });

    genData.push({
      startdate: newStartDate,
      enddate: newEndDate,
      period: startAccountPeriod.value + i,
      description: "",
      isdisabled: false,
    });
  }

  try {
    const res = await AccountPeriodDataService.postAccountPeriodBulk(genData);
    //console.log(res);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
      dialogAccountPeriodSingle.value = false;
      getAccountPeriod();
    }
  } catch (err) {
    console.log(err);
    dialogAccountPeriodSingle.value = false;
    toast.add({
      severity: "error",
      summary: "error",
      detail: "บันทึกไม่สำเร็จ " + err.response.data.message,
      life: 3000,
    });
  }

  console.log(data_list.value);
  dialogAccountPeriod.value = false;
  accountPeriodModeSelect.value = 1;
  startDate.value = new Date();
}

async function saveAccountPeriodSingle() {
  let data = {
    startdate: dayjs(startDate.value).format("YYYY-MM-DD"),
    enddate: dayjs(endDate.value).format("YYYY-MM-DD"),
    period: startAccountPeriod.value,
    description: description.value,
    isdisabled: false,
  };

  try {
    const res = await AccountPeriodDataService.postAccountPeriod(data);
    // console.log(res);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
      startDate.value = new Date();
      endDate.value = new Date();
      description.value = "";
      dialogAccountPeriodSingle.value = false;
      getAccountPeriod();
    }
  } catch (err) {
    console.log(err);
    dialogAccountPeriodSingle.value = false;
    toast.add({
      severity: "error",
      summary: "error",
      detail: "บันทึกไม่สำเร็จ " + err.response.data.message,
      life: 3000,
    });
  }
}

function confirmDelete(data) {
  console.log(data);
  if (selectedAccountPeriod.value.length == 0) {
    deleteData.value.push(data.guidfixed);
  } else {
    selectedAccountPeriod.value.forEach((element) => {
      deleteData.value.push(element.guidfixed);
    });
  }
  console.log(deleteData.value);
  deleteDialog.value = true;
}

async function deleteAccountPeriod() {
  let serviceDeleteAccountPeriod = "";

  if (selectedAccountPeriod.value.length == 0) {
    serviceDeleteAccountPeriod = AccountPeriodDataService.deleteAccountPeriod(
      deleteData.value[0]
    );
  } else {
    serviceDeleteAccountPeriod =
      AccountPeriodDataService.deleteAccountPeriodBulk(deleteData.value);
  }

  try {
    const res = await serviceDeleteAccountPeriod;

    console.log(res);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "ลบข้อมูลสำเร็จ",
        life: 3000,
      });
      deleteData.value = [];
      deleteDialog.value = false;
      getAccountPeriod();
    }
  } catch (err) {
    console.log(err.response.data.message);
    deleteDialog.value = false;
    toast.add({
      severity: "error",
      summary: "error",
      detail: "ลบข้อมูลไม่สำเร็จ " + err.response.data.message,
      life: 3000,
    });
  }
}

function editDetail(data) {
  dialogMode.value = 1;
  editGuidfixed.value = data.guidfixed;
  startDate.value = Utils.getDateTimeFromDate(data.startdate);
  endDate.value = Utils.getDateTimeFromDate(data.enddate);
  description.value = data.description;
  startAccountPeriod.value = data.period;
  statusAccountPeriod.value = !data.isdisabled;

  dialogAccountPeriodSingle.value = true;
}

async function editAccountPeriodSingle() {
  let newData = {
    startdate: dayjs(startDate.value).format("YYYY-MM-DD"),
    enddate: dayjs(endDate.value).format("YYYY-MM-DD"),
    period: startAccountPeriod.value,
    description: description.value,
    isdisabled: !statusAccountPeriod.value,
  };

  try {
    const res = await AccountPeriodDataService.puttAccountPeriod(
      editGuidfixed.value,
      newData
    );
    // console.log(res);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
      dialogAccountPeriodSingle.value = false;
      getAccountPeriod();
    }
  } catch (err) {
    console.log(err);
    dialogAccountPeriodSingle.value = false;
    toast.add({
      severity: "error",
      summary: "error",
      detail: "บันทึกไม่สำเร็จ " + err.response.data.message,
      life: 3000,
    });
  }
}
function onPage(event) {
  console.log(event);
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="card">
        <DataTable
          :value="data_list"
          v-model:selection="selectedAccountPeriod"
          dataKey="guidfixed"
          :paginator="true"
          :rows="12"
          :filters="filters"
          :rowsPerPageOptions="[12, 24, 36, 48, 60, 100]"
          responsiveLayout="scroll"
          stripedRows
          :rowHover="true"
          @page="onPage($event)"
        >
          <template #header>
            <div class="table-header flex justify-content-between flex-wrap">
              <div class="flex align-items-center justify-content-center">
                <Button
                  label="เพิ่มงวดบัญชี"
                  icon="pi pi-plus"
                  class="p-button-success mr-2"
                  @click="opendialogAccountPeriodSingle"
                />
                <Button
                  label="เพิ่มงวดบัญชีอัตโนมัติ"
                  icon="pi pi-play"
                  class="p-button-help mr-2"
                  @click="opendialogAccountPeriod"
                />
                <Button
                  label="ลบข้อมูล"
                  icon="pi pi-trash"
                  class="p-button-danger"
                  @click="confirmDelete"
                  :disabled="
                    !selectedAccountPeriod || !selectedAccountPeriod.length
                  "
                />
              </div>
              <div class="flex align-items-center justify-content-center">
                <span class="p-input-icon-left">
                  <i class="pi pi-search" />
                  <InputText
                    v-model="filters['global'].value"
                    placeholder="Search..."
                  />
                </span>
              </div>
            </div>
          </template>
          <Column selectionMode="multiple" style="width: 3rem"></Column>
          <Column
            field="startdateshow"
            header="จากวันที่"
            :sortable="true"
            style="min-width: 12rem"
          >
          </Column>
          <Column
            field="enddateshow"
            header="ถึงวันที่"
            :sortable="true"
            style="min-width: 16rem"
          ></Column>
          <Column
            field="period"
            header="งวดลำดับที่"
            :sortable="true"
            style="min-width: 8rem"
          >
          </Column>
          <Column
            field="description"
            header="คำอธิบาย"
            :sortable="true"
            style="min-width: 10rem"
          ></Column>
          <Column
            field="isdisabled"
            header="ปิด/เปิด"
            :sortable="true"
            style="min-width: 10rem"
          >
            <template #body="slotProps">
              <InputSwitch
                :modelValue="!slotProps.data.isdisabled"
                style="display: flex"
                class="mt-1"
                :disabled="true"
              />
            </template>
          </Column>
          <Column :exportable="false" style="min-width: 8rem">
            <template #body="slotProps">
              <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-success mr-2"
                @click="editDetail(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-warning"
                @click="confirmDelete(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
      <Dialog
        header="เพิ่มงวดบัญชีอัตโนมัติ"
        v-model:visible="dialogAccountPeriod"
        :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        :style="{ width: '50vw' }"
        :modal="true"
      >
        <div class="grid formgrid p-fluid">
          <div class="field col-12">
            <div class="grid">
              <div
                class="col-12 sm:col-6 lg:col-4 p-3 flex align-items-center sm:justify-content-center sm:border-right-1 border-bottom-1 lg:border-bottom-none surface-border cursor-pointer"
                @click="accountPeriodModeSelect = 1"
              >
                <div class="flex align-items-center mr-3">
                  <RadioButton
                    name="subscription"
                    :value="1"
                    v-model="accountPeriodModeSelect"
                  ></RadioButton>
                </div>
                <div>
                  <span class="text-900 text-2xl font-medium">เดือน</span>
                  <p class="text-xl text-500 font-medium mt-2 mb-0">
                    ตามจำนวนที่กำหนด
                  </p>
                </div>
              </div>
              <div
                class="col-12 sm:col-6 lg:col-4 p-3 flex align-items-center sm:justify-content-center lg:border-right-1 border-bottom-1 lg:border-bottom-none surface-border cursor-pointer"
                @click="accountPeriodModeSelect = 2"
              >
                <div class="flex align-items-center mr-3">
                  <RadioButton
                    name="subscription"
                    :value="2"
                    v-model="accountPeriodModeSelect"
                  ></RadioButton>
                </div>
                <div>
                  <span class="text-900 text-2xl font-medium">ไตรมาส</span>
                  <p class="text-xl text-500 font-medium mt-2 mb-0">
                    + 3 เดือน
                  </p>
                </div>
              </div>
              <div
                class="col-12 sm:col-6 lg:col-4 p-3 flex align-items-center sm:justify-content-center cursor-pointer"
                @click="accountPeriodModeSelect = 3"
              >
                <div class="flex align-items-center mr-3">
                  <RadioButton
                    name="subscription"
                    :value="3"
                    v-model="accountPeriodModeSelect"
                  ></RadioButton>
                </div>
                <div>
                  <span class="text-900 text-2xl font-medium">ปี</span>
                  <p class="text-xl text-500 font-medium mt-2 mb-0">
                    + 12 เดือน
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="field col-12">
            <label class="font-medium text-900">จากวันที่</label>
            <DatePicker
              v-model="startDate"
              dateFormat="d/m/yy"
              :showIcon="true"
              :buddhist="buddhistYear"
              :hideOnDateTimeSelect="false"
              :hiddenTime="true"
            />
          </div>
          <div class="field col-6">
            <label class="font-medium text-900">เริ่มต้นงวด</label>
            <InputNumber v-model="startAccountPeriod" />
          </div>
          <div class="field col-6">
            <label class="font-medium text-900">จำนวนงวด</label>
            <InputNumber v-model="countAccountPeriod" />
          </div>
        </div>

        <template #footer>
          <Button
            label="ยกเลิก"
            icon="pi pi-times"
            @click="dialogAccountPeriod = false"
            class="p-button-text"
          />
          <Button
            label="บันทึก"
            class="p-button-success"
            icon="pi pi-save"
            @click="saveAccountPeriod()"
            autofocus
          />
        </template>
      </Dialog>
      <Dialog
        :header="dialogMode == 0 ? 'เพิ่มงวดบัญชี' : 'แก้ไขงวดบัญชี'"
        v-model:visible="dialogAccountPeriodSingle"
        :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        :style="{ width: '50vw' }"
        :modal="true"
      >
        <div class="grid formgrid p-fluid">
          <div class="field col-6">
            <label class="font-medium text-900">จากวันที่</label>
            <DatePicker
              v-model="startDate"
              dateFormat="d/m/yy"
              :showIcon="true"
              :buddhist="buddhistYear"
              :hideOnDateTimeSelect="false"
              :hiddenTime="true"
            />
          </div>
          <div class="field col-6">
            <label class="font-medium text-900">ถึงวันที่</label>
            <DatePicker
              v-model="endDate"
              dateFormat="d/m/yy"
              :showIcon="true"
              :buddhist="buddhistYear"
              :hideOnDateTimeSelect="false"
              :hiddenTime="true"
            />
          </div>
          <div class="field col-6">
            <label class="font-medium text-900">
              {{ dialogMode == 0 ? "เริ่มต้นงวด" : "งวดลำดับที่" }}</label
            >
            <InputNumber v-model="startAccountPeriod" />
          </div>
          <div class="field col-6">
            <label class="font-medium text-900">รายละเอียด</label>
            <InputText type="text" v-model="description" />
          </div>
          <div class="field col-12" v-if="dialogMode == 1">
            <label class="font-medium text-900">สถานะ</label>
            <InputSwitch
              v-model="statusAccountPeriod"
              style="display: flex"
              class="mt-1"
            />
          </div>
        </div>

        <template #footer>
          <Button
            label="ยกเลิก"
            icon="pi pi-times"
            @click="dialogAccountPeriodSingle = false"
            class="p-button-text"
          />
          <Button
            label="บันทึก"
            class="p-button-success"
            icon="pi pi-save"
            @click="
              dialogMode == 0
                ? saveAccountPeriodSingle()
                : editAccountPeriodSingle()
            "
            autofocus
          />
        </template>
      </Dialog>

      <DialogForm
        :confirmDialog="deleteDialog"
        :textContent="'ต้องการลบข้อมูลงวดบัญชี'"
        v-on:close="deleteDialog = false"
        v-on:confirm="deleteAccountPeriod"
      ></DialogForm>
    </MainContentWarp>
  </AppLayout>
</template>

<style>
.p-datatable-thead .p-checkbox .p-component {
  display: none;
}
</style>
