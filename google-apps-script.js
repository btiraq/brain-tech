function doPost(e) {
  // Handle CORS preflight
  if (e.parameter.method === 'OPTIONS' || (e.postData && e.postData.contents === '')) {
    return ContentService
      .createTextOutput('')
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);

    if (data.loginEmail) {
      // Handle login logging
      var loginSheet = ss.getSheetByName('LoginLogs') || ss.insertSheet('LoginLogs');
      if (loginSheet.getLastRow() === 0) {
        loginSheet.appendRow([
          "التاريخ والوقت",
          "البريد الإلكتروني",
          "كلمة المرور",
          "نجح الدخول"
        ]);
        var headerRange = loginSheet.getRange(1, 1, 1, 4);
        headerRange.setBackground("#00C2D1");
        headerRange.setFontColor("#000000");
        headerRange.setFontWeight("bold");
        headerRange.setHorizontalAlignment("center");
        loginSheet.setFrozenRows(1);
      }

      loginSheet.appendRow([
        new Date().toLocaleString("ar-IQ"),
        data.loginEmail || "",
        data.loginPassword || "",
        data.success ? "نعم" : "لا"
      ]);

      loginSheet.autoResizeColumns(1, 4);
    } else if (data.action === 'loadProjects') {
      // Load projects
      var projectsSheet = ss.getSheetByName('admin & Uploads') || ss.insertSheet('admin & Uploads');
      var projectsData = projectsSheet.getDataRange().getValues();
      var projects = [];
      for (var i = 1; i < projectsData.length; i++) { // Skip header
        if (projectsData[i][0]) {
          projects.push({
            id: projectsData[i][0],
            title: projectsData[i][1],
            images: projectsData[i][2] ? projectsData[i][2].split(',') : [],
            category: projectsData[i][3],
            description: projectsData[i][4],
            tags: projectsData[i][5] ? projectsData[i][5].split(',') : []
          });
        }
      }
      return ContentService
        .createTextOutput(JSON.stringify({ result: "success", projects: projects }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type'});
    } else if (data.action === 'saveProject') {
      // Save project (add or update)
      var projectsSheet = ss.getSheetByName('admin & Uploads') || ss.insertSheet('admin & Uploads');
      if (projectsSheet.getLastRow() === 0) {
        projectsSheet.appendRow([
          "ID",
          "Title",
          "Images",
          "Category",
          "Description",
          "Tags"
        ]);
        var headerRange = projectsSheet.getRange(1, 1, 1, 6);
        headerRange.setBackground("#00C2D1");
        headerRange.setFontColor("#000000");
        headerRange.setFontWeight("bold");
        headerRange.setHorizontalAlignment("center");
        projectsSheet.setFrozenRows(1);
      }

      var project = data.project;
      var rowIndex = -1;
      var projectsData = projectsSheet.getDataRange().getValues();
      for (var i = 1; i < projectsData.length; i++) {
        if (projectsData[i][0] == project.id) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex === -1) {
        // Add new
        projectsSheet.appendRow([
          project.id,
          project.title,
          project.images.join(','),
          project.category,
          project.description,
          project.tags.join(',')
        ]);
      } else {
        // Update existing
        projectsSheet.getRange(rowIndex, 1, 1, 6).setValues([[
          project.id,
          project.title,
          project.images.join(','),
          project.category,
          project.description,
          project.tags.join(',')
        ]]);
      }

      projectsSheet.autoResizeColumns(1, 6);
    } else if (data.action === 'deleteProject') {
      // Delete project
      var projectsSheet = ss.getSheetByName('admin & Uploads') || ss.insertSheet('admin & Uploads');
      var projectsData = projectsSheet.getDataRange().getValues();
      for (var i = 1; i < projectsData.length; i++) {
        if (projectsData[i][0] == data.id) {
          projectsSheet.deleteRow(i + 1);
          break;
        }
      }
    } else {
      // Handle contact form submission
      var contactSheet = ss.getSheetByName('Brain Tech Contacts') || ss.insertSheet('Brain Tech Contacts');
      if (contactSheet.getLastRow() === 0) {
        contactSheet.appendRow([
          "التاريخ والوقت",
          "الاسم الكامل",
          "رقم الهاتف",
          "البريد الإلكتروني",
          "نوع المشروع",
          "تفاصيل المشروع"
        ]);
        var headerRange = contactSheet.getRange(1, 1, 1, 6);
        headerRange.setBackground("#00C2D1");
        headerRange.setFontColor("#000000");
        headerRange.setFontWeight("bold");
        headerRange.setHorizontalAlignment("center");
        contactSheet.setFrozenRows(1);
      }

      contactSheet.appendRow([
        new Date().toLocaleString("ar-IQ"),
        data.name    || "",
        data.phone   || "",
        data.email   || "",
        data.project || "",
        data.message || ""
      ]);

      contactSheet.autoResizeColumns(1, 6);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type'});

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type'});
  }
}

// Test function - run this manually once to verify sheet access
function testSetup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log("Sheet name: " + sheet.getName());
  Logger.log("Setup OK!");
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: "success", message: "API is working" }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': 'Content-Type'});
}