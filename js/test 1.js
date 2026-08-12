
list_data = {}
list_data.long =
[
	{
		id: "https://youtu.be/h3l1SyPMpoE?si=bnxdJ7LTCtVB4bnG", /* 아쿠루 - 죽음의 게임 */
		song:
		[
			{
				name: "아쿠루", title: "죽음의 게임",
				start: "1:50", end: "2:43",
				lang: 1,
			},
		]
	},
	{
		id: "https://youtu.be/Gre8r41eWYw?si=vBGq6Exoi1aY7IB5",
		song:
		[
			{
				name: "아쿠루", title: "나는 반딧불이",
				start: "1:11:33", end: "1:15:15",
				lang: 1,
			},
			{
				name: "아쿠루", title: "한숨",
				start: "1:22:45", end: "1:27:33",
			},
		]
	},
	{
		id: "https://youtu.be/Gre8r41eWYw?si=vBGq6Exoi1aY7IB5",
		song:
		[
			{
				name: "아쿠루", title: "나는 반딧불이",
				start: "1:11:35", end: "1:15:20",
			},
		]
	},
	{
		id: "https://youtu.be/bCBVxqCUAeY?si=DGAM3Qm5HK-3USSS",
		song:
		[
			{
				start: "1:11:35", end: "1:15:20",
			},
		]
	},
	{
		id: "https://youtu.be/7_XPAV88jB8?si=LMblgI7USOEPQfu2",
	},
	{
		id: "https://youtu.be/fkQ5e8gSr2c?si=TyTCkt_fXrHcUI8w",
	},
]





// 유효한 유튜브 링크 확인 및 id 확인
function get_id(id)
{
	try
	{
		const url = new URL(id)
		const v = url.searchParams.get("v")
		const path = url.pathname.split("/").pop()
		const vid = v ?? path

		const regex = /^[a-zA-Z0-9_-]{11}$/
		if (!regex.test(vid))
			return null

		const t = parseInt(url.searchParams.get("t"))
		return (Number.isNaN(t)) ? vid : [vid, t]
	}
	catch
	{
		return null
	}
}

function data_defrag(data, type)
{
	const song_all = new Map() // id song(name,title,start,end)
	const song_part = new Map() // id song(start, end) + [id start end](이 형태를 만나면 start와 end를 song(start, end)형태로 변환해서 저장)
	const id_only = new Map() // id만 가진 값

	data.forEach(video =>
	{
		const vid = get_id(video.id)
		if (!vid)
			return

		const id = Array.isArray(vid) ? vid[0] : vid
		const song_list = video[type]

		if (song_list && song_list.length)
		{
			song_list.forEach(song =>
			{
				const full = song.lang && song.name && song.title && song.start && song.end

				if (full)
				{
					const v = { id: id, ...song }
					if (!song_all.has(id))
						song_all.set(id, [])
					song_all.get(id).push(v)
				}
				else if (song.start && song.end)
				{
					const v = { id: id, start: song.start, end: song.end }
					if (!song_part.has(id))
						song_part.set(id, [])
					song_part.get(id).push(v)
				}
			})
		}
		else if (video.start && video.end) // [id start end] 형태 -> song(start, end)로 변환
		{
			const v = { id: id, start: video.start, end: video.end }
			if (!song_part.has(id))
				song_part.set(id, [])
			song_part.get(id).push(v)
		}
		else
		{
			if (!id_only.has(id))
				id_only.set(id, { id: id })
		}
	})

	const all = [...song_all.values()].flat()
	const part = [...song_part.values()].flat()
	const only = [...id_only.values()].filter(video => !song_all.has(video.id) && !song_part.has(video.id))
	const total = all.concat(part).concat(only)

	return { all, part, only, total }
}

const list_long = data_defrag(list_data.long, "song")

console.log(list_long.all)
console.log(list_long.part)
console.log(list_long.only)
console.log(list_long.total)

















































// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// function data_defrag(data, type)
// {
// 	const a = new Map()
// 	const b = new Map()
// 	const c = new Map()
// 	const d = new Map()

// 	data.forEach(list =>
// 	{

// 		const has_song = !!(list.type && list.type.length) // (추가)
// 		const has_range = (list.start !== undefined && list.end !== undefined) // (추가)

