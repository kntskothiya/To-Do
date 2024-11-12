$(document).ready(function () {
      let update = null;
      let uid = 1;
      loadtask();

      function applyfilter() {
        let current = localStorage.getItem("current") || "all";

        $(".new-todo").hide();

        if (current === "all") {
          $(".new-todo").show();
          $(".new-todo[status-code='3']").addClass("strike");
        } else if (current === "pending") {
          $(".new-todo[status-code='1']").show();
          $(".new-todo[status-code!='1']").hide();
        } else if (current === "ongoing") {
          $(".new-todo[status-code='2']").show();
          $(".new-todo[status-code!='2']").hide();
        } else if (current === "complete") {
          $(".new-todo[status-code='3']").show().addClass("strike");
          $(".new-todo[status-code!='3']").hide();
        } else {
          $(".new-todo").show();
        }
      }

      function loadtask() {
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
            task.timediff +
            "</span>" +
            '<span class="new-task-text">' +
            task.text +
            "</span>" +
            '<div><i class="fas fa-pencil edit-btn"></i><i class="fas fa-trash-alt delete-btn"></i></div>' +
            "</li>"
          );

          let toggleClass =
            task.toggleColor === "ongoing"
              ? "ongoing"
              : task.toggleColor === "completed"
                ? "completed"
                : "pending";

          listItem.find(".custom-toggle").addClass(toggleClass);

          localStorage.getItem("current");
          $(".tasks").append(listItem);
          if (task.status === "2") {
            starttimer(listItem);
          } else if (task.status === "3") {
            $(".new-todo").addClass("strike");
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
        let taskid = tasktime.attr("id");
        let storestime = localStorage.getItem(`start-time-${taskid}`);

        if (storestime) {
          tasktime.data("start-time", storestime);
          updatetimer();
        } else {
          let starttime = moment().format("hh:mm:ss");
          tasktime.data("start-time", starttime);
          localStorage.setItem(`start-time-${taskid}`, starttime);
        }
        savetask();
      }

      function stoptimer(tasktime) {
        let stime = tasktime.data("start-time");
        let taskId = tasktime.attr("id");

        if (stime) {
          let etime = moment().format("hh:mm:ss");
          tasktime.data("end-time", etime);
          updatetimer(tasktime);

          localStorage.removeItem(`start-time-${taskId}`);
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
          let timediff = $(this).find(".stopwatch").text();
          let toggleColor = $(this).find(".custom-toggle").hasClass("ongoing")
            ? "ongoing"
            : $(this).find(".custom-toggle").hasClass("completed")
              ? "completed"
              : "pending";

          taskarr.push({
            id: index + 1,
            text: taskinfo,
            status: taskstatus,
            starttime: starttime,
            endtime: endtime,
            timediff: timediff,
            toggleColor: toggleColor,
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

            let timeformat = `${(hours < 10 ? "0" : "") + hours}:${(minutes < 10 ? "0" : "") + minutes
              }:${(seconds < 10 ? "0" : "") + seconds}`;

            $(this).find(".stopwatch").text(timeformat);
            timeduration($(this), timeformat);
          }
        });
      }

      function timeduration(task, timediff) {
        let taskid = task.attr("id");
        let taskarray =
          JSON.parse(localStorage.getItem("todo-details")) || [];

        for (let i = 0; i < taskarray.length; i++) {
          if (taskarray[i].id == taskid) {
            taskarray[i].timediff = timediff;
            localStorage.setItem("todo-details", JSON.stringify(taskarray));
            break;
          }
        }
      }
      setInterval(updatetimer, 1000);
    });