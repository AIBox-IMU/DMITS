//初始化vue菜单
const main = Vue.createApp({
        data() {
            const color = '#409EFF';
            const colorbackstate=true;
            const predefineColors = [
                      '#3A3A3E',
                      '#8080C0',
                      '#336699',
                      '#479AC7',
                      '#789D38',
                      '#00B271',
                      '#66CCCC',
                      '#B45B3E',
                      '#DA6845',
                      '#D2B48C'
                                    ];
            return {
                color,
                predefineColors,
                colorbackstate,
                menuname:[
                    {"name": "知识引擎","link": "/magi"},
                    {"name": "引文脉络","link": "/magi"},
                    {"name": "发展趋势","link": "/magi"},
                    {"name": "历史人物","link": "/magi"}
                ]
            };
          },
            watch:{
              color: function() {
                  if(this.colorbackstate) {
                      $("#main").find("*").addClass("add-color");
                      $("body").css("background", this.color);
                      $.session.set('backgroundColor', this.color, 7);
                  }
                  else {
                      this.colorbackstate=true;
                  }
              }
            },
    methods: {
            colorback(){
                this.colorbackstate=false;
                this.color="#a6a9ad";
                $("#main").find("*").removeClass("add-color");
                $("body").css("background","#F1FAFA");
                $.session.remove('backgroundColor');
            }
    },
  });
main.use(ElementPlus);
main.mount("#main")
//添加首页的卡片效果
$(".el-card").mouseover(function(){
  $(this).css("min-height","30vh");
})
$(".el-card").mouseout(function(){
  $(this).css("min-height","10vh");
})