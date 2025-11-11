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
  const [labelText, setLabelText] = useState("Customer Review");

  useEffect(() => {
    const SPREADSHEET_ID = "1_1SEyzilt-oAZkojg-lNV8rjCvkdO0q05DWylV_aHBg";

    const params = new URLSearchParams(window.location.search);
    // ✅ Correct URL param usage + fallback
    const sheetName = id || params.get("sheet") || "Sheet1";

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
        // ✅ Robust CSV parser (handles commas inside quotes)
        const rows = csvText
          .trim()
          .split("\n")
          .map((r) =>
            r
              .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
              .map((c) => c.replace(/^"|"$/g, ""))
          );

        if (rows.length < 2) {
          alert(`No data found in sheet "${sheetName}"`);
          return;
        }

        const headerRow = rows[0];
        const nameIndex = headerRow.findIndex(
          (h) => h.toLowerCase() === "name"
        );

        // ✅ Label fallback
        if (nameIndex > -1 && rows[1]?.[nameIndex]) {
          setLabelText(rows[1][nameIndex]);
        } else {
          setLabelText("Customer Review");
        }

        const suggestionsArr = [];
        let link = "";

        rows.slice(1).forEach((row) => {
          // ✅ Prevent blank suggestions
          if (row[0] && row[0].length > 2) {
            suggestionsArr.push(row[0]);
          }
          // ✅ Take last non-empty link in column B
          if (row[1]) link = row[1];
        });

        if (suggestionsArr.length === 0) {
          alert(`No suggestions found in sheet "${sheetName}"`);
          return;
        }

        setSuggestions(suggestionsArr);
        setSheetLink(link || "");

        const index = Math.floor(Math.random() * suggestionsArr.length);
        setLeft(suggestionsArr[index]);
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

        if (sheetLink) {
          window.open(sheetLink, "_blank");
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

    if (usedIndexes.length >= suggestions.length) {
      // ✅ Reset once all suggestions seen
      setUsedIndexes([]);
    }

    let index;
    do {
      index = Math.floor(Math.random() * suggestions.length);
    } while (usedIndexes.includes(index));

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
          Copy & Review
        </button>

        <button
          type="button"
          className="tt-btn tt-btn-secondary"
          onClick={handleNewSuggestion}
        >
          More Suggestions
        </button>
      </div>
    </div>
  );
}
