<script setup>
import DialogForm from "@/components/form/DialogForm.vue";
import DialogApprove from "@/components/form/DialogApprove.vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import ImageDataService from "@/services/ImageDataService";
import TaskService from "@/services/TaskService";
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useApp } from "@/stores/app.js";
import Utils from "@/utils/";
import ImageBlock from "./components/ImagesBlock.vue";
import $ from "jquery";
import DatePicker from "@/components/widget/DatePicker.vue";
import DocumentPreview from "./components/documentPreview.vue";

const storeApp = useApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const data_list = ref([]);

const totalItemsCount = ref(10);
const loading = ref(true);
const activePage = ref(1);
const firstPage = ref(0);
const AllImageUsed = ref([]);
const searchItem = ref("");
const limitPage = ref(100);

const showSkeleton = ref(false);
const totalPage = ref(0);
const selectSort = ref("xorder");

const sortOrder = ref(1);

const selectedImg = ref([]);

const showImageBy = ref("");

const imageDialog = ref(false);
const dataImageDialog = ref({});

const jobId = ref("");

const fromDate = ref("");
const toDate = ref("");
const showOveray = ref(false);
const selectedImag = ref("");
const showImgData = ref();
const showDocumentPreview = ref(true);
const isSelectedDocument = ref(false);
const isDataListNull = ref(false);
const ischeckApprove = ref(true);
const loadIcon = ref(false);

const job = ref({
  guidfixed: "",
  status: 0,
});
const dialogJobApprove = ref(false);

const sizeImageBloc = ref(true);
const sizeWidthImageBloc = ref(90);
const sizeHeightImageBloc = ref(90);

const ramdomNumber = ref();
const checkSuccess = ref(false);
const statusAllImage = ref(true);

const imagesDragData = ref({});
const imagesDragCount = ref(0);
const imagesDragReject = ref(0);
const imagesDragReferences = ref(0);
const addToGroup = ref("");
const addImageGuidfixed = ref("");
const addImagenewData = ref([]);
const allowDropImage = ref("");
const updateRefDialog = ref(false);
const buddhistYear = ref(process.env.VUE_APP_DATE == "th");
const title = ref("");
const title_valid = ref(false);
const title2 = ref("");
const title2_valid = ref(false);
const uploadedat = ref(new Date());
const uploadedat2 = ref(new Date());
const images_list_group = ref([]);
const imageGroup = ref();
const data_save_group = ref({});
const tag = ref();
const separatorExp = ref(/,| /);
const confirmDeleteImage = ref(false);
const data_set_group = ref([]);
const confirmGroupImageDialog = ref(false);
const modeReorder = ref(false);
const draggedItemIndex = ref(null);
const data_sort = ref([]);
const startIndex = ref();
const endIndex = ref();
const totalDocumentStatus_0 = ref("0");
const totalDocumentStatus_1 = ref("0");
const totalDocumentStatus_1_1 = ref("0");
const totalDocumentStatus_2 = ref("0");

const dialogComment = ref();
onMounted(() => {
  jobId.value = route.params.id;
  getDocumentImageGroup();
  getTaskById(jobId.value);

  storeApp.setActivePage("pic_group");
  storeApp.setActiveChild("images_job_approve_detail");
});

