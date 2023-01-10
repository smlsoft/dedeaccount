<script setup>
import { ref, onMounted, computed } from "vue";
import { useApp } from "@/stores/app.js";
const storeApp = useApp();
const widthscreen = ref();
const emit = defineEmits(["lockSlideBar"]);

const props = defineProps({
  menus: Object,
  lockSlideBar: Boolean,
});
const slideBar = ref(false);

onMounted(() => {
  widthscreen.value = screen.width;
});

function showSlideBar() {
  slideBar.value = true;
  emit("lockSlideBar", true);
}
function hideSlideBar() {
  slideBar.value = false;
  emit("lockSlideBar", false);
}
</script>

<template>
  <nav
    id="app-sidebar-4"
    :class="[
      !props.lockSlideBar ? 'showSlideBar ' : ' lockSlideBar',
      widthscreen < 992 ? 'w-18rem' : '',
    ]"
    class="main-menu h-screen hidden lg:block flex-shrink-0 absolute left-0 top-0"
    style="overflow-x: hidden"
  >
    <header>
      <div class="image-text">
        <span class="image">
          <img
            :src="'./images/newlogo.svg'"
            :class="
              !props.lockSlideBar ? 'show-headerimage' : 'pin-headerimage'
            "
          />
        </span>
        <div class="text logo-text">
          <span class="name">DEDE</span>
          <span class="profession">Account</span>
        </div>
      </div>
    </header>
    <li v-if="!props.lockSlideBar">
      <a
        href="#"
        @click="showSlideBar"
        class="flex align-items-center cursor-pointer pt-3 pb-3"
      >
        <i class="pi pi-lock pi-2x pt-2"></i>
        <span class="nav-text"> LOCK MENU</span>
      </a>
    </li>
    <li v-if="props.lockSlideBar">
      <a
        href="#"
        @click="hideSlideBar"
        class="flex align-items-center cursor-pointer pt-3 pb-3"
      >
        <i class="pi pi-lock-open pi-2x pt-2"></i>
        <span class="nav-text"> UNLCOK MENU</span>
      </a>
    </li>
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
          style="background: rgba(78, 139, 170, 0.5)"
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
    </ul>
  </nav>
</template>
<style scoped>
@media screen and (min-width: 992px) {
  .lockSlideBar {
    position: static !important;
  }
}
header .image-text {
  color: #fff;
  display: flex;
  align-items: center;
}
header .logo-text {
  display: flex;
  flex-direction: column;
}
header .image-text .name {
  margin-top: 2px;
  font-size: 22px;
  font-weight: 600;
}

header .image-text .profession {
  font-size: 18px;
  margin-top: -2px;
  display: block;
}

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

.main-menu:hover {
  width: 120px;
}

.show-headerimage {
  margin-top: 20px;
  width: 60px;
  transition: width 1s;
}

.pin-headerimage {
  margin-top: 20px;
  width: 120px;
  transition: width 1s;
}

.main-menu:hover .show-headerimage {
  width: 120px;
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
