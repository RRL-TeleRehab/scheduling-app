import React from "react";
import { Link } from "react-router-dom";

const SideBarItem = ({ link, title, faIcon, selected }) => {
  const itemClassList =
    link === selected ? "sidebar-item active" : "sidebar-item";
  const itemClassLink =
    link === selected
      ? "sidebar-item active pt-2 pb-2 ml-3"
      : "sidebar-link pt-2 pb-2";
  const itemClassFontAwesome = link === selected ? "" : "ml-3";
  return (
    <li className={itemClassList}>
      <Link to={link} className={itemClassLink}>
        {title}
      </Link>
    </li>
  );
};

export default SideBarItem;
