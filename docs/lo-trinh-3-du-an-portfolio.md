# Lộ trình 3 dự án portfolio cho Web Developer

> Mục tiêu: mỗi dự án giải quyết một nhóm bài toán kỹ thuật khác nhau, để khi phỏng vấn bạn có chuyện thật để kể chứ không phải liệt kê công nghệ.

**Nguyên tắc xuyên suốt:**
- Mỗi dự án phải **deploy thật** (domain riêng + HTTPS + CI/CD) ngay từ tuần đầu, không để cuối.
- Mỗi bài toán khó phải kèm **số đo** trong README: trước/sau bao nhiêu ms, bao nhiêu req/s, tại sao.
- Scope hẹp mà sâu > scope rộng mà nông. Thà 8 màn hình hoàn chỉnh còn hơn 30 màn hình dở dang.

---

# DỰ ÁN 1 — E-commerce thời trang (Yody-like)

**Thời lượng:** 5–6 tuần · **Chủ đề kỹ thuật:** dữ liệu quan hệ, giao dịch, tính đúng đắn, SSR/SEO

## 1.1. Bài toán nghiệp vụ

Một shop thời trang bán sản phẩm có **biến thể** (size × màu), mỗi biến thể có tồn kho và giá riêng. Khách duyệt → lọc → thêm giỏ → đặt hàng → thanh toán online → theo dõi đơn. Admin quản lý sản phẩm, tồn kho, đơn hàng.

Đây là bài toán "cũ" nhưng chứa gần như toàn bộ nền tảng backend nghiêm túc: transaction, khóa, state machine, idempotency, index.

## 1.2. Yêu cầu chức năng

**Bắt buộc (làm cho xong hẳn):**

| Nhóm | Yêu cầu |
|---|---|
| Catalog | Danh sách sản phẩm có phân trang, sắp xếp (mới nhất / giá / bán chạy); trang chi tiết chọn size + màu, ảnh đổi theo màu; hiển thị "hết hàng" theo từng biến thể |
| Tìm kiếm & lọc | Tìm theo tên/mô tả (có dấu & không dấu tiếng Việt); lọc đa điều kiện: danh mục, khoảng giá, size, màu; hiển thị số lượng kết quả cho từng lựa chọn (faceted count) |
| Giỏ hàng | Giỏ cho khách vãng lai (chưa đăng nhập) lưu ở cookie/Redis; khi đăng nhập thì **merge** vào giỏ của tài khoản; cập nhật số lượng, kiểm tra tồn kho tại thời điểm thêm |
| Khuyến mãi | Mã giảm giá: theo % / số tiền cố định, giá trị đơn tối thiểu, giới hạn số lần dùng toàn hệ thống và mỗi user, hạn sử dụng |
| Đặt hàng | Chốt đơn phải **giữ chỗ tồn kho**; snapshot giá tại thời điểm đặt (giá đổi sau không ảnh hưởng đơn cũ); địa chỉ giao hàng theo tỉnh/huyện/xã |
| Thanh toán | Tích hợp **VNPay hoặc MoMo sandbox**: tạo URL thanh toán, xử lý return URL và IPN/webhook, đối soát; hỗ trợ COD |
| Đơn hàng | State machine: `pending → paid → confirmed → shipping → completed` + nhánh `cancelled / refunded`; chỉ cho phép chuyển trạng thái hợp lệ |
| Tài khoản | Đăng ký/đăng nhập, refresh token, quên mật khẩu qua email, lịch sử đơn |
| Admin | CRUD sản phẩm + biến thể, upload nhiều ảnh, điều chỉnh tồn kho có ghi log, xử lý đơn, dashboard doanh thu cơ bản |
| SEO | SSR/ISR cho trang sản phẩm, sitemap.xml động, meta + Open Graph, JSON-LD `Product` |

**Không làm (cắt để giữ scope):** đa ngôn ngữ, multi-vendor, đánh giá sản phẩm có ảnh, chat, loyalty point, tích hợp vận chuyển thật.

