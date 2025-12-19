<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import { onMounted, ref } from "vue";
import { useApp } from "@/stores/app.js";
import { useRouter } from "vue-router";
import Chart from 'primevue/chart';

import DashboardDataService from "@/services/DashboardDataService";

const storeApp = useApp();
const router = useRouter();
const dataAccountChart = ref([]);
const dataJournal = ref([]);
const dataImages = ref([]);
const dataUser = ref([]);

const chartData = ref(null);
const chartOptions = ref(null);
const chartDataImages = ref(null);
const chartOptionsImages = ref(null);

const showSkeletonAccount = ref(false);
const showSkeletonJourna = ref(false);
const showSkeletonImage = ref(false);
const showSkeletonUser = ref(false);

onMounted(() => {
  storeApp.setActivePage("dashboard");
  storeApp.setActiveChild("");
  storeApp.setPageTitle("แดรชบอร์ด");

  getAccountChart();
  getGLJournalList();
  getDocImageList();
  getUserShop();
});

function getAccountChart() {
  showSkeletonAccount.value = true;
  DashboardDataService.getAccountChart()
    .then((res) => {
      // console.log(res);
      if (res.success) {
        dataAccountChart.value = res.pagination.total;
        setTimeout(() => {
          showSkeletonAccount.value = false;
        }, 500);
      }
    })
    .catch((err) => {
      console.log(err);
      showSkeletonAccount.value = false;
    });
}

function getGLJournalList() {
  showSkeletonJourna.value = true;
  DashboardDataService.getGLJournalListForDashboard()
    .then((res) => {
      // console.log(res);
      if (res.success) {
        dataJournal.value = res.pagination.total;
        
        // นับจำนวนตาม appname
        const manualCount = res.data.filter(item => item.appname === "").length;
        const aiCount = res.data.filter(item => item.appname === "AI").length;
        
        // สร้างข้อมูลกราฟ
        chartData.value = {
          labels: ['คีย์บัญชีเอง', 'AI OCR'],
          datasets: [
            {
              data: [manualCount, aiCount],
              backgroundColor: [
                'rgba(148, 163, 184, 0.75)',   // Slate Gray - สีเทาน้ำเงินอ่อน
                'rgba(99, 102, 241, 0.75)'     // Indigo - สีม่วงน้ำเงินอ่อน
              ],
              borderColor: [
                'rgb(148, 163, 184)',
                'rgb(99, 102, 241)'
              ],
              borderWidth: 1,
              hoverBackgroundColor: [
                'rgba(148, 163, 184, 0.9)',
                'rgba(99, 102, 241, 0.9)'
              ]
            }
          ]
        };

        chartOptions.value = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  family: 'Sarabun, sans-serif',
                  size: 14
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${value} รายการ (${percentage}%)`;
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              bodyFont: {
                family: 'Sarabun, sans-serif',
                size: 14
              }
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true
          }
        };
        
        setTimeout(() => {
          showSkeletonJourna.value = false;
        }, 500);
      }
    })
    .catch((err) => {
      console.log(err);
      showSkeletonJourna.value = false;
    });
}

function getDocImageList() {
  showSkeletonImage.value = true;
  DashboardDataService.getDocumentImageGroupForDashboard()
    .then((res) => {
      // console.log(res);
      if (res.success) {
        dataImages.value = res.pagination.total;
        
        // นับจำนวนบิลตาม references
        const notRecordedCount = res.data.filter(item => 
          !item.references || item.references.length === 0
        ).length;
        const recordedCount = res.data.filter(item => 
          item.references && item.references.length > 0 && 
          item.references.some(ref => ref.module === "GL")
        ).length;
        
        // สร้างข้อมูลกราฟรูปภาพ
        chartDataImages.value = {
          labels: ['ยังไม่ได้คีย์รายวัน', 'คีย์รายวันแล้ว'],
          datasets: [
            {
              data: [notRecordedCount, recordedCount],
              backgroundColor: [
                'rgba(251, 191, 36, 0.75)',   // Amber - สีเหลืองอ่อน (แสดงงานค้าง)
                'rgba(52, 211, 153, 0.75)'    // Emerald - สีเขียวอ่อน (แสดงงานเสร็จ)
              ],
              borderColor: [
                'rgb(251, 191, 36)',
                'rgb(52, 211, 153)'
              ],
              borderWidth: 1,
              hoverBackgroundColor: [
                'rgba(251, 191, 36, 0.9)',
                'rgba(52, 211, 153, 0.9)'
              ]
            }
          ]
        };

        chartOptionsImages.value = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  family: 'Sarabun, sans-serif',
                  size: 14
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${value} รายการ (${percentage}%)`;
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              bodyFont: {
                family: 'Sarabun, sans-serif',
                size: 14
              }
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true
          }
        };
        
        setTimeout(() => {
          showSkeletonImage.value = false;
        }, 500);
      }
    })
    .catch((err) => {
      showSkeletonImage.value = false;
      console.log(err);
    });
}

function getUserShop() {
  showSkeletonUser.value = true;
  DashboardDataService.getUserShop()
    .then((res) => {
      //console.log(res);
      if (res.success) {
        dataUser.value = res.pagination.total;
        setTimeout(() => {
          showSkeletonUser.value = false;
        }, 500);
      }
    })
    .catch((err) => {
      showSkeletonUser.value = false;
      console.log(err);
    });
}

