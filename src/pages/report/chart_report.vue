<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import $ from "jquery";
pdfMake.fonts = {
  Sarabun: {
    normal:
      "http://fonts.gstatic.com/s/sarabun/v12/DtVjJx26TKEr37c9WBJDnlQN9gk.ttf",
    bold: "http://fonts.gstatic.com/s/sarabun/v12/DtVmJx26TKEr37c9YK5sulwm6gDXvwE.ttf",
    italics:
      "http://fonts.gstatic.com/s/sarabun/v12/DtVhJx26TKEr37c9aBBJmnYI5gnOpg.ttf",
    bolditalics:
      "https://fonts.gstatic.com/s/sarabun/v12/DtVkJx26TKEr37c9aBBxJlks7iLSrwFUlw.ttf",
  },
};
const texthead = ref("ต้องการลบข้อมูลผังบัญชี รหัสผังบัญชี");
const chartlistcode = ref("");
const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const detail = ref();
const myFiles = ref();
const data_list = ref([]);
const head_example = ref([]);
const detail_example = ref([]);
const sortField = ref("accountcode");
const isvisible = ref(true);
const sortOrder = ref(1);
const totalItemsCount = ref(1000);
const limitPage = ref(1000);
const filters = ref(null);
const loading = ref(false);
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(20);
const firstPage = ref(0);
const totalPage = ref(1000);
const value1 = ref(0);
const value2 = ref(50);
const interval = ref(null);
const showSkeleton = ref(false);
const import_data = ref([]);
const confirmDeleteDialog = ref(false);
const props = defineProps({
  chartlistcode: Object,
});

const accountCategoryList = ref([
  { name: "สินทรัพย์", code: 1 },
  { name: "หนี้สิน", code: 2 },
  { name: "ทุน", code: 3 },
  { name: "รายได้", code: 4 },
  { name: "ค่าใช้จ่าย", code: 5 },
]);
const accountmaintypeList = ref([
  { name: "1", code: 1 },
  { name: "2", code: 2 },
  { name: "3", code: 3 },
  { name: "4", code: 4 },
]);
const accountbalancetypeList = ref([
  { name: "เดบิต", code: 1 },
  { name: "เครดิต", code: 2 },
]);
const groupAccount_detail = ref([]);

onMounted(() => {
  getAccountChartList();
  // getAccountGroup();
  // getChartListScroll();

  storeApp.setPageTitle("รายงานข้อมูลผังบัญชี");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("chart_report");
});

function newResultmain(data) {
  var result = [];
  result = accountmaintypeList.value.filter((val) => val.code == data);
  return result.length > 0 ? "ใช้งาน" : "ปิด";
}
function newResultCategory(data) {
  var result = [];
  result = accountCategoryList.value.filter((val) => val.code == data);
  return result.length > 0 ? result[0].name : "ไม่พบข้อมูล";
}

function newResultBalance(data) {
  var result = [];
  result = accountbalancetypeList.value.filter((val) => val.code == data);
  return result.length > 0 ? result[0].name : "ไม่พบข้อมูล";
}
function getDate() {
  var date = new Date();
  startDate.value = new Date(date.getFullYear(), date.getMonth(), 1);
  endDate.value = new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function nextPage() {
  activePage.value += 1;
  if (activePage.value <= totalPage.value) {
    getChartListScroll();
  }
}

function onScroll() {
  let div = $("#maincontainer")[0];

  if (!showSkeleton.value) {
    nextPage();
  }
}
function getChartListScroll() {
  showSkeleton.value = true;
  loading.value = true;
  MasterdataService.getAccountChartList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )

    .then((res) => {
      console.log(res);
      if (res.success) {
        setTimeout(() => {
          res.data.forEach((ele) => {
            ele.isUpdate = false;
            data_list.value.push(ele);
          });
          console.log(data_list.value);

          //onsole.log(totalItemsCount.value);

          firstPage.value = activePage.value;

          console.log("firstPage" + firstPage.value);
          showSkeleton.value = false;
        }, 500);
      }
    })
    .catch((err) => {
      console.log(err);
      showSkeleton.value = false;
    });
}

