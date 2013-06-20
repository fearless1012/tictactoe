//create socket first 
var socket = io.connect('http://localhost');

socket.on('update', function(data){
	var d = data.result.hadron;
	if(data.status) {
		$.Status("asdf");
		$.each($.Quarks.models, function(i,it) {
			var x = it.get('x');
			var y = it.get('y');
			it.set('p', d[x][y]);
			it.set('allowed', y);
		});
	} else {
		$.Status("Illegal Move");
	}
});

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
		'click' : function(e) {
			e.preventDefault();
			this.send();
		},
		'mouseover': function(e) {
			this.prevColor = $(this.el).css("background");
			if(this.isAllowed(1,1))
				$(this.el).css("background","#595");
			else
			 	$(this.el).css("background","#955")
		},
		'mouseout': function(e) {
			$(this.el).css("background",this.prevColor);
		}
	},
	render: function() {
		var x = this.model.get('x');
		this.$el.html(this.template()).css({
			background: x%2 === 0 ? "#ddd" : "#eee"
		});
		return this.$el;
	}
});

var Hadron = Backbone.Model.extend({});
var HadronView = Backbone.View.extend({
	tagName: "div",
	className: "Thadron",
	render: function() {
		for(var i=0;i<9;i++) {
			var quark = new Quark({
					x: this.model.get('x'),
					y: i,
					p: -1
			});
			$.Quarks.add([quark]);
			this.$el.append(new QuarkView({ model: quark }).render());
		}
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
			var hadron = new HadronView({
				model: new Hadron({ x: i })
			});
			this.$el.append(hadron.render());
		}
	}
});

var Player = Backbone.Model.extend({});
var PlayerView = Backbone.View.extend({});

(function() {
	'use strict';
	$(function() {
		$.Quarks = new QuarkCollection();
		var statusbar = $("#statusbar");
		$.Status = function(message, severity) {
			statusbar.html(message).stop().delay(4000).animate({
				opacity: 0.1
			},1000, function() {
				$(this).html("Status bar").stop().animate({
					opacity: 1
				},250);
			});
		}
		new BoardView({
			model: new Board()
		});
	});
}).apply(this,[]);