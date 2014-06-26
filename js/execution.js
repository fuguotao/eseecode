"use strict";

	/**
	 * Gets the execution step value from the setup and updates in the $_eseecode class
	 * @private
	 * @example updateExecutionStep()
	 */
	function updateExecutionStep() {
		$_eseecode.execution.step = parseInt(document.getElementById("setup-execute-step").value);
	}

	/**
	 * Gets the execution stepped value from the setup and updates in the $_eseecode class
	 * @private
	 * @example updateExecutionStepped()
	 */
	function updateExecutionStepped() {
		$_eseecode.execution.stepped = document.getElementById("setup-execute-stepped").checked;
	}

	/**
	 * Gets the execution time limit value from the setup and updates in the $_eseecode class
	 * @private
	 * @example updateExecutionTime()
	 */
	function updateExecutionTime() {
		$_eseecode.execution.timeLimit = parseInt(document.getElementById("setup-execute-time").value);
	}

	/**
	 * Check the execution control limits
	 * @private
	 * @param {Number} lineNumber Code line number currently running
	 * @example checkExecutionLimits(31)
	 */
	function checkExecutionLimits(lineNumber) {
		// If $_eseecode.execution.programCounterLimit === false the step limit is ignored
		var executionTime = new Date().getTime();
		$_eseecode.execution.programCounter++;
		setHighlight(lineNumber);
		if ($_eseecode.session.breakpoints[lineNumber]) {
			$_eseecode.execution.breakpointCounter++;
			if ($_eseecode.execution.breakpointCounter >= $_eseecode.execution.breakpointCounterLimit) {
				throw "executionBreakpointed";
			}
		}
		if (executionTime > $_eseecode.execution.endLimit) {
			throw "executionTimeout";
		}
		if ($_eseecode.execution.programCounterLimit && $_eseecode.execution.programCounter >= $_eseecode.execution.programCounterLimit) {
			throw "executionStepped";
		}
	}

	/**
	 * Show execution results
	 * @private
	 * @param {String|Object} [err] Caught exception
	 * @example showExecutionResults()
	 */
	function showExecutionResults(err) {
		if (err === undefined) {
			if ($_eseecode.execution.programCounterLimit !== false) {
				// If in step by step, highlight last line
				highlight($_eseecode.session.highlight.lineNumber);
			} else {
				unhighlight();
			}
		} else if (err === "executionTimeout") {
			highlight($_eseecode.session.highlight.lineNumber,"error");
			msgBox(_("The execution is being aborted because it is taking too long.\nIf you want to allow it to run longer increase the value in 'Stop execution after'"));
		} else if (err === "executionStepped") {
			highlight($_eseecode.session.highlight.lineNumber);
		} else if (err === "executionBreakpointed") {
			highlight($_eseecode.session.highlight.lineNumber);
			switchDialogMode("debug");
		} else {
			// The code didn't finish running and there is no known reason
			printExecutionError(err);
		}
		var executionTime = ((new Date().getTime())-$_eseecode.execution.startTime)/1000;
		document.getElementById("execute-notes").innerHTML = _("Instructions executed")+": "+$_eseecode.execution.programCounter+" ("+executionTime+" "+_("secs")+")";
	}

	/**
	 * Resets and sets up internal configuration for a new cod execution
	 * @private
	 * @param {Boolean|String} [resetStepLimit] true = restart the stepping, false = update the stepping, "disabled" = ignore the stepping
	 * @example initProgramCounter()
	 */
	function initProgramCounter(resetStepLimit) {
		// Stop previous execution remaining animations
		for (var i=0; i<$_eseecode.session.timeoutHandlers.length; i++) {
			clearTimeout($_eseecode.session.timeoutHandlers[i]);
		}
		var withStep = $_eseecode.execution.stepped;
		if (resetStepLimit === "disabled") {
			withStep = false;
		}
		$_eseecode.execution.startTime = new Date().getTime();
		var time = $_eseecode.execution.timeLimit;
		if (time <= 0) {
			time = 3;
			$_eseecode.execution.timeLimit = time;
			initSetup();
		}
		$_eseecode.execution.endLimit = $_eseecode.execution.startTime+time*1000;
		$_eseecode.execution.programCounter = 0;
		$_eseecode.execution.breakpointCounter = 0;
		if (resetStepLimit) {
			$_eseecode.execution.programCounterLimit = 0;
			$_eseecode.execution.breakpointCounterLimit = 0;
		} else {			
			$_eseecode.execution.breakpointCounterLimit++;
		}
		if (withStep) {
			if (!resetStepLimit) {
				var step = $_eseecode.execution.step;
				if (step < 1) {
					step = 1;
					$_eseecode.execution.step = step;
					initSetup();			
				}
				$_eseecode.execution.programCounterLimit = ($_eseecode.execution.programCounterLimit?$_eseecode.execution.programCounterLimit:0) + step;
			}
		} else {
			$_eseecode.execution.programCounterLimit = false;
		}
	}

	/**
	 * Displays execution error
	 * @private
	 * @param {!Object} [err] Caught exception
	 * @example printExecutionError(err)
	 */
	function printExecutionError(err) {
		var lineNumber;
		if (err.lineNumber) { // Firefox
			lineNumber = err.lineNumber;
			lineNumber++; // Firefox starts lines at 0
		} else if (err.stack) { // Chrome
			var lines = err.stack.split("\n");
			var i;
			for (i=0;i<lines.length;i++) {
				if (lines[i].indexOf("at <anonymous>:") >= 0) {
					lineNumber = lines[i].split(":")[1];
				}
			}
		}
		var message, action;
		if (lineNumber) {
			var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
			highlight(lineNumber,"error");
			if (mode == "write") {
				ace.edit("console-write").gotoLine(lineNumber,0);
			}
			message = _("Error '%s' in line %s",[err.name,lineNumber])+": "+err.message;
		} else if (err.stack) {
			message = err.name+": "+err.message+"\n"+err.stack;
		} else {
			message = _("Runtime error!");
		}
		msgBox(message);
	}

	/**
	 * Setup execution sandboxing
	 * It deletes or resets variables created in the last execution
	 * @private
	 * @example resetSandbox()
	 */
	function resetSandbox() {
		if (!$_eseecode.execution.sandboxProperties) {
			$_eseecode.execution.sandboxProperties = [];
		}
		for (var i=0; i<$_eseecode.execution.sandboxProperties.length; i++) {
			 window[$_eseecode.execution.sandboxProperties[i]] = undefined;
		}
	}

	/**
	 * Checks and takes note of which variables where created during the last execution
	 * The list of changes is pushed into $_eseecode.execution.sandboxProperties
	 * @private
	 * @param {Array<String>} oldKeys List of variables existing before the last execution
	 * @param {Array<String>} newKeys List of variables existing after the last execution
	 * @example updateSandboxChanges(oldKeys, newKeys)
	 */
	function updateSandboxChanges(oldKeys, newKeys) {
		for (var i=0; i<newKeys.length; i++) {
			var keyNameNew = newKeys[i];
			var found = false;
			for (var j=0; j<oldKeys.length; j++) {
				var keyNameOld = oldKeys[j];
				if (keyNameOld == keyNameNew) {
					found = true;
					break;
				}
			}
			if (!found) {
				$_eseecode.execution.sandboxProperties.push(keyNameNew);
			}
			found = false;
		}
	}

	/**
	 * Runs code
	 * @private
	 * @param {Boolean} [forceNoStep] Whether or not to force to ignore the stepping
	 * @param {String} [code] Code to run. If unset run the code in the console window
	 * @example execute()
	 */
	function execute(forceNoStep, code) {
		if (!code) {
			resetSandbox();
		}
		var withStep;
		if (forceNoStep || code) { // Code from events run without stepping
			withStep = "disabled";
		}
		unhighlight();
		initProgramCounter(withStep);
		if (code === undefined) {
			var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
			if (mode == "blocks") {
				var consoleDiv = document.getElementById("console-blocks");
				code = blocks2code(consoleDiv.firstChild);
			} else if (mode == "write") {
				code = ace.edit("console-write").getValue();
				// Check and clean code before parsing
				if (eseecodeLanguage) {
					try {
						var program = eseecodeLanguage.parse(code);
						var level;
						for (var i=0;i<$_eseecode.modes.console.length;i++) {
							if ($_eseecode.modes.console[i].div == "write") {
								level = $_eseecode.modes.console[i].name;
							}
						}
						code = program.makeWrite(level,"","\t");
					} catch (exception) {
						msgBox(_("Can't parse the code. There is the following problem in your code")+":\n\n"+exception.name + ":  " + exception.message);
						var lineNumber = exception.message.match(/. (i|o)n line ([0-9]+)/);
						if (lineNumber[2]) {
							lineNumber = lineNumber[2];
							highlight(lineNumber,"error");
							ace.edit("console-write").gotoLine(lineNumber,0,true);
						}
						return;
					}
					resetWriteConsole(code);
				}
			}
			resetCanvas();
			resetBreakpointWatches();
		}
		code = code2run(code, !withStep);
		var script = document.createElement("script");
		script.id = "executionCode";
		script.type = "text/javascript";
		script.innerHTML = code;
		var oldWindowProperties;
		if (Object.getOwnPropertyNames) {
			oldWindowProperties = Object.getOwnPropertyNames(window);
		}
		document.getElementById("eseecode").appendChild(script);
		var newWindowProperties;
		if (Object.getOwnPropertyNames) {
			newWindowProperties = Object.getOwnPropertyNames(window);
			updateSandboxChanges(oldWindowProperties,newWindowProperties);
		}
		document.getElementById("eseecode").removeChild(script);
		// if debug is open refresh it
		if ($_eseecode.modes.dialog[$_eseecode.modes.dialog[0]].name == "debug") {
			resetDebug();
		}
	}