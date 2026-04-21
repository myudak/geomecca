import './style.css'
import 'vue3-toastify/dist/index.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { addIcons, OhVueIcon } from 'oh-vue-icons'
import {
  BiCloudLightningRain,
  BiCloudRainHeavy,
  BiCloudSun,
  BiGeoAlt,
  BiPinAngle,
  BiSunrise,
  FaCalendar,
  FaCompass,
  FaDownload,
  FaList,
  FaLocationArrow,
  FaMap,
  FaRegularTrashAlt,
  FaSearch,
  GiSoundWaves,
  HiPencilAlt,
  IoCalendarOutline,
  IoCheckmark,
  IoChevronBackSharp,
  IoChevronForwardSharp,
  IoCloseSharp,
  IoHomeOutline,
  IoInformationCircleOutline,
  LaDotCircle,
  LaFilterSolid,
  MdClose,
  MdHomeOutlined,
  MdMonitorheart,
  MdSettings,
  RiBaseStationLine,
  WiEarthquake
} from 'oh-vue-icons/icons'
import { createPinia } from 'pinia'
import { setupCalendar } from 'v-calendar'
import { createApp } from 'vue'

import App from './App.vue'
import router from './routes'

addIcons(
  BiGeoAlt,
  BiPinAngle,
  BiCloudLightningRain,
  BiCloudRainHeavy,
  BiCloudSun,
  BiSunrise,
  FaCalendar,
  FaCompass,
  FaLocationArrow,
  FaList,
  FaMap,
  FaRegularTrashAlt,
  FaSearch,
  FaDownload,
  GiSoundWaves,
  HiPencilAlt,
  IoCalendarOutline,
  IoCheckmark,
  IoChevronBackSharp,
  IoChevronForwardSharp,
  IoCloseSharp,
  IoHomeOutline,
  IoInformationCircleOutline,
  LaDotCircle,
  LaFilterSolid,
  MdClose,
  MdHomeOutlined,
  MdMonitorheart,
  MdSettings,
  RiBaseStationLine,
  WiEarthquake
)

const pinia = createPinia()
const app = createApp(App)
app.component('VIcon', OhVueIcon)

app.use(pinia)
app.use(setupCalendar, {})
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        retry: false
      }
    }
  }
})
app.use(router)
app.mount('#app')
