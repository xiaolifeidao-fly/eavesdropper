Vue2在2023年底已经[EOL](https://link.juejin.cn?target=https%3A%2F%2Fv2.vuejs.org%2Feol%2F)，项目中继续使用Vue2显得格格不入。最近将公司项目的Vue2升级到了Vue3，中间也踩了不少坑，在此记录下。

升级主要包括两个部分：Vue及其相关插件、用法（暂未将选项式API升级为组合式API）的升级，Vue-cli升级切换为Vite。前者使用的是[vue-codemod](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Foriginjs%2Fvue-codemod)（缺点：2年多未升级，且不能自动升级组合式API），后者使用的是[webpack-to-vite](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Foriginjs%2Fwebpack-to-vite)，业界应该也有其他类似工具，但是都大差不差，本文主要记录Vue2到Vue3升级的一些写法变更，重点不在工具。

## Vue2.6.x升级Vue3 API变化点汇总

### 1. 汇总

| Vue2                                                         | Vue3                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `new Vue({render: (h) => h(App)}).$mount('#app')`            | `createApp(App).mount(#app)`                                 |
| `Vue.config`                                                 | `app.config`                                                 |
| `Vue.config.productionTip`                                   | ~~移除~~                                                     |
| `Vue.config.ignoredElements`                                 | `app.config.compilerOptions.isCustomElement`                 |
| `Vue.component`                                              | `app.component`                                              |
| `Vue.directive`                                              | `app.directive`                                              |
| `Vue.filter`                                                 | ~~移除~~                                                     |
| `Vue.mixin`                                                  | `app.mixin`                                                  |
| `Vue.use`                                                    | `app.use`                                                    |
| `Vue.prototype`                                              | 改为设置到`app.config.globalProperties`                      |
| `Vue.extend`                                                 | ~~移除~~                                                     |
| `Vue.observable`                                             | `import { reactive } from 'vue'`                             |
| `Vue.nextTick`                                               | `import { nextTick } from 'vue'`                             |
| `Vue.delete`                                                 | ~~移除~~                                                     |
| `Vue.set`                                                    | ~~移除~~                                                     |
| `Vue.util`                                                   | ~~移除~~                                                     |
| `Vue.options`                                                | ~~移除~~                                                     |
| `Vue.compile`                                                | `import { compile } from 'vue'`                              |
| `Vue.version`                                                | `import { version } from 'vue'`                              |
| `export default new Vue()` Event Bus                         | ~~移除~~，寻找替代优选库或整改                               |
| `this.$on`                                                   | ~~移除~~                                                     |
| `this.$off`                                                  | ~~移除~~                                                     |
| `this.$once`                                                 | ~~移除~~                                                     |
| `this.$mount`                                                | `app.mount`                                                  |
| `this.$destroy`                                              | ~~移除~~                                                     |
| `this.$delete`                                               | ~~移除~~，不需要了                                           |
| `this.$set`                                                  | ~~移除~~，不需要了                                           |
| `this.$listeners`                                            | ~~移除~~，事件添加到`this.$attrs`中                          |
| `this.$children`                                             | ~~移除~~，使用`ref`                                          |
| `@click.native`                                              | `.native`被~~移除~~                                          |
| `this.$attrs`                                                | `this.$attrs`包含class和style，人工排查是否在组件元素上设置class,style |
| `render(h){ h('GlobalComponent')}`                           | `import { h, resolveComponent } from 'vue'` `h(resolveComponent('GlobalComponent'))` |
| lifecycle `beforeDestroy`                                    | `beforeUnmount`                                              |
| lifecycle `destroyed`                                        | `unmounted`                                                  |
| `@hook:updated="handleUpdate"`                               | `@vue:updated="handleUpdate"`                                |
| `v-model` default prop `value`                               | `value`改为`modelValue`                                      |
| `v-model` default event `input`                              | `input`改为`update:modelValue`                               |
| option `model: {prop: 'propName', event: ''}`                | ~~移除~~，改为`v-model:propName`                             |
| `:visible.sync="visible"`                                    | `v-model:visible`                                            |
| `slot="slotName"`                                            | `v-slot:slotName`,必须用在`<template>`上                     |
| `slot="slotName" slot-scope="data"`                          | `v-slot:slotName="data"`                                     |
| `this.$scopedSlots`                                          | ~~移除~~，改为`this.$slots`                                  |
| `this.$slots`，value类型为Vnode数组                          | `this.$slots`，value类型为返回Vnode的函数                    |
| `v-if`优先级低于`v-for`                                      | `v-if`优先级高于`v-for`                                      |
| `inline-template`                                            | ~~移除~~                                                     |
| option data                                                  | 必须为函数                                                   |
| Transition Class Change `v-enter`                            | `v-enter-from`                                               |
| Transition Class Change `v-leave`                            | `v-leave-from`                                               |
| `id="red" v-bind="{ id: 'blue' }" => id="red"`               | 按顺序，后面的覆盖前面的                                     |
| Props Default Function `this` Access                         | 不能访问`this`                                               |
| Watch on Arrays array mutation                               | 必须添加`deep`                                               |
| `<template functional>`                                      | `functional`被~~移除~~                                       |
| option `{ functional: true }`                                | ~~移除~~，直接使用函数定义组件或者普通组件                   |
| option `{ abstract: true }`                                  | ~~移除~~                                                     |
| Async Components `{component: () => {},...componentOptions}` | `import { defineAsyncComponent } from 'vue'` `defineAsyncComponent({loader: () => {}, ...componentOptions})` |
| `v-if/v-else/v-else-if` `key`可以设置为相同和不同            | `key`只能不同，默认为不同的key                               |
| `<template v-for>` `key`设置在子元素上                       | `key`必须设置在`<template >`元素上                           |

### 2. 自定义指令钩子函数变化

vue2

```javascript
javascript

 代码解读
复制代码{
  bind(...args) {
    const [el, binding, vnode] = args;
    console.log("instance", vnode.context);
  },
  inserted(...args) {
  },
  update(...args) {
  },
  componentUpdated(...args) {
  },
  unbind(...args) {
  },
}
```

vue3

```javascript
javascript

 代码解读
复制代码{
  created(...args) { // new
    const [el, binding] = args;
    console.log("instance", binding.instance);
  },
  beforeMount(...args) { // vue2 bind
  },
  mounted(...args) { // vue2 inserted
  },
  beforeUpdate(...args) { // new
  },
  updated(...args) { // vue2 componentUpdated
  },
  beforeUnmount(...args) { // new
  },
  unmounted(...args) { // vue2 unbind
  },
}
```

### 3. component instance mount改为Vue3 Teleport

vue2

```php
php

 代码解读
复制代码import Vue from 'vue'
const Comp = Vue.extend(Component);
const instance = new Comp({
  propsData: {
    propName: "propValue",
  },
});
instance.$mount();
document.body.appendChild(instance.$el);
instance.$destroy()
```

Vue3

```ini
ini

 代码解读
复制代码<Teleport to="body">
  <Component propName="propValue"></Component>
</Teleport>
```

### 4. 渲染函数Vnode属性和slot变化

vue2

```php
php

 代码解读
复制代码export default {
  render(h) {
    return h('div', {
      staticStyle: {
        color: 'red'
      },
      style: {
        fontSize: '20px'
      },
      staticClass: 'active',
      class: {
        container: true
      },
      attrs: {
        'data-id': 'id1'
      },
      on: {
        click() {
          console.log('click')
        }
      },
      domProps: {
        id: 'id1'
      }
    }, [
      this.$slots.header,
      'hello world!',
      this.$slots.default,
      this.$scopedSlots.footer({ msg: 'message' })
    ])
  }
}
```

vue3

```php
php

 代码解读
复制代码import { h } from 'vue'

export default {
  render(ctx) {
    return h('div', {
      style: {
        fontSize: '20px',
        color: 'red'
      },
      class: ['active', {
        container: true
      }],
      'data-id': 'id1',
      onClick() {
        console.log('click')
      },
      id: 'id1'
    }, [
      this.$slots.header(),
      'hello world!',
      ctx.$slots.default(),
      this.$slots.footer({ msg: 'message' })
    ])
  }
}
```

## 组合式API常见API变化点汇总

### 1. vue响应式数据和属性和事件

选项式API写法:

```javascript
javascript

 代码解读
复制代码export default {
  props: {
    title: String,
    count: Number
  },
  emits: ['click'],
  data() {
    return {
      str1: '1',
      num2: 2
    }
  },
  computed: {
    str1Computed() {
      return this.str1 + 'str'
    },
    str2Computed() {
      return this.str1 + this.title
    }
  },
  watch: {
    str1(next) {
      this.num2 = next
    },
    title(next) {
      this.str1 = next
    }
  },
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
```

组合式API写法:

```xml
xml

 代码解读
复制代码<script setup>
import { ref, computed, watch } from 'vue';

defineOptions({
  name: 'Example',
});
const props = defineProps({
  title: String,
  count: Number
});
const emit = defineEmits(['click']);

const str1 = ref('1');
const num2 = ref(2);
const str1Computed = computed(() => {
  return str1.value + 'str'
});
const str2Computed = computed(() => {
  return str1.value + props.title
});

watch(str1, (next) => {
  num2.value = next
});

watch(() => props.title, (next) => {
  str1.value = next
});

function handleClick() {
  emit('click')
}
</script>
```

### 2. vue相关

1. `this.$emit`

```kotlin
kotlin

 代码解读
复制代码// 选项式API写法
this.$emit('click')

// 组合式API写法:
const emit = defineEmits(['click'])
emit('click')
```

1. `this.$forceUpdate`

```javascript
javascript

 代码解读
复制代码// 选项式API写法
this.$forceUpdate()

// 组合式API写法:
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()
instance.proxy.$forceUpdate()
```

1. `this.$el`

```javascript
javascript

 代码解读
复制代码// 选项式API写法
this.$el

// 组合式API写法:
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()
instance.vnode.el
```

1. `Vue.prototype.$message`

```arduino
arduino

 代码解读
复制代码// 选项式API写法
this.$message

// 组合式API写法:
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()
const { $message } = instance.appContext.config.globalProperties
```

1. `this.$refs`

```csharp
csharp

 代码解读
复制代码// 选项式API写法
this.$refs.button.click() // 调用button组件方法

// 组合式API写法:
import { ref } from 'vue'
const buttonRef = ref()
buttonRef.value.click()

// button组件也是组合式API时必须导出此方法
defineExpose({
  click
})
```

1. `this.$parent`

```arduino
arduino

 代码解读
复制代码// 选项式API写法
this.$parent.click() // 调用父组件click方法

// 组合式API写法:
// 方案1 导出方案
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()
instance.parent.click()
// 父组件也是组合式API时必须导出此方法
defineExpose({
  click
})

// 方案2(推荐) provide/inject方案
import { inject } from 'vue'
const click = inject('click')
click()
// 父组件provide
import { provide } from 'vue'
provide({
  click
})
```

1. `options name | inheritAttrs`

```php
php

 代码解读
复制代码// 选项式API写法
export default {
  name: 'ComponentName',
  inheritAttrs: false
}

// 组合式API写法:
defineOptions({
  name: 'ComponentName',
  inheritAttrs: false
})
```

1. `this.$listeners.click`

```arduino
arduino

 代码解读
复制代码// 选项式API写法
this.$listeners.click // 获取组件上绑定的click事件

// 组合式API写法:
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()
instance.vnode.props.onClick
```

### 3. mixin切换

选项式API写法：

```dart
dart

 代码解读
复制代码// 主文件
export default {
  mixin: [fetchMixin],
  props: {
    ownProp: String
  }
}

// fetchMixin文件
export default {
  props: {
    mixinProp: String
  }
  ... 其它部分
}
```

组合式API写法：

```javascript
javascript

 代码解读
复制代码// 主文件
import { fetchProps, useFetch } from './fetch'

// 原有的mixin的属性需要和自己的组合
defineProps({
  ...fetchProps,
  ...ownProp
});
const { ... } = useFetch(入参);

// fetchMixin文件
export function useFetch() {
}
export fetchProps = {...}
```

### 4. vue-router

```scss
scss

 代码解读
复制代码// 选项式API写法
this.$router.push(...)

watch: {
  '$route.path' () {}
}

// 组合式API写法:
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
router.push(...)

const route = useRoute()
watch(route.path, () => {})
```

### 5. vuex

```javascript
javascript

 代码解读
复制代码// 选项式API写法
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

// 组合式API写法 - 直接使用store:
import { useStore } from 'vuex'

const store = useStore()
// 直接使用store, 如：
const count = computed(() => store.state.count)
const count = computed(() => store.getters.count)

store.commit('increment')
store.dispatch('increment')
```

## element-ui升级element-plus变化点汇总

### 1. package.json

```go
go

 代码解读
复制代码package.json`中依赖名称由`element-ui`升级为`element-plus
```

vue2：

```json
json

 代码解读
复制代码"dependencies": {
    "element-ui": "2.15.7",
 }
```

vue3：

```json
json

 代码解读
复制代码"dependencies": {
    "element-plus": "2.2.26",
 }
```

### 2. import引入方式变化

1). main.js中注册组件和全局样式的变化

