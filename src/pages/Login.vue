<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useAuthen } from "@/stores/authen.js";
import AuthenService from "@/services/AuthenService";
import { useApp } from "@/stores/app.js";
import { useToast } from "primevue/usetoast";

import getListShop from "@/components/ListShop.vue";

const toast = useToast();
const storeApp = useApp();
const store = useAuthen();
const username = ref("");
const password = ref("");
const listShop = ref([]);
const checked = ref(false);
const showShopList = ref(false);
const loading = ref(false);
const router = useRouter();
const loginFailed = ref(false);
const features = ref([
  {
    title: "Unlimited Inbox",
    image: "live-collaboration.svg",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Data Security",
    image: "security.svg",
    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: "Cloud Backup Williams",
    image: "subscribe.svg",
    text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
]);
const selectLanguage = ref();
const languages = ref([
  { code: "th", codeTranslator: "th", name: "ไทย", image: "th.png", use: true },
  {
    code: "en",
    codeTranslator: "en",
    name: "อังกฤษ",
    image: "en.png",
    use: true,
  },
  {
    code: "cn",
    codeTranslator: "zh-cn",
    name: "จีน",
    image: "ch.png",
    use: true,
  },
  {
    code: "jp",
    codeTranslator: "th",
    name: "ญี่ปุ่น",
    image: "jp.png",
    use: true,
  },
  {
    code: "kr",
    codeTranslator: "th",
    name: "เกาหลี",
    image: "kr.png",
    use: true,
  },
  { code: "lo", codeTranslator: "lo", name: "ลาว", image: "lo.png", use: true },
  {
    code: "mr",
    codeTranslator: "th",
    name: "เมียนม่า",
    image: "th.png",
    use: false,
  },
  {
    code: "my",
    codeTranslator: "th",
    name: "มาเลเซีย",
    image: "th.png",
    use: false,
  },
  {
    code: "vi",
    codeTranslator: "th",
    name: "เวียดนาม",
    image: "th.png",
    use: false,
  },
  {
    code: "km",
    codeTranslator: "th",
    name: "เขมร",
    image: "th.png",
    use: false,
  },
]);

const imgWithbaseUrl = (uri) => {
  let baseUrl =
    process.env.NODE_ENV == "development"
      ? import.meta.url
      : process.env.VUE_APP_URL;
  //console.log("Mode :", process.env.NODE_ENV, baseUrl);

  if (process.env.NODE_ENV != "development") {
    uri = uri.replace("@/", import.meta.env.BASE_URL);
  } else {
    uri = uri.replace("@/", import.meta.env.BASE_URL);
  }

  return new URL(uri, baseUrl).href;
};

async function handleLogin() {
  loading.value = true;
  //console.log(username, password);

  localStorage.removeItem("_token");
  await store.login(username.value, password.value);

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

function selectShop(data) {
  localStorage.shopid = data.shopid;
  localStorage.shop_name = data.name;
  localStorage.shop_role = data.role;
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
  chooseLanguage(storeApp.activeLang);
});

const chooseLanguage = (data) => {
  console.log(data);

  let ele = [];
  ele = languages.value.filter((val) => val.code == data);
  selectLanguage.value = ele[0].image;
  storeApp.activeLang = data;
  // location.reload();
};

async function isFavorite(data, favorite) {
  data = {
    isfavorite: favorite,
    shopid: data.shopid,
  };
  try {
    const res = await AuthenService.putFavorite(data);
    console.log(res);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
    }
  } catch (err) {
    console.log(err);
    toast.add({
      severity: "error",
      summary: "error",
      detail: "บันทึกไม่สำเร็จ " + err,
      life: 3000,
    });
  }
}
</script>

