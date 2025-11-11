import React, { useEffect, useState } from "react";
import "./FeedbackPage.css";
import { useParams } from "react-router-dom";

export default function TwoTextareas() {
  const [left, setLeft] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [usedIndexes, setUsedIndexes] = useState([]);
  const [sheetLink, setSheetLink] = useState("");
  const [labelText, setLabelText] = useState("Customer Review");

  let { id } = useParams();

  useEffect(() => {
    const SPREADSHEET_ID = "1_1SEyzilt-oAZkojg-lNV8rjCvkdO0q05DWylV_aHBg";

    const params = new URLSearchParams(window.location.search);
    const sheetName = id || params.get("sheet") || "Sheet1";

    const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      sheetName
    )}`;

    fetch(SHEET_CSV_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load sheet: ${sheetName}`);
        return res.text();
      })
      .then((csvText) => {
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

        if (nameIndex > -1 && rows[1]?.[nameIndex]) {
          setLabelText(rows[1][nameIndex]);
        } else {
          setLabelText("Customer Review");
        }

        const suggestionsArr = [];
        let link = "";

        rows.slice(1).forEach((row) => {
          if (row[0] && row[0].length > 2) {
            suggestionsArr.push(row[0]);
          }
          if (row[1]) link = row[1];
        });

        setSuggestions(suggestionsArr);
        setSheetLink(link || "");

        if (suggestionsArr.length > 0) {
          const index = Math.floor(Math.random() * suggestionsArr.length);
          setLeft(suggestionsArr[index]);
          setUsedIndexes([index]);
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

        // ✅ Delete from Google Sheet using Apps Script
        await fetch("YOUR_GOOGLE_WEB_APP_URL", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: left,
            sheetName: id || new URLSearchParams(window.location.search).get("sheet") || "Sheet1"
          })
        });

        // ✅ Load new suggestion after delete
        handleNewSuggestion();

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
      setUsedIndexes([]);
    }

    let index;
    do {
      index = Math.floor(Math.random() * suggestions.length);
    } while (usedIndexes.includes(index));

    setLeft(suggestions[index]);
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
