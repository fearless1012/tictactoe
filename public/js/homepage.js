$(function() {
	'use strict';
	var table = $("#games");
	var players = ["O","X"];
	var geta = function(link,classes,text) {
		if(typeof text === "undefined") text = "/"+link;
		return $("<a/>").attr({
			href: location.href + link,
			"class": classes
		}).text(text);
	}
	$.each(DATA, function(i,it){
		var tr=$("<tr/>").appendTo(table);
		$("<td/>").html(i+1).appendTo(tr);
		$("<td/>").append(geta(it.name)).appendTo(tr);
		var isFullText = it.winner === -1 ? 
						 geta(it.name,"label label-warning", "In Progress"): 
						 geta(it.name,"label label-success", players[it.winner] + " won");
		$("<td/>").append(isFullText).appendTo(tr);
		var action = it.isFull ? geta(it.name,"btn-small btn-warning","View") : geta(it.name,"btn-small btn-success","Join");
		$("<td/>").append(action).appendTo(tr);
	});
	function randomString() {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 8;
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		return randomstring;
	}
	$("#newgame").click(function(e){
		$(this).attr("href", randomString());
	});
	$('#gamestable').dataTable( {
		"sDom": "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
		"sPaginationType": "bootstrap",
		"oLanguage": {
			"sLengthMenu": "_MENU_ records per page"
		}
	} );
});