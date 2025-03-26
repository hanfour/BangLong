  # sendEmail API Integration Specification

  ## Overview
  The sendEmail API provides email sending functionality for the website's contact form. It includes captcha verification to prevent
  spam.

  ## API Endpoint
  - **URL**: `/api/sendEmail`
  - **Method**: POST
  - **Content-Type**: application/json

  ## Request Parameters

  | Parameter | Type   | Required | Description                              |
  |-----------|--------|----------|------------------------------------------|
  | to        | string | Yes      | Email recipient address                  |
  | subject   | string | Yes      | Email subject                            |
  | body      | string | Yes      | Email content/message                    |
  | captcha   | string | Yes      | User-entered captcha text                |
  | captchaId | string | Yes      | Unique ID for captcha verification       |

  ## Integration Flow

  1. **Generate Captcha**
     - Client calls `/api/captcha` endpoint (GET)
     - Server returns a captchaId and captchaImage
     - Client displays the captcha image to the user

  2. **Submit Form**
     - User fills out the contact form and enters the captcha
     - Client sends POST request to `/api/sendEmail` with form data
     - Required fields: to, subject, body, captcha, captchaId

  3. **Server Processing**
     - Validates all required fields
     - Verifies captcha against stored value
     - Sends email via external API gateway
     - Returns success/error response

  ## Implementation Details

  ### Environment Variables
  - **API_GATEWAY_URL**: URL for the AWS API Gateway endpoint
  - **API_GATEWAY_API_KEY**: API key for AWS API Gateway authentication

  ### Error Handling

  | Status Code | Description                                  | Reason                                     |
  |-------------|----------------------------------------------|------------------------------------------- |
  | 200         | Success                                     | Email sent successfully                     |
  | 400         | Bad Request                                 | Missing required fields or invalid captcha  |
  | 405         | Method Not Allowed                          | Request method is not POST                  |
  | 500         | Server Error                                | API Gateway configuration error or email sending failure |

  ## Client Usage Example

  ```javascript
  // Import axios
  import axios from 'axios';

  // Function to send email
  const sendEmail = async (formData) => {
    try {
      const response = await axios.post("/api/sendEmail", {
        to: "recipient@example.com",
        subject: "Contact Form Submission",
        body: `Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`,
        captcha: formData.captcha,
        captchaId: formData.captchaId
      });
      return response.data;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  };

  Security Considerations

  1. Captcha validation prevents automated spam submissions
  2. API keys are stored as environment variables, not hardcoded
  3. Input validation on all required fields
  4. Rate limiting should be implemented to prevent abuse

  Dependencies

  - axios: For making HTTP requests to the external API gateway
  - canvas: For captcha image generation
  - uuid: For generating unique captcha IDs