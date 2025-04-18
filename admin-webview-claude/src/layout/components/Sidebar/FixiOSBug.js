import { onMounted, nextTick, watch, ref } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 修复iOS中sub-menu的bug
 */
export function useFixiOSBug() {
  const route = useRoute()
  const subMenu = ref(null)

  const fixBugIniOS = () => {
    const $subMenu = subMenu.value
    if ($subMenu) {
      const handleMouseleave = $subMenu.handleMouseleave
      $subMenu.handleMouseleave = (e) => {
        if (isIOS()) {
          $subMenu.subMenu.activeIndex = null
          $subMenu.subMenu.initOpenedMenu()
        } else {
          handleMouseleave(e)
        }
      }
    }
  }

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  }

  onMounted(() => {
    nextTick(fixBugIniOS)
  })

  watch(() => route.path, () => {
    nextTick(fixBugIniOS)
  })
}
