import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import OcrService from "@/services/OcrService";
import ImageDataService from "@/services/ImageDataService";

export function useOcr() {
  const toast = useToast();
  const showOcrDialog = ref(false);
  const ocrResultData = ref(null);
  const showOcrLoadingDialog = ref(false);
  const showMasterDataErrorDialog = ref(false);
  const masterDataErrorData = ref(null);

  // Model selection dialog
  const showModelSelectionDialog = ref(false);
  const selectedModel = ref("mistral"); // default

  /**
   * แสดง dialog เลือก AI Model (Gemini หรือ Mistral)
   * @returns {Promise<string>} - model ที่เลือก ("gemini" หรือ "mistral")
   */
  function showModelSelection() {
    return new Promise((resolve) => {
      showModelSelectionDialog.value = true;
      selectedModel.value = "mistral"; // reset to default

      // สร้าง event listener สำหรับการเลือก model
      const handleModelSelection = (model) => {
        showModelSelectionDialog.value = false;
        resolve(model);
      };

      // Return function to handle selection
      window.__ocrModelSelectionHandler = handleModelSelection;
    });
  }

  /**
   * ปิด dialog เลือก model และ return model ที่เลือก
   */
  function confirmModelSelection() {
    if (window.__ocrModelSelectionHandler) {
      window.__ocrModelSelectionHandler(selectedModel.value);
      window.__ocrModelSelectionHandler = null;
    }
  }

  /**
   * ยกเลิกการเลือก model
   */
  function cancelModelSelection() {
    showModelSelectionDialog.value = false;
    if (window.__ocrModelSelectionHandler) {
      window.__ocrModelSelectionHandler(null);
      window.__ocrModelSelectionHandler = null;
    }
  }

  /**
   * ฟังก์ชันหลักสำหรับส่ง OCR - ใช้ร่วมกันทั้ง 3 ไฟล์
   * @param {Object} selectedImgData - ข้อมูลรูปภาพที่เลือก
   * @param {Function} onSuccess - callback เมื่อสำเร็จ (optional)
   * @param {Function} onError - callback เมื่อเกิด error (optional)
   */
  async function sentOCR(selectedImgData, onSuccess, onError) {
    try {
      // ตรวจสอบว่ามีรูปภาพที่เลือกหรือไม่
      if (
        !selectedImgData.value ||
        !selectedImgData.value.imagereferences ||
        selectedImgData.value.imagereferences.length === 0
      ) {
        toast.add({
          severity: "warn",
          summary: "แจ้งเตือน",
          detail: "กรุณาเลือกรูปภาพเอกสารก่อนทำการวิเคราะห์",
          life: 3000,
        });
        return;
      }

      // ตรวจสอบว่ามีข้อมูล OCR เก่าหรือไม่
      if (
        selectedImgData.value.ocranalyzeai &&
        selectedImgData.value.ocranalyzeai !== ""
      ) {
        try {
          // แสดงข้อมูล OCR เก่า
          const oldOcrData = JSON.parse(selectedImgData.value.ocranalyzeai);
          ocrResultData.value = oldOcrData;
          showOcrDialog.value = true;

          toast.add({
            severity: "info",
            summary: "แสดงข้อมูล OCR เดิม",
            detail: "หากต้องการอ่านใหม่ กรุณากดปุ่ม 'อ่าน OCR ใหม่' ใน dialog",
            life: 4000,
          });
          return;
        } catch (parseError) {
          console.error("Error parsing old OCR data:", parseError);
          // ถ้า parse ไม่ได้ ให้เรียก API ใหม่
        }
      }

      // แสดง dialog เลือก AI Model
      const model = await showModelSelection();

      // ถ้า user ยกเลิกการเลือก
      if (!model) {
        return;
      }

      // เปิด loading dialog
      showOcrLoadingDialog.value = true;

      // ดึง shopid จาก localStorage
      const shopid =
        localStorage.getItem("_shopid") || localStorage.getItem("shopid");

      if (!shopid) {
        throw new Error("ไม่พบ shopid ใน localStorage");
      }

      // เตรียมข้อมูลสำหรับส่งไป API (รูปแบบใหม่ตาม requirement)
      const requestData = {
        shopid: shopid,
        model: model, // model อยู่ที่ระดับ root
        imagereferences: selectedImgData.value.imagereferences.map((img) => ({
          documentimageguid: img.documentimageguid,
          imageuri: img.imageuri,
        })),
      };

      console.log("Sending OCR request:", requestData);

      // เรียก API
      const response = await OcrService.analyzeReceipt(requestData);

      console.log("OCR response:", response);

      // ตรวจสอบว่ามี error จาก API หรือไม่
      if (response && response.status === "error") {
        if (response.error === "master_data_not_found") {
          // กรณีไม่มี Master Data - แสดง Dialog
          masterDataErrorData.value = response;
          showMasterDataErrorDialog.value = true;
          return;
        } else {
          // กรณี error อื่นๆ
          throw new Error(response.message || "เกิดข้อผิดพลาดจาก OCR API");
        }
      }

      // ตรวจสอบว่า response มีข้อมูลที่ถูกต้องหรือไม่
      if (!response || !response.accounting_entry) {
        throw new Error("ไม่ได้รับข้อมูลจาก OCR API");
      }

      // บันทึก OCR response ลงฐานข้อมูลทันที
      try {
        const updateData = {
          ...selectedImgData.value,
          ocranalyzeai: JSON.stringify(response),
        };

        await ImageDataService.putUpdateDocumentImageGroup(
          selectedImgData.value.guidfixed,
          updateData
        );

        console.log("OCR response saved to database successfully");

        // อัปเดตข้อมูลใน selectedImgData ด้วย
        selectedImgData.value.ocranalyzeai = JSON.stringify(response);
      } catch (dbError) {
        console.error("Error saving OCR to database:", dbError);
        // แสดงเตือนแต่ไม่ throw error เพื่อให้แสดง dialog ต่อได้
        toast.add({
          severity: "warn",
          summary: "เตือน",
          detail: "บันทึกข้อมูล OCR ลงฐานข้อมูลไม่สำเร็จ",
          life: 3000,
        });
      }

      // เก็บผลลัพธ์และแสดง dialog
      ocrResultData.value = response;
      showOcrDialog.value = true;

      toast.add({
        severity: "success",
        summary: "สำเร็จ",
        detail: "วิเคราะห์เอกสารเสร็จสิ้น",
        life: 3000,
      });

      // เรียก callback ถ้ามี
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error("OCR Error:", error);

      // ตรวจสอบว่าเป็น master_data_not_found error หรือไม่
      if (error.response && error.response.data) {
        const responseData = error.response.data;

        if (responseData.error === "master_data_not_found") {
          // แสดง Dialog สำหรับ Master Data Error
          masterDataErrorData.value = responseData;
          showMasterDataErrorDialog.value = true;
          return;
        }
      }

      // กรณี error อื่นๆ
      let errorMessage = "ไม่สามารถวิเคราะห์เอกสารได้";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          errorMessage;
      } else if (error.request) {
        errorMessage = "ไม่สามารถเชื่อมต่อกับ OCR API ได้";
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast.add({
        severity: "error",
        summary: "ผิดพลาด",
        detail: errorMessage,
        life: 5000,
      });

      // เรียก callback ถ้ามี
      if (onError) {
        onError(error);
      }
    } finally {
      showOcrLoadingDialog.value = false;
    }
  }

  /**
   * Refresh OCR - อ่านใหม่
   * @param {Object} selectedImgData - ข้อมูลรูปภาพที่เลือก
   */
  async function refreshOCR(selectedImgData) {
    try {
      if (
        !selectedImgData.value ||
        !selectedImgData.value.imagereferences ||
        selectedImgData.value.imagereferences.length === 0
      ) {
        toast.add({
          severity: "warn",
          summary: "แจ้งเตือน",
          detail: "กรุณาเลือกรูปภาพเอกสารก่อนทำการวิเคราะห์",
          life: 3000,
        });
        return;
      }

      // แสดง dialog เลือก AI Model
      const model = await showModelSelection();

      // ถ้า user ยกเลิกการเลือก
      if (!model) {
        return;
      }

      showOcrDialog.value = false;
      showOcrLoadingDialog.value = true;

      const shopid =
        localStorage.getItem("_shopid") || localStorage.getItem("shopid");

      if (!shopid) {
        throw new Error("ไม่พบ shopid ใน localStorage");
      }

      const requestData = {
        shopid: shopid,
        model: model, // model อยู่ที่ระดับ root
        imagereferences: selectedImgData.value.imagereferences.map((img) => ({
          documentimageguid: img.documentimageguid,
          imageuri: img.imageuri,
        })),
      };

      console.log("Refreshing OCR request:", requestData);

      const response = await OcrService.analyzeReceipt(requestData);

      console.log("OCR response:", response);

      // ตรวจสอบว่ามี error จาก API หรือไม่
      if (response && response.status === "error") {
        if (response.error === "master_data_not_found") {
          // กรณีไม่มี Master Data - แสดง Dialog
          masterDataErrorData.value = response;
          showMasterDataErrorDialog.value = true;
          return;
        } else {
          // กรณี error อื่นๆ
          throw new Error(response.message || "เกิดข้อผิดพลาดจาก OCR API");
        }
      }

      if (!response || !response.accounting_entry) {
        throw new Error("ไม่ได้รับข้อมูลจาก OCR API");
      }

      try {
        const updateData = {
          ...selectedImgData.value,
          ocranalyzeai: JSON.stringify(response),
        };

        await ImageDataService.putUpdateDocumentImageGroup(
          selectedImgData.value.guidfixed,
          updateData
        );

        console.log("OCR response saved to database successfully");
        selectedImgData.value.ocranalyzeai = JSON.stringify(response);
      } catch (dbError) {
        console.error("Error saving OCR to database:", dbError);
        toast.add({
          severity: "warn",
          summary: "เตือน",
          detail: "บันทึกข้อมูล OCR ลงฐานข้อมูลไม่สำเร็จ",
          life: 3000,
        });
      }

      ocrResultData.value = response;
      showOcrDialog.value = true;

      toast.add({
        severity: "success",
        summary: "สำเร็จ",
        detail: "วิเคราะห์เอกสารใหม่เสร็จสิ้น",
        life: 3000,
      });
    } catch (error) {
      console.error("OCR Error:", error);

      // ตรวจสอบว่าเป็น master_data_not_found error หรือไม่
      if (error.response && error.response.data) {
        const responseData = error.response.data;

        if (responseData.error === "master_data_not_found") {
          // แสดง Dialog สำหรับ Master Data Error
          masterDataErrorData.value = responseData;
          showMasterDataErrorDialog.value = true;
          return;
        }
      }

      // กรณี error อื่นๆ
      let errorMessage = "ไม่สามารถวิเคราะห์เอกสารได้";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          errorMessage;
      } else if (error.request) {
        errorMessage = "ไม่สามารถเชื่อมต่อกับ OCR API ได้";
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast.add({
        severity: "error",
        summary: "ผิดพลาด",
        detail: errorMessage,
        life: 5000,
      });
    } finally {
      showOcrLoadingDialog.value = false;
    }
  }

  /**
   * ปิด OCR dialog
   */
  function closeOcrDialog() {
    showOcrDialog.value = false;
    ocrResultData.value = null;
  }

  return {
    // State
    showOcrDialog,
    ocrResultData,
    showOcrLoadingDialog,
    showMasterDataErrorDialog,
    masterDataErrorData,
    showModelSelectionDialog,
    selectedModel,

    // Methods
    sentOCR,
    refreshOCR,
    closeOcrDialog,
    showModelSelection,
    confirmModelSelection,
    cancelModelSelection,
  };
}
