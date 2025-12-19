import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import OcrService from "@/services/OcrService";

export function useOcr() {
  const toast = useToast();
  const showOcrDialog = ref(false);
  const ocrResultData = ref(null);
  const isLoadingOcr = ref(false);

  /**
   * เรียก OCR API เพื่อวิเคราะห์รูปภาพ
   * @param {Object} selectedImage - ข้อมูลรูปภาพที่เลือก
   */
  async function analyzeReceipt(selectedImage) {
    try {
      isLoadingOcr.value = true;

      // ดึง shopid จาก localStorage
      const shopid = localStorage.getItem('_shopid') || localStorage.getItem('shopid');

      if (!shopid) {
        throw new Error("ไม่พบ shopid ใน localStorage");
      }

      // เตรียมข้อมูลสำหรับส่ง API
      const requestData = {
        shopid: shopid,
        imagereferences: selectedImage.imagereferences.map((img) => ({
          documentimageguid: img.documentimageguid,
          imageuri: img.imageuri,
        })),
      };

      console.log("Sending OCR request:", requestData);

      // แสดง toast แจ้งว่ากำลังประมวลผล
      toast.add({
        severity: "info",
        summary: "กำลังวิเคราะห์",
        detail: "กำลังประมวลผลเอกสาร กรุณารอสักครู่...",
        life: 3000,
      });

      // เรียก API
      const response = await OcrService.analyzeReceipt(requestData);

      console.log("OCR response:", response);

      ocrResultData.value = response;
      showOcrDialog.value = true;

      toast.add({
        severity: "success",
        summary: "สำเร็จ",
        detail: "วิเคราะห์เอกสารเสร็จสิ้น",
        life: 3000,
      });

      return response;
    } catch (error) {
      console.error("OCR Error:", error);

      toast.add({
        severity: "error",
        summary: "ผิดพลาด",
        detail: error.response?.data?.message || error.message || "ไม่สามารถวิเคราะห์เอกสารได้",
        life: 5000,
      });

      throw error;
    } finally {
      isLoadingOcr.value = false;
    }
  }

  /**
   * ปิด OCR dialog
   */
  function closeOcrDialog() {
    showOcrDialog.value = false;
    ocrResultData.value = null;
  }

  /**
   * นำข้อมูล OCR ไปใช้
   * @param {Object} data - ข้อมูล OCR
   */
  function applyOcrData(data) {
    // จะ implement ใน component ที่เรียกใช้
    console.log("Apply OCR data:", data);
  }

  return {
    // State
    showOcrDialog,
    ocrResultData,
    isLoadingOcr,

    // Methods
    analyzeReceipt,
    closeOcrDialog,
    applyOcrData,
  };
}
