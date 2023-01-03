<template>
  <div class="min-h-screen flex relative lg:static surface-ground">
    <div
      id="app-sidebar-4"
      class="bg-gray-900 h-screen hidden lg:block flex-shrink-0 absolute lg:static left-0 top-0 z-1 border-right-1 border-gray-800 w-18rem lg:w-5rem select-none"
    >
      <div class="flex flex-column h-full">
        <div class="mt-3 select-none">
          <ul class="list-none p-3 lg:py-3 lg:px-2 m-0">
            <li>
              <a
                v-ripple
                class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:bg-gray-800 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
              >
                <i class="pi pi-home mr-2 lg:mr-0 text-base lg:text-xl"></i>
                <span class="font-medium inline lg:hidden">Dashboard</span>
              </a>
            </li>
            <li>
              <a
                v-ripple
                class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:bg-gray-800 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
              >
                <i class="pi pi-bookmark mr-2 lg:mr-0 text-base lg:text-xl"></i>
                <span class="font-medium inline lg:hidden">Bookmarks</span>
              </a>
            </li>
            <li>
              <a
                v-ripple
                class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:bg-gray-800 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
              >
                <i class="pi pi-users mr-2 lg:mr-0 text-base lg:text-xl"></i>
                <span class="font-medium inline lg:hidden">Team</span>
              </a>
            </li>
            <li class="lg:relative">
              <a
                v-ripple
                class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:bg-gray-800 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                v-styleclass="{
                  selector: '@next',
                  enterClass: 'hidden',
                  leaveToClass: 'hidden',
                  hideOnOutsideClick: true,
                }"
              >
                <i
                  class="pi pi-chart-line mr-2 lg:mr-0 text-base lg:text-xl"
                  v-badge
                ></i>
                <span class="font-medium inline lg:hidden">Reports</span>
                <i class="pi pi-chevron-down ml-auto lg:hidden"></i>
              </a>
              <ul
                class="list-none pl-3 pr-0 py-0 lg:p-3 m-0 hidden overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out static lg:absolute left-100 top-0 z-1 bg-gray-900 border-round-right shadow-none lg:shadow-2 w-full lg:w-15rem"
              >
                <li>
                  <a
                    v-ripple
                    class="flex align-items-center cursor-pointer p-3 hover:bg-gray-800 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                    v-styleclass="{ selector: '@next', toggleClass: 'hidden' }"
                  >
                    <i class="pi pi-chart-line mr-2"></i>
                    <span class="font-medium">Revenue</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul
                    class="list-none py-0 pl-3 pr-0 m-0 hidden overflow-y-hidden transition-all transition-duration-400 transition-ease-in-out"
                  >
                    <li>
                      <a
                        v-ripple
                        class="flex align-items-center cursor-pointer p-3 hover:bg-gray-800 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                      >
                        <i class="pi pi-table mr-2"></i>
                        <span class="font-medium">View</span>
                      </a>
                    </li>
                    <li>
                      <a
                        v-ripple
                        class="flex align-items-center cursor-pointer p-3 hover:bg-gray-800 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                      >
                        <i class="pi pi-search mr-2"></i>
                        <span class="font-medium">Search</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a
                    v-ripple
                    class="flex align-items-center cursor-pointer p-3 hover:bg-gray-800 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
                  >
                    <i class="pi pi-chart-line mr-2"></i>
                    <span class="font-medium">Expenses</span>
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a
                v-ripple
                class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:bg-gray-800 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
              >
                <i class="pi pi-calendar mr-2 lg:mr-0 text-base lg:text-xl"></i>
                <span class="font-medium inline lg:hidden">Calendar</span>
              </a>
            </li>
            <li>
              <a
                v-ripple
                class="flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:bg-gray-800 border-round text-gray-300 hover:text-white transition-duration-150 transition-colors p-ripple"
              >
                <i class="pi pi-cog mr-2 lg:mr-0 text-base lg:text-xl"></i>
                <span class="font-medium inline lg:hidden">Settings</span>
              </a>
            </li>
          </ul>
        </div>
        <div class="mt-auto">
          <hr class="mb-3 mx-2 border-top-1 border-none border-gray-800" />
          <a
            v-ripple
            class="my-3 mx-2 flex align-items-center cursor-pointer p-3 lg:justify-content-center hover:bg-gray-800 border-round text-300 hover:text-0 transition-duration-150 transition-colors p-ripple"
          >
            <img
              src="images/blocks/avatars/circle/avatar-f-1.png"
              class="mr-2 lg:mr-0"
              style="width: 32px; height: 32"
            />
            <span class="font-medium inline lg:hidden">Amy Elsner</span>
          </a>
        </div>
      </div>
    </div>
    <div class="min-h-screen flex flex-column relative flex-auto">
      <div
        class="flex justify-content-between align-items-center px-5 surface-section relative lg:static border-bottom-1 surface-border"
        style="height: 60px"
      >
        <div class="flex">
          <a
            v-ripple
            class="cursor-pointer block lg:hidden text-700 mr-3 mt-1 p-ripple"
            v-styleclass="{
              selector: '#app-sidebar-4',
              enterClass: 'hidden',
              enterActiveClass: 'fadeinleft',
              leaveToClass: 'hidden',
              leaveActiveClass: 'fadeoutleft',
              hideOnOutsideClick: true,
            }"
          >
            <i class="pi pi-bars text-4xl"></i>
          </a>
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <InputText
              type="text"
              class="border-none w-10rem sm:w-20rem"
              placeholder="Search"
            />
          </span>
        </div>
        <a
          v-ripple
          class="cursor-pointer block lg:hidden text-700 p-ripple"
          v-styleclass="{
            selector: '@next',
            enterClass: 'hidden',
            enterActiveClass: 'fadein',
            leaveToClass: 'hidden',
            leaveActiveClass: 'fadeout',
            hideOnOutsideClick: true,
          }"
        >
          <i class="pi pi-ellipsis-v text-2xl"></i>
        </a>
        <ul
          class="list-none p-0 m-0 hidden lg:flex lg:align-items-center select-none lg:flex-row surface-section border-1 lg:border-none surface-border right-0 top-100 z-1 shadow-2 lg:shadow-none absolute lg:static"
        >
          <li>
            <a
              v-ripple
              class="flex p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-duration-150 transition-colors p-ripple"
            >
              <i class="pi pi-inbox text-base lg:text-2xl mr-2 lg:mr-0"></i>
              <span class="block lg:hidden font-medium">Inbox</span>
            </a>
          </li>
          <li>
            <a
              v-ripple
              class="flex p-3 lg:px-3 lg:py-2 align-items-center text-600 hover:text-900 hover:surface-100 font-medium border-round cursor-pointer transition-duration-150 transition-colors p-ripple"
            >
              <i
                class="pi pi-bell text-base lg:text-2xl mr-2 lg:mr-0"
                v-badge.danger
              ></i>
              <span class="block lg:hidden font-medium">Notifications</span>
            </a>
          </li>
          <li class="border-top-1 surface-border lg:border-top-none">
            <a
              v-ripple
              class="flex p-3 lg:px-3 lg:py-2 align-items-center hover:surface-100 font-medium border-round cursor-pointer transition-duration-150 transition-colors p-ripple"
            >
              <img
                src="images/blocks/avatars/circle/avatar-f-1.png"
                class="mr-3 lg:mr-0"
                style="width: 32px; height: 32px"
              />
              <div class="block lg:hidden">
                <div class="text-900 font-medium">Josephine Lillard</div>
                <span class="text-600 font-medium text-sm"
                  >Marketing Specialist</span
                >
              </div>
            </a>
          </li>
        </ul>
      </div>
      <div class="p-5 flex flex-column flex-auto">
        <div
          class="border-2 border-dashed surface-border border-round surface-section flex-auto"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup></script>
