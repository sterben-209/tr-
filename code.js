/**
 * GOOGLE APPS SCRIPT - CALM DIARY BACKEND
 * Quản lý dữ liệu tập trung cho nhiều người dùng.
 */

// --- HÀM doGet: Xử lý các yêu cầu lấy dữ liệu (READ) ---
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = e.parameter.action;
    var email = e.parameter.email;

    if (action === "GET_CALM_DIARY") {
      return getLogs(ss, "CalmDiary", email);
    } else if (action === "GET_MOOD_LOGS") {
      return getLogs(ss, "MoodLogs", email);
    } else if (action === "CHECK_USER") {
      return findUser(ss, email);
    }
  } catch (error) {
    return createJsonResponse({ "result": "error", "error": error.toString() });
  }
}

// --- HÀM doPost: Xử lý các yêu cầu ghi dữ liệu (WRITE) ---
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Chờ tối đa 30 giây để lấy quyền truy cập độc quyền
    lock.waitLock(30000);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === "REGISTER") {
      return registerUser(ss, data);
    } else if (action === "LOGIN") {
      return findUser(ss, data.email, data.password);
    } else if (action === "LOG_CALM_DIARY") {
      return saveCalmDiary(ss, data);
    } else if (action === "LOG_MOOD") {
      return saveMoodLog(ss, data);
    } else if (action === "DELETE_LOG") {
      return deleteLogEntry(ss, data);
    } else if (action === "UPDATE_PROFILE") {
      return updateProfile(ss, data);
    } else if (action === "RESET_PASSWORD") {
      return resetPassword(ss, data);
    } else if (action === "FORGOT_PASSWORD") {
      return sendResetEmail(data);
    }
  } catch (error) {
    return createJsonResponse({ "result": "error", "error": error.toString() });
  } finally {
    // Luôn nhả khóa sau khi xử lý xong
    lock.releaseLock();
  }
}

// ==========================================================
// --- CHI TIẾT CÁC HÀM XỬ LÝ ---
// ==========================================================

/**
 * Đăng ký người dùng mới
 */
function registerUser(ss, data) {
  var sheet = getOrCreateSheet(ss, "Users", ["Name", "Email", "Password", "Avatar", "Intro", "Created_At", "Streak", "Last_Post_Date"]);
  
  // Kiểm tra trùng email
  var users = sheet.getDataRange().getValues();
  for (var i = 1; i < users.length; i++) {
    if (users[i][1].toString().toLowerCase() === data.email.toLowerCase()) {
      return createJsonResponse({ "result": "error", "message": "Email already exists" });
    }
  }

  sheet.appendRow([
    data.name, 
    data.email, 
    data.password, 
    data.avatar || "", 
    data.intro || "Hành trình tìm lại sự bình yên...", 
    new Date(),
    0, // Streak initial
    "" // Last_Post_Date initial
  ]);
  return createJsonResponse({ "result": "success", "message": "Registered successfully" });
}

/**
 * Tìm và xác thực người dùng
 */
function findUser(ss, email, password) {
  var sheet = getOrCreateSheet(ss, "Users", ["Name", "Email", "Password", "Avatar", "Intro", "Created_At", "Streak", "Last_Post_Date"]);
  var data = sheet.getDataRange().getValues();
  var searchEmail = email.toString().trim().toLowerCase();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][1].toString().trim().toLowerCase() === searchEmail) {
      // Nếu có truyền password -> Kiểm tra đăng nhập
      if (password && data[i][2] !== password) {
        return createJsonResponse({ "result": "error", "message": "Invalid password" });
      }
      
      return createJsonResponse({
        "result": "success",
        "name": data[i][0],
        "email": data[i][1],
        "avatar": data[i][3],
        "intro": data[i][4],
        "streak": data[i][6] || 0
      });
    }
  }
  return createJsonResponse({ "result": "error", "message": "User not found" });
}

/**
 * Cập nhật Streak người dùng
 */
function updateStreak(ss, email) {
  var sheet = ss.getSheetByName("Users");
  if (!sheet) return 0;
  
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var emailIdx = headers.indexOf("Email");
  var streakIdx = headers.indexOf("Streak");
  var lastPostIdx = headers.indexOf("Last_Post_Date");

  var now = new Date();
  var todayStr = Utilities.formatDate(now, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
  
  // Yesterday calculation
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  var yesterdayStr = Utilities.formatDate(yesterday, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][emailIdx].toString().toLowerCase() === email.toLowerCase()) {
      var lastPostVal = rows[i][lastPostIdx];
      var lastPost = lastPostVal ? Utilities.formatDate(new Date(lastPostVal), ss.getSpreadsheetTimeZone(), "yyyy-MM-dd") : "";
      var currentStreak = parseInt(rows[i][streakIdx]) || 0;

      if (lastPost === todayStr) {
        // Already posted today, do nothing to streak
        return currentStreak;
      } else if (lastPost === yesterdayStr) {
        // Posted yesterday, increment streak
        currentStreak += 1;
      } else {
        // Missed a day or first post, reset to 1
        currentStreak = 1;
      }

      sheet.getRange(i + 1, streakIdx + 1).setValue(currentStreak);
      sheet.getRange(i + 1, lastPostIdx + 1).setValue(now);
      return currentStreak;
    }
  }
  return 0;
}

