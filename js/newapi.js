
/*

https://developers.google.com/youtube/iframe_api_reference?hl=ko

https://gist.github.com/Araxeus/fc574d0f31ba71d62215c0873a7b048e

http://developer.mozilla.org/

https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Events

https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values

*/



// YouTube Player iframe API 불러오기
const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
// document.head.appendChild(api)



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

// iframe 호출
function onYouTubeIframeAPIReady()
{
	const vidvid = Array.isArray(pli_intro)
	? pli_intro[Math.floor(Math.random() * pli_intro.length)]
	: pli_intro
	player = new YT.Player("you_player",
	{
		width: "100%",
		height: "100%",
		// videoId: "d8dqNFNrXPk",
		videoId: vidvid,
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
				player_ready_resolve() // (추가) player 사용 가능해진 시점 알림
			},
			onStateChange : onPlayerStateChange
		}
	})
}



/*
영상 상태 확인
YT.PlayerState.ENDED = 0
YT.PlayerState.PLAYING = 1
YT.PlayerState.PAUSED = 2
YT.PlayerState.BUFFERING = 3
YT.PlayerState.CUED = 5
*/
const play = () => player?.getPlayerState?.() === YT.PlayerState.PLAYING
const pause = () => player?.getPlayerState?.() === YT.PlayerState.PAUSED
const play_now = () => play() || pause() // !play_now === !play && !pause

// 최초 재생 시작하기 전 상태
let img_click = null
// 정보 관리
let set_id = null
let set_name = null
let set_title = null
let set_ch = null
// 시간 관리
let sec_start = null
let sec_end = null
// 시간 메세지
let msg_start = null
let msg_end = null

let video_multiple = 1
let short_multiple = 1

let active_data = { video: null, short: null } // 현재 표시중인 목록 데이터
let list_ori = [] // original 값을 가진 데이터만 모음
let list_non = [] // original 값이 없는 데이터만 모음
let pli_ori = null // (추가) 재생목록에서 받아온 원곡 목록 저장
let pli_non = null // (추가) 재생목록에서 받아온 커버(video) 목록 저장
let pli_short = null // (추가) 재생목록에서 받아온 쇼츠 목록 저장
let pli_intro = null

// id 값이 실제로 채워진 배열인지 확인 (추가)
function valid_playlist(arr)
{
	return Array.isArray(arr) && arr.some(video => video.id)
}


