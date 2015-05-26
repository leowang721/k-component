# k-component

类似于 Polymer 的模式，创建 custom element。

但是与之不同的是，Polymer完全针对着 web component 的开发模式，浏览器支持度不高，并且使用模式是以 html import 为核心，与我们想要的 AMD 模式不符。

所以基于`custom-element-shim`开发这个基础库用于基础的 custom element 的实现，并提供：

- AMD加载器：component.js
- 脚手架：edpx-kc

来辅助使用和开发的需要。

## 关于custom-element-shim
基于`webcomponentjs`支持基础的 custom element。
支持 IE8，但是 IE8下使用要引入更多的文件，并且要有一些 trick coding.
[IE8下的支持](demo/IE8.html).

## 关于shadowDOM
shadowDOM当前仅Chrome支持...  
所以当前的支持模式为：  
- chrome 下使用 shadowDOM
- 其他浏览器处理了 dom 结构，类似于 chrome 下的效果

这带来一个问题，样式！  
所以现有的样式如果涉及到 shadow 的部分，要同时处理 fake-shadow-root，例如：
```less
.some-style {
    // ....
}

some-element-tag {
    &::shadow {
        .some-style;
    }
    fake-shadow-root {
        .some-style;
    }
}
```

## 关于模板引擎
[etpl](https://github.com/ecomfe/etpl)  
当前仅支持 content 内可以使用模板，结合 Action 的 data 来进行渲染

## 关于引入
如前述，决定使用 AMD 模式开发，所以提供了相应的加载器：

```javascript
require('k-component/component!somepath/something');
// with this we don't need to do anything else
```
文件`./somepath/something.component.html`会被加载，并且自动注册其中的 component

或者……

```javascript
require('component/somePath/AComponent');
// you should have the code below in component/somePath/AComponent.js
// 脚手架会自动添加这个引用
require('k-component/component!./a-component');
```

## component的注册
在模板文件`*.component.html`中：
```html
<k-component name="hello-world">
    <template>
        <h1>Hello World!</h1>
        <div>
            This is <content></content> saying HELLO.
        </div>
    </template>
</k-component>
```

>先注册，再使用，但是先用了，再注册也可以，最多样式上要处理一下。

```html
<!-- another template -->
<hello-world>Leo Wang</hello-world>
```

展现的效果 HTML 类似于：
```html
<hello-world id="hello">
    <h1>Hello World!</h1>
    <div>
        This is <content>Leo Wang</content> saying HELLO.
    </div>
</hello-world>
```

实际使用，例如设置谁来说 HELLO，来动态的达到上面的效果。
```javascript
document.getElementById('hello').innerHTML = 'Leo Wang';
// 前提是能直接获取到，如果在某个 shadow root中，这样是不能直接拿到的
// 可以直接使用$k 穿透 shadow 来获取
$k('#hello').html('Leo Wang');
// 或者先拿到 所在shadowRoot元素，然后再获取元素，比较麻烦，不述。
```

## 关于 Action

Action 使用 cache 私有存储，不直接暴露Action 实例的直接获取方法

在 Action 中
```javascript
this.el;  // 实例依托的元素，就是自定义元素，Zepto 对象
this.content;  // innerHTML 依托的元素，如果支持 shadowDOM，就是 el，否则是 content 元素，Zepto 对象
this.shadowRoot;  // shadowDOM 所在，如果不支持，则是 fake-shadow-root，Zepto 对象

// 直接可使用 Zepto 自定义事件，挂载于 this.el 上
// this.on
// this.one
// this.off
// this.trigger
// this.triggerHandler

```

## 关于 el、content和 shadowRoot
上面实例 hello-world 的进一步展现HTML解析
```html
<hello-world id="hello">
    <shadow>  <!-- 如果不支持，就是fake-shadow-root -->
        <h1>Hello World!</h1>
        <div>
            This is <content>Leo Wang</content> saying HELLO.
        </div>
    </shadow>
</hello-world>
```
- el是自定义的元素，在上面的实例中，就是：hello-world
- shadowRoot 包含了实际展现出来的全部结构，就是shadow，如果不支持 shadowDOM，则为 fake-shadow-root。  
当然shadow实际上是不存在的，它是个document fragment，不过fake-shadow-root存在
- content 是指 shadowRoot 中的 content 部分  
实际上它的内容就是#hello元素的innerHTML，这样起到隐藏展现 HTML 内容的目的，能够获取到的就是实际内容 HTML。

content 暂不支持多个模式。

## 关于$k

$k 是随意起的名字，主旨是为了能够获取到按需加载的元素&Action来进行操作和处理。  
当前的$k 实际上是 Zepto 对象的扩展，其内容为对应元素，默认支持穿透`shadowDom`的获取。  
当前增加或重定义的属性及方法：
- promise 元素&Action是否ready的 promise
- then
- catch
- data 重写了data 方法，如果是 component 元素，则使用其 Action 的 cache 存储，否则使用 zepto 的默认处理（HTML5的 data-* 存储）
```javascript
var a = $k(query|element);  // 参数可以是查询字符串或者元素
a.then(method);  // 当元素&Action ready 后，做一些事情，method 的 this 指向对应的 Action
a.ready(method);  // 当元素 ready 后，做一些事情，这是 Zepto 默认有的方法，请注意
a.data('k', true);  // 设置数据
a.data('k');  // 获取数据
```
