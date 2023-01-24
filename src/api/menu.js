export const menus = [
  {
    title: "หน้าหลัก",
    name: "dashboard",
    icon: "pi pi-home",
    to: "/",
    children: [],
  },

  {
    title: "รูปภาพเอกสาร",
    icon: "pi pi-image",
    to: "/images/list",
    name: "pic_group",
    children: [
      {
        title: "อัพโหลดรูปเอกสาร",
        icon: "pi pi-upload",
        to: "/images/job",
        name: "images_job",
      },
      {
        title: "ตรวจสอบรูปภาพ",
        icon: "pi pi-check-circle",
        to: "/images/job_approve",
        name: "images_job_approve",
      },


    ],
  },

  {
    title: "คลังเอกสาร",
    icon: "pi pi-inbox",
    to: "/document_images/list",
    name: "document_images",
    children: [],
  },
  {
    title: "คลังรูปภาพ",
    icon: "pi pi-image",
    to: "/images_group/list",
    name: "pic_group_docref",
    children: [],
  },

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
        title: "นำเข้าข้อมูลรายวัน",
        icon: "pi pi-file",
        to: "/daily/import",
        name: "daily_import",
      },
      // {
      //   title: "บันทึกรายวันจากรูป",
      //   icon: "pi pi-images",
      //   to: "/daily/images_landing",
      //   name: "daily_images_list",
      // },
      {
        title: "บันทึกรายวันจากรูป",
        icon: "pi pi-images",
        to: "/daily/images_landing",
        name: "daily_images_group_list",
      }
    ],
  },


  {
    title: "รายงานทางการเงิน",
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

    ],
  },

  /*
  {
    title: "ข้อมูลรายวัน",
    icon: "pi pi-file",
    to: "/daily/list",
    name: "daily_list",
    children: [],
  },
  {
    title: "นำเข้าข้อมูลรายวัน",
    icon: "pi pi-file",
    to: "/daily/import",
    name: "daily_import",
    children: [],
  },
  */




  {
    title: "กำหนดค่า",
    icon: "pi pi-cog",
    to: "",
    name: "master",
    children: [
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
      {
        title: "กำหนดสมุดรายวันขึ้นต้น",
        icon: "pi pi-book",
        to: "/book/list",
        name: "book_list",
      },
      {
        title: "กำหนดชุดบัญชีที่ใช้งาน",
        icon: "pi pi-sitemap",
        to: "/group/list",
        name: "group_list",
      },
      {
        title: "กำหนดงวดบัญชี",
        icon: "pi pi-link",
        to: "/accountPeriod/list",
        name: "accountPeriod",
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
