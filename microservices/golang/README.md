# Websocket Consumer

This program connects continuously to a BMI live timing websocket and saves the data to a database.

## Websocket Format

```json
{
  "T":1708452000,
  "CE":1,
  "CS":1,
  "D":[
    {
      "LP":0,
      "A":41825,
      "B":36580,
      "K":"8",
      "G":"",
      "D":3591187,
      "L":11,
      "T":36580,
      "R":5,
      "N":"Maty",
      "P":1,
      "M":0
    },
    {
      "LP":0,
      "A":40565,
      "B":37578,
      "K":"14",
      "G":"00.998",
      "D":3591175,
      "L":11,
      "T":40548,
      "R":5,
      "N":"leiño",
      "P":2,
      "M":0
    },
    {
      "LP":0,
      "A":45105,
      "B":40001,
      "K":"9",
      "G":"03.421",
      "D":3591177,
      "L":10,
      "T":40452,
      "R":5,
      "N":"benjamin seguel",
      "P":3,
      "M":0
    },
    {
      "LP":0,
      "A":50421,
      "B":40318,
      "K":"1",
      "G":"03.738",
      "D":3591176,
      "L":9,
      "T":41340,
      "R":5,
      "N":"bastian seguel",
      "P":4,
      "M":0
    },
    {
      "LP":0,
      "A":58463,
      "B":52666,
      "K":"17",
      "G":"16.086",
      "D":3591188,
      "L":8,
      "T":52666,
      "R":5,
      "N":"Ale",
      "P":5,
      "M":0
    }
  ],
  "EM":0,
  "C":410909,
  "N":"[HEAT] 33 - Carrera XL ",
  "E":1,
  "R":1,
  "L":0,
  "S":1
}
```

## JSON Heat Attributes

* `N` = Heat Name
* `S` = State
  * `0` = Not Started
  * `1` = Running
  * `2` = Paused
  * `3` = Stopped
  * `4` = Finished
  * `5` = Next Heat
* `E` = End Condition
  * `0` = The heat needs manual ending
  * `1` = The heat finishes after X time
  * `2` = The heat finishes after X laps
  * `3` = The heat finishes after X laps or X laps, whatever happens first
* `R` = Race Mode
  * `0` = Most laps wins
  * `1` = The best laptime is the winner
  * `2` = The best average time is the winner
* `D` = Drivers \[array\]. See "JSON Driver Attributes".
* `C` = Counter in Milliseconds
* `CS` = Clock Started
  * `0` = Not started
  * `1` = Started
* `L` = Remaining Laps
* `T` = Actual Heat Start


## JSON Driver Attributes

This is what is the array under the key `D` od the main JSON object.

* `D` = Driver ID
* `M` = Webmember ID
* `N` = Driver Name
* `K` = Kart Number
* `P` = Position
* `L` = Laps
* `T` = Last Lap Time in milliseconds
* `A` = Average Lap Time
* `B` = Best Lap Time
* `G` = Gap
* `LP` = Last Passing (`0` not the last passing, `1` last passing)
* `R` = Last Record





