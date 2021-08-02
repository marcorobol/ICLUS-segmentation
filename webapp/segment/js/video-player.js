/* http://www.inconduit.com/smpte/

changes 

AUG 10 2012
-Bug fix: removed unnecessary Math.round() causing Safari to seek to wrong frames
-Patch:   added newPos = newPos + 0.00001 to correct for Safari seeking to correct frame. ie when setting myVideo.currentTime to 0.04 Safari *should* seek to SMPTE 00:00:00:01 but instead remains stuck at 00:00:00:00
          seeking to 0.40001 forces Safari to seek to SMPTE 00:00:00:01. Also this trick works fine in Chrome, so solution pratically found.

*/

function getDigits(val) {
	var fullVal = parseFloat(val);
	var newVal = fullVal - Math.floor(parseFloat(fullVal));
	newVal = newVal.toFixed(2);
	return newVal;
}

//SMTE Time-code calculation functions
//=======================================================================================================

function timecodeToSeconds(hh_mm_ss_ff, fps) {
	var tc_array = hh_mm_ss_ff.split(":");
	var tc_hh = parseInt(tc_array[0]);
	var tc_mm = parseInt(tc_array[1]);
	var tc_ss = parseInt(tc_array[2]);
	var tc_ff = parseInt(tc_array[3]);
	var tc_in_seconds = ( tc_hh * 3600 ) + ( tc_mm * 60 ) + tc_ss + ( tc_ff / fps );
	return tc_in_seconds;

}

function secondsToTimecode(time, fps) {
	
	var hours = Math.floor(time / 3600) % 24;
	var minutes = Math.floor(time / 60) % 60;
	var seconds = Math.floor(time % 60);
	var frames = Math.floor(((time % 1)*fps).toFixed(3));
	
	var result = (hours < 10 ? "0" + hours : hours) + ":"
	+ (minutes < 10 ? "0" + minutes : minutes) + ":"
	+ (seconds < 10 ? "0" + seconds : seconds) + ":"
	+ (frames < 10 ? "0" + frames : frames);

	return result;

}



