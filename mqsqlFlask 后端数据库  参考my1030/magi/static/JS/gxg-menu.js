const ComponentsApp = {}
const gxgMenu = Vue.createApp(ComponentsApp)
gxgMenu.component('gxg-menu', {
      props: ['index'],
      template: `<el-link :underline="false" href="/" target="_self"  class="menu-link">
                <div class="logo">
                  <span data-text="离">D</span>
                  <span data-text="散">M</span>
                  <span data-text="数">K</span>
                  <span data-text="学">C</span>
                </div>
             </el-link>
            <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
              <el-radio-button :label="false">展开</el-radio-button>
              <el-radio-button :label="true">收起</el-radio-button>
            </el-radio-group>
            <el-menu
              :default-active="index"
              class="el-menu-vertical-demo"
              @open="handleOpen"
              @close="handleClose"
              :collapse="isCollapse"
              background-color="#304156"
              text-color="#BFCBD9"
            >
              <el-link :underline="false" href="/magi" target="_self" class="menu-link">
                  <el-menu-item index="/magi">
                    <i class="el-icon-loading"></i>
                    <template #title>知识引擎</template>
                  </el-menu-item>
                </el-link>
                <el-link :underline="false" href="/magi" target="_self" class="menu-link">
                  <el-menu-item index="/context">
                    <i class="el-icon-tickets"></i>
                    <template #title>引文脉络</template>
                  </el-menu-item>
                </el-link>
                <el-link :underline="false" href="/magi" target="_self" class="menu-link">
                  <el-menu-item index="/development">
                    <i class="el-icon-data-analysis"></i>
                    <template #title>发展趋势</template>
                  </el-menu-item>
                </el-link>
                <el-link :underline="false" href="/magi" target="_self" class="menu-link">
                  <el-menu-item index="/history">
                    <i class="el-icon-time"></i>
                    <template #title>历史人物</template>
                  </el-menu-item>
                </el-link>
                <el-link :underline="false" href="/magi" target="_self" class="menu-link">
                  <el-menu-item index="/about">
                    <i class="el-icon-setting"></i>
                    <template #title>关于</template>
                  </el-menu-item>
                </el-link>
            </el-menu>
            <p class="copyright">Copyright @ 2021 by GXG</p>`,
        data() {
              return {
                isCollapse: true
              }
        },
        methods: {
          handleOpen(key, keyPath) {
            console.log(key, keyPath)
          },
          handleClose(key, keyPath) {
            console.log(key, keyPath)
          }
        }
})
gxgMenu.use(ElementPlus);
gxgMenu.mount('#menu')

$("body").scroll(function() {
    $(".up").css("opacity",Number($("body").scrollTop())/Number($("body").height()));

　　});
    //设置回到顶部
$('.up').on('click', function(event){
        event.preventDefault();
        $("body,html").animate({scrollTop: 0 ,},700);
    });

//获取背景颜色的session,并设置背景颜色
var cookies = document.cookie.split(';');
var cookieCache = {};
for (var i in cookies) {
    var kv = cookies[i].split('=');
    if ((new RegExp('__session:sessionID' + '.+')).test(kv[0]) && kv[1]) {
        cookieCache[kv[0].split(':', 3)[2]] = kv[1];
    }
}
var backgroundColor=cookieCache['backgroundColor'];
if(backgroundColor){
    $("#main").find("*").addClass("add-color");
    $("body").css("background",backgroundColor);
}
else{
    $("#main").find("*").removeClass("add-color");
    $("body").css("background","#F1FAFA");
}


