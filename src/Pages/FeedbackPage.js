import React, { useEffect, useState } from "react";
import "./FeedbackPage.css";
import {useParams} from "react-router-dom"

export default function TwoTextareas() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [usedIndexes, setUsedIndexes] = useState([]);

  let {id}=useParams();

//   console.log(id, "ajjay")

  // Load suggestions from Google Sheet
//  useEffect(() => {
//   // 1️⃣ Base Spreadsheet ID
//   const SPREADSHEET_ID = "1-a2Bvdg6Jx7EEu4gZ6y0NVFrFtKFktJ17vb-S79NrGs";

//   // 2️⃣ Get ?sheet=SheetName from current page URL
//   const params = new URLSearchParams(window.location.search);
//   const sheetName = id


//   // 3️⃣ Construct dynamic CSV URL for that sheet
//   const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;


// //   "https://docs.google.com/spreadsheets/d/1-a2Bvdg6Jx7EEu4gZ6y0NVFrFtKFktJ17vb-S79NrGs/edit?usp=sharing"
//   // 4️⃣ Fetch and parse the sheet
//   fetch(SHEET_CSV_URL)
//     .then((res) => res.text())
//     .then((csvText) => {
//       const lines = csvText
//         .split("\n")
//         .map((line) => line.trim())
//         .filter((line, index) => line.length > 0 && index !== 0); // skip header row

//       if (lines.length === 0) {
//         console.error(`No suggestions found in sheet "${sheetName}".`);
//         return;
//       }

//       setSuggestions(lines);

//       // Pick one random suggestion initially
//       const index = Math.floor(Math.random() * lines.length);
//       setLeft(lines[index]);
//       setUsedIndexes([index]);
//     })
//     .catch((err) =>
//       console.error(`Error loading suggestions from "${sheetName}":`, err)
//     );
// }, []);

useEffect(() => {
  const SPREADSHEET_ID = "1-a2Bvdg6Jx7EEu4gZ6y0NVFrFtKFktJ17vb-S79NrGs";

  const params = new URLSearchParams(window.location.search);
  const sheetName = id || params.get("Sheet1");
console.log(sheetName, "sahiew");


  if (!sheetName) {
    alert("No sheet name provided!");
    return;
  }

  const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

  fetch(SHEET_CSV_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load sheet: ${sheetName}`);
      return res.text();
    })
    .then((csvText) => {
      const lines = csvText
        .split("\n")
        .map((line) => line.trim().replace(/^"|"$/g, "").replace(/\r/g, ""))
        .filter((line, index) => line.length > 0 && index !== 0);

      if (lines.length === 0) {
        alert(`No data found in sheet "${sheetName}"`);
        return;
      }

      setSuggestions(lines);
      const index = Math.floor(Math.random() * lines.length);
      setLeft(lines[index]);
      setUsedIndexes([index]);
    })
    .catch((err) => {
      console.error(err);
      alert(`Error loading data for sheet "${sheetName}".`);
    });
}, [id]);


  const handleCopy = async () => {
    if (left.trim() !== "") {
      try {
        await navigator.clipboard.writeText(left);
        alert("Copied to clipboard!");
      } catch (err) {
        alert("Failed to copy text.");
      }
    } else {
      alert("No text to copy.");
    }
  };

  const handleNewSuggestion = () => {
    if (suggestions.length === 0) return;

    let index;
    // pick a new unused suggestion
    do {
      index = Math.floor(Math.random() * suggestions.length);
    } while (usedIndexes.includes(index) && usedIndexes.length < suggestions.length);

    setLeft(suggestions[index]);
    setUsedIndexes([...usedIndexes, index]);
  };

  const handleClear = () => {
    setLeft("");
    setRight("");
  };

  return (
    <div className="tt-wrapper">
      <div className="tt-section">
        <label className="tt-label">
          First textarea
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Type or edit your text here..."
            className="tt-textarea"
            rows={6}
          />
        </label>
        <button type="button" className="tt-btn" onClick={handleCopy}>
          Copy Text
        </button>
        <button type="button" className="tt-btn tt-btn-secondary" onClick={handleNewSuggestion}>
          New Suggestion
        </button>
      </div>

      {/* <div className="tt-section">
        <label className="tt-label">
          Second textarea
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Type or edit your text here..."
            className="tt-textarea"
            rows={6}
          />
        </label>
        <button type="button" className="tt-btn tt-btn-danger" onClick={handleClear}>
          Clear Both
        </button>
      </div> */}
    </div>
  );
}
