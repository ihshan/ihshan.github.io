var table_pagation_configJson_array = [];
/* 表数据行生成脚本
 * @param {Object} tableId 表格ID
 * @param {Object} jsonData  json/json字符串
 * @param {Object} pageDivId  分页父容器ID
 */
function createTable(tableId, tipClass, jsonData, pageDivId){
	//记录表格列数
	if( table_pagation_configJson_array[pageDivId] == undefined){
		table_pagation_configJson_array[pageDivId] = [];
	}
	if(pageDivId != undefined){
		table_pagation_configJson_array[pageDivId].fieldNumber = $("#"+tableId + " thead th").length;
		table_pagation_configJson_array[pageDivId].tableId = tableId;
	}
	
	var tableTrMsg = "";
	jsonData = eval(jsonData);
	if(jsonData != null  && jsonData.length > 0){
		//获取表格列属性
		var configJson = getTableAttrJson(tableId);
		//修改json中属性值null为空
		var jsonData = formatJsonDataFormat(jsonData);
		//生成数据行
		tableTrMsg = createTableTr(tipClass, jsonData, configJson);
		$("#"+tableId + " tbody").empty();
		$("#"+tableId + " tbody").append(tableTrMsg);
		//行样式
		activateTableTrStyle(tableId);
	}else{
		tableNotData(tableId);
		
	}
}

/*
 * 生成表格行
 * @param {Object} jsonData  json
 * @param {Object} fieldArray  属性字符串数组
 * @param {Object} tipFieldArray  提示属性 字符串数组
 * @param {Object} tipLenArray   提示属性的页面显示长度
 * @param {Object} formatFnArray  单元格数据处理函数数组
 * @return {TypeName} 
 */
function createTableTr(tipClass, jsonData, configJson){
	var fieldArray = configJson.fieldArray;
	var tipFieldArray = configJson.tipFieldArray;
	var tipLenArray = configJson.showTipLenArray;
	var formatFnArray = configJson.formatFnArray;
	/*V2.0 */
	var decideArray = configJson.decideArray;
	var defineFnArray = configJson.defineFnArray;
	
	var tableMsg = "";
	for(var i=0; i<jsonData.length; i++){
		tableMsg = tableMsg + "<tr>";
		for(var j=0; j< fieldArray.length; j++){ 
			//单元格提示标识
			var tipFlag = getTableTdTipShowFlag(fieldArray[j], tipFieldArray);
			//单元格内容处理
			var tdShowMsg = formatTableTdShowContent(tipFlag, jsonData[i], jsonData[i][fieldArray[j]], tipLenArray[j], formatFnArray[j]);
			tableMsg = tableMsg + "<td>"+ getTableTdContentDetail(tipFlag, tipClass, tdShowMsg, jsonData[i], fieldArray[j], decideArray[j],formatFnArray[j], defineFnArray[j])+"</td>";      
		}
		tableMsg = tableMsg + "</tr>"; 
	}
	return tableMsg;
}

/*
 * 单元格内容
 * @param {Object} tipFlag  	是否提示 true-false
 * @param {Object} tdShowMsg  	单元格内容
 * @param {Object} rowJson  	json行数据
 * @param {Object} field		单元格属性名
 * @param {Object} decide		tip提示内容源指向. 取值：value formatter defineFn
 * @param {Object} formatFn  	单元格预处理函数.
 * @param {Object} defineFn  	自定义函数.  如果decide='define',则返回数据是tip提示内容
 * @return {TypeName} 			处理后的单元格内容
 */
function getTableTdContentDetail(tipFlag, tipClass, tdShowMsg, rowJson, field, decide, formatter, defineFn){
	/**
	//函数转型
	if(formatFn != null){
		formatFn = eval(formatFn);
	}
	if( defineFn != null){
		defineFn = eval(defineFn);
	}
	**/
	var tipContent = "-";
	if( tipFlag == true){
		if( decide == 'value'){
			tipContent = rowJson[field];
		}else if( decide == 'formatter'){
			tipContent = formatter(rowJson[field] ,rowJson);
		}else if( decide == 'define'){
			tipContent = defineFn(rowJson);
		}else{
			;
		}
	}
//	return (tipFlag==true?"<div class='"+tipClass+"' title=\""+tipContent+"\">":"")+(formatter == null?tdShowMsg: formatter(rowJson[field], rowJson))+(tipFlag==true?"</div>":"");
	return (tipFlag==true?"<div class='"+tipClass+"' title=\""+tipContent+"\">":"")+ tdShowMsg +(tipFlag==true?"</div>":"");
}


