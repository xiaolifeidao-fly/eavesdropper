<template>
  <svg-icon v-if="icon" :icon-class="icon" />
  <span v-if="title">{{ title }}</span>
</template>

<script setup>
import { defineProps } from 'vue'

// Assuming svg-icon is globally registered or imported elsewhere as needed

defineProps({
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* Add any necessary styles, e.g., spacing between icon and title */
.svg-icon {
  margin-right: 5px; /* Example spacing */
}
span {
  /* Ensure vertical alignment if needed */
  /* vertical-align: middle; */
}
</style>