function goTo(path) {
  router.push({ name: path });
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="grid">
        <div class="col-12">
          <div
            class="surface-card shadow-2 border-round flex p-3 flex-column md:flex-row gap-3"
          >
            <div
              @click="goTo('chartList')"
              class="cursor-pointer flex-auto p-4 border-round hover:surface-100 transition-all transition-duration-200"
            >
              <div class="flex align-items-center mb-3">
                <div class="w-3rem h-3rem border-round flex align-items-center justify-content-center mr-3" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                  <i class="pi pi-microsoft text-white text-2xl"></i>
                </div>
                <div>
                  <span class="block text-500 font-medium text-sm mb-1">{{
                    $t("account_code")
                  }}</span>
                  <Skeleton
                    width="4rem"
                    height="1.5rem"
                    v-if="showSkeletonAccount"
                  ></Skeleton>
                  <span
                    class="block text-900 font-bold text-2xl"
                    v-if="!showSkeletonAccount"
                    >{{ dataAccountChart }}
                  </span>
                </div>
              </div>
            </div>
            <div
              @click="goTo('dailyList')"
              class="cursor-pointer flex-auto p-4 border-round hover:surface-100 transition-all transition-duration-200"
            >
              <div class="flex align-items-center mb-3">
                <div class="w-3rem h-3rem border-round flex align-items-center justify-content-center mr-3" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                  <i class="pi pi-list text-white text-2xl"></i>
                </div>
                <div>
                  <span class="block text-500 font-medium text-sm mb-1">{{
                    $t("account_entry")
                  }}</span>
                  <Skeleton
                    width="4rem"
                    height="1.5rem"
                    v-if="showSkeletonJourna"
                  ></Skeleton>
                  <span
                    class="block text-900 font-bold text-2xl"
                    v-if="!showSkeletonJourna"
                    >{{ dataJournal }}
                  </span>
                </div>
              </div>
            </div>
            <div
              @click="goTo('images_job_upload')"
              class="cursor-pointer flex-auto p-4 border-round hover:surface-100 transition-all transition-duration-200"
            >
              <div class="flex align-items-center mb-3">
                <div class="w-3rem h-3rem border-round flex align-items-center justify-content-center mr-3" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                  <i class="pi pi-image text-white text-2xl"></i>
                </div>
                <div>
                  <span class="block text-500 font-medium text-sm mb-1">{{ $t("img") }}</span>
                  <Skeleton
                    width="4rem"
                    height="1.5rem"
                    v-if="showSkeletonImage"
                  ></Skeleton>
                  <span
                    class="block text-900 font-bold text-2xl"
                    v-if="!showSkeletonImage"
                    >{{ dataImages }}</span
                  >
                </div>
              </div>
            </div>
            <!-- <div
              class="cursor-pointer flex-auto p-3"
              @click="goTo('user_list')"
            >
              <div class="flex align-items-center mb-3">
                <i class="pi pi-users text-purple-500 text-xl mr-2"></i>
                <span class="text-500 font-medium">{{ $t("user") }}</span>
              </div>
              <Skeleton
                width="4rem"
                height="1.5rem"
                v-if="showSkeletonUser"
              ></Skeleton>
              <span
                class="block text-900 font-medium text-xl"
                v-if="!showSkeletonUser"
                >{{ dataUser }}</span
              >
            </div> -->
          </div>
        </div>
        
        <!-- Chart Section -->
        <div class="col-12 md:col-6" v-if="chartData">
          <div class="surface-card shadow-2 border-round p-4 hover:shadow-3 transition-all transition-duration-300">
            <div class="flex align-items-center justify-content-between mb-4">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-chart-pie text-indigo-500 text-2xl"></i>
                <span class="text-900 font-semibold text-xl">สถิติการบันทึกบัญชี</span>
              </div>
            </div>
            <div class="flex justify-content-center align-items-center" style="height: 350px">
              <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full h-full" />
            </div>
            <div class="grid mt-3 pt-3 border-top-1 surface-border">
              <div class="col-6 text-center">
                <div class="text-500 text-sm mb-1">คีย์บัญชีเอง</div>
                <div class="text-900 font-bold text-xl" style="color: rgb(100, 116, 139)">
                  {{ chartData.datasets[0].data[0] }}
                </div>
              </div>
              <div class="col-6 text-center">
                <div class="text-500 text-sm mb-1">AI OCR</div>
                <div class="text-900 font-bold text-xl" style="color: rgb(99, 102, 241)">
                  {{ chartData.datasets[0].data[1] }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Images Section -->
        <div class="col-12 md:col-6" v-if="chartDataImages">
          <div class="surface-card shadow-2 border-round p-4 hover:shadow-3 transition-all transition-duration-300">
            <div class="flex align-items-center justify-content-between mb-4">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-chart-pie text-orange-500 text-2xl"></i>
                <span class="text-900 font-semibold text-xl">สถิติรูปภาพเอกสาร</span>
              </div>
            </div>
            <div class="flex justify-content-center align-items-center" style="height: 350px">
              <Chart type="doughnut" :data="chartDataImages" :options="chartOptionsImages" class="w-full h-full" />
            </div>
            <div class="grid mt-3 pt-3 border-top-1 surface-border">
              <div class="col-6 text-center">
                <div class="text-500 text-sm mb-1">ยังไม่ได้คีย์รายวัน</div>
                <div class="text-900 font-bold text-xl" style="color: rgb(217, 119, 6)">
                  {{ chartDataImages.datasets[0].data[0] }}
                </div>
              </div>
              <div class="col-6 text-center">
                <div class="text-500 text-sm mb-1">คีย์รายวันแล้ว</div>
                <div class="text-900 font-bold text-xl" style="color: rgb(16, 185, 129)">
                  {{ chartDataImages.datasets[0].data[1] }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>
</template>
