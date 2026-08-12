


// ## 1. `fill_page(type_str)`
// **목적**: `video`/`short` 타입의 데이터를 기반으로 썸네일 버튼(`.btn`)들을 생성해서 `.page` 안에 채워 넣는다.
// **진행 과정**: 대상 `.page` 요소 확인 → 표시할 데이터 확인 → 데이터 배열을 순회하며 버튼+이미지 생성 → 각 버튼에 클릭 이벤트(재생/일시정지 또는 새 영상 로드) 부착.

function fill_page(type_str)
{
	const page = document.querySelector(`.page.${type_str}`) // type_str에 해당하는 .page 요소 찾기
	if (!page)
		return // .page가 없으면 함수 종료

	const data = active_data[type_str] ?? list_data[type_str] // 현재 활성 데이터 우선, 없으면 원본 목록 사용
	if (!data)
		return // 표시할 데이터가 없으면 함수 종료

	const crrt_data_count = page.children.length // 현재 page 안에 이미 만들어진 버튼 개수 (미사용)
	const nxxt_data_count = data.length // 새로 채워야 할 데이터 총 개수 (미사용)

	// const next_count = total_cell[type_str] 새로 계산된 필요 개수 (주석 처리된 미사용 코드)

	for (let num = 0; data.length; num++) // data.length가 0이 아닌 한 무한 반복 (실질적으로 ready가 없을 때 break로 탈출)
	{
		const ready = data[num] // num번째 데이터 항목 가져오기
		if (!ready) break // 더 이상 데이터가 없으면 반복 종료

		const btn = document.createElement("button") // 썸네일 버튼 요소 생성
		btn.className = "btn" // 버튼 클래스 지정
		btn.dataset.num = num // 버튼에 순번 저장
		btn.dataset.type = type_str // 버튼에 타입(video/short) 저장

		const img = document.createElement("img") // 썸네일 이미지 요소 생성
		img.src = `https://img.youtube.com/vi/${ready_data(ready.id)}/mqdefault.jpg` // 유튜브 썸네일 URL 지정 (id만 추출해서 사용)

		btn.appendChild(img) // 버튼 안에 이미지 삽입
		page.appendChild(btn) // page 안에 버튼 삽입

		btn.addEventListener("click", () => // 버튼 클릭 이벤트 등록
		{
			const target = (type_str + "_" + (num + "").padStart(3, "0")) // 타입+순번 조합으로 고유 식별자 생성 (예: video_003)
			if (img_click === target) // 이미 선택된(활성화된) 버튼을 다시 클릭한 경우
			{
				if (play()) // 현재 재생 중이면
				{
					player.pauseVideo() // 일시정지
				}
				else if (pause()) // 현재 일시정지 상태면
				{
					player.playVideo() // 재생 재개
				}
				else
					return // 재생/일시정지 상태가 아니면 아무것도 안 함
			}
			else // 새로운 버튼을 클릭한 경우
			{
				click_img(target) // 활성 버튼 표시 갱신
				const short = type_str === "short" // short 타입 여부 판단
				ready_data(ready.id, short ? 0 : ready.start, short ? 0 : ready.end) // 영상 로드 (short는 구간 없이 전체 재생)
			}
		})
	}
}




// ## 2. `switch_video_data(next_data)`
// **목적**: video 섹션에서 "모두/원곡/커버" 클릭 시 표시할 데이터를 교체하고 화면을 다시 그린다.
// **진행 과정**: 활성 데이터 갱신 → 기존 썸네일 제거 → 새 데이터로 재생성 → 페이지 번호 초기화 → 네비게이션/표시 갱신.

function switch_video_data(next_data)
{
	active_data.video = next_data // 현재 표시할 video 데이터를 전달받은 데이터로 갱신

	const page = document.querySelector(`.page.video`) // video의 .page 요소 찾기
	if (page) page.innerHTML = "" // 기존에 그려진 썸네일 버튼들을 모두 제거

	fill_page("video") // 새 데이터를 기준으로 썸네일 다시 채우기

	video_multiple = 1 // 페이지(그룹) 번호를 1페이지로 초기화
	render_nav("video") // 이전/다음 네비게이션 다시 그리기
	update_page("video") // 현재 페이지에 맞는 버튼만 표시
}