## 1.3. Mô hình dữ liệu cốt lõi

```
Product (id, slug, name, description, categoryId, basePrice, status)
ProductOption (id, productId, name)              -- "Size", "Màu"
ProductOptionValue (id, optionId, value)         -- "M", "L", "Đen"
Variant (id, productId, sku, price, stock, version)
VariantOptionValue (variantId, optionValueId)    -- bảng nối: variant = tổ hợp giá trị
InventoryLog (id, variantId, delta, reason, refId, createdAt)
Cart (id, userId?, sessionId?, expiresAt)
CartItem (id, cartId, variantId, quantity, addedPrice)
Order (id, code, userId, status, subtotal, discount, shippingFee, total, addressSnapshot, createdAt)
OrderItem (id, orderId, variantId, productNameSnapshot, priceSnapshot, quantity)
Payment (id, orderId, provider, providerTxnId, amount, status, rawPayload)
Coupon (id, code, type, value, minOrder, maxUses, usedCount, perUserLimit, startAt, endAt)
```

**Điểm đáng suy nghĩ:** vì sao `Variant` giữ `stock` chứ không phải `Product`? Vì sao `OrderItem` phải snapshot tên và giá? Vì sao cần `InventoryLog` thay vì chỉ cộng trừ `stock`? Trả lời được 3 câu này là bạn đã hơn phần lớn ứng viên junior.

## 1.4. Các bài toán khó — phần đáng đào sâu

### (A) Race condition khi trừ tồn kho — *bài toán quan trọng nhất của dự án này*

**Tình huống:** còn đúng 1 áo size M. Hai người bấm "Đặt hàng" cách nhau 5ms. Code ngây thơ đọc `stock = 1` ở cả hai request, cả hai thấy đủ, cả hai trừ → `stock = -1`, bán quá hàng.

**Cần thử ít nhất 3 cách và đo:**
1. **Pessimistic lock**: `SELECT ... FOR UPDATE` trong transaction. Đơn giản, đúng, nhưng giữ khóa dòng → nghẽn khi flash sale.
2. **Optimistic lock**: cột `version`, `UPDATE ... WHERE id = ? AND version = ?`, nếu `affectedRows = 0` thì retry. Không giữ khóa nhưng phải xử lý retry.
3. **Điều kiện nguyên tử ở DB**: `UPDATE variant SET stock = stock - :qty WHERE id = :id AND stock >= :qty` + `CHECK (stock >= 0)`. Gọn nhất, nên hiểu vì sao nó đủ.
4. **Reservation qua Redis** (nâng cao): giữ chỗ có TTL bằng Lua script atomic, chốt xuống DB khi thanh toán thành công, trả lại khi hết hạn. Đây là cách các sàn thật hay dùng — và mở ra bài toán "nếu Redis chết thì sao?".

**Cách chứng minh trong README:** viết script bắn 200 request đồng thời bằng `autocannon` hoặc `k6` vào 1 sản phẩm còn 1 cái, chụp kết quả trước/sau khi sửa. Đây là thứ khiến người phỏng vấn dừng lại đọc kỹ.

**Từ khóa tìm hiểu:** transaction isolation level, `READ COMMITTED` vs `REPEATABLE READ`, lost update, `SELECT FOR UPDATE`, optimistic concurrency control, deadlock, Redis Lua atomicity.

### (B) Webhook thanh toán và tính idempotent

Cổng thanh toán **có thể gửi IPN nhiều lần** cho cùng một giao dịch (retry khi timeout). Nếu bạn cộng tiền / trừ kho mỗi lần nhận → sai số liệu.

