/**
 * 节流，多次触发，间隔时间段执行
 * @param { Function } func
 * @param { Number } wait
 * @param { Object } options
 */
export function throttle(
  func: Function,
  wait = 500,
  options: { leading: boolean; trailing: boolean } = {
    leading: false,
    trailing: true
  }
) {
  var timeout: any, context: any, args: any
  var previous = 0
  if (!options) options = { leading: false, trailing: true }

  var later = function () {
    previous = options.leading === false ? 0 : new Date().getTime()
    timeout = null
    func.apply(context, args)
    if (!timeout) context = args = null
  }

  var throttled = function () {
    var now = new Date().getTime()
    if (!previous && options.leading === false) previous = now
    var remaining = wait - (now - previous)
    // @ts-ignore
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
  }
  return throttled
}

/**
 *
 * @param { Function } func 要进行debouce的函数
 * @param { Number } wait 等待时间,默认500ms
 * @param { Boolean } immediate 是否立即执行
 */
export function debounce(func: Function, wait = 500, immediate = false) {
  var timeout: any
  return function () {
    // @ts-ignore
    var context = this
    var args = arguments

    if (timeout) clearTimeout(timeout)
    if (immediate) {
      // 如果已经执行过，不再执行
      var callNow = !timeout
      timeout = setTimeout(function () {
        timeout = null
      }, wait)
      if (callNow) func.apply(context, args)
    } else {
      timeout = setTimeout(function () {
        func.apply(context, args)
      }, wait)
    }
  }
}
