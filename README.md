# 🌿 Mộc Mộc Farm — Game nông trại cho iPhone

Một **game 2D/PWA** dùng HTML, CSS và JavaScript thuần. Có thể chơi trên máy tính lẫn Safari iPhone, không cần cài thư viện hay tài khoản dịch vụ ngoài.

## Tính năng có thể chơi

- Đăng nhập / tạo tài khoản thử nghiệm bằng tên và PIN trên **thiết bị hiện tại**; hướng dẫn tân thủ 5 bước ngay sau khi tạo tài khoản.
- Tạo nhân vật theo màu da, tóc, kiểu tóc, quần áo và nón.
- 12 ô đất, 5 loại cây: cà rốt, cà chua, bắp ngô, dâu tây, bí ngô. **Thanh hạt giống cố định ở sát dưới màn hình, menu mở bằng ảnh đại diện góc trên bên phải**; chọn hạt rồi chạm ô đất trống để gieo ngay, không có cửa sổ chọn hạt.
- Cây mọc theo thời gian thực: khi đóng Safari và mở lại, thời gian đã qua vẫn được tính.
- Tưới nước (giúp cây lớn nhanh), lấy nước từ giếng; phân hữu cơ tăng tốc và tăng đôi nông sản.
- Mô phỏng xuân/hạ/thu/đông theo ngày tháng năm thực tế của Việt Nam, ngày/đêm theo giờ hiện tại, nắng/mây/gió/mưa mô phỏng theo ngày. Thời tiết này **không phải dữ liệu khí tượng thật**.
- Sâu, chim, thỏ có thể phá hoại cây. Dùng bình xịt sinh học, bù nhìn hoặc lưới để đuổi, hoặc thử xua tay.
- Ba NPC: Cô Mây bán hạt, Chú Tư thu mua nông sản, Bác Nâu bán công cụ và phân bón.
- Xu, kinh nghiệm nhân vật, nhiệm vụ, kho đồ, lưu tiến trình ở localStorage.
- PWA có biểu tượng, chế độ mở như ứng dụng và bộ nhớ đệm offline qua service worker.

## Cách gieo hạt ở bản cập nhật

1. Trong **Vườn**, chọn hạt trên **thanh hạt giống cố định phía dưới** (vuốt ngang để xem đủ các loại).
2. Chạm vào **ô đất trống**: hạt đang chọn được gieo ngay, số hạt trong túi giảm 1. Không phải mở cửa sổ chọn hạt.
3. Chạm vào **cây đang lớn** để tưới, bón phân hoặc xua thú; chạm vào **cây đã chín** để thu hoạch ngay trong một lần chạm.
4. Nếu hết hạt, nhấn **🛒 Mua hạt** bên phải thanh hoặc gặp NPC **Cô Mây**.

Khi tải bản mới lên GitHub Pages, nhớ tải đè cả `game.js`, `style.css` và `sw.js` để nhận thay đổi. Nếu iPhone còn hiển thị bản cũ, hãy đóng và mở lại web app hoặc tải lại Safari khi có mạng.

## Thử nhanh trên máy tính

Mở `index.html` bằng Chrome hoặc Edge. Với bản lưu `file://`, game vẫn có thể hoạt động nhưng bộ nhớ đệm PWA cần HTTP(S). Để thử chuẩn hơn, mở terminal trong thư mục rồi chạy:

```bash
python -m http.server 8000
```

Truy cập `http://localhost:8000`.

## Đưa lên GitHub Pages

