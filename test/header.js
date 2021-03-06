/*
  backgrid
  http://github.com/wyuenho/backgrid

  Copyright (c) 2013 Jimmy Yuen Ho Wong and contributors
  Licensed under the MIT license.
*/
describe("A HeaderCell", function () {

  var col;
  var cell;
  beforeEach(function () {
    col = new Backbone.Collection([{id: 2}, {id: 1}, {id: 3}]);

    cell = new Backgrid.HeaderCell({
      column: {
        name: "id",
        cell: "integer"
      },
      collection: col
    });

    cell.render();
  });

  it("renders a table header cell with an anchor wrapping the label text and an optional sort caret", function () {
    expect(cell.el.tagName).toBe("TH");
    expect(cell.$el.find("a").text()).toBe("id");
    expect(cell.$el.find(".sort-caret").length).toBe(1);

    cell.column.set("sortable", false);
    cell.render();
    expect(cell.el.tagName).toBe("TH");
    expect(cell.$el.find("a").text()).toBe("id");
    expect(cell.$el.find(".sort-caret").length).toBe(0);
  });

  it("sorts the underlying collection in ascending order upon clicking the sort caret once", function () {
    cell.$el.find("a").click();
    expect(cell.collection.toJSON()).toEqual([{id: 1}, {id: 2}, {id: 3}]);
  });

  it("sorts the underlying collection in descending order upon clicking the sort caret twice", function () {
    cell.$el.find("a").click().click();
    expect(cell.direction()).toBe("descending");
    expect(cell.collection.toJSON()).toEqual([{id: 3}, {id: 2}, {id: 1}]);
  });

  it("sorts the underlying collection in default order upon clicking the sort caret thrice", function () {
    cell.$el.find("a").click().click().click();
    expect(cell.direction()).toBeNull();
    expect(cell.collection.toJSON()).toEqual([{id: 2}, {id: 1}, {id: 3}]);
  });

  it("with the sortType to `toggle`, sorts the underlying collection in ascending order upon clicking the sort caret once", function(){
    cell.column.set("sortType", "toggle");
    cell.$el.find("a").click();
    expect(cell.direction()).toBe("ascending");
    expect(cell.collection.toJSON()).toEqual([{id: 1}, {id: 2}, {id: 3}]);
  });

  it("with the sortType to `toggle`, sorts the underlying collection in descending order upon clicking the sort caret twice", function(){
    cell.column.set("sortType", "toggle");
    cell.$el.find("a").click().click();
    expect(cell.direction()).toBe("descending");
    expect(cell.collection.toJSON()).toEqual([{id: 3}, {id: 2}, {id: 1}]);
  });

  it("with the sortType to `toggle`, sorts the underlying collection back in ascending order upon clicking the sort caret thrice", function(){
    cell.column.set("sortType", "toggle");
    cell.$el.find("a").click().click().click();
    expect(cell.direction()).toBe("ascending");
    expect(cell.collection.toJSON()).toEqual([{id: 1}, {id: 2}, {id: 3}]);
  });

  it("sorts the underlying collection using a custom value extractor upon clicking the sort caret", function() {

    var sortValue = function (model, attr) {
      return 3 - model.get(attr);
    };

    cell = new Backgrid.HeaderCell({
      collection: col,
      column: {
        name: "id",
        cell: "integer",
        sortValue: sortValue
      },
    }).render();

    cell.$el.find("a").click();
    expect(cell.collection.toJSON()).toEqual([{id: 3}, {id: 2}, {id: 1}]);
  });

  it("can sort on a server-mode Backbone.PageableCollection", function () {

    var oldAjax = $.ajax;
    $.ajax = function (settings) {
      settings.success([{"total_entries": 3}, [{id: 2}, {id: 1}]]);
    };

    var books = new Backbone.PageableCollection([{id: 1}, {id: 2}], {
      url: "test-headercell",
      state: {
        pageSize: 3
      }
    });

    cell = new Backgrid.HeaderCell({
      column: {
        name: "title",
        cell: "string"
      },
      collection: books
    });

    cell.render();

    expect(cell.collection.at(0).get("id")).toBe(1);
    expect(cell.collection.at(1).get("id")).toBe(2);

    cell.$el.find("a").click().click();

    expect(cell.collection.at(0).get("id")).toBe(2);
    expect(cell.collection.at(1).get("id")).toBe(1);

    $.ajax = oldAjax;
  });

  it("can sort on a client-mode Backbone.PageableCollection", function () {

    var books = new Backbone.PageableCollection([{
      title: "Alice's Adventures in Wonderland"
    }, {
      title: "A Tale of Two Cities"
    }, {
      title: "The Catcher in the Rye"
    }], {
      state: {
        pageSize: 1
      },
      mode: "client"
    });

    cell = new Backgrid.HeaderCell({
      column: {
        name: "title",
        cell: "string",
        sortValue: function (model, attr) {
          return model.get(attr).length;
        }
      },
      collection: books
    });

    cell.render();

    cell.$el.find("a").click();

    expect(cell.collection.toJSON()).toEqual([{
      title: "A Tale of Two Cities"
    }]);

    cell.collection.getPage(2);

    expect(cell.collection.toJSON()).toEqual([{
      title: "The Catcher in the Rye"
    }]);

    cell.collection.getPage(3);

    expect(cell.collection.toJSON()).toEqual([{
      title: "Alice's Adventures in Wonderland"
    }]);

    cell.collection.getFirstPage();

    cell.$el.find("a").click();

    expect(cell.collection.toJSON()).toEqual([{
      title: "Alice's Adventures in Wonderland"
    }]);

    cell.$el.find("a").click();

    expect(cell.collection.toJSON()).toEqual([{
      title: "Alice's Adventures in Wonderland"
    }]);

  });

});

