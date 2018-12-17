/*
 * 描述: 实现数据的新增修改功能
 * 功能:
 *      1. 能够新增数据(初始加载为空内容)
 *      2. 能够修改数据(根据条件查询数据,并将数据进行填充)
 *      3. 支持多种控件输入:
 *        3.1. 文本输入:text
 *        3.2. 下拉:select
 *        3.3. 时间:date
 *        3.4. 图片:image
 * 
 * 作者: xl
 * 时间: 2018-07-20
 */

(function () {
	window.DocForm = window.DocForm || function DocForm() {
		var args = [];
		args = Array.prototype.concat.apply([], arguments);
		this.init.apply(this, args);
	}

	DocForm.defaultOptions = {
		/* fields:[{
			title:"",
			fields:[{
				binds:{},
		        title:"",
		        visible:true,
		        edit:{
					tag:"",
		            type:"select",
		            source:[],
		            validate:{
		                required:true
		            }
		        }
		    }]}]*/
		dom: null,
		fields: null,
		layerIndex: null,
		data: null,
		readonly: false
	};

	DocForm.prototype = {
		constructor: DocForm,
		$container: null,
		options: null,
		fields: null,
		init: function (options) {
			this.options = $.extend(true, {}, this.constructor.defaultOptions, options);
			if (!this.options.dom) {
				throw new Error("dom can not be null.");
			}

			this.$container = $(this.options.dom);
			this.initEvent();
			this.data = this.options.data;
			this.fields = this.options.fields;

			if (this.data) {
				this.setData(this.data);
			}
		},

		initEvent: function () {
			var that = this;
		},

		initDom: function () {
			var that = this;
			$.each(this.options.fields, function () {
				$(['<div class="form-x-section-title">', this.title, '</div>'].join("")).appendTo(that.$container);
				var $sec = $(['<dl class="form-x-section-list" ></dl>'].join("")).appendTo(that.$container);
				$.each(this.fields, function () {
					$(['<dt class="form-x-section-list-title">', this.title, '</dt>']).appendTo($sec);
					var $content=$('<dd class="form-x-section-list-content"></dd>').appendTo($sec);

					
				});
			});
		},

		// 加载各控件
		loadControl: function ($html, opts, data) {
			$html.find("[data-type]").each(function () {
				var $this = $(this),
					type = $this.attr("data-type");
				if (FormControl[type]) {
					FormControl[type]($this, opts, data, $html);
				}
			});

		},

		/*data:[]*/
		setData: function (data) {
			this.clear();
			var that = this;
			if (data) {
				if (data instanceof Array) {
					$.each(data, function () {
						that.add(this);
					})
				} else {
					that.add(data);
				}
			}
		},

		getRowCount: function () {
			return this.$container.find(".form-row").length;
		},

		clear: function () {
			this.$container.empty();
		},
		//
		getData: function (success, error) {
			var
				errMsg = [],
				data = [],
				that = this;
			this.$container.find(".form-row").each(function () {
				var $this = $(this),
					dom,
					row = {},
					type,
					val,
					field;
				$.each(that.fields, function () {
					field = this.field;
					type = this.edit && this.edit.type || "input";
					dom = $this.find("[data-key='" + field + "']");
					switch (type) {
						case "div":
						case "span":
							val = dom.text();
							break;
						case 'image':
							var image = dom.data("image");
							val = image.getData();
							if (!that.options.multiple) {
								val = val && val[0] || "";
							}
							break;
						case 'pageSelect':
							val = dom.data("value");
							break;
						default:
							val = dom.val();
							break;
					}

					if (this.edit && this.edit.validate && this.edit.validate.required && !val) {
						errMsg.push("请输入" + this.title);
					}
					row[field] = val;
				});
				data.push(row);
			});
			if (errMsg.length) {
				error && error.call(null, errMsg);
			} else {
				success && success.call(null, data);
			}
		}
	};

	var FormControl = {
		// 日期控件
		date: function ($dom, opts, data, $html) {
			$dom.each(function () {
				var $this = $(this),
					val = $this.val(),
					type = $this.attr("type");
				$this.prop("readonly", true);
				$this.attr("type", "text");
				if (val) {
					$this.val(util.convertTime(val, "yyyy-MM-dd"));
				}
			});

			var key = $dom.data("key"),
				opt = this.getFieldOpt(key, opts);
			(!opts.readonly && !opt.edit.readonly) && $dom.on("tap", function (e) {
				var $this = $(this),
					type = $this.attr("data-type");
				var picker = new mui.DtPicker({
					type: type
				});

				picker.setSelectedValue($this.val());

				picker.show(function (items) {
					var val = new Date(items.y.value, items.m.value - 1, items.d.value).format("yyyy-MM-dd");
					$this.val(val);
					picker.dispose();
				})
			});
		},
		// 时间控件
		datetime: function ($dom, opts, data, $html) {
			$dom.each(function () {
				var $this = $(this),
					val = $this.val(),
					type = $this.attr("type");
				$this.prop("readonly", true);
				$this.attr("type", "text");
				// 转换时间
				if (val) {
					$this.val(util.convertTime(val, "yyyy-MM-dd HH:mm:ss"));
				}
			});
			var key = $dom.data("key"),
				opt = this.getFieldOpt(key, opts);
			(!opts.readonly && !opt.edit.readonly) && $dom.on("tap", function (e) {
				var $this = $(this),
					type = $this.attr("data-type");
				var picker = new mui.DtPicker({
					type: type
				});

				picker.setSelectedValue($this.val());

				picker.show(function (items) {
					var val = new Date(items.y.value, items.m.value - 1, items.d.value,
						items.h.value, items.i.value).format("yyyy-MM-dd HH:mm:ss");
					$this.val(val);
					picker.dispose();
				})
			});
		},
		// 图片控件
		image: function ($dom, opt, data, $html) {
			// 加载控件:image
			$dom.each(function () {
				var $this = $(this),
					key = $this.data("key"),
					val = data[key];

				$this.data("image", new PicturePick({
					dom: this,
					data: val,
					readonly: opt.readonly,
					preview: opt.preview,
					maximum: opt.imageLimit || 10,
					multiple: true
				}));
			});
		},

		pageSelect: function ($dom, opts, data, $html) {
			var key = $dom.attr("data-key"),
				opt = this.getFieldOpt(key, opts),
				ps = new PageSelect(opt.edit);
			$dom.data("data", ps);
		},
		// 客户物资
		pCMaterial: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts),
					edit = opt.edit;
				$.extend(edit, {
					readonly: opts.readonly || edit.readonly,
					source: function (callback, queryData) {
						util.ajax({
							url: '/InventoryScale/GetInventoryScaleList',
							data: queryData,
							success: callback
						});
					},
					title: "选择物料",
					fields: [{
						field: "QuantityUnit",
						title: "数量单位"
					}, {
						field: "ModelNumber",
						title: "型号"
					}, {
						field: "BatchNo",
						title: "炉批号"
					}, {
						field: "Texture",
						title: "材质"
					}, {
						field: "NonIntegralPart",
						title: "整件"
					}, {
						field: "Standards",
						title: "规格"
					}, {
						field: "Quantity",
						title: "数量"
					}, {
						field: "Weight",
						title: "重量"
					}],
					valueField: "MaterialID",
					//uniqueField:"LibraryCardNumber",
					textField: "MaterialName",
					titleFormatter: function (obj) {
						return (obj.MaterialCode || "") + "-" + obj.MaterialName + "-" + obj.LibraryCardNumber;
					}
				});
				if (edit.onChange) {
					var oldChange = edit.onChange;
					edit.change = function (data) {
						oldChange($html, data, $dom);
					}
				}
				edit.dom = $dom;
				edit.queryData = {};
				$.extend(edit.queryData, {
					supplierID: $html.find("[data-key='supplier']").val() ||
					$html.find("[data-key='SupplierID']").val() ||
					data["SupplierID"] || data["Merchantname"] || '',
					OutgoingWay: "0"
				});

				that.pageSelect($dom, opts, data, $html);
			});
		},

		updateSelect: function (source, param, $opt, $elem) {
			source(function (data) {
				var html = [],
					initVal = $elem.attr("data-init-value"),
					exist = false;
				$.each(data, function () {
					var cusData = this.data,
						cusAttrs = [];
					if (cusData) {
						for (var tmpKey in cusData) {
							cusAttrs.push(' data-' + tmpKey + '="' + (cusData[tmpKey] || "") + '" ');
						}
					}
					exist = exist || initVal == this.value;
					html.push('<option value="' + this.value + '" ' + (initVal == this.value ? ' selected="selected" ' : " ") + (cusAttrs.length ? cusAttrs.join("") : "") + '>' + this.text + '</option>');
				});

				if (initVal && exist) {
					$elem.removeAttr("data-init-value");
				}
				$elem.empty();
				$(html.join("")).appendTo($elem);
				$elem.trigger("change");

			}, $opt);
		},
		getFieldOpt: function (field, opts) {
			var opt;
			$.each(opts.fields, function () {
				if (this.field == field) {
					opt = this;
					return false;
				}
			});

			return opt;
		},

		text: function ($dom, opts, data, $html) {
			var key = $dom.attr("data-key"),
				opt = this.getFieldOpt(key, opts);
			this._inputEvent($dom, opt.edit && opt.edit.onChange, $html);
		},

		number: function ($dom, opts, data, $html) {
			var key = $dom.attr("data-key"),
				opt = this.getFieldOpt(key, opts);
			this._inputEvent($dom, opt.edit && opt.edit.onChange, $html);
		},

		_inputEvent: function ($dom, callback, $html) {
			$dom.on("change", function () {
				var val = $dom.val();
				callback && callback(val, $html);
			});
		},

		dataList: function ($dom, opts, data, $html) {
			var key = $dom.attr("data-key"),
				opt = this.getFieldOpt(key, opts);
			opt.edit.dom = $dom;
			$dom.data("data", new DataList(opt.edit))

			this._inputEvent($dom, opt.edit && opt.edit.onChange, $html);
		},

		// select 控件
		select: function ($dom, opts, data, $html) {
			var that = this;
			// select 
			$dom.each(function () {
				var $this = $(this),
					field = $this.attr("data-key"),
					opt = that.getFieldOpt(field, opts),
					source = opt.edit && opt.edit.source,
					val = data[field],
					selectOpt = $.extend(true, {
						notIncludeSearch: true,
						disabled: opts.readonly
					}, opt.edit && opt.edit.options);
				if (source instanceof Array) {
					$this.select2(selectOpt);
				} else if ($.isFunction(source)) {
					source(function (data) {
						var html = [],
							exist = false;
						$.each(data, function () {
							var cusData = this.data,
								cusAttrs = [];
							if (cusData) {
								for (var tmpKey in cusData) {
									cusAttrs.push(' data-' + tmpKey + '="' + (cusData[tmpKey] || "") + '" ');
								}
							}

							exist = exist || (val == this.value)
							html.push('<option value="' + this.value + '" ' +
								(val == this.value ? ' selected="selected" ' : "") + cusAttrs.join(" ") + '>' +
								(this.text || "") + '</option>');
						});
						$(html.join("")).appendTo($this);
						exist && $this.removeAttr("data-init-value");
						$this.select2(selectOpt); //.trigger("select2:select");
					});
				}
				$this.on("select2:select", function (e) {
					var $this = $(this),
						val = $this.val(),
						$option = $this.find("option[value='" + val + "']");
					// if link, clear
					$.each(opts.fields, function () {

						if (this.edit && this.edit.link == field) {
							var tmpObj = $html.find("[data-key='" + this.field + "']");
							tmpObj.val(null).trigger("change").trigger("select2:select");

							that.updateSelect(this.edit.source, val, $option, tmpObj);
						}

					});
					if (opt.edit.onChange) {
						opt.edit.onChange($html, val, $option);
					}
				});
			});
		},
		// 客户下拉选择控件
		customer: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/Supplies/GetSuppliesList',
							title: "选择客户",
							useData: true,
							valueField: "SupplierId",
							formatter: function (obj) {
								return (obj.Code || "") + "-" + obj.FullName;
							}

						}, callback, param);
					}
					opt.edit.options = {
						notIncludeSearch: false
					};
				}
				that.select($this, opts, data, $html);

			});
		},
		// 运输方式
		shippingType: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/DataDictionary/GetDataDictionaryList',
							data: {
								Code: "TransportWay"
							},
							title: "选择运输方式",
							valueField: "Code",
							textField: "FullName"

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);

			});
		},
		// 物资控件
		material: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/Material/GetMaterialList',
							title: "选择物资",
							useData: true,
							valueField: "MaterialName",
							formatter: function (obj) {
								return (obj.MaterialCode || "") + "-" + obj.MaterialName;
							}

						}, callback, param);
					}
					opt.edit.options = {
						notIncludeSearch: false
					};
				}
				that.select($this, opts, data, $html);

			});
		},
		// 物资ID
		materialId: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/Material/GetMaterialList',
							title: "选择物资",
							useData: true,
							valueField: "MaterialID",
							formatter: function (obj) {
								return (obj.MaterialCode || "") + "-" + obj.MaterialName;
							}

						}, callback, param);
					}
					opt.edit.options = {
						notIncludeSearch: false
					};
				}
				that.select($this, opts, data, $html);

			});
		},
		// 入库方式
		storage: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/DataDictionary/GetDataDictionaryList?Code=StorageMode',
							title: "选择入库方式",
							valueField: "Code",
							textField: "FullName"

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);

			});
		},
		// 仓库
		warehouse: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/Warehouse/GetWarehouseList',
							title: "选择仓库",
							useData: true,
							valueField: "ID",
							formatter: function (obj) {
								return obj.WarehouseName;
							}

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},

		// 规格
		standards: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				opt.edit = opt.edit || {};
				opt.edit.url = '/WarehouseReceipt/GetStandards';
				opt.edit.textField = "Standards";
				opt.edit.query = function () {
					return { materialID: $html.find("[data-key='MaterialID']").val() };
				}

				that.dataList($dom, opts, data, $html)
			});
		},
		// 货区（库位）
		reservoirArea: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/ReservoirArea/GetReservoirAreaList',
							title: "选择货区（库位）",
							valueField: "ID",
							param: "WarehouseID",
							paramValue: "ID",
							formatter: function (obj) {
								return obj.ReservoirAreaName;
							}

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},
		// 数量单位
		quantityUnit: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/DataDictionary/GetDataDictionaryList',
							title: "选择数量单位",
							valueField: "Code",
							data: {
								code: "QuantityUnit"
							},
							textField: "FullName"

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},
		// 理货员
		tallyClerkName: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/User/GetUserListByDuty',
							data: {
								duty: "理货员"
							},
							title: "选择理货员",
							valueField: "UserId",
							textField: "RealName"

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},
		// 出库方式
		outgoingWay: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/DataDictionary/GetDataDictionaryList',
							data: {
								Code: "OutgoingWay"
							},
							title: "选择出库方式",
							useData: true,
							valueField: "Code",
							textField: "FullName"

						}, function (data) {
							$.each(data, function () {
								if (this.data) {
									this.data.Value = this.data.Code == "批次出库" ? "1" : "0";
								}

							})
							callback && callback(data);
						}, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},

		// 客户物资
		customerMaterial: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/InventoryScale/GetInventoryScaleList',
							title: "选择物资",
							data: {
								supplierID: $html.find("[data-key='supplier']").val()
							},
							param: "OutgoingWay",
							paramValue: "Value",
							useData: true,
							valueField: "MaterialID",
							formatter: function (obj) {
								return (obj.MaterialCode || "") + "-" + obj.MaterialName;
							}

						}, function (data) {
							console.log(JSON.stringify(data));
							callback && callback(data);
						}, param);
					}
					opt.edit.options = {
						notIncludeSearch: false
					};
				}
				that.select($this, opts, data, $html);

			});
		},
		// 客户物资
		materialWithSupplier: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/InventoryScale/GetInventoryScaleList',
							title: "选择物资",
							data: {
								OutgoingWay: ""
							},
							param: "supplierID",
							paramValue: "SupplierID",
							useData: true,
							valueField: "MaterialID",
							formatter: function (obj) {
								return obj.MaterialName;
							}

						}, callback, param);
					}
					opt.edit.options = {
						notIncludeSearch: false
					};
				}
				that.select($this, opts, data, $html);

			});
		},
		// 到货方式
		arrivalMethod: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/DataDictionary/GetDataDictionaryList',
							data: {
								Code: "ArrivalMethod"
							},
							title: "选择到货方式",
							valueField: "Code",
							textField: "FullName"

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},
		// 发货类型
		delivery: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/DataDictionary/GetDataDictionaryList',
							data: {
								Code: "Delivery"
							},
							title: "选择发货类型",
							valueField: "Code",
							textField: "FullName"

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},
		// 中转类型
		transferType: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/DataDictionary/GetDataDictionaryList',
							data: {
								Code: "TransferType"
							},
							title: "选择中转类型",
							valueField: "Code",
							textField: "FullName"

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},
		// 接运员
		pickUpName: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/User/GetUserListByDuty',
							data: {
								duty: "接运员"
							},
							title: "选择接运员",
							valueField: "UserId",
							textField: "RealName"

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},
		// 装卸工
		stevedoreName: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/User/GetUserListByDuty',
							data: {
								duty: "装卸工"
							},
							title: "选择装卸工",
							valueField: "UserId",
							textField: "RealName"

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},
		// 行车工
		craneDriverName: function ($dom, opts, data, $html) {
			var that = this;
			$dom.each(function () {
				var $this = $(this),
					key = $this.attr("data-key"),
					opt = that.getFieldOpt(key, opts);

				if (!opt.edit.source) {
					opt.edit.source = function (callback, param) {
						that.selectAjax({
							url: '/User/GetUserListByDuty',
							data: {
								duty: "行车工"
							},
							title: "选择行车工",
							valueField: "UserId",
							textField: "RealName"

						}, callback, param);
					}
				}
				that.select($this, opts, data, $html);
			});
		},

		selectAjax: function (opt, callback, $opt) {
			var newOpt = {};
			newOpt.url = opt.url;
			newOpt.data = $.extend({}, opt.data);
			if (opt.param) {
				newOpt.data[opt.param] = $opt && $opt.attr("data-" + opt.paramValue) || "";
			}

			newOpt.success = function (data) {
				var newData = [{
					value: "",
					text: opt.title
				}];
				$.each(data, function () {
					newData.push({
						value: this[opt.valueField],
						text: opt.formatter ? opt.formatter(this) : this[opt.textField],
						data: opt.useData ? this : null
					})
				});
				callback && callback(newData);
			};

			util.ajax(newOpt);
		}
	};
})();