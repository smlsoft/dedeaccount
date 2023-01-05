<script setup>
import { useApp } from "@/stores/app.js";
const storeApp = useApp();
const props = defineProps({
  menus: Object,
});
</script>

<template>
  <div
    id="app-sidebar-4"
    class="bg-blue-900 h-screen hidden lg:block flex-shrink-0 absolute lg:static left-0 top-0 z-1 border-right-0 border-gray-800 w-18rem lg:w-4rem select-none"
  >
    <div class="flex flex-column h-full">
      <div class="mt-0 select-none">
        <ul class="list-none p-3 lg:py-1 lg:px-2 m-0">
          <li
            class="pt-4"
            v-for="menu in props.menus"
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
              class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:surface-400 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
            >
              <i
                :class="menu.icon"
                class="mr-2 lg:mr-0 text-base lg:text-xl"
              ></i>
              <span class="font-medium inline lg:hidden">{{ menu.title }}</span>
            </RouterLink>

            <a
              v-if="menu.children.length > 0"
              v-ripple
              class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:surface-400 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
              v-styleclass="{
                selector: '@next',
                enterClass: 'hidden',
                leaveToClass: 'hidden',
                hideOnOutsideClick: true,
              }"
            >
              <i
                :class="menu.icon"
                class="mr-2 lg:mr-0 text-base lg:text-xl"
                v-badge
              ></i>
              <span class="font-medium inline lg:hidden">{{ menu.title }}</span>
              <i class="pi pi-chevron-down ml-auto lg:hidden"></i>
            </a>

            <ul
              v-if="menu.children.length > 0"
              style="top: 25px !important"
              class="list-none pl-3 pr-0 py-0 lg:p-3 m-0 hidden overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out static lg:absolute left-100 z-1 bg-gray-900 border-round-right shadow-none lg:shadow-2 w-full lg:w-15rem"
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
                  class="flex align-items-center cursor-pointer p-3 hover:surface-400 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                >
                  <i :class="child.icon" class="mr-2"></i>
                  <span class="font-medium">{{ child.title }}</span>
                </RouterLink>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="mt-auto">
        <hr class="mb-3 mx-2 border-top-1 border-none border-gray-800" />
        <!-- <li class="lg:relative">
            <a
              v-ripple
              class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:surface-400 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
              v-styleclass="{
                selector: '@next',
                enterClass: 'hidden',
                leaveToClass: 'hidden',
                hideOnOutsideClick: true,
              }"
            >
              <i
                class="pi pi-chart-line mr-2 lg:mr-0 text-base lg:text-xl"
                v-badge
              ></i>
              <span class="font-medium inline lg:hidden">Reports</span>
              <i class="pi pi-chevron-down ml-auto lg:hidden"></i>
            </a>
            <ul
              class="list-none pl-3 pr-0 py-0 lg:p-3 m-0 hidden overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out static lg:absolute left-100 top-0 z-1 bg-gray-900 border-round-right shadow-none lg:shadow-2 w-full lg:w-15rem"
            >
              <li>
                <a
                  v-ripple
                  class="flex align-items-center cursor-pointer p-3 hover:surface-400 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                >
                  <i class="pi pi-chart-line mr-2"></i>
                  <span class="font-medium">Expenses</span>
                </a>
              </li>
            </ul>
          </li> -->

        <RouterLink
          to="/logout"
          v-ripple
          class="my-3 mx-2 flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:surface-400 border-round text-300 hover:text-0 transition-duration-150 transition-colors p-ripple"
          style="border-radius: 12px"
        >
          <img
            src="@/assets/dedepos.png"
            class="mr-2 lg:mr-0"
            style="width: 32px; height: 32"
          />
          <span class="font-medium inline lg:hidden">Amy Elsner</span>
        </RouterLink>
        <!-- <a
            @click="select = true"
            v-ripple
            class="my-3 mx-2 flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:surface-400 border-round text-300 hover:text-0 transition-duration-150 transition-colors p-ripple"
          >
            <img
              src="@/assets/dedepos.png"
              class="mr-2 lg:mr-0"
              style="width: 32px; height: 32"
            />
            <span class="font-medium inline lg:hidden">Amy Elsner</span>
          </a> -->
      </div>
    </div>
  </div>
</template>
