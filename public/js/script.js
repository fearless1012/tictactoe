//Blah Blah stuff
jQuery.fn.disableTextSelect = function() {
	return this.each(function() {
		$(this).css({
			'MozUserSelect':'none',
			'webkitUserSelect':'none'
		}).attr('unselectable','on').bind('selectstart', function() {
			return false;
		});
	});
};
jQuery.fn.enableTextSelect = function() {
	return this.each(function() {
		$(this).css({
			'MozUserSelect':'',
			'webkitUserSelect':''
		}).attr('unselectable','off').unbind('selectstart');
	});
};

//create socket first
var socket = io.connect('http://' + location.href);

socket.on('user', function(data) {
	var p = $.Player = data.player;
	var players = ['O', 'X'];
	$("#player").html(players[p]);
	UpdateGame(data);
});

socket.on('update', function(data){
	var d = data.state.hadron;
	if(data.status) {
		$.Status(true);
		UpdateGame(data)
	} else {
		$.Status(false);
	}
});

function UpdateGame(data) {
	if(data.state.winner !== -1) {
		//game over
		var players = ['O', 'X'];
		if(data.state.winner === $.Player) {
			$("#GAME").fadeOut(500,function() {
				$("#iwon").html("<h1>YOU <br/>WIN :)</h1>").fadeIn(250);
			});
		} else {
			var p = $.Player === 0 ? 1:0;
			$("#GAME").fadeOut(500,function() {
				$("#uwon").html("<h1>Player "+players[p]+" wins :(</h1>").fadeIn(250);
			});
		}
		return;
	}
	if(data.expect === $.Player) {
		$("#who").html("Your Turn");
	} else {
		$("#who").html("Opponent's Turn");
	}
	var b = data.state.board;
	$.each($.Hadrons.models, function(i,it) {
		var x = it.get('x');
		it.set('p',b[x]);
		if(data.nextHadron === x) it.set('here',true);
		else it.set('here',false);
	});
	var d = data.state.hadron;
	$.each($.Quarks.models, function(i,it) {
		var x = it.get('x');
		var y = it.get('y');
		it.set('p', d[x][y]);
	});
}
//Some Common functions
function Default(o,d,t) {
	'use strict';
	if("string" === typeof t)
		return t === typeof o ? o : d;
	return 'undefined' === typeof o ? d : o;
}

//Models and Views
var Quark = Backbone.Model.extend({});
var QuarkCollection = Backbone.Collection.extend({
	model: Quark
});
var QuarkView = Backbone.View.extend({
	tagName: "div",
	className: "Tquark",
	template: _.template($("#tmpl_quark").html()),
	isAllowed: function(ix,iy) {
		var hadron = this.model.get('allowed');

		if( Math.floor(this.x/3) === ix &&
			Math.floor(this.y/3) === iy ) return true;
		return false;
	},
	initialize: function() {
		this.model.on('change', this.update, this);
		var x = this.model.get('x');
		var y = this.model.get('y');
		var that = this;
	},
	update: function() {
		var p = this.model.get('p');
		if(p===0) this.$el.html("O");
		else if(p===1) this.$el.html("X");
	},
	send: function() {
		var x = this.model.get('x');
		var y = this.model.get('y');
		socket.emit('play', {
			i: x,
			j: y
		});
	},
	events: {
		'mouseup' : function(e) {
			e.preventDefault();
			this.send();
		},
		'mouseover': function(e) {
			// this.prevColor = $(this.el).css("background");
			// if(this.isAllowed(1,1))
			// 	$(this.el).css("background","#3c7ebd");
			// else
			//  	$(this.el).css("background","#7e3cbd");
		},
		'mouseout': function(e) {
			// $(this.el).css("background",this.prevColor);
		}
	},
	render: function() {
		var x = this.model.get('x');
		this.$el.html(this.template());
		return this.$el;
	}
});

var Hadron = Backbone.Model.extend({});
var HadronCollection = Backbone.Collection.extend({});
var HadronView = Backbone.View.extend({
	tagName: "div",
	className: "Thadron",
	initialize: function() {
		this.model.on('change',this.update,this);
	},
	update: function() {
		if(this.model.get('here') === true) this.$el.css("background", "#dfd");
		else this.$el.css("background",this.prevColor);
		if(this.model.get('p') === 1) this.$el.css("border-color", "red");
		else if(this.model.get('p') === 0) this.$el.css("border-color", "blue");
	},
	render: function() {
		var x = this.model.get('x');
		for(var i=0;i<9;i++) {
			var quark = new Quark({
					x: x,
					y: i,
					p: -1
			});
			$.Quarks.add([quark]);
			this.$el.append(new QuarkView({ model: quark }).render());
		}
		this.prevColor = x%2 === 0 ? "#fff" : "#eee";
		this.$el.css({
			background: this.prevColor
		});
		return this.$el;
	}
});

var Board = Backbone.Model.extend({});
var BoardView = Backbone.View.extend({
	el: "#GAME",
	initialize: function() {
		this.render();
	},
	render: function() {
		for(var i=0;i<9;i++) {
			var hadron = new Hadron({x : i});
			$.Hadrons.add([hadron]);
			this.$el.append(new HadronView({
				model: hadron
			}).render());
		}
	}
});

var Player = Backbone.Model.extend({});
var PlayerView = Backbone.View.extend({});

(function() {
	'use strict';
	$(function() {
		$("#GAME").disableTextSelect();
		$.Quarks = new QuarkCollection();
		$.Hadrons = new HadronCollection();
		var bar = $("#GAME");
		$.Status = function(state) {
			var flag = false, timeout=500;
			if(state) {
				bar.stop().animate({ borderColor: "#5f5" }, timeout/4, function(){
					$(this).stop().animate({ borderColor: "#ddd" }, timeout);
				});
			} else {
				bar.stop().animate({ borderColor: "#f55" }, timeout/4, function(){
					$(this).stop().animate({ borderColor: "#ddd" }, timeout);
				});
			}
		}
		new BoardView({
			model: new Board()
		});
	});
}).apply(this,[]);
