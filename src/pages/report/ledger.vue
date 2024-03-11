<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-card p-3 shadow-2 border-round">
        <!-- <div class="flex flex-column" v-if="isvisible">
         
          <div class="flex align-items-center">
            <Button
              label="ค้นหา"
              icon="pi pi-cog"
              @click="reloadRoute()"
              class="p-button-rounded mr-2"
            ></Button>
          </div>
        </div> -->

        <div class="px-1 surface-section flex-auto">
          <div class="card p-2">
            <div class="flex flex-column" v-if="isvisible">
              <div id="textbox">
                <div>
                  <span style="font-weight: bold; font-size: 30px">{{
                    $t("ledger")
                  }}</span>
                  <br />
                  <br />
                  <span style="font-weight: bold" class="alignleft"
                    >{{ $t("sincetime") }} : &nbsp; {{ startDateShow }}</span
                  >&nbsp; &nbsp;

                  <span style="font-weight: bold">
                    {{ $t("totime") }} : &nbsp; {{ endDateShow }}</span
                  >
                  &nbsp;

                  <br />
                  <span style="font-weight: bold" class="alignleft">
                    <br />
                    {{ nameCheck(accountcode1) }}&nbsp;
                  </span>

                  <span style="font-weight: bold" class="alignleft">
                    {{ nameCheck2(accountcode2) }}&nbsp;
                  </span>
                  <div class="alignright">
                    <Button
                      label="ส่งออก Excel"
                      icon="pi pi-file-excel"
                      class="p-button-primary"
                      @click="dswitch(1)"
                      :disabled="isvisible === false"
                    >
                      <i class="pi pi-file-excel"></i>

                      <label style="text-align: center; margin: auto"
                        >{{ $t("export") }} Excel</label
                      ></Button
                    >
                    &nbsp;

                    <Button
                      label="ส่งออก PDF"
                      icon="pi pi-file-pdf"
                      class="p-button-primary"
                      @click="dswitch(2)"
                      :disabled="isvisible === false"
                    >
                      <i class="pi pi-file-pdf"></i>

                      <label style="text-align: center; margin: auto"
                        >{{ $t("export") }} PDF</label
                      ></Button
                    >
                    &nbsp;
                    <Button
                      label="ค้นหา"
                      icon="pi pi-cog"
                      @click="reloadRoute()"
                      class="p-button-rounded mr-2"
                    >
                      <i class="pi pi-cog"></i>

                      <label style="text-align: center; margin: auto"
                        >{{ $t("search") }}
                      </label></Button
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DataTable
            v-if="isvisible"
            :value="newData"
            rowGroupMode="subheader"
            groupRowsBy="accountcodegroup"
            sortMode="single"
            :sortOrder="1"
            scrollable
            :loading="loading"
            scrollHeight="80vh"
            class="p-datatable-sm"
            v-model:selection="selectedRow"
            selectionMode="single"
            @row-click="rowClick"
            breakpoint="960px"
            responsiveLayout="stack"
            style="z-index: 0; width: 100%"
          >
            <template #empty> No records found </template>
            <template #loading>
              <ProgressSpinner animationDuration="50s"
            /></template>
            <ColumnGroup type="header">
              <Row>
                <Column
                  style="
                    flex-direction: column !important;
                    font-weight: 700;
                    background-color: rgb(234, 234, 234);
                    border-width: 1px;
                    border-bottom-color: white;
                    width: 8%;
                    align-items: top;
                  "
                >
                  <template #header>
                    <span style="font-size: 18px">{{
                      $t("account_code")
                    }}</span></template
                  >
                </Column>
                <Column
                  style="
                    flex-direction: column !important;
                    font-weight: 700;
                    background-color: rgb(234, 234, 234);
                    border-width: 1px;
                    border-bottom-color: white;
                    width: 15%;
                  "
                >
                  <template #header>
                    <span style="font-size: 18px">{{
                      $t("account_name")
                    }}</span></template
                  >
                </Column>
                <Column
                  :colspan="5"
                  style="
                    flex-direction: column !important;
                    font-weight: 700;
                    background-color: rgb(234, 234, 234);
                    border-width: 1px;
                    border-bottom-color: white;
                    width: 80%;
                  "
                >
                </Column>
              </Row>
              <Row>
                <Column
                  style="
                    flex-direction: column !important;
                    font-weight: 700;
                    background-color: rgb(234, 234, 234);
                    border-width: 1px;
                    border-bottom-color: white;
                    width: 10%;
                  "
                >
                  <template #header>
                    <span style="font-size: 18px">{{
                      $t("date")
                    }}</span></template
                  >
                </Column>
                <Column
                  style="
                    flex-direction: column !important;
                    font-weight: 700;
                    background-color: rgb(234, 234, 234);
                    border-width: 1px;
                    border-bottom-color: white;
                    max-width: 15%;
                  "
                >
                  <template #header>
                    <span style="font-size: 18px">{{
                      $t("docno")
                    }}</span></template
                  >
                </Column>
                <Column
                  :colspan="2"
                  style="
                    flex-direction: column !important;
                    font-weight: 700;
                    background-color: rgb(234, 234, 234);
                    border-width: 1px;
                    border-bottom-color: white;
                    max-width: 80%;
                  "
                >
                  <template #header>
                    <span style="font-size: 18px">{{
                      $t("description")
                    }}</span></template
                  >
                </Column>

                <Column
                  style="
                    flex-direction: column !important;
                    font-weight: 700;
                    background-color: rgb(234, 234, 234);
                    border-width: 1px;
                    border-bottom-color: white;
                    max-width: 10px;
                  "
                >
                  <template #header>
                    <span style="font-size: 18px">{{
                      $t("debit")
                    }}</span></template
                  >
                </Column>
                <Column
                  style="
                    flex-direction: column !important;
                    font-weight: 700;
                    background-color: rgb(234, 234, 234);
                    border-width: 1px;
                    border-bottom-color: white;
                    max-width: 10px;
                  "
                >
                  <template #header>
                    <span style="font-size: 18px">{{
                      $t("credit")
                    }}</span></template
                  >
                </Column>
                <Column
                  style="
                    flex-direction: column !important;
                    font-weight: 700;
                    background-color: rgb(234, 234, 234);
                    border-width: 1px;
                    border-bottom-color: white;
                    max-width: 10px;
                  "
                >
                  <template #header>
                    <span style="font-size: 18px">{{
                      $t("amount")
                    }}</span></template
                  >
                </Column>
              </Row>
            </ColumnGroup>

            <Column
              class="align-items-start"
              field="docdate"
              header="accountcodegroup"
              style="border-width: 1px; max-width: 7.8%"
            >
              <template #body="slotProps">
                <span
                  v-if="
                    slotProps.data.docdate != '' &&
                    slotProps.data.docdate != undefined
                  "
                >
                  {{ dateCheck(slotProps.data.docdate) }}</span
                >
              </template>
            </Column>
            <Column
              class="align-items-start"
              field="docno"
              style="border-width: 1px; max-width: 14.5%"
            >
              <template #body="slotProps">
                <div class="card" style="width: 100%">
                  <div>
                    <span class="flex-item">
                      <span style="margim-bottom: 10px"
                        >{{ slotProps.data.docno }}
                      </span>
                      <i
                        class="pi pi-file mr-1 text-primary-700 alignright"
                        v-if="slotProps.data.countvat > 0"
                        :label="slotProps.data.countvat.toString()"
                        icon="pi pi-file"
                        v-tooltip="
                          'ภาษีมูลค่าเพิ่ม' +
                          '(' +
                          slotProps.data.countvat.toString() +
                          ')'
                        "
                      ></i>
                      <i
                        class="pi pi-file mr-1 text-yellow-700 alignright"
                        v-if="slotProps.data.counttax > 0"
                        :label="slotProps.data.counttax.toString() + ')'"
                        icon="pi pi-file"
                        v-tooltip="
                          'ภาษีหัก ณ ที่จ่าย' +
                          '(' +
                          slotProps.data.counttax.toString() +
                          ')'
                        "
                      ></i>
                      <i
                        class="pi pi-image mr-1 text-green-700 alignright"
                        v-if="slotProps.data.countimage == 1"
                        :label="slotProps.data.countimage.toString()"
                        v-tooltip="
                          'รูปภาพ' +
                          '(' +
                          slotProps.data.countimage.toString() +
                          ')'
                        "
                      ></i>
                      <i
                        class="pi pi-images mr-1 text-yellow-700 alignright"
                        v-if="slotProps.data.countimage > 1"
                        :label="slotProps.data.countimage.toString()"
                        v-tooltip="
                          'รูปภาพ' +
                          '(' +
                          slotProps.data.countimage.toString() +
                          ')'
                        "
                      ></i>
                      <!-- <Chip
                          v-if="slotProps.data.countvat > 0"
                          :label="slotProps.data.countvat.toString()"
                          icon="pi pi-file"
                          class="mr-1 text-primary-700"
                          v-tooltip="'ภาษีมูลค่าเพิ่ม'"
                        />

                        <Chip
                          v-if="slotProps.data.counttax > 0"
                          :label="slotProps.data.counttax.toString()"
                          class="mr-1 text-yellow-700"
                          icon="pi pi-file"
                          v-tooltip="'ภาษีหัก ณ ที่จ่าย'"
                        />
                        <Chip
                          v-if="slotProps.data.countimage > 0"
                          :label="slotProps.data.countimage.toString()"
                          v-tooltip="'รูปภาพ'"
                          icon="pi pi-image "
                        /> -->
                    </span>
                    <span class="flex-item">
                      <!-- <Chip
                          v-if="slotProps.data.countvat > 0"
                          :label="slotProps.data.countvat.toString()"
                          icon="pi pi-file"
                          class="mr-1 text-primary-700"
                          v-tooltip="'ภาษีมูลค่าเพิ่ม'"
                        />

                        <Chip
                          v-if="slotProps.data.counttax > 0"
                          :label="slotProps.data.counttax.toString()"
                          class="mr-1 text-yellow-700"
                          icon="pi pi-file"
                          v-tooltip="'ภาษีหัก ณ ที่จ่าย'"
                        />
                        <Chip
                          v-if="slotProps.data.countimage > 0"
                          :label="slotProps.data.countimage.toString()"
                          v-tooltip="'รูปภาพ'"
                          icon="pi pi-image "
                        /> -->
                    </span>
                    <!-- <div class="flex-item"></div> -->
                  </div>
                </div>
              </template></Column
            >
            <Column
              class="align-items-start"
              field="accountdescription"
              style="border-width: 1px; max-width: 31.2%"
              ><template #body="slotProps">
                <span
                  v-if="
                    slotProps.data.accountdescription != '' &&
                    slotProps.data.accountdescription != undefined
                  "
                >
                  {{ slotProps.data.accountdescription }}</span
                >
              </template></Column
            >

            <Column
              style="border-width: 1px; max-width: 15.5%"
              class="align-items-start"
              field="debit"
              bodyStyle="text-align: right;flex-direction: row-reverse; "
              ><template #body="slotProps">
                <span
                  v-if="
                    slotProps.data.debit != '' &&
                    slotProps.data.debit != undefined
                  "
                  >{{ utils.formatNumber(slotProps.data.debit) }}</span
                >
              </template></Column
            >
            <Column
              class="align-items-start"
              style="border-width: 1px; max-width: 15.5%"
              field="credit"
              bodyStyle="text-align: right;flex-direction: row-reverse;"
              ><template #body="slotProps">
                <span
                  v-if="
                    slotProps.data.credit != '' &&
                    slotProps.data.credit != undefined
                  "
                >
                  {{ utils.formatNumber(slotProps.data.credit) }}</span
                >
              </template></Column
            >
            <Column
              class="align-items-start"
              field="amount"
              style="border-width: 1px; max-width: 15.5%"
              bodyStyle="text-align: right;flex-direction: row-reverse; "
              ><template #body="slotProps">
                <span>{{ read55(slotProps.data.amount) }}</span>
              </template></Column
            >
            <template #groupheader="slotProps">
              <span
                v-if="
                  slotProps.data.accountcodegroup != '' &&
                  slotProps.data.accountcodegroup != undefined
                "
                style="
                  font-size: 18px;
                  min-width: 8%;
                  font-weight: 600;
                  min-height: 1000;
                  width: fit-content;
                "
              >
                {{ slotProps.data.accountcodegroup }}
              </span>

              <span
                v-if="
                  slotProps.data.accountnamegroup != '' &&
                  slotProps.data.accountnamegroup != undefined
                "
                style="
                  font-size: 18px;
                  min-width: 83%;
                  font-weight: 600;
                  min-height: 99%;
                  border-top: 10cm;
                "
              >
                {{ slotProps.data.accountnamegroup }}</span
              >
            </template>
          </DataTable>
        </div>
      </div>

      <Dialog
        v-model:visible="showSearch"
        :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        :style="{ width: '50vw' }"
        :modal="true"
      >
        <template #header>
          <i class="pi pi-cog" style="font-size: 1.5rem"> ค้นหา</i>
        </template>

        <div class="grid p-fluid formgrid">
          <div class="field mb-4 col-6 md:col-3 ml-0">
            <label for="startDate" class="font-medium text-900"
              >{{ $t("from_acc_code") }}
            </label>

            <Dropdown
              v-model="accountcode"
              :showClear="true"
              :filter="true"
              :filterFields="['accountcode', 'accountname']"
              field="accountcode"
              :options="groups"
              filterPlaceholder="ค้นหา"
              placeholder="เลือกทั้งหมด"
              @change="selectAccount($event)"
              optionLabel="label"
              optionValue="accountcode"
            >
            </Dropdown>
          </div>
          <div class="field mb-4 col-6 md:col-3 ml-0">
            <label for="endDate" class="font-medium text-900"
              >{{ $t("to_acc_code") }}
            </label>
            <Dropdown
              :disabled="state == false"
              v-model="accountcode2"
              :showClear="true"
              :filter="true"
              :filterFields="['accountcode', 'accountname']"
              field="accountcode"
              :options="groups"
              filterPlaceholder="ค้นหา"
              placeholder="เลือก"
              @change="selectAccount2($event)"
              optionLabel="label"
              optionValue="accountcode"
            />
          </div>
          <div class="field mb-4 col-6 md:col-3">
            <div class="field-checkbox">
              <Checkbox v-model="result" :binary="true" @change="addall()" />
              <label>{{ $t("acctive_ac") }}</label>
            </div>
            <div class="field-checkbox">
              <Checkbox v-model="state" :binary="true" @change="switchOn()" />
              <label>{{ $t("range_acc") }}</label>
            </div>
          </div>

          <div class="field col-12 md:col-6">
            <label for="startDate" class="font-medium text-900"
              >{{ $t("sincetime") }} :</label
            >
            <DatePicker
              class="field mb-12 col-12 md:col-12"
              dateFormat="d/m/yy"
              v-model="startDate"
              :modelValue="startDate"
              :showIcon="true"
              :buddhist="buddhistYear"
              :hideOnDateTimeSelect="true"
              :hiddenTime="true"
            />
          </div>
          <div class="field col-12 md:col-6">
            <label for="endDate" class="font-medium text-900"
              >{{ $t("totime") }} :</label
            >
            <DatePicker
              class="field mb-10 col-12 md:col-12"
              dateFormat="d/m/yy"
              v-model="endDate"
              :modelValue="endDate"
              :showIcon="true"
              :buddhist="buddhistYear"
              :hideOnDateTimeSelect="true"
              :hiddenTime="true"
            />
          </div>

          <div class="field-checkbox col-12 md:col-12 p-button-outlined">
            <Button
              class="text-center"
              label="จัดทำรายงาน"
              icon="pi pi-book"
              iconPos="left"
              @click="exportreport()"
              ><i class="pi pi-book"></i>

              <label style="text-align: center; margin: auto"
                >{{ $t("process") }}
              </label></Button
            >
          </div>
        </div>
      </Dialog>
      <Dialog
        v-model:visible="openDetailDocNo"
        :breakpoints="{ '960px': '90vw', '640px': '100vw' }"
        :style="{ width: '50vw' }"
      >
        <template #header>
          <h3>
            {{ daily_form.docno }}
            <i
              class="pi pi-pencil text-yellow-500 hover:text-blue-500 cursor-pointer"
              @click="goDetail(daily_form.guidfixed)"
            ></i>
          </h3>
        </template>
        <div class="confirmation-content" id="boxconfirm" style="height: 70vh">
          <TabView class="tabview-custom" ref="tabview">
            <TabPanel>
              <template #header>
                <i class="pi pi-book mr-1"></i>
                <span> {{ $t("journal") }}</span>
              </template>
              <JournalForm
                :isUpdate="readMode"
                :daily_form="daily_form"
                :daily_form_valid="daily_form_valid"
              >
              </JournalForm>
            </TabPanel>
            <TabPanel>
              <template #header>
                <i class="pi pi-wallet mr-1"></i>
                <span> {{ $t("vat") }}</span>
              </template>
              <VatForm
                :isUpdate="readMode"
                :vats="vats"
                :vats_valid="vats_valid"
              ></VatForm>
            </TabPanel>
            <TabPanel>
              <template #header>
                <i class="pi pi-wallet mr-1"></i>
                <span> {{ $t("taxes") }}</span>
              </template>
              <TaxForm
                :isUpdate="readMode"
                :taxes="taxes"
                :taxes_valid="taxes_valid"
              ></TaxForm>
            </TabPanel>
            <TabPanel v-if="showTabImage">
              <template #header>
                <i class="pi pi-image mr-1"></i>
                <span> {{ $t("img") }}</span>
              </template>
              <Galleria
                :value="dataImage"
                :showThumbnails="false"
                :circular="true"
                :showIndicators="dataImage.length > 1"
                containerStyle="max-width: 100%"
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
                            Utils.getDateTimeFormat(slotProps.item.uploadedat)
                          "
                          icon="pi pi-calendar"
                          class="mr-2 mt-2"
                        />
                      </div>
                    </div>
                    <div class="col-12">
                      <div
                        class="relative"
                        style="
                          margin: 0px;
                          padding: 0px;
                          width: 100%;
                          height: 63vh;
                        "
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
                    </div>
                  </div>
                </template>
              </Galleria>

              <!-- <Galleria
                :value="dataImage.imagereferences"
                :circular="true"
                thumbnailsPosition="top"
                :show-thumbnails="dataImage.imagereferences.length > 1"
                v-model:activeIndex="activeIndexList"
                :numVisible="
                  dataImage.imagereferences.length > 10
                    ? 10
                    : dataImage.imagereferences.length
                "
              >
                <template #header>
                  <div class="flex justify-content-between mb-2">
                    <div class="flex">
                      {{ $t("img_name") }} :
                      {{ dataImage.imagereferences[[activeIndexList]].name }}
                    </div>
                    <div class="flex">
                      {{ $t("date") }} :{{
                        Utils.getDateTimeFormat(
                          dataImage.imagereferences[[activeIndexList]]
                            .uploadedat
                        )
                      }}
                      {{ $t("by") }}
                      {{
                        dataImage.imagereferences[[activeIndexList]].uploadedby
                      }}
                    </div>
                  </div>
                </template>
                <template #item="slotProps">
                  <div
                    style="margin: 0px; padding: 0px; width: 100%; height: 60vh"
                  >
                    <iframe
                      :name="slotProps.item.imageuri"
                      :src="
                        '/images_group/components/zoom?uri=' +
                        slotProps.item.imageuri
                      "
                    >
                    </iframe>
                  </div>
                </template>
                <template #thumbnail="slotProps">
                  <img
                    :src="slotProps.item.imageuri"
                    style="width: 50px; height: 50px"
                  />
                </template>
              </Galleria> -->
            </TabPanel>
          </TabView>
        </div>
      </Dialog>
    </MainContentWarp>
  </AppLayout>