Cần xử lý:
- Xác thực chữ ký (VNPay dùng HMAC-SHA512 trên chuỗi tham số đã sắp xếp) — sai một dấu là fail, đây là chỗ tốn thời gian nhất.
- Lưu `providerTxnId` với **unique constraint** → lần thứ hai bị chặn ở tầng DB, không dựa vào `if` trong code.
- Phân biệt **return URL** (người dùng bị redirect về, KHÔNG được tin) và **IPN** (server-to-server, mới là nguồn sự thật).
- Xử lý đơn "treo": user tạo URL thanh toán rồi đóng tab. Cần cron/job quét đơn `pending` quá 15 phút → hủy và trả tồn kho.
- Đối soát: job chạy cuối ngày gọi API truy vấn giao dịch của cổng, so với DB của mình.

**Từ khóa:** idempotency key, at-least-once delivery, webhook signature verification, reconciliation, saga/compensating transaction.

### (C) Tìm kiếm tiếng Việt và faceted filter

- Tìm "ao thun" phải ra "áo thun". Postgres: `unaccent` extension + `tsvector` + GIN index. So sánh với `LIKE '%...%'` (không dùng được index) để thấy khác biệt.
- Faceted count: khi user đã lọc "màu đen", số lượng hiển thị bên cạnh "size M" phải là số sản phẩm đen size M. Viết được query này bằng một lần truy vấn (dùng `GROUP BY` + `FILTER` hoặc CTE) thay vì N truy vấn là một bài tập SQL rất tốt.
- Phân trang: hiểu vì sao `OFFSET 100000` chậm và khi nào nên dùng **keyset pagination** (`WHERE (created_at, id) < (?, ?)`).

### (D) Hiệu năng: N+1 và index

Cố tình để dự án chậm trước, rồi tối ưu và ghi lại:
- Bật log query của Prisma, tìm N+1 ở trang danh sách (mỗi sản phẩm lại query variant riêng).
- Dùng `EXPLAIN ANALYZE` đọc query plan, thêm index đúng chỗ (chú ý thứ tự cột trong composite index).
- Cache Redis cho trang chủ / danh mục, và **chiến lược invalidate** khi admin sửa sản phẩm — phần invalidate mới là phần khó.

### (E) Auth an toàn
Access token ngắn hạn + refresh token trong **httpOnly + SameSite cookie**, refresh token rotation và phát hiện tái sử dụng (dấu hiệu bị đánh cắp), RBAC cho admin, rate limit endpoint đăng nhập.

## 1.5. Công nghệ cho dự án 1

| Lớp | Chọn | Lý do |
|---|---|---|
| Frontend | **Next.js (App Router) + TypeScript** | SSR/ISR cần cho SEO thương mại điện tử; đây cũng là thứ được hỏi nhiều nhất |
| UI | **Tailwind CSS + shadcn/ui** | Kiểm soát hoàn toàn giao diện, không bị "mùi template"; shadcn là copy code chứ không phải dependency → học được cách component hoạt động |
| Admin panel | **Ant Design** | Cho riêng khu admin — có sẵn Table/Form phức tạp, và AntD vẫn phổ biến ở công ty VN |
| State server | **TanStack Query** | (chính là React Query — cùng một thư viện) cache, invalidate, optimistic update |
| Form | **React Hook Form + Zod** | Zod dùng chung schema validate cả FE lẫn BE |
| Backend | **NestJS** | Cùng TypeScript, module/DI rõ ràng, dễ nói về kiến trúc khi phỏng vấn |
| DB | **PostgreSQL + Prisma** | Transaction, constraint, full-text search — thứ Mongo không hợp |
| Cache/Queue | **Redis** | Session giỏ hàng, cache, rate limit, giữ chỗ tồn kho |
| Ảnh | **Cloudflare R2 / S3** + `next/image` | R2 miễn phí egress, hợp túi tiền |
| Hạ tầng | **Docker Compose + VPS + Nginx + Caddy/Let's Encrypt + GitHub Actions** | |
| Test | **Vitest** (unit logic giá/coupon) + **Playwright** (luồng mua hàng) | |

## 1.6. Lộ trình gợi ý

