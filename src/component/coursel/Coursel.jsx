

import React, { useRef, useCallback } from "react";
import {
    BsFillArrowLeftCircleFill,
    BsFillArrowRightCircleFill,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import ContentWrapper from "../contentwrapper/ContentWrapper";
import Img from "../lazyLoadimage/Img";

import PosterFallback from "../../assets/no-poster.png";
import Rating from "../rating/Rating";
import Genres from "../genres/Genres";

import "./style.scss";

const Coursel = ({ data, loading, endpoint, title }) => {
    const carouselContainer = useRef();
    const { url } = useSelector((state) => state.home);
    const navigate = useNavigate();

    const navigation = useCallback((dir) => {
        const container = carouselContainer.current;

        const scrollAmount =
            dir === "left"
                ? container.scrollLeft - (container.offsetWidth + 20)
                : container.scrollLeft + (container.offsetWidth + 20);

        container.scrollTo({
            left: scrollAmount,
            behavior: "smooth",
        });
    }, []);

    const skItem = () => {
        return (
            <div className="skeletonItem">
                <div className="posterBlock skeleton"></div>
                <div className="textBlock">
                    <div className="title skeleton"></div>
                    <div className="date skeleton"></div>
                </div>
            </div>
        );
    };

    return (
        <div className="carousel" role="region" aria-label={title || "Content carousel"}>
            <ContentWrapper>
                {title && <div className="carouselTitle">{title}</div>}
                <button
                    className="carouselLeftNav arrow"
                    onClick={() => navigation("left")}
                    aria-label="Scroll left"
                >
                    <BsFillArrowLeftCircleFill />
                </button>
                <button
                    className="carouselRighttNav arrow"
                    onClick={() => navigation("right")}
                    aria-label="Scroll right"
                >
                    <BsFillArrowRightCircleFill />
                </button>
                {!loading ? (
                    <div className="carouselItems" ref={carouselContainer}>
                        {data?.map((item) => {
                            const posterUrl = item.poster_path
                                ? url.poster + item.poster_path
                                : PosterFallback;
                            return (
                                <div
                                    key={item.id}
                                    className="carouselItem"
                                    onClick={() =>
                                        navigate(
                                            `/${item.media_type || endpoint}/${
                                                item.id
                                            }`
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        navigate(
                                            `/${item.media_type || endpoint}/${
                                                item.id
                                            }`
                                        )
                                    }
                                    role="link"
                                    tabIndex={0}
                                >
                                    <div className="posterBlock">
                                        <Img
                                            src={posterUrl}
                                            alt={item.title || item.name}
                                        />

                                        <Rating
                                            rating={item.vote_average.toFixed(
                                                1
                                            )}
                                        />
                                        <Genres
                                            data={item.genre_ids.slice(0, 2)}
                                        />
                                    </div>
                                    <div className="textBlock">
                                        <span className="title">
                                            {item.title || item.name}
                                        </span>
                                        <span className="date">
                                            {dayjs(item.release_date || item.first_air_date).format(
                                                "D MMM, YYYY"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="loadingSkeleton">
                        {skItem()}
                        {skItem()}
                        {skItem()}
                        {skItem()}
                        {skItem()}
                    </div>
                )}
            </ContentWrapper>
        </div>
    );
};

export default Coursel;
