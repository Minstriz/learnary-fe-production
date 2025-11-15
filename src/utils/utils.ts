// utils/slugify.ts
export function slugify(str: string): string {
  return str
    .normalize("NFD")                     // tách dấu
    .replace(/[\u0300-\u036f]/g, "")      // xoá dấu
    .replace(/đ/g, "d").replace(/Đ/g, "D") // thay đ -> d
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")                 // khoảng trắng -> gạch
    .replace(/[^a-z0-9-]/g, "")           // bỏ ký tự đặc biệt
}