function getTaskById(guidfixed) {
  TaskService.getTaskById(guidfixed)
    .then((res) => {
      console.log(res);
      if (res.success) {
        job.value = res.data;
        if (res.data.totaldocumentstatus == null) {
          totalDocumentStatus_0.value = "0";
          totalDocumentStatus_1.value = "0";
          totalDocumentStatus_1_1.value = "0";
          totalDocumentStatus_2.value = "0";
          return;
        }

        // รอตรวจ
        const filteredStatus_0 = job.value.totaldocumentstatus.filter(
          (obj) => obj.status === 0
        );

        // ผ่าน
        const filteredStatus_1 = job.value.totaldocumentstatus.filter(
          (obj) => obj.status === 1
        );

        // ผ่านแต่ห้ามคีย์
        const filteredStatus_1_1 = job.value.totaldocumentstatus.filter(
          (obj) => obj.status === 3
        );

        // ไม่ผ่าน
        const filteredStatus_2 = job.value.totaldocumentstatus.filter(
          (obj) => obj.status === 2
        );

        totalDocumentStatus_0.value = filteredStatus_0[0].total.toString();
        totalDocumentStatus_1.value = filteredStatus_1[0].total.toString();
        totalDocumentStatus_1_1.value = filteredStatus_1_1[0].total.toString();
        totalDocumentStatus_2.value = filteredStatus_2[0].total.toString();

        storeApp.setPageTitle("ตรวจสอบรูป JOB #" + job.value.name);
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
}

function getDocumentImageGroupScroll() {
  limitPage.value = 50;
  showSkeleton.value = true;
  ImageDataService.getDocumentImageGroup(
    limitPage.value,
    activePage.value,
    searchItem.value,
    selectSort.value,
    sortOrder.value,
    showImageBy.value,
    fromDate.value,
    toDate.value,
    jobId.value
  )
    .then((res) => {
      if (res.success) {
        if (res.data == null) {
          isDataListNull.value = true;
          showSkeleton.value = false;
        } else {
          console.log("getDocumentImageGroupScroll");
          console.log(res);
          setTimeout(() => {
            res.data.forEach((ele) => {
              ele.isUpdate = false;
              ele.ischecked = false;

              let references = ele.references ?? [];
              if (ele.references == undefined) {
                ele.references = references;
              }

              data_list.value.push(ele);
            });

            firstPage.value = activePage.value;

            showSkeleton.value = false;
          }, 500);
        }
      }
    })

    .catch((err) => {
      getImageAll;
      console.log(err);
      showSkeleton.value = false;
    });
}

function getDocumentImageGroup() {
  showSkeleton.value = true;
  loading.value = true;
  isDataListNull.value = false;

  ImageDataService.getDocumentImageGroup(
    limitPage.value,
    activePage.value,
    searchItem.value,
    selectSort.value,
    sortOrder.value,
    showImageBy.value,
    fromDate.value,
    toDate.value,
    jobId.value
  )
    .then((res) => {
      if (res.success) {
        console.log("getDocumentImageGroup");
        console.log(res);
        if (res.data == null) {
          showSkeleton.value = false;
          data_list.value = [];
          isDataListNull.value = true;
        } else {
          data_list.value = res.data;
          data_list.value = data_list.value.map((element) => {
            let references = element.references ?? [];
            element.references = references;
            return element;
          });

          data_list.value.forEach((element) => {
            element.ischecked = false;
          });

          checkImageApprove();

          isDataListNull.value = false;
          loading.value = false;
          showSkeleton.value = false;
          totalPage.value = res.pagination.totalPage;
          totalItemsCount.value = res.pagination.total;
        }
      }
    })

    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: err,
        life: 3000,
      });
    });
}

function nextPage() {
  activePage.value += 1;

  if (activePage.value <= totalPage.value) {
    getDocumentImageGroupScroll();
  }
}

function onScroll() {
  let div = $("#content")[0];
  // console.log(div.scrollTop);
  if (div.scrollTop + div.clientHeight >= div.scrollHeight - 10) {
    if (!showSkeleton.value) {
      nextPage();
    }
  }
}

function resizeSplitter(isOveray) {
  showOveray.value = isOveray;
}

function showImg(data) {
  selectedImag.value = data;
  showImgData.value = data.imagereferences;
  showDocumentPreview.value = true;

  showImgData.value.forEach((element, index) => {
    getDocumentImageById(element.documentimageguid, index);
  });
}

async function getDocumentImageById(id, index) {
  try {
    let res = await ImageDataService.getDocumentImageById(id);
    // console.log(res)
    if (res.success) {
      showImgData.value[index].comments = res.data.comments;
    }
  } catch (err) {
    console.log(err);
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "ดึงข้อมูล คอมเม้น ไม่สำเร็จ ",
      life: 4000,
    });
  }
}

function closeDocumentPreview() {
  showDocumentPreview.value = false;
}

function startApproveJob() {
  ischeckApprove.value = true;

  if (job.value.status == 1) {
    jobApprove(2, "start");
  }
}

function stopApproveJob() {
  const result = data_list.value.filter((data) => data.status == 1);
  console.log(result);
  if (result.length == 0) {
    jobApprove(1, "stop");
  } else {
    jobApprove(2, "stop");
  }

  ischeckApprove.value = false;
}

function endApproveJob() {
  console.log("endApproveJob");
  ramdomNumber.value = Utils.generateRandomNumber();
  dialogJobApprove.value = true;
}

function confirmApproveFalse() {
  ramdomNumber.value = Utils.generateRandomNumber();
}

