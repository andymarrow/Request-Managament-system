"use client";

import { usePathname } from "next/navigation";

export const NavbarRoutes = () => {
    const pathname = usePathname();

    // Extract the current page from the pathname
    const currentPage = pathname.split("/").pop(); // Remove leading slash

    return (
        <div className="flex justify-between items-center space-y-10 ">
            {/* Display the current page on the far left */}
            <div className="text-lg font-bold text-gray-700 hidden md:block">
                {currentPage || "Home"}
            </div>

            {/* Glowing search bar on the far right */}
            <div className="absolute right-2 -top-4">
                <input
                    type="text"
                    placeholder="Search..."
                    className="px-10 py-2 md:px-20 rounded-full shadow-md border-none focus:outline-none bg-white text-gray-700 placeholder-gray-400 focus:shadow-lg transition-shadow"
                    style={{
                        boxShadow: "0 0 10px rgba(0, 123, 255, 0.5)"
                       
                    }}
                />
                <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                    />
                </svg>
               
           </div>
           <div className="ml-5 pb-10">
            <a href="/settings">
                    <span >🔔 <span className="text-green ml-1">5</span></span>
            </a>
           </div>
          
           
        </div>
    );
};
