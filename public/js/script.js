//create socket first
var socket = io.connect('http://' + location.hostname);

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
			this.prevColor = $(this.el).css("background");
			if(this.isAllowed(1,1))
				$(this.el).css("background","#3c7ebd");
			else
			 	$(this.el).css("background","#7e3cbd");
		},
		'mouseout': function(e) {
			$(this.el).css("background",this.prevColor);
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
		$.Quarks = new QuarkCollection();
		$.Hadrons = new HadronCollection();
		var bar = $("#GAME");
		$.Status = function(state) {
			var flag = false;
			if(state) {
				bar.css("border-color", "green");
				setTimeout(function() {
					bar.css("border-color", "#ddd");
				},100);
			} else {
				bar.css("border-color", "red");
				setTimeout(function() {
					bar.css("border-color", "#ddd");
				},100);
			}
		}
		new BoardView({
			model: new Board()
		});
	});
}).apply(this,[]);
