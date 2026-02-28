import React, { useEffect, useRef, useCallback } from "react";
import ReactPlayer from "react-player/youtube";

import "./style.scss";

const VideoPopup = ({ show, setShow, videoId, setVideoId }) => {
    const popupRef = useRef();
    const closeBtnRef = useRef();

    const hidePopup = useCallback(() => {
        setShow(false);
        setVideoId(null);
    }, [setShow, setVideoId]);

    useEffect(() => {
        if (!show) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                hidePopup();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        closeBtnRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [show, hidePopup]);

    return (
        <div
            className={`videoPopup ${show ? "visible" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Video player"
            ref={popupRef}
        >
            <div className="opacityLayer" onClick={hidePopup}></div>
            <div className="videoPlayer">
                <button
                    className="closeBtn"
                    onClick={hidePopup}
                    aria-label="Close video"
                    ref={closeBtnRef}
                >
                    Close
                </button>
                <ReactPlayer
                    url={`https://www.youtube.com/watch?v=${videoId}`}
                    controls
                    width="100%"
                    height="100%"
                    playing={true}
                />
            </div>
        </div>
    );
};

export default VideoPopup;
