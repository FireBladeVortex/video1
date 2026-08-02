
// 볼륨 변수
const volume = document.getElementById("volume")
const volume_bar = document.getElementById("volume_bar")

// 볼륨 조절 막대 값 반영 시키기
volume_bar.addEventListener("input", () =>
{
	player.setVolume(+volume_bar.value)
})

// 소리 크기 조절 간섭 방지
const stopp = move => move.stopPropagation()
volume.addEventListener("mousedown", stopp)
volume.addEventListener("click", stopp)

// 해당하는 키 입력 기본 작동을 무시
// 스페이스 바가 play_or_pause()를 실행
// 숫자 패드 컨트롤 또는 쉬프트 +-로 재생 속도 조절 (보류)
// 숫자 패드 +-로 소리 크기 조절
document.addEventListener("keydown", key =>
{
	const add = key.code === "NumpadAdd" || key.code === "ArrowUp"
	const sub = key.code === "NumpadSubtract" || key.code === "ArrowDown"
	// const cs = key.ctrlKey || key.shiftKey
	// if (!cs)
	// {
		if (add)
		{
			key.preventDefault()
			volume_value(+5)
		}
		else if (sub)
		{
			key.preventDefault()
			volume_value(-5)
		}
	// }
	// else if (cs && add || sub)
	// {
	// 	key.preventDefault()
	// }

	// 준비안됐으면 작동 중지
	if (!player || !play_now()) return

	if (!key.repeat)
	{
		if (key.code === "Space")
		{
			key.preventDefault()
			play_or_pause()
		}
		if (key.code === "ArrowLeft")
		{
			key.preventDefault()
			player.seekTo(Math.max(sec_start, player.getCurrentTime() - 5), true) // sec_start 보다 작아질 수 없음
		}
		if (key.code === "ArrowRight")
		{
			key.preventDefault()
			player.seekTo(Math.min(sec_end, player.getCurrentTime() + 5), true) // sec_end 보다 커질 수 없음
		}
		// 현재 재생 위치 변경
		if (key.code.match(/^(Digit|Numpad)[0-9]$/))
		{
			key.preventDefault()
			const ratio = +(key.code.slice(-1)) / 10
			const numkey = sec_start + Math.floor((sec_end - sec_start) * ratio)
			player.seekTo(numkey, true)
		}

		// else if (cs && add || sub)
		// {
		// 	key.preventDefault()
		// 	const updown = add ? 0.05 : -0.05
		// 	const limit = add ? 2 : 0.25
		// 	const minmax  = add ? Math.min : Math.max
		// 	player.setPlaybackRate(minmax(limit, (player.getPlaybackRate() + updown)))
		// }
		// else if (key.code === "Numpad0")
		// {
		// 	key.preventDefault()
		// 	player.setPlaybackRate(1)
		// }

	}
})

// 마우스 휠 소리 크기 조절 및 오작동 억제
document.addEventListener("wheel", wheel =>
{
	wheel.preventDefault()
	volume_value(wheel.deltaY < 0 ? +5 : -5)
},
{
	passive: false
})

// 소리 크기 조절
function volume_value(plma)
{
	const volume = player.getVolume()
	const updown = plma > 0
		? Math.floor(volume / 5) * 5 + 5
		: Math.ceil(volume / 5) * 5 - 5
	const change = Math.min(100, Math.max(0, updown))
	player.setVolume(change)
	volume_bar.value = change
}

// 재생 속도 조절
function play_speed(key, plma)
{
}
