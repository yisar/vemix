<template>
  <h1>{{ msg }}111</h1>
</template>
<script>
import { useLoaderData } from '../../core/src/api.mjs'
import { computed } from 'vue'

export function loader() {
  return {
    msg: 'Hello world!1111',
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