vue2

```javascript
javascript

 代码解读
复制代码import Vue from 'vue'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(Element)
```

vue3

```javascript
javascript

 代码解读
复制代码import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 样式路径变化
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
```

2). 具体组件名称引入变化，在`element-ui`的基础上添加前缀`El`

vue2

```css
css

 代码解读
复制代码import {
  Loading,
  Message,
  Dialog,
  Menu,
  Submenu,
  Input
} from 'element-ui'
```

vue3

```javascript
javascript

 代码解读
复制代码import {
  ElLoading,
  ElMessage,
  ElDialog,
  ElMenu,
  ElSubMenu, // 注意: Submenu变为了SubMenu
  ElInput
} from 'element-plus'
```

3). 国际化资源引入名称大写需要都改为小写

vue2

```javascript
javascript

 代码解读
复制代码import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
```

vue3

```javascript
javascript

 代码解读
复制代码import enLocale from 'element-plus/lib/locale/lang/en'
import zhLocale from 'element-plus/lib/locale/lang/zh-cn'
```

4). clickoutside指令引入路径变化

vue2

```javascript
javascript

 代码解读
复制代码import Clickoutside from 'element-ui/lib/utils/clickoutside'
```

vue3

```javascript
javascript

 代码解读
复制代码import { ClickOutside as Clickoutside } from 'element-plus'
```

