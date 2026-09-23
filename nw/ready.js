
// YouTube Player iframe API 준비
const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
// wait
// document.head.appendChild(api)



const data_list =
[
	{  이름 : "아쿠루" },
	{  이름 : "감규리" },
	{  이름 : "이오몽" },
	{  이름 : "마레 플로스" },
	{  이름 : "미녕이데러오께" },
	{  이름 : "마젯" },
	{  이름 : "레드" },
	{  이름 : "위도" },
	{  이름 : "판구리" },
	{  이름 : "앵보" },
	{  이름 : "불법스님" },
	{  이름 : "판구리" },
	{  이름 : "판구리" },
	{  이름 : "향아치" },
]


const 임시_목록 = {}



// 이름 가나다순_정렬
function 가나다순_정렬(목록)
{
	const 규칙 = new Intl.Collator("ko")
	const 정렬 = [...목록].sort((앞, 뒤) =>
	{
		const 비교 = 규칙.compare(앞.이름.trim(), 뒤.이름.trim())
		return 비교
	})

	const map = new Map()
	정렬.forEach(이거 =>
	{
		const 그거 = 이거.이름.trim()
		if (map.has(그거))
		{
			map.get(그거).중복 = true
		}
		else
		{
			map.set(그거, { ...이거 })
		}
	})

	const 결과 = [...map.values()]

	return 결과
}








// switch 상자 내부에 이름 목록 채우기 (추가)
function render_switch()
// function name_list_box() 이름 변경 대기
{
	const name_box = document.getElementById("name_box")

	const abc_h1 = document.createElement("h1")
	abc_h1.className = "abc_h1"
	name_box.appendChild(abc_h1)

	const abc =
	[
		"ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ",
		"ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
	]

	abc.forEach(abc =>
	{
		const abc_box = document.createElement("span")
		abc_box.className = "abc_item"
		abc_box.textContent = abc
		abc_h1.appendChild(abc_box)

		const abc_num = document.createElement("span")
		abc_num.className = "abc_num"
		abc_h1.appendChild(abc_num)
	})

	const name_list = document.createElement("div")
	name_list.className = "name_list"
	name_box.appendChild(name_list)

	name_sort(data_list).forEach(who =>
	{
		const name_btn = document.createElement("div")
		name_btn.className = "name_tag"
		name_btn.textContent = who.name
		name_box.appendChild(name_btn)

		name_btn.addEventListener("click", () =>
		{
			name_box.innerHTML = ""
			name_box.textContent = "불러오는 중"
			load_playlist(who)
		})
	})
}



// iframe 호출한다면
function onYouTubeIframeAPIReady()
{
	player = new YT.Player("you_player",
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
				player.setVolume(+volume_bar.value)
				// player 사용 가능해진 시점 알림
				player_ready_resolve()
			},
			onStateChange : onPlayerStateChange,
		}
	})
}


// 준비할 데이터를 가공하는 도구






// 영상 상태 확인
// 재생 종료
// YT.PlayerState.ENDED = 0
// 재생 중
// YT.PlayerState.PLAYING = 1
// 재생 일시 중지
// YT.PlayerState.PAUSED = 2
// 재생하기위한 준비 중
// YT.PlayerState.BUFFERING = 3
// 재생하기위한 준비 완료
// YT.PlayerState.CUED = 5
const play = () => player?.getPlayerState?.() === YT.PlayerState.PLAYING
const pause = () => player?.getPlayerState?.() === YT.PlayerState.PAUSED
const play_now = () => play() || pause() // !play_now === !play && !pause



// 재생 일시중지
function play_or_pause()
{
	if (play())
	{
		player?.pauseVideo()
	}
	else if (pause())
	{
		player?.playVideo()
	}
}



// 소리 크기 조절에 사용할 대상
const volume = document.getElementById("volume")
const volume_bar = document.getElementById("volume_bar")



// 소리 크기 조절 막대 값 반영 시키기
volume_bar.addEventListener("input", () =>
{
	player.setVolume(+volume_bar.value)
})



// 소리 크기 조절하는데 간섭 방지
const stopp = move => move.stopPropagation()
volume.addEventListener("mousedown", stopp)
volume.addEventListener("click", stopp)