1. Đăng nhập GitHub → **New repository** → đặt tên `mocmoc-farm` → **Public** (GitHub Pages trên GitHub Free thường cần repository Public).
2. Vào repository → **Add file → Upload files**. Giải nén ZIP rồi tải **các file và thư mục BÊN TRONG** thư mục `mocmoc-farm-ios` lên gốc repository, gồm `index.html`, `game.js`, `style.css`, `manifest.webmanifest`, `sw.js`, thư mục `assets/`. Không cần tải `make_icon.py`.
3. Cuộn xuống → **Commit changes**.
4. Vào **Settings → Pages → Build and deployment → Deploy from a branch** → chọn nhánh `main`, thư mục `/(root)` → **Save**.
5. GitHub sẽ cung cấp đường dẫn tương tự `https://TEN-TAI-KHOAN.github.io/mocmoc-farm/` sau khi triển khai xong. **Đây chỉ là mẫu URL, không phải địa chỉ đã triển khai**.

## Thêm lên màn hình chính iPhone

1. Trên iPhone mở **Safari** và truy cập URL GitHub Pages của bạn.
2. Chọn nút **Chia sẻ** (hình vuông có mũi tên lên).
3. Chọn **Thêm vào Màn hình chính** (*Add to Home Screen*) rồi nhấn **Thêm**.
4. Nhấn vào biểu tượng **Mộc Mộc Farm** trên iPhone để chơi gần giống ứng dụng độc lập.

Lưu ý: Đây là ứng dụng web cài lên màn hình chính (**PWA**), **không phải** ứng dụng iOS native `.ipa` và chưa được phát hành trên App Store. Nếu muốn phát hành App Store sau này có thể tiếp tục phát triển bằng Swift/Unity hoặc đóng gói WebView phù hợp.

## Dữ liệu và đăng nhập

- Đây là **đăng nhập mẫu**, không phải xác thực máy chủ. Không dùng lại mật khẩu hoặc PIN ngân hàng. Mã PIN được băm phía trình duyệt, dữ liệu tiến trình lưu trong `localStorage` và chỉ có trên trình duyệt + miền hiện tại.
- Khi xóa dữ liệu website, vào chế độ riêng tư hoặc đổi thiết bị/tên miền, có thể mất tiến trình. Chưa có lưu đồng bộ/khôi phục tài khoản.
- Game không kết nối API thời tiết; thông tin nắng mưa chỉ là hệ thống mô phỏng.

## Thay đổi tốc độ mọc của cây

Mở `game.js`, phần đầu `const CROPS = { ... }`. Chỉnh `seconds`, `seed` và `sell`. Ví dụ `seconds: 55` nghĩa là khoảng 55 giây thực tế, trước ưu đãi mùa và hỗ trợ tưới/phân.

## Cấu trúc dự án

```text
mocmoc-farm-ios/
├── index.html              # Khung trang web
├── style.css               # Giao diện responsive + thế giới nông trại
├── game.js                 # Tính năng / dữ liệu / nhiệm vụ
├── audio.js                # Nhạc nền và tiếng hiệu ứng
├── farm-theme.mp3          # Bản nhạc nền không lời gốc
├── manifest.webmanifest    # Cài đặt PWA
├── sw.js                   # Hoạt động ngoại tuyến
├── assets/
│   ├── icon-192.png        # Biểu tượng iPhone / PWA
│   └── icon-512.png
└── README.md               # Hướng dẫn
```


## Cập nhật giao diện menu hồ sơ

- **Không còn nút ☰ nổi** ở góc dưới màn hình.
- Nhấn **ảnh đại diện trên cùng bên phải** để mở hoặc đóng menu Vườn, Cửa hàng, Kho đồ, Nhân vật, Nhiệm vụ và Âm thanh.
- Menu xổ ngay phía dưới ảnh đại diện trên máy tính và iPhone. Chạm vùng khác hoặc nhấn `Esc` để đóng menu.
- Các tính năng trồng cây, thu hoạch 1 chạm, âm thanh, nhạc nền và dữ liệu đã lưu được giữ nguyên.
- Tải đè `game.js`, `style.css`, `sw.js` vào cùng repository GitHub Pages để giữ nguyên link. Các file nhạc và tài nguyên giữ nguyên nếu repo đã có.
