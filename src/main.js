import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'
import ToastService from 'primevue/toastservice';

import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import InputMask from 'primevue/inputmask';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Menu from 'primevue/menu';
import Ripple from 'primevue/ripple';
import Sidebar from 'primevue/sidebar';
import StyleClass from 'primevue/styleclass';
import Tooltip from 'primevue/tooltip';
import Toast from 'primevue/toast';
import ProgressBar from 'primevue/progressbar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Calendar from 'primevue/calendar';
import Row from 'primevue/row';
import Dropdown from 'primevue/dropdown';
import Paginator from 'primevue/paginator';
import Image from 'primevue/image';
import Card from 'primevue/card';
import Galleria from 'primevue/galleria';
import Panel from 'primevue/panel';
import Divider from 'primevue/divider';
import RadioButton from 'primevue/radiobutton';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import Textarea from 'primevue/textarea';
import ProgressSpinner from 'primevue/progressspinner';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Message from 'primevue/message';
import VirtualScroller from 'primevue/virtualscroller';
import Skeleton from 'primevue/skeleton';
import Editor from 'primevue/editor';
import { Cropper, Preview } from 'vue-advanced-cropper'
import AutoComplete from 'primevue/autocomplete';
import Tag from 'primevue/tag';
import SpeedDial from 'primevue/speeddial';
import Chip from 'primevue/chip';
import Badge from 'primevue/badge';
import BadgeDirective from 'primevue/badgedirective';
import SplitButton from 'primevue/splitbutton';
import ScrollPanel from 'primevue/scrollpanel';
import OverlayPanel from 'primevue/overlaypanel';
import ToggleButton from 'primevue/togglebutton';
import SelectButton from 'primevue/selectbutton';
import Toolbar from 'primevue/toolbar';
import MultiSelect from 'primevue/multiselect';
import Carousel from 'primevue/carousel';
import DataView from 'primevue/dataview';
import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
import { createI18n } from 'vue-i18n';
import messages from '@/assets/i18n';

//theme https://primefaces.org/primevue/setup
import '@/assets/theme/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import 'vue-advanced-cropper/dist/style.css';


const language = localStorage.getItem('activeLang') || 'th';

const i18n = createI18n({
    messages,
    locale: language,
});


const app = createApp(App)

app.component('DataViewLayoutOptions', DataViewLayoutOptions);
app.component('DataView', DataView);
app.component('Carousel', Carousel);
app.component('MultiSelect', MultiSelect);
app.component('Toolbar', Toolbar);
app.component('SelectButton', SelectButton);
app.component('ToggleButton', ToggleButton);
app.component('OverlayPanel', OverlayPanel);
app.component('ScrollPanel', ScrollPanel);
app.component('SplitButton', SplitButton);
app.component('Badge', Badge);
app.component('Chip', Chip);
app.component('SpeedDial', SpeedDial);
app.component('Tag', Tag);
app.component('AutoComplete', AutoComplete);
app.component('Preview', Preview);
app.component('Cropper', Cropper);
app.component('Editor', Editor);
app.component('VirtualScroller', VirtualScroller);
app.component('Skeleton', Skeleton);
app.component('Message', Message);
app.component('Calendar', Calendar);
app.component('Splitter', Splitter);
app.component('SplitterPanel', SplitterPanel);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Textarea', Textarea);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('RadioButton', RadioButton);
app.component('Divider', Divider);
app.component('Panel', Panel);
app.component('Galleria', Galleria);
app.component('Card', Card);
app.component('Image', Image);
app.component('Paginator', Paginator);
app.component('Avatar', Avatar);
app.component('Button', Button);
app.component('Dialog', Dialog);
app.component('Dropdown', Dropdown);
app.component('FileUpload', FileUpload);
app.component('InputMask', InputMask);
app.component('InputNumber', InputNumber);
app.component('InputSwitch', InputSwitch);
app.component('InputText', InputText);
app.component('Checkbox', Checkbox);
app.component('ProgressBar', ProgressBar);
app.component('Menu', Menu);
app.component('Sidebar', Sidebar);
app.component('Toast', Toast);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ColumnGroup', ColumnGroup);
app.component('Row', Row);
app.directive('tooltip', Tooltip);
app.directive('ripple', Ripple);
app.directive('styleclass', StyleClass);
app.directive('badge', BadgeDirective);

const pinia = createPinia()
pinia.use(piniaPersist)
app.use(pinia)

app.use(PrimeVue);
app.use(router);
app.use(ToastService);
app.use(i18n);
app.mount('#app')