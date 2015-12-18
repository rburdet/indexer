
var program = require('commander'),
	fs = require('fs'),
	index = [1],
	depth,
	inFile;

function parseArguments(){
	program
		.version('1.0')
		.usage('[options] <markdown-file-path>')
		.option('-i, --index <n>', "Index until depth <n>",generateIndex)
		.option('-t, --toc', "Generate Table Of Contents",generateToc)
		.parse(process.argv);

	if (program.args.length == 0 ) program.help();
}

function generateToc(){
	var out = getOutputStream(fs);
	inFile = program.rawArgs[program.rawArgs.length -1 ];
	getLines(inFile,function(err,lines){
		linesParsed = parse(lines);
		out.write(linesParsed);
		for ( i = 0; i < lines.length ; i++)
			out.write(lines[i] + "\n");
		move();
	});
}

function parse(lines){
	var linesParsed = "";
	for (i = 0 ; i<lines.length ; i++){
		depth = getDepth(lines[i]);
		linesParsed += Array(depth+1).join("\t") + lines[i].substr(lines[i].lastIndexOf("#")+2) + '\n';
	}
	return linesParsed;
}

function getLines(file,callback){
	var readableStream = fs.createReadStream(file);
	var data = '';
	readableStream.on('data', function(chunk) {
		    data+=chunk;
	});
	readableStream.on('end', function() {
		var lines = data.split('\n');
		callback(null,lines);
	});
}

function getInputStream(fs){
	inFile = program.rawArgs[program.rawArgs.length -1 ];
	readline = require('readline');
	rd = readline.createInterface({
		input: fs.createReadStream(inFile),
		terminal: false
	});
	return rd;
}

function getOutputStream(fs){
	return fs.createWriteStream("tmp.md",{end : true});
}

function generateIndex(maxDepth){ 
	out = getOutputStream(fs);
	inFile = program.rawArgs[program.rawArgs.length -1 ];
	getLines(inFile,function(err,lines){
		for (i = 0 ; i < lines.length ; i++){
			line = lines[i];
			if (depth != 0 )
				oldDepth = depth;
			depth = getDepth(line);
			if (depth == 0)
				continue;
			indexFormatted = "";
			if (depth <= maxDepth)
				indexFormatted = getIndex(depth,oldDepth,index);
			lineWithDepth = getHeading(line,depth,indexFormatted);
			out.write(lineWithDepth+"\n");
		}
	});
	move();
}

function getDepth(line){
	return (line.match(/#/g) || [] ).length;
}

function getIndex(depth,oldDepth,index){
	if (depth > oldDepth){
		index.push(1);
	}else if (depth == oldDepth){
		index[depth-1]++;
	}else if (depth < oldDepth){
		index.splice(depth,index.length-1);
		index[depth-1]++;
	}
	return index.toString().replace(/,/g,".");
}

function getHeading(line,depth,indexFormatted){
	heading = Array(depth+1).join("#");
	headingName = line.substring(line.lastIndexOf("#")+1);
	lineWithDepth = line.replace(line, heading.concat(indexFormatted).concat("    ").concat(headingName));
	return lineWithDepth;
}

function move(){
	var mv = require('mv');
	mv("tmp.md",inFile,function(err){
	});
}


parseArguments();