</template>

<script setup>
/* eslint-disable */
import ReportService from "@/services/ReportDataService";
import AppLayout from "@/components/layout/AppLayout.vue";
import JournalForm from "../daily/components/journal_form.vue";
import VatForm from "../daily/components/vat_form.vue";
import TaxForm from "../daily/components/tax_form.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import ImageDataService from "@/services/ImageDataService";
import MasterdataService from "@/services/MasterdataService";
import { ref, onMounted } from "vue";
import TrialBalance from "./components/tableTrialBalance.vue";
import Ledger from "./components/tableLedger.vue";
import pdfMake from "pdfmake/build/pdfmake";
import { useApp } from "@/stores/app.js";
import $ from "jquery";
import Utils from "@/utils/";
import DatePicker from "@/components/widget/DatePicker.vue";
import XLSX from "xlsx";
import router from "../../router";
import { useToast } from "primevue/usetoast";
import utils from "../../utils";
const detail = ref();
const textContent = ref("ต้องการลบข้อมูลรายวัน เลขที่เอกสาร");
const taxes = ref([]);
const readMode = ref(true);
const activeIndexList = ref(0);
const taxes_valid = ref([
  {
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  },
]);
const vats = ref([]);
const selectedRow = ref();

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
const dailynum = ref("");
const head_example = ref([]);
const detail_example = ref([]);
const Dswitch = ref(false);
const detail_examplenumbertwo = ref([]);
const daily_form = ref([]);
const textChart = ref("");
const showTabImage = ref(false);
const showSearch = ref(true);
const toast = useToast();
const deleteDetailDialog = ref(false);
const totalItemsCount = ref(0);
const filters = ref(null);
const loading = ref(true);
const selectAll = ref("");
const activePage = ref(1);
const typingTimer = ref(null);
const doneTypingInterval = ref(1000);
const firstPage = ref(0);
const accDescript = ref("");
const worm = ref("เลือกทั้งหมด");
const sortField = ref("accountcode");
const sortOrder = ref(1);
const searchItem = ref("");
const limitPage = ref(1000);
const confirmDeleteDialog = ref(false);
const startDateShow = ref();
const endDateShow = ref();
const expandedRows = ref([]);
const openDetailDocNo = ref(false);
const filteredCountries = ref();
const storeApp = useApp();
const isvisible = ref(false);
const isvisible2 = ref(false);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const startDate = ref();
const endDate = ref();
const dataImage = ref([]);
const accountGroup = ref("");
const accountcode = ref([]);
const accountcode1 = ref([]);
const accountgroup = ref("");
const consolidateaccountcode = ref("");
const accountcode2 = ref([]);
const dataaccountcode = ref("");
const state = ref(false);
const group = ref([]);
const data_list = ref([{}]);
const data_listPdf = ref([{}]);
const data_list2 = ref([]);
const docno = ref();
const balance = ref();
const balancenext = ref();
const result = ref(false);
const accountmaintypeList = ref([{ name: "0", code: 1 }]);
3;
const customersGrouped = ref([
  {
    id: 1000,
    name: "James Butt",
    country: {
      name: "Algeria",
      code: "dz",
    },
    company: "Benton, John B Jr",
    date: "2015-09-13",
    status: "unqualified",
    verified: true,
    activity: 17,
    representative: {
      name: "Ioni Bowcher",
      image: "ionibowcher.png",
    },
    balance: 70663,
  },
  {
    id: 1001,
    name: "Josephine Darakjy",
    country: {
      name: "Egypt",
      code: "eg",
    },
    company: "Chanay, Jeffrey A Esq",

    date: "2019-02-09",
    status: "proposal",
    verified: true,
    activity: 0,
    representative: {
      name: "Amy Elsner",
      image: "amyelsner.png",
    },
    balance: 82429,
  },
  {
    id: 1002,
    name: "Art Venere",
    country: {
      name: "Panama",
      code: "pa",
    },
    company: "Chemel, James L Cpa",
    date: "2017-05-13",
    status: "qualified",
    verified: false,
    activity: 63,
    representative: {
      name: "Asiya Javayant",
      image: "asiyajavayant.png",
    },
    balance: 28334,
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
const newData = ref([]);
const props = defineProps({
  daily_form: Object,
  daily_form_valid: Object,
  isUpdate: Boolean,
  accountChart_detail: Array,
  accountBook_detail: Array,
  groupAccount_detail: Array,
  id: String,
});
const groups = ref([
  // { accountcode: "11000", accountname: "สินทรัพย์" },
  // { accountcode: "11001", accountname: "เงินสด" },
  // { accountcode: "11002", accountname: "หนี้สิน" },
]);
const ica = ref(false);

pdfMake.fonts = {
  Sarabun: {
    normal:
      "https://fonts.gstatic.com/s/sarabun/v12/DtVjJx26TKEr37c9WBJDnlQN9gk.ttf",
    bold: "https://fonts.gstatic.com/s/sarabun/v12/DtVmJx26TKEr37c9YK5sulwm6gDXvwE.ttf",
    italics:
      "https://fonts.gstatic.com/s/sarabun/v12/DtVhJx26TKEr37c9aBBJmnYI5gnOpg.ttf",
    bolditalics:
      "https://fonts.gstatic.com/s/sarabun/v12/DtVkJx26TKEr37c9aBBxJlks7iLSrwFUlw.ttf",
  },
};

onMounted(async () => {
  await getAccountChart();

  getDate();
  switchOn();

  //   newResultdocno();
  // console.log(data_list.value);
  // getAccountChartList();
  //   getAccountledger();
  // getGLJournalList();
  checkzero();
  storeApp.setPageTitle("บัญชีแยกประเภท");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("ledger");
});

// async function getAccountChart() {
//   try {
//     const res = await MasterdataService.getAccountChartList(limitPage.value);
//     console.log(res);
//     if (res.success) {
//       groups.value = res.data;
//     }
//   } catch (err) {
//     console.log(err);
//   }
// }
function rowClick(event) {
  console.log(event.data.docno);
  getGLDetail(event.data.docno);
}
function nameCheck(data) {
  if (data == "") {
    return (data = " รหัสผังบัญชีทั้งหมด");
  } else if (data == accountcode1.value && accountcode2.value == "") {
    return (data = "ผังบัญชีที่" + "\n" + ":" + "\n" + accountcode1.value);
  } else {
    return (data =
      "ตั้งแต่ผังบัญชีที่" + "\n" + ":" + "\n" + accountcode1.value);
  }
}
function nameCheck2(data) {
  if (data == "") {
    return (data = "");
  } else if (data == accountcode2.value) {
    return (data = "ถึงผังบัญชีที่" + "\n" + ":" + "\n" + accountcode2.value);
  }
}
async function getAccountChart() {
  try {
    const res = await MasterdataService.getAccountChartList(
      limitPage.value,
      activePage.value,
      filters.value,
      sortField.value,
      sortOrder.value
    );
    console.log(res);
    if (res.success) {
      groups.value = res.data.sort(function (obj1, obj2) {
        return obj1.code - obj2.code;
      });
      groups.value.unshift({
        accountcode: "",
        accountname: "",
      });
      groups.value.forEach((ele) => {
        if (
          (ele.accountcode == null && ele.accountname == null) ||
          (ele.accountcode == "" && ele.accountname == "")
        ) {
          // console.log("this is null");
          worm.value = "เลือกทั้งหมด";
          return (ele.label =
            ele.accountcode + "เลือกทั้งหมด" + ele.accountname);
        } else if (ele.accountcode != "" && ele.accountname != "") {
          worm.value = "~";
          return (ele.label = ele.accountcode + worm.value + ele.accountname);
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
}
function dateCheck(data) {
  if (data == "NaN/NaN/NaN") {
    return "";
  } else if (data.length <= 7) {
    return data;
  } else {
    return Utils.getDateFormatDMY(data);
  }
}
function checkadExceldll() {
  result.value == false;
  console.log(result.value);
  if (result.value == false) {
    result.value == false;
    DownloadExampleExcel();
  } else if (result.value == true) {
    DownloadExampleExcelAll();
  }
}
function getDocumentImageByDocNo(docno) {
  ImageDataService.getDocumentImageByDocNo(docno)
    .then((res) => {
      if (res.success) {
        console.log(res);
        showTabImage.value = true;
        setTimeout(() => {
          dataImage.value = res.data.imagereferences;
        }, 1000);
      }
    })
    .catch((err) => {
      console.log(err + " : ไม่เจอรูป");
      showTabImage.value = false;
    });
}
function dswitch(data) {
  console.log(data);
  if (data == 1) {
    return (Dswitch.value = false), exreportpdf();
  } else if (data == 2) {
    return (Dswitch.value = true), exreportpdf();
  }
  exreportpdf();
}
function getGLDetail(docno) {
  console.log(docno);

  MasterdataService.getGLledger(docno)
    .then((res) => {
      if (res.success) {
        console.log(res);
        getDocumentImageByDocNo(docno);

        openDetailDocNo.value = true;
        const vat = res.data.vats;
        const tax = res.data.taxes;

        daily_form.value.guidfixed = res.data.guidfixed;
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
function puttaxValid() {
  taxes_valid.value.push({
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
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
function addall() {
  // result.value = true;
  console.log(result.value);
}
function switchOn() {
  if (state.value == true) {
    dataaccountcode.value = accountcode1.value + ":" + accountcode2.value;

    textChart.value = "เลือกผังบัญชีเดียว";
  } else if (state.value == false) {
    state.value == false;
    dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;
    textChart.value = "จากผังบัญชีที่";
  }
}

function selectAccount(event) {
  // if ((event.value = "")) {
  //   console.log("emty");
  // }
  console.log(event);
  state.value == false;
  accountcode1.value = event.value;

  console.log(state.value);

  console.log(event.value);

  accountcode1.value = event.value;
  if (accountcode1.value != "") {
    dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;
  } else if (accountcode1.value == "") {
    dataaccountcode.value =
      accountcode1.value + "เลือกทั้งหมด" + accountcode1.value;
  }

  // else if ((state.value = true)) {
  //   dataaccountcode.value = event.value + ":" + event.value;
  // }

  console.log(dataaccountcode.value);
}
function selectAccount2(event) {
  if ((state.value = false)) {
    accountcode2.value = event.value;

    dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;
  } else if ((state.value = true)) {
    state.value = true;
    dataaccountcode.value = accountcode1.value + ":" + accountcode2.value;
  }
  if (accountcode1.value != "" && state.value == false) {
    dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;
  } else if (accountcode1.value == "" && state.value == true) {
    dataaccountcode.value =
      accountcode1.value + "เลือกทั้งหมด" + accountcode2.value;
  }

  state.value = true;
  // accountcode2.value = event.value;
  // dataaccountcode.value = accountcode1.value + ":" + accountcode2.value;
}
function exportreport() {
  exreport2();
  isvisible.value = true;
}
function reloadRoute() {
  location.reload();
}
function read55(data) {
  if (result.value == false) {
    return utils.formatNumberforamount(data);
  }
  {
    return utils.formatNumber(data);
  }
}
function exreport2() {
  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);

  if (dataaccountcode.value == ":") {
    dataaccountcode.value = "";
  }
  isvisible.value = true;
  MasterdataService.getAccountledger(
    startdate,
    enddate,
    dataaccountcode.value,
    (accountgroup.value = ""),
    (consolidateaccountcode.value = "")
  )

    .then((res) => {
      // console.log(res.data);
      startDateShow.value = Utils.getYearBuddhist(startDate.value);
      endDateShow.value = Utils.getYearBuddhist(endDate.value);
      res.data.forEach((element, index) => {
        if (
          element.balance == 0 &&
          element.nextbalance == 0 &&
          element.balance == element.nextbalance &&
          element.details.length > 0
        ) {
          // console.log("1");
          data_list.value.push(element);

          // console.log(data_list.value);
        } else if (
          (element.balance != 0 &&
            element.nextbalance != 0 &&
            element.details.length > 0) ||
          (element.balance == 0 &&
            element.nextbalance != 0 &&
            element.details.length > 0) ||
          (element.balance != 0 &&
            element.nextbalance == 0 &&
            element.details.length > 0)
        ) {
          data_list.value.push(element);
        } else if (element.balance != 0 && element.nextbalance != 0) {
          data_list.value.push(element);
        } else if (
          (element.balance == 0 &&
            element.nextbalance != 0 &&
            element.details.length == 0) ||
          (element.balance != 0 &&
            element.nextbalance == 0 &&
            element.details.length == 0)
        ) {
        } else if (
          element.balance == 0 &&
          element.nextbalance == 0 &&
          element.balance == element.nextbalance &&
          element.details.length == 0 &&
          result.value == true
        ) {
          console.log("5");
          data_list.value.push(element);
        }
      });
      if (res.success) {
        res.data.forEach((data) => {
          group.value = data.details;

          if (
            data.balance == 0 &&
            data.nextbalance != 0 &&
            result.value == false
          ) {
            data.details.unshift({
              docdate: "",
              docno: "",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: utils.formatNumberforamount(data.amount),
              accountcodegroup: data.accountcode,
              accountnamegroup: data.accountname,
            });

            data.details.push({
              docdate: "",
              docno: "ยกไป",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: utils.formatNumberforamount(data.nextbalance),
              // accountcodegroup: data.accountcode,
              // accountnamegroup: data.accountname,
            });
          } else if (result.value == true && data.balance == 0) {
            data.details.unshift({
              docdate: "",
              docno: "ยกมา ",
              accountdescription: "",
              credit: "",
              debit: data.balance,
              amount: utils.formatNumber(data.amount),
              accountcodegroup: data.accountcode,
              accountnamegroup: data.accountname,
            });

            data.details.push({
              docdate: "",
              docno: "ยกไป",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: data.nextbalance,
            });
          } else if (
            data.balance == 0 &&
            data.nextbalance == 0 &&
            data.details.length == 0
          ) {
          } else if (data.balance != 0 && data.nextbalance != 0) {
            // console.log(data.accountcode + "เงื่อนไข 1919191");
            data.details.unshift({
              docdate: "",
              docno: "ยกมา",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: data.balance,
              accountcodegroup: data.accountcode,
              accountnamegroup: data.accountname,
            });

            // data.details.unshift({
            //   docdate: data.accountcode,
            //   docno: data.accountname,
            //   accountdescription: "",
            //   credit: "",
            //   debit: "",
            //   amount: "",
            //   accountcodegroup: data.accountcode,
            //   accountnamegroup: data.accountname,
            // });

            data.details.push({
              docdate: "",
              docno: "ยกไป",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: data.nextbalance,
            });
          } else {
            console.log(data.accountcode + "เงื่อนไขที่3");
            data.details.unshift({
              docdate: "",
              docno: "",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: utils.formatNumberforamount(data.amount),
              accountcodegroup: data.accountcode,
              accountnamegroup: data.accountname,
            });

            data.details.push({
              docdate: "",
              docno: "ยกไป",
              accountdescription: "",
              credit: "",
              debit: "",
              amount: data.nextbalance,
            });
          }

          data.details.forEach((element, index) => {
            newData.value.push(element);
          });
        });

        setTimeout(() => {
          // console.log("newData", newData.value);

          var html = $("tr.p-rowgroup-header td "); //.html();

          for (var i = 0; i < html.length; i++) {
            if (!html[i].innerHTML.includes("span")) {
              // console.log(html[i].innerHTML);
              html[i].style.display = "none";
            }

            // if (!html[i].html().includes("span")) {
            //   console.log(html[i]);
            // }
          }
          // var html2 = $("tr.tabindex=-1");
          // for (var i = 0; i < html2.length; i++) {
          //   if (!html2[i].innerHTML.includes("span")) {
          //     console.log(html2[i].innerHTML);
          //     html2[i].style.display = "none";
          //   }
          // }
          // if (!html.includes("span")) {
          //   console.log($("tr.p-rowgroup-header td"));
          // }
        }, 10);
        setTimeout(() => {
          if (data_list.value == "") {
            group.value = data.details[0];
          }
        }, 100);
        console.log(data_list.value);
        // console.log(res.data);
        if (result.value == true) {
          data_list.value = res.data;
        }
        // console.log(data_list.value);

        console.log(res);
        toast.add({
          severity: "success",
          summary: "จัดทำรายงานสำเร็จ",
          life: 1000,
        });
      }
      showSearch.value = false;
      loading.value = false;
    })

    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "จัดทำรายงานไม่สำเร็จ",
        detail: "โปรดตรวจสอบวันที่และผังบัญชี",
        life: 3000,
      });
      isvisible.value = false;
      loading.value = false;
      console.log(err);
    });
  //   newResultCategory();
  //   getGLJournalList();
  // expandAll();
  loading.value = false;
}
function exreportpdf() {
  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);

  if (dataaccountcode.value == ":") {
    dataaccountcode.value = "";
  }
  isvisible.value = true;
  MasterdataService.getAccountledger(
    startdate,
    enddate,
    dataaccountcode.value,
    (accountgroup.value = ""),
    (consolidateaccountcode.value = "")
  )

    .then((res) => {
      loading.value = true;
      console.log(Dswitch.value);
      if (res.success) {
        data_listPdf.value = res.data;
        if (Dswitch.value == false) {
          checkadExceldll();
        } else {
          exportdowloadPDF();
        }

        setTimeout(() => {}, 100);

        console.log(res);
        toast.add({
          severity: "success",
          summary: "จัดทำรายงานสำเร็จ",
          life: 1000,
        });
      }
      loading.value = false;
    })

    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "จัดทำรายงานไม่สำเร็จ",
        detail: "โปรดตรวจสอบวันที่และผังบัญชี",
        life: 3000,
      });
      isvisible.value = false;
      loading.value = false;
      console.log(err);
    });
  //   newResultCategory();
  //   getGLJournalList();
  // expandAll();
}
//output------
async function exportdowloadPDF() {
  var body = [];
  var enddate = "";
  var startdate = "";
  body = await buildFromJson();

  startdate = Utils.getYearBuddhist(startDate.value);
  enddate = Utils.getYearBuddhist(endDate.value);

  var docDefinition = pageSetup(body, startdate, enddate);
  pdfMake.createPdf(docDefinition).download("บัญชีแยกประเภท.pdf");
}
function pageSetup(data, startdate, enddate) {
  var docDefinition = {
    content: [
      {
        text:
          "รายงานบัญชีแยกประเภท" +
          "\n" +
          localStorage.shop_name +
          "\n" +
          "สิ้นสุด ณ  วันที่" +
          Utils.getDateShowText(enddate) +
          "\n" +
          "\n ",

        style: "header",
        bold: true,
        alignment: "center",
      },

      {
        style: "tableExample",

        table: {
          widths: ["15%", "25%", "13%", "10%", "10%", "10%", "17%"],
          body: data,
        },
        layout: "noBorders",
      },
    ],
    pageOrientation: "lightHorizontalLines",
    pageMargins: [15, 15, 15, 15],
    defaultStyle: {
      font: "Sarabun",
      fontSize: 12,
      columnGap: 20,
      color: "#0A065D",
    },
    styles: {
      header: {
        bold: true,
        alignment: "center",
      },
    },
  };
  return docDefinition;
}
function buildFromJson() {
  var body = [];

  body.push([
    { text: "รหัสบัญชี", style: ["header", "textdecoration"] },
    { text: "ชื่อบัญชี", style: ["header", "textdecoration"] },
    { colSpan: 5, text: "" },
    { text: "" },
    { text: "" },
    { text: "" },
    { text: "" },
  ]);
  body.push([
    { text: "วันที่", style: "header" },
    { text: "เลขที่เอกสาร", style: "header" },
    { colSpan: 2, text: "รายละเอียด", style: "header" },
    { text: "" },
    { text: "เดบิต ", style: "header" },
    { text: "เครดิต", style: "header" },
    { text: "ยอดรวม", style: "header" },
  ]);
  console.log(data_listPdf.value);
  data_listPdf.value.forEach((data) => {
    if (
      data.balance == data.nextbalance &&
      data.balance == 0 &&
      data.nextbalance == 0 &&
      data.details.length > 0
    ) {
      console.log("1");
      body.push([
        {
          text: data.accountcode,
          fillColor: "#d8eaf2",
          style: ["header", "textdecoration"],
        },

        { colSpan: 6, text: data.accountname, fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
      ]);

      body.push([
        { text: "" },

        { text: checkbalanceWord(data.balance) },
        { colSpan: 2, text: "" },
        { text: "" },
        { text: "" },
        { text: "" },
        { text: checkbalance(data.balance), alignment: "center" },
      ]);
      data.details.forEach((details) => {
        // console.log(details);
        body.push([
          { text: Utils.getDateFormatDMY(details.docdate) },
          { text: details.docno },
          { colSpan: 2, text: details.accountdescription },
          { text: "" },
          {
            text: checkzero(Utils.formatNumber(details.debit)),
            alignment: "center",
          },
          {
            text: checkzero(Utils.formatNumber(details.credit)),
            alignment: "center",
          },
          { text: Utils.formatNumber(details.amount), alignment: "center" },
        ]);
      });

      body.push([
        { text: "" },
        { text: "ยกไป" },

        { colSpan: 2, text: "", style: ["header", "textdecoration"] },
        {
          text: "",
        },

        { text: "" },
        { text: "" },
        {
          text: data.nextbalance,
          alignment: "center",
        },
      ]);
    } else if (data.balance == 0 && data.nextbalance == 0) {
    } else {
      body.push([
        {
          text: data.accountcode,
          fillColor: "#d8eaf2",
        },

        { colSpan: 6, text: data.accountname, fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
        { text: "", fillColor: "#d8eaf2" },
      ]);

      body.push([
        { text: "" },

        { text: checkbalanceWord(data.balance) },
        { colSpan: 2, text: "" },
        { text: "" },
        { text: "" },
        { text: "" },
        { text: checkbalance(data.balance), alignment: "center" },
      ]);
      data.details.forEach((details) => {
        // console.log(details);
        body.push([
          { text: Utils.getDateFormatDMY(details.docdate) },
          { text: details.docno },
          { colSpan: 2, text: details.accountdescription },
          { text: "" },
          {
            text: checkzero(Utils.formatNumber(details.debit)),
            alignment: "center",
          },
          {
            text: checkzero(Utils.formatNumber(details.credit)),
            alignment: "center",
          },
          { text: Utils.formatNumber(details.amount), alignment: "center" },
        ]);
      });

      body.push([
        { text: "" },
        { text: "ยกไป" },

        { colSpan: 2, text: "", style: ["header", "textdecoration"] },
        {
          text: "",
        },

        { text: "" },
        { text: "" },
        {
          text: checkbalance(data.nextbalance),
          alignment: "center",
        },
      ]);
    }
  });

  return body;
}
function DownloadExampleExcel() {
  result.value == false;
  console.log("DownloadExampleExcel");

  detail_example.value.push(
    {
      1: "รหัสบัญชี",

      2: "ชื่อบัญชี",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
    },
    {
      1: "วันที่",

      2: "เลขที่เอกสาร",
      3: "รายละเอียด",
      4: "เดบิต",
      5: "เครดิต",
      6: "ยอดรวม",
      7: "",
      8: "",
    }
    // {
    //   1: data.accountcode,

    //   2: data.accountname,
    //   3: "",
    //   4: "",
    //   5: "",
    //   6: "",
    //   7: "",
    //   8: "",
    // }
  );
  data_listPdf.value.forEach((data) => {
    if (
      data.balance == data.nextbalance &&
      data.balance == 0 &&
      data.nextbalance == 0 &&
      result.value == false &&
      data.details.length != 0
    ) {
      detail_example.value.push({
        1: data.accountcode,

        2: data.accountname,
        3: "",
        4: "",
        5: "",
        6: "",
        7: "",
        8: "",
      });

      data.details.forEach((details) => {
        // console.log(details);

        detail_example.value.push({
          1: Utils.getDateFormatDMY(details.docdate),

          2: details.docno,
          3: details.accountdescription,
          4: checkzero(Utils.formatNumberforExcel(details.debit)),
          5: checkzero(Utils.formatNumberforExcel(details.credit)),
          6: Utils.formatNumberforExcel(details.amount),
          7: "",
          8: "",
        });
      });
      detail_example.value.push({
        1: "",

        2: "ยกไป",
        3: "",
        4: "",
        5: "",
        6: data.nextbalance,
        7: "",
        8: "",
      });
    } else if (
      data.balance == data.nextbalance &&
      data.balance == 0 &&
      data.nextbalance == 0 &&
      result.value == false &&
      data.details.length == 0
    ) {
      console.log("invalid");
    } else if (
      data.balance != 0 &&
      data.nextbalance == 0 &&
      result.value == false
    ) {
      detail_example.value.push({
        1: data.accountcode,

        2: data.accountname,
        3: "",
        4: "",
        5: "",
        6: "",
        7: "",
        8: "",
      });
      detail_example.value.push({
        1: "",

        2: checkbalaceWord(data.balance),
        3: "",
        4: "",
        5: "",
        6: checkbalance(data.balance),
        7: "",
        8: "",
      });
      data.details.forEach((details) => {
        // console.log(details);

        detail_example.value.push({
          1: Utils.getDateFormatDMY(details.docdate),

          2: details.docno,
          3: details.accountdescription,
          4: checkzero(Utils.formatNumberforExcel(details.debit)),
          5: checkzero(Utils.formatNumberforExcel(details.credit)),
          6: Utils.formatNumberforExcel(details.amount),
          7: "",
          8: "",
        });
      });
      detail_example.value.push({
        1: "",

        2: "ยกไป",
        3: "",
        4: "",
        5: "",
        6: data.nextbalance,
        7: "",
        8: "",
      });
    } else if (
      data.balance == 0 &&
      data.nextbalance != 0 &&
      result.value == false
    ) {
      detail_example.value.push({
        1: data.accountcode,

        2: data.accountname,
        3: "",
        4: "",
        5: "",
        6: "",
        7: "",
        8: "",
      });

      data.details.forEach((details) => {
        // console.log(details);

        detail_example.value.push({
          1: Utils.getDateFormatDMY(details.docdate),

          2: details.docno,
          3: details.accountdescription,
          4: checkzero(Utils.formatNumberforExcel(details.debit)),
          5: checkzero(Utils.formatNumberforExcel(details.credit)),
          6: Utils.formatNumberforExcel(details.amount),
          7: "",
          8: "",
        });
      });
      detail_example.value.push({
        1: "",

        2: "ยกไป",
        3: "",
        4: "",
        5: "",
        6: data.nextbalance,
        7: "",
        8: "",
      });
    } else if (
      data.balance == 0 &&
      data.nextbalance == 0 &&
      data.details.length == 0
    ) {
    } else if (data.balance != 0 && data.nextbalance != 0) {
      detail_example.value.push({
        1: data.accountcode,

        2: data.accountname,
        3: "",
        4: "",
        5: "",
        6: "",
        7: "",
        8: "",
      });
      detail_example.value.push({
        1: "",

        2: "ยกมา",
        3: "",
        4: "",
        5: "",
        6: data.balance,
        7: "",
        8: "",
      });
      data.details.forEach((details) => {
        // console.log(details);

        detail_example.value.push({
          1: Utils.getDateFormatDMY(details.docdate),

          2: details.docno,
          3: details.accountdescription,
          4: checkzero(Utils.formatNumberforExcel(details.debit)),
          5: checkzero(Utils.formatNumberforExcel(details.credit)),
          6: Utils.formatNumberforExcel(details.amount),
          7: "",
          8: "",
        });
      });
      detail_example.value.push({
        1: "",

        2: "ยกไป",
        3: "",
        4: "",
        5: "",
        6: data.nextbalance,
        7: "",
        8: "",
      });
    } else if ((result.value = true)) {
      console.log("restrue");
    } else {
      detail_example.value.push({
        1: data.accountcode,

        2: data.accountname,
        3: "",
        4: "",
        5: "",
        6: "",
        7: "",
        8: "",
      });

      data.details.forEach((details) => {
        // console.log(details);

        detail_example.value.push({
          1: Utils.getDateFormatDMY(details.docdate),

          2: details.docno,
          3: details.accountdescription,
          4: checkzero(Utils.formatNumberforExcel(details.debit)),
          5: checkzero(Utils.formatNumberforExcel(details.credit)),
          6: Utils.formatNumberforExcel(details.amount),
          7: "",
          8: "",
        });
      });
      detail_example.value.push({
        1: "",

        2: "ยกไป",
        3: "",
        4: "",
        5: "",
        6: data.nextbalance,
        7: "",
        8: "",
      });
    }
  });

  var config = { raw: true, type: "string" };
  var Example = XLSX.utils.json_to_sheet(
    detail_example.value,
    detail_examplenumbertwo.value,
    head_example.value,
    config
  );

  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, Example, "รายงานบัญชีแยกประเภท");
  XLSX.writeFile(wb, "รายงานบัญชีแยกประเภท.xlsx");
}
function DownloadExampleExcelAll() {
  console.log("DownloadExampleExcelAll");
  detail_example.value.push(
    {
      1: "รหัสบัญชี",

      2: "ชื่อบัญชี",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
    },
    {
      1: "วันที่",

      2: "เลขที่เอกสาร",
      3: "รายละเอียด",
      4: "เดบิต",
      5: "เครดิต",
      6: "ยอดรวม",
      7: "",
      8: "",
    }
  );
  data_listPdf.value.forEach((data) => {
    detail_example.value.push({
      1: data.accountcode,

      2: data.accountname,
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
    });
    detail_example.value.push({
      1: "",

      2: "ยกมา",
      3: "",
      4: "",
      5: "",
      6: data.balance,
      7: "",
      8: "",
    });
    data.details.forEach((details) => {
      // console.log(details);

      detail_example.value.push({
        1: Utils.getDateFormatDMY(details.docdate),

        2: details.docno,
        3: details.accountdescription,
        4: checkzero(Utils.formatNumberforExcel(details.debit)),
        5: checkzero(Utils.formatNumberforExcel(details.credit)),
        6: Utils.formatNumberforExcel(details.amount),
        7: "",
        8: "",
      });
    });
    detail_example.value.push(
      {
        1: "",

        2: "ยกไป",
        3: "",
        4: "",
        5: "",
        6: data.nextbalance,
        7: "",
        8: "",
      }
      // {
      //   "": "",
      //   "": "",
      //   วันที่: "",
      //   เลขที่เอกสาร: "",
      //   รายละเอียด: "",
      //   เดบิต: "เดบิต",
      //   เครดิต: "เครดิต",
      //   ยอดรวม: "",
      // },
    );
    // detail_example.value.push({
    //   รหัสบัญชี: "รหัสบัญชี",

    //   วันที่: "วันที่",
    //   ชื่อบัญชี: "ชื่อบัญชี",
    //   เลขที่เอกสาร: "เลขที่เอกสาร",
    //   รายละเอียด: "รายละเอียด",
    //   เดบิต: "เดบิต",
    //   เครดิต: "เครดิต",
    //   ยอดรวม: "ยอดรวม",
    // });
  });

  var config = { raw: true, type: "string" };
  var Example = XLSX.utils.json_to_sheet(
    detail_example.value,
    detail_examplenumbertwo.value,
    head_example.value,
    config
  );

  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, Example, "รายงานข้อมูลผังบัญชี");
  XLSX.writeFile(wb, "รายงานข้อมูลผังบัญชี.xlsx");
}
function getDate() {
  var date = new Date();
  startDate.value = new Date(date.getFullYear(), date.getMonth(), 1);
  endDate.value = new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function checkzero(data) {
  // console.log(data);
  if (data == 0) {
    return "";
  } else {
    return data;
  }
}
function checkbalance(data) {
  balance.value = data;
  if (balance.value == 0 && result.value == false) {
    return "";
  } else if (balance == 0 && result.value == true) {
    console.log();
    return data;
  } else {
    // console.log(data);
    return data;
  }
}
function checkbalanceWord(data) {
  if (data == 0 && result.value == false) {
    return;
  } else {
    return "ยกมา";
  }
}

function goDetail(data) {
  console.log(data);
  router.push({
    name: "dailyUpdate",
    params: { id: data, mode: "edit" },
  });
}
</script>
<style lang="scss" scoped>
.bold-font {
  font-weight: bold;
}
.p-datatable-thead tr {
  th {
    flex-direction: column !important;
    font-weight: 700;

    background-color: rgb(234, 234, 234);
    border-width: 1px;
    border-bottom-color: white;
  }
}
::v-deep(.p-rowgroup-header) {
  td {
    background-color: rgb(240, 240, 240);
  }
  span {
    font-size: 12em;
    background-color: rgb(240, 240, 240);

    border-bottom-color: rgb(0, 0, 0);
  }
}
iframe {
  display: block; /* iframes are inline by default */
  background: #000;
  border: none; /* Reset default border */
  height: 100%; /* Viewport-relative units */
  width: 100%;
}

.p-datatable .p-column-header-content {
  flex-direction: column !important;
  font-weight: bold;
}
.p-rowgroup-header {
  background-color: #000;
}
.padding-docno {
  padding-bottom: 5px !important;
}
.p-datatable .p-datatable-tbody {
  tr {
    td {
      text-align: left;
      border: 1px solid #e4e4e4;
      border-width: 0 0 1px 0;
      padding: 1rem 1rem;
    }
  }
}
.box {
  display: flex;
  align-items: right;
  justify-content: right;
}
.hide {
  display: none;
}
.alignleft {
  float: left;
}
.alignright {
  align-items: flex-end;
  float: right;
}
</style>
