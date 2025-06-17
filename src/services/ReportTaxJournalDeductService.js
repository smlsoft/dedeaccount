import axios from 'axios';

class ReportTaxJournalDeductService {
    constructor() {
        // ดึงค่า API URL จาก environment variable และตรวจสอบค่า
        const apiUrl = import.meta.env.VUE_APP_API;
        console.log("API URL from env:", apiUrl);

        // ตรวจสอบและกำหนดค่า baseUrl ที่ถูกต้อง
        if (!apiUrl) {
            // กำหนดค่าเริ่มต้นในกรณีที่ไม่มีค่า env
            console.warn("API URL is not defined in environment. Using fallback URL.");
            this.baseUrl = process.env.NODE_ENV === 'development'
                ? 'https://api.dev.dedepos.com/'
                : 'https://api.dedepos.com/';
        } else {
            this.baseUrl = apiUrl;
            // เพิ่ม / ท้าย URL ถ้าไม่มี
            if (!this.baseUrl.endsWith('/')) {
                this.baseUrl += '/';
            }
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
            const url = this.createApiUrl('apireport/journaltaxdeduct/');

            // เพิ่ม params ทั้งหมด
            if (params) {
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null) {
                        url.searchParams.append(key, params[key]);
                    }
                });
            }

            console.log("Fetching tax report from:", url.toString());
            const response = await axios.get(url.toString(), {
                timeout: 30000 // 30 วินาที
            });
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
            const url = this.createApiUrl('apireport/journaltaxdeduct/genPDF');

            // เพิ่ม params ทั้งหมด
            if (params) {
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null) {
                        url.searchParams.append(key, params[key]);
                    }
                });
            }

            console.log("Generating PDF from:", url.toString());
            const response = await axios.get(url.toString(), {
                timeout: 30000 // 30 วินาที
            });
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

            const url = this.createApiUrl(`apireport/journaltaxdeduct/check/${jobId}/${fileName}`);

            console.log("Checking job status:", url.toString());

            // เพิ่ม timeout สำหรับการตรวจสอบสถานะงาน
            const response = await axios.get(url.toString(), {
                timeout: 15000 // 15 วินาที
            });

            return {
                completed: response.data.success,
                ...response.data
            };
        } catch (error) {
            // จัดการกรณี timeout หรือ server error
            if (error.code === 'ECONNABORTED') {
                console.warn('Request timeout, server might be processing. Will retry.');
                return { completed: false, message: "PDF generation in progress (timeout)" };
            }

            // กรณี server error (500)
            if (error.response && error.response.status === 500) {
                console.warn('Server error (500), assuming PDF is still processing');
                return { completed: false, message: "PDF generation in progress (server busy)" };
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
            const url = this.createApiUrl(`apireport/journaltaxdeduct/download/${jobId}/${fileName}`);
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
     * @param {number} maxAttempts - จำนวนครั้งสูงสุดที่จะลองตรวจสอบ
     * @param {number} interval - ช่วงเวลาระหว่างการตรวจสอบ (ms)
     * @returns {Promise} - Promise ที่ resolve เมื่อดาวน์โหลดเสร็จสิ้น
     */
    async waitForPDFAndDownload(jobId, fileName, maxAttempts = 20, interval = 3000) {
        if (!jobId || !fileName) {
            return Promise.reject(new Error('Job ID and file name are required'));
        }

        console.log(`เริ่มตรวจสอบ PDF: jobId=${jobId}, fileName=${fileName}`);

        let attempts = 0;
        // ตัวแปรสำหรับเพิ่มเวลารอแบบเลื่อนตัว (exponential backoff)
        let currentInterval = interval;

        return new Promise((resolve, reject) => {
            const checkJob = async () => {
                try {
                    if (attempts >= maxAttempts) {
                        reject(new Error('ไม่สามารถสร้าง PDF ได้ภายในเวลาที่กำหนด'));
                        return;
                    }

                    attempts++;
                    console.log(`Checking PDF status: Attempt ${attempts} of ${maxAttempts} (interval: ${currentInterval}ms)`);

                    try {
                        const status = await this.checkJobStatus(jobId, fileName);

                        if (status.completed) {
                            // เมื่อสร้าง PDF เสร็จ
                            console.log("PDF generation completed. Downloading...");
                            this.downloadTaxReportPDF(jobId, fileName);
                            resolve({ success: true, message: 'ดาวน์โหลด PDF สำเร็จ' });
                        } else if (status.message === "File needs to be regenerated" || status.message === "regenerated") {
                            // กรณีที่ไฟล์ถูกสร้างเสร็จแต่ไม่พบไฟล์ ต้องสั่งสร้างใหม่
                            console.warn("PDF file not found. Need to regenerate.");
                            reject(new Error('ไม่พบไฟล์ PDF กรุณาลองใหม่อีกครั้ง'));
                        } else {
                            // ถ้ายังไม่เสร็จ รอแล้วลองใหม่
                            console.log("PDF generation in progress. Waiting...");

                            // ถ้าเป็น server error หรือ timeout ให้เพิ่มเวลารอ
                            if (status.message && (status.message.includes('timeout') || status.message.includes('server busy'))) {
                                currentInterval = Math.min(currentInterval * 1.5, 10000); // เพิ่มเวลารอแต่ไม่เกิน 10 วินาที
                            }

                            setTimeout(checkJob, currentInterval);
                        }
                    } catch (error) {
                        console.error("Error during status check:", error.message);

                        // เพิ่มเวลารอเมื่อเกิดข้อผิดพลาด
                        currentInterval = Math.min(currentInterval * 1.5, 10000);

                        if (attempts < maxAttempts) {
                            console.log(`Will retry in ${currentInterval}ms...`);
                            setTimeout(checkJob, currentInterval);
                        } else {
                            reject(error);
                        }
                    }
                } catch (generalError) {
                    console.error("General error while checking job status:", generalError);

                    if (attempts < maxAttempts) {
                        // ลองใหม่ในกรณีข้อผิดพลาดทั่วไป
                        currentInterval = Math.min(currentInterval * 1.5, 10000);
                        setTimeout(checkJob, currentInterval);
                    } else {
                        reject(generalError);
                    }
                }
            };

            // เริ่มการตรวจสอบ
            checkJob();
        });
    }

    /**
     * สร้างและดาวน์โหลด PDF รายงานภาษี
     * @param {Object} params - พารามิเตอร์สำหรับการสร้าง PDF
     * @returns {Promise} - Promise ที่ resolve เมื่อเริ่มดาวน์โหลด
     */
    async generateAndDownloadPDF(params) {
        try {
            console.log("Starting PDF generation with params:", params);

            // เพิ่ม retry logic สำหรับการสร้าง PDF
            let retryCount = 0;
            const maxRetries = 3;
            let result;

            while (retryCount < maxRetries) {
                try {
                    result = await this.generateTaxReportPDF(params);
                    break; // ถ้าสำเร็จให้ออกจาก loop
                } catch (error) {
                    retryCount++;
                    console.warn(`Error generating PDF, attempt ${retryCount} of ${maxRetries}:`, error.message);

                    if (retryCount >= maxRetries) {
                        throw error; // โยนข้อผิดพลาดหลังจากลองครบตามจำนวนที่กำหนด
                    }

                    // รอสักครู่ก่อนลองใหม่
                    await new Promise(resolve => setTimeout(resolve, 3000 * retryCount));
                }
            }

            if (result && result.success) {
                const { jobId, fileName } = result.data;
                console.log(`PDF generation initiated. Job ID: ${jobId}, File: ${fileName}`);

                // สร้างการทำงานแบบ race condition ระหว่างการรอ PDF และ timeout
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('PDF generation timeout after 3 minutes')), 180000);
                });

                return await Promise.race([
                    this.waitForPDFAndDownload(jobId, fileName),
                    timeoutPromise
                ]);
            } else {
                console.error("Failed to generate PDF:", result ? result.message : "No result");
                return {
                    success: false,
                    message: result && result.message ? result.message : 'ไม่สามารถสร้างไฟล์ PDF ได้'
                };
            }
        } catch (error) {
            console.error('Error in generate and download PDF:', error);
            throw error;
        }
    }
}

export default new ReportTaxJournalDeductService();