// 해당하는 키 입력 기본 작동을 무시
// 스페이스 바가 play_or_pause()를 실행
// 숫자 패드 컨트롤 또는 쉬프트 +-로 재생 속도 조절 (보류)
// 숫자 패드 +-로 소리 크기 조절
document.addEventListener("keydown", key =>
{
	const add = key.code === "NumpadAdd" || key.code === "ArrowUp"
	const sub = key.code === "NumpadSubtract" || key.code === "ArrowDown"
	// const cs = key.ctrlKey || key.shiftKey

	// if (!cs)
	// {
		// + 키를 누르면 소리 크게
		if (add)
		{
			key.preventDefault()
			volume_value(+5)
		}
		// - 키를 누르면 소리 작게
		else if (sub)
		{
			key.preventDefault()
			volume_value(-5)
		}
	// }
	// else if (cs && add || sub)
	// {
	// 	key.preventDefault()
	// }

	// 준비안됐으면 작동 중지
	if (!player || !play_now())
		return

	// 키 반복입력 방지
	if (!key.repeat)
	{
		// 스페이스바 = 재생, 일시중지
		if (key.code === "Space")
		{
			key.preventDefault()
			play_or_pause()
		}

		// 방향키 왼쪽 = 5초 전으로
		else if (key.code === "ArrowLeft")
		{
			key.preventDefault()
			player.seekTo(Math.max(sec_start, player.getCurrentTime() - 5), true) // sec_start 보다 작아질 수 없음
		}

		// 방향키 오른쪽 = 5초 앞으로
		else if (key.code === "ArrowRight")
		{
			key.preventDefault()
			player.seekTo(Math.min(sec_end, player.getCurrentTime() + 5), true) // sec_end 보다 커질 수 없음
		}

		// 숫자키 0-9 = 현재 재생 위치 변경
		else if (key.code.match(/^(Digit|Numpad)[0-9]$/))
		{
			key.preventDefault()
			const ratio = +(key.code.slice(-1)) / 10
			const numkey = sec_start + Math.floor((sec_end - sec_start) * ratio)
			player.seekTo(numkey, true)
		}

		// 재생 속도 조절
		// else if (cs && add || sub)
		// {
		// 	key.preventDefault()
		// 	const updown = add ? 0.05 : -0.05
		// 	const limit = add ? 2 : 0.25
		// 	const minmax  = add ? Math.min : Math.max
		// 	player.setPlaybackRate(minmax(limit, (player.getPlaybackRate() + updown)))
		// }
		// else if (key.code === "Numpad0")
		// {
		// 	key.preventDefault()
		// 	player.setPlaybackRate(1)
		// }
	}
})



// 마우스 휠로 소리 크기 조절 및 오작동 방지
document.addEventListener("wheel", wheel =>
{
	wheel.preventDefault()
	volume_value(wheel.deltaY < 0 ? +5 : -5)
},
{
	passive: false
})



// 소리 크기 조절 5씩 계산
function volume_value(plma)
{
	const volume = player.getVolume()
	const updown = plma > 0
		? Math.floor(volume / 5) * 5 + 5
		: Math.ceil(volume / 5) * 5 - 5
	const change = Math.min(100, Math.max(0, updown))
	player.setVolume(change)
	volume_bar.value = change
}



// 재생 속도 조절
// 보류
function play_speed(key, plma)
{
}



// 링크에서 id만 추출하기
function get_id(link)
{
	// 잘못된것을 받아왔을 때 에러 방지
	try
	{
		// 유효한 링크인지 확인
		const url = new URL(link)

		// 해당 링크가 재생목록인지 확인
		const playlist = url.searchParams.get("list")
		// 재생목록이 맞고 PL 타입 재생목록인지 확인하고 맞으면 값을 전달
		if (playlist && playlist_or_video(playlist))
			return playlist

		// 해당 링크가 동영상 링크인지 확인
		// 링크 모양에 따라 경우의 수 대비
		const v = url.searchParams.get("v")
		const path = url.pathname.split("/").pop()
		const vid = v ?? path

		// 잘못된 링크인지 만약 대비
		const regex = /^[a-zA-Z0-9_-]{11}$/
		// 잘못됐다면 아무것도 안하고 즉시 null 전달
		if (!regex.test(vid))
			return null

		// 동영상 시작시간을 포함하고있는지 확인
		const t = parseInt(url.searchParams.get("t"))
		// 포함하고 있으면 시간도 같이 전달 아니라면 id만 전달 + NaN 방지
		return (Number.isNaN(t)) ? vid : [vid, t]
	}
	// try 과정에서 뭔가 잘못됐다면 즉시 멈추고 null 전달
	catch
	{
		return null
	}
}

