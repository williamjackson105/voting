module = {}; //allows us to reuse code client and server-side

var socket;
var myip;
function ip_callback(o) {
   myip = o.host;
}

socket = io.connect(window.location.hostname, {port: 3000});

socket.on("updateplayerlist", display_playerlist);
socket.on("updateleaderboard", display_leader_board);
socket.on("checkedvote", checkedvote);

$(document).ready(function()
{
	socket.emit("get-players-by-page", {page: 0});
	socket.emit("get-players-on-leader-board", {});

	$("#prev").prop('disabled', true);

	$("#prev").live('click', function(e) {
		e.preventDefault();

		var page = $("#pagenum").val();
		page--;
		$("#pagenum").val(page);

		if (page == 0)
		{
			$("#prev").prop('disabled', true);
		}
		$("#next").prop('disabled', false);

		socket.emit("get-players-by-page", {page: page});
	});

	$("#next").live('click', function(e) {
		e.preventDefault();

		var page = $("#pagenum").val();
		page++;
		$("#pagenum").val(page);

		$("#prev").prop('disabled', false);

		socket.emit("get-players-by-page", {page: page});
	});

});

function display_playerlist(data)
{		
	if (data.playerlist.length < 9)
	{
		$("#next").prop('disabled', true);
	}

	var htm = "";
	for( var i in data.playerlist )
	{
		var player = data.playerlist[i];

		htm += "<div class='playersbox'>";
		htm +=    "<div>";
		htm +=        "<li class='player'><img src='images/player1.jpg' width='86' height='73'></li>";
		htm +=        "<li class='playername'>" + player.name + "</li>";
		htm +=        "<li class='sitename'>" + player.url + "</li>";
		htm +=    "</div>";
		htm +=    "<li class='vote'><a href='#' onclick=onVote('" + player.name + "',"+ player.vote + ")><img src='images/button_vote.png'  width='92' height='19' border='0'></a></li>";
		htm +=    "<li><input type='text' id='vote-" + player.name + "' value='" + player.vote + "' /></li>";
		htm += "</div>";		
	}
	$('.leftpanel').html(htm); 

}

function display_leader_board(data)
{
	var htm = "";
	var n = 0;
	for( var i in data.playerlist )
	{
		var player = data.playerlist[i];
		n ++;

		htm += "<li>";
		htm +=        n + ".  " + player.name;
		htm += "</li>";		
	}
	$('.leaderboard_main3').html(htm);
}

function onVote(player, vote){
	
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!

	var yyyy = today.getFullYear();
	if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = mm+'/'+dd+'/'+yyyy;
	
	socket.emit("update-vote", {playername: player, vote: vote, ip: myip, today:today});

}

function checkedvote(data) {

	if (data.updated == 0)
	{
		alert("You have already voted this player on today!");
		return;
	}
	
	var val = Number($("#vote-"+data.name).val());
	$("#vote-"+data.name).val(val+1);
}