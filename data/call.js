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

	script.addEventListener("load", () =>
	{

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