/**
 * 单元格显示内容处理
 * 如果有formatter格式化函数，则显示以 formatter返回后的数据为主
 * 
 */
function formatTableTdShowContent(tipFlag, rowJson, fieldValue, showLen, formatter){
	var temp = "";
	//内容处理
	if( tipFlag ){
		if(formatter == null){
			if((fieldValue != null && fieldValue != '') && fieldValue.length > showLen){
				temp = fieldValue.substring(0, showLen) + "...";
			}else{
				temp = fieldValue;
			}
		}else{
			temp = formatter(fieldValue, rowJson);
			if( temp != null && temp.length > showLen){
				temp = temp.substring(0, showLen) + "...";
			}
		}
	}else{
		if( formatter == null){
			temp = fieldValue;
		}else{
			temp = formatter(fieldValue, rowJson);
		}
	}
	return temp;
}

/** 单元格提示标识 */
function getTableTdTipShowFlag(field, tipFieldArray){
	var flag = false;
	for(var k=0; k<tipFieldArray.length; k++){
		if(tipFieldArray[k] == field){
			flag = true;
			break;
		}else{
			flag = false;
		}
	}
	return flag;
}

/*转换值  修改json中属性值null为空*/
function formatJsonDataFormat(data){
	var result = new Array();
	for(var i=0;i < data.length; i++){
		var tempJson = data[i];
		for(var key in tempJson){
			if( tempJson[key] == null){ 
				tempJson[key] = '';
			} 
		}
		result.push(tempJson);
	}
	return result;
}


/** 获取表格列属性 */
function getTableAttrJson(tableId){
	var tableConfigJson = {};
	//属性名数组
	var fieldArray = new Array();
	//提示属性名数组
	var tipFieldArray = new Array();
	//格式化单元格方法名数组
	var formatFnArray = new Array();
	var showTipLenArray = new Array();
	/*V2.0 new Array*/
	//tip内容数据源
	var decideArray = new Array();
	//自定义函数，用途： tip
	var defineFnArray = new Array();
	
	$("#"+tableId + " thead th").each(function(index){
		var field = $(this).attr("field");
		var showTip = $(this).attr("showTip");
		var showTipLen = $(this).attr("showLen");
		var formatFn = $(this).attr("formatter");
		
		/* V2.0 new Field*/
		//指向单元格内容源
		var decide = $(this).attr("decide");
		//自定义函数，类似formatter
		var defineFn = $(this).attr("defineFn");
		
		showTip = (showTip == undefined?false: (showTip=='true'?true: false));
		showTipLen = (showTipLen == undefined?1000: showTipLen);
		//属性名数组
		fieldArray[index] = field;
		//提示列属性名数组
		if(showTip){
			tipFieldArray[tipFieldArray.length] = field;
		}
		//显示长度数组
		showTipLenArray[index] = showTipLen;
		formatFnArray[index] = (formatFn == undefined?null: eval(formatFn));
		//判断 showTipLen是否为整数值
		
		/*V2.0 new field deal*/
		decide = (decide == undefined?'value':(decide == 'formatter'?'formatter':(decide == 'define'?'define': 'value')));
		decideArray[index] = decide;
		
		defineFn = (defineFn == undefined?null : eval(defineFn));
		defineFnArray[index] = defineFn;
	});
	tableConfigJson.fieldArray = fieldArray;
	tableConfigJson.tipFieldArray = tipFieldArray;
	tableConfigJson.showTipLenArray = showTipLenArray;
	tableConfigJson.formatFnArray = formatFnArray;
	/*V2.0 new Json.Array*/
	tableConfigJson.decideArray = decideArray;
	tableConfigJson.defineFnArray = defineFnArray;
	return tableConfigJson;
}

/** 
 *选择器：selector	tableId
 *偏移量x:offset_x   默认0
 *偏移量y：offset_y  默认0
 *样式名：className  默认样式
 * 备注： 当设置某一参数时，其之前的参数必须配
**/
function activatePrompt4Table(selector, offset_x, offset_y, className){
	if( className == undefined || className == '' || className == null){
		//默认样式
		className = "dataGridTable-tdTip";
	}
	if( offset_x == undefined){
		offset_x = 0;
	}
	if( offset_y == 0){
		offset_y = 0;
	}
	
	$(selector).qtip({ 
		content: {
			//提示信息来源：元素属性
			attr: 'title'
		},
		position:{
           //target: 'mouse',
            corner: {
                 tooltip: 'leftMiddle', // Use the corner...
                 target: 'leftMiddle' // ...and opposite corner
            },
		    adjust: {
		         // 提示信息位置偏移
		         x: offset_x, y: offset_y,
		         mouse: true
		    }
		},
		style:{
			//提示框自定义样式[,尚未统一定义]
			classes: className,
			 tip: true
		},
		show:{
			  target: false,
		      // 事件名称，默认为鼠标移到时
		      event: 'mouseenter',
		      // 特效
		      effect: true,
		      // 延迟显示时间
		      //delay: 30,
		      // 隐藏其他提示
		      solo: true,
		      // 在页面加载完就显示提示
		      ready: false
		},
		hide: { 
			  //失去焦点时隐藏
		      event: 'mouseleave', 
		      //effect: true,
		      delay: 0,
		      //设置为true时，不会隐藏
		      fixed: false,
		      //inactive: false, 
		      leave: 'window',
		      distance: false
		}
	});
}

