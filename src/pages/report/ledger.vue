<template>
  <AppLayout>
    <MainContentWarp>
      <!-- Compact Header -->
      <div class="compact-header">
        <div class="surface-card shadow-1 border-round">
          <div class="p-2">
            <div class="flex align-items-center justify-content-between gap-2 flex-wrap">
              <!-- Title & Filter Button -->
              <div class="flex align-items-center gap-2">
                <i class="pi pi-book text-lg text-primary"></i>
                <h3 class="m-0 text-lg font-semibold text-900">{{ $t("ledger") }}</h3>
              </div>
              
              <!-- Filter Tags -->
              <div v-if="isvisible" class="flex align-items-center gap-1 flex-wrap flex-1 justify-content-center">
                <Chip class="filter-chip-compact">
                  <i class="pi pi-calendar text-xs mr-1"></i>
                  <span class="text-xs">{{ startDateShow }} - {{ endDateShow }}</span>
                </Chip>
                
                <Chip v-if="accountcode1 && accountcode1 !== ''" class="filter-chip-compact">
                  <i class="pi pi-book text-xs mr-1"></i>
                  <span class="text-xs" v-if="!state || !accountcode2 || accountcode2 === ''">
                    {{ accountcode1 }}
                  </span>
                  <span class="text-xs" v-else>
                    {{ accountcode1 }} → {{ accountcode2 }}
                  </span>
                </Chip>
                
                <Chip v-if="custcode && custcode !== ''" class="filter-chip-compact filter-chip-customer">
                  <i class="pi pi-users text-xs mr-1"></i>
                  <span class="text-xs">{{ getCustName() }}</span>
                </Chip>
                
                <Chip v-if="accountbook && accountbook !== ''" class="filter-chip-compact">
                  <i class="pi pi-book text-xs mr-1"></i>
                  <span class="text-xs">{{ getBookName() }}</span>
                </Chip>
                
                <Chip v-if="result" class="filter-chip-compact filter-chip-info">
                  <i class="pi pi-check-circle text-xs mr-1"></i>
                  <span class="text-xs">ทุกบัญชี</span>
                </Chip>
              </div>
              
              <!-- Filter Button -->
              <Button
                icon="pi pi-filter-fill"
                label="ตัวกรอง"
                @click="showSearch = true"
                class="p-button-sm p-button-text"
                severity="secondary"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table Section -->
      <div class="table-container">
        <DataTable
            v-if="isvisible"
            :value="newData"
            rowGroupMode="subheader"
            groupRowsBy="accountcodegroup"
            sortMode="single"
            :sortOrder="1"
            scrollable
            :loading="loading"
            scrollHeight="calc(100vh - 120px)"
            class="p-datatable-sm compact-table"
            v-model:selection="selectedRow"
            selectionMode="single"
            @row-click="handleRowClick"
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
                    <span style="font-size: 13px">{{
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
                    <span style="font-size: 13px">{{
                      $t("account_name")
                    }}</span></template
                  >
                </Column>
                <Column
                  :colspan="5"
                  style="
                    flex-direction: column !important;
                    font-weight: 700;
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
                    <span style="font-size: 13px">{{
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
                    <span style="font-size: 13px">{{
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
                    <span style="font-size: 13px">{{
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
                    <span style="font-size: 13px">{{
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
                    <span style="font-size: 13px">{{
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
                    <span style="font-size: 13px">{{
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
                  {{ formatDate(slotProps.data.docdate) }}</span
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
                      <span style="padding-bottom: 10px"
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
                <span>{{ formatAmount(slotProps.data.amount) }}</span>
              </template></Column
            >
            <template #groupheader="slotProps">
              <span
                v-if="
                  slotProps.data.accountcodegroup != '' &&
                  slotProps.data.accountcodegroup != undefined
                "
                style="
                  font-size: 13px;
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
                  font-size: 13px;
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

      <Dialog
        v-model:visible="showSearch"
        :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
        :style="{ width: '70vw' }"
        :modal="true"
        :dismissableMask="true"
        :draggable="false"
      >
        <template #header>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-search text-primary" style="font-size: 1.25rem"></i>
            <span class="font-bold text-lg">ค้นหารายงานบัญชีแยกประเภท</span>
          </div>
        </template>

        <div class="p-fluid compact-search-dialog">
          <div class="grid">
            <!-- Left Column -->
            <div class="col-12 md:col-6">
              <!-- Account Code Section -->
              <div class="search-section">
                <h5 class="section-title">
                  <i class="pi pi-book mr-2"></i>ช่วงผังบัญชี
                </h5>
                <div class="grid">
                  <div class="col-12">
                    <label for="accountFrom" class="block mb-1 text-sm">
                      {{ $t("from_acc_code") }}
                    </label>
                    <Dropdown
                      id="accountFrom"
                      v-model="accountcode"
                      :showClear="accountcode != ''"
                      :filter="true"
                      :filterFields="['accountcode', 'accountname']"
                      field="accountcode"
                      :options="groups"
                      filterPlaceholder="ค้นหาผังบัญชี..."
                      placeholder="เลือกทั้งหมด"
                      @change="selectAccount($event)"
                      optionLabel="label"
                      optionValue="accountcode"
                      class="w-full p-inputtext-sm"
                    />
                  </div>
                  <div class="col-12">
                    <label for="accountTo" class="block mb-1 text-sm">
                      {{ $t("to_acc_code") }}
                    </label>
                    <Dropdown
                      id="accountTo"
                      :disabled="state == false"
                      v-model="accountcode2"
                      :showClear="accountcode2 != ''"
                      :filter="true"
                      :filterFields="['accountcode', 'accountname']"
                      field="accountcode"
                      :options="groups"
                      filterPlaceholder="ค้นหาผังบัญชี..."
                      placeholder="เลือกผังบัญชี"
                      @change="selectAccount2($event)"
                      optionLabel="label"
                      optionValue="accountcode"
                      class="w-full p-inputtext-sm"
                    />
                  </div>
                  <div class="col-12">
                    <div class="flex gap-3">
                      <div class="flex align-items-center">
                        <Checkbox 
                          v-model="state" 
                          inputId="rangeCheck" 
                          :binary="true" 
                          @change="toggleAccountRange()" 
                        />
                        <label for="rangeCheck" class="ml-2 cursor-pointer text-sm">
                          {{ $t("range_acc") }}
                        </label>
                      </div>
                      <div class="flex align-items-center">
                        <Checkbox 
                          v-model="result" 
                          inputId="activeCheck" 
                          :binary="true" 
                          @change="toggleActiveAccount()" 
                        />
                        <label for="activeCheck" class="ml-2 cursor-pointer text-sm">
                          {{ $t("acctive_ac") }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Date Range Section -->
              <div class="search-section">
                <h5 class="section-title">
                  <i class="pi pi-calendar mr-2"></i>ช่วงเวลา
                </h5>
                <div class="grid">
                  <div class="col-12 md:col-6">
                    <label for="startDate" class="block mb-1 text-sm">
                      {{ $t("sincetime") }}
                    </label>
                    <DatePicker
                      id="startDate"
                      dateFormat="d/m/yy"
                      v-model="startDate"
                      :showIcon="true"
                      :buddhist="buddhistYear"
                      :hideOnDateTimeSelect="true"
                      :hiddenTime="true"
                      class="w-full p-inputtext-sm"
                      placeholder="เลือกวันที่เริ่มต้น"
                    />
                  </div>
                  <div class="col-12 md:col-6">
                    <label for="endDate" class="block mb-1 text-sm">
                      {{ $t("totime") }}
                    </label>
                    <DatePicker
                      id="endDate"
                      dateFormat="d/m/yy"
                      v-model="endDate"
                      :showIcon="true"
                      :buddhist="buddhistYear"
                      :hideOnDateTimeSelect="true"
                      :hiddenTime="true"
                      class="w-full p-inputtext-sm"
                      placeholder="เลือกวันที่สิ้นสุด"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="col-12 md:col-6">
              <!-- Customer Section -->
              <div class="search-section">
                <h5 class="section-title">
                  <i class="pi pi-users mr-2"></i>ลูกหนี้ / เจ้าหนี้
                </h5>
                <div class="grid">
                  <div class="col-12">
                    <label class="block mb-1 text-sm">ประเภท</label>
                    <div class="flex gap-3">
                      <div class="flex align-items-center">
                        <RadioButton
                          inputId="debtor"
                          name="custtype"
                          :value="0"
                          v-model="custtype"
                          @change="clearCustcode()"
                        />
                        <label for="debtor" class="ml-2 cursor-pointer text-sm">ลูกหนี้</label>
                      </div>
                      <div class="flex align-items-center">
                        <RadioButton
                          inputId="creditor"
                          name="custtype"
                          :value="1"
                          v-model="custtype"
                          @change="clearCustcode()"
                        />
                        <label for="creditor" class="ml-2 cursor-pointer text-sm">เจ้าหนี้</label>
                      </div>
                    </div>
                  </div>
                  <div class="col-12">
                    <label for="customer" class="block mb-1 text-sm">
                      {{ custtype == 0 ? 'ลูกหนี้' : 'เจ้าหนี้' }}
                    </label>
                    <Dropdown
                      id="customer"
                      v-model="custcode"
                      :showClear="custcode != ''"
                      :filter="true"
                      :filterFields="['code', 'names']"
                      field="code"
                      :options="custtype == 0 ? debtorlist : creditorlist"
                      filterPlaceholder="ค้นหา..."
                      :placeholder="'เลือก' + (custtype == 0 ? 'ลูกหนี้' : 'เจ้าหนี้')"
                      optionLabel="label"
                      optionValue="code"
                      class="w-full p-inputtext-sm"
                    />
                  </div>
                </div>
              </div>

              <!-- Journal Book Section -->
              <div class="search-section">
                <h5 class="section-title">
                  <i class="pi pi-book mr-2"></i>สมุดรายวัน
                </h5>
                <div class="grid">
                  <div class="col-12">
                    <label for="journalbook" class="block mb-1 text-sm">
                      เลือกสมุดรายวัน
                    </label>
                    <Dropdown
                      id="journalbook"
                      v-model="accountbook"
                      :showClear="accountbook != ''"
                      :filter="true"
                      :filterFields="['code', 'name1']"
                      field="code"
                      :options="journalbooklist"
                      filterPlaceholder="ค้นหาสมุดรายวัน..."
                      placeholder="เลือกสมุดรายวัน"
                      optionLabel="label"
                      optionValue="code"
                      class="w-full p-inputtext-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex gap-2 justify-content-between">
            <Button
              label="ล้างค่า"
              icon="pi pi-refresh"
              class="p-button-outlined p-button-warning"
              @click="clearAllFilters()"
            />
            <div class="flex gap-2">
              <Button
                label="ยกเลิก"
                icon="pi pi-times"
                class="p-button-outlined p-button-secondary"
                @click="showSearch = false"
              />
              <Button
                label="จัดทำรายงาน"
                icon="pi pi-check"
                class="p-button-primary"
                @click="generateReport()"
                :loading="loading"
              />
            </div>
          </div>
        </template>
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
              @click="navigateToDetail(daily_form.guidfixed)"
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
                :income_expenses_mode="true"
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
import { useRoute } from "vue-router";
import TrialBalance from "./components/tableTrialBalance.vue";
import Ledger from "./components/tableLedger.vue";
import { useApp } from "@/stores/app.js";
import $ from "jquery";
import Utils from "@/utils/";
import DatePicker from "@/components/widget/DatePicker.vue";
import router from "../../router";
import { useToast } from "primevue/usetoast";
import utils from "../../utils";

const route = useRoute();

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
const daily_form = ref([]);
const textChart = ref("");
const showTabImage = ref(false);
const toast = useToast();
const filters = ref(null);
const loading = ref(false);
const activePage = ref(1);
const worm = ref("เลือกทั้งหมด");
const sortField = ref("accountcode");
const sortOrder = ref(1);
const startDateShow = ref();
const endDateShow = ref();
const openDetailDocNo = ref(false);
const storeApp = useApp();
const isvisible = ref(false);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const startDate = ref();
const endDate = ref();
const dataImage = ref([]);
const accountcode = ref("");
const accountcode1 = ref("");
const accountgroup = ref("");
const consolidateaccountcode = ref("");
const accountcode2 = ref("");
const dataaccountcode = ref("");
const state = ref(false);
const group = ref([]);
const data_list = ref([{}]);
const balance = ref();
const result = ref(false);

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
  accountcode1:false,
});
const newData = ref([]);
const groups = ref([]);

/// 0 = ลูกหนี้ 1 = เจ้าหนี้
const custtype = ref(0);
const custcode = ref("");
const debtorlist = ref([]);
const creditorlist = ref([]);
const showSearch = ref(false);

// สมุดรายวัน
const accountbook = ref("");
const journalbooklist = ref([]);



onMounted(async () => {
  await getAccountChart();
  await getDebtorList();
  await getCreditorsList();
  await getJournalBookList();

  initializeDateRange();
  toggleAccountRange();

  storeApp.setPageTitle("บัญชีแยกประเภท");
  storeApp.setActivePage("report_list");
  storeApp.setActiveChild("ledger");

  // ตรวจสอบว่ามีพารามิเตอร์จาก query string หรือไม่
  if (route.query.accountcode) {
    accountcode.value = route.query.accountcode;
    accountcode1.value = route.query.accountcode;
    dataaccountcode.value = route.query.accountcode + ":" + route.query.accountcode;
  }

  if (route.query.startdate) {
    startDate.value = new Date(route.query.startdate);
  }

  if (route.query.enddate) {
    endDate.value = new Date(route.query.enddate);
  }

  // ถ้ามีพารามิเตอร์ autoSearch ให้ค้นหาทันที
  if (route.query.autoSearch === 'true') {
    await fetchLedgerReport();
    isvisible.value = true;
  } else {
    showSearch.value = true;
  }
});

function handleRowClick(event) {
  // ป้องกันการคลิกในแถว "ยกไป" และ "ยกมา"
  if (event.data.docno === "ยกไป" || event.data.docno === "ยกมา" || event.data.docno === "ยกมา ") {
    return;
  }
  fetchJournalDetail(event.data.docno);
}

function formatAccountName(data) {
  if (data == "") {
    return " รหัสผังบัญชีทั้งหมด";
  } else if (data == accountcode1.value && accountcode2.value == "") {
    return "ผังบัญชีที่" + "\n" + ":" + "\n" + accountcode1.value;
  } else {
    return "ตั้งแต่ผังบัญชีที่" + "\n" + ":" + "\n" + accountcode1.value;
  }
}

function formatAccountNameRange(data) {
  if (data == "") {
    return "";
  } else if (data == accountcode2.value) {
    return "ถึงผังบัญชีที่" + "\n" + ":" + "\n" + accountcode2.value;
  }
}

function getCustName() {
  if (!custcode.value) return "";
  
  const list = custtype.value == 0 ? debtorlist.value : creditorlist.value;
  const customer = list.find(item => item.code === custcode.value);
  
  if (customer) {
    return customer.code + " - " + customer.names[0].name;
  }
  return custcode.value;
}

function getBookName() {
  if (!accountbook.value) return "";
  
  const book = journalbooklist.value.find(item => item.code === accountbook.value);
  
  if (book && book.name1) {
    return book.code + " - " + book.name1;
  }
  return accountbook.value;
}

async function getAccountChart() {
  try {
    const res = await MasterdataService.getAccountChartList(
      10000,
      activePage.value,
      filters.value,
      sortField.value,
      sortOrder.value
    );
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
  }
}
async function getDebtorList() {
  try {
    const res = await MasterdataService.getDebtorList(
      10000,
      activePage.value,
      filters.value,
      sortField.value,
      sortOrder.value
    );
    if (res.success) {
      debtorlist.value = res.data.sort(function (obj1, obj2) {
        return obj1.code - obj2.code;
      });
      debtorlist.value.forEach((ele) => {
        ele.label = ele.code + "~" + ele.names[0].name;
      });
    }
  } catch (err) {
  }
}

async function getCreditorsList() {
  try {
    const res = await MasterdataService.getCreditorList(
      10000,
      activePage.value,
      filters.value,
      sortField.value,
      sortOrder.value
    );
    if (res.success) {
      creditorlist.value = res.data.sort(function (obj1, obj2) {
        return obj1.code - obj2.code;
      });
      creditorlist.value.forEach((ele) => {
        ele.label = ele.code + "~" + ele.names[0].name;
      });
    }
  } catch (err) {
  }
}

async function getJournalBookList() {
  try {
    const res = await MasterdataService.getJournalBookList(
      10000,
      activePage.value,
      filters.value,
      sortField.value,
      sortOrder.value
    );
    if (res.success) {
      journalbooklist.value = res.data.sort(function (obj1, obj2) {
        return obj1.code - obj2.code;
      });
      journalbooklist.value.unshift({
        code: "",
        name1: "เลือกทั้งหมด",
      });
      journalbooklist.value.forEach((ele) => {
        if (ele.code === "") {
          ele.label = "เลือกทั้งหมด";
        } else {
          ele.label = ele.code + " ~ " + ele.name1;
        }
      });
    }
  } catch (err) {
    console.error("Error fetching journal book list:", err);
  }
}

function formatDate(data) {
  if (data == "NaN/NaN/NaN") {
    return "";
  } else if (data.length <= 7) {
    return data;
  } else {
    return Utils.getDateFormatDMY(data);
  }
}

function fetchDocumentImages(docno) {
  ImageDataService.getDocumentImageByDocNo(docno)
    .then((res) => {
      if (res.success) {
        showTabImage.value = true;
        setTimeout(() => {
          dataImage.value = res.data.imagereferences;
        }, 1000);
      }
    })
    .catch((err) => {
      showTabImage.value = false;
    });
}

function fetchJournalDetail(docno) {
  MasterdataService.getGLledger(docno)
    .then((res) => {
      if (res.success) {
        fetchDocumentImages(docno);

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
      }
    })
    .catch((err) => {
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
function toggleActiveAccount() {
}

function toggleAccountRange() {
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
  state.value == false;
  accountcode1.value = event.value;

  accountcode1.value = event.value;
  if (accountcode1.value != "" && accountcode1.value != null) {
    dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;
  } else {
    dataaccountcode.value = "";
  }
}
function selectAccount2(event) {
  accountcode2.value = event.value;
  
  if (!accountcode1.value || accountcode1.value === "" || accountcode1.value === null) {
    dataaccountcode.value = "";
  } else if (!accountcode2.value || accountcode2.value === "" || accountcode2.value === null) {
    dataaccountcode.value = accountcode1.value + ":" + accountcode1.value;
  } else {
    dataaccountcode.value = accountcode1.value + ":" + accountcode2.value;
    state.value = true;
  }
}

function generateReport() {
  fetchLedgerReport();
  isvisible.value = true;
}



function formatAmount(data) {
  if (result.value == false) {
    return utils.formatNumberforamount(data);
  }
  {
    return utils.formatNumber(data);
  }
}

function fetchLedgerReport() {
  let startdate = Utils.getDateFromYear(startDate.value);
  let enddate = Utils.getDateFromYear(endDate.value);

  // ถ้า dataaccountcode เป็น ":" หรือ "null:null" หรือมี null ให้เซ็ตเป็น ""
  if (dataaccountcode.value == ":" || 
      dataaccountcode.value == "null:null" || 
      dataaccountcode.value.includes("null") ||
      !dataaccountcode.value) {
    dataaccountcode.value = "";
  }
  
  isvisible.value = true;
  MasterdataService.getAccountledger(
    startdate,
    enddate,
    dataaccountcode.value,
    custtype.value,
    custcode.value,
    accountbook.value
  )

    .then((res) => {
      newData.value = [];
      startDateShow.value = Utils.getYearBuddhist(startDate.value);
      endDateShow.value = Utils.getYearBuddhist(endDate.value);
      
      res.data.forEach((element, index) => {
        if (
          element.balance == 0 &&
          element.nextbalance == 0 &&
          element.balance == element.nextbalance &&
          element.details.length > 0
        ) {
          data_list.value.push(element);
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
            // เมื่อ balance = 0 ไม่ต้องเพิ่มแถวว่าง เพิ่มเฉพาะ group header ให้รายการแรก
            if (data.details.length > 0) {
              data.details[0].accountcodegroup = data.accountcode;
              data.details[0].accountnamegroup = data.accountname;
              
              // เพิ่มแถว "ยกไป" เฉพาะเมื่อมี details
              data.details.push({
                docdate: "",
                docno: "ยกไป",
                accountdescription: "",
                credit: "",
                debit: "",
                amount: utils.formatNumberforamount(data.nextbalance),
              });
            }
          } else if (result.value == true && data.balance == 0) {
            if (data.details.length > 0) {
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
            }
          } else if (
            data.balance == 0 &&
            data.nextbalance == 0 &&
            data.details.length == 0
          ) {
          } else if (data.balance != 0 && data.nextbalance != 0) {
            if (data.details.length > 0) {
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

              data.details.push({
                docdate: "",
                docno: "ยกไป",
                accountdescription: "",
                credit: "",
                debit: "",
                amount: data.nextbalance,
              });
            }
          } else {
            // กรณีอื่นๆ ที่ไม่ควรมีแถวว่าง
            if (data.details.length > 0) {
              data.details[0].accountcodegroup = data.accountcode;
              data.details[0].accountnamegroup = data.accountname;
              
              // เพิ่มแถว "ยกไป" เฉพาะเมื่อมี details
              data.details.push({
                docdate: "",
                docno: "ยกไป",
                accountdescription: "",
                credit: "",
                debit: "",
                amount: data.nextbalance,
              });
            }
          }

          data.details.forEach((element, index) => {
            newData.value.push(element);
          });
        });

        setTimeout(() => {
          var html = $("tr.p-rowgroup-header td ");

          for (var i = 0; i < html.length; i++) {
            if (!html[i].innerHTML.includes("span")) {
              html[i].style.display = "none";
            }
          }
        }, 10);
        setTimeout(() => {
          if (data_list.value == "") {
            group.value = data.details[0];
          }
        }, 100);
        if (result.value == true) {
          data_list.value = res.data;
        }

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
    });
  loading.value = false;
}

function initializeDateRange() {
  var date = new Date();
  startDate.value = new Date(date.getFullYear(), date.getMonth(), 1);
  endDate.value = new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function navigateToDetail(data) {
  router.push({
    name: "dailyUpdate",
    params: { id: data, mode: "edit" },
  });
}

function clearCustcode() {
  custcode.value = "";
}

function clearAccountBook() {
  accountbook.value = "";
}

function clearAllFilters() {
  // ล้างค่าผังบัญชี
  accountcode.value = "";
  accountcode1.value = "";
  accountcode2.value = "";
  dataaccountcode.value = "";
  state.value = false;
  result.value = false;
  
  // ล้างค่าลูกหนี้/เจ้าหนี้
  custtype.value = 0;
  custcode.value = "";
  
  // ล้างค่าสมุดรายวัน
  accountbook.value = "";
  
  // รีเซ็ตวันที่เป็นเดือนปัจจุบัน
  initializeDateRange();
  
  toast.add({
    severity: "info",
    summary: "ล้างค่าตัวกรองแล้ว",
    detail: "กรุณาเลือกเงื่อนไขการค้นหาใหม่",
    life: 2000,
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

/* Compact Ledger Styles - ประหยัดพื้นที่สูงสุด */
.compact-header {
  margin-bottom: 0.5rem;
  
  h3 {
    color: #1e293b;
    letter-spacing: -0.025em;
  }
  
  .surface-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }
  
  ::v-deep(.filter-chip-compact) {
    background: #ffffff;
    color: #475569;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border: 1px solid #cbd5e1;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    height: 1.75rem;
    
    .pi {
      font-size: 0.75rem;
      color: #64748b;
    }
    
    .text-xs {
      font-size: 0.75rem;
      line-height: 1;
    }
  }
  
  ::v-deep(.filter-chip-customer) {
    background: #fffbeb;
    border-color: #fbbf24;
    color: #92400e;
    
    .pi {
      color: #d97706;
    }
  }
  
  ::v-deep(.filter-chip-info) {
    background: #eff6ff;
    border-color: #93c5fd;
    color: #1e40af;
    
    .pi {
      color: #3b82f6;
    }
  }
  
  ::v-deep(.p-button-text) {
    padding: 0.375rem 0.75rem;
    font-size: 0.813rem;
  }
}

.table-container {
  margin-top: 0.5rem;
}

/* Compact Table - เน้นข้อมูล */
.compact-table {
  font-size: 0.813rem !important;
}

/* ลด padding ของ DataTable */
::v-deep(.p-datatable) {
  .p-datatable-header {
    padding: 0.4rem;
    background: #f8f9fa;
  }
  
  .p-datatable-thead > tr > th {
    padding: 0.4rem 0.6rem !important;
    font-size: 0.813rem !important;
    background-color: #e2e8f0 !important;
    color: #334155 !important;
    font-weight: 600;
    border: 1px solid #cbd5e1;
  }
  
  .p-datatable-tbody > tr > td {
    padding: 0.4rem 0.6rem !important;
    font-size: 0.813rem !important;
    border: 1px solid #e2e8f0;
  }
  
  /* สลับสีแถว - Zebra striping โทนเทาอ่อน */
  .p-datatable-tbody > tr:nth-child(even):not(.p-rowgroup-header) {
    background-color: #f8fafc !important;
  }
  
  .p-datatable-tbody > tr:nth-child(odd):not(.p-rowgroup-header) {
    background-color: #ffffff !important;
  }
  
  /* Group Header - สีเทาฟ้าอ่อน */
  .p-rowgroup-header td {
    padding: 0.5rem 0.6rem !important;
    background-color: #cbd5e1 !important;
    font-weight: 600;
    font-size: 0.875rem !important;
    border-left: 3px solid #64748b !important;
    color: #1e293b !important;
  }
  
  /* Hover effect - สีเหลืองอ่อนพาสเทล */
  .p-datatable-tbody > tr:not(.p-rowgroup-header):hover {
    background-color: #fef3c7 !important;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
}

/* Compact Divider */
::v-deep(.p-divider.p-divider-vertical) {
  margin: 0 0.5rem;
  height: 1.25rem;
}

/* ลด height ของ buttons */
.p-button-text {
  background: transparent;
  border-color: transparent;
  padding: 0.4rem !important;
}

.p-button-text:hover {
  background: rgba(100, 116, 139, 0.1) !important;
}

.p-button-text:enabled:active {
  background: rgba(100, 116, 139, 0.2) !important;
}

/* Icons ในตาราง */
::v-deep(.p-datatable) {
  .pi {
    font-size: 0.75rem;
  }
}

/* Compact Search Dialog */
.compact-search-dialog {
  .search-section {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    
    .section-title {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #3b82f6;
      display: flex;
      align-items: center;
      
      .pi {
        font-size: 0.875rem;
      }
    }
    
    label {
      font-size: 0.813rem;
      font-weight: 500;
      color: #475569;
    }
  }
  
  ::v-deep(.p-inputtext-sm) {
    font-size: 0.813rem;
    padding: 0.4rem 0.6rem;
  }
  
  ::v-deep(.p-dropdown.p-inputtext-sm) {
    .p-dropdown-label {
      padding: 0.4rem 0.6rem;
      font-size: 0.813rem;
    }
    
    .p-dropdown-trigger {
      width: 2rem;
    }
  }
  
  ::v-deep(.p-calendar.p-inputtext-sm) {
    input {
      padding: 0.4rem 0.6rem;
      font-size: 0.813rem;
    }
    
    .p-datepicker-trigger {
      width: 2rem;
    }
  }
  
  ::v-deep(.p-checkbox) {
    width: 1rem;
    height: 1rem;
    
    .p-checkbox-box {
      width: 1rem;
      height: 1rem;
    }
  }
  
  ::v-deep(.p-radiobutton) {
    width: 1rem;
    height: 1rem;
    
    .p-radiobutton-box {
      width: 1rem;
      height: 1rem;
    }
  }
}

/* Responsive - ยิ่งน้อยยิ่งดี */
@media (max-width: 768px) {
  .compact-header {
    font-size: 0.875rem;
  }
  
  .compact-header .flex {
    flex-wrap: wrap;
  }
  
  ::v-deep(.p-datatable) {
    .p-datatable-thead > tr > th,
    .p-datatable-tbody > tr > td {
      padding: 0.35rem 0.5rem !important;
      font-size: 0.75rem !important;
    }
  }
  
  .compact-search-dialog {
    .search-section {
      padding: 0.5rem;
      margin-bottom: 0.5rem;
    }
  }
}
</style>
