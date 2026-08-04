// data_filter + data_defrag 통합
function data_parse(data, type)
{
	const full = new Map() // comp가 flat 값이거나(예: original) song이 완전조건 만족
	const part = new Map() // song이 start/end만 있거나, 최상위에 start/end만 있는 경우
	const only = new Map() // id만 가진 경우

	data.forEach(video =>
	{
		const vid = get_id(video.id)
		if (!vid)
			return

		const id = Array.isArray(vid) ? vid[0] : vid
		const comp = type && video[type]

		if (Array.isArray(comp) && comp.length) // song 배열 형태 (data_defrag 기능)
		{
			comp.forEach(song =>
			{
				const is_full = song.lang && song.name && song.title && song.start && song.end

				if (is_full)
				{
					const v = { id: id, ...song }
					if (!full.has(id))
						full.set(id, [])
					full.get(id).push(v)
				}
				else if (song.start && song.end)
				{
					const v = { id: id, start: song.start, end: song.end }
					if (!part.has(id))
						part.set(id, [])
					part.get(id).push(v)
				}
			})
		}
		else if (comp) // flat 값 형태 (data_filter 기능, 예: original: 1)
		{
			const v = { id: id, [type]: video[type] }
			if (!full.has(id))
				full.set(id, [v])
		}
		else if (video.start && video.end) // 최상위 start/end -> part로 변환
		{
			const v = { id: id, start: video.start, end: video.end }
			if (!part.has(id))
				part.set(id, [])
			part.get(id).push(v)
		}
		else
		{
			if (!only.has(id))
				only.set(id, { id: id })
		}
	})

	const all = [...full.values()].flat()
	const some = [...part.values()].flat()
	const none = [...only.values()].filter(video => !full.has(video.id) && !part.has(video.id))
	const total = all.concat(some).concat(none)

	return { all, part: some, only: none, total }
}

const list_video = data_parse(list_data.video, "original")
const list_short = data_parse(list_data.short)
const list_long = data_parse(list_data.long, "song")

console.log(list_video.all, list_video.part, list_video.only, list_video.total)
console.log(list_short.all, list_short.part, list_short.only, list_short.total)
console.log(list_long.all, list_long.part, list_long.only, list_long.total)