### 3. Icon组件使用变化

`element-plus`中不能用`i`标签元素来使用图标了，图标的实现由`element-ui`中的`字体文件+样式`改为了`element-plus`中的`SVG`,并且这些图标SVG放到了包`@element-plus/icons-vue`中，需要单独引入

#### 3.1 使用方式

vue2

```css
css

 代码解读
复制代码<i class="el-icon-delete"></i>
<el-button type="primary" icon="el-icon-search">搜索</el-button>
<el-input suffix-icon="el-icon-user"></el-input>
```

vue3 方式1 局部引入：

```xml
xml

 代码解读
复制代码<template>
<div>
  <!-- 无效 -->
  <i class="el-icon-delete"></i>

  <!-- components引入 -->
  <el-icon><el-icon-delete /></el-icon>

  <!-- 属性上直接传递组件 -->
  <el-button type="primary" :icon="ElIconSearch">搜索</el-button>
  <el-input :suffix-icon="ElIconSearch"></el-input>
</div>
</template>
<script>
import {
  Delete as ElIconDelete,
  Search as ElIconSearch
} from '@element-plus/icons-vue';

export default {
  setup() {
    return {
      ElIconSearch,
    }
  },
  components: {
    ElIconDelete
  }
}
```

vue3 方式2 全局注册（这种方式的好处是在属性上使用时可兼容`element-ui`中的用法）：

