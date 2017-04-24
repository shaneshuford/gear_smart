//Page Views
var MainPageRan = false;
var SwitchPageRan = false;
var RoutinesPageRan = false;
var setupPageRan = false;

//Encrypt Key (This should be set by the user)
var EncryptKey = 166856;

//Databases
var Access_Token = Decrypt(localStorage.getItem("token_DB"));
var Access_Url = Decrypt(localStorage.getItem("AccessUrl_DB"));
var switches_DB = localStorage.getItem("switches_DB");
var routines_DB = localStorage.getItem("routines_DB");

if(switches_DB != null){ switches_DB = Decrypt(switches_DB); }
if(routines_DB != null){ routines_DB = Decrypt(routines_DB); }

//TAU UI Helpers (to create/destroy)
var SwitchList_UI = null;
var RoutineList_UI = null;

//URL for Auth Script
var AuthScriptUrl = "http://shufordtech.com/gear.php";

//Returns TRUE if the watch has internet connection
var isOnline = navigator.onLine;

//debugging - to Bypass Login
//Access_Token = "";
//Access_Url = "https://********************.api.smartthings.com:443/api/smartapps/"; 

//------------------------------------------------------------------------------------On Page Changes
document.addEventListener("pageshow", function (e) {
	if(isOnline==false){
		//Maybe this should be done each time before an api call is fired incase we lose connection after starting the app..
		//If so, move isOnline = navigator.onLine also
		alert('No internet connection, please connect first.');
		tizen.application.getCurrentApplication().exit();
	}
	var page = e.target.id;
	var pageTarget = e.target;
	console.log("pageshow - pageshow event fired: Page: " + page);
	if(page == "mainPage"){
		MainPage();
	}else if(page == "switchesPage"){
		SwitchPage();
	}else if(page == "routinesPage"){
		RoutinesPage();
	}else if(page == "setupPage"){
		SetupPage();
	}
});
document.addEventListener( "pagebeforehide", function(e) {
	var page = e.target.id;
	console.log("pagebeforehide - LEAVING PAGE: " + page);
	if(page=="routinesPage"){
		RoutineList_UI.destroy();
	}else if(page=="switchesPage"){
		SwitchList_UI.destroy();
	}
});
//------------------------------------------------------------------------------------On Page Changes

//------------------------------------------------------------------------------------Setup Page
function SetupPage(){
	if(setupPageRan==false){
		console.log("SetupPage() - This is the first time the user has looked at this page.");
		setupPageRan=true;	
	}else{
		console.log("SetupPage() - The user has seen this page before");
	}

	//This is the only time the app needs to access anything outside of SmartThings.
	$('#submitsetup').click(function(){
		$.post( AuthScriptUrl+"?k="+$('#keysetup').val(), function( data ) {
			console.log(data);
				
			try {
				var obj = jQuery.parseJSON(data);
			} catch (e) {
				alert("There was an error!");
				console.log(e);
				return;
			}
				
			console.log(obj.TOKEN);
			console.log(obj.URL);
			localStorage.setItem("token_DB", Encrypt(obj.TOKEN));
			localStorage.setItem("AccessUrl_DB", Encrypt(obj.URL));
			Access_Token = obj.TOKEN;
			Access_Url = obj.URL;

			//BUG:: tau.changePage("mainPage"); //ALL UI COMPONETS BREAK, so lets just restart for now... 
			alert('Setup Compleate! App will now close, please restart it!');
			tizen.application.getCurrentApplication().exit();
		});
	});
}
//------------------------------------------------------------------------------------Setup Page

