"use strict"

var mdkRegExp = {
	nonGeneratedStart : function(id) {
		return '\\/\\/@non-generated-start\\['+id+'\\]([.\\s\\S]*?\\n)';
	},
	nonGeneratedEnd : function(id) {
		return '\\/\\/@non-generated-start\\['+id+'\\][.\\s\\S]*?(\\/\\/@non-generated-end)';
	},
	replaceNonGenerated : function(id) {
		return '\\/\\/@non-generated-start\\['+id+'\\]([.\\s\\S]*?)\\/\\/@non-generated-end';
	}
};

module.exports=mdkRegExp;