function make_list()
{
	const left = document.getElementById("left")



	const has_ori = valid_playlist(pli_ori) // (수정) playlist.ori 대신 pli_ori 사용
	const has_video = valid_playlist(pli_non) // (수정) playlist.video 대신 pli_non 사용

	list_ori = has_ori ? pli_ori : [] // (수정)
	list_non = has_video ? pli_non : [] // (수정)

	const video_data = // (추가) 존재 조합에 따른 기본 표시 데이터 결정
		has_ori && has_video ? list_ori.concat(list_non) :
		has_ori ? list_ori :
		has_video ? list_non :
		null

	const video_type =
	[
		{ type: "video", tag: "동영상", data: video_data }, // 수정
		{ type: "short", tag: "쇼츠", data: pli_short ?? null }, // 수정
		{ type: "long", tag: "부분 재생", data: playlist.part ?? null }, // 수정
	]





	// const video_type =
	// [
	// 	{ type: "video", tag: "동영상", data: list_data.video ?? null },
	// 	{ type: "short", tag: "쇼츠", data: list_data.short ?? null },
	// 	{ type: "long", tag: "부분 재생", data: list_data.long ?? null },
	// ]

	video_type.forEach(type =>
	{
		if (!type.data)
			return

		const section = document.createElement("div")
		section.className = "section"
		section.dataset.type = type.type
		left.appendChild(section)

		const h1 = document.createElement("h1")
		section.appendChild(h1)

		const h1_name = document.createElement("div")
		h1_name.className = "h1_name"
		h1_name.textContent = type.tag + " 재생 목록"
		h1.appendChild(h1_name)


		const h1_class = document.createElement("div")
		h1_class.className = "h1_class"
		h1.appendChild(h1_class)



			const h1_page = document.createElement("div")
			h1_page.className = "h1_page"
			h1.appendChild(h1_page)


		if (type.type !== "long")
		{
			active_data[type.type] = type.data


			if (type.type === "video")
			{
				if (has_ori && has_video) // (수정) 위에서 계산한 값 재사용
				{
					const h1_class_all = document.createElement("div")
					h1_class_all.className = "h1_class_item"
					h1_class.appendChild(h1_class_all)

						const all_txt = document.createElement("span")
						all_txt.className = "txt_click"
						all_txt.textContent = "모두"
						h1_class_all.appendChild(all_txt)
						all_txt.addEventListener("click", () => switch_video_data(list_ori.concat(list_non))) // (수정)

					const h1_class_original = document.createElement("div")
					h1_class_original.className = "h1_class_item"
					h1_class.appendChild(h1_class_original)

						const original_txt = document.createElement("span")
						original_txt.className = "txt_click"
						original_txt.textContent = "원곡"
						h1_class_original.appendChild(original_txt)
						original_txt.addEventListener("click", () => switch_video_data(list_ori))

					const h1_class_cover = document.createElement("div")
					h1_class_cover.className = "h1_class_item"
					h1_class.appendChild(h1_class_cover)

						const cover_txt = document.createElement("span")
						cover_txt.className = "txt_click"
						cover_txt.textContent = "커버"
						h1_class_cover.appendChild(cover_txt)
						cover_txt.addEventListener("click", () => switch_video_data(list_non))
				}
			}


				const btn_prev = document.createElement("div")
				btn_prev.className = "btn_prev"
				btn_prev.dataset.type = type.type
				h1_page.appendChild(btn_prev)

					const btn_prev_txt = document.createElement("span")
					btn_prev_txt.className = "txt_click"
					btn_prev.appendChild(btn_prev_txt)
					btn_prev_txt.addEventListener("click", () =>
					{
						if (type.type === "short")
							short_multiple = Math.max(1, short_multiple - 1)
						else
							video_multiple = Math.max(1, video_multiple - 1)
						render_nav(type.type)
						update_page(type.type)
					})

				const btn_center = document.createElement("div")
				btn_center.className = "btn_center"
				btn_center.dataset.type = type.type
				h1_page.appendChild(btn_center)

				const btn_next = document.createElement("div")
				btn_next.className = "btn_next"
				btn_next.dataset.type = type.type
				h1_page.appendChild(btn_next)

					const btn_next_txt = document.createElement("span")
					btn_next_txt.className = "txt_click"
					btn_next.appendChild(btn_next_txt)
					btn_next_txt.addEventListener("click", () =>
					{
						const last = get_last(type.type)
						const multiple = type.type === "short" ? short_multiple : video_multiple
						if (multiple >= last)
							return
						if (type.type === "short")
							short_multiple = short_multiple + 1
						else
							video_multiple = video_multiple + 1
						render_nav(type.type)
						update_page(type.type)
					})
			render_nav(type.type)
		}

		const h1_size = document.createElement("div")
		h1_size.className = "h1_size"
		h1.appendChild(h1_size)

			const toggle_txt = document.createElement("span")
			toggle_txt.className = "txt_click"
			toggle_txt.textContent = "크게"
			toggle_txt.dataset.type = type.type
			h1_size.appendChild(toggle_txt)
			toggle_txt.addEventListener("click", () => resize_section(type.type))

		if (type.type === "long")
		{
			make_long()
			return
		}





		const list = document.createElement("div")
		list.className = `list ${type.type}`
		section.appendChild(list)

		// list 크기를 가로 세로 썸네일 크기 배수 구해서 총 몇칸인지 구하고 page로 넘겨
		const page = document.createElement("div")
		page.className = `page ${type.type}`
		list.appendChild(page)


		fill_page(type.type)
	})
}


