<template>
  <div class="observer" ref="observerElementRef"></div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, PropType, ref } from 'vue'
const props = defineProps({
  /**
   * 触发的函数
   */
  handleIntersect: {
    type: Function as PropType<Function>,
    default: () => {}
  },
  /**
   * 父级元素css选择器 如果不传入则取此组件的父级元素
   */
  target: {
    type: String as PropType<string>,
    default: ''
  },
  /**
   * 距离触发时间的距离（阈值）
   * https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver/IntersectionObserver
   */
  rootMargin: {
    type: String as PropType<string>,
    default: '100px 0px'
  }
})

const observerElementRef = ref<null | HTMLElement>(null)
let observer: null | IntersectionObserver = null
onMounted(() => {
  const options = {
    root: props.target
      ? document.querySelector(props.target)
      : observerElementRef.value?.parentElement,
    rootMargin: props.rootMargin
  }
  // 构建观察器
  observer = new IntersectionObserver(([entry]) => {
    // 目标元素与根元素相交
    if (entry && entry.isIntersecting) {
      props?.handleIntersect()
    }
  }, options)
  if (observerElementRef.value) {
    // 观察目标元素
    observer.observe(observerElementRef.value)
  }
})
onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.observer {
  width: 1px;
  height: 1px;
}
</style>
