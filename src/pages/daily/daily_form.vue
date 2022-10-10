<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import MainContentWarp from "@/components/MainContentWarp.vue";
import MasterdataService from "@/services/MasterdataService";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { ref, onMounted, computed, onUnmounted } from "vue";
import Utils from "@/utils/";
import { useApp } from "@/stores/app.js";
import ImageBlock from "../images/components/ImagesBlock.vue";
import JournalForm from "./components/journal_form.vue";
import VatForm from "./components/vat_form.vue";
import TaxForm from "./components/tax_form.vue";
import $ from "jquery";

const conreject = "ต้องการยกเลิกรูปภาพ";
const conSave = "ต้องการบันทึกเอกสารรายวัน";
const conchange = "ต้องการเปลี่ยนรูปภาพ";

const storeApp = useApp();
const content = ref();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const tabview = ref();
const confirmSaveDialog = ref(false);
const confirmRejectDialog = ref(false);
const onLoad = ref(false);
const selectedImg = ref(false);
const selectedImgUse = ref([]);

const isShowAll = ref(true);
const isShowWait = ref(false);
const isShowUnApprove = ref(false);
const searchItem = ref("");
const limitPage = ref(20);
const activePage = ref(1);
const showContent = ref("");
const showSelectFrom = ref(false);
const showImageList = ref(false);
const totalItemsCount = ref(10);
const data_gallery = ref([]);
const data_list = ref([]);
const selectedImgUrl = ref("");
const selectedImgData = ref({ documentref: "", documentimages: [] });
const rotate = ref(0);
const scale = ref(1);
const panning = ref(false);
const pointX = ref(0);
const pointY = ref(0);
const start = ref({ x: 0, y: 0 });
const zoomStyle = ref("");
const doc_images = ref([]);
const WsConnectImage = ref();
const AllImageUsed = ref([]);
const WsConnectAllImage = ref();
const activeIndex = ref(0);
const updateMode = ref(false);
const accountChart_detail = ref([]);
const accountBook_detail = ref([]);
const groupAccount_detail = ref([]);
const confirmChangeImageDialog = ref(false);
const newDocRefImage = ref();
const imagePreviewStyle = computed({
  get() {
    return {
      transform: "rotate(" + rotate.value + "deg) scale(" + scale.value + ")",
    };
  },
});
const selectSort = ref("documentref");
const sortField = ref([
  {
    code: "documentref",
    name: "เอกสารอ้างอิง",
  },
  {
    code: "name",
    name: "ตามชื่อ",
  },

  {
    code: "uploadedat",
    name: "วันที่ Upload",
  },
]);
const showImageBy = ref("0");
const sortOrder = ref(0);
const firstPage = ref(0);
const isGallery = ref(false);
const showUploadImage = ref(false);
const fileInput = ref(HTMLInputElement);

const daily_form = ref({
  accountdescription: "",
  accountgroup: "",
  accountperiod: "1",
  accountyear: parseInt(Utils.getYear().toString()) + 543,
  amount: "",
  batchId: "",
  docdate: new Date(),
  docno: "",
  bookcode: "",
  journaltype: "0",
  journaldetail: [
    {
      accountcode: "",
      accountname: "",
      debitamount: 0,
      creditamount: 0,
    },
  ],
  parid: "0000000",
});

const daily_form_valid = ref({
  accountdescription: false,
  accountgroup: false,
  accountperiod: false,
  accountyear: false,
  amount: false,
  batchId: false,
  docdate: false,
  docno: false,
  bookcode: false,
});

const vats = ref([]);

const vats_valid = ref([
  {
    vatdate: false,
    vatdocno: false,
    vatperiod: false,
    vatyear: false,
    vatbase: false,
    vatrate: false,
    vatamount: false,
    exceptvat: false,
    custname: false,
    custtaxid: false,
    branchcode: false,
  },
]);
const taxes = ref([]);
const connection = ref();
const taxes_valid = ref([
  {
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  },
]);



onUnmounted(() => {
  console.log(
    "unmounted--------------------------------------------------------"
  );

  // WsConnectAllImage.value.close();
  // WsConnectImage.value.close();
  // connection.value.close();
});

onMounted(() => {
  storeApp.setActivePage("daily");
  storeApp.setActiveChild("daily_list");

  getAllSelectImage();
  if (
    route.params.id != "" &&
    route.params.id != "" &&
    route.params.id != undefined
  ) {
    storeApp.setPageTitle("แก้ไขข้อมูลรายวัน");
    onLoad.value = true;
    updateMode.value = true;
    setTimeout(() => {
      getGLDetail(route.params.id);
    }, 1000);
  } else {
    storeApp.setPageTitle("เพิ่มข้อมูลรายวัน");
    daily_form.value.docno = Utils.getDocNoDate("JO");
  }
  getAccountChart();
  getJournalBook();
  getAccountGroup();
});

function getImagesByDocref(data) {
  console.log(data);
  MasterdataService.getImagesByDocref(data).then((res) => {
    if (res.success) {
      console.log(res.data);
      if (res.data.documentimages.length > 0) {
        doc_images.value = res.data.documentimages;

        console.log(doc_images.value);
        selectedImgData.value = res.data;
        selectedImgUrl.value = doc_images.value[0].imageuri;

        selectedImg.value = true;
        showSelectFrom.value = false;
        showImageList.value = false;
        showUploadImage.value = false;
        showpanel();
      }
    }
  });
}

function getAllSelectImage() {
  MasterdataService.getAllSelectImage()
    .then((res) => {
      console.log(res);
      if (res.success) {
        AllImageUsed.value = res.data;
      }
    })
    .catch((err) => {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ดึงข้อมูลล้มเหลว " + err,
        life: 3000,
      });
    });
}
function checkUseImgByUser(user) {
  var found = 0;
  AllImageUsed.value.forEach((element) => {
    if (element.username == user) {
      found += 1;
    }
  });

  if (found == 0) {
    return false;
  } else {
    return true;
  }
}
function selectImg(data) {
  console.log(data);

  getImagesByDocref(data);
}

