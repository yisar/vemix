<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useTransition } from '../core/src/api.mjs'

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
