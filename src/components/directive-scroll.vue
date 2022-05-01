<template>
  <div class="container">
    <n-data-table
      :columns="columns"
      :data="data1"
      max-height="500px"
      v-infinite-scroll:[length1]="{
        func: load1,
        target: '.n-scrollbar-container',
        delay: 100,
        threshold: 100
      }"
    />
    <div
      class="test"
      style="max-height: 500px; overflow-y: auto"
      v-infinite-scroll:[length2]="load2"
    >
      <div v-for="i in data2" :key="i" style="height: 100px">{{ i }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { NDataTable } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
const columns = [
  {
    title: 'Name',
    key: 'name',
    width: 200
  },
  {
    title: 'Age',
    key: 'age',
    width: 100
  },
  {
    title: 'Address',
    key: 'address',
    width: 200
  }
]
const data1 = ref<Array<any>>([])
const length1 = computed(() => {
  return data1.value.length
})
const data2 = ref<Array<any>>([])
const length2 = computed(() => {
  return data2.value.length
})
function load1() {
  console.log('load1滚动到底了...')
  createData1(10)
}
function load2() {
  console.log('load2滚动到底了...')
  createData2(10)
}
function createData1(len: number = 10) {
  setTimeout(() => {
    for (let i = 0; i <= len; i++) {
      data1.value.push({
        id: i,
        name: `name ${i}`,
        age: i,
        address: `address ${i}`,
        date: new Date()
      })
    }
  }, 100)
}
function createData2(len: number = 10) {
  setTimeout(() => {
    for (let i = 0; i <= len; i++) {
      data2.value.push({
        id: i,
        name: `name ${i}`,
        age: i,
        address: `address ${i}`,
        date: new Date()
      })
    }
  }, 100)
}
onMounted(() => {
  createData1(15)
  createData2(15)
  setTimeout(() => {
    createData1()
    createData2()
  }, 2000)
})
</script>

<style scoped>
.container {
  display: flex;
  margin-top: 0;
}
.test {
  margin-left: 50px;
}
</style>
