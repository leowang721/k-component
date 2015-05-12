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
所以现有的样式支持要这样：  
```less
.some-style {
    // ....
}

some-element-tag {
    &::shadow,
    fake-shadow-root {
        .some-style;
    }
}
```

## 关于模板引擎
[etpl](https://github.com/ecomfe/etpl)  
当前仅支持 content 内可以使用模板，结合 Action 的 Model 来进行渲染

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
<hello-world>
    <h1>Hello World!</h1>
    <div>
        This is <content>Leo Wang</content> saying HELLO.
    </div>
</hello-world>
```
