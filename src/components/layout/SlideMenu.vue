<script setup>
import { ref, onMounted, computed } from "vue";
import { useApp } from "@/stores/app.js";
const storeApp = useApp();
const widthscreen = ref();
const props = defineProps({
  menus: Object,
  showSlideBarTab: Boolean,
});
const slideBar = ref(false);

onMounted(() => {
  widthscreen.value = screen.width;
});

function showSlideBar() {
  slideBar.value = true;
}
function hideSlideBar() {
  slideBar.value = false;
}
</script>

<template>
  <!-- <div
    id="app-sidebar-4"
    class="bg-primary-700 h-screen hidden lg:block flex-shrink-0 absolute lg:static left-0 top-0 z-1 border-right-0 border-gray-800 w-18rem lg:w-4rem select-none"
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
              class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:surpice-400 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
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
              class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:surpice-400 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
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
                v-badge.warning
                
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
                  class="flex align-items-center cursor-pointer p-3 hover:surpice-400 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
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


        <RouterLink
          to="/logout"
          v-ripple
          class="my-3 mx-2 flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:surpice-400 border-round text-300 hover:text-0 transition-duration-150 transition-colors p-ripple"
          style="border-radius: 12px"
        >
          <img
            src="@/assets/dedepos.png"
            class="mr-2 lg:mr-0"
            style="width: 32px; height: 32"
          />
          <span class="font-medium inline lg:hidden">Amy Elsner</span>
        </RouterLink>
       
      </div>
    </div>
  </div> -->
  <nav
    id="app-sidebar-4"
    :class="[
      !slideBar ? 'showSlideBar ' : '',
      widthscreen < 990 ? 'w-18rem' : '',
    ]"
    class="main-menu h-screen hidden lg:block flex-shrink-0 absolute lg:static left-0 top-0"
    style="overflow: scroll"
  >
    <ul>
      <li v-for="menu in props.menus" :key="menu.title">
        <RouterLink
          class="flex align-items-center cursor-pointer pt-3 pb-3"
          v-if="menu.children.length == 0"
          :to="menu.to"
          @click="
            storeApp.setActivePage(menu.name);
            storeApp.setActiveChild('');
          "
          v-ripple
        >
          <i :class="menu.icon" class="fa-2x pt-2"></i>
          <span class="nav-text">{{ menu.title }}</span>
        </RouterLink>

        <a
          v-if="menu.children.length > 0"
          v-ripple
          class="flex align-items-center cursor-pointer pt-3 pb-3"
          v-styleclass="{
            selector: '@next',
            enterClass: 'hidden',
            enterActiveClass: 'slidedown',
            leaveToClass: 'hidden',
            leaveActiveClass: 'slideup',
          }"
        >
          <i :class="menu.icon" class="fa-2x pt-2"></i>
          <span class="font-medium flex align-items-center">{{
            menu.title
          }}</span>
          <i class="pi pi-chevron-down ml-auto pt-2"></i>
        </a>
        <ul
          style="
            background: linear-gradient(1deg, #78b7d6 35.86%, #34afc7 97.37%);
          "
          class="pl-0 hidden overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out"
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
              class="flex align-items-center cursor-pointer pt-3 pb-3"
            >
              <i :class="child.icon" class="fa-2x pt-2"></i>
              <span class="font-medium">{{ child.title }}</span>
            </RouterLink>
          </li>
        </ul>
      </li>
      <li v-if="!slideBar">
        <a href="#" @click="showSlideBar">
          <i class="pi pi-bookmark pi-2x"></i>
          <span class="nav-text"> PIN </span>
        </a>
      </li>
      <li v-if="slideBar">
        <a href="#" @click="hideSlideBar">
          <i class="pi pi-bookmark pi-2x"></i>
          <span class="nav-text"> UNPIN </span>
        </a>
      </li>
    </ul>
  </nav>
</template>
<style scoped>
.pi-2x {
  font-size: 2em;
}
.pi {
  position: relative;
  display: table-cell;
  width: 60px;
  height: 36px;
  text-align: center;
  vertical-align: middle;
  font-size: 20px;
}

.main-menu:hover,
nav.main-menu.expanded {
  width: 250px;
  overflow: visible;
}

.showSlideBar {
  width: 60px;
  overflow: hidden;
}
.main-menu {
  background: linear-gradient(188.82deg, #025a86 35.86%, #98eeff 97.37%);
  border-right: 0px solid #e5e5e5;
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100%;
  left: 0;
  -webkit-transition: width 0.05s linear;
  transition: width 0.05s linear;
  -webkit-transform: translateZ(0) scale(1, 1);
  z-index: 1000;
}

.main-menu > ul {
  margin: 7px 0;
}

.main-menu li {
  position: relative;
  display: block;
  width: 250px;
}

.main-menu li > a {
  position: relative;
  display: table;
  border-collapse: collapse;
  border-spacing: 0;
  color: #fff;
  font-family: arial;
  font-size: 14px;
  text-decoration: none;
  -webkit-transform: translateZ(0) scale(1, 1);
  -webkit-transition: all 0.1s linear;
  transition: all 0.1s linear;
}

.main-menu .nav-icon {
  position: relative;
  display: table-cell;
  width: 60px;
  height: 36px;
  text-align: center;
  vertical-align: middle;
  font-size: 18px;
}

.main-menu .nav-text {
  position: relative;
  display: table-cell;
  vertical-align: middle;
  width: 190px;
  font-family: "Titillium Web", sans-serif;
}

.no-touch .scrollable.hover {
  overflow-y: hidden;
}

.no-touch .scrollable.hover:hover {
  overflow-y: auto;
  overflow: visible;
}

a:hover,
a:focus {
  text-decoration: none;
}

nav {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  overflow: scroll;
}

nav ul,
nav li {
  outline: 0;
  margin: 0;
  padding: 0;
}
.main-menu li:hover > a,
nav.main-menu li.active > a,
.dropdown-menu > li > a:hover,
.dropdown-menu > li > a:focus,
.dropdown-menu > .active > a,
.dropdown-menu > .active > a:hover,
.dropdown-menu > .active > a:focus,
.no-touch .dashboard-page nav.dashboard-menu ul li:hover a,
.dashboard-page nav.dashboard-menu ul li.active a {
  color: #fff;
  background: rgba(78, 139, 170, 0.5);
}
</style>
