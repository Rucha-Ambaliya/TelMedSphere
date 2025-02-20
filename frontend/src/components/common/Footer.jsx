import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { footMenu, footSocial } from "../../data/footerData";
import { TfiAngleRight } from "react-icons/tfi";
import logo from "../../assets/header.png";
import commonContext from "../../contexts/common/commonContext";

const Footer = () => {
  const { toggleForm } = useContext(commonContext);
  const navigate = useNavigate();

  const handleClick = (menu) => {
    const usertype = localStorage.getItem("usertype");
    if (menu.requiresAuth && !usertype) {
      toggleForm(true);
      return;
    }
    navigate(menu.path);
  };

  const handleSocialClick = (item) => {
    if (item.external) {
      window.open(item.path, "_blank");
    } else {
      navigate(item.path);
    }
  };

  return (
    <footer
      id="footer"
      className="bg-gradient-to-br from-blue-1 to-blue-2 text-blue-8 py-12 mt-12"
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_repeat(2,1fr)] gap-12 justify-items-center">
          <div>
            <Link to="/">
              <img src={logo} alt="footer-logo" style={{ height: "50px" }} />
            </Link>
          </div>

          {footMenu.map((item) => {
            const { id, title, menu } = item;
            return (
              <div key={id} className="text-center md:text-left">
                <h4 className="font-bold text-lg mb-4">{title}</h4>
                <ul className="mt-6 grid gap-4 min-w-[200px]">
                  {menu.map((menuItem) => {
                    const { id, link, path } = menuItem;
                    return (
                      <li
                        key={id}
                        className="transition-all duration-300 ease-out"
                      >
                        <div className="flex items-center gap-2 hover:ml-2">
                          <TfiAngleRight className="text-sm text-opacity-80 " />
                          <span
                            onClick={() => handleClick(menuItem)}
                            className="text-sm opacity-80 hover:opacity-100 hover:underline hover:text-blue-500 transition-transform transform hover:translate-x-1 cursor-pointer"
                          >
                            {link}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="border-t border-opacity-70 mt-10"></div>

        <div className="flex flex-col-reverse md:flex-row items-center justify-between mt-8 gap-8">
          <p className="text-sm text-center md:text-left">
            <span className="opacity-80">
              {new Date().getFullYear()} @ TelMedSphere | All Rights Reserved
            </span>
          </p>
          <div className="flex gap-8 text-lg">
            {footSocial.map((item) => (
              <span
                key={item.id}
                onClick={() => handleSocialClick(item)}
                className={`cursor-pointer hover:text-blue-9 transition-transform transform hover:scale-110 ${item.cls}`}
              >
                {item.icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
