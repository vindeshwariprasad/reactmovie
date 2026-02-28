import React from 'react'
import './style.scss';
import HeeroBanner from './heeroBanner/HeeroBanner';
import Trending from './trending/Trending';
import Popular from './popular/Popular';
import TopRated from './toprated/TopRated';
import usePageMeta from '../../hooks/usePageMeta';

const Home = () => {
  usePageMeta(null, "Discover millions of movies and TV shows. Explore trending, top rated, and popular content.");
  return (
    <div className="homePage">
      <HeeroBanner></HeeroBanner>
      <Trending></Trending>
      <Popular></Popular>
      <TopRated></TopRated>
    </div>
  )
}

export default Home