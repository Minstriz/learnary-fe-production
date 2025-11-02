import { useIsMobile } from '@/hooks/useIsMobile'
import React, { useEffect, useRef } from 'react'
import "plyr/dist/plyr.css";


interface VideoProps {
    video_url: string,
}
const Video: React.FC<VideoProps> = ({ video_url }) => {
    const isMobile = useIsMobile();
    const playerRef = useRef<Plyr | null>(null)
    const setupPlayer = async () => {
        if (!playerRef.current) {
            const Plyr = await import('plyr');
            playerRef.current = new Plyr.default("#player", {
                quality: {
                    options: [360, 720, 1080, 2160],
                    default: 1080,
                },
            });
        }
    }
    useEffect(() => {
        setupPlayer();
        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        }
    })
    return (
        <div className={isMobile ? "h-fit" : "h-fit min-h-[550px]"}>
            <video
                id="player"
                className="plyr__video-embed rounded"
                playsInline
                controls
                loop
            >
                <source
                    src={video_url}
                    type="video/mp4"
                />
                <track kind="captions" label="English" />
            </video>
        </div>
    )
}

export default Video