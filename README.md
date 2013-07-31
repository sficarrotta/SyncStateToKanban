SyncFields
=========================

## Overview
This app looks at the KanbanState field and compares it to the ScheduleState field
If they are out of sync (someone changed the ScheduleState manually rather than
via the Kanban board) then the Kanban state will be set to the first appropriate
KanbanState that is mapped to the ScheduleState. Note that the mapping is defined
within this app - it is not fetching mapping information from the Kanban board.

Change the value of kanbanStateField to be the Display Name of the field that is
used by the kanban for the group by (kanban columns)

Change the StateToKanbanMap mapping to match the values of your ScheduleState and
KanbanState. Note that the KanbanState values must be unique, so if you have many
KanbanState values mapping to the same ScheduleState values you'll need to decide 
which KanbanState to map to. In this example, I have "In QA" and "In Dev" 
KanbanStates, both of which map to the "In-Progress" ScheduleState in the kanban
board, but in the app I map "In-Progress" to the first mapped KanbanState, which
is "In Dev". 

Possible improvements:
1. Create Button to kick-off update
2. Make columns editable
 

## License

AppTemplate is released under the MIT license.  See the file [LICENSE](https://raw.github.com/RallyApps/AppTemplate/master/LICENSE) for the full text.
