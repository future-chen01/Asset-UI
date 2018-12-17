/*
 * 描述: 用于生成前端的各种控件
 * 功能: 
 *     1. 根据配置, 生成表单控件
 *     2. 使用knockout 进行双向绑定
 *     3. 使用knockout-validation对相关字段进行验证
 * 作者: xl
 * 日期: 2018-08-05
 */

(function ($) {
    "use strict";
    var guid = 0,
        Control = window.Control = function () {
            var args = Array.prototype.concat.apply([], arguments);
            return this.init.apply(this, args);
        };

    function getGuid() {
        return "control-x-" + guid++;
    }

    Control.defaultOptions = {
        tag: "input",
        type: "date",
        container: null,
        value: null,
        binds: null
    };

    Control.extend = function (options) {
        var that = this,
            fun = function () {
                that.apply(this, Array.prototype.concat.apply([], arguments));
            };

        $.extend(fun, that, options);
        $.extend(fun.prototype, that.prototype, options.prototype);

        return fun;
    }


    Control.prototype = {
        constructor: Control,
        options: null,
        container: null,
        dom: null,
        init: function (options) {
            if (options.tag) {
                var obj;
                switch (options.tag) {
                    case "select":
                        obj = new Select(options);
                        break;
                    case "textarea":
                        obj = new TextArea(options);
                        break;
                    default:
                        obj = new Input(options);
                        break;
                }
                return obj;
            } else {
                this.options = $.extend({}, this.constructor.defaultOptions, options);
                if (!this.options.container) {
                    throw new Error("dom can not be null.");
                }

                this.container = $(this.options.container);
                this.dom = $(this.getDom());
                this.renderDom();
                this.initEvent();
                if (this.options.value) {
                    this.setValue(this.options.value);
                }
                return this;
            }
        },

        getBind: function () {
            if (this.options.binds) {
                var json = JSON.stringify(this.options.binds);
                // 去除前后{}
                json = json.substring(1, json.length - 1)
                    .substring(0, json.length - 1)
                    .replace(/"/g, "'").replace(/"(\S+?)"\:/g, function (g, k, i, s) {
                        return k + ":";
                    });
            }

        },
        getDom: function () {

        },
        renderDom: function () {
            this.dom.appendTo(this.container);
        },
        initEvent: function () {
            var key, val;
            for (key in this.options.events) {
                this.dom.on(key, this.options.events[key]);
            }
        },
        getValidate: function () { },
        setValue: function (value) {
            this.dom.val(value);
        },
        getValue: function () {
            return this.dom.val();
        }
    };

    // input 
    var Input = Control.extend({
        defaultOptions: {
            type: "text",
            placeholder: "",
            name: "",
            value: "",
            id: null,
            icon: null
        },
        prototype: {
            constructor: Input,
            getDom: function () {
                var id = getGuid();
                var html = ['<label class="field ', this.options.icon ? "prepend-icon" : ""
                    , '">', '<input type="', this.options.type, '" id="' + id + '" placeholder="'
                    , this.options.placeholder, '" name="', this.options.name, '" '
                    , this.options.id ? (' id="' + this.options.id + '"') : ""
                    , this.options.binds ? (' data-bind="' + this.getBind() + '" ') : "", ' />',
                    this.options.icon ? ('<label for="' + id + '" class="field-icon">'
                        + '<i class="' + this.options.icon + '"></i>'
                        + '</label>') : "",
                    '</label>'];
                return html.join("");
            },
            initEvent: function () {
                var key, val;
                for (key in this.options.events) {
                    this.dom.find("input").on(key, this.options.events[key]);
                }
            }
        }
    }),

        Select = Control.extend({
            defaultOptions: {
                source: null,
                placeholder: "",
                textField: "text",
                valueField: "value",
                value: null
            },
            prototype: {
                contructor: Select,
                getDom: function () {
                    var that = this,
                        data = this.options.source,
                        html = ['<select >'];

                    if ($.isFunction(data)) {
                        data = data();
                    }

                    if (data instanceof Array) {
                        $.each(data, function () {
                            html.push('<options value="', this[that.options.valueField] || "", '" >',
                                this[that.options.valueField], '</options>');
                        });
                    }

                    html.push('</select>');

                    return html.join("");
                },
                renderDom: function () {
                    this.dom.appendTo(this.container);
                    if (!$.isFunction(this.options.source) && !(this.options.source instanceof Array)) {
                        this.dom.select2({
                            ajax: this.options.source
                        });
                    } else {
                        this.dom.select2({});
                    }
                }
            }
        }),
        TextArea = Control.extend({
            defaultOptions: {
                tip: null,
                placeholder: null
            },
            prototype: {
                constructor: TextArea,
                getDom: function () {
                    var id = getGuid();
                    var html = ['<label class="field ', this.options.icon ? "prepend-icon" : "", '">',
                        '<textarea id="', id, '" class="gui-textarea" name="', this.options.name,
                        '" placeholder="',
                        this.options.placeholder, '"></textarea>',
                        this.options.icon ? ('<label for="' + id + '" class="field-icon">'
                            + '<i class="' + this.options.icon
                            + ' "></i>'
                            + '</label>') : "",
                        this.options.tip ? ('<span class="input-footer">'
                            + this.options.tip + '</span>') : "",
                        ' </label>'];
                    return html.join("");
                },
                initEvent: function () {
                    var key, val;
                    for (key in this.options.events) {
                        this.dom.find("textarea").on(key, this.options.events[key]);
                    }
                }
            }
        });;

})(jQuery);