//
function calc_size(list)
{
	const root = getComputedStyle(document.documentElement)
	const img_w = parseInt(root.getPropertyValue("--img-w"))
	const img_h = parseInt(root.getPropertyValue("--img-h"))

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


// total_cell 값에 맞춰 썸네일 버튼을 (재)생성하는 함수
function fill_page(type_str)
{
	const page = document.querySelector(`.page.${type_str}`)
	if (!page)
		return

	const data = active_data[type_str] ?? list_data[type_str]
	if (!data)
		return

	const crrt_data_count = page.children.length
	const nxxt_data_count = data.length

	// const next_count = total_cell[type_str] 새로 계산된 필요 개수

	for (let num = 0; data.length; num++)
	{
		const ready = data[num]
		if (!ready) break

		const btn = document.createElement("button")
		btn.className = "btn"
		btn.dataset.num = num
		btn.dataset.type = type_str

		const img = document.createElement("img")
		const src_1 = "https://img.youtube.com/vi/"
		const src_2 = ready.id
		const src_3 = "/mqdefault.jpg"
		img.src = src_1 + src_2 + src_3

		btn.appendChild(img)
		page.appendChild(btn)

		btn.addEventListener("click", () =>
		{
			const target = (type_str + "_" + (num + "").padStart(3, "0"))
			if (img_click === target)
			{
				if (play())
				{
					player.pauseVideo()
				}
				else if (pause())
				{
					player.playVideo()
				}
				else
					return
			}
			else
			{
				click_img(target)
				const short = type_str === "short"
				ready_data(ready.id, short ? 0 : ready.start, short ? 0 : ready.end)
			}
		})
	}
}
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

// 마지막 페이지 번호 계산 공통 함수
function get_last(type_str)
{
	const num = total_cell[type_str]
	const data = active_data[type_str] ?? list_data[type_str]
	return Math.ceil(data.length / num)
}

// 이전/중앙/다음 버튼 영역을 상태에 맞게 다시 그리는 공통 함수
function render_nav(type_str)
{
	const btn_prev = document.querySelector(`.btn_prev[data-type="${type_str}"]`)
	const btn_center = document.querySelector(`.btn_center[data-type="${type_str}"]`)
	const btn_next = document.querySelector(`.btn_next[data-type="${type_str}"]`)
	if (!btn_prev || !btn_center || !btn_next)
		return



	const btn_prev_txt = btn_prev.querySelector(".txt_click")
	const btn_next_txt = btn_next.querySelector(".txt_click")


	const last = get_last(type_str)

	if (last <= 1)
	{
		btn_prev_txt.textContent = ""
		btn_center.textContent = ""
		btn_next_txt.textContent = ""
		return
	}

	const multiple = type_str === "short" ? short_multiple : video_multiple

	btn_prev_txt.textContent = multiple === 1 ? "" : "이전"
	btn_center.textContent = ""
	btn_next_txt.textContent = multiple >= last ? "" : "다음"

	const num_prev = document.createElement("div")
	num_prev.className = "num_prev"
	num_prev.dataset.type = type_str
	num_prev.textContent = multiple === 1 ? "" : multiple - 1
	btn_center.appendChild(num_prev)

	const num_curr = document.createElement("div")
	num_curr.className = "num_curr"
	num_curr.dataset.type = type_str
	num_curr.textContent = multiple
	btn_center.appendChild(num_curr)

	const num_next = document.createElement("div")
	num_next.className = "num_next"
	num_next.dataset.type = type_str
	num_next.textContent = multiple + 1 > last ? "" : multiple + 1
	btn_center.appendChild(num_next)
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



// 시간값 시간표시 정리
function data_split(time)
{
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
			const hms = hms_convert([hh, mm, ss])
			return [ sss, hms ]
		}
	}
	else
	{
		return [ 0, 0 ]
	}
}



// 시간 메세지 표기법 정리 24:00:00
function hms_convert(hhmmss)
{
	const hms_check = hhmmss.findIndex(num => num !== 0)
	const slice_ready = hms_check === -1 ? hhmmss.length - 1 : hms_check
	const slice_zero = hhmmss.slice(slice_ready)
	const ctrl_zero = slice_zero.map((num, idx) => idx === 0 ? (num + "") : (num + "").padStart(2,"0"))
	const hms = ctrl_zero.join(":")
	return hms
}



// 상태 변화 감지에서 사용할 재생 막대 변수
let play_bar = null

