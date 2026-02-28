import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {fetchdatafromapi} from './utils/api';
import logger from './utils/logger';
import { useSelector, useDispatch } from 'react-redux'
import { getApiConfiguration,getGenres } from './store/homeSlice';

import Header from './component/header/Header'
import Footer from './component/footer/Footer'
import Spinner from './component/spin/Spinner'
import ErrorBoundary from './component/errorBoundary/ErrorBoundary'

const Home = lazy(() => import('./pages/home/Home'))
const SearchResults = lazy(() => import('./pages/seearchResult/SearchResult'))
const Explore = lazy(() => import('./pages/explore/Explore'))
const Details = lazy(() => import('./pages/details/Details'))
const Pagenotfound = lazy(() => import('./pages/404/Pagenotfound'))

function App() {
  const dispatch = useDispatch()
  const { url } = useSelector((state) => state.home);

  useEffect(()=>{
    fetchApiConfig();
    genresCall();
  },[])

  const fetchApiConfig = () =>{
    fetchdatafromapi('/configuration').then((res) =>{
      const url = {
        backdrop: res.images.secure_base_url + "original",
        poster: res.images.secure_base_url + "original",
        profile: res.images.secure_base_url + "original",
      };
      dispatch(getApiConfiguration(url));
    }).catch((err) => {
      logger.error("Failed to fetch API configuration:", err);
    });
  }

  const genresCall = async () => {
    let promises = [];
    let endPoints = ["tv", "movie"];
    let allGenres = {};

    endPoints.forEach((url) => {
        promises.push(fetchdatafromapi(`/genre/${url}/list`));
    });

    try {
      const data = await Promise.all(promises);
      data.map(({ genres }) => {
          return genres.map((item) => (allGenres[item.id] = item));
      });
      dispatch(getGenres(allGenres));
    } catch (err) {
      logger.error("Failed to fetch genres:", err);
    }
  };

  return (
    <BrowserRouter>
            <Header />
            <ErrorBoundary>
              <Suspense fallback={<Spinner initial={true} />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/:mediaType/:id" element={<Details />} />
                    <Route path="/search/:query" element={<SearchResults />} />
                    <Route path="/explore/:mediaType" element={<Explore />} />
                    <Route path="*" element={<Pagenotfound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Footer />
    </BrowserRouter>
  )
}

export default App
