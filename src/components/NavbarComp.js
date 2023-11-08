import { polygon } from "@wagmi/chains";
import { useWeb3Modal } from "@web3modal/react";
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import React, { useState } from "react";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";

export default function NavbarComp(args) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const { open, setDefaultChain } = useWeb3Modal();

  const connect = async () => {
    await open();
    setDefaultChain(polygon);
  };

  const { address } = useAccount();

  return (
    <div div className="header">
      <Navbar
        {...args}
        id="navbar"
        color="transparency"
        className="custom-navbar"
        expand="md"
      >
        <div className=" d-flex justify-content-center align-items-center">
          <Link to="/">
            {" "}
            <NavbarBrand href="/">
              {" "}
              <img alt="LUM" className="logo" src="image/logo.png" />{" "}
            </NavbarBrand>
          </Link>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="me-auto nav-items" navbar>
              <NavItem>
                <NavLink href="https://ai.luminai.ai">Academy</NavLink>
              </NavItem>
              <NavItem className="">
                <NavLink href="https://news.luminai.ai">News</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </div>
        <Button
          color="primary"
          className="nav-button ml-auto connect-btn"
          onClick={connect}
        >
          {!address
            ? "Connect"
            : address?.replace(address?.slice(6, 38), "...")}
        </Button>
      </Navbar>
    </div>
  );
}

/*  


<div>
      <Navbar {...args}>
        <NavbarBrand href="/">reactstrap</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            <NavItem>
              <NavLink href="/components/">Components</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="https://github.com/reactstrap/reactstrap">
                GitHub
              </NavLink>
            </NavItem>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Options
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>Option 1</DropdownItem>
                <DropdownItem>Option 2</DropdownItem>
                <DropdownItem divider />
                <DropdownItem>Reset</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
          <NavbarText>Simple Text</NavbarText>
        </Collapse>
      </Navbar>
    </div>

 







*/
