<template>
  <h1>{{ msg }}</h1>
</template>
<script>
import { useLoaderData } from '../../core/src/api.mjs'
import { computed } from 'vue'

export function loader() {
  return {
    msg: 'Hello world!333',
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
<style>
.msg{
    color: aquamarine;
}
</style>