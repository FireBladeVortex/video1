
function make_cell()
{
	const left = document.getElementById("left")
	const video_type =
	[
		{ type: "video", tag: "동영상", data: list_data.video ?? null },
		{ type: "short", tag: "쇼츠", data: list_data.short ?? null },
		{ type: "long", tag: "부분 재생", data: list_data.long ?? null },
	]
}