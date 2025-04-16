<template>
  <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.prevent="handleScroll">
    <slot />
  </el-scrollbar>
</template>

<script>
const tagAndTagSpacing = 4 // tagAndTagSpacing

export default {
  name: 'ScrollPane',
  data() {
    return {
      // left: 0 // This seems unused
    }
  },
  computed: {
    // TODO: Rework this for Element Plus scrollbar
    // Accessing internal $refs.wrap is unreliable.
    // Need to use ElScrollbar instance methods or refs.
    scrollWrapper() {
      // !! This will likely break !!
      // return this.$refs.scrollContainer?.$refs?.wrap 
      // Placeholder - find correct way via ElScrollbar instance
      return this.$refs.scrollContainer?.$refs?.wrap // Keep original potentially breaking code for now
    }
  },
  mounted() {
     // Potentially get scrollbar instance here if needed
     // console.log(this.$refs.scrollContainer)
  },
  methods: {
    handleScroll(e) {
      // TODO: Rework scroll logic if scrollWrapper access changes
      const eventDelta = e.wheelDelta || -e.deltaY * 40
      const $scrollWrapper = this.scrollWrapper
      if (!$scrollWrapper) return;
      $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4
    },
    // TODO: Rework this method for Element Plus & remove $parent dependency
    // It should ideally receive the target element or position and use ElScrollbar methods.
    moveToTarget(currentTag) {
      const $container = this.$refs.scrollContainer?.$el
      const $scrollWrapper = this.scrollWrapper
      // Accessing parent refs is bad practice!
      const tagList = this.$parent?.$refs?.tag 
      
      if (!$container || !$scrollWrapper || !tagList || tagList.length === 0) {
           console.warn('ScrollPane moveToTarget: Missing elements or refs.');
           return;
      }

      const $containerWidth = $container.offsetWidth
      let firstTag = tagList[0]
      let lastTag = tagList[tagList.length - 1]
      
      // Find the actual DOM element for the tag component instance
      const currentTagEl = currentTag?.$el || (currentTag instanceof HTMLElement ? currentTag : null);
      const firstTagEl = firstTag?.$el || (firstTag instanceof HTMLElement ? firstTag : null);
      const lastTagEl = lastTag?.$el || (lastTag instanceof HTMLElement ? lastTag : null);

      if (!currentTagEl || !firstTagEl || !lastTagEl) {
          console.warn('ScrollPane moveToTarget: Could not get tag DOM elements.');
          return;
      }

      if (firstTagEl === currentTagEl) {
        $scrollWrapper.scrollLeft = 0
      } else if (lastTagEl === currentTagEl) {
        $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
      } else {
        // Find index based on element reference if possible, otherwise fallback needed
        const currentIndex = tagList.findIndex(item => (item?.$el || item) === currentTagEl)
        if (currentIndex === -1) { 
            console.warn('ScrollPane moveToTarget: Current tag not found in list.');
            return; 
        }
        const prevTag = tagList[currentIndex - 1]
        const nextTag = tagList[currentIndex + 1]
        const prevTagEl = prevTag?.$el || (prevTag instanceof HTMLElement ? prevTag : null);
        const nextTagEl = nextTag?.$el || (nextTag instanceof HTMLElement ? nextTag : null);

        if (!prevTagEl || !nextTagEl) {
            console.warn('ScrollPane moveToTarget: Could not get prev/next tag DOM elements.');
            return; // Or handle boundary cases differently
        }

        const afterNextTagOffsetLeft = nextTagEl.offsetLeft + nextTagEl.offsetWidth + tagAndTagSpacing
        const beforePrevTagOffsetLeft = prevTagEl.offsetLeft - tagAndTagSpacing

        // !! Direct scrollLeft manipulation - Rework with ElScrollbar methods !!
        if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
          $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
        } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
          $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
        }
        // Example using ElScrollbar method (if available after getting instance):
        // const scrollbarInstance = this.$refs.scrollContainer;
        // if (scrollbarInstance) { 
        //    if (afterNextTagOffsetLeft > scrollbarInstance.wrapRef.scrollLeft + $containerWidth) { ... }
        //    scrollbarInstance.setScrollLeft(targetScrollLeft);
        // }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  /* Updated deep selector for Vue 3 */
  :deep(.el-scrollbar__bar) {
    bottom: 0px;
  }
  :deep(.el-scrollbar__wrap) {
    height: 49px;
  }
}
</style>
