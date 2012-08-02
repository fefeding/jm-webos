/**
* WEB系统对象,处理本系统应用,排板等基础服务 <br />
* 为静态对象 <br />
* 本系统使用示例: <br />
* //初始化桌面 <br />
*    $(function () { <br />
*        //配置应用 <br />
*        $jm.os.config.appLinks = [ <br />
*            'jm', <br />
*            'jmplayer', <br />
*            'jmgames', //家猫音乐 <br />
*            'jmllh', //连连看 <br />
*            'fc', //小游戏 <br />
*            'setback' <br />
*           ]; <br />
*
*        //设置根路径 <br />
*       $jm.rootUrl = "/"; <br />
*
*       //初始化 <br />
*        $jm.os.init(function () { <br />
*           $('#jm_os_init_model').animate({ opacity: 0 }, 600, function () { <br />
*                $('#jm_os_init_model').remove(); <br />
*           }); <br />
*
*            //启动指定的应用 <br />
*            var initapp = $jm.getParam('app'); <br />
*            if (!$jm.isNull(initapp)) { <br />
*                setTimeout('$jm.os.runApp("' + initapp + '")', 800); <br />
*            } <br />
*        }); <br />
*   });       
* @namespace $jm
* @module jmos
* @class $jm.os
* @static
* @version: 2.0.24.120
* @requires $jm,$jm.menu,$jm.load
**/