function getGLDetail(id) {
  MasterdataService.getGLDetail(id)
    .then((res) => {
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

        if (res.data.vats.length > 0) {
          vats.value = [];
          vats_valid.value = [];

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
            putvatValid();
            vats.value.push(vattemp);
          }
        }

        if (res.data.taxes.length > 0) {
          taxes.value = [];
          taxes_valid.value = [];
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
            puttaxValid();
          }
          console.log();
        }
        if (res.data.documentref != "") {
          MasterdataService.getImagesByDocref(res.data.documentref)
            .then((res) => {
              if (res.success) {
                console.log(res.data);
                if (res.data.documentimages.length > 0) {
                  doc_images.value = res.data.documentimages;
                  selectedImgData.value = res.data;
                  selectedImgUrl.value = res.data.documentimages[0].imageuri;
                  console.log(selectedImgUrl.value);
                  selectedImg.value = true;
                  showpanel();
                }
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          removeSelectImg();
        }

        console.log(vats.value);
        console.log(taxes.value);
        onLoad.value = false;
      }
    })
    .catch((err) => {
      console.log(err);
      onLoad.value = false;
    });
}

function puttaxValid() {
  taxes_valid.value.push({
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  });
}

function putvatValid() {
  vats_valid.value.push({
    vatdate: false,
    vatdocno: false,
    vatperiod: false,
    vatyear: false,
    vatbase: false,
    vatrate: false,
    vatamount: false,
    exceptvat: false,
    custname: false,
    custtaxid: false,
    branchcode: false,
  });
}

function goList() {
  //removeSelectImg();
  removeMagnify();
  setTimeout(() => {
    router.push({ name: "dailyList" });
  }, 100);
}

async function confirmSave() {
  //console.log(daily_form.value);
  //console.log(vats.value);
  //console.log(taxes.value);

  var sumDebit = 0;
  await daily_form.value.journaldetail.forEach((ele) => {
    var debit = 0;
    if (ele.debitamount != "") {
      debit = parseFloat(ele.debitamount);
      sumDebit += debit;
    }
  });

  vats.value.forEach((ele) => {
    ele.vatperiod = parseInt(ele.vatperiod);
    ele.vatyear = parseInt(ele.vatyear);
  });
  daily_form.value.amount = sumDebit;
  //daily_form.value.docdate = Utils.getFormatDateTime(daily_form.value.docdate);
  console.log(Utils.getFormatDateTime(daily_form.value.docdate));
  var from_input = {
    accountdescription: daily_form.value.accountdescription,
    accountgroup: daily_form.value.accountgroup,
    accountperiod: daily_form.value.accountperiod,
    accountyear: daily_form.value.accountyear,
    documentref: selectedImgData.value.documentref,
    amount: daily_form.value.amount,
    batchId: daily_form.value.batchId,
    docdate: Utils.getFormatDateTime(daily_form.value.docdate),
    docno: daily_form.value.docno.trim(),
    bookcode: daily_form.value.bookcode,
    journaldetail: daily_form.value.journaldetail,
    journaltype: parseInt(daily_form.value.journaltype),
    parid: daily_form.value.parid,
    vats: vats.value,
    taxes: taxes.value,
  };
  from_input.vats.forEach((vat) => {
    vat.vatamount = parseFloat(vat.vatamount);
    vat.vatdate = Utils.getFormatDateTime(vat.vatdate);
  });
  from_input.taxes.forEach((tax) => {
    tax.taxdate = Utils.getFormatDateTime(tax.taxdate);
  });

  console.log(from_input);

  if (route.params.id != undefined && route.params.id != "") {
    MasterdataService.putGLJournal(from_input, route.params.id)
      .then((res) => {
        console.log(res);
        if (res.success) {
          toast.add({
            severity: "success",
            summary: "ทำรายการสำเร็จ",
            detail: "บันทึกรายการเดินบัญชีสำเร็จ",
            life: 3000,
          });
          setTimeout(() => {
            removeSelectImg();
            router.push({ name: "dailyList" });
          }, 1500);
        }
      })
      .catch((err) => {
        console.log(err.message);
        toast.add({
          severity: "error",
          summary: "ทำรายการไม่สำเร็จ",
          detail: err,
          life: 3000,
        });
      });
  } else {
    MasterdataService.postGLJournal(from_input)
      .then((res) => {
        console.log(res);
        if (res.success) {
          removeSelectImg();
          toast.add({
            severity: "success",
            summary: "ทำรายการสำเร็จ",
            detail: "บันทึกรายการเดินบัญชีสำเร็จ",
            life: 3000,
          });
          setTimeout(() => {
            router.push({ name: "dailyList" });
          }, 1500);
        }
      })
      .catch((err) => {
        console.log(err);
        console.log(err.message);
        confirmSaveDialog.value = false;
        toast.add({
          severity: "error",
          summary: "ทำรายการไม่สำเร็จ",
          detail: "รหัสเอกสารซ้ำ",
          life: 3000,
        });
      });
  }
}

