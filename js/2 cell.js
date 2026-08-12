


function make_list()
{
	// 왼쪽 화면
	const left = document.getElementById("left")
	// 데이터 존재 확인 준비
	const video_type =
	[
		// { type : "ori", tag: "동영상", data : playlist.ori ?? null },
		//
		// playlist.ori
		// playlist.video
		// 2개를 별도로 rㄷady에서 준비할것?

		// 				const list_ori
		// 				const list_vid
		// 				const list_all = list_ori.concat(list_vid)

		{ type : "video", tag: "동영상", data : playlist.video ?? null },
		{ type : "short", tag: "쇼츠", data : playlist.short ?? null },
		{ type : "part", tag: "부분 재생", data : playlist.part ?? null },
	]

	// 반복
	video_type.forEach(type =>
	{
		// 데이터 존재하는지 확인
		// 없으면 해당 타입 반복 종료하고 다음 타입으로
		if (!type.data)
			return

		// 존재하는 type 별로 left를 나눠먹을 section 생성
		const section = document.createElement("div")
		section.className = "section"
		section.dataset.type = type.type
		left.appendChild(section)

		// section 내부에 h1 생성
		const h1 = document.createElement("h1")
		section.appendChild(h1)

		// h1 1번 공간
		// h1 내부에 tag와 재생목록 문자열 삽입
		const h1_name = document.createElement("div")
		h1_name.className = "h1_name"
		h1_name.textContent = type.tag + " 재생 목록"
		h1.appendChild(h1_name)

		// h1 2번 공간
		const h1_class = document.createElement("div")
		h1_class.className = "h1_class"
		h1.appendChild(h1_class)

		// h1 3번 공간
		const h1_page = document.createElement("div")
		h1_page.className = "h1_page"
		h1.appendChild(h1_page)

		//
		if (type.type !== "part")
		{
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
			// let active_data = { video: null, short: null } // 현재 표시중인 목록 데이터
			// 미리 선언한 배열에 데이터 삽입
			// 미리 빈 배열을 선언하기보다 ready에서 가공한 데이터를 불러오도록 변경할것
	// const array1 = ["a", "b", "c"];
	// const array2 = ["d", "e", "f"];
	// const array3 = array1.concat(array2);
			active_data[type.type] = type.data

			// 타입이 오리지날+비디오 일떄로 변경 필요
			// 지금 이거는 video만 확인하고 ori는 확인안하고 있음
			if (type.type === "video")
			{

				list_ori = type.data.filter(video => "original" in video)
				list_non = type.data.filter(video => !("original" in video))


				const ori = ori => !ori.original
				// 오리지날 + 비디오 둘 다 존재할 때
				if (type.data.some(ori) && !type.data.every(ori))
				{
					// h1 2번째 공간을 1/3 모두
					const h1_class_all = document.createElement("div")
					h1_class_all.className = "h1_class_item"
					h1_class.appendChild(h1_class_all)

						// 모두 표시 및 클릭 기능
						const all_txt = document.createElement("span")
						all_txt.className = "txt_click"
						all_txt.textContent = "모두"
						h1_class_all.appendChild(all_txt)
						all_txt.addEventListener("click", () => switch_video_data(list_data.video))

					// h1 2번째 공간을 1/3 원곡 // 오리지날
					const h1_class_original = document.createElement("div")
					h1_class_original.className = "h1_class_item"
					h1_class.appendChild(h1_class_original)

						// 원곡만 보여주는 클릭 기능
						const original_txt = document.createElement("span")
						original_txt.className = "txt_click"
						original_txt.textContent = "원곡"
						h1_class_original.appendChild(original_txt)
						original_txt.addEventListener("click", () => switch_video_data(list_ori))

					// h1 2번째 공간을 1/3 커버
					const h1_class_cover = document.createElement("div")
					h1_class_cover.className = "h1_class_item"
					h1_class.appendChild(h1_class_cover)

						// 커버만 보여주는 클릭기능
						const cover_txt = document.createElement("span")
						cover_txt.className = "txt_click"
						cover_txt.textContent = "커버"
						h1_class_cover.appendChild(cover_txt)
						cover_txt.addEventListener("click", () => switch_video_data(list_non))
				}
			}

			// h1 3번 공간
			// 이전 페이지 넘기는 기능이 들어갈 자리 확보
			const btn_prev = document.createElement("div")
			btn_prev.className = "btn_prev"
			btn_prev.dataset.type = type.type
			h1_page.appendChild(btn_prev)

				// 이전 클릭 기능
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

			// 중간 // 현재 페이지 표시해줄 공간 확보
			const btn_center = document.createElement("div")
			btn_center.className = "btn_center"
			btn_center.dataset.type = type.type
			h1_page.appendChild(btn_center)

			// 다음 페이지 넘기는 기능이 들어갈 자리 확보
			const btn_next = document.createElement("div")
			btn_next.className = "btn_next"
			btn_next.dataset.type = type.type
			h1_page.appendChild(btn_next)

				// 다음 클릭 기능
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

			// h1 4번 공간
			// 풀 스크린 기능 공간 만들기
			const h1_size = document.createElement("div")
			h1_size.className = "h1_size"
			h1.appendChild(h1_size)

				//
				const toggle_txt = document.createElement("span")
				toggle_txt.className = "txt_click"
				toggle_txt.textContent = "크게"
				toggle_txt.dataset.type = type.type
				h1_size.appendChild(toggle_txt)
				toggle_txt.addEventListener("click", () => resize_section(type.type))

			// part data 일떄 전용 // 드롭다운 표시 + 모든 목록 가로 표시
			if (type.type === "long")
			{
				make_long()
				return
			}

			// section속 h1을 제외한 공간에 썸네일 들어갈 공간 확보
			// 최대 공간 크기를 확인하기 위함
			const list = document.createElement("div")
			list.className = `list ${type.type}`
			section.appendChild(list)

			// 썸네일이 들어갈 공간
			const page = document.createElement("div")
			page.className = `page ${type.type}`
			list.appendChild(page)

			// 알맞는 데이터의 썸네일 삽입
			fill_page(type.type)

		}
	})
}


