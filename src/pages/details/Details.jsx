import React from "react";
import { useParams } from "react-router-dom";
import "./style.scss";

import Usefetch from "../../hooks/Usefetch";
import DetailsBanner from "./detailsbanner/DetailsBanner";
import Cast from "./cast/Cast";
import VideosSection from "./video/VideosSection";
import Similar from "./carousel/Similar";
import Recommendation from "./carousel/Recommendation";

const Details = () => {
    const { mediaType, id } = useParams();
    const { data, loading } = Usefetch(`/${mediaType}/${id}/videos`);
    const { data: credits, loading: creditsLoading } = Usefetch(
        `/${mediaType}/${id}/credits`
    );
    console.log(credits);
    return (
        <div>
            <DetailsBanner video={data?.results?.[0]} crew={credits?.crew} />
            <Cast data={credits?.cast} loading={creditsLoading} />
            <VideosSection data={data} loading={loading} />
            <Similar mediaType={mediaType} id={id} />
            <Recommendation mediaType={mediaType} id={id} />
        </div>
    );
};

export default Details;