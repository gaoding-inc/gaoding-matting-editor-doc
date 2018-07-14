/**
 * examples/signature.js
 */

// qs^6.5.1
const qs = require('qs');
const crypto = require('crypto');

/**
 * sortByASCII
 *
 * @description 按 ASCII 码从小到大，对 JSON 或 String 排序
 *
 * @param {Mixed} query
 *
 * @returns {String}
 */
const sortByASCII = function(query) {
    if(!query) {
        return '';
    }

    if(typeof query === 'string') {
        query = qs.parse(query);
    }

    return qs.stringify(query, {
        arrayFormat: 'repeat',
        encode: false,
        sort(a, b) {
            return String(a).localeCompare(b);
        }
    });
};

/**
 * signFn
 *
 * @param {Object} data
 */
const signFn = (data = {}) => {
    if(!data.appId || !data.appSecret) {
        throw new Error('appId and appSecret required');
    }

    // 按顺序将需要拼接的字符串安置在数组中
    const tmpArr = [
        // APP_ID
        data.appId,

        // HTTP Method（大写）
        String(data.method || '').toUpperCase() || 'GET',

        // Request URI（不包含 host 和 protocol）
        data.path || '/',

        // Query String，参数名按 ASCII 码从小到大排序（字典序，不需要 urlEncode）
        sortByASCII(data.query),

        // 时间戳
        data.timestamp || ''
    ];

    // Request Body，如果内容为空忽略此步骤
    if(data.body && Object.keys(data.body).length) {
        tmpArr.push(
            // 对 bodyArr 做 JSON 序列化
            JSON.stringify(data.body)
        );
    }

    // 对数组中的内容进行拼接
    const tmpStr = tmpArr.join('@');

    // 对 AppSecret 做 Hmac sha1 计算
    const signatureCrypto = crypto.createHmac('sha1', data.appSecret || '');

    // 对 tmpStr 做 Hmac sha1 计算
    signatureCrypto.update(tmpStr, 'utf8');

    // hex 全小写格式导出计算值
    const sign = signatureCrypto.digest('hex')
    // 最终输出全大写形式的签名值
    .toUpperCase();

    return sign;
};

module.exports = signFn;
