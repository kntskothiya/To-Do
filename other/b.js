<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>To-Do App</title>
    <!-- Add your CSS and other links here -->

    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
      integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
      crossorigin="anonymous"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <link rel="stylesheet" href="./css/style.css" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Overpass:400,400i,700,700i"
    />
  </head>

  <body>
    <div class="bg-img"></div>
    <div class="container main-container">
      <div
        class="d-flex justify-content-between align-items-center todo-list-heading"
      >
        <h2>TODO</h2>
        <i class="fas fa-moon"></i>
      </div>
      <div class="todo-list-body">
        <input
          type="text"
          class="form-control todo-input"
          placeholder="Create a new todo..."
        />
        <i class="fas fa-square-plus add-task"></i>
      </div>

      <div class="filter-task mt-3 mb-3">
        <button class="btn btn-secondary btn-sm" id="all">All</button>
        <button class="btn btn-primary btn-sm" id="pending">Pending</button>
        <button class="btn btn-warning btn-sm" id="ongoing">Ongoing</button>
        <button class="btn btn-success btn-sm" id="complete">Completed</button>
        <button class="btn btn-danger btn-sm clearall">Clear All</button>
      </div>

      <ul class="list-group tasks"></ul>
    </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
    <script src="./js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <script src="https://momentjs.com/downloads/moment.min.js"></script>

    <script>
      
      $(document).ready(function () {
        let update = null;
        let uid = 1;
        loadTask();

        function applyfilter() {
          let current = localStorage.getItem("current") || "all";

          $(".new-todo").hide();

          if (current === "all") {
            $(".new-todo").show();
            $(".new-todo[status-code='3']").addClass("strike");
          } else if (current === "pending") {
            $(".new-todo[status-code='" + current + "']").show();
            $(".new-todo[status-code='1']").show();
            $(".new-todo[status-code!='1']").hide();
          } else if (current === "ongoing") {
            $(".new-todo[status-code!='" + current + "']").hide();
            $(".new-todo[status-code='2']").show();
            $(".new-todo[status-code!='2']").hide();
          } else if (current === "complete") {
            $(".new-todo[status-code='" + current + "']").addClass("strike");
            $(".new-todo[status-code='3']").show();
            $(".new-todo[status-code!='3']").hide();
          } else {
            $(".new-todo").show();
          }
        }

        function loadTask() {
          let tasks = JSON.parse(localStorage.getItem("todo-details")) || [];

          tasks.forEach(function (task, index) {
            let listItem = $(
              '<li class="list-group-item new-todo flex-ui justify-content-between align-items-center" ' +
                'id="' +
                (index + 1) +
                '" status-code="' +
                task.status +
                '">' +
                '<input type="range" class="custom-toggle" min="1" max="3" value="' +
                task.status +
                '"/>' +
                '<span class="stopwatch">' +
                task.timeDifference +
                "</span>" +
                '<span class="new-task-text">' +
                task.text +
                "</span>" +
                '<div><i class="fas fa-pencil edit-btn"></i><i class="fas fa-trash-alt delete-btn"></i></div>' +
                "</li>"
            );

            $(".tasks").append(listItem);
            if (task.status === "2") {
              starttimer(listItem);
            }
          });
          applyfilter();
        }

        $(".todo-input").keypress(function (e) {
          if (e.keyCode === 13) {
            $(".add-task").click();
          }
        });

        $(".add-task").click(function () {
          let text = $(".todo-input").val();
          let status = 1;

          if (update) {
            let id = update.attr("id");
            status = update.attr("status-code");

            update.find(".new-task-text").text(text);
            update.attr("status-code", status);
            update.find(".custom-toggle").val(status);
            update = null;

            $(".todo-input").val("");
            savetask();
          } else {
            if (text.trim() !== "") {
              let id = uid++;
              let listItem = $(
                '<li class="list-group-item new-todo flex-ui justify-content-between align-items-center" ' +
                  'id="' +
                  id +
                  '" status-code="' +
                  status +
                  '">' +
                  '<input type="range" class="custom-toggle" min="1" max="3" value="' +
                  status +
                  '"/>' +
                  '<span class="stopwatch">00:00:00</span>' +
                  '<span class="new-task-text">' +
                  text +
                  "</span>" +
                  '<div><i class="fas fa-pencil edit-btn"></i><i class="fas fa-trash-alt delete-btn"></i></div>' +
                  "</li>"
              );

              $(".tasks").append(listItem);
              $(".todo-input").val("");
              savetask();

              if (status === "2") {
                starttimer(listItem);
              }
            }
          }
        });

        $("ul").on("click", ".delete-btn", function () {
          let deletetask = $(this).closest(".new-todo");
          let id = deletetask.attr("id");

          swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: {
              yes: {
                text: "Yes",
                value: true,
              },
              no: {
                text: "No",
                value: false,
              },
            },
            closeOnClickOutside: false,
            closeOnEsc: false,
          }).then((t) => {
            if (t) {
              deletetask.remove();
              swal("Your task has been deleted!", {
                icon: "success",
              });
              savetask();
            } else {
              swal("Your task is safe!", {
                icon: "error",
              });
            }
          });
        });

        var current = 1;

        function trigger() {
          current = (current % 3) + 1;
          let toggle = $(this);
          toggle.removeClass("pending ongoing completed");
          let tasktime = toggle.closest(".new-todo");

          if (current === 1) {
            toggle.addClass("pending");
            resettimer(tasktime);
          } else if (current === 2) {
            toggle.addClass("ongoing");
            starttimer(tasktime); 
          } else {
            toggle.addClass("completed");
            stoptimer(tasktime);
          }

          toggle.val(current);
          tasktime.attr("status-code", current);
          tasktime.toggleClass("strike", current === 3);
          savetask();
        }

        function resettimer(tasktime) {
          tasktime.removeData("start-time");
          tasktime.removeData("end-time");
          tasktime.find(".stopwatch").text("00:00:00");
        }

        function starttimer(tasktime) {
          tasktime.data("start-time", moment().format("hh:mm:ss"));
          updatetimer();
          savetask();
        }

        function stoptimer(tasktime) {
          let stime = tasktime.data("start-time");
          if (stime) {
            let etime = moment().format("hh:mm:ss");
            tasktime.data("end-time", etime);
            updatetimer(tasktime);
            savetask();
          }
        }

        $("ul").on("input", ".custom-toggle", trigger);
        $(".filter-task button").click(function () {
          let filter = $(this).attr("id");
          localStorage.setItem("current", filter);  
          applyfilter();
        });

        $(".clearall").click(function () {
          $(".new-todo").remove();
          savetask();
        });

        $("ul").on("click", ".edit-btn", function () {
          let edit = $(this).closest(".new-todo");
          $(".todo-input").val(edit.find(".new-task-text").text());
          update = edit;
        });

        function savetask() {
          let taskarr = [];
          $(".new-todo").each(function (index) {
            let taskinfo = $(this).find(".new-task-text").text();
            let taskstatus = $(this).attr("status-code");
            let starttime = $(this).data("start-time");
            let endtime = $(this).data("end-time");
            let timedifference = $(this).find(".stopwatch").text();

            taskarr.push({
              id: index + 1,
              text: taskinfo,
              status: taskstatus,
              starttime: starttime,
              endtime: endtime,
              timeDifference: timedifference,
            });
          });
          localStorage.setItem("todo-details", JSON.stringify(taskarr));
        }

        function updatetimer() {
          $(".new-todo").each(function () {
            let starttime = $(this).data("start-time");
            let endtime = $(this).data("end-time");
            let status = $(this).attr("status-code");

            if (starttime && status !== "3") {
              let stime = moment(starttime, "hh:mm:ss");
              let etime = moment(endtime || moment(), "hh:mm:ss");

              let seconds = Math.floor((etime - stime) / 1000);
              seconds = Math.floor(seconds % 60);
              let hours = Math.floor(seconds / 3600);
              let minutes = Math.floor((seconds % 3600) / 60);

              let timeformat = `${(hours < 10 ? "0" : "") + hours}:${
                (minutes < 10 ? "0" : "") + minutes
              }:${(seconds < 10 ? "0" : "") + seconds}`;

              $(this).find(".stopwatch").text(timeformat);
              updateTaskTimeDifference($(this), timeformat);
            }
          });
        }

        function updateTaskTimeDifference(task, timeDifference) {
          let taskId = task.attr("id");
          let taskArray =
            JSON.parse(localStorage.getItem("todo-details")) || [];

          for (let i = 0; i < taskArray.length; i++) {
            if (taskArray[i].id == taskId) {
              taskArray[i].timeDifference = timeDifference;
              localStorage.setItem("todo-details", JSON.stringify(taskArray));
              break;
            }
          }
        }
        setInterval(updatetimer, 1000);
      });
    </script>
  </body>
</html>
