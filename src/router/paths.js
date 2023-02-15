import Home from "@/pages/Home.vue";
import HomeView from "../views/HomeView.vue";

export default [
  {
    path: "/home",
    name: "home",
    meta: {
      auth: true,
    },
    component: Home,
  },
  {
    path: "/",
    name: "dashboard",
    meta: {
      auth: true,
    },
    component: () => import("../pages/Dashboard.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/AboutView.vue"),
  },
  {
    path: "/login",
    name: "login",
    meta: {
      forwordauth: true,
      guest: true,
    },
    component: () => import("../pages/Login.vue"),
  },
  {
    path: "/register",
    name: "register",
    meta: {
      forwordauth: true,
      guest: true,
    },
    component: () => import("../pages/Register.vue"),
  },
  {
    path: "/me",
    name: "profile",
    meta: {
      auth: true,
    },
    component: () => import("../pages/Profile.vue"),
  },
  {
    path: "/logout",
    name: "logout",
    component: () => import("../pages/Logout.vue"),
  },
  {
    path: "/report/trialbalance",
    name: "trialbalance",
    meta: {
      auth: true,
    },
    component: () => import("../pages/report/trial_balance.vue"),
  },
  {
    path: "/report/dailyreport",
    name: "daily_report",
    meta: {
      auth: true,
    },
    component: () => import("../pages/report/daily_report.vue"),
  },
  {
    path: "/report/ledger",
    name: "ledger",
    meta: {
      auth: true,
    },
    component: () => import("../pages/report/ledger.vue"),
  },
  {
    path: "/report/work_sheet",
    name: "work_sheet",
    meta: {
      auth: true,
    },
    component: () => import("../pages/report/work_sheet.vue"),
  },

  {
    path: "/report/chartreport",
    name: "chart_report",
    meta: {
      auth: true,
    },
    component: () => import("../pages/report/chart_report.vue"),
  },
  {
    path: "/report/balancesheet",
    name: "balance_sheet",
    meta: {
      auth: true,
    },
    component: () => import("../pages/report/balance_sheet.vue"),
  },
  {
    path: "/report/profitandloss",
    name: "profitandloss",
    meta: {
      auth: true,
    },
    component: () => import("../pages/report/profit_and_loss.vue"),
  },
  {
    path: "/chart/list",
    name: "chartList",
    meta: {
      auth: true,
    },
    component: () => import("../pages/chart/chart_list.vue"),
  },
  {
    path: "/chart/import",
    name: "importchart",
    meta: {
      auth: true,
    },
    component: () => import("../pages/chart/chart_import.vue"),
  },
  {
    path: "/chart/create",
    name: "chartCreate",
    meta: {
      auth: true,
    },
    component: () => import("../pages/chart/chart_create.vue"),
  },
  {
    path: "/chart/edit/:id",
    name: "chartEdit",
    meta: {
      auth: true,
    },
    component: () => import("../pages/chart/chart_edit.vue"),
  },
  {
    path: "/daily/list",
    name: "dailyList",
    meta: {
      auth: true,
    },
    component: () => import("../pages/daily/daily_list.vue"),
  },
  {
    path: "/daily/images_show",
    name: "daily_images_show",
    meta: {
      auth: true,
    },
    component: () => import("../pages/daily/daily_images_show.vue"),
  },
  {
    path: "/daily/images_form",
    name: "daily_images_form",
    meta: {
      auth: true,
    },
    component: () => import("../pages/daily/daily_images_form.vue"),
  },
  {
    path: "/daily/images_landing",
    name: "daily_images_landing",
    meta: {
      auth: true,
    },
    component: () => import("../pages/daily/daily_images_landing.vue"),
  },
  {
    path: "/daily/images_list",
    name: "daily_images_list",
    meta: {
      auth: true,
    },
    component: () => import("../pages/daily/daily_images_list.vue"),
  },

  {
    path: "/daily/import",
    name: "dailyImport",
    meta: {
      auth: true,
    },
    component: () => import("../pages/daily/daily_import.vue"),
  },
  {
    path: "/daily/form",
    name: "dailyForm",
    meta: {
      auth: true,
    },
    component: () => import("../pages/daily/daily_form.vue"),
  },
  {
    path: "/daily/form/:id/:mode",
    name: "dailyUpdate",
    meta: {
      auth: true,
    },
    component: () => import("../pages/daily/daily_form.vue"),
  },
  {

    path: "/remaindoc/list",
    name: "remaindocList",
    meta: {
      auth: true,
    },
    component: () => import("../pages/remaindoc/remaindoc_list.vue"),
  },
  {
    path: "/remaindoc/form",
    name: "remaindocForm",
    meta: {
      auth: true,
    },
    component: () => import("../pages/remaindoc/remaindoc_form.vue"),
  },
  {
    path: "/remaindoc/detail/:id",
    name: "remaindocDetail",
    meta: {
      auth: true,
    },
    component: () => import("../pages/remaindoc/remaindoc_detail.vue"),
  },

  {
    path: "/images_group/list",
    name: "pic_group_docref",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images_group/images_list.vue"),
  },

  {
    path: "/book/list",
    name: "bookList",
    meta: {
      auth: true,
    },
    component: () => import("../pages/book/book_list.vue"),
  },
  {
    path: "/book/create",
    name: "bookCreate",
    meta: {
      auth: true,
    },
    component: () => import("../pages/book/book_create.vue"),
  },
  {
    path: "/book/edit/:id",
    name: "bookEdit",
    meta: {
      auth: true,
    },
    component: () => import("../pages/book/book_edit.vue"),
  },
  {
    path: "/group/list",
    name: "groupList",
    meta: {
      auth: true,
    },
    component: () => import("../pages/group/group_list.vue"),
  },
  {
    path: "/group/create",
    name: "groupCreate",
    meta: {
      auth: true,
    },
    component: () => import("../pages/group/group_create.vue"),
  },
  {
    path: "/group/edit/:id",
    name: "groupEdit",
    meta: {
      auth: true,
    },
    component: () => import("../pages/group/group_edit.vue"),
  },
  {
    path: "/manual/import_chart",
    name: "manual_importchart",
    meta: {
      auth: true,
    },
    component: () => import("../pages/manual/import_chart.vue"),
  },
  {
    path: "/manual/photoanddoc",
    name: "photoanddoc",
    meta: {
      auth: true,
    },
    component: () => import("../pages/manual/photoanddoc.vue"),
  },
  {
    path: "/manual/import_daily",
    name: "manual_importdaily",
    meta: {
      auth: true,
    },
    component: () => import("../pages/manual/import_daily.vue"),
  },
  {
    path: "/health-check",
    name: "health-check",
    component: () => import("../pages/HealthCheck.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("../pages/NotFound.vue"),
  },
  {
    path: "/user/list",
    name: "user_list",
    meta: {
      auth: true,
    },
    component: () => import("../pages/user/user_list.vue"),
  },
  {
    path: "/user/create",
    name: "user_create",
    meta: {
      auth: true,
    },
    component: () => import("../pages/user/user_create.vue"),
  },
  {
    path: "/user/edit/:id",
    name: "user_edit",
    meta: {
      auth: true,
    },
    component: () => import("../pages/user/user_edit.vue"),
  },
  {
    path: "/images_group/components/zoom",
    name: "zoom",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images_group/components/zoom.vue"),
  },
  {
    path: "/document_images/components/zoom",
    name: "zoom",
    meta: {
      auth: true,
    },
    component: () => import("../pages/document_images/components/zoom.vue"),
  },
  {
    path: "/images/components/zoom",
    name: "zoom",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/components/zoom.vue"),
  },
  {
    path: "/images/components/zoomfabric",
    name: "zoomfabric",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/components/zoomFabric.vue"),
  },
  {
    path: "/accountPeriod/list",
    name: "accountPeriod",
    meta: {
      auth: true,
    },
    component: () => import("../pages/account_period/account_period_list.vue"),
  },

  {
    path: "/document_images/list",
    name: "document_images",
    meta: {
      auth: true,
    },
    component: () => import("../pages/document_images/document_list.vue"),
  },
  {
    path: "/images/job_upload",
    name: "images_job_upload",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_job_upload.vue"),
  },

  {
    path: "/images/upload_detail/:id",
    name: "images_job_upload_detail",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_job_upload_detail.vue"),
  },
  {
    path: "/images/job_approve",
    name: "images_job_approve",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_job_approve.vue"),
  },
  {
    path: "/images/approve_detail/:id",
    name: "images_job_approve_detail",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_job_approve_detail.vue"),
  },
  {
    path: "/images/components/TaskList",
    name: "TaskList",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/components/TaskList.vue"),
  },

  {
    path: "/images/job_daily",
    name: "images_job_daily",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_job_daily.vue"),
  },
  {
    path: "/images/daily_detail/:id",
    name: "images_job_daily_detail",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_job_daily_detail.vue"),
  },
  {
    path: "/images/daily_detail_view/:id/:idrandom",
    name: "images_job_daily_detail_view",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_job_daily_detail_view.vue"),
  },
  {
    path: "/daily/daily_images_job_form/:id",
    name: "daily_images_job_form",
    meta: {
      auth: true,
    },
    component: () => import("../pages/daily/daily_images_job_form.vue"),
  },
  {
    path: "/images/test",
    name: "test",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/test.vue"),
  },



];
