/*
* 描述: 生成主页面, 实现查询, 展示, 新增, 修改等功能
* 功能:
    1. 查询条件
    2. 表格展示
    3. 可以生成多Tab 
  作者: xl
  日期: 2018-08-05
*/

(function ($) {
    "use strict";

    var PageTable = window.PageTable = function () {
        var args = Array.prototype.concat.apply([], arguments);
        this.init.apply(this, args);
    },
        guid = 0;

    function getGuid() {
        return 'page-x-' + guid++;
    }

    PageTable.defaultOptions = {
        dom: null,
        // add
        actions: null,
        /*
        * {
        *   query:[{
        *    name:"",
             tag:"",
        *    type:"",
        *    source:"" 
        *   }],
        *   hide:[{
        *     name:"",
        *     tag:"",
              type:""
        *    }]
        * }
        */
        query: null,
        /*
        * [{
        *   title:"",
        *   table:{}
        * }]
        */
        tabs: null,
        table: null,
        // 删除的数据接口
        delUrl: null,
        // 新增的数据接口
        addUrl: null,
        // 修改的数据接口
        updateUrl: null,
        // 新增的内容
        addForm: null,
        // 修改的内容
        updateForm: null
    };

    PageTable.prototype = {
        constructor: PageTable,
        options: null,
        queryData: null,
        $action: null,
        $query: null,
        $hideQuery: null,
        $hideQueryPanel: null,
        $tab: null,
        $dom: null,
        $tables: null,
        $tableContainer: null,
        init: function (options) {
            this.options = $.extend(true, {}, this.constructor.defaultOptions, options);
            if (!this.options.dom) {
                throw new Error("dom can not be null.");
            }
            this.queryData = {};
            this.$tables = [];
            this.$dom = $(this.options.dom);
            this.createDom();
        },

        createDom: function () {
            // actions
            this.$action = $(['<div class="page-action" ></div>'].join("")).appendTo(this.$dom);

            // query
            this.$query = $(['<div class="page-query"></div>'].join("")).appendTo(this.$dom);


            // tab
            if (this.options.tabs) {
                this.$tab = $(['<div class="page-tab panel" ></div>'].join("")).appendTo(this.$dom);
            }
            // table
            else if (this.options.table) {
                this.$tableContainer = $(['<div class="page-table-container"></div>'].join("")).appendTo(this.$dom);
            }
        },

        createTableDom: function (table) {
            return ['<table></table>'].join("");
        },

        initEvent: function () {
            var that = this,
                tabActive = "active";
            // 查询
            $(".btn-query").on("click", function (e) {
                that.serilizeQuery();
            });

            // tab 切换
            this.$tab.on("click", "ul li", function () {
                var $this = $(this),
                    selected = $this.hasClass(tabActive),
                    idx = $this.index();
                if (!selected) {
                    that.refreshData();
                }
            });

            this.$action.on("click","a.page-table-add",function(){
                
            });
        },

        // refresh currentdata
        refreshData: function () {

        },

        serilizeQuery: function () {
            var that = this;
            this.$query.find("[name]").each(function () {
                var $this = $(this),
                    name = $this.attr("name"),
                    val = $this.val();
                that.queryData[name] = val;
            });
        },

        renderQuery: function () {
            var html = ['<div class="page-query-inputs"></div><div class="page-query-btn">',
                '<button type="button" class="btn btn-lg btn-dark btn-block btn-query">查询</button></div>'],
                $container = $(html.join("")).appendTo(this.$query).find(".page-query-inputs"),
                control;

            $.each(this.options.query, function () {
                control = new Control($.extend({}, this, {
                    dom: $container
                }));
            });
        },
        renderTab: function () {
            if (this.options.tabs) {
                var head = [],
                    that = this,
                    body = [],
                    $head = $('<div class="panel-heading"><ul class="nav panel-tabs-border panel-tabs panel-tabs-left"></ul></div>')
                        .appendTo(this.tabs).find(".panel-tabs"),
                    $body = $('<div class="panel-body"><div class="tab-content pn br-n"></div></div>')
                        .appendTo(this.tabs).find('.tab-content');
                $.each(this.options.tabs, function () {
                    var id = getGuid();
                    head.push('<li class=""><a href="#', id,
                        '" data-toggle="tab">', this.title, '</a></li>');
                    body.push('<div id="', id, '" class="tab-pane">', that.createTableDom(), '</div>');
                    that.$tables.push(null);
                });

                $(head.join("")).appendTo($head);
                $(body.join("")).appendTo($body);
            }
        },
        initTable: function ($table, opts) {
            var that = this,
                oldQuery = opts.queryParams;
            // 查询条件
            opts.queryParams = function (params) {
                var old = oldQuery && oldQuery() || {};
                return $.extend(true, params, old, that.queryData);
            };
            // 如果没有 禁用操作
            if (!opts.disabledEdit || opts.disabledRemove) {
                // 操作列, 在第一列插入操作列, 如果第一列不是序列和checkbox, radio
                // if fix columns
                var cols = opt.columns;
                if (opt.columns[0] instanceof Array) {
                    cols = opt.columns[0];
                }
                var i = 0, length = cols.length,
                    col;
                for (; i < length; i++) {
                    col = cols[i];
                    if (col.field !== "rowNumber" && !col.radio && !col.checkbox) {
                        cols.splice(i, 0, {
                            field: "cusOperate",
                            title: "操作",
                            align: "center",
                            formatter: function (value, row, index) {
                                // 编辑, 删除
                                return [!opts.disabledEdit ? '<a href="javascript:;" class="page-table-update glyphicons glyphicons-edit">修改</a>' : "",
                                !opts.disabledRemove ? '<a href="javascript:;" class="page-table-delete glyphicons glyphicons-remove_2">删除</a>' : ""].join("");
                            },
                            events: {
                                "click a.page-table-update": function (e, value, row, index) {

                                },
                                "click a.page-table-delete": function (e, value, row, index) {
                                    layer.confirm("确认删除吗?",function(){
                                        var data={};
                                        data[opts.idField]=row[idField];
                                        $.ajax({
                                            url:that.options.delUrl,
                                            data:data,
                                            type:"POST",
                                            success:function(){
                                                layer.msg("删除成功.");

                                                that.refreshData();
                                            },
                                            error:function(){
                                                layer.alert("删除失败");
                                            }
                                        });
                                    });
                                }
                            }
                        });
                        break;
                    }
                }
            }
            $table.bootstrapTable(opt);
        },
        renderActions: function () { 
            // add button
            if(!this.options.disabledAdd){
                $(['<a href="javascript:;" class="page-table-add glyphicon glyphicon-plus">新增</a>'].join("")).appendTo(this.$action);
            }
        },
        initForm:function(opts){

        }

    };

})(jQuery)