//------------------------------------------------------------------------------------RoutinesPage
function RoutinesPage(){
	console.log("RoutinesPage()");
	if(RoutinesPageRan==true){
		//This page has been ran before...
		console.log("RoutinesPage() - This page was shown before.");		
		$.when(RoutinesPageGetData()).done(function() {
			RoutinePage_Buttons();
			//tau.widget.getInstance('Routines').refresh();
		});
	}else{
		console.log("RoutinesPage() - This is the first time the user has looked at this page.");
		//This is the first time the user has looked at this page!
		RoutinesPageRan = true;
		$.when(RoutinesPageGetData()).done(function() {
			RoutinePage_Buttons();
			//tau.widget.getInstance('Routines').refresh();
		});
	}
}
function RoutinesPageGetData(){
	console.log("RoutinesPageGetData()");
	$('#Routines').html(''); //Clear Routines
	if(routines_DB != null){ //We have switch data stored!
		console.log("RoutinesPageGetData() - We have routine data stored!");
		
		try {
			var obj = jQuery.parseJSON(routines_DB);
		} catch (e) {
			alert("There was an error! The database may be corrupted, try clearning it.");
			console.log(e);
			return;
		}

		$.each(obj, function(index, element) {
			console.log(index);
			console.log(element);
			$('#Routines').append('\
				<li class="">\
					<div element="'+element+'" class="aRoutine ui-marquee ui-marquee-gradient">'+element+'</div>\
					<div class="ui-processing" style="display:none;"></div>\
				</li>\
			');
		});
		$('#Routines').append('\
			<li class="">\
				<div id="RefreshRoutineData" class="ui-marquee ui-marquee-gradient">Refresh Data</div>\
			</li>\
		');
		
		//gui stuff
		switcherr = document.getElementById("Routines");
		RoutineList_UI = tau.helper.SnapListMarqueeStyle.create(switcherr, {
			marqueeDelay: 0,
			marqueeStyle: "endToEnd"
		});
		
	}else{ //We couldn't find the routine database data, so lets build it.
		console.log("RoutinesPageGetData() - We couldn't find the routine database data, so lets build it.");
		$('#ProcessingMsg').html('Retrieving Routines From SmartThings');
		tau.changePage("processingPage"); //Switch Page
		console.log("RoutinesPageGetData() - Getting: " +  Access_Url + "/routines");
		console.log("RoutinesPageGetData() - using: " + Access_Token);
		$.get({
		    url: Access_Url + "/routines",
		    beforeSend: function(xhr) { 
		      xhr.setRequestHeader('Authorization','Bearer ' + Access_Token);
		    },
		    success: function (data) {
		    	console.log(data);
		    	data = JSON.stringify(data);
		    	console.log(data);
				localStorage.setItem("routines_DB", Encrypt(data)); //STORE THE ROUTINE DATA I NTHE DATABASE!
				routines_DB = data;
		        tau.changePage("routinesPage");
		    },
		    error: function(e){
		    	console.log(e);
		    	var Response = e.responseText;
				
		    	try {
		    		var obj = jQuery.parseJSON(Response);
				} catch (e) {
					//alert("There was an error!");
					console.log(e);
					//return;
				}

		    	console.log(obj);
		    	if(obj.message){
		    		alert(obj.message);
		    	}else if(obj.error){
		    		alert(obj.error);
		    	}else{
		    		alert("There was a problem, could not get the routines!");
		    	}
		    	tau.changePage("routinesPage");
		    }
		});
	}
}

