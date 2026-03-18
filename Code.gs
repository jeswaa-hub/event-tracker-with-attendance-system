/**
 * Handles GET requests to the web app.
 * Dynamically returns the names of all sheets and their respective column names.
 */
function doGet(e) {
  // Safeguard against missing parameters
  var parameter = (e && e.parameter) ? e.parameter : {};
  var action = parameter.action;
  
  if (action === "getMetadata") {
    return getSheetMetadata();
  }
  
  if (action === "getSheetData") {
    var sheetName = parameter.sheetName;
    return getSheetData(sheetName);
  }
  
  // Default metadata if no action
  return getSheetMetadata();
}

/**
 * Fetches all row data from a specific sheet
 */
function getSheetData(sheetName) {
  try {
    if (!sheetName) throw new Error("Sheet name is required.");
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("Active spreadsheet is null. Ensure script is bound to a spreadsheet.");
    }
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) throw new Error("Sheet '" + sheetName + "' not found.");
    
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();
    
    // Return empty success if no data
    if (lastRow <= 1) {
       return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        headers: lastColumn > 0 ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0] : [],
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).trim(); });
    var rows = data.slice(1);
    
    var jsonData = rows.map(function(row, idx) {
      return { row: row, rowNumber: idx + 2 };
    }).filter(function(entry) {
      return entry.row.some(function(cell) {
        if (cell === null || cell === undefined) return false;
        if (typeof cell === "string") return cell.trim() !== "";
        return cell !== "";
      });
    }).map(function(entry) {
      var obj = { __rowNumber: entry.rowNumber };
      headers.forEach(function(header, index) {
        obj[header] = entry.row[index];
      });
      return obj;
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      headers: headers,
      data: jsonData
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Returns an object where keys are sheet names and values are arrays of column headers.
 */
function getSheetMetadata() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("Active spreadsheet is null. Ensure script is bound to a spreadsheet.");
    }
    var sheets = ss.getSheets();
    var metadata = {};

    sheets.forEach(function(sheet) {
      var sheetName = sheet.getName();
      var lastColumn = sheet.getLastColumn();
      
      // Get column names from the first row if the sheet is not empty
      var columns = [];
      if (lastColumn > 0) {
        columns = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      }
      
      metadata[sheetName] = columns;
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: metadata
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles POST requests to the web app.
 * Supports CRUD actions: create (default), update, and delete.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Invalid request payload. If you are running this directly from the editor, it will not work. doPost must be triggered by a web request.");
    }

    var data = JSON.parse(e.postData.contents);
    var authToken = data.auth_token;
    var validToken = "1TAgdSVNyGFQ9sU_g8uqjpBg5Jkt_XXIxFGGw9OpPOR4E_QjF1h13K3sK";

    // Security Check
    if (authToken !== validToken) {
      throw new Error("Unauthorized access. Invalid SECRET_KEY.");
    }

    var sheetName = data.sheetName || "Attendance Form";
    var action = data.action || "create";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("Active spreadsheet is null. Ensure script is bound to a spreadsheet.");
    }
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      if (sheetName === "Events") {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(["Event ID", "Description/Title", "Date", "Location", "Description", "Status"]);
      } else if (sheetName === "Attendance Form") {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(["Timestamp", "Event", "Email", "FirstName", "LastName", "mobileNo", "Sex", "Gender", "Age", "Sector", "SeniorCitizen", "Disabled", "Position", "Region", "Province", "Signature"]);
      } else {
        throw new Error("Sheet '" + sheetName + "' not found.");
      }
    }

    var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    
    if (action === "create") {
      if (sheetName === "Attendance Form") {
        if (!data["Event ID"]) {
          throw new Error("Event ID is mandatory for attendance records. Ensure your check-in link includes a valid event ID.");
        }
        ensureColumnExists(sheet, "Event ID");
        ensureColumnExists(sheet, "Timestamp");
        ensureColumnExists(sheet, "Event");
        ensureColumnExists(sheet, "Signature");
        headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      }

      var newRow = headers.map(function(header) {
        if ((header === "Event ID" || header === "ID") && sheetName === "Events") {
          return Utilities.getUuid().substring(0, 8).toUpperCase();
        }
        return data[header] !== undefined ? data[header] : "";
      });
      sheet.appendRow(newRow);
      return sendResponse("success", "Data successfully created in " + sheetName);
    } 
    
    else if (action === "update") {
      var identifier = data.identifierCol || headers[0];
      var identifierVal = data[identifier];
      
      if (!identifierVal) throw new Error("Identifier value is required for update.");
      
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      var colIndex = headers.indexOf(identifier);
      
      for (var i = 1; i < values.length; i++) {
        if (values[i][colIndex] == identifierVal) {
          var rowNum = i + 1;
          headers.forEach(function(h, idx) {
            if (data[h] !== undefined && h !== identifier) {
              sheet.getRange(rowNum, idx + 1).setValue(data[h]);
            }
          });
          return sendResponse("success", "Data successfully updated in row " + rowNum);
        }
      }
      throw new Error("Record with " + identifier + " '" + identifierVal + "' not found.");
    }
    
    else if (action === "bulkDeleteRows") {
      var rowNumbers = data.rowNumbers;
      if (!rowNumbers || !Array.isArray(rowNumbers) || rowNumbers.length === 0) {
        throw new Error("rowNumbers[] is required for bulkDeleteRows.");
      }

      var unique = {};
      var parsed = rowNumbers.map(function(n) { return Number(n); })
        .filter(function(n) { return !isNaN(n) && n >= 2; })
        .filter(function(n) {
          if (unique[n]) return false;
          unique[n] = true;
          return true;
        })
        .sort(function(a, b) { return b - a; });

      if (parsed.length === 0) {
        throw new Error("No valid row numbers provided.");
      }

      parsed.forEach(function(rn) {
        sheet.deleteRow(rn);
      });

      return sendResponse("success", "Deleted " + parsed.length + " row(s).");
    }

    else if (action === "delete") {
      var identifier = data.identifierCol || headers[0];
      var identifierVal = data[identifier];
      
      if (!identifierVal) throw new Error("Identifier value is required for delete.");
      
      var values = sheet.getDataRange().getValues();
      var colIndex = headers.indexOf(identifier);
      
      for (var i = 1; i < values.length; i++) {
        if (values[i][colIndex] == identifierVal) {
          sheet.deleteRow(i + 1);
          return sendResponse("success", "Data successfully deleted.");
        }
      }
      throw new Error("Record not found.");
    }

    throw new Error("Invalid action: " + action);

  } catch (error) {
    return sendResponse("error", error.toString());
  }
}