```javascript
javascript

 代码解读
复制代码import {
  Plus as ElIconPlus,
  User as ElIconUser,
  Delete as ElIconDelete
} from '@element-plus/icons-vue'

app.component('ElIconPlus', ElIconPlus)
app.component('ElIconUser', ElIconUser)
app.component('ElIconDelete', ElIconDelete)
<template>
<div>
  <!-- 无效 -->
  <i class="el-icon-delete"></i>

  <!-- 全局注册 -->
  <el-icon><el-icon-delete /></el-icon>

  <!-- 属性用法，与vue2中用法相同 -->
  <el-button type="primary" icon="el-icon-plus">搜索</el-button>
  <el-input suffix-icon="el-icon-user"></el-input>
</div>
</template>
```

#### 3.2 图标变化

`element-ui`中一些图标在`element-plus`中换了名字，已收集的变化列表如下（眼睛快看瞎了收集的，已集成到升级工具中自动转换）：

[element ui 图标官方文档](https://link.juejin.cn?target=https%3A%2F%2Felement.eleme.io%2F%23%2Fzh-CN%2Fcomponent%2Ficon)

[element plus 图标官方文档](https://link.juejin.cn?target=https%3A%2F%2Felement-plus.org%2Fzh-CN%2Fcomponent%2Ficon.html%23%E5%9B%BE%E6%A0%87%E9%9B%86%E5%90%88)

```javascript
javascript

 代码解读
复制代码// key为element-ui => value为element-plus中的名字
const iconNameMapping = {
  Date: 'Calendar',
  Info: 'InfoFilled',
  Success: 'SuccessFilled',
  Error: 'CircleCloseFilled',
  UserSolid: 'UserFilled',
  Notebook2: 'Notebook',
  Notebook1: 'Memo',
  DeleteSolid: 'DeleteFilled',
  Time: 'Clock',
  Upload2: 'Upload',
  Upload: 'UploadFilled',
  WarningOutline: 'Warning',
  Warning: 'WarningFilled',
  PhoneOutline: 'Phone',
  Phone: 'PhoneFilled',
  MoreOutline: 'More',
  More: 'MoreFilled',
  RemoveOutline: 'Remove',
  Remove: 'RemoveFilled',
  CirclePlusOutline: 'CirclePlus',
  CirclePlus: 'CirclePlusFilled',
  PictureOutline: 'Picture',
  Picture: 'PictureFilled',
  EditOutline: 'Edit',
  Edit: 'EditPen',
  LocationOutline: 'Location',
  Location: 'LocationFilled',
  Question: 'QuestionFilled',
  STools: 'Tools',
  SHome: 'HomeFilled',
  SHelp: 'HelpFilled',
  SGrid: 'Grid',
  SComment: 'Comment',
  SPromotion: 'Promotion',
  SCooperation: 'Briefcase',
  SOpen: 'BrushFilled',
  SFlag: 'Flag',
  SOperation: 'Operation',
  SPlatform: 'Platform',
  SOrder: 'List',
  SRelease: 'Failed',
  STicket: 'Ticket',
  SShop: 'Shop',
  SManagement: 'Management',
  SMarketing: 'TrendCharts',
  SFinance: 'WalletFilled',
  SClaim: 'Checked',
  SCustom: 'Avatar',
  SOpportunity: 'Opportunity',
  SData: 'Histogram',
  SCheck: 'Stamp',
  SGoods: 'GoodsFilled',
  MessageSolid: 'BellFilled',
  CameraSolid: 'CameraFilled',
  VideoCameraSolid: 'VideoCameraFilled',
  StarOff: 'Star',
  StarOn: 'StarFilled',
}
```

注意：

有两种情况在升级时需要寻找替代方案： 1. `element-ui`中一些图标在`element-plus`中不存在 2. 自己扩展的

### 4. 与v-model相关的变化

1). 由于vue3中，`v-model`的属性值由`value`改为了`model-value`,在有v-model用法的组件上直接使用了`value`属性的要改为`model-value`,下面看一些例子：

vue2

```ini
ini

 代码解读
复制代码<el-input :value="value" />
<el-radio :value="value" />
<el-checkbox :value="value" />
```

vue3

```ruby
ruby

 代码解读
复制代码<el-input :model-value="value" />
<el-radio :model-value="value" />
<el-checkbox :model-value="value" />
```

2). el-dialog的用法改变：

