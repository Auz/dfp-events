/*
Copyright 2013 Michael Countis

MIT License: http://opensource.org/licenses/MIT
*/

(function(){
	"use strict";

	var googletag = window.googletag = window.googletag || {};
	googletag.cmd = window.googletag.cmd || [];
	
	googletag.cmd.push(function(){
		
		if(googletag.hasOwnProperty("on") || googletag.hasOwnProperty("off") || googletag.hasOwnProperty("trigger") || googletag.hasOwnProperty("events")) {
			return;
		}
		
		var 	old_log = googletag.debug_log.log,
			events = [],
			addEvent = function(name,match){
				events.push({
					"name":name,
					"match":match
				});
			};

		addEvent("gpt-google_js_loaded",			/Google service JS loaded/ig);
		addEvent("gpt-gpt_fetch",				/Fetching GPT implementation/ig);
		addEvent("gpt-gpt_fetched",				/GPT implementation fetched\./ig);
		addEvent("gpt-page_load_complete",			/Page load complete/ig);
		addEvent("gpt-queue_start",				/^Invoked queued function/ig);

		addEvent("gpt-service_add_slot",			/Associated ([\w]*) service with slot ([\/\w]*)/ig);
		addEvent("gpt-service_add_targeting",			/Setting targeting attribute ([\w]*) with value ([\w\W]*) for service ([\w]*)/ig);
		addEvent("gpt-service_collapse_containers_enable",	/Enabling collapsing of containers when there is no ad content/ig);
		addEvent("gpt-service_create",				/Created service: ([\w]*)/ig);
		addEvent("gpt-service_single_request_mode_enable",	/Using single request mode to fetch ads/ig);

		addEvent("gpt-slot_create",				/Created slot: ([\/\w]*)/ig);
		addEvent("gpt-slot_add_targeting",			/Setting targeting attribute ([\w]*) with value ([\w\W]*) for slot ([\/\w]*)/ig);
		addEvent("gpt-slot_fill",				/Calling fillslot/ig);
		addEvent("gpt-slot_fetch",				/Fetching ad for slot ([\/\w]*)/ig);
		addEvent("gpt-slot_receiving",				/Receiving ad for slot ([\/\w]*)/ig);
		addEvent("gpt-slot_render_delay",			/Delaying rendering of ad slot ([\/\w]*) pending loading of the GPT implementation/ig);
		addEvent("gpt-slot_rendering",				/^Rendering ad for slot ([\/\w]*)/ig);
		addEvent("gpt-slot_rendered",				/Completed rendering ad for slot ([\/\w]*)/ig);

		googletag.events = googletag.events || {};

		googletag.on = function(events,op_arg0/*data*/,op_arg1/*callback*/){
			if(!op_arg0) {
				return this;
			}

			events = events.split(" ");

			var	data = op_arg1 ? op_arg0 : undefined,
				callback = op_arg1 || op_arg0,
				ei = 0,e = '';
			
			callback.data = data;

			for(e = events[ei = 0]; ei < events.length; e = events[++ei]) {
				(this.events[e] = this.events[e] || []).push(callback);
			}

			return this;
		};


		googletag.off = function(events,handler){
			events = events.split(" ");
			var	ei = 0,e = "",
				fi = 0,f = function(){};
			
			for(e = events[ei]; ei < events.length; e = events[++ei]){
				if(!this.events.hasOwnProperty(e)) {
					continue;
				}

				if(!handler){
					delete this.events[e];
					continue;
				}

				fi = this.events[e].length - 1;
				for(f = this.events[e][fi]; fi >= 0; f = this.events[e][--fi]) {
					if(f == handler) {
						this.events[e].splice(fi,1);
					}
				}
				if(this.events[e].length === 0) {
					delete this.events[e];
				}
			}

			return this;
		};


		googletag.trigger = function(event,parameters){

			// fire the event on the slot element
			parameters = parameters || [];
			var slot = parameters[3] || null;
			if(slot) {
				var events = slot.get('events') || {};
				if(events[event]) {
					var e = events[event],
						t = typeOf(e);
					if(t === 'array') {

						var fi = 0, 
							f = e[fi], 
							numEvents = e.length;

						for(fi,f;fi < numEvents;f = e[++fi]) {
							if(f.apply(slot,parameters) === false) {
								break;
							}
						}
					} else if(t === 'function') {
						e.apply(slot,parameters);
					}
				}
			}
            
			// see if any events have been registered with googletag.on() and fire them:
			if(!this.events[event] || this.events[event].length === 0) {
				return this;
			}
			
			var fi = 0, 
				f = this.events[event][fi], 
				numEvents = this.events[event].length;
			
			for(fi,f;fi < numEvents;f = this.events[event][++fi]) {
				if(f.apply(this,[{data:f.data}].concat(parameters)) === false) {
					break;
				}
			}

			return this;
		};


		googletag.debug_log.log = function(level,message,service,slot,reference){
			var	args = Array.prototype.slice.call(arguments),
				e = 0,
				numEvents = events.length;
			for(e;e < numEvents; e++) {
				if(message.search(events[e].match) > -1) {
					googletag.trigger(events[e].name,args);
				}
			}
			return old_log.apply(this,arguments);
		};

	});

}());