//表格行样式：行交换背景色及鼠标悬停变色
function activateTableTrStyle(idStr){
	 $("#"+idStr).each(function (){
		var _this = $(this);
		//鼠标移动隔行变色hover用法关键
		_this.find("tr:not(:first)").hover(function () {
		    $(this).attr("bColor", $(this).css("background-color")).css("background-color", "#f5fafc"); 
		    $(this).find("td:FIRST-CHILD").attr("bLeft", $(this).find("td:FIRST-CHILD").css("border-left")).css("border-left","1px solid #e9e9e9");
		    $(this).find("td:LAST-CHILD").attr("bRight", $(this).find("td:LAST-CHILD").css("border-right")).css("border-right","1px solid #e9e9e9");
		}, function () {
		    $(this).css("background-color", $(this).attr("bColor"));
		    $(this).find("td:FIRST-CHILD").css("border-left", $(this).find("td:FIRST-CHILD").attr("bLeft"));
		    $(this).find("td:LAST-CHILD").css("border-right", $(this).find("td:LAST-CHILD").attr("bRight"));
		});
    });
}

/**表格分页栏 **/
/**
 * 生成分页栏
 * 参数说明：
 * 	currentPage: 当前页码
 * 	rows： 每页记录数
 * 	total： 总记录数
 * 	url： 请求url
 * 	params： 请求参数  [可包含 page, rows，或不包含]
 * 	fun： 回调函数
 * 	selector: 分页栏外层容器的ID
 * 	
**/
function createPageNumber(currentPage, pageSize, total, url, params, fun, selector){
	saveTableConfigInfo(selector, params, fun, pageSize, total);
	if( total/pageSize > 1){
		$("#" + selector).show();
		//json转字符串
		var pageNumStr = " " +
		"<div class=\"pageDiv\">" +
		"	<a class=\"first-page\" onclick=\"goFirstOrLastPage(true,"+1+","+pageSize+",'"+url+"','"+ selector +"')\">首页</a>" +
		"	<a class=\"prev-page\" onclick=\"goPreOrNextPage(true,"+ currentPage+","+pageSize+",'"+url+"','"+ selector +"')\">上一页</a>"+
		"	" + createPerPageBtn(currentPage, pageSize, total, url, selector)+
		"	<a class=\"next-page\" onclick=\"goPreOrNextPage(false,"+ currentPage+","+pageSize+",'"+url+"','"+ selector +"')\">下一页</a>" +
		"	<a class=\"last-page\" onclick=\"goFirstOrLastPage(false,"+total+","+pageSize+",'"+url+"','"+ selector +"')\">尾页</a>" +
		"	<span class=\"page-num\">"+currentPage+"/"+table_pagation_configJson_array[selector].pageCount+"页</span>" +
		"	<span id=\"inputPageNo\" class=\"page-num\"><input name=\"page\" style=\"width: 36px; height: 22px;line-height: 18px;\" value=\""+currentPage+"\"/></span>"+
		"	<a class=\"jump-btn\" onclick=\"goJumpPage('"+url+"','"+ selector +"')\">跳转</a>"+
		//"	<span class=\"page-num\">每页0条/共n条</span>" +
		"</div>"+
		"<div style=\"clear: both;\"></div>"; 
		$("#"+selector).empty();
		$("#"+selector).append(pageNumStr);
	}else{//total == 0
		$("#"+selector).empty();
		$("#" + selector).hide();
	}
	//$(selector).append(createLoadingDiv());
}

