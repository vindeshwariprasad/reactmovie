
import React, { useState, useEffect, useCallback } from "react";
import './headeer.scss'

import { HiOutlineSearch } from "react-icons/hi";
import { SlMenu } from "react-icons/sl";
import { VscChromeClose } from "react-icons/vsc";
import { useNavigate, useLocation } from "react-router-dom";



import ContentWrapper from '../contentwrapper/ContentWrapper';
import logo from "../../assets/movix-logo.svg";
const Header = () => {
  const [show, setShow] = useState("top");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
}, [location]);

  const controlNavbar = useCallback(() => {
    if (window.scrollY > 200) {
        if (window.scrollY > lastScrollY && !mobileMenu) {
            setShow("hide");
        } else {
            setShow("show");
        }
    } else {
        setShow("top");
    }
    setLastScrollY(window.scrollY);
  }, [lastScrollY, mobileMenu]);

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => {
        window.removeEventListener("scroll", controlNavbar);
    };
  }, [controlNavbar]);

  const searchQueryHandler = useCallback((event) => {
    if (event.key === "Enter" && query.length > 0) {
        navigate(`/search/${query}`);
        setTimeout(() => {
            setShowSearch(false);
        }, 1000);
    }
  }, [query, navigate]);

  const openSearch = useCallback(() => {
    setMobileMenu(false);
    setShowSearch(true);
  }, []);

  const openMobileMenu = useCallback(() => {
    setMobileMenu(true);
    setShowSearch(false);
  }, []);

  const navigationHandler = useCallback((type) => {
    if (type === "movie") {
        navigate("/explore/movie");
    } else {
        navigate("/explore/tv");
    }
    setMobileMenu(false);
  }, [navigate]);


  return (
      <header className={`header ${mobileMenu ? "mobileView" : ""} ${show}`} role="banner">
        <ContentWrapper>
          <div
            className="logo"
            onClick={() => navigate("/")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/")}
            role="link"
            tabIndex={0}
          >
                    <img src={logo} alt="Movix home" />
          </div>
          <nav>
            <ul className="menuItems" role="menubar">
                    <li
                        className="menuItem"
                        onClick={() => navigationHandler("movie")}
                        onKeyDown={(e) => e.key === "Enter" && navigationHandler("movie")}
                        role="menuitem"
                        tabIndex={0}
                    >
                        Movies
                    </li>
                    <li
                        className="menuItem"
                        onClick={() => navigationHandler("tv")}
                        onKeyDown={(e) => e.key === "Enter" && navigationHandler("tv")}
                        role="menuitem"
                        tabIndex={0}
                    >
                        TV Shows
                    </li>
                    <li className="menuItem">
                        <button
                            onClick={openSearch}
                            aria-label="Open search"
                            className="searchBtn"
                        >
                            <HiOutlineSearch />
                        </button>
                    </li>
            </ul>
          </nav>
          <div className="mobileMenuItems">
                    <button onClick={openSearch} aria-label="Open search" className="searchBtn">
                        <HiOutlineSearch />
                    </button>
                    {mobileMenu ? (
                        <button onClick={() => setMobileMenu(false)} aria-label="Close menu" className="menuBtn">
                            <VscChromeClose />
                        </button>
                    ) : (
                        <button onClick={openMobileMenu} aria-label="Open menu" className="menuBtn">
                            <SlMenu />
                        </button>
                    )}
          </div>
        </ContentWrapper>
        {showSearch && (
                <div className="searchBar">
                    <ContentWrapper>
                        <div className="searchInput">
                            <input
                                type="text"
                                placeholder="Search for a movie or tv show...."
                                aria-label="Search for a movie or tv show"
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyUp={searchQueryHandler}
                                autoFocus
                            />
                            <button
                                onClick={() => setShowSearch(false)}
                                aria-label="Close search"
                                className="closeBtn"
                            >
                                <VscChromeClose />
                            </button>
                        </div>
                    </ContentWrapper>
                </div>
            )}
      </header>
  );
};

export default Header;
