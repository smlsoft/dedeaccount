import axios from 'axios';

class ReportTaxJournalDeductService {
    constructor() {
        this.baseUrl = import.meta.env.VUE_APP_REPORT_API || 'http://localhost:3345/';
    }

    /**
     * ดึงข้อมูลรายงานภาษีหัก ณ ที่จ่าย
     * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
     * @returns {Promise} - Promise ที่ resolve เป็นข้อมูลรายงาน
     */
    async getTaxReport(params) {
        try {
            const url = new URL(`${this.baseUrl}apireport/journaltaxdeduct/`);

            // เพิ่ม params ทั้งหมด
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });

            const response = await axios.get(url.toString());
            return response.data;
        } catch (error) {
            console.error('Error fetching Tax report:', error);
            throw error;
        }
    }

    /**
     * สร้างไฟล์ PDF รายงานภาษีหัก ณ ที่จ่าย
     * @param {Object} params - พารามิเตอร์สำหรับการสร้าง PDF
     * @returns {Promise} - Promise ที่ resolve เป็นข้อมูลการสร้างไฟล์
     */
    async generateTaxReportPDF(params) {
        try {
            const url = new URL(`${this.baseUrl}apireport/journaltaxdeduct/genPDF`);

            // เพิ่ม params ทั้งหมด
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });

            const response = await axios.get(url.toString());
            return response.data;
        } catch (error) {
            console.error('Error generating Tax report PDF:', error);
            throw error;
        }
    }

    /**
     * ตรวจสอบสถานะการสร้าง PDF
     * @param {string} jobId - รหัสงาน
     * @param {string} fileName - ชื่อไฟล์
     * @returns {Promise} - Promise ที่ resolve เป็นสถานะงาน
     */
    async checkJobStatus(jobId, fileName) {
        try {
            const url = new URL(`${this.baseUrl}apireport/journaltaxdeduct/check/${jobId}/${fileName}`);
            const response = await axios.get(url.toString());
            return {
                completed: response.data.success,
                ...response.data
            };
        } catch (error) {
            console.error('Error checking job status:', error);
            throw error;
        }
    }

    /**
     * ดาวน์โหลดไฟล์ PDF รายงานภาษี
     * @param {string} jobId - รหัสงาน PDF
     * @param {string} fileName - ชื่อไฟล์
     */
    downloadTaxReportPDF(jobId, fileName) {
        const downloadUrl = `${this.baseUrl}apireport/journaltaxdeduct/download/${jobId}/${fileName}`;

        // เปิดหน้าต่างใหม่สำหรับดาวน์โหลด
        window.open(downloadUrl, '_blank');
    }

    /**
     * รอให้ PDF ถูกสร้างเสร็จก่อนดาวน์โหลด
     * @param {string} jobId - รหัสงาน
     * @param {string} fileName - ชื่อไฟล์ PDF
     * @param {number} maxAttempts - จำนวนครั้งสูงสุดที่จะลองตรวจสอบ (default: 15)
     * @param {number} interval - ช่วงเวลาระหว่างการตรวจสอบในมิลลิวินาที (default: 2000)
     * @returns {Promise} - Promise ที่ resolve เมื่อดาวน์โหลดเสร็จสิ้น
     */
    async waitForPDFAndDownload(jobId, fileName, maxAttempts = 15, interval = 2000) {
        let attempts = 0;

        return new Promise((resolve, reject) => {
            const checkJob = async () => {
                try {
                    if (attempts >= maxAttempts) {
                        reject(new Error('ไม่สามารถสร้าง PDF ได้ภายในเวลาที่กำหนด'));
                        return;
                    }

                    attempts++;
                    const status = await this.checkJobStatus(jobId, fileName);

                    if (status.completed) {
                        // เมื่อสร้าง PDF เสร็จ
                        this.downloadTaxReportPDF(jobId, fileName);
                        resolve({ success: true, message: 'ดาวน์โหลด PDF สำเร็จ' });
                    } else if (status.message === "regenerated") {
                        // กรณีที่ไฟล์ถูกสร้างเสร็จแต่ไม่พบไฟล์ ต้องสั่งสร้างใหม่
                        reject(new Error('ไม่พบไฟล์ PDF กรุณาลองใหม่อีกครั้ง'));
                    } else {
                        // ถ้ายังไม่เสร็จ รอแล้วลองใหม่
                        setTimeout(checkJob, interval);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            // เริ่มการตรวจสอบ
            checkJob();
        });
    }

    /**
     * สร้างและดาวน์โหลด PDF รายงานภาษี (ฟังก์ชันรวมในขั้นตอนเดียว)
     * @param {Object} params - พารามิเตอร์สำหรับการสร้าง PDF
     * @returns {Promise} - Promise ที่ resolve เมื่อเริ่มดาวน์โหลด
     */
    async generateAndDownloadPDF(params) {
        try {
            const result = await this.generateTaxReportPDF(params);

            if (result.success) {
                const { jobId, fileName } = result.data;
                return await this.waitForPDFAndDownload(jobId, fileName);
            } else {
                return {
                    success: false,
                    message: result.message || 'ไม่สามารถสร้างไฟล์ PDF ได้'
                };
            }
        } catch (error) {
            console.error('Error in generate and download PDF:', error);
            throw error;
        }
    }
}

export default new ReportTaxJournalDeductService();