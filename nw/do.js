
// 함수 모음



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

		name_btn.textContent = who.is_has ? who.name + "*" : who.name
		name_box.appendChild(name_btn)

		name_btn.addEventListener("click", () =>
		{
			name_box.innerHTML = ""
			name_box.textContent = "불러오는 중"
			load_playlist(who)
		})
	})
}








///////////////////////////////////////////////////////
/////////////////////////////////////////////////////// 설명 필요
let player_ready_resolve = null // (추가)
const player_ready = new Promise(resolve => { player_ready_resolve = resolve })
// (추가) player 준비 완료 시점을 외부에서 기다리기 위함

// api 스크립트 삽입 + player 준비될 때까지 대기 (추가)
function load_player()
{
	document.head.appendChild(api)
	return player_ready
}
///////////////////////////////////////////////////////
/////////////////////////////////////////////////////// 설명 필요















// 스위치 클릭 시 실제 초기화 실행 (추가)
function switch_click()
{
	// document.head.appendChild(api) // YouTube iframe API 로드 시작 → onYouTubeIframeAPIReady 자동 호출됨

	make_list() // 뼈대(.list, .page) + 썸네일 DOM 생성

	document.querySelectorAll(".list").forEach(list => resize.observe(list)) // 크기 관찰 시작

	// this.remove() // 스위치 사각형 제거
}

// document.getElementById("switch").addEventListener("click", switch_click)







function make_list()
{
	const left = document.getElementById("left")



	const has_ori = valid_playlist(temp_list.ori)
	const has_video = valid_playlist(temp_list.video)

	list_ori = has_ori ? temp_list.ori : []
	list_non = has_video ? temp_list.video : []

	const video_data = // (추가) 존재 조합에 따른 기본 표시 데이터 결정
		has_ori && has_video ? list_ori.concat(list_non) :
		has_ori ? list_ori :
		has_video ? list_non :
		null

	const video_type =
	[
		{ type: "video", tag: "동영상", data: video_data ?? null }, // 수정
		{ type: "short", tag: "쇼츠", data: temp_list.short ?? null }, // 수정
		{ type: "long", tag: "부분 재생", data: temp_list.part ?? null }, // 수정
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
	;["한국어", "영어", "일본어", "외국어", "개사"].forEach(lang => make_option(lang_select, lang, lang))

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
				if (!lang_value || song.lang.includes(lang_value)) // (수정) === → includes
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
				const lang_match = !lang_value || song.lang.includes(lang_value) // (수정) === → includes
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
					(!lang_value || s.lang.includes(lang_value)) &&
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
