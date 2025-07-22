import React, { useState, useRef } from 'react';
import "../App.css";
import { IoMdArrowRoundBack } from 'react-icons/io';

import { DNA } from 'react-loader-spinner';
import Markdown from 'react-markdown';
import { downloadBlog } from "../component/downloadBlog";

import { publishToWordpress } from "../component/PublishBlog";
import { FaRegCalendarAlt } from "react-icons/fa";
import remarkGfm from "remark-gfm";
import Sidebar from "../component/Sidebar";
import SubscriptionModal from '../component/SubscriptionModal';

const IMGBB_API_KEY = "18539e79130230a4a5139d566b0360cc";

const App = () => {
  const [screen, setScreen] = useState(1);
  const [text, setText] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const blogRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const dateInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageURL, setImageURL] = useState("");
   const [isPublishing, setIsPublishing] = useState(false);
  const [links, setLinks] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  async function generateBlogContent() {
    setLoading(true);
    setScreen(2);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/blog/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          topic: text,
          links: links.filter(link => link),
        }),
      });

      if (response.status === 403) {
        setShowModal(true);
        return;
      }

      const result = await response.json();
      let blogContent = result.content;

      if (imageURL) {
        const imageMarkdown = `\n\n![Uploaded Image](${imageURL})\n\n`;
        const lines = blogContent.split('\n');

        const introIndex = lines.findIndex(line =>
          line.trim().toLowerCase().startsWith("## introduction")
        );

        if (introIndex !== -1) {
          let insertIndex = lines.length;
          for (let i = introIndex + 1; i < lines.length; i++) {
            if (lines[i].trim().startsWith("## ")) {
              insertIndex = i;
              break;
            }
          }
          lines.splice(insertIndex, 0, imageMarkdown);
        } else {
          const titleIndex = lines.findIndex(line => line.startsWith("# "));
          lines.splice(titleIndex + 1, 0, imageMarkdown);
        }

        blogContent = lines.join('\n');
      }

      setData(blogContent);
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  const extractTitle = (markdown) => {
    const match = markdown.match(/^#\s*(.+)/m);
    return match ? match[1].trim() : "Untitled Post";
  };

  const scheduleBlog = async () => {
    if (!scheduledAt || isNaN(new Date(scheduledAt).getTime())) {
      alert("Please select a valid date and time to schedule.");
      return;
    }

    const istTime = new Date(scheduledAt);

    setIsPublishing(true);
    setScheduleSuccess(false);

    try {
      const title = extractTitle(data);
      const cleanedContent = (editedContent || data)
        .split('\n')
        .filter(line =>
          !line.toLowerCase().startsWith('**meta description') &&
          !line.toLowerCase().startsWith('**keywords') &&
          !line.toLowerCase().startsWith('**slug')
        )
        .join('\n');

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wordpress/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          markdown: cleanedContent,
          tags: ["ai", "blog", "seo"],
          scheduledAt: istTime.toISOString(),
          image: imageURL,
        }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData?.error || "Unknown error");

      setScheduleSuccess(true);
    } catch (err) {
      console.error("❌ Error scheduling blog:", err);
      alert("Failed to schedule blog");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        const formData = new FormData();
        formData.append("image", base64);

        try {
          const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (data?.data?.url) {
            setImageURL(data.data.url);
          } else {
            alert("Failed to upload image");
          }
        } catch (error) {
          console.error("Image upload failed:", error);
          alert("Image upload failed");
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert(`📄 File "${file.name}" uploaded successfully.`);
    }
  };

  const handleSaveBlog = async () => {
    const title = extractTitle(editedContent || data);
    const blogToSave = {
      title,
      content: editedContent || data,
      image: imageURL,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/saved/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(blogToSave),
      });


      const saved = await res.json();
      setSavedBlogs(prev => [...prev, saved]);
      alert("✅ Blog saved!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed");
    }
  };



  const handleLogout = () => {
    localStorage.removeItem("token"); // if you're using JWT
    window.location.href = "/login";
  };
  const handleViewBlog = (blog) => {
    setEditedContent(blog.content);
    setData(blog.content);
    setText(blog.title);
    setImageURL(blog.image || "");
    setScreen(2); // switch to output screen
  };


  const handleDeleteBlog = async (blogId) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSavedBlogs(prev => prev.filter(blog => blog._id !== blogId));
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert("Failed to delete blog");
    }
  };

 return (
    <>
      <div className="flex w-full min-h-screen bg-black text-white">

        {/* Mobile Sidebar Toggle Button */}
        <div className="sm:hidden fixed top-4 left-4 z-50">
          <button onClick={() => setSidebarOpen(true)}>
            <img src="../s1.jpg" alt="Toggle Sidebar" className="w-5 h-5" />
          </button>
        </div>

        {/* Overlay when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          blogs={savedBlogs}
          onSaveBlog={handleSaveBlog}
          onLogout={handleLogout}
          onViewBlog={handleViewBlog}
          onDeleteBlog={handleDeleteBlog}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Mobile Toggle Button */}
        <div className="sm:hidden fixed top-4 left-4 z-50">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <img src="../s1.jpg" alt="Toggle Sidebar" className="w-8 h-8" />
          </button>
        </div>

        {/* Backdrop on mobile */}
        {sidebarOpen && (
          <div
            className="sm:hidden fixed inset-0 bg-black opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}


        {/* Main Content */}
        <div className="flex flex-col sm:ml-72 w-full items-center justify-center">
          {screen === 1 ? (
            // ========== Input Screen ==========
            <div
              className="w-full min-h-screen flex items-center justify-center"
              style={{
                backgroundImage: `url('/b4.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="w-full min-h-screen bg-black bg-opacity-60 flex items-center justify-center px-4">
                <div className="flex flex-col items-center justify-center gap-6 w-full max-w-[600px] mx-auto">
                  <h1 className="text-green-400 text-5xl font-extrabold text-center drop-shadow-[0_0_4px_rgba(0,255,0,0.4)] mb-3">
                    AI <span className="text-green-400">Blog Generator</span>
                  </h1>

                  <form
                    className="bg-[#1f1f1f] bg-opacity-90 rounded-xl px-4 py-4 flex flex-col items-center w-full gap-3 shadow-xl"
                    onSubmit={(e) => {
                      e.preventDefault();
                      generateBlogContent();
                    }}
                    encType="multipart/form-data"
                  >
                    <textarea
                      placeholder="Ask anything"
                      className="w-full text-white bg-transparent placeholder-gray-400 focus:outline-none resize-none min-h-[60px] max-h-[200px] overflow-hidden break-words whitespace-pre-wrap"
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      required
                    />

                    {/* Reference Links */}
                    {links.map((link, index) => (
                      <div key={index} className="w-full flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Reference Link #${index + 1}`}
                          className="flex-1 text-white bg-[#2e2e2e] px-3 py-2 rounded-md placeholder-gray-400 focus:outline-none"
                          value={link}
                          onChange={(e) => {
                            const updatedLinks = [...links];
                            updatedLinks[index] = e.target.value;
                            setLinks(updatedLinks);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedLinks = [...links];
                            updatedLinks.splice(index, 1);
                            setLinks(updatedLinks);
                          }}
                          className="text-red-500 text-lg hover:text-red-700 transition"
                          title="Remove Link"
                        >
                          ❌
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setLinks([...links, ""])}
                      className="self-start bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                    >
                      Add Link
                    </button>

                    {/* File Upload and Submit */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-between mt-3">
                      <input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, setSelectedFile, setImageURL)
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("fileInput").click()
                        }
                        className="bg-[#2e2e2e] text-white px-4 py-1.5 rounded-lg hover:bg-[#3a3a3a] w-full sm:w-auto text-sm"
                      >
                        📎 Attach
                      </button>

                      <button
                        type="submit"
                        className="bg-white text-black px-4 py-1.5 rounded-full text-base font-semibold hover:bg-gray-200 w-full sm:w-auto"
                      >
                        Submit
                      </button>
                    </div>
                  </form>

                  {/* File Preview */}
                  {selectedFile && (
                    <div className="text-white text-sm px-4 text-center">
                      <p>
                        Attached: <strong>{selectedFile.name}</strong>
                        {selectedFile.type.startsWith("image/") ? " 🖼️" : " 📄"}
                      </p>
                      {selectedFile.type.startsWith("image/") && imageURL && (
                        <div className="flex justify-center">
                          <img
                            src={imageURL}
                            alt="Preview"
                            className="mt-2 w-full max-w-[300px] h-auto rounded-lg object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // ===== Output Screen =====
           <div className="p-6 pl-12">

              <p className="font-bold text-[20px] mb-7 flex items-center gap-[10px]">
                <i
                  onClick={() => setScreen(1)}
                  className="cursor-pointer flex flex-col items-center justify-center w-[40px] h-[40px] rounded-[50%] transition-all duration-300 hover:bg-zinc-800"
                >
                  <IoMdArrowRoundBack />
                </i>{' '}
                Output:
              </p>

              <div
                id="markdown-content"
                ref={blogRef}
                className="markdown-body bg-white text-black p-6 rounded-xl mb-6"
              >
                {editMode ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full min-h-[400px] p-4 bg-black border border-gray-600 text-white rounded-md"
                  />
                ) : (
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ node, ...props }) => {
                        if (!props.src || props.src.trim() === '') return null;
                        return (
                          <img
                            {...props}
                            alt={props.alt || 'Image'}
                            className="rounded-xl my-4 mx-auto"
                            style={{ display: 'block', width: '500px', height: 'auto' }}
                          />
                        );
                      },
                    }}
                  >
                    {editedContent || data}
                  </Markdown>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 flex-wrap items-center mt-6">
                <button
                  onClick={generateBlogContent}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-5 py-2 rounded-xl shadow-md"
                >
                  🔄 Re-Generate
                </button>

                <select
                  className="border px-4 py-2 rounded-xl text-black bg-white shadow-sm"
                  onChange={(e) => setDownloadFormat(e.target.value)}
                >
                  <option value="pdf">PDF</option>
                  <option value="word">Word</option>
                </select>

                <button
                  onClick={() =>
                    downloadBlog({
                      content: editedContent || data,
                      title: text,
                      format: downloadFormat,
                      image: imageURL,
                    })
                  }
                  disabled={!data}
                  className={`px-5 py-2 rounded-xl font-semibold shadow-md ${data
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                >
                  ⬇️ Download
                </button>

                <button
                  onClick={() =>
                    publishToWordpress({ data, editedContent, imageURL, setIsPublishing })
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md"
                >
                  🚀 Publish to WordPress
                </button>

                <button
                  onClick={() => {
                    if (editMode) setData(editedContent);
                    else setEditedContent(data);
                    setEditMode(!editMode);
                  }}
                  className={`px-5 py-2 rounded-xl font-semibold shadow-md ${editMode
                    ? 'bg-green-800 text-white hover:bg-green-900'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                >
                  ✏️ {editMode ? 'Save' : 'Edit Blog'}
                </button>

                {/* Schedule Blog */}
                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    ref={dateInputRef}
                    className="hidden"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />

                  <FaRegCalendarAlt
                    className="text-white text-2xl cursor-pointer hover:text-purple-400 transition"
                    onClick={() => dateInputRef.current.showPicker()}
                    title="Pick Date & Time"
                  />

                  {scheduledAt && (
                    <span className="text-white font-medium">
                      {new Date(scheduledAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  )}

                  <button
                    onClick={scheduleBlog}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md"
                  >
                    🗓️ Schedule Blog
                  </button>

                  {scheduleSuccess && (
                    <p className="text-green-500 font-semibold mt-2">
                      ✅ Blog scheduled successfully!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Spinner */}
          {loading && (
            <div className="fixed top-0 left-0 w-full h-screen bg-black z-[1000] flex items-center justify-center">
              <DNA visible={true} height={120} width={120} />
            </div>
          )}

          {showModal && (
            <SubscriptionModal onClose={() => setShowModal(false)} />
          )}

        </div>
      </div>
    </>
  );
};

export default App;

