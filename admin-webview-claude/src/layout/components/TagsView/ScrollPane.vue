<template>
  <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.native.prevent="handleScroll">
    <slot />
  </el-scrollbar>
</template>

<script setup>
import { ref, computed } from 'vue'

const tagAndTagSpacing = 4 // tagAndTagSpacing

const scrollContainer = ref(null)
const left = ref(0)

const scrollWrapper = computed(() => {
  return scrollContainer.value?.$refs.wrap
})

function handleScroll(e) {
  const eventDelta = e.wheelDelta || -e.deltaY * 40
  const $scrollWrapper = scrollWrapper.value
  $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4
}

function moveToTarget(currentTag) {
  const $container = scrollContainer.value.$el
  const $containerWidth = $container.offsetWidth
  const $scrollWrapper = scrollWrapper.value
  const tagList = document.querySelectorAll('.tags-view-item')

  let firstTag = null
  let lastTag = null

  // find first tag and last tag
  if (tagList.length > 0) {
    firstTag = tagList[0]
    lastTag = tagList[tagList.length - 1]
  }

  if (firstTag === currentTag) {
    $scrollWrapper.scrollLeft = 0
  } else if (lastTag === currentTag) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
  } else {
    // find preTag and nextTag
    const currentIndex = Array.from(tagList).findIndex(item => item === currentTag)
    const prevTag = tagList[currentIndex - 1]
    const nextTag = tagList[currentIndex + 1]

    // the tag's offsetLeft after of nextTag
    const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + tagAndTagSpacing

    // the tag's offsetLeft before of prevTag
    const beforePrevTagOffsetLeft = prevTag.offsetLeft - tagAndTagSpacing

    if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
      $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
    } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
      $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
    }
  }
}

defineExpose({
  moveToTarget
})
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  :deep(.el-scrollbar__bar) {
    bottom: 0px;
  }
  :deep(.el-scrollbar__wrap) {
    height: 49px;
  }
}
</style>
