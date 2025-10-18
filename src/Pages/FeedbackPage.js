import React, { useEffect, useState } from "react";
import "./FeedbackPage.css";
import { useNavigate, useParams } from "react-router-dom";

export default function TwoTextareas() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [usedIndexes, setUsedIndexes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const navigate = useNavigate();

  let { id } = useParams();

  useEffect(() => {
    const SPREADSHEET_ID = "1-a2Bvdg6Jx7EEu4gZ6y0NVFrFtKFktJ17vb-S79NrGs";

    const params = new URLSearchParams(window.location.search);
    const sheetName = id || params.get("Sheet1");

    if (!sheetName) {
      alert("No sheet name provided!");
      return;
    }

    const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      sheetName
    )}`;

    fetch(SHEET_CSV_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load sheet: ${sheetName}`);
        return res.text();
      })
      .then((csvText) => {
        const rows = csvText.split("\n").slice(1); // skip header
        const parsedData = rows
          .map((row) => {
            const [suggestion, link] = row.split(",").map((c) => c?.trim()?.replace(/^"|"$/g, ""));
            if (suggestion) return { suggestion, link };
            return null;
          })
          .filter(Boolean);

        if (parsedData.length === 0) {
          alert(`No data found in sheet "${sheetName}"`);
          return;
        }

        setSuggestions(parsedData);
        const index = Math.floor(Math.random() * parsedData.length);
        setLeft(parsedData[index].suggestion);
        setCurrentIndex(index);
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

        // ✅ Redirect after copy
        const currentSuggestion = suggestions[currentIndex];
        if (currentSuggestion?.link) {
          window.open(currentSuggestion.link, "_blank"); // open in new tab
        } else {
          alert("No link available for this suggestion.");
        }
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
    do {
      index = Math.floor(Math.random() * suggestions.length);
    } while (usedIndexes.includes(index) && usedIndexes.length < suggestions.length);

    setLeft(suggestions[index].suggestion);
    setCurrentIndex(index);
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
        <button
          type="button"
          className="tt-btn tt-btn-secondary"
          onClick={handleNewSuggestion}
        >
          New Suggestion
        </button>
      </div>
    </div>
  );
}
