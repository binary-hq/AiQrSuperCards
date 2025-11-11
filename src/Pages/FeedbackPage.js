import React, { useEffect, useState, useRef } from "react";
import "./FeedbackPage.css";
import { useParams } from "react-router-dom";

export default function TwoTextareas() {
  const [left, setLeft] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [usedIndexes, setUsedIndexes] = useState([]);
  const [sheetLink, setSheetLink] = useState("");
  const [labelText, setLabelText] = useState("First textarea");

  const textareaRef = useRef(null);
  let { id } = useParams();

  // Function to resize textarea to fit content
  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto"; // reset height
      ta.style.height = ta.scrollHeight + "px"; // set height to content
    }
  };

  // Load Google Sheet data
  useEffect(() => {
    const SPREADSHEET_ID = "1_1SEyzilt-oAZkojg-lNV8rjCvkdO0q05DWylV_aHBg";
    const params = new URLSearchParams(window.location.search);
    const sheetName = id || params.get("Sheet1");

    if (!sheetName) {
      alert("No sheet name provided!");
      return;
    }

    const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

    fetch(SHEET_CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        const rows = csvText.split("\n").map((r) =>
          r.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
        );

        const suggestionsArr = [];
        let link = "";
        let nameLabel = "";
        const headerRow = rows[0];
        const nameIndex = headerRow.indexOf("Name");

        if (nameIndex !== -1 && rows[1] && rows[1][nameIndex]) {
          nameLabel = rows[1][nameIndex];
        }

        rows.slice(1).forEach((row) => {
          if (row[0]) suggestionsArr.push(row[0]);
          if (!link && row[1]) link = row[1];
        });

        setSuggestions(suggestionsArr);
        setSheetLink(link || "");
        const index = Math.floor(Math.random() * suggestionsArr.length);
        setLeft(suggestionsArr[index]);
        setUsedIndexes([index]);

        if (nameLabel) setLabelText(nameLabel);
      })
      .catch((err) => {
        console.error(err);
        alert(`Error loading data for sheet "${sheetName}".`);
      });
  }, [id]);

  // Resize textarea whenever text changes
  useEffect(() => {
    resizeTextarea();
  }, [left]);

  const handleCopy = async () => {
    if (left.trim() !== "") {
      try {
        await navigator.clipboard.writeText(left);
        if (sheetLink) window.open(sheetLink, "_blank");
        else alert("No link found for this sheet.");
      } catch {
        alert("Failed to copy text.");
      }
    } else {
      alert("No text to copy.");
    }
  };

  const handleNewSuggestion = () => {
    if (suggestions.length === 0) return;

    let index;
    do {
      index = Math.floor(Math.random() * suggestions.length);
    } while (usedIndexes.includes(index) && usedIndexes.length < suggestions.length);

    setLeft(suggestions[index]);
    setUsedIndexes([...usedIndexes, index]);
  };

  return (
    <div className="tt-wrapper">
      <div className="tt-section">
        <label className="tt-label">
          {labelText}
          <textarea
            ref={textareaRef}
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            onInput={resizeTextarea} // live resize as user types
            placeholder="Type or edit your text here..."
            className="tt-textarea"
          />
        </label>
        <button type="button" className="tt-btn" onClick={handleCopy}>
          Copy & Review
        </button>
        <button
          type="button"
          className="tt-btn-secondary"
          onClick={handleNewSuggestion}
        >
          More Suggestions
        </button>
      </div>
    </div>
  );
}