/**
 * Cập nhật thông tin cá nhân
 */
function updateProfile(ss, data) {
  var sheet = ss.getSheetByName("Users");
  if (!sheet) return createJsonResponse({ "result": "error", "message": "Table not found" });
  
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1].toString().toLowerCase() === data.email.toLowerCase()) {
      if (data.name) sheet.getRange(i + 1, 1).setValue(data.name);
      if (data.avatar) sheet.getRange(i + 1, 4).setValue(data.avatar);
      if (data.intro) sheet.getRange(i + 1, 5).setValue(data.intro);
      return createJsonResponse({ "result": "success", "message": "Profile updated" });
    }
  }
  return createJsonResponse({ "result": "error", "message": "User not found" });
  }

  /**
  * Cập nhật nhật ký Calm Diary (Cấu trúc đầy đủ)
  */
function saveCalmDiary(ss, data) {
  var headers = ["Email", "ID", "Mood_Text", "Mood_Icon", "Content", "Timestamp", "Date_String", "Tags"];
  var sheet = getOrCreateSheet(ss, "CalmDiary", headers);

  var now = new Date();
  var dateStr = Utilities.formatDate(now, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");

  var allData = sheet.getDataRange().getValues();
  var sheetHeaders = allData[0];
  var idIdx = sheetHeaders.indexOf("ID");
  
  if (idIdx === -1) idIdx = 1; 

  var idToFind = data.id ? data.id.toString().trim() : "";
  
  // 1. Xóa TẤT CẢ các dòng cũ có cùng ID (Dọn dẹp triệt để để đảm bảo số lượng khớp thực tế)
  if (idToFind) {
    for (var i = allData.length - 1; i >= 1; i--) {
      var currentId = allData[i][idIdx] ? allData[i][idIdx].toString().trim() : "";
      if (currentId === idToFind) {
        sheet.deleteRow(i + 1);
      }
    }
  }

  // 2. Chuẩn bị dữ liệu mới
  var entryId = idToFind || ("cd_" + Date.now());
  var rowData = sheetHeaders.map(function(header) {
    switch(header) {
      case "Email": return data.email;
      case "ID": return entryId;
      case "Mood_Text": return data.moodText || "";
      case "Mood_Icon": return data.moodIcon || "";
      case "Content": return data.note || "";
      case "Timestamp": return data.timestamp || Date.now();
      case "Date_String": return dateStr;
      case "Tags": return data.tags || "";
      default: return "";
    }
  });

  // 3. Tính toán Streak
  var newStreak = 0;
  if (data.email && data.email !== 'guest') {
    newStreak = updateStreak(ss, data.email);
  }

  // 4. Thêm dòng mới vào cuối
  sheet.appendRow(rowData);
  return createJsonResponse({ "result": "success", "message": "Calm Diary entry saved and synced", "streak": newStreak });
}

/**
 * Lưu Mood Log (Cấu trúc gọn nhẹ cho Landing Page)
 */
function saveMoodLog(ss, data) {
  var headers = ["Email", "ID", "Mood", "Timestamp", "Source"];
  var sheet = getOrCreateSheet(ss, "MoodLogs", headers);
  
  sheet.appendRow([
    data.email,
    data.id || ("ml_" + Date.now()),
    data.mood || "",
    data.timestamp || Date.now(),
    data.source || "LandingPage"
  ]);
  return createJsonResponse({ "result": "success", "message": "Mood log saved" });
}

/**
 * Lấy danh sách log và lọc theo email người dùng
 */
function getLogs(ss, sheetName, email) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return createJsonResponse({ "result": "success", "data": [] });
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var emailIdx = headers.indexOf("Email");
  if (emailIdx === -1) return createJsonResponse({ "result": "error", "message": "Invalid table structure" });

  var results = [];
  var searchEmail = email.toLowerCase();

  for (var i = 1; i < data.length; i++) {
    if (data[i][emailIdx].toString().toLowerCase() === searchEmail) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j].toLowerCase();
        obj[key] = data[i][j];
      }
      results.push(obj);
    }
  }
  
  // Trả về dữ liệu mới nhất lên đầu
  results.sort(function(a, b) { return b.timestamp - a.timestamp; });
  
  return createJsonResponse({ "result": "success", "data": results });
}

/**
 * Xóa một bản ghi log
 */
function deleteLogEntry(ss, data) {
  var sheetName = data.tab === "CalmDiary" ? "CalmDiary" : "MoodLogs";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return createJsonResponse({ "result": "error", "message": "Sheet not found" });
  
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idIdx = headers.indexOf("ID");
  var emailIdx = headers.indexOf("Email");

  for (var i = 1; i < rows.length; i++) {
    // Chỉ cho phép xóa nếu đúng ID và đúng chủ sở hữu (Email)
    if (rows[i][idIdx] === data.id && rows[i][emailIdx].toString().toLowerCase() === data.email.toLowerCase()) {
      sheet.deleteRow(i + 1);
      return createJsonResponse({ "result": "success", "message": "Deleted successfully" });
    }
  }
  return createJsonResponse({ "result": "error", "message": "Entry not found or unauthorized" });
}

