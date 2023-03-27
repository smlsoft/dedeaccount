<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import DialogForm from "@/components/form/DialogForm.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import AccountPeriodDataService from "@/services/AccountPeriodService";
import { ref, onMounted } from "vue";
import { useApp } from "@/stores/app.js";
import { useToast } from "primevue/usetoast";
import Utils from "@/utils/";

import dataList from "./list.vue";
import dataForm from "./form.vue";

const storeApp = useApp();
const toast = useToast();
const data_list = ref([]);
const totalItemsCount = ref(0);
const loading = ref(true);
const activePage = ref(1);
const filters = ref(null);
const sortField = ref("period");
const sortOrder = ref(1);
const limitPage = ref(20);

const form_model = ref({
  guidfixed: "",
  startdate: "",
  enddate: "",
  period: "",
  description: "",
  isdisabled: false,
});
const form_valid = ref({
  startdate: true,
  enddate: true,
  period: true,
  description: true,
});

const screenHeight = window.screen.height;
const startDateFocus = ref(false);
const readMode = ref(false);

onMounted(() => {
  getAccountPeriod();
  storeApp.setPageTitle("งวดบัญชี");
  storeApp.setActivePage("master");
  storeApp.setActiveChild("account_period");
});

function getAccountPeriod() {
  loading.value = true;
  AccountPeriodDataService.getAccountPeriod(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        res.data.forEach((element) => {
          element.startdateshow = Utils.getDateFormatDMY(element.startdate);
          element.enddateshow = Utils.getDateFormatDMY(element.enddate);
        });
        data_list.value = res.data;
        totalItemsCount.value = res.pagination.total;
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

function createAccountPeriod() {
  clearForm();
  startDateFocus.value = true;
  readMode.value = false;
}

function clearForm() {
  readMode.value = true;
  form_model.value = {
    guidfixed: "",
    startdate: "",
    enddate: "",
    period: "",
    description: "",
    isdisabled: false,
  };

  form_valid.value = {
    startdate: true,
    enddate: true,
    period: true,
    description: true,
  };
}

function selectedStartDate(data) {
  form_model.value.startdate = data;
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <Splitter style="height: 100vh">
        <SplitterPanel :minSize="screenHeight <= 768 ? 46 : 42">
          <dataList
            :data_list="data_list"
            :totalItemsCount="totalItemsCount"
            v-on:startDateFocus="createAccountPeriod"
          ></dataList>
        </SplitterPanel>
        <SplitterPanel :minSize="30">
          <dataForm
            :form_model="form_model"
            :form_valid="form_valid"
            :startDateFocus="startDateFocus"
            :readMode="readMode"
          ></dataForm>
        </SplitterPanel>
      </Splitter>
    </MainContentWarp>
  </AppLayout>
</template>
<style>
.p-dialog.p-component.p-ripple-disabled {
  background-color: #fff;
}
</style>
