# Mộc Mộc Farm — Chế độ ngang, giao diện game toàn cảnh

## Nâng cấp
- Nông trại lấp đầy màn hình; không còn 2 thanh màu sáng chiếm diện tích.
- Xu, nước và giờ hiện thành những ô nhỏ nổi trên bản đồ; ảnh hồ sơ vẫn mở menu cửa hàng/kho đồ/nhân vật/nhiệm vụ/âm thanh.
- Hạt giống chuyển thành khay pixel nhỏ có thể đóng/mở bằng nút mũi tên.
- iPhone: chơi ngang; nếu đang cầm dọc sẽ có màn hình nhắc xoay. Tắt **Khóa hướng dọc** trong Trung tâm điều khiển.
- Vẫn giữ PIN, Google/Facebook Firebase, trồng cây, tưới, thu hoạch 1 chạm, NPC, nhạc, lưu cục bộ.
- Đây là PWA, **Safari/iOS không đảm bảo website có quyền khóa xoay màn hình**; manifest chỉ là lời đề nghị định hướng.

## Cập nhật không đổi địa chỉ GitHub Pages
1. Giải nén ZIP và mở repository game GitHub hiện tại (không tạo repo mới).
2. Chỉ cần upload đè **`game.js`, `style.css`, `manifest.webmanifest`, `sw.js`, `index.html`**. Các file âm thanh, bản đồ còn lại không thay đổi.
3. Nhấn Commit changes, chờ GitHub Pages triển khai rồi mở lại game trên iPhone. Vẫn giữ URL cũ.
4. **ĐỪNG xóa hoặc thay file `firebase-config.js` hiện có trên GitHub**, file đó chứa cấu hình Firebase bạn đã điền. ZIP này cố ý không bao gồm file này.

### Về dữ liệu nông trại
Dữ liệu vẫn dùng localStorage như phiên bản cũ, không tự xóa hoặc reset. Game chưa đồng bộ tiến trình lên Firebase/thiết bị khác.

### Thử trên laptop
Có thể dùng `index.html` để thử PIN offline khi giải nén, hoặc chạy bằng Live Server. Đăng nhập Google/Facebook chỉ hoạt động trên GitHub Pages nếu đã cấu hình Firebase, tên miền được ủy quyền và phương thức đăng nhập.

**Tài liệu hình ảnh & mã vẽ:** Bản đồ vẽ Canvas độc lập; tài nguyên pixel không sao chép từ Stardew Valley.
