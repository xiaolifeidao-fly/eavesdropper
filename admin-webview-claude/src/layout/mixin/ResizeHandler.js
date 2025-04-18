import { onBeforeMount, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/app'

const WIDTH = 992 // refer to Bootstrap's responsive design

export function useResize() {
  const appStore = useAppStore()
  const route = useRoute()
  
  function isMobile() {
    const rect = document.body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
  }
  
  function resizeHandler() {
    if (!document.hidden) {
      const mobile = isMobile()
      appStore.toggleDevice(mobile ? 'mobile' : 'desktop')

      if (mobile) {
        appStore.closeSideBar({ withoutAnimation: true })
      }
    }
  }
  
  watch(route, () => {
    if (appStore.device === 'mobile' && appStore.sidebar.opened) {
      appStore.closeSideBar({ withoutAnimation: false })
    }
  })
  
  onBeforeMount(() => {
    window.addEventListener('resize', resizeHandler)
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
  })
  
  onMounted(() => {
    const mobile = isMobile()
    if (mobile) {
      appStore.toggleDevice('mobile')
      appStore.closeSideBar({ withoutAnimation: true })
    }
  })
}
