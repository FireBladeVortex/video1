
// 이름 가나다순 정렬
function name_sort(list)
{
	const collator = new Intl.Collator("ko")
	const list_sort = [...list].sort((a, b) =>
	{
		const compare = collator.compare(a.name.trim(), b.name.trim())
		return compare
	})

	const map = new Map()
	list_sort.forEach(it =>
	{
		const key = it.name.trim()
		if (map.has(key))
		{
			map.get(key).is_has = true
		}
		else
		{
			map.set(key, { ...it })
		}
	})
	const list_fix = [...map.values()]

	return list_fix
}


async function fix_playlist_data(playlist)
{
	const keys = Object.keys(playlist)


	for (const key of keys)
	{
		// color 등 붎필요한 호출 방지 및 미래 대비
		if (!Array.isArray(playlist[key]))
			continue

		for (const video of playlist[key])
		{
			const id = get_id(video.id)

			if (id)
			{
				if (id.startsWith("PL"))
				{
					const data = await cue_and_wait(id)
					// (수정) key 전달 제거, 반환값을 직접 받음
					temp_list[key] = (temp_list[key] ?? []).concat(data)
					// (추가) 받아온 값을 바로 temp_list에 삽입
				}
				else
				{
					// (추가) id를 제외한 나머지 값(original, song 등) 모두 보존
					const { id, ...rest } = video

					const fix = get_id(id)
					if (!fix)
						continue

					const fix_id = Array.isArray(fix) ? fix[0] : fix
					temp_list[key] = (temp_list[key] ?? []).concat([{ id: fix_id, ...rest }])
					// (수정) result 대신 temp_list에 직접 삽입
				}
			}
		}
	}
}

// id 값이 실제로 채워진 배열인지 확인 (추가)
function valid_playlist(arr)
{
	return Array.isArray(arr) && arr.some(video => video.id)
}




function get_songs(video) // valid_list 생성 대신 video 하나당 유효한 song 목록을 즉석에서 반환
{
	const song_list = video.song ?? []

	if (song_list.length === 0)
		return [{ id: video.id }] // id만 가진 경우 유효

	return song_list
		.filter(song => song.lang && song.name && song.title && song.start && song.end) // 모두 가진 것만 유효
		.map(song => ({ id: video.id, ...song }))
}

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


let big_type = null // 현재 확대된 섹션 타입 저장
// (수정) 재생 목록 칸 확대/축소 전환 (토글 방식)
function resize_section(type_str)
{
	const left = document.getElementById("left")
	const rows = { video: "2fr", short: "2fr", long: "1fr" }

	const next_big = big_type === type_str ? null : type_str // 같은 타입 재클릭 시 해제

	if (next_big)
	{
		rows.video = type_str === "video" ? "1fr" : "0fr"
		rows.short = type_str === "short" ? "1fr" : "0fr"
		rows.long = type_str === "long" ? "1fr" : "0fr"
	}

	left.style.gridTemplateRows = `${rows.video} ${rows.short} ${rows.long}`

	big_type = next_big // 상태 갱신

	document.querySelectorAll(".h1_size .txt_click").forEach(span => // 모든 토글 문자열 재설정
	{
		span.textContent = span.dataset.type === big_type ? "작게" : "크게"
	})
}


// 마지막 페이지 번호 계산 공통 함수
function get_last(type_str)
{
	const num = total_cell[type_str]
	const data = active_data[type_str] ?? list_data[type_str]
	return Math.ceil(data.length / num)
}


function click_img(target)
{
	// 활성화 버튼 강조 나머지 버튼 어둡게
	document.querySelectorAll(".btn").forEach(btn =>
	{
		const compare = (btn.dataset.type + "_" + (btn.dataset.num + "").padStart(3, "0"))
		const click_img = compare === target
		btn.classList.toggle("active", click_img)
		btn.classList.toggle("blur", !click_img)
	})
	// total_list에서 클릭한 썸네일 또 클릭할때 쓰는 장치
	img_click = target
}



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






// iframe 들어갈 변수 준비
let player = null

let player_ready_resolve = null // (추가)
const player_ready = new Promise(resolve => { player_ready_resolve = resolve }) // (추가) player 준비 완료 시점을 외부에서 기다리기 위함

