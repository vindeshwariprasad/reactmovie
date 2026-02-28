import React from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import "./style.scss";
import Img from "../lazyLoadimage/Img";
import Rating from "../rating/Rating";
import Genres from "../genres/Genres";
import PosterFallback from "../../assets/no-poster.png";

const MovieCard = React.memo(({ data, fromSearch, mediaType }) => {
    const { url } = useSelector((state) => state.home);
    const navigate = useNavigate();
    const posterUrl = data.poster_path
        ? url.poster + data.poster_path
        : PosterFallback;

    const handleNavigate = () => {
        navigate(`/${data.media_type || mediaType}/${data.id}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleNavigate();
        }
    };

    return (
        <div
            className="movieCard"
            onClick={handleNavigate}
            onKeyDown={handleKeyDown}
            role="link"
            tabIndex={0}
        >
            <div className="posterBlock">
                <Img
                    className="posterImg"
                    src={posterUrl}
                    alt={data.title || data.name}
                />
                {!fromSearch && (
                    <React.Fragment>
                        <Rating rating={data.vote_average.toFixed(1)} />
                        <Genres data={data.genre_ids.slice(0, 2)} />
                    </React.Fragment>
                )}
            </div>
            <div className="textBlock">
                <span className="title">{data.title || data.name}</span>
                <span className="date">
                    {dayjs(data.release_date).format("D MMM, YYYY")}
                </span>
            </div>
        </div>
    );
});

export default MovieCard;