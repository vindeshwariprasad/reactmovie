import React from 'react'
import ContentWrapper from '../../../component/contentwrapper/ContentWrapper'
import SwitchTabs from '../../../component/switchTabs/SwitchTabs'
import Usefetch from '../../../hooks/Usefetch'
import { useState } from 'react';
import Coursel from '../../../component/coursel/Coursel'
const Trending = () => {
    const [endpoint, setEndpoint] = useState("day");

    const { data, loading } = Usefetch(`/trending/movie/${endpoint}`);

    const onTabChange = (tab) => {
        setEndpoint(tab === "Day" ? "day" : "week");
    };
  return (
    <div className="carouselSection">
            <ContentWrapper>
                <span className="carouselTitle">Trending</span>
                <SwitchTabs data={["Day", "Week"]} onTabChange={onTabChange} />
            </ContentWrapper>
            <Coursel data={data?.results} loading={loading}></Coursel>
            {/* <Caursel data={data?.results} loading={loading} /> */}
    </div>
  )
}

export default Trending