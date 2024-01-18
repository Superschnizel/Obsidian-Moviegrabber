export function regexTransform(input : string, transformation : string) : string {
	if (transformation == '') {
		return input;
	}

	console.log(transformation);

	return transformation.replace(/\<\$(.*?)\$\>/g, (match) => {
		let inner = match.split(/\<\$|\$\>/).filter(Boolean)[0];

		let regex : RegExp = new RegExp(inner, "g");

		console.log(regex);
		let matches = regex.exec(input);
		
		console.log(matches);

		return matches == null ? '' : matches[0];
	});
}