describe("A HeaderRow", function () {

  var Book = Backbone.Model.extend({});

  var Books = Backbone.Collection.extend({
    model: Book
  });

  var books;
  var row;

  beforeEach(function () {

    books = new Books([{
      title: "Alice's Adventures in Wonderland",
      year: 1865
    }, {
      title: "A Tale of Two Cities",
      year: 1859
    }, {
      title: "The Catcher in the Rye",
      year: 1951
    }]);

    row = new Backgrid.HeaderRow({
      columns: [{
        name: "name",
        cell: "string"
      }, {
        name: "year",
        cell: "integer"
      }],
      collection: books
    });

    row.render();
  });

  it("renders a row of header cells", function () {
    expect(row.$el[0].tagName).toBe("TR");
    expect(row.$el[0].innerHTML).toBe('<th class="editable sortable renderable"><a>name<b class="sort-caret"></b></a></th>' +
                                      '<th class="editable sortable renderable"><a>year<b class="sort-caret"></b></a></th>');
  });

  it("resets the carets of the non-sorting columns", function () {
    row.$el.find("a").eq(0).click(); // ascending
    row.$el.find("a").eq(1).click(); // ascending, resets the previous
    expect(row.$el.find("a").eq(0).hasClass("ascending")).toBe(false);
    expect(row.$el.find("a").eq(1).hasClass("ascending")).toBe(false);
  });

  it("inserts or removes a cell if a column is added or removed", function () {
    row.columns.add({name: "price", cell: "number"});
    expect(row.$el.children().length).toBe(3);
    expect(row.$el.children().last()[0].outerHTML).toBe('<th class="editable sortable renderable"><a>price<b class="sort-caret"></b></a></th>');

    row.columns.add({name: "publisher", cell: "string", renderable: false});
    expect(row.$el.children().length).toBe(4);
    expect(row.$el.children().last().find("a").text()).toBe("publisher");
    expect(row.$el.children().last().hasClass("renderable")).toBe(false);

    row.columns.remove(row.columns.first());
    expect(row.$el.children().length).toBe(3);
    expect(row.$el.children().first()[0].outerHTML).toBe('<th class="editable sortable renderable"><a>year<b class="sort-caret"></b></a></th>');
  });

});

describe("A Header", function () {

  var Book = Backbone.Model.extend({});

  var Books = Backbone.Collection.extend({
    model: Book
  });

  var books;
  var head;

  beforeEach(function () {

    books = new Books([{
      title: "Alice's Adventures in Wonderland",
      year: 1865
    }, {
      title: "A Tale of Two Cities",
      year: 1859
    }, {
      title: "The Catcher in the Rye",
      year: 1951
    }]);

    head = new Backgrid.Header({
      columns: [{
        name: "name",
        cell: "string"
      }, {
        name: "year",
        cell: "integer"
      }],
      collection: books
    });

    head.render();
  });

  it("renders a header with a row of header cells", function () {
    expect(head.$el[0].tagName).toBe("THEAD");
    expect(head.$el[0].innerHTML).toBe('<tr><th class="editable sortable renderable"><a>name<b class="sort-caret"></b></a></th>' +
                                      '<th class="editable sortable renderable"><a>year<b class="sort-caret"></b></a></th></tr>');
  });

});
