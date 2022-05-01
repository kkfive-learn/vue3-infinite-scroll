import { App } from 'vue'
import infiniteScroll from '../directives/infiniteScroll'

/**
 * 注册全局自定义指令
 * @param app
 */
export function setupDirectives(app: App) {
  app.directive('infiniteScroll', infiniteScroll)
}
