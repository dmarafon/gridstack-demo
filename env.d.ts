/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from '@vitejs/plugin-vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

import 'pinia'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    // Add custom properties here to augment all stores.
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Describes the route to navigate to after a successful login. Only present in /auth route.
     */
    afterLoginRouteName?: string

    /**
     * Translatable string.
     */
    pageTitle?: string
  }
}
