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
		return { x: this.x/3, y: this.y/3 }
	};
	var send = methods.send = function() {
		var m = molecule.apply(this, arguments);
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
		//delete all newly created stuff
		delete this.x;
		delete this.y;
		return ret;
	};
}

//Models and Views
var Cell = Backbone.Model.extend({});
var CellView = Backbone.View.extend({
	tagName: "div",
	className: "Tcell",
	template: _.template($("#tmpl_cell").html()),
	isAllowed: Algo('isAllowed'),
	events: {
		'click' : function(e) {
			var x = this.model.get('x');
			var y = this.model.get('y');
			console.log(x + " " + y);
		},
		'mouseover': function(e) {
			if(this.isAllowed(1,1))
				$(this.el).css("background","#dfd");
			else
				$(this.el).css("background","#edd")
		},
		'mouseout': function(e) {
			$(this.el).css("background","#eee");
		}
	},
	render: function() {
		return this.$el.html(this.template());
	}
});

var Row = Backbone.Model.extend({});
var RowView = Backbone.View.extend({
	tagName: "div",
	className: "Trow",
	render: function() {
		for(var i=0;i<9;i++) {
			var cell = new CellView({
				model: new Cell({
					x: this.model.get('x'),
					y: i
				})
			});
			$(this.el).append(cell.render());
		}
		return this.el;
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
	$(function() {
		new BoardView({
			model: new Board()
		});
	});
}).apply(this,[]);