vue2

```ini
ini

 代码解读
复制代码<el-dialog :visible.sync="dialogVisible">
<el-dialog :visible="dialogVisible">
```

vue3

```ini
ini

 代码解读
复制代码<el-dialog v-model="dialogVisible">
<el-dialog :model-value="dialogVisible">
```

### 5. 国际化变化

1). 不指定语言时默认语言为中文改为英文

vue2

```javascript
javascript

 代码解读
复制代码import Vue from 'vue'
import Element from 'element-ui'

Vue.use(Element) // 不指定语言时默认语言为中文
```

vue3

```javascript
javascript

 代码解读
复制代码import { createApp } from 'vue'
const app = createApp(App)
app.use(ElementPlus) // 不指定语言时默认语言为英文
```

2). `locale.i18n`用法删除

vue2:

```javascript
javascript

 代码解读
复制代码import locale from "element-plus/lib/locale";
// i18n函数可自己实现或者使用vue-i18n
locale.i18n((key, value) => i18n.t(key, value));
```

vue3:

```javascript
javascript

 代码解读
复制代码import enLocale from 'element-plus/lib/locale/lang/en';
import zhLocale from 'element-plus/lib/locale/lang/zh-cn';

app.use(Element, {
  locale: getLang() === 'en_US' ? enLocale : zhLocale
})
```

