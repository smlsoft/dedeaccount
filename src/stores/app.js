import { defineStore } from 'pinia'
export const useApp = defineStore("app", {

  state: () => ({
    PageTitle: "Dashboard",
    pageActive: "dashboard",
    childActive: "",
    showToggle: true,
    activeLang: localStorage.getItem('activeLang') || 'th',
  })
  ,
  actions: {
    async setPageTitle(title) {
      this.PageTitle = title;
      document.title = title + " - " + process.env.VUE_APP_TITLE;
    },
    async setActivePage(page) {
      this.pageActive = page;
    },
    async setActiveChild(page) {
      this.childActive = page;
    },
    async setActivedToggle() {
      if (this.showToggle == true) {
        this.showToggle = false;
      } else {
        this.showToggle = true;
      }
    },
    async setActiveLang(lang) {
      localStorage.setItem("activeLang", lang)
      this.activeLang = lang;

    },
  },
});
