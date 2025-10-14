export const menus = [




  {
    title: "หน้าหลัก",
    name: "dashboard",
    icon: "pi pi-home",
    to: "/",
    children: [],
  },

  {
    title: "อัพโหลดเอกสาร",
    name: "images_job_upload",
    icon: "pi pi-upload",
    to: "/images/job_upload",
    children: [],
  },


  {
    title: "ตรวจสอบเอกสาร",
    name: "images_job_approve",
    icon: "pi pi-check-circle",
    to: "/images/job_approve",
    children: [],
  },

  {
    title: "บันทึกรายการ Statement",
    name: "statement_upload",
    icon: "pi pi-file-pdf",
    to: "/statement/statement_upload",
    children: [],
  },

  // // แบบ2
  // {
  //   title: "คลังรูปภาพเอกสาร",
  //   icon: "pi pi-inbox",
  //   to: "/document_images/list",
  //   name: "document_images",
  //   children: [],
  // },
  // // แบบ1
  // {
  //   title: "คลังรูปภาพ",
  //   icon: "pi pi-image",
  //   to: "/images_group/list",
  //   name: "pic_group_docref",
  //   children: [],
  // },

  /*
    {
      title: "ผังบัญชี",
      icon: "pi pi-microsoft",
      to: "/chart/list",
      name: "chart_list",
      children: [],
    },
    {
      title: "นำเข้าผังบัญชี",
      icon: "pi pi-upload",
      to: "/chart/import",
      name: "import_chart",
      children: [],
    },
    {
      title: "สมุดรายวัน",
      icon: "pi pi-book",
      to: "/book/list",
      name: "book_list",
      children: [],
    },
    {
      title: "กลุ่มบัญชี",
      icon: "pi pi-sitemap",
      to: "/group/list",
      name: "group_list",
      children: [],
    },
    */

  {
    title: "รายการบัญชี",
    icon: "pi pi-list",
    to: "",
    name: "daily",
    children: [
      {
        title: "บันทึกรายการบัญชี",
        icon: "pi pi-file",
        to: "/daily/list",
        name: "daily_list",
      },
      {
        title: "บันทึกรายวันจากรูป",
        icon: "pi pi-images",
        to: "/images/job_daily",
        name: "images_job_daily",
      },
      // {
      //   title: "บันทึกรายได้อื่น ๆ",
      //   icon: "pi pi-plus-circle",
      //   to: "/income/income_list",
      //   name: "income_list",
      // },
      // {
      //   title: "บันทึกค่าใช้จ่ายอื่น ๆ",
      //   icon: "pi pi-minus-circle",
      //   to: "/expenses/expenses_list",
      //   name: "expenses_list",
      // },

      {
        title: "นำเข้าข้อมูลรายวัน",
        icon: "pi pi-file-import",
        to: "/daily/import",
        name: "daily_import",
      },

      // {
      //   title: "บันทึกรายวันจากรูป",
      //   icon: "pi pi-images",
      //   to: "/daily/images_landing",
      //   name: "daily_images_list",
      // },
      // {
      //   title: "บันทึกรายวันจากรูป",
      //   icon: "pi pi-images",
      //   to: "/daily/images_landing",
      //   name: "daily_images_group_list",
      // },
    ],
  },


  {
    title: "รายงาน การเงิน",
    icon: "pi pi-chart-bar",
    to: "",
    name: "report_list",
    children: [
      {
        title: "งบทดลอง",
        icon: "pi pi-chart-line",
        name: "report_trialbalance",
        to: "/report/trialbalance",
      },
      {
        title: "งบกำไรขาดทุน",
        icon: "pi pi-chart-line",
        name: "report_profitandloss",
        to: "/report/profitandloss",
      },
      {
        title: "งบกำไรขาดทุน 12 เดือน",
        icon: "pi pi-chart-line",
        name: "report_journal12columns",
        to: "/report/report_journal12columns",
      },
      {
        title: "งบแสดงฐานะทางการเงิน",
        icon: "pi pi-chart-line",
        name: "report_balancesheet",
        to: "/report/balancesheet",
      },
      {
        title: "บัญชีแยกประเภท",
        icon: "pi pi-chart-line",
        name: "ledger",
        to: "/report/ledger",
      },
      {
        title: "รายงานการบันทึกบัญชี",
        icon: "pi pi-chart-line",
        name: "daily_report",
        to: "/report/dailyreport",
      },
      {
        title: "รายงานรหัสบัญชี",
        icon: "pi pi-chart-line",
        name: "chart_report",
        to: "/report/chartreport",
      },
      {
        title: "รายงานสถานะเจ้าหนี้",
        icon: "pi pi-chart-line",
        name: "payable_report",
        to: "/report/payable_report",
      },
      {
        title: "รายงานสถานะลูกหนี้",
        icon: "pi pi-chart-line",
        name: "receivable_report",
        to: "/report/receivable_report",
      },


    ],
  },

  {
    title: "รายงาน ภาษี",
    icon: "pi pi-file-o",
    to: "",
    name: "report_tax_list",
    children: [
      {
        title: "รายงานภาษีซื้อ",
        icon: "pi pi-file-o",
        name: "report_tax_purchase",
        to: "/report/tax_purchase",
      },
      {
        title: "รายงานภาษีขาย",
        icon: "pi pi-file-o",
        name: "report_tax_sale",
        to: "/report/tax_sale",

      },
      {
        title: "ภาษีหัก ณ ที่จ่าย(ภ.ง.ด.3)",
        icon: "pi pi-file-o",
        name: "report_tax_journal3",
        to: "/report/tax_journal3",
      },
      {
        title: "ภาษีหัก ณ ที่จ่าย(ภ.ง.ด.53)",
        icon: "pi pi-file-o",
        name: "report_tax_journal53",
        to: "/report/tax_journal53",
      },
      {
        title: "ภาษีถูกหัก ณ ที่จ่าย",
        icon: "pi pi-file-o",
        name: "report_tax_journal_deduct",
        to: "/report/tax_journal_deduct"
      }


    ],
  },



  // //แบบใหม่
  // {
  //   title: "กำหนดค่า",
  //   icon: "pi pi-cog",
  //   to: "",
  //   name: "master",
  //   children: [

  //     {
  //       title: "กำหนดสมุดรายวันขึ้นต้น",
  //       icon: "pi pi-cog",
  //       to: "/setting/account_book/main",
  //       name: "account_book",
  //     },
  //     {
  //       title: "กำหนดชุดบัญชีที่ใช้งาน",
  //       icon: "pi pi-cog",
  //       to: "/setting/account_group/main",
  //       name: "account_group",
  //     },
  //     {
  //       title: "กำหนดงวดบัญชี",
  //       icon: "pi pi-cog",
  //       to: "/setting/account_period/main",
  //       name: "account_period",
  //     },

  //   ],
  // },



  // แบบเก่า
  {
    title: "กำหนดค่า",
    icon: "pi pi-cog",
    to: "",
    name: "master",
    children: [
      {
        title: "ตั้งค่ากิจการ",
        icon: "pi pi-building",
        to: "/setting/shop_profile",
        name: "shop_profile",
      },
      {
        title: "กำหนดรหัสบัญชี",
        icon: "pi pi-microsoft",
        to: "/chart/list",
        name: "chart_list",
      },
      {
        title: "นำเข้ารหัสบัญชี",
        icon: "pi pi-upload",
        to: "/chart/import",
        name: "import_chart",
      },
      // {
      //   title: "กำหนดสมุดรายวันขึ้นต้น",
      //   icon: "pi pi-book",
      //   to: "/book/list",
      //   name: "book_list",
      // },
      // {
      //   title: "กำหนดชุดบัญชีที่ใช้งาน",
      //   icon: "pi pi-sitemap",
      //   to: "/group/list",
      //   name: "group_list",
      // },
      {
        title: "กำหนดสมุดรายวันขึ้นต้น",
        icon: "pi pi-cog",
        to: "/setting/account_book/main",
        name: "account_book",
      },
      {
        title: "กำหนดชุดบัญชีที่ใช้งาน",
        icon: "pi pi-cog",
        to: "/setting/account_group/main",
        name: "account_group",
      },
      {
        title: "กำหนดลูกหนี้",
        icon: "pi pi-user",
        to: "/setting/account_debtor/main",
        name: "account_debtor",
      },
      {
        title: "กำหนดเจ้าหนี้",
        icon: "pi pi-user",
        to: "/setting/account_creditor/main",
        name: "account_creditor",
      },
      {
        title: "กำหนดงวดบัญชี",
        icon: "pi pi-link",
        to: "/account_period/list",
        name: "account_period",
      },
      {
        title: "กำหนดรูปแบบการบันทึกบัญชี",
        icon: "pi pi-link",
        to: "/setting/document_format/main",
        name: "document_format",
      },
      {
        title: "กำหนดรายได้อื่น ๆ ",
        icon: "pi pi-plus-circle",
        to: "/setting/income/main",
        name: "income",
      },
      {
        title: "กำหนดค่าใช้จ่ายอื่น ๆ",
        icon: "pi pi-minus-circle",
        to: "/setting/expenses/main",
        name: "expenses",
      },
    ],
  },



  // {
  //   title: "แนะนำการใช้งาน",
  //   icon: "pi pi-exclamation-circle",
  //   to: "",
  //   name: "manual_list",
  //   children: [
  //     {
  //       title: "วิธีใช้งานรูปภาพและเอกสาร",
  //       icon: "pi pi-exclamation-circle",
  //       name: "photoanddoc",
  //       to: "/manual/photoanddoc",
  //     },
  //     {
  //       title: "วิธีนำเข้าผังบัญชี",
  //       icon: "pi pi-exclamation-circle",
  //       name: "manual_chart",
  //       to: "/manual/import_chart",
  //     },
  //     {
  //       title: "วิธีนำเข้ารายการบัญชี",
  //       icon: "pi pi-exclamation-circle",
  //       name: "manual_daily",
  //       to: "/manual/import_daily",
  //     },

  //   ],
  // },

  // {
  //   title: "Logout",
  //   icon: "pi pi-lock",
  //   to: "/logout",
  //   children: [],
  // },
  {
    title: "กำหนดผู้ใช้งาน",
    icon: "pi pi-user",
    to: "/user/list",
    name: "user_list",
    children: [


    ],
  },
];
