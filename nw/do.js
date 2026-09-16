
// 함수 모음



function load_playlist(data)
{
	const script = document.createElement("script")
	script.src = "data/" + data.file

	// 준비 되었을때 실행
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
	script.addEventListener("load", async () =>
	{
		await load_player()

		await fix_playlist_data(window.playlist)

		apply_color(window.playlist.color)

		switch_click()

		await cue_intro(temp_list.intro)

		document.getElementById("name_box").remove()
	})

	document.head.appendChild(script)
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










// url 형태의 id를 실제 id 값으로 가공 (수정) - 재생목록은 pli_*에 동시 저장, 직접 id는 playlist[key]에 유지

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





// 스위치 클릭 시 실제 초기화 실행 (추가)
function switch_click()
{
	// document.head.appendChild(api) // YouTube iframe API 로드 시작 → onYouTubeIframeAPIReady 자동 호출됨

	make_list() // 뼈대(.list, .page) + 썸네일 DOM 생성

	document.querySelectorAll(".list").forEach(list => resize.observe(list)) // 크기 관찰 시작

	// this.remove() // 스위치 사각형 제거
}

// document.getElementById("switch").addEventListener("click", switch_click)




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



// CUED(5) 상태 감지용 대기 장치 (추가)
let playlist_ready_resolve = null

// 큐잉 완료(CUED)까지 대기 (추가)
function wait_cued()
{
	return new Promise(resolve => { playlist_ready_resolve = resolve })
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
