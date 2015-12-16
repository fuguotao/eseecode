"use strict";
    if (!$_eseecode) {
        var $_eseecode = {};
        if (!$_eseecode.instructions) {
            $_eseecode.instructions = {};
        }
    }
	var handle;
	var mainURL;
	
	
    var setupItems;
	
	function createExerciseTool(divId, createExerciseHandle, src) {
	    handle = createExerciseHandle;
	    if (!handle) {
	        // default handle is to display url in alert
	        handle = alert;
	    }
	    mainURL = src;
	    if (!mainURL) {
	        // default handle is to display url in alert
	        mainURL = "http://play.eseecode.com";
	    }
	    var assistant = document.getElementById(divId);
	    setupItems = [
            { id: "lang", title: "Language", type: "select", options: ["ca", "en", "es"] },
            { id: "view", title: "Initial view", type: "select", options: ["Touch", "Drag", "Build", "Code"] },
            { id: "guide", title: "Display guide?", type: "select", options: ["Yes", "No"] },
            { id: "grid", title: "Display grid?", type: "select", options: ["Yes", "No"] },
            { id: "gridstep", title: "Separation between grid lines (in pixels)?", type: "number" },
            { id: "maximize", title: "Display code console maximized?", type: "select", options: ["Yes", "No"] },
            { id: "filemenu", title: "Display file menu?", type: "select", options: ["Yes", "No"] },
            { id: "timeout", title: "How long before the execution of a program is stopped?", type: "number" },
            { id: "fullscreenmenu", title: "Display fullscreen button?", type: "select", options: ["Yes", "No"] },
            { id: "axis", title: "Axis", type: "select", options: ["Computer console", "Mathematical simple", "Mathematical centered"] },
            { id: "instructions", title: "Instructions to show (leave blank to use default)", type: "order", options: $_eseecode.instructions.set },
            { id: "precode", title: "Code to preload (hidden to the user)", type: "textarea" },
            { id: "code", title: "Code to load (displayed to the user)", type: "textarea" },
            { id: "input", title: "Input", type: "textarea" },
            { id: "execute", title: "Execute the code", type: "checkbox" }
        ];
	    
        for (var key in setupItems) {
            var div = document.createElement("div");
            var title = document.createElement("span");
            title.innerHTML = setupItems[key].title+": ";
            div.appendChild(title);
            if (setupItems[key].type == "select") {
                var select = document.createElement("select");
                select.id = setupItems[key].id;
                var options = setupItems[key].options;
                var selectOptions = "<option>undefined</option>";
                for (var id in options) {
                    selectOptions += "<option>"+options[id]+"</option>";
                }
                select.innerHTML = selectOptions;
                select.addEventListener("change", buildURL);
                div.appendChild(select);
            } else if (setupItems[key].type == "multiple") {
                var br = document.createElement("br");
                div.appendChild(br);
                var select = document.createElement("select");
                select.id = setupItems[key].id;
                select.setAttribute("multiple", true);
                var options = setupItems[key].options;
                var selectOptions = "";
                for (var id in options) {
                    selectOptions += "<option>"+options[id].name+"</option>";
                }
                select.innerHTML = selectOptions;
                select.addEventListener("change", buildURL);
                div.appendChild(select);
            } else if (setupItems[key].type == "order") {
                var br = document.createElement("br");
                div.appendChild(br);
                var defaultsSpan = document.createElement("span");
                defaultsSpan.innerHTML = "Load defaults: ";
                div.appendChild(defaultsSpan);
                var defaultsButton1 = document.createElement("input");
                defaultsButton1.type = "button";
                defaultsButton1.value = "Touch";
                div.appendChild(defaultsButton1);
                var defaultsButton2 = document.createElement("input");
                defaultsButton2.type = "button";
                defaultsButton2.value = "Drag";
                div.appendChild(defaultsButton2);
                var defaultsButton3 = document.createElement("input");
                defaultsButton3.type = "button";
                defaultsButton3.value = "Build";
                div.appendChild(defaultsButton3);
                var defaultsButton4 = document.createElement("input");
                defaultsButton4.type = "button";
                defaultsButton4.value = "Code";
                div.appendChild(defaultsButton4);
                var br = document.createElement("br");
                div.appendChild(br);
                var defaultsSpan = document.createElement("span");
                defaultsSpan.innerHTML = "(Double-click on the right pane to configure the instructions)";
                div.appendChild(defaultsSpan);
                var br = document.createElement("br");
                div.appendChild(br);
                var innerDiv = document.createElement("div");
                var elementId = setupItems[key].id;
                var select = document.createElement("select");
                select.id = elementId+"origin";
                select.style.height = "150px";
                select.style.float = "left";
                select.setAttribute("multiple", true);
                innerDiv.appendChild(select);
                var buttonsDiv = document.createElement("div");
                buttonsDiv.style.float = "left";
                var upButton = document.createElement("input");
                upButton.type = "button";
                upButton.value = "^";
                upButton.addEventListener("click",function() {selectOrderMove("up",elementId);buildURL();});
                buttonsDiv.appendChild(upButton);
                br = document.createElement("br");
                buttonsDiv.appendChild(br);
                var rightButton = document.createElement("input");
                rightButton.type = "button";
                rightButton.value = "->";
                rightButton.addEventListener("click",function() {selectOrderMove("right",elementId);buildURL();});
                buttonsDiv.appendChild(rightButton);
                br = document.createElement("br");
                buttonsDiv.appendChild(br);
                var blankButton = document.createElement("input");
                blankButton.type = "button";
                blankButton.value = "-----";
                blankButton.addEventListener("click",function() {var option = document.createElement("option");option.value="blank;";option.innerHTML="-----";document.getElementById(elementId).appendChild(option);buildURL();});
                buttonsDiv.appendChild(blankButton);
                br = document.createElement("br");
                buttonsDiv.appendChild(br);
                var leftButton = document.createElement("input");
                leftButton.type = "button";
                leftButton.value = "<-";
                leftButton.addEventListener("click",function() {selectOrderMove("left",elementId);buildURL();});
                buttonsDiv.appendChild(leftButton);
                innerDiv.appendChild(buttonsDiv);
                br = document.createElement("br");
                buttonsDiv.appendChild(br);
                var downButton = document.createElement("input");
                downButton.type = "button";
                downButton.value = "v";
                downButton.addEventListener("click",function() {selectOrderMove("down",elementId);buildURL();});
                buttonsDiv.appendChild(downButton);
                innerDiv.appendChild(buttonsDiv);
                var select2 = document.createElement("select");
                select2.id = elementId;
                select2.style.height = "150px";
                select2.style.minWidth = "100px";
                select2.setAttribute("multiple", true);
                innerDiv.appendChild(select2);
                var options = setupItems[key].options;
                var selectOrder = {};
                var selectOptions = {};
                for (var id in options) {
                    if (!id.match(/blank[0-9]*/)) {
                        selectOptions[options[id].name] = true;
                    }
                    var instruction = options[id].name+";";
                    for (var param in options[id].parameters) {
                        instruction += options[id].parameters[param].initial+";";
                    }
                    for (var view in options[id].show) {
                        var level = options[id].show[view];
                        if (!selectOrder[level]) {
                            selectOrder[level] = "";
                        }
                        selectOrder[level] += "<option onclick=\"changeParameters()\" value=\""+instruction+"\">"+instruction+"</option>";
                    }
                }
                defaultsButton1.addEventListener("click",function() {select2.innerHTML = selectOrder["level1"];buildURL();});
                defaultsButton2.addEventListener("click",function() {select2.innerHTML = selectOrder["level2"];buildURL();});
                defaultsButton3.addEventListener("click",function() {select2.innerHTML = selectOrder["level3"];buildURL();});
                defaultsButton4.addEventListener("click",function() {select2.innerHTML = selectOrder["level4"];buildURL();});
                var selectOptionsKeys = [];
                for (var id in selectOptions) {
                    selectOptionsKeys.push(id);
                }
                selectOptionsKeys.sort();
                var selectOptionsText = "";
                for (var id in selectOptionsKeys) {
                    selectOptionsText += "<option ondblclick=\"selectOrderMove('right','"+elementId+"');buildURL()\" value=\""+selectOptionsKeys[id]+";\">"+selectOptionsKeys[id]+"</option>";
                }
                select.innerHTML = selectOptionsText;
                var setupDiv = document.createElement("div");
                setupDiv.id = "setupDiv";
                setupDiv.style.display = "none";
                setupDiv.innerHTML = "<input id=\"setupDivIndex\" type=\"hidden\" />"
                setupDiv.innerHTML += "<input id=\"setupDivName\" type=\"hidden\" />"
                for (var i=1; i<=6; i++) {
                    setupDiv.innerHTML += "Parameter "+i+": <input id=\"setupDivParam"+i+"\" /><br />";
                }
                setupDiv.innerHTML += "Max amount of instances: <input id=\"setupDivCount\" type=\"number\" min=\"0\" /><br />";
                setupDiv.innerHTML += "Disable setup: <input id=\"setupDivNoChange\" type=\"checkbox\" /><br />";
                setupDiv.innerHTML += "<input type=\"button\" value=\"Apply\" onclick=\"changeParametersApply('"+elementId+"')\" />";
                innerDiv.appendChild(setupDiv);
                div.appendChild(innerDiv);
            } else if (setupItems[key].type == "textarea") {
                var br = document.createElement("br");
                div.appendChild(br);
                var input = document.createElement("textarea");
                input.id = setupItems[key].id;
                input.addEventListener("change", buildURL);
                div.appendChild(input);
            } else {
                var input = document.createElement("input");
                input.id = setupItems[key].id;
                if (setupItems[key].type) {
                    input.type = setupItems[key].type;
                    if (setupItems[key].type == "number") {
                        input.style.width = "50px";
                    }
                }
                input.addEventListener("change", buildURL);
                div.appendChild(input);
            }
            div.style.clear = "both";
            assistant.appendChild(div);
        }
	}
	
	function buildURL(event) {
	    var url = mainURL;
	    url += "?";

        var paramsText = "";
        var firstParam = true;
        for (var i in setupItems) {
            var paramValue = "";
            var element = document.getElementById(setupItems[i].id);
            if (element.type == "checkbox") {
                if (element.checked === true) {
                    paramValue = element.checked;
                }
            } else if (setupItems[i].type == "order") {
                paramValue = "";
                for (var optionId in element.options) {
                    var option = element.options[optionId];
                    if (option.value) {
                        paramValue += option.value;
                    }
                }
                if (paramValue) {
                    paramValue = paramValue.substring(0,paramValue.length-1); // Remove last ";"
                }
            } else if (element.type == "select-multiple") {
                paramValue = "";
                for (var optionId in element.options) {
                    var option = element.options[optionId];
                    if (option.selected) {
                        paramValue += option.value;
                    }
                }
                if (paramValue) {
                    paramValue = paramValue.substring(0,paramValue.length-1); // Remove last ";"
                }
            } else {
                paramValue = element.value;
            }
            if (paramValue != "undefined" && paramValue.toString().length > 0) {
                paramsText += (firstParam?"":"&")+setupItems[i].id+"="+encodeURIComponent(paramValue);
                firstParam = false;
            }
        }
        url += paramsText;
        
	    handle(url);
	}
	
    function selectOrderMove(sens, id) {
      var sourceSel, targetSel; 
      if (sens == "right") {
        sourceSel = document.getElementById(id+"origin"); 
        targetSel = document.getElementById(id);
      } else {
        sourceSel = document.getElementById(id); 
        targetSel = document.getElementById(id+"origin");
      }
      if (sens == "up") {
          for (var i = 0; i<sourceSel.options.length; i++) {
            if (sourceSel.options[i].selected) {
                var moveOption = sourceSel.options[i];
                var above = moveOption.previousSibling;
                sourceSel.removeChild(moveOption);
                if (above) {
                    sourceSel.insertBefore(moveOption, above);
                } else {
                    sourceSel.insertBefore(moveOption, sourceSel.firstChild);
                }
            }
          }
      } else {
          for (var i = sourceSel.options.length-1; i>=0; i--) {
            if (sourceSel.options[i].selected) { 
              if (sens == "right") {
                  var option = document.createElement("option");
                  option.innerHTML = sourceSel.options[i].innerHTML;
                  option.value = sourceSel.options[i].value;
                  targetSel.appendChild(option);
                  option.addEventListener("dblclick",changeParameters);
              } else if (sens == "left") {
                sourceSel.removeChild(sourceSel.options[i]);
              } else if (sens == "down") {
                var moveOption = sourceSel.options[i];
                var under = moveOption.nextSibling;
                if (under) {
                    under = under.nextSibling;
                }
                sourceSel.removeChild(moveOption);
                if (under) {
                    sourceSel.insertBefore(moveOption, under);
                } else {
                    sourceSel.appendChild(moveOption);
                }
              }
            }
        }
      }
    }
    
    function changeParameters(event) {
        var optionIndex = event.target.index;
        var values = event.target.value.split(";");
        var countParams = 1;
        document.getElementById("setupDivNoChange").checked = false;
        document.getElementById("setupDivCount").value = "";
        for (var i=1; document.getElementById("setupDivParam"+i); i++) {
            document.getElementById("setupDivParam"+i).value = "";
        }
        for (var i=0; i<values.length; i++) {
            var value = values[i];
            if (i == 0) {
                document.getElementById("setupDivName").value = values[i];
            } else if (value == "noChange") {
                document.getElementById("setupDivNoChange").checked = true;
            } else if (value.match(/^count:/)) {
                document.getElementById("setupDivCount").value = value.split(":")[1];
            } else if (value.match(/^param:/)) {
                document.getElementById("setupDivParam"+countParams).value = value.split(":")[1];
                countParams++;
            } else {
                document.getElementById("setupDivParam"+countParams).value = value;
                countParams++;
            }
        }
        document.getElementById("setupDivIndex").value = optionIndex;
        document.getElementById("setupDiv").style.display = "block";
    }
    
    function changeParametersApply(selectId) {
        var setupDiv = document.getElementById("setupDiv");
        var select = document.getElementById(selectId);
        var optionIndex = document.getElementById("setupDivIndex").value;
        var option = select.options[optionIndex];
        var name = option.innerHTML;
        var optionText = "";
        var inputs = setupDiv.getElementsByTagName("input");
        var foundNonUndefined = false;
        for (var i = inputs.length-1; i>=0; i--) {
            var input = inputs[i];
            if (input.type == "hidden") {
                continue;
            } else if (input.type == "number") {
                if (input.value) {
                    optionText += "count:"+input.value+";";
                }
            } else if (input.type == "checkbox"){
                if (input.checked) {
                    optionText += "noChange;";
                }
            } else if (input.type == "button") {
                continue;
            } else {
                if (!input.value && !foundNonUndefined) {
                    continue;
                }
                optionText = "param:"+input.value+";"+optionText; // Prefix
                foundNonUndefined = true;
            }
        }
        var optionText = name+";"+optionText;
        select.options[optionIndex].innerHTML = name;
        select.options[optionIndex].value = optionText;
        setupDiv.style.display = "none";
        buildURL();
    }