//保存各个table的配置信息
function saveTableConfigInfo(pageDivId, params, fun, pageSize, total){
	var flag = false;
	for(var key in table_pagation_configJson_array){
		if( key == pageDivId){
			flag = true;
			break;
		}
	}
	if( flag ){//已存在该配置
		table_pagation_configJson_array[pageDivId].pageNumSelectorId = pageDivId;
		table_pagation_configJson_array[pageDivId].params = params;
		table_pagation_configJson_array[pageDivId].fun = fun;
		table_pagation_configJson_array[pageDivId].pageCount = getPageCount(pageSize, total);
		table_pagation_configJson_array[pageDivId].pageSize = pageSize; 
	}else{
		var table_pagation_configJson = {};
		table_pagation_configJson.pageNumSelectorId = pageDivId;
		table_pagation_configJson.params = params;
		table_pagation_configJson.fun = fun;
		table_pagation_configJson.pageCount = getPageCount(pageSize, total);
		table_pagation_configJson.pageSize = pageSize;
		table_pagation_configJson_array[pageDivId] = table_pagation_configJson;
	}
}

//计算总页数
function getPageCount(pageSize, total){
	if( total > 0 && pageSize > 0){
		var pageCount = 1;
		if( total % pageSize == 0){
			pageCount = parseInt(total / pageSize);
		}else{
			pageCount = parseInt(total / pageSize + 1);
		}
	}else if(total == 0){
		pageCount = 1;
	}else{
		alert("数据异常！");
	}
	return pageCount;
}

/** 跳转页面**/
function goJumpPage(url, selector){
	var jumpPage = $("#"+selector+ " #inputPageNo input[name='page']").val();
	if(jumpPage == ''){
		alert("请输入跳转页码！");
		return ;
	}
	var reg = new RegExp("^[0-9]*$");
	if(!reg.test(jumpPage)){
		alert("请输入正确页码！");
		return ;
	}
	var pageCount = table_pagation_configJson_array[selector].pageCount;
	//跳转页码超过最大页码，则默认最大页码
	if( jumpPage > pageCount){
		jumpPage = pageCount;
	}else if(jumpPage == 0){
		jumpPage = 1;
	}else{
		;
	}
	table_pagation_configJson_array[selector].params.page = jumpPage;
	table_pagation_configJson_array[selector].params.pageSize = table_pagation_configJson_array[selector].pageSize;
//	loadingAndWaiting(selector);
	showLoadingDiv();
	$.post(url, table_pagation_configJson_array[selector].params, table_pagation_configJson_array[selector].fun);
}

/** 生成页码按钮 **/
function createPerPageBtn(currentPage, pageSize, total, url, selector){
	var pageListStr = "";
	var pageCount = 1;
	if( total > 0){
		//计算总页数
		pageCount = getPageCount(pageSize, total);
		//循环生成每个页码按钮
		var className = "page";
		//起始页码
		var leftIsEllipsis = false;
		var rightIsEllipsis = false;
		if(currentPage - 3 > 0){
			leftIsEllipsis = true;
		}else{
			leftIsEllipsis = false;
		}
		if( currentPage + 2 < pageCount){
			rightIsEllipsis = true;
		}else{
			rightIsEllipsis = false;
		}
		//当前页左右都无 省略号
		if( leftIsEllipsis == false && rightIsEllipsis == false){
			for(var i=1; i<= pageCount; i++){
				if( i == currentPage){
					className = "click-page";
				}else{
					className = "page";
				}
				pageListStr = pageListStr + "<a class=\""+className+"\" onclick=\"goAPage("+i+","+pageSize+",'"+url+"',this,'"+selector+"')\">"+i+"</a>";
			}
		//当前页省略号： 左有右无
		}else if(leftIsEllipsis == true && rightIsEllipsis == false){
			if(currentPage - 4 > 0){
				pageListStr = "<a class=\"page-ellipsis\">...</a>";
			}
			for(var i= currentPage -3; i <= pageCount; i++){
				if( i == currentPage){
					className = "click-page";
				}else{
					className = "page";
				}
				pageListStr = pageListStr + "<a class=\""+className+"\" onclick=\"goAPage("+i+","+pageSize+",'"+url+"',this,'"+selector+"')\">"+i+"</a>";
			}
		//当前页省略号： 左、右皆有
		}else if(leftIsEllipsis == true && rightIsEllipsis == true){
			if( currentPage - 3 < 1){
				pageListStr = "";
			}else{
				pageListStr = "<a class=\"page-ellipsis\">...</a>";
			}
			
			for(var i = currentPage-2; i< (currentPage + 3); i++){
				if( i == currentPage){
					className = "click-page";
				}else{
					className = "page";
				}
				pageListStr = pageListStr + "<a class=\""+className+"\" onclick=\"goAPage("+i+","+pageSize+",'"+url+"',this,'"+selector+"')\">"+i+"</a>";
			}
			if(currentPage + 3 < pageCount){
				pageListStr = pageListStr + "<a class=\"page-ellipsis\">...</a>";
			}
			pageListStr = pageListStr + "<a class=\"page\" onclick=\"goAPage("+pageCount+","+pageSize+",'"+url+"',this,'"+selector+"')\">"+pageCount+"</a>";
		//当前页省略号： 左无右有
		}else if(leftIsEllipsis == false && rightIsEllipsis == true){
			for(var i=1; i< (currentPage + 3); i++){
				if( i == currentPage){
					className = "click-page";
				}else{
					className = "page";
				}
				pageListStr = pageListStr + "<a class=\""+className+"\" onclick=\"goAPage("+i+","+pageSize+",'"+url+"',this,'"+selector+"')\">"+i+"</a>";
			}
			if(currentPage + 3 < pageCount){
				pageListStr = pageListStr + "<a class=\"page-ellipsis\">...</a>";
			}
			pageListStr = pageListStr + "<a class=\"page\" onclick=\"goAPage("+pageCount+","+pageSize+",'"+url+"',this,'"+selector+"')\">"+pageCount+"</a>";
		//出错标识
		}else{
			pageListStr = "error happen...";
		}
		return pageListStr;
	}else{
		//total为0，默认第一页
		return "<a class=\"click-page\" onclick=\"goAPage("+1+","+pageSize+",'"+url+"',this,'"+selector+"')\">1</a>";
	}
}

