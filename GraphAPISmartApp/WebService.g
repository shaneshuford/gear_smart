/*
 *  Shanes Webservice Test
 *  Copyright 2017 Shane
 */
 
//Apollo Spock, we have lift off... wait what?
definition(
    name: "Gear Watch",
    namespace: "shaneshuford",
    author: "Shane",
    description: "Gear Watch",
    category: "",
    iconUrl: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience.png",
    iconX2Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
    iconX3Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
    oauth: true
)

preferences {
    page(name: "pageOne", title: "Gear Devices:", nextPage: "selectActions", uninstall: true) {
        section("Choose devices to control with watch") {
			input "switches", "capability.switch", title: "Which Switches?", required: false, multiple: true
        	//input "locks", "capability.lock", title: "Which Locks?", required: false, multiple: true     
        	//input "lights", "capability.light", title: "Which Lights?", required: false, multiple: true     
        	//input "levels", "capability.switchLevel", title: "Which level switches?", required: false, multiple: true     
        	//input "motion", "capability.motionSensor", title: "Which Motion Sensors?", required: false, multiple: true     
        }
        /*
        section("Visit Us Online") {
        	href(
        		title: "Shuford Technology LLC",
        		required: false,
        		style: "external",
        		url: "http://ShufordTech.com/",
        		description: "Visit Shuford Technology LLC Online!"
        	)
    	}
        */
    }
    page(name: "selectActions")
}

def selectActions() {
    dynamicPage(name: "selectActions", title: "Gear Actions/Routines", install: true, uninstall: true) {
        // get the available actions
        def actions = location.helloHome?.getPhrases()*.label
        if (actions) {
        	// sort them alphabetically
        	actions.sort()
        	section("Choose routines to execute with watch:") {
        		log.trace actions
            	input "action", "enum", title: "Select an routines to execute", options: actions, required: false, multiple: true
        	}
        }
    }
}


def installed() {}
def updated() {}

mappings {

	//Switches
	path("/switches") {
		action: [
			GET: "listSwitches"
		]
	}
	path("/switches/:id") {
		action: [
			GET: "showSwitch"
		]
	}
	path("/switches/:id/:command") {
		action: [
			GET: "updateSwitch"
		]
	}
    
    //Locks
	path("/locks") {
		action: [
			GET: "listLocks"
		]
	}
	path("/locks/:id") {
		action: [
			GET: "showLock"
		]
	}
	path("/locks/:id/:command") {
		action: [
			GET: "updateLock"
		]
	}
    
    //Routines
	path("/routines/:name") {
        action: [
          GET: "executeRoutine"
        ]
	} 
	path("/routines") {
        action: [
          GET: "listRoutines"
        ]
	}
    
}

//switches
def listSwitches() {
	switches.collect{device(it,"switch")}
}
def showSwitch() {
	show(switches, "switch")
}
void updateSwitch() {
	update(switches)
}

//Locks
def listLocks() {
	locks.collect{device(it,"lock")}
}
def showLock() {
	show(locks, "lock")
}
void updateLock() {
	update(locks)
}

//Routines
def listRoutines() {
	log.debug location.helloHome
	def actions = location.helloHome?.getPhrases()*.label
	return actions
}
def executeRoutine(){
	def name = params.name
	location.helloHome?.execute(name)
    def resp = []
    resp << [ok: "executed"]
    return resp
}

//in the future...
def deviceHandler(evt) {}

private void update(devices) {
	log.debug "update, request: params: ${params}, devices: $devices.id"
	//def command = request.JSON?.command
    def command = params.command    
	if (command){
		def device = devices.find { it.id == params.id }
		if (!device) {
			httpError(404, "Device not found")
		} else {
        	if(command == "toggle"){
            	if(device.currentValue('switch') == "on")
                  device.off();
                else
                  device.on();
       		}else{
				device."$command"()
            }
		}
	}
}

private show(devices, type) {
	def device = devices.find { it.id == params.id }
	if (!device) {
		httpError(404, "Device not found")
	} else {
		def attributeName = type == "motionSensor" ? "motion" : type
		def s = device.currentState(attributeName)
		[id: device.id, label: device.displayName, value: s?.value, unitTime: s?.date?.time, type: type]
	}
}

private device(it, type) {
	def attributeName = type == "motionSensor" ? "motion" : type
	def s = it.currentState(attributeName)
	it ? [id: it.id, label: it.label, value: s?.value, type: type] : null
}