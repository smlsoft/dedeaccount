<script setup>
import AuthenService from "@/services/AuthenService";
import { useApp } from "@/stores/app.js";
import { ref, onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import { menus } from "@/api/menu";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
const toast = useToast();
const shopName = localStorage.shop_name;
const userName = localStorage._usercode;
const storeApp = useApp();
const router = useRouter();
const displaySelectShop = ref(false);
const listShop = ref();

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

onMounted(() => {});

async function selectShop(item) {
  localStorage.shopid = item.shopid;
  if (data.name == "") {
    const thNameObj = data.names.find((nameObj) => nameObj.code === "th");

    localStorage.shop_name = thNameObj.name;
  }else{
    localStorage.shop_name = data.name;
  }

  localStorage.shop_name = thNameObj.name;
  localStorage.shop_role = item.role;

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

function checkShop() {
  listShop.value.forEach((ele) => {
    if (ele.shopid == localStorage.shopid) {
      return (ele.disable = true);
    } else {
      return (ele.disable = false);
    }
  });
}
</script>

<template>
  <div class="surface-overlay relative">
    <div
      class="flex align-items-center justify-content-between lg:static"
      style="height: 65px"
    >
      <div
        class="flex align-items-center bg-indigo-500 text-white h-full"
        style="height: 65px; width: 270px"
      >
        <img
          src="@/assets/dedepos.png"
          alt="Image"
          height="40"
          class="mr-0 lg:mr-3 pl-3"
        />
        <div class="ml-2 cursor-pointer" @click="openSelectShop()">
          {{ shopName }} <i class="pi pi-sort-alt ml-2"></i>
        </div>
      </div>
      <div class="flex align-items-center px-4">
        <a
          v-ripple
          class="cursor-pointer block lg:hidden text-700 p-ripple"
          v-styleclass="{
            selector: '#navbar-7',
            enterClass: 'hidden',
            leaveToClass: 'hidden',
            hideOnOutsideClick: true,
          }"
        >
          <i class="pi pi-bars text-4xl"></i>
        </a>
      </div>

      <div
        id="navbar-sub-7"
        class="hidden lg:block absolute lg:static lg:w-auto w-full surface-overlay left-0 top-100 z-1 shadow-2 lg:shadow-none py-2 px-2"
      >
        <ul
          class="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row border-top-1 surface-border lg:border-top-none"
        >
          <li class="border-top-1 surface-border lg:border-top-none">
            <a
              v-ripple
              class="flex px-6 p-3 lg:px-3 align-items-center hover:surface-100 font-medium border-round cursor-pointer transition-colors transition-duration-150 p-ripple"
            >
              <div class="block mr-1">
                <div class="text-900 font-medium">ผู้ใช้งาน:{{ userName }}</div>
              </div>
              <img
                src="@/assets/img/avatar-f-1.png"
                class="mr-3 lg:mr-0"
                style="width: 28px; height: 28px"
              />
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div
      id="navbar-7"
      class="py-2 px-2 shadow-2 hidden lg:block absolute lg:static lg:w-auto w-full surface-overlay left-0 top-100 shadow-2"
      style="z-index: 6799"
    >
      <ul class="list-none p-0 m-0 flex flex-column lg:flex-row select-none">
        <li
          v-for="menu in menus"
          :key="menu.title"
          :class="menu.children.length > 0 ? 'lg:relative' : ''"
        >
          <RouterLink
            v-if="menu.children.length == 0"
            :to="menu.to"
            :class="storeApp.pageActive == menu.name ? '' : ''"
            @click="
              storeApp.setActivePage(menu.name);
              storeApp.setActiveChild('');
            "
            v-ripple
            class="flex align-items-center cursor-pointer p-3 text-700 border-round hover:text-900 hover:surface-100 transition-duration-150 transition-colors p-ripple"
            style="border-radius: 12px"
          >
            <i :class="menu.icon" class="mr-2"></i>
            <span class="font-medium">{{ menu.title }}</span>
          </RouterLink>

          <a
            v-if="menu.children.length > 0"
            v-ripple
            class="flex align-items-center cursor-pointer p-3 text-700 border-round hover:text-900 hover:surface-100 transition-duration-150 transition-colors p-ripple"
            style="border-radius: 12px"
            v-styleclass="{
              selector: '@next',
              enterClass: 'hidden',
              enterActiveClass: 'scalein',
              leaveToClass: 'hidden',
              leaveActiveClass: 'fadeout',
              hideOnOutsideClick: true,
            }"
          >
            <i :class="menu.icon" class="mr-2"></i>
            <span class="font-medium">{{ menu.title }}</span>
            <i class="pi pi-angle-down ml-auto lg:ml-3"></i>
          </a>
          <ul
            v-if="menu.children.length > 0"
            class="list-none py-0 pl-3 m-0 lg:px-0 lg:py-0 border-round shadow-0 lg:shadow-2 lg:border-1 border-50 lg:absolute surface-overlay hidden origin-top w-full lg:w-15rem cursor-pointer"
            style="z-index: 9999"
          >
            <li v-for="child in menu.children" :key="child.title">
              <RouterLink
                :to="child.to"
                @click="
                  storeApp.setActivePage(menu.name);
                  storeApp.setActiveChild(child.name);
                "
                :class="storeApp.childActive == child.name ? '' : ''"
                v-ripple
                class="flex p-3 align-items-center text-600 hover:text-900 hover:surface-100 transition-colors transition-duration-150 p-ripple"
                style="border-radius: 12px"
              >
                <i :class="child.icon" class="mr-2"></i>
                <span class="font-medium">{{ child.title }}</span>
              </RouterLink>
            </li>
          </ul>
        </li>
        <li
          class="border-top-1 my-3 xl:my-0 xl:border-top-none border-indigo-400 xl:ml-auto"
        >
          <RouterLink
            to="/logout"
            v-ripple
            class="flex align-items-center cursor-pointer p-3 text-700 border-round hover:text-900 hover:surface-100 transition-duration-150 transition-colors p-ripple"
            style="border-radius: 12px"
          >
            <span class="font-medium">ออกจากระบบงาน</span>
            <i class="pi pi-sign-out ml-2"></i>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
  <!-- <div
    class="flex justify-content-start align-items-center px-3 surface-section shadow-2 relative lg:static border-bottom-1 surface-border animation-duration-200 animation-ease-in-out"
    style="height: 6vh">
    <a class="cursor-pointer block text-700 p-ripple" @click="storeApp.setActivedToggle();">
      <i class="pi pi-bars"></i>
    </a>
    <span class="mb-1 ml-2"> {{ storeApp.PageTitle }}</span>
  </div> -->

  <Dialog
    header="เลือกร้านค้า"
    v-model:visible="displaySelectShop"
    ::breakpoints="{'960px': '75vw', '640px': '90vw'}"
    :style="{ width: '70vw' }"
    position="top"
    :modal="true"
    :draggable="false"
  >
    <div class="grid">
      <div class="col-12 md:col-4" v-for="shop in listShop" :key="shop">
        <div class="text-center border-1 surface-border border-round p-4">
          <img src="@/assets/dedepos.png" alt="Image" height="100" />
          <div class="text-900 text-2xl font-700 my-3 font-bold">
            {{ shop.name }}
          </div>
          <Button
            label="เลือก"
            :disabled="shop.disable"
            class="p-button p-button-success w-full"
            @click="selectShop(shop)"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>
