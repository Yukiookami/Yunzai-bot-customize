import express from 'express';
import template from 'express-art-template'
import fs from "fs";


/*
* npm run app web-debug开启Bot后
* 可另外通过 npm run web 开启浏览器调试
* 访问 http://localhost:8000/ 即可看到对应页面
* 页面内的资源需使用 {{_res_path}}来作为resources目录的根目录
* 可编辑模板与页面查看效果
* todo: 预览页面的热更
*
* */


var app = express();

var _path = process.cwd();

app.engine('html', template);
app.set('views', _path + '/resources/');
app.set('view engine', 'art');
app.use(express.static(_path + "/resources"));
app.use('/plugins', express.static('plugins'))

app.get('/', function (req, res) {
  let fileList = fs.readdirSync(_path + "/data/ViewData/") || [];
  console.log(fileList);
  let html = [
    '在npm run web-dev模式下触发截图消息后，可在下方选择页面进行调试',
    '如果页面内资源路径不正确请使用{{_res_path}}作为根路径，对应之前的../../../../',
    '可直接修改模板html或css刷新查看效果'
  ];
  let li = [];
  for (let idx in fileList) {
    let ret = /(.+)\.json$/.exec(fileList[idx]);
    if (ret && ret[1]) {
      li.push(`<li><a href="/${ret[1]}">${ret[1]}</a></li>`);
    }
  }
  res.send(html.join('</br>') + '<ul>' + li.join('') + '</ul>');
});

app.get('/:type', function (req, res) {
  let page = req.params.type;
  if (page == "favicon.ico") {
    return res.send("");
  }
  let data = JSON.parse(fs.readFileSync(_path + "/data/ViewData/" + page + ".json", "utf8"));
  data = data || {};
  data._res_path = "";
  data._sys_res_path = data._res_path;

  let app = data._app || "genshin";
  if (data._plugin) {
    console.log(data._plugin);
    data._res_path = `/plugins/${data._plugin}/resources/`;
  }
  let tplPath = `${app}/${page}/${page}.html`;
  if (data._plugin) {
    tplPath = `../plugins/${data._plugin}/resources/${app}/${page}.html`
  }
  res.render(tplPath, data)
});

app.listen(8000);
console.log('页面服务已启动，触发消息图片后访问 http://localhost:8000/ 调试页面')