function RoutinePage_Buttons(){
	console.log("RoutinePage_Buttons()");

	$('#RefreshRoutineData').click(function(){
		console.log("RoutinePage_Buttons() - Refresh Routine Data");
		localStorage.setItem("routines_DB", null);
		routines_DB = null;
		$('#ProcessingMsg').html('Retrieving Routines From SmartThings');
		tau.changePage("processingPage");
		$('#Routines').html('');
		setTimeout(function(){ tau.changePage("routinesPage"); }, 2000);
	});
	
	$(".aRoutine").click(function(){
		console.log('.aRoutine.click');
		//tau.changePage("processingPage");
		
		var WhatRoutine = this;
		$(WhatRoutine).hide();
		$(WhatRoutine).parent().find('.ui-processing').show();
		var RoutineName = $(this).attr('element');
		
		$.get({
		    url: Access_Url + "/routines/"+encodeURIComponent(RoutineName),
		    beforeSend: function(xhr) { 
		      xhr.setRequestHeader('Authorization','Bearer ' + Access_Token);
		    },
		    success: function (data) {
		    	console.log(data);
		    	data = JSON.stringify(data);
		    	console.log(data);
				$(WhatRoutine).show();
				$(WhatRoutine).parent().find('.ui-processing').hide();
		    },
		    error: function(e){
		    	console.log(e);
		    	var Response = e.responseText;

				try {
					var obj = jQuery.parseJSON(Response);
				} catch (e) {
					//alert("There was an error!");
					console.log(e);
					//return;
				}
		    	
		    	console.log(obj);
		    	if(obj.message){
		    		alert(obj.message);
		    	}else if(obj.error){
		    		alert(obj.error);
		    	}else{
		    		alert("There was a problem, could not execute the routine!");
		    	}
				$(WhatRoutine).show();
				$(WhatRoutine).parent().find('.ui-processing').hide();
		    }
		});
	});
}
//------------------------------------------------------------------------------------RoutinesPage

//------------------------------------------------------------------------------------Main Page
function MainPage(){
	console.log("MainPage()");
	if(Access_Token){
		if(MainPageRan==false){
			MainPageRan=true;
			//This is the first time the user has looked at this page.
			console.log("MainPage() - This is the first time the user has looked at this page.");
		}else{	
			//This page was shown before.
			console.log("MainPage() - This page was shown before.");
		}
	}else{
		tau.changePage("setupPage");
	}
}
(function(tau) {
	var mPage = document.getElementById("mainPage"),
		selector = document.getElementById("selector"),
		selectorComponent,
		clickBound;
	//click event handler for the selector
	function onClick(event) {
		//console.log(event);		
		var target = event.target;
		if (target.classList.contains("ui-selector-indicator")) {
			//console.log("Indicator clicked");
			var ItemClicked = event.srcElement.textContent;
			console.log("Item Clicked on home page was: " + ItemClicked);

			//Handel home page click events
			if(ItemClicked == "Switches"){
				tau.changePage("switchesPage");
			}else if(ItemClicked == "Clear Database"){
				//------------------------------------------Clear Database
				//This should be moved to it's own function.
				console.log("Clearing Database");
				localStorage.clear();
				Access_Token = null;
				Access_Url = null;
				switches_DB = null;
				alert("Database Cleared");
				//Maybe we should exit here?
				//------------------------------------------Clear Database
			}else if(ItemClicked == "Routines"){
				tau.changePage("routinesPage");
			}
			return;
		}
	}
	//pagebeforeshow event handler
	mPage.addEventListener("pagebeforeshow", function() {
		clickBound = onClick.bind(null);
		selectorComponent = tau.widget.Selector(selector);
		selector.addEventListener("click", clickBound, false);
	});
	//pagebeforehide event handler
	mPage.addEventListener("pagebeforehide", function() {
		selector.removeEventListener("click", clickBound, false);
		selectorComponent.destroy();
	});
}(window.tau));
//------------------------------------------------------------------------------------Main Page

//------------------------------------------------------------------------------------Switch Page
function SwitchPage(){	
	console.log("SwitchPage()");
	if(SwitchPageRan==true){
		//This page has been ran before...
		//widget.scrollToPosition(0);
		console.log("This page was shown before.");		
		$.when(SwitchPageGetData()).done(function() {
			SwitchPage_Buttons();
		});
	}else{
		console.log("This is the first time the user has looked at this page.");
		//This is the first time the user has looked at this page!
		SwitchPageRan = true;
		$.when(SwitchPageGetData()).done(function() {
			SwitchPage_Buttons();						
		});
	}
}