| Tuần | Việc |
|---|---|
| 1 | Dựng repo, Docker Compose (app + postgres + redis), schema Prisma, seed dữ liệu, **deploy lên VPS ngay** với 1 trang "hello" |
| 2 | Catalog + trang chi tiết + biến thể, upload ảnh, admin CRUD |
| 3 | Tìm kiếm + lọc + phân trang, auth |
| 4 | Giỏ hàng + coupon + đặt hàng + xử lý race condition |
| 5 | Thanh toán VNPay sandbox + webhook + state machine đơn |
| 6 | Tối ưu hiệu năng (đo & ghi số), test, SEO, viết README |

---

# DỰ ÁN 2 — Nền tảng nghe nhạc (SoundCloud-like)

**Thời lượng:** 7–8 tuần · **Chủ đề kỹ thuật:** xử lý bất đồng bộ, media, hàng đợi, chịu lỗi

> Đây là dự án tôi khuyên đầu tư nhiều nhất. Rất ít ứng viên có kinh nghiệm pipeline media, nên nó tạo khác biệt lớn hơn hẳn một clone e-commerce thứ hai.

## 2.1. Bài toán nghiệp vụ

Người dùng tải lên file audio → hệ thống xử lý nền (chuẩn hóa, chuyển sang định dạng streaming, sinh waveform) → phát trực tuyến cho người nghe với chất lượng thích ứng → có follow, like, playlist, bình luận gắn với mốc thời gian trong bài.

## 2.2. Yêu cầu chức năng

**Bắt buộc:**

| Nhóm | Yêu cầu |
|---|---|
| Upload | Kéo thả file lớn (50–200MB), hiển thị % tiến trình, **tiếp tục được khi mất mạng giữa chừng**, validate định dạng thật (đọc magic bytes chứ không tin đuôi file) |
| Xử lý | Sau upload, track ở trạng thái `processing`; job nền transcode sang **HLS nhiều mức bitrate** (64/128/256 kbps), trích metadata (thời lượng, bitrate, ID3), sinh **waveform peaks** dạng JSON, sinh ảnh bìa mặc định nếu thiếu |
| Theo dõi tiến trình | Người upload thấy trạng thái realtime: `queued → transcoding 40% → ready` / `failed (lý do)` — qua SSE hoặc WebSocket |
| Phát nhạc | Player toàn cục (không dừng khi chuyển trang), seek, hàng đợi phát, phát tiếp, tua bằng cách bấm lên waveform |
| Quyền riêng tư | Track public / unlisted (link bí mật) / private; track private phải **không tải được kể cả khi biết URL** |
| Tương tác | Follow, like, playlist, **bình luận gắn mốc giây** hiển thị dọc waveform |
| Thống kê | Lượt nghe chống spam, biểu đồ lượt nghe 30 ngày, top track |
| Feed | Trang chủ hiển thị hoạt động của những người mình follow |
| Tìm kiếm | Theo tên track, nghệ sĩ, tag |

**Không làm:** thanh toán, bản quyền/DMCA, ứng dụng mobile, chat.

## 2.3. Kiến trúc

```
[Next.js]  --presigned URL-->  [S3 / R2]
    |                              ^
    | POST /tracks (metadata)      | worker đọc file gốc
    v                              |
[NestJS API] --enqueue--> [Redis + BullMQ] --> [Worker (ffmpeg)]
    |                                              |
    |                                              v
    |                                    ghi HLS + waveform lên S3
    v                                              |
[PostgreSQL] <--------- cập nhật trạng thái -------+
    |
    +--> SSE báo tiến trình về client
```

Worker chạy **container riêng**, scale độc lập với API. Đây là điểm kiến trúc đáng nói khi phỏng vấn: vì sao không transcode ngay trong request HTTP?

## 2.4. Các bài toán khó — phần đáng đào sâu

### (A) Upload file lớn đáng tin cậy

**Vấn đề:** upload 150MB qua một request `multipart/form-data` đi qua API server là sai ở nhiều mặt: chiếm RAM/băng thông server, timeout của Nginx, mất mạng là mất sạch, không hiện được tiến trình chính xác.