// 재생목록 id인가 동영상 id인가 구분하기
function playlist_or_video(id)
{
	return id.startsWith("PL")
}







// 시간 표시 변환
// 100000초 또는 12:34:56 같은 모양으로
// 없는거 채워서 시간값 2개 전달하기
function data_split(time) // 함수 이름 교체 대기
// function time_split(time)
{
	// 숫자 형태 시간 값을 받아왔을 떄
	if (typeof time === "number" && time > 0)
	{
		const date = new Date(time * 1000)
		const hh = date.getUTCHours()
		const mm = date.getUTCMinutes()
		const ss = date.getUTCSeconds()
		const sss = time
		const hms = hms_convert([hh, mm, ss])
		return [ sss, hms ]
	}

	// 문자열 형태 시간 값을 받아왔을 때
	else if (typeof time === "string")
	{
		// 기호 오타 가능성 대비
		const fix = time.replace(/;/g, ":")
		// 정상 값인지 기초만 확인
		const fix_check = fix.includes(":")
		if (fix_check)
		{
			// : 를 기준으로 쪼개서 시 분 초 분리
			const fix_hms = fix.split(":")
			const ss = +(fix_hms.pop())
			const mm = fix_hms.length ? +(fix_hms.pop()) : 0
			const hh = fix_hms.length ? +(fix_hms.pop()) : 0
			const sss = hh * 3600 + mm * 60 + ss
			const hms = hms_convert([hh, mm, ss])
			return [ sss, hms ]
		}
	}
	else
	{
		return [ 0, 0 ]
	}
}



// 시간 문자열 표기법 24:00:00
function hms_convert(hhmmss)
{
	const hms_check = hhmmss.findIndex(num => num !== 0)
	const slice_ready = hms_check === -1 ? hhmmss.length - 1 : hms_check
	const slice_zero = hhmmss.slice(slice_ready)
	const ctrl_zero = slice_zero.map((num, idx) => idx === 0 ? (num + "") : (num + "").padStart(2,"0"))
	const hms = ctrl_zero.join(":")
	return hms
}



// 재생 진행 비율 계산 및 시간 표시
function ctrl_view()
{
	// 지금 재생 중인 동영상 시간 확인
	const cur = player.getCurrentTime()
	const ratio = (cur - sec_start) / (sec_end - sec_start)
	document.getElementById("play_now").style.width = Math.max(0, Math.min(1, ratio)) * 100 + "%"

	// const [, msg_cur] = data_split(cur)
	// if (msg_end && msg_start)
	// {
	// 	if (sec_start === 0)
	// 	{
	// 		document.getElementById("play_msg").textContent = `${msg_cur} < ${msg_end}`
	// 	}
	// 	else
	// 	{
	// 		document.getElementById("play_msg").textContent = `${msg_start} < ${msg_cur} > ${msg_end}`
	// 	}
	// }
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




// 미리보기 몇개 들어가는지 계산
function calc_size(list)
{
	const screen = getComputedStyle(document.documentElement)
	const img_w = parseInt(screen.getPropertyValue("--img-w"))
	const img_h = parseInt(screen.getPropertyValue("--img-h"))

	const short = list.target.classList.contains("short")

	const cell_w = short ? img_h : img_w
	const cell_h = short ? img_w : img_h

	const width = list.contentBoxSize[0].inlineSize
	const height = list.contentBoxSize[0].blockSize

	const col = Math.floor(width / cell_w)
	const row = Math.floor(height / cell_h)
	const cell = col * row

	return cell
}



// 색상 변경
// function color_change(color) wait
function apply_color(color)
{
	if (!color)
		return

	const screen = document.documentElement.style

	if (color.bg)
		screen.setProperty("--bg", color.bg)
	if (color.box)
		screen.setProperty("--box", color.box)
	if (color.highlight)
		screen.setProperty("--highlight", color.highlight)
	// 추가 색상 css에서 변수 이름따라 추가
	// if (color.bg) screen.setProperty("--bg", color.bg)
	// if (color.box) screen.setProperty("--box", color.box)
	// if (color.highlight) screen.setProperty("--highlight", color.highlight)
}




