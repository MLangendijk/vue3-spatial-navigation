import {NavigationService} from "./navigation.js";
import { isFunction } from "./utils";

// export navigation service
export let navigationService;

// export focus element
export class FocusElement {
    static AutoFocus = "AUTOFOCUS";

    // private properties
    _$el = null;
    _left = undefined;
    _right = undefined;
    _up = undefined;
    _down = undefined;
    _listeners = {
        focus: false,
        blur: false,
        left: false,
        right: false,
        up: false,
        down: false,
        click: false
    };

    // directive identifier (matches related DOM id)
    id = "";
    // is element 'focussed'
    isFocus = false;
    // is element 'selected'
    isSelect = false;
    // should element be 'focussed' by default on rendering
    isDefault = false;

    // directive initialisation
    constructor(vnode) {
        if (vnode && vnode.props) {
            let el = vnode.el;
            const props = vnode.props;

            // enforce a dom id on all focusable elements, if it does not exist generate an id
            if (!el.id) {
                el.id = "focus-el-" + Math.random().toString(36).replace(/[^a-z]+/g, "").substr(0, 10);
            }

            // cache dom properties in directive
            this.id = el.id;
            this.props = props;

            this.isDefault = (props['data-default'] === "" || props['data-default'] === "true");
            this._left = (props['data-left'] || props['onLeft'] || "");
            this._right = (props['data-right'] || props['onRight'] || "");
            this._up = (props['data-up'] || props['onUp'] ||"");
            this._down = (props['data-down'] || props['onDown'] ||"");

            // do not cache the listener logic to prevent memory leaks
            // instead cache the existence of a specific listener in the directive
            this._listeners = {
                focus: !!(props['data-focus'] || props['onFocus']),
                blur: !!(props['data-blur'] || props['onBlur']),
                left: !!(props['data-left'] || props['onLeft']),
                right: !!(props['data-right'] || props['onRight']),
                up: !!(props['data-up'] || props['onUp']),
                down: !!(props['data-down'] || props['onDown']),
                click: !!(props['onClick'])
            };
        }
    }

    // cleanup when directive is destroyed
    destroy() {
        this.id = null;
        this.props = null;
        this.isDefault = false;
        this.isFocus = false;
        this.isSelect = false;
        this._$el = undefined;
        this._left = undefined;
        this._right = undefined;
        this._up = undefined;
        this._down = undefined;
        this._listeners = {
            focus: false,
            blur: false,
            left: false,
            right: false,
            up: false,
            down: false,
            click: false
        };
    }

    // get dom reference of directive
    get $el() {
        if (this._$el) return this._$el;
        return this._$el = document.getElementById(this.id);
    }

    //// focus handling
    // set focus to element
    focus() {
        // blur other element, can only be 1 element in focus
        navigationService.blurAllFocusElements();
        // store focus action in navigation service so we can restore it if needed
        navigationService.lastElementIdInFocus = this.id;
        // set the current element in focus
        this.isFocus = true;
        if (this.$el) {
            this.$el.className += " focus";
            if (this._listeners.focus && isFunction(this.props.onFocus)) {
                try {
                    this.props.onFocus();
                } catch (e) {
                }
            }
        }
        // set 'native' browser focus on input elements and focusable elements.
        if (this.$el && (this.$el.tabIndex !== -1 || this.$el.nodeName === "INPUT" || this.$el.nodeName === "TEXTAREA")) this.$el.focus();
    }

    // remove focus from element
    blur() {
        this.isFocus = false;
        if (this.$el) {
            this.$el.className = this.$el.className.replace(/\s?\bfocus\b/, "");
            if (this._listeners.blur) {
                try {
                    this.props.onBlur();
                } catch (e) {
                }
            }
        }
        // if (this.$el && (this.$el.nodeName === "INPUT" || this.$el.nodeName === "TEXTAREA")) this.$el.blur();
    }

    //// select handling
    // set element as selected
    select() {
        this.isSelect = true;
        if (this.$el) this.$el.className += " select";
    }

    // remove selected state from element
    deSelect() {
        this.isSelect = false;
        if (this.$el) this.$el.className.replace(/\bselect\b/, "");
    }