**Hướng làm:**
- Client xin **presigned URL** từ API, rồi upload **thẳng lên S3/R2**, không qua server của mình.
- File lớn → **multipart upload**: chia thành các part 5–10MB, upload song song 3–4 part, cho phép retry từng part, `CompleteMultipartUpload` khi xong. Mất mạng thì chỉ upload lại part lỗi.
- Chống upload trùng: hash file phía client (SHA-256 streaming qua Web Worker để không đơ UI), nếu hash đã tồn tại thì bỏ qua upload.
- Chống lạm dụng: presigned URL có TTL ngắn, giới hạn dung lượng, kiểm tra lại content-type sau khi file lên tới nơi.

**Từ khóa:** S3 multipart upload, presigned URL, resumable upload, tus protocol, `Blob.slice()`, content sniffing.

### (B) Pipeline transcode — trái tim của dự án

**Việc cần làm:** worker nhận job → tải file gốc → `ffmpeg` chuyển sang HLS nhiều bitrate → upload segment + playlist lên storage → cập nhật DB.

**Những chỗ khó thật sự (đây mới là phần đáng học):**

1. **Idempotency**: job có thể chạy lại (worker chết giữa chừng, retry). Chạy lần hai không được tạo bản ghi trùng hay để lại file rác. Giải: khóa theo `trackId`, ghi vào thư mục tạm rồi mới commit, kiểm tra trạng thái trước khi xử lý.
2. **Retry và backoff**: lỗi mạng thì nên thử lại, file hỏng thì đừng thử lại vô ích. Phân biệt **lỗi tạm thời** và **lỗi vĩnh viễn**, cấu hình `attempts` + exponential backoff, đẩy job chết vào **dead letter queue** để xem lại.
3. **Job zombie**: worker bị OOM kill giữa chừng, job kẹt ở `active` mãi mãi. Cần `stalled` detection + `lockDuration` phù hợp với thời gian transcode (mặc định 30s là quá ngắn).
4. **Báo tiến trình**: đọc stdout của ffmpeg, parse dòng `time=`, chia cho tổng thời lượng → % → `job.updateProgress()` → publish qua Redis pub/sub → SSE tới client. Đây là chuỗi liên kết nhiều thành phần, làm xong sẽ hiểu rất sâu.
5. **Giới hạn tài nguyên**: ffmpeg ăn CPU rất mạnh. VPS 2 core mà chạy 5 job song song là chết máy. Đặt `concurrency` hợp lý, `-threads`, cân nhắc `nice`.
6. **Dọn rác**: job thất bại để lại file tạm; track bị xóa phải xóa cả segment trên S3. Cần job dọn dẹp định kỳ.

**Lệnh ffmpeg cần hiểu (đừng copy mù):** chuyển sang AAC, `-hls_time`, `-hls_playlist_type vod`, master playlist nhiều variant, `loudnorm` để chuẩn hóa âm lượng giữa các bài.

**Từ khóa:** BullMQ, job lifecycle, stalled jobs, dead letter queue, exponential backoff, HLS, adaptive bitrate streaming, EBU R128 loudness.

### (C) Waveform

- Trích peaks: `ffmpeg` xuất PCM thô → giảm mẫu xuống ~1000 điểm → lưu JSON (vài KB). **Không** gửi cả file audio về client để vẽ.
- Vẽ bằng `<canvas>`, không dùng 1000 `<div>`.
- Bình luận theo mốc giây: lưu `positionMs`, hiển thị avatar dọc waveform, bấm vào thì tua tới đó. Xử lý bình luận chồng nhau khi zoom nhỏ.

### (D) Bảo vệ nội dung và phát riêng tư