// 재생 막대
function ctrl_view()
{
	const cur = player.getCurrentTime()
	const ratio = (cur - sec_start) / (sec_end - sec_start)
	document.getElementById("play_now").style.width = Math.max(0, Math.min(1, ratio)) * 100 + "%"

	/*
	const [, msg_cur] = data_split(cur)
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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function get_songs(video) // valid_list 생성 대신 video 하나당 유효한 song 목록을 즉석에서 반환
{
	const song_list = video.song ?? []

	if (song_list.length === 0)
		return [{ id: video.id }] // id만 가진 경우 유효

	return song_list
		.filter(song => song.lang && song.name && song.title && song.start && song.end) // 모두 가진 것만 유효
		.map(song => ({ id: video.id, ...song }))
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// long 섹션 필터 드롭다운 생성 (수정/추가)
function make_long()
{
	if (!playlist.part)
		return // long 파일 없으면 작동 안함

	const section = document.querySelector('.section[data-type="long"]')
	if (!section)
		return

	// 1행 (3칸, 1:3:1)
	const row1 = document.createElement("div")
	row1.className = "long_row1"
	section.appendChild(row1)

	const lang_select = document.createElement("select")
	lang_select.className = "long_lang"
	row1.appendChild(lang_select)

	const name_select = document.createElement("select")
	name_select.className = "long_name"
	row1.appendChild(name_select)

	const empty_col = document.createElement("div")
	empty_col.className = "long_empty"
	row1.appendChild(empty_col)

	const ready_btn = document.createElement("button")
	ready_btn.className = "long_ready"
	ready_btn.textContent = "재생 준비"
	empty_col.appendChild(ready_btn)
	ready_btn.classList.add("blur")


	// 2행 (1칸, 100%)
	const row2 = document.createElement("div")
	row2.className = "long_row2"
	section.appendChild(row2)

	const title_select = document.createElement("select")
	title_select.className = "long_title"
	row2.appendChild(title_select)

	// option 생성 도우미
	function make_option(select, value, text, selected = false)
	{
		const option = document.createElement("option")
		option.value = value
		option.textContent = text
		if (selected)
			{
				option.selected = true

		option.disabled = true
		option.hidden = true
			}
		select.appendChild(option)
	}

	make_option(lang_select, "", "언어", true)
	;["한국어", "일본어", "외국어"].forEach(lang => make_option(lang_select, lang, lang))

	make_option(name_select, "", "부른 이", true)
	make_option(title_select, "", "제목", true)

	// lang 값에 맞는 name 목록 갱신
	function update_name()
	{
		const lang_value = lang_select.value
		const names = new Set()

		playlist.part.forEach(video => // valid_list 대신 list_data.long 직접 순회
		{
			get_songs(video).forEach(song =>
			{
				if (!song.lang)
					return // id만 가진 항목은 lang이 없으므로 제외
				if (!lang_value || song.lang === lang_value)
				{
					names.add(song.name)
				}
			})
		})

		name_select.innerHTML = ""
		make_option(name_select, "", "부른 이", true)
		;[...names].forEach(name => make_option(name_select, name, name))
	}

	// lang, name 값에 맞는 title 목록 갱신 (name 선택 시에만 등장)
	function update_title()
	{
		const lang_value = lang_select.value
		const name_value = name_select.value

		title_select.innerHTML = ""
		make_option(title_select, "", "제목", true)

		if (!name_value)
			return // name 기본값이면 목록 비움

		const titles = new Set()

		playlist.part.forEach(video => // valid_list 대신 list_data.long 직접 순회
		{
			get_songs(video).forEach(song =>
			{
				if (!song.lang)
					return // id만 가진 항목은 제외
				const lang_match = !lang_value || song.lang === lang_value
				const name_match = song.name === name_value
				if (lang_match && name_match)
				{
					titles.add(song.title)
				}
			})
		})


		;[...titles].forEach(title => make_option(title_select, title, title))
		ready_btn.classList.toggle("active", false)
	}

	lang_select.addEventListener("change", () =>
	{
		update_name()
		update_title()
	})
	name_select.addEventListener("change", update_title)

	title_select.addEventListener("change", () =>
	{
		ready_btn.classList.toggle("active", title_select.value)
		ready_btn.classList.toggle("blur", !title_select.value)
	})

	ready_btn.addEventListener("click", () =>
	{
		const target = "long_ready"
		{
			click_img(target)
			const lang_value = lang_select.value
			const name_value = name_select.value
			const title_value = title_select.value

			let song = null
			for (const video of playlist.part) // valid_list 대신 list_data.long 직접 순회
			{
				const found = get_songs(video).find(s =>
					s.lang && // id만 가진 항목은 제외
					(!lang_value || s.lang === lang_value) &&
					s.name === name_value &&
					s.title === title_value
				)
				if (found)
				{
					song = found
					break
				}
			}

			if (song)
			{
				ready_data(song.id, song.start, song.end) // video.id 대신 song.id (valid_list에 이미 포함됨)
			}
		}
	})

	update_name()
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 볼륨 변수
const volume = document.getElementById("volume")
const volume_bar = document.getElementById("volume_bar")



// 볼륨 조절 막대 값 반영 시키기
volume_bar.addEventListener("input", () =>
{
	player.setVolume(+volume_bar.value)
})



// 소리 크기 조절 간섭 방지
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
	/*
	if (!cs)
	{
	*/
		if (add)
		{
			key.preventDefault()
			volume_value(+5)
		}
		else if (sub)
		{
			key.preventDefault()
			volume_value(-5)
		}
	/*
	}
	else if (cs && add || sub)
	{
		key.preventDefault()
	}
	*/
	// 준비안됐으면 작동 중지
	if (!player || !play_now()) return

	if (!key.repeat)
	{
		if (key.code === "Space")
		{
			key.preventDefault()
			play_or_pause()
		}
		if (key.code === "ArrowLeft")
		{
			key.preventDefault()
			player.seekTo(Math.max(sec_start, player.getCurrentTime() - 5), true) // sec_start 보다 작아질 수 없음
		}
		if (key.code === "ArrowRight")
		{
			key.preventDefault()
			player.seekTo(Math.min(sec_end, player.getCurrentTime() + 5), true) // sec_end 보다 커질 수 없음
		}
		// 현재 재생 위치 변경
		if (key.code.match(/^(Digit|Numpad)[0-9]$/))
		{
			key.preventDefault()
			const ratio = +(key.code.slice(-1)) / 10
			const numkey = sec_start + Math.floor((sec_end - sec_start) * ratio)
			player.seekTo(numkey, true)
		}

		/*
		else if (cs && add || sub)
		{
			key.preventDefault()
			const updown = add ? 0.05 : -0.05
			const limit = add ? 2 : 0.25
			const minmax  = add ? Math.min : Math.max
			player.setPlaybackRate(minmax(limit, (player.getPlaybackRate() + updown)))
		}
		else if (key.code === "Numpad0")
		{
			key.preventDefault()
			player.setPlaybackRate(1)
		}
		*/

	}
})



