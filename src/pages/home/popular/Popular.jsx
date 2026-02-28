import React, { useState } from "react";
import ContentWrapper from '../../../component/contentwrapper/ContentWrapper'
import SwitchTabs from '../../../component/switchTabs/SwitchTabs'
import Usefetch from '../../../hooks/Usefetch'

import Coursel from '../../../component/coursel/Coursel'

const Popular = () => {
    const [endpoint, setEndpoint] = useState("movie");

    const { data, loading } = Usefetch(`/${endpoint}/popular`);

    const onTabChange = (tab) => {
        setEndpoint(tab === "Movies" ? "movie" : "tv");
    };

    return (
        <div className="carouselSection">
            <ContentWrapper>
                <span className="carouselTitle">What's Popular</span>
                <SwitchTabs
                    data={["Movies", "TV Shows"]}
                    onTabChange={onTabChange}
                />
            </ContentWrapper>
            <Coursel
                data={data?.results}
                loading={loading}
                endpoint={endpoint}
            />
        </div>
    );
};

export default Popular;