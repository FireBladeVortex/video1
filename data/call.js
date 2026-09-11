// playlist 구조를 가진 데이터 파일 목록 (추가)
const data_list =
[
	{ name: "아쿠루", file: "data/Akuru.js" },
	{ name: "감규리", file: "data/gamgyuri.js" },
	{ name: "이오몽", file: "data/omong.js" },
	{ name: "마레 플로스", file: "data/mare.js" },
	{ name: "미녕이데러오께", file: "data/givemecs.js" },
	{ name: "마젯", file: "data/mazet.js" },
	{ name: "레드", file: "data/red.js" },
	{ name: "위도", file: "data/w2rd0.js" },
	{ name: "판구리", file: "data/panguri.js" },
]

// switch 상자 내부에 이름 목록 채우기 (추가)
function render_switch()
{
	const name_box = document.getElementById("name_box")

	data_list.forEach(who =>
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

function load_playlist(who)
{
	const script = document.createElement("script")
	script.src = who.file

	script.addEventListener("load", async () =>
	{
		await load_player()

		await fix_playlist_data(window.playlist)

		apply_color(window.playlist.color)

		switch_click()

		await cue_intro(window.playlist.intro)
		document.getElementById("name_box").remove()

	})

	document.head.appendChild(script)
}



// color 객체 값을 root CSS 변수에 즉시 반영 (추가)
function apply_color(color)
{
	if (!color) return

	const root = document.documentElement.style

	if (color.bg) root.setProperty("--bg", color.bg)
	if (color.box) root.setProperty("--box", color.box)
	if (color.highlight) root.setProperty("--highlight", color.highlight)
}
render_switch()





// url 형태의 id를 실제 id 값으로 가공 (수정) - 재생목록은 pli_*에 동시 저장, 직접 id는 playlist[key]에 유지
async function fix_playlist_data(playlist)
{
	const keys = Object.keys(playlist)

	for (const key of keys)
	{
		if (!Array.isArray(playlist[key]))
			 continue // (수정)

		for (const video of playlist[key])
		{
			const list_id = get_list_id(video.id)

			if (list_id)
			{
				await cue_and_wait(list_id, key) // (수정) pli_* 대입은 cue_and_wait 내부에서 처리
			}
			else if (key === "intro")
			{
				continue
			}
			else
			{
				const fix = get_id(video.id)
				if (fix)
					video.id = Array.isArray(fix) ? fix[0] : fix

				result.push(video)
			}
		}

		if (result.length) // (추가) 재생목록이 아닌 직접 id 항목이 있으면 pli_*에 합쳐 저장
		{
			if (key === "ori") pli_ori = (pli_ori ?? []).concat(result) // (추가)
			else if (key === "short") pli_short = (pli_short ?? []).concat(result) // (추가)
			else pli_non = (pli_non ?? []).concat(result) // (추가)
		}
	}
}



// async function fix_playlist_data(playlist)
// {
// 	const keys = Object.keys(playlist)


// 	for (const key of keys)
// 	{
// 		// color 등 붎필요한 호출 방지 및 미래 대비
// 		if (!Array.isArray(playlist[key]))
// 			continue

// 		for (const video of playlist[key])
// 		{
// 			const id = get_id(video.id)

// 			if (id)
// 			{
// 				if (id.startsWith("PL"))
// 				{
// 					const data = await cue_and_wait(id)
// 					// (수정) key 전달 제거, 반환값을 직접 받음
// 					temp_list[key] = (temp_list[key] ?? []).concat(data)
// 					// (추가) 받아온 값을 바로 temp_list에 삽입
// 				}
// 				else
// 				{
// 					// (추가) id를 제외한 나머지 값(original, song 등) 모두 보존
// 					const { id, ...rest } = video

// 					const fix = get_id(id)
// 					if (!fix)
// 						continue

// 					const fix_id = Array.isArray(fix) ? fix[0] : fix
// 					temp_list[key] = (temp_list[key] ?? []).concat([{ id: fix_id, ...rest }])
// 					// (수정) result 대신 temp_list에 직접 삽입
// 				}
// 			}
// 		}
// 	}
// }


