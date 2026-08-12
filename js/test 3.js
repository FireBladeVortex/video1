
list_data = {}
list_data.video = [
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly",
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly",
		start: "1:50",
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly",
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly",
		start: "1:50",
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly",
		original: 1,
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly",
		original: 1,
		start: "1:50",
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly",
		original: 1,
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly",
		original: 1,
		start: "1:50",
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60",
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60",
		start: "1:50",
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60",
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60",
		start: "1:50",
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60",
		original: 1,
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60",
		original: 1,
		start: "1:50",
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60",
		original: 1,
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60",
		original: 1,
		start: "1:50",
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60s",
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60s",
		start: "1:50",
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60s",
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60s",
		start: "1:50",
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60s",
		original: 1,
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60s",
		original: 1,
		start: "1:50",
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60s",
		original: 1,
		end: "2:43"
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly&t=60s",
		original: 1,
		start: "1:50",
		end: "2:43"
	},
	{
		id: "https://youtu.be/z1yKzg-bjeA?si=3i4Q5mP",
	},
	{
		id: "https://youtu.be/z1yKzg-bjeA?si=3i4Q5mP",
		original: 1,
	},
	{
		id: "https://youtu.bKNB0DIBsrL",
		original: 1,
	},
	{
		id: "https://youtu.be/_7NIkJwT9Wg?si=KqNIVWdRpIB10dly",
	},
	{
		id: "https://youtu.be/jVilOvw1oHU?si=zUsurujKacsDXMv2",
	},
	{
		id: "https://youtu.be/bCBVxqCUAeY?si=DGAM3Qm5HK-3USSS",
	},
	{
		id: "https://youtu.be/7_XPAV88jB8?si=LMblgI7USOEPQfu2",
	},
	{
		id: "https://youtu.be/fkQ5e8gSr2c?si=TyTCkt_fXrHcUI8w",
	},
	{
		id: "https://youtu.be/dxDdDUUdQpo?si=lvNfwn-xb3kLu7kf",
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


function data_filter(data, type)
{
	const a = new Map();
	const b = new Map();

	data.forEach(video =>
	{
		const vid = get_id(video.id)
		if (!vid)
			return

		const id = Array.isArray(vid) ? vid[0] : vid
		const comp = type && video[type]

		if (video[type])
		{
			const v = { id: id, [type]: video[type] }
			if (!a.has(id))
			{
				a.set(id, v)
			}
		}
		else
		{
			const v = { id: id }
			if (!b.has(id))
			{
				b.set(id, v)
			}
		}
	})

	const ori = [...a.values()]
	const non = [...b.values()].filter(video => !a.has(video.id))
	const all = ori.concat(non)

	return { ori, non, all };
}


const list_video = data_filter(list_data.video, "original")
const list_short = data_filter(list_data.video)




console.log(list_video.ori)
console.log(list_video.non)
console.log(list_video.all)
// console.log(list_short.ori)
// console.log(list_short.non)
// console.log(list_short.all)