var Cell = Backbone.Model.extend({});
var CellCollection = Backbone.Collection.extend({
	model: Cell
});
var CellView = Backbone.View.extend({
	tagName: "div",
	className: "Tcell span_1_of_9",
	template: _.template($("#tmpl_cell").html()),
	events: {
		'click' : function(e) {
			var x = this.model.get('x');
			var y = this.model.get('y');
			console.log(x + " " + y);
		},
		'mouseover': function(e) {
			$(this.el).css("background","white");
		},
		'mouseout': function(e) {
			$(this.el).css("background","black");
		}
	},
	render: function() {
		return this.$el.html(this.template());
	}
});

var Row = Backbone.Model.extend({});
var RowCollection = Backbone.Collection.extend({
	model: Row
});
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
				model: new Row({
					x: i
				})
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