// 마우스 휠 소리 크기 조절 및 오작동 억제
document.addEventListener("wheel", wheel =>
{
	wheel.preventDefault()
	volume_value(wheel.deltaY < 0 ? +5 : -5)
},
{
	passive: false
})



// 소리 크기 조절
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
function play_speed(key, plma)
{
}



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

// 싲가
const total_cell = { video: 0, short: 0 }

const resize = new ResizeObserver(entry =>
{
	entry.forEach(list =>
	{
		const type = list.target.classList.contains("short") ? "short" : "video"
		total_cell[type] = calc_size(list)

		reset_page(type)
		update_page(type)
	})
})

// 스위치 클릭 시 실제 초기화 실행 (추가)
function switch_click()
{
	// document.head.appendChild(api) // YouTube iframe API 로드 시작 → onYouTubeIframeAPIReady 자동 호출됨

	make_list() // 뼈대(.list, .page) + 썸네일 DOM 생성

	document.querySelectorAll(".list").forEach(list => resize.observe(list)) // 크기 관찰 시작

	// this.remove() // 스위치 사각형 제거
}

// document.getElementById("switch").addEventListener("click", switch_click)



// // 유효한 유튜브 링크 확인 및 id 확인
// async function get_id(id) // (수정) async 전환
// {
// 	try
// 	{
// 		const url = new URL(id)
// 		const playlist = url.searchParams.get("list")
// 		if (playlist)
// 		{

