import React from "react";
import {
  ProfileOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Flex, Menu } from "antd";
import type { MenuProps } from "antd";
import { IoGameController } from "react-icons/io5";
import "../styles/sidebar.css"
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();


  const handleLogOut = async () => {
    await logout();
    navigate("/"); // return them to the login
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "1",
      icon: <ProfileOutlined />,
      label: "Home",
      onClick: () => navigate("/home"),
    },
    {
      key: "2",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogOut,
    },
  ];

  return (
    <>
      <Flex align="center" justify="center">
        <div className="logo">
          <IoGameController size={40} color="black" />
        </div>
      </Flex>

      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        className="menu-bar"
        items={menuItems}
      />
    </>
  );
};

export default Sidebar;