// api 스크립트 삽입 + player 준비될 때까지 대기 (추가)
function load_player()
{
	document.head.appendChild(api)
	return player_ready
}



// multiple 값에 맞는 범위만 썸네일 표시/숨김
function update_page(type_str)
{
	const num = total_cell[type_str]
	if (!num)
		return

	const multiple = type_str === "short" ? short_multiple : video_multiple
	const min_num = (multiple - 1) * num
	const max_num = (multiple * num) - 1

	document.querySelectorAll(`.btn[data-type="${type_str}"]`).forEach(btn =>
	{
		const idx = +btn.dataset.num
		const show = idx >= min_num && idx <= max_num
		btn.style.display = show ? "" : "none"
	})
}

// 크기 변경 시 multiple, 표시값 초기화
function reset_page(type_str)
{
	if (type_str === "short")
		short_multiple = 1
	else
		video_multiple = 1


	render_nav(type_str)
}



// youtube 정보 가져오기 cue 상태 되기전
function ready_data(id, start = 0, end = 0)
{
	// // 주소에서 id 추출
	// const url = new URL(id)
	// const get_id = url.searchParams.get("v") ?? url.pathname.split("/").pop()
	const get_id = id

	if (arguments.length === 1)
		return get_id

	// 클릭 시 id 저장
	set_id = id

	// // 주소에서 t값 추출 + 시작시간 비교후 결정
	// const get_start = parseInt(url.searchParams.get("t"))
	// const set_start = !Number.isNaN(get_start) ? get_start : start
	const start_t = data_split(start)
	sec_start = start_t[0]
	msg_start = start_t[1]

	// 종료 시간 결정(getDuration() 아님)
	const end_t = data_split(end)
	sec_end = end_t[0]
	msg_end = end_t[1]

	// 영상 불러오기
	player.cueVideoById(
	{
		videoId : get_id,
		startSeconds : sec_start, // 광고 때문에 sec_start 대신 임시로 0
		...(sec_end > 0 && {endSeconds : sec_end})
	})

}


// CUED(5) 상태 감지용 대기 장치 (추가)
let playlist_ready_resolve = null

// 큐잉 완료(CUED)까지 대기 (추가)
function wait_cued()
{
	return new Promise(resolve => { playlist_ready_resolve = resolve })
}


// 이름 제목
async function fetch_oembed(id) // 값 실적용 대신 뱉어내는 방식으로 변경
{
	const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
	try
	{
		const input = await fetch(url)
		const data = await input.json()

		set_name = data.author_name
		set_ch = data.author_url
		set_title = data.title
		document.title = set_name

		if (arguments.length !== 1)
			return

		document.getElementById("play_msg").style.textAlign = "start"
		document.getElementById("play_msg").textContent = set_title
	}
	catch
	{
	}
}



function cue_and_wait(id)
{
	const temp_div = document.createElement("div")
	document.body.appendChild(temp_div)

	let temp_player = null // (추가) 콜백 내부에서 참조할 수 있도록 미리 선언

	const promise = new Promise(resolve => // (수정) Promise를 변수에 먼저 담음
	{
		temp_player = new YT.Player(temp_div,
		{
			height: "0", width: "0",
			events:
			{
				onReady: () => // (추가) player가 실제로 준비된 뒤에만 메서드 호출 가능
				{
					temp_player.cuePlaylist({ listType: "playlist", list: id })
					// (수정) 위치 이동: onReady 안에서 실행
				},
				onStateChange: event =>
				{
					if (event.data !== YT.PlayerState.CUED)
						return

					const list = temp_player.getPlaylist()
					if (!list)
						return

					const result = list.map(id => ({ id }))

					temp_player.destroy()
					temp_div.remove()

					resolve(result)
				}
			}
		})
	})
	return promise
}


// intro 데이터 재생 준비 (추가) - 재생목록이면 cuePlaylist(랜덤), 일반 동영상이면 cueVideoById
function cue_intro(intro)
{
	if (playlist_or_video(intro))
	{
		player.setShuffle(true) // 랜덤 선택
		player.cuePlaylist(
		{
			listType: "playlist",
			list: intro
		})
	}
	else
	{
		player.cueVideoById(
		{
			videoId : intro,
		})
	}
}

