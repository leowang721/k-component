# k-component
a simple component shim, using custom element

## about custom-element-shim
Yes, it support IE8! But using IE8 means loading more files and trick coding.  
I just leave it [here](demo/IE8.html).

## about shadowDOM-shim
shadowDOM is only for CHROME, so many browsers do not support it, so I've decided to use template engine to do rendering work.  
the engine currently is [etpl](https://github.com/ecomfe/etpl)

## about import
like shadowDOM, I've decided using AMD Loader to import component.  
like this:
```javascript
require('k-component/component!somepath/something');
// with this we don't need to do anything else
```
./somepath/something.component.html will be loaded as a html. You can register a component inside it.  

or like this
```
require('component/somePath/AComponent');
// you should have the code below in component/somePath/AComponent.js
require('k-component/component!./aComponent');
```

Just call it `component.html`

## register Element
using HTML inside `component.html`
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

>register first, then put it in DOM TREE

```html
<!-- another template -->
<hello-world>Leo Wang</hello-world>
```
the result html is:
```html
<hello-world>
    <h1>Hello World!</h1>
    <div>
        This is <content>Leo Wang</content> saying HELLO.
    </div>
</hello-world>
```
YES, using content tag to import inside HTML.