// ## 3. `update_page(type_str)`
// **목적**: 현재 `multiple`(페이지 번호) 값에 해당하는 범위의 썸네일만 보이게 하고 나머지는 숨긴다.
// **진행 과정**: 한 페이지에 들어갈 개수 확인 → 현재 페이지의 최소/최대 인덱스 계산 → 모든 버튼을 순회하며 범위 내 여부에 따라 표시/숨김.

function update_page(type_str)
{
	const num = total_cell[type_str] // 한 페이지에 들어가는 셀(칸) 개수
	if (!num)
		return // 아직 계산되지 않았으면(0이면) 종료

	const multiple = type_str === "short" ? short_multiple : video_multiple // 타입에 맞는 현재 페이지 번호 선택
	const min_num = (multiple - 1) * num // 현재 페이지에서 표시할 최소 인덱스
	const max_num = (multiple * num) - 1 // 현재 페이지에서 표시할 최대 인덱스

	document.querySelectorAll(`.btn[data-type="${type_str}"]`).forEach(btn => // 해당 타입의 모든 버튼 순회
	{
		const idx = +btn.dataset.num // 버튼에 저장된 순번을 숫자로 변환
		const show = idx >= min_num && idx <= max_num // 현재 페이지 범위 안에 있는지 판단
		btn.style.display = show ? "" : "none" // 범위 안이면 보이기, 아니면 숨기기
	})
}




// ## 4. `reset_page(type_str)`
// **목적**: 화면 크기 변경 등으로 셀 개수가 바뀌었을 때 페이지 번호를 1로 초기화하고 네비게이션을 다시 그린다.
// **진행 과정**: 타입에 맞는 페이지 번호 변수를 1로 설정 → 네비게이션 갱신.


function reset_page(type_str)
{
	if (type_str === "short")
		short_multiple = 1 // short 페이지 번호 초기화
	else
		video_multiple = 1 // video 페이지 번호 초기화


	render_nav(type_str) // 초기화된 상태로 네비게이션 다시 그리기
}




// ## 5. `get_last(type_str)`
// **목적**: 해당 타입의 마지막 페이지 번호(총 페이지 수)를 계산한다.
// **진행 과정**: 한 페이지당 셀 개수와 전체 데이터 개수를 이용해 올림 나눗셈으로 총 페이지 수 계산.


function get_last(type_str)
{
	const num = total_cell[type_str] // 한 페이지당 셀(칸) 개수
	const data = active_data[type_str] ?? list_data[type_str] // 현재 활성 데이터, 없으면 원본 목록
	return Math.ceil(data.length / num) // 전체 데이터 개수를 셀 개수로 나눠 올림 처리 → 총 페이지 수 반환
}




// ## 6. `render_nav(type_str)`
// **목적**: 이전/현재/다음 페이지 번호와 "이전"/"다음" 텍스트를 현재 상태에 맞게 다시 그린다.
// **진행 과정**: 이전/중앙/다음 버튼 영역 요소 확인 → 총 페이지가 1 이하면 모두 비움 → 아니면 이전/다음 텍스트 및 번호(prev/curr/next) 생성해서 삽입.


