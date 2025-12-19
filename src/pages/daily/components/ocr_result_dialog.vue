<template>
  <Dialog
    :visible="visible"
    modal
    header="ตรวจสอบข้อมูล OCR"
    :style="{ width: '70vw', maxWidth: '1600px' }"
    :breakpoints="{ '1199px': '98vw', '575px': '90vw' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div v-if="ocrData">
      <!-- สถานะด้านบน - แบบกระชับ -->
      <div class="surface-50 border-round-sm p-2 mb-2">
        <div class="flex gap-2 flex-wrap">
          <div class="flex-1 min-w-max">
            <div class="surface-0 border-round-sm p-2 text-center">
              <div class="text-500 text-xs mb-1">สถานะ</div>
              <Tag :value="ocrData.status" severity="success" class="font-semibold" />
            </div>
          </div>
          <div class="flex-1 min-w-max">
            <div class="surface-0 border-round-sm p-2 text-center">
              <div class="text-500 text-xs mb-1">สถานะการบันทึก</div>
              <Tag
                v-tooltip.top="{
                  value: getReviewTooltip(),
                  escape: false,
                  style: { maxWidth: '400px', whiteSpace: 'pre-line' }
                }"
                :value="ocrData.validation?.review_requirements?.can_proceed ? 'บันทึกได้' : (ocrData.validation?.requires_review ? 'ต้องตรวจสอบ' : 'พร้อมใช้')"
                :severity="ocrData.validation?.review_requirements?.can_proceed ? 'success' : (ocrData.validation?.requires_review ? 'warning' : 'success')"
                class="font-semibold cursor-pointer"
              />
            </div>
          </div>
          <div v-if="ocrData.validation?.review_requirements?.summary" class="flex-1 min-w-max">
            <div class="surface-0 border-round-sm p-2 text-center" :class="{
              'border-1 border-red-500': ocrData.validation.review_requirements.summary.blocking_issues > 0,
              'border-1 border-orange-500': ocrData.validation.review_requirements.summary.warnings > 0 && !ocrData.validation.review_requirements.summary.blocking_issues
            }">
              <div class="text-500 text-xs mb-1">จุดตรวจสอบ</div>
              <Tag
                :value="`${ocrData.validation.review_requirements.summary.blocking_issues + ocrData.validation.review_requirements.summary.warnings + ocrData.validation.review_requirements.summary.info} รายการ`"
                :severity="ocrData.validation.review_requirements.summary.blocking_issues > 0 ? 'danger' : (ocrData.validation.review_requirements.summary.warnings > 0 ? 'warning' : 'info')"
                class="font-semibold"
              />
            </div>
          </div>
          <div v-if="ocrData.metadata?.ocr_warnings?.length > 0" class="flex-1 min-w-max">
            <div class="surface-0 border-round-sm p-2 text-center border-1 border-orange-500">
              <div class="text-500 text-xs mb-1">คำเตือน OCR</div>
              <Tag
                :value="`${ocrData.metadata.ocr_warnings.length} รายการ`"
                severity="warning"
                class="font-semibold"
              />
            </div>
          </div>
          <div class="flex-1 min-w-max">
            <div class="surface-0 border-round-sm p-2 text-center">
              <div class="text-500 text-xs mb-1">ความเชื่อมั่น</div>
              <div class="text-900 font-bold">{{ ocrData.validation?.confidence?.score }}%</div>
            </div>
          </div>
          <div class="flex-1 min-w-max">
            <div class="surface-0 border-round-sm p-2 text-center">
              <div class="text-500 text-xs mb-1">สมดุล</div>
              <Tag
                :value="ocrData.accounting_entry?.balance_check?.balanced ? 'สมดุล' : 'ไม่สมดุล'"
                :severity="ocrData.accounting_entry?.balance_check?.balanced ? 'success' : 'danger'"
                class="font-semibold"
              />
            </div>
          </div>
          <div class="flex-1 min-w-max">
            <div class="surface-0 border-round-sm p-2 text-center">
              <div class="text-500 text-xs mb-1">เทมเพลต</div>
              <div class="text-900 font-semibold text-sm">{{ ocrData.template_info?.template_name || '-' }}</div>
            </div>
          </div>
          <div class="flex-1 min-w-max">
            <div class="surface-0 border-round-sm p-2 text-center">
              <div class="text-500 text-xs mb-1">ต้นทุน</div>
              <div class="text-green-600 font-bold text-sm">{{ ocrData.metadata?.token_usage?.cost_thb || '-' }}</div>
            </div>
          </div>
        </div>
      </div>

      <TabView>
        <!-- แท็บที่ 1: รายการบัญชี -->
        <TabPanel>
          <template #header>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-book"></i>
              <span>รายการบัญชี</span>
            </div>
          </template>

          <!-- Layout แบบ 2 คอลัมน์ -->
          <div class="grid">
            <!-- ซ้าย: ข้อมูลหัว + รายการบัญชี -->
            <div class="col-12 lg:col-8 pr-2">
              <!-- ข้อมูลสมุดรายวันแบบกระชับ -->
              <div class="surface-50 border-round-sm p-2 mb-2">
                <div class="flex gap-3 flex-wrap text-sm">
                  <div class="flex align-items-center gap-1">
                    <span class="text-500">สมุด:</span>
                    <span class="font-semibold">{{ ocrData.accounting_entry.journal_book_code }} - {{ ocrData.accounting_entry.journal_book_name }}</span>
                  </div>
                  <div class="flex align-items-center gap-1">
                    <span class="text-500">วันที่:</span>
                    <span class="font-semibold">{{ ocrData.accounting_entry.document_date }}</span>
                  </div>
                  <div class="flex align-items-center gap-1">
                    <span class="text-500">เลขที่:</span>
                    <span class="font-semibold text-primary">{{ ocrData.accounting_entry.reference_number }}</span>
                  </div>
                </div>
              </div>

              <!-- ตารางรายการบัญชี -->
              <DataTable
                :value="ocrData.accounting_entry.entries"
                stripedRows
                size="small"
                :pt="{
                  header: { class: 'p-1' },
                  bodyRow: { class: 'text-sm' }
                }"
              >
                <Column field="account_code" header="รหัส" style="width: 90px">
                  <template #body="{ data }">
                    <div class="flex align-items-center gap-1">
                      <Tag v-if="data.debit > 0" value="DR" severity="success" class="text-xs" style="padding: 0.15rem 0.3rem;" />
                      <Tag v-else-if="data.credit > 0" value="CR" severity="warning" class="text-xs" style="padding: 0.15rem 0.3rem;" />
                      <span class="font-mono font-semibold text-xs">{{ data.account_code }}</span>
                    </div>
                  </template>
                </Column>
                <Column field="account_name" header="ชื่อบัญชี" style="min-width: 180px">
                  <template #body="{ data }">
                    <div>
                      <div class="font-medium text-sm">{{ data.account_name }}</div>
                      <div class="text-xs text-500">{{ data.description }}</div>
                    </div>
                  </template>
                </Column>
                <Column field="debit" header="เดบิต" style="width: 110px" class="text-right">
                  <template #body="{ data }">
                    <span v-if="data.debit > 0" class="text-green-700 font-bold">{{ (typeof data.debit === 'number' ? data.debit : (parseFloat(data.debit) || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
                    <span v-else class="text-400">-</span>
                  </template>
                </Column>
                <Column field="credit" header="เครดิต" style="width: 110px" class="text-right">
                  <template #body="{ data }">
                    <span v-if="data.credit > 0" class="text-orange-700 font-bold">{{ (typeof data.credit === 'number' ? data.credit : (parseFloat(data.credit) || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
                    <span v-else class="text-400">-</span>
                  </template>
                </Column>
              </DataTable>
            </div>

            <!-- ขวา: สรุปยอด + ข้อมูลใบเสร็จ -->
            <div class="col-12 lg:col-4 pl-2">
              <!-- สมดุล -->
              <div class="surface-50 border-round-sm p-2 mb-2">
                <div class="flex align-items-center justify-content-between mb-2">
                  <span class="font-semibold text-sm">สมดุลบัญชี</span>
                  <Tag
                    :value="ocrData.accounting_entry.balance_check.balanced ? '✓ สมดุล' : '✗ ไม่สมดุล'"
                    :severity="ocrData.accounting_entry.balance_check.balanced ? 'success' : 'danger'"
                    class="text-xs"
                  />
                </div>
                <div class="grid mb-0">
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2 text-center border-1 border-green-300">
                      <div class="text-500 text-xs mb-1">รวม DR</div>
                      <div class="text-green-700 font-bold">
                        {{ (typeof ocrData.accounting_entry.balance_check.total_debit === 'number' ? ocrData.accounting_entry.balance_check.total_debit : (parseFloat(ocrData.accounting_entry.balance_check.total_debit) || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2 text-center border-1 border-orange-300">
                      <div class="text-500 text-xs mb-1">รวม CR</div>
                      <div class="text-orange-700 font-bold">
                        {{ (typeof ocrData.accounting_entry.balance_check.total_credit === 'number' ? ocrData.accounting_entry.balance_check.total_credit : (parseFloat(ocrData.accounting_entry.balance_check.total_credit) || 0)).toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ข้อมูลใบเสร็จย่อ -->
              <div class="surface-50 border-round-sm p-2">
                <div class="font-semibold text-sm mb-2">ข้อมูลใบเสร็จ</div>
                <div class="surface-0 border-round-sm p-2 mb-2">
                  <div class="text-xs text-500 mb-1">ผู้ขาย</div>
                  <div class="font-semibold text-sm">{{ ocrData.receipt.vendor_name }}</div>
                  <div class="text-xs text-500 font-mono mt-1">{{ ocrData.receipt.vendor_tax_id }}</div>
                </div>
                <div class="grid mb-0">
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2">
                      <div class="text-xs text-500 mb-1">ยอดรวม</div>
                      <div class="font-bold text-primary">{{ ocrData.receipt.total ? (typeof ocrData.receipt.total === 'number' ? ocrData.receipt.total : parseFloat(ocrData.receipt.total) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-' }}</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2">
                      <div class="text-xs text-500 mb-1">VAT</div>
                      <div class="font-semibold">{{ ocrData.receipt.vat ? (typeof ocrData.receipt.vat === 'number' ? ocrData.receipt.vat : parseFloat(ocrData.receipt.vat) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- แท็บที่ 2: ข้อมูลใบเสร็จ -->
        <TabPanel>
          <template #header>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-receipt"></i>
              <span>ข้อมูลใบเสร็จ</span>
            </div>
          </template>

          <div class="grid">
            <!-- ผู้ขาย + เอกสาร -->
            <div class="col-12 md:col-6 pr-1">
              <div class="surface-50 border-round-sm p-2 mb-2">
                <div class="text-sm font-semibold mb-2 flex align-items-center gap-1">
                  <i class="pi pi-building text-primary"></i>
                  <span>ข้อมูลผู้ขาย</span>
                </div>
                <div class="surface-0 border-round-sm p-2">
                  <div class="text-xs text-500 mb-1">ชื่อผู้ขาย</div>
                  <div class="font-semibold mb-2">{{ ocrData.receipt.vendor_name }}</div>
                  <div class="text-xs text-500 mb-1">เลขประจำตัวผู้เสียภาษี</div>
                  <div class="font-mono font-semibold">{{ ocrData.receipt.vendor_tax_id }}</div>
                </div>
              </div>

              <div class="surface-50 border-round-sm p-2">
                <div class="text-sm font-semibold mb-2 flex align-items-center gap-1">
                  <i class="pi pi-file-edit text-primary"></i>
                  <span>ข้อมูลเอกสาร</span>
                </div>
                <div class="grid mb-0">
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2">
                      <div class="text-xs text-500 mb-1">เลขที่เอกสาร</div>
                      <div class="font-mono font-bold text-primary">
                        {{ typeof ocrData.receipt.number === "object" ? JSON.stringify(ocrData.receipt.number) : ocrData.receipt.number }}
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2">
                      <div class="text-xs text-500 mb-1">วันที่</div>
                      <div class="font-semibold">
                        {{ typeof ocrData.receipt.date === "object" ? JSON.stringify(ocrData.receipt.date) : ocrData.receipt.date }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ข้อมูลการเงิน -->
            <div class="col-12 md:col-6 pl-1">
              <div class="surface-50 border-round-sm p-2 h-full">
                <div class="text-sm font-semibold mb-2 flex align-items-center gap-1">
                  <i class="pi pi-money-bill text-primary"></i>
                  <span>ข้อมูลการเงิน</span>
                </div>
                <div class="grid mb-2">
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2 text-center border-2 border-primary">
                      <div class="text-xs text-500 mb-1">ยอดรวมทั้งสิ้น</div>
                      <div class="font-bold text-xl text-primary">
                        {{ typeof ocrData.receipt.total === 'number' ? ocrData.receipt.total.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : ocrData.receipt.total }}
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2 text-center">
                      <div class="text-xs text-500 mb-1">VAT 7%</div>
                      <div class="font-bold text-lg">
                        {{ typeof ocrData.receipt.vat === 'number' ? ocrData.receipt.vat.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : ocrData.receipt.vat }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="grid mb-0">
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2 text-center">
                      <div class="text-xs text-500 mb-1">วิธีชำระเงิน</div>
                      <Tag
                        :value="ocrData.receipt.payment_method || 'ไม่ระบุ'"
                        :severity="ocrData.receipt.payment_method ? 'info' : 'secondary'"
                        class="text-sm"
                      />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2 text-center">
                      <div class="text-xs text-500 mb-1">หลักฐานการชำระ</div>
                      <Tag
                        :value="ocrData.receipt.payment_proof_available ? 'มี ✓' : 'ไม่มี'"
                        :severity="ocrData.receipt.payment_proof_available ? 'success' : 'warning'"
                        class="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- แท็บที่ 3: การตรวจสอบ -->
        <TabPanel>
          <template #header>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-verified"></i>
              <span>การตรวจสอบ</span>
            </div>
          </template>
          <!-- แสดงรายละเอียดเหตุผลการเลือกบัญชี -->
          <div v-if="ocrData.accounting_entry.entries.some(e => e.selection_reason || e.side_reason)" class="mb-2">
            <div class="surface-50 border-round-sm p-2">
              <div class="text-sm font-semibold mb-2">เหตุผลการเลือกบัญชี</div>
              <DataTable
                :value="ocrData.accounting_entry.entries"
                stripedRows
                size="small"
                class="text-sm"
              >
                <Column field="account_code" header="รหัส" style="width: 90px">
                  <template #body="{ data }">
                    <div class="flex align-items-center gap-1">
                      <Tag v-if="data.debit > 0" value="DR" severity="success" class="text-xs" style="padding: 0.15rem 0.3rem;" />
                      <Tag v-else-if="data.credit > 0" value="CR" severity="warning" class="text-xs" style="padding: 0.15rem 0.3rem;" />
                      <span class="font-mono text-xs">{{ data.account_code }}</span>
                    </div>
                  </template>
                </Column>
                <Column field="account_name" header="ชื่อบัญชี" style="min-width: 150px">
                  <template #body="{ data }">
                    <div class="text-sm">{{ data.account_name }}</div>
                  </template>
                </Column>
                <Column field="selection_reason" header="เหตุผลที่เลือก" style="min-width: 200px">
                  <template #body="{ data }">
                    <div class="text-xs text-700" v-if="data.selection_reason">{{ data.selection_reason }}</div>
                    <span v-else class="text-400">-</span>
                  </template>
                </Column>
                <Column field="side_reason" header="เหตุผลด้าน" style="min-width: 200px">
                  <template #body="{ data }">
                    <div class="text-xs text-600" v-if="data.side_reason">{{ data.side_reason }}</div>
                    <span v-else class="text-400">-</span>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>

          <Accordion :multiple="true" :activeIndex="[0]" class="compact-accordion">
            <AccordionTab>
              <template #header>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-star text-primary"></i>
                  <span class="text-sm font-semibold">ความเชื่อมั่น & สถานะ</span>
                </div>
              </template>
              <div class="grid mb-3">
                <div class="col-6">
                  <div class="surface-50 border-round-sm p-2 text-center">
                    <div class="text-xs text-500 mb-1">ระดับความเชื่อมั่น</div>
                    <Tag :value="ocrData.validation.confidence.level" severity="info" />
                    <div class="text-primary font-bold text-lg mt-1">{{ ocrData.validation.confidence.score }}%</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="surface-50 border-round-sm p-2">
                    <div class="text-xs text-500 mb-1">สถานะ</div>
                    <Tag
                      :value="ocrData.validation.review_requirements?.can_proceed ? 'สามารถบันทึกได้' : (ocrData.validation.requires_review ? 'ต้องตรวจสอบ' : 'พร้อมใช้')"
                      :severity="ocrData.validation.review_requirements?.can_proceed ? 'success' : (ocrData.validation.requires_review ? 'warning' : 'success')"
                    />
                    <div class="text-xs text-600 mt-2">{{ ocrData.validation.processing_notes }}</div>
                  </div>
                </div>
              </div>

              <!-- Confidence Breakdown -->
              <div v-if="ocrData.validation.confidence_breakdown" class="surface-50 border-round-sm p-2 mb-3">
                <div class="flex align-items-center gap-2 mb-2">
                  <i class="pi pi-chart-bar text-primary"></i>
                  <span class="font-semibold text-sm">การคำนวณความเชื่อมั่น</span>
                </div>
                
                <!-- Factors & Weights -->
                <div class="grid mb-2">
                  <div class="col-12">
                    <DataTable
                      :value="Object.entries(ocrData.validation.confidence_breakdown.factors).map(([key, score]) => ({
                        factor: key,
                        score,
                        weight: ocrData.validation.confidence_breakdown.weights[key],
                        explanation: ocrData.validation.confidence_breakdown.explanations?.[key]
                      }))"
                      size="small"
                      stripedRows
                    >
                      <Column field="factor" header="ปัจจัย" style="width: 200px">
                        <template #body="{ data }">
                          <div class="text-xs">
                            {{ data.factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                          </div>
                        </template>
                      </Column>
                      <Column field="score" header="คะแนน" style="width: 80px">
                        <template #body="{ data }">
                          <Tag
                            :value="`${data.score}%`"
                            :severity="data.score >= 80 ? 'success' : data.score >= 60 ? 'warning' : 'danger'"
                            class="text-xs"
                          />
                        </template>
                      </Column>
                      <Column field="weight" header="น้ำหนัก" style="width: 80px">
                        <template #body="{ data }">
                          <span class="text-xs">{{ data.weight }}%</span>
                        </template>
                      </Column>
                      <Column field="explanation" header="คำอธิบาย" style="min-width: 250px">
                        <template #body="{ data }">
                          <div class="text-xs text-600">{{ data.explanation }}</div>
                        </template>
                      </Column>
                    </DataTable>
                  </div>
                </div>

                <!-- Calculation Steps -->
                <div v-if="ocrData.validation.confidence_breakdown.calculation" class="surface-0 border-round-sm p-2">
                  <div class="text-xs text-500 mb-2">📊 ขั้นตอนการคำนวณ</div>
                  <div class="text-xs font-mono mb-1">{{ ocrData.validation.confidence_breakdown.calculation.formula }}</div>
                  <Divider class="my-2" />
                  <div v-for="(step, idx) in ocrData.validation.confidence_breakdown.calculation.steps" :key="idx" class="text-xs mb-1">
                    {{ step }}
                  </div>
                  <Divider class="my-2" />
                  <div class="text-sm font-bold text-primary">รวม: {{ ocrData.validation.confidence_breakdown.calculation.total }}%</div>
                </div>
              </div>

              <!-- Review Requirements (ภาษาไทย) -->
              <div v-if="ocrData.validation.review_requirements" class="surface-50 border-round-sm p-2">
                <div class="flex align-items-center gap-2 mb-2">
                  <i class="pi pi-info-circle text-primary"></i>
                  <span class="font-semibold text-sm">ข้อกำหนดการตรวจสอบ</span>
                </div>
                <div class="grid mb-0">
                  <!-- สถานะและความสำคัญ -->
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2 text-center">
                      <div class="text-xs text-500 mb-1">ระดับความสำคัญ</div>
                      <div class="font-semibold text-lg">
                        {{ ocrData.validation.review_requirements.ระดับความสำคัญ || ocrData.validation.review_requirements.review_priority }}
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="surface-0 border-round-sm p-2 text-center">
                      <div class="text-xs text-500 mb-1">สามารถบันทึก</div>
                      <Tag
                        :value="ocrData.validation.review_requirements.สามารถบันทึก !== undefined ? (ocrData.validation.review_requirements.สามารถบันทึก ? 'ได้' : 'ไม่ได้') : (ocrData.validation.review_requirements.can_proceed ? 'ได้' : 'ไม่ได้')"
                        :severity="(ocrData.validation.review_requirements.สามารถบันทึก !== undefined ? ocrData.validation.review_requirements.สามารถบันทึก : ocrData.validation.review_requirements.can_proceed) ? 'success' : 'danger'"
                      />
                    </div>
                  </div>

                  <!-- สถานะ -->
                  <div v-if="ocrData.validation.review_requirements.สถานะ" class="col-12">
                    <div class="surface-0 border-round-sm p-2">
                      <div class="text-xs text-500 mb-1">สถานะ</div>
                      <div class="font-semibold">{{ ocrData.validation.review_requirements.สถานะ }}</div>
                    </div>
                  </div>

                  <!-- คำแนะนำ -->
                  <div v-if="ocrData.validation.review_requirements.คำแนะนำ" class="col-12">
                    <div class="surface-0 border-round-sm p-2">
                      <div class="text-xs text-500 mb-1">💡 คำแนะนำ</div>
                      <div class="text-sm">{{ ocrData.validation.review_requirements.คำแนะนำ }}</div>
                    </div>
                  </div>

                  <!-- คะแนนรวม -->
                  <div v-if="ocrData.validation.review_requirements.คะแนนรวม" class="col-12">
                    <div class="surface-0 border-round-sm p-2 text-center">
                      <div class="text-xs text-500 mb-1">📊 คะแนนรวม</div>
                      <div class="font-bold text-2xl text-primary">{{ ocrData.validation.review_requirements.คะแนนรวม }}</div>
                    </div>
                  </div>

                  <!-- รายการตรวจสอบ -->
                  <div v-if="ocrData.validation.review_requirements.รายการตรวจสอบ && ocrData.validation.review_requirements.รายการตรวจสอบ.length > 0" class="col-12">
                    <div class="surface-0 border-round-sm p-2">
                      <div class="text-xs text-500 mb-2">📋 รายการตรวจสอบ</div>
                      <div v-for="(item, idx) in ocrData.validation.review_requirements.รายการตรวจสอบ" :key="idx" class="mb-2 p-2 surface-50 border-round">
                        <div class="flex justify-content-between align-items-start mb-1">
                          <div class="font-semibold text-sm">{{ item.สถานะ }} {{ item.หัวข้อ }}</div>
                          <Tag :value="`${item.คะแนน}%`" :severity="item.คะแนน >= 80 ? 'success' : item.คะแนน >= 60 ? 'warning' : 'danger'" />
                        </div>
                        <div class="text-xs text-600 mb-1">{{ item.ปัญหา }}</div>
                        <div v-if="item.ต้องตรวจสอบ" class="text-xs text-orange-600">🔸 {{ item.ต้องตรวจสอบ }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- วิธีแก้ไข -->
                  <div v-if="ocrData.validation.review_requirements.วิธีแก้ไข && ocrData.validation.review_requirements.วิธีแก้ไข.length > 0" class="col-12">
                    <div class="surface-0 border-round-sm p-2">
                      <div class="text-xs text-500 mb-2">🔧 วิธีแก้ไข</div>
                      <ul class="m-0 pl-3">
                        <li v-for="(fix, idx) in ocrData.validation.review_requirements.วิธีแก้ไข" :key="idx" class="text-sm mb-1">
                          {{ fix }}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- สรุป (ภาษาไทย) -->
                  <div v-if="ocrData.validation.review_requirements.สรุป" class="col-12">
                    <div class="surface-0 border-round-sm p-2">
                      <div class="text-xs text-500 mb-2">📊 สรุป</div>
                      <div class="flex gap-2 flex-wrap">
                        <Tag v-if="ocrData.validation.review_requirements.สรุป.ปัญหาร้ายแรง > 0"
                             :value="`ปัญหาร้ายแรง: ${ocrData.validation.review_requirements.สรุป.ปัญหาร้ายแรง}`"
                             severity="danger" />
                        <Tag v-if="ocrData.validation.review_requirements.สรุป.ควรตรวจสอบ > 0"
                             :value="`ควรตรวจสอบ: ${ocrData.validation.review_requirements.สรุป.ควรตรวจสอบ}`"
                             severity="warning" />
                        <Tag v-if="ocrData.validation.review_requirements.สรุป.จำนวนปัญหา > 0"
                             :value="`จำนวนปัญหา: ${ocrData.validation.review_requirements.สรุป.จำนวนปัญหา}`"
                             severity="info" />
                      </div>
                    </div>
                  </div>

                  <!-- ฟิลด์ที่หายไป -->
                  <div v-if="ocrData.validation.review_requirements.ฟิลด์ที่หายไป && ocrData.validation.review_requirements.ฟิลด์ที่หายไป.length > 0" class="col-12">
                    <Message severity="warn" :closable="false">
                      <div class="text-sm">
                        <div class="font-semibold mb-1">⚠️ ฟิลด์ที่หายไป:</div>
                        <div class="flex gap-2 flex-wrap">
                          <Tag v-for="(field, idx) in ocrData.validation.review_requirements.ฟิลด์ที่หายไป"
                               :key="idx"
                               :value="field"
                               severity="warning" />
                        </div>
                      </div>
                    </Message>
                  </div>

                  <!-- Fallback สำหรับ response แบบเก่า (ภาษาอังกฤษ) -->
                  <div v-if="ocrData.validation.review_requirements.summary && !ocrData.validation.review_requirements.สรุป" class="col-12">
                    <div class="surface-0 border-round-sm p-2">
                      <div class="text-xs text-500 mb-2">สรุป</div>
                      <div class="flex gap-2">
                        <Tag v-if="ocrData.validation.review_requirements.summary.blocking_issues > 0"
                             :value="`ปัญหาร้ายแรง: ${ocrData.validation.review_requirements.summary.blocking_issues}`"
                             severity="danger" />
                        <Tag v-if="ocrData.validation.review_requirements.summary.warnings > 0"
                             :value="`คำเตือน: ${ocrData.validation.review_requirements.summary.warnings}`"
                             severity="warning" />
                        <Tag v-if="ocrData.validation.review_requirements.summary.info > 0"
                             :value="`ข้อมูล: ${ocrData.validation.review_requirements.summary.info}`"
                             severity="info" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTab>

            <AccordionTab>
              <template #header>
                <div class="flex align-items-center">
                  <i class="pi pi-search mr-2 text-primary"></i>
                  <span class="font-semibold">การตรวจสอบ</span>
                </div>
              </template>
              <div class="grid">
                <div class="col-12 mb-3">
                  <div class="text-500 text-sm mb-1">ต้องตรวจสอบ</div>
                  <Tag
                    :value="ocrData.validation.requires_review ? 'ต้องตรวจสอบ' : 'พร้อมใช้'"
                    :severity="ocrData.validation.requires_review ? 'warning' : 'success'"
                  />
                </div>
                <div class="col-12 mb-3">
                  <div class="text-500 text-sm mb-1">หมายเหตุการประมวลผล</div>
                  <div class="text-900 surface-100 p-3 border-round">
                    {{ ocrData.validation.processing_notes }}
                  </div>
                </div>
                <div class="col-12">
                  <div class="text-500 text-sm mb-2">ฟิลด์ที่ต้องตรวจสอบ</div>
                  <div v-if="ocrData.validation.fields_requiring_review?.length > 0" class="flex flex-wrap gap-2">
                    <Tag
                      v-for="(field, idx) in ocrData.validation.fields_requiring_review"
                      :key="idx"
                      :value="field"
                      severity="warning"
                    />
                  </div>
                  <div v-else class="text-500 surface-100 p-3 border-round text-center">(ไม่มี)</div>
                </div>
              </div>
            </AccordionTab>

            <AccordionTab>
              <template #header>
                <div class="flex align-items-center">
                  <i class="pi pi-sparkles mr-2 text-primary"></i>
                  <span class="font-semibold">คำอธิบายจาก AI</span>
                </div>
              </template>
              <div class="grid">
                <div class="col-12" :class="ocrData.validation.ai_explanation?.evidence_from_receipt ? 'mb-3' : ''">
                  <div class="text-500 text-sm mb-1">การวิเคราะห์</div>
                  <div class="text-900 surface-100 p-3 border-round">
                    {{ ocrData.validation.ai_explanation?.reasoning }}
                  </div>
                </div>
                <div class="col-12" v-if="ocrData.validation.ai_explanation?.evidence_from_receipt">
                  <div class="text-500 text-sm mb-1">หลักฐานจากใบเสร็จ</div>
                  <div class="text-900 surface-100 p-3 border-round">
                    {{ ocrData.validation.ai_explanation.evidence_from_receipt }}
                  </div>
                </div>
              </div>
            </AccordionTab>

            <AccordionTab v-if="ocrData.validation.ai_explanation?.transaction_analysis">
              <template #header>
                <div class="flex align-items-center">
                  <i class="pi pi-arrow-right-arrow-left mr-2 text-primary"></i>
                  <span class="font-semibold">การวิเคราะห์ธุรกรรม</span>
                </div>
              </template>
              <div class="grid">
                <div :class="ocrData.validation.ai_explanation.transaction_analysis.payment_method ? 'col-4' : 'col-6'">
                  <div class="text-500 text-sm mb-1">ประเภท</div>
                  <div class="text-900 font-semibold">
                    {{ ocrData.validation.ai_explanation.transaction_analysis.type }}
                  </div>
                </div>
                <div class="col-4" v-if="ocrData.validation.ai_explanation.transaction_analysis.payment_method">
                  <div class="text-500 text-sm mb-1">วิธีชำระเงิน</div>
                  <div class="text-900 font-semibold">
                    {{ ocrData.validation.ai_explanation.transaction_analysis.payment_method }}
                  </div>
                </div>
                <div :class="ocrData.validation.ai_explanation.transaction_analysis.payment_method ? 'col-4' : 'col-6'">
                  <div class="text-500 text-sm mb-1">มี VAT</div>
                  <Tag
                    :value="ocrData.validation.ai_explanation.transaction_analysis.has_vat ? 'มี' : 'ไม่มี'"
                    :severity="ocrData.validation.ai_explanation.transaction_analysis.has_vat ? 'success' : 'secondary'"
                  />
                </div>
              </div>
              <Divider />
              <div class="grid">
                <div class="col-6">
                  <div class="text-500 text-sm mb-1">หลักฐานการชำระ</div>
                  <div class="text-900 surface-100 p-3 border-round">
                    {{ ocrData.validation.ai_explanation.transaction_analysis.payment_proof }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-500 text-sm mb-1">การกำหนดผู้ซื้อ-ผู้ขาย</div>
                  <div class="text-900 surface-100 p-3 border-round">
                    {{ ocrData.validation.ai_explanation.transaction_analysis.buyer_seller_determination }}
                  </div>
                </div>
              </div>
            </AccordionTab>

            <AccordionTab v-if="ocrData.validation.ai_explanation?.account_selection_logic">
              <template #header>
                <div class="flex align-items-center">
                  <i class="pi pi-sitemap mr-2 text-primary"></i>
                  <span class="font-semibold">ตรรกะการเลือกบัญชี</span>
                </div>
              </template>
              <div class="grid mb-3">
                <div class="col-4">
                  <div class="text-500 text-sm mb-1">ใช้เทมเพลต</div>
                  <Tag
                    :value="ocrData.validation.ai_explanation.account_selection_logic.template_used"
                    :severity="ocrData.validation.ai_explanation.account_selection_logic.template_used === 'true' || ocrData.validation.ai_explanation.account_selection_logic.template_used === true ? 'success' : 'secondary'"
                  />
                </div>
                <div class="col-8">
                  <div class="text-500 text-sm mb-1">รายละเอียดเทมเพลต</div>
                  <div class="text-900">
                    {{ ocrData.validation.ai_explanation.account_selection_logic.template_details }}
                  </div>
                </div>
              </div>
              <div class="grid mb-3" v-if="ocrData.validation.ai_explanation.account_selection_logic.verification">
                <div class="col-12">
                  <div class="text-500 text-sm mb-1">การตรวจสอบ</div>
                  <div class="text-900 surface-100 p-3 border-round">
                    {{ ocrData.validation.ai_explanation.account_selection_logic.verification }}
                  </div>
                </div>
              </div>
              <Divider v-if="ocrData.validation.ai_explanation.account_selection_logic.debit_accounts || ocrData.validation.ai_explanation.account_selection_logic.credit_accounts" />
              <div class="grid" v-if="ocrData.validation.ai_explanation.account_selection_logic.debit_accounts || ocrData.validation.ai_explanation.account_selection_logic.credit_accounts">
                <div class="col-6" v-if="ocrData.validation.ai_explanation.account_selection_logic.debit_accounts">
                  <div class="text-500 text-sm mb-2">
                    <i class="pi pi-plus-circle mr-1 text-green-600"></i>
                    บัญชีเดบิต
                  </div>
                  <ScrollPanel style="height: 200px" class="surface-900 border-round p-3">
                    <pre class="m-0 text-sm text-white">{{
                      JSON.stringify(
                        ocrData.validation.ai_explanation.account_selection_logic.debit_accounts,
                        null,
                        2
                      )
                    }}</pre>
                  </ScrollPanel>
                </div>
                <div class="col-6" v-if="ocrData.validation.ai_explanation.account_selection_logic.credit_accounts">
                  <div class="text-500 text-sm mb-2">
                    <i class="pi pi-minus-circle mr-1 text-orange-600"></i>
                    บัญชีเครดิต
                  </div>
                  <ScrollPanel style="height: 200px" class="surface-900 border-round p-3">
                    <pre class="m-0 text-sm text-white">{{
                      JSON.stringify(
                        ocrData.validation.ai_explanation.account_selection_logic.credit_accounts,
                        null,
                        2
                      )
                    }}</pre>
                  </ScrollPanel>
                </div>
              </div>
            </AccordionTab>

            <AccordionTab v-if="ocrData.validation.ai_explanation?.vendor_matching">
              <template #header>
                <div class="flex align-items-center">
                  <i class="pi pi-link mr-2 text-primary"></i>
                  <span class="font-semibold">การจับคู่ผู้ขาย</span>
                </div>
              </template>
              <div class="grid">
                <div class="col-4">
                  <div class="text-500 text-sm mb-1">วิธีการจับคู่</div>
                  <Tag :value="ocrData.validation.ai_explanation.vendor_matching.matching_method" severity="info" />
                </div>
                <div class="col-4">
                  <div class="text-500 text-sm mb-1">ความเชื่อมั่น</div>
                  <Tag :value="ocrData.validation.ai_explanation.vendor_matching.confidence" severity="success" />
                </div>
                <div class="col-4">
                  <div class="text-500 text-sm mb-1">พบในเอกสาร</div>
                  <div class="text-900 font-semibold">
                    {{ ocrData.validation.ai_explanation.vendor_matching.found_in_document }}
                  </div>
                </div>
              </div>
              <Divider v-if="ocrData.validation.ai_explanation.vendor_matching.matched_with || ocrData.validation.ai_explanation.vendor_matching.reason" />
              <div class="grid" v-if="ocrData.validation.ai_explanation.vendor_matching.matched_with || ocrData.validation.ai_explanation.vendor_matching.reason">
                <div class="col-6" v-if="ocrData.validation.ai_explanation.vendor_matching.matched_with">
                  <div class="text-500 text-sm mb-1">จับคู่กับ</div>
                  <div class="text-900 surface-100 p-3 border-round">
                    {{ ocrData.validation.ai_explanation.vendor_matching.matched_with }}
                  </div>
                </div>
                <div class="col-6" v-if="ocrData.validation.ai_explanation.vendor_matching.reason">
                  <div class="text-500 text-sm mb-1">เหตุผล</div>
                  <div class="text-900 surface-100 p-3 border-round">
                    {{ ocrData.validation.ai_explanation.vendor_matching.reason }}
                  </div>
                </div>
              </div>
              <Message v-if="ocrData.validation.ai_explanation.vendor_matching.matching_method === 'not_found'" severity="warn" :closable="false" class="mt-3">
                <div class="flex align-items-center">
                  <span>ไม่พบผู้ขายในระบบ - กรุณาตรวจสอบและเพิ่มข้อมูลผู้ขาย</span>
                </div>
              </Message>
            </AccordionTab>

            <AccordionTab v-if="ocrData.validation.ai_explanation?.risk_assessment">
              <template #header>
                <div class="flex align-items-center">
                  <i class="pi pi-exclamation-triangle mr-2 text-primary"></i>
                  <span class="font-semibold">การประเมินความเสี่ยง</span>
                </div>
              </template>
              <div class="grid mb-3">
                <div class="col-12 text-center">
                  <div class="text-500 text-sm mb-2">ความเสี่ยงโดยรวม</div>
                  <Tag
                    :value="ocrData.validation.ai_explanation.risk_assessment.overall_risk"
                    :severity="ocrData.validation.ai_explanation.risk_assessment.overall_risk === 'low' || ocrData.validation.ai_explanation.risk_assessment.overall_risk === 'ต่ำ' ? 'success' : ocrData.validation.ai_explanation.risk_assessment.overall_risk === 'medium' || ocrData.validation.ai_explanation.risk_assessment.overall_risk === 'ปานกลาง' ? 'warning' : 'danger'"
                    class="text-lg"
                  />
                </div>
              </div>
              <Divider />
              <div class="grid">
                <div class="col-12 mb-3">
                  <div class="text-500 text-sm mb-1">ปัจจัย</div>
                  <div class="text-900 surface-100 p-3 border-round">
                    {{ ocrData.validation.ai_explanation.risk_assessment.factors }}
                  </div>
                </div>
                <div class="col-12">
                  <div class="text-500 text-sm mb-1">
                    <i class="pi pi-info-circle mr-1"></i>
                    คำแนะนำ
                  </div>
                  <div class="text-900 surface-100 p-3 border-round">
                    {{ ocrData.validation.ai_explanation.risk_assessment.recommendations }}
                  </div>
                </div>
              </div>
            </AccordionTab>
          </Accordion>
        </TabPanel>

        <!-- แท็บที่ 4: การวิเคราะห์เอกสาร -->
        <TabPanel>
          <template #header>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-file-check"></i>
              <span>การวิเคราะห์เอกสาร</span>
            </div>
          </template>
          <!-- สรุปการวิเคราะห์แบบกระชับ -->
          <div class="surface-50 border-round-sm p-2 mb-2">
            <div class="flex gap-2 flex-wrap">
              <div class="flex-1 min-w-max">
                <div class="surface-0 border-round-sm p-2 text-center">
                  <div class="text-xs text-500 mb-1">ความสัมพันธ์</div>
                  <Tag
                    :value="ocrData.document_analysis?.relationship === 'single_document' ? 'เอกสารเดียว' : ocrData.document_analysis?.relationship"
                    severity="info"
                  />
                </div>
              </div>
              <div class="flex-1 min-w-max">
                <div class="surface-0 border-round-sm p-2 text-center">
                  <div class="text-xs text-500 mb-1">จำนวนภาพ</div>
                  <div class="font-bold text-lg text-primary">{{ ocrData.document_analysis?.total_images }}</div>
                </div>
              </div>
              <div class="flex-1 min-w-max">
                <div class="surface-0 border-round-sm p-2 text-center">
                  <div class="text-xs text-500 mb-1">ความเชื่อมั่น</div>
                  <div class="font-bold text-lg text-green-600">{{ ocrData.document_analysis?.confidence }}%</div>
                </div>
              </div>
              <div class="flex-1 min-w-max">
                <div class="surface-0 border-round-sm p-2">
                  <div class="text-xs text-500 mb-1">หมายเหตุ</div>
                  <div class="font-semibold text-sm">{{ ocrData.document_analysis?.analysis_notes }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ตารางภาพต้นทาง -->
          <div v-if="ocrData.source_images && ocrData.source_images.length > 0" class="surface-50 border-round-sm p-2">
            <div class="flex justify-content-between align-items-center mb-2">
              <span class="font-semibold text-sm">ภาพต้นทาง</span>
              <Tag :value="`${ocrData.source_images.length} ภาพ`" severity="info" class="text-xs" />
            </div>
            <DataTable :value="ocrData.source_images" stripedRows size="small">
              <Column field="image_index" header="#" style="width: 60px">
                <template #body="{ data }">
                  <Tag :value="`${data.image_index + 1}`" severity="secondary" class="text-xs" />
                </template>
              </Column>
              <Column field="type" header="ประเภท" style="width: 100px">
                <template #body="{ data }">
                  <Tag
                    :value="data.type === 'receipt' ? 'ใบเสร็จ' : data.type"
                    :severity="data.type === 'receipt' ? 'success' : 'info'"
                    class="text-xs"
                  />
                </template>
              </Column>
              <Column field="receipt_number" header="เลขที่" style="min-width: 140px">
                <template #body="{ data }">
                  <span class="font-mono text-sm">{{ data.receipt_number }}</span>
                </template>
              </Column>
              <Column field="date" header="วันที่" style="width: 110px">
                <template #body="{ data }">
                  <span class="text-sm">{{ data.date }}</span>
                </template>
              </Column>
              <Column field="amount" header="จำนวนเงิน" style="width: 120px" class="text-right">
                <template #body="{ data }">
                  <span class="font-bold text-primary">
                    {{ typeof data.amount === 'number' ? data.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : data.amount }}
                  </span>
                </template>
              </Column>
              <Column field="confidence" header="เชื่อมั่น" style="width: 90px">
                <template #body="{ data }">
                  <Tag
                    :value="`${data.confidence}%`"
                    :severity="data.confidence >= 90 ? 'success' : data.confidence >= 70 ? 'warning' : 'danger'"
                    class="text-xs"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>

        <!-- แท็บที่ 5: ข้อมูลเทมเพลต -->
        <TabPanel>
          <template #header>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-clone"></i>
              <span>ข้อมูลเทมเพลต</span>
            </div>
          </template>
          <!-- ข้อมูลเทมเพลตแบบกระชับ -->
          <div class="surface-50 border-round-sm p-2 mb-2">
            <div class="flex gap-2 flex-wrap mb-2">
              <div class="flex-1 min-w-max">
                <div class="surface-0 border-round-sm p-2 text-center">
                  <div class="text-xs text-500 mb-1">ใช้เทมเพลต</div>
                  <Tag
                    :value="ocrData.template_info?.template_used === 'true' || ocrData.template_info?.template_used === true ? 'ใช้แล้ว' : 'ไม่ใช้'"
                    :severity="ocrData.template_info?.template_used === 'true' || ocrData.template_info?.template_used === true ? 'success' : 'secondary'"
                  />
                </div>
              </div>
              <div class="flex-1 min-w-max" v-if="ocrData.template_info?.template_name">
                <div class="surface-0 border-round-sm p-2">
                  <div class="text-xs text-500 mb-1">ชื่อเทมเพลต</div>
                  <div class="font-semibold">{{ ocrData.template_info.template_name }}</div>
                </div>
              </div>
              <div class="flex-1 min-w-max" v-if="ocrData.template_info?.confidence">
                <div class="surface-0 border-round-sm p-2 text-center">
                  <div class="text-xs text-500 mb-1">ความเชื่อมั่น</div>
                  <div class="font-bold text-lg text-primary">{{ ocrData.template_info.confidence }}%</div>
                </div>
              </div>
            </div>

            <!-- หมายเหตุและเหตุผล -->
            <div v-if="ocrData.template_info?.note || ocrData.template_info?.selection_reason" class="grid">
              <div class="col-12" v-if="ocrData.template_info?.note">
                <div class="surface-0 border-round-sm p-2">
                  <div class="text-xs text-500 mb-1">หมายเหตุ</div>
                  <div class="text-sm">{{ ocrData.template_info.note }}</div>
                </div>
              </div>
              <div class="col-12" v-if="ocrData.template_info?.selection_reason">
                <div class="surface-0 border-round-sm p-2">
                  <div class="text-xs text-500 mb-1">เหตุผลในการเลือก</div>
                  <div class="text-sm">{{ ocrData.template_info.selection_reason }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- บัญชีที่ใช้ -->
          <div v-if="ocrData.template_info?.accounts_used" class="surface-50 border-round-sm p-2">
            <div class="font-semibold text-sm mb-2">บัญชีที่ใช้</div>
            <DataTable :value="ocrData.template_info.accounts_used" size="small" stripedRows>
              <Column field="account_code" header="รหัส" style="width: 100px">
                <template #body="{ data }">
                  <span class="font-mono text-sm">{{ data.account_code }}</span>
                </template>
              </Column>
              <Column field="account_name" header="ชื่อบัญชี">
                <template #body="{ data }">
                  <span class="text-sm">{{ data.account_name }}</span>
                </template>
              </Column>
            </DataTable>
          </div>
        </TabPanel>

        <!-- แท็บที่ 6: Custom Prompts -->
        <TabPanel v-if="ocrData.custom_prompts">
          <template #header>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-microchip"></i>
              <span>Prompts ที่ใช้</span>
            </div>
          </template>
          <div v-if="ocrData.custom_prompts.shop_context" class="surface-50 border-round-sm p-2 mb-2">
            <div class="flex justify-content-between align-items-center mb-2">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-building text-primary"></i>
                <span class="font-semibold text-sm">ข้อมูลร้านค้า (Shop Context)</span>
              </div>
              <Tag value="ใช้แล้ว" severity="success" class="text-xs" />
            </div>
            <div class="surface-0 border-round-sm p-2">
              <div class="text-sm" style="white-space: pre-wrap; word-wrap: break-word;">{{ ocrData.custom_prompts.shop_context }}</div>
            </div>
          </div>

          <div v-if="ocrData.custom_prompts.template_guidance" class="surface-50 border-round-sm p-2">
            <div class="flex justify-content-between align-items-center mb-2">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-book text-primary"></i>
                <span class="font-semibold text-sm">คำแนะนำเทมเพลต (Template Guidance)</span>
              </div>
              <Tag value="ใช้แล้ว" severity="success" class="text-xs" />
            </div>
            <div class="surface-0 border-round-sm p-2">
              <div class="text-sm font-mono" style="white-space: pre-wrap; word-wrap: break-word;">{{ ocrData.custom_prompts.template_guidance }}</div>
            </div>
          </div>
        </TabPanel>

        <!-- แท็บที่ 7: ข้อมูลเมตา -->
        <TabPanel>
          <template #header>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-info-circle"></i>
              <span>ข้อมูลเมตา</span>
            </div>
          </template>
          <!-- ข้อมูลการประมวลผล -->
          <div class="surface-50 border-round-sm p-2 mb-2">
            <div class="font-semibold text-sm mb-2">ข้อมูลการประมวลผล</div>
            <div class="surface-0 border-round-sm p-2 mb-2">
              <div class="text-xs text-500 mb-1">Request ID</div>
              <div class="font-mono text-xs">{{ ocrData.metadata?.request_id }}</div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 surface-0 border-round-sm p-2 text-center">
                <div class="text-xs text-500 mb-1">ประมวลผลเมื่อ</div>
                <div class="font-semibold text-sm">{{ ocrData.metadata?.processed_at }}</div>
              </div>
              <div class="flex-1 surface-0 border-round-sm p-2 text-center">
                <div class="text-xs text-500 mb-1">ระยะเวลา</div>
                <div class="font-bold text-lg text-primary">{{ ocrData.metadata?.duration_sec }}s</div>
              </div>
              <div class="flex-1 surface-0 border-round-sm p-2 text-center">
                <div class="text-xs text-500 mb-1">จำนวนภาพ</div>
                <div class="font-bold text-lg text-primary">{{ ocrData.metadata?.images_processed }}</div>
              </div>
            </div>
          </div>

          <!-- OCR Warnings -->
          <div v-if="ocrData.metadata?.ocr_warnings?.length > 0" class="surface-50 border-round-sm p-2 mb-2">
            <div class="flex justify-content-between align-items-center mb-2">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-exclamation-triangle text-orange-500"></i>
                <span class="font-semibold text-sm">คำเตือน OCR</span>
              </div>
              <Tag :value="`${ocrData.metadata.ocr_warnings.length} รายการ`" severity="warning" class="text-xs" />
            </div>
            <div v-for="(warning, idx) in ocrData.metadata.ocr_warnings" :key="idx" class="mb-2">
              <Message severity="warn" :closable="false">
                <div class="text-sm">
                  <div class="font-semibold mb-2">ภาพที่ {{ warning.image_index + 1 }}</div>
                  <div class="mb-2">{{ warning.warning }}</div>
                  <div class="grid text-xs">
                    <div class="col-4">
                      <div class="text-500">Fallback Used:</div>
                      <Tag :value="warning.fallback_used ? 'ใช่' : 'ไม่'" :severity="warning.fallback_used ? 'warning' : 'success'" class="text-xs mt-1" />
                    </div>
                    <div class="col-4">
                      <div class="text-500">Is Partial:</div>
                      <Tag :value="warning.is_partial ? 'ใช่' : 'ไม่'" :severity="warning.is_partial ? 'warning' : 'info'" class="text-xs mt-1" />
                    </div>
                    <div class="col-4">
                      <div class="text-500">Text Length:</div>
                      <div class="font-mono font-semibold mt-1">{{ warning.text_length?.toLocaleString() }}</div>
                    </div>
                  </div>
                </div>
              </Message>
            </div>
          </div>

          <!-- Token Usage -->
          <div v-if="ocrData.metadata?.token_usage" class="surface-50 border-round-sm p-2">
            <div class="font-semibold text-sm mb-2">ค่าใช้จ่ายและ Token</div>
            <div class="surface-0 border-round-sm p-2 text-center mb-2">
              <div class="text-xs text-500 mb-1">ค่าใช้จ่ายทั้งหมด</div>
              <div class="font-bold text-2xl text-green-600">{{ ocrData.metadata.token_usage.cost_thb }}</div>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 surface-0 border-round-sm p-2 text-center">
                <div class="text-xs text-500 mb-1">Input</div>
                <div class="font-bold">{{ ocrData.metadata.token_usage.input_tokens?.toLocaleString() }}</div>
              </div>
              <div class="flex-1 surface-0 border-round-sm p-2 text-center">
                <div class="text-xs text-500 mb-1">Output</div>
                <div class="font-bold">{{ ocrData.metadata.token_usage.output_tokens?.toLocaleString() }}</div>
              </div>
              <div class="flex-1 surface-0 border-round-sm p-2 text-center">
                <div class="text-xs text-500 mb-1">Total</div>
                <div class="font-bold text-primary">{{ ocrData.metadata.token_usage.total_tokens?.toLocaleString() }}</div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- แท็บที่ 8: JSON ดิบ -->
        <TabPanel>
          <template #header>
            <div class="flex align-items-center gap-2">
              <i class="pi pi-code"></i>
              <span>JSON ดิบ</span>
            </div>
          </template>
          <div class="surface-50 border-round-sm p-2">
            <div class="flex justify-content-between align-items-center mb-2">
              <div class="font-semibold text-sm">ข้อมูลทั้งหมด (JSON)</div>
              <Button
                label="Copy JSON"
                icon="pi pi-copy"
                size="small"
                severity="secondary"
                @click="copyJsonToClipboard"
              />
            </div>
            <ScrollPanel style="height: 65vh" class="surface-900 border-round-sm p-2">
              <pre class="m-0 text-xs text-white">{{ JSON.stringify(ocrData, null, 2) }}</pre>
            </ScrollPanel>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <template #footer>
      <div class="flex justify-content-between align-items-center">
        <div class="flex gap-2">
          <Button
            :label="showApplyButton ? 'ยกเลิก' : 'ปิด'"
            icon="pi pi-times"
            class="p-button-text p-button-secondary"
            @click="closeDialog"
          />
          <Button
            v-if="hasOldOcrData"
            label="อ่าน OCR ใหม่"
            icon="pi pi-refresh"
            class="p-button-warning"
            @click="refreshOcr"
          />
        </div>
        <div class="flex align-items-center gap-3">
          <span class="text-sm text-500"> shopid: {{ ocrData?.shopid }} </span>
          <Button
            v-if="showApplyButton"
            label="นำข้อมูลไปใช้"
            icon="pi pi-check"
            class="p-button-success p-button-lg"
            @click="applyData"
            :disabled="
              !ocrData || !ocrData.accounting_entry?.balance_check?.balanced
            "
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { useToast } from 'primevue/usetoast';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';

const toast = useToast();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  ocrData: {
    type: Object,
    default: null,
  },
  uploadedImages: {
    type: Array,
    default: () => [],
  },
  showApplyButton: {
    type: Boolean,
    default: true,
  },
  hasOldOcrData: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible", "apply-data", "close", "refresh-ocr"]);

function getReviewTooltip() {
  if (!props.ocrData?.validation) return '';

  const { requires_review, review_requirements, processing_notes } = props.ocrData.validation;

  // ถ้ามี review_requirements ใหม่ ใช้ข้อมูลจากนั้น
  if (review_requirements) {
    // รองรับทั้งภาษาไทยและอังกฤษ
    const ระดับความสำคัญ = review_requirements.ระดับความสำคัญ || review_requirements.review_priority || '';
    const สามารถบันทึก = review_requirements.สามารถบันทึก !== undefined ? review_requirements.สามารถบันทึก : review_requirements.can_proceed;
    const สถานะ = review_requirements.สถานะ || review_requirements.status || '';
    const คำแนะนำ = review_requirements.คำแนะนำ || review_requirements.review_reason || '';
    const สรุป = review_requirements.สรุป || review_requirements.summary;
    const คะแนนรวม = review_requirements.คะแนนรวม || '';

    if (!requires_review && สามารถบันทึก) {
      return '✅ ข้อมูลครบถ้วนและถูกต้อง\nสามารถบันทึกได้เลย';
    }

    let tooltip = `${ระดับความสำคัญ}\n\n`;

    if (คะแนนรวม) {
      tooltip += `📊 คะแนน: ${คะแนนรวม}\n\n`;
    }

    if (สถานะ) {
      tooltip += `${สถานะ}\n\n`;
    }

    if (คำแนะนำ) {
      tooltip += `💡 ${คำแนะนำ}\n\n`;
    }

    if (สรุป) {
      tooltip += '📋 สรุป:\n';
      if (สรุป.ปัญหาร้ายแรง > 0) tooltip += `• ปัญหาร้ายแรง: ${สรุป.ปัญหาร้ายแรง}\n`;
      if (สรุป.ควรตรวจสอบ > 0) tooltip += `• ควรตรวจสอบ: ${สรุป.ควรตรวจสอบ}\n`;
      if (สรุป.จำนวนปัญหา > 0) tooltip += `• จำนวนปัญหา: ${สรุป.จำนวนปัญหา}\n`;

      // Fallback สำหรับภาษาอังกฤษ
      if (สรุป.blocking_issues > 0) tooltip += `• ปัญหาร้ายแรง: ${สรุป.blocking_issues}\n`;
      if (สรุป.warnings > 0) tooltip += `• คำเตือน: ${สรุป.warnings}\n`;
      if (สรุป.info > 0) tooltip += `• ข้อมูล: ${สรุป.info}\n`;
    }

    return tooltip;
  }

  // Fallback เดิม
  if (!requires_review) {
    return '✅ ข้อมูลครบถ้วนและถูกต้อง\nสามารถบันทึกได้เลย';
  }

  let tooltip = '⚠️ ต้องตรวจสอบ\n\n';

  if (processing_notes) {
    tooltip += `💡 หมายเหตุ:\n${processing_notes}`;
  }

  return tooltip;
}

function getConfidenceTooltip() {
  if (!props.ocrData?.validation?.confidence) return '';
  
  const { level, score } = props.ocrData.validation.confidence;
  
  const levelLabels = {
    'low': 'ต่ำ (0-60%)',
    'medium': 'ปานกลาง (61-80%)',
    'high': 'สูง (81-100%)'
  };
}

function refreshOcr() {
  emit("refresh-ocr");
}

async function copyJsonToClipboard() {
  try {
    const jsonString = JSON.stringify(props.ocrData, null, 2);
    await navigator.clipboard.writeText(jsonString);
    toast.add({
      severity: 'success',
      summary: 'คัดลอกสำเร็จ',
      detail: 'คัดลอก JSON ไปยัง Clipboard แล้ว',
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'เกิดข้อผิดพลาด',
      detail: 'ไม่สามารถคัดลอก JSON ได้',
      life: 3000
    });
    console.error('Failed to copy JSON:', err);
  }
}

function closeDialog() {
  emit("close");
}

function applyData() {
  emit("apply-data", props.ocrData);
}
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.25rem;
}

/* Compact Accordion Style */
:deep(.compact-accordion .p-accordion-header-link) {
  padding: 0.5rem 0.75rem;
}

:deep(.compact-accordion .p-accordion-content) {
  padding: 0.5rem 0.75rem;
}

/* Compact Table Style */
:deep(.p-datatable.p-datatable-sm .p-datatable-thead > tr > th) {
  padding: 0.3rem 0.5rem;
  font-size: 0.875rem;
}

:deep(.p-datatable.p-datatable-sm .p-datatable-tbody > tr > td) {
  padding: 0.3rem 0.5rem;
}

/* Responsive padding for columns */
@media (max-width: 1400px) {
  .pr-2 {
    padding-right: 0.5rem !important;
  }
  .pl-2 {
    padding-left: 0.5rem !important;
  }
  .pr-1 {
    padding-right: 0.25rem !important;
  }
  .pl-1 {
    padding-left: 0.25rem !important;
  }
}

@media (max-width: 992px) {
  .pr-2, .pl-2, .pr-1, .pl-1 {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
}
</style>