<template>
  <div
    class="surface-0 flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden"
  >
    <div class="px-4 py-7 md:px-6 lg:px-8" v-if="!showShopList">
      <div class="flex flex-wrap shadow-2">
        <div class="w-full lg:w-6 px-0 py-4 lg:p-7 bg-blue-50">
          <Carousel :value="features">
            <template #item="slotProps">
              <div class="text-center mb-8">
                <img
                  :src="'./images/illustration/' + slotProps.data.image"
                  alt="Image"
                  class="mb-6 w-6"
                />
                <div class="mx-auto font-medium text-xl mb-4 text-blue-900">
                  {{ slotProps.data.title }}
                </div>
                <p class="m-0 text-blue-700 line-height-3">
                  {{ slotProps.data.text }}
                </p>
              </div>
            </template>
          </Carousel>
        </div>

        <div class="w-full lg:w-6 p-4 lg:p-7 surface-card">
          <div class="flex align-items-center justify-content-between mb-5">
            <!-- <p>{{ $t("hello") }}</p>
            <p>{{ $t("welcome") }}</p> -->

            <span class="text-2xl font-medium text-900">Login to Account</span>
            <li class="inline-flex relative">
              <a
                v-ripple
                class="text-900 font-medium inline-flex align-items-end cursor-pointer text-700 hover:text-primary p-ripple"
                v-styleclass="{
                  selector: '@next',
                  enterClass: 'hidden',
                  enterActiveClass: 'scalein',
                  leaveToClass: 'hidden',
                  leaveActiveClass: 'fadeout',
                  hideOnOutsideClick: true,
                }"
              >
                <Avatar
                  :image="'/images/flags/' + selectLanguage"
                  shape="circle"
                />
              </a>
              <div
                class="hidden border-round surface-overlay p-3 shadow-2 absolute right-0 top-100 z-2 w-15rem origin-top"
              >
                <ul class="list-none p-0 m-0">
                  <li v-for="language in languages" :key="language.code">
                    <div v-if="language.use == true">
                      <a
                        class="cursor-pointer hover:text-900 hover:surface-100 border-round flex align-items-center px-3 py-2"
                        @click="chooseLanguage(language.code)"
                      >
                        <img
                          :src="'/images/flags/' + language.image"
                          class="mr-2"
                          alt="Flag"
                          style="width: 30px"
                        />
                        <span>{{ language.name }}</span>
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </li>
          </div>
          <div class="flex justify-content-between">
            <Button
              class="ml-2 w-12 font-medium border-1 surface-border surface-100 py-3 px-2 p-component hover:surface-200 active:surface-300 text-900 cursor-pointer transition-colors transition-duration-150 inline-flex align-items-center justify-content-center"
            >
              <i class="pi pi-google text-red-500 mr-2"></i>
              <span>Sign in With Google</span>
            </Button>
          </div>
          <Divider align="center" class="my-4">
            <span class="text-600 font-normal text-sm">OR</span>
          </Divider>

          <label for="user" class="block text-900 font-medium mb-2"
            >Email</label
          >
          <InputText
            id="user"
            type="text"
            class="w-full mb-3 p-3"
            placeholder="Email"
            style="padding: 1rem"
            v-model="username"
          />
          <label for="password" class="block text-900 font-medium mb-2"
            >Password</label
          >
          <InputText
            id="password"
            type="password"
            class="w-full mb-3 p-3"
            placeholder="Password"
            style="padding: 1rem"
            v-model="password"
          />
          <div class="flex align-items-center justify-content-between mb-4">
            <div class="flex align-items-center">
              <Checkbox id="rememberme4" :binary="true" class="mr-2"></Checkbox>
              <label for="rememberme4">Remember me</label>
            </div>
            <a
              class="font-medium text-blue-500 hover:text-blue-700 cursor-pointer transition-colors transition-duration-150"
              >Forgot password?</a
            >
          </div>

          <span v-if="loginFailed" style="color: #ff0000" class="text-xs"
            >*Invalid Username or Password.</span
          >
          <Button
            label="Login"
            class="w-full py-3 font-medium"
            v-if="loading == false"
            @click="handleLogin()"
          ></Button>
          <Button
            icon="pi pi-spin pi-spinner"
            v-if="loading == true"
            class="w-full py-3 font-medium"
          ></Button>
        </div>
      </div>
    </div>

    <div class="surface-0 px-4 py-5 md:px-6 lg:px-8 w-full" v-if="showShopList">
      <getListShop
        :listShop="listShop"
        v-on:isFavorite="isFavorite"
        v-on:selectShop="selectShop"
        v-on:goLogout="goLogout"
      />
    </div>
  </div>
</template>
<style scoped>
.p-divider-solid.p-divider-horizontal:before {
  border-top-style: solid;
}
</style>
