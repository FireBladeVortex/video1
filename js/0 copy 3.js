// long 섹션 필터 드롭다운 생성
function make_long()
{
	if (!list_data.long) // long 데이터가 없으면
		return // 함수 종료 (long 섹션 기능 자체를 만들지 않음)

	const section = document.querySelector('.section[data-type="long"]') // long 타입 섹션 요소 찾기
	if (!section)
		return // 섹션이 없으면 종료

	// 1행 (3칸, 1:3:1)
	const row1 = document.createElement("div") // 1행 컨테이너 생성
	row1.className = "long_row1" // 클래스 지정
	section.appendChild(row1) // 섹션에 삽입

	const lang_select = document.createElement("select") // 언어 선택 드롭다운 생성
	lang_select.className = "long_lang" // 클래스 지정
	row1.appendChild(lang_select) // 1행에 삽입

	const name_select = document.createElement("select") // 부른 이 선택 드롭다운 생성
	name_select.className = "long_name" // 클래스 지정
	row1.appendChild(name_select) // 1행에 삽입

	const empty_col = document.createElement("div") // 3번째 칸(재생 준비 버튼 담을 영역) 생성
	empty_col.className = "long_empty" // 클래스 지정
	row1.appendChild(empty_col) // 1행에 삽입

	const ready_btn = document.createElement("button") // 재생 준비 버튼 생성
	ready_btn.className = "long_ready" // 클래스 지정
	ready_btn.textContent = "재생 준비" // 버튼 텍스트 지정
	empty_col.appendChild(ready_btn) // empty_col 안에 버튼 삽입
	ready_btn.classList.add("blur") // 초기 상태는 비활성(흐림) 표시


	// 2행 (1칸, 100%)
	const row2 = document.createElement("div") // 2행 컨테이너 생성
	row2.className = "long_row2" // 클래스 지정
	section.appendChild(row2) // 섹션에 삽입

	const title_select = document.createElement("select") // 제목 선택 드롭다운 생성
	title_select.className = "long_title" // 클래스 지정
	row2.appendChild(title_select) // 2행에 삽입

	// option 생성 도우미
	function make_option(select, value, text, selected = false) // select에 option 하나를 추가하는 도우미 함수
	{
		const option = document.createElement("option") // option 요소 생성
		option.value = value // 값 지정
		option.textContent = text // 표시 텍스트 지정
		if (selected) // 기본 선택 옵션으로 지정할 경우
			{
				option.selected = true // 선택된 상태로 지정

		option.disabled = true // 선택 불가능하게 처리 (플레이스홀더 역할)
		option.hidden = true // 목록에서 숨김 처리
			}
		select.appendChild(option) // select에 option 삽입
	}

	make_option(lang_select, "", "언어", true) // 언어 select의 기본 플레이스홀더 옵션 추가
	;["한국어", "일본어", "외국어"].forEach(lang => make_option(lang_select, lang, lang)) // 언어 옵션 3개 추가

	make_option(name_select, "", "부른 이", true) // 부른 이 select의 기본 플레이스홀더 옵션 추가
	make_option(title_select, "", "제목", true) // 제목 select의 기본 플레이스홀더 옵션 추가

	// lang 값에 맞는 name 목록 갱신
	function update_name() // 선택된 언어에 맞는 "부른 이" 옵션들을 다시 채우는 함수
	{
		const lang_value = lang_select.value // 현재 선택된 언어 값
		const names = new Set() // 중복 제거를 위한 이름 집합

		list_data.long.forEach(video => // long 데이터 전체 순회
		{
			get_songs(video).forEach(song => // 각 video의 유효한 곡 목록 순회
			{
				if (!song.lang) // 곡에 lang 값이 없으면(=id만 있는 항목)
					return // 제외하고 다음으로
				if (!lang_value || song.lang === lang_value) // 언어 미선택이거나 선택한 언어와 일치하면
				{
					names.add(song.name) // 이름 집합에 추가
				}
			})
		})

		name_select.innerHTML = "" // 부른 이 select 초기화
		make_option(name_select, "", "부른 이", true) // 플레이스홀더 옵션 다시 추가
		;[...names].forEach(name => make_option(name_select, name, name)) // 수집된 이름들로 옵션 채우기
	}

	// lang, name 값에 맞는 title 목록 갱신 (name 선택 시에만 등장)
	function update_title() // 선택된 언어+부른 이에 맞는 "제목" 옵션들을 다시 채우는 함수
	{
		const lang_value = lang_select.value // 현재 선택된 언어 값
		const name_value = name_select.value // 현재 선택된 부른 이 값

		title_select.innerHTML = "" // 제목 select 초기화
		make_option(title_select, "", "제목", true) // 플레이스홀더 옵션 다시 추가

		if (!name_value) // 부른 이가 선택되지 않았으면
			return // 제목 목록을 비운 채로 종료

		const titles = new Set() // 중복 제거를 위한 제목 집합

		list_data.long.forEach(video => // long 데이터 전체 순회
		{
			get_songs(video).forEach(song => // 각 video의 유효한 곡 목록 순회
			{
				if (!song.lang) // lang 값이 없는 항목(=id만 있는 항목) 제외
					return
				const lang_match = !lang_value || song.lang === lang_value // 언어 조건 일치 여부
				const name_match = song.name === name_value // 부른 이 조건 일치 여부
				if (lang_match && name_match) // 두 조건 모두 만족하면
				{
					titles.add(song.title) // 제목 집합에 추가
				}
			})
		})


		;[...titles].forEach(title => make_option(title_select, title, title)) // 수집된 제목들로 옵션 채우기
		ready_btn.classList.toggle("active", false) // 제목 목록이 새로 갱신되었으므로 재생 준비 버튼 비활성화
	}

	lang_select.addEventListener("change", () => // 언어 선택 변경 시
	{
		update_name() // 부른 이 목록 갱신
		update_title() // 제목 목록도 함께 갱신(초기화)
	})
	name_select.addEventListener("change", update_title) // 부른 이 선택 변경 시 제목 목록 갱신

	title_select.addEventListener("change", () => // 제목 선택 변경 시
	{
		ready_btn.classList.toggle("active", title_select.value) // 제목이 선택되었으면 버튼 활성화
		ready_btn.classList.toggle("blur", !title_select.value) // 제목이 선택 안 됐으면 버튼 흐림 처리
	})

	ready_btn.addEventListener("click", () => // 재생 준비 버튼 클릭 시
	{
		const target = "long_ready" // 이 버튼의 식별자
		{
			click_img(target) // 활성 버튼 표시 갱신
			const lang_value = lang_select.value // 선택된 언어 값
			const name_value = name_select.value // 선택된 부른 이 값
			const title_value = title_select.value // 선택된 제목 값

			let song = null // 찾은 곡을 저장할 변수 초기화
			for (const video of list_data.long) // long 데이터 전체를 순회하며
			{
				const found = get_songs(video).find(s => // 조건에 맞는 곡 하나 탐색
					s.lang && // lang 값이 있는 항목만 대상 (id만 있는 항목 제외)
					(!lang_value || s.lang === lang_value) && // 언어 조건 일치
					s.name === name_value && // 부른 이 조건 일치
					s.title === title_value // 제목 조건 일치
				)
				if (found) // 찾았으면
				{
					song = found // song 변수에 저장
					break // 반복 종료
				}
			}

			if (song) // 곡을 찾았다면
			{
				ready_data(song.id, song.start, song.end) // 해당 곡의 id/시작/종료 시간으로 영상 로드
			}
		}
	})

	update_name() // 최초 실행 시 부른 이 목록 초기 세팅
}