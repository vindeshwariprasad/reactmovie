import React from "react";

import Coursel from "../../../component/coursel/Coursel";
import Usefetch from "../../../hooks/Usefetch";

const Similar = ({ mediaType, id }) => {
    const { data, loading, error } = Usefetch(`/${mediaType}/${id}/similar`);

    const title = mediaType === "tv" ? "Similar TV Shows" : "Similar Movies";

    return (
        <Coursel
            title={title}
            data={data?.results}
            loading={loading}
            endpoint={mediaType}
        />
    );
};

export default Similar;