/** 页码按钮**/
function goAPage(page, pageSize, url, obj, selector){
	if($(obj).attr("class") == 'click-page'){
		return ;
	}
	table_pagation_configJson_array[selector].params.page = page;
	table_pagation_configJson_array[selector].params.pageSize = pageSize;
//	loadingAndWaiting(selector);
	showLoadingDiv();
	$.post(url, table_pagation_configJson_array[selector].params, table_pagation_configJson_array[selector].fun); 
}

/** 上一页 / 下一页 按钮**/
function goPreOrNextPage(isPre, currentPage, pageSize, url, selector){
	var page = 1;
	if(isPre){
		page = currentPage - 1;
		if( page< 1){
			page = 1;
			return ;
		}
	}else{
		page = currentPage + 1;
		if( page > table_pagation_configJson_array[selector].pageCount){
			page = table_pagation_configJson_array[selector].pageCount;
			alert("已经是最后一页！");
			return ;
		}
	}
	table_pagation_configJson_array[selector].params.page = page;
	table_pagation_configJson_array[selector].params.pageSize = pageSize;
	//loadingAndWaiting(selector);
	showLoadingDiv();
	$.post(url, table_pagation_configJson_array[selector].params, table_pagation_configJson_array[selector].fun);
}
	
/** 首页 / 尾页 按钮**/
function goFirstOrLastPage(isFirst, number, pageSize, url, selector){
	var page = 1;
	if(isFirst){ //首页
		page = 1;
	}else{//尾页
		page = table_pagation_configJson_array[selector].pageCount;
	}
	table_pagation_configJson_array[selector].params.page = page;
	table_pagation_configJson_array[selector].params.pageSize = pageSize;
	//loadingAndWaiting(selector);
	showLoadingDiv();
	$.post(url, table_pagation_configJson_array[selector].params, table_pagation_configJson_array[selector].fun);
}
/*加载等待*/
function loadingAndWaiting(selector){
	var tdNumber = table_pagation_configJson_array[selector].fieldNumber;
	var tableId = table_pagation_configJson_array[selector].tableId;
	var pageNumSelectorId = table_pagation_configJson_array[selector].pageNumSelectorId;
	$("#" + tableId + " tbody").empty();
	$("#" + tableId + " tbody").append("<tr><td colspan='"+ tdNumber +"' style='border-bottom: 0px;'>数据加载中，请稍候...</td></tr>");
	$("#"+ tableId + " tbody").find("tr").hover(function () {
	    $(this).css("background-color", "#ffffff"); 
	}, function () {
	    $(this).css("background-color", "#ffffff");
	});
	if( pageNumSelectorId != undefined){
		$("#" + pageNumSelectorId).hide();
	}
	
}

/**
 * 第一次加载表格数据，加载效果及分页不显示
 * @param {Object} tableId
 * @param {Object} isPage  表格是否有分页
 * @param {Object} pageDivId  分页父容器ID
 */
