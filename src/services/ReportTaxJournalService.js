import axios from 'axios';

class ReportTaxJournalService {
    constructor() {
        // ดึงค่า API URL จาก environment variable และตรวจสอบค่า
        const reportApiUrl = process.env.VUE_APP_API_REPORT;
        const apiUrl = process.env.VUE_APP_API;
        
        console.log("Report API URL from env:", reportApiUrl);
        console.log("Main API URL from env:", apiUrl);

        // ใช้ Report API URL เป็นหลัก ถ้าไม่มีใช้ Main API URL
        this.baseUrl = reportApiUrl || apiUrl || 'https://api.dedepos.com/';
        
        // เพิ่ม / ท้าย URL ถ้าไม่มี
        if (!this.baseUrl.endsWith('/')) {
            this.baseUrl += '/';
        }

        console.log("Base URL initialized:", this.baseUrl);
    }

    /**
     * สร้าง URL ที่ถูกต้องสำหรับการเรียก API
     * @param {string} path - เส้นทาง API
     * @returns {URL} - URL object ที่สร้างขึ้น
     */
    createApiUrl(path) {
        // ตรวจสอบว่ามีการกำหนด baseUrl หรือไม่
        if (!this.baseUrl) {
            console.error("Base URL is not initialized");
            throw new Error("API URL is not properly configured");
        }

        try {
            // ลบ / ด้านหน้าของ path ถ้ามี
            if (path.startsWith('/')) {
                path = path.substring(1);
            }

            // สร้าง URL เต็มรูปแบบ
            const fullUrl = `${this.baseUrl}${path}`;
            console.log("Creating API URL:", fullUrl);

            return new URL(fullUrl);
        } catch (error) {
            console.error("Failed to create URL:", error, "Path:", path, "Base URL:", this.baseUrl);
            throw new Error(`Invalid URL construction: ${error.message}`);
        }
    }

