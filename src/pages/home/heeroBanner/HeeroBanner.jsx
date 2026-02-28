import React from 'react'
import { useNavigate } from 'react-router-dom';
import './style.scss';
import { useState ,useEffect} from 'react';
import Usefetch from '../../../hooks/Usefetch';
import { useSelector } from "react-redux";
import Img from "../../../component/lazyLoadimage/Img"
import ContentWrapper from '../../../component/contentwrapper/ContentWrapper';
const HeeroBanner = () => {
    const [background,setbackground] = useState("");
    const navigate = useNavigate();
    const [query,setquery] = useState("");
    const { url } = useSelector((state) => state.home);
    const { data, loading } = Usefetch("/movie/top_rated");
    const handleSearch = (event) => {
        if (event.key ==='Enter' && query.length > 0){
            navigate(`/search/${query}`);
        }
            
    }
    useEffect(() =>{
        const bg =
            url.backdrop +
            data?.results?.[Math.floor(Math.random() * 20)]?.backdrop_path;
        setbackground(bg);
    },[data])
  return (
    <div className="heroBanner">
        {!loading && (
                <div className="backdrop-img">
                    <Img src={background} />
                </div>
            )}
        <div className="opacity-layer-top"></div>
        <div className="opacity-layer"></div>
        <ContentWrapper>
        
            <div className="heroBannerContent">
            <span className="title">Welcome!!.</span>
                    <span className="subTitle">
                        Millions of movies, TV shows just for You.
                        Explore now.
                    </span>
                    <div className="searchInput">
                        <input type="text" 
                        placeholder='Search for new shows'
                        onChange={(e)=>setquery(e.target.value)}
                        onKeyUp={handleSearch}
                        />
                        <button>Search</button>
                    </div>
            </div>
        
        </ContentWrapper>
    </div>
  )
}

export default HeeroBanner