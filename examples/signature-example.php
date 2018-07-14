<?php

function signFn() {
    // 1.设临时字符串为空
    $signRawStr = '';

    // 2.拼接 APPID
    $signRawStr .= $xAppId;

    // 3.拼接 HTTP Method（大写）
    $signRawStr .= '@' . $requestMethod;

    // 4.拼接 Request URI（不包含 host 和 protocol）
    $signRawStr .= '@' . $requestUri;

    // 5.拼接 Query String，参数名按 ASCII 码从小到大排序（字典序，不需要 urlEncode）
    $queryArr = $requestInstance->getQuery();
    ksort($queryArr);
    $signRawStr .= '@' . urldecode(http_build_query($queryArr));

    // 6.拼接时间戳
    $signRawStr .= '@' . $xTimestamp;

    // 7.拼接 Request Body，如果内容为空忽略此步骤，对 bodyArr 做 JSON 序列化
    $bodyArr = $this->_getRequestBodyForVerifyRequest();
    if ($bodyArr) {
        $signRawStr .= '@' . json_encode($bodyArr, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    // 8.用 tmpStr 和 AppSecret 做 Hmac sha1 计算得到签名值（hex 全小写格式导出）
    $signatureServer = strtoupper(hash_hmac('sha1', $signRawStr, $signAppSecret));
}
