import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import commonContext from '../../contexts/common/commonContext';
import AccountForm from '../form/Accountform';
import cartContext from '../../contexts/cart/cartContext';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import useOutsideClose from '../../hooks/useOutsideClose';
import httpClient from '../../httpClient';
import { RiFileList3Line } from "react-icons/ri";
import Profile from './Profile';
import { FiMail, FiPhoneCall } from "react-icons/fi";
import { CiMenuFries } from "react-icons/ci";
import { MdClose } from "react-icons/md";
import { IoWalletOutline } from "react-icons/io5";
import logo from "../../assets/header.png";

const Header = () => {
    const { toggleForm, userLogout, toggleProfile } = useContext(commonContext);
    const { cartItems, setCartItems } = useContext(cartContext);
    const [isSticky, setIsSticky] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const curPath = location.pathname;
    const [showDropdown, setShowDropdown] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const windowWidth = window.innerWidth;
    const [isSideBarOpen, setSideBarOpen] = useState(false);

    // handle the sticky-header
    useEffect(() => {
        const handleIsSticky = () => window.scrollY >= 50 ? setIsSticky(true) : setIsSticky(false);
        const handleIsScrolled = () => window.scrollY >= 1 ? setIsScrolled(true) : setIsScrolled(false);

        window.addEventListener('scroll', handleIsSticky);
        window.addEventListener('scroll', handleIsScrolled);

        return () => {
            window.removeEventListener('scroll', handleIsSticky);
            window.removeEventListener('scroll', handleIsScrolled);
        };
    }, [isSticky, isScrolled]);

    const updatestatus = () => {
        httpClient.put('/doc_status', { "email": localStorage.getItem("email") });
        userLogout();
    }

    useEffect(() => {
        if (localStorage.getItem("email") && localStorage.getItem("email") !== "undefined") {
            httpClient.post('/get_cart', { "email": localStorage.getItem("email") })
                .then((res) => {
                    setCartItems(res.data.cart);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [localStorage.getItem("email")]);

    const dropdownRef = useRef();
    const sidebarRef = useRef();

    useOutsideClose(dropdownRef, () => setShowDropdown(false));
    useOutsideClose(sidebarRef, () => setSideBarOpen(false));

    return (
        <>
            {(localStorage.getItem("username") && localStorage.getItem("username") !== "undefined") && localStorage.getItem("usertype") === "patient" &&
                <div className={`flex justify-between items-center px-4 lg:px-40 py-4 border-b border-blue-800 transition-all duration-300 ${isScrolled ? 'h-0 opacity-0 invisible p-0' : 'h-full opacity-100 visible'}`}>
                    <div className="flex items-center flex-wrap text-gray-600">
                        <Link to="/" className="flex items-center hover:text-gray-800 transition-colors duration-300 mr-5 xs:mr-0">
                            <FiMail className="mr-1 text-sm leading-6" />
                            <p className="text-sm leading-6">telmedsphere489@gmail.com</p>
                        </Link>
                        <Link to="/" className="flex items-center hover:text-gray-800 transition-colors duration-300">
                            <FiPhoneCall className="mr-1 text-sm leading-6" />
                            <p className="text-sm leading-6">+91 12345 67890</p>
                        </Link>
                    </div>
                    <div>
                        <Link to="/doctors" className="text-blue-500 font-bold hover:text-blue-700 transition-colors duration-300">
                            Appointment
                        </Link>
                    </div>
                </div>
            }

            <header className={`relative w-full text-blue-800 py-6 transition-colors duration-200 ${isSticky ? 'sticky top-0 left-0 z-50 bg-blue-100' : ''}`}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <h2 className="flex items-center justify-center">
                            <Link to="/" className="hover:text-blue-900">
                                <img src={logo} alt="" className="max-h-12 w-auto object-contain" />
                            </Link>
                        </h2>

                        {(localStorage.getItem("username") !== null && localStorage.getItem("username") !== undefined) ?
                            windowWidth >= 800 ? (
                                <nav className="flex items-center gap-12 text-2xl">
                                    <div className={`relative cursor-pointer ${curPath === "/home" ? "text-blue-900" : ""}`}>
                                        <span className="text-xs font-bold hover:text-blue-900 transition-colors duration-300" 
                                              onClick={() => navigate("/home")}>
                                            HOME
                                        </span>
                                        {curPath === "/home" && 
                                            <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 h-0.5 w-full bg-blue-900" />
                                        }
                                    </div>

                                    {localStorage.getItem("usertype") === "patient" &&
                                        <div className={`relative cursor-pointer ${curPath === "/doctors" ? "text-blue-900" : ""}`}>
                                            <span className="text-xs font-bold hover:text-blue-900 transition-colors duration-300" 
                                                  onClick={() => navigate("/doctors")}>
                                                DOCTORS
                                            </span>
                                            {curPath === "/doctors" && 
                                                <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 h-0.5 w-full bg-blue-900" />
                                            }
                                        </div>
                                    }

                                    <div className={`relative cursor-pointer ${curPath === "/disease-prediction" ? "text-blue-900" : ""}`}>
                                        <span className="text-xs font-bold hover:text-blue-900 transition-colors duration-300" 
                                              onClick={() => navigate("/disease-prediction")}>
                                            MODEL
                                        </span>
                                        {curPath === "/disease-prediction" && 
                                            <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 h-0.5 w-full bg-blue-900" />
                                        }
                                    </div>

                                    <div className={`relative cursor-pointer ${curPath === "/buy-medicines" ? "text-blue-900" : ""}`}>
                                        <span className="text-xs font-bold hover:text-blue-900 transition-colors duration-300" 
                                              onClick={() => navigate("/buy-medicines")}>
                                            MEDICINES
                                            <span className="absolute -right-10 top-0 flex items-center justify-center w-12 h-5 bg-blue-800 rounded-full text-xs text-white">
                                                20% off
                                            </span>
                                        </span>
                                        {curPath === "/buy-medicines" && 
                                            <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 h-0.5 w-full bg-blue-900" />
                                        }
                                    </div>

                                    <div className="relative">
                                        <span className="text-xs font-bold hover:text-blue-900 transition-colors duration-300 cursor-pointer" 
                                              onClick={() => setShowDropdown(!showDropdown)}>
                                            ACCOUNT
                                        </span>
                                        <div className={`absolute top-12 right-0 w-70 bg-blue-600 p-6 text-sm rounded border border-gray-300 transition-all duration-200 ${showDropdown ? 'visible opacity-100' : 'invisible opacity-0'}`} 
                                             ref={dropdownRef}>
                                            <h4 className="font-semibold tracking-wide text-gray-100">
                                                Hello! {localStorage.getItem("username") !== undefined && 
                                                <span className="text-blue-200 opacity-95 hover:opacity-100">&nbsp;{localStorage.getItem("username")}</span>}
                                            </h4>
                                            <p className="text-sm mt-2 text-gray-100">Have a great health!!</p>
                                            <div className="flex gap-2 mt-4">
                                                <button className="px-4 py-3 rounded bg-blue-300 text-blue-100 border border-blue-300 hover:bg-blue-500 hover:border-blue-500 transition-all duration-300"
                                                        onClick={() => {
                                                            setShowDropdown(false);
                                                            toggleProfile(true);
                                                        }}>
                                                    Profile
                                                </button>
                                                <button className="px-4 py-3 rounded border border-gray-200 text-gray-100 hover:bg-blue-300 hover:text-blue-100 hover:border-blue-300 transition-all duration-300"
                                                        onClick={() => {
                                                            setShowDropdown(false);
                                                            localStorage.getItem("usertype") === "doctor" ? updatestatus() : userLogout();
                                                            navigate("/");
                                                        }}>
                                                    Logout
                                                </button>
                                            </div>
                                            <hr className="my-4 border-gray-300" />
                                            <ul className="space-y-3">
                                                <li className="flex items-center">
                                                    <IoWalletOutline className="text-2xl" />
                                                    <Link to="/my-wallet" 
                                                          onClick={() => setShowDropdown(false)}
                                                          className="ml-2 text-blue-100 hover:text-white hover:underline">
                                                        My Wallet
                                                    </Link>
                                                </li>
                                                <li className="flex items-center">
                                                    <AiOutlineShoppingCart className="text-2xl" />
                                                    <Link to="/my-cart" 
                                                          onClick={() => setShowDropdown(false)}
                                                          className="ml-2 text-blue-100 hover:text-white hover:underline">
                                                        My Cart
                                                    </Link>
                                                    <span className="ml-2 px-2 py-1 bg-blue-300 text-white text-xs rounded">
                                                        {cartItems.length}
                                                    </span>
                                                </li>
                                                <li className="flex items-center">
                                                    <RiFileList3Line className="text-2xl" />
                                                    <Link to="/my-orders" 
                                                          onClick={() => setShowDropdown(false)}
                                                          className="ml-2 text-blue-100 hover:text-white hover:underline">
                                                        My Orders
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </nav>
                            ) : (
                                <div className="relative" ref={sidebarRef}>
                                    <div className="text-2xl cursor-pointer font-bold" 
                                         onClick={() => setSideBarOpen(prev => !prev)}>
                                        {isSideBarOpen ? <MdClose /> : <CiMenuFries />}
                                    </div>
                                    <div className={`transition-all duration-300 ${isSideBarOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                                        <nav className="absolute top-8 right-0 flex flex-col gap-6 bg-blue-100 p-4 rounded-lg z-50">
                                            {/* Mobile menu items - same structure as desktop but with adjusted styling */}
                                            {/* Copy the nav items from above and adjust their styling for mobile */}
                                        </nav>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <button onClick={toggleForm}
                                            className="px-4 py-3 rounded bg-blue-400 text-white hover:bg-blue-500 transition-colors duration-300">
                                        Login
                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </header>

            <AccountForm />
            <Profile />
        </>
    );
};

export default Header;