// ตรวจเสร็จแล้ว
async function jobApprove(statusJob, modeMenu) {
  dialogJobApprove.value = false;
  let status = {
    status: statusJob,
  };
  try {
    const res = await TaskService.putTaskStatus(jobId.value, status);
    if (res.success) {
      // toast.add({
      //   severity: "success",
      //   summary: "success",
      //   detail: "บันทึกข้อมูลสำเร็จ",
      //   life: 3000,
      // });

      if (modeMenu == "save") {
        setTimeout(() => {
          router.push({ name: "images_job_approve" });
        }, 200);
      }
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

// Update status
async function updateStatus(guidfixed, data_status) {
  let status = {
    status: data_status,
  };
  try {
    const res = await ImageDataService.putDocumentImageGroupStatus(
      guidfixed,
      status
    );
    if (res.success) {
      getTaskById(jobId.value);
      return true;
    }
  } catch (err) {
    console.log(err);
    toast.add({
      severity: "error",
      summary: "error",
      detail: "บันทึกไม่สำเร็จ " + err,
      life: 3000,
    });

    return false;
  }
}

async function updateStatusFrist(data) {
  if (isSelectedDocument.value) {
    selectImg(data);
  }
  // console.log(data.guidfixed);
  // // 99= ตั้งค่าสถานะให้ icon โหลด
  // data_list.value.filter(function (ele) {
  //   if (ele.guidfixed == data.guidfixed) {
  //     ele.status = 99;
  //   }
  // });
  // const updateData = await updateStatus(data.guidfixed, 1);
  // setTimeout(() => {
  //   if (updateData) {
  //     data_list.value.filter(function (ele) {
  //       if (ele.guidfixed == data.guidfixed) {
  //         ele.status = 1;
  //       }
  //     });
  //   } else {
  //     data_list.value.filter(function (ele) {
  //       if (ele.guidfixed == data.guidfixed) {
  //         ele.status = 0;
  //       }
  //     });
  //   }
  //   checkImageApprove();
  // }, 300);
}

function selectImg(data) {
  console.log(data);

  if (checkSelect(data)) {
    var rebuild = [];
    selectedImg.value.forEach((element) => {
      if (element.guidfixed != data.guidfixed) {
        rebuild.push(element);
      }
    });
    selectedImg.value = rebuild;
  } else {
    selectedImg.value.push(data);
    setTimeout(() => {
      selectedImg.value.forEach((element) => {
        element = Utils.remove_duplicates_array(element);
      });
    }, 100);
  }

  let tags = [];
  selectedImg.value.forEach((element, index) => {
    if (element.tags != undefined) {
      tags = [...tags, ...element.tags];
    }
  });
  tag.value = Array.from(new Set(tags));

  console.log(selectedImg.value);

  ischeckedImage();
}

function checkSelect(data) {
  var found = 0;
  selectedImg.value.forEach((element) => {
    if (element.guidfixed == data.guidfixed) {
      found += 1;
    }
  });
  if (found == 0) {
    return false;
  } else {
    return true;
  }
}

async function upDateStatusImage(data) {
  console.log(data);

  // 99= ตั้งค่าสถานะให้ icon โหลด
  data_list.value.filter(function (ele) {
    if (ele.guidfixed == data.guidfixed) {
      ele.status = 99;
    }
  });

  const updateData = await updateStatus(data.guidfixed, data.status);
  setTimeout(() => {
    if (updateData) {
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == data.guidfixed) {
          ele.status = data.status;
        }
      });
    } else {
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == data.guidfixed) {
          ele.status = 0;
        }
      });
    }

    checkImageApprove();
  }, 300);
}

function checkImageApprove() {
  let notApproveImate = 0;
  data_list.value.forEach((element) => {
    if (element.status == 0) {
      notApproveImate += 1;
    }
  });

  if (notApproveImate == 0) {
    checkSuccess.value = true;
  } else {
    checkSuccess.value = false;
  }
}

function updateAllStatusImage() {
  if (!statusAllImage.value) {
    data_list.value.forEach((element) => {
      // 99= ตั้งค่าสถานะให้ icon โหลด
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == element.guidfixed) {
          ele.status = 99;
        }
      });

      const updateData = updateStatus(element.guidfixed, 1);
      setTimeout(() => {
        if (updateData) {
          data_list.value.filter(function (ele) {
            if (ele.guidfixed == element.guidfixed) {
              ele.status = 1;
            }
          });
        } else {
          data_list.value.filter(function (ele) {
            if (ele.guidfixed == element.guidfixed) {
              ele.status = 0;
            }
          });
        }

        checkImageApprove();
      }, 300);
    });
  } else {
    data_list.value.forEach((element) => {
      // 99= ตั้งค่าสถานะให้ icon โหลด
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == element.guidfixed) {
          ele.status = 99;
        }
      });
      const updateData = updateStatus(element.guidfixed, 0);
      setTimeout(() => {
        if (updateData) {
          data_list.value.filter(function (ele) {
            if (ele.guidfixed == element.guidfixed) {
              ele.status = 0;
            }
          });
        }
        checkImageApprove();
      }, 300);
    });
  }
}
function selectSizeImageBloc() {
  if (sizeImageBloc.value) {
    sizeWidthImageBloc.value = 90;
    sizeHeightImageBloc.value = 90;
  } else {
    sizeWidthImageBloc.value = 230;
    sizeHeightImageBloc.value = 230;
  }
}

