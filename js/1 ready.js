
// YouTube Player iframe API 불러오기
const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
document.head.appendChild(api)

// iframe 들어갈 변수 준비
let player = null

// iframe 호출
function onYouTubeIframeAPIReady()
{
	player = new YT.Player("you_player",
	{
		width: "100%",
		height: "100%",
		videoId: get_id("https://youtu.be/d8dqNFNrXPk?si=oYvXLu99zBxl8c1o"),
		playerVars:
		{
			autoplay: 0, // 자동재생 방지
			rel: 0, // 영상 종료 때 추천 방지
			// fs: 0, // 풀 스크린 버튼 숨김
			disablekb: 1, // 유튜브 자체 키보드 조작 기능 방지 방향키 숫자 0~9 등
			// controls: 0, // 유튜브 일부 ui 숨김
			origin: window.location.origin,
			cc_lang_pref: "ko",
			cc_load_policy: 1,
			color: "blue",
		},
		// 현재 상태 불러오기
		events:
		{
			onReady: () =>
			{
				player.setVolume(+volume_bar.value) // 현재 value 적용
			},
			onStateChange : onPlayerStateChange
		}
	})
}

// 영상 상태 확인
// YT.PlayerState.ENDED = 0
// YT.PlayerState.PLAYING = 1
// YT.PlayerState.PAUSED = 2
// YT.PlayerState.BUFFERING = 3
// YT.PlayerState.CUED = 5
const play = () => player?.getPlayerState?.() === YT.PlayerState.PLAYING
const pause = () => player?.getPlayerState?.() === YT.PlayerState.PAUSED
const play_now = () => play() || pause() // !play_now === !play && !pause

// 최초 재생 시작하기 전 상태
let img_click = null

// 동영상 정보 관리
let set_id = null
let set_ch = null
let set_name = null
let set_title = null

// 시간 값 관리
let sec_start = null
let sec_end = null

// 시간 메세지
let msg_start = null
let msg_end = null

// 페이지 관리
let video_multiple = 1
let short_multiple = 1

// 지금 보이는 크기 관리
let active_data = { video: null, short: null }

// 시간 문자열 표기법 정리 24:00:00
function hms_fix(hhmmss)
{
	const hms_check = hhmmss.findIndex(num => num !== 0)
	const slice_ready = hms_check === -1 ? hhmmss.length - 1 : hms_check
	const slice_zero = hhmmss.slice(slice_ready)
	const ctrl_zero = slice_zero.map((num, idx) => idx === 0 ? (num + "") : (num + "").padStart(2,"0"))
	const hms = ctrl_zero.join(":")
	return hms
}

// 시간 표기법 2가지 생성
function time_fix(time)
{
	if (typeof time === "number" && time > 0)
	{
		const date = new Date(time * 1000)
		const hh = date.getUTCHours()
		const mm = date.getUTCMinutes()
		const ss = date.getUTCSeconds()
		const sss = time
		const hms = hms_fix([hh, mm, ss])
		return [ sss, hms ]
	}
	else if (typeof time === "string")
	{
		const fix = time.replace(/;/g, ":")
		const fix_check = time.includes(":")
		if (fix_check)
		{
			const fix_hms = fix.split(":")
			const ss = +(fix_hms.pop())
			const mm = fix_hms.length ? +(fix_hms.pop()) : 0
			const hh = fix_hms.length ? +(fix_hms.pop()) : 0
			const sss = hh * 3600 + mm * 60 + ss
			const hms = hms_fix([hh, mm, ss])
			return [ sss, hms ]
		}
	}
	return
}


// 유효한 유튜브 링크 확인 및 id 확인
function get_id(id)
{
	try
	{
		const url = new URL(id)
		const v = url.searchParams.get("v")
		const path = url.pathname.split("/").pop()
		const vid = v ?? path

		const regex = /^[a-zA-Z0-9_-]{11}$/
		if (!regex.test(vid))
			return null

		const t = parseInt(url.searchParams.get("t"))
		return (Number.isNaN(t)) ? vid : [vid, t]
	}
	catch
	{
		return null
	}
}

function data_filter(data, type)
{
	const a = new Map()
	const b = new Map()

	data.forEach(video =>
	{
		const vid = get_id(video.id)
		if (!vid)
			return

		const id = Array.isArray(vid) ? vid[0] : vid
		const comp = video[type]

		if (comp)
		{
			const v = { id: id, [type]: video[type] }
			if (!a.has(id))
			{
				a.set(id, v)
			}
		}
		else
		{
			const v = { id: id }
			if (!b.has(id))
			{
				b.set(id, v)
			}
		}
	})

	const ori = [...a.values()]
	const non = [...b.values()].filter(video => !a.has(video.id))
	const all = ori.concat(non)

	return { ori, non, all }
}

const list_video = data_filter(list_data.video, "original")
const list_short = data_filter(list_data.short)

console.log(list_video.ori)
console.log(list_video.non)
console.log(list_video.all)
console.log(list_short.ori)
console.log(list_short.non)
console.log(list_short.all)















// 재생 일시중지
function play_or_pause()
{
	if (play())
	{
		player.pauseVideo()
	}
	else if (pause())
	{
		player.playVideo()
	}
}

// 재생 막대
function ctrl_view()
{
	const cur = player.getCurrentTime()
	const ratio = (cur - sec_start) / (sec_end - sec_start)
	document.getElementById("play_now").style.width = Math.max(0, Math.min(1, ratio)) * 100 + "%"

	/*
	const [, msg_cur] = time_fix(cur)
	if (msg_end && msg_start)
	{
		if (sec_start === 0)
		{
			document.getElementById("play_msg").textContent = `${msg_cur} < ${msg_end}`
		}
		else
		{
			document.getElementById("play_msg").textContent = `${msg_start} < ${msg_cur} > ${msg_end}`
		}
	}
	*/

}

// 상태 변화 감지에서 사용할 재생 막대 변수
let play_bar = null

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
			[sec_end, msg_end] = time_fix(player.getDuration())
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
	document.querySelectorAll("#right").forEach(overlay => // ("#right, #ad")  // #ad 임시 삭제 사용자 선택으로 버튼 만들기 전까지
	{
		overlay.style.cursor = pop ? "pointer" : "default"
		overlay.onclick = pop ? play_or_pause : null
	})
	document.getElementById("ad").style.pointerEvents = pop ? "auto" : "none"
}

