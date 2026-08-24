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
				load_playlist(item)
			})
	})
}

// 이름 클릭 시 해당 파일만 동적으로 불러오기 (추가)
function load_playlist(item)
{
	const script = document.createElement("script")
	script.src = item.file

	script.addEventListener("load", async () =>
	{

		await load_player() // (추가) player 생성 완료까지 대기

		await fix_playlist_data(window.playlist) // (추가) 데이터 불러온 직후 id 가공

		apply_color(window.playlist.color)
		switch_click.call(document.getElementById("switch")) // (추가) 파일 로드 완료 후 기존 초기화 흐름 실행
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

// function fix_playlist_data(playlist)
// {
// 	const keys = ["intro", "ori", "video", "short", "part"] // 가공 대상 키 목록

// 	keys.forEach(key =>
// 	{
// 		if (!Array.isArray(playlist[key])) return

// 		playlist[key].forEach(video =>
// 		{
// 			const fix = get_id(video.id)
// 			if (!fix) return

// 			video.id = Array.isArray(fix) ? fix[0] : fix // t값 있으면 배열 반환되므로 id만 추출
// 		})
// 	})
// }


// async function fix_playlist_data(playlist) // (수정) async 전환
// {
// 	const keys = ["intro", "ori", "video", "short", "part"]

// 	for (const key of keys) // (수정) forEach -> for...of (await 사용 위해)
// 	{
// 		if (!Array.isArray(playlist[key])) continue

// 		for (const video of playlist[key]) // (수정) forEach -> for...of
// 		{
// 			const fix = await get_id(video.id) // (수정) await 추가
// 			if (!fix) continue

// 			video.id = Array.isArray(fix) ? fix[0] : fix
// 		}
// 	}
// }


// url 형태의 id를 실제 id 값으로 가공
async function fix_playlist_data(playlist)
{
	const keys = ["intro", "ori", "video", "short", "part"]

	for (const key of keys)
	{
		if (!Array.isArray(playlist[key])) continue

		const result = [] // (추가) 가공된 결과를 새로 쌓을 배열

		for (const video of playlist[key])
		{
			const fix = await get_id(video.id)
			if (!fix)
			{
				result.push(video) // (추가) 실패 시 원본 그대로 유지
				continue
			}

			const is_playlist = Array.isArray(fix) && fix.every(item => typeof item === "object") // (추가) playlist가 여러 항목으로 확장된 경우 구분

			if (is_playlist)
			{
				result.push(...fix) // (추가) 확장된 항목들을 하나씩 펼쳐서 삽입
			}
			else
			{
				video.id = Array.isArray(fix) ? fix[0] : fix // 단일 영상 id (t값 있으면 [vid, t] 형태)
				result.push(video)
			}
		}

		playlist[key] = result // (수정) 가공된 배열로 교체
	}
}