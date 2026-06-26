var lines = [];
function line(i,startEle, endEle, paths, startPlugs, endPlugs) {// 封装成函数，传入的参数分别是开始点的网页元素、结束点的网页元素、线条的样式、终端的样式
     lines[i] = new LeaderLine(
        LeaderLine.mouseHoverAnchor(startEle, 'draw', {//设置为鼠标移上div上显示事件，想要固定这里的函数换成单独的startEle即可,并且设置下面的hide: false,反之则反。
        animOptions: {
          duration: 1000, //持续时长
          timing: 'ease-in', // 动画函数
        }
        ,// 清除默认的hover样式
          hoverStyle:{
            backgroundColor: null
          },
            // 起始点样式，这里为了清除默认样式
          style: {
            paddingTop: null,
            paddingRight: null,
            paddingBottom: null,
            paddingLeft: null,
            cursor: null,
            backgroundColor: null,
            backgroundImage: null,
            backgroundSize: null,
            backgroundPosition: null,
            backgroundRepeat: null,
          },
      }),
      //   startEle,
        endEle,
        {
            size: 3,
            path: paths,//线条类型，其他参数见下面表格
            startPlug: startPlugs,//终点样式
            endPlug: endPlugs,
            startPlugColor: '#14A2F5', // 渐变色开始色
            endPlugColor: '#28A745',// 渐变色结束色
            gradient: true, // 使用渐变色
            dash: {animation: true},//设置为虚线
            hide: true,
        }
    );
}
//控制创建/更改线条样式
function createline(positions,flag,num){
        for (var i = 0; i < positions.length; i++) {
            // console.log(positions[i].position + 'start');
            if(!flag&&i>num-1){
              lines[i].position();
            }
            else if(flag) {
                var start = document.getElementById(positions[i].position + 'start');
                var end = document.getElementById(positions[i].position + 'end');
                line(i, start, end, 'fluid', 'behind', 'disc');
            }
        }
}
//VUE初始化
const main = Vue.createApp({
        data() {
            return {
                positions: []
            }
        },

        watch:{
              positions: function() {
                this.$nextTick(function(){
                        createline(this.positions,true,0);
                        //绑定点击隐藏、展开点击事件
                        var that = this;
                        $(".card").click(function(){
                                //当前点击的div
                                if($(this).find('.cardmain').css('display')=='none'){
                                    $(this).find('.cardmain').show(200,function(){
			                                createline(that.positions,false,Number($(this).index()));
		});
                                }
                                else{
                                    $(this).find('.cardmain').hide(200,function(){
			                                createline(that.positions,false,Number($(this).index()));
		});
                                }
                            })
                  /*现在数据已经渲染完毕*/
                })
              }
            },
        methods: {
            change(position){
                this.positions=position;
            }
        }
  });
const APP = main.mount("#main")

$.ajaxSetup({async: true});//异步
$.ajax({
            url: "/getJSON",
            type: "post",
            dataType: 'json',
            success: function (data) {

                var datas = JSON.parse(data)
                APP.change(datas);
            },
            error: function (e) {
                console.log("error");
            }
})

//搜索框部分
var old_query = "";
$("#search input").keyup(function(event) {
    // enter，搜索框内按enter键对应事件
    if (event.which == 13) {
              $(".searchsvg").click()
    }
});
$(".searchsvg").click(function(event) {
        let query = $("#search input").val();
        if(query=="" ||query==null||query==" "){
                Notiflix.Report.Failure( '错误', '请先输入需要查询的内容！^_^', '确认' );//为空报错
	        }
        else {
                //这里放入搜索的操作
                old_query=query;
            }
});
//以下产生按钮点击效果
//鼠标移动到元素上
$(".searchsvg").mouseover(function(){
  $(".searchsvg").css("background-color","rgba(20,162,245,0.5)");
});
//鼠标点击时
$(".searchsvg").mousedown(function(){
  $(".searchsvg").css("background-color","rgba(255,255,255,0)");
});
//鼠标点击后
$(".searchsvg").mouseup(function(){
  $(".searchsvg").css("background-color","rgba(20,162,245,0.5)");
});
//鼠标移动出元素后
$(".searchsvg").mouseout(function(){
  $(".searchsvg").css("background-color","rgba(255,255,255,0)");
});


