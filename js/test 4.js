



function data_comparison_1(data, comp)
{
	const result = data.flatMap(video =>
	{
		const base = { id: video.id }
		if (!video.start && !video.end)
		{
			const comp_id = JSON.stringify(base)
			if (comp.has(comp_id))
				return []

			comp.add(comp_id)
			return [base]
		}

		const base_t =
		{
			id: video.id,
			...(video.start && { start: video.start }),
			...(video.end && { end: video.end })
		}
		const total = []

		const comp_id = JSON.stringify(base)
		if (!comp.has(comp_id))
		{
			comp.add(comp_id)
			total.push(base)
		}

		const comp_ise = JSON.stringify(base_t)
		if (!comp.has(comp_ise))
		{
			comp.add(comp_ise)
			total.push(base_t)
		}

		return total
	})

	return result
}


function in_range(value_a, value_b, tolerance) // (추가) 오차 범위 내인지 검사
{
	return Math.abs(value_a - value_b) <= tolerance
}

function same_text(text_a, text_b) // (추가) trim 후 비교, 실제 값은 그대로 유지
{
	return (text_a ?? "").trim() === (text_b ?? "").trim()
}

function same_time(exist, new_song) // (추가) start/end sss값 비교 (오차 3 -> 완화 5)
{
	const start_a = exist.start[0]
	const start_b = new_song.start[0]
	const end_a = exist.end[0]
	const end_b = new_song.end[0]

	const start_3 = in_range(start_a, start_b, 3)
	const end_3 = in_range(end_a, end_b, 3)

	if (start_3 && end_3) return true
	if (!start_3 && !end_3) return false

	const start_5 = in_range(start_a, start_b, 5)
	const end_5 = in_range(end_a, end_b, 5)

	return start_5 && end_5
}

function same_song(exist, new_song) // (추가) 최종 중복 판단
{
	if (!same_text(exist.name, new_song.name)) return false
	if (!same_text(exist.title, new_song.title)) return false

	const exist_lang = !!exist.lang
	const new_lang = !!new_song.lang
	if (exist_lang !== new_lang) return false // 하나만 lang 있으면 중복 아님

	return same_time(exist, new_song)
}

function data_comparison_2(data, key) // (추가) song 배열 dedup 전체 재작성
{
	const result = data.map(video =>
	{
		const song_list = video[key] ?? []

		const full = song_list.filter(song => song.name && song.title && song.start && song.end) // 1. 조건 모두 가진 것만
		const rest = song_list.filter(song => !(song.name && song.title && song.start && song.end))

		const deduped = full.reduce((result, song) =>
		{
			const dup_idx = result.findIndex(exist => same_song(exist, song))

			if (dup_idx === -1)
				result.push(song) // 원본 값 그대로 저장 (trim은 비교용으로만 사용)

			return result
		}, [])

		return { ...video, [key]: [...deduped, ...rest] }
	})

	return result
}




function data_filter(data, key)
{
	const need = data?.map(video =>
	{
		const fix_id = get_id(video.id)
		const [id_fix, start_fix] = [].concat(fix_id)

		if (Array.isArray(video[key]))
		{
			const { start, end, ...rest } = video
			const get_fix = { ...rest, id: id_fix }

			const fix = get_fix[key].map(song =>
			{
				const fix =
				{
					...song,
					...(song.start && { start: data_split(song.start) }),
					...(song.end && { end: data_split(song.end) })
				}
				return fix
			})
			return { ...get_fix, [key]: fix }
		}

		if (!key)
		{
			const { start, end, ...rest } = video
			return { ...video, id: id_fix }
		}

		const start = start_fix ? start_fix : video.start
		const fix =
		{
			...video,
			id: id_fix,
			...(start  && { start: data_split(start) }),
			...(video.end && { end: data_split(video.end) })
		}
		return fix
	})
	.filter(video => video.id)

	if (!need?.length)
		return key ? { ap: null, di: null } : null

	if (key)
	{
		const comp = new Set()
		const a = need.filter(video => (key in video))
		const d = need.filter(video => !(key in video))
		const ap = data_comparison_1(a, comp)
		const di = data_comparison_1(d, comp)
		return { ap, di }
	}

	const comp = new Set()
	return data_comparison_1(need, comp)
}

const { ap: list_ori, di: list_non } = data_filter(list_data.video, "original")
const list_all = (list_ori || list_non) ? (list_ori ?? []).concat(list_non ?? []) : null
const list_short = data_filter(list_data.short)
const { ap: list_long, di: list_etc } = data_filter(list_data.long, "song")