function getAccountChartList() {
  loading.value = true;
  MasterdataService.getAccountChartList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
        data_list.value.forEach((ele) => {
          ele.isUpdate = false;
        });
        totalPage.value = res.pagination.totalPage;
        totalItemsCount.value = res.pagination.total;
        //onsole.log(totalItemsCount.value);
        // getAllSelectImage();
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function getAccountGroup() {
  MasterdataService.getAccountGroup()
    .then((res) => {
      if (res.success) {
        groupAccount_detail.value = res.data;
      }
      // console.log(groupAccount_detail.value);
    })
    .catch((err) => {
      console.log(err);
    });
}

function sortBy(data) {
  console.log(data);
  sortField.value = data.sortField;
  sortOrder.value = data.sortOrder;

  loading.value = true;
  MasterdataService.getAccountChartList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
        totalItemsCount.value = res.pagination.total;
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function goCreate() {
  router.push({ name: "chartCreate" });
}

function goEdit(data) {
  router.push({ name: "chartEdit", params: { id: data.guidfixed } });
}

function keyup() {
  clearTimeout(typingTimer.value);
  typingTimer.value = setTimeout(doneTyping, doneTypingInterval.value);
}
function keydown() {
  clearTimeout(typingTimer.value);
}
function exreport() {
  isvisible.value = true;
}
function doneTyping() {
  activePage.value = 1;
  firstPage.value = 0;
  MasterdataService.getAccountChartList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
        totalItemsCount.value = res.pagination.total;
        console.log(totalItemsCount.value);
      }
      loading.value = false;
    })
    .catch((err) => {
      loading.value = false;
      console.log(err);
    });
}