function firstLoading(tableId, isPage, pageDivId){
	var tdNumber = $("#"+tableId + " thead th").length
	$("#" + tableId + " tbody").empty();
	$("#" + tableId + " tbody").append("<tr><td colspan='"+ tdNumber +"' style='border-bottom: 0px;'>数据加载中，请稍候...</td></tr>");
	$("#"+ tableId + " tbody").find("tr").hover(function () {
	    $(this).css("background-color", "#ffffff"); 
	}, function () {
	    $(this).css("background-color", "#ffffff");
	});
	if(isPage){
		$("#" + pageDivId).hide();
	}
}
/*表格无数据时状态*/
function tableNotData(tableId){
	var tdNumber = $("#"+tableId + " thead th").length;
	$("#" + tableId + " tbody").empty();
	$("#" + tableId + " tbody").append("<tr><td colspan='"+ tdNumber +"'>无相关数据！</td></tr>");
	$("#"+ tableId + " tbody").find("tr").hover(function () {
	    $(this).css("background-color", "#ffffff"); 
	}, function () {
	    $(this).css("background-color", "#ffffff");
	});
}

	/**
	 * 页面文本框背景提示 配置信息：json数组
	 * @param {Object} proj
	 * @memberOf {TypeName} 
	 */
	var input_bg_tip_config_json_array = [];
	function initInputTip(selector, tipMsg){ 
		initInputTipConfig(selector,tipMsg);
		$(selector).attr('style','color:#ddd');;
		$(selector).val(tipMsg);
		//文本框默认状态
		$(selector).attr("onfocus", onfocusTip());
		$(selector).attr("onblur", onblurTip());
	}
	/**
	 * 文本内置提示配置信息初始化
	 * @param {Object} selector  定位input选择器
	 * @param {Object} msg	内置的提示信息
	 */
	function initInputTipConfig(selector, tipMsg){
		var flag = false;
		for(var key in input_bg_tip_config_json_array){
			if( key == selector){
				flag = true;
				break;
			}
		}
		if(flag){//已存在
			input_bg_tip_config_json_array[selector].tipMsg = tipMsg;
			input_bg_tip_config_json_array[selector].input_status = false;
		}else{
			var inputJson = {};
			inputJson.tipMsg = tipMsg;
			inputJson.input_status = false;
			input_bg_tip_config_json_array[selector] = inputJson;
		}
	}

/** 初始化静态下拉框数据**/
function initStaticSelect(proj){
	var selects = $(".fbmp-combobox");
	if(selects != undefined && selects.length>0){
		$.each(selects, function(index, value){
			var selectInput = $(this);
			selectInput.append("");
			if(selectInput.attr("codeTable")){
				var codeTable = $(this).attr("codeTable");
				var showSelectAll =  $(this).attr("showSelectAll")==undefined?false:true;
				var param = {'codeTable': codeTable,'showSelectAll': showSelectAll};
				$.post(proj+"/baseType/baseTypeOption/getCodeTable.do", param, function(result){
					result = eval("("+result+")");
					var msg = "";
					for(var i =0; i<result.length; i++){
						if(selectInput.attr("defaultValue") && selectInput.attr("defaultValue") == result[i].value){
							msg = msg + "<option selected='true' value=\""+result[i].value+"\">" + result[i].text+ "</option>";
						} else {
							msg = msg + "<option value=\""+result[i].value+"\">" + result[i].text+ "</option>";
						}
					}
					selectInput.append(msg);
				});
				return;
			}
			if(selectInput.attr("url")) {
				var url = $(this).attr("url");
				var paramJson = $(this).attr("param");
				var param = {};
				var showSelectAll =  $(this).attr("showSelectAll")==undefined?false:true;
				var textName = $(this).attr("textName") == undefined ? "text" : $(this).attr("textName");
				var valueName = $(this).attr("valueName") == undefined ? "value" : $(this).attr("valueName");
				
				if(paramJson) {
					param = JSON.parse(paramJson);
				}
				var msg = "";
				
				if(showSelectAll) {				
					msg = msg + "<option value=\"\">--请选择--</option>"
				}
				
				$.post(proj + url, param, function(result){
					result = JSON.parse(result);
					if(!checkLoginStatus(result,proj)){
						return;
					}
					for(var i =0; i<result.length; i++){
						if(selectInput.attr("defaultValue") && selectInput.attr("defaultValue") == result[i].value){
							msg = msg + "<option selected='true' value=\""+result[i][valueName]+"\">" + result[i][textName]+ "</option>";
						} else {
							msg = msg + "<option value=\""+result[i][valueName]+"\">" + result[i][textName]+ "</option>";
						}
					}
					selectInput.append(msg);
				});
			}
		});
	} 
}

function createLoadingDiv(){
	var msg = "<div class=\"overlay\"></div>"+
	"<div id=\"AjaxLoading\" class=\"showbox\">"+
	"<div class=\"loadingWord\"><img src=\"/bms/common/images/waiting.gif\">加载中，请稍候...</div>"+
	"</div>";
	return msg;
}

