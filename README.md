# Mộc Mộc Farm – bản Pixel HD sắc nét

Bản nâng cấp đồ họa từ chế độ chơi ngang hiện tại. Không thay đổi gameplay, tài khoản PIN, Firebase, âm thanh, cách chạm hay dữ liệu lưu trong `localStorage`.

## Thay đổi
- Vẽ Canvas theo pixel vật lý của màn hình (Retina, tối đa 2x và giới hạn bộ nhớ), thay cho bản cũ chỉ render ở **50% kích thước CSS** nên thường bị mờ.
- Tắt nội suy (image smoothing), nét pixel giữ sắc cạnh.
- Zoom camera nhẹ (~15%) để thấy nhân vật, cây và chi tiết bản đồ lớn hơn.
- Cải thiện độ tương phản của đất, cây, cửa nhà, trang phục và nhãn NPC.
- Sửa khung xoay nội dung 90° trên iPhone khi khóa hướng dọc bằng `#game-stage`; giữ đăng nhập Google/Facebook, hạt giống, nhiệm vụ, nhạc.

## Cập nhật đúng GitHub Pages cũ (không đổi URL)
1. Trong repository hiện tại của Mộc Mộc Farm, **chỉ cần thay bốn file** `index.html`, `pixel-world.js`, `style.css`, `sw.js` từ ZIP này.
2. Commit changes, chờ GitHub Pages deploy, sau đó mở lại game. Nếu phiên bản cũ còn lưu cache, hãy tải lại trang.
3. **Giữ nguyên `firebase-config.js` đã thiết lập và các file game khác.** Không xóa dữ liệu website để tránh mất tiến trình.

## Lưu ý
Canvas độ phân giải cao sử dụng thêm RAM/GPU; nếu máy iPhone cũ quá chậm, có thể hạ giới hạn `dpr` trong `pixel-world.js` từ 2 xuống 1.5. Hình vẫn theo phong cách pixel art, không biến thành ảnh 3D hoặc ảnh chụp thật.
