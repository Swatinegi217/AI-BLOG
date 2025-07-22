// Sidebar.jsx
import React from "react";
import { FaTrashAlt, FaEye, FaSave } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

const Sidebar = ({ blogs, onSaveBlog, onLogout, onViewBlog, onDeleteBlog, sidebarOpen, setSidebarOpen }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-screen w-72 bg-[#111] text-white p-5 shadow-lg z-40 overflow-y-auto transform transition-transform duration-300 ease-in-out sm:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:block`}
    >

      <h2 className="text-green-400 text-xl font-bold mb-5 flex justify-center items-center gap-2">
  <span className="text-2xl"></span> My Blogs
</h2>


      {blogs.length === 0 ? (
        <p className="text-sm text-gray-400">No blogs found.</p>
      ) : (
        blogs.map((blog, index) => (
          <div
            key={index}
            className="bg-[#2e2e2e] rounded-lg p-3 mb-4 shadow-md"
          >
            <h3 className="text-base font-semibold text-green-300 mb-1">
              {blog.title}
            </h3>
            <p className="text-xs text-gray-400 mb-2">
              saved | {new Date(blog.date).toLocaleString()}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => onViewBlog(blog)}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                <FaEye className="inline mr-1" />
                View
              </button>
              <button
                onClick={() => onDeleteBlog(blog._id)}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                <FaTrashAlt className="inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      <div className="mt-8 flex flex-col gap-4">
        <button
          onClick={onSaveBlog}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
        >
          <FaSave />
          Save Blog
        </button>

        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
        >
          <MdLogout />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
