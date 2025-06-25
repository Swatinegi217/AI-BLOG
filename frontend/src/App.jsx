import React, { useState, useRef } from 'react';
import "./App.css";
import { IoMdArrowRoundBack } from 'react-icons/io';
import { GoogleGenAI } from "@google/genai";
import { DNA } from 'react-loader-spinner';
import Markdown from 'react-markdown';
import { downloadBlog } from './component/downloadBlog';
import { publishToDevto } from "./component/PublishBlog";
import { FaRegCalendarAlt } from "react-icons/fa";
import remarkGfm from "remark-gfm"; 
const backendURL = import.meta.env.VITE_BACKEND_URL;


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





  const ai = new GoogleGenAI({ apiKey: "AIzaSyATJ_H0Y-45tIQo62Aise4ICzLJWeawJto" });

  async function genearteBlogContent() {
    setLoading(true);
    setScreen(2);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `
        You are an expert SEO blog writer and AI content strategist.
        Write a complete blog post on the topic: ${text}.
        Use these reference links (if helpful): ${links.filter(link => link).join(', ')}.
        Return the blog in Markdown format...
       
        ✅ Title (h1)
        ✅ Meta Description (160 char)
        ✅ Keywords (comma-separated)
        ✅ Slug (URL-friendly)
        ✅ Introduction
        ✅ At least 3 Subheadings (##) 
        ✅ Conclusion with CTA
        ✅ Hashtags (e.g., #ai #seo #blog)
        ✅ No JSON or HTML, only Markdown
      `
      });

      let blogContent = response.text;

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
    }
    setLoading(false);
  }

  const extractTitle = (markdown) => {
    const match = markdown.match(/^#\s*(.+)/m);
    return match ? match[1].trim() : "Untitled Post";
  };



  const scheduleBlog = async () => {
  if (!scheduledAt) {
    alert("Please select a date and time to schedule.");
    return;
  }

  setIsPublishing(true);
  setScheduleSuccess(false);

  try {
    const title = extractTitle(data);

    // ✅ Remove meta description, keywords, slug
    const cleanedContent = (editedContent || data)
      .split('\n')
      .filter(line =>
        !line.toLowerCase().startsWith('**meta description') &&
        !line.toLowerCase().startsWith('**keywords') &&
        !line.toLowerCase().startsWith('**slug')
      )
      .join('\n');

    const response = await fetch("http://localhost:5000/api/devto/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        markdown: cleanedContent,
        tags: ["ai", "blog", "seo"],
        scheduledAt,
        image: imageURL
      })
    });

    const resData = await response.json();
    console.log("✅ Blog scheduled:", resData);
    setScheduleSuccess(true);
    // Optional: setTimeout(() => setScheduleSuccess(false), 3000);
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
      // Upload to ImgBB
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
            console.log("✅ ImgBB URL:", data.data.url);
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
      // Non-image file (e.g., .txt, .docx, .pdf, etc.)
      alert(`📄 File "${file.name}" uploaded successfully.`);
    }
  };

  return (
    <>
      {screen === 1 ? (
        <div className="w-full min-h-screen flex items-center justify-center"
          style={{
            backgroundImage: `url('/b4.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}>
          <div className="w-full min-h-screen bg-black bg-opacity-60 flex items-center justify-center px-4">
            <div className="flex flex-col items-center justify-center gap-6 w-full max-w-[800px]">
              <h1 className="text-green-400 text-5xl font-extrabold text-center drop-shadow-[0_0_4px_rgba(0,255,0,0.4)] mb-3">
                AI <span className="text-green-400">Blog Generator</span>
              </h1>

              <form
                className="bg-[#1f1f1f] bg-opacity-90 rounded-xl px-4 py-4 flex flex-col items-center w-full gap-3 shadow-xl"
                onSubmit={(e) => {
                  e.preventDefault();
                  genearteBlogContent();
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
                    >❌</button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setLinks([...links, ""])}
                  className="self-start bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                >
                  Add Link
                </button>

                <div className="flex flex-col sm:flex-row gap-3 w-full justify-between mt-3">
                  <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setSelectedFile, setImageURL)}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('fileInput').click()}
                    className="bg-[#2e2e2e] text-white px-4 py-1.5 rounded-lg hover:bg-[#3a3a3a] w-full sm:w-auto text-sm"
                  >📎 Attach</button>

                  <button
                    type="submit"
                    className="bg-white text-black px-4 py-1.5 rounded-full text-base font-semibold hover:bg-gray-200 w-full sm:w-auto"
                  >Submit</button>
                </div>
              </form>

              {selectedFile && (
                <div className="text-white text-sm px-4 text-center">
                  <p>
                    Attached: <strong>{selectedFile.name}</strong>
                    {selectedFile.type.startsWith("image/") ? " 🖼️" : " 📄"}
                  </p>
                  {selectedFile.type.startsWith("image/") && imageURL && (
                    <div className="flex justify-center">
                      <img src={imageURL} alt="Preview"
                        className="mt-2 w-full max-w-[300px] h-auto rounded-lg object-contain" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className='font-bold text-[20px] mb-7 flex items-center gap-[10px]'>
            <i onClick={() => setScreen(1)} className='cursor-pointer flex flex-col items-center justify-center w-[40px] h-[40px] rounded-[50%] transition-all duration-300 hover:bg-zinc-800'>
              <IoMdArrowRoundBack />
            </i> Output:
          </p>

          <div id="markdown-content" ref={blogRef} className="markdown-body bg-white text-black p-6 rounded-xl mb-6">
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
                    if (!props.src || props.src.trim() === "") return null;
                    return (
                      <img
                        {...props}
                        alt={props.alt || "Image"}
                        className="rounded-xl my-4 mx-auto"
                        style={{ display: "block", width: "500px", height: "auto" }}
                      />
                    );
                  },
                }}
              >
                {editedContent || data}
              </Markdown>
            )}
          </div>

          <div className="flex gap-4 flex-wrap items-center mt-6">
            <button onClick={genearteBlogContent}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-5 py-2 rounded-xl shadow-md hover:from-yellow-500 hover:to-yellow-700 transition duration-300">🔄 Re-Generate</button>

            <select
              className="border px-4 py-2 rounded-xl text-black bg-white shadow-sm focus:ring-2 focus:ring-yellow-400"
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
              className={`px-5 py-2 rounded-xl font-semibold transition duration-300 shadow-md ${data
                ? "bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800"
                : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >⬇️ Download</button>

            <button
              onClick={() =>
                publishToDevto({
                  data,
                  editedContent,
                  imageURL,
                  setIsPublishing
                })
              }
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md hover:from-blue-600 hover:to-blue-800 transition duration-300"
            >🚀 Publish to Dev.to</button>

            {isPublishing && (
              <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
                <div className="bg-white px-8 py-6 rounded-xl shadow-xl text-center w-[300px]">
                  <p className="text-2xl mb-2">🚀</p>
                  <p className="text-gray-600 text-lg">Please wait a moment</p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (editMode) setData(editedContent);
                else setEditedContent(data);
                setEditMode(!editMode);
              }}
              className={`px-5 py-2 rounded-xl font-semibold shadow-md transition duration-300 ${editMode
                ? "bg-gradient-to-r from-green-700 to-green-900 text-white hover:from-green-800 hover:to-green-950"
                : "bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800"
                }`}
            >✏️ {editMode ? "Save" : "Edit Blog"}</button>

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
              />
              <button
                onClick={scheduleBlog}
                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md hover:from-purple-600 hover:to-purple-800 transition duration-300"
              >🗓️ Schedule Blog</button>

              
            </div>
          </div>
        </div>
      )}

      {/* ✅ Spinner at the bottom */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-screen bg-black z-[1000] flex items-center justify-center">
          <DNA
            visible={true}
            height={120}
            width={120}
            ariaLabel="dna-loading"
            wrapperClass="dna-wrapper"
          />
        </div>
      )}

    </>
  );
};

export default App;
