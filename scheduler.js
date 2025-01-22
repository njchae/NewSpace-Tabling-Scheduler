function start() {
  scheduler();
}

function onEdit(e) {
  const range = e.range
  scheduler(range)
}

function scheduler(edit) {
  const spreadsheet = SpreadsheetApp.getActiveSheet();
  const calendarId = spreadsheet.getRange("H2").getValue(); // cell with calendar id in spreadsheet
  Logger.log("Calendar ID in H2: " + calendarId);
  
  const eventCal = CalendarApp.getCalendarById(calendarId); // get calendar
  Logger.log("Get calendar by ID: " + eventCal);
  

  //Logger.log("Available calendars:");
  //CalendarApp.getAllCalendars().forEach(cal => Logger.log(cal.getName() + ": " + cal.getId()));

  if (!eventCal) {
    Logger.log("Calendar with ID '" + calendarId + "' not found.");
    return;
  }

  if (edit == null) {
    var signups = spreadsheet.getRange("B4:F84").getValues();
    makeEvents(signups, eventCal)
  }
  else {
    if (!edit.getValue() instanceof String) {
      return;
    }
    var edit_row = edit.getRow();
    var edit_col = edit.getColumn();
    //Logger.log("row: " + edit_row + ", column: " + edit_col)
    if (edit_col == 4) {
      var signups = spreadsheet.getRange(edit_row, edit_col - 2, 1, edit_col - 1).getValues();
    }
    else if (edit_col == 5) {
      var signups = spreadsheet.getRange(edit_row, edit_col - 3, 1, edit_col - 1).getValues();
    }
    else if (edit_col == 6) {
      var signups = spreadsheet.getRange(edit_row, edit_col - 4, 1, edit_col - 1).getValues();
    }
    makeEvents(signups, eventCal);
  }
}

function makeEvents(t, eventCal) {
  Logger.log("started makeEvents");
  for (let i = 0, len = t.length; i < len; i++) {
    var start = new Date(t[i][0]);
    var end = new Date(t[i][1]);
    
    var event = eventCal.getEvents(start, end);
    Logger.log("searched for event");

    t_i_2 = t[i][2].trim()
    t_i_3 = t[i][3].trim()
    t_i_4 = t[i][4].trim()
    
    var spread_names = [];
    if (t_i_2 != "") {
      spread_name1 = get_email(t_i_2);
      spread_names.push(spread_name1.trim());
    }
    if (t_i_3 != "") {
      spread_name2 = get_email(t_i_3);
      spread_names.push(spread_name2);
    }
    if (t_i_4 != "") {
      spread_name3 = get_email(t_i_4);
      spread_names.push(spread_name3);
    }
    // check for existing event
    if (event.length != 0) {
      var event = event[0];
      var guest_list = event.getGuestList();
      Logger.log("event already exists, time for guests.");
      
      for (let j = 0; j < guest_list.length; j++) {
        email = guest_list[j].getEmail();

        // remove name from event if the name doesn't match any in spreadsheet
        remove = true;
        for (let n = 0; n < spread_names.length; n++) {
          if (email == spread_names[n]) {
            remove = false;
          }
        }
        if (remove) {
          event.removeGuest(email);
          Logger.log("Removed: " + email);
        }
      }
      // check to see if invite is needed for each spread_name
      for (let s = 0; s < spread_names.length; s++) {
        if (send_invite(spread_names[s], guest_list, event, spread_names) == false) {
          Logger.log("already added: " + t[i][s + 2]);
        }
      }
      // delete event if no guests
      if (event.getGuestList().length == 0) {
        event.deleteEvent();
        Logger.log("event deleted");
      }
    }
    else if ((t[i][2].length != 0) || (t[i][3].length != 0) || (t[i][4].length != 0)) { // if event doesn't exist, create one and add all guests
      Logger.log("event doesnt exist, lets make one");
      var event = eventCal.createEvent("NewSpace@Berkeley Tabling", new Date(t[i][0]), new Date(t[i][1]));
      Logger.log("Event created.");
      if (t[i][2]) {
      event.addGuest(get_email(t[i][2]));
      Logger.log("added guest: " + t[i][2]);
      }
      if (t[i][3]) {
      event.addGuest(get_email(t[i][3]));
      Logger.log("added guest: " + t[i][3]);
      }
      if (t[i][4]) {
        event.addGuest(get_email(t[i][4]));
      }
    }
  }
}

// send invite if needed to spread_name
function send_invite(guest, guest_list, event, spread_names) {
  for (let k = 0; k < guest_list.length; k++) {
    if (guest == guest_list[k].getEmail()) {
      return false;
    }
  }
  event.addGuest(guest);
  Logger.log("added guest: " + guest);
  return true;
}

function get_email(name) {
  if (name != null) {
    return dictionary[name.toLowerCase()];
  }
  else {
    return;
  }
}

// input people's names and emails in the dictionary below e.g ("name": "email@gmail.com", "name2": "email2@gmail.com")
let dictionary = {};
  Object.assign(dictionary, {});