async function onSave() {
  console.log(daily_form.value.docdate);
  console.log(daily_form.value);
  console.log(taxes.value);
  console.log(vats.value);
  var isPass = await verifyData();
  var isVaxPass = await verifyVat();
  var isTatPass = await verifyTax();
  if (isPass && isVaxPass && isTatPass) {
    confirmSaveDialog.value = true;
  }
}
function onPage(event) {
  activePage.value = event.page + 1;
  limitPage.value = event.rows;
  console.log(activePage.value);

  getDocImageList();
}
function verifyData() {
  var errorCount = 0;

  if (daily_form.value.docdate == "") {
    errorCount += 1;
    daily_form_valid.value.docdate = true;
  } else {
    daily_form_valid.value.docdate = false;
  }
  if (daily_form.value.docno == "") {
    errorCount += 1;
    daily_form_valid.value.docno = true;
  } else {
    daily_form_valid.value.docno = false;
  }
  if (daily_form.value.accountperiod == "") {
    errorCount += 1;
    daily_form_valid.value.accountperiod = true;
  } else {
    daily_form_valid.value.accountperiod = false;
  }
  if (daily_form.value.accountyear == "") {
    errorCount += 1;
    daily_form_valid.value.accountyear = true;
  } else {
    daily_form_valid.value.accountyear = false;
  }

  if (daily_form.value.bookcode == "") {
    errorCount += 1;
    daily_form_valid.value.bookcode = true;
  } else {
    daily_form_valid.value.bookcode = false;
  }

  var sumCredit = 0;
  var sumDebit = 0;

  let deletIndex = [];
  daily_form.value.journaldetail.forEach((ele, index) => {
    // เก็บค่า index row ที่เป็นค่าว่าง
    if (ele.accountcode == "") {
      deletIndex.push(index);
    }

    // if (ele.accountcode == "") {
    //   errorCount += 1;
    //   toast.add({
    //     severity: "error",
    //     summary: "ไม่สามารถทำรายการได้",
    //     detail: "กรุณาเลือกรหัสบัญชี รายการที่ " + (index + 1),
    //     life: 4000,
    //   });
    // }
    // if (ele.accountname == "") {
    //   errorCount += 1;
    //   toast.add({
    //     severity: "error",
    //     summary: "ไม่สามารถทำรายการได้",
    //     detail: "กรุณาเลือกรหัสบัญชี รายการที่" + (index + 1),
    //     life: 4000,
    //   });
    // }

    var debit = 0;
    var credit = 0;
    if (ele.creditamount == null) {
      ele.creditamount = 0;
    }
    if (ele.creditamount.toString() != "") {
      credit = parseFloat(ele.creditamount);
      sumCredit += credit;
    }
    if (ele.debitamount == null) {
      ele.debitamount = 0;
    }
    if (ele.debitamount.toString() != "") {
      debit = parseFloat(ele.debitamount);
      sumDebit += debit;
      //console.log(sumDebit);
    }
  });

  // ลบ row accountcode ที่เป็นค่าว่าง
  deletIndex.forEach((ele, index) => {
    let idx = ele - index;
    daily_form.value.journaldetail.splice(idx, 1);
  });

  //console.log(sumCredit);
  //console.log(sumDebit);
  if (parseFloat(sumCredit).toFixed(2) != parseFloat(sumDebit).toFixed(2)) {
    errorCount += 1;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "ยอดเดบิต และ เครดิต ไม่เท่ากัน",
      life: 4000,
    });
  }

  if (errorCount != 0) {
    return false;
  } else {
    var sumDebit;
    daily_form.value.journaldetail.forEach((ele) => {
      var debit = 0;
      var credit = 0;
      if (ele.creditamount != "") {
        credit = parseFloat(ele.creditamount);
      }
      if (ele.debitamount != "") {
        debit = parseFloat(ele.debitamount);
      }
      sumDebit += debit;
      ele.accountcode = ele.accountcode.toString();
      ele.accountname = ele.accountname.toString();
      ele.debitamount = debit;
      ele.creditamount = credit;
    });

    daily_form.value.amount = sumDebit;
    //daily_form.value.docdate = Utils.getFormatDateTime(daily_form.value.docdate);
    daily_form.value.accountperiod = parseInt(
      daily_form.value.accountperiod.toString()
    );
    daily_form.value.accountyear = parseInt(daily_form.value.accountyear);
    return true;
  }
}

function verifyVat() {
  var errorCount = 0;

  vats.value.forEach((ele, index) => {
    var errorDetail = 0;
    var vat_error_detail = {
      vatdate: false,
      vatdocno: false,
      vatperiod: false,
      vatyear: false,
      vatbase: false,
      vatrate: false,
      vatamount: false,
      exceptvat: false,
      custname: false,
      custtaxid: false,
      branchcode: false,
    };

    // console.log(ele);

    if (ele.vatdocno != "") {
      if (ele.vatdate == "") {
        errorDetail += 1;
        vat_error_detail.vatdate = true;
      } else {
        vat_error_detail.vatdate = false;
      }
      if (ele.vatdocno == "") {
        errorDetail += 1;
        vat_error_detail.vatdocno = true;
      } else {
        vat_error_detail.vatdocno = false;
      }
      if (ele.vatperiod == "") {
        errorDetail += 1;
        vat_error_detail.vatperiod = true;
      } else {
        vat_error_detail.vatperiod = false;
      }
      if (ele.vatyear.toString() == "") {
        errorDetail += 1;
        vat_error_detail.vatyear = true;
      } else {
        vat_error_detail.vatyear = false;
      }

      if (ele.vatbase.toString() == "") {
        errorDetail += 1;
        vat_error_detail.vatbase = true;
      } else {
        vat_error_detail.vatbase = false;
      }
      if (ele.vatrate.toString() == "") {
        errorDetail += 1;
        vat_error_detail.vatrate = true;
      } else {
        vat_error_detail.vatrate = false;
      }

      if (ele.custname == "") {
        errorDetail += 1;
        vat_error_detail.custname = true;
      } else {
        vat_error_detail.custname = false;
      }
      if (ele.custtaxid == "") {
        errorDetail += 1;
        vat_error_detail.custtaxid = true;
      } else {
        vat_error_detail.custtaxid = false;
      }
      if (ele.branchcode == "") {
        errorDetail += 1;
        vat_error_detail.branchcode = true;
      } else {
        vat_error_detail.branchcode = false;
      }

      if (errorDetail != 0) {
        toast.add({
          severity: "error",
          summary: "ไม่สามารถทำรายการได้",
          detail: "กรุณากรอกข้อมูลภาษีรายการที่ " + (index + 1) + " ให้ครบ",
          life: 4000,
        });
      }
      errorCount += errorDetail;
    }
    vats_valid.value[index] = vat_error_detail;
  });
  if (errorCount != 0) {
    return false;
  } else {
    return true;
  }
}

