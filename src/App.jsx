import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {fetchdatafromapi} from './utils/api';
import { useSelector, useDispatch } from 'react-redux'
import { getApiConfiguration,getGenres } from './store/homeSlice';

import Header from './component/header/Header'
import Footer from './component/footer/Footer'
import Home from './pages/home/Home'
import SearchResults from './pages/seearchResult/SearchResult'
import Explore from './pages/explore/Explore';
import Details from './pages/details/Details';
import Pagenotfound from './pages/404/Pagenotfound';
function App() {
  const dispatch = useDispatch()
  const { url } = useSelector((state) => state.home);
  console.log(url);
  useEffect(()=>{
    testing();
    genresCall();
  },[])
  const testing = () =>{
    fetchdatafromapi('/configuration').then((res) =>{
      // console.log(res);
      const url = {
        backdrop: res.images.secure_base_url + "original",
        poster: res.images.secure_base_url + "original",
        profile: res.images.secure_base_url + "original",
    };
      dispatch(getApiConfiguration(url));
    })
  }
  const genresCall = async () => {
    let promises = [];
    let endPoints = ["tv", "movie"];
    let allGenres = {};

    endPoints.forEach((url) => {
        promises.push(fetchdatafromapi(`/genre/${url}/list`));
    });

    const data = await Promise.all(promises);
    console.log(data);
    data.map(({ genres }) => {
        return genres.map((item) => (allGenres[item.id] = item));
    });

    dispatch(getGenres(allGenres));
};


  return (
    <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/:mediaType/:id" element={<Details />} />
                <Route path="/search/:query" element={<SearchResults />} />
                <Route path="/explore/:mediaType" element={<Explore />} />
                <Route path="*" element={<Pagenotfound />} />
            </Routes>
            <Footer />
    </BrowserRouter>
  )
}

export default App
