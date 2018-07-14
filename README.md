# 稿定抠图截图说明

---

## 前端 SDK

前端 SDK 基于 Vue.js 实现，需要配合 Npm 以及 Webpack 打包才能嵌入项目；Npm 包参见：[@gaoding/matting-editor](https://www.npmjs.com/package/@gaoding/matting-editor)

如果不熟悉 Vue.js 或者 Npm 可以使用示例中 `index.html`，推荐使用 Npm 方式引入。

---

## 后端 API

### 签名算法

> 示例代码内有 Node.js 和 php 版本签名实现

1. 设临时字符串为空， `let tmpStr = '';`
2. 拼接 APPID， `tmpStr += APP_ID;`
3. 拼接 HTTP Method (大写)， `tmpStr += '@' + 'GET';`
4. 拼接 Request URI (不包含 host 和 protocol)， `tmpStr += '@' + '/templets';`
5. 拼接 Query String，参数名按 ASCII 码从小到大排序（字典序，不需要 urlEncode）， `tmpStr += '@' + sortByASCII(query);`
6. 拼接时间戳， `tmpStr += '@' + '1480486666';`
7. 拼接 Request Body，如果内容为空忽略此步骤，对 body 做 JSON 序列化， `tmpStr += '@' + JSON.stringify(body);`
8. 用 tmpStr 和 AppSecret 做 Hmac sha1 计算得到签名值（hex 全小写格式导出）， `let signature = sha1(tmpStr, APP_SECRET);`

#### API_URL、APP_ID、 APP_SECRET

外网 API_URL 为：`https://api.gaoding.com`

APP_ID 和 APP_SECRET 请联系稿定运营获取。

#### 注意事项

1. 所有数据均使用 utf-8 编码
2. APPID，时间戳， 签名值分别使用 'X-Appid', 'X-Timestamp', 'X-Signature' 请求头发送
3. Query String 区分大小写，且所以键值均不要做 URL Encode
4. 各个数据块之间用 @ 隔开，Query String 为空时也要保留 @ 符号
5. 时间戳精确到秒（10位），签名有效期为时间戳正负 5 分钟内
6. 如果 Request Body 为空，忽略整个 body 的拼接
7. JSON 序列化 Request Body 时，不要强转义字符，不要转为 unicode，例如 PHP: `$body_str = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);`
8. 请求 API 时尽可能使用  `Content-type: application/json` 避免签名校验失败
9. 如果遇到上传文件等二进制资源请求时，使用 `Content-Type: multipart/form-data`，同时二进制字段不参与签名计算


### 创建抠图 - PostMattings

> POST /mattings

#### 参数

| 字段  | 类型 | 描述 |
|---------|-----------|--------------------------------------|
| scene | String  | **【可选】** 抠图场景 非稿定平台可选，稿定平台使用 url base字段 |
| content | JSON |  抠图数据，详见 `content 结构示例`，如使用前端 SDK 接入，SDK 会自动处理数据  |
| last_save_ip | String | 用户 IP |
| last_ua | String | 用户 UA |

#### 完整参数示例

``` json
{
    "content": '{"sourceImage":"https://st-gdx.dancf.com/gaodingx/mattings/undefined/images/20180626-171051-2.png","imageHeight":0,"imageWidth":0,"backgroundColor":null,"featheringRadius":0,"brushSize":30,"lines":[]}',
    "last_save_ip": "127.0.0.1",
    "last_ua": "curl/1.7"
}

```

### 请求抠图 - PostMattingsIdImages

> POST /mattings/:id/images

### 参数

| 字段    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| content | JSON | **【可选】** 抠图数据，详见 `content 结构示例`，如使用前端 SDK 接入，SDK 会自动处理数据 |
| auto_fill_lines | Boolean |  是否自动填充笔画， 默认值: `true` |
| last_save_ip | String |  用户 IP |
| last_ua | String |  用户 UA |

### 获取抠图详情 - GetMattingsId

> GET /mattings/:id

### 更新抠图 - PutMattingsId

> PUT /mattings/:id

#### 参数

| 字段    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| result_image | String | 抠图结果（需要 CDN地址） |
| content | JSON | 抠图数据 |
| last_save_ip | String | 用户 IP |
| last_ua | String | 用户 UA |

### 删除抠图 - DeleteMattingsId

> DELETE /mattings/:id

----

#### content 结构示例

``` json
{
    "sourceImage": "https://xxx.jpg", // 图片 URL
    "imageWidth": 100, // 图片宽度
    "imageHeight": 100, // 图片高度
    "backgroundColor": "#FF0000", // 输出时背景色，可以为 null
    "featheringRadius": 0, // 羽化半径
    "brushSize": 40 // 画笔大小
    // 用户划线，线条只记录关键座标点，需要 UI 层面适配平滑度
    "lines": [
        // 保留线
        {
            "action": "keep",
            "size": 40,
            "alpha": 0.8,
            "color": 0xff0000
            "points": [
                // x, y
                0, 0,
                1, 1
            ]
        },
        // 剔除线
        {
            "action": "drop",
            "size": 40,
            "alpha": 0.8,
            "color": 0x008800
            "points": [
                0, 0,
                1, 1
            ]
        }
    ]
}
```