function deleteDetail() {
  MasterdataService.deleteAccountChart(detail.value.guidfixed)
    .then((res) => {
      console.log(res);
      if (res.success) {
        getAccountChartList(activePage.value);
        toast.add({
          severity: "success",
          summary: "Successful",
          detail: "Deleted",
          life: 3000,
        });
        confirmDeleteDialog.value = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
function onClose() {
  confirmDeleteDialog.value = false;
}
function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
  loading.value = true;

  MasterdataService.getAccountChartList(
    limitPage.value,
    activePage.value,
    filters.value,
    sortField.value,
    sortOrder.value
  )
    .then((res) => {
      //console.log(res);
      if (res.success) {
        data_list.value = res.data;
      }
      loading.value = false;
    })
    .catch((err) => {
      console.log(err);
      loading.value = false;
    });
}

async function exportPDF() {
  var body = [];
  body = await buildFromJson();
  var docDefinition = pageSetup(body);
  pdfMake.createPdf(docDefinition).download("รายงานข้อมูลผังบัญชี.pdf");
}
function pageSetup(data) {
  var docDefinition = {
    content: [
      {
        style: "tableExample",
        table: {
          body: data,
        },
        layout: "lightHorizontalLines",
      },
    ],
    pageOrientation: "portrait",
    pageMargins: [8, 8, 8, 8],
    defaultStyle: {
      font: "Sarabun",
      styles: {
        header: {
          bold: true,
        },
        textdecoration: {
          italics: true,
          alignment: "right",
          decoration: "underline",
          decorationStyle: "double",
        },
        margindetail: {
          margin: [20, 0, 0, 0],
        },
        margintotal: {
          margin: [50, 0, 0, 0],
        },
      },
    },
  };
  return docDefinition;
}

function buildFromJson() {
  var body = [];
  body.push([{ text: localStorage.shop_name }, {}, {}, {}]);
  body.push([{ text: "รายงานข้อมูลผังบัญชี" }, {}, { text: "" }, { text: "" }]);
  body.push([
    { text: "รหัสผังบัญชี", fillColor: "#81d4fa" },
    { text: "ชื่อผังบัญชี", fillColor: "#81d4fa" },
    { text: "รหัสผังบัญชีคุม", fillColor: "#81d4fa" },
    { text: "สถานะ", fillColor: "#81d4fa" },
  ]);

  data_list.value.forEach((data) => {
    body.push([
      { text: data.accountcode },
      { text: data.accountname },
      {
        text: data.consolidateaccountcode,
      },
      { text: newResultmain(data.accountgroup) },
    ]);
  });

  return body;
}

function DownloadExampleExcel() {
  console.log("DownloadExampleExcel");

  head_example.value = ["5555"];
  data_list.value.forEach((data) => {
    detail_example.value.push({
      รหัสผังบัญชี: data.accountcode,
      ชื่อผังบัญชี: data.accountname,
      รหัสผังบัญชีคุม: data.consolidateaccountcode,
      สถานะ: newResultmain(data.accountgroup),
    });
  });
  console.log(data_list.value.accountcode);
  var config = { raw: true, type: "string" };
  var Example = XLSX.utils.json_to_sheet(
    detail_example.value,
    head_example.value,
    config
  );

  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, Example, "รายงานข้อมูลผังบัญชี");
  XLSX.writeFile(wb, "รายงานข้อมูลผังบัญชี.xlsx");
}
// function rowClass(data) {
//   var level = "";
//   if (data.accountlevel === 1) {
//     level = "level1";
//   } else if (data.accountlevel === 2) {
//     level = "level2";
//   } else if (data.accountlevel === 3) {
//     level = "level3";
//   } else if (data.accountlevel === 4) {
//     level = "level4";
//   } else {
//     level = "level5";
//   }
//   if (data.accountcode === data.consolidateaccountcode) {
//     level = "level7";
//   } else {
//   }
//   return level;
//   // if (data.accountlevel >= 1 && data.accountlevel <= 4) {
//   //   return "level" + data.accountlevel;
//   // } else if (data.accountcode === data.consolidateaccountcode) {
//   //   return "level7";
//   // } else {
//   //   return "level5";
//   // }
// }
function rowClass(data) {
  var level = "";
  if (data.accountlevel === 1) {
    level = "level1";
  } else if (data.accountlevel === 2) {
    level = "level2";
  } else if (data.accountlevel === 3) {
    level = "level3";
  } else if (data.accountlevel === 4) {
    level = "level4";
  } else {
    level = "level5";
  }
  if (data.accountcode === data.consolidateaccountcode) {
    level = "level7";
  } else {
  }
  return level;
}
</script>

<template>
  <AppLayout>
    <MainContentWarp @scroll="onScroll">
      <div class="field mb-12 col-12 md:col-12">
        <i class="pi pi-book" style="font-size: 2rem"> รายงานทางการเงิน</i>
      </div>
      <ProgressBar
        v-if="loading"
        :value="(1, 100)"
        style="height: 1em; font-size: 14px"
      />

      <div class="p-2 surface-section flex-auto">
        <div class="grid mt-2" v-if="isvisible">
          <div class="col-12">
            <h2 for="selectedgroup" class="font-medium text-900">
              รายงานรหัสบัญชี
            </h2>
            <DataTable
              :value="data_list"
              dataKey="accountcode"
              class="p-datatable-sm"
              stripedRows
              responsiveLayout="scroll"
              @sort="sortBy"
              :rowClass="rowClass"
            >
              <template #header>
                <div class="flex justify-content-between">
                  <div>
                    <div class="flex">
                      <div class="flex">
                        <Button
                          label="ส่งออก Excel"
                          class="p-button-primary"
                          icon="pi pi-file-excel"
                          @click="DownloadExampleExcel()"
                        />
                      </div>
                      <div class="flex ml-2">
                        <Button
                          label="ส่งออก PDF"
                          icon="pi pi-file-pdf"
                          class="p-button-primary"
                          @click="exportPDF()"
                        />
                      </div>
                    </div>
                  </div>
                  <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText
                      v-model="filters"
                      placeholder="ค้นหา...."
                      @keyup="keyup()"
                      @keydown="keydown()"
                    />
                  </span>
                </div>
              </template>
              <template #loading :loading="loading"> กำลังประมวลผล </template>

              <Column
                field="accountcode"
                header="รหัสผังบัญชี"
                :sortable="true"
              ></Column>
              <Column
                field="accountname"
                header="ชื่อผังบัญชี"
                class="accountname"
                :sortable="true"
              ></Column>
              <Column
                field="consolidateaccountcode"
                header="รหัสผังบัญชีคุม"
                :sortable="true"
              ></Column>
              <Column field="accountgroup" header="สถานะ" :sortable="true">
                <template #body="{ data, field }">
                  {{ newResultmain(data[field]) }}
                </template></Column
              >
            </DataTable>
          </div>
        </div>
      </div>

      <div>
        <DialogForm
          :confirmDialog="confirmDeleteDialog"
          :textContent="texthead"
          :textContent2="chartlistcode"
          v-on:close="onClose"
          v-on:confirm="deleteDetail"
        ></DialogForm>
      </div>
    </MainContentWarp>
  </AppLayout>
</template>

<style>
.level1 .accountname {
  font-weight: 900;
}

.level2 .accountname {
  padding-left: 20px !important;
}

.level3 .accountname {
  padding-left: 40px !important;
}

.level4 .accountname {
  padding-left: 60px !important;
}

.level5 .accountname {
  padding-left: 70px !important;
}

.level6 .accountname {
  padding-left: 80px !important;
}
.level7 .accountcode {
  font-weight: 900;
}
.level7 .accountname {
  padding-left: 60px !important;
  font-weight: 900;
}
</style>
