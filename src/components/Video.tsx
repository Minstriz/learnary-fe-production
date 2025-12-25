import { useIsMobile } from '@/hooks/useIsMobile'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import "plyr/dist/plyr.css";
import { toast } from 'sonner';
import api from '@/app/lib/axios';

interface VideoProps {
    video_url: string;
    lesson_id?: string;
    is_completed?: boolean;
    onCompleted?: () => void;
}

const Video: React.FC<VideoProps> = ({
    video_url,
    lesson_id,
    onCompleted,
    is_completed,
}) => {
    const isMobile = useIsMobile();
    const playerRef = useRef<Plyr | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const lastWatchTimeRef = useRef(0);
    const maxWatchTimeRef = useRef(0);
    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [progressLoaded, setProgressLoaded] = useState(false);
    useEffect(() => {
        const fetchProgress = async () => {
            if (!lesson_id) {
                setProgressLoaded(true);
                return;
            }
            try {
                const response = await api.get(`/lesson-progress/${lesson_id}`);
                const progress = response.data?.data;
                if (progress) {
                    lastWatchTimeRef.current = progress.last_watch_time || 0;
                    maxWatchTimeRef.current = progress.max_watch_time || 0;
                }
            } catch {

            } finally {
                setProgressLoaded(true);
            }
        };
        fetchProgress();
    }, [lesson_id]);
    const saveWatchTime = useCallback(async (last_time: number, max_time: number) => {
        if (!lesson_id) {
            return;
        }
        try {
            await api.post('/lesson-progress/watch-time', {
                lesson_id,
                last_watch_time: Math.floor(last_time),
                max_watch_time: Math.floor(max_time),
            });
        } catch (error) {
            console.error('Failed to save watch time:', error);
        }
    }, [lesson_id]);

    useEffect(() => {
        if (!progressLoaded) {
            return;
        }
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
                            /* onChange: (quality: number) => {
                            }, */
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
                        if (lastWatchTimeRef.current > 0 && playerRef.current) {
                            playerRef.current.currentTime = lastWatchTimeRef.current;
                        }
                    });
                    playerRef.current.on('play', () => {
                        if (saveIntervalRef.current) {
                            clearInterval(saveIntervalRef.current);
                        }
                        saveIntervalRef.current = setInterval(() => {
                            const currentTime = playerRef.current?.currentTime || 0;
                            const newMaxWatchTime = Math.max(maxWatchTimeRef.current, currentTime);

                            lastWatchTimeRef.current = currentTime;
                            maxWatchTimeRef.current = newMaxWatchTime;
                            saveWatchTime(currentTime, newMaxWatchTime);
                        }, 10000); // lưu mỗi 10 giây
                    });
                    playerRef.current.on('pause', () => {
                        const currentTime = playerRef.current?.currentTime || 0;
                        const newMaxWatchTime = Math.max(maxWatchTimeRef.current, currentTime);
                        lastWatchTimeRef.current = currentTime;
                        maxWatchTimeRef.current = newMaxWatchTime;
                        saveWatchTime(currentTime, newMaxWatchTime);
                        if (saveIntervalRef.current) {
                            clearInterval(saveIntervalRef.current);
                            saveIntervalRef.current = null;
                        }
                    });
                    playerRef.current.on('ended', () => {
                        const duration = playerRef.current?.duration || 0;
                        saveWatchTime(duration, duration);
                        if (saveIntervalRef.current) {
                            clearInterval(saveIntervalRef.current);
                            saveIntervalRef.current = null;
                        }
                        onCompleted?.();
                    });
                    playerRef.current.on('timeupdate', () => {
                        const currentTime = playerRef.current?.currentTime || 0;
                        if (currentTime > maxWatchTimeRef.current) {
                            maxWatchTimeRef.current = currentTime;
                        }
                    });

                    if (is_completed == false) {
                        //seeking là cấu hình cả tua tới và lùi, chi tiết hơn thì dùng rewind để quản lý tua lùi, fastFoward để quản lý tua tới
                        playerRef.current.on('seeking', () => {
                            const currentTime = playerRef.current?.currentTime || 0;
                            const allowedMaxTime = maxWatchTimeRef.current /* + 5 */; // cho phép tua tới thêm 5 giây
                            if (currentTime > allowedMaxTime && playerRef.current) {
                                playerRef.current.currentTime = allowedMaxTime;
                                toast.warning('Bạn chỉ có thể tua tới vị trí đã xem!', {
                                    duration: 2000,
                                });
                            }
                        });
                    }
                } catch {
                }
            }
        };

        const timer = setTimeout(() => {
            setupPlayer();
        }, 100);

        return () => {
            if (playerRef.current) {
                const currentTime = playerRef.current.currentTime || 0;
                const newMaxWatchTime = Math.max(maxWatchTimeRef.current, currentTime);
                saveWatchTime(currentTime, newMaxWatchTime);
            }
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
                saveIntervalRef.current = null;
            }
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch {

                }
                playerRef.current = null;
            }
            clearTimeout(timer);
        };
    }, [video_url, onCompleted, saveWatchTime, progressLoaded, lesson_id, is_completed]);

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
