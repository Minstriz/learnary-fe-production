// File: src/middleware.ts

import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// Middleware này CHỈ xử lý việc thêm /vi, /en...
export default createMiddleware(routing);

export const config = {
  matcher: [
    // Bỏ qua tất cả các đường dẫn không cần i18n
    // 1. API routes
    // 2. Các file của Next.js
    // 3. Đường dẫn auth-callback
    // 4. Bất kỳ file nào có dấu chấm (ví dụ: favicon.ico, image.png)
    '/((?!api|_next|_vercel|auth-callback|.*\\..*).*)'
  ]
};