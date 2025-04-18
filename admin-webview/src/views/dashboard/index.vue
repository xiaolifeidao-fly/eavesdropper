<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import editorDashboard from './editor'

export default {
  name: 'Dashboard',
  components: { adminDashboard, editorDashboard },
  data() {
    return {
      currentRole: ''
    }
  },
  computed: {
    ...mapGetters([
      'buttonList'
    ])
  },
  created() {
    if (this.buttonList.includes('DASHBOARD_ORDERRECORD_TODAY')) {
      console.log('当时是admin:')
      console.log(this.buttonList)
      this.currentRole = 'adminDashboard'
    } else {
      console.log('当时不是admin:')
      console.log(this.buttonList)
      this.currentRole = 'editorDashboard'
    }
  }
}
</script>
