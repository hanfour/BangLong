以下是繁體中文版本的 API 串接文件：

# sendEmail API 整合規格

## 概述
sendEmail API 為網站的聯絡表單提供電子郵件發送功能。它包含驗證碼驗證以防止垃圾郵件。

## API 端點
- **URL**: `/api/sendEmail`
- **方法**: POST
- **內容類型**: application/json

## 請求參數

| 參數      | 類型   | 必填 | 說明                         |
|-----------|--------|------|------------------------------|
| to        | string | 是   | 電子郵件收件人地址           |
| subject   | string | 是   | 電子郵件主旨                 |
| body      | string | 是   | 電子郵件內容/訊息            |
| captcha   | string | 是   | 使用者輸入的驗證碼文字       |
| captchaId | string | 是   | 驗證碼驗證的唯一識別碼       |

## 整合流程

1. **產生驗證碼**
   - 客戶端呼叫 `/api/captcha` 端點 (GET)
   - 伺服器返回 captchaId 和 captchaImage
   - 客戶端向使用者顯示驗證碼圖片

2. **提交表單**
   - 使用者填寫聯絡表單並輸入驗證碼
   - 客戶端發送 POST 請求至 `/api/sendEmail` 並附上表單資料
   - 必填欄位：to, subject, body, captcha, captchaId

3. **伺服器處理**
   - 驗證所有必填欄位
   - 驗證驗證碼是否與儲存的值相符
   - 透過外部 API 閘道發送電子郵件
   - 返回成功/錯誤回應

## 實作細節

### 環境變數
- **API_GATEWAY_URL**: AWS API Gateway 端點 URL
- **API_GATEWAY_API_KEY**: AWS API Gateway 認證金鑰

### 錯誤處理

| 狀態碼 | 說明                | 原因                                 |
|--------|---------------------|--------------------------------------|
| 200    | 成功                | 電子郵件發送成功                     |
| 400    | 錯誤請求            | 缺少必填欄位或驗證碼無效             |
| 405    | 方法不允許          | 請求方法不是 POST                    |
| 500    | 伺服器錯誤          | API 閘道設定錯誤或電子郵件發送失敗   |

## 客戶端使用範例

```javascript
// 導入 axios
import axios from 'axios';

// 發送電子郵件的函數
const sendEmail = async (formData) => {
  try {
    const response = await axios.post("/api/sendEmail", {
      to: "recipient@example.com",
      subject: "聯絡表單提交",
      body: `姓名: ${formData.name}\n電子郵件: ${formData.email}\n訊息: ${formData.message}`,
      captcha: formData.captcha,
      captchaId: formData.captchaId
    });
    return response.data;
  } catch (error) {
    console.error("發送電子郵件時發生錯誤:", error);
    throw error;
  }
};
```

## 安全考量

1. 驗證碼驗證可防止自動化垃圾郵件提交
2. API 金鑰儲存為環境變數，而非硬編碼
3. 對所有必填欄位進行輸入驗證
4. 應實施速率限制以防止濫用

## 相依性

- axios: 用於向 AWS API Gateway 發送請求
- uuid: 用於生成唯一的驗證碼 ID