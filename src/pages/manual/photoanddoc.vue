<script setup>
    import AppLayout from "@/components/layout/AppLayout.vue";
    import MainContentWarp from "@/components/MainContentWarp.vue";
    import MasterdataService from "@/services/MasterdataService";
    import { useRouter } from "vue-router";
    import { ref, onMounted } from "vue";
    import { useToast } from "primevue/usetoast";
    import { useApp } from "@/stores/app.js";
    
    
    
    const storeApp = useApp();
    
    const imgWithbaseUrl = (uri) => {
    
    
        let baseUrl = (process.env.NODE_ENV == "development") ? import.meta.url : process.env.VUE_APP_URL;
        console.log("Mode :", process.env.NODE_ENV, baseUrl)
    
        if (process.env.NODE_ENV != "development") {
            uri = uri.replace('@/', import.meta.env.BASE_URL)
        } else {
            uri = uri.replace('@/', import.meta.env.BASE_URL)
        }
    
        return new URL(uri, baseUrl).href
    
    }
    
    onMounted(() => {
        storeApp.setPageTitle("วิธีใช้งานรูปภาพและเอกสาร");
        storeApp.setActivePage("manual_list");
        storeApp.setActiveChild("photoanddoc");
    });
    
    
    
    </script>
    
    <template>
        <AppLayout>
            <MainContentWarp>
                <div class="grid">
                    <div class=" mb-12 col-12 md:col-12">
                        <div class=" align-items-center">
                            <p class="text-3xl font-medium text-900">วิธีใช้งานรูปภาพและเอกสาร
                            <ul class="text-2xl font-medium text-900">
                                <li>ไปที่เมนู <b>รูปภาพและเอกสาร</b></li>
                               
                            </ul>
                            </p>
                        </div>
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <!-- <img :src="imgWithbaseUrl('@/images/manual/chart/1.png')" />-->
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/1.png')" alt="test" width="800" class=""
                            preview />
                            <ul class="text-2xl font-medium text-900">
                   
                                <li>คลิก <b>Upload รูปภาพ</b></li>
                            </ul>
    <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/2.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                    <div class=" mb-12 col-12 md:col-12">
                        <div class=" align-items-center">
                            <ul class="text-2xl font-medium text-900">
                   
                   <li> <b>เลือกรูป</b></li>
               </ul>
                            <p class="text-2xl font-medium text-900"> 
                                <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/3.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                            </p>
                            <ul class="text-2xl font-medium text-900">
                   
                   <li>คลิก <b>Upload </b></li>
               </ul>
                        </div>
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/4.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                            <div class="flex align-items-center">
                                <span class="text-3xl font-medium text-900">วิธีกำหนดกลุ่มเอกสาร <span
                                        class="font-bold text-900"></span></span>
                                        
                            </div>
                            
                        </div>
                        <ul class="text-2xl font-medium text-900">
                   
                   <li>กดด้านล่างของรูปภาพ <b>เลือกรูปภาพมากกว่า1รูป</b></li>
               </ul>
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/5.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                            
                            <ul class="text-2xl font-medium text-900">
                   
                   <li>กดปุ่ม กำหนดกลุ่มเอกสาร </li>
               </ul>
                        </div>
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/6.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                           
                            <ul class="text-2xl font-medium text-900">
                   
                   <li>กรอกเลขทีอ้างอิง และกดบันทึก </li>
               </ul>
                        </div>
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/7.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                </div>

                <div class="field mb-12 col-12 md:col-12">
                        <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                        
                        </div>
                    </div>
                




                <div class="field mb-12 col-12 md:col-12">
                        <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                            <div class="flex align-items-center">
                                <span class="text-3xl font-medium text-900">วิธียกเลิกรูปภาพ (แบบรูปเดี่ยว) <span
                                        class="font-bold text-900"></span></span>
                                        
                            </div>
                            
                        </div>
                        <ul class="text-2xl font-medium text-900">
                   
                   <li> คลิกตรงกลางของรูปภาพ</li>
               </ul>
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/8.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                            <ul class="text-2xl font-medium text-900">
                   
                   <li> กด ยกเลิกรูปภาพ</li>
               </ul>
               <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/9.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                            <ul class="text-2xl font-medium text-900">
                   
                   <li> กด ใช่</li>
               </ul>
               <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/10.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                            <div class="field mb-12 col-12 md:col-12">
                        <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                            <div class="flex align-items-center">
                                <span class="text-3xl font-medium text-900">วิธียกเลิกรูปภาพ (แบบกลุ่ม) <span
                                        class="font-bold text-900"></span></span>
                                        
                            </div>
                            
                        </div>
                        <ul class="text-2xl font-medium text-900">
                   
                            <li>กดด้านล่างของรูปภาพ <b>เลือกรูปภาพมากกว่า1รูป</b></li>
               </ul>
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/5.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                            <ul class="text-2xl font-medium text-900">
                   
                   <li> กด ยกเลิกรูปเอกสาร</li>
               </ul>
               <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/11.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                            <ul class="text-2xl font-medium text-900">
                   
                   <li> กด ใช่</li>
               </ul>
               <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/10.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                            <div class="field mb-12 col-12 md:col-12">
                        <div class="flex md:align-items-center md:justify-content-between flex-column md:flex-row pb-4">
                            <div class="flex align-items-center">
                                <span class="text-3xl font-medium text-900">วิธีปริ้นรูปภาพ <span
                                        class="font-bold text-900"></span></span>
                                        
                            </div>
                            
                        </div>
                        <ul class="text-2xl font-medium text-900">
                   
                   <li> คลิกที่ไอคอนเครื่องปริ้นด้านใต้รูปภาพ</li>
               </ul>
                    </div>
                    <div class="field mb-12 col-12 md:col-12">
                        <Image :src="imgWithbaseUrl('@/images/manual/photoanddoc/12.png')" alt="test" width="800" class=""
                            preview />
                    </div>
                            <ul class="text-2xl font-medium text-900">
                   
               
               </ul>
              
            </MainContentWarp>
        </AppLayout>
    </template>
    