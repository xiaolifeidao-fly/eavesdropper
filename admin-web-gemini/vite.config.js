import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

function resolve(dir) {
  return path.join(__dirname, dir)
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  const port = parseInt(env.VITE_PORT || '9527')

  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      createSvgIconsPlugin({
        // Specify the icon folder to be cached
        iconDirs: [path.resolve(process.cwd(), 'src/icons/svg')],
        // Specify symbolId format
        symbolId: 'icon-[name]',
      })
    ],
    resolve: {
      alias: {
        '@': resolve('src'),
        // Polyfill for path module in browser
        'path': 'path-browserify'
      }
    },
    server: {
      port: port,
      open: true,
      host: true, // Listen on all addresses
      proxy: {
        // String shorthand
        // '/foo': 'http://localhost:4567',
        // With options
        '/xhsapi': {
          target: 'https://www.xiaohongshu.com/fe_api/burdock/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/xhsapi/, '')
        },
        // Using the proxy instance
        // '/api': {
        //   target: 'http://jsonplaceholder.typicode.com',
        //   changeOrigin: true,
        //   configure: (proxy, options) => {
        //     // proxy will be an instance of 'http-proxy'
        //   }
        // },
        // Proxying websockets or socket.io
        // '/socket.io': {
        //   target: 'ws://localhost:5173',
        //   ws: true
        // }
      }
      // Mock server integration needs review. For now, disabled.
      // middlewareMode: true, // Example if using connect middleware
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Inject SCSS variables/mixins globally
          // Make sure the paths are correct
          // additionalData: `@import "@/styles/variables.scss"; @import "@/styles/mixins.scss";`
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      // You might need to adjust build options further based on vue.config.js optimization settings
      // For example, chunk splitting strategies might need review
      // rollupOptions: {
      //   output: {
      //     manualChunks(id) {
      //       if (id.includes('node_modules')) {
      //         return id.toString().split('node_modules/')[1].split('/')[0].toString();
      //       }
      //     }
      //   }
      // }
    }
    // optimizeDeps: { // Optional: Pre-bundle dependencies
    //   include: ['element-plus/es/locale/lang/zh-cn', 'element-plus/es/locale/lang/en']
    // }
  }
}) 