import React, { useEffect, useState } from "react";
import "./FeedbackPage.css";
import { useNavigate, useParams } from "react-router-dom";

export default function TwoTextareas() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [usedIndexes, setUsedIndexes] = useState([]);
  const [sheetLink, setSheetLink] = useState("");
  const navigate = useNavigate();

  let { id } = useParams();
    const params = new URLSearchParams(window.location.search);

    const sheetName = id || params.get("Sheet1");

  useEffect(() => {
    // 👇 Updated Sheet ID
    const SPREADSHEET_ID = "1_1SEyzilt-oAZkojg-lNV8rjCvkdO0q05DWylV_aHBg";

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
        const rows = csvText.split("\n").slice(1);
        const parsedSuggestions = [];
        let foundLink = "";

        rows.forEach((row) => {
          const [suggestion, link] = row
            .split(",")
            .map((c) => c?.trim()?.replace(/^"|"$/g, ""));

          if (suggestion) parsedSuggestions.push(suggestion);
          if (!foundLink && link) foundLink = link;
        });

        if (parsedSuggestions.length === 0) {
          alert(`No data found in sheet "${sheetName}"`);
          return;
        }

        setSuggestions(parsedSuggestions);
        setSheetLink(foundLink || "");

        const index = Math.floor(Math.random() * parsedSuggestions.length);
        setLeft(parsedSuggestions[index]);
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

        // 🔗 Redirect to the one link per sheet
        if (sheetLink) {
          window.open(sheetLink, "_blank"); // open in new tab
        } else {
          alert("No link available for this sheet.");
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

    setLeft(suggestions[index]);
    setUsedIndexes([...usedIndexes, index]);
  };

  return (
    <div className="tt-wrapper">
      <div className="tt-section">
        <label className="tt-label">
          {sheetName}
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
