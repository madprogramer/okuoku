//Smiley "☺";
var smiley = "☺";
var app;
var db;


//GLOBAL STRINGS
var enterNameString = "Please enter your name:";

//COOKIE FUNCTIONS
function setCookie(cookie, value, days) {
    db = firebase.firestore();
    var d = new Date();
    d.setTime(firebase.firestore.FieldValue.serverTimestamp() + (days*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cookie + "=" + value + ";" + expires + ";path=/";
}

function getCookie(cookie) {
    var dc = decodeURIComponent(document.cookie);
    var ca = dc.split(';');
    var name = cookie + "=";
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')c = c.substring(1);
        if (c.indexOf(name) == 0)return c.substring(name.length, c.length);
    }
    return "";
}

//COOKIES

//username
function checkName() {
    var username = getCookie("username");
    if (username == "") {
        username = prompt(enterNameString, "");
        while (username == "" || username == null) {
            username = prompt(enterNameString, "");
        }
        setCookie("username", username, 365);
    }
}

//modes
//mode
function setMode(mode,vars){
  console.log("DUMMY");
  memory=vars;
}


//Upload Functions
function uploadData(){
  /* db = firebase.firestore();
  const timestamp = firebase.firestore.FieldValue.serverTimestamp();

  var addDoc = db.collection('kitties').add({
    title: ourTitle,
    links: ourLinks,
    available: true,
    }).then(ref => {
  });*/
}

//Update Functions
function updateWord(ID){
  //console.log( document.getElementById("languageInp").value + ";" + document.getElementById("wordInp").value + ";" + document.getElementById("pronunciationInp").value );
  var un = getCookie("username");
  var eTime = firebase.firestore.FieldValue.serverTimestamp();

  var editData = {
    editBy: un,
    editDate: eTime,
    edited: db.collection("text").doc(ID),
    editConfirmed: false,
    added : {},
    removed: {}
  };

  var newValues = {
    language: document.getElementById("languageInp").value,
    //Was called pronounciation, corrected to pronunciation at around 9 PM July 31st 2018
    pronunciation: {
      IPA: document.getElementById("pronunciationInp").value
    }
  }

  var wordRef = db.collection('text').doc(ID);

  var editSucceeded = false;
  wordRef.get().then(doc =>{
      if(doc.data().language != newValues.language){
        editData.added["language"]=newValues.language;
        editData.removed["language"]=doc.data().language;
      }

      /*if(doc.data().pronunciation.IPA != newValues.pronunciation.IPA){
        editData.added["pronunciation"]["IPA"]=newValues.pronunciation.IPA;
        editData.removed["pronunciation"]["IPA"]=doc.data().pronunciation.IPA;
      }*/
      Object.keys(newValues.pronunciation).forEach(function(key,index) {
        //console.log(key);
        //New Pronunciation
        if( ! doc.data().pronunciation.hasOwnProperty(key) ){
          if(! editData.added.hasOwnProperty("pronunciation"))editData.added.pronunciation = {};
          editData.added.pronunciation[key]=newValues.pronunciation[key];
        }
        //New Version / Revision
        else if(doc.data().pronunciation[key] != newValues.pronunciation[key]){
          if(! editData.added.hasOwnProperty("pronunciation"))editData.added.pronunciation = {};
          if(! editData.removed.hasOwnProperty("pronunciation"))editData.removed.pronunciation = {};
          editData.added.pronunciation[key] = newValues.pronunciation[key];
          editData.removed.pronunciation[key]= doc.data().pronunciation[key];
        }
      });
      editSucceeded = true;
    var editRef = db.collection('edit').doc('edits').collection('text');
    //console.log("ATTEMPTING...");
    editRef.add(editData);
    //console.log("DONE!");

    var updatedWord = editData.added;
    updatedWord["lastUpdated"]=eTime;
    updatedWord["lastUpdatedBy"]=un;

    //COMMIT EDIT
    wordRef.update(updatedWord).then(function(){
      //Attempt to confirm edit
      editRef.update({editConfirmed : true});
      $("#Loading").hide();
      ;}).err(function(error){
        console.log("ERRORE");
      ;});

    }, err => {
    console.log("ERRORD");
  });

  //console.log("Loading...");
  $("#Loading").show();
}

function editWord(wordData){
  //$("#WordView").hide();
  document.getElementById("languageInp").value=wordData.data().language;
  //document.getElementById("wordInp").value=wordData.data().spelling;
  document.getElementById("pronunciationInp").value=wordData.data().pronunciation.IPA;

  //use jquery to make a dynamic meaning group/troop

  $("#textEditSubmit").on( "click", function() {
    updateWord(wordData.id);
    
  });

  //Oops
  /*$("#textEditCancel").on( "click", function() {
    updateWord(wordData.id);
  });*/

  $("#WordEdit").show();
}

function viewWord(wordData){

  //console.log(wordData.id);
  //console.log(wordData.data().spelling);
  //console.log(wordData.data().language);
  

  var ID = wordData.id;
  $("#Home").hide();
  $("#WordView").show();
  var wordRef = db.collection('text').doc(ID);

  $("#editView").on( "click", function() {
    editWord(wordData);
    $("#editViewLI").hide();
  });

  var observer = wordRef.onSnapshot(docSnapshot =>{
    document.getElementById("viewLanguage").innerHTML="Dil: "+docSnapshot.data().language;
    document.getElementById("viewWord").innerHTML="Kelime: "+docSnapshot.data().spelling;
    document.getElementById("viewPronunciation").innerHTML="Tellâfuz (IPA): "+docSnapshot.data().pronunciation.IPA;
    }, err => {
    console.log("ERRORA");
  });
}


//What you see is what you get
function preciseQuery(text){
  const db = firebase.firestore();
  //var q = db.collection("text").where("spelling","<=",text).where();
  var textRef = db.collection("text");

  //first
  //console.log(text);
  //console.log(text.toLowerCase());
  //text.toLower

  //last
  finalText=text;
  for(var i=0;i<5;i++){
    finalText+="頋";
  }

  var q = textRef.orderBy("spelling").startAt(text).endAt(finalText).limit(10);

  return q;
}

function changeMainResults(resultTableArray){

  console.log(resultTableArray.length);
  document.getElementById("textResultsBody").innerHTML="";


  for(var i = resultTableArray.length-1;i>=0;i--){
    //$("#textResultsBody").append("☺");
    //<td>...</td>
    $("#textResultsBody").append("<td id='textResultsBodyRow"+i+"' data-toggle='tooltip' data-placement='top' title='"+resultTableArray[i].data().pronunciation.IPA+"'>"+resultTableArray[i].data().spelling+" ("+resultTableArray[i].data().language+")"+"</td>");
    var w = resultTableArray[i];
    $("#textResultsBodyRow"+i).click(function(){
      //var t=i;
      //console.log(t.spelling);
      viewWord(w);
      $("#editViewLI").show();
    });
  }
  //Re-enable tooltips
  $('[data-toggle="tooltip"]').tooltip();
}

function queryText(text){
  var result = preciseQuery(text);
  //console.log(result);

  //$("#noResults").fadeIn();
  result.onSnapshot(snapshot=>{
    var resultTableArray = [];
    var atLeastOneResult = false;
      snapshot.forEach(doc => {
        atLeastOneResult=true;
        console.log(doc.id, '=>', doc.data());
        //alter results table
        resultTableArray.push(doc);
      });

      changeMainResults(resultTableArray);

      if(atLeastOneResult){
        $("#noResults").hide();
        $("#textResults").show();
        $("#editViewLI").show();
      }
      else{
        $("#textResults").hide();
        $("#noResults").fadeIn();
      }
    }, err => {
      console.log("ERRORB");
    });

  return result;
}

function CleanHomePage(){
  $("#newTextButton").fadeOut();
  $("#noResults").fadeOut();
  $("#textResults").fadeOut();
}

function HomeSearch(searchQuery){
  //console.log("SEARCH QUERY: "+searchQuery);
  if(searchQuery!=""){
    $("#newTextButton").fadeIn();
    queryText(searchQuery);
  }

  else{
    CleanHomePage();
  }
}

$("#search").on('change', 'input', function(){
  var searchData = $(this);
  var searchQuery = searchData.val();
  HomeSearch(searchQuery);
});

//Duplicate
$("#search").keyup(function(){
  var searchData = $(this);
  var searchQuery = searchData.val();
  HomeSearch(searchQuery);
});

//Initialization

//Jquery
$( document ).ready(function() {

  //Enabling tooltips
  //$('[data-toggle="tooltip"]').tooltip();
  
});

 
$("#backHome").on( "click", function() {
  $("#WordView").hide();
  $("#WordEdit").hide();
  $("#Home").show();
});

$("#textEditCancel").on( "click", function() {
  $("#WordEdit").hide();
  $("#editViewLI").show();
});

//Firebase
document.addEventListener("DOMContentLoaded", event=>{

  // Initialize Firebase
  //const app = firebase.app();
  //const db = firebase.firestore();
  app = firebase.app();
  db = firebase.firestore();

  //enterNameString = db.get();
  checkName();

});