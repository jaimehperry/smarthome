/**
 *  SmartRest
 *
 *  Copyright 2017 Jaime Perry
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */
definition(
    name: "Smart Rest API",
    namespace: "jaimehperry",
    author: "Jaime Perry",
    description: "Smartthings Web Service",
    category: "",
    iconUrl: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience.png",
    iconX2Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
    iconX3Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
    oauth: [displayName: "Smartthings Web Service", displayLink: "http://localhost:4567"])


preferences {
  section ("Allow external service to control these things...") {
    input "switches", "capability.switch", multiple: true, required: true
  } 
}

mappings {
  path("/switches/:type") {
    action: [
      GET: "listSwitches"
    ]
  }
  path("/switches/toggle/:name") {
    action: [
      GET: "toggleSwitch"
    ]
  }
  path("/switches/setLevel/:name/:level") {
  	action: [
    GET: "setDimmerLevel"
    ]
  }
}

// returns a list like below - level is null for non dimmable lights
// [[name: "kitchen lamp", value: "off", level: 100], [name: "bathroom", value: "on", level: 20]]
def listSwitches() {
	//log.debug(params.type)
    def resp = []
    switches.each {
    	//log.debug(it.displayName + '-' + it.currentValue("level"))
        if(params.type == 'dim' && it.currentValue("level") != null) {
        	resp << [name: it.displayName, value: it.currentValue("switch"), level: it.currentValue("level")]
        }
        else if(params.type == 'all') {
         	resp << [name: it.displayName, value: it.currentValue("switch"), level: it.currentValue("level")]       	
        }        
    }
    return resp
}

void toggleSwitch() {
	//log.debug "toggleSwitch()"
    // use the built-in request object to get the command parameter
    def toggle = switches.find { it.displayName == params.name }

    switch(toggle.currentValue("switch")) {
        case "on":
            toggle.off()
            break
        case "off":
            toggle.on()
            break
        default:
            httpError(400, "Cannot determine state of switch specified")
    }
}

void setDimmerLevel() {
	def dimmer = switches.find { it.displayName == params.name }
    dimmer.setLevel(params.level) 
}


def installed() {}

def updated() {}