import { defineStore } from 'pinia'

export const useDailyList = defineStore('dailyList', {
  state: () => ({
    // Pagination
    activePage: 1,
    firstPage: 0,
    limitPage: 20,
    
    // Sorting
    sortField: 'docdate',
    sortOrder: -1,
    
    // Filters
    filtersByDocNo: null,
    filtersByDocDate: null,
    sendFiltersByDocDate: null,
    filtersByAccYear: null,
    filtersByAccPeriod: null,
    filtersByDebtorName: null,
    filtersByDescription: null,
    filtersByDocformat: null,
    filtersByAppname: null,
    filtersByJobguidfixed: null,
    filtersByAmount: null,
    filtersByCreateDate: null,
    sendFiltersByCreateDate: null,
    filtersByCreateBy: null,
    
    // UI State
    showfilters: false,
    expandedRows: [],
  }),
  
  actions: {
    // Reset all filters
    resetFilters() {
      this.filtersByDocNo = null
      this.filtersByDocDate = null
      this.sendFiltersByDocDate = null
      this.filtersByAccYear = null
      this.filtersByAccPeriod = null
      this.filtersByDebtorName = null
      this.filtersByDescription = null
      this.filtersByDocformat = null
      this.filtersByAppname = null
      this.filtersByJobguidfixed = null
      this.filtersByAmount = null
      this.filtersByCreateDate = null
      this.sendFiltersByCreateDate = null
      this.filtersByCreateBy = null
    },
    
    // Reset pagination to first page
    resetPagination() {
      this.activePage = 1
      this.firstPage = 0
    },
    
    // Set page
    setPage(page, first) {
      this.activePage = page
      this.firstPage = first
    },
    
    // Set limit per page
    setLimit(limit) {
      this.limitPage = limit
    },
    
    // Set sorting
    setSort(field, order) {
      this.sortField = field
      this.sortOrder = order
    },
    
    // Clear specific filter
    clearFilter(key) {
      if (key === 'docno') {
        this.filtersByDocNo = null
      } else if (key === 'docdate') {
        this.filtersByDocDate = null
        this.sendFiltersByDocDate = null
      } else if (key === 'accountyear') {
        this.filtersByAccYear = null
      } else if (key === 'accountperiod') {
        this.filtersByAccPeriod = null
      } else if (key === 'debtorname') {
        this.filtersByDebtorName = null
      } else if (key === 'description') {
        this.filtersByDescription = null
      } else if (key === 'docformat') {
        this.filtersByDocformat = null
      } else if (key === 'appname') {
        this.filtersByAppname = null
      } else if (key === 'jobguidfixed') {
        this.filtersByJobguidfixed = null
      } else if (key === 'amount') {
        this.filtersByAmount = null
      } else if (key === 'createdate') {
        this.filtersByCreateDate = null
        this.sendFiltersByCreateDate = null
      } else if (key === 'createby') {
        this.filtersByCreateBy = null
      }
    },
    
    // Toggle filters display
    toggleFilters(show) {
      this.showfilters = show
    },
    
    // Close filters and reset
    closeFilters() {
      this.showfilters = false
      this.resetFilters()
    },
  },
})
