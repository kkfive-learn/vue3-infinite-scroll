## 无限滚动：v 指令

v 指令的实现主要还是用到了滚动事件，但是为了能够使 NaiveUI 的数据表格组件能够触发事件，则需要指定 DOM 元素。因为组件并非真正的滚动元素，在 NaiveUI（2.28.2）版本中，数据表格滚动的元素为`.n-scrollbar-container`，因此在实现指令时需要指定该元素。

既然是监听滚动事件，那必不可少的便是节流与防抖，因此目前我想到的则是向指令中传递至少四个参数：事件处理函数、指定的元素、延时、距离（指距离底部剩余的距离）。

```html
<n-data-table
  :columns="columns"
  :data="data1"
  max-height="500px"
  v-infinite-scroll="{
                                 func: load1,
                                 target: '.n-scrollbar-container',
                                 delay: 100,
                                 threshold: 100
                                 }"
/>
```

但这样实现却出现了一个问题，即指定的元素在指令 Mounted 阶段可能并未被创建，因此便出现了问题。

_NaiveUI 数据表格首先渲染的是空表格、当数据填充时才会创建滚动元素_

因此在使用指令时只能向指令传递一个动态值，这个值我选则了数据的长度。

```html
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
```

指令的声明

```typescript
import { Directive } from 'vue'
import { throttle, debounce } from '../../utils'

const infiniteScroll: Directive<any, any> = {
  updated(el, binding) {
    // 如果el已经有了滚动事件，则直接返回
    if (el.hasInfiniteScrollLoadEvent) return

    const { func, target, delay = 500, threshold = 100 } = binding.value
    const targetElement = el.querySelector(target)
    el.tableInfiniteScrollFn = function (e: Event) {
      const element: HTMLElement | null = e.target as HTMLElement
      const scrollMaxHeight = element.scrollHeight - element.clientHeight
      // 判断：如果当前滚动距离 大于 最大滚动距离 减 100 则表示即将到达底部，触发回调
      if (element.scrollTop >= scrollMaxHeight - threshold) {
        if (func) {
          func()
        } else {
          binding.value()
        }
      }
    }
    ;(targetElement || el).addEventListener(
      'scroll',
      debounce(el.tableInfiniteScrollFn, delay)
    )
    el.hasInfiniteScrollLoadEvent = true
  }
}
export default infiniteScroll
```

> 使用此方式需要保证首次加载的数据大于所设置的容器，否则可能无法触发滚动事件。

### 指令使用姿势

#### 传递函数

```vue
<template>
  <div
    class="test"
    style="max-height: 500px; overflow-y: auto"
    v-infinite-scroll="load2"
  >
    <div v-for="i in data2" :key="i" style="height: 100px">{{ i }}</div>
  </div>
</template>
<script setup lang="ts">
function load2() {
  console.log('load2滚动到底了...')
}
</script>
```

直接传递函数的情况下，将为当前元素绑定滚动事件，并且距离为 100(像素)，延迟为 500ms。

#### 传递对象

传递的对象的类型如下：

```typescript
interface type {
  func: Function
  target?: string
  delay?: number
  threshold?: number
}
```

- func 为事件处理函数
- target 为指定的元素，如果不填则默认为当前绑定的元素。如果滚动元素不是当前元素，那么需要填写此参数来指定。例如：`.n-scrollbar-container`
- delay 节流的延迟时间
- threshold 距离底部的阈值

调用例如：

```vue
<template>
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
</template>
<script setup lang="ts">
// 无实际用途，只用于触发create生命周期
const length1 = computed(() => {
  return data1.value.length
})
function load1() {
  console.log('load1滚动到底了...')
}
</script>
```

## 无限滚动：组件

此组件依赖于[IntersectionObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver/IntersectionObserver)，其兼容下如下：

![image-20220501205926047](https://file.acs.pw/image/2022/05/01/6eb320419f1bdf77100780f2ab84e5f7.png)

此方案实现原理是在所需滚动容器最底部放置此组件，用于监听该元素是否进入可视范围。进入则表示用户滑到了底部。

组件的实现大致如下：

```vue
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
```

组件使用：

```vue
<template>
  <div class="observer-container">
    <div class="item" v-for="i in data">{{ i }}</div>
    <ObserverScroll :handle-intersect="load" />
  </div>
</template>
<script setup lang="ts">
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
</script>
```

## 参考

- [自定义指令](https://v3.cn.vuejs.org/guide/custom-directive.html)
- [element-ui 表格 实现滚动到底部加载更多](http://soiiy.com/internet/10534.html)
- [Vue3 + IntersectionObserver API 实现一个无限滚动组件](https://juejin.cn/post/6844904033400913934)

> 此文中所涉及到的代码可在[vue3-infinite-scroll](https://github.com/kkfive-learn/vue3-infinite-scroll)中找到。