function render_nav(type_str)
{
	const btn_prev = document.querySelector(`.btn_prev[data-type="${type_str}"]`) // 이전 버튼 영역 찾기
	const btn_center = document.querySelector(`.btn_center[data-type="${type_str}"]`) // 중앙(번호) 영역 찾기
	const btn_next = document.querySelector(`.btn_next[data-type="${type_str}"]`) // 다음 버튼 영역 찾기
	if (!btn_prev || !btn_center || !btn_next)
		return // 셋 중 하나라도 없으면 종료



	const btn_prev_txt = btn_prev.querySelector(".txt_click") // 이전 버튼 안의 텍스트(span) 요소
	const btn_next_txt = btn_next.querySelector(".txt_click") // 다음 버튼 안의 텍스트(span) 요소


	const last = get_last(type_str) // 총 페이지 수 계산

	if (last <= 1) // 페이지가 1개 이하라 넘길 필요 없을 때
	{
		btn_prev_txt.textContent = "" // 이전 텍스트 비움
		btn_center.textContent = "" // 중앙 영역 비움
		btn_next_txt.textContent = "" // 다음 텍스트 비움
		return // 더 진행할 필요 없으므로 종료
	}

	const multiple = type_str === "short" ? short_multiple : video_multiple // 타입에 맞는 현재 페이지 번호

	btn_prev_txt.textContent = multiple === 1 ? "" : "이전" // 첫 페이지면 "이전" 숨김, 아니면 표시
	btn_center.textContent = "" // 중앙 영역 초기화(기존 번호 요소 제거 목적)
	btn_next_txt.textContent = multiple >= last ? "" : "다음" // 마지막 페이지면 "다음" 숨김, 아니면 표시

	const num_prev = document.createElement("div") // 이전 페이지 번호 표시용 div 생성
	num_prev.className = "num_prev" // 클래스 지정
	num_prev.dataset.type = type_str // 타입 저장
	num_prev.textContent = multiple === 1 ? "" : multiple - 1 // 첫 페이지면 비우고, 아니면 (현재-1) 표시
	btn_center.appendChild(num_prev) // 중앙 영역에 삽입

	const num_curr = document.createElement("div") // 현재 페이지 번호 표시용 div 생성
	num_curr.className = "num_curr" // 클래스 지정
	num_curr.dataset.type = type_str // 타입 저장
	num_curr.textContent = multiple // 현재 페이지 번호 표시
	btn_center.appendChild(num_curr) // 중앙 영역에 삽입

	const num_next = document.createElement("div") // 다음 페이지 번호 표시용 div 생성
	num_next.className = "num_next" // 클래스 지정
	num_next.dataset.type = type_str // 타입 저장
	num_next.textContent = multiple + 1 > last ? "" : multiple + 1 // 마지막 페이지 넘으면 비우고, 아니면 (현재+1) 표시
	btn_center.appendChild(num_next) // 중앙 영역에 삽입
}




// ## 7. `resize_section(type_str)`
// **목적**: "크게" 버튼 클릭 시 해당 섹션(video/short/long)을 확대하고, 다시 클릭하면 원래 비율로 복구하는 토글 기능.
// **진행 과정**: 현재 확대된 타입과 클릭한 타입 비교해 토글 값 결정 → 확대 시 클릭한 타입만 `1fr`, 나머지는 `0fr`로 grid 비율 변경 → 상태 저장 → 모든 "크게/작게" 텍스트 갱신.


let big_type = null // 현재 확대되어 있는 섹션 타입 저장 (없으면 null)
function resize_section(type_str)
{
	const left = document.getElementById("left") // 좌측 전체 컨테이너(#left) 가져오기
	const rows = { video: "2fr", short: "2fr", long: "1fr" } // 기본 grid-template-rows 비율

	const next_big = big_type === type_str ? null : type_str // 같은 타입을 다시 클릭하면 해제(null), 아니면 해당 타입으로 확대

	if (next_big) // 확대할 타입이 정해졌다면
	{
		rows.video = type_str === "video" ? "1fr" : "0fr" // 클릭한 타입이 video면 1fr, 아니면 0fr(숨김)
		rows.short = type_str === "short" ? "1fr" : "0fr" // 클릭한 타입이 short면 1fr, 아니면 0fr
		rows.long = type_str === "long" ? "1fr" : "0fr" // 클릭한 타입이 long이면 1fr, 아니면 0fr
	}

	left.style.gridTemplateRows = `${rows.video} ${rows.short} ${rows.long}` // 계산된 비율을 실제 grid에 적용

	big_type = next_big // 확대 상태 갱신

	document.querySelectorAll(".h1_size .txt_click").forEach(span => // 모든 "크게/작게" 토글 텍스트 요소 순회
	{
		span.textContent = span.dataset.type === big_type ? "작게" : "크게" // 현재 확대된 타입이면 "작게", 아니면 "크게" 표시
	})
}
