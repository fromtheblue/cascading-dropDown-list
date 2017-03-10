/**
 * Created by wangqiong on 2017/3/10.
 * 仿京东选择地址格式的插件
 * options:
 *      name:"" 设置该组件包含的隐藏域的name,便于当组件在表单中时可以直接当做表单元素那样得到值,当name为空时不设置对应隐藏域
 *      datas:[{value:.,text:.},...] 设置初始化组件时下拉面板中的元素,其中value为每一项的值,text为每一项显示的文本
 *      tabs:[{value:.,text:.},...] 设置初始化组件时tabs中的每个元素按照传入的数组顺序填充tabs,其中value为每一项的值,text为每一项显示的文本
 *      placeholder:"请选择" 当tab最后一项未选或label中无数据的时候的默认填充
 *      renderLabel:function(tabs,placeholder,datas){ 填充label的格式的回调函数,返回值为用来填充label的文本
 *          if(tabs.length){
 *              return tabs.reduce(function(target,tab){
 *                  return target+tab.text;
 *              },"");
 *          }else{
 *              return placeholder;
 *          }
 *      }
 *      clickTab:function(tab,idx,tabs,datas) 点击tab的回调函数
 *      clickOption:function(data,idx,tabs,datas) 点击下拉面板每项的回调函数
 * methods:
 *      setDatas    重新填充组件中的数据，组件会自动刷新
 *          params:datas
 *      setOption   重新填充组件的配置，组件会自动刷新
 *          params:option
 *      close       关闭下拉面板
 *      getCheckedTabs 获取所有的tabs的生成数据
 *      getChecked 获取当前选中的数据
 *      getValue 获取当前的值
 */
(function($){
    if($.fn.cascadingDropdownList){
        return;
    }
    var setMethods={
        setOption:setOption,
        setDatas:setDatas,
        close:close
    };
    var getMethods={
        getCheckedTabs:getCheckedTabs,
        getChecked:getChecked,
        getValue:getValue
    };
    $.fn.cascadingDropdownList=function(){
        var args=arguments,params,method;
        if(!args.length|| typeof args[0] == 'object'){
            return this.each(function(idx){
                var $self=$(this);
                $self.data('cascadingDropdownList',$.extend(true,{},$.fn.cascadingDropdownList.default,args[0]));
                params=$self.data('cascadingDropdownList');
                _init.call( $self,params);
                _render.call($self);
            });
        }else{
            if(!$(this).data('cascadingDropdownList')){
                throw new Error('You has not init cascadingDropdownList!');
            }
            params=Array.prototype.slice.call(args,1);
            if (setMethods.hasOwnProperty(args[0])){
                method=setMethods[args[0]];
                return this.each(function(idx){
                    var $self=$(this);
                    method.apply($self,params);
                    _render.call($self);
                });
            }else if(getMethods.hasOwnProperty(args[0])){
                method=getMethods[args[0]];
                return method.apply(this,params);
            }else{
                throw new Error('There is no such method');
            }
        }
    };
    $.fn.cascadingDropdownList.default={
        name:"",
        datas:[],
        tabs:[],
        placeholder:"请选择",
        renderLabel:function(tabs,placeholder,datas){
            if(tabs.length){
                return tabs.reduce(function(target,tab){
                    return target+tab.text;
                },"");
            }else{
                return placeholder;
            }
        },
        clickTab:function(){},
        clickOption:function(){}
    };
    function _init(params){
        return this;
    }
    function _render(){
        var $self=this,
            params=$self.data("cascadingDropdownList"),
            datas=params.datas,
            tabs=params.tabs,
            placeholder=params.placeholder,
            name=params.name,
            _show=params._show,
            renderLabel=params.renderLabel,
            clickTab=params.clickTab,
            clickOption=params.clickOption;
        $self.addClass("cascading-dropDown-container").html([
            function(){
                if(name){
                    return $("<input/>",{
                        type:"hidden",
                        name:name,
                        val:getValue.call($self)
                    })
                }
            }(),
            $("<span/>",{
                "class":"cascading-dropDown-label",
                "html":renderLabel.call($self,tabs,placeholder,datas),
                "click":function(){
                    params._show=true;
                    _render.call($self);
                }
            }),
            $("<div/>",{
                "class":function(){
                    var cls="cascading-dropDown-list-container";
                    if(!_show){
                        cls+=" cascading-hide"
                    }
                    return cls;
                }
            }).append(
                $("<div/>",{
                    "class":"cascading-close",
                    "html":"&times;",
                    "click":function(){
                        params._show=false;
                        _render.call($self);
                    }
                }),
                $("<div/>",{
                    "class":"cascading-labs"
                }).append(
                    function(){
                        var renderTabs=tabs,isContain,values=datas.map(function(data){
                            return data.value;
                        });
                        if($.inArray(tabs[tabs.length-1].value,values)===-1){
                            renderTabs=tabs.concat({text:placeholder});
                        }
                        return renderTabs.map(function(tab,idx){
                            return $("<div/>",{
                                "class":"cascading-lab",
                                "html":tab.text,
                                "click":function(){
                                    if(tab.value!==undefined){
                                        var oldTabs=JSON.parse(JSON.stringify(tabs));
                                        params._loading=true;
                                        _render.call($self);
                                        params.tabs=tabs.slice(0,idx+1);
                                        clickTab.call($self,tab,idx,oldTabs,datas);
                                    }
                                }
                            })
                        });
                    }()
                ),
                $("<div/>",{
                    "class":"cascading-content"
                }).append(
                    function(){
                        if(params._loading){
                            return loading();
                        }else{
                            return $("<ul/>").append(
                                datas.map(function(data,idx){
                                    return $("<li/>").append(
                                        $("<a/>",{
                                            "class":"cascading-item",
                                            "html":data.text,
                                            "click":function(){
                                                params._loading=true;
                                                _render.call($self);
                                                var values=datas.map(function(data){
                                                    return data.value;
                                                });
                                                if($.inArray(tabs[tabs.length-1].value,values)===-1){
                                                    tabs[tabs.length]=data;
                                                }else{
                                                    tabs[tabs.length-1]=data;
                                                }
                                                clickOption.call($self,data,idx,tabs,datas);
                                            }
                                        })
                                    )
                                })
                            )
                        }
                    }()
                )
            )]
        )
    }
    function setOption(option){
        var $self=this,
            params=$self.data("cascadingDropdownList");
        $.extend(params,{_loading:false},option);
        _render.call($self);
    }
    function setDatas(datas){
        var $self=this,
            params=$self.data("cascadingDropdownList");
        $.extend(params,{datas:datas,_loading:false});
        _render.call($self);
    }
    function loading(){
        return $("<div/>",{
            "class":"cascading-loading",
            "text":"加载中..."
        })
    }
    function close(){
        var $self=this,
            params=$self.data("cascadingDropdownList");
        params._show=false;
        _render.call($self);
    }
    function getCheckedTabs(){
        var $self=this,
            params=$self.data("cascadingDropdownList");
        return params.tabs.filter(function(tab){
            return tab.value;
        });
    }
    function getChecked(){
        var $self=this,
            checkedTabs=getCheckedTabs.call($self);
        if(checkedTabs.length){
            return getCheckedTabs.call($self)[checkedTabs.length-1];
        };
    }
    function getValue(){
        var $self=this,
            checked=getChecked.call($self);
        if(checked){
            return getChecked.call($self).value;
        }
    }
})(jQuery);