/* 页面遮罩 */
function showLoadingDiv(){
	var h = $(document).height();
	$(".overlay").css({"height": h });
	$(".overlay").css({'display':'block','opacity':'0.4'});
	$(".showbox").css({'display':'block'});
	$(".showbox").stop(true).animate({'margin-top':'350px','opacity':'1'}, 0);
}

function hideLoadingDiv(){
	$(".showbox").css({'display':'none'})
	$(".showbox").stop(true).animate({'margin-top':'-80px','opacity':'0'}, 0);
	$(".overlay").css({'display':'none','opacity':'0'});
}

/**
 * 异步请求时检查用户登录状态
 * @param {Object} result json对象
 * @param {Object} proj 域名
 */
function checkLoginStatus(result, proj){
	//var result = eval("("+data+")");
	if( result != undefined && result.resultCode != undefined && result.resultCode == -2){
		alert(result.msg);
		window.location.href = proj + "/payonline/usercommon/toLoginPage.do";
		return false;
	}
	return true;
}
/*校验手机号*/
function checkPhoneNo(phone){
	//var pattern = /^1[3|4|5|8][0-9]\d{8}$/;
	var pattern = /^[0-9]{11}$/;
	return pattern.test(phone);
}
/*去前后空格*/
function _trim(str){ 
	return str.replace(/^\s+|\s+$/g, ""); 
}
/*保留小数位*/
var Digit = {};
Digit.round2Str = function(digit, length) {
	
    length = length ? parseInt(length) : 0;
    if (length <= 0) return Math.round(digit);
    digit = Math.round(digit * Math.pow(10, length)) / Math.pow(10, length);
    var tmp = digit.toString();
    var idx = tmp.indexOf(".");
    if (idx < 0){  
      idx = tmp.length;  
      tmp += '.';  
    }  
    while (tmp.length <= idx + length){  
      tmp += '0';  
    }  
    return tmp;
};

Digit.round = function(digit, length) {
    length = length ? parseInt(length) : 0;
    if (length <= 0) return Math.round(digit);
    digit = Math.round(digit * Math.pow(10, length)) / Math.pow(10, length);
    return digit;
};

/**
 * 获取弹窗居中的坐标
 * @param {Object} 弹出层的选择器如: #PAGE
 * @return {TypeName}
 * 				posTop   posLeft
 */
function getCenterCoordinate(selector){
	var _scrollHeight = $(document).scrollTop();//获取当前窗口距离页面顶部高度
    var _windowHeight = $(window).height();//获取当前窗口高度
   	var _windowWidth = $(window).width();//获取当前窗口宽度
    var _popupHeight = $(selector).height();//获取弹出层高度
    var _popupWeight = $(selector).width();//获取弹出层宽度
    var _posiTop = (_windowHeight - _popupHeight)/2 + _scrollHeight; 
    var _posiLeft = (_windowWidth - _popupWeight)/2;
    var _json = {};
    _json.posTop = _posiTop;
    _json.posLeft = _posiLeft;
    return _json;
}

/**
 * <pre>
 *生成年-月下拉框
 * 起始年： 2014
 * </pre>
 * @param {Object} yearId  年份下拉框ID
 * @param {Object} monthId	月份下拉框ID
 */
function _toGenerateYearAndMonth(yearId, monthId){
	$('#' + yearId).empty();
	$('#' + monthId).empty();
	var nowTime = new Date();
	var year = nowTime.getFullYear();
	var month = nowTime.getMonth();
	var temp = 1;
	if(month == 0){
		year = year - 1;
		month = 12;
	}
	$('#' + yearId).append("<option value=''>--请选择--</option>");
	for(var i= 2014;i <= (year + 5); i++){
		$('#' + yearId).append("<option value='"+i+"'" + ( i == year?'selected':'')+ ">"+i+"</option>");
	}
	//月份下拉框数据
	$('#' + monthId).append("<option value=''>--请选择--</option>");
	for(var j=1; j <= 12; j++){
		if(j < 10){
			$('#' + monthId).append("<option value='"+("0"+j)+"'" + ( j == month?'selected':'')+ ">"+j+"</option>");
		}else{
			$('#' + monthId).append("<option value='"+j+"'" + ( j == month?'selected':'')+ ">"+j+"</option>");
		}
	}
}

