
var Ext = window.Ext4 || window.Ext;
window.console = window.console || (function noop() {}); // keeps IE from blowing up

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    kanbanStateField: 'KanbanState', // Change this to be the Display name of the field used for kanban "group by"

    KanbanToStateMap:{ // not used; just for keeping my head clear
        "Prioritized" : "Defined",
        "In Dev" : "In-Progress",
        "In Test" : "In-Progress",
        "Ready For Acceptance" : "Completed",
        "Accepted" : "Accepted",
        "Electronic Sign-off" : "Accepted"
    },
    StateToKanbanMap:{ // Left-hand side can only have one entry, so I picked the first one in the process
        "Defined" : "Prioritized",
        "In-Progress" : "In Dev",
        "Completed" : "Ready For Acceptance",
        "Accepted" : "Accepted"
    },

    launch: function() { // add an iteration combo for filtering
        this.iterationCombobox = this.add({
            xtype: 'rallyiterationcombobox',
            listeners: {
                ready: this._onIterationComboboxLoad,
                change: this._onIterationComboboxChanged,
                scope: this
            }
        });
        
    },

    _onIterationComboboxLoad: function() {
        var query = this.iterationCombobox.getQueryFromSelected();
        this._loadStories(query);
    },
    _onIterationComboboxChanged: function() {
        var store = this._myGrid.getStore();
        store.clearFilter(true);
        store.filter(this.iterationCombobox.getQueryFromSelected());
    },

    // load stories into store
    _loadStories: function(query) {
        console.log("Loading stories");

        Ext.create('Rally.data.WsapiDataStore', {
                model: 'User Story',
                autoLoad: true,
                filters: query,
                listeners: {
                    load: function(store, records, success) {
                      console.log("Loaded Store with %i records", records.length);
                      this._updateKanbanState(store, records); // populate the grid
                    },

                    update: function(store, rec, modified, opts) {
                        console.log("data updated");
                        this._updateKanbanState(store, rec); 
                    },
                scope: this
              },

            fetch: ['FormattedID', 'Name', 'Owner', 'ScheduleState', 'KanbanState']
        });
    }, // end load features

    _updateKanbanState: function(store, rec) {
        var me = this;
        Ext.Array.each(rec, function(story) {
            var state = story.get('ScheduleState');
            var kbState = story.get(me.kanbanStateField);
            console.log("state: ", state);
            console.log("kbstate:", kbState);
            
            // If the schedule state is not synced to the proper kanban state, fix it
            var mappedKbState = me.StateToKanbanMap[state];
            console.log("Mapped KB State: ", mappedKbState);
            if(kbState != mappedKbState) {
                console.log("Mismatch found");
                story.set(me.kanbanStateField, mappedKbState); 
            }
        });
        this._updateGrid(store);
    },

    _createGrid: function(myStore) {
        console.log("Creating grid", myStore);
        this._myGrid = Ext.create('Rally.ui.grid.Grid', {
            xtype: 'rallygrid',
            title: 'Sync Stories',
            height: '98%',
            store: myStore,
            columnCfgs: ['FormattedID','Name', 'ScheduleState', 'KanbanState', 'Owner' ]// use native Ext formatting - allows cell edits & got rid of errors
        });
        this.add(this._myGrid);
        
        // override the event publish to prevent random refreshes of the whole app when the cell changes
        var celledit = this._myGrid.plugins[0];
        var oldPub = celledit.publish;
        var newPub = function (event, varargs) {
            if (event !== "objectupdate") {
                oldPub.apply(this, arguments);
            } else {
                // no-op
            }
        };

        celledit.publish = Ext.bind(newPub, celledit);
    },
    
    _updateGrid: function(myStore) {
        if (this._myGrid === undefined) {
            this._createGrid(myStore);
        }
        else {
            this._myGrid.reconfigure(myStore);
        }
    }

});