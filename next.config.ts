import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";


const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol:'https',
        hostname:'learnary-courses.s3.ap-southeast-2.amazonaws.com'
      },
      {
        protocol:'https',
        hostname:'placebear.com'
      }, 
      {
        protocol:'https',
        hostname:'lh3.googleusercontent.com'
      },
      {
        protocol:'https',
        hostname:'learnary-courses.s3.amazonaws.com'
      }
      ,
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh2.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh1.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      }
    ],
  },
  // không cần khai báo i18n này nữa vì App Router của NextJS 13+ đã có cách xử lý đa ngô ngữ i18n mới, không cần cấu hình trong này như Pages Router nữa.
  // i18n: {
  //   locales:['en','vi'],
  //   defaultLocale:'vi',
  // } 
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/v1/:path*', 
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextVideo(withNextIntl(nextConfig));