function sendResponse(status, message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: status,
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}

function ensureColumnExists(sheet, columnName) {
  if (!sheet) {
    throw new Error("Cannot run ensureColumnExists directly. This is a helper function meant to be called by doPost. Please test by submitting the form instead.");
  }
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  var exists = headers.some(function(h) {
    return String(h || "").toLowerCase().trim() === String(columnName).toLowerCase().trim();
  });
  if (!exists) {
    var nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue(columnName);
  }
}

/**
 * Utility function to retroactively update existing attendance records
 * that are missing an Event ID by matching the Event name.
 * You can run this directly from the Apps Script editor.
 */
function fixMissingEventIDs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var attendanceSheet = ss.getSheetByName("Attendance Form");
  var eventsSheet = ss.getSheetByName("Events");
  
  if (!attendanceSheet || !eventsSheet) {
    Logger.log("Required sheets are missing.");
    return;
  }
  
  ensureColumnExists(attendanceSheet, "Event ID");
  
  var eventsData = eventsSheet.getDataRange().getValues();
  var eventsHeaders = eventsData[0];
  var eventIdIdx = eventsHeaders.indexOf("Event ID");
  var eventTitleIdx = eventsHeaders.indexOf("Description/Title");
  
  if (eventIdIdx === -1) {
    Logger.log("Events sheet is missing 'Event ID' column.");
    return;
  }
  
  // Build map of event names to IDs
  var eventMap = {};
  for (var i = 1; i < eventsData.length; i++) {
    var id = eventsData[i][eventIdIdx];
    // Also try checking other possible name columns if Description/Title is empty
    var name = String(eventsData[i][eventTitleIdx] || eventsData[i][eventsHeaders.indexOf("Event Name")] || eventsData[i][eventsHeaders.indexOf("Event")] || "").trim().toLowerCase();
    if (name && id) {
      eventMap[name] = id;
    }
  }
  
  var attData = attendanceSheet.getDataRange().getValues();
  var attHeaders = attData[0];
  var attEventIdIdx = attHeaders.indexOf("Event ID");
  var attEventColIdx = attHeaders.indexOf("Event");
  
  if (attEventIdIdx === -1 || attEventColIdx === -1) {
    Logger.log("Attendance sheet is missing 'Event ID' or 'Event' column.");
    return;
  }
  
  var updatedCount = 0;
  for (var j = 1; j < attData.length; j++) {
    var rowId = attData[j][attEventIdIdx];
    var rowEventName = String(attData[j][attEventColIdx] || "").trim().toLowerCase();
    
    if (!rowId && rowEventName && eventMap[rowEventName]) {
      // +2 because rows are 1-indexed and we skip the header row in loop
      attendanceSheet.getRange(j + 1, attEventIdIdx + 1).setValue(eventMap[rowEventName]);
      updatedCount++;
    }
  }
  
  Logger.log("Successfully updated " + updatedCount + " existing attendance records with Event IDs.");
}
