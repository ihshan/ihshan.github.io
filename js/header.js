$(document).ready(function(){
	$(".op-menulist div").removeClass();
	$(".op-menulist div").bind("mouseover",function(){
		var clazz = $(this).attr("class");
		if(clazz == 'menuselect'){
			;
		}else{
			$(this).addClass("menumouseover");	
		}
	});
	$(".op-menulist div").bind("mouseout",function(){
		$(this).removeClass("menumouseover");	
	});
	
	$(".op-menulist > a").bind("click",function(){
		$(this).attr("href", $(this).attr("href") + "?ssid=" + getClientSsid());
	});
});

function link800(){
	window.location.href="http://800.189.cn/";
}
function link2YQG(){
	window.location.href="http://800.189.cn/payonline/purchase/index.do";
}