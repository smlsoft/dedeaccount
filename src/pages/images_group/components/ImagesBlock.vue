<template>
  <div class="p-1 cursor-pointer card-container blue-container bg-blue-while hover:shadow-2" :class="borderImage()"
    @click="selectModeImage()" @mouseenter="hoveredItem = props.images_data.imageuri" @mouseleave="hoveredItem = null">
    <div class="p-2 surface-card border-round cardimage">
      <div class="
          surface-section
          z-1
          relative
          transition-all transition-duration-300
        ">
        <div class="relative mb-1">
          <img :src="props.images_data.imagereferences[0].imageuri" class="w-full "
            style="object-fit: cover; height: 12rem" :style="props.mode != 4 ? 'cursor: zoom-in' : ''"
            @click="props.mode != 4 ? zoomImg(props.images_data) : ''" />

          <button v-if="props.images_data.imagereferences.length > 1" @click="zoomImg(props.images_data)" type="text"
            v-ripple
            class="fadein p-link w-3rem h-3rem bg-blue-500 hover:bg-blue-600 border-circle shadow-2 inline-flex align-items-center justify-content-center absolute transition-colors transition-duration-300"
            style="top: 0rem; right: 1rem">
            <span class="font-bold text-white">{{props.images_data.imagereferences.length}}</span>
          </button>

          <!-- <div class="absolute" style="bottom: 0.5rem; right: 0.3rem" v-if="checkUseImg(props.images_data.documentref)">
            <Chip :label="getUseData(props.images_data.documentref)" style="background-color: #2196f3; color: #ffffff"
              icon="pi pi-user" class="mr-2 mb-2 " />
          </div> -->
        </div>

        <div class="flex justify-content-between align-items-center mb-2" v-if="props.images_data.title == ''">
          <span class="text-900 font-medium titletext">{{
          (props.images_data.title != "") ? props.images_data.title : props.images_data.guidfixed
          }}</span>
        </div>
        <div class="flex justify-content-between align-items-center mb-2" v-if="props.images_data.title != ''">
          <span class="text-900 font-medium titletext">กลุ่มเอกสาร : {{
          props.images_data.title
          }}</span>
        </div>


        <div class=" mb-0 flex text-600 justify-content-between">
          <div class="font-medium text-sm ">

          </div>
          <div class="font-medium text-sm">
            {{ Utils.getDateTimeFormat(props.images_data.uploadedat) }}
          </div>
        </div>

        <ul class="list-none m-0 p-0">
          <li class="py-1">
            <div class="align-items-center justify-content-center"
              v-if="props.mode == 1 && props.images_data.status == 1">
              <Button v-if="props.images_data.status == 1" icon="pi pi-upload"
                :class="'p-button-secondary text-white mr-1'" class="w-full" label="เลือกรูปใหม่"
                @click="chooseFile()" />
              <input id="chooseFile" ref="fileInput" type="file" @change="onFileSelect" :multiple="false"
                accept="image/*" style="display: none" />
              <Button v-if="props.images_data.status == 1" icon="pi pi-refresh"
                :class="'p-button-green text-white mr-1'" class="w-full mt-1" :label="'นำกลับมาใช้'"
                @click="removeReject()" />
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <Dialog :dismissableMask="true" :close-on-escape="false" v-model:visible="showImgDialog" header="รายละเอียด"
    :breakpoints="{'960px': '75vw', '640px': '90vw'}" :style="{width: '60vw'}" :modal="true">
    <div class="confirmation-content" id="boxconfirm">

      <div class="flex justify-content-between mb-2">
        <div class="flex">{{ showImgHeader }}</div>
        <div class="flex">{{ showContent }}</div>
      </div>

      <div class="flex justify-content-between mb-2">
        <div class="flex">
          <Button class="p-button-danger text-white" icon="pi pi-pencil" label="ยกเลิกกลุ่มเอกสาร"
            @click="confirmUnGroup = true" v-if="showImgSrc.length > 1" />
          <Button v-if="props.mode != 4" class="p-button-warning  ml-1" icon="pi pi-print"
            @click="printImg(props.images_data.imagereferences)" label="ปริ้นเอกสาร" />
          <Button v-if="props.mode != 4" class=" p-button-secondary  ml-1" icon="pi pi-eye"
            @click="showDetailGlImage(props.images_data.docguidref)" label="GL"
            :disabled="props.images_data.docguidref == ''" />
        </div>
      </div>

      <Galleria :value="showImgSrc" thumbnailsPosition="top" :circular="true" :show-thumbnails="showImgSrc.length > 1">
        <template #item="slotProps">
          <img :src="slotProps.item.imageuri" style="width: 100%; display: block;" />
        </template>
        <template #thumbnail="slotProps">
          <img :src="slotProps.item.imageuri" style="width: 50px; height: 50px;" />
        </template>
      </Galleria>


      <div class="flex align-items-center justify-content-center" v-if="
        props.mode == 1 &&
        !checkUseImg(showImageDocRef) &&
        props.images_data.status == 0 &&
        !showRotateEdit
      ">
        <!-- <Button label="แก้ไข" icon="pi pi-pencil" class="p-button-primary w-full mr-1" @click="editimage()" /> -->
        <!-- <Button
          label="สร้างเอกสาร"
          icon="pi pi-pencil"
          @click="createform()"
          class="p-button-primary w-full mr-1"
        /> -->

        <Button v-if="props.images_data.status == 0" icon="pi pi-trash" label="ยกเลิกรูปภาพ"
          class="p-button-danger w-full mr-1 text-white" @click="rejectImg()" />
      </div>
      <div class="flex align-items-center justify-content-center mb-2 mt-2" v-if="showRotateEdit">
        <Button icon="pi pi-arrow-left" class="p-button-info mr-1" @click="flip(true, false)" />
        <Button icon="pi pi-arrow-right" class="p-button-info mr-1" @click="flip(false, true)" />
        <Button icon="pi pi-refresh" class="p-button-info mr-1" @click="rotate(90)" />
        <Button icon="pi pi-replay" class="p-button-info ml-1" @click="rotate(-90)" />
      </div>
      <div class="flex align-items-center justify-content-center" v-if="showRotateEdit">
        <Button label="บันทึก" icon="pi pi-save" class="p-button-success w-full mr-1" @click="confirmSaveImg = true" />
        <!-- <Button
          label="สร้างเอกสาร"
          icon="pi pi-pencil"
          @click="createform()"
          class="p-button-primary w-full mr-1"
        /> -->

        <Button v-if="props.images_data.status == 0" icon="pi pi-angle-left" label="ยกเลิก"
          class="p-button-danger w-full mr-1 text-white" @click="showRotateEdit = false" />
      </div>
    </div>
  </Dialog>
  <DialogForm :confirmDialog="confirmSaveImg" :textContent="'ต้องการบันทึกรูปภาพใช่หรือไม่'"
    v-on:close="confirmSaveImg = false" v-on:confirm="saveUpdateImg()"></DialogForm>
  <DialogForm :confirmDialog="confirmUnGroup" :textContent="'ต้องการยกเลิกกลุ่มรูปภาพใช่หรือไม่'"
    v-on:close="confirmUnGroup = false" v-on:confirm="documentImageUnGroup()"></DialogForm>

  <Dialog :header="props.images_data.docguidref" v-model:visible="showGLImage"
    :breakpoints="{'960px': '75vw', '640px': '90vw'}" :style="{width: '60vw'}" :modal="true" :draggable="false"
    position="top">

    <!-- <JournalForm :daily_form="daily_form" :daily_form_valid="daily_form_valid"
      :accountChart_detail="accountChart_detail" :accountBook_detail="accountBook_detail"
      :groupAccount_detail="groupAccount_detail">
    </JournalForm> -->

    <!-- <TabView class="tabview-custom" ref="tabview">
      <TabPanel>
        <template #header>
          <i class="pi pi-book mr-1"></i>
          <span> ข้อมูลรายวัน</span>
        </template>
        <div>
          <JournalForm :daily_form="daily_form"></JournalForm>
        </div>
      </TabPanel> -->
    <!-- <TabPanel>
        <template #header>
          <i class="pi pi-wallet mr-1"></i>
          <span> ข้อมูลภาษี</span>
        </template>
        <div>
          <VatForm :vats="vats"></VatForm>
        </div>
      </TabPanel>
      <TabPanel>
        <template #header>
          <i class="pi pi-wallet mr-1"></i>
          <span> ภาษีถูกหัก/หัก​ ณ ที่จ่าย</span>
        </template>
        <div>
          <TaxForm :taxes="taxes"></TaxForm>
        </div>
      </TabPanel> -->
    <!-- </TabView> -->
  </Dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Utils from "@/utils/";
