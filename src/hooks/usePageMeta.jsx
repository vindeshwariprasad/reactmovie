import { useEffect } from "react";

const DEFAULT_TITLE = "Movix - Movie Discovery Platform";
const DEFAULT_DESCRIPTION =
    "Discover millions of movies and TV shows. Explore trending, top rated, and popular content.";

const usePageMeta = (title, description) => {
    useEffect(() => {
        document.title = title ? `${title} | Movix` : DEFAULT_TITLE;

        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );
        if (metaDescription) {
            metaDescription.setAttribute(
                "content",
                description || DEFAULT_DESCRIPTION
            );
        }

        return () => {
            document.title = DEFAULT_TITLE;
            if (metaDescription) {
                metaDescription.setAttribute("content", DEFAULT_DESCRIPTION);
            }
        };
    }, [title, description]);
};

export default usePageMeta;