- Track private: segment trên S3 **không public**. Dùng **signed URL có TTL ngắn** cho từng segment, hoặc một endpoint proxy kiểm tra quyền rồi redirect.
- Vấn đề khó: HLS gồm hàng trăm segment, ký từng cái thì tốn kém — tìm hiểu cách ký theo prefix hoặc dùng signed cookie của CDN.
- Hiểu `Range` request và HTTP 206 — vì sao tua giữa bài lại hoạt động được.

### (E) Đếm lượt nghe chống gian lận

Đây là bài toán mở, rất hay để nói trong phỏng vấn:
- Chỉ tính khi đã nghe ≥ 30 giây thật (client báo heartbeat, server xác thực nhịp báo hợp lý).
- Chống trùng: một user/IP nghe một track chỉ tính 1 lần trong cửa sổ 24h → Redis set với TTL, hoặc HyperLogLog nếu chấp nhận sai số nhỏ để tiết kiệm bộ nhớ.
- Không ghi DB mỗi lượt nghe: gom vào Redis counter, job định kỳ flush xuống bảng thống kê theo ngày.
- Đối chiếu chi phí: 1 triệu lượt nghe = 1 triệu row hay 1 row mỗi ngày mỗi track? Trả lời được là bạn hiểu về aggregation.

### (F) Feed của người mình follow

- **Fanout on read** (query join bảng follow) — đơn giản, chậm khi follow nhiều.
- **Fanout on write** (đẩy sẵn vào feed từng follower) — nhanh khi đọc, nhưng nghệ sĩ có 100k follower thì một lần đăng bài tạo 100k lượt ghi ("celebrity problem").
- Cách lai: fanout cho user thường, query trực tiếp cho tài khoản lớn. Bạn không cần triển khai cả ba, nhưng **phải giải thích được vì sao chọn cách của mình**.

## 2.5. Công nghệ cho dự án 2

| Lớp | Chọn |
|---|---|
| Frontend | Next.js + TypeScript, **Tailwind + shadcn/ui** |
| Player | `hls.js` + Web Audio API; state player dùng **Zustand** (player toàn cục, không hợp với server state) |
| Data fetching | TanStack Query |
| Backend | NestJS (API) + **worker NestJS riêng** |
| Queue | **BullMQ + Redis** (chưa cần Kafka) |
| Media | **ffmpeg**, `audiowaveform` hoặc tự parse PCM |
| Storage | Cloudflare R2 (miễn phí egress — quan trọng với media) |
| DB | PostgreSQL + Prisma |
| Realtime | **SSE** cho tiến trình upload (đơn giản hơn WebSocket và đủ dùng) |
| Tìm kiếm | Postgres FTS, nâng cấp lên **Meilisearch** nếu muốn |
| Hạ tầng | Docker Compose (api + worker + postgres + redis + minio để dev local), GitHub Actions |
| Quan sát | Bull Board (xem queue), **Sentry**, log có `traceId` |

## 2.6. Lộ trình gợi ý

| Tuần | Việc |
|---|---|
| 1 | Schema, auth, upload đơn giản lên MinIO local, deploy khung |
| 2 | Presigned + multipart upload + tiến trình + resume |
| 3 | Worker + BullMQ + ffmpeg → HLS, trạng thái track |
| 4 | SSE báo tiến trình, xử lý retry/lỗi/dọn rác |
| 5 | Player + hls.js + waveform + seek |
| 6 | Playlist, follow, like, bình luận theo mốc giây |
| 7 | Đếm lượt nghe, feed, thống kê |
| 8 | Quyền riêng tư + signed URL, tối ưu, README + video demo |

---

# DỰ ÁN 3 — Chọn một trong hai hướng

Đến đây bạn nên chọn theo **loại công ty muốn nhắm**.

## 3A. Realtime & sự kiện — nhắm công ty product quy mô lớn

**Ý tưởng:** hệ thống thông báo + hoạt động realtime dùng chung cho nhiều "ứng dụng con" (ví dụ: một công cụ quản lý task có nhiều người cùng chỉnh sửa).

