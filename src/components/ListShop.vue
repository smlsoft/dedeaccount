<script setup>
import { useToast } from "primevue/usetoast";
import AuthenService from "@/services/AuthenService";
import { ref, onMounted, computed } from "vue";

const toast = useToast();
const props = defineProps({
  listShop: Object,
});

const emit = defineEmits([
  "isFavorite",
  "selectShop",
  "goLogout",
  "createShopScuuess",
]);

const layout = ref("grid");

const favorite = ref(false);
const searchShop = ref("");

const createShopModal = ref(false);
const nameShop = ref("");
const telShop = ref("");
const nameShopInvalid = ref(false);
const telShopInvalid = ref(false);

const searchResults = computed(() => {
  return props.listShop.filter((shop) => {
    return shop.name.toLowerCase().includes(searchShop.value.toLowerCase());
  });
});

const searchFavorite = computed(() => {
  return searchResults.value.filter((shop) => shop.isfavorite);
});

function filterFavorite() {
  console.log(searchResults.value.filter((item) => item.isfavorite));
}

function isFavorite(slotProps, mode) {
  if (!favorite.value) {
    searchResults.value[slotProps.index].isfavorite = mode;
  } else {
    searchFavorite.value[slotProps.index].isfavorite = mode;
  }

  emit("isFavorite", slotProps.data, mode);
}

function selectShop(data) {
  emit("selectShop", data);
}

function goLogout() {
  emit("goLogout");
}

async function saveCreateShop() {
  const isPass = await verifyData();

  if (isPass) {
    let data = {
      name1: nameShop.value,
      telephone: telShop.value,
    };
    try {
      const res = await AuthenService.createShop(data);
      if (res.success) {
        nameShop.value = "";
        telShop.value = "";
        nameShopInvalid.value = false;
        telShopInvalid.value = false;
        createShopModal.value = false;
        emit("createShopScuuess", true);
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
}

function verifyData() {
  let checkValid = 0;
  if (nameShop.value == "") {
    nameShopInvalid.value = false;
    checkValid += 1;
  } else {
    nameShopInvalid.value = true;
  }

  // if (telShop.value == "") {
  //   telShopInvalid.value = false;
  //   checkValid += 1;
  // } else {
  //   telShopInvalid.value = true;
  // }

  if (checkValid == 0) {
    return true;
  } else {
    return false;
  }
}

function getNameByCode(names) {
  const nameObj = names.find((name) => name.code === "th");
  return nameObj ? nameObj.name : "Default Name";
}
</script>
<template>
  <DataView
    :value="!favorite ? searchResults : searchFavorite"
    :layout="layout"
    :paginator="false"
    :rows="100"
  >
    <template #header>
      <div class="surface-section px-4 py-2 md:px-6 lg:px-0">
        <div class="flex flex-column md:flex-row md:justify-content-between">
          <div class="mb-3 lg:mb-0">
            <div class="text-3xl font-medium text-900 mb-3">
              {{ $t("select_shop") }}
            </div>
            <div class="text-500 mr-0 md:mr-3">
              {{ $t("shop_count") }} ({{ props.listShop.length }})
              {{ $t("shop") }}
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
                <Button
                  class="p-button-sm mr-3 bg-primary-700"
                  label="สร้างกิจการ"
                  icon="pi pi-plus "
                  @click="createShopModal = true"
                />
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
                <ToggleButton
                  v-model="favorite"
                  onLabel=""
                  offLabel=""
                  onIcon="pi pi-star-fill text-yellow-500"
                  offIcon="pi pi-star text-yellow-500"
                  class="mr-3"
                  @click="filterFavorite()"
                />
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
            v-if="!slotProps.data.isfavorite"
            class="pi pi-star shop-category-icon text-1xl ml-0 text-yellow-500 cursor-pointer"
            @click="isFavorite(slotProps, true)"
          ></i>
          <i
            v-if="slotProps.data.isfavorite"
            class="pi pi-star-fill shop-category-icon text-1xl ml-0 text-yellow-500 cursor-pointer"
            @click="isFavorite(slotProps, false)"
          ></i>
          <img src="@/assets/dedepos.png" />
          <div class="shop-list-detail" style="width: 300px">
            <div
              class="shop-name white-space-nowrap overflow-hidden text-overflow-ellipsis"
            >
              {{ slotProps.data.name }}
            </div>
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
              v-if="!slotProps.data.isfavorite"
              class="pi pi-star shop-category-icon text-2xl ml-0 text-yellow-500 cursor-pointer"
              @click="isFavorite(slotProps, true)"
            ></i>
            <i
              v-if="slotProps.data.isfavorite"
              class="pi pi-star-fill shop-category-icon text-2xl ml-0 text-yellow-500 cursor-pointer"
              @click="isFavorite(slotProps, false)"
            ></i>
          </div>
          <div class="shop-grid-item-content">
            <img
              src="@/assets/dedepos.png"
              alt="Image"
              height="80"
              class="mb-3"
            />
            <div
              class="shop-name white-space-nowrap overflow-hidden text-overflow-ellipsis"
              style="height: 30px"
            >
              {{ getNameByCode(slotProps.data.names) }}
            </div>
          </div>
          <div class="shop-grid-item-bottom mt-2">
            <Button
              :disabled="slotProps.data.disable"
              label="เลือกข้อมูล"
              class="px-6 primary-500"
              @click="selectShop(slotProps.data)"
            >
              <label style="text-align: center; margin: auto"
                >{{ $t("select_shop") }}
              </label></Button
            >
          </div>
        </div>
      </div>
    </template>
  </DataView>
  <Dialog
    header="สร้างกิจการ"
    v-model:visible="createShopModal"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    :style="{ width: '50vw' }"
    :modal="true"
  >
    <div class="field">
      <label for="name">ชื่อกิจการ</label>
      <InputText
        id="name"
        type="text"
        class="w-full mb-3"
        v-model="nameShop"
        :class="!nameShopInvalid ? 'p-invalid' : ''"
      />
    </div>
    <div class="field">
      <label for="tel">เบอร์โทรศัพท์</label>
      <InputText
        v-model="telShop"
        id="tel"
        class="w-full mb-3"
        type="number"
        :class="!telShopInvalid ? 'p-invalid' : ''"
      />
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-times"
        @click="createShopModal = false"
        class="p-button-text"
      />
      <Button
        class="p-button-success"
        label="บันทึก"
        icon="pi pi-save"
        @click="saveCreateShop"
        autofocus
      />
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
.p-dataview-content {
  height: 75vh;
  overflow-y: scroll;
}
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

  .shop-grid-item-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .shop-grid-item-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
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
