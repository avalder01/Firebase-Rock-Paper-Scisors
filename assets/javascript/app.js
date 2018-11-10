
var database = firebase.database();
var databaseRef = database.ref();

  function info(trainName, trainDestination, trainTimeStart, trainFrequency, currentTime, periodic = false) {
    var minutesUntil;
    var nextTrain;
    
    trainTimeStart = moment(trainTimeStart, "HH:mm");
    
    var difference =(currentTime.diff(trainTimeStart,"minutes"));
    
    if (difference < 0) {
      minutesUntil =  Math.abs(difference);
      nextTrain = trainTimeStart;
      
    }  else { 
    
      minutesUntil = trainFrequency - difference % trainFrequency;
      nextTrain = currentTime.add(minutesUntil,"minutes");
    }
    
    if (periodic === false) {
      var newRow = $("<tr>").append(
        $("<td>").text(trainName),
        $("<td>").text(trainDestination),
        $("<td>").text(trainFrequency),
        $("<td>").text(nextTrain.format("HH:mm")),
        $("<td>").text(minutesUntil)
      );
      $("#trainTable > tbody").append(newRow);
    }
    
    if (periodic === true) {
      $("." + trainName + " td").eq(3).text(nextTrain.format("HH:mm"));
      $("." + trainName + " td").eq(4).text(minutesUntil);
    }
  }



$(function() {
  
  //Function to pull data from database and update current time stamp on initial page load.
  databaseRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      
      databaseRef.child(childSnapshot.key).update({timeStamp: firebase.database.ServerValue.TIMESTAMP});
      
      var trainName = childSnapshot.val().trainName;
      var trainDestination = childSnapshot.val().trainDestination;
      var trainTimeStart = childSnapshot.val().trainTimeStart;
      var trainFrequency = childSnapshot.val().trainFrequency;
      var currentTime = moment(childSnapshot.val().timeStamp);
      
      info(trainName, trainDestination, trainTimeStart, trainFrequency, currentTime);
      
    });
  });
  
  // Click listener that adds a new train to the data on screen and to the database.
  $("#addTrain").click(function() {
    var currentTime;
    var trainName = $("#trainName").val();
    var trainDestination = $("#trainDestination").val();
    var trainTimeStart = $("#trainTimeStart").val();
    var trainFrequency = parseInt($("#trainFrequency").val());
    
    databaseRef.push({
      trainName: trainName,                     
      trainDestination: trainDestination,
      trainTimeStart: trainTimeStart,
      trainFrequency: trainFrequency,
      timeStamp: firebase.database.ServerValue.TIMESTAMP
    });
        
    databaseRef.once("child_added", function(snapshot) {
      currentTime = moment(snapshot.val().timeStamp);
    });
    
    info(trainName, trainDestination, trainTimeStart, trainFrequency, currentTime);
    
  });
  
  function periodicUpdate() {
    databaseRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        
        var periodic = true;
        
        databaseRef.child(childSnapshot.key).update({timeStamp: firebase.database.ServerValue.TIMESTAMP});
        
        var trainName = childSnapshot.val().trainName;
        var trainDestination = childSnapshot.val().trainDestination;
        var trainTimeStart = childSnapshot.val().trainTimeStart;
        var trainFrequency = childSnapshot.val().trainFrequency;
        var currentTime = moment(childSnapshot.val().timeStamp);
        
        info(trainName, trainDestination, trainTimeStart, trainFrequency, currentTime, periodic);
        
      });
    });
  }
  
  //Set interval for periodic data update
  setInterval(periodicUpdate, 30000);
  
});