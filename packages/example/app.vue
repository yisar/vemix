<template>
  <div>
    <header>
      <div v-show="isLoading" class="loading">Loading...</div>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useTransition } from '@vkt/api.mjs'

export default {
  name: 'AppRoot',
  setup() {
    const transition = useTransition()
    return {
      isLoading: computed(() => transition.value.state !== 'idle'),
    }
  },
}
</script>
