/*
* 引用：jquery, jquery.validate.js,jquery.form.js,layer.js
* 描述：简单封装form
* 功能： 
*    1
* 作者：xl
* 时间： 2018-09-05
*/

(function ($) {
    // 当前layer 的索引
    var index = parent.layer.getFrameIndex(window.name);

    function fillForm(data) {
        if (data) {
            var
                $this = $(this),
                sData = data,
                key, val,
                control;
            if (data instanceof Array) {
                sData = {};
                $.each(data, function () {
                    sData[this.name] = this.value;
                });
            }

            for (key in sData) {
                val = sData[key];
                if (!val && !$.isNumeric(val)) {
                    val = "";
                }
                control = $this.find(["[name='", key, "']"]);

                if (control.is(":checkbox")) {
                    val = val.split(",");

                    $.each(control, function () {
                        var $this = $(this),
                            exist = false;
                        $.each(val, function () {
                            if ($this.val() == this) {
                                exist = true;

                                return false;
                            }

                        });
                        $this.prop("checked", exist);
                    });
                }
                else if (control.is(":radio")) {
                    $.each(control, function () {
                        var $this = $(this);
                        $this.prop("checked", $this.val() == val);
                    });
                }
                else {
                    control.val(val);
                }
            }
        }
    }

    $.getQuery = function (key) {
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i"),
            r = window.location.search.substring(1).match(reg),
            result = "";
        if (r != null) {
            result = unescape(r[2]);
        }

        return result;
    }

    $.fn.cusForm = function (option) {
        /*{
            getUrl:'',
            addUrl:'',
            editUrl:"",
            idField:'',
            saveBtn:"",
            cancelBtn:"",
            validate:{

            }
        }*/
        var 
        $this=$(this),
        idField=option.idField||"id",
        id=$.getQuery(idField);
        option=$.extend(true,{},{
            saveBtn:"#saveData",
            cancelBtn:"#cancel"
        },option);

        if(id){
            $("form").attr("action",option.editUrl);
            $this.fillForm(util.getUrl(option.getUrl.replace("{"+idField+"}",id)));
        }else{
            $("form").attr("action",option.addUrl);
        }

        $(option.cancelBtn).on("click",function(){
            parent.layer.close(index);
        });

        $this.ajaxForm({
            success: function (result) {
                // TODO: 
                parent.layer.msg("保存成功");
                parent.layer.close(index);
            },
            error: function () {
                parent.layer.msg("内部错误");
            },
            complete: function () {
    
            }
        }).validate(option.validate);


    };

    $.fn.fillForm = function (data) {
        if (data) {
            if (typeof data === "string") {
                layer.load();
                $.get(data).then(function (result) {
                    fillForm(result.data[0]);
                }).error(function () {
                    layer.alert("数据加载失败");
                }).complete(function(){
                    layer.closeAll();
                });
            } else {
                fillForm(data);
            }
        }
    }

})(jQuery);