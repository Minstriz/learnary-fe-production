export function formatPriceVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0, // không hiện thập phân
  }).format(value);
}

/**
 * Format số thành chuỗi có dấu chấm ngăn cách hàng nghìn (không có ký hiệu tiền tệ)
 * @param value - Số cần format
 * @returns Chuỗi số có dấu chấm (ví dụ: 1000000 -> "1.000.000")
 */
export function formatNumberWithDots(value: number): string {
  return value.toLocaleString('vi-VN');
}

/**
 * Loại bỏ dấu chấm và chuyển chuỗi thành số
 * @param value - Chuỗi có dấu chấm
 * @returns Số nguyên (ví dụ: "1.000.000" -> 1000000)
 */
export function parseNumberFromDots(value: string): number {
  const rawValue = value.replace(/\./g, '');
  return rawValue === '' ? 0 : parseInt(rawValue, 10);
}
