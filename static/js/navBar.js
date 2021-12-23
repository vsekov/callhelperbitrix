var navBar = "";

      makeTree(json);

      $('#ulMenuNavbar').append(navBar);

      function makeTree(data) {
        for (var i in data) {
          navBar += (`<li><ul>`);
          tree(data[i]);
          navBar += (`</li></ul>`);
        }
      }

      function tree(data) {
        if (typeof data == "object") {
          navBar += ("<li>");
          if (data["answers"] != undefined && data["answers"].length > 0) {
            navBar += (
              `<a id="${encodeURI(data["id"])}"  style="display: inline-block; cursor:pointer;" class="slide header closed"><div class="button-closed" id="titlemenu">+</div></a>`
            );
          } else {
          }
          navBar += (
            `<a id="aname${encodeURI(data["id"])}" href="?pageId=${encodeURI(data["id"])}">${
              data["name"]
            }</a>`
          );
          if (data["answers"] != undefined && data["answers"].length > 0) {
            navBar += (`<ul class="slideContent" >`);
            for (var i in data["answers"]) {
              tree(data["answers"][i]);
            }
            navBar += (`</ul>`);
          }
          navBar += (`</li>`);
        } else {
        }
      }
      $("#initialSlider").parent().children(".slideContent").slideToggle();
      $(document).ready(function () {
        $(".slide").click(function () {
          if ($(this).text() == "-") {
            $(this).children("div").text("+");
            $(this).children("div").removeClass("closed");
          } else {
            $(this).children("div").text("-");
            $(this).children("div").addClass("closed");
          }

          var target = $(this).parent().children(".slideContent");
          $(target).slideToggle();
        });
      });