async function documentImageUnGroup(data) {
  console.log(data);

  await ImageDataService.putDocumentImageUnGroup(data)
    .then((res) => {
      console.log(res);
      if (res.success) {
        toast.add({
          severity: "success",
          summary: "success",
          detail: "บันทึกข้อมูลสำเร็จ",
          life: 3000,
        });
        setTimeout(() => {
          activePage.value = 1;
          getDocumentImageGroup();
          showImgData.value = null;
        }, 100);
      }
    })
    .catch((err) => {
      console.log(err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ไม่สามารถเลือกรูปได้ " + err,
        life: 3000,
      });
    });
}

function dragStart(data, event, index) {
  if (job.value.status != 1) {
    return;
  }

  imagesDragData.value = data;
  imagesDragCount.value = data.imagereferences.length;
  imagesDragReject.value = data.status;
  imagesDragReferences.value = data.references.length;

  startIndex.value = index;

  if (!modeReorder.value) {
    if (checkUseImg(data.guidfixed)) {
      return;
    } else {
      // console.log(data);
      if (data.imagereferences.length == 1 && data.references.length == 0) {
        if (selectedImg.value.length == 0) {
          selectedImg.value.push({
            guidfixed: data.guidfixed,
            tags: data.tags,
            documentimageguid: data.imagereferences[0],
            data_index: startIndex.value,
          });
          ischeckedImage();
        }
      } else {
        return;
      }
    }
  } else {
    draggedItemIndex.value = data.xorder;
  }
}

function handleDragEnd() {
  draggedItemIndex.value = null;
}

function dragging(data, event) {
  if (
    job.value.status == 1 &&
    imagesDragCount.value == 1 &&
    imagesDragReject.value != 2 &&
    imagesDragReferences.value == 0
  ) {
    if (checkUseImg(data.guidfixed)) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
  }
}
function allowDrop(data, event) {
  if (
    job.value.status == 1 &&
    imagesDragCount.value == 1 &&
    imagesDragReject.value != 2 &&
    imagesDragReferences.value == 0
  ) {
    if (checkUseImg(data.guidfixed)) {
      return;
    }
    if (allowDropImage.value != data.guidfixed) {
      allowDropImage.value = data.guidfixed;
    } else {
      return;
    }
    console.log(allowDropImage.value);

    // console.log(data);
    // console.log(event);
    event.stopPropagation();
    event.preventDefault();
  }
}

async function drop(data, event, index) {
  event.preventDefault();
  console.log("drop");
  console.log(data);

  endIndex.value = index;
  addImageGuidfixed.value = data.guidfixed;
  addImagenewData.value = data.imagereferences;

  if (addImageGuidfixed.value == imagesDragData.value.guidfixed) {
    removeSelectedImg();
    return;
  }

  if (!modeReorder.value) {
    if (
      job.value.status == 1 &&
      imagesDragCount.value == 1 &&
      imagesDragReject.value != 2 &&
      imagesDragReferences.value == 0
    ) {
      if (data.references.length == 0) {
        //จัดชุดใหม่
        if (data.imagereferences.length == 1) {
          let result = [];
          result = selectedImg.value.filter(
            (el) => el.guidfixed == addImageGuidfixed.value
          );
          if (result.length > 0) {
            let result_detail = [];
            result_detail = selectedImg.value.filter(
              (el) => el.guidfixed == imagesDragData.value.guidfixed
            );
            if (result_detail.length > 0) {
              updateRefDialog.value = true;
            } else {
              selectedImg.value.push({
                guidfixed: imagesDragData.value.guidfixed,
                tags: data.tags,
                documentimageguid: imagesDragData.value.imagereferences[0],
                data_index: endIndex.value,
              });
            }
            updateRefDialog.value = true;
          } else {
            selectedImg.value.push({
              guidfixed: data.guidfixed,
              tags: data.tags,
              documentimageguid: data.imagereferences[0],
              data_index: endIndex.value,
            });
            updateRefDialog.value = true;
          }

          let tags = [];
          selectedImg.value.forEach((element, index) => {
            if (element.tags != undefined) {
              tags = [...tags, ...element.tags];
            }
          });
          tag.value = Array.from(new Set(tags));

          console.log(selectedImg.value);
          ischeckedImage();
          //เพิ่มรูปเข้าชุด
        } else {
          addToGroup.value = data.title;
          confirmGroupImageDialog.value = true;
        }
      }
    }
  } else {
    // console.log("start: " + draggedItemIndex.value);
    // console.log("end: " + data.xorder);

    let startXorder = Math.min(draggedItemIndex.value, data.xorder);
    let endXorder = Math.max(draggedItemIndex.value, data.xorder);

    if (draggedItemIndex.value !== null) {
      const draggedItem = data_list.value[draggedItemIndex.value];
      data_list.value.splice(draggedItemIndex.value, 1);
      data_list.value.splice(data.xorder, 0, draggedItem);

      data_list.value.forEach((element, index) => {
        if (element.xorder >= startXorder && element.xorder <= endXorder) {
          data_sort.value.push({
            guidfixed: element.guidfixed,
            xorder: index,
          });
        }
        element.xorder = index;
      });

      draggedItemIndex.value = data.xorder;

      // console.log(data_sort.value);
      // console.log(data_list.value);

      updateDocumentImageXsort();
    }
  }
}

