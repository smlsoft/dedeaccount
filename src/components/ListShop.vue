<script setup>
import { ref, onMounted, computed } from "vue";

const props = defineProps({
  listShop: Object,
});

const emit = defineEmits(["isFavorite", "selectShop", "goLogout"]);

const layout = ref("grid");

const favorite = ref(false);
const searchShop = ref("");

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
              เลือกกิจการที่ต้องการทำรายการ
            </div>
            <div class="text-500 mr-0 md:mr-3">
              จำนวนกิจการทั้งหมด ({{ props.listShop.length }}) กิจการ
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
              {{ slotProps.data.name }}
            </div>
          </div>
          <div class="shop-grid-item-bottom mt-2">
            <Button
              :disabled="slotProps.data.disable"
              label="เลือกข้อมูล"
              class="w-full p-button-sm"
              @click="selectShop(slotProps.data)"
            ></Button>
          </div>
        </div>
      </div>
    </template>
  </DataView>
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
