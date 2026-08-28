// playlist 구조를 가진 데이터 파일 목록 (추가)
const data_list =
[
	{ name: "아쿠루", file: "data/Akuru.js" },
	{ name: "감규리", file: "data/gamgyuri.js" },
	{ name: "이오몽", file: "data/omong.js" },
	{ name: "마레 플로스", file: "data/mare.js" },
]

// switch 상자 내부에 이름 목록 채우기 (추가)
function render_switch()
{
	const switch_box = document.getElementById("switch")

	data_list.forEach(item =>
	{
		const name_btn = document.createElement("div")
		name_btn.className = "switch_item"
		name_btn.textContent = item.name
		switch_box.appendChild(name_btn)

		name_btn.addEventListener("click", () =>
		{
			switch_box.innerHTML = "" // (추가) 클릭 즉시 상자 비우기
			switch_box.textContent = "불러오는 중" // (추가)
			load_playlist(item)
		})
	})
}

// // 이름 클릭 시 해당 파일만 동적으로 불러오기 (추가)
// function load_playlist(item)
// {
// 	const script = document.createElement("script")
// 	script.src = item.file

// 	script.addEventListener("load", async () =>
// 	{

// 		await load_player() // (추가) player 생성 완료까지 대기

// 		await fix_playlist_data(window.playlist) // (추가) 데이터 불러온 직후 id 가공

// 		apply_color(window.playlist.color)
// 		switch_click.call(document.getElementById("switch")) // (추가) 파일 로드 완료 후 기존 초기화 흐름 실행
// 	})

// 	document.head.appendChild(script)
// }

function load_playlist(item)
{
	const script = document.createElement("script")
	script.src = item.file

	script.addEventListener("load", async () =>
	{
		await load_player() // player 생성 완료까지 대기

		await fix_playlist_data(window.playlist) // (수정) ori/video/short 재생목록 id 가공

		apply_color(window.playlist.color)

		switch_click() // (수정) 뼈대 + 썸네일 생성

		await cue_intro(window.playlist.intro) // (추가) intro 재생 준비

		document.getElementById("switch").remove() // (추가) 상자 제거
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





// // url 형태의 id를 실제 id 값으로 가공 (재작성)
// async function fix_playlist_data(playlist)
// {
// 	const keys = ["ori", "video", "short"] // (수정) intro/part 제외, 재생목록 변환 대상만

// 	for (const key of keys)
// 	{
// 		if (!Array.isArray(playlist[key])) continue

// 		const result = []

// 		for (const video of playlist[key])
// 		{
// 			const list_id = get_list_id(video.id) // (추가) 재생목록 id 여부 확인

// 			if (list_id)
// 			{
// 				const list = await cue_and_wait(list_id) // (추가) cuePlaylist 실행 + CUED 대기 + 목록 확보
// 				result.push(...list.map(id => ({ id }))) // (추가) 기존 [{id:""}, ...] 형태 유지
// 			}
// 			else
// 			{
// 				const fix = get_id(video.id) // (수정) 동기 함수로 되돌림
// 				if (fix)
// 					video.id = Array.isArray(fix) ? fix[0] : fix

// 				result.push(video)
// 			}
// 		}

// 		playlist[key] = result // 가공된 배열로 교체
// 	}
// }



// url 형태의 id를 실제 id 값으로 가공 (수정) - 재생목록은 pli_*에 동시 저장, 직접 id는 playlist[key]에 유지
async function fix_playlist_data(playlist)
{
	const keys = ["ori", "video", "short"]

	const tasks = keys.map(async key => // (추가) Promise.all로 동시 처리하기 위해 map으로 변경
	{
		if (!Array.isArray(playlist[key])) return // (수정)

		const result = []

		for (const video of playlist[key])
		{
			const list_id = get_list_id(video.id)

			if (list_id)
			{
				await cue_and_wait(list_id, key) // (수정) pli_* 대입은 cue_and_wait 내부에서 처리
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
	})

	await Promise.all(tasks) // (추가) ori/video/short 동시 큐잉 진행
}