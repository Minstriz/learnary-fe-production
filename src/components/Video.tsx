import { useIsMobile } from '@/hooks/useIsMobile'
import React, { useEffect, useRef, useState } from 'react'
import "plyr/dist/plyr.css";

interface VideoProps {
    video_url: string,
}

const Video: React.FC<VideoProps> = ({ video_url }) => {
    const isMobile = useIsMobile();
    const playerRef = useRef<Plyr | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const setupPlayer = async () => {
            if (!playerRef.current && videoRef.current) {
                try {
                    const Plyr = (await import('plyr')).default;
                    playerRef.current = new Plyr(videoRef.current, {
                        controls: [
                            'play-large',
                            'restart',
                            'rewind',
                            'play',
                            'fast-forward',
                            'progress',
                            'current-time',
                            'duration',
                            'mute',
                            'volume',
                            'captions',
                            'settings',
                            'pip',
                            'airplay',
                           /*  'download', */
                            'fullscreen'
                        ],

                        settings: ['captions', 'quality', 'speed'],

                        quality: {
                            default: 720,
                            options: [360, 480, 720, 1080, 1440, 2160],
                            forced: true,
                            onChange: (quality: number) => {
                                console.log('Quality changed to:', quality);
                            },
                        },

                        speed: {
                            selected: 1,
                            options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
                        },

                        keyboard: {
                            focused: true,
                            global: false
                        },

                        tooltips: {
                            controls: true,
                            seek: true
                        },

                        captions: {
                            active: true,
                            language: 'auto',
                            update: false
                        },

                        fullscreen: {
                            enabled: true,
                            fallback: true,
                            iosNative: true,
                        },

                        ratio: '16:9',
                        autoplay: false,
                        muted: false,
                        volume: 1,
                        clickToPlay: true,
                        disableContextMenu: true,
                        hideControls: true,
                        resetOnEnd: false,
                        /* tốc độ tua tới và tua lùi (theo giây), khi đổi thì phải hard refresh browser (ctrl F5) */
                        seekTime: 10,
                        invertTime: true,
                        toggleInvert: true,

                        storage: {
                            enabled: true,
                            key: 'plyr'
                        },

                        i18n: {
                            restart: 'Phát lại',
                            rewind: 'Tua lùi {seektime}s',
                            play: 'Phát',
                            pause: 'Tạm dừng',
                            fastForward: 'Tua tới {seektime}s',
                            seek: 'Tua',
                            seekLabel: '{currentTime} của {duration}',
                            played: 'Đã phát',
                            buffered: 'Đã tải',
                            currentTime: 'Thời gian hiện tại',
                            duration: 'Tổng thời gian',
                            volume: 'Âm lượng',
                            mute: 'Tắt tiếng',
                            unmute: 'Bật tiếng',
                            enableCaptions: 'Bật phụ đề',
                            disableCaptions: 'Tắt phụ đề',
                            download: 'Tải xuống',
                            enterFullscreen: 'Toàn màn hình',
                            exitFullscreen: 'Thoát toàn màn hình',
                            frameTitle: 'Trình phát video {title}',
                            captions: 'Phụ đề',
                            settings: 'Cài đặt',
                            pip: 'PIP',
                            menuBack: 'Quay lại',
                            speed: 'Tốc độ',
                            normal: 'Bình thường',
                            quality: 'Chất lượng',
                            loop: 'Lặp lại',
                            start: 'Bắt đầu',
                            end: 'Kết thúc',
                            all: 'Tất cả',
                            reset: 'Đặt lại',
                            disabled: 'Tắt',
                            enabled: 'Bật',
                            advertisement: 'Quảng cáo',
                            qualityBadge: {
                                2160: '4K',
                                1440: 'HD',
                                1080: 'HD',
                                720: 'HD',
                                576: 'SD',
                                480: 'SD',
                            },
                        },
                    });
                    
                    if (videoRef.current) {
                        videoRef.current.removeAttribute('crossorigin');
                    }
                    
                    playerRef.current.on('ready', () => {
                        setIsLoading(false);
                        if (videoRef.current) {
                            videoRef.current.removeAttribute('crossorigin');
                        }
                    });

                    playerRef.current.on('play', () => {
                        
                    });

                    playerRef.current.on('pause', () => {
                        
                    });

                    playerRef.current.on('ended', () => {
                       
                    });

                    playerRef.current.on('timeupdate', () => {
                        const currentTime = playerRef.current?.currentTime || 0;
                        const duration = playerRef.current?.duration || 0;
                        const progress = (currentTime / duration) * 100;
                        
                        if (Math.floor(currentTime) % 5 === 0) {
                            console.log('Progress:', progress.toFixed(2) + '%');
                        }
                    });

                } catch (error) {
                    console.error('Error setting up player:', error);
                }
            }
        };
        
        const timer = setTimeout(() => {
            setupPlayer();
        }, 100);
        
        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) {
                    console.log(e)
                }
                playerRef.current = null;
            }
            clearTimeout(timer);
        };
    }, [video_url]);

    return (
        <div className={`${isMobile ? "h-fit" : "h-fit min-h-[500px]"} relative rounded-2xl`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải video...</p>
                    </div>
                </div>
            )}
            <video
                ref={videoRef}
                className="plyr__video-embed w-full rounded-2xl"
                playsInline
                controls>
                <source src={video_url} type="video/mp4" />
            </video>
        </div>
    );
};

export default Video;
