import axios from 'axios';

class ReportTaxVatService {
    constructor() {
        this.baseUrl = null;
        this.initialized = false;
        this.initializeBaseUrl();
    }

    initializeBaseUrl() {
        // ตรวจสอบ environment variable ทั้งแบบ Vite และ Webpack
        this.baseUrl = import.meta.env?.VUE_APP_API || process.env?.VUE_APP_API;
        
        if (this.baseUrl) {
            // เพิ่ม / ท้าย URL ถ้าไม่มี
            if (!this.baseUrl.endsWith('/')) {
                this.baseUrl += '/';
            }
            this.initialized = true;
            console.log("Base URL initialized:", this.baseUrl);
        } else {
            console.warn("VUE_APP_API is not defined in environment variables");
            this.initialized = false;
            
            // ใช้ค่า fallback ในกรณีที่ไม่มี env variable (เฉพาะ development)
            if (import.meta.env?.MODE === 'development' || process.env?.NODE_ENV === 'development') {
                this.baseUrl = 'https://api.dev.dedepos.com/';
                this.initialized = true;
                console.warn("Using fallback URL for development:", this.baseUrl);
            }
        }
    }

    checkInitialization() {
        if (!this.initialized || !this.baseUrl) {
            throw new Error("VUE_APP_API is not defined in environment variables. Please check your .env file.");
        }
    }

    // ดึงข้อมูลรายงานภาษี VAT
    async getVatReport(params) {
        this.checkInitialization();
        
        try {
            const response = await axios.get(`${this.baseUrl}apireport/journalvat/`, {
                params: params,
                headers: {
                    Authorization: `Bearer ${localStorage._token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching VAT report:', error);
            throw error;
        }
    }

    // สร้าง PDF รายงานภาษี VAT
    async generateVatReportPDF(params) {
        this.checkInitialization();
        
        try {
            const response = await axios.get(`${this.baseUrl}apireport/journalvat/genPDF`, {
                params: params,
                headers: {
                    Authorization: `Bearer ${localStorage._token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error generating VAT report PDF:', error);
            throw error;
        }
    }

    // ตรวจสอบสถานะการสร้าง PDF
    async checkJobStatus(jobId, fileName) {
        this.checkInitialization();
        
        try {
            if (!jobId || !fileName) {
                throw new Error('Job ID and file name are required');
            }

            const response = await axios.get(`${this.baseUrl}apireport/journalvat/check/${jobId}/${fileName}`, {
                headers: {
                    Authorization: `Bearer ${localStorage._token}`,
                },
                timeout: 15000 // 15 วินาที
            });

            return {
                completed: response.data.success,
                ...response.data
            };
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.warn('Request timeout, server might be processing. Will retry.');
                return { completed: false, message: "PDF generation in progress (timeout)" };
            }

            if (error.response && error.response.status === 500) {
                console.warn('Server error (500), assuming PDF is still processing');
                return { completed: false, message: "PDF generation in progress (server busy)" };
            }

            console.error('Error checking job status:', error);
            throw error;
        }
    }

    // ดาวน์โหลดไฟล์ PDF รายงานภาษี
    downloadVatReportPDF(jobId, fileName) {
        this.checkInitialization();
        
        if (!jobId || !fileName) {
            throw new Error('Job ID and file name are required');
        }

        try {
            const downloadUrl = `${this.baseUrl}apireport/journalvat/download/${jobId}/${fileName}`;
            console.log("Downloading PDF from:", downloadUrl);
            window.open(downloadUrl, '_blank');
        } catch (error) {
            console.error('Error creating download URL:', error);
            throw error;
        }
    }

    // รอให้ PDF ถูกสร้างเสร็จก่อนดาวน์โหลด
    async waitForPDFAndDownload(jobId, fileName, maxAttempts = 20, interval = 3000) {
        this.checkInitialization();
        
        if (!jobId || !fileName) {
            return Promise.reject(new Error('Job ID and file name are required'));
        }

        let attempts = 0;
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
                            console.log("PDF generation completed. Downloading...");
                            this.downloadVatReportPDF(jobId, fileName);
                            resolve({ success: true, message: 'ดาวน์โหลด PDF สำเร็จ' });
                        } else if (status.message === "regenerated") {
                            console.warn("PDF file not found. Need to regenerate.");
                            reject(new Error('ไม่พบไฟล์ PDF กรุณาลองใหม่อีกครั้ง'));
                        } else {
                            console.log("PDF generation in progress. Waiting...");

                            if (status.message && (status.message.includes('timeout') || status.message.includes('server busy'))) {
                                currentInterval = Math.min(currentInterval * 1.5, 10000);
                            }

                            setTimeout(checkJob, currentInterval);
                        }
                    } catch (error) {
                        console.error("Error during status check:", error.message);

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
                        currentInterval = Math.min(currentInterval * 1.5, 10000);
                        setTimeout(checkJob, currentInterval);
                    } else {
                        reject(generalError);
                    }
                }
            };

            checkJob();
        });
    }
}

export default new ReportTaxVatService();