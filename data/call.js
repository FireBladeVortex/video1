
// playlist 구조를 가진 데이터 파일 목록 (추가)
const data_list =
[
	{ file: "아쿠루.js" },
	{ file: "감규리.js" },
	{ file: "이오몽.js" },
	{ file: "마레 플로스.js" },
	{ file: "미녕이데려오깨.js" },
	{ file: "마젯.js" },
	{ file: "레드.js" },
	{ file: "위도.js" },
	{ file: "판구리.js" },
	{ file: "앵보.js" },
	{ file: "향아치.js" },

]


// const data_list =
// [
// 	{ name: "아쿠루", file: "akuru.js" },
// 	{ name: "감규리", file: "gamgyuri.js" },
// 	{ name: "이오몽", file: "omong.js" },
// 	{ name: "마레 플로스", file: "mare.js" },
// 	{ name: "미녕이데러오께", file: "givemecs.js" },
// 	{ name: "마젯", file: "mazet.js" },
// 	{ name: "레드", file: "red.js" },
// 	{ name: "위도", file: "w2rd0.js" },
// 	{ name: "판구리", file: "panguri.js" },
// 	{ name: "판구리", file: "panguri.js" },
// 	{ name: "앵보", file: "ab.js" },
// 	{ name: "불법스님", file: "panguri.js" },
// 	{ name: "판구리", file: "panguri.js" },
// 	{ name: "판구리", file: "panguri.js" },
// 	{ name: "향아치", file: "hyang.js" },
// ]




function get_name(file) // (추가) file에서 확장자를 뺀 부분을 이름으로 사용
{
	return file.replace(/\.js$/, "")
}



const temp_list = {}


// 이름 가나다순 정렬
function name_sort(list)
{
	const collator = new Intl.Collator("ko")
	const list_sort = [...list].sort((a, b) =>
	{
		const compare = collator.compare(get_name(a.file).trim(), get_name(b.file).trim())
		return compare
	})

	const map = new Map()
	list_sort.forEach(it =>
	{
		const key = get_name(it.file).trim()
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










// switch 상자 내부에 이름 목록 채우기 (추가)
function render_switch()
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
		name_btn.textContent = who.is_has ? get_name(who.file) + "*" : get_name(who.file)
		name_list.appendChild(name_btn)

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
	script.src = "data/" + who.file

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





// // url 형태의 id를 실제 id 값으로 가공 (수정) - 재생목록은 pli_*에 동시 저장, 직접 id는 playlist[key]에 유지
// async function fix_playlist_data(playlist)
// {
// 	const keys = Object.keys(playlist)

// 	for (const key of keys)
// 	{
// 		if (!Array.isArray(playlist[key]))
// 			 continue // (수정)

// 		for (const video of playlist[key])
// 		{
// 			const list_id = get_list_id(video.id)

// 			if (list_id)
// 			{
// 				await cue_and_wait(list_id, key) // (수정) pli_* 대입은 cue_and_wait 내부에서 처리
// 			}
// 			else if (key === "intro")
// 			{
// 				continue
// 			}
// 			else
// 			{
// 				const fix = get_id(video.id)
// 				if (fix)
// 					video.id = Array.isArray(fix) ? fix[0] : fix

// 				result.push(video)
// 			}
// 		}

// 		if (result.length) // (추가) 재생목록이 아닌 직접 id 항목이 있으면 pli_*에 합쳐 저장
// 		{
// 			if (key === "ori") pli_ori = (pli_ori ?? []).concat(result) // (추가)
// 			else if (key === "short") pli_short = (pli_short ?? []).concat(result) // (추가)
// 			else pli_non = (pli_non ?? []).concat(result) // (추가)
// 		}
// 	}
// }



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