**Yêu cầu:**
- Chỉnh sửa đồng thời: nhiều người kéo thả task trên cùng một bảng, thấy nhau realtime, hiển thị con trỏ/avatar (presence).
- Thông báo: mention, gán việc, bình luận → gửi in-app + email, gộp thông báo trùng ("3 người đã bình luận"), đánh dấu đã đọc, hỗ trợ nhiều thiết bị.
- Chịu lỗi: client mất mạng 30 giây rồi kết nối lại phải **không mất và không trùng** sự kiện.

**Bài toán khó:**
1. **WebSocket nhiều instance**: 2 pod API, user A ở pod 1, user B ở pod 2 → cần Redis adapter/pub-sub để broadcast xuyên instance. Hiểu vì sao sticky session lại cần thiết với polling fallback.
2. **Đảm bảo thứ tự và không mất sự kiện**: mỗi sự kiện có sequence number; client reconnect gửi `lastSeq` để server phát lại phần thiếu. Xử lý khi khoảng cách quá lớn → yêu cầu tải lại toàn bộ state.
3. **Outbox pattern**: ghi DB và bắn sự kiện phải cùng một giao dịch, nếu không sẽ có trường hợp "đã lưu nhưng không thông báo" hoặc ngược lại. Đây là lúc **Kafka thực sự có lý do tồn tại** trong dự án của bạn — và bạn trả lời được câu "tại sao dùng Kafka".
4. **Xung đột khi sửa đồng thời**: hai người cùng kéo một task. Tìm hiểu last-write-wins vs **CRDT** (thư viện Yjs) — chỉ cần triển khai ở mức đơn giản nhưng hiểu được đánh đổi.
5. **Backpressure**: client chậm, server đẩy tin nhanh hơn client xử lý → buffer phình. Cần drop/gộp tin.
6. **Gộp thông báo**: cửa sổ thời gian, debounce ở tầng server.

**Công nghệ:** NestJS Gateway (Socket.IO) + Redis adapter, **Kafka** (hoặc Redis Streams nếu muốn nhẹ), Yjs, PostgreSQL, Docker.

**Từ khóa:** transactional outbox, at-least-once vs exactly-once, consumer group, partition key và thứ tự, idempotent consumer, presence, CRDT/OT.

## 3B. Ứng dụng có AI — nhắm mảng đang trả lương cao nhất

**Ý tưởng:** trợ lý hỏi đáp trên tài liệu nội bộ (RAG) — ví dụ trợ lý tra cứu quy trình/nhân sự cho doanh nghiệp. Hợp với bạn vì bạn đã quen môi trường doanh nghiệp.

**Yêu cầu:**
- Upload PDF/DOCX/Excel → parse → chia đoạn → sinh embedding → lưu vector.
- Hỏi bằng tiếng Việt, trả lời **kèm trích dẫn nguồn** (tên file + số trang), bấm vào xem đúng đoạn.
- Trả lời **streaming** từng token.
- Quản lý theo workspace, phân quyền tài liệu (user chỉ thấy nguồn mình được phép).
- Theo dõi chi phí token theo user, giới hạn quota.

**Bài toán khó:**
1. **Chiến lược chunking**: cắt cứng 500 token cắt đứt ý; cắt theo cấu trúc (heading, đoạn) tốt hơn; overlap bao nhiêu; bảng biểu trong PDF xử lý ra sao. Đây là thứ quyết định chất lượng nhiều hơn cả mô hình.
2. **Hybrid search**: chỉ dùng vector sẽ trượt khi hỏi mã số/tên riêng; kết hợp **BM25 (Postgres FTS) + vector (pgvector)** rồi **rerank**. Đo lại độ chính xác trước/sau.
3. **Chống bịa**: bắt buộc trả lời dựa trên đoạn được truy xuất, có cơ chế "không tìm thấy trong tài liệu", kiểm tra trích dẫn có thật.
4. **Đánh giá (evaluation)**: tự xây bộ 50 câu hỏi + đáp án đúng, đo recall@k và độ chính xác mỗi lần bạn đổi cách chunking. Rất ít ứng viên làm bước này — làm được là điểm cộng lớn.
5. **Streaming + hủy giữa chừng**: SSE, user bấm dừng thì phải hủy request tới LLM (AbortController) để không tốn tiền.
6. **Ingest bất đồng bộ**: file 300 trang không xử lý trong request được → lại quay về BullMQ (tái sử dụng kiến thức dự án 2).
7. **Cache và chi phí**: cache embedding, cache câu hỏi trùng, đếm token, đặt hạn mức.

