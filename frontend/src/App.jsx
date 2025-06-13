import React, { useState, useRef } from 'react'
import "./App.css"
import { IoMdArrowRoundBack } from 'react-icons/io';
import { GoogleGenAI } from "@google/genai";
import { CircleLoader } from "react-spinners";
import Markdown from 'react-markdown';
import html2pdf from 'html2pdf.js';


const App = () => {
  const [screen, setScreen] = useState(1);
  const [text, setText] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const blogRef = useRef(null); // for PDF

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
        `,
      });
      console.log(response.text);
      setData(response.text);
    } catch (error) {
      console.error("Error generating content:", error);
    }
    setLoading(false);
  }

  const downloadAsPDF = () => {
    const element = blogRef.current;

    // Clone the original blog content
    const clone = element.cloneNode(true);
    clone.style.color = "#000";
    clone.style.backgroundColor = "#fff";
    clone.style.padding = "20px";

    clone.querySelectorAll('button, svg').forEach(el => el.style.display = 'none');


    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.appendChild(clone);
    document.body.appendChild(container);

    // Generate PDF from the clone
    html2pdf().from(clone).set({
      margin: 0.5,
      filename: `${text.slice(0, 10) || "blog"}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save().then(() => {

      document.body.removeChild(container);
    });
  };

  const extractTitle = (markdown) => {
    const match = markdown.match(/^#\s*(.+)/m);
    return match ? match[1].trim() : "Untitled Post";
  };


  const publishToDevto = async () => {
    try {
      const title = extractTitle(data); // <-- Extract title from markdown
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/devto/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, markdown: data, tags: ["ai", "blog", "seo"] })
      });
      const result = await res.json();
      alert("Published successfully: " + result.url);
    } catch (err) {
      alert("Failed to publish: " + err.message);
    }
  };



  return (
    <>
      {
        screen === 1 ?
          <div className="min-h-screen w-full flex flex-col items-center justify-center">
            <h1 className='text-[40px] font-[700] text-center'>
              AI <span className='text-green-500'>Blog</span> Content <span className='text-green-500'>Generator</span>
            </h1>

            <textarea
              onChange={(e) => setText(e.target.value)}
              value={text}
              className='w-[90vw] max-w-[600px] min-h-[30vh] mt-5 bg-transparent border border-[#333333] focus:border-green-500 outline-none p-5 rounded-xl text-white'
              placeholder="Explain your blog topic."
            ></textarea>
            <button
              onClick={genearteBlogContent}
              className="btnNormal py-3 px-5 transition-all duration-300 hover:bg-green-600 bg-green-500 text-white rounded-xl border-0 outline-0 mt-6 w-[90vw] max-w-[400px]"
            >
              Generate
            </button>
          </div>
          :
          <div className="container py-[30px] px-[100px]">
            {loading ?
              <div className='fixed top-0 left-0 flex items-center justify-center h-screen w-screen'>
                <CircleLoader
                  color="#74f210"
                  size={150}
                  aria-label="Loading Spinner" />
              </div>
              :
              <div>
                <p className='font-bold text-[20px] mb-7 flex items-center gap-[10px]'>
                  <i onClick={() => setScreen(1)} className='cursor-pointer flex flex-col items-center justify-center w-[40px] h-[40px] rounded-[50%] transition-all duration-300 hover:bg-zinc-800'>
                    <IoMdArrowRoundBack />
                  </i> Output:
                </p>

                <div ref={blogRef} className="markdown-body mb-5">
                  <Markdown>{data}</Markdown>
                </div>

                <div className="flex gap-4">
                  <button onClick={genearteBlogContent} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Re-Generate</button>
                  <button onClick={downloadAsPDF} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Download PDF</button>
                  <button onClick={publishToDevto} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Publish to Dev.to</button>

                </div>


              </div>
            }
          </div>
      }
    </>
  )
}

export default App;
