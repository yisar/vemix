<template>
  <div class="msg">{{ msg }}</div>
</template>
<script>
import { useLoaderData } from '../../core/src/api.mjs'
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
<style>
.msg{
    color: aquamarine;
}
</style>