/**
 * Handles GET requests to the web app.
 * Dynamically returns the names of all sheets and their respective column names.
 */
function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "getMetadata") {
    return getSheetMetadata();
  }
  
  if (action === "getSheetData") {
    var sheetName = e.parameter.sheetName;
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
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) throw new Error("Sheet '" + sheetName + "' not found.");
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows = data.slice(1);
    
    var jsonData = rows.map(function(row) {
      var obj = {};
      headers.forEach(function(header, index) {
        obj[header] = row[index];
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
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      // Proactively create sheet if it doesn't exist for "Events"
      if (sheetName === "Events") {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(["Event ID", "Description/Title", "Date", "Location", "Description", "Status"]);
      } else {
        throw new Error("Sheet '" + sheetName + "' not found.");
      }
    }

    var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    
    if (action === "create") {
      var newRow = headers.map(function(header) {
        if (header === "Event ID" || header === "ID") return Utilities.getUuid().substring(0, 8).toUpperCase();
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
