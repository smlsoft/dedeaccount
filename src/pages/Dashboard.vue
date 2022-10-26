<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MasterdataService from "@/services/MasterdataService";
import ImageDataService from "@/services/ImageDataService";
import UsersDataService from "@/services/UsersDataService";
import MainContentWarp from "@/components/MainContentWarp.vue";
import { onMounted, ref } from "vue";
import { useApp } from "@/stores/app.js";
import { useRouter } from "vue-router";

const storeApp = useApp();
const router = useRouter();
const dataAccountChart = ref([]);
const dataJournal = ref([]);
const dataImages = ref([]);
const dataUser = ref([]);

const showSkeletonAccount = ref(false);
const showSkeletonJourna = ref(false);
const showSkeletonImage = ref(false);
const showSkeletonUser = ref(false);

onMounted(() => {
  storeApp.setActivePage("dashboard");
  storeApp.setActiveChild('');
  storeApp.setPageTitle("แดรชบอร์ด");

  getAccountChart();
  getGLJournalList();
  getDocImageList();
  getUserShop();
});

function getAccountChart() {
  showSkeletonAccount.value = true;
  MasterdataService.getAccountChartList()
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
  MasterdataService.getGLJournalList()
    .then((res) => {
      // console.log(res);
      if (res.success) {
        dataJournal.value = res.pagination.total;
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
  ImageDataService.getDocumentImageGroup()
    .then((res) => {
      // console.log(res);
      if (res.success) {
        dataImages.value = res.pagination.total;
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
  UsersDataService.getUserShop()
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

function goTo(path,) {
  router.push({ name: path });
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="grid">
        <div class="col-12">
          <div class="surface-card shadow-2 border-round flex p-3 flex-column md:flex-row">
            <div @click="goTo('chartList')"
              class="cursor-pointer  border-bottom-1 md:border-right-1 md:border-bottom-none surface-border flex-auto p-3">
              <div class="flex align-items-center mb-3">
                <i class="pi pi-microsoft text-blue-500 text-xl mr-2"></i>
                <span class="text-500 font-medium">ผังบัญชี</span>
              </div>
              <Skeleton width="4rem" height="1.5rem" v-if="showSkeletonAccount"></Skeleton>
              <span class="block text-900 font-medium  text-xl" v-if="!showSkeletonAccount">{{ dataAccountChart}} </span>
            </div>
            <div @click="goTo('dailyList')"
              class="cursor-pointer  border-bottom-1 md:border-right-1 md:border-bottom-none surface-border flex-auto p-3">
              <div class="flex align-items-center mb-3">
                <i class="pi pi-list text-orange-500 text-xl mr-2"></i>
                <span class="text-500 font-medium">บันทึกรายการบัญชี</span>
              </div>
              <Skeleton width="4rem" height="1.5rem" v-if="showSkeletonJourna"></Skeleton>
              <span class="block text-900 font-medium text-xl" v-if="!showSkeletonJourna">{{ dataJournal}} </span>
            </div>
            <div @click="goTo('pic_group_docref')"
              class="cursor-pointer  border-bottom-1 md:border-right-1 md:border-bottom-none surface-border flex-auto p-3">
              <div class="flex align-items-center mb-3">
                <i class="pi pi-image text-cyan-500 text-xl mr-2"></i>
                <span class="text-500 font-medium">รูปภาพ</span>
              </div>
              <Skeleton width="4rem" height="1.5rem" v-if="showSkeletonImage"></Skeleton>
              <span class="block text-900 font-medium  text-xl" v-if="!showSkeletonImage">{{ dataImages}}</span>
            </div>
            <div class="cursor-pointer  flex-auto p-3" @click="goTo('user_list')">
              <div class="flex align-items-center mb-3">
                <i class="pi pi-users text-purple-500 text-xl mr-2"></i>
                <span class="text-500 font-medium">ผู้ใช้งาน</span>
              </div>
              <Skeleton width="4rem" height="1.5rem" v-if="showSkeletonUser"></Skeleton>
              <span class="block text-900 font-medium  text-xl" v-if="!showSkeletonUser">{{ dataUser}}</span>

            </div>
          </div>
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>
</template>
