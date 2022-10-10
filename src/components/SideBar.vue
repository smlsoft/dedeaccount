<script setup>
import { defineComponent } from "@vue/runtime-core";
import { RouterLink } from "vue-router";
import { menus } from "@/api/menu";
import { useApp } from "@/stores/app.js";
import { ref, onMounted } from "vue";
const shopname = ref("");
const storeApp = useApp();

onMounted(() => {
  //console.log(window.innerWidth);
  //console.log(localStorage.shop_name);
  shopname.value = localStorage.shop_name;

 // console.log(shopname);
  if (window.innerWidth <= 1200) {
    storeApp.showToggle = false;
  }
});
</script>
<template>
  <div
    class="bg-gray-900 h-screen lg:block flex-shrink-0 static left-0 top-0 z-1 border-gray-800 select-none"
  >
    <div
      id="app-sidebar-11"
      :class="storeApp.showToggle == false ? 'hidden' : ''"
      class="surface-overlay h-screen flex-shrink-0 animation-duration-200 animation-ease-in-out static left-0 top-0 z-1 border-right-1 surface-border select-none"
      style="width: 280px; z-index: 1"
    >
      <div class="flex flex-column h-full bg-bluegray-900">
        <div
          class="flex align-items-center px-5 bg-indigo-500 flex-shrink-0"
          style="height: 6vh"
        >
          <img
            src="@/assets/dedepos.png"
            alt="Image"
            height="30"
            class="mr-3"
          />
          <span class="text-white"> {{ shopname }}</span>
        </div>
        <div class="overflow-y-auto">
          <ul class="list-none p-3 m-0">
            <!-- <li v-for="menu in menus" :key="menu.title">
              <RouterLink
                :to="menu.to"
                class="flex align-items-center cursor-pointer p-3 hover:bg-bluegray-900 border-round text-bluegray-100 hover:text-bluegray-50 transition-duration-150 transition-colors p-ripple"
              >
                <i :class="menu.icon" class="mr-2"></i>
                <span class="font-medium">{{ menu.title }}</span>
              </RouterLink>
            </li> -->

            <!-- <li>
              <RouterLink
                :to="menu.to"
                v-ripple
                class="flex align-items-center cursor-pointer p-3 text-700 border-round hover:bg-gray-800 text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                style="border-radius: 12px"
              >
                <i :class="menu.icon" class="mr-2 text-white"></i>
                <span class="font-medium">{{ menu.title }}</span>
              </RouterLink>
            </li> -->
            <li v-for="menu in menus" :key="menu.title">
              <RouterLink
                v-if="menu.children.length == 0"
                :to="menu.to"
                :class="storeApp.pageActive == menu.name ? 'bg-gray-800' : ''"
                @click="
                  storeApp.setActivePage(menu.name);
                  storeApp.setActiveChild('');
                "
                v-ripple
                class="flex align-items-center cursor-pointer p-3 text-700 border-round hover:bg-gray-800 text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                style="border-radius: 12px"
              >
                <i :class="menu.icon" class="mr-2 text-white"></i>
                <span class="font-medium">{{ menu.title }}</span>
              </RouterLink>
              <a
                v-if="menu.children.length > 0"
                v-ripple
                class="flex align-items-center cursor-pointer p-3 text-700 border-round hover:bg-gray-800 text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                style="border-radius: 12px"
                v-styleclass="{
                  selector: '@next',
                  enterClass: 'hidden',
                  enterActiveClass: 'slidedown',
                  leaveToClass: 'hidden',
                  leaveActiveClass: 'slideup',
                }"
              >
                <i :class="menu.icon" class="mr-2 text-white"></i>
                <span class="font-medium">{{ menu.title }}</span>
                <i class="pi pi-chevron-down ml-auto"></i>
              </a>
              <ul
                v-if="menu.children.length > 0"
                :class="storeApp.pageActive != menu.name ? 'hidden' : ''"
                class="list-none py-0 pl-3 pr-0 m-0 overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out"
              >
                <li v-for="child in menu.children" :key="child.title">
                  <RouterLink
                    :to="child.to"
                    @click="
                      storeApp.setActivePage(menu.name);
                      storeApp.setActiveChild(child.name);
                    "
                    :class="
                      storeApp.childActive == child.name ? 'bg-gray-800' : ''
                    "
                    v-ripple
                    class="flex align-items-center cursor-pointer p-3 text-700 border-round hover:bg-gray-800 text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                    style="border-radius: 12px"
                  >
                    <i :class="child.icon" class="mr-2 text-white"></i>
                    <span class="font-medium">{{ child.title }}</span>
                  </RouterLink>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="mt-auto">
          <hr class="mb-3 mx-3 border-top-1 border-none surface-border" />
          <RouterLink
            to="/logout"
            v-ripple
            class="flex align-items-center cursor-pointer m-4 text-900 border-2 border-transparent transition-duration-150 transition-colors p-ripple"
            style="border-radius: 12px"
          >
            <i class="pi pi-lock mr-2 text-white"></i>
            <span class="font-medium text-white">Logout</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "../assets/styles/app/layout.scss";
</style>
