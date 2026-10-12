# 🌻 Mộc Mộc Farm — Phiên bản Mộc Mộc Valley (Pixel Art 2D)

Bản cập nhật **nguyên gốc** lấy cảm hứng từ thể loại nông trại 2D nhìn từ trên xuống. Nhà, chợ, hồ nước, NPC, cây cối, nhân vật và vườn rau được **vẽ riêng bằng Canvas**, không sao chép logo hay sprite từ Stardew Valley.

## Những gì mới

- Bản đồ nông trại pixel art vẽ bằng canvas, có nhà gỗ, chợ, hồ nước, cây cối, hàng rào, gà, thỏ và 12 ô trồng cây.
- Nhân vật đi lại được: laptop dùng **WASD/phím mũi tên**, điện thoại dùng **bộ nút điều khiển**. Chạm bãi cỏ để di chuyển về điểm chạm.
- Chạm vào luống đất trống để gieo hạt đã chọn; chạm vào cây chín để thu hoạch 1 lần chạm; chạm cây đang lớn để tưới, bón phân hoặc xử lý sâu bệnh.
- Chạm NPC trên bản đồ để mở cửa hàng: **Cô Mây** bán hạt, **Chú Tư** mua nông sản, **Bác Nâu** bán công cụ.
- Chạm giếng để lấy nước. Nút ✋ dùng để tương tác với đối tượng gần nhân vật.
- Giữ nguyên đăng nhập, nhân vật tùy chỉnh, thanh hạt phía dưới, menu hồ sơ, âm nhạc, nhiệm vụ, ngày/giờ, thời tiết mô phỏng theo mùa, thời gian cây lớn và tiến trình cũ.

**Phạm vi:** đây là phiên bản chơi thử pixel art có thể chơi được trên PWA. Chưa phải game Stardew Valley hoàn chỉnh, chưa có bản đồ nhiều khu, câu cá, hang động hay multiplayer.

## Cách cập nhật game hiện tại trên GitHub Pages mà không đổi link

1. Giải nén file ZIP và mở **repository GitHub CŨ** đang lưu game của bạn.
2. Upload đè các file **`index.html`, `style.css`, `game.js`, `sw.js`, `manifest.webmanifest`**, và upload thêm file mới **`pixel-world.js`**. Giữ hoặc tải lại `audio.js`, `farm-theme.mp3` và `assets/` nếu chưa có.
3. Nhấn **Commit changes**. GitHub Pages sẽ cập nhật game ở **URL hiện tại**, không cần tạo repository mới hoặc thêm lại biểu tượng iPhone.
4. Đợi GitHub Pages triển khai xong, mở lại game trên iPhone khi có Internet. Bản mới có service worker v6 để làm mới bộ nhớ đệm. Nếu vẫn hiện bản cũ, tải lại trang rồi mở lại game.

**Giữ tiến trình:** File mới dùng lại các khóa localStorage của bản trước. Tiến trình thường được giữ nếu dùng cùng trình duyệt và tên miền, không xóa dữ liệu web. Đăng nhập hiện chỉ lưu cục bộ trên thiết bị, chưa có máy chủ đồng bộ. Hãy sao lưu trước khi thay đổi lớn.

## Chạy thử trên máy tính

Mở `index.html` trên Chrome/Edge hoặc chạy trong thư mục game:

```bash
python -m http.server 8000
```

Rồi mở `http://localhost:8000`. Để cài PWA trên iPhone, cần triển khai trang HTTPS (ví dụ GitHub Pages) và chọn **Safari → Chia sẻ → Thêm vào Màn hình chính**. Đây chưa phải file `.ipa`.

## Cấu trúc

- `index.html`: màn hình game
- `style.css`: responsive, giao diện pixel và các cửa hàng
- `game.js`: thông tin và chức năng game có lưu dữ liệu
- `pixel-world.js`: bản đồ pixel, nhân vật di chuyển, trồng cây, NPC, thời tiết
- `audio.js`, `farm-theme.mp3`: âm thanh/nhạc
- `sw.js`, `manifest.webmanifest`: cập nhật giữ nguyên URL và PWA
- `assets/`: icon PWA

