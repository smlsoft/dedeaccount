<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useAuthen } from "@/stores/authen.js";
import { useToast } from "primevue/usetoast";
import AuthenService from "@/services/AuthenService";
import { useApp } from "@/stores/app.js";
import getListShop from "@/components/ListShop.vue";
import loginMenu from "@/components/page/login/LoginMenu.vue";
import loginUser from "@/components/page/login/LoginUser.vue";
import registerMenu from "@/components/page/login/RegisterMenu.vue";
import registerUser from "@/components/page/login/RegisterUser.vue";
import adsSlide from "@/components/page/login/AdsSlide.vue";

import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const toast = useToast();
const storeApp = useApp();
const store = useAuthen();
const listShop = ref([]);
const showShopList = ref(false);
const loading = ref(false);
const loadingSignUp = ref(false);
const loginFailed = ref(false);
const registerSuccess = ref(false);

const router = useRouter();
const isLoginMode = ref("loginMenu");

function selectShop(data) {
  localStorage.shopid = data.shopid;
  localStorage.shop_name = data.name;
  localStorage.shop_role = data.role;
  localStorage.setLockSlideBar = false;

  AuthenService.selectShop().then((res) => {
    if (res.success) {
      // this.showSnackBar("เข้าสู่ระบบสำเร็จ", "success");
      setTimeout(async () => {
        router.push({ name: "dashboard" });
      }, 1000);
    } else {
      // this.showSnackBar(
      //   " ไม่สามารถเชื่อมต่อได้ เนื่องจากฐานข้อมูลมีปัญหา",
      //   "error"
      // );
    }
  });
}

function goHome() {
  router.push({
    name: "register",
  });
}

function goLogout() {
  router.push({
    name: "logout",
  });
}

onMounted(() => {
  storeApp.setPageTitle("เข้าสู่ระบบ");
});

async function isFavorite(data, favorite) {
  data = {
    isfavorite: favorite,
    shopid: data.shopid,
  };
  try {
    const res = await AuthenService.putFavorite(data);
    //console.log(res);
    if (res.success) {
      console.log(res);
    }
  } catch (err) {
    console.log(err);
  }
}

function loginMode(mode) {
  registerSuccess.value = false;
  isLoginMode.value = mode;
}

async function handleLogin(username, password) {
  loading.value = true;
  //console.log(username, password);

  localStorage.removeItem("_token");
  await store.login(username, password);

  //console.log("Can Login ", store.loginSuccess);

  if (store.loginSuccess) {
    // select shop

    AuthenService.getListShop()
      .then((res) => {
        console.log(res);
        if (res.success) {
          showShopList.value = true;
          listShop.value = res.data;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    loginFailed.value = true;
  }
  loading.value = false;
}

async function signUp(name, username, password) {
  loadingSignUp.value = true;
  await AuthenService.register(name, username, password)
    .then((res) => {
      //console.log(res);
      if (res.data.success) {
        loadingSignUp.value = false;
        registerSuccess.value = true;
      }
    })
    .catch((err) => {
      console.log(err);
      loadingSignUp.value = false;
      registerSuccess.value = false;
      toast.add({
        severity: "error",
        summary: "Error",
        detail: err.response.data.message,
        life: 3000,
      });
    });
}

function createShopScuuess(status) {
  if (status) {
    AuthenService.getListShop()
      .then((res) => {
        console.log(res);
        if (res.success) {
          listShop.value = res.data;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

async function loginWithGoogle() {
  loading.value = true;
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // console.log("User signed in: ", user.displayName);
    if (user.accessToken != "") {
      localStorage.removeItem("_token");
      await store.loginGoogle(user.accessToken, user.displayName);
      if (store.loginSuccess) {
        // select shop
        AuthenService.getListShop()
          .then((res) => {
            console.log(res);
            if (res.success) {
              showShopList.value = true;
              listShop.value = res.data;
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        console.log(store.loginErrorMsg);
        loginFailed.value = true;
      }
    }
  } catch (error) {
    loading.value = false;

    console.log(error);
  }
}
</script>

<template>
  <Toast />
  <div
    class="surface-0 flex justify-content-center min-h-screen min-w-screen overflow-hidden"
  >
    <div
      class="px-4 md:px-6 lg:px-8 flex align-items-center"
      v-if="!showShopList"
      style="width: 1366px"
    >
      <div class="flex flex-wrap shadow-2" v-if="isLoginMode != 'register'">
        <div class="w-full lg:w-6 px-0 py-4 lg:p-7 bg-blue-50">
          <adsSlide />
        </div>
        <div class="w-full lg:w-6 p-4 lg:pl-7 lg:pr-7 surface-card">
          <loginMenu
            v-on:loginMode="loginMode"
            v-on:registerMode="loginMode"
            v-on:loginWithGoogle="loginWithGoogle"
            v-if="isLoginMode == 'loginMenu'"
          />
          <loginUser
            v-on:loginMode="loginMode"
            v-on:loginButton="handleLogin"
            v-on:registerMode="loginMode"
            :loading="loading"
            :loginFailed="loginFailed"
            v-if="isLoginMode == 'login'"
          />
          <registerMenu
            v-on:loginMode="loginMode"
            v-on:registerMode="loginMode"
            v-on:loginWithGoogle="loginWithGoogle"
            v-if="isLoginMode == 'registerMenu'"
          />
        </div>
      </div>

      <div class="flex flex-wrap shadow-2" v-if="isLoginMode == 'register'">
        <div class="w-full lg:w-6 p-4 lg:pl-7 lg:pr-7 surface-card">
          <registerUser
            v-on:loginMode="loginMode"
            v-on:signUpButton="signUp"
            :loadingSignUp="loadingSignUp"
            :registerSuccess="registerSuccess"
          />
        </div>
        <div class="w-full lg:w-6 px-0 py-4 lg:p-7 bg-blue-50">
          <adsSlide />
        </div>
      </div>
    </div>

    <div class="surface-0 px-4 py-5 md:px-6 lg:px-8 w-full" v-if="showShopList">
      <getListShop
        :listShop="listShop"
        v-on:isFavorite="isFavorite"
        v-on:selectShop="selectShop"
        v-on:goLogout="goLogout"
        v-on:createShopScuuess="createShopScuuess"
      />
    </div>
  </div>
</template>
<style scoped></style>
