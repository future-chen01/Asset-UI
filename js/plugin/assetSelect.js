/*
 * 说明: 选择物资
 * 功能: 1. 可新增物资
 *      2. 可删除选择的物资
 *      3. 选择物资时, 可以进行查询
 * 作者: xl 
 * 时间: 2018-08-12
 * 
*/


(function () {
    "use strict";

    var AssetSelect = window.AssetSelect = function () {
        var args = Array.prototype.concat.apply([], arguments);
        this.init.apply(this, args);
    }

    AssetSelect.defaultOption = {
        dom: null,
        data:null
    };

    AssetSelect.prototype = {
        constructor: AssetSelect,
        options: null,
        $dom: null,
        $table: null,
        $add: null,
        $subTable: null,
        subIndex:null,
        $subQuery: null,
        init: function (options) {
            this.options = $.extend(true, {}, this.constructor.defaultOption, options);
            if (!this.options.dom) {
                throw new Error("dom can not be null.");
            }
            this.$dom = $(this.options.dom);

            this.renderTable();
            if(this.options.data){
                this.setData(this.options.data);
            }
            this.initEvent();
        },
        renderTable: function () {
            var
                that = this,
                html = ['<div class="toolbar"><a class=" btn btn-primary btn-add-asset glyphicon glyphicon-plus" >选择资产</a></div>'];
            html.push('<table ></table>');
            $(html.join("")).appendTo(this.$dom);
            this.$table = this.$dom.find("table");
            this.$add = this.$dom.find("a.btn-add-asset");

            this.$table.bootstrapTable({
                columns: [{
                    field: "selection",
                    checkbox: true
                }, {
                    field: "operate",
                    title: "操作",
                    formatter: function (value, row, index) {
                        return '<a href="javascript:;" class="btn btn-danger glyphicon glyphicon-remove"></a>';
                    },
                    events: {
                        "click a.glyphicon-remove": function (e, value, row, index) {
                            layer.confirm("确定删除吗?", function () {
                                that.$table.bootstrapTable("getRowByUniqueId", row.id);
                            });
                        }
                    }
                }, {
                    field: "id",
                    title: "id",
                    visible: false,
                    align: "center"
                }, {
                    field: "code",
                    title: "资产编码",
                    sortable: true,
                    align: "center"
                }, {
                    field: "name",
                    title: "资产名称",
                    sortable: true,
                    align: "center"
                }, {
                    field: "category",
                    title: "资产类别 ",
                    sortable: true,
                    align: "center"
                }, {
                    field: "inTime",
                    title: "入库时间",
                    sortable: true,
                    align: "center"
                }, {
                    field: "user",
                    title: "使用人",
                    sortable: true,
                    align: "center"
                }, {
                    field: "useOrg",
                    title: "使用部门",
                    sortable: true,
                    align: "center"
                }]
            });
        },
        getData: function () {
            return this.$table.bootstrapTable("getData");
        },
        initEvent: function () {
            var that = this;
            this.$add.on("click", function (e) {
                e.preventDefault();
                that.subIndex= layer.open({
                    area: ["50%", "50%"],
                    content: that.getSubPageContent()
                });
                that.$subTable = $(".sub-page .sub-table").bootstrapTable({
                    columns: [{
                        field: "selection",
                        checkbox: true
                    }, {
                        field: "id",
                        title: "id",
                        visible: false,
                        align: "center"
                    }, {
                        field: "code",
                        title: "资产编码",
                        sortable: true,
                        align: "center"
                    }, {
                        field: "name",
                        title: "资产名称",
                        sortable: true,
                        align: "center"
                    }, {
                        field: "category",
                        title: "资产类别 ",
                        sortable: true,
                        align: "center"
                    }, {
                        field: "inTime",
                        title: "入库时间",
                        sortable: true,
                        align: "center"
                    }, {
                        field: "user",
                        title: "使用人",
                        sortable: true,
                        align: "center"
                    }, {
                        field: "useOrg",
                        title: "使用部门",
                        sortable: true,
                        align: "center"
                    }]
                });
            });

            $(document).on("change", ".sub-page input[name='query']", function () {
                // 查询数据
                that.$subTable.bootstrapTable("refresh");
            });

            $(document).on("click", ".sub-page button.glyphicon-ok", function () {
                var data=that.$subTable.bootstrapTable("getData");
                layer.close(that.subIndex);
                that.addData(data);
                
            }).on("click", ".sub-page button.glyphicon-log-out", function () {
                // close
                layer.close(that.subIndex);
            });

        },

        getSubPageContent: function () {
            var html = ['<div><div class="action-heading sub-page">',
                '<div class="page-x-query admin-form">',
                '<label class="field prepend-icon">',
                '<input type="text" name="query" class="gui-input" placeholder="输入搜索内容">',
                '<label for="query" class="field-icon">',
                '<i class="fa fa-search"></i>',
                '</label>',
                '</label>',
                '</div> <table class="sub-table"></table>',
                '<div style="clear:both;"></div>',
                '</div><div class="row form-actions sub-page-actions">',
                '<button type="button" class="btn btn-primary glyphicon glyphicon-ok" >确定</button>',
                '<button type="button" class="btn btn-default glyphicon glyphicon-log-out btn-split" >取消</button>',
                '</div></div>'];

            return html.join("");
        },

        setData: function (data) {
         this.$table.bootstrapTable("load", data);
        },
        addData:function(data){
            var that=this;
            $.each(data,function(){
            that.$table.bootstrapTable("append",this);
            });
        }
    };
})();