Vue.component('video-player', {
    data: () => {
        return {
			loadedmetadata: false,
			// readyState,
			clickCounter: 0
        }
    },
	watch: {
        video_trim: function (val) {
            // console.log("videoTrimed at " + val)
            videojs(this.$el).offset({
				start: val[0],
				end: val[1],
				restart_beginning: false //Should the video go to the beginning when it ends
			});
        },
    },
    props: ['segmentation_id', 'analysis_id', 'area_code', 'FPS', 'video_trim'],
    emits: [ 'ready', 'timeupdate', 'duration' ],
    mounted: async function() {
		
		// Wait for video metadata to load
		await new Promise( (resolve, reject) => {
			this.$el.addEventListener('loadedmetadata', () => {
				// console.log(this.$el.duration);
				resolve()
			})
		});

		// Apply videojs
		var vue_this = this
		var html5_player = this.html5_player = this.$el //vue_this.$refs["my-video"]
		var player = this.player = videojs(this.$el)

		// Apply videojs offset
		player.offset({
			start: 0,
			end: this.html5_player.duration,
			restart_beginning: false //Should the video go to the beginning when it ends
		});

		// Redirect videojs ready event to outside
		player.ready( function () { // this is player returned by videojs(this.$el)
			
			//slow down video
			// html5_player.playbackRate = .1
			
			vue_this.$emit("ready",this)
			
			// vue_this.$emit('duration', this.duration());
			vue_this.$emit('duration', html5_player.duration);
			
			// this.on('timeupdate', function () {
			// 	vue_this.$emit('timeupdate', html5_player.currentTime);
			// })
		})

		// workaround for on timeupdate
		setInterval(
			function() {
				let video = html5_player

				var fixedTimecode = video.currentTime;
				fixedTimecode = parseFloat(fixedTimecode.toFixed(2));

				var SMPTE_time = secondsToTimecode(video.currentTime, vue_this.FPS);
				$("#currentTimeCode").html(SMPTE_time);

				// var videoInfo = "<b>Video info:</b><br/>";
				// videoInfo += "currentTime: " + video.currentTime + "<br/>";
				// videoInfo += "fixedTimecode: " + fixedTimecode + "<br/>";
				// videoInfo += "srcVideo: " + video.currentSrc + "<br/>";
				// $("#videoInfo").html(videoInfo);

				vue_this.$emit('timeupdate', video.currentTime) // see above on-timeupdate
			},
			vue_this.FPS
		);

		this.$nextTick(function () {
			// Code that will run only after the
			// entire view has been rendered
		})

    },
	methods: {
		
		// updateReadyState: function() {

		// 	var HAVE_NOTHING = 0;
		// 	var HAVE_METADATA = 1;
		// 	var HAVE_CURRENT_DATA = 2;
		// 	var HAVE_FUTURE_DATA = 3;
		// 	var HAVE_ENOUGH_DATA = 4;

		// 	if (video.readyState == HAVE_NOTHING) {
		// 		$("#metaData").html("video.readyState = HAVE_NOTHING");
		// 	} else if (video.readyState > HAVE_NOTHING) {

		// 		var readyStateInfo = "<b>Meta data loaded</b><br/>";
		// 		readyStateInfo += "duration: " + parseFloat(video.duration.toFixed(2))
		// 		+ " seconds.<br/>";
		// 		$("#metaData").html(readyStateInfo);
		// 		/*
		// 		var duration = $('#duration').get(0);
		// 		var vid_duration = Math.round(video.duration);
		// 		duration.firstChild.nodeValue = vid_duration;
		// 		clearInterval(t);
		// 		*/
		// 		//clearInterval(updateReadyStateInterval);
		// 	}

		// },

		// onLoadedMetaData: function() {
		// 	// duration is available
		// 	$("#metaData").append("Meta data loaded...<br/>");
		// },

		// onLoadedData: function() {
		// 	$("#metaData").append("Data loaded...<br/>");
		// },

		// onTimeUpdate: function(time) {
		// 	updateVideoCurrentTimeCode();
		// 	// works fine in all browsers, but it's a tad slow- still using a setinterval to make it update faster
		// },

		onPlay: function() {
		},

		updateVideoCurrentTimeCode: function() {
			
			let video = this.$el

			var currentTime = video.currentTime;
			var fixedTimecode = parseFloat(video.currentTime.toFixed(2));

			var SMPTE_time = secondsToTimecode(video.currentTime, FPS);
			$("#currentTimeCode").html(SMPTE_time);

			var videoInfo = "<b>Video info:</b><br/>";
			videoInfo += "currentTime: " + currentTime + "<br/>";
			videoInfo += "fixedTimecode: " + fixedTimecode + "<br/>";
			videoInfo += "srcVideo: " + video.currentSrc + "<br/>";
			$("#videoInfo").html(videoInfo);

			// UNABLE to see if HTML5 picked the .mp4 / .webm / .ogv version by querying the .src attribute...
			//var video_src = "<b>video source used:</b><br/>" + video.source.src;
			//$("#videoSource").html = video_src;
			
		},

		seekToTimecode: function(hh_mm_ss_ff, fps) {
			let video = this

			if (video.paused == false) {
				video.pause();
			}

			var seekTime = timecodeToSeconds(hh_mm_ss_ff, fps);
			var str_seekInfo = "video was at: " + video.currentTime + "<br/>";
			str_seekInfo += "seeking to (fixed): <b>" + seekTime + "</b><br/>";
			video.currentTime = seekTime;
			str_seekInfo += "seek done, got: " + video.currentTime + "<br/>";
			$("#seekInfo").html(str_seekInfo);

		},


		togglePlay: function() {
			this.pause();
		},


		seekFrames: function(nr_of_frames) {
			const video = this.html5_player //this.$refs["my-video"]
			const fps = this.FPS

			this.clickCounter++;

			var div_seekInfo = document.getElementById('seekInfo');

			if (video.paused == false) {
				video.pause();
			}

			//var currentFrames = Math.round(video.currentTime * fps); 
			
			var currentFrames = video.currentTime * fps;
			
			var newPos = (currentFrames + nr_of_frames) / fps;
			newPos = newPos + 0.00001; // FIXES A SAFARI SEEK ISSUE. myVdieo.currentTime = 0.04 would give SMPTE 00:00:00:00 wheras it should give 00:00:00:01

			//var newPos = video.currentTime += 1/fps;
			//newPos = Math.round(newPos, 2) + 1/fps; 

			var str_seekInfo = "seeking to (fixed): <b>" + newPos + "</b><br/>";
			
			console.log("video.currentTime = " + newPos);
			video.currentTime = newPos; // TELL THE PLAYER TO GO HERE
			
			str_seekInfo += "seek done, got: " + video.currentTime + "<br/>";
			var seek_error = newPos - video.currentTime;
			str_seekInfo += "seek error: " + seek_error + "<br/>";

			// div_seekInfo.innerHTML = str_seekInfo;
			
			// track calculated value in logger
			
			//console.log("SMPTE_time: " + SMPTE_time);
			
			
			// check found timecode frame
			var found_frame = $("#currentTimeCode").text();
			found_frame_split = found_frame.split(":");
			
			found_frame_nr = Number(found_frame_split[3]);
			
			console.log("found_frame_nr: " + found_frame_nr + " (found_frame: "+found_frame+")");
			
			var fontColor = "#000";
			if ( found_frame_nr+1 != this.clickCounter) {
				fontColor = "#F00";	
			}
			
			$('#timecode_tracker').append("<font color='"+fontColor+"'>" + this.clickCounter + ";" + newPos + ';' + video.currentTime + ';'+found_frame+'</font><br/>');
			


		},

	},
	// @loadedmetadata="onLoadedMetaData"
	// @loadeddata="onLoadedData"
	// @timeupdate="onTimeUpdate"
    template: `
		<video
			class="video-js vjs-theme-fantasy"
			controls
			preload="auto"
			width="880"
			data-setup="{}"
			muted
			autoplay
			
			@play="onPlay"
		>
			<slot></slot>
			<p class="vjs-no-js">
				To view this video please enable JavaScript, and consider upgrading to a
				web browser that
				<a href="https://videojs.com/html5-video-support/" target="_blank">
					supports HTML5 video
				</a>
			</p>
		</video>
    `
});