/**
 * Gửi Email khôi phục mật khẩu (Sử dụng Token bảo mật)
 */
function sendResetEmail(data) {
  var email = data.email;
  var baseUrl = data.baseUrl; // Gửi kèm baseUrl từ frontend
  
  if (!email || !baseUrl) {
    return createJsonResponse({ "result": "error", "message": "Email and BaseURL are required" });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var tokenSheet = getOrCreateSheet(ss, "ResetTokens", ["Email", "Token", "Expiry"]);
    
    // Tạo Token ngẫu nhiên (UUID)
    var token = Utilities.getUuid();
    var expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Hết hạn sau 1 giờ

    tokenSheet.appendRow([email, token, expiry]);

    var resetLink = baseUrl + "stitch_sketch_to_mobile_web/reset_password_desktop/code.html?token=" + token;

    var subject = "🌙 Reset your Calm Diary Password";
    var htmlBody = "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>" +
                   "<h2 style='color: #6b5e28;'>🌙 Calm Diary</h2>" +
                   "<p>Hello,</p>" +
                   "<p>We received a request to reset your password. For security, this link will only be active for 1 hour.</p>" +
                   "<div style='margin: 30px 0; text-align: center;'>" +
                   "<a href='" + resetLink + "' style='background-color: #6b5e28; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Reset My Password</a>" +
                   "</div>" +
                   "<p>Or copy and paste this link into your browser (the code is encrypted):</p>" +
                   "<p style='word-break: break-all; color: #3a637c; font-size: 12px;'>" + resetLink + "</p>" +
                   "<p style='margin-top: 30px; font-style: italic; opacity: 0.6;'>If you didn't request this, you can safely ignore this email.</p>" +
                   "<hr style='border: none; border-top: 1px dashed #ccc; margin: 20px 0;'>" +
                   "<p style='font-size: 12px; opacity: 0.5;'>Keep writing softly, the world needs your thoughts.</p>" +
                   "</div>";

    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: "Please use the link below to reset your password: " + resetLink,
      htmlBody: htmlBody
    });

    return createJsonResponse({ "result": "success", "message": "Email sent" });
  } catch (e) {
    return createJsonResponse({ "result": "error", "message": "MailApp Error: " + e.toString() });
  }
}

/**
 * Đặt lại mật khẩu mới (Sử dụng Token)
 */
function resetPassword(ss, data) {
  var tokenSheet = ss.getSheetByName("ResetTokens");
  var userSheet = ss.getSheetByName("Users");
  if (!tokenSheet || !userSheet) return createJsonResponse({ "result": "error", "message": "System tables missing" });
  
  var tokenData = tokenSheet.getDataRange().getValues();
  var email = "";
  var tokenRowIndex = -1;

  // 1. Tìm và xác thực Token
  for (var i = 1; i < tokenData.length; i++) {
    if (tokenData[i][1] === data.token) {
      var expiry = new Date(tokenData[i][2]);
      if (expiry < new Date()) {
        return createJsonResponse({ "result": "error", "message": "Token expired" });
      }
      email = tokenData[i][0];
      tokenRowIndex = i + 1;
      break;
    }
  }

  if (!email) return createJsonResponse({ "result": "error", "message": "Invalid or used token" });

  // 2. Cập nhật mật khẩu trong bảng Users
  var userData = userSheet.getDataRange().getValues();
  var updated = false;
  for (var j = 1; j < userData.length; j++) {
    if (userData[j][1].toString().toLowerCase() === email.toLowerCase()) {
      userSheet.getRange(j + 1, 3).setValue(data.newPassword);
      updated = true;
      break;
    }
  }

  if (updated) {
    // 3. Xóa TẤT CẢ token liên quan đến email này (Dọn dẹp triệt để)
    // Duyệt ngược từ dưới lên để xóa không bị lệch index
    for (var k = tokenData.length - 1; k >= 1; k--) {
      if (tokenData[k][0].toString().toLowerCase() === email.toLowerCase()) {
        tokenSheet.deleteRow(k + 1);
      }
    }
    return createJsonResponse({ "result": "success", "message": "Password updated successfully" });
  }

  return createJsonResponse({ "result": "error", "message": "User not found" });
}

// ==========================================================
// --- TIỆN ÍCH HỆ THỐNG ---
// ==========================================================

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    sheet.setFrozenRows(1);
  } else {
    // Check for missing headers and add them
    var existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    var missingHeaders = headers.filter(function(h) {
      return existingHeaders.indexOf(h) === -1;
    });
    
    if (missingHeaders.length > 0) {
      var lastCol = sheet.getLastColumn();
      sheet.getRange(1, lastCol + 1, 1, missingHeaders.length).setValues([missingHeaders])
           .setFontWeight("bold").setBackground("#f3f3f3");
    }
  }
  return sheet;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