### 6. 组件属性相关变化

1). el-tooltip、el-popover属性名称变化

```arduino
arduino

 代码解读
复制代码// old prop => new prop
const changePropNameMap = {
  'open-delay': 'show-after', 
  'hide-after': 'auto-close',
  'close-delay': 'hide-after'
}
```

2). el-popconfirm事件名称变化

```arduino
arduino

 代码解读
复制代码// old prop => new prop
const changeEventNameMap = {
  'on-confirm': 'confirm',
  'on-cancel': 'cancel'
}
```

3). el-calendar range属性类型由字符串数组改为Date数组

vue2

```ruby
ruby

 代码解读
复制代码<el-calendar :range="['2019-03-04', '2019-03-24']"></el-calendar>
```

vue3

```ini
ini

 代码解读
复制代码<el-calendar :range="[new Date(2019, 3, 4), new Date(2019, 3, 24)]" ></el-calendar>
```

4). el-date-picker default-time属性类型由字符串数组改为Date数组

vue2

```ruby
ruby

 代码解读
复制代码<el-date-picker :default-time="['00:00:00', '23:59:59']"></el-date-picker>
```

vue3

```sql
sql

 代码解读
复制代码<el-date-picker :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)" ></el-date-picker>
```

5). el-date-picker picker-options属性被拆分，shortcuts onclick函数变化

vue2

```xml
xml

 代码解读
复制代码<template>
  <el-date-picker
     v-model="value"
     align="right"
     type="date"
     placeholder="选择日期"
     :picker-options="pickerOptions">
   </el-date-picker>
</template>
<script>
  export default {
    data() {
      return {
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          },
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: '昨天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }, {
            text: '一周前',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          }]
        },
        value: '',
      };
    }
  };
</script>
```

vue3

```xml
xml

 代码解读
复制代码<template>
  <el-date-picker
     v-model="value"
     type="date"
     placeholder="选择日期"
     :disabled-date="disabledDate"
     :shortcuts="shortcuts"
     :size="size">
   </el-date-picker>
</template>
<script lang="ts" setup>
import { ref } from 'vue'

const size = ref<'' | 'large' | 'small'>('')
const value = ref('')
const shortcuts = [
  {
    text: 'Today',
    value: new Date(),
  },
  {
    text: 'Yesterday',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: 'A week ago',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
]

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}
</script>
```

5). el-time-select picker-options属性被拆分

vue2

```ini
ini

 代码解读
复制代码<el-time-select
  v-model="value"
  :picker-options="{
    start: '08:30',
    step: '00:15',
    end: '18:30'
  }"
  placeholder="选择时间">
</el-time-select>
```

vue3

```ini
ini

 代码解读
复制代码<el-time-select
  v-model="value"
  start="08:30"
  step="00:15"
  end="18:30"
  placeholder="选择时间">
</el-time-select>
```

### 7. 样式变化

## vue-router升级变化点汇总

### 1. package.json

```go
go

 代码解读
复制代码vue-router`升级名称不变，版本号由`3`升级到`4
```

vue2：

```json
json

 代码解读
复制代码"dependencies": {
    "vue-router": "3.5.3",
 }
```

vue3：

```json
json

 代码解读
复制代码"dependencies": {
    "vue-router": "v4.1.5",
 }
```

### 2. 官方升级文档

