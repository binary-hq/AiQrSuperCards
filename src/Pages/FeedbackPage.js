import React, { useEffect, useState } from "react";
import "./FeedbackPage.css";
import { useParams } from "react-router-dom";

export default function TwoTextareas() {
  const [left, setLeft] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [usedIndexes, setUsedIndexes] = useState([]);
  const [sheetLink, setSheetLink] = useState("");
  const [currentIndex, setCurrentIndex] = useState(null);

  let { id } = useParams();

  const [labelText, setLabelText] = useState("First textarea");




  useEffect(() => {
  // ✅ Your new Google Sheet ID
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
      const rows = csvText.split("\n").map((r) =>
        r.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
      );

      const suggestionsArr = [];
      let link = "";
      let nameLabel = "";

      // ✅ Find "Name" header and take C2 (name value)
      const headerRow = rows[0];
      const nameIndex = headerRow.indexOf("Name");
      if (nameIndex !== -1 && rows[1] && rows[1][nameIndex]) {
        nameLabel = rows[1][nameIndex];
      }

      rows.slice(1).forEach((row) => {
        if (row[0]) suggestionsArr.push(row[0]);
        if (!link && row[1]) link = row[1];
      });

      if (suggestionsArr.length === 0) {
        alert(`No data found in sheet "${sheetName}"`);
        return;
      }

      setSuggestions(suggestionsArr);
      setSheetLink(link || "");
      const index = Math.floor(Math.random() * suggestionsArr.length);
      setLeft(suggestionsArr[index]);
      setCurrentIndex(index);
      setUsedIndexes([index]);

      // ✅ set label value (C2)
      if (nameLabel) {
        setLabelText(nameLabel);
      }
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

        // ✅ Redirect to sheet-level link (one link per sheet)
        if (sheetLink) {
          window.open(sheetLink, "_blank"); // opens in a new tab
        } else {
          alert("No link found for this sheet.");
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
    setCurrentIndex(index);
    setUsedIndexes([...usedIndexes, index]);
  };








  return (
    <div className="tt-wrapper">
      <div className="tt-section">
        <label className="tt-label">
          {labelText}

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
          Suggestions
        </button>
      </div>
    </div>
  );
}
