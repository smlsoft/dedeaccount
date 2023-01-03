<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useAuthen } from "@/stores/authen.js";
import AuthenService from "@/services/AuthenService";
import { useApp } from "@/stores/app.js";

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

const layout = ref("grid");
const iconStartSelect = ref(false);

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

function selectShop(item) {
  localStorage.shopid = item.shopid;
  localStorage.shop_name = item.name;
  localStorage.shop_role = item.role;
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

const searchShop = ref("");
const searchResults = computed(() => {
  return listShop.value.filter((shop) => {
    return shop.name.toLowerCase().includes(searchShop.value.toLowerCase());
  });
});

onMounted(() => {
  storeApp.setPageTitle("เข้าสู่ระบบ");
});

function startSelected() {
  if (!iconStartSelect.value) {
    iconStartSelect.value = true;
  } else {
    iconStartSelect.value = false;
  }
}

const changeLanguage = (language) => {
  localStorage.setItem("language", language);
  // location.reload();
};
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
                  :src="
                    imgWithbaseUrl(
                      '@/images/illustration/' + slotProps.data.image
                    )
                  "
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
        <!-- <div class="w-full lg:w-6 px-0 py-4 lg:p-7 bg-blue-50">
        <div class="text-center mb-8">
          <img src="@/assets/security.svg" alt="Image" class="mb-6 w-6 mt-6" />
          <div class="mx-auto font-medium text-xl mb-4 text-blue-900">
            Data Security
          </div>
          <p class="m-2 text-blue-700 line-height-3">
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>
      </div> -->
        <div class="w-full lg:w-6 p-4 lg:p-7 surface-card">
          <div class="flex align-items-center justify-content-between mb-7">
            <!-- <p>{{ $t("hello") }}</p>
            <p>{{ $t("welcome") }}</p> -->
            <!-- <a
              @click="changeLanguage('en')"
              tabindex="0"
              class="font-medium text-blue-500 hover:text-blue-700 cursor-pointer transition-colors transition-duration-150"
              >en</a
            >
            <a
              @click="changeLanguage('th')"
              tabindex="0"
              class="font-medium text-blue-500 hover:text-blue-700 cursor-pointer transition-colors transition-duration-150"
              >th</a
            > -->
            <span class="text-2xl font-medium text-900">Login to Account</span>
            <a
              tabindex="0"
              class="font-medium text-blue-500 hover:text-blue-700 cursor-pointer transition-colors transition-duration-150"
              >Sign up</a
            >
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
            label="Sign In"
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
      <DataView
        :value="searchResults"
        :layout="layout"
        :paginator="false"
        :rows="100"
      >
        <template #header>
          <div class="surface-section px-4 py-2 md:px-6 lg:px-0">
            <div
              class="flex flex-column md:flex-row md:justify-content-between"
            >
              <div class="mb-3 lg:mb-0">
                <div class="text-3xl font-medium text-900 mb-3">
                  เลือกกิจการที่ต้องการทำรายการ
                </div>
                <div class="text-500 mr-0 md:mr-3">
                  จำนวนกิจการทั้งหมด ({{ listShop.length }}) กิจการ
                </div>
              </div>
              <div class="mb-3 lg:mb-0">
                <div class="flex justify-content-end mb-2">
                  <Button
                    class="p-button-text"
                    label="Logout"
                    icon="pi pi-sign-out"
                    iconPos="right"
                    @click="goLogout()"
                  />
                </div>
                <div class="flex justify-content-end mb-0">
                  <div class="flex align-items-center mt-3 md:mt-0">
                    <span class="p-input-icon-left">
                      <i class="pi pi-search"></i>
                      <InputText
                        type="text"
                        v-model="searchShop"
                        placeholder="Search"
                        class="mr-3 p-inputtext"
                        style="padding: 0.6rem 3rem"
                      />
                    </span>
                    <DataViewLayoutOptions v-model="layout" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #list="slotProps">
          <div class="col-12">
            <div class="shop-list-item">
              <i
                v-if="!iconStartSelect"
                class="pi pi-bookmark shop-category-icon text-1xl ml-0 text-primary cursor-pointer"
                @click="startSelected()"
              ></i>
              <i
                v-if="iconStartSelect"
                class="pi pi-bookmark-fill shop-category-icon text-1xl ml-0 text-primary cursor-pointer"
                @click="startSelected()"
              ></i>
              <img src="@/assets/dedepos.png" />
              <div class="shop-list-detail">
                <div class="shop-name">{{ slotProps.data.name }}</div>
              </div>
              <div class="shop-list-action">
                <Button
                  @click="selectShop(slotProps.data)"
                  icon="pi pi-chevron-right"
                  class="p-button-rounded p-button-text"
                />
              </div>
            </div>
          </div>
        </template>

        <template #grid="slotProps">
          <div class="col-12 md:col-3 sm:col-6">
            <div class="shop-grid-item card">
              <div class="shop-grid-item-top">
                <i
                  v-if="!iconStartSelect"
                  class="pi pi-bookmark shop-category-icon text-2xl ml-0 text-primary cursor-pointer"
                  @click="startSelected()"
                ></i>
                <i
                  v-if="iconStartSelect"
                  class="pi pi-bookmark-fill shop-category-icon text-2xl ml-0 text-primary cursor-pointer"
                  @click="startSelected()"
                ></i>
              </div>
              <div class="shop-grid-item-content">
                <img
                  src="@/assets/dedepos.png"
                  alt="Image"
                  height="80"
                  class="mb-3"
                />
                <div class="shop-name">{{ slotProps.data.name }}</div>
              </div>
              <div class="shop-grid-item-bottom mt-2">
                <Button
                  label="เลือกข้อมูล"
                  class="w-full p-button-sm"
                  @click="selectShop(slotProps.data)"
                ></Button>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </div>

    <!-- <div
    class="surface-0 flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden"
  >
    <div class="grid justify-content-center p-2 lg:p-0" style="min-width: 80%">
      <div
        class="col-12"
        :style="
          !showShopList
            ? 'border-radius:56px; padding:0.3rem; background: linear-gradient(180deg, var(--primary-color), rgba(33, 150, 243, 0) 40%);'
            : 'border-radius:56px; padding:0.3rem; background: linear-gradient(180deg, var(--primary-color), rgba(33, 150, 243, 0) 40%);'
        "
      >
        <div
          class="h-full w-full m-0 py-7 px-4"
          style="
            border-radius: 53px;
            background: linear-gradient(
              180deg,
              var(--surface-50) 38.9%,
              var(--surface-0)
            );
          "
        >
          <div v-if="!showShopList">
            <div class="text-center mb-5">
              <img
                src="@/assets/dedepos.png"
                alt="Image"
                height="150"
                class="mb-3"
              />
              <div class="text-900 text-3xl font-medium mb-3">
                Welcome, DEDEPOS!
              </div>
              <span class="text-600 font-medium">Don't have an account? </span>
              <a
                class="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer"
                @click="goHome"
                >Create now!</a
              >
            </div>
            <div class="w-full md:w-10 mx-auto">
              <label
                for="email1"
                class="block text-900 text-xl font-medium mb-2"
                >Email</label
              >
              <InputText
                id="email1"
                type="text"
                class="w-full mb-3"
                placeholder="Email"
                style="padding: 1rem"
                v-model="username"
              />
              <label
                for="password1"
                class="block text-900 font-medium text-xl mb-2"
                >Password</label
              >
              <InputText
                id="password1"
                type="password"
                class="w-full mb-3"
                placeholder="Password"
                style="padding: 1rem"
                v-model="password"
              />
              <div class="flex align-items-center justify-content-between mb-5">
                <div class="flex align-items-center">
                  <Checkbox
                    id="rememberme1"
                    v-model="checked"
                    :binary="true"
                    class="mr-2"
                  ></Checkbox>
                  <label for="rememberme1">Remember me</label>
                </div>
                <a
                  class="font-medium no-underline ml-2 text-right cursor-pointer"
                  style="color: var(--primary-color)"
                  >Forgot password?</a
                >
              </div>

              <div style="height: 20px">
                <span v-if="loginFailed" style="color: #ff0000" class="text-xs"
                  >*Invalid Username or Password.</span
                >
              </div>
              <Button
                label="Sign In"
                icon="pi pi-user"
                class="w-full p-3 text-xl"
                v-if="loading == false"
                @click="handleLogin()"
              ></Button>
              <Button
                icon="pi pi-spin pi-spinner"
                v-if="loading == true"
                class="w-full p-3 text-xl"
              ></Button>
            </div>
          </div>
          <div v-if="showShopList">
            <div class="shadow-2 surface-card border-round p-3">
              <div class="flex align-items-center justify-content-between">
                <span class="text-xl font-medium text-900">เลือกร้านค้า</span>
                <Button
                  icon="pi pi-sign-out"
                  class="p-button-rounded p-button-danger"
                  @click="goLogout"
                />
              </div>
              <div class="mt-3">
                <div class="grid">
                  <div
                    class="col-12 md:col-3"
                    v-for="shop in listShop"
                    :key="shop"
                  >
                    <div
                      class="text-center border-1 surface-border border-round p-4"
                    >
                      <img
                        src="@/assets/dedepos.png"
                        alt="Image"
                        height="100"
                      />
                      <div class="text-900 text-2xl font-700 my-3 font-bold">
                        {{ shop.name }}
                      </div>
                      <Button
                        label="เลือก"
                        class="p-button p-button-success w-full"
                        @click="selectShop(shop)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div> -->
  </div>
</template>
<style lang="scss" scoped>
.p-divider-solid.p-divider-horizontal:before {
  border-top-style: solid;
}

.card {
  background: #ffffff;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.shop-name {
  font-size: 1.2rem;
  font-weight: 700;
}

.shop-category-icon {
  vertical-align: middle;
  margin-right: 0.5rem;
}

::v-deep(.shop-list-item) {
  display: flex;
  align-items: center;
  padding: 1rem;
  width: 100%;

  img {
    width: 50px;
    margin-right: 2rem;
  }

  .shop-list-detail {
    flex: 1 1 0;
  }

  .shop-list-action {
    display: flex;
    flex-direction: column;
  }

  .p-button {
    margin-bottom: 0.5rem;
  }
}

::v-deep(.shop-grid-item) {
  margin: 0.5rem;
  border: 1px solid var(--surface-border);

  .shop-grid-item-top,
  .shop-grid-item-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  img {
    margin: 1rem 0;
  }

  .shop-grid-item-content {
    text-align: center;
  }
}

@media screen and (max-width: 576px) {
  .shop-list-item {
    flex-direction: column;
    align-items: center;

    img {
      margin: 2rem 0;
    }

    .shop-list-detail {
      text-align: center;
    }

    .shop-price {
      align-self: center;
    }

    .shop-list-action {
      display: flex;
      flex-direction: column;
    }

    .shop-list-action {
      margin-top: 2rem;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
  }
}
</style>