**Công nghệ:** Next.js, NestJS, **PostgreSQL + pgvector**, BullMQ, Vercel AI SDK (streaming), Anthropic/OpenAI API, Docker.

---

# Phần chung — thứ quyết định CV có được gọi hay không

## README mẫu cho mỗi dự án

```markdown
# Tên dự án
Một câu: giải quyết bài toán gì, cho ai.
🔗 Demo: https://... (tài khoản dùng thử: demo@x.com / 123456)

## Ảnh chụp / GIF demo
(1 GIF luồng chính — người xem sẽ không tự đăng nhập đâu)

## Kiến trúc
(sơ đồ vẽ bằng Excalidraw hoặc Mermaid)

## Quyết định kỹ thuật
- Vì sao PostgreSQL thay vì MongoDB
- Vì sao BullMQ thay vì Kafka ở giai đoạn này
- Vì sao presigned upload thay vì upload qua API

## Bài toán khó đã giải
### Chống bán quá hàng khi đồng thời
Vấn đề → Cách tiếp cận đã thử → Cách đã chọn → Kết quả đo được
(200 request đồng thời: trước 7 đơn oversell, sau 0)

## Hiệu năng
| Chỉ số | Trước | Sau |
|---|---|---|
| Trang danh mục (p95) | 820ms | 90ms |

## Chạy local
docker compose up
```

## Danh sách kiểm tra trước khi đưa vào CV

- [ ] Link demo sống, không lỗi 500, có sẵn dữ liệu mẫu và tài khoản dùng thử
- [ ] Domain riêng + HTTPS
- [ ] CI chạy test + tự deploy khi push `main`
- [ ] Ít nhất một tập test có ý nghĩa (không phải test getter)
- [ ] Lịch sử commit sạch, có nghĩa (người ta có xem)
- [ ] README có sơ đồ + số đo hiệu năng
- [ ] Không commit `.env`, secret, key
- [ ] Xử lý lỗi tử tế: trang 404/500, loading skeleton, thông báo lỗi rõ ràng
- [ ] Responsive trên điện thoại
- [ ] Lighthouse > 90 cho dự án 1

## Thứ tự ưu tiên nếu thiếu thời gian

Nếu chỉ làm được **một** dự án: chọn **dự án 2 (SoundCloud-like)**. Nó chứa nhiều bài toán kỹ thuật khác biệt nhất và ít bị trùng với hàng nghìn CV khác.

Nếu làm được **hai**: dự án 1 + dự án 2 — bộ đôi này phủ gần hết câu hỏi phỏng vấn mid-level về backend và frontend.

## Cạm bẫy hay gặp khi tự học

- **Đổi công nghệ giữa chừng.** Thấy framework mới lại muốn viết lại từ đầu. Đã chọn thì đi hết dự án.
- **Làm đẹp trước, làm đúng sau.** Dành 2 tuần chỉnh CSS trong khi backend chưa có transaction.
- **Không bao giờ deploy.** Dự án 90% xong mãi mãi. Deploy từ tuần 1, dù chỉ là trang trắng.
- **Nhét công nghệ để cho oai.** Kafka trong một dự án 10 user sẽ bị hỏi ngược lại và mất điểm nặng hơn là không có.
- **Không đo gì cả.** "Tôi tối ưu hiệu năng" là câu vô nghĩa. "Từ 820ms xuống 90ms nhờ composite index trên (category_id, created_at)" mới là câu có trọng lượng.