// 			// player.cuePlaylist({ listType: "playlist", list: playlist }) // (추가) 재생목록 큐잉 시작
// 			// const list = await wait_playlist() // (추가) getPlaylist()가 값 채워질 때까지 대기
// 			// // return list
// 			// return list.map(id => ({ id })) // (수정) 기존 [{id:""}, ...] 형태 유지하도록
// 			const prev = player.getPlaylist?.() ?? [] // (추가) 큐잉 전 기존 목록 기억
// 			player.cuePlaylist({ listType: "playlist", list: playlist }) // (추가) 재생목록 큐잉 시작
// 			const list = await wait_playlist(prev) // (수정) 이전 목록과 달라질 때까지 대기
// 			return list.map(id => ({ id })) // 기존 [{id:""}, ...] 형태 유지하도록
// 		}
// 		const v = url.searchParams.get("v")
// 		const path = url.pathname.split("/").pop()
// 		const vid = v ?? path

// 		const regex = /^[a-zA-Z0-9_-]{11}$/
// 		if (!regex.test(vid))
// 			return null

// 		const t = parseInt(url.searchParams.get("t"))
// 		return (Number.isNaN(t)) ? vid : [vid, t]
// 	}
// 	catch
// 	{
// 		return null
// 	}
// }

// 유효한 유튜브 영상 id 확인 (수정) 재생목록 처리 분리, 동기 함수로 원복
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

// 재생목록 id만 추출 (추가)
function get_list_id(id)
{
	try
	{
		const url = new URL(id)
		return url.searchParams.get("list")
	}
	catch
	{
		return null
	}
}

// CUED(5) 상태 감지용 대기 장치 (추가)
let playlist_ready_resolve = null

// 큐잉 완료(CUED)까지 대기 (추가)
function wait_cued()
{
	return new Promise(resolve => { playlist_ready_resolve = resolve })
}

// // 재생목록 id 큐잉 + CUED 대기 + 내부 영상 목록 반환 (추가)
// async function cue_and_wait(list_id)
// {
// 	player.cuePlaylist({ listType: "playlist", list: list_id })
// 	await wait_cued()
// 	return player.getPlaylist()
// }


// 재생목록 id마다 독립된 임시 player로 동시 큐잉 + 결과를 pli_* 전역 변수에 저장 (수정)
function cue_and_wait(list_id, key)
{
	const temp_div = document.createElement("div") // (수정) Promise 밖으로 이동
	document.body.appendChild(temp_div) // (수정)

	let temp_player = null // (추가) 콜백 내부에서 참조할 수 있도록 미리 선언

	const promise = new Promise(resolve => // (수정) Promise를 변수에 먼저 담음
	{
		temp_player = new YT.Player(temp_div, // (수정)
		{
			height: "0", width: "0",
			events:
			{
				onReady: () => // (추가) player가 실제로 준비된 뒤에만 cuePlaylist 호출 가능
				{
					temp_player.cuePlaylist({ listType: "playlist", list: list_id }) // (수정) onReady 콜백 내부로 이동
				},
				onStateChange: event =>
				{
					if (event.data !== YT.PlayerState.CUED) return

					const list = temp_player.getPlaylist()
					if (!list || !list.length) return

					const result = list.map(id => ({ id }))

					if (key === "intro") pli_intro = result
					else if (key === "ori") pli_ori = result
					else if (key === "short") pli_short = result
					else pli_non = result

					temp_player.destroy()
					temp_div.remove()

					resolve() // 대입/정리 끝난 뒤 신호만 보냄
				}
			}
		})
	})

	return promise // (수정) 마지막에 한 줄로 return
}











// intro 데이터 재생 준비 (추가) - 재생목록이면 cuePlaylist(랜덤), 일반 동영상이면 cueVideoById
async function cue_intro(intro)
{
	const video = intro?.[0]
	if (!video) return

	const list_id = get_list_id(video.id)

	if (list_id)
	{
		player.setShuffle(true) // 랜덤 선택
		player.cuePlaylist({ listType: "playlist", list: list_id })
		await wait_cued()
		return
	}

	const fix = get_id(video.id)
	if (!fix) return

	ready_data(Array.isArray(fix) ? fix[0] : fix)
}
