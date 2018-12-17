/*
*
* 功能： 简单封装 bootstraptable
* 作者： xl
* 时间： 2018-09-05
*/


(function ($) {
    var defaultOption = {
        queryBtnSelector: "",
        querySelector: "",
        url: "",
        sortName: undefined,
        sortOrder: 'asc',
        sortStable: true,
        dataField: "rows",
        totalField: "total",
        sidePagination:"server",
        pagination:true,
        
        ajaxOptions:{
            timeout:30000

        },
        queryParams: function (params) {
            return params;
        },

        responseHandler: function (res) {
            var result = res || {};
            switch (result.statusCode) {
                case util.keyConst.SUCCESS_CODE:
                    res=res.data;
                    result.total=res.count;
                    result.rows=res.list;
                    break;
                case util.keyConst.ERROR_CODE:
                    layer.msg(result.msg);
                    result.count = 0;
                    result.data = [];
                    break;
                case util.keyConst.AUTHORIZE_CODE:
                    util.toLogin();
                    break;
            }

            return result;
        },
        onLoadError: function () {
            layer.msg("网络错误");
        },
        rememberOrder: false,
        striped: true,
        events: {
            add: {
                selector: "",
                layerOption: {
                    content: "",
                    anim: 0,
                    type: 2,
                    title: "新增",
                    btn: false,
                    offset: "t",
                    area: ["80%", "80%"]
                }
            },
            edit: {
                layerOption: {
                    content: "",
                    anim: 0,
                    type: 2,
                    title: "修改",
                    btn: false,
                    offset: "t",
                    area: ["80%", "80%"]
                }
            },
            remove: {
                url: "",
                data: {
                    id:null
                }
            }
        }
    };
    $.fn.xBootstrapTable = function (option) {
        var opt = $.extend(true, {}, defaultOption, option),
            queryParams = opt.queryParams,
            events = opt.events,
            $this = $(this),
            editOpt = events.edit,
            removeOpt = events.remove;
        delete opt.events;
        if (editOpt || removeOpt) {
            // 关闭后默认刷新当前表格
            if (editOpt && editOpt.layerOption && !editOpt.layerOption.end) {
                editOpt.layerOption.end = function () {
                    $this.bootstrapTable("refresh");
                }
            }
            var opCol={
                field: "operation",
                title:"操作",
                formatter: function (value, row, index) {
                    var html = ['<div class="row-btn-container">'];
                    if (events.edit) {
                        html.push('<a href="javascript:;" class="btn btn-primary btn-edit glyphicon glyphicon-edit" >修改</a>');
                    }
                    if (events.remove) {
                        html.push('<a href="javascript:;" class="btn btn-danger btn-remove glyphicon glyphicon-remove">删除</a>')
                    }
                    html.push('</div>');
                    return html.join("");
                },
                events: {
                    "click a.btn-edit": function (e, value, row, index) {
                        var
                            url = editOpt.layerOption.content,
                            regex = /\{(\S+?)\}/g;
                        editOpt.layerOption.content = url.replace(regex, function (str, content, index, o) {
                            return row[content] || "";
                        });
                        layer.open(editOpt.layerOption);
                    },
                    "click a.btn-remove": function (e, value, row, index) {
                        layer.confirm("确定要删除吗?", function () {
                            var url = removeOpt.url,
                                key, data = {};
                            for (key in removeOpt.data) {
                                data[key] = row[key];
                            }

                            util.ajax({
                                url: url,
                                data: data,
                                type:"POST",
                                success: function (data) {
                                    layer.msg("删除成功");
                                    $this.bootstrapTable("refresh");
                                }
                            });
                        });

                    }
                }
            };
            if(opt.columns[0].field=="selection"){
                opt.columns.splice(1,0,opCol);
            }else{
                opt.columns.unshift(opCol);
            }

            // add operate column
            opt.columns.unshift();
        }

        opt.url = opt.url;
        opt.queryParams = function (params) {
            var pars = $(opt.querySelector).serializeArray(),
                parsObj = {};
            $.each(pars, function () {
                parsObj[this.name] = this.value;
            });
            params.start=params.offset;
            params.length=params.limit;
            return $.extend(params, util.getLoginInfo(), parsObj);
        };

        $(opt.queryBtnSelector).on("click", function () {
            $this.bootstrapTable("refresh");
        });
        if(events.add){
            $(events.add.selector).on("click", function () {
                layer.open(events.add.layerOption);
            });
        }


        // 调整表格大小
        var process = null;

        function resize() {
            if ($.isNumeric(process)) {
                clearTimeout(process);
                process = null;
            }

            process = setTimeout(function () {
                if (!$this.is(":hidden")) {
                    var $win = $(window),
                        height = $win.height,
                        offset = $this.offset(),
                        tableHeight = height - offset.top;
                    $this.bootstrapTable("resetView", {
                        height: tableHeight
                    });
                }

            }, 300);
        }
        $this.bootstrapTable(opt);
        $(window).on("resize", resize).trigger("resize");

        return $this;
    }
})(jQuery);