`vue-router`的升级官方文档上已经总结的很全了，这里列举出大家项目中最常用的api的变化，其它变化请参考[官方升级文档](https://link.juejin.cn?target=https%3A%2F%2Frouter.vuejs.org%2Fguide%2Fmigration%2Findex.html)

vue2

**router.js**

```javascript
javascript

 代码解读
复制代码import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
const router = new Router({
  mode: 'hash', // 默认值就是hash
  base: process.env.BASE_URL,
  routes: [
     ..., // 其它route
    {
      path: '*',
      component: NotFound,
    }
  ],
});
export default router;
```

**main.js**

```javascript
javascript

 代码解读
复制代码new Vue({
  router, // 需设置到options上
  render: h => h(App)
}).$mount('#app')
```

vue3

**router.js**

```arduino
arduino

 代码解读
复制代码import { createWebHashHistory, createRouter } from 'vue-router';

const router = createRouter({
  // history必须配置，原base属性变为参数
  history: createWebHashHistory(process.env.BASE_URL),
  routes: [
     ..., // 其它route
    {
      path: '/:pathMatch(.*)*', // 变化
      component: NotFound,
    }
  ],
});
export default router;
```

**main.js**

```ini
ini

 代码解读
复制代码const app = createApp(App);
app.use(router);
app.mount('#app')
```

### 3. Router.prototype

有的项目中设置或者修改了Router的原型prototype，在vue3中这种做法不行了，需要根据实际情况整改

```ini
ini

 代码解读
复制代码// vue3按实际情况整改
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
```

## vue-i18n升级变化点汇总

### 1. package.json

```go
go

 代码解读
复制代码vue-i18n`升级名称不变，版本号由`8`升级到`9
```

vue2：

```json
json

 代码解读
复制代码"dependencies": {
    "vue-i18n": "8.27.0",
 }
```

vue3：

```json
json

 代码解读
复制代码"dependencies": {
    "vue-i18n": "9.2.2",
 }
```

### 2. api变化

全局API改为实例式api，其它api和vue2版本一致

vue2

**i18n.js**

```javascript
javascript

 代码解读
复制代码import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

const messages = {
  ...
}

let lang = 'zh-CN'
const i18n = new VueI18n({
  locale: lang,
  messages,
})

export default i18n
```

**main.js**

```javascript
javascript

 代码解读
复制代码new Vue({
  i18n, // 需设置到options上
  render: h => h(App)
}).$mount('#app')
```

vue3

**i18n.js**

```javascript
javascript

 代码解读
复制代码import { createI18n } from 'vue-i18n'

const messages = {
  ...
}
let lang = 'zh-CN'
const i18n = createI18n({
  locale: lang,
  messages,
})
export default i18n
```

**main.js**

```ini
ini

 代码解读
复制代码const app = createApp(App);
app.use(i18n);
app.mount('#app')
```

### 3. i18n.t | i18n.mergeLocaleMessage

vue2

```scss
scss

 代码解读
复制代码i18n.t(...)
i18n.mergeLocaleMessage(...)
```

vue3

```csharp
csharp

 代码解读
复制代码i18n.global.t(...)
i18n.global.mergeLocaleMessage(...)
```

### 4. 特殊字符

升级后国际化资源中以下几个特殊字符需要[特殊处理](https://link.juejin.cn?target=https%3A%2F%2Fvue-i18n.intlify.dev%2Fguide%2Fmigration%2Fbreaking%23message-format-syntax)：

> @${}|

修改为：

> {'@'}{'$'}{'{'}{'}'}{'|'}

## 其他

Vue2中的require写法需要整改，比如原先通过require引入的图片，可以通过impoort或者[vite的方式解决](https://link.juejin.cn?target=https%3A%2F%2Fcn.vitejs.dev%2Fguide%2Fassets.html)。

除了Vue全家桶，其他配套插件可能也需要升级。比如我们使用了bootstrap-vue需要升级为[bootstrap-vue-next](https://link.juejin.cn?target=https%3A%2F%2Fbootstrap-vue-next.github.io%2Fbootstrap-vue-next%2Fdocs.html)，这其中还有个坑就是bootstrap-vue依赖Vue3.3中的`toValue`，所以Vue3.3以下的版本使用不了bootstrap-vue-next。如果你升级了其他插件，你需要注意可能有这种坑，也没有很好的解决办法，无非就是多搜索、多看官网文档，必要的时候甚至看源码。