// File: src/middleware.ts

import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// Middleware này CHỈ xử lý việc thêm /vi, /en...
export default createMiddleware(routing);

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|auth-callback|.*\\..*).*)'
  ]
};