import $ from "jquery";
import MasterdataService from "@/services/MasterdataService";
import { useToast } from "primevue/usetoast";
import DialogForm from "@/components/form/DialogForm.vue";
import { e } from "../../../../dist/vendor66890";
const toast = useToast();
const confirmSaveImg = ref(false);
const confirmUnGroup = ref(false);
const showImgSrc = ref(null);
const showImgDialog = ref(false);
const showContent = ref("");
const showImgHeader = ref("");
const showImageDocRef = ref("");
const hoveredItem = ref();
const showRotateEdit = ref(false);
const cropper = ref();
const zoomImgData = ref();
const imageStatus = {
  Normal: 0,
  Reject: 1,
  Saved: 2,
};
const showGLImage = ref(false);
const daily_form = ref({});
const taxes = ref([]);
const vats = ref([]);
const loadDetailGlImage = ref(false);
const responsiveOptions = ref([
  {
    breakpoint: '1024px',
    numVisible: 5
  },
  {
    breakpoint: '960px',
    numVisible: 4
  },
  {
    breakpoint: '768px',
    numVisible: 3
  },
  {
    breakpoint: '560px',
    numVisible: 1
  }
]);

const props = defineProps({
  images_data: Object,
  images_selete: Array,
  mode: Number,
  allimage_used: Array,
});
const emit = defineEmits([
  "selectImg",
  "useImage",
  "createform",
  "rejectImg",
  "removeReject",
  "onFileSelect",
  "onReloadData",
  "documentImageUnGroup"

]);

