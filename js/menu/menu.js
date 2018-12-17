/*
 * 功能: 创建菜单
 * 作者: xl
 * 日期: 2018-07-20
*/

(function ($) {
    var menu = function () {
        var args = Array.prototype.concat.apply([], arguments);
        this.init.apply(this, args);
    };

    menu.defaultOptions = {
        /*
        [{
            text:"",
            href:"",
            icon:"",
            isTitle:false,
            children:[]
        }]
        */
        data: null,
        container: null
    };

    menu.prototype = {
        constructor: menu,
        options: null,
        container: null,
        dom: null,
        init: function (options) {
            this.options = $.extend(true, {}, this.constructor.defaultOptions, options);
            if (!this.options.container) {
                throw new Error("container can not be null.");
            }

            this.container = $(this.options.container);

            if (this.options.data) {
                this.render(this.options.data);
            }
        },

        render: function (data) {
            var html = ['<ul class="nav sidebar-menu">'];
            this.populateDom(data, html,0);
            html.push('</ul>');
            this.dom = $(html.join("")).appendTo(this.container);
        },

        destroy: function () {
            this.dom && this.dom.remove();
        },

        populateDom: function (data, html, lvl) {
            var that = this;
            $.each(data, function () {
                if (this.isTitle) {
                    html.push(['<li class="sidebar-label pt20" title="',this.text,'">', this.text].join(""));
                } else {
                    html.push(['<li title="',this.text,'"><a href="', this.href || 'javascript:;', '" ',
                        this.children && this.children.length ? ' class="accordion-toggle" ' : '', '>', '<span class="', this.icon,
                        '"></span>', lvl > 0 ? this.text : '<span class="sidebar-title">' + this.text + '</span>',
                        this.children && this.children.length ? '<span class="caret"></span>' : '', '</a>'
                    ].join(""));
                }
                if (this.children && this.children.length) {
                    html.push('<ul class="nav sub-nav">');
                    that.populateDom(this.children, html,lvl+1);
                    html.push('</ul>');
                }

                html.push('</li>');
            });
        }
    };


    $.fn.menu = function (options) {
        var result,
            args = Array.prototype.concat.apply([], arguments);
        this.each(function () {
            var $this = $(this),
                inst = $this.data("menu");
            if (inst) {
                if (args.length && typeof args[0] === "string") {
                    var mth = args.pop();
                    result = inst[mth].apply(inst, args);
                }
            } else {
                var arg = args.length && args[0];
                arg && (arg.container = $this);
                $this.data("menu", new menu(arg));
            }
        });

        return result === undefined ? this : result;
    }
})(jQuery);