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
    path: "/daily/form/:id",
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
    path: "/images/gallery",
    name: "image_gallery",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_gallery.vue"),
  },
  {
    path: "/images/list",
    name: "list_images",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_list.vue"),
  },
  {
    path: "/images/list/:id",
    name: "list_images_param",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_list.vue"),
  },
  {
    path: "/images/detail/:id",
    name: "imagesDetail",
    meta: {
      auth: true,
    },
    component: () => import("../pages/images/images_detail.vue"),
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
];
