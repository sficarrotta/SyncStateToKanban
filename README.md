SyncFields
=========================

## Overview
This app displays a grid of stories filtered by an iteration timebox. If you 
click the "SyncStatuses"button, the app looks at the KanbanState field and 
compares it to the ScheduleState field. If the statuses are out of sync
(someone changed the ScheduleState manually rather thanvia the Kanban board) 
then the Kanban state will be set to the appropriate KanbanState that is mapped 
to the ScheduleState. Note that the mapping is defined within this app - it is 
not fetching mapping information from the Kanban board.

## How to modify
Change the value of kanbanStateField to be the Display Name of the field that is
used by the kanban for the group by (kanban columns)

Change the StateToKanbanMap mapping to match the values of your ScheduleState and
KanbanState. Note that the KanbanState values must be unique, so if you have many
KanbanState values mapping to the same ScheduleState values you'll need to decide 
which KanbanState to map to. In this example, I had "In QA" and "In Dev" 
KanbanStates, both of which map to the "In-Progress" ScheduleState in the kanban
board, but in the app I map "In-Progress" to the first mapped KanbanState, which
is "In Dev". 

Change the buttonLabel variable near the top of the app to change the button
text.
 
Screencast Demo
---------------

http://www.screencast.com/users/SummerFicarrotta/folders/Default/media/1ef7ea57-69f9-4a28-9d6f-7fc629840a27

Screenshot
----------

![Rally Tree Grid Screenshot](https://github.com/sficarrotta/SyncStateToKanban/tree/master/deploy/SyncStatus.png)
## License

AppTemplate is released under the MIT license.  See the file [LICENSE](https://raw.github.com/RallyApps/AppTemplate/master/LICENSE) for the full text.
