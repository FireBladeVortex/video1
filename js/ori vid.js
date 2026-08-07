
function make_list()
{
	const left = document.getElementById("left")
	const video_type =
	[
		{ type: "video", tag: "동영상", data: list_data.video ?? null },
		{ type: "short", tag: "쇼츠", data: list_data.short ?? null },
		{ type: "long", tag: "부분 재생", data: list_data.long ?? null },
	]

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
				list_ori = type.data.filter(video => "original" in video)
				list_non = type.data.filter(video => !("original" in video))

				const ori = ori => !ori.original
				if (type.data.some(ori) && !type.data.every(ori))
				{
					const h1_class_all = document.createElement("div")
					h1_class_all.className = "h1_class_item"
					h1_class.appendChild(h1_class_all)

						const all_txt = document.createElement("span")
						all_txt.className = "txt_click"
						all_txt.textContent = "모두"
						h1_class_all.appendChild(all_txt)
						all_txt.addEventListener("click", () => switch_video_data(list_data.video))

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
		img.src = `https://img.youtube.com/vi/${ready_data(ready.id)}/mqdefault.jpg`

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
	// 주소에서 id 추출
	const url = new URL(id)
	const get_id = url.searchParams.get("v") ?? url.pathname.split("/").pop()
	if (arguments.length === 1)
		return get_id

	// 클릭 시 id 저장
	set_id = get_id
	// 주소에서 t값 추출 + 시작시간 비교후 결정
	const get_start = parseInt(url.searchParams.get("t"))
	const set_start = !Number.isNaN(get_start) ? get_start : start
	;[sec_start, msg_start] = data_split(set_start)

	// 종료 시간 결정(getDuration() 아님)
	;[sec_end, msg_end] = data_split(end)

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
