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
