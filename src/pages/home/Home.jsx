import React from 'react'
import './style.scss';
import HeeroBanner from './heeroBanner/HeeroBanner';
import Trending from './trending/Trending';
import Popular from './popular/Popular';
import TopRated from './toprated/TopRated';
const Home = () => {
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