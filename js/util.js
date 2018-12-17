/*
* 功能： 平台各项功能
* 作者： xl
* 时间： 2018-09-09
*/

var util={
    keyConst:{
        SUCCESS_CODE:200,
        ERROR_CODE:"002",
        AUTHORIZE_CODE:"003",
        USER_INFO:"user-info",
        //SERVER_HOST:"http://20274108es.iask.in"
        SERVER_HOST:""
    },

    getUrl:function(url){
        return this.keyConst.SERVER_HOST+url;
    },

    isLogin:function(){
        var info=this.getLoginInfo();
        return !!info;
    },
    setLoginInfo:function(info){
        var strInfo=JSON.stringify(info);
        $.cookie(this.keyConst.USER_INFO,strInfo);
    },
    getLoginInfo:function(){
        var strInfo=$.cookie(this.keyConst.USER_INFO);
        if(strInfo){
            return JSON.parse(strInfo);
        }
    },

    authorizeData:function(data){
        var info=this.getLoginInfo();

        return $.extend(data,info);
    },

    ajax:function(option){
        var oldSuccess=option.success,
        oldError=option.error,
        that=this;
        option.url=this.getUrl(option.url);
        option.success=function(result){
            switch(result.code){
                case that.codeConst.SUCCESS_CODE:
                oldSuccess && oldSuccess.call(null,result.data);
                break;
                case that.codeConst.ERROR_CODE:
                layer.msg(result.msg);
                break;
                case that.codeConst.AUTHORIZE_CODE:
                that.toLogin();
                break;
            }
        };

        option.error=function(){
            layer.msg("网络错误");
            oldError && oldError.apply(null,arguments);
        }

        if(option.needLogin===false){
            //$.ajax(option);
        }else{
            var info= this.getLoginInfo();
            if(info){
                option.data=$.extend({},option.data,info);
            }
            else{
                // 转到登陆页
                //this.toLogin();
            }
        }  
        
        $.ajax(option);
    },
    toLogin:function(){
        location.href="/html/login.html";
    }
};


Date.prototype.format=function(){
    var o = {   
        "M+" : this.getMonth()+1,             
        "d+" : this.getDate(),          
        "h+" : this.getHours(),                
        "m+" : this.getMinutes(),             
        "s+" : this.getSeconds(),                
        "q+" : Math.floor((this.getMonth()+3)/3),   
        "S"  : this.getMilliseconds()               
      };   
      if(/(y+)/.test(fmt))   
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
      for(var k in o)   
        if(new RegExp("("+ k +")").test(fmt))   
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
      return fmt;    
       
};      
