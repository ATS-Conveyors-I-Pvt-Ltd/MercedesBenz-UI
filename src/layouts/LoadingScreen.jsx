import React, { useRef, useEffect } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ onComplete }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.log("Autoplay prevented:", error);

                // Try to play with mute if autoplay fails
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play().catch(() => {
                        // If all else fails, complete immediately so user isn't stuck
                        onComplete();
                    });
                }
            });
        }
    }, [onComplete]);

    return (
        <div className="loading-screen">
            <video
                ref={videoRef}
                className="loading-video"
                src="/assets/Loop%20Videos/load.mp4"
                onEnded={onComplete}
                muted
                playsInline
            />
        </div>
    );
};

export default LoadingScreen;
