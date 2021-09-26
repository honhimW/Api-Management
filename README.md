# RequestWeb

A Quasar Framework app

## Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
npm run lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).



## 使用

#### 部分快捷键

```bash
alt+A	//打开/关闭抽屉
ctrl+alt+F	//在request body输入框内格式化Json
Enter	//弹出对话框确认
Esc	//弹出对话框取消
```



#### 环境变量

- 鼠标移动至页面上方的眼睛可预览当前环境设置的变量；

- 点击(笔)可编辑环境变量；
- 在URI地址栏和request header的val输入框内输入```${"key"}```作为占位符，对应的内容会被当前环境中对应的变量替换；



#### 目录

- 点击request会跳转到对应请求，当前请求改动会提示, SAVE为粉色代表有改动



#### Pre-Script

- 用于编辑headers信息
- 有一些预设的方法

```javascript
// example
function function_name() {
  	// body...
  	// to do
    setHeader("key", "val") //添加header
    getHeader("key") //获取header
    getBody() //获取request body
    getEnvProp("key") //获取环境变量
    md5("str") //计算md5
    btoa("str") //base64编码
    atob("str") //base64解码
    formatDate() //获取当前时间格式化，默认 YYYYmmddHHMMSS，输入参数则自定义格式化
    timestamp() //获取当前timestamp
    rsawp("str", "privateKey") //rsa加密，传入私钥
    alert("") //浏览器alert()
    log("") //浏览器控制台console.log()
}
function_name()
```

- 脚本在请求时运行，只对当前发起的该次请求生效，所有修改不会影响当前的环境和header
