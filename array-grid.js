/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */ 

Ext.onReady(function(){
    Ext.QuickTips.init();
    
     var socket = new io.Socket('127.0.0.1', {port: 8080});
	socket.connect();
	
    // NOTE: This is an example showing simple state management. During development,
    // it is generally best to disable state management as dynamically-generated ids
    // can change across page loads, leading to unpredictable results.  The developer
    // should ensure that stable state ids are set for stateful components in real apps.    
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());

    // create the data store
    var store = new Ext.data.ArrayStore({
        fields: [
           {name: 'date'},
           {name: 'message'},
           {name: 'referer'}
        ]
    });

	var recId = 0;

    // create the Grid
    var grid = new Ext.grid.GridPanel({
        store: store,
        columns: [
            {
                id       : 'date',
                header   : 'Date', 
                width    : 50, 
                sortable : true, 
                dataIndex: 'date'
            },
            {
                id       : 'message',
                header   : 'Message', 
                width    : 25, 
                sortable : true, 
                dataIndex: 'message'
            },
            {
                id       : 'referer',
                header   : 'Referer', 
                width    : 200, 
                sortable : true, 
                dataIndex: 'referer'
            }
        ],
        stripeRows: true,
        autoExpandColumn: 'message',
        height: document.body.clientHeight,
        width: document.body.clientWidth,
        title: 'Array Grid',
        // config options for stateful behavior
        stateful: true,
        stateId: 'grid'
    });

	socket.on('message', function(serverdata) {	 	
	 	contentObject = JSON.parse(serverdata);
	 	var defaultData = {
    		'message': contentObject.content,
    		'date': contentObject.date,
    		'referer': contentObject.referer
		};
  		var currentRecord = new store.recordType(defaultData, ++recId);
  		store.add(currentRecord);
      });
    // render the grid to the specified div in the page
    grid.render('grid-example');
});
