import { useEffect, useState } from "react";
import { fetchdatafromapi } from "../utils/api";
const Usefetch = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setData(null);
        setError(null);

        fetchdatafromapi(url)
            .then((res) => {
                if (!cancelled) {
                    setLoading(false);
                    setData(res);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setLoading(false);
                    setError(err.message || "Something went wrong!");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [url]);

    return { data, loading, error };
};

export default Usefetch;