    //// spatial navigation
    // move focus to the element/action configured as 'left' from this element
    left(event) {
        // check if we should automatically find next focusable element
        if (this._left === FocusElement.AutoFocus) {
            this.defaultFocusPrevious();
            // check if next focusable element should be set based on a DOM id pointer
        } else if (this._left && !isFunction(this._left)) {
            this.doFocusElement(this._left);
        }
        // check if a event method is binded to the component
        if (this._listeners.left && isFunction(this.props.onLeft)) {
            try {
                this.props.onLeft(event);
            } catch (e) {
            }
        }
    }

    // move focus to the element/action configured as 'right' from this element
    right(event) {
        // check if we should automatically find next focusable element
        if (this._right === FocusElement.AutoFocus) {
            this.defaultFocusNext();
            // check if next focusable element should be set based on a DOM id pointer
        } else if (this._right && !isFunction(this._right)) {
            this.doFocusElement(this._right);
        }
        // check if a event method is binded to the component
        if (this._listeners.right && isFunction(this.props.onRight)) {
            try {
                this.props.onRight(event);
            } catch (e) {
            }
        }
    }

    // move focus to the element/action configured as 'up' from this element
    up(event) {
        // check if we should automatically find next focusable element
        if (this._up === FocusElement.AutoFocus) {
            this.defaultFocusPrevious();
            // check if next focusable element should be set based on a DOM id pointer
        } else if (this._up && !isFunction(this._up)) {
            this.doFocusElement(this._up);
        }
        // check if a event method is binded to the component
        if (this._listeners.up && isFunction(this.props.onUp)) {
            try {
                this.props.onUp(event);
            } catch (e) {
            }
        }
    }

    // move focus to the element/action configured as 'down' from this element
    down(event) {
        // check if we should automatically find next focusable element
        if (this._down === FocusElement.AutoFocus) {
            this.defaultFocusNext();
            // check if next focusable element should be set based on a DOM id pointer
        } else if (this._down && !isFunction(this._down)) {
            this.doFocusElement(this._down);
        }
        // check if an event method is bound to the component
        if (this._listeners.down && isFunction(this.props.onDown)) {
            try {
                this.props.onDown(event);
            } catch (e) {
            }
        }
    }

    enter(event) {
        if (this._listeners.click && isFunction(this.props.onClick)) {
            try {
                this.props.onClick(event);
            } catch (e) {
            }
        }
    }

    defaultFocusNext() {
        if (this.$el) {
            // check if we can find a sibling element
            const next = this.$el.nextElementSibling;
            // check if element exist and has id
            if (next && next.id) {
                // set focus to component
                this.doFocusElement(next.id);
            }
        }
    }

    defaultFocusPrevious() {
        if (this.$el) {
            // check if we can find a sibling element
            const previous = this.$el.previousElementSibling;
            // check if element exist and has current directive selector
            if (previous && previous.id) {
                // set focus to component
                this.doFocusElement(previous.id);
            }
        }
    }

    doFocusElement(id) {
        let el = navigationService.getFocusElementById(id);
        if (el) el.focus();
    }
}

// Vue plugin
export default {
    install: function (app, options) {
        if (!options) options = {};
        // initialise navigation service
        if (!options.keyCodes) {
            options.keyCodes = {
                "up": 38,
                "down": 40,
                "left": 37,
                "right": 39,
                "enter": 13
            };
        }
        navigationService = (options.navigationService) ? new options.navigationService(options.keyCodes) : new NavigationService(options.keyCodes);

        // Expose navigation service globally.
        app.config.globalProperties.$nav = navigationService;

        app.directive("spat", {
            // directive lifecycle
            mounted: (el, binding, vnode) => {
                let focusElement = new FocusElement(vnode);
                navigationService.registerFocusElement(focusElement);

                // set this element in focus if no element has focus and this is marked default
                if (focusElement.isDefault && !navigationService.getFocusElementInFocus()) {
                    focusElement.focus();
                }
            },
            beforeUnmount: (el, binding, vnode) => {
                if (el.id) {
                    let focusElement = navigationService.getFocusElementById(el.id);
                    if (focusElement) navigationService.deRegisterFocusElement(focusElement);
                }
            }
        });
    }
};