// 		if (list.song && list.song.length) // (추가)
// 		{
// 			if (a.has(list.id))
// 			{
// 				a.get(list.id)[type].push(...list[type])
// 			}
// 			else
// 			{
// 				a.set(list.id, { ...list, [type]: [...list[type]] })
// 			}
// 		}
// 		else if (has_range) // (추가)
// 		{
// 			if (!b.has(list.id))
// 			{
// 				b.set(list.id, { ...list })
// 			}
// 		}
// 		else // (추가)
// 		{
// 			if (!c.has(list.id))
// 			{
// 				c.set(list.id, { ...list })
// 			}
// 		}
// 	})

// 	const fixx = JSON.stringify([...a.values()], null, 1)
// 	// const fixx = [...a.values()]
// 	return fixx
// }



// const asd = defrag(list_data.long, "song")
// const asd = defrag(list_data.long, "ori")

// console.log(asd.a)
// console.log(asd.b)
// console.log(asd.c)


// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function defrag(data, type)
// {
// 	const all = new Map()
// 	const half = new Map()
// 	const etc = new Set()
// 	const d = new Map()
// 	const e = new Map()

// 	const id_w_song
// 	const id_w_song_in_time
// 	const id_w_time
// 	const id_only












// 	const first_filter = data.filter(list =>
// 	{
// 		const { id, song, start, end, ...rest } = list
// 		const it = id.length && (song.length || (start.length && end.length)) // lang.length ori
// 		const valid = Object.keys(rest).length === 0
// 		return it && valid
// 	})

// 	first_filter.forEach(video =>
// 	{
// 		const vid = get_id(video.id)
// 		if (!vid)
// 			return

// 		const id = Array.isArray(vid) ? vid[0] : vid

// 		const who = (type in video)
// 		const song = (Array.isArray(video[type]) && video[type].length)



// 		// id
// 		// const id_only = video.filter(go => ("id" in go) && Object.keys(go).length === 1);
// 		// const id_only = video.filter(go => go.id && Object.keys(go).length === 1);

// 		const only_id = ("id" in video) && Object.keys(video).length === 1
// 		const id_only = video.filter(go => only_id)

// 		// id time
// 		const go_half = ("id" in video) && ("start" in video) && ("end" in video) && Object.keys(video).length === 3
// 		const with_time = video.filter(go => go_half)

// 		// id song time
// 		const go_to_half = video[type].filter(go => !go.name && !go.title && go.start && go.end)
// 		const song_all = video[type].filter(go => !go_to_half.includes(go))

// 		// id song x time






// 		if (who && song)
// 		{
// 			const go_to_half = video[type].filter(go => !go.name && !go.title && go.start && go.end)
// 			go_to_half.forEach(go =>
// 			{
// 				half.set(id, { id: id, start: go.start, end: go.end})
// 			})

// 			if (all.has(id))
// 			{
// 				video[type].filter(data => !go_to_half.includes(data)).forEach(song =>
// 				{
// 					const base = all.get(id)[type]
// 					const base_name = base.filter(base => base.name === song.name)
// 					if (base_name.length)
// 					{
// 						const base_title = base_name.filter(same_name => same_name.title === song.title)
// 						if (!base_title.length)
// 						{
// 							base.push(song)
// 						}
// 						else
// 						{
// 							const xor = base_title.some(data => ("lang" in data) !== ("lang" in song))
// 							if (xor)
// 							{
// 								base.push(song)
// 							}
// 						}
// 					}
// 					else
// 					{
// 						base.push(song)
// 					}
// 				})
// 			}
// 		}

// 		const only_id = ("id" in video) && Object.keys(video).length === 1
// 		if (only_id && !etc.has(id))
// 		{
// 			etc.set(id, { ...video, id: id })
// 		}

// 		const go_half = ("id" in video) && ("start" in video) && ("end" in video) && Object.keys(video).length === 3
// 		if (go_half && !half.has(id))
// 		{ // 중복 검사 필요
// 			half.set(id, { ...video, id: id, start: video.start, end: video.end })
// 		}



// 				all.get(id)[type].push(...video[type])
// 			}
// 		}
// 		else
// 		{
// 			if (song)
// 			{
// 				all.set(id, { ...video , id: id, [type]: video[type] })
// 			}
// 		}

// 		if (half.has(id))
// 		{
// 			if (time)
// 			{
// 				half.get(id)[type].push(...video[type])
// 			}
// 		}
// 		else
// 		{
// 			if (time)
// 			{
// 				half.set(id, { ...video , id: id, [type]: video[type] })
// 			}
// 		}


// 		if (!etc.has(id))
// 		{
// 			b.set(id, { ...video, id: id })
// 		}
// 	})

// 	const ori = [...a.values()]
// 	const non = [...b.values()].filter(video => !a.has(video.id))
// 	const all = ori.concat(non)

// 	return { ori, non, all };
// }



