/*当年为空时改变月份下拉*/
function _toGenerateMonthWhenYearOnChange(obj, monthId){
	var year = $(obj).val();
	if(year == ''){
		$('#' + monthId).empty();
		$('#' + monthId).append("<option value=''>--请选择--</option>");
		return ;
	}else{
		var nowTime = new Date();
		var year = nowTime.getFullYear();
		var month = nowTime.getMonth();
		var temp = 1;
		if(month == 0){
			year = year - 1;
			month = 12;
		}
		$('#' + monthId).empty();
		$('#' + monthId).append("<option value=''>--请选择--</option>");
		for(var j=1; j <= 12; j++){
			if(j < 10){
				$('#' + monthId).append("<option value='"+("0"+j)+"'>"+j+"</option>");
			}else{
				$('#' + monthId).append("<option value='"+j+"'>"+j+"</option>");
			}
		}
	}
}

/*单独开启遮罩*/
function _justShowOverflowLoading(){
	var h = $(document).height();
	$(".overlay").css({"height": h });
	$(".overlay").css({'display':'block','background':'black','opacity':'0.2'});
}
/*单独关闭遮罩*/
function _justHideOverflowLoading(){
	$(".overlay").css({'display':'none','background':'#f6f4f5','opacity':'0'}); 
}

/*清空上传文件域的值，兼容火狐、IE*/
function _clearFileArea(fileId){
	//清空文本域，兼容火狐/ie
	var file = $("#" + fileId);
	file.after(file.clone().val(""));
	file.remove(); 
}
function getClientSsid(){
	var ssidStr = document.cookie;
	var ssids = ssidStr.split(";");
	for(var i = 0; i< ssids.length; i++){
		var name = _trim(ssids[i].split("=")[0]);
		if(name == '_ssid'){
			return ssids[i].split("=")[1];
		}
	}
	return "-";
}
var cookieKey = "tyll800_buyCar";
var cookieSingleKey = "tyll800_buyCar_single";
//加入cookie（单个）
function addCookieSingle(obj){
	deleteCookieSingle();
	//赋值cookie
	var objString = JSON.stringify(obj); //JSON 数据转化成字符串
 	//$.cookie(cookieSingleKey, objString,{path:"/"});
	document.cookie= cookieSingleKey+"="+objString+"; path=/"; 
}
//删除cookie（单个）
function deleteCookieSingle(){
 	//$.cookie(cookieSingleKey,null);
	var date=new Date(); 
	date.setTime(date.getTime()-10000); 
	document.cookie=cookieSingleKey+"=v; expires="+date.toGMTString()+"; path=/"; 
}
//获取cookie（单个）
function getCookieSingle(){
	var strCookie=document.cookie; 
	var arrCookie=strCookie.split("; "); 
	for(var i=0;i<arrCookie.length;i++){ 
		var arr=arrCookie[i].split("="); 
		if(arr[0]==cookieSingleKey)
			if(arr[1] != null && arr[1] != "")
			return arr[1]; 
		} 
	return ""; 
 	//return $.cookie(cookieSingleKey);
}
//加入cookie(支持多个)
function addCookie(obj){
	var list = $.cookie(cookieKey);
	var objMap = new Object();
	if(list){
		list = JSON.parse(list);
		//原来数量上叠加
		var isExist = false;
		for(i = 0; i<list.length; i++){
			var map = new Object();
			map = list[i];
			//key匹配
			if(obj.platOfferId == map.key){
				map.value.trafficNum = parseInt(map.value.trafficNum) + parseInt(obj.trafficNum);
				if(map.value.trafficNum>1000000){
					alert("购物车的流量包个数已达到上限，请结算后再添加购物车！");
					return;
				}
				list[i] = map;
				isExist = true;
				break;
			}
		}
		if(!isExist){
			objMap.key = obj.platOfferId;
			objMap.value = obj;
			list[list.length] = objMap;
		}
		
	} else {
		list = new Array();
		objMap.key = obj.platOfferId;
		objMap.value = obj;
		list[0] = objMap;
	}
	//赋值cookie
	var objString = JSON.stringify(list); //JSON 数据转化成字符串
 	$.cookie(cookieKey, objString);
}
//删除cookie，platOfferId：销售品id
function deleteCookie(platOfferId){
	var list = $.cookie(cookieKey);
	var newList = new Array();
	if(list){
		list = JSON.parse(list);
		for(i = 0; i<list.length; i++){
			var map = new Object();
			map = list[i];
			//key匹配
			if(platOfferId != map.key){
				newList[newList.length] = map;
			}
		}
	} else {
		return 0;
	}
	//赋值cookie
	var objString = JSON.stringify(newList); //JSON 数据转化成字符串
 	$.cookie(cookieKey, objString);
 	return 1;
}

function link800(){
	window.location.href="http://800.189.cn";
	
}