// 썸네일이 몇개 들어갈지 공간 계산
function calc_size(list)
{
	// css의 root 속 변수 2개 호출
	const root = getComputedStyle(document.documentElement)
	const img_w = parseInt(root.getPropertyValue("--img-w"))
	const img_h = parseInt(root.getPropertyValue("--img-h"))

	// 쇼츠 일단 부름
	// 쇼츠가 존재하는지 확인하는 기능 추가 것
	const short = list.target.classList.contains("short")

	// 쇼츠라면 크기 반대로 적용
	const cell_w = short ? img_h : img_w
	const cell_h = short ? img_w : img_h

	// 해당 공간 가로 세로 현재 크기 불러오기
	const width = list.contentBoxSize[0].inlineSize
	const height = list.contentBoxSize[0].blockSize

	// 썸네일이 들어갈 갯수 계산
	const col = Math.floor(width / cell_w)
	const row = Math.floor(height / cell_h)
	const cell = col * row

	// 몇칸인지 값 반환
	return cell
}




// 이제 이거 쓸 필요가 있는가?
// let active_data = { video: null, short: null } // 현재 표시중인 목록 데이터
// playlist
// total_cell 값에 맞춰 썸네일 버튼을 (재)생성하는 함수
function fill_page(type_str)
{
	const page = document.querySelector(`.page.${type_str}`)
	if (!page)
		return

	const data = active_data[type_str] ?? playlist[type_str]
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




// 모두 원곡 커버 맞춰서 내용물을 다시 채우는 기능
function switch_video_data(next_data)
{
	active_data.video = next_data // 현재 데이터 갱신

	const page = document.querySelector(`.page.video`)
	// 기존 썸네일 제거 후 재생성
	if (page)
		page.innerHTML = ""

	// 썸네일 다시 채움
	fill_page("video")

	// 페이지 번호 초기화
	video_multiple = 1
	//
	render_nav("video")
	//
	update_page("video")
}


// multiple 값에 맞는 범위만 썸네일 표시/숨김
// function update_page(type_str)
function page_update(type_str)
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



// 화면 크기가 바뀔 때 페이지 초기화하고 다시 계산
// function reset_page(type_str)
function page_reset(type_str)
{
	if (type_str === "short")
		short_multiple = 1
	else
		video_multiple = 1


	render_nav(type_str)
}

// 마지막(최대 가능한) 페이지 번호 계산
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