function SwitchPageGetData(){
	console.log("SwitchPageGetData()");
	$('#Switches').html(''); //Clear Switches
	if(switches_DB != null){ //We have switch data stored!
		console.log("We have switch data stored!");
		try {
			var obj = jQuery.parseJSON(switches_DB);
		} catch (e) {
			alert("There was an error! The database may be corrupted, try clearning it.");
			console.log(e);
			return;
		}
		
		$.each(obj, function(index, element) {
			console.log(index);
			console.log(element);
			
			var id = element.id;
			var label = element.label;
			var value = element.value;
			var type = element.type;					    
			var checked = "";
			if(value=="on"){ var checked = "checked"; }			        	
			$('#Switches').append('\
				<li class="li-has-checkbox">\
					<div class="ui-marquee ui-marquee-gradient marquee">'+label+'</div>\
					<input class="aswitch" deviceid="'+id+'" type="checkbox" ' + checked + '/>\
					<div class="ui-processing" style="display:none;"></div>\
				</li>\
			');
		});
		$('#Switches').append('\
			<li class="">\
				<div id="RefreshSwitchData" class="ui-marquee ui-marquee-gradient marquee">Refresh Data</div>\
			</li>\
		');

		//fancy GUI stuff
		switcherr = document.getElementById("Switches");
		SwitchList_UI = tau.helper.SnapListMarqueeStyle.create(switcherr, {
			marqueeDelay: 0,
			marqueeStyle: "endToEnd"
		});
		
	}else{ //We couldn't find the switches database data, so lets build it.
		console.log("We couldn't find the switches database data, so lets build it.");
		$('#ProcessingMsg').html('Retrieving Switches From SmartThings');
		tau.changePage("processingPage");
		
		console.log("Getting: " +  Access_Url + "/switches");
		console.log("using: " + Access_Token);
		
		$.get({
		    url: Access_Url + "/switches",
		    beforeSend: function(xhr) { 
		      xhr.setRequestHeader('Authorization','Bearer ' + Access_Token);
		    },
		    success: function (data) {
		    	console.log(data);
		    	data = JSON.stringify(data);
		    	console.log(data);
				localStorage.setItem("switches_DB", Encrypt(data)); //STORE THE SWITCH DATA IN THE DATABASE!
				switches_DB = data;
		        tau.changePage("switchesPage");
		    },
		    error: function(e){
		    	console.log(e);
		    	var Response = e.responseText;
		    	
				try {
					var obj = jQuery.parseJSON(Response);
				} catch (e) {
					alert("There was an error!");
					console.log(e);
					return;
				}		    	
		  
		    	console.log(obj);
		    	if(obj.message){
		    		alert(obj.message);
		    	}else if(obj.error){
		    		alert(obj.error);
		    	}else{
		    		alert("There was a problem, could not get switches!");
		    	}
		    	tau.changePage("switchesPage");
		    }
		});
	}
}