Không cần tài nguyên hay thư viện từ bên ngoài để vẽ bản đồ. Nhạc nền phát sau khi chạm đầu tiên theo chính sách của Safari.


## Bản cập nhật đăng nhập Pixel Art + Google / Facebook

Màn hình đăng nhập được làm lại theo tông gỗ/pixel art, có thể dùng PIN cũ hoặc chọn Google/Facebook. **Hai nút mạng xã hội chỉ hoạt động SAU KHI cấu hình Firebase thực tế; bản tải về không chứa thông tin dự án của bạn.** Không có đăng nhập giả.

### Kích hoạt Google

1. Vào https://console.firebase.google.com → Create project (hoặc dùng project sẵn có) → Add app **Web**.
2. Sao chép các giá trị `apiKey`, `authDomain`, `projectId`, `appId` từ phần Firebase SDK setup and configuration vào `firebase-config.js`. Đây là thông tin công khai của Web App; **không** thêm private key/service account vào file này.
3. Vào **Authentication → Sign-in method**, bật **Google**.
4. Vào **Authentication → Settings → Authorized domains**, thêm tên miền đang host game (ví dụ `tenban.github.io`; không thêm `https://` hoặc đường dẫn repo).
5. Đưa file lên HTTPS trên GitHub Pages, thử đăng nhập từ Chrome/Safari thông thường trước.

### Kích hoạt Facebook

1. Vào https://developers.facebook.com tạo một Meta Developer app tương thích **Facebook Login**; bật Facebook Login và làm theo yêu cầu ứng dụng.
2. Trong **Firebase Authentication → Sign-in method → Facebook**, nhập **Facebook App ID** và **App Secret** vào giao diện Firebase Console (**KHÔNG đưa App Secret vào mã nguồn, GitHub hoặc `firebase-config.js`**).
3. Ở Meta Developer → Facebook Login, thêm **Valid OAuth Redirect URI** mà Firebase hiển thị (thường là `https://PROJECT_ID.firebaseapp.com/__/auth/handler`).
4. Kiểm tra trạng thái ứng dụng, vai trò tài khoản thử nghiệm, và các yêu cầu quyền riêng tư/đăng nhập của Meta trước khi công khai.

### Những giới hạn cần biết

- Social login là **xác thực Firebase thật** và dùng tài khoản nông trại riêng theo Firebase UID. Đăng nhập xã hội **không tự chuyển** các nông trại PIN trước đây sang Google/Facebook để tránh nhập nhầm dữ liệu.
- Tiến trình cây trồng, tiền xu vẫn được lưu cục bộ trên thiết bị. Muốn chuyển máy/phòng mất dữ liệu cần thiết kế thêm lưu đám mây (ví dụ Cloud Firestore + Security Rules).
- Bản HTML chạy trực tiếp bằng `file://` dùng được PIN, nhưng **không chạy xác thực OAuth**. Dùng URL HTTPS trên GitHub Pages.
- Safari iPhone và đặc biệt PWA cài ở màn hình chính có thể chặn popup hoặc gặp hạn chế cookie. Vì vậy cần **kiểm tra bằng Safari trước**; nếu không hoạt động ổn định, cần thiết kế quy trình chuyển hướng đáp ứng hướng dẫn Firebase redirect best practices (thường dùng Firebase Hosting hoặc proxy auth trên cùng miền). Không nên giả định mọi thiết bị đăng nhập được trước khi thử.
- Chỉ cần upload `index.html`, `style.css`, `game.js`, `sw.js` và 2 file mới `firebase-config.js`, `social-auth.js` **vào repository GitHub cũ**; URL game không đổi.

Tài liệu chính thức: https://firebase.google.com/docs/auth/web/google-signin và https://firebase.google.com/docs/auth/web/facebook-login ; https://firebase.google.com/docs/auth/web/redirect-best-practices
