import { IconMenu4, IconMilitaryRank } from "@tabler/icons-react";
import ThemeController from "./ThemeToggler";
import Link from "next/link";
import ThemeToggler from "./ThemeToggler";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const handleLogout = async () => {
    toast.promise(axios.get("/api/auth/logout"), {
      loading: "Logging out...",
      success: () => {
        router.push("/");
        return "Logged out successfully";
      },
      error: "Error logging out",
    });
  };
  if (!user) return <Loading />;
  return (
    <div className="navbar bg-base-300 lg:px-10 h-5">
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
              {
                name: "Manage Soldiers",
                path: "/admin/manage-soldiers",
                icon: "👮",
              },
              {
                name: "Live Stream",
                path: "/admin/live-stream",
                icon: "📺",
              },
              {
                name: "Chat Bot",
                path: "/admin/chat-bot",
                icon: "💬",
              },
              {
                name: "Identify Threats",
                path: "/admin/identify-threats",
                icon: "⚠️",
              },
            ].map((item) => (
              <li key={item.name}>
                <Link href={item.path} className="btn btn-ghost">
                  {item.icon} {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <Link className="btn btn-ghost text-2xl" href="/admin/dashboard">
          <IconMilitaryRank className="inline" />
          RakshaVision
        </Link>
      </div>
      <div className="navbar-end gap-4">
        <ul className="menu menu-horizontal flex items-center space-x-4">
          <ThemeToggler />
          <div className="dropdown dropdown-left cursor-pointer bg-transparent">
            <img
              src={user.profileImage!}
              alt="Avatar"
              className="rounded-full h-12 w-12 object-cover border border-primary"
              role="button"
              tabIndex={0}
            />
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-72 p-2 shadow"
            >
              {/* User Initial */}
              <div className="flex items-center justify-center mb-2">
                <div className="flex items-center justify-center w-12 h-12 bg-primary text-base-conten rounded-full text-xl font-bold">
                  {user.name[0].toUpperCase()}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <span className="text-lg font-semibold text-base-content">
                  {user.name}
                </span>
              </div>
              <hr className="my-2 border-base-content" />
              <div className="flex flex-col">
                <Link
                  className="text-left px-4 py-2 text-base-content hover:bg-base-200 transition duration-200"
                  href={`/user/settings`}
                >
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-2 text-base-content text-dark hover:bg-base-200 transition duration-200"
                >
                  Logout
                </button>
              </div>
            </ul>
          </div>
        </ul>
      </div>
    </div>
  );
}
