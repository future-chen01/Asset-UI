/*
 * 描述: 用于上传照片
 * 功能: 
 *    1. 选中照片上传
 *    2. 可以多选
 *    3. 可以预览
 *    4. 可以删除
 * 作者: xl
 * 时间: 2018-06-15
 * 
 * */

(function () {
    window.ImageUpload = function ImageUpload() {
        var args = [];
        args = Array.prototype.concat.apply([], arguments);
        this.init.apply(this, args);
    };

    ImageUpload.defaultOptions = {
        multiple: true,
        dom: null,
        // 缩略图类
        thumbnailClass: "",
        // 预览
        preview: true,
        readonly:false,

        // 最多上传的图片数量
        maximum: 5,
        loadUrl:''
    };
    ImageUpload.prototype = {
        constructor: ImageUpload,
        options: null,
        $dom: null,
        $plus: null,
        $file: null,
        guid: null,
        $preview:null,
        $container:null,
        init: function (options) {
            this.options = $.extend(true, {}, this.constructor.defaultOptions, options);
            if (!this.options.dom) {
                throw new Error("dom can not be null.");
            }
            this.guid = 0;
            this.$dom = $(this.options.dom);
            if (!this.$dom.is(":hidden")) {
                this.$dom.hide();
            }
            this.createDomContainer();
            this.initDom();
            this.initEvent();
            this.createPreviewContainer();
            this.initValue();
            this.setReadonly(this.options.readonly);
        },

        getGuid: function () {
            return 'upload-' + this.guid++;
        },

        createDomContainer: function () {
            var $parent = this.$dom.parent();
            this.$container = $('<div class="image-upload"><input type="file" style="display:none;" '
                + (this.options.multiple ? 'multiple="multiple"' : '') + '/></div>').appendTo($parent);
            this.$file = this.$container.find("[type='file']");
        },

        setReadonly: function (bl) {
            if (bl) {
                this.$plus.hide();
                this.$container.find(".thumbnail-delete ").hide();
            } else {
                this.$plus.show();
                this.$container.find(".thumbnail-delete ").show();
            }
        },

        initValue: function () {
            var val = this.$dom.val(),
                that=this;
            if (val) {
                val = JSON.parse(val);

                $.each(val, function () {
                    this.guid = that.getGuid();
                    that.loadImg(that.options.loadUrl + this.path, this.guid);
                });
                this.$dom.val(JSON.stringify(val));
            }
        },

        addValue: function (data) {
            var val = this.$dom.val();
            if (val) {
                val = JSON.parse(val);
            } else {
                val = [];
            }

            var exist = false;
            // 判断是否已存相同的图片
            $.each(val, function () {
                if (this.title == data.title && data.data == this.data) {
                    exist = true;
                    return false;
                }
            });

            if (!exist) {
                data.guid = this.getGuid();
                val.push(data);
                this.$dom.val(JSON.stringify(val));
                this.loadImg(data.data, data.guid);
            }
        },

        renderImg: function ($img) {
            // 最后一个元素为添加图片按钮
            $img.appendTo(this.createContainer()
				.insertBefore(this.$container.find('a.glyphicon-plus').parent()));
        },

        loadImg: function (data,guid) {
            var 
				$img = this.createImg(data);
            $img.attr("data-guid", guid);
            this.renderImg($img);
        },

        createImg: function (source, alt) {
            var img = ['<img class="thumbnail-img" src="', source, '" alt="', alt || '', '"/>'].join("");
            return $(img);
        },

        initDom: function () {
            // create add button
            this.$plus = this.createContainer()
				.html(['<a class="thumbnail-add glyphicon glyphicon-plus" href="javascript:;" title="新增"></a>'].join(""))
				.appendTo(this.$container)
        },

        createContainer: function () {
            return $(['<div class="thumbnail-container  ', this.options.thumbnailClass,
				'">',  '<a class="thumbnail-delete  glyphicon glyphicon-remove" href="javascript:;" title="删除"></a>',
                '</div>'
            ].join(""));
        },

        initEvent: function () {
            var that = this;
            // 添加图片
            this.$plus && this.$plus.on("click", function () {
                // check max pictures
                if (!that.isFull()) {
                    that.$file[0].click();
                } else {
                    layer.msg("已达上限"+that.options.maximum+"张, 不能再上传");
                }

            });

            this.$container.on("click", "a.thumbnail-delete", function (e) {
                e.preventDefault();
                var $this = $(this),
					$parent = $this.parent(),
					$img = $parent.find("img.thumbnail-img"),
					guid = $img.attr("data-guid"),
                    idx=-1,
					    val=that.$dom.val();
                // remove from data
                if (val) {
                    val = JSON.parse(val);
                    $.each(val, function (index) {
                        if (this.guid == guid) {
                            idx = index;
                            return false;
                        }
                    });
                    if (idx > -1) {
                        val.splice(idx, 1);

                        that.$dom.val(JSON.stringify(val));
                    }
                }

                // remove dom
                $parent.remove();
            });

            this.$file.on("change", function () {
                var
                    files = that.$file[0].files;
                $.each(files, function () {
                    that.convertImageToBase64(this, function (name, data) {
                        if (!that.isFull()) {
                            that.addValue({ title: name, data: data });
                        }                 
                    });
                });
            });
            // preview
            if (this.options.preview) {
                this.$container.on("click", "img", function () {
                    var
						$this = $(this),
						src = $this.attr("src");
                    that.showPreview(src);
                });
            }
        },

        isFull: function () {
            var val = this.$dom.val(),
                isFull = false;
            if (val) {
                val = JSON.parse(val);
                isFull = val.length >= this.options.maximum;
            }
            
            return isFull;
        },

        createPreviewContainer: function () {
            var that=this;
            this.$preview = $('<img class="image-upload-preview"  src="" alt="预览图片"/>').appendTo($("body"))
                .on("click", function (e) {
                    var $this=$(this);
                    $this.animate({
                        width:0,
                        left:"50%",
                        top:"50%"
                    },function(){
                        that.$preview.hide();
                    });
            });
        },

        showPreview: function (src) {
            this.$preview.attr("src", src).show().animate({
                width: "100%",
                left: 0,
                top:0
            });
        },

        convertImageToBase64: function (file,callback) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                callback && callback(file.name,this.result);
            }
        }
    };
})()