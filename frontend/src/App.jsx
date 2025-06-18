import React, { useState, useRef } from 'react';
import "./App.css";
import { IoMdArrowRoundBack } from 'react-icons/io';
import { GoogleGenAI } from "@google/genai";
import { CircleLoader } from "react-spinners";
import Markdown from 'react-markdown';
import { downloadBlog } from './component/downloadBlog';
import { FaRegCalendarAlt } from "react-icons/fa";
import remarkGfm from "remark-gfm";

const IMGBB_API_KEY = "18539e79130230a4a5139d566b0360cc"; 

const App = () => {
  const [screen, setScreen] = useState(1);
  const [text, setText] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const blogRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const dateInputRef = useRef(null);
 const [selectedFile, setSelectedFile] = useState(null);
  const [imageURL, setImageURL] = useState("");

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
        Return the blog in Markdown format using this structure:
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

      // Inject image before Introduction or after title
      if (imageURL) {
        const imageMarkdown = `\n\n![Uploaded Image](${imageURL})\n\n`;
        const introIndex = blogContent.search(/##\s*Introduction/i);
        if (introIndex !== -1) {
          blogContent =
            blogContent.slice(0, introIndex) +
            imageMarkdown +
            blogContent.slice(introIndex);
        } else {
          blogContent = blogContent.replace(/^# .+/, match => `${match}${imageMarkdown}`);
        }
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

  const publishToDevto = async () => {
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

      const res = await fetch("http://localhost:5000/api/devto/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          markdown: cleanedContent,
          tags: ["ai", "blog", "seo"],
          image: imageURL
        })
      });

      const result = await res.json();
      alert("Published successfully: " + result.url);
    } catch (err) {
      alert("Failed to publish: " + err.message);
    }
  };

  const scheduleBlog = async () => {
    if (!scheduledAt) {
      alert("Please select a date and time to schedule.");
      return;
    }

    try {
      const title = extractTitle(data);
      const response = await fetch("http://localhost:5000/api/devto/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          markdown: data,
          tags: ["ai", "blog", "seo"],
          scheduledAt,
          image: imageURL
        })
      });

      const resData = await response.json();
      console.log("✅ Blog scheduled:", resData);
      alert("Blog scheduled successfully!");
    } catch (err) {
      console.error("❌ Error scheduling blog:", err);
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
          if (data && data.data && data.data.url) {
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
    } else if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text();
      setText(text);
    } else {
      alert("Unsupported file type.");
    }
  };

  return (
    <>
      {screen === 1 ? (
        <div className="h-screen flex items-center justify-center bg-black bg-opacity-60"
          style={{
            backgroundImage: `url('../public/b9.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
          <form
            className="bg-[#1f1f1f] bg-opacity-90 rounded-2xl px-4 py-3 flex items-center w-[700px]"
            onSubmit={(e) => {
              e.preventDefault();
              genearteBlogContent();
            }}
            encType="multipart/form-data"
          >
            <input
              type="text"
              placeholder="Ask anything"
              className="bg-transparent flex-1 text-white placeholder-gray-400 focus:outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />

            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex gap-2 ml-4">
              <button
                type="button"
                onClick={() => document.getElementById('fileInput').click()}
                className="bg-[#2e2e2e] px-4 py-1.5 rounded-xl text-sm hover:bg-[#3a3a3a]"
              >
                📎 Attach
              </button>
            </div>

            <button
              type="submit"
              className="ml-4 bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200"
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div className="container py-[30px] px-[100px]">
          {loading ? (
            <div className='fixed top-0 left-0 flex items-center justify-center h-screen w-screen'>
              <CircleLoader color="#74f210" size={150} aria-label="Loading Spinner" />
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
                            className="rounded-xl my-4 max-w-full"
                          />
                        );
                      },
                    }}
                  >
                    {editedContent || data}
                  </Markdown>
                )}
              </div>

              {imageURL && (
                <div className="my-4">
                  <p className="text-white">Preview:</p>
                  <img src={imageURL} alt="Uploaded Preview" className="rounded-lg max-w-xs" />
                </div>
              )}

              <div className="flex gap-4 items-center flex-wrap">
                <button onClick={genearteBlogContent} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Re-Generate</button>

                <select
                  className="border px-4 py-2 rounded text-black"
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
                      format: downloadFormat
                    })
                  }
                  disabled={!data}
                  className={`px-4 py-2 rounded ${data ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 cursor-not-allowed"} text-white`}
                >
                  Download
                </button>

                <button
                  onClick={publishToDevto}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Publish to Dev.to
                </button>

                <button
                  onClick={() => {
                    if (editMode) {
                      setData(editedContent);
                    } else {
                      setEditedContent(data);
                    }
                    setEditMode(!editMode);
                  }}
                  className={`px-4 py-2 rounded ${editMode ? "bg-green-700" : "bg-orange-500"} text-white hover:opacity-90`}
                >
                  {editMode ? "Save" : "Edit Blog"}
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    ref={dateInputRef}
                    className="hidden"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />

                  <FaRegCalendarAlt
                    className="text-white cursor-pointer text-xl hover:text-purple-400"
                    onClick={() => dateInputRef.current.showPicker()}
                  />

                  <button
                    onClick={scheduleBlog}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Schedule Blog
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default App;
