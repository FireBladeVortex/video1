// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것
// 재생 준비 누르면 영상 새로 불러오는게 아니라 일시중지 기능 삽입된것 처리할것

// long 섹션 필터 드롭다운 생성 (수정/추가)
function make_long()
{
	if (!list_data.long) return // long 파일 없으면 작동 안함

	const section = document.querySelector('.section[data-type="long"]')
	if (!section) return

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

		list_data.long.forEach(video => // valid_list 대신 list_data.long 직접 순회
		{
			get_songs(video).forEach(song =>
			{
				if (!song.lang) return // id만 가진 항목은 lang이 없으므로 제외
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

		if (!name_value) return // name 기본값이면 목록 비움

		const titles = new Set()

		list_data.long.forEach(video => // valid_list 대신 list_data.long 직접 순회
		{
			get_songs(video).forEach(song =>
			{
				if (!song.lang) return // id만 가진 항목은 제외
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
			const lang_value = lang_select.value
			const name_value = name_select.value
			const title_value = title_select.value

			let song = null
			for (const video of list_data.long) // valid_list 대신 list_data.long 직접 순회
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
