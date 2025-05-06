<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import DialogForm from "@/components/DialogForm.vue";
import ShopService from "@/services/ShopService";
import AuthenService from "@/services/AuthenService";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";

const storeApp = useApp();
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const shopId = localStorage.shopid;
const confirmSaveDialog = ref(false);

const shopData = ref({
  guidfixed: "",
  names: [
    {
      code: "th",
      name: "",
      isauto: false,
      isdelete: false
    }
  ],
  telephone: "",
  address: [
    {
      code: "th",
      name: "",
      isauto: false,
      isdelete: false
    }
  ],
  settings: {
    taxid: ""
  }
});

onMounted(() => {
  getShopData();
  storeApp.setPageTitle("ตั้งค่ากิจการ");
  storeApp.setActivePage("master");
  storeApp.setActiveChild("shop_profile");
});

function getShopData() {
  loading.value = true;
  ShopService.getShop(shopId)
    .then((res) => {
      console.log(res);
      if (res.success) {
        shopData.value = res.data;
        
        // ตรวจสอบและเพิ่มข้อมูลที่จำเป็นถ้ายังไม่มี
        if (!shopData.value.names || !shopData.value.names.length) {
          shopData.value.names = [{ code: "th", name: "", isauto: false, isdelete: false }];
        }
        
        if (!shopData.value.address || !shopData.value.address.length) {
          shopData.value.address = [{ code: "th", name: "", isauto: false, isdelete: false }];
        }
        
        if (!shopData.value.settings) {
          shopData.value.settings = { taxid: "" };
        }
      }
      loading.value = false;
    })
    .catch((err) => {
      console.log(err);
      loading.value = false;
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ไม่สามารถโหลดข้อมูลกิจการได้: " + err,
        life: 3000,
      });
    });
}

function onSave() {
  confirmSaveDialog.value = true;
}

function confirmSave() {
  ShopService.updateShop(shopId, shopData.value)
    .then((res) => {
      console.log(res);
      if (res.success) {
        // เรียกใช้ selectShop เพื่ออัพเดตข้อมูลในระบบให้เป็นปัจจุบัน
        AuthenService.selectShop()
          .then((selectRes) => {
            console.log("อัพเดตข้อมูล Shop สำเร็จ:", selectRes);
            
            // อัพเดต localStorage โดยตรง
            localStorage.setItem('shop_name', shopData.value.names[0].name);
            
            // สร้าง event เพื่อให้ component อื่นรับรู้การเปลี่ยนแปลง
            window.dispatchEvent(new CustomEvent('shop-updated', { 
              detail: { shopName: shopData.value.names[0].name } 
            }));
            
            toast.add({
              severity: "success",
              summary: "บันทึกสำเร็จ",
              detail: "บันทึกข้อมูลกิจการเรียบร้อยแล้ว",
              life: 3000,
            });
          })
          .catch((selectErr) => {
            console.log("เกิดข้อผิดพลาดในการอัพเดตข้อมูล Shop:", selectErr);
            
            // อัพเดต localStorage โดยตรง แม้ว่า selectShop จะล้มเหลว
            localStorage.setItem('shop_name', shopData.value.names[0].name);
            
            // สร้าง event เพื่อให้ component อื่นรับรู้การเปลี่ยนแปลง
            window.dispatchEvent(new CustomEvent('shop-updated', { 
              detail: { shopName: shopData.value.names[0].name } 
            }));
            
            toast.add({
              severity: "success",
              summary: "บันทึกสำเร็จ",
              detail: "บันทึกข้อมูลกิจการเรียบร้อยแล้ว แต่ไม่สามารถรีเฟรชข้อมูลได้ทันที",
              life: 3000,
            });
          });
        
        confirmSaveDialog.value = false;
        getShopData(); // รีเฟรชข้อมูล
      }
    })
    .catch((err) => {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "บันทึกไม่สำเร็จ",
        detail: "ไม่สามารถบันทึกข้อมูลกิจการได้: " + err,
        life: 3000,
      });
      confirmSaveDialog.value = false;
    });
}
</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-card p-4 shadow-2 border-round">
        <div class="text-3xl font-medium text-900 mb-4">ตั้งค่ากิจการ</div>
        
        <div v-if="loading" class="flex align-items-center justify-content-center" style="height: 400px">
          <ProgressSpinner />
        </div>
        
        <div v-else class="p-fluid">
          <div class="grid formgrid">
            <div class="field col-12 md:col-6">
              <span class="p-float-label">
                <InputText 
                  id="shopName" 
                  v-model="shopData.names[0].name" 
                  class="w-full"
                  autofocus 
                />
                <label for="shopName">ชื่อกิจการ</label>
              </span>
            </div>
            
            <div class="field col-12 md:col-6">
              <span class="p-float-label">
                <InputText 
                  id="taxId" 
                  v-model="shopData.settings.taxid" 
                  class="w-full" 
                />
                <label for="taxId">เลขประจำตัวผู้เสียภาษี</label>
              </span>
            </div>
            
            <div class="field col-12 md:col-6">
              <span class="p-float-label">
                <InputText 
                  id="telephone" 
                  v-model="shopData.telephone" 
                  class="w-full" 
                />
                <label for="telephone">เบอร์โทรศัพท์</label>
              </span>
            </div>
            
            <div class="field col-12">
              <span class="p-float-label">
                <Textarea 
                  id="address" 
                  v-model="shopData.address[0].name" 
                  rows="5" 
                  class="w-full" 
                />
                <label for="address">ที่อยู่</label>
              </span>
            </div>
            
            <div class="field col-12">
              <Button 
                label="บันทึกข้อมูล" 
                icon="pi pi-save" 
                @click="onSave" 
                class="p-button-success" 
              />
            </div>
          </div>
        </div>
      </div>
    </MainContentWarp>
  </AppLayout>
  
  <DialogForm
    :confirmDialog="confirmSaveDialog"
    textContent="ต้องการบันทึกข้อมูลกิจการ"
    :textContent2="shopData.names[0].name"
    @close="confirmSaveDialog = false"
    @confirm="confirmSave"
  />
</template>

<style scoped>
.p-field {
  margin-bottom: 1.5rem;
}
</style>