$(document).ready(function () {
    let update = null;
    loadTask();
    let uid = 1;

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
                0 +
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

        if (current === 1) {
            toggle.addClass("pending");
            let tasktime = toggle.closest(".new-todo");
            resettimer(tasktime);
        } else if (current === 2) {
            toggle.addClass("ongoing");
            let tasktime = toggle.closest(".new-todo");
            starttimer(tasktime);
        } else {
            toggle.addClass("completed");
            let tasktime = toggle.closest(".new-todo");
            stoptimer(tasktime);
        }

        toggle.val(current);
        let tasktime = toggle.closest(".new-todo");
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
        console.log(savetask(), "<== called...");
        updatewatch();
    }

    function stoptimer(tasktime) {
        let stime = tasktime.data("start-time");
        if (stime) {
            let etime = Date.now();
            let abc = Math.floor((etime - stime) / 1000);

            tasktime.data("start-time", null);
            tasktime.data("completed-time", etime);
        }
    }

    $("ul").on("input", ".custom-toggle", trigger);

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
            taskarr.push({
                id: index + 1,
                text: taskinfo,
                status: taskstatus,
                endtime: $(this).find(".stopwatch").text(),
            });
        });
        localStorage.setItem("todo-details", JSON.stringify(taskarr));
    }

    function updatewatch() {
        $(".new-todo").each(function () {
            let starttime = $(this).data("start-time");
            if (starttime) {
                let timecount = Math.floor((Date.now() - starttime) / 1000);
                let hours = Math.floor(timecount / 3600);
                let minutes = Math.floor((timecount % 3600) / 60);
                let seconds = timecount % 60;

                let timeformat = `${(hours < 10 ? "0" : "") + hours}:${(minutes < 10 ? "0" : "") + minutes
                    }:${(seconds < 10 ? "0" : "") + seconds}`;
                $(this).find(".stopwatch").text(timeformat);
            }
        });
    }
    setInterval(updatewatch, 1000);
});


        // function updatetimer() {
        //   $(".new-todo").each(function () {
        //     let starttime = $(this).data("start-time");
        //     let status = $(this).attr("status-code");

        //     if (starttime && status !== "3") {
        //       let stime = moment(starttime, "hh:mm:ss");
        //       let seconds = Math.floor((moment() - stime) / 1000);
        //       let hours = Math.floor(seconds / 3600);
        //       let minutes = Math.floor((seconds % 3600) / 60);
        //       seconds = Math.floor(seconds % 60);

        //       let timeformat = `${(hours < 10 ? "0" : "") + hours}:${
        //         (minutes < 10 ? "0" : "") + minutes
        //       }:${(seconds < 10 ? "0" : "") + seconds}`;

        //       $(this).find(".stopwatch").text(timeformat);
        //     }
        //   });
        // }