
var Ext = window.Ext4 || window.Ext;
window.console = window.console || (function noop() {}); // keeps IE from blowing up
var buttonLabel = 'Sync Statuses';

Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    kanbanStateField: 'KanbanState', // Change this to be the Display name of the field used for kanban "group by"

    // Map left-hand side is the ScheduleState, right-hand is KanbanState. If
    // you have one story state mapped to many kanban states, you can only map
    // to one of them. I chose to use the first valid kanban state for a given
    // story state.
    StateToKanbanMap:{ 
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
        var syncButton = {
            xtype: 'rallybutton',
            text: buttonLabel,
            handler: function() { //sync the kanban state to the schedule state
                this._updateKanbanState(this._myStore, this._records);
            },
            scope: this
        };
        
        this.add(syncButton);
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

        this._myStore = Ext.create('Rally.data.WsapiDataStore', {
            model: 'User Story',
            autoLoad: true,
            filters: query,
            listeners: {
                load: function(store, records, success) {
                    console.log("Loaded Store with %i records", records.length);
                    this._records = records;
                    this._updateGrid(store);
                },
                update: function(store, records, modified, opts) {
                    console.log("data updated");
                    this._records = records;
                    this._updateGrid(store); 
                },
                scope: this
            },
            fetch: ['FormattedID', 'Name', 'Owner', 'ScheduleState', 'KanbanState']
        });
    }, // end load features

    _updateKanbanState: function(store, records) {
        console.log("Sync Requested");
        var me = this;
        Ext.Array.each(records, function(story) {
            var state = story.get('ScheduleState');
            var kbState = story.get(me.kanbanStateField);
            
            // If the schedule state is not synced to the proper kanban state, fix it
            var mappedKbState = me.StateToKanbanMap[state];
            if(kbState != mappedKbState) {
                console.log("Mismatch found");
                story.set(me.kanbanStateField, mappedKbState); 
                story.save();
            }
        });
        this._updateGrid(store);
    },

    _createGrid: function(myStore) {
        console.log("Creating grid", myStore);
        this._myGrid = Ext.create('Rally.ui.grid.Grid', {
            xtype: 'rallygrid',
            title: 'Stories that may need syncing',
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
    
    _updateGrid: function(store) {
        if (this._myGrid === undefined) { //if the grid has not already been created
            this._createGrid(store);
        }
        else { // just repopulate the existing grid
            this._myGrid.reconfigure(store);
        }
    }
});