function SwitchPage_Buttons(){
	console.log("SwitchPage_Buttons()");

	$('#RefreshSwitchData').click(function(){
		console.log("Refresh Switch Data");
		localStorage.setItem("switches_DB", null);
		switches_DB = null;
		$('#ProcessingMsg').html('Retrieving Switches From SmartThings');
		tau.changePage("processingPage");
		$('#Switches').html('');
		setTimeout(function(){ tau.changePage("switchesPage"); }, 2000); //:)
	});

	$(".aswitch").change(function(){
		console.log('.aswitch click called');
		//tau.changePage("processingPage");
		var WhatSwitch = this;
		
		$(WhatSwitch).hide();
		$(WhatSwitch).parent().find('.ui-processing').show();
		
		var DeviceID = $(this).attr('deviceid');
		console.log("DeviceID: " + DeviceID);
		
		if($(this).is(":checked")) {
			$.get({
			    url: Access_Url + "/switches/"+DeviceID+"/on",
			    beforeSend: function(xhr) { 
			      xhr.setRequestHeader('Authorization','Bearer ' + Access_Token);
			    },
			    success: function (data) {
			    	console.log(data);
			    	data = JSON.stringify(data);
			    	console.log(data);
					$(WhatSwitch).show();
					$(WhatSwitch).parent().find('.ui-processing').hide();
			    },
			    error: function(e){
			    	console.log(e);
			    	var Response = e.responseText;
			    	
					try {
						var obj = jQuery.parseJSON(Response);
					} catch (e) {
						alert("There was an error!");
						console.log(e);
						return;
					}				    	
			    	
			    	console.log(obj);
			    	if(obj.message){
			    		alert(obj.message);
			    	}else if(obj.error){
			    		alert(obj.error);
			    	}else{
			    		alert("There was a problem, could not turn on the device!");
			    	}
					$(WhatSwitch).show();
					$(WhatSwitch).parent().find('.ui-processing').hide();
			    }
			});
		}else{
			$.get({
			    url: Access_Url + "/switches/"+DeviceID+"/off",
			    beforeSend: function(xhr) { 
			      xhr.setRequestHeader('Authorization','Bearer ' + Access_Token);
			    },
			    success: function (data) {
			    	console.log(data);
			    	data = JSON.stringify(data);
			    	console.log(data);
					$(WhatSwitch).show();
					$(WhatSwitch).parent().find('.ui-processing').hide();
			    },
			    error: function(e){
			    	console.log(e);
			    	var Response = e.responseText;
			    	
					try {
						var obj = jQuery.parseJSON(Response);
					} catch (e) {
						alert("There was an error!");
						console.log(e);
						return;
					}					    	
			    	
			    	console.log(obj);
			    	if(obj.message){
			    		alert(obj.message);
			    	}else if(obj.error){
			    		alert(obj.error);
			    	}else{
			    		alert("There was a problem, could not turn off the device!");
			    	}
					$(WhatSwitch).show();
					$(WhatSwitch).parent().find('.ui-processing').hide();
			    }
			});
		}
	});	
}
//------------------------------------------------------------------------------------Switch Page

//------------------------------------------------------------------------------------App's Back Button Handler
window.addEventListener( 'tizenhwkey', function( ev ){
	console.log("Back Key Hit");
	var page = document.getElementsByClassName('ui-page-active')[0],
	pageid = page ? page.id : "";
	if(ev.keyName === "back") {
		if( pageid === "mainPage" ) {
           tizen.application.getCurrentApplication().exit();
		}else if(pageid === "setupPage"){
			tizen.application.getCurrentApplication().exit();
		} else {
	         tau.changePage("mainPage");
		}
	}
});
//------------------------------------------------------------------------------------App's Back Button Handler

//------------------------------------------------------------------------------------Encryption Functions
//temporary, quick but can be much stronger.
function Encrypt(str) {
    if (!str) str = "";
    str = (str == "undefined" || str == "null") ? "" : str;
    try {
        var key = EncryptKey;
        var pos = 0;
        ostr = '';
        while (pos < str.length) {
            ostr = ostr + String.fromCharCode(str.charCodeAt(pos) ^ key);
            pos += 1;
        }
        return ostr;
    } catch (ex) {
        return '';
    }
}
function Decrypt(str) {
    if (!str) str = "";
    str = (str == "undefined" || str == "null") ? "" : str;
    try {
        var key = EncryptKey;
        var pos = 0;
        ostr = '';
        while (pos < str.length) {
            ostr = ostr + String.fromCharCode(key ^ str.charCodeAt(pos));
            pos += 1;
        }
        return ostr;
    } catch (ex) {
        return '';
    }
}
//------------------------------------------------------------------------------------Encryption Functions

//------------------------------------------------------------------------------------Notes
/*
 * might use for dimmers
	window.addEventListener("rotarydetent", rotaryDetentCallback);
	function rotaryDetentCallback(ev) {
		var direction = ev.detail.direction,
		    uiScroller = $('#main').find('.ui-scroller'),
		    scrollPos = $(uiScroller).scrollTop();
		
		console.debug("onRotarydetent: " + direction);
		
		if(direction === "CW"){
		    $(uiScroller).scrollTop(scrollPos + 100); // scroll down 100px
		} else {
		    $(uiScroller).scrollTop(scrollPos - 100); // scroll up 100px
		}
	}
*/
//------------------------------------------------------------------------------------Notes