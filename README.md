# Mộc Mộc Farm — Chế độ ngang, giao diện game toàn cảnh

## Nâng cấp
- Nông trại lấp đầy màn hình; không còn 2 thanh màu sáng chiếm diện tích.
- Xu, nước và giờ hiện thành những ô nhỏ nổi trên bản đồ; ảnh hồ sơ vẫn mở menu cửa hàng/kho đồ/nhân vật/nhiệm vụ/âm thanh.
- Hạt giống chuyển thành khay pixel nhỏ có thể đóng/mở bằng nút mũi tên.
- iPhone: vào game rồi **cầm điện thoại ngang** để chơi ngay cả khi nút **Khóa hướng dọc** đang bật. Website tự xoay **nội dung game 90°** khi Safari vẫn báo màn hình dọc; iOS không cho website thay đổi khóa xoay của hệ thống. Màn hình đăng nhập vẫn dọc để dễ nhập mã PIN.
- Vẫn giữ PIN, Google/Facebook Firebase, trồng cây, tưới, thu hoạch 1 chạm, NPC, nhạc, lưu cục bộ.
- Đây là PWA, **Safari/iOS không đảm bảo website có quyền khóa xoay màn hình**; manifest chỉ là lời đề nghị định hướng.

## Cập nhật không đổi địa chỉ GitHub Pages
1. Giải nén ZIP và mở repository game GitHub hiện tại (không tạo repo mới).
2. Chỉ cần upload đè **`game.js`, `style.css`, `pixel-world.js`, `sw.js`, `index.html`**. Các file âm thanh, bản đồ còn lại không thay đổi.
3. Nhấn Commit changes, chờ GitHub Pages triển khai rồi mở lại game trên iPhone. Vẫn giữ URL cũ.
4. **ĐỪNG xóa hoặc thay file `firebase-config.js` hiện có trên GitHub**, file đó chứa cấu hình Firebase bạn đã điền. ZIP này cố ý không bao gồm file này.

### Về dữ liệu nông trại
Dữ liệu vẫn dùng localStorage như phiên bản cũ, không tự xóa hoặc reset. Game chưa đồng bộ tiến trình lên Firebase/thiết bị khác.

### Thử trên laptop
Có thể dùng `index.html` để thử PIN offline khi giải nén, hoặc chạy bằng Live Server. Đăng nhập Google/Facebook chỉ hoạt động trên GitHub Pages nếu đã cấu hình Firebase, tên miền được ủy quyền và phương thức đăng nhập.

**Tài liệu hình ảnh & mã vẽ:** Bản đồ vẽ Canvas độc lập; tài nguyên pixel không sao chép từ Stardew Valley.


## Tại sao vẫn cần cầm điện thoại ngang?
Khi bật Khóa hướng dọc, iOS không cho Safari/PWA đổi chiều màn hình vật lý. Bản này xoay toàn bộ **giao diện game**, chứ không bật/tắt khóa xoay của iPhone. Hãy **xoay điện thoại bằng tay** để nhìn và chơi bình thường; không cần mở Trung tâm điều khiển. Phần chọn cây trong canvas đã sửa tọa độ chạm theo chiều xoay.