onMounted(async () => {
  //console.log(props.images_data);
  let box = $(".cardimage");

  let width = box.offsetWidth;

  $(".titletext").attr(
    "style",
    "width:" +
    (width - 20) +
    "px;white-space: nowrap;overflow: hidden;  text-overflow: ellipsis;"
  );
});

function chooseFile() {
  document.getElementById("chooseFile").click();
}
function rotateImg(val) { }

function editimage() {
  showRotateEdit.value = true;
  setTimeout(() => {
    cropper.value.setCoordinates(({ coordinates, imageSize }) => ({
      width: imageSize.width,
      height: imageSize.height,
    }));
  }, 50);
}
function checkSelect(data) {
  var found = 0;

  props.images_selete.forEach((element) => {
    if (element.guidfixed == data) {
      found += 1;
    }
  });

  if (found == 0) {
    return false;
  } else {
    return true;
  }
}

function flip(x, y) {
  cropper.value.flip(x, y);
}

function rotate(angle) {
  cropper.value.rotate(angle);
}




function change({ coordinates, image }) { }

function saveUpdateImg() {
  const { canvas } = cropper.value.getResult();

  if (canvas) {
    const form = new FormData();

    // console.log(canvas.toDataURL());
    var dataUrl = canvas.toDataURL();
    // var resizedImage = dataURLToBlob(dataUrl);
    // $.event.trigger({
    //   type: "imageResized",
    //   blob: resizedImage,
    //   url: dataUrl,
    // });

    // var newfile = createFile(resizedImage);

    // console.log(newfile);

    var image = new Image();
    image.onload = function (imageEvent) {
      // Resize the image
      var canvasx = document.createElement("canvas"),
        max_size = 1280, // TODO : pull max size from a site config
        width = image.width,
        height = image.height;
      if (width > height) {
        if (width > max_size) {
          height *= max_size / width;
          width = max_size;
        }
      } else {
        if (height > max_size) {
          width *= max_size / height;
          height = max_size;
        }
      }
      canvasx.width = width;
      canvasx.height = height;
      canvasx.getContext("2d").drawImage(image, 0, 0, width, height);
      var dataUrl = canvasx.toDataURL("image/jpeg");
      var resizedImage = dataURLToBlob(dataUrl);
      $.event.trigger({
        type: "imageResized",
        blob: resizedImage,
        url: dataUrl,
      });

      var newfile = createFile(resizedImage);

      console.log(newfile);
      console.log(zoomImgData.value);
      MasterdataService.upLoadImages(newfile, "GL")
        .then((res) => {
          console.log(res);
          if (res.success) {
            console.log(res.data.uri);
            replaceImg(res.data.uri);
            toast.add({
              severity: "success",
              summary: "Success",
              detail: " Uploaded",
              life: 5000,
            });
          }
        })
        .catch((err) => {
          console.log(err);
          toast.add({
            severity: "error",
            summary: "Error",
            detail: err,
            life: 3000,
          });
        });
    };
    image.src = dataUrl;
  }
}
async function replaceImg(imageuri) {
  console.log(zoomImgData.value);
  var replaceData = {
    documentref: zoomImgData.value.documentref,
    imageuri: imageuri,
    module: zoomImgData.value.module,
    docguidref: zoomImgData.value.docguidref,
    status: 0,
    uploadedby: zoomImgData.value.uploadedby,
    uploadedat: zoomImgData.value.uploadedat,
  };
  try {
    const res = await MasterdataService.putrejectimage(
      replaceData,
      zoomImgData.value.guidfixed
    );
    console.log(res);
    if (res.success) {
      showRotateEdit.value = false;
      showImgDialog.value = false;
      confirmSaveImg.value = false;
      reloadData();
    }
  } catch (err) {
    console.log(err);
  }
}

