

// iframe 들어갈 변수 준비
let 유튜브_플레이어 = null

// iframe 호출한다면
function onYouTubeIframeAPIReady()
{

	// const intro_id = temp_list.intro // (추가) intro id 유효성 미리 확인 (배열이 비었거나 id가 없어도 안전)
	// const intro_vid = intro_id
	// // Array.isArray(intro_id) ? intro_id[0] : intro_id // (추가) get_id가 [id, t] 형태로 반환하는 경우 처리

	유튜브_플레이어 = new YT.Player("you_player",
	{
		width: "100%",
		height: "100%",
		// videoId: "d8dqNFNrXPk",
		// videoId: get_id(playlist.intro[0].id),
		// ...(intro_vid && { videoId: intro_vid }), // (추가) 유효한 id가 있을 때만 videoId 전달
		...(temp_list.intro.id && { videoId: temp_list.intro.id }), // (추가) 유효한 id가 있을 때만 videoId 전달

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
				유튜브_플레이어.setVolume(+소리_크기_조절_기능.value)
				// player 사용 가능해진 시점 알림
				player_ready_resolve()
			},
			onStateChange : onPlayerStateChange,
		}
	})
}


// 크기 계산
const total_cell = { video: 0, short: 0 }

const resize = new ResizeObserver(box =>
{
	box.forEach(cell =>
	{
		const type = cell.target.classList.contains("short") ? "short" : "video"
		total_cell[type] = calc_size(cell)

		reset_page(type)
		update_page(type)
	})
})


// 모두/원곡/커버 클릭 시 표시할 video 데이터 교체
function switch_video_data(next_data)
{
	active_data.video = next_data // 현재 데이터 갱신

	const page = document.querySelector(`.page.video`)
	if (page) page.innerHTML = "" // 기존 썸네일 제거 후 재생성

	fill_page("video") // 새 데이터로 다시 채움

	video_multiple = 1 // 페이지 번호 초기화
	render_nav("video")
	update_page("video")
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
		if (playlist_ready_resolve) // (추가) 대기 중인 큐잉이 있으면 완료 알림
		{
			playlist_ready_resolve()
			playlist_ready_resolve = null
		}
		유튜브_플레이어.setPlaybackRate(1)
		if (sec_end === 0)
		{
			[sec_end, msg_end] = data_split(유튜브_플레이어.getDuration())
		}
		let title = null
		try
		{
			title = 유튜브_플레이어.getVideoData().title
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
		if (유튜브_플레이어.getCurrentTime() < sec_start)
		{
			유튜브_플레이어.seekTo(sec_start, true)
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
		유튜브_플레이어.seekTo(sec_start, true)
		유튜브_플레이어.playVideo()
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
	// document.head.appendChild(api) // YouTube iframe API 로드 시작 → onYouTubeIframeAPIReady 자동 호출됨

	make_list() // 뼈대(.list, .page) + 썸네일 DOM 생성

	document.querySelectorAll(".list").forEach(list => resize.observe(list)) // 크기 관찰 시작

	// this.remove() // 스위치 사각형 제거
}

// document.getElementById("switch").addEventListener("click", switch_click)

function 재생목록_불러오기(누구)
{
	const script = document.createElement("script")
	script.src = "data/" + 누구.이름 + ".js"

	// 준비 되었을때 실행
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
	script.addEventListener("load", async () =>
	{
		await load_player()

		await fix_playlist_data(window.playlist)

		나만의_색깔(window.playlist.color)

		switch_click()

		await cue_intro(temp_list.intro)

		document.getElementById("name_box").remove()
	})

	document.head.appendChild(script)
}

