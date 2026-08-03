const total_cell = { video: 0, short: 0 }

/*
make_list() // 다시 즉시 호출 — 뼈대(.list, .page)만 생성, 썸네일은 아직 0개
*/ // 삭제

const resize = new ResizeObserver(entry =>
{
	entry.forEach(list =>
	{
		const type = list.target.classList.contains("short") ? "short" : "video"
		total_cell[type] = calc_size(list)

		reset_page(type)
		update_page(type)
	})
})

/*
document.querySelectorAll(".list").forEach(list => resize.observe(list))
*/ // 삭제

// 스위치 클릭 시 실제 초기화 실행 (추가)
document.getElementById("switch").addEventListener("click", function switch_click()
{
	document.head.appendChild(api) // (추가) YouTube iframe API 로드 시작 → onYouTubeIframeAPIReady 자동 호출됨

	make_list() // (추가) 뼈대(.list, .page) + 썸네일 DOM 생성

	document.querySelectorAll(".list").forEach(list => resize.observe(list)) // (추가) 크기 관찰 시작

	this.remove() // (추가) 스위치 사각형 제거
})