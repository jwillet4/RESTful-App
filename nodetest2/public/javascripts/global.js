//Author: Logan the Spaghetti King

// Userlist data array for filling in info box
var userListData = [];
var updateID = '';

// DOM Ready =============================================================
$(document).ready(function() {

  // Populate the user table on initial page load
  populateTable();

  //Username Link click
  $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

  //Add user button click
  $('#btnAddUser').on('click', addUser);

  //Delete user link click
  $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

  //Update form link click
  $('#userList table tbody').on('click', 'td a.linkupdateuser', addUpdateForm);

  
});

// Functions =============================================================

// Fill table with data
function populateTable() {

  // Empty content string
  var tableContent = '';

  // jQuery AJAX call for JSON
  $.getJSON( '/users/userlist', function( data ) {

    //Puts the data array into a userlist variable in the global object
    userListData = data;

    // For each item in our JSON, add a table row and cells to the content string
    $.each(data, function(){
      tableContent += '<tr>';
      tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.username + '</a></td>';
      tableContent += '<td>' + this.email + '</td>';
      tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
      tableContent += '<td><a href="#" class="linkupdateuser" rel="' + this._id + '">update</a></td>';
      tableContent += '</tr>';
    });

    // Inject the whole content string into our existing HTML table
    $('#userList table tbody').html(tableContent);
    $('#userList').css('color', 'black');
    $('#userList').css('font-size', 'larger')
  });
};

//Shows user info
function showUserInfo(event) {
  //Prevents a link from firing
  event.preventDefault();
  //Retrieves username from link rel attribute
  var thisUserName = $(this).attr('rel');
  //Gets an index of objects based on the id value
  var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

  //Gets the user object
  var thisUserObject = userListData[arrayPosition];
  //Populates the info box
  $('#userInfoName').text(thisUserObject.fullname);
  $('#userInfoAge').text(thisUserObject.age);
  $('#userInfoGender').text(thisUserObject.gender);
  $('#userInfoLocation').text(thisUserObject.location);
};

//Add user
function addUser(event) {
  event.preventDefault();

  //Basic validation - Increases errorCount if any fields are blank
  var errorCount = 0;
  $('#addUser input').each(function(index, val) {
    if($(this).val() === '') { errorCount++ }
  });

  //Check and make sure errorCount is still at zero
  if (errorCount === 0) {
    //If there are no blank fields, compile all data into one object
    var newUser = {
      'username': $('#addUser fieldset input#inputUserName').val(),
      'email': $('#addUser fieldset input#inputUserEmail').val(),
      'fullname': $('#addUser fieldset input#inputUserFullname').val(),
      'age': $('#addUser fieldset input#inputUserAge').val(),
      'location': $('#addUser fieldset input#inputUserLocation').val(),
      'gender': $('#addUser fieldset input#inputUserGender').val()
    }

    //Use AJAX to post the object to the adduser service
    $.ajax({
      type: 'POST',
      data: newUser,
      url: '/users/adduser',
      dataType: 'JSON'
    }).done(function( response ) {
      //Check for blank response (successful)
      if (response.msg === '') {
        //Clear form inputs
        $('#addUser fieldset input').val('');
        //Update the table
        populateTable();
      }
      else {
        alert('Error: ' + response.msg);
      }
    });
  }
  else {
    //If errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};

//Delete user
function deleteUser(event) {
  event.preventDefault();
  //Confirmation dialog
  var confirmation = confirm('Are you sure you wish to delete this user?');
  //Check for user confirmation
  if (confirmation === true) {
    //If confirmed, DELETE user
    $.ajax({
      type: 'DELETE',
      url: '/users/deleteuser/' + $(this).attr('rel')
    }).done(function( response ) {
      //Check for blank response
      if (response.msg === '') {
        alert('User deleted.')
      }
      else {
        alert('Error: ' + response.msg);
      }
      //Populate table
      populateTable();
    });
  }
};

function addUpdateForm(event) {
  event.preventDefault();
  //Confirmation dialog
  var confirmation = confirm('Are you sure you want to update this user?');
  //Checks for user confirmation
  if (confirmation === true) {
    //Retrieves username
    var thisUserName = updateID = $(this).attr('rel');
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem._id; }).indexOf(thisUserName);
    //Gets the user object
    var thisUserObject = userListData[arrayPosition];
    //String of HTML to be inserted into the webpage
    var changeForm = '';
    //Add form markup
    changeForm += '<h2>Please Update the Information Below<h2>';
    changeForm += '<div id="updateForm"><fieldset><input type = "text" placeholder = "Username" id = "inputUserName" value = "' + thisUserObject.username + '">';
    changeForm += '<input type = "text" placeholder = "Full Name" id = "inputUserFullname" value = "' + thisUserObject.fullname + '"><br>';
    changeForm += '<input type = "text" placeholder = "Email" id = "inputUserEmail" value = "' + thisUserObject.email + '">';
    changeForm += '<input type = "text" placeholder = "Age" id = "inputUserAge" value = "' + thisUserObject.age + '"><br>';
    changeForm += '<input type = "text" placeholder = "Location" id = "inputUserLocation" value = "' + thisUserObject.location + '">';
    changeForm += '<input type = "text" placeholder = "Gender" id = "inputUserGender" value = "' + thisUserObject.gender + '"><br>';
    changeForm += '<button type = "button" id ="btnUpdateUser">Update User</button></fieldset></div>';
    //Inserts the form
    $('#updateForm').html(changeForm);
    //Update user link click
    $('#btnUpdateUser').on('click', updateUser);
    console.log(updateID);
  }
};

function updateUser(event) {
  event.preventDefault();
  //error counter to check for empty fields
  var errorCount = 0;
  $('#updateForm input').each(function(index, val) {
    if($(this).val() === '') { errorCount++ }
  });
  //executes update if fields are all populated
  if (errorCount === 0) {
    var updatedUser = {
      '_id': updateID,
      'username': $('#inputUserName').val(),
      'email': $('#inputUserEmail').val(),
      'fullname': $('#inputUserFullname').val(),
      'age': $('#inputUserAge').val(),
      'location': $('#inputUserLocation').val(),
      'gender': $('#inputUserGender').val()
    }
    //POST updated user information
    $.ajax({
      url: 'users/updateuser/' + updateID,
      type: 'POST',
      data: updatedUser,
      dataType: 'JSON'
    }).done(function( response ) {
      //Check for blank response (successful)
      if (response.msg === '') {
        //Clear form inputs
        $('#addUser fieldset input').val('');
        //Update the table
        populateTable();
        //Clears update form
        $('#updateForm').html('');
      }
      else
        alert('Error: ' + response.msg);
    });
  }
  else {
    //If errorCount is more than 0, error out
    alert('Please fill in all fields');
    return false;
  }
};