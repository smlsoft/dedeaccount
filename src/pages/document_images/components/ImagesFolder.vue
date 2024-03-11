<template>
  <div class="bg-primary-50 border-round select-none">
    <div
      v-if="props.isMain == true"
      class="flex justify-content-between flex-wrap card-container purple-container"
    >
      <div class="flex align-items-center justify-content-center m-2">
        <Button
          @click="addFolder(true)"
          icon="pi pi-plus"
          class="p-button-outlined w-2rem h-2rem"
        />
      </div>
      <div class="flex align-items-center justify-content-center m-2">
        <Button
          :disabled="props.selectedFolder.guidfixed == null"
          @click="addFolder(false)"
          icon="pi pi-pencil"
          class="p-button-outlined w-2rem h-2rem"
        />
      </div>
      <div class="flex align-items-center justify-content-center m-2">
        <Button
          @click="addFolder"
          icon="pi pi-search"
          class="p-button-outlined w-2rem h-2rem"
        />
      </div>
    </div>
    <ul class="list-none p-0 m-0">
      <li>
        <div
          v-ripple
          class="p-2 flex align-items-center justify-content-between text-500 cursor-pointer p-ripple"
          v-styleclass="{
            selector: '@next',
            enterClass: 'hidden',
            enterActiveClass: 'slidedown',
            leaveToClass: 'hidden',
            leaveActiveClass: 'slideup',
          }"
        >
          <span class="font-medium">ALL FOLDER</span>
          <i class="pi pi-chevron-down"></i>
        </div>
        <ul class="list-none p-0 m-0 overflow-hidden">
          <li>
            <a
              @click="selectFolder(null)"
              :class="
                props.selectedFolder.guidfixed == null
                  ? 'bg-primary-500 text-white '
                  : ''
              "
              v-ripple
              class="flex align-items-center cursor-pointer p-2 hover:bg-primary-500 hover:text-white transition-colors transition-duration-150 p-ripple"
            >
              <i
                :class="
                  props.selectedFolder.guidfixed == null
                    ? 'pi pi-folder-open mr-2'
                    : 'pi pi-folder mr-2'
                "
              ></i>

              <span class="font-medium">All</span>
            </a>
          </li>
          <li
            v-for="data in props.data_folder"
            :key="data.guidfixed"
            :class="
              data.guidfixed == props.selectedFolder.guidfixed
                ? 'bg-primary-500 '
                : ''
            "
          >
            <a
              @click="selectFolder(data)"
              :class="
                data.guidfixed == props.selectedFolder.guidfixed
                  ? 'text-white '
                  : ''
              "
              v-ripple
              class="flex align-items-center cursor-pointer p-2 hover:bg-primary-500 hover:text-white transition-colors transition-duration-150 p-ripple"
            >
              <i
                :class="
                  data.guidfixed == props.selectedFolder.guidfixed
                    ? 'pi pi-folder-open mr-2'
                    : 'pi pi-folder mr-2'
                "
              ></i>
              <span class="font-medium">{{ data.name }}</span>
              <span
                v-if="props.isMain == true"
                class="inline-flex align-items-center justify-content-center ml-auto bg-blue-100 text-blue-900 border-circle"
                style="min-width: 1.5rem; height: 1.5rem"
                >{{ data.total }}</span
              >
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>

  <Dialog
    v-model:visible="showDialogNewFolder"
    :style="{ width: '450px' }"
    :header="
      statusDialogNewFolder ? 'สร้างโฟลเดอร์เอกสาร' : 'แก้ไขโฟลเดอร์เอกสาร'
    "
    :modal="true"
  >
    <div class="grid formgrid p-fluid">
      <div class="field mb-12 col-12 md:col-12">
        <label for="title" class="font-medium text-900">ชื่อโฟลเดอร์</label>
        <InputText
          v-if="statusDialogNewFolder"
          id="title"
          type="text"
          v-model="folderName"
          :class="folderName_valid ? 'p-invalid' : ''"
        />
        <InputText
          v-if="!statusDialogNewFolder"
          id="title"
          type="text"
          v-model="props.selectedFolder.name"
          :class="folderName_valid ? 'p-invalid' : ''"
        />
        <div v-if="!statusDialogNewFolder">
          <div class="surface-border border-top-1 opacity-50 mb-3 col-12"></div>
          <label for="privacy2" class="font-medium text-900">สถานะ </label>
          <div class="flex align-items-center">
            <InputSwitch
              id="privacy2"
              v-model="props.selectedFolder.status"
            ></InputSwitch>
            <span class="ml-2" v-if="props.selectedFolder.status"> สำเร็จ</span>
            <span class="ml-2" v-if="!props.selectedFolder.status">
              ไม่สำเร็จ</span
            >
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <Button
        label="ยกเลิก"
        icon="pi pi-times"
        class="p-button-text"
        @click="showDialogNewFolder = false"
      />
      <Button
        v-if="statusDialogNewFolder"
        label="บันทึก"
        icon="pi pi-save"
        class="p-button-success"
        @click="saveFolder"
      />
      <Button
        v-if="!statusDialogNewFolder"
        label="แก้ไข"
        icon="pi pi-save"
        class="p-button-warning"
        @click="editFolder"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TaskService from "@/services/TaskService";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const props = defineProps({
  data_folder: Object,
  selectedFolder: Object,
  isMain: Boolean,
});

const folderName = ref("");
const folderName_valid = ref(false);

const emit = defineEmits(["addFolder", "saveFolderSuccess", "selectFolder"]);

const showDialogNewFolder = ref(false);
const statusDialogNewFolder = ref(false);

onMounted(async () => {});

function addFolder(status) {
  statusDialogNewFolder.value = status;
  showDialogNewFolder.value = true;
}

function selectFolder(data) {
  emit("selectFolder", data);
}

async function saveFolder() {
  if (folderName.value == "") {
    folderName_valid.value = true;
  } else {
    let data = {
      name: folderName.value,
      status: 0,
    };
    try {
      const res = await TaskService.postTask(data);
      if (res.success) {
        folderName.value = "";
        showDialogNewFolder.value = false;
        emit("saveFolderSuccess", true);
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

async function editFolder() {
  if (props.selectedFolder.name == "") {
    folderName_valid.value = true;
  } else {
    let data = {
      name: props.selectedFolder.name,
      status: props.selectedFolder.status == true ? 1 : 0,
    };
    console.log(data);
    try {
      const res = await TaskService.putTaskStatus(
        props.selectedFolder.guidfixed,
        data
      );
      //console.log(res);
      if (res.success) {
        showDialogNewFolder.value = false;
        emit("saveFolderSuccess", true);
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
</script>
