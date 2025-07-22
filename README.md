# Chat-with-AI-Girls

## Tổng quan dự án
Dự án phát triển một API sử dụng Node.js với framework Express để quản lý và tạo nội dung cho các nhân vật AI Girl. API hỗ trợ hai luồng chính:
- **Luồng Management data**: Cung cấp API cho CMS Dashboard, phục vụ đội ngũ nội dung (Content team) để quản lý thông tin nhân vật, tạo hoặc tải lên video hành động và hội thoại.
- **Luồng App data**: Cung cấp API cho ứng dụng khách (Web/Mobile app), phục vụ người dùng cuối (end-users) để truy xuất video hành động và hội thoại đã tạo.
API được thiết kế với kiến trúc mô-đun, sử dụng hàng đợi Bull (Redis-based) để xử lý tác vụ nặng, tích hợp với Kling API (tạo video), ChatGPT API (tạo hội thoại), và BunnyCDN (lưu trữ tệp).

## Mục tiêu
- Cung cấp API RESTful hiệu quả, phân tách rõ ràng giữa luồng quản lý (CMS) và luồng ứng dụng (App).
- Đảm bảo khả năng mở rộng, bảo trì dễ dàng, và xử lý tác vụ bất đồng bộ.
- Hỗ trợ cả tạo nội dung tự động (qua API bên thứ ba) và tải lên thủ công (cho Content team).

## Phân loại người dùng
- **Content team**: Sử dụng CMS Dashboard để quản lý danh sách nhân vật, tạo/tải lên video hành động và hội thoại (tính năng 1, 2, 3, 6, 7).
- **End-users**: Sử dụng Web/Mobile app để xem video hành động và hội thoại đã tạo (tính năng 4, 5).

## Các tính năng chính

### Luồng Management data (CMS Dashboard, Content team)

#### 1. Liệt kê tất cả các nhân vật (AI Girl)
- **Mô tả**: Truy xuất danh sách tất cả các nhân vật AI Girl từ tệp JSON để hiển thị trên CMS Dashboard.
- **Đầu vào**: Không yêu cầu tham số đầu vào.
- **Đầu ra**: Danh sách các nhân vật với thông tin chi tiết (`profileId`, `name`, `age`, `job`, `introduction`, `keywords`, `style`, `avatar`, `background`, `photos_url`).
- **Nguồn dữ liệu**: Tệp JSON tại `data/metadata/profiles.json`:
  ```json
  {
    "profiles": [
      {
        "profileId": 1748019597438,
        "name": "Olivia Park",
        "age": 20,
        "job": "Secretary",
        "introduction": "Honestly, life in the fast lane suits me...",
        "keywords": ["👗 fashion", "🌅 sunsets", "🎶 music", "🚘 road trips"],
        "style": "Confident and Flirty",
        "avatar": "",
        "background": "",
        "photos_url": []
      }
    ]
  }
  ```
- **API Endpoint**: `GET /api/profiles`
- **Yêu cầu kỹ thuật**: Đọc tệp JSON và trả về dữ liệu dưới dạng JSON. Đảm bảo dữ liệu được cache nếu cần để tối ưu hiệu suất.

#### 2. Tạo video hành động cho nhân vật
- **Mô tả**: Tạo video dựa trên hành động cụ thể của một nhân vật, sử dụng Kling API, lưu video vào BunnyCDN và lưu metadata vào tệp JSON.
- **Đầu vào**:
  - `profileId`: ID của nhân vật.
  - `imageUrl`: URL hoặc đường dẫn đến tệp WEBP của nhân vật.
  - `actionId`: ID của hành động (tối đa 5 hành động được định nghĩa sẵn).
- **Nguồn dữ liệu**:
  - Tệp JSON chứa danh sách hành động tại `data/metadata/actions.json`:
    ```json
    {
      "actions": [
        {
          "id": 1,
          "name": "Talking",
          "desc": "",
          "keywords": ["talk", "smile"],
          "prompt_path": "data/prompts/video/1.txt",
          "prompt_tmp": ""
        }
      ]
    }
    ```
  - Tệp prompt (ví dụ: `data/prompts/video/1.txt`) chứa mô tả hành động để gửi tới Kling API.
- **Quy trình**:
  1. Nhận yêu cầu với `profileId`, `imageUrl`, và `actionId`.
  2. Thêm yêu cầu vào hàng đợi để xử lý bất đồng bộ.
  3. Đọc tệp prompt tương ứng với `actionId`.
  4. Gửi yêu cầu tới Kling API để tạo video.
  5. Lưu video vào đường dẫn cục bộ: `data/media/videos/${job_id}/file-1.mp4`.
  6. Tải video lên BunnyCDN.
  7. Lưu metadata (`jobId`, `profileId`, `actionId`, `status`) vào `data/videos.json`.
- **Đầu ra**: JSON chứa `jobId` và thông báo trạng thái (ví dụ: "Video generation queued").
- **API Endpoint**: `POST /api/videos/generate`
- **Yêu cầu kỹ thuật**:
  - Sử dụng Bull (Redis) để quản lý hàng đợi.
  - Tích hợp Kling API và BunnyCDN.
  - Xử lý lỗi khi đọc tệp hoặc gọi API.

