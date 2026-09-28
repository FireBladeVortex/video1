

// iframe 들어갈 변수 준비
let player = null

// iframe 호출한다면
function onYouTubeIframeAPIReady()
{
	player = new YT.Player("you_player",
	{
		width: "100%",
		height: "100%",
		videoId: "",

		playerVars:
		{
			// 자동재생 방지
			autoplay: 0,
			// 영상 종료 때 추천 방지
			rel: 0,
			// 풀 스크린 버튼 숨김
			// fs: 0,
			// 유튜브 자체 키보드 조작 기능 방지 방향키 숫자 0~9 등
			disablekb: 1,
			// 유튜브 일부 ui 숨김
			// controls: 0,
			// // 뭐임?
			// origin: window.location.origin,
			// 자막 한글 pip 모드 대비용
			cc_lang_pref: "ko",
			// 자막 자동 실행 pip 모드 대비용
			cc_load_policy: 1,
		},
		// 현재 상태 불러오기
		events:
		{
			onReady: () =>
			{
				// 현재 value 적용
				player.setVolume(+소리_크기_조절_기능.value)
			},
			onStateChange : onPlayerStateChange,
		}
	})
}



// 영상 상태 확인
// YT.PlayerState.ENDED = 0
// YT.PlayerState.PLAYING = 1
// YT.PlayerState.PAUSED = 2
// YT.PlayerState.BUFFERING = 3
// YT.PlayerState.CUED = 5

// 동영상 상태가 변화하면 즉시 작동
function onPlayerStateChange(event)
{
	// 영상 정보 불러온 상태(재생 시작 전)
	if (event.data === 5)
	{
		player.setPlaybackRate(1)
		if (sec_end === 0)
		{
			[sec_end, msg_end] = data_split(player.getDuration())
		}
		let title = null
		try
		{
			title = player.getVideoData().title
		}
		catch
		{
		}
		if (title)
		{
			document.getElementById("play_msg").style.textAlign = "start"
			document.getElementById("play_msg").textContent = title
			fetch_oembed(set_id, title)
		}
		else
		{
			fetch_oembed(set_id)
		}
	}
	// 재생 중일 때 100ms마다 진행바 갱신
	if (event.data === 1)
	{
		if (player.getCurrentTime() < sec_start)
		{
			player.seekTo(sec_start, true)
		}
		clearInterval(play_bar) // 인터벌 중복 호출 방지
		play_bar = setInterval(ctrl_view, 100)
	}
	else
	{
		clearInterval(play_bar)
	}
	// 영상 재시작
	if (event.data === 0)
	{
		player.seekTo(sec_start, true)
		player.playVideo()
	}
	//
	const pop = [1, 2, 3].includes(event.data)
	document.querySelectorAll("#right").forEach(overlay => // ("#right, #ad") // #ad 임시 삭제 사용자 선택으로 버튼 만들기 전까지
	{
		overlay.style.cursor = pop ? "pointer" : "default"
		overlay.onclick = pop ? play_or_pause : null
	})
	// document.getElementById("ad").style.pointerEvents = pop ? "auto" : "none" // 상동
}






// 스위치 클릭 시 실제 초기화 실행 (추가)
function switch_click()
{

	make_list() // 뼈대(.list, .page) + 썸네일 DOM 생성

	document.querySelectorAll(".list").forEach(list => resize.observe(list)) // 크기 관찰 시작

}


function 재생목록_불러오기(누구)
{
	const script = document.createElement("script")
	script.src = "data/" + 누구.이름 + ".js"

	// 준비 되었을때 실행
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
	script.addEventListener("load", async () =>
	{
		await id_가공(window.playlist)

		나만의_색깔(window.playlist.color)

		switch_click()

		await cue_intro(temp_list.intro)

		document.getElementById("이름_상자").remove()
	})

	document.head.appendChild(script)
}