function getDocImageList() {
  MasterdataService.getDocImage(
    limitPage.value,
    activePage.value,
    searchItem.value,
    selectSort.value,
    sortOrder.value,
    showImageBy.value
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_list.value = res.data;
        data_list.value.forEach((ele) => {
          ele.isUpdate = false;
        });
        totalItemsCount.value = res.pagination.total;
        console.log(totalItemsCount.value);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function resizeend(event) {
  console.log(event);
}
function removeSelectImg() {
  selectedImgData.value = { documentref: "", documentimages: [] };
  selectedImg.value = false;
  selectedImgUrl.value = "";
  doc_images.value = [];
  hidepanel();
  // var sendData = { docref: selectedImgData.value.documentref };

  // MasterdataService.postUnSelectImage(sendData)
  //   .then((res) => {
  //     console.log(res);
  //     if (res.success) {
  //       selectedImgData.value = { documentref: "", documentimages: [] };
  //       selectedImg.value = false;
  //       selectedImgUrl.value = "";
  //       doc_images.value = [];
  //       hidepanel();
  //     }
  //   })
  //   .catch((err) => {
  //     selectedImgData.value = { documentref: "", documentimages: [] };
  //     selectedImg.value = false;
  //     selectedImgUrl.value = "";
  //     doc_images.value = [];
  //     hidepanel();
  //   });
}
function removeMagnify() {
  const elements = document.getElementsByClassName("img-magnifier-glass");
  // console.log(elements);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}
function magnify(imgID, zoom) {
  var img, glass, w, h, bw;

  // if (elements.length > 0) {
  //   elements[0].parentNode.removeChild(elements[0]);
  // } else {
  const elements = document.getElementsByClassName("img-magnifier-glass");
  console.log(elements);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }

  img = document.getElementById(imgID);

  /*create magnifier glass:*/
  glass = document.createElement("DIV");

  glass.setAttribute("class", "img-magnifier-glass");
  /*insert magnifier glass:*/
  img.parentElement.insertBefore(glass, img);
  /*set background properties for the magnifier glass:*/
  glass.style.backgroundImage = "url('" + img.src + "')";
  glass.style.backgroundRepeat = "no-repeat";
  glass.style.backgroundSize =
    img.width * zoom + "px " + img.height * zoom + "px";
  glass.style.zIndex = 99999;
  bw = 3;
  w = glass.offsetWidth / 2;
  h = glass.offsetHeight / 2;
  /*execute a function when someone moves the magnifier glass over the image:*/
  glass.addEventListener("mousemove", moveMagnifier);
  img.addEventListener("mousemove", moveMagnifier);
  /*and also for touch screens:*/
  glass.addEventListener("touchmove", moveMagnifier);
  img.addEventListener("touchmove", moveMagnifier);
  function moveMagnifier(e) {
    var pos, x, y;
    /*prevent any other actions that may occur when moving over the image*/
    e.preventDefault();
    /*get the cursor's x and y positions:*/
    pos = getCursorPos(e);
    x = pos.x;
    y = pos.y;
    /*prevent the magnifier glass from being positioned outside the image:*/
    if (x > img.width - w / zoom) {
      x = img.width - w / zoom;
    }
    if (x < w / zoom) {
      x = w / zoom;
    }
    if (y > img.height - h / zoom) {
      y = img.height - h / zoom;
    }
    if (y < h / zoom) {
      y = h / zoom;
    }
    /*set the position of the magnifier glass:*/
    glass.style.left = x - w + "px";
    glass.style.top = y - h + "px";
    /*display what the magnifier glass "sees":*/
    glass.style.backgroundPosition =
      "-" + (x * zoom - w + bw) + "px -" + (y * zoom - h + bw) + "px";
  }
  function getCursorPos(e) {
    var a,
      x = 0,
      y = 0;
    e = e || window.event;
    /*get the x and y positions of the image:*/
    a = img.getBoundingClientRect();
    /*calculate the cursor's x and y coordinates, relative to the image:*/
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /*consider any page scrolling:*/
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return { x: x, y: y };
  }
}

function verifyTax() {
  var errorCount = 0;

  taxes.value.forEach((ele, index) => {
    var errorDetail = 0;
    var tax_error_detail = {
      taxdate: false,
      taxdocno: false,
      custname: false,
      custtaxid: false,
      details: [
        {
          description: false,
        },
      ],
    };

    //console.log(ele);

    if (ele.taxdocno != "") {
      if (ele.taxdate == "") {
        errorDetail += 1;
        tax_error_detail.taxdate = true;
      } else {
        tax_error_detail.taxdate = false;
      }
      if (ele.taxdocno == "") {
        errorDetail += 1;
        tax_error_detail.taxdocno = true;
      } else {
        tax_error_detail.taxdocno = false;
      }
      if (ele.custname == "") {
        errorDetail += 1;
        tax_error_detail.custname = true;
      } else {
        tax_error_detail.custname = false;
      }
      if (ele.custtaxid.toString() == "") {
        errorDetail += 1;
        tax_error_detail.custtaxid = true;
      } else {
        tax_error_detail.custtaxid = false;
      }
      ele.details.forEach((detail, indexx) => {
        if (detail.description == "" && indexx == 0) {
          errorDetail += 1;
        }
      });

      if (errorDetail != 0) {
        toast.add({
          severity: "error",
          summary: "ไม่สามารถทำรายการได้",
          detail:
            "กรุณากรอกข้อมูลภาษีหัก​​ ณ ที่จ่าย รายการที่ " +
            (index + 1) +
            " ให้ครบ",
          life: 4000,
        });
        // ele.details.forEach((detail, indexx) => {
        //   if (detail.description == "" && indexx == 0) {
        //     toast.add({
        //       severity: "error",
        //       summary: "ไม่สามารถทำรายการได้",
        //       detail:
        //         "กรุณากรอกข้อมูลรายละเอียดภาษีหัก​​ ณ ที่จ่าย รายการที่ " +
        //         (indexx + 1),
        //       life: 4000,
        //     });
        //   }
        // });
      }
      errorCount += errorDetail;
    }
    taxes_valid.value[index] = tax_error_detail;
  });
  if (errorCount != 0) {
    return false;
  } else {
    return true;
  }
}

function checkUseImg(data) {
  var found = 0;
  AllImageUsed.value.forEach((element) => {
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
function changeImage(data) {
  getImagesByDocref(data.documentref);
}

function onDrop(event) {
  DomHandler.removeClass(content.value, "p-fileupload-highlight");
  event.stopPropagation();
  event.preventDefault();

  const files = event.dataTransfer
    ? event.dataTransfer.files
    : event.target.files;
  const allowDrop = true || (files && files.length === 1);

  if (allowDrop) {
    onFileSelect(event);
  }
}
function onFileSelect(event) {
  console.log(event);
  var data_import = [];
  let files = event.dataTransfer
    ? event.dataTransfer.files
    : event.target.files;

  for (let file of files) {
    if (isImage(file)) {
      file.objectURL = window.URL.createObjectURL(file);
      data_import.push(file);
    }
    if (checkUseImgByUser(localStorage._usercode)) {
      removeSelectImg();
    }
    uploadProgress(data_import);
  }
}

function rejectImg() {
  var post_data = { status: 1 };
  console.log(
    selectedImgData.value.documentimages[activeIndex.value].guidfixed
  );
  MasterdataService.putrejectimagestatusonlyGuiD(
    post_data,
    selectedImgData.value.documentimages[activeIndex.value].guidfixed
  )
    .then((res) => {
      console.log(res);
      if (res.success) {
        selectedImgData.value.documentimages[activeIndex.value].status = 1;
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
  confirmRejectDialog.value = false;
}
async function uploadProgress(data_import) {
  console.log(data_import);
  var interval = 1000;
  await data_import.forEach((ele) => {
    var file = ele;
    var reader = new FileReader();
    var returnimgblob;
    reader.onload = function (readerEvent) {
      var image = new Image();
      image.onload = function (imageEvent) {
        // Resize the image
        var canvas = document.createElement("canvas"),
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
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
        var dataUrl = canvas.toDataURL("image/jpeg");
        var resizedImage = dataURLToBlob(dataUrl);
        $.event.trigger({
          type: "imageResized",
          blob: resizedImage,
          url: dataUrl,
        });

        var newfile = createFile(resizedImage, ele);
        console.log(ele);
        console.log(newfile);
        ele = newfile;

        MasterdataService.upLoadDocImages(newfile, "GL")
          .then((res) => {
            console.log(res);
            if (res.success) {
              selectImg(res.data.documentref);
              toast.add({
                severity: "success",
                summary: "Success",
                detail: ele.name + " Uploaded",
                life: 10000,
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
      image.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function createFile(image, file) {
  // let newFile = {
  //   cmd: file.cmd,
  //   name: file.name,
  //   objectURL: URL.createObjectURL(image),
  //   size: image.size,
  //   type: file.type,
  //   lastModifiedDate: file.lastModifiedDate,
  //   lastModified: file.lastModified,
  // };
  let newFile = new File([image], file.name, {
    type: "image/png",
  });
  newFile.cmd = file.cmd;
  newFile.objectURL = URL.createObjectURL(image);
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

function chooseFile() {
  document.getElementById("chooseFile").click();
}

function hidepanel() {
  setTimeout(() => {
    var panel = document.getElementById("panelForm3");
    panel.setAttribute("style", "flex-basis: calc(98% - 4px) !important");
    var panel2 = document.getElementById("panelForm2");
    panel2.setAttribute("style", "flex-basis: calc(2% - 4px) !important");
  }, 50);
}
function showpanel() {
  setTimeout(() => {
    var panel3 = document.getElementById("panelForm3");
    panel3.setAttribute("style", "flex-basis: calc(60% - 4px) !important");

    var panel2 = document.getElementById("panelForm2");
    panel2.setAttribute("style", "flex-basis: calc(40% - 4px) !important");
  }, 50);
}
function isImage(file) {
  return /^image\//.test(file.type);
}
function ImportDaliy(data) {
  daily_form.value.journaldetail = data;
}

function deleteDetail(data) {
  daily_form.value.journaldetail = daily_form.value.journaldetail.filter(
    (val) => val.index !== data
  );

  if (daily_form.value.journaldetail.length == 0) {
    daily_form.value.journaldetail.push({
      accountcode: "",
      accountname: "",
      debitamount: 0,
      creditamount: 0,
    });
  }
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Detail Deleted",
    life: 3000,
  });
}
function reload() {
  getAccountChart();
}
function addColumn(index) {
  daily_form.value.journaldetail.splice(index + 1, 0, {
    accountcode: "",
    accountname: "",
    debitamount: 0,
    creditamount: 0,
  });
}

function onRowReorder(data) {
  daily_form.value.journaldetail = data;
  toast.add({
    severity: "success",
    summary: "ทำรายการสำเร็จ",
    detail: "ย้ายตำแหน่งสำเร็จ",
    life: 3000,
  });
}

function selectAccount(data, index) {
  var ele = accountChart_detail.value.filter((val) => val.accountcode == data.accountcode);
  daily_form.value.journaldetail[index].accountcode = ele[0].accountcode;
  daily_form.value.journaldetail[index].accountname = ele[0].accountname;
}

function getAccountChart() {
  MasterdataService.getAccountChart()
    .then((res) => {
      console.log(res);
      if (res.success) {
        accountChart_detail.value = res.data.sort(function (obj1, obj2) {
          return obj1.accountcode - obj2.accountcode;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function getJournalBook() {
  MasterdataService.getJournalBook()
    .then((res) => {
      //console.log(res);
      if (res.success) {
        accountBook_detail.value = res.data.sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        });
        accountBook_detail.value.forEach((ele) => {
          ele.label = ele.code + "~" + ele.name1;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
function getAccountGroup() {
  MasterdataService.getAccountGroup()
    .then((res) => {
      //console.log(res);
      if (res.success) {
        groupAccount_detail.value = res.data.sort(function (obj1, obj2) {
          return obj1.code - obj2.code;
        });
        groupAccount_detail.value.forEach((ele) => {
          ele.label = ele.code + "~" + ele.name1;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function addBoxVat() {
  vats.value.push({
    vattype: 0,
    vatdate: Utils.getDateTime(),
    vatdocno: "",
    vatperiod: "1",
    vatyear: parseInt(Utils.getYear().toString()) + 543,
    vatbase: 0,
    vatrate: 0,
    vatamount: 0,
    exceptvat: 0,
    vatmode: 0,
    vatsubmit: false,
    custname: "",
    custtaxid: "",
    organization: 0,
    branchcode: "00000",
    remark: "",
  });

  vats_valid.value.push({
    vatdate: false,
    vatdocno: false,
    vatperiod: false,
    vatyear: false,
    vatbase: false,
    vatrate: false,
    vatamount: false,
    exceptvat: false,
    custname: false,
    custtaxid: false,
    branchcode: false,
  });
}

function deleteDetailVat(index) {
  vats.value.splice(index, 1);
  vats_valid.value.splice(index, 1);
}

function calVatAmount(index) {
  var vatbase = vats.value[index].vatbase;
  var vatrate = vats.value[index].vatrate;
  if (vatbase == "" || vatbase == null) {
    vatbase = 0;
  }
  if (vatrate == "" || vatrate == null) {
    vatrate = 0;
  }
  var vatAmount = (parseFloat(vatbase) * parseFloat(vatrate)) / 100;
  vatAmount = vatAmount.toFixed(2);
  vats.value[index].vatamount = parseFloat(vatAmount);
}

function checkDateFormat(index) {
  if (vats.value[index].vatperiod > 12) {
    vats.value[index].vatperiod = 12;
  }
  if (vats.value[index].vatperiod < 1) {
    vats.value[index].vatperiod = 1;
  }
}
function setBranch(index) {
  if (vats.value[index].organization == 0) {
    vats.value[index].branchcode = "00000";
  } else {
    vats.value[index].branchcode = "";
  }
}
function selectSortUse(event) {
  // console.log(event);
  selectSort.value = event.value;
  getDocImageList();
}
function addBoxTax() {
  taxes.value.push({
    taxdocno: "",
    taxdate: Utils.getDateTime(),
    custname: "",
    custtype: 0,
    custtaxid: "",
    taxtype: 0,
    details: [
      {
        description: "",
        taxbase: 0,
        taxrate: 0,
        taxamount: 0,
      },
    ],
  });

  taxes_valid.value.push({
    taxdate: false,
    taxdocno: false,
    custname: false,
    custtaxid: false,
  });
}

function deleteDetailTax(index) {
  taxes.value.splice(index, 1);
  taxes_valid.value.splice(index, 1);
}
function getSumTaxBase(data) {
  var sum = 0;
  if (data != null && data.length > 0) {
    data.forEach((element) => {
      sum += element.taxbase;
    });
  }
  return sum.toFixed(2);
}

const setTransform = () => {
  zoomStyle.value = "transform:translate(" + pointX.value + "px, " + pointY.value + "px) scale(" + scale.value + ")";
}

function onmousedown(e) {
  console.log(e);
  e.preventDefault();
  start.value = { x: e.clientX - pointX.value, y: e.clientY - pointY.value };
  panning.value = true;
}

function onmouseup(e) {
  console.log(e);
  panning.value = false;
}

function onmousemove(e) {
  console.log(e);
  e.preventDefault();
  if (!panning.value) {
    return;
  }
  pointX.value = (e.clientX - start.value.x);
  pointY.value = (e.clientY - start.value.y);
  setTransform();
}

function onwheel(e) {
  console.log(e);
  e.preventDefault();
  var xs = (e.clientX - pointX.value) / scale.value,
    ys = (e.clientY - pointY.value) / scale.value,
    delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
  (delta > 0) ? (scale.value *= 1.2) : (scale.value /= 1.2);
  pointX.value = e.clientX - xs * scale.value;
  pointY.value = e.clientY - ys * scale.value;

  setTransform();
}

function selectSortOrder(data) {
  console.log(data);
  sortOrder.value = data;
  getDocImageListDefualt();
}

function getDocImageListDefualt() {
  loading.value = true;
  selectedImg.value = [];
  limitPage.value = 50,
    activePage.value = 1,
    searchItem.value = "",
    showImageBy.value;
  getDocImageList();
}

</script>

<template>
  <AppLayout>
    <MainContentWarp>
      <div class="surface-ground px-2 py-0">
        <Button label="กลับหน้ารายการ" icon="pi pi-arrow-left" class="p-button-text p-button-sm p-button-info"
          @click="goList()" v-if="!onLoad" />
        <div class="flex align-items-center justify-content-center" style="min-height: 60vh" v-if="onLoad">
          <ProgressSpinner />
        </div>
        <Dialog v-model:visible="showSelectFrom" :hide="((showImageList = false), (showUploadImage = false))"
          class="p-dialog-maximized selectimgDialog" style="z-index: 800" :modal="true" :closeOnEscape="true"
          :dismissableMask="true" :showHeader="true" :draggable="false">
          <template #header>
            <h3 class="p-1 mt-2 mb-2">รูปภาพเอกสาร</h3>
          </template>
          <div class="flex align-items-center justify-content-center mt-5" v-if="!showImageList && !showUploadImage">
            <div class="flex mr-2">
              <Card
                class="shadow-2 border-round pl-3 pr-3 pb-0 align-items-center justify-content-center cursor-pointer hover:border-green-700 border-2 border-300"
                @click="
                  showImageList = true;
                  showUploadImage = false;
                ">
                <template #header>
                  <img src="@/assets/img/galleryimg.png" style="height: 200px" />
                </template>
                <template #title>เลือกจากคลังรูป</template>
              </Card>
            </div>
            <div class="flex ml-2">
              <Card
                class="shadow-2 border-round pl-3 pr-3 pb-0 align-items-center justify-content-center cursor-pointer hover:border-green-700 border-2 border-300"
                @click="chooseFile()">
                <template #header>
                  <img src="@/assets/img/folderimg.png" style="height: 200px" />
                </template>
                <template #title>อัพโหลดรูปภาพ</template>
                <template #content><input id="chooseFile" ref="fileInput" type="file" @change="onFileSelect"
                    :multiple="false" accept="image/*" style="display: none" /></template>
              </Card>
            </div>
          </div>

          <div class="flex align-items-center justify-content-center mt-0" v-if="showImageList && !showUploadImage">
            <Card class="p-3 w-screen">
              <template #header>
                <div class="p-inputgroup mt-2">
                  <InputText placeholder="ค้นหาเอกสาร" v-model="searchItem" />
                  <Button icon="pi pi-search" @click="getDocImageList()" class="p-button-primary" />
                </div>
                <div class="flex justify-content-between">
                  <div class="grid mt-3 ml-1">
                    <Paginator class="justify-content-start" :rows="limitPage" v-model:first="firstPage"
                      :totalRecords="totalItemsCount" @page="onPage($event)">
                    </Paginator>
                  </div>
                  <div class="grid mt-3 mr-1">
                    <div class="flex align-items-center ml-2">
                      <span class="mr-2 text-900">การเรียงข้อมูล</span>
                      <Dropdown v-model="selectSort" :options="sortField" optionLabel="name" optionValue="code"
                        @change="selectSortUse($event)">
                      </Dropdown>
                      <i v-if="sortOrder == -1" class="pi pi-sort-amount-up-alt cursor-pointer ml-2"
                        style="font-size: 1.5rem" @click="selectSortOrder(1)"></i>
                      <i v-if="sortOrder == 1" class="pi pi pi-sort-amount-down-alt cursor-pointer ml-2"
                        style="font-size: 1.5rem" @click="selectSortOrder(-1)"></i>
                    </div>
                  </div>
                </div>
              </template>
              <template #content class="p-0">
                <div class="p-3 card" v-if="data_gallery.length == 0 && data_list.length == 0">
                  <div class="flex align-content-center justify-content-center flex-wrap card-container"
                    style="min-height: 56vh">
                    <div class="p-0">
                      <div class="text-xl text-300">
                        <h3>ไม่พบรายการรูปภาพ</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="grid pt-0 mt-0">
                  <div class="col-12 md:col-6 xl:col-3 pt-0" v-for="(data, index) in data_gallery" :key="index">
                    <div class="shadow-1 p-3 surface-card" style="cursor: pointer" @click="selectGallery(data.code)">
                      <div class="flex justify-content-center align-items-center">
                        <div class="p-0">
                          <img src="@/assets/img/foldericon.svg" class="" />

                          <!-- <div class="text-sm text-text-600">วันที่ {{ data.create_date }}</div>
                  <div class="text-sm text-text-600">โดย {{ data.creator }}</div> -->
                        </div>
                      </div>
                      <div class="flex justify-content-start align-items-center">
                        <div class="p-1">
                          <div class="text-md text-900 font-medium mb-2">
                            {{ data.name }}
                          </div>
                          <!-- <div class="text-sm text-text-600">วันที่ {{ data.create_date }}</div>
                  <div class="text-sm text-text-600">โดย {{ data.creator }}</div> -->
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 md:col-6 xl:col-3 pt-0" v-for="data in data_list" :key="data.guidfixed">
                    <ImageBlock :images_data="data" :images_selete="selectedImgUse" :mode="3" v-on:selectImg="selectImg"
                      :allimage_used="AllImageUsed"></ImageBlock>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </Dialog>
        <div class="surface-card p-4 shadow-2 border-round p-fluid" v-if="!onLoad">
          <Splitter layout="horizontal">
            <SplitterPanel :size="1" class="relative" id="panelForm2" @mouseleave="removeMagnify()">
              <div class="flex justify-content-between align-items-right">
                <div>
                  <Button v-if="selectedImg == false" icon="pi pi-angle-double-right" class="p-button-text" @click="
                    selectedImg = true;
                    showpanel();
                  " />
                  <Button v-if="selectedImg == true" icon="pi pi-angle-double-left" class="p-button-text" @click="
                    selectedImg = false;
                    hidepanel();
                  " />
                </div>
                <div>
                  <Button v-if="selectedImg && selectedImgUrl != ''" icon="pi pi-trash"
                    class="p-button-text text-red-500" @click="confirmRejectDialog = true" />
                  <Button v-if="selectedImg && selectedImgUrl != ''" icon="pi pi-times" class="p-button-text" @click="
                    removeSelectImg();
                    removeMagnify();
                  " />
                </div>
              </div>
              <Button v-if="selectedImgUrl == ''" icon="pi pi-image"
                class="p-button-raised p-button-rounded absolute bottom-0 left-0" @click="
                  showSelectFrom = true;
                  getDocImageList();
                  removeMagnify();
                " />
              <div class="p-3" style="z-index: 500; position: absolute; top: 5rem; left: 1rem">
                <Message severity="error" :closable="false" v-if="
                  selectedImgData.documentref != '' &&
                  selectedImgData.documentimages[activeIndex].status == 1
                ">
                  <span class="flex align-items-center justify-content-center">
                    *Warning Message รูปโดนยกเลิก
                  </span>
                </Message>
                <Message severity="warn" :closable="false" v-if="
                  selectedImgData.documentref != '' &&
                  selectedImgData.documentimages[activeIndex].status == 2
                ">
                  *Warning Message รูปนี้บันทึก GL เรียบร้อยแล้ว</Message>
              </div>
              <KeepAlive>
                <Galleria v-if="doc_images.length > 0 && selectedImg" :value="doc_images" :thumbnailsPosition="'top'"
                  :showThumbnails="doc_images.length > 1" v-model:activeIndex="activeIndex">
                  <template #item="slotProps">
                    <div class="p-3 img-magnifier-container mt-3">
                      <div class="zoom_outer">
                        <div id="zoom" :style="zoomStyle" @mousedown="onmousedown($event)" @mouseup="onmouseup($event)"
                          @mousemove="onmousemove($event)" @wheel="onwheel($event)">
                          <img v-if="slotProps.item != null" :src="slotProps.item.imageuri"
                            class="p-image-preview zoom" />
                        </div>
                      </div>
                      <!-- <img v-if="slotProps.item != null" :src="slotProps.item.imageuri" @click="magnify('myimage', 2)"
                        class="w-full" :style="imagePreviewStyle" id="myimage" /> -->
                    </div>
                  </template>
                  <template #thumbnail="slotProps">
                    <img :src="slotProps.item.imageuri" style="width: 40px; height: 40px" />
                  </template>
                  <template #footer></template>
                </Galleria>
              </KeepAlive>

              <Button v-if="selectedImgUrl == ''" icon="pi pi-image"
                class="p-button-raised p-button-rounded absolute bottom-0 left-0" @click="
                  showSelectFrom = true;
                  getDocImageList();
                  removeMagnify();
                " />
            </SplitterPanel>
            <SplitterPanel @click="removeMagnify()" :size="99" id="panelForm3">
              <TabView class="tabview-custom" ref="tabview">
                <TabPanel>
                  <template #header>
                    <i class="pi pi-book mr-1"></i>
                    <span> ข้อมูลรายวัน</span>
                  </template>
                  <div v-if="!onLoad">
                    <JournalForm :daily_form="daily_form" :daily_form_valid="daily_form_valid"
                      :accountChart_detail="accountChart_detail" :accountBook_detail="accountBook_detail"
                      :groupAccount_detail="groupAccount_detail" v-on:ImportDaliy="ImportDaliy"
                      v-on:deleteDetail="deleteDetail" v-on:reload="reload" v-on:addColumn="addColumn"
                      v-on:onRowReorder="onRowReorder" v-on:selectAccount="selectAccount">
                    </JournalForm>
                  </div>
                </TabPanel>
                <TabPanel>
                  <template #header>
                    <i class="pi pi-wallet mr-1"></i>
                    <span> ข้อมูลภาษี</span>
                  </template>
                  <div v-if="!onLoad">
                    <VatForm :vats="vats" :vats_valid="vats_valid" v-on:addBoxVat="addBoxVat"
                      v-on:deleteDetailVat="deleteDetailVat" v-on:calVatAmount="calVatAmount"
                      v-on:checkDateFormat="checkDateFormat" v-on:setBranch="setBranch"></VatForm>
                  </div>
                </TabPanel>
                <TabPanel>
                  <template #header>
                    <i class="pi pi-wallet mr-1"></i>
                    <span> ภาษีถูกหัก/หัก​ ณ ที่จ่าย</span>
                  </template>
                  <div v-if="!onLoad">
                    <TaxForm :taxes="taxes" :taxes_valid="taxes_valid" v-on:addBoxTax="addBoxTax"
                      v-on:deleteDetailTax="deleteDetailTax" v-on:getSumTaxBase="getSumTaxBase"></TaxForm>
                  </div>
                </TabPanel>
              </TabView>
            </SplitterPanel>
          </Splitter>

          <div class="mt-4 ml-0">
            <Button @click="onSave" label="บันทึกรายวัน" icon="pi pi-save" class="w-auto p-button-success"></Button>
          </div>
        </div>
      </div>
      <DialogForm :confirmDialog="confirmRejectDialog" :textContent="conreject" v-on:close="confirmRejectDialog = false"
        v-on:confirm="rejectImg()"></DialogForm>
      <DialogForm :confirmDialog="confirmSaveDialog" :textContent="conSave" v-on:close="confirmSaveDialog = false"
        v-on:confirm="confirmSave"></DialogForm>
      <DialogForm :confirmDialog="confirmChangeImageDialog" :textContent="conchange"
        v-on:close="confirmChangeImageDialog = false" v-on:confirm="changeImage(newDocRefImage)"></DialogForm>
    </MainContentWarp>
  </AppLayout>
</template>

<style>
.img-magnifier-container {
  position: relative;
}

.img-magnifier-glass {
  position: absolute;
  border: 1px solid #000;
  border-radius: 50%;
  cursor: none;
  /*Set the size of the magnifier glass:*/
  width: 200px;
  height: 200px;
}

.selectimgDialog .p-dialog-header {
  padding: 10px 15px 10px 15px;
}


.zoom_outer {
  padding: 0;
  outline: 0;
  overflow: hidden;
  width: auto;
  height: auto;
  margin: 0 auto
}

#zoom {
  padding: 20px;
  width: 100%;
  height: 100%;
  transform-origin: 0px 0px;
  transform: scale(1) translate(0px, 0px);
  cursor: grab;


}

div#zoom>img {
  width: 100%;
  height: auto;

}
</style>
