<script setup>
import AuthenService from "@/services/AuthenService";
import { useApp } from "@/stores/app.js";
import { ref, onMounted } from "vue";
import { menus } from "@/api/menu";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";

import slideMenu from "@/components/layout/SlideMenu.vue";
import topMenu from "@/components/layout/TopBar.vue";
import getListShop from "@/components/ListShop.vue";

const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const displaySelectShop = ref(false);
const listShop = ref();
const lockSlideBar = ref(false);
const widthscreen = ref();
onMounted(() => {
  lockSlideBar.value = localStorage.setLockSlideBar;
  if (localStorage.setLockSlideBar == "true") {
    lockSlideBar.value = true;
  } else {
    lockSlideBar.value = false;
  }

  console.log(lockSlideBar.value);

  widthscreen.value = screen.width;
});

const openSelectShop = () => {
  AuthenService.getListShop()
    .then((res) => {
      console.log(res);
      if (res.success) {
        listShop.value = res.data;
        setTimeout(() => {
          checkShop();
          displaySelectShop.value = true;
        }, 200);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
function checkShop() {
  listShop.value.forEach((ele) => {
    if (ele.shopid == localStorage.shopid) {
      return (ele.disable = true);
    } else {
      return (ele.disable = false);
    }
  });
}
async function selectShop(data) {
  localStorage.shopid = data.shopid;
  localStorage.shop_name = data.name;
  localStorage.shop_role = data.role;

  AuthenService.selectShop()
    .then((res) => {
      if (res.success) {
        displaySelectShop.value = false;
        toast.add({
          severity: "success",
          summary: "success",
          detail: "เปลี่ยนร้านสำเร็จ",
          life: 3000,
        });
        setTimeout(() => {
          router.go();
        }, 400);
      }
    })
    .catch((err) => {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ไม่สามารถเปลี่ยนร้านได้ " + err,
        life: 3000,
      });
    });
}

async function isFavorite(data, favorite) {
  data = {
    isfavorite: favorite,
    shopid: data.shopid,
  };
  try {
    const res = await AuthenService.putFavorite(data);
    if (res.success) {
      console.log(res);
    }
  } catch (err) {
    console.log(err);
  }
}

function goLogout() {
  router.push({
    name: "logout",
  });
}

function lockShowSlideBar(data) {
  localStorage.setLockSlideBar = data;
  lockSlideBar.value = data;
}
</script>

<template>
  <div class="min-h-screen flex relative lg:static surface-ground">
    <!-- slide menu -->
    <slideMenu
      :menus="menus"
      :lockSlideBar="lockSlideBar"
      v-on:lockSlideBar="lockShowSlideBar"
    />
    <div
      class="min-h-screen flex flex-column relative flex-auto"
      :style="[
        !lockSlideBar ? 'padding-left: 60px;' : '',
        widthscreen < 992 ? 'padding-left: 0px;' : '',
      ]"
    >
      <!-- top menu -->
      <topMenu style="" v-on:openSelectShop="openSelectShop()" />
      <Toast />
      <!-- content -->
      <div class="p-0 flex flex-column flex-auto">
        <div class="surface-section flex-auto">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>

  <Dialog
    :showHeader="false"
    v-model:visible="displaySelectShop"
    ::breakpoints="{'960px': '75vw', '640px': '90vw'}"
    :style="{ width: '70vw' }"
    position="top"
    :modal="true"
    :draggable="false"
  >
    <getListShop
      :listShop="listShop"
      v-on:isFavorite="isFavorite"
      v-on:selectShop="selectShop"
      v-on:goLogout="goLogout"
    />
    <template #footer>
      <div class="border-top-1 surface-border pt-3">
        <Button
          icon="pi pi-times"
          @click="displaySelectShop = false"
          label="ปิด"
          class="p-button-outlined"
        ></Button>
      </div>
    </template>
  </Dialog>
</template>
<style scoped>
.z-1 {
  z-index: 999 !important;
}
</style>
