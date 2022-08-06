<template>
  <div>{{ msg }}</div>
</template>
<script>
import { useLoaderData } from '@vkt/core'
import { computed } from 'vue'

export function loader() {
  return {
    msg: 'Hello world!',
  }
}

export default {
  setup() {
    const data = useLoaderData()
    const msg = computed(() => data.value.msg)

    return {
      msg,
    }
  },
}
</script>