    /**
     * ดึงข้อมูลรายงานภาษีหัก ณ ที่จ่าย
     * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
     * @returns {Promise} - Promise ที่ resolve เป็นข้อมูลรายงาน
     */
    async getTaxReport(params) {
        try {
            // สร้าง URL ด้วย method ที่สร้างขึ้น
            const url = this.createApiUrl('apireport/journaltax/');

            // เพิ่ม params ทั้งหมด
            if (params) {
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null) {
                        url.searchParams.append(key, params[key]);
                    }
                });
            }

            console.log("Fetching tax report from:", url.toString());
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
            const url = this.createApiUrl('apireport/journaltax/genPDF');

            // เพิ่ม params ทั้งหมด
            if (params) {
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null) {
                        url.searchParams.append(key, params[key]);
                    }
                });
            }

            console.log("Generating PDF from:", url.toString());
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
            if (!jobId || !fileName) {
                throw new Error('Job ID and file name are required');
            }

            const url = this.createApiUrl(`apireport/journaltax/check/${jobId}/${fileName}`);

            console.log("Checking job status:", url.toString());

            // เพิ่ม timeout และ retry options
            const response = await axios.get(url.toString(), {
                timeout: 10000, // 10 วินาที
                retry: 3,
                retryDelay: 1000,
                retryCondition: (error) => {
                    return error.code === 'ECONNABORTED' ||
                        (error.response && error.response.status >= 500);
                }
            });

            return {
                completed: response.data.success,
                ...response.data
            };
        } catch (error) {
            // จัดการ error เฉพาะ timeout
            if (error.code === 'ECONNABORTED') {
                console.warn('Request timeout, server might be processing. Will retry.');
                return { completed: false, message: "PDF generation in progress (timeout)" };
            }

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
        if (!jobId || !fileName) {
            throw new Error('Job ID and file name are required');
        }

        try {
            const url = this.createApiUrl(`apireport/journaltax/download/${jobId}/${fileName}`);
            const downloadUrl = url.toString();

            console.log("Downloading PDF from:", downloadUrl);

            // เปิดหน้าต่างใหม่สำหรับดาวน์โหลด
            window.open(downloadUrl, '_blank');
        } catch (error) {
            console.error('Error creating download URL:', error);
            throw error;
        }
    }

    /**
     * รอให้ PDF ถูกสร้างเสร็จก่อนดาวน์โหลด
     * @param {string} jobId - รหัสงาน
     * @param {string} fileName - ชื่อไฟล์ PDF
     * @param {number} maxAttempts - จำนวนครั้งสูงสุดที่จะลองตรวจสอบ (default: 15)
     * @param {number} interval - ช่วงเวลาระหว่างการตรวจสอบในมิลลิวินาที (default: 2000)
     * @returns {Promise} - Promise ที่ resolve เมื่อดาวน์โหลดเสร็จสิ้น
     */
    async waitForPDFAndDownload(jobId, fileName, maxAttempts = 20, interval = 3000) {
        // เพิ่มจำนวนครั้งการลองและระยะเวลารอ
        if (!jobId || !fileName) {
            return Promise.reject(new Error('Job ID and file name are required'));
        }
        console.log(`เริ่มตรวจสอบ PDF: jobId=${jobId}, fileName=${fileName}`);

        let attempts = 0;

        return new Promise((resolve, reject) => {
            const checkJob = async () => {
                try {
                    if (attempts >= maxAttempts) {
                        reject(new Error('ไม่สามารถสร้าง PDF ได้ภายในเวลาที่กำหนด'));
                        return;
                    }

                    attempts++;
                    console.log(`Checking PDF status: Attempt ${attempts} of ${maxAttempts}`);

                    try {
                        const status = await this.checkJobStatus(jobId, fileName);

                        if (status.completed) {
                            // เมื่อสร้าง PDF เสร็จ
                            console.log("PDF generation completed. Downloading...");
                            this.downloadTaxReportPDF(jobId, fileName);
                            resolve({ success: true, message: 'ดาวน์โหลด PDF สำเร็จ' });
                        } else if (status.message === "regenerated") {
                            // กรณีที่ไฟล์ถูกสร้างเสร็จแต่ไม่พบไฟล์ ต้องสั่งสร้างใหม่
                            console.warn("PDF file not found. Need to regenerate.");
                            reject(new Error('ไม่พบไฟล์ PDF กรุณาลองใหม่อีกครั้ง'));
                        } else {
                            // ถ้ายังไม่เสร็จ รอแล้วลองใหม่
                            console.log("PDF generation in progress. Waiting...");
                            setTimeout(checkJob, interval);
                        }
                    } catch (error) {
                        console.error("Error during status check:", error.message);

                        // เพิ่มการตรวจสอบว่าเป็น error 500 หรือไม่
                        if (error.response && error.response.status === 500) {
                            console.log(`Server error (500), waiting longer before retry (attempt ${attempts})...`);
                            // เพิ่มเวลารอมากขึ้นเมื่อเกิด error 500
                            setTimeout(checkJob, interval * 2);
                        } else {
                            // ลองใหม่ตามปกติสำหรับข้อผิดพลาดอื่นๆ
                            setTimeout(checkJob, interval);
                        }
                    }
                } catch (generalError) {
                    console.error("General error while checking job status:", generalError);
                    // ลองใหม่แม้เกิดข้อผิดพลาดทั่วไป
                    setTimeout(checkJob, interval);
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
            console.log("Starting PDF generation with params:", params);
            const result = await this.generateTaxReportPDF(params);

            if (result.success) {
                const { jobId, fileName } = result.data;
                console.log(`PDF generation initiated. Job ID: ${jobId}, File: ${fileName}`);
                return await this.waitForPDFAndDownload(jobId, fileName);
            } else {
                console.error("Failed to generate PDF:", result.message);
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

export default new ReportTaxJournalService();