# Introduction
This is a Vue3 Javascript-only adaptation of the Vue2 Spatial Navigation directive from https://github.com/twcapps/vue-spatialnavigation

## Installation

```console
npm install vue3-spatialnavigation --save
```

## Spatial navigation
Spatial navigation is keyboard navigation of a html page most often used on devices where mouse navigation is not available or not preferred. An important rule is that only 1 element can have the active 'focus' state at the same time.

When a user navigates the page with the left, right, up, down keybaord keys a decision should be made which element to focus next. This directive will improve the Vue native keyboard binding to provide a flexible spatial navigation implementation.

Inspiration for this plugin is taken from the [CSS3 draft keyboard navigation](https://drafts.csswg.org/css-ui/#keyboard), a limitation is that CSS3 can only point the focus position based on (DOM) element id pointers, while this directive supports both element id pointers and custom (component) method binding.


## Typical usage

To make an element 'focusable' just add the focus directive
```javascript
import { createApp } from 'vue'
import VueSpatialNavigation from "vue3-spatialnavigation";
const app = createApp();
app.use(VueSpatialNavigation);
```

```html
<Component id="button1" v-spat></Component>
<Component id="button2" v-spat></Component>
```

### CSS3 Element binding
Use data properties with a domId string reference to determine the focus action during navigation (this behaves similar to the CSS3 draft)
```html
<Component id="button1" v-spat data-down="button2"></Component>
<Component id="button2" v-spat data-up="button1"></Component>
```

### JS Component binding
Use vue bind directive with a component function reference to determine the focus action during navigation.
```html
<Component id="button1" v-spat @down="componentFunctionDown"></Component>
<Component id="button2" v-spat @up="componentFunctionUp" ></Component>
```
```javascript
import { createApp } from 'vue'
import VueSpatialNavigation from "vue3-spatialnavigation";
const app = createApp();
app.use(VueSpatialNavigation, {
  methods: {
    componentFunctionDown: () => {
      let el = navigationService.getFocusElementById("button2");
      if (el) el.focus()
    },
    componentFunctionUp: () =>  {
      let el = navigationService.getFocusElementById("button1");
      if (el) el.focus()
    }
  }
})
```

### Automatic focus handling
Use the special constant value 'AUTOFOCUS' to let the directive try to find the next focusable sibbling automatically. This only works if the next/prev focusable element is a sibling within the parent container!
```html
<Component id="button1" v-spat data-down="AUTOFOCUS"></Component>
<Component id="button2" v-spat data-up="AUTOFOCUS"></Component>
```

### Determine the first or default focus element
In case the page is just rendered and or focus is reset the directive should know which element to restore focus to. The directive will keep a reference to the last focussed element, but if that is not available it will restore focus to the 'default' focus element on the page.
```html
<Component id="button1" v-spat data-default data-down="button2"></Component>
<Component id="button2" v-spat data-up="button1"></Component>
```

### Enter action
When a user actions an 'enter' keypress it will automatically be converted into a click action on the element that has active focus. So you can use the regular vue @click bindings.
Note that by default vue only supports @click on html elements and you have to normally use @click.native on a component, this directive will automatically capture the native event though and convert it into a vue event so you can use @click for both native keyboard and mouse clicks.
```html
<Component id="button1" v-spat @down="componentFunctionDown"></Component>
<Component id="button2" v-spat @up="componentFunctionUp" @click="button2clicked"></Component>
```
```javascript
import { createApp } from 'vue'
import VueSpatialNavigation from "vue3-spatialnavigation";
const app = createApp();
app.use(VueSpatialNavigation, {
  methods: {
    componentFunctionDown: () => {
      let el = navigationService.getFocusElementById("button2");
      if (el) el.focus()
    },
    componentFunctionUp: () =>  {
      let el = navigationService.getFocusElementById("button1");
      if (el) el.focus()
    },
    button2clicked: () => {
      console.log("button2clicked");
    }
  }
})
```

## Configuration
The application uses a default keybinding for the d-pad and enter keys, during the directive initialisation this can optionally be overriden with the options object:

```javascript
import { createApp } from 'vue'
import VueSpatialNavigation from "vue3-spatialnavigation";
const app = createApp();
app.use(VueSpatialNavigation, {
  keyCodes: {
    "up": 38,
    "down": 40,
    "left": 37,
    "right": 39,
    "enter": 13
  }
})
```

It is also possible to override the NavigationService class to create a fully custom key binding.

```javascript
import { createApp } from 'vue'
import VueSpatialNavigation from "vue3-spatialnavigation";
import { NavigationService } from "vue3-spatialnavigation/navigation";
// custom navigation service 
class CustomNavigationService extends NavigationService {

}
const app = createApp();
app.use(VueSpatialNavigation, {
  navigationService: CustomNavigationService
})
```


## Styling
The directive will automatically assigned and remove the class "focus" on the html element to distingish an element in focus vs an element not in focus. The css "focus" class handling is fully handled by the directive and should not be changed/set manually.

```html
<style>
.focus { background-color: yellow;}
</style>
<Component id="button1" v-spat data-default data-down="AUTOFOCUS"></Component>
<Component id="button2" v-spat data-up="AUTOFOCUS"></Component>
```

## NavigationService
In addition to the directive this plugin also exposes a NavigationService object that allows control of the focusable elements from JS code. The navigation service keeps track of all focusable elements on the page and can be used to query focusable elements/

It provides the below properties:
```javascript
blockAllSpatialNavigation   // enabled / disable a navigation block (e.g. during loading)
```

It provides the below methods:
```javascript
NavigationService.getFocusElementInFocus()         // get FocusElement currently in focus
NavigationService.getFocusElementById(id)          // get FocusElement by DOM id
NavigationService.getFocusElementIsDefault()       // get FocusElement by default property
NavigationService.blurAllFocusElements()           // blur all FocusElements
```

## FocusElement
FocusElement is a class initialised for each dom element where the directive is applied, you can aquire the FocusElement by quering the NavigationService.

It provides the below properties:
```javascript
  FocusElement.id        // dom id reference
  FocusElement.isFocus   // is element currently focussed
  FocusElement.isDefault // is element a default focusable element
```

And the below properties:
```javascript
  FocusElement.focus()  // manually focus the current element
  FocusElement.blur()   // manually blur the current element
  FocusElement.left()   // manually trigger left action the current element
  FocusElement.right()  // manually trigger right action the current element
  FocusElement.up()     // manually trigger up action the current element
  FocusElement.down()   // manually trigger down action the current element
  FocusElement.enter()  // manually trigger enter action the current element
  ```