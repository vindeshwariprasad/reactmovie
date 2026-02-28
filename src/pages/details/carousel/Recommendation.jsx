import React from "react";
import Coursel from "../../../component/coursel/Coursel";
import Usefetch from "../../../hooks/Usefetch";



const Recommendation = ({ mediaType, id }) => {
    const { data, loading, error } = Usefetch(
        `/${mediaType}/${id}/recommendations`
    );

    return (
        <Coursel
            title="Recommendations"
            data={data?.results}
            loading={loading}
            endpoint={mediaType}
        />
    );
};

export default Recommendation;