function updateDocumentImageXsort() {
  console.log("updateDocumentImageXsort");
  ImageDataService.putDocumentImageXsort(jobId.value, data_sort.value)
    .then((res) => {
      console.log(res);
      if (res.success) {
        data_sort.value = [];
        startIndex.value = null;
        endIndex.value = null;

        console.log(data_list.value);

        // toast.add({
        //   severity: "success",
        //   summary: "Success",
        //   detail: "Success",
        //   life: 1000,
        // });
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
}
async function addImageGroup() {
  selectedImg.value.forEach((element) => {
    element.documentimageguid.xorder = addImagenewData.value.length;
    addImagenewData.value.push(element.documentimageguid);
  });

  console.log(selectedImg.value);

  try {
    const res = await ImageDataService.putAddImageInGroup(
      addImageGuidfixed.value,
      addImagenewData.value
    );
    //console.log(res);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });
      confirmGroupImageDialog.value = false;
      activePage.value = 1;
      addImagenewData.value = [];
      isSelectedDocument.value = false;

      setTimeout(() => {
        getDocumentImageGroupById(addImageGuidfixed.value);
        addImageGuidfixed.value = "";
      }, 100);
    }
  } catch (err) {
    console.log(err);
  }
}

function getDocumentImageGroupById(id) {
  ImageDataService.getDocumentImageGroupById(id)
    .then((res) => {
      console.log(res);
      if (res.success) {
        console.log(selectedImg.value);
        console.log(data_list.value);

        let data_index = [];
        let newData_list = [];
        selectedImg.value.forEach((element) => {
          data_index.push(element.data_index);
        });

        data_list.value.forEach((element, index) => {
          if (data_index.indexOf(index) == -1) {
            newData_list.push(element);
          }
        });

        data_list.value = newData_list;

        // เพิ่ม data ในตำแหน่งที่วาง
        if (selectedImg.value.length > 1) {
          let newIndex = selectedImg.value.length - 1;
          data_list.value.splice(
            selectedImg.value[newIndex].data_index,
            0,
            res.data
          );
        }

        // เรียง xorder ใหม่
        data_list.value = data_list.value.map((item, index) => {
          return { ...item, xorder: index };
        });
        //เก็บค่า xorder ใหม่ ไป update
        data_list.value.forEach((element, index) => {
          data_sort.value.push({
            guidfixed: element.guidfixed,
            xorder: index,
          });
        });

        selectedImg.value = [];
        setTimeout(() => {
          //update xorder ใหม่
          updateDocumentImageXsort();
        }, 100);
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
}

function addToGroupImage(data) {
  data_set_group.value.push(data);
  data_list.value = data_list.value.filter(
    (item) => !data_set_group.value.includes(item)
  );

  console.log(data_set_group.value);
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

function ischeckedImage() {
  data_list.value.forEach((main) => {
    var result = selectedImg.value.filter(function (data) {
      return data.guidfixed == main.guidfixed;
    });
    // console.log(result.length);
    if (result.length > 0) {
      main.ischecked = true;
    } else {
      main.ischecked = false;
    }
  });
}
function cancelGropImages() {
  if (isSelectedDocument.value) {
    updateRefDialog.value = false;
    title2.value = "";
    title2_valid.value = false;
  } else {
    selectedImg.value = [];
    updateRefDialog.value = false;
    title2.value = "";
    title2_valid.value = false;
    tag.value = [];
    ischeckedImage();
  }
}
async function saveGropImages() {
  let newDate = new Date();

  newDate = uploadedat2.value;

  if (newDate.getHours() == 0) {
    let d = new Date();
    let hours = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
    let minutes = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
    let seconds = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();

    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(seconds);
  }

  console.log(newDate);

  console.log(selectedImg.value);
  let isPass = await verifyData();
  if (isPass) {
    let imagereferences = [];
    selectedImg.value.forEach((element, index) => {
      element.documentimageguid.xorder = index;
      imagereferences.push(element.documentimageguid);
    });

    data_save_group.value = {
      imagereferences: imagereferences,
      title: title2.value,
      taskguid: route.params.id,
      tags: tag.value,
      uploadedat: Utils.getFormatDateTime(newDate),
    };
  } else {
    return;
  }

  console.log(data_save_group.value);

  try {
    const res = await ImageDataService.postDocumentImageGroup(
      data_save_group.value
    );
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 3000,
      });

      isSelectedDocument.value = false;
      imageGroup.value = null;
      title.value = "";
      title_valid.value = false;
      uploadedat.value = new Date();
      title2.value = "";
      title2_valid.value = false;
      uploadedat2.value = new Date();
      updateRefDialog.value = false;
      data_set_group.value = [];
      activePage.value = 1;

      // selectedImg.value = [];

      setTimeout(() => {
        getDocumentImageGroupById(res.id);
      }, 100);
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
function verifyData() {
  var errorCount = 0;

  if (title2.value == "") {
    errorCount += 1;
    toast.add({
      severity: "error",
      summary: "ไม่สามารถทำรายการได้",
      detail: "กรุณาป้อนชื่อชุดเอกสาร ",
      life: 4000,
    });
    title2_valid.value = true;
  } else {
    title2_valid.value = false;
  }

  if (errorCount != 0) {
    return false;
  } else {
    return true;
  }
}
function onColseConfirmGroupImageDialog() {
  confirmGroupImageDialog.value = false;
  selectedImg.value = [];
}
function selectedDocument(isSelectedDoc) {
  isSelectedDocument.value = isSelectedDoc;

  if (!isSelectedDoc) {
    removeSelectedImg();
  }
  ischeckedImage();
}
function removeSelectedImg() {
  selectedImg.value = [];
  data_list.value.forEach((element) => {
    element.ischecked = false;
  });
}
async function updateTagImage(id, data) {
  // console.log(id);
  // console.log(data);
  try {
    const res = await ImageDataService.putDocumentImageGroupTags(id, data);
    if (res.success) {
      data_list.value.filter(function (ele) {
        if (ele.guidfixed == id) {
          ele.tags = data;
        }
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

function selectedModeReorder(data) {
  if (data) {
    modeReorder.value = true;
  } else {
    modeReorder.value = false;
  }
}

function updateXorderImageReferences(guidfiexd, data) {
  ImageDataService.putUpdateImageDocumentimageGroup(guidfiexd, data)
    .then((res) => {
      console.log(res);
      if (res.success) {
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "Success",
          life: 3000,
        });

        setTimeout(() => {
          showImgData.value = null;
          getDocumentImageGroup();
        }, 200);
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
}

async function saveComment(id, data, index) {
  loading.value = true;
  let newData = {
    comment: data,
  };
  try {
    const res = await ImageDataService.putDocumentImageComment(id, newData);
    if (res.success) {
      toast.add({
        severity: "success",
        summary: "success",
        detail: "บันทึกข้อมูลสำเร็จ",
        life: 1000,
      });
      loading.value = false;

      await getDocumentImageById(id, index);

      dialogComment.value.scrollToBottom();
    }
  } catch (err) {
    console.log(err);
    loading.value = false;
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
  <AppLayout>
    <div
      class="flex align-items-center justify-content-between bg-primary-50 p-1"
    >
      <div class="flex">
        <Button
          class="p-button-sm p-button-text"
          label="กลับหน้ารายการ"
          icon="pi pi-arrow-left"
          @click="router.push({ name: 'images_job_approve' })"
        />
        <!-- <Button
          v-if="!ischeckApprove"
          :disabled="
            ischeckApprove ||
            job.status == 3 ||
            job.status == 4 ||
            isSelectedDocument
          "
          class="p-button-sm ml-2"
          label="เริ่มตรวจสอบ"
          icon="pi pi-play"
          @click="startApproveJob()"
        />
        <Button
          v-if="ischeckApprove"
          :disabled="!ischeckApprove || checkSuccess"
          class="p-button-sm ml-2"
          label="หยุดตรวจสอบ"
          icon="pi pi-pause"
          @click="stopApproveJob()"
        /> -->
        <ToggleButton
          :disabled="!ischeckApprove || job.status != 1"
          v-model="statusAllImage"
          onLabel="ผ่านทั้งหมด"
          offLabel="ยกเลิกผ่านทั้งหมด"
          onIcon="pi pi-check"
          offIcon="pi pi-times"
          class="p-button-sm ml-2"
          @change="updateAllStatusImage()"
        />
        <div class="ml-1">
          <Button
            :disabled="
              selectedImg.length <= 1 || job.status == 3 || job.status == 4
            "
            class="p-button-info text-white p-button-sm"
            icon="pi pi-pencil"
            label="กำหนดชุดเอกสาร"
            @click="updateRefDialog = true"
          />
        </div>
        <div class="ml-1">
          <Button
            :disabled="isSelectedDocument || job.status != 1"
            :class="!modeReorder ? 'surface-800' : 'surface-700'"
            class="p-button-info text-white p-button-sm"
            :icon="!modeReorder ? 'pi pi pi-sort' : 'pi pi-times'"
            :label="!modeReorder ? 'เรียงรูป' : 'ยกเลิกเรียงรูป'"
            @click="
              !modeReorder
                ? selectedModeReorder(true)
                : selectedModeReorder(false)
            "
          />
        </div>
        <div class="ml-1">
          <Button
            :disabled="
              job.status == 3 ||
              job.status == 4 ||
              !ischeckApprove ||
              modeReorder
            "
            :class="!isSelectedDocument ? 'surface-600' : 'surface-700'"
            class="text-black p-button-sm"
            :icon="
              !isSelectedDocument ? 'pi pi-check-square' : 'pi pi-file-excel'
            "
            :label="!isSelectedDocument ? 'เลือกเอกสาร' : 'ยกเลิกเลือกเอกสาร'"
            @click="
              !isSelectedDocument
                ? selectedDocument(true)
                : selectedDocument(false)
            "
          />
        </div>
        <div class="ml-1">
          <Button
            v-if="selectedImg.length > 0"
            class="p-button-warning p-button-sm"
            icon="pi pi-times"
            :label="'เลือก: ' + selectedImg.length.toString()"
            @click="removeSelectedImg"
          />
        </div>
      </div>
      <div class="flex">
        <Chip
          :label="String(job.totaldocument)"
          icon="pi pi-image"
          class="ml-2 bg-primary-100"
        />
        <Chip :label="totalDocumentStatus_0" icon="pi pi-clock" class="ml-2" />
        <Chip
          :label="totalDocumentStatus_1"
          icon="pi pi-check-circle"
          class="ml-2 bg-green-300"
        />
        <Chip
          :label="totalDocumentStatus_1_1"
          icon="pi pi-check-circle"
          class="ml-2 bg-yellow-500"
        />
        <Chip
          :label="totalDocumentStatus_2"
          icon="pi pi-times-circle"
          class="ml-2 bg-red-400"
        />
        <ToggleButton
          v-model="sizeImageBloc"
          onLabel=""
          offLabel=""
          offIcon="pi pi-th-large"
          onIcon="pi pi-table"
          @change="selectSizeImageBloc()"
          class="ml-2"
        ></ToggleButton>
        <Button
          :disabled="!checkSuccess || job.status == 3 || job.status == 4"
          class="p-button-sm p-button-success ml-2"
          label="อนุมัติ"
          icon="pi pi-save"
          @click="endApproveJob()"
        />
      </div>
    </div>
    <div class="flex bg-primary-50">
      <div class="flex-1 flex">
        <Splitter
          class="w-full"
          @resizestart="resizeSplitter(true)"
          @resizeend="resizeSplitter(false)"
        >
          <SplitterPanel :size="50">
            <div
              style="height: 90vh"
              @scroll="onScroll"
              id="content"
              :style="[
                data_list.length == 0
                  ? 'overflow-y: hidden'
                  : 'overflow-y: auto',
              ]"
              class="m-2"
            >
              <div
                class="flex flex-wrap align-items-center justify-content-center"
              >
                <TransitionGroup name="fade">
                  <div
                    v-if="isDataListNull == false"
                    class="flex"
                    v-for="(data, index) in data_list"
                    :key="data.guidfixed"
                    draggable="true"
                    @dragstart="dragStart(data, $event, index)"
                    @drag="dragging(data, $event)"
                    @dragend="modeReorder ? handleDragEnd() : ''"
                    @drop="drop(data, $event, index)"
                    @dragover="allowDrop(data, $event)"
                    @dragover.prevent
                  >
                    <ImageBlock
                      :images_data_index="index"
                      :modeMenu="2"
                      :images_data="data"
                      :images_selete="selectedImg"
                      :allimage_used="AllImageUsed"
                      :ischeckApprove="ischeckApprove"
                      :sizeWidthImageBloc="sizeWidthImageBloc"
                      :sizeHeightImageBloc="sizeHeightImageBloc"
                      :isSelectedDocument="isSelectedDocument"
                      v-on:showImg="showImg"
                      v-on:selectImg="updateStatusFrist"
                      v-on:addToGroupImage="addToGroupImage"
                    >
                    </ImageBlock>
                  </div>
                </TransitionGroup>
                <div class="flex" v-for="i in 50" :key="i" v-if="showSkeleton">
                  <div
                    class="text-center m-3"
                    style="width: 90px; height: 90px"
                  >
                    <div
                      class="border-1 border-200 surface-50 flex align-items-center justify-content-center border-round mx-auto"
                    >
                      <Skeleton
                        style="width: 90px; height: 90px; object-fit: cover"
                      ></Skeleton>
                    </div>

                    <Skeleton class="mt-2"></Skeleton>
                  </div>
                </div>
              </div>
            </div>
          </SplitterPanel>
          <SplitterPanel :size="50" v-if="showDocumentPreview">
            <div
              v-if="showImgData == null"
              class="flex align-items-center justify-content-center h-full"
            >
              <p class="text-600">เลือกเอกสารเพื่อแสดง</p>
            </div>
            <DocumentPreview
              ref="dialogComment"
              v-if="showImgData != null"
              :allimage_used="AllImageUsed"
              :showOveray="showOveray"
              :showImgData="showImgData"
              :selectedImag="selectedImag"
              :jobStatus="job.status"
              :ischeckApprove="ischeckApprove"
              :modeMenu="2"
              :loading="loading"
              v-on:closeDocumentPreview="closeDocumentPreview"
              v-on:upDateStatusImage="upDateStatusImage"
              v-on:documentImageUnGroup="documentImageUnGroup"
              v-on:updateTagImage="updateTagImage"
              v-on:updateXorderImageReferences="updateXorderImageReferences"
              v-on:saveComment="saveComment"
            />
          </SplitterPanel>
        </Splitter>
      </div>
    </div>

    <Dialog
      :dismissableMask="true"
      :close-on-escape="false"
      :closeOnEscape="true"
      v-model:visible="imageDialog"
      :header="'รายละเอียด ' + dataImageDialog.name"
      :breakpoints="{ '960px': '90vw', '640px': '100vw' }"
      :style="{ width: '60vw' }"
      :modal="true"
    >
      <div class="confirmation-content" id="boxconfirm" style="height: 80vh">
        <div class="flex justify-content-between mb-2">
          <div class="flex">ชื่อรูป : {{ dataImageDialog.name }}</div>
          <div class="flex">
            วันที่ :{{
              Utils.getDateTimeFormat(dataImageDialog.uploadedat)
            }}
            โดย {{ dataImageDialog.uploadedby }}
          </div>
        </div>
        <div style="margin: 0px; padding: 0px">
          <iframe
            :src="
              '/images_group/components/zoom?uri=' + dataImageDialog.imageuri
            "
          >
          </iframe>
        </div>
      </div>
    </Dialog>

    <DialogApprove
      :mode="'approve'"
      :title="'ยืนยันการตรวจสอบ'"
      :ramdomNumber="ramdomNumber"
      :confirmDialog="dialogJobApprove"
      v-on:close="dialogJobApprove = false"
      v-on:confirmJob="jobApprove(3, 'save')"
      v-on:confirmJobFalse="confirmApproveFalse()"
    />

    <Dialog
      v-model:visible="updateRefDialog"
      @update:visible="cancelGropImages"
      :style="{ width: '450px' }"
      header="กำหนดชุดเอกสาร"
      :modal="true"
    >
      <div class="grid formgrid p-fluid">
        <div class="field mb-12 col-12 md:col-12">
          <label for="title" class="font-medium text-900">ชื่อชุดเอกสาร</label>
          <InputText
            id="title"
            type="text"
            v-model="title2"
            :class="title2_valid ? 'p-invalid' : ''"
          />
        </div>
        <div class="field mb-12 col-12 md:col-12" style="display: none">
          <label class="font-medium text-900">วันที่เอกสาร</label>
          <DatePicker
            v-model="uploadedat2"
            dateFormat="d/m/yy"
            :showIcon="true"
            :buddhist="buddhistYear"
            :hideOnDateTimeSelect="false"
            :hiddenTime="true"
          />
        </div>
        <div class="field mb-12 col-12 md:col-12">
          <label class="font-medium text-900">แท็กเอกสาร</label>
          <Chips
            v-model="tag"
            :separator="separatorExp"
            :allowDuplicate="false"
            placeholder="แท็กเอกสาร"
            :addOnBlur="true"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="ยกเลิก"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelGropImages()"
        />
        <Button
          label="บันทึก"
          icon="pi pi-check"
          class="p-button-text"
          @click="saveGropImages()"
        />
      </template>
    </Dialog>
    <DialogForm
      :confirmDialog="confirmGroupImageDialog"
      :textContent="'ต้องการรวมชุดรูป ' + addToGroup"
      v-on:close="onColseConfirmGroupImageDialog"
      v-on:confirm="addImageGroup()"
    ></DialogForm>
  </AppLayout>
</template>
<style scoped>
.p-splitter {
  border-radius: 0px;
}

.p-inputtext.p-inputtext-sm {
  font-size: 0.875rem;
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.fade-leave-active {
  position: absolute;
}
</style>
