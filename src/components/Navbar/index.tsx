import { IconMenu4, IconMilitaryRank } from "@tabler/icons-react";
import ThemeController from "./ThemeToggler";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar bg-base-300 lg:px-10">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <IconMenu4 className="inline" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {[
              { name: "About Us", link: "/about" },
              { name: "Features", link: "/features" },
              { name: "Contact Us", link: "/contact" },
            ].map((item) => (
              <li key={item.name}>
                <Link href={item.link} className="btn btn-ghost text-base">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <a className="btn btn-ghost text-2xl" href="/">
          <IconMilitaryRank className="inline" />
          RakshaVision
        </a>
      </div>
      <div className="navbar-end gap-4">
        <ThemeController />
        <Link href={"/login"} className="btn btn-primary">
          Login
        </Link>
        <Link href={"/signup"} className="btn btn-secondary">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
