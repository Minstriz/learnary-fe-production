import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com", "assets.aceternity.com"],
  },
  // không cần khai báo i18n này nữa vì App Router của NextJS 13+ đã có cách xử lý đa ngô ngữ i18n mới, không cần cấu hình trong này như Pages Router nữa.
  // i18n: {
  //   locales:['en','vi'],
  //   defaultLocale:'vi',
  // } 
};

const withNextIntl = createNextIntlPlugin();
export default withNextVideo(withNextIntl(nextConfig));