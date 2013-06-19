//create socket first 
var socket = io.connect('http://localhost');

socket.on('update', function(data){
	console.log(data.status);
	var d = data.result.board;
	if(data.status) {
		$.each($.Quarks.models, function(i,it) {
			var x = it.get('x');
			var y = it.get('y');
			it.set('p', d[x][y]);
		});
	} else {

	}
});

//Some Common functions
function Default(o,d,t) {
	'use strict';
	if("string" === typeof t)
		return t === typeof o ? o : d;
	return 'undefined' === typeof o ? d : o;
}
function Algo(what) {
	'use strict';
	if(!_.isString(what)) return function() {};

	var methods = {};
	//each method will be called with first two parameters as x and y
	//other arguments proceed
	var isAllowed = methods.isAllowed = function(ix,iy) {
		if( Math.floor(this.x/3) === ix &&
			Math.floor(this.y/3) === iy ) return true;
		return false;
	};
	var molecule = methods.molecule = function() {
		return { x: Math.floor(this.x/3), y: Math.floor(this.y/3) }
	};
	var send = methods.send = function() {
		var x = this.model.get('x');
		var y = this.model.get('y');
		console.log(x,y);
		socket.emit('play', {
			i: x,
			j: y
		});
	}

	var validate = function() {
		if('undefined' === typeof this.model) return false;
		if('undefined' === typeof this.model.get) return false;
		var x = Default(this.model.get('x'), -1, "number"),
			y = Default(this.model.get('y'), -1, "number");
		if(x>=0 && x<9 && y>=0 && y<9) return [x,y];
		return false;
	};

	return function() {
		var pos = validate.apply(this,arguments);
		if(pos === false) return false;
		var ret = false;
		if('function' === typeof methods[what]) {
			this.x = pos[0];
			this.y = pos[1];
			ret = methods[what].apply(this, arguments);
		}
		//delete all newly created stuff, since references are passed
		delete this.x;
		delete this.y;
		return ret;
	};
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
	isAllowed: Algo('isAllowed'),
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
	events: {
		'click' : function(e) {
			e.preventDefault();
			Algo('send').apply(this,[]);
		},
		'mouseover': function(e) {
			// if(this.isAllowed(1,1) || true)
			// 	$(this.el).css("background","#dfd");
			// else
			// 	$(this.el).css("background","#edd")
		},
		'mouseout': function(e) {
			// $(this.el).css("background","#eee");
		}
	},
	render: function() {
		this.$el.html(this.template()).css("background", "#"+this.model.get('x')+"3"+this.model.get('y'));
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
		new BoardView({
			model: new Board()
		});
	});
}).apply(this,[]);