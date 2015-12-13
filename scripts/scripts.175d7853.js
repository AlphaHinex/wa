"use strict";var avKey="ncucSqWquNS5qSBCNrqEhA8O",avSecret="d6cARxGcTwgyi0IGz7ss7LHp";AV.initialize(avKey,avSecret);var deps=["ngMaterial","ngRoute","ui.grid","ui.grid.exporter","ui.grid.moveColumns","ui.grid.pagination","ui.grid.pinning","ui.grid.resizeColumns"],app=angular.module("wa",deps),resourcesRoute=function(a){a.when("/",{controller:"loginCtrl",templateUrl:"views/login.html"}).when("/main",{templateUrl:"views/main.html"})};app.config(["$routeProvider",resourcesRoute]);var loginCtrl=function(a,b,c){AV.User.current()?b.url("/main"):a.needLogin=!0,a.imagePath="images/fall.368e657d.jpeg",a.login=function(){a.loging=!0,AV.User.logIn(a.uname,a.pwd,{success:function(){a.loginErr=!1,a.loging=!1,b.url("/main"),a.uname="",a.pwd=""},error:function(){console.log("failed"),a.loging=!1,a.uname="",a.pwd="",a.loginErr=!0}})},c.bind("keypress",function(b){var c=b.keyCode||b.charCode;13===c&&a.uname&&a.pwd&&a.login()})};loginCtrl.$inject=["$scope","$location","$document"];var app=angular.module("wa");app.controller("loginCtrl",loginCtrl);var Case=AV.Object.extend("Case"),showTitle=function(a){var b=new AV.Query(AV.Role);b.equalTo("users",AV.User.current()),b.find({success:function(b){if(1===b.length){var c=b[0];a.role=c,a.roleName=c.getName(),"tx"===a.roleName?a.title="铁西区交通法庭":a.title="Wendy & Alpha"}else b.length>1&&(a.role=b[0],a.roleName=b[0].getName(),a.title="Wendy & Alpha")},error:function(a){console.debug(a)}})},allDefendants=function(){var a="人保财险, 平安保险, 天安保险, 中华联合, 人寿财险, 浙商保险, 华泰保险, 民安保险, 永安保险, 大地保险, 永诚保险, 都邦保险, 信达保险, 华安保险, 太平保险, 太平洋保险, 安华农业, 紫金财险, 渤海保险, 中银保险, 英大泰和保险";return a.split(/, +/g).map(function(a){return a})},createFilterFor=function(a){return function(b){return-1!==b.indexOf(a)}},resetCase=function(a,b){a.searchText="",a.queryString="",b["case"]={initDate:new Date,amount:null,state:"无"}},allStates=function(){return["无","判决","调解","和解","不予受理","咨询"]},refreshList=function(a,b){a.querying=!0,a.allCases=[];var c=b["case"].plaintiff?"and plaintiff like '%"+b["case"].plaintiff+"%' ":"";c+=a.queryString?"and details like '%"+a.queryString+"%'":"";var d="select * from Case where plaintiff > '' "+c+" order by updatedAt desc limit 20";AV.Query.doCloudQuery(d,{success:function(b){var c=b.results;angular.forEach(c,function(b){a.allCases.push({id:b.id,createdAt:b.createdAt,updatedAt:b.updatedAt,initDate:b.attributes.initDate,finishDate:b.attributes.finishDate,plaintiff:b.attributes.plaintiff,defendants:b.attributes.defendants,details:b.attributes.details,state:b.attributes.state,tel:b.attributes.tel,amount:b.attributes.amount,amountFormula:b.attributes.amountFormula})}),a.querying=!1},error:function(b){a.querying=!1,console.dir(b)}})},getACL=function(a){var b=new AV.ACL;return b.setRoleReadAccess(a.role,!0),b.setRoleWriteAccess(a.role,!0),b},postSaveAndUpdate=function(a,b,c){resetCase(a,b),refreshList(a,b),a.submiting=!1,c.show(c.simple().content("保存成功!").position("right top").hideDelay(1500))},saveOrUpdateCallbacks=function(a,b,c,d){return{success:function(){postSaveAndUpdate(b,c,d)},error:function(b,c){a.debug("Save case failed cause: "+c.message)}}},saveOrUpdate=function(a,b,c,d){if(b.submiting=!0,c["case"].defendants||(c["case"].defendants=b.searchText),c["case"].id){var e=new AV.Query(Case);e.get(c["case"].id,{success:function(e){e.set("initDate",c["case"].initDate),e.set("finishDate",c["case"].finishDate),e.set("plaintiff",c["case"].plaintiff),e.set("defendants",c["case"].defendants),e.set("details",c["case"].details),e.set("state",c["case"].state),e.set("tel",c["case"].tel),e.set("amount",c["case"].amount),e.set("amountFormula",c["case"].amountFormula),e.setACL(getACL(c)),e.save(null,saveOrUpdateCallbacks(a,b,c,d))},error:function(b,c){a.debug("Update case failed cause: "+c.message)}})}else{var f=Case["new"](c["case"]);f.setACL(getACL(c)),f.save(null,saveOrUpdateCallbacks(a,b,c,d))}},setColor=function(a){var b=allStates(),c="font-weight: bold; color: ";switch(a){case b[1]:c+="red";break;case b[2]:c+="purple";break;case b[3]:c+="green";break;case b[4]:c+="blue";break;case b[5]:c+="brown"}return c},caseCtrl=function($scope,$mdToast,$log,$location){$scope.logout=function(){AV.User.logOut(),$location.url("/")},AV.User.current()?($scope.logged=!0,$scope.username=AV.User.current().getUsername()):$scope.logout(),showTitle($scope);var self=this;self.states=allStates(),self.allDefendants=allDefendants(),resetCase(self,$scope),refreshList(self,$scope),self.querySearch=function(a){return a?self.allDefendants.filter(createFilterFor(a)):self.allDefendants},$scope.save=function(){saveOrUpdate($log,self,$scope,$mdToast)},$scope.cancel=function(){resetCase(self,$scope),refreshList(self,$scope)},self.selectCase=function(a){$scope["case"]=a,self.searchText=$scope["case"].defendants},$scope.doQuery=function(){refreshList(self,$scope)},self.setColor=setColor,$scope.computeAmount=function(){var f=$scope["case"].amountFormula.toString();f=f.replace(/[^\d+-\\*\/]*/g,""),$scope["case"].amount=parseFloat(eval(f).toFixed(2))}};caseCtrl.$inject=["$scope","$mdToast","$log","$location"];var app=angular.module("wa");app.controller("caseCtrl",caseCtrl);var format=d3.time.format("%Y-%m-%d"),today=new Date,lastYear=new Date(today.getTime()-31536e6),color=function(a){var b=Math.ceil(a/.25);return"lv"+(b>4?4:b)},drawCalendar=function(){var a=750,b=140,c=13,d=d3.select(".cvph").append("svg").attr("width",a).attr("height",b).attr("class","cv").append("g").attr("transform","translate("+(a-53*c)/2+","+(b-7*c)/2+")");d.append("text").attr("transform","translate(-14,"+1.8*c+")").text("一"),d.append("text").attr("transform","translate(-14,"+3.8*c+")").text("三"),d.append("text").attr("transform","translate(-14,"+5.8*c+")").text("五");for(var e=53-d3.time.weekOfYear(lastYear),f=function(a){var b=a.getFullYear(),c=today.getFullYear(),d=d3.time.weekOfYear(a);return c>b?d=d-53+e:d+=e-1,d},g=lastYear.getFullYear(),h=1===lastYear.getDate()?lastYear.getMonth():lastYear.getMonth()+1,i=0;12>i;i++){var j=new Date(g,h+i,1),k=f(j)+(j.getDay()>0?1:0);if(k>52)break;var l=j.getMonth()+1,m=l>9?l:"0"+l;d.append("text").attr("transform","translate("+c*k+", -5)").text(m)}var n=d.selectAll(".day").data(d3.time.days(lastYear,today)).enter().append("rect").attr("class","day").attr("width",c).attr("height",c).attr("x",function(a){return f(a)*c}).attr("y",function(a){return a.getDay()*c}).datum(format);n.append("title").text(function(a){return a})},dailyCount=function(a,b){var c=10,d=b.sc,e="";d.state&&(e+="and state = '"+d.state+"' "),(d.defendants||d.searchText)&&(e+="and defendants like '%"+(d.defendants?d.defendants:d.searchText)+"%' ");var f=new Date(a);f.setHours(0,0,0,0),f=f.toISOString();var g=new Date(a);g.setHours(23,59,59,999),g=g.toISOString();var h="select count(*) from Case where plaintiff > '' "+e+"and ((initDate <= date('"+g+"') and initDate >= date('"+f+"')) or (updatedAt >= date('"+f+"') and updatedAt <= date('"+g+"')))";AV.Query.doCloudQuery(h,{success:function(b){d3.selectAll("rect").data(d3.time.days(lastYear,today)).datum(format).filter(function(b){return b===a}).attr("class",function(){return"day "+color(b.count/c)}).select("title").text(function(a){return a+": "+b.count+" 件案子"})},error:function(a){console.dir(a)}})},refreshCalendarView=function(a){var b=new Date("2015-11-12");angular.forEach(d3.time.days(lastYear>b?lastYear:b,today),function(b){dailyCount(format(b),a)})},bindGridData=function(a,b){a.gridOptions.data=[],a.total=0,angular.forEach(b.results,function(b){a.gridOptions.data.push({initDateStr:format(b.attributes.initDate),updateDateStr:format(b.updatedAt),finishDateStr:"undefined"!=typeof b.attributes.finishDate?format(b.attributes.finishDate):"",plaintiff:b.attributes.plaintiff,defendants:b.attributes.defendants,details:b.attributes.details,state:b.attributes.state,tel:b.attributes.tel,amount:b.attributes.amount});var c=parseFloat(b.attributes.amount);a.total+=isNaN(c)?0:c}),a.total=a.total.toFixed(2)},queryWithDateRange=function(a,b){var c="",d=a.sc;if(d.fromDate){var e=format(d.fromDate)+"T00:00:00.000Z";c+="and (initDate >= date('"+e+"') or updatedAt >= date('"+e+"')) "}if(d.toDate){var f=format(d.toDate)+"T23:59:59.999Z";c+="and (initDate <= date('"+f+"') or updatedAt <= date('"+f+"')) "}d.state&&(c+="and state = '"+d.state+"' "),(d.defendants||d.searchText)&&(c+="and defendants like '%"+(d.defendants?d.defendants:d.searchText)+"%' ");var g="select * from Case where plaintiff > '' "+c+" order by updatedAt desc";AV.Query.doCloudQuery(g,{success:function(c){b(a,c)},error:function(a){console.dir(a)}})},refreshGridData=function(a){queryWithDateRange(a,bindGridData)},refreshPie=function(a,b){for(var c=b.results,d=c.length,e={"无":0,"判决":0,"调解":0,"和解":0,"不予受理":0,"咨询":0},f=0;d>f;f++){var g=c[f].attributes.state;"undefined"!=typeof g&&(e[g]+=1)}a.charts.pieOption={tooltip:{trigger:"item",formatter:"{b} : {c} ({d}%) <br/>{a}"},legend:{x:"center",y:"bottom",data:["无","判决","调解","和解","不予受理","咨询"]},toolbox:{show:!0,feature:{restore:{show:!0},saveAsImage:{show:!0}}},calculable:!0,series:[{name:"案件总数: "+b.results.length,type:"pie",radius:[30,110],center:["50%","50%"],roseType:"area",selectedMode:"multiple",data:[{value:e["无"],name:"无"},{value:e["判决"],name:"判决"},{value:e["调解"],name:"调解"},{value:e["和解"],name:"和解"},{value:e["不予受理"],name:"不予受理"},{value:e["咨询"],name:"咨询"}]}]},a.charts.pie.setOption(a.charts.pieOption),a.charts.pie.restore()},drawPie=function(a){queryWithDateRange(a,refreshPie)},statisCtrl=function(a,b){b.setCurrentLang("zh-cn"),a.sc={},a.total=0,a.charts={pie:echarts.init(document.getElementById("pie-placeholder")),pieOption:{}},drawCalendar(),drawPie(a),refreshCalendarView(a),a.gridOptions={columnDefs:[{name:"原告",field:"plaintiff",width:100},{name:"原告电话",field:"tel",width:150},{name:"被告",field:"defendants",width:150},{name:"诉讼标的",field:"amount",width:150,aggregationType:function(){return"合计:"+a.total}},{name:"详细记录",field:"details"},{name:"立案日期",field:"initDateStr",width:100},{name:"更新日期",field:"updateDateStr",width:100},{name:"结案日期",field:"finishDateStr",width:100},{name:"状态",field:"state",width:100}],data:[],enableGridMenu:!0,enableSorting:!1,exporterCsvFilename:"statistic.csv",exporterMenuPdf:!1,paginationPageSizes:[25,50,75,100],paginationPageSize:25,showColumnFooter:!0};var c=this;c.query=function(){refreshCalendarView(a),drawPie(a),refreshGridData(a)},c.reset=function(){a.sc={},a.gridOptions.data=[],drawPie(a),refreshCalendarView(a)}};statisCtrl.$inject=["$scope","i18nService"];var app=angular.module("wa");app.controller("statisCtrl",statisCtrl),angular.module("wa").run(["$templateCache",function(a){a.put("views/case.html",'<md-tab id="case"> <md-tab-label>Case</md-tab-label> <md-tab-body> <md-card> <md-card-content layout-padding> <span class="md-title">案件信息</span> <form name="caseForm"> <div layout layout-sm="column"> <label style="align-self: center" hide-sm>立案日期</label> <md-datepicker ng-model="case.initDate" se.inlaceholder="立案日期"></md-datepicker> <label style="align-self: center; padding-left: 20px" hide-sm>结案日期</label> <md-datepicker ng-model="case.finishDate" md-placeholder="结案日期"></md-datepicker> </div> <div layout layout-sm="column"> <md-input-container flex-sm="100" flex="30"> <label>原告</label> <input ng-model="case.plaintiff" required ng-blur="doQuery()"> </md-input-container> <md-input-container flex="20" flex-sm="100"> <label>原告电话</label> <input ng-model="case.tel"> </md-input-container> <md-autocomplete flex="50" flex-sm="100" md-floating-label="被告" md-search-text="ctrl.searchText" md-items="item in ctrl.querySearch(ctrl.searchText)" md-item-text="item" md-min-length="0" md-selected-item="case.defendants"> <md-item-template> <span md-highlight-text="ctrl.searchText" md-highlight-flags="^i">{{item}}</span> </md-item-template> <md-not-found> "{{ctrl.searchText}}" 尚不存在,请添加. </md-not-found> </md-autocomplete> </div> <div layout layout-sm="column"> <md-input-container> <label>状态</label> <md-select ng-model="case.state"> <md-option ng-repeat="state in ctrl.states" value="{{state}}"><span style="{{ctrl.setColor(state)}}">{{state}}</span></md-option> </md-select> </md-input-container> <md-input-container flex="80"> <label>诉讼标的计算</label> <input ng-model="case.amountFormula" ng-blur="computeAmount()"> </md-input-container> <md-input-container flex> <label>诉讼标的</label> <input type="number" ng-model="case.amount"> </md-input-container> </div> <div layout layout-sm> <md-input-container flex> <label>详细记录</label> <textarea ng-model="case.details" columns="1" md-maxlength="1500"></textarea> </md-input-container> </div> <div class="md-actions" layout="row"> <md-button class="md-raised md-primary" ng-click="save()" ng-show="caseForm.$valid" ng-disabled="ctrl.submiting">保存</md-button> <md-button class="md-raised" ng-click="cancel()">取消</md-button> </div> </form> </md-card-content> </md-card> <md-card> <md-card-content> <md-progress-linear md-mode="query" ng-show="ctrl.querying"></md-progress-linear> <span class="md-title">案件列表</span> <md-list> <md-list-item> <md-button class="md-raised md-primary" ng-click="doQuery()">检索</md-button> <md-input-container flex md-no-float> <input ng-model="ctrl.queryString" placeholder="按详细记录模糊搜索"> </md-input-container> </md-list-item> <md-list-item class="md-3-line" ng-repeat="item in ctrl.allCases" ng-click="ctrl.selectCase(item)"> <div class="md-list-item-text" layout="column"> <h3>{{ item.plaintiff }} / {{ item.defendants }}</h3> <h4> <span style="{{ctrl.setColor(item.state)}}">{{ item.state }}</span> ( {{ item.initDate | date:\'yyyy-MM-dd\' }} ~ {{ item.finishDate | date:\'yyyy-MM-dd\' }} ) </h4> <p>{{ item.details }}</p> </div> </md-list-item> </md-list> </md-card-content> </md-card> </md-tab-body> </md-tab>'),a.put("views/login.html",'<div layout="row" layout-align="center center" style="margin: 10px" ng-show="needLogin"> <md-card> <img ng-src="{{imagePath}}" class="md-card-image"> <form name="loginForm"> <md-content layout="column" layout-padding> <md-input-container layout> <label>用户名</label> <input ng-model="uname" required> </md-input-container> <md-input-container layout> <label>密码</label> <input ng-model="pwd" type="password" required> </md-input-container> <md-button layout class="md-raised md-primary" ng-show="loginForm.$valid" ng-click="login()">登录</md-button> <div ng-show="loginErr && uname===\'\'">登录失败</div> </md-content> </form> <md-progress-linear md-mode="query" ng-show="loging"></md-progress-linear> </md-card> </div>'),a.put("views/main.html",'<div ng-controller="caseCtrl as ctrl" ng-show="logged"> <md-toolbar layout="row" class="md-toolbar-tools md-whiteframe-z1"> <h1 flex>{{ title }}</h1> <img src="https://travis-ci.org/AlphaHinex/wa.svg?branch=master"> <md-button class="md-warn" ng-click="logout()">{{ username }} 登出</md-button> </md-toolbar> <div layout="row" flex> <div layout="column" flex> <md-content class="md-padding"> <md-tabs md-dynamic-height> <ng-include src="\'views/case.html\'"></ng-include> <ng-include src="\'views/statistic.html\'"></ng-include> </md-tabs> </md-content> </div> </div> </div>'),a.put("views/statistic.html",'<md-tab id="statistic"> <md-tab-label>Statistic</md-tab-label> <md-tab-body> <md-card layout-padding> <span class="md-title">案件统计</span> <div ng-controller="statisCtrl as sCtrl"> <div layout="column"> <div layout="row"> <md-button class="md-raised md-primary" ng-click="sCtrl.query()">检索</md-button> <md-button class="md-raised" ng-click="sCtrl.reset()">清空</md-button> </div> <div layout="row" layout-sm="column"> <label style="align-self: center" hide-sm>起始日期</label> <md-datepicker ng-model="sc.fromDate" md-placeholder="起始日期"></md-datepicker> <label style="align-self: center; padding-left: 20px" hide-sm>结束日期</label> <md-datepicker ng-model="sc.toDate" md-placeholder="结束日期"></md-datepicker> </div> <div layout="row" layout-sm="column"> <md-input-container> <label>状态</label> <md-select ng-model="sc.state"> <md-option ng-repeat="state in ctrl.states" value="{{state}}"><span style="{{ctrl.setColor(state)}}">{{state}}</span></md-option> </md-select> </md-input-container> <md-autocomplete flex md-floating-label="被告" md-search-text="sc.searchText" md-items="item in ctrl.querySearch(sc.searchText)" md-item-text="item" md-min-length="0" md-selected-item="sc.defendants"> <md-item-template> <span md-highlight-text="ctrl.searchText" md-highlight-flags="^i">{{item}}</span> </md-item-template> <md-not-found> "{{ctrl.searchText}}" 尚不存在,请添加. </md-not-found> </md-autocomplete> </div> </div> <div hide-sm hide-md class="cvph"></div> <div id="pie-placeholder" style="height: 400px; width: 800px"></div> <div hide-sm ui-grid="gridOptions" ui-grid-exporter ui-grid-move-columns ui-grid-pagination ui-grid-pinning ui-grid-resize-columns class="grid"> </div> </div> </md-card> </md-tab-body> </md-tab>')}]);