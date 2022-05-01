<template>
  <div class="container">
    <!-- <div class="directive-container">
      <DirectiveScroll />
    </div> -->
    <div class="observer-container">
      <div class="item" v-for="i in data">{{ i }}</div>
      <ObserverScroll :handle-intersect="load" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import DirectiveScroll from './components/directive-scroll.vue'
import ObserverScroll from './components/observer-scroll'
const data = ref<any>([])

function load() {
  setTimeout(() => {
    for (let i = 0; i < 10; i++) {
      data.value.push({
        id: i,
        name: `name ${i}`,
        age: i,
        address: `address ${i}`,
        date: new Date()
      })
    }
  }, 800)
}
onMounted(() => {
  load()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 50px auto 0;
  display: flex;
}
.directive-container {
  flex: 1;
}
.observer-container {
  width: 300px;
  overflow-y: auto;
  margin-left: 50px;
  max-height: 600px;
}
.observer-container .item {
}
</style>
