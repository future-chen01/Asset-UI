/*
* 引用： jquery.easyui.js, jquery.datetimepicker.js
* 功能： 定义各种自定义的插件
* 作者： xl
* 时间： 2018-9-9
*/


(function ($) {

    // 部门
    $.fn.orgTree = function () {

    };
    // 人员
    $.fn.userList = function () {

    };
    // 使用地， 使用方向
    $.fn.positionList = function () {
        $(this).select2({
            ajax: {
                url: util.getUrl("/assetUseDirection/listAssetUseDirection?start=0&length=10000"),
                processResults: function (data) {
                    $.each(data.data, function () {
                        this.id = this.assetusedirectionId;
                        this.text = this.assetusedirectionName;
                    });
                    return {
                        results: data.data
                    };
                }
            }
        });
    };
    // 日期
    $.fn.cusDate = function () {
        $this.datetimepicker({
            autoclose:true,
            startView:"month",
            minView:"month",
            format:format,
            language:"zh-CN"
        });
    };

    // 开始日期-结束日期
    $.fn.startEndDate = function () {
        var $this = $(this),
            group = $this.data("group"),
            type = $this.data("type"),
            start,end,
            format="yyyy-mm-dd hh:ii:ss";
        
        if(type=="start"){
            // start
            end=$("[group='"+group+"']").find("[data-type='end']");
            $this.datetimepicker({
                autoclose:true,
                startView:"month",
                minView:"month",
                format:format,
                language:"zh-CN"
            }).on("changeDate",function(e){
                end.datetimepicker("setStartDate",e.date);
            });
        }else{
            // end
            start=$("[group='"+group+"']").find("[data-type='start']");
            $this.datetimepicker({
                autoclose:true,
                startView:"month",
                minView:"month",
                format:format,
                language:"zh-CN"
            }).on("changeDate",function(e){
                start.datetimepicker("setEndDate",e.date);
            });
        }
    };

    // 资产类别
    $.fn.categoryTree = function () {
        $(this).combotree({
            url: util.getUrl("/assetClassify/listAssetClassify?start=0&length=10000"),
            loadFilter: function (data, parent) {
                return toTree(data.data, "assetClassifyId", "assetClassifyName", "assetClassifyParentid");
            }
        });
    };

    // 来源
    $.fn.sourceList = function () {
        $(this).select2({
            ajax: {
                url: util.getUrl("/assetSource/listAsset?start=0&length=10000"),
                processResults: function (data) {
                    $.each(data.data, function () {
                        this.id = this.assetsourceId;
                        this.text = this.assetsourceName;
                    });
                    return {
                        results: data.data
                    };
                }
            }
        });
    }

    $(function () {
        $('[data-control]').each(function () {
            var $this = $(this),
                control = $this.data("control");
            $this[control]();
        });
    });

    function toTree(data, idKey, parentIdKey, textKey) {
        idKey = idKey || "id";
        parentIdKey = parentIdKey || "parentId";
        textKey = textKey || "text";

        var result = [],
            parentId,
            id,
            text;
        $.each(data, function (idx, elem) {
            id = this[idKey];
            parentId = this[parentIdKey];
            text = this[textKey];
            this.id = id;
            this.text = text;
            var exist = false;
            if (parentId || parentId === 0) {
                $.each(data, function (i, el) {

                    if (this[idKey] == parentId) {
                        exist = true;
                        if (this.children) {
                            this.children.push(elem);
                        } else {
                            this.children = [elem];
                        }

                        return false;
                    }
                });
            }
            if (!exist) {
                result.push(this);
            }
        });

        return result;
    }

    window.getStatus=function getStatus(val){
        var statuses=["入库",
            "领用中", 
            "退库", 
            "维护",
            "报废",
            "盘点",
            "遗失"],
        result=val;
        if($.isNumeric(val) && val>=0 && val<statuses.length){
            result=statuses[val];
        }

        return result;
    }

})(jQuery);