function createFile(image) {
  let newFile = new File([image], Utils.uuidv4() + Utils.uuidv4() + ".jpg", {
    type: "image/png",
  });
  newFile.objectURL = window.URL.createObjectURL(image);
  return newFile;
}

function dataURLToBlob(dataURL) {
  var BASE64_MARKER = ";base64,";
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(",");
    var contentType = parts[0].split(":")[1];
    var raw = parts[1];

    return new Blob([raw], { type: contentType });
  }

  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(":")[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

function download() {
  const result = this.$refs.cropper.getResult().canvas.toDataURL();
  const newTab = window.open();
  newTab.document.body.innerHTML = `<img src="${result}"></img>`;
}
function checkUseImg(data) {
  var found = 0;

  props.allimage_used.forEach((element) => {
    if (element.docref == data) {
      found += 1;
    }
  });

  if (found == 0) {
    return false;
  } else {
    return true;
  }
}

function getUseData(data) {
  var found = 0;
  var detail = "";
  props.allimage_used.forEach((element) => {
    if (element.docref == data) {
      found = 1;
      detail = element.username;
    }
  });
  if (found != 0) {
    return detail;
  } else {
    return "Not Found";
  }
}

function selectImg(data, documentimageguid) {
  let dataSelet = {
    guidfixed: data,
    documentimageguid: documentimageguid,
  }
  emit("selectImg", dataSelet);
}

function zoomImg(data) {
  console.log(data);
  zoomImgData.value = data;
  console.log("zoomImg");
  showImgSrc.value = data.imagereferences;
  showImgDialog.value = true;
  var date = Utils.getDateTimeFormat(data.uploadedat);
  showContent.value = "วันที่ : " + date + "  โดย " + data.uploadedby;
  if (data.title != "") {
    showImgHeader.value = "กลุ่ม: " + data.title;
  } else {
    showImgHeader.value = "";
  }
  showImageDocRef.value = data.documentref;
}

function createform() {
  emit("createform", props.images_data.documentref);
}

function useImage() {
  emit("useImage", props.images_data.documentref);
}

function removeReject() {
  emit("removeReject", props.images_data.documentref);
}

function rejectImg() {
  emit("rejectImg", props.images_data.documentref);
}
function onFileSelect(event) {
  emit("onFileSelect", event, props.images_data);
}

function reloadData() {
  emit("onReloadData", "");
}

function documentImageUnGroup() {
  emit("documentImageUnGroup", props.images_data.guidfixed);
  confirmUnGroup.value = false;
  showImgDialog.value = false;
}

function selectModeImage() {

  console.log("selectModeImage");

  // mode 1 page : images_list                   เมนู: รูปภาพเอกสาร
  // mode 4 page : daily_images_group_list       เมนู: บันทึกรายวันจากรูป

  if (showImgDialog.value) {
    return;
  }

  if (props.mode == 1) {
    if (props.images_data.imagereferences.length > 1) {
      console.log("group");
    } else {
      console.log("sigle");
      selectImg(props.images_data.guidfixed, props.images_data.imagereferences[0]);
    }
  } else if (props.mode == 4) {
    selectImg(props.images_data.guidfixed);
  }


  let modeMenu = props.mode;
  let statusImage = props.images_data.status;

  // console.log(checkUseImg(props.images_data.documentref));
  // console.log("menu", modeMenu);
  // console.log("status", statusImage);
  // console.log("--------------");

  // if (showImgDialog.value) {
  //   return;
  // }
  // if (!checkUseImg(props.images_data.documentref)) {
  //   if (modeMenu == 1 && statusImage == 0) {
  //     console.log("xxx");
  //     selectImg(props.images_data.guidfixed);
  //   } else if (modeMenu == 2 && statusImage == 0) {
  //     selectImg(props.images_data.documentref);
  //   } else if (modeMenu == 3 && statusImage == 0) {
  //     selectImg(props.images_data.documentref);
  //   }
  // }
  // if (modeMenu == 4 && statusImage == 0) {
  //   selectImg(props.images_data.documentref);
  // }
}

function printImg(data) {
  console.log(data);
  var url = data;
  var w = window.open("", "");
  w.document.write("<html><head>");
  w.document.write("</head><body >");

  data.forEach((element, index) => {
    w.document.write('<img id="print-image-element" src="' + element.imageuri + '" width="100%"/>');
  });

  w.document.write(
    '<script>var img = document.getElementById("print-image-element"); img.addEventListener("load",function(){ window.focus(); window.print(); window.document.close(); window.close(); }); <//script>'
  );
  w.document.write("</body></html>");
  w.window.print();
  w.window.close();
  selectModeImage();
}
function borderImage() {
  let userImageStyle = "";
  let isUseImage = checkUseImg(props.images_data.documentref);
  let selectedImage = checkSelect(props.images_data.guidfixed);
  let statusImage = props.images_data.status;

  if (selectedImage) {
    userImageStyle = "bg-blue-500 ";
  }


  // if (statusImage == imageStatus.Normal) {
  //   if (isUseImage) {
  //     userImageStyle = "bg-blue-100";
  //   } else {
  //     if (selectedImage) {
  //       userImageStyle = "bg-blue-500 ";
  //     } else {
  //       userImageStyle = "bg-blue-while hover:shadow-1 ";
  //     }
  //   }
  // } else if (statusImage == imageStatus.Reject) {
  //   userImageStyle = "bg-yellow-200";
  // } else if (statusImage == imageStatus.Saved) {
  //   userImageStyle = "bg-green-100";
  // }
  return userImageStyle;
}

function showDetailGlImage(docno) {
  console.log(docno);
  showGLImage.value = true;

  loadDetailGlImage.value = true;
  MasterdataService.getGLledger(docno)
    .then((res) => {
      console.log(res);
      if (res.success) {
        if (res.success) {
          const vat = res.data.vats;
          const tax = res.data.taxes;

          console.log(res.data);

          daily_form.value.accountdescription = res.data.accountdescription;
          daily_form.value.accountgroup = res.data.accountgroup;
          daily_form.value.accountperiod = res.data.accountperiod;
          daily_form.value.accountyear = res.data.accountyear;
          daily_form.value.amount = res.data.amount;
          daily_form.value.batchId = res.data.batchId;
          daily_form.value.journaltype = res.data.journaltype.toString();
          daily_form.value.docdate = Utils.getDateTimeFromDate(res.data.docdate);
          daily_form.value.docno = res.data.docno;
          daily_form.value.bookcode = res.data.bookcode;
          daily_form.value.journaldetail = res.data.journaldetail;
          if (daily_form.value.exdocrefdate == "0001-01-01T00:00:00Z") {
            daily_form.value.exdocrefdate = "";
          } else {
            daily_form.value.exdocrefdate = Utils.getDateTimeFromDate(res.data.exdocrefdate);
          }
          daily_form.value.exdocrefno = res.data.exdocrefno;

          if (res.data.vats.length > 0) {
            vats.value = [];

            for (var i = 0; i < res.data.vats.length; i++) {
              var vattemp = {
                vattype: vat[i].vattype,
                vatdate: Utils.getDateTimeFromDate(vat[i].vatdate),
                vatdocno: vat[i].vatdocno,
                vatperiod: vat[i].vatperiod,
                vatyear: vat[i].vatyear,
                vatbase: vat[i].vatbase,
                vatrate: vat[i].vatrate,
                vatamount: vat[i].vatamount,
                exceptvat: vat[i].exceptvat,
                vatmode: vat[i].vatmode,
                vatsubmit: vat[i].vatsubmit,
                custname: vat[i].custname,
                custtaxid: vat[i].custtaxid,
                organization: vat[i].organization,
                branchcode: vat[i].branchcode,
                remark: vat[i].remark,
              };
              vats.value.push(vattemp);
            }
          }

          if (res.data.taxes.length > 0) {
            taxes.value = [];
            for (var i = 0; i < res.data.taxes.length; i++) {
              var taxes_temp = {
                taxdocno: res.data.taxes[i].taxdocno,
                taxdate: Utils.getDateTimeFromDate(res.data.taxes[i].taxdate),
                custname: res.data.taxes[i].custname,
                custtype: res.data.taxes[i].custtype,
                custtaxid: res.data.taxes[i].custtaxid,
                taxtype: res.data.taxes[i].taxtype,
                address: res.data.taxes[i].address,
                details: [],
              };

              if (
                res.data.taxes[i].details != null &&
                res.data.taxes[i].details.length > 0
              ) {
                var sumamount = 0;
                var sumbase = 0;
                res.data.taxes[i].details.forEach((data) => {
                  var details_temp = {
                    description: data.description,
                    taxbase: data.taxbase,
                    taxrate: data.taxrate,
                    taxamount: data.taxamount,
                  };

                  taxes_temp.details.push(details_temp);
                });
              } else {
                taxes_temp.details = [
                  {
                    description: "",
                    taxbase: 0,
                    taxrate: 0,
                    taxamount: 0,
                  },
                ];
              }

              taxes.value.push(taxes_temp);
            }
            console.log();
          }


          console.log(vats.value);
          console.log(taxes.value);
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });

}
</script>
<style scoped>
.textcenter {
  margin: auto;
  line-height: 1.25rem;

  padding: 0px;
}
</style>