#### 3. Tạo cuộc hội thoại theo kịch bản
- **Mô tả**: Tạo hội thoại theo sắc thái cụ thể cho một nhân vật, sử dụng ChatGPT API, lưu kết quả vào BunnyCDN và lưu metadata vào tệp JSON.
- **Đầu vào**:
  - `profileData`: Profile data của nhân vật.
  - `toneId`: ID của sắc thái hội thoại.
- **Nguồn dữ liệu**:
  - Tệp JSON chứa danh sách sắc thái tại `data/metadata/tones.json`:
    ```json
    {
      "tones": [
        {
          "id": 1,
          "name": "New Acquaintance",
          "desc": "",
          "keywords": ["friendly", "casual"],
          "prompt_path": "data/prompts/chat/1.txt",
          "prompt_tmp": ""
        }
      ]
    }
    ```
  - Tệp prompt (ví dụ: `data/prompts/chat/1.txt`) chứa mô tả sắc thái để gửi tới ChatGPT API.
- **Quy trình**:
  1. Nhận yêu cầu với `profileData`, và `toneId`.
  2. Thêm yêu cầu vào hàng đợi để xử lý bất đồng bộ.
  3. Đọc tệp prompt tương ứng với `toneId`.
  4. Gửi yêu cầu tới ChatGPT API để tạo nội dung hội thoại.
  5. Lưu nội dung hội thoại vào tệp JSON tại: `data/media/chats/${job_id}/chat.json`.
  6. Tải tệp JSON lên BunnyCDN.
  7. Lưu metadata (`jobId`, `profileId`, `toneId`, `status`) vào `data/chats.json`.
- **Đầu ra**: JSON chứa `jobId` và thông báo trạng thái (ví dụ: "Chat generation queued").
- **API Endpoint**: `POST /api/chats/generate`
- **Yêu cầu kỹ thuật**:
  - Sử dụng Bull (Redis) để quản lý hàng đợi.
  - Tích hợp ChatGPT API và BunnyCDN.
  - Xử lý lỗi khi đọc tệp hoặc gọi API.

#### 6. Tải lên video hành động cho nhân vật
- **Mô tả**: Cho phép Content team tải lên tệp video hành động có sẵn cho một nhân vật thay vì tạo tự động qua Kling API. Video được lưu vào BunnyCDN và metadata được cập nhật.
- **Đầu vào**:
  - `profileId`: ID của nhân vật.
  - `actionId`: ID của hành động (tương ứng với danh sách hành động trong `data/actions.json`).
  - `videoFile`: Tệp video (định dạng MP4).
- **Nguồn dữ liệu**: Tệp `data/actions.json` để xác thực `actionId`.
- **Quy trình**:
  1. Nhận yêu cầu với `profileId`, `actionId`, và `videoFile`.
  2. Thêm yêu cầu vào hàng đợi để xử lý bất đồng bộ.
  3. Lưu tệp video vào đường dẫn cục bộ: `data/media/videos/${job_id}/file-1.mp4`.
  4. Tải video lên BunnyCDN.
  5. Lưu metadata (`jobId`, `profileId`, `actionId`, `url`) vào `data/metadata/videos.json`.
- **Đầu ra**: JSON chứa `jobId` và thông báo trạng thái (ví dụ: "Video upload queued").
- **API Endpoint**: `POST /api/videos/upload`
- **Yêu cầu kỹ thuật**:
  - Sử dụng middleware (như `multer`) để xử lý tải lên tệp.
  - Sử dụng Bull (Redis) để quản lý hàng đợi.
  - Tích hợp BunnyCDN.
  - Xác thực định dạng tệp MP4 và kiểm tra `actionId`.

#### 7. Tải lên hội thoại cho nhân vật
- **Mô tả**: Cho phép Content team tải lên tệp JSON chứa nội dung hội thoại có sẵn cho một nhân vật thay vì tạo tự động qua ChatGPT API. Tệp được lưu vào BunnyCDN và metadata được cập nhật.
- **Đầu vào**:
  - `profileId`: ID của nhân vật.
  - `toneId`: ID của sắc thái hội thoại (tương ứng với danh sách sắc thái trong `data/tones.json`).
  - `chatFile`: Tệp JSON chứa nội dung hội thoại.
- **Nguồn dữ liệu**: Tệp `data/tones.json` để xác thực `toneId`.
- **Quy trình**:
  1. Nhận yêu cầu với `profileId`, `toneId`, và `chatFile`.
  2. Thêm yêu cầu vào hàng đợi để xử lý bất đồng bộ.
  3. Lưu tệp JSON vào đường dẫn cục bộ: `data/media/chats/${job_id}/chat.json`.
  4. Tải tệp JSON lên BunnyCDN.
  5. Lưu metadata (`jobId`, `profileId`, `toneId`, `url`) vào `data/metadata/chats.json`.
