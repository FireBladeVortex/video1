// 1
// 좋아, 흐름은 이렇게 돼:

// **클릭 전** → `#switch` 안에 이름 목록만 표시 (파일은 아직 하나도 안 불림)
// **이름 1개 클릭** → 그 이름에 매칭된 파일만 `<script>` 태그로 동적 생성해서 로드 → 로드 완료(`load` 이벤트) 후 기존 `switch_click()` 실행 → 박스 제거



// ### 1. `list/vid-t.html` — `js/newapi.js` 스크립트 태그 다음 줄에 추가

// html
// <script src="js/newapi.js"></script>
// <script src="js/switch_load.js"></script> <!-- 추가 -->




// ### 2. `list/js/switch_load.js` (새 파일)

// js
// playlist 구조를 가진 데이터 파일 목록 (추가)
const data_list =
[
	{ name: "아쿠루", file: "data/Akuru.js" },
	{ name: "감규리", file: "data/gamgyuri.js" },
	{ name: "미녕이", file: "data/omong.js" },
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

		name_btn.addEventListener("click", () => load_playlist(item))
	})
}

// 이름 클릭 시 해당 파일만 동적으로 불러오기 (추가)
function load_playlist(item)
{
	const script = document.createElement("script")
	script.src = item.file

	script.addEventListener("load", () =>
	{
		switch_click.call(document.getElementById("switch")) // (추가) 파일 로드 완료 후 기존 초기화 흐름 실행
	})

	document.head.appendChild(script)
}

render_switch()




// ### 3. `list/js/newapi.js` — 파일 맨 마지막, 기존 클릭 리스너 삭제

// `#switch` 자체가 더 이상 클릭 대상이 아니라 내부 이름 항목이 클릭 대상이 되므로, 기존에 `#switch` 전체에 걸었던 리스너는 제거하고 `switch_click` 함수 선언만 남긴다.

// js
function switch_click()
{
	document.head.appendChild(api)
	make_list()
	document.querySelectorAll(".list").forEach(list => resize.observe(list))
	this.remove()
}

/*
document.getElementById("switch").addEventListener("click", switch_click)
*/ // 삭제




// ### 4. `list/css/vid-t.css` — `#switch` 규칙 수정 + 이름 항목 스타일 추가

css
#switch /* 수정 */
{
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 500px;
	height: 500px;
	background: var(--emp);
	cursor: default; /* 수정 */
	z-index: 50;
	display: flex; /* 추가 */
	flex-direction: column; /* 추가 */
	align-items: center; /* 추가 */
	justify-content: center; /* 추가 */
	gap: 10px; /* 추가 */
}

.switch_item /* 추가 */
{
	color: var(--text);
	font-size: 20px;
	cursor: pointer;
}

.switch_item:hover /* 추가 */
{
	color: var(--highlight);
}




## 동작 원리 요약

1. `switch_load.js`가 로드되면 `render_switch()`가 즉시 실행되어 `data_list`의 `name`만 가지고 `#switch` 안에 클릭 가능한 항목들을 만든다. **이 시점엔 `Akuru.js`, `gamgyuri.js` 등 어떤 데이터 파일도 요청되지 않는다.**
2. 사용자가 이름 하나(예: "아쿠루")를 클릭하면 `load_playlist(item)`이 실행되어 **그 항목에 해당하는 파일 하나만** `<script src="data/Akuru.js">`로 동적 생성 후 `document.head`에 삽입 → 네트워크 요청 발생.
3. 해당 스크립트의 `load` 이벤트가 발생하면(=파일 로드+실행 완료, 즉 `window.playlist`에 데이터가 채워진 시점) 그제서야 기존 `switch_click()`을 호출해 YouTube API 로드 + `make_list()` + `ResizeObserver` 등록을 진행하고 `#switch`를 제거한다.

// ⚠️ 한 가지 확인이 필요해: 현재 `newapi.js`의 `make_list()`는 `list_data.video`, `list_data.short`, `list_data.long`을 참조하는데, 여기서 불러오는 `Akuru.js` 등은 `window.playlist.video`, `.short`, `.part` 구조를 쓰고 있어서 이름이 서로 달라. `make_list()`가 `playlist` 구조를 읽도록 바꿔야 하는지, 아니면 별도 처리가 필요한지 알려주면 그 부분도 이어서 정리해줄게.