<script setup>
import BlankLayout from "@/components/layout/BlankLayout.vue";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useAuthen } from "@/stores/authen.js";
import AuthenService from "@/services/AuthenService";
import { useApp } from "@/stores/app.js";

const storeApp = useApp();
const store = useAuthen();
const username = ref("");
const password = ref("");
const listShop = ref(undefined);
const checked = ref(false);
const showShopList = ref(false);
const loading = ref(false);
const router = useRouter();
const loginFailed = ref(false);

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
        //console.log(res);
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

onMounted(() => {
  storeApp.setPageTitle("เข้าสู่ระบบ");
});
</script>

<template>
  <div
    class="surface-0 flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden"
  >
    <div class="grid justify-content-center p-2 lg:p-0" style="min-width: 80%">
      <div
        class="col-12 xl:col-6"
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
                    class="col-12 md:col-6"
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
  </div>
</template>