- **Đầu ra**: JSON chứa `jobId` và thông báo trạng thái (ví dụ: "Chat upload queued").
- **API Endpoint**: `POST /api/chats/upload`
- **Yêu cầu kỹ thuật**:
  - Sử dụng middleware (như `multer`) để xử lý tải lên tệp.
  - Sử dụng Bull (Redis) để quản lý hàng đợi.
  - Tích hợp BunnyCDN.
  - Xác thực định dạng tệp JSON và kiểm tra `toneId`.

### Luồng App data (Web/Mobile app, End-users)

#### 4. Truy xuất video hành động của tất cả nhân vật
- **Mô tả**: Lấy danh sách metadata của các video hành động đã tạo để hiển thị trên ứng dụng khách.
- **Đầu vào**: Không yêu cầu tham số đầu vào.
- **Đầu ra**: Danh sách metadata từ `data/metadata/videos.json`, bao gồm `jobId`, `profileId`, `actionId`, và `url`.
- **API Endpoint**: `GET /api/videos`
- **Yêu cầu kỹ thuật**: Đọc tệp JSON và trả về dữ liệu dưới dạng JSON. Có thể thêm phân trang (pagination) nếu danh sách lớn.

#### 5. Truy xuất hội thoại của tất cả nhân vật
- **Mô tả**: Lấy danh sách metadata của các hội thoại đã tạo để hiển thị trên ứng dụng khách.
- **Đầu vào**: Không yêu cầu tham số đầu vào.
- **Đầu ra**: Danh sách metadata từ `data/metadata/chats.json`, bao gồm `jobId`, `profileId`, `toneId`, và `url`.
- **API Endpoint**: `GET /api/chats`
- **Yêu cầu kỹ thuật**: Đọc tệp JSON và trả về dữ liệu dưới dạng JSON. Có thể thêm phân trang (pagination) nếu danh sách lớn.

## Cấu trúc dự án
- **src/config/**: Chứa tệp cấu hình (API key, đường dẫn dữ liệu).
- **src/controllers/**: Xử lý yêu cầu HTTP và trả về phản hồi.
- **src/services/**: Chứa logic nghiệp vụ cho từng tính năng.
- **src/queues/**: Quản lý hàng đợi cho các tác vụ tạo/tải lên video và hội thoại.
- **src/utils/**: Hàm tiện ích (tải lên BunnyCDN, xử lý tệp).
- **src/routes/**: Định nghĩa các tuyến API.
- **src/data/**: Lưu trữ tệp JSON (`profiles.json`, `actions.json`, `tones.json`) và thư mục `metadata/`, `prompts/`, `media/`.
- **src/app.js**: Tệp chính khởi chạy ứng dụng.

## Yêu cầu kỹ thuật
- **Ngôn ngữ và Framework**: Node.js với Express.
- **Hàng đợi**: Bull với Redis để xử lý bất đồng bộ.
- **Lưu trữ**: BunnyCDN để lưu trữ video (MP4) và hội thoại (JSON).
- **API bên ngoài**:
  - Kling API: Tạo video hành động.
  - ChatGPT API: Tạo hội thoại.
- **Xử lý tệp**:
  - Đọc/ghi tệp JSON.
  - Xử lý tải lên tệp MP4 và JSON (sử dụng `multer`).
- **Môi trường**: Tệp `.env` chứa:
  ```
  PORT=3000
  REDIS_URL=redis://localhost:6379
  KLING_API_KEY=your_kling_api_key
  CHATGPT_API_KEY=your_chatgpt_api_key
  BUNNYCDN_API_KEY=your_bunnycdn_api_key
  BUNNYCDN_STORAGE_URL=your_bunnycdn_storage_url
  ```

## Hướng dẫn cài đặt
1. **Cài đặt môi trường**:
   - Cài Node.js và Redis.
   - Tạo tệp `.env` với các biến môi trường.
2. **Cài đặt phụ thuộc**:
   ```bash
   npm install express bull dotenv axios multer
   ```
3. **Khởi chạy ứng dụng**:
   ```bash
   npm start
   ```

## Các cân nhắc mở rộng
- **Kiến trúc mô-đun**: Tách biệt controllers, services, queues để dễ bảo trì.
- **Hàng đợi**: Hỗ trợ mở rộng bằng cách thêm worker.
- **Lưu trữ**: BunnyCDN đảm bảo khả năng mở rộng dung lượng.
- **Bảo mật**: Thêm xác thực (JWT) và giới hạn tốc độ cho API.
- **Cơ sở dữ liệu**: Có thể thay JSON bằng MongoDB/PostgreSQL.
- **Hiệu suất**: Thêm cache (Redis) cho API truy xuất danh sách.
- **Giám sát**: Thêm logging (Winston) và giám sát hiệu suất.

## Hướng dẫn cho đội ngũ phát triển
- Tuân thủ chuẩn REST API.
- Sử dụng Swagger để tài liệu hóa API.
- Viết unit test (Jest) cho services.
- Sử dụng ESLint để đảm bảo chất lượng mã.
- Quản lý API key an toàn (không commit `.env`).
- Cập nhật tài liệu này khi thêm tính năng mới.
- Đảm bảo phân tách rõ ràng giữa luồng Management data và App data.
