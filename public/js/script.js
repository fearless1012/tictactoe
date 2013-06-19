//First create Deferreds container that 
//we ll be using as mutexes
var Mutexes = {};
Mutexes['play'] = $.Deferred();
Mutexes['board'] = [];

//create socket first 
var socket = io.connect('http://localhost');

socket.on('update', function(data){
	console.log(data.status);
	if(data.status) {
		if(Mutexes['play'].state() === 'pending')
			Mutexes['play'].resolve(data.result);
	} else {
		if(Mutexes['play'].state() === 'pending')
			Mutexes['play'].reject(data.result);
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
	var send = methods.send = function(d) {
		var m = molecule.apply(this, arguments);
		Mutexes['play'] = $.Deferred();
		socket.emit('play', {
			i: m.x,
			j: m.y
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

$.CellCollection = [];

//Models and Views
var Cell = Backbone.Model.extend({});
var CellView = Backbone.View.extend({
	tagName: "div",
	className: "Tcell",
	template: _.template($("#tmpl_cell").html()),
	isAllowed: Algo('isAllowed'),
	initialize: function() {
		var x = this.model.get('x');
		var y = this.model.get('y');
		var that = this;
		$.when(Mutexes['board'][x][y]).then(function(v){
			that.$el.html("X");
		}, function(data) {
			console.log(data);
		});
	},
	events: {
		'click' : function(e) {
			e.preventDefault();
			Algo('send').apply(this,[]);
		},
		'mouseover': function(e) {
			if(this.isAllowed(1,1) || true)
				$(this.el).css("background","#dfd");
			else
				$(this.el).css("background","#edd")
		},
		'mouseout': function(e) {
			$(this.el).css("background","#eee");
		}
	},
	render: function() {
		this.$el.html(this.template());
		$.CellCollection.push(this.$el);
		return this.$el;
	}
});

var Row = Backbone.Model.extend({});
var RowView = Backbone.View.extend({
	tagName: "div",
	className: "Trow",
	render: function() {
		for(var i=0;i<9;i++) {
			var cell = new Cell({
					x: this.model.get('x'),
					y: i
			});
			this.$el.append(new CellView({ model: cell }).render());
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
			var row = new RowView({
				model: new Row({ x: i })
			});
			this.$el.append(row.render());
		}
	}
});

var Player = Backbone.Model.extend({});
var PlayerView = Backbone.View.extend({});

(function() {
	'use strict';
	for(var i=0;i<9;i++) {
		Mutexes['board'][i] = [];
		for(var j=0;j<9;j++) {
			Mutexes['board'][i].push($.Deferred());
		}
	}
	$(function() {
		new BoardView({
			model: new Board()
		});
		$.when(Mutexes['play']).then(function(data) {
			console.log(data);
		}, function(data) {
			console.log(data);
		}, function(data) {
			console.log(x + "% done");
		});
	});
}).apply(this,[]);