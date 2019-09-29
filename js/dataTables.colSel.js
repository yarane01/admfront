(function ($) {
    jQuery.fn.colSel = function (table, options) {
        options = $.extend({
            exclude: []
        }, options);

        var visObject = options.visObject;
        var tablename = table.init().name;
        var menu = $('<div>', {class: "dropdown dropdown-hover", style: "display: inline"});
        var button = $('<button>', {
            class: "btn btn-info dropdown-toggle",
            type: "button",
            'data-toggle': "dropdown",
            text: "Columns"
        });
        var span = $('<span>', {class: 'caret'});
        span.appendTo(button);
        button.appendTo(menu);

        var ul = $('<ul>', {class: 'dropdown-menu dropdown-menu-right'}).appendTo(menu);
        var headers = table.columns().header();
        for (var i = 0; i < headers.length; i++) {
            var h = $(headers[i]).text();
            if (h != "") {
                var column = table.init().columns[i];
                if (!column.save) continue;
                var savename = undefined;
                if (options.save == true)
                    savename = "portal.tables." + options.tableName + "." + h.replace(/\s+/g, '');
                var li = $('<li>');
                var a = $('<a>', {
                    href: "#",
                    class:"selector",
                    'data-column': i,
                    text: h,
                    on: {
                        click: function (e) {
                            e.preventDefault();
                            var colIndex = $(this).attr('data-column');
                            var col = table.column(colIndex);
                            col.visible(!col.visible());
                            $(this).toggleClass("selector-hide selector-show");
                            var colName = table.init().columns[colIndex].name;
                            visObject[tablename][colName] = col.visible();
                            options.saveFunc();
                        }
                    }
                }).appendTo(li);
                var value = visObject[tablename][column.name];
                if (!value) {
                    table.column(i).visible(false);
                    a.addClass("selector-hide");
                }
                else a.addClass("selector-show");
                li.appendTo(ul);
            }
            else {
            }
        }
        return menu;
    };
})(jQuery);


