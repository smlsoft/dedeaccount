import axios from 'axios';

class ReportPayableReceivableService {
    constructor() {
        // ดึงค่า API URL จาก environment variable และตรวจสอบค่า
        const apiUrl = import.meta.env.VUE_APP_API;
        console.log("API URL from env:", apiUrl);

        // ตรวจสอบและกำหนดค่า baseUrl ที่ถูกต้อง
        if (!apiUrl) {
            // กำหนดค่าเริ่มต้นในกรณีที่ไม่มีค่า env
            console.warn("API URL is not defined in environment. Using fallback URL.");
            this.baseUrl = process.env.NODE_ENV === 'development'
                ? 'http://localhost:3345/'
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
     * ดึงข้อมูลรายงานลูกหนี้ (Accounts Receivable)
     * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
     * @returns {Promise} - Promise ที่ resolve เป็นข้อมูลรายงาน
     */
    async getReceivableReport(params) {
        try {
            // สร้าง URL ด้วย method ที่สร้างขึ้น
            const url = this.createApiUrl('apireport/accounts_receivable/');

            // เพิ่ม params ทั้งหมด
            if (params) {
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null) {
                        url.searchParams.append(key, params[key]);
                    }
                });
            }

            // เพิ่ม default params ที่จำเป็น
            if (!url.searchParams.has('accountcode')) {
                url.searchParams.append('accountcode', '113010');
            }
            if (!url.searchParams.has('custcode')) {
                url.searchParams.append('custcode', '');
            }

            console.log("Fetching Receivable report from:", url.toString());
            const response = await axios.get(url.toString());
            return response.data;
        } catch (error) {
            console.error('Error fetching Receivable report:', error);
            throw error;
        }
    }

    /**
     * ดึงข้อมูลรายงานเจ้าหนี้ (Accounts Payable)
     * @param {Object} params - พารามิเตอร์สำหรับการค้นหา
     * @returns {Promise} - Promise ที่ resolve เป็นข้อมูลรายงาน
     */
    async getPayableReport(params) {
        try {
            const url = this.createApiUrl('apireport/accounts_payable/');

            // เพิ่ม params ทั้งหมด
            if (params) {
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null) {
                        url.searchParams.append(key, params[key]);
                    }
                });
            }

            // เพิ่ม default params ที่จำเป็น
            if (!url.searchParams.has('accountcode')) {
                url.searchParams.append('accountcode', '113010');
            }
            if (!url.searchParams.has('custcode')) {
                url.searchParams.append('custcode', '');
            }

            console.log("Fetching Payable report from:", url.toString());
            const response = await axios.get(url.toString());
            return response.data;
        } catch (error) {
            console.error('Error fetching Payable report:', error);
            throw error;
        }
    }

    /**
     * สร้างไฟล์ PDF รายงานลูกหนี้
     * @param {Object} params - พารามิเตอร์สำหรับการสร้าง PDF
     * @returns {Promise} - Promise ที่ resolve เป็นข้อมูลการสร้างไฟล์
     */
    async generateReceivableReportPDF(params) {
        try {
            const url = this.createApiUrl('apireport/accounts_receivable/genPDF');

            // เพิ่ม params ทั้งหมด
            if (params) {
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null) {
                        url.searchParams.append(key, params[key]);
                    }
                });
            }

            // เพิ่ม default params ที่จำเป็น
            if (!url.searchParams.has('accountcode')) {
                url.searchParams.append('accountcode', '113010');
            }
            if (!url.searchParams.has('custcode')) {
                url.searchParams.append('custcode', '');
            }
            if (!url.searchParams.has('limit')) {
                url.searchParams.append('limit', '20');
            }
            if (!url.searchParams.has('offset')) {
                url.searchParams.append('offset', '0');
            }

            console.log("Generating Receivable PDF from:", url.toString());
            const response = await axios.get(url.toString());
            return response.data;
        } catch (error) {
            console.error('Error generating Receivable report PDF:', error);
            throw error;
        }
    }

    /**
     * สร้างไฟล์ PDF รายงานเจ้าหนี้
     * @param {Object} params - พารามิเตอร์สำหรับการสร้าง PDF
     * @returns {Promise} - Promise ที่ resolve เป็นข้อมูลการสร้างไฟล์
     */
    async generatePayableReportPDF(params) {
        try {
            // แก้ไขเป็น accounts_payable (ไม่มี s)
            const url = this.createApiUrl('apireport/accounts_payable/genPDF');

            // เพิ่ม params ทั้งหมด
            if (params) {
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null) {
                        url.searchParams.append(key, params[key]);
                    }
                });
            }

            // เพิ่ม default params ที่จำเป็น
            if (!url.searchParams.has('accountcode')) {
                url.searchParams.append('accountcode', '113010');
            }
            if (!url.searchParams.has('custcode')) {
                url.searchParams.append('custcode', '');
            }
            if (!url.searchParams.has('limit')) {
                url.searchParams.append('limit', '20');
            }
            if (!url.searchParams.has('offset')) {
                url.searchParams.append('offset', '0');
            }

            console.log("Generating Payable PDF from:", url.toString());
            const response = await axios.get(url.toString());
            return response.data;
        } catch (error) {
            console.error('Error generating Payable report PDF:', error);
            throw error;
        }
    }

    /**
     * ตรวจสอบสถานะการสร้าง PDF
     * @param {string} jobId - รหัสงาน
     * @param {string} fileName - ชื่อไฟล์
     * @param {string} reportType - ประเภทรายงาน ('payable' หรือ 'receivable')
     * @returns {Promise} - Promise ที่ resolve เป็นสถานะงาน
     */
    async checkJobStatus(jobId, fileName, reportType = 'payable') {
        try {
            if (!jobId || !fileName) {
                throw new Error('Job ID and file name are required');
            }

            // แก้ไข path ให้ถูกต้อง
            const path = reportType === 'receivable'
                ? `apireport/accounts_receivable/check/${jobId}/${fileName}`
                : `apireport/accounts_payable/check/${jobId}/${fileName}`;

            const url = this.createApiUrl(path);

            console.log(`Checking ${reportType} job status:`, url.toString());
            const response = await axios.get(url.toString());
            return {
                completed: response.data.success,
                ...response.data
            };
        } catch (error) {
            console.error(`Error checking ${reportType} job status:`, error);
            throw error;
        }
    }

    /**
     * ดาวน์โหลดไฟล์ PDF รายงาน
     * @param {string} jobId - รหัสงาน PDF
     * @param {string} fileName - ชื่อไฟล์
     * @param {string} reportType - ประเภทรายงาน ('payable' หรือ 'receivable')
     */
    downloadReportPDF(jobId, fileName, reportType = 'payable') {
        if (!jobId || !fileName) {
            throw new Error('Job ID and file name are required');
        }

        try {
            // แก้ไข path ให้ถูกต้อง
            const path = reportType === 'receivable'
                ? `apireport/accounts_receivable/download/${jobId}/${fileName}`
                : `apireport/accounts_payable/download/${jobId}/${fileName}`;

            const url = this.createApiUrl(path);
            const downloadUrl = url.toString();

            console.log(`Downloading ${reportType} PDF from:`, downloadUrl);

            // เปิดหน้าต่างใหม่สำหรับดาวน์โหลด
            window.open(downloadUrl, '_blank');
        } catch (error) {
            console.error(`Error creating ${reportType} download URL:`, error);
            throw error;
        }
    }

    /**
     * รอให้ PDF ถูกสร้างเสร็จก่อนดาวน์โหลด
     * @param {string} jobId - รหัสงาน
     * @param {string} fileName - ชื่อไฟล์ PDF
     * @param {string} reportType - ประเภทรายงาน ('payable' หรือ 'receivable')
     * @param {number} maxAttempts - จำนวนครั้งสูงสุดที่จะลองตรวจสอบ
     * @param {number} interval - ช่วงเวลาระหว่างการตรวจสอบ (ms)
     * @returns {Promise} - Promise ที่ resolve เมื่อดาวน์โหลดเสร็จสิ้น
     */
    async waitForPDFAndDownload(jobId, fileName, reportType = 'payable', maxAttempts = 15, interval = 2000) {
        if (!jobId || !fileName) {
            return Promise.reject(new Error('Job ID and file name are required'));
        }

        let attempts = 0;

        return new Promise((resolve, reject) => {
            const checkJob = async () => {
                try {
                    if (attempts >= maxAttempts) {
                        reject(new Error('ไม่สามารถสร้าง PDF ได้ภายในเวลาที่กำหนด'));
                        return;
                    }

                    attempts++;
                    console.log(`Checking ${reportType} PDF status: Attempt ${attempts} of ${maxAttempts}`);
                    const status = await this.checkJobStatus(jobId, fileName, reportType);

                    if (status.completed) {
                        // เมื่อสร้าง PDF เสร็จ
                        console.log(`${reportType} PDF generation completed. Downloading...`);
                        this.downloadReportPDF(jobId, fileName, reportType);
                        resolve({ success: true, message: 'ดาวน์โหลด PDF สำเร็จ' });
                    } else if (status.message === "File needs to be regenerated" || status.message === "regenerated") {
                        // กรณีที่ไฟล์ถูกสร้างเสร็จแต่ไม่พบไฟล์ ต้องสั่งสร้างใหม่
                        console.warn(`${reportType} PDF file not found. Need to regenerate.`);
                        // ทดลองดาวน์โหลดอยู่ดี อาจมีการสร้างใหม่ในฝั่ง API แล้ว
                        this.downloadReportPDF(jobId, fileName, reportType);
                        resolve({ success: true, message: 'ดาวน์โหลด PDF ที่สร้างใหม่สำเร็จ' });
                    } else {
                        // ถ้ายังไม่เสร็จ รอแล้วลองใหม่
                        console.log(`${reportType} PDF generation in progress. Waiting...`);
                        setTimeout(checkJob, interval);
                    }
                } catch (error) {
                    console.error(`Error while checking ${reportType} job status:`, error);

                    // แม้จะมีข้อผิดพลาด ลองดาวน์โหลดดูอยู่ดี บางกรณีไฟล์อาจถูกสร้างแล้ว
                    try {
                        this.downloadReportPDF(jobId, fileName, reportType);
                        resolve({ success: true, message: 'พยายามดาวน์โหลด PDF แม้จะมีข้อผิดพลาดในการตรวจสอบสถานะ' });
                    } catch (downloadError) {
                        reject(error);
                    }
                }
            };

            // เริ่มการตรวจสอบ
            checkJob();
        });
    }
    /**
     * สร้างและดาวน์โหลด PDF รายงานลูกหนี้
     * @param {Object} params - พารามิเตอร์สำหรับการสร้าง PDF
     * @returns {Promise} - Promise ที่ resolve เมื่อเริ่มดาวน์โหลด
     */
    async generateAndDownloadReceivablePDF(params) {
        try {
            console.log("Starting Receivable PDF generation with params:", params);
            const result = await this.generateReceivableReportPDF(params);

            if (result.success) {
                const { jobId, fileName } = result.data;
                console.log(`Receivable PDF generation initiated. Job ID: ${jobId}, File: ${fileName}`);
                return await this.waitForPDFAndDownload(jobId, fileName, 'receivable');
            } else {
                console.error("Failed to generate Receivable PDF:", result.message);
                return {
                    success: false,
                    message: result.message || 'ไม่สามารถสร้างไฟล์ PDF ได้'
                };
            }
        } catch (error) {
            console.error('Error in generate and download Receivable PDF:', error);
            throw error;
        }
    }

    /**
     * สร้างและดาวน์โหลด PDF รายงานเจ้าหนี้
     * @param {Object} params - พารามิเตอร์สำหรับการสร้าง PDF
     * @returns {Promise} - Promise ที่ resolve เมื่อเริ่มดาวน์โหลด
     */
    async generateAndDownloadPayablePDF(params) {
        try {
            console.log("Starting Payable PDF generation with params:", params);
            const result = await this.generatePayableReportPDF(params);

            if (result.success) {
                const { jobId, fileName } = result.data;
                console.log(`Payable PDF generation initiated. Job ID: ${jobId}, File: ${fileName}`);
                return await this.waitForPDFAndDownload(jobId, fileName, 'payable');
            } else {
                console.error("Failed to generate Payable PDF:", result.message);
                return {
                    success: false,
                    message: result.message || 'ไม่สามารถสร้างไฟล์ PDF ได้'
                };
            }
        } catch (error) {
            console.error('Error in generate and download Payable PDF:', error);
            throw error;
        }
    }
}

export default new ReportPayableReceivableService();