$jm.os = new (function () {
    /**
    * 当前系统桌面主体,为jquery对象
    * @property body
    * @type Object 
    * @private
    **/
    this.body;
    /**
    * 任务栏,为jquery对象
    * @property statusTool
    * @type Object
    * @private
    **/
    this.statusTool;
    /**
    * 桌面菜单
    * @property bodyMenu
    * @type $jm.menu
    * @private
    **/
    this.bodyMenu;

    /**
    * 系统配置,WEBOS的基本配置
    * @property config
    * @type Object
    * @private
    **/
    this.config = {
        /**
        * 当前使用的皮肤
        * @property skin
        * @type String
        * @private
        **/
        skin: 'default', //当前皮肤

        /**
        * 系统桌面相关配置
        * backGroundUrl 背景图,itemSize 桌面快捷方式大小,linkItems 所有快捷方式集合
        * @property skin
        * @type String
        * @private
        **/
        desktop: {
            /**
            * 桌面个数
            * @property desCount
            * @type Number
            * @private
            **/
            desCount: 3,

            /**
            * 当前桌面索引
            * @property desIndex
            * @type Number           
            **/
            desIndex: 1,

            /**
            * 所有桌面对象
            * @property deses
            * @type Array
            * @private
            **/
            deses: [],

            /**
            * 图标大小{w:2,h:3}
            * @property itemSize
            * @type Object
            * @private
            **/
            itemSize: { w: 60, h: 80 }, //图标大小

            /**
            * 桌面快捷方式集
            * @property linkItems
            * @type Array
            * @private
            **/
            linkItems: [], //桌面快捷方式集

            /**
            * 桌面快捷方式之间的间距
            * @property desOffset
            * @type Object
            * @private
            **/
            desOffset: { x: 10, y: 10 },

            /**
            * 快捷方式索引
            * @property itemIndex
            * @type Number
            * @private
            **/
            itemIndex: 0,

            /**
            * 桌面背景图URL
            * @property backGroundUrl
            * @type String
            * @private
            **/
            backGroundUrl: '~/css/default/images/wallpaper.jpg', //背景图url

            /**
            * 通过索引获取快捷方式
            * @method getItemByIndex
            * @param {Number} index 快捷方式索引
            * return {Object} 快捷方式
            **/
            getItemByIndex: function (index) {
                var len = $jm.os.config.desktop.linkItems.length;
                for (var i = 0; i < len; i++) {
                    if ($jm.os.config.desktop.linkItems[i].index == index) {
                        return $jm.os.config.desktop.linkItems[i];
                    }
                }
            },

            /**
            * 重新定位桌面快捷方式,改变它们的大小
            * 遍历所有快捷方式,重新定位
            * @method position
            * @param w {Number} 快捷方式宽度
            * @param h {Number} 快捷方式高度
            *
            **/
            position: function (w, h) {
                var len = $jm.os.config.desktop.linkItems.length;
                for (var i = 0; i < len; i++) {
                    $jm.os.config.desktop.linkItems[i].position(w, h);
                }
            }
        },

        /**
        * 应用最小层叠
        * @property appMinZIndex
        * @private
        * @type Number
        **/
        appMinZIndex: 100,
        /**
        * 应用最小层叠
        * @property appMinZIndex
        * @private
        * @type Number
        **/
        winMinZIndex: 1000, //窗口最小层叠
        /**
        * 应用最小层叠
        * @property appMinZIndex
        * @private
        * @type Number
        **/
        handleIndex: 0, //应用程序句柄索引
        /**
        * 应用最小层叠
        * @property appMinZIndex
        * @private
        * @type Array
        **/
        appLinks: [], //初始化应用连接
        /**
        * 应用最小层叠
        * @property appMinZIndex
        * @private
        * @type Array
        **/
        apps: [] //系统中的应用集
    };

    /**
    * 桌面
    * @class desktop
    * @namespace $jm.os
    * @for $jm.os
    * @param {Object} pars 应用程序的配置信息，为一个ＪＯＳＮ对象,
    **/
    this.desktop = function (pars) {
        /**
        * 桌面索引
        * @property index
        * @type Number
        * @for desktop
        **/
        this.index = pars.index;

        /**
        * @property parent 当前桌面的父容器
        * @type Object
        * @for desktop
        **/
        this.parent = (pars.parent.element || pars.parent);

        /**
        * @property element 当前元素
        * @type Object
        * @for desktop
        **/
        this.element = pars.element;

        /**
        * @property menu 桌面右健菜单
        * @type Object
        * @for desktop
        **/
        this.menu = new $jm.menu({ target: this.element });

        //下面二个属性只有在目录情况下才有效
        /**
        * @property linkIndex 里面链接索引
        * @type Number
        * @private
        * @for desktop
        * 
        **/
        this.linkIndex = 0;

        /**
        * @property links 此应用的所有快捷方式
        * @type Array
        * @private
        * @for desktop
        * 
        **/
        this.links = []; //所有链接

        /**
        * @method clearLink 初始化链接       
        * @private
        * @for desktop
        * @return void
        * 
        **/
        this.clearLink = function () {
            this.linkIndex = 0;
            //this.links = [];
        }

        /**
        * @method addLink 增加一个链接       
        * @private
        * @for desktop
        * @return void
        * 
        **/
        this.addLink = function (link) {
            this.links.push(link);
        }

        /**
        * @method positionLinks 重新排列目录中的所有快捷方式       
        * @private
        * @for desktop
        * @return void
        * 
        **/
        this.positionLinks = function () {
            for (var l in this.links) {
                this.links[l].position();
            }
        }


        /**
        * @method selectedAllLink 设置所有链接选择状态       
        * @private
        * @param {Boolean} s 选择状态,true＝选中，false=消选
        * @for desktop
        * @return void
        * 
        **/
        this.selectedAllLink = function (s) {
            for (var l in this.links) {
                this.links[l].selected(s);
            }
        }

        /**
        * @method getLinkByHandle 查找关联的链接
        * @param {Number} handle 查找关链应用的句柄
        * @for desktop
        * @return Objec 快捷方式
        * 
        **/
        this.getLinkByHandle = function (handle) {
            for (var l in this.links) {
                if (this.links[l].link == handle) return this.links[l];
            }
        }

        /**
        * 显示当前桌面
        * @method show
        * @for desktop
        *
        **/
        this.show = function () {
            if (this.element.appendTo) this.element.appendTo(this.parent.element ? this.parent.element : this.parent);
            this.element.show();
        };

        /**
        * 隐藏当前桌面
        * @method hide
        * @for desktop
        *
        **/
        this.hide = function () {
            this.element.hide();
        }
    }

    /**
    * 应用项,对应用的封装
    * @class appItem
    * @namespace $jm.os
    * @for $jm.os
    * @param {Object} pars 应用程序的配置信息，为一个ＪＯＳＮ对象,
    * 下面对此配置项做一些说明（还有其它的配置项自已看我已写好的应用）：
    *
    * title
    * 表示应用名称，希望是唯一值
    * 
    * model
    * 是否模式窗口,false=非模式,true=模式
    * 
    * position
    * 表示启动位置，left＝左,top＝顶，center=居中
    * 
    * url
    * 表示你要加载的页面或内容（iframe＝true时才会加载为页面，否则为内容）
    * 
    * ico
    * 当前应用图标地址，可以是当前应用的相对路径（相对为os根目的，下同）
    * 
    * resizeable
    * 是否可以改变大小，否则无法手动改变窗体大小
    * 
    * iframe
    * 是否用帧加载页面。否则读取url中的内容
    * 
    * des
    * 是否创建桌面快捷方式
    * 
    * state
    * 启动时的大小，max为最大化,否则为width,height的值为准
    * 
    * bgMenu
    * 是否加入到左健菜单中
    **/
    this.appItem = function (pars) {
        //增加一个应用,句柄自增1
        $jm.os.config.handleIndex += 1;

        /**
        * @property handle 当前应用的句柄
        * @type Number
        * @for appItem
        **/
        pars.handle = this.handle = $jm.os.config.handleIndex;

        /**
        * @property id 当前应用的ＩＤ
        * @type Number
        * @for appItem
        **/
        pars.id = this.id = pars.id || 'jm_app_' + this.handle;

        /**
        * @property name 当前应用的名称
        * @type String
        * @for appItem
        **/
        this.name = pars.name || pars.title;

        /**
        * @property parent 当前应用的父容器
        * @type Object
        * @for appItem
        **/
        this.parent = pars.parent = pars.parent ? (parent.element || pars.parent) : $jm.os.body.element;

        /**
        * @property ico 图标地址
        * @type String
        * @for appItem
        * @private
        **/
        this.ico = !$jm.isNull(pars.ico) ? $jm.checkUrl(pars.ico) :
         $jm.checkUrl('~/css/' + $jm.os.config.skin + '/images/' + (pars.folder ? 'Folder.png' : 'ico.png')); //默认图标

        pars.ico = this.ico;
        this.event = pars.ev;
        this.params = pars; //记录参数
        this.element = pars.element;

        /**
        * @property jmapp 并示为ＯＳ应用对象
        * @type Boolean
        * @private
        * @for appItem
        * 
        **/
        this.jmapp = true; //表示为应用  

        //下面二个属性只有在目录情况下才有效
        /**
        * @property linkIndex 里面链接索引
        * @type Number
        * @private
        * @for appItem
        * 
        **/
        this.linkIndex = 0;
        /**
        * @property links 此应用的所有快捷方式
        * @type Array
        * @private
        * @for appItem
        * 
        **/
        this.links = []; //所有链接

        /**
        * @method clearLink 初始化链接       
        * @private
        * @for appItem
        * @return void
        * 
        **/
        this.clearLink = function () {
            this.linkIndex = 0;
            //this.links = [];
        }

        /**
        * @method addLink 增加一个链接       
        * @private
        * @for appItem
        * @return void
        * 
        **/
        this.addLink = function (link) {
            this.links.push(link);
        }

        /**
        * @method positionLinks 重新排列目录中的所有快捷方式       
        * @private
        * @for appItem
        * @return void
        * 
        **/
        this.positionLinks = function () {
            for (var l in this.links) {
                this.links[l].position();
            }
        }


        /**
        * @method selectedAllLink 设置所有链接选择状态       
        * @private
        * @param {Boolean} s 选择状态,true＝选中，false=消选
        * @for appItem
        * @return void
        * 
        **/
        this.selectedAllLink = function (s) {
            for (var l in this.links) {
                this.links[l].selected(s);
            }
        }

        /**
        * @method getLinkByHandle 查找关联的链接
        * @param {Number} handle 查找关链应用的句柄
        * @for appItem
        * @return Objec 快捷方式
        * 
        **/
        this.getLinkByHandle = function (handle) {
            for (var l in this.links) {
                if (this.links[l].link == handle) return this.links[l];
            }
        }

        if (!pars.sys) {
            pars.focusCallback = $jm.os.appFocusCallback; //设置回调
            pars.subCallback = $jm.os.appSubCallback;
            pars.closeCallback = $jm.os.appCloseCallback;
        }

        /**
        * @property __showed 当前链接是否选中       
        * @private      
        * @for appItem
        * @type Boolean
        * 
        **/
        this.__showed = false;

        if (!pars.sys) {//非系统应用
            this.taskItem = new taskItem(this); //添加到任务栏
        }

        /**
        * 弹出当前应用窗口
        * @method show
        * @for appItem
        *
        **/
        this.show = function () {
            if (!this.element) {
                this.element = new $jm.win(pars); //生成窗口
                //处理目录
                if (pars.folder) {
                    //var win = this.element;
                    //定义加载函数
                    pars.load = function () {
                        var folderApp = $jm.os.getApp(pars.handle); //获取当前目录APP
                        if (folderApp && folderApp.clearLink) folderApp.clearLink(); //链接清空
                        //清空
                        folderApp.element.html('');

                        //为目录添加应用链接
                        for (var p in pars.content) {
                            var par = pars.content[p];
                            if (typeof par == 'string') {
                                var app = $jm.os.getApp(par);
                                if (app) par = app.params; //得到参数
                                else continue;
                            }
                            par.container = folderApp.element.winBody;
                            $jm.os.installApp(par); //添加应用到系统中
                            //添加快捷方式
                            $jm.os.addLinkItem(par.handle, pars.handle);
                        }
                        //大小改变回调
                        pars.resizeCallback = function () {
                            var app = $jm.os.getAppByHandle(this.params.handle);
                            if (app)
                                app.positionLinks(); //重新定位快捷方式
                        }
                    }
                }
            }
            if (this.element.appendTo)
                this.element.appendTo(this.parent.element ? this.parent.element : this.parent);

            this.element.show();

            this.__showed = true; //标识已显示

            if (this.taskItem) {
                this.taskItem.show(); //显示到任务栏
            }
        };

        /**
        * 激活当前应用
        * @method active
        * @for appItem
        *
        **/
        this.active = function () {
            if (this.element.visible) {
                this.element.visible(true);
                this.element.focus();
            }
        }

        /**
        * 隐藏当前应用
        * @method active
        * @for appItem
        *
        **/
        this.hide = function () { this.element.hide(); this.__showed = false; };
    }

    /**
    * 应用被激活回调
    * @method appFocusCallback
    * @param handle {Number} 被激活的应用句柄
    * @for $jm.os
    *
    **/
    this.appFocusCallback = function (handle) {
        var app = $jm.os.getAppByHandle(handle); //获得应用
        //任务栏显示焦点
        if (app && app.taskItem) {
            app.taskItem.focus();
        }
    }

    /**
    * 应用失去焦点回调
    * @method appSubCallback
    * @param handle {Number} 丢失焦点的应用句柄
    * @for $jm.os
    *
    **/
    this.appSubCallback = function (handle) {
        var app = $jm.os.getAppByHandle(handle); //获得应用
        //任务栏失去焦点
        if (app && app.taskItem) {
            app.taskItem.sub();
        }
    }

    /**
    * 应用被关闭回调
    * @method appCloseCallback
    * @param handle {Number} 丢失焦点的应用句柄
    * @for $jm.os
    *
    **/
    this.appCloseCallback = function (handle) {
        var app = $jm.os.getAppByHandle(handle); //获得应用
        //关闭任务
        if (app && app.taskItem) {
            app.taskItem.close();
        }
    }

    /**
    * 设置所有桌面快捷方式是否选中
    * @method selectedAlllinkItems
    * @param s {Boolean} 选中与否，true=选中,false=消选
    * @for $jm.os
    *
    **/
    this.selectedAlllinkItems = function (s) {
        var len = $jm.os.config.desktop.linkItems.length;
        for (var i = 0; i < len; i++) {
            var item = $jm.os.config.desktop.linkItems[i];
            item.selected(s);
        }
    };

    /**
    * 快捷方式对象
    * @class $jm.os.linkItem   
    * @param {Object} pars 参数,与其关联的APP参数一至
    * @param {Object} container 父容器,比如桌面快捷方式和目录中的快捷方式
    * @param {Number} index 当前容器中其排序号   
    */
    this.linkItem = function (pars, container, index) {
        /**
        * 与应用关联句柄
        * @property link
        * @type Number
        * @for $jm.os.linkItem
        **/
        this.link = pars.handle;

        /**
        * 当前快捷方式的索引
        * @property index
        * @type Number
        * @for $jm.os.linkItem
        * @private
        **/
        this.index = $jm.isNull(index) ? $jm.os.config.desktop.itemIndex++ : index;

        /**
        * 当前快捷方式的父容器
        * @property parent
        * @type Object
        * @for $jm.os.linkItem
        **/
        this.parent = container || pars.container || $jm.os.body.element; //桌面载体

        /**
        * 是否为桌面快捷方式
        * @property link
        * @type Boolean
        * @for $jm.os.linkItem
        * @private
        **/
        this.isDes = this.parent == $jm.os.body.element; //是否为桌面快捷方式

        /**
        * 快捷方式主体
        * @property desbody
        * @type Object
        * @for $jm.os.linkItem
        * @private
        **/
        this.desbody = $('<div class="jmdesktopitem" jm_desindex="' + this.index + '"></div>');

        var __seleted = false;

        /**
        * 设置或获取当前快捷方式是否被选中
        * @method selected  
        * @param s {Boolean} 可选,不输入为获取当前选中状态,否则为把当前状态设置为指定状态      
        * @for $jm.os.linkItem
        * @return Boolean 快捷方式当前选中与否
        **/
        this.selected = function (s) {
            if (s == true) {
                //首先取消所有快捷方式的选择状态
                if (this.isDes) {
                    $jm.os.selectedAlllinkItems(!s);
                }
                else {
                    var app = $jm.os.getAppByHandle(this.parentHandle); //获取父应用
                    if (app) {
                        app.selectedAllLink(!s);
                    }
                }
                this.desbody.addClass('jmdesktopitemfocus');
                __seleted = s;
            }
            //消选
            else if (s == false) {
                __seleted = s;
                this.desbody.removeClass('jmdesktopitemfocus');
            }
            return __seleted;
        };

        /**
        * 获取当前快捷方式关联的应用
        * @method app
        * @for $jm.os.linkItem
        * @return Object 当前快捷方式关联的应用
        **/
        this.app = function () {
            return $jm.os.getAppByHandle(this.link); //获取应用
        }

        /**
        * 设置快捷方式大小为指定的大小
        * @method resize
        * @for $jm.os.linkItem       
        **/
        this.resize = function () {
            this.desbody.width($jm.os.config.desktop.itemSize.w);
            //this.desbody.height($jm.os.config.desktop.itemSize.h);
        }


        /**
        * 设置或获取当前快捷方式大小
        * @method position
        * @for $jm.os.linkItem
        * @param {Number} w 可选,宽度
        * @param {Number} h 可选,高度   
        **/
        this.position = function (w, h) {
            var w = w || $jm.os.config.desktop.itemSize.w;
            var h = h || $jm.os.config.desktop.itemSize.h;

            h += $jm.os.config.desktop.desOffset.y;
            w += $jm.os.config.desktop.desOffset.x;

            //计算竖线内可以容纳多少个           
            var ycount = Math.floor((this.parent.height() - $jm.os.config.desktop.desOffset.y) / h);
            ycount = ycount < 0 ? 0 : ycount;
            var xy = Math.floor(this.index / ycount);
            var curx = xy * w + $jm.os.config.desktop.desOffset.x; //计算x的位置,加上左边距
            var cury = (this.index - (xy * ycount)) * h; //计算y的位置

            //设置当前位置
            this.desbody.css('top', cury + $jm.os.config.desktop.desOffset.y);
            this.desbody.css('left', curx);

            return this.desbody.position();
        }

        /**
        * 是否已显示
        * @property __showed
        * @type Boolean
        * @for $jm.os.linkItem
        **/
        var __showed = false;

        /**
        * 显示快捷方式,显示在此父容器中
        * @method show
        * @for $jm.os.linkItem       
        **/
        this.show = function () {
            if (__showed) return;
            var app = this.app(); //关联应用
            if (app) {
                var img = $('<img src="' + app.ico + '" border="0" alt="' + app.name + '" />');

                img.appendTo(this.desbody);
                var text = $('<span class="text"></span>');
                text.text(app.name); //设置名称
                text.appendTo(this.desbody);

                this.desbody.attr('title', app.name);
                this.desbody.attr('jm_link_parenthandle', this.parentHandle);
                this.desbody.attr('jm_app_handle', this.link); //关联链接
                //此为桌面链接
                this.desbody.attr('jm_des', this.isDes);


                //显示到桌面
                this.desbody.appendTo(this.parent);

                //快捷方式单击事件
                this.desbody.bind('click', function (ev) {
                    var obj = $(this);
                    var item;
                    var des = obj.attr('jm_des'); //是否为桌面快捷方式1
                    if (des.toLowerCase() == 'true') {
                        var itemindex = obj.attr('jm_desindex');
                        item = $jm.os.config.desktop.getItemByIndex(itemindex);
                    }
                    if (!item) {
                        var phandle = obj.attr('jm_link_parenthandle');
                        var handle = obj.attr('jm_app_handle');
                        var app = $jm.os.getAppByHandle(phandle); //获取父应用
                        if (app) item = app.getLinkByHandle(handle); //获取链接
                    }
                    if (item) {
                        var selected = item.selected(); //获取选取状态
                        if (selected)//如果已被选择..则直接打开此应用
                        {
                            item.app().show(); //打开关联的应用                            
                        }
                        item.selected(!selected); //反置选择
                    }
                });

                if ($.browser.msie && $.browser.version < '9') {
                    // 双击打开事件
                    this.desbody.dblclick(function (ev) {
                        var itemindex = $(this).attr('jm_desindex');
                        var item = $jm.os.config.desktop.getItemByIndex(itemindex);
                        if (item) {
                            item.app().show(); //打开关联的应用
                            item.selected(false); //消选
                        }
                    });
                }
                __showed = true;

                //设置大小
                this.resize();
                //设定其位置
                this.position();

            } //显示自已
        }
    }

    /**
    * 增加快捷方式链接到指定的容器中
    * @method addLinkItem
    * @param {Number} handle 链接到应用的句柄 
    * @param {Number} toHandle 父容器的句柄
    * @for $jm.os
    **/
    this.addLinkItem = function (handle, toHandle) {
        var app = this.getAppByHandle(handle);
        if (app) {
            var parent = this.getAppByHandle(toHandle); //获取目标应用\
            //所属容器
            var container = parent && parent.element && parent.element.winBody ? parent.element.winBody : null;
            var index = parent && !$jm.isNull(parent.linkIndex) ? parent.linkIndex++ : null;
            var item = new this.linkItem(app, container, index);
            if (toHandle) item.parentHandle = toHandle;
            if (parent && parent.jmapp) {
                parent.addLink(item); //加到应用中
            }
            else {
                this.config.desktop.linkItems.push(item);
            }
            item.show();
        }
    }

    /**
    * 任务栏项
    * @class $jm.os.taskItem
    * @param {Object} app 当前任务栏项关联的应用     
    * @for $jm.os
    **/
    var taskItem = function (app) {
        //获取当前任务栏项
        //如果已存在则不处理
        this.task = $('#jm_task_' + app.handle);
        if (this.task.length > 0) return;

        /**
        * 任务栏元素
        * @property task
        * @type Object
        * @for $jm.os.taskItem
        * @private
        **/
        this.task = $('<div id="jm_task_' + app.handle + '" class="jmos_taskitem" ><div>');
        /**
        * 任务栏内容对象
        * @property taskbody
        * @type Object
        * @for $jm.os.taskItem
        * @private
        **/
        var taskbody = $('<div class="body"></div>')
        taskbody.appendTo(this.task);
        /**
        * 任务栏图标
        * @property img
        * @type Object
        * @for $jm.os.taskItem
        * @private
        **/
        var img = $('<img src="' + app.ico + '" border="0" alt="' + app.name + '" />');
        img.appendTo(this.task);

        /**
        * 是否已显示
        * @property showed
        * @type Boolean
        * @for $jm.os.taskItem
        * @private
        **/
        this.showed = false;

        this.task.attr('app', app.handle);
        this.task.attr('title', app.name);

        /**
        * 任务单击事件
        * @event taskClick        
        * @for $jm.os.taskItem        
        **/
        this.taskClick = function () {
            var handle = $(this).attr('app');
            var app = $jm.os.getAppByHandle(handle); //通过句柄激活程序
            if (app) {
                //如果应用不是最小化..则把它最小化
                if (app.element && !$jm.isNull(app.element.winState)) {
                    if (app.element.winState != $jm.winState.min && app.element.actived()) {
                        app.element.min();
                        return;
                    }
                }
                //激活
                app.active();

            }
        }

        /**
        * 显示当前任务栏
        * @method show        
        * @for $jm.os.taskItem        
        **/
        this.show = function () {
            if (!this.showed) {
                this.task.appendTo($jm.os.statusTool.element); //加入到任务栏

                //绑定单击事件
                this.task.unbind('click', this.taskClick);
                this.task.bind('click', this.taskClick);
            }
            //已显示
            this.showed = true;
        }

        /**
        * 任务栏获得焦点
        * @method focus        
        * @for $jm.os.taskItem        
        **/
        this.focus = function () {
            this.task.addClass('jmos_taskitemfocus');
        };

        /**
        * 任务栏失去焦点
        * @method sub        
        * @for $jm.os.taskItem        
        **/
        this.sub = function () {
            this.task.removeClass('jmos_taskitemfocus')
        };

        /**
        * 移除任务栏
        * @method close        
        * @for $jm.os.taskItem        
        **/
        this.close = function () {
            this.task.remove();
            this.showed = false;
        };
    }

    /**
    * 增加桌面菜单
    * @method addBodyMenu  
    * @param {Object} item 桌面菜单项      
    * @for $jm.os        
    **/
    this.addBodyMenu = function (item, desktop) {
        if (!desktop) desktop = this.body;
        desktop.menu.addItem(item);
    }

    /**
    * 安装应用
    * @method installApp  
    * @param {Object} pars 生成应用的各参数JSON,查看app目录中的应用    
    * @for $jm.os        
    **/
    this.installApp = function (pars) {
        var name = pars.name || pars.title;
        //查找是否已存在名称相同的应用
        var apptmp = this.getAppByName(name);
        if (!$jm.isNull(apptmp)) {
            pars.handle = apptmp.handle;
            $jm.out('应用:' + name + ' 已存在,添加失败!');
            return;
        }
        //默认锁定左与顶部边界
        pars.bounds = { top: true, left: true, right: false, bottom: false };
        var app = new $jm.os.appItem(pars);
        this.config.apps.push(app);

        //如果没有指定不显示快捷方式.则加入快捷方式到桌面
        if (pars.des == true) {
            this.addLinkItem(app.handle);
        }

        //如果要添加到桌面右健菜单中
        if (pars.bgMenu == true) {
            this.addBodyMenu({
                text: app.name,
                tag: app.handle, //唯一标识
                click: function () {
                    var handle = $(this).attr('tag');
                    $jm.os.runAppByHandle(handle);
                }
            });
        }
    }

    /**
    * 获取APP
    * @method getApp  
    * @param {String or Number} f 可以是ID或handle或名称
    * @for $jm.os        
    **/
    this.getApp = function (f) {
        var len = this.config.apps.length;
        for (var i = 0; i < len; i++) {
            var app = this.config.apps[i];
            if (app.handle == f || app.id == f || app.name == f) return app;
        }
    }

    /**
    * 通过句柄获取应用
    * @method getAppByHandle  
    * @param {Number} handle 应用句柄
    * @for $jm.os        
    **/
    this.getAppByHandle = function (handle) {
        var len = this.config.apps.length;
        for (var i = 0; i < len; i++) {
            if (this.config.apps[i].handle == handle) return this.config.apps[i];
        }
    }

    /**
    * 通过ID获取应用
    * @method getAppById  
    * @param {Number} id 标识
    * @for $jm.os        
    **/
    this.getAppById = function (id) {
        var len = this.config.apps.length;
        for (var i = 0; i < len; i++) {
            if (this.config.apps[i].id == id) return this.config.apps[i];
        }
    }

    /**
    * 通过名称获取已添加的应用
    * @method getAppByName  
    * @param {String} n 名称
    * @for $jm.os        
    **/
    this.getAppByName = function (n) {
        for (var p in this.config.apps) {
            if (this.config.apps[p].name == n) {
                return this.config.apps[p];
            }
        }
    }

    /**
    * 通过应用名称运行此应用
    * @method runAppByName  
    * @param {String} n 名称
    * @for $jm.os        
    **/
    this.runAppByName = function (n) {
        var app = this.getAppByName(n); //获取应用
        if (app && app.show) app.show();
    }

    /**
    * 通过句柄运行程序
    * @method runAppByHandle  
    * @param {Number} handle 应用句柄
    * @for $jm.os        
    **/
    this.runAppByHandle = function (handle) {
        var app = this.getAppByHandle(handle); //获取应用
        if (app && app.show) app.show();
    }


    /**
    * 通过句柄,名称或id启动app
    * @method runAppByHandle  
    * @param {Object} appmark 应用句柄,名称或ID
    * @for $jm.os        
    **/
    this.runApp = function (appmark) {
        var app = this.getApp(appmark); //获取应用
        if (app && app.show) app.show();
    }

    /**
    * 激活应用
    * @method runAppByHandle  
    * @param {Number} handle 应用句柄
    * @for $jm.os        
    **/
    this.activeAppByHandle = function (handle) {
        var app = this.getAppByHandle(handle); //获取应用
        if (app && app.active) app.active();
    }

    /**
    * 生成桌面
    * @method createDestop    
    * @for $jm.os   
    * @param {Number} index 桌面索引  
    * @return Object 桌面  
    **/
    this.createDestop = function (index) {
        var des = this.config.desktop.deses[index];
        if ($jm.isNull(des)) {
            des = new this.desktop({ parent: $('body'),
                element: $('<div id="jm_os_bodyarea_' + index + '" class="jmos_body"></div>')
            });
            this.config.desktop.deses[index] = des;
        }
        return des;
    }

    /**
    * 跳转到指定桌面
    * @method goToDes    
    * @for $jm.os   
    * @param {Number} index 桌面索引
    **/
    this.goToDes = function (index) {
        var des = $jm.os.createDestop(index); //获得桌面
        if (index == $jm.os.config.desktop.desIndex) {
            $jm.os.body = des;
            $jm.os.body.show();
            //如果跳转到的是当前桌面.则不处理
        }
        else {
            var olddes = $jm.os.body; //记录原桌面
            if (index < $jm.os.config.desktop.desIndex) { //如果目标桌面过引更小
                var left = olddes.element.width();
                des.element.css('left', 0 - left);
                olddes.element.animate({ left: left }, function () {
                    olddes.hide();
                });
            }
            else {
                var left = olddes.element.width();
                des.element.css('left', left);
                olddes.element.animate({ left: 0 - left }, function () {
                    olddes.hide();
                });
            }
            des.show();
            //当前桌面进入
            des.element.animate({ left: 0 }, function () {
                $jm.os.body = des;
                $jm.os.resizeHandler(); //重新调整桌面
            });
        }

        //设定样式
        $('#jm_quickdesktop_' + $jm.os.config.desktop.desIndex).removeClass('quickDesktop_a_focus');
        $('#jm_quickdesktop_' + index).addClass('quickDesktop_a_focus'); //表示当前桌面过引样式
        $jm.os.config.desktop.desIndex = index;
    }

    /**
    * 设置桌面背景
    * @method setBackgroudImg  
    * @param {String} url 北背景图路径
    * @param {Function} callback 设置背景图回调
    * @for $jm.os        
    **/
    this.setBackgroudImg = function (url, callback) {
        if (url) this.config.desktop.backGroundUrl = url;

        url = $jm.checkUrl($jm.os.config.desktop.backGroundUrl);
        $jm.loadImg(url, function () {
            $('body').css('background', 'url("' + url + '") 0 0 repeat');
        })

        //$('body').css('background-image', 'url("' + $jm.os.config.desktop.backGroundUrl + '")');

        if (callback) callback();
    }

    /**
    * 加载皮肤
    * @method setSkin  
    * @param {String} skin 皮肤名称
    * @param {Function} callback 加载皮肤回调
    * @for $jm.os        
    **/
    this.setSkin = function (skin, callback) {
        if (skin) this.config.skin = skin;
        var csscallback = callback;
        $jm.loadCss($jm.checkUrl('~/css/' + this.config.skin + '/desktop.css'), 'cssdesktop', function () {
            $jm.loadCss($jm.checkUrl('~/css/' + $jm.os.config.skin + '/Control.css'), 'cssControl', csscallback);
        });
    }

    /**
    * 窗口大小改变事件
    * @event resizeHandler     
    * @for $jm.os        
    **/
    this.resizeHandler = function () {
        if (!$jm.isNull($jm.os.body) && !$jm.isNull($jm.os.body.element))
            $jm.os.body.element.height($(window).height() - $jm.os.statusTool.element.height()); //重新调整主体大小  
        //重新定位桌面快捷方式
        var spw = 10; //彼此分隔10像素
        if (!$jm.isNull($jm.os.config.desktop))
            $jm.os.config.desktop.position($jm.os.config.desktop.itemSize.w + spw, $jm.os.config.desktop.itemSize.h + spw);
    };

    /**
    * 加载桌面
    * @method loadDesktop 
    * @param {Function} callback 加载桌面回调    
    * @for $jm.os        
    **/
    this.loadDesktop = function (callback) {
        //$('body').html(''); //清空页面

        this.quickDes = new this.appItem({ parent: $('body'), element: $('<div class="quickDesktopBg"></div>'), sys: true });
        this.quickDes.show();
        //生成快速桌面转换按钮
        for (var i = 0; i < this.config.desktop.desCount; i++) {
            var lnk = $('<a id="jm_quickdesktop_' + i + '" onclick="javascript:$jm.os.goToDes(' + i + ');" href="javascript:;"></a>');
            lnk.addClass('quickDesktop_a');
            lnk.appendTo(this.quickDes.element)
        }
        //系统桌面
        this.goToDes(this.config.desktop.desIndex); //生成当前桌面

        //显示桌面快捷方式
        var len = this.config.desktop.linkItems.length;
        for (var i = 0; i < len; i++) {
            this.config.desktop.linkItems[i].show();
        }

        //加入低浏览器警告
        if ($.browser.msie && $.browser.version < 9) {
            var tootipcontent = $('<div class="jm_win_tooltip" style="left:2px;top:2px;margin-top:4px;margin-right:10px;z-index:1;float:right;"></div>');
            tootipcontent.html("请使用火狐,谷歌,苹果,IE9及以上版本浏览器获得最佳效果");
            tootipcontent.appendTo(this.statusTool.element);
        }

        //设置桌面背景 
        $jm.os.setBackgroudImg(null, callback);

        //显示状态栏
        this.statusTool.show();
    }

    /**
    * 初始化已配好的应用
    * @method _initApp    
    * @for $jm.os   
    * @private     
    **/
    this._initApp = function () {
        var index = 0;
        var linkapp = function () {
            var lnk = $jm.os.config.appLinks[index];
            if ($jm.isNull(lnk)) return;
            var url = $jm.checkUrl('~/app/' + lnk);
            //加载应用参数
            $jm.load(url + '/main.js', function (js) {
                try {
                    js = $jm.checkUrl(js); //先处理其中的url
                    var apppars = eval(js);
                    for (var par in apppars) {
                        var pars = apppars[par];
                        if ($jm.isNull(pars.url)) pars.url = url + '/index.html';
                        $jm.os.installApp(pars); //加入到系统中
                    }
                }
                catch (e) {
                    $jm.out(e, 1);
                }
                finally {
                    index++;
                    linkapp()
                }
            });
        }
        //初始化所有应用
        linkapp();
    }

    /**
    * 初始化系统
    * @method init    
    * @for $jm.os   
    * @param {Function} callback 初始化后的回调     
    **/
    this.init = function (callback) {
        //var thiscallback = callback;

        //绑定窗口大小改变事件
        $(window).resize(this.resizeHandler);
        var initcallback = function () {

            //状态栏
            $jm.os.statusTool = new $jm.os.appItem({ parent: $('body'), element: $('<div class="jmos_status"></div>'), sys: true }); //系统级别的应用

            $jm.os.loadDesktop(callback);

            //延迟加载应用
            //setTimeout($jm.os._initApp, 400);
            $jm.os._initApp();

            //if (callback) callback();            

            $jm.os.resizeHandler();
        };
        //this.setSkin('default', initcallback); //加载默认皮肤
        initcallback();
    }
})();
