<template>
  <h1 class="msg">{{ msg }}</h1>
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
    text-shadow: 3px